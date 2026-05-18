import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Немає доступу" }, { status: 401 })

  const { name, phone } = await req.json()
  const userId = (session.user as any).id

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name, phone },
  })

  return NextResponse.json({ name: updated.name, phone: updated.phone })
}