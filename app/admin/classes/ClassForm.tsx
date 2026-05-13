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
  const [notify, setNotify] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function fetchClasses() {
    const res = await fetch("/api/classes")
    const data = await res.json()
    setClasses(data)
  }

  function showNotify(msg: string) {
    setNotify(msg)
    setTimeout(() => setNotify(null), 3000)
  }

  function startEdit(c: Class) {
    setEditingId(c.id)
    setTitle(c.title)
    setDescription(c.description ?? "")
    setDate(c.date.slice(0, 16))
    setDuration(String(c.duration))
    setMaxSpots(String(c.maxSpots))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle("")
    setDescription("")
    setDate("")
    setDuration("60")
    setMaxSpots("10")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (editingId) {
      await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title, description, date, duration, maxSpots }),
      })
      showNotify("Заняття оновлено")
      setEditingId(null)
    } else {
      await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, duration, maxSpots }),
      })
      showNotify("Заняття створено")
    }

    setTitle("")
    setDescription("")
    setDate("")
    setDuration("60")
    setMaxSpots("10")
    setLoading(false)
    fetchClasses()
  }

  async function handleDelete() {
    if (!deleteId) return

    await fetch("/api/classes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    })

    setDeleteId(null)
    showNotify("Заняття видалено")
    fetchClasses()
  }

  async function handleNotify(classId: string) {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    })
    const data = await res.json()
    showNotify(`Надіслано нагадувань: ${data.sent}`)
  }

  return (
    <>
      {notify && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm rounded-xl px-5 py-3">
          {notify}
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-medium text-lg mb-2">Видалити заняття?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Всі записи учнів на це заняття також будуть видалені. Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition"
              >
                Скасувати
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600 transition"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">
          {editingId ? "Редагування заняття" : "Нове заняття"}
        </h2>
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
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Збереження..." : editingId ? "Зберегти зміни" : "Створити заняття"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
              >
                Скасувати
              </button>
            )}
          </div>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {c._count.bookings} / {c.maxSpots} місць
                    </span>
                    <button
                      onClick={() => handleNotify(c.id)}
                      className="text-sm border rounded-lg px-3 py-1 hover:bg-gray-50 transition"
                    >
                      Нагадати
                    </button>
                    <button
                      onClick={() => startEdit(c)}
                      className="text-sm border rounded-lg px-3 py-1 hover:bg-gray-50 transition"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="text-sm border border-red-200 text-red-400 rounded-lg px-3 py-1 hover:bg-red-50 transition"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}