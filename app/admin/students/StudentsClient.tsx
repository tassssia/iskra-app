"use client"

import { useState } from "react"
import SubscriptionForm from "./SubscriptionForm"

type Subscription = {
  id: string
  type: string
  status: string
  totalClasses: number
  usedClasses: number
  burnedClasses: number
  startDate: string | null
  endDate: string | null
  paidAt: string | null
  freezeStart: string | null
  freezeEnd: string | null
  freezeWeeks: number
  notes: string | null
  createdAt: string
}

type Booking = {
  id: string
  attended: boolean
  burned: boolean
  class: { title: string; date: string }
}

type User = {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  bookings: Booking[]
  subscriptions: Subscription[]
}

export default function StudentsClient({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState("")

  const selectedUser = users.find((u) => u.id === selected)

  function selectUser(id: string) {
    const user = users.find((u) => u.id === id)
    setSelected(id)
    setBookings(user?.bookings ?? [])
  }

  async function handleAttendance(bookingId: string, attended: boolean, burned: boolean) {
    await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, attended, burned }),
    })
    setBookings((prev) =>
      prev.map((b) => b.id === bookingId ? { ...b, attended, burned } : b)
    )
  }

  if (selectedUser) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-gray-400 hover:text-black mb-6 flex items-center gap-1 transition"
        >
          ← Назад до списку
        </button>

        <div className="flex flex-col gap-4">
          <div className="border rounded-xl p-6">
            <h2 className="text-lg font-medium mb-1">{selectedUser.name}</h2>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
            {selectedUser.phone && (
              <p className="text-sm text-gray-500">{selectedUser.phone}</p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              У системі з {new Date(selectedUser.createdAt).toLocaleDateString("uk-UA")}
            </p>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-medium mb-4">Абонементи</h3>
            <SubscriptionForm userId={selectedUser.id} />
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-medium mb-3">Заняття</h3>
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-400">Немає записів</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className={`text-sm border rounded-lg p-3 mb-2 flex justify-between items-center ${
                    b.burned ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{b.class.title}</p>
                    <p className="text-gray-400">
                      {new Date(b.class.date).toLocaleString("uk-UA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.attended && !b.burned && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-500">✓ Відвідано</span>
                        <button
                          onClick={() => handleAttendance(b.id, false, false)}
                          className="text-xs text-gray-300 hover:text-gray-500 transition"
                        >
                          Скасувати
                        </button>
                      </div>
                    )}
                    {b.burned && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">✗ Згоріло</span>
                        <button
                          onClick={() => handleAttendance(b.id, false, false)}
                          className="text-xs text-gray-300 hover:text-gray-500 transition"
                        >
                          Скасувати
                        </button>
                      </div>
                    )}
                    {!b.attended && !b.burned && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAttendance(b.id, true, false)}
                          className="text-xs border border-green-200 text-green-600 rounded px-2 py-1 hover:bg-green-50 transition"
                        >
                          Був
                        </button>
                        <button
                          onClick={() => handleAttendance(b.id, false, true)}
                          className="text-xs border border-red-200 text-red-400 rounded px-2 py-1 hover:bg-red-50 transition"
                        >
                          Згоріло
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Пошук за іменем або email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black w-full mb-4"
      />
      <div className="grid grid-cols-2 gap-3">
        {users.length === 0 ? (
          <p className="text-gray-400">Учнів ще немає</p>
        ) : (
          users
            .filter((u) =>
              u.name.toLowerCase().includes(search.toLowerCase()) ||
              u.email.toLowerCase().includes(search.toLowerCase())
            )
            .map((u) => (
            <button
              key={u.id}
              onClick={() => selectUser(u.id)}
              className="text-left border rounded-xl p-5 hover:bg-gray-50 hover:border-gray-300 transition w-full cursor-pointer"
            >
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-400 truncate">{u.email}</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}