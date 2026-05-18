import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const { bookingId, attended, burned } = await req.json()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: { include: { subscriptions: true } } },
  })

  if (!booking) {
    return NextResponse.json({ error: "Не знайдено" }, { status: 404 })
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { attended, burned: burned ?? false },
  })

  if (attended || burned) {
    const activeSub = booking.user.subscriptions.find(
      (s) => s.status === "ACTIVE"
    )

    if (activeSub) {
      await prisma.subscription.update({
        where: { id: activeSub.id },
        data: {
          usedClasses: burned
            ? activeSub.usedClasses
            : { increment: 1 },
          burnedClasses: burned
            ? { increment: 1 }
            : activeSub.burnedClasses,
        },
      })
    }
  }

  return NextResponse.json(updated)
}