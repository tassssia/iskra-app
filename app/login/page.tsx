import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Вхід до Iskra</h1>
        <form
          action={async (formData: FormData) => {
            "use server"
            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/dashboard",
              })
            } catch (error) {
              if (error instanceof AuthError) {
                redirect("/login?error=credentials")
              }
              throw error
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            required
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          {searchParams.error && (
            <p className="text-red-500 text-sm">Невірний email або пароль</p>
          )}
          <button
            type="submit"
            className="bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition"
          >
            Увійти
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Немає акаунту?{" "}
          <a href="/register" className="underline">
            Зареєструватись
          </a>
        </p>
      </div>
    </main>
  )
}