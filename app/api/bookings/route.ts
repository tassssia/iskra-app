import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Немає доступу" }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { userId: (session.user as any).id },
    include: { class: true },
    orderBy: { class: { date: "asc" } },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Немає доступу" }, { status: 401 })

  const { classId } = await req.json()
  const userId = (session.user as any).id

  console.log("SESSION USER:", session.user)
  console.log("USER ID:", userId)
  console.log("CLASS ID:", classId)

  if (!userId) {
    return NextResponse.json({ error: "Немає userId" }, { status: 400 })
  }

  try {
    const existing = await prisma.booking.findUnique({
      where: { userId_classId: { userId, classId } },
    })

    if (existing) {
      return NextResponse.json({ error: "Вже записана" }, { status: 400 })
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { bookings: true } } },
    })

    if (!classData) {
      return NextResponse.json({ error: "Заняття не знайдено" }, { status: 404 })
    }

    if (classData._count.bookings >= classData.maxSpots) {
      return NextResponse.json({ error: "Місць немає" }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: { userId, classId },
    })

    return NextResponse.json(booking)
  } catch (e) {
    console.error("BOOKING ERROR:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Немає доступу" }, { status: 401 })

  const { classId } = await req.json()
  const userId = (session.user as any).id

  await prisma.booking.delete({
    where: { userId_classId: { userId, classId } },
  })

  return NextResponse.json({ success: true })
}