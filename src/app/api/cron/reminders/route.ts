export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import { format, addDays, startOfDay, endOfDay } from "date-fns";

// This endpoint should be called by a cron job every hour
// Protected by a secret key
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: tomorrowStart, lte: tomorrowEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
        reminderSent: false,
      },
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
    });

    let sent = 0;
    for (const appt of appointments) {
      await sendReminderEmail({
        userName: appt.user.name,
        userEmail: appt.user.email,
        serviceName: appt.service.name,
        date: format(appt.date, "EEEE, MMMM d, yyyy"),
        startTime: appt.startTime,
        endTime: appt.endTime,
        appointmentId: appt.id,
      });

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent: true },
      });

      sent++;
    }

    return NextResponse.json({ success: true, remindersSent: sent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
