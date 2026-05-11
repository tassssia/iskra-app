"use client"

import { useState } from "react"

type Class = {
  id: string
  title: string
  description: string | null
  date: string
  duration: number
  maxSpots: number
  _count: { bookings: number }
}

export default function ClassForm({ initial }: { initial: Class[] }) {
  const [classes, setClasses] = useState<Class[]>(initial)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [duration, setDuration] = useState("60")
  const [maxSpots, setMaxSpots] = useState("10")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date, duration, maxSpots }),
    })

    setTitle("")
    setDescription("")
    setDate("")
    setDuration("60")
    setMaxSpots("10")
    setLoading(false)

    const res = await fetch("/api/classes")
    const data = await res.json()
    setClasses(data)
  }

  return (
    <>
      <section className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Нове заняття</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Назва заняття"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            placeholder="Опис (необов'язково)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Тривалість (хв)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black w-full"
            />
            <input
              type="number"
              placeholder="Макс. місць"
              value={maxSpots}
              onChange={(e) => setMaxSpots(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Створення..." : "Створити заняття"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Розклад</h2>
        {classes.length === 0 ? (
          <p className="text-gray-400">Занять ще немає</p>
        ) : (
          <div className="flex flex-col gap-3">
            {classes.map((c) => (
              <div key={c.id} className="bg-white border rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    {c.description && (
                      <p className="text-sm text-gray-500">{c.description}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(c.date).toLocaleString("uk-UA")} · {c.duration} хв
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {c._count.bookings} / {c.maxSpots} місць
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}