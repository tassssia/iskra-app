import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ProfileClient from "./ProfileClient"
import { signOut } from "@/auth"

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  })

  if (!user) redirect("/login")

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8">Профіль</h1>
      <ProfileClient user={user} />
      <form
        action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
        }}
        className="mt-4"
        >
        <button
            type="submit"
            className="w-full border rounded-lg py-2 text-sm text-gray-400 hover:bg-gray-50 hover:text-black transition"
        >
            Вийти з акаунту
        </button>
        </form>
    </main>
  )
}