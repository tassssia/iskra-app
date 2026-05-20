import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

const PACK_SIZES: Record<string, number> = {
  SINGLE: 1,
  PACK_4: 4,
  PACK_8: 8,
  PACK_12: 12,
}

async function expireOldSubscriptions(userId: string) {
  const now = new Date()
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (userId) {
    await expireOldSubscriptions(userId)
  }
  
  const subscriptions = await prisma.subscription.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })

  const serialized = subscriptions.map((s: any) => ({
    ...s,
    startDate: s.startDate?.toISOString() ?? null,
    endDate: s.endDate?.toISOString() ?? null,
    paidAt: s.paidAt?.toISOString() ?? null,
    freezeStart: s.freezeStart?.toISOString() ?? null,
    freezeEnd: s.freezeEnd?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  }))

  return NextResponse.json(serialized)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const { userId, type, notes, paidAt } = await req.json()

  const totalClasses = PACK_SIZES[type]
  if (!totalClasses) {
    return NextResponse.json({ error: "Невірний тип абонементу" }, { status: 400 })
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      type,
      totalClasses,
      notes: notes || null,
      paidAt: paidAt ? new Date(paidAt) : null,
    },
  })

  return NextResponse.json(subscription)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const { id, status, paidAt, freezeStart, freezeWeeks, notes, startDate, endDate } = await req.json()

  const current = await prisma.subscription.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: "Не знайдено" }, { status: 404 })

  let newEndDate = endDate ? new Date(endDate) : current.endDate
  let newFreezeEnd = current.freezeEnd

  if (freezeStart && freezeWeeks) {
    const start = new Date(freezeStart)
    const end = new Date(start)
    end.setDate(end.getDate() + freezeWeeks * 7)
    newFreezeEnd = end

    if (newEndDate) {
      newEndDate = new Date(newEndDate)
      newEndDate.setDate(newEndDate.getDate() + freezeWeeks * 7)
    }
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      status: status || current.status,
      paidAt: paidAt ? new Date(paidAt) : current.paidAt,
      startDate: startDate ? new Date(startDate) : current.startDate,
      endDate: newEndDate,
      freezeStart: freezeStart ? new Date(freezeStart) : current.freezeStart,
      freezeEnd: newFreezeEnd,
      freezeWeeks: freezeWeeks ?? current.freezeWeeks,
      notes: notes !== undefined ? notes : current.notes,
    },
  })

  return NextResponse.json(updated)
}