export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format, parseISO, addMinutes } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const dateStr = searchParams.get("date");

  if (!serviceId || !dateStr) {
    return NextResponse.json({ error: "serviceId and date required" }, { status: 400 });
  }

  try {
    const date = parseISO(dateStr);
    const dayOfWeek = date.getDay();

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const timeSlots = await prisma.timeSlot.findMany({
      where: { serviceId, dayOfWeek, isActive: true },
      orderBy: { startTime: "asc" },
    });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        serviceId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    const bookedTimes = new Set(existingAppointments.map((a) => a.startTime));

    const available = timeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: !bookedTimes.has(slot.startTime),
    }));

    return NextResponse.json(available);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get slots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { serviceId, dayOfWeek, startTime, endTime, maxBookings } = await req.json();

    const slot = await prisma.timeSlot.create({
      data: {
        serviceId,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        maxBookings: parseInt(maxBookings) || 1,
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await prisma.timeSlot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
