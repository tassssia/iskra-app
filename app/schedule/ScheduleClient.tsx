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

export default function ScheduleClient({
  classes,
  bookedClassIds,
  isAdmin,
}: {
  classes: Class[]
  bookedClassIds: string[]
  isAdmin: boolean
}) {
  const [booked, setBooked] = useState<string[]>(bookedClassIds)
  const [loading, setLoading] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [dateError, setDateError] = useState("")

  async function handleBook(classId: string) {
    setLoading(classId)
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    })
    setBooked((prev) => [...prev, classId])
    setLoading(null)
  }

  async function handleCancel(classId: string) {
    setLoading(classId)
    await fetch("/api/bookings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    })
    setBooked((prev) => prev.filter((id) => id !== classId))
    setLoading(null)
  }

  if (classes.length === 0) {
    return <p className="text-gray-400">Занять поки немає</p>
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1">Від</p>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              if (dateTo && e.target.value && e.target.value > dateTo) {
                setDateError("Зверніть увагу: дата 'Від' не може бути пізнішою за дату 'До'")
              } else {
                setDateError("")
              }
            }}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black w-full"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1">До</p>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              if (dateFrom && e.target.value && e.target.value < dateFrom) {
                setDateError("Зверніть увагу: дата 'До' не може бути ранішою за дату 'Від'")
              } else {
                setDateError("")
              }
            }}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black w-full"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo("") }}
            className="self-end text-sm text-gray-400 hover:text-black transition pb-2"
          >
            Скинути
          </button>
        )}
      </div>
      {dateError && (
        <p className="text-sm text-amber-500 mb-4">{dateError}</p>
      )}
      <div className="flex flex-col gap-3"></div>
      <div className="flex flex-col gap-3">
        {classes
          .filter((c) => {
            const date = new Date(c.date)
            if (dateFrom && date < new Date(dateFrom)) return false
            if (dateTo && date > new Date(dateTo + "T23:59:59")) return false
            return true
          })
          .map((c: any) => {
            const isBooked = booked.includes(c.id)
            const isFull = c._count.bookings >= c.maxSpots && !isBooked
            const isLoading = loading === c.id

            return (
              <div key={c.id} className="bg-white border rounded-xl p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium">{c.title}</p>
                  {c.description && (
                    <p className="text-sm text-gray-500">{c.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(c.date).toLocaleString("uk-UA")} · {c.duration} хв
                  </p>
                  <p className="text-sm text-gray-400">
                    {c._count.bookings} / {c.maxSpots} місць
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {isAdmin ? (
                    <span className="text-sm text-gray-400">Перегляд</span>
                  ) : isBooked ? (
                    <button
                      onClick={() => handleCancel(c.id)}
                      disabled={isLoading}
                      className="text-sm border border-red-300 text-red-500 rounded-lg px-3 py-1 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {isLoading ? "..." : "Скасувати"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBook(c.id)}
                      disabled={isFull || isLoading}
                      className="text-sm bg-black text-white rounded-lg px-3 py-1 hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {isLoading ? "..." : isFull ? "Немає місць" : "Записатись"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}