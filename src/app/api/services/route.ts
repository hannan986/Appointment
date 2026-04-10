import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, description, duration, price, color } = await req.json();

    if (!name || !description || !duration || price === undefined) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: { name, description, duration: parseInt(duration), price: parseFloat(price), color: color || "#0A77FF" },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
