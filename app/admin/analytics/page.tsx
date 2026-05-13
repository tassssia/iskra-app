import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AnalyticsClient from "./AnalyticsClient"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard")

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8">Аналітика</h1>
      <AnalyticsClient />
    </main>
  )
}