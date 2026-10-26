
import "server-only";

import { db } from "@/app/lib/db";

const DEMO_BUSINESS_ID = "demo-business";

export async function getDashboardData() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfPreviousDay = new Date(startOfToday);
  startOfPreviousDay.setDate(startOfPreviousDay.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  // AgentRun and Conversation store agentId without an exposed agent relation.
  const businessAgents = await db.agent.findMany({
    where: { businessId: DEMO_BUSINESS_ID },
    select: { id: true, name: true },
  });

  const agentIds = businessAgents.map((agent) => agent.id);
  const agentNames = new Map(
    businessAgents.map((agent) => [agent.id, agent.name]),
  );

  const [
    business,
    totalContacts,
    contactsCreatedToday,
    contactsCreatedYesterday,
    totalConversations,
    conversationsToday,
    activeAgents,
    totalAgents,
    activeWhatsAppChannels,
    activeFields,
    recentContacts,
    recentRuns,
    runsToday,
    failedRunsToday,
    successfulRunsToday,
    runsThisWeek,
  ] = await Promise.all([
    db.business.findUnique({
      where: { id: DEMO_BUSINESS_ID },
      select: { id: true, name: true },
    }),

    db.contact.count({
      where: { businessId: DEMO_BUSINESS_ID },
    }),

    db.contact.count({
      where: {
        businessId: DEMO_BUSINESS_ID,
        createdAt: { gte: startOfToday },
      },
    }),

    db.contact.count({
      where: {
        businessId: DEMO_BUSINESS_ID,
        createdAt: {
          gte: startOfPreviousDay,
          lt: startOfToday,
        },
      },
    }),

    db.conversation.count({
      where: { agentId: { in: agentIds } },
    }),

    db.conversation.count({
      where: {
        agentId: { in: agentIds },
        createdAt: { gte: startOfToday },
      },
    }),

    db.agent.count({
      where: {
        businessId: DEMO_BUSINESS_ID,
        isActive: true,
      },
    }),

    db.agent.count({
      where: { businessId: DEMO_BUSINESS_ID },
    }),

    db.whatsAppChannel.count({
      where: {
        businessId: DEMO_BUSINESS_ID,
        isActive: true,
      },
    }),

    db.contactField.count({
      where: {
        businessId: DEMO_BUSINESS_ID,
        isActive: true,
      },
    }),

    db.contact.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        profileValues: {
          where: {
            field: {
              businessId: DEMO_BUSINESS_ID,
              isActive: true,
            },
          },
          select: {
            value: true,
            field: {
              select: {
                id: true,
                key: true,
                label: true,
                type: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
        _count: {
          select: { conversations: true },
        },
      },
    }),

    db.agentRun.findMany({
      where: {
        agentId: { in: agentIds },
      },
      orderBy: { startedAt: "desc" },
      take: 8,
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        stepCount: true,
        error: true,
        agentId: true,
        event: {
          select: {
            id: true,
            source: true,
            type: true,
            occurredAt: true,
          },
        },
      },
    }),

    db.agentRun.count({
      where: {
        agentId: { in: agentIds },
        startedAt: { gte: startOfToday },
      },
    }),

    db.agentRun.count({
      where: {
        agentId: { in: agentIds },
        startedAt: { gte: startOfToday },
        status: "FAILED",
      },
    }),

    db.agentRun.count({
      where: {
        agentId: { in: agentIds },
        startedAt: { gte: startOfToday },
        status: "COMPLETED",
      },
    }),

    db.agentRun.groupBy({
      by: ["status"],
      where: {
        agentId: { in: agentIds },
        startedAt: { gte: startOfWeek },
      },
      _count: { _all: true },
    }),
  ]);

  return {
    generatedAt: now.toISOString(),
    business,
    metrics: {
      totalContacts,
      contactsCreatedToday,
      contactsCreatedYesterday,
      totalConversations,
      conversationsToday,
      activeAgents,
      totalAgents,
      activeWhatsAppChannels,
      activeFields,
      runsToday,
      successfulRunsToday,
      failedRunsToday,
    },
    recentContacts,
    recentRuns: recentRuns.map((run) => ({
      ...run,
      agentName: agentNames.get(run.agentId) ?? "Unknown agent",
    })),
    runsThisWeek: runsThisWeek.map((item) => ({
      status: item.status,
      count: item._count?._all ?? 0,
    })),
  };
}
