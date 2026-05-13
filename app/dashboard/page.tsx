import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === "ADMIN"

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { class: true },
    orderBy: { class: { date: "asc" } },
  })

  const upcoming = bookings.filter(
    (b) => new Date(b.class.date) > new Date()
  )
  const past = bookings.filter(
    (b) => new Date(b.class.date) <= new Date()
  )

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Привіт, {session.user?.name}!</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isAdmin ? "Адміністратор" : "Учень"}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          {isAdmin && (
            <Link
              href="/admin/classes"
              className="text-sm border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
            >
              Управління
            </Link>
          )}
          <Link
            href="/schedule"
            className="text-sm bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition"
          >
            Розклад
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Майбутні заняття</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-400">Немає запланованих занять</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <div key={b.id} className="bg-white border rounded-xl p-4">
                <p className="font-medium">{b.class.title}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(b.class.date).toLocaleString("uk-UA")} · {b.class.duration} хв
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Історія занять</h2>
        {past.length === 0 ? (
          <p className="text-gray-400">Історія порожня</p>
        ) : (
          <div className="flex flex-col gap-3">
            {past.map((b) => (
              <div key={b.id} className="bg-white border rounded-xl p-4 opacity-60">
                <p className="font-medium">{b.class.title}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(b.class.date).toLocaleString("uk-UA")} · {b.class.duration} хв
                </p>
                {b.attended && (
                  <span className="text-xs text-green-500 mt-1 block">✓ Відвідала</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}