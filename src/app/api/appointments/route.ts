export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { format, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  try {
    const where: any =
      session.user.role === "ADMIN"
        ? status ? { status } : {}
        : { userId: session.user.id };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, duration: true, price: true, color: true } },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({ appointments, total, page, limit });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { serviceId, date, startTime, endTime, notes } = await req.json();

    if (!serviceId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const appointmentDate = parseISO(date);

    // Check for conflicts
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await prisma.appointment.findFirst({
      where: {
        serviceId,
        startTime,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        serviceId,
        date: appointmentDate,
        startTime,
        endTime,
        notes,
        status: "PENDING",
      },
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
    });

    // Send confirmation email (non-blocking)
    sendConfirmationEmail({
      userName: appointment.user.name,
      userEmail: appointment.user.email,
      serviceName: appointment.service.name,
      date: format(appointmentDate, "EEEE, MMMM d, yyyy"),
      startTime,
      endTime,
      appointmentId: appointment.id,
    }).catch(console.error);

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
