import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbUrl = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@demo.com",
      password: adminPassword,
      phone: "+1 (555) 000-0001",
      role: "ADMIN",
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@demo.com" },
    update: {},
    create: {
      name: "John Smith",
      email: "user@demo.com",
      password: userPassword,
      phone: "+1 (555) 000-0002",
      role: "USER",
    },
  });

  // Create services
  const services = [
    {
      name: "General Consultation",
      description: "A comprehensive 30-minute consultation with a specialist to discuss your needs and concerns.",
      duration: 30,
      price: 75.00,
      color: "#0A77FF",
    },
    {
      name: "Deep Tissue Massage",
      description: "A relaxing 60-minute deep tissue massage to relieve muscle tension and improve circulation.",
      duration: 60,
      price: 120.00,
      color: "#7C3AED",
    },
    {
      name: "Hair & Styling",
      description: "Professional hair cutting, styling, and treatment services for all hair types.",
      duration: 45,
      price: 65.00,
      color: "#DC2626",
    },
    {
      name: "Dental Checkup",
      description: "Comprehensive dental examination, cleaning, and X-rays to ensure optimal oral health.",
      duration: 45,
      price: 150.00,
      color: "#059669",
    },
    {
      name: "Personal Training",
      description: "One-on-one personal training session tailored to your fitness goals.",
      duration: 60,
      price: 85.00,
      color: "#D97706",
    },
    {
      name: "Legal Advice",
      description: "Confidential legal consultation with a qualified attorney for personal or business matters.",
      duration: 30,
      price: 200.00,
      color: "#0891B2",
    },
  ];

  const createdServices: any[] = [];
  for (const svc of services) {
    const s = await prisma.service.create({ data: svc }).catch(async () => {
      return await prisma.service.findFirst({ where: { name: svc.name } });
    });
    if (s) createdServices.push(s);
  }

  // Create time slots (Mon-Fri, 9am-5pm in 30-min intervals)
  const timeRanges = [
    ["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"],
    ["11:00", "11:30"], ["11:30", "12:00"], ["14:00", "14:30"], ["14:30", "15:00"],
    ["15:00", "15:30"], ["15:30", "16:00"], ["16:00", "16:30"], ["16:30", "17:00"],
  ];

  for (const svc of createdServices) {
    for (let day = 1; day <= 5; day++) {
      for (const [start, end] of timeRanges) {
        await prisma.timeSlot.create({
          data: {
            serviceId: svc.id,
            dayOfWeek: day,
            startTime: start,
            endTime: end,
          },
        }).catch(() => {});
      }
    }
  }

  // Create sample appointments
  const getNextWeekday = (offset = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
  };

  if (createdServices.length >= 2) {
    await prisma.appointment.create({
      data: {
        userId: user.id,
        serviceId: createdServices[0].id,
        date: getNextWeekday(1),
        startTime: "10:00",
        endTime: "10:30",
        status: "CONFIRMED",
        notes: "First time visitor — please have paperwork ready",
      },
    }).catch(() => {});

    await prisma.appointment.create({
      data: {
        userId: user.id,
        serviceId: createdServices[1].id,
        date: getNextWeekday(4),
        startTime: "14:00",
        endTime: "15:00",
        status: "PENDING",
      },
    }).catch(() => {});

    await prisma.appointment.create({
      data: {
        userId: user.id,
        serviceId: createdServices[2 % createdServices.length].id,
        date: new Date(Date.now() - 7 * 86400000),
        startTime: "11:00",
        endTime: "11:45",
        status: "COMPLETED",
      },
    }).catch(() => {});
  }

  console.log("\n✅ Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Admin: admin@demo.com  /  admin123");
  console.log("👤 User:  user@demo.com   /  user123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
