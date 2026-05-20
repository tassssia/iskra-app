import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ClassForm from "./ClassForm"

const prisma = new PrismaClient()

export default async function AdminClassesPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") redirect("/dashboard")

  const classes = await prisma.class.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { bookings: true } } },
  })

  const serialized = classes.map((c: any) => ({
    ...c,
    date: c.date.toISOString(),
  }))

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8">Управління заняттями</h1>
      <ClassForm initial={serialized} />
    </main>
  )
}