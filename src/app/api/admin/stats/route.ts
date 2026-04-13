export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const [
      totalAppointments,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      thisMonthCount,
      thisWeekCount,
      totalUsers,
      totalServices,
      upcomingAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.appointment.count({ where: { date: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.appointment.findMany({
        where: {
          date: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { name: true, color: true } },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalAppointments,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      thisMonthCount,
      thisWeekCount,
      totalUsers,
      totalServices,
      upcomingAppointments,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
