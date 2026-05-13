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

  const selectedUser = users.find((u) => u.id === selected)

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
            {selectedUser.bookings.length === 0 ? (
              <p className="text-sm text-gray-400">Немає записів</p>
            ) : (
              selectedUser.bookings.map((b) => (
                <div
                  key={b.id}
                  className="text-sm border rounded-lg p-3 mb-2 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{b.class.title}</p>
                    <p className="text-gray-400">
                      {new Date(b.class.date).toLocaleString("uk-UA")}
                    </p>
                  </div>
                  {b.attended && (
                    <span className="text-xs text-green-500">✓ Відвідала</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {users.length === 0 ? (
        <p className="text-gray-400">Учнів ще немає</p>
      ) : (
        users.map((u) => (
          <button
            key={u.id}
            onClick={() => setSelected(u.id)}
            className="text-left border rounded-xl p-5 hover:bg-gray-50 hover:border-gray-300 transition w-full cursor-pointer"
          >
            <p className="font-medium">{u.name}</p>
            <p className="text-sm text-gray-400 truncate">{u.email}</p>
          </button>
        ))
      )}
    </div>
  )
}