import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendCancellationEmail } from "@/lib/email";
import { format } from "date-fns";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
    });

    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Users can only cancel their own; admins can update any
    if (session.user.role !== "ADMIN") {
      if (appointment.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (status !== "CANCELLED") {
        return NextResponse.json({ error: "Users can only cancel appointments" }, { status: 403 });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    // Send cancellation email
    if (status === "CANCELLED") {
      sendCancellationEmail({
        userName: appointment.user.name,
        userEmail: appointment.user.email,
        serviceName: appointment.service.name,
        date: format(appointment.date, "EEEE, MMMM d, yyyy"),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        appointmentId: appointment.id,
      }).catch(console.error);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
