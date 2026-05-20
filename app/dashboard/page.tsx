import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { signOut } from "@/auth"
import CalendarSync from "./CalendarSync"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === "ADMIN"

  if (isAdmin) {
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } })
    const totalClasses = await prisma.class.count()
    const totalBookings = await prisma.booking.count()

    return (
      <main className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Привіт, {session.user?.name}!</h1>
            <p className="text-gray-400 text-sm mt-1">Адміністратор</p>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="text-sm border rounded-lg px-4 py-2 hover:bg-gray-50 transition cursor-pointer"
            >
              Вийти
            </button>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Учнів</p>
            <p className="text-3xl font-semibold">{totalStudents}</p>
          </div>
          <div className="border rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Занять</p>
            <p className="text-3xl font-semibold">{totalClasses}</p>
          </div>
          <div className="border rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-1">Записів</p>
            <p className="text-3xl font-semibold">{totalBookings}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/classes" className="border rounded-xl p-6 hover:bg-gray-50 transition">
            <p className="font-medium mb-1">Заняття</p>
            <p className="text-sm text-gray-400">Розклад, створення, редагування</p>
          </Link>
          <Link href="/admin/students" className="border rounded-xl p-6 hover:bg-gray-50 transition">
            <p className="font-medium mb-1">Учні</p>
            <p className="text-sm text-gray-400">Список, абонементи, відвідуваність</p>
          </Link>
          <Link href="/admin/analytics" className="border rounded-xl p-6 hover:bg-gray-50 transition">
            <p className="font-medium mb-1">Аналітика</p>
            <p className="text-sm text-gray-400">Статистика і графіки</p>
          </Link>
          <Link href="/schedule" className="border rounded-xl p-6 hover:bg-gray-50 transition">
            <p className="font-medium mb-1">Розклад</p>
            <p className="text-sm text-gray-400">Перегляд всіх занять</p>
          </Link>
        </div>
      </main>
    )
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { class: true },
    orderBy: { class: { date: "asc" } },
  })

  const upcoming = bookings.filter((b) => new Date(b.class.date) > new Date())
  const past = bookings.filter((b) => new Date(b.class.date) <= new Date())

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Привіт, {session.user?.name}!</h1>
          <p className="text-gray-400 text-sm mt-1">Учень</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link
            href="/schedule"
            className="text-sm bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition"
          >
            Розклад
          </Link>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="text-sm border rounded-lg px-4 py-2 hover:bg-gray-50 transition cursor-pointer"
            >
              Вийти
            </button>
          </form>
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

      <div className="my-8">
        <CalendarSync />
      </div>

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