import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { Resend } from "resend"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 })
  }

  const { classId } = await req.json()

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      bookings: {
        include: { user: true },
      },
    },
  })

  if (!classData) {
    return NextResponse.json({ error: "Заняття не знайдено" }, { status: 404 })
  }

  const date = new Date(classData.date).toLocaleString("uk-UA")

  const results = await Promise.all(
    classData.bookings.map((b: any) =>
      resend.emails.send({
        from: "Iskra Studio <onboarding@resend.dev>",
        to: b.user.email,
        subject: `Нагадування: ${classData.title}`,
        html: `
          <p>Привіт, ${b.user.name}!</p>
          <p>Нагадуємо, що завтра о <strong>${date}</strong> відбудеться заняття <strong>${classData.title}</strong>.</p>
          <p>Тривалість: ${classData.duration} хв.</p>
          <p>Чекаємо на тебе! 🤸</p>
          <p>— Команда Iskra</p>
        `,
      })
    )
  )

  return NextResponse.json({ sent: results.length })
}