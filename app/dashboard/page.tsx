import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect("/login")

  const isAdmin = (session.user as any)?.role === "ADMIN"

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Привіт, {session.user?.name}!
      </h1>
      <p className="text-gray-500">
        Роль: {isAdmin ? "Адміністратор" : "Учень"}
      </p>
    </main>
  )
}