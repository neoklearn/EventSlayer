import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { unstable_cache, revalidateTag } from "next/cache";

const ADMIN_TOKEN = process.env.ADMIN_PASSWORD;

const getCachedEvents = unstable_cache(
  async (isAdmin) => {
    const where = isAdmin ? {} : { approved: true };
    const orderBy = isAdmin 
      ? { createdAt: "desc" } 
      : { start_date: "asc" };

    return prisma.event.findMany({
      where,
      orderBy,
    });
  },
  ["events-list"],
  { tags: ["events-cache"] }
);

function isAuthorized(req, formData) {
  if (!ADMIN_TOKEN) return false;
  const headerToken = req.headers.get("x-admin-token") || req.headers.get("Authorization")?.replace("Bearer ", "");
  const fieldToken = formData ? formData.get("x-admin-token") : null;
  return headerToken === ADMIN_TOKEN || fieldToken === ADMIN_TOKEN;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";

    const events = await getCachedEvents(isAdmin);
    return NextResponse.json({ status: "success", data: events });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

async function saveFile(file) {
  if (!file || typeof file === "string") return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Directory might exist
  }

  const uniqueId = crypto.randomUUID();
  const safeFileName = `${uniqueId}-${file.name.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadDir, safeFileName);

  await writeFile(filePath, buffer);
  return `/uploads/${safeFileName}`;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const approved = formData.get("approved") === "true";

    if (approved && !isAuthorized(req, formData)) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const title = formData.get("title");
    const description = formData.get("description") || "";
    const location_name = formData.get("location_name");
    const start_date = formData.get("start_date");
    const end_date = formData.get("end_date");
    const time = formData.get("time") || "10:00 - 18:00";
    const htm = formData.get("htm") || "Gratis / Belum Tersedia";
    const source_url = formData.get("source_url") || "";
    const cropX = parseFloat(formData.get("cropX") || "0");
    const cropY = parseFloat(formData.get("cropY") || "0");
    const posterFile = formData.get("poster");

    if (!title || !location_name || !start_date || !end_date) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    const posterUrl = await saveFile(posterFile);

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location_name,
        start_date,
        end_date,
        time,
        htm,
        source_url,
        cropX,
        cropY,
        posterUrl,
        approved,
      },
    });

    revalidateTag("events-cache");
    return NextResponse.json({ status: "success", data: newEvent });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    
    if (!isAuthorized(req, formData)) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const id = formData.get("id");
    if (!id) {
      return NextResponse.json(
        { status: "error", message: "ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    const fields = [
      "title", "description", "location_name", "start_date", 
      "end_date", "time", "htm", "source_url"
    ];

    fields.forEach(field => {
      const val = formData.get(field);
      if (val !== null) updateData[field] = val;
    });

    if (formData.get("approved") !== null) {
      updateData.approved = formData.get("approved") === "true";
    }

    if (formData.get("cropX") !== null) updateData.cropX = parseFloat(formData.get("cropX"));
    if (formData.get("cropY") !== null) updateData.cropY = parseFloat(formData.get("cropY"));

    const posterFile = formData.get("poster");
    if (posterFile && typeof posterFile !== "string") {
      const posterUrl = await saveFile(posterFile);
      if (posterUrl) updateData.posterUrl = posterUrl;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    revalidateTag("events-cache");
    return NextResponse.json({ status: "success", data: updatedEvent });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Event ID is required" },
        { status: 400 }
      );
    }

    await prisma.event.delete({ where: { id } });
    revalidateTag("events-cache");
    return NextResponse.json({ status: "success", message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
