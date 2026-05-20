import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Немає доступу" }, { status: 401 })

  const userId = (session.user as any).id

  const token = randomBytes(32).toString("hex")

  await prisma.user.update({
    where: { id: userId },
    data: { calendarToken: token },
  })

  return NextResponse.json({ token })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Немає доступу" }, { status: 401 })

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calendarToken: true },
  })

  return NextResponse.json({ token: user?.calendarToken ?? null })
}