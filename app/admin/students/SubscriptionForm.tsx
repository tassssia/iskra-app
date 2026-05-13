"use client"

import { useState } from "react"

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

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Разове",
  PACK_4: "Абонемент 4",
  PACK_8: "Абонемент 8",
  PACK_12: "Абонемент 12",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Очікує оплати",
  ACTIVE: "Активний",
  FROZEN: "Заморожений",
  EXPIRED: "Завершений",
  REFUNDED: "Повернено кошти",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "text-amber-500",
  ACTIVE: "text-green-500",
  FROZEN: "text-blue-500",
  EXPIRED: "text-gray-400",
  REFUNDED: "text-red-400",
}

export default function SubscriptionForm({ userId }: { userId: string }) {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [type, setType] = useState("PACK_8")
  const [notes, setNotes] = useState("")
  const [paidAt, setPaidAt] = useState("")
  const [notify, setNotify] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editPaidAt, setEditPaidAt] = useState("")
  const [editStartDate, setEditStartDate] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editFreezeStart, setEditFreezeStart] = useState("")
  const [editFreezeWeeks, setEditFreezeWeeks] = useState("1")

  function showNotify(msg: string) {
    setNotify(msg)
    setTimeout(() => setNotify(null), 3000)
  }

  async function fetchSubs() {
    const res = await fetch(`/api/subscriptions?userId=${userId}`)
    const data = await res.json()
    setSubs(data)
    setLoaded(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, notes, paidAt }),
    })
    setType("PACK_8")
    setNotes("")
    setPaidAt("")
    showNotify("Абонемент створено")
    fetchSubs()
  }

  async function handleUpdate(id: string) {
    await fetch("/api/subscriptions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: editStatus,
        paidAt: editPaidAt,
        startDate: editStartDate,
        notes: editNotes,
        freezeStart: editFreezeStart,
        freezeWeeks: editFreezeWeeks ? Number(editFreezeWeeks) : undefined,
      }),
    })
    setEditId(null)
    showNotify("Абонемент оновлено")
    fetchSubs()
  }

  function startEdit(s: Subscription) {
    setEditId(s.id)
    setEditStatus(s.status)
    setEditPaidAt(s.paidAt ? s.paidAt.slice(0, 10) : "")
    setEditStartDate(s.startDate ? s.startDate.slice(0, 10) : "")
    setEditNotes(s.notes ?? "")
    setEditFreezeStart(s.freezeStart ? s.freezeStart.slice(0, 10) : "")
    setEditFreezeWeeks(String(s.freezeWeeks || 1))
  }

  if (!loaded) {
    return (
      <button
        onClick={fetchSubs}
        className="text-sm text-gray-400 hover:text-black transition"
      >
        Показати абонементи
      </button>
    )
  }

  return (
    <div>
      {notify && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm rounded-xl px-5 py-3">
          {notify}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm outline-none"
        >
          {Object.entries(TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <input
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          placeholder="Дата оплати"
          className="border rounded-lg px-3 py-1.5 text-sm outline-none"
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Примітки"
          className="border rounded-lg px-3 py-1.5 text-sm outline-none flex-1 min-w-32"
        />
        <button
          type="submit"
          className="bg-black text-white text-sm rounded-lg px-4 py-1.5 hover:bg-gray-800 transition"
        >
          Додати
        </button>
      </form>

      {subs.length === 0 ? (
        <p className="text-sm text-gray-400">Абонементів ще немає</p>
      ) : (
        <div className="flex flex-col gap-2">
          {subs.map((s) => (
            <div key={s.id} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{TYPE_LABELS[s.type]}</span>
                  <span className={`text-xs ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {s.usedClasses + s.burnedClasses} / {s.totalClasses}
                </span>
              </button>

              {expanded === s.id && (
                <div className="px-4 pb-4 border-t pt-3">
                  {editId === s.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Статус</p>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm w-full outline-none"
                          >
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Дата оплати</p>
                          <input
                            type="date"
                            value={editPaidAt}
                            onChange={(e) => setEditPaidAt(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm w-full outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Початок</p>
                          <input
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm w-full outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Заморозка з</p>
                          <input
                            type="date"
                            value={editFreezeStart}
                            onChange={(e) => setEditFreezeStart(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm w-full outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Тижнів заморозки</p>
                          <select
                            value={editFreezeWeeks}
                            onChange={(e) => setEditFreezeWeeks(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm w-full outline-none"
                          >
                            <option value="1">1 тиждень</option>
                            <option value="2">2 тижні</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Примітки</p>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="border rounded-lg px-3 py-1.5 text-sm w-full outline-none"
                        />
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleUpdate(s.id)}
                          className="flex-1 bg-black text-white text-sm rounded-lg py-1.5 hover:bg-gray-800 transition"
                        >
                          Зберегти
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="border text-sm rounded-lg px-4 py-1.5 hover:bg-gray-50 transition"
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {s.startDate && (
                        <p className="text-sm text-gray-500">
                          Початок: {new Date(s.startDate).toLocaleDateString("uk-UA")}
                          {s.endDate && ` — ${new Date(s.endDate).toLocaleDateString("uk-UA")}`}
                        </p>
                      )}
                      {s.paidAt && (
                        <p className="text-sm text-gray-500">
                          Оплачено: {new Date(s.paidAt).toLocaleDateString("uk-UA")}
                        </p>
                      )}
                      {s.freezeStart && (
                        <p className="text-sm text-blue-500">
                          Заморожено: {new Date(s.freezeStart).toLocaleDateString("uk-UA")}
                          {s.freezeEnd && ` — ${new Date(s.freezeEnd).toLocaleDateString("uk-UA")}`}
                        </p>
                      )}
                      {s.notes && (
                        <p className="text-sm text-gray-400 italic">{s.notes}</p>
                      )}
                      <button
                        onClick={() => startEdit(s)}
                        className="text-sm border rounded-lg px-3 py-1 hover:bg-gray-50 transition mt-1 self-start"
                      >
                        Редагувати
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}