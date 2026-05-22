import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fetch events from the database with optional filtering
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const approvedOnly = searchParams.get("approved") === "true";

    const where = approvedOnly ? { approved: true } : {};

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        start_date: "asc",
      },
    });
    return NextResponse.json({ status: "success", data: events });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

// Save a new event to the database
export async function POST(req) {
  try {
    const { title, description, location_name, start_date, end_date, htm, source_url } = await req.json();

    if (!title || !location_name || !start_date || !end_date) {
      return NextResponse.json(
        { status: "error", message: "Required fields are missing: title, location_name, start_date, end_date" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description: description || "",
        location_name,
        start_date,
        end_date,
        htm: htm || "Gratis / Belum Tersedia",
        source_url: source_url || "",
      },
    });

    return NextResponse.json({ status: "success", data: newEvent });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

// Update an existing event (Edit or Approve)
export async function PUT(req) {
  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Event ID is required for update" },
        { status: 400 }
      );
    }

    // Ensure we don't accidentally update id
    delete updateData.id;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ status: "success", data: updatedEvent });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Event ID is required for deletion" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ status: "success", message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
