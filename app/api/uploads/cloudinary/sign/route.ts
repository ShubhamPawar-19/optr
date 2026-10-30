
import { NextResponse } from "next/server";
import { getCurrentBusiness } from "@/app/lib/current-business";
import { db } from "@/app/lib/db";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  try {
    const business = await getCurrentBusiness();

    if (!business) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 },
      );
    }

    const { datasetId, fieldKey } = body as Record<string, unknown>;

    if (
      typeof datasetId !== "string" ||
      !datasetId.trim() ||
      typeof fieldKey !== "string" ||
      !fieldKey.trim()
    ) {
      return NextResponse.json(
        { error: "Dataset ID and field key are required." },
        { status: 400 },
      );
    }

    // Verify that this dataset belongs to the current business
    // and that the requested field is actually a MEDIA field.
    const dataset = await db.dataset.findFirst({
      where: {
        id: datasetId,
        businessId: business.id,
        fields: {
          some: {
            key: fieldKey,
            type: "MEDIA",
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset or media field not found." },
        { status: 404 },
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are missing.");

      return NextResponse.json(
        { error: "Image upload is not configured." },
        { status: 500 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `optr/${business.id}/datasets/${dataset.id}`;

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error("Cloudinary signing error:", error);

    return NextResponse.json(
      { error: "Unable to prepare image upload." },
      { status: 500 },
    );
  }
}
