
import { db } from "@/app/lib/db";

type CaptureVoiceContactParams = {
    businessId: string;
    callId: string;
    conversationId: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
};

type CaptureVoiceContactResult =
    | {
        status: "captured";
        contactId: string;
        created: boolean;
        name: string | null;
        phone: string | null;
        email: string | null;
    }
    | {
        status: "identity_conflict" | "conversation_conflict";
        message: string;
    };

class ConversationLinkConflictError extends Error { }

function normalizeOptional(value?: string | null): string | null {
    return value?.trim() || null;
}

function normalizePhone(value: string): string {
    const phone = value.trim();

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        throw new Error(
            "Phone number must use international E.164 format, such as +971501234567.",
        );
    }

    return phone;
}

function normalizeEmail(value: string): string {
    const email = value.trim().toLowerCase();

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        throw new Error("A valid email address is required.");
    }

    return email;
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

export async function captureVoiceContact(
    params: CaptureVoiceContactParams,
): Promise<CaptureVoiceContactResult> {
    const businessId = params.businessId.trim();
    const name = normalizeOptional(params.name);
    const rawPhone = normalizeOptional(params.phone);
    const rawEmail = normalizeOptional(params.email);

    const phone = rawPhone ? normalizePhone(rawPhone) : null;
    const email = rawEmail ? normalizeEmail(rawEmail) : null;

    if (!businessId) {
        throw new Error("Business context is required.");
    }

    if (!params.callId.trim() || !params.conversationId.trim()) {
        throw new Error("Call and conversation context are required.");
    }

    if (!phone && !email) {
        throw new Error(
            "At least one phone number or email address is required.",
        );
    }

    if (name && name.length > 120) {
        throw new Error("Name must be 120 characters or fewer.");
    }

    // Retry once if another concurrent request creates the same identity.
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await db.$transaction(async (tx) => {
                // 1. Verify the call belongs to this conversation and business.
                const call = await tx.call.findFirst({
                    where: {
                        id: params.callId,
                        conversationId: params.conversationId,
                        voiceChannel: {
                            is: {
                                businessId,
                            },
                        },
                    },
                    select: {
                        id: true,
                        voiceChannel: {
                            select: {
                                agentId: true,
                            },
                        },
                    },
                });

                if (!call) {
                    throw new Error(
                        "Voice call and conversation context could not be verified.",
                    );
                }

                // 2. Verify conversation ownership.
                const conversation = await tx.conversation.findFirst({
                    where: {
                        id: params.conversationId,
                        agentId: call.voiceChannel.agentId,
                    },
                    select: {
                        id: true,
                        contactId: true,
                    },
                });

                if (!conversation) {
                    throw new Error(
                        "Conversation was not found in this business.",
                    );
                }

                // 3. Resolve phone and email identities independently.
                const [phoneIdentity, emailIdentity] = await Promise.all([
                    phone
                        ? tx.contactIdentity.findUnique({
                            where: {
                                businessId_channel_externalId: {
                                    businessId,
                                    channel: "PHONE",
                                    externalId: phone,
                                },
                            },
                            select: {
                                contactId: true,
                            },
                        })
                        : Promise.resolve(null),

                    email
                        ? tx.contactIdentity.findUnique({
                            where: {
                                businessId_channel_externalId: {
                                    businessId,
                                    channel: "EMAIL",
                                    externalId: email,
                                },
                            },
                            select: {
                                contactId: true,
                            },
                        })
                        : Promise.resolve(null),
                ]);

                // 4. Never merge two different contacts automatically.
                if (
                    phoneIdentity &&
                    emailIdentity &&
                    phoneIdentity.contactId !== emailIdentity.contactId
                ) {
                    return {
                        status: "identity_conflict",
                        message:
                            "The supplied phone number and email address belong to different existing contacts.",
                    };
                }

                const resolvedContactId =
                    phoneIdentity?.contactId ??
                    emailIdentity?.contactId ??
                    null;

                // 5. If the conversation already belongs to a contact,
                // never silently replace that association.
                if (
                    conversation.contactId &&
                    resolvedContactId &&
                    conversation.contactId !== resolvedContactId
                ) {
                    return {
                        status: "conversation_conflict",
                        message:
                            "This conversation is already associated with another contact.",
                    };
                }

                // 6. If already linked and no supplied identity resolves,
                // enrich the existing contact instead of creating another.
                if (
                    conversation.contactId &&
                    resolvedContactId === null
                ) {
                    const existingContact = await tx.contact.findFirst({
                        where: {
                            id: conversation.contactId,
                            businessId,
                        },
                    });

                    if (!existingContact) {
                        throw new Error(
                            "The conversation's existing contact could not be verified.",
                        );
                    }

                    // Check whether the supplied identities belong elsewhere.
                    const [phoneOwner, emailOwner] = await Promise.all([
                        phone
                            ? tx.contactIdentity.findUnique({
                                where: {
                                    businessId_channel_externalId: {
                                        businessId,
                                        channel: "PHONE",
                                        externalId: phone,
                                    },
                                },
                                select: {
                                    contactId: true,
                                },
                            })
                            : Promise.resolve(null),

                        email
                            ? tx.contactIdentity.findUnique({
                                where: {
                                    businessId_channel_externalId: {
                                        businessId,
                                        channel: "EMAIL",
                                        externalId: email,
                                    },
                                },
                                select: {
                                    contactId: true,
                                },
                            })
                            : Promise.resolve(null),
                    ]);

                    if (
                        (phoneOwner &&
                            phoneOwner.contactId !== existingContact.id) ||
                        (emailOwner &&
                            emailOwner.contactId !== existingContact.id)
                    ) {
                        return {
                            status: "identity_conflict",
                            message:
                                "The supplied details belong to another contact and cannot be attached automatically.",
                        };
                    }

                    if (phone && !phoneOwner) {
                        await tx.contactIdentity.create({
                            data: {
                                businessId,
                                contactId: existingContact.id,
                                channel: "PHONE",
                                externalId: phone,
                            },
                        });
                    }

                    if (email && !emailOwner) {
                        await tx.contactIdentity.create({
                            data: {
                                businessId,
                                contactId: existingContact.id,
                                channel: "EMAIL",
                                externalId: email,
                            },
                        });
                    }

                    const updated = await tx.contact.update({
                        where: {
                            id: existingContact.id,
                        },
                        data: {
                            ...(name && !existingContact.name
                                ? { name }
                                : {}),
                            ...(phone && !existingContact.phone
                                ? { phone }
                                : {}),
                            ...(email && !existingContact.email
                                ? { email }
                                : {}),
                        },
                    });

                    return {
                        status: "captured",
                        contactId: updated.id,
                        created: false,
                        name: updated.name,
                        phone: updated.phone,
                        email: updated.email,
                    };
                }

                // 7. Reuse an existing contact or create a new one.
                const contact = resolvedContactId
                    ? await tx.contact.findFirst({
                        where: {
                            id: resolvedContactId,
                            businessId,
                        },
                    })
                    : await tx.contact.create({
                        data: {
                            businessId,
                            name,
                            phone,
                            email,
                        },
                    });

                if (!contact) {
                    throw new Error(
                        "Unable to resolve the contact in this business.",
                    );
                }

                // 8. Attach identities that do not already exist.
                if (phone && !phoneIdentity) {
                    await tx.contactIdentity.create({
                        data: {
                            businessId,
                            contactId: contact.id,
                            channel: "PHONE",
                            externalId: phone,
                        },
                    });
                }

                if (email && !emailIdentity) {
                    await tx.contactIdentity.create({
                        data: {
                            businessId,
                            contactId: contact.id,
                            channel: "EMAIL",
                            externalId: email,
                        },
                    });
                }

                // 9. Fill missing fields without overwriting existing values.
                const updatedContact = await tx.contact.update({
                    where: {
                        id: contact.id,
                    },
                    data: {
                        ...(name && !contact.name ? { name } : {}),
                        ...(phone && !contact.phone ? { phone } : {}),
                        ...(email && !contact.email ? { email } : {}),
                    },
                });

                // 10. Link the conversation only if it is currently unlinked.
                const linked = await tx.conversation.updateMany({
                    where: {
                        id: conversation.id,
                        contactId: null,
                    },
                    data: {
                        contactId: contact.id,
                    },
                });

                if (linked.count !== 1) {
                    const latest = await tx.conversation.findUnique({
                        where: {
                            id: conversation.id,
                        },
                        select: {
                            contactId: true,
                        },
                    });

                    if (latest?.contactId !== contact.id) {
                        throw new ConversationLinkConflictError(
                            "The conversation was linked to another contact during capture.",
                        );
                    }
                }

                return {
                    status: "captured",
                    contactId: updatedContact.id,
                    created: resolvedContactId === null,
                    name: updatedContact.name,
                    phone: updatedContact.phone,
                    email: updatedContact.email,
                };
            });
        } catch (error) {
            if (error instanceof ConversationLinkConflictError) {
                return {
                    status: "conversation_conflict",
                    message: error.message,
                };
            }

            if (isUniqueConstraintError(error) && attempt === 0) {
                continue;
            }

            throw error;
        }
    }

    throw new Error("Unable to capture contact after retry.");
}
