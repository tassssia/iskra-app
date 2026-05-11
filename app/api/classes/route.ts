import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET() {
  const classes = await prisma.class.findMany({
    orderBy: { date: "asc" },
    include: {
      _count: { select: { bookings: true } },
    },
  })
  return NextResponse.json(classes)
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const { title, description, date, duration, maxSpots } = await req.json()

  const newClass = await prisma.class.create({
    data: {
      title,
      description,
      date: new Date(date),
      duration: Number(duration),
      maxSpots: Number(maxSpots),
    },
  })

  return NextResponse.json(newClass)
}