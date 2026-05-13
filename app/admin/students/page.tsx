import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentsClient from "./StudentsClient"

const prisma = new PrismaClient()

export default async function StudentsPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard")

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
          burned: true,
          class: {
            select: { title: true, date: true },
          },
        },
      },
      subscriptions: {
        select: {
          id: true,
          type: true,
          status: true,
          totalClasses: true,
          usedClasses: true,
          burnedClasses: true,
          startDate: true,
          endDate: true,
          paidAt: true,
          freezeStart: true,
          freezeEnd: true,
          freezeWeeks: true,
          notes: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    bookings: u.bookings.map((b) => ({
      ...b,
      class: {
        ...b.class,
        date: b.class.date.toISOString(),
      },
    })),
    subscriptions: u.subscriptions.map((s) => ({
      ...s,
      startDate: s.startDate?.toISOString() ?? null,
      endDate: s.endDate?.toISOString() ?? null,
      paidAt: s.paidAt?.toISOString() ?? null,
      freezeStart: s.freezeStart?.toISOString() ?? null,
      freezeEnd: s.freezeEnd?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    })),
  }))

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8">Учні</h1>
      <StudentsClient users={serialized} />
    </main>
  )
}