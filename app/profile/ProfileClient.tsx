"use client"

import { useState } from "react"

type User = {
  name: string
  email: string
  phone: string | null
}

export default function ProfileClient({ user }: { user: User }) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [loading, setLoading] = useState(false)
  const [notify, setNotify] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    })

    setLoading(false)

    if (res.ok) {
      setNotify("Профіль оновлено")
      setTimeout(() => setNotify(null), 3000)
    }
  }

  return (
    <>
      {notify && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm rounded-xl px-5 py-3">
          {notify}
        </div>
      )}

      <div className="border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Імʼя</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Email</p>
            <input
              type="text"
              value={user.email}
              disabled
              className="border rounded-lg px-4 py-2 w-full bg-gray-50 text-gray-400"
            />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Телефон</p>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380..."
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Збереження..." : "Зберегти"}
          </button>
        </form>
      </div>
    </>
  )
}