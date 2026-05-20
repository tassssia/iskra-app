import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const user = await prisma.user.findUnique({
    where: { calendarToken: token },
    include: {
      bookings: {
        include: { class: true },
        where: { burned: false },
      },
    },
  })

  if (!user) {
    return new NextResponse("Not found", { status: 404 })
  }

  const events = user.bookings.map((b: any) => {
    const start = new Date(b.class.date)
    const end = new Date(start.getTime() + b.class.duration * 60000)

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

    return [
      "BEGIN:VEVENT",
      `UID:${b.id}@iskra-studio`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${b.class.title}`,
      b.class.description ? `DESCRIPTION:${b.class.description}` : "",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n")
  })

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Iskra Studio//UA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Iskra — ${user.name}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n")

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="iskra-${user.name}.ics"`,
    },
  })
}