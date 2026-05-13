import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT" },
  })

  const totalClasses = await prisma.class.count()

  const totalBookings = await prisma.booking.count()

  const classes = await prisma.class.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { date: "asc" },
  })

  const popularClasses = classes
    .sort((a, b) => b._count.bookings - a._count.bookings)
    .slice(0, 5)
    .map((c) => ({
      title: c.title,
      bookings: c._count.bookings,
      date: c.date.toISOString(),
    }))

  const bookingsByWeek = await prisma.$queryRaw<{ week: string; count: number }[]>`
    SELECT 
      TO_CHAR(DATE_TRUNC('week', "createdAt"), 'DD.MM') as week,
      COUNT(*)::int as count
    FROM "Booking"
    GROUP BY DATE_TRUNC('week', "createdAt")
    ORDER BY DATE_TRUNC('week', "createdAt")
    LIMIT 8
  `

  return NextResponse.json({
    totalStudents,
    totalClasses,
    totalBookings,
    popularClasses,
    bookingsByWeek,
  })
}