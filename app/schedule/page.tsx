import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ScheduleClient from "./ScheduleClient"

const prisma = new PrismaClient()

export default async function SchedulePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === "ADMIN"

  const classes = await prisma.class.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { bookings: true } } },
  })

  const bookings = await prisma.booking.findMany({
    where: { userId },
  })

  const bookedClassIds = bookings.map((b) => b.classId)

  const serialized = classes.map((c) => ({
    ...c,
    date: c.date.toISOString(),
  }))

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8">Розклад занять</h1>
      <ScheduleClient
        classes={serialized}
        bookedClassIds={bookedClassIds}
        isAdmin={isAdmin}
      />
    </main>
  )
}