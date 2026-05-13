import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      bookings: {
        select: {
          id: true,
          attended: true,
          class: {
            select: { title: true, date: true },
          },
        },
      },
      subscriptions: {
        select: {
          id: true,
          type: true,
          totalClasses: true,
          usedClasses: true,
          endDate: true,
          frozen: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}