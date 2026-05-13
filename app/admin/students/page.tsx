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
      endDate: s.endDate ? s.endDate.toISOString() : null,
    })),
  }))

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8">Учні</h1>
      <StudentsClient users={serialized} />
    </main>
  )
}