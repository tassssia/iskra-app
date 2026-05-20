"use client"

import { useState, useEffect } from "react"

export default function CalendarSync() {
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/calendar/token")
      .then((r) => r.json())
      .then((data) => setToken(data.token))
  }, [])

  async function generateToken() {
    setLoading(true)
    const res = await fetch("/api/calendar/token", { method: "POST" })
    const data = await res.json()
    setToken(data.token)
    setLoading(false)
  }

  function getUrl() {
    return `${window.location.origin}/api/calendar/${token}`
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(getUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
      <div className="border rounded-xl p-6 mt-6">
        <h2 className="text-lg font-medium mb-2">Додати до календаря</h2>
      <p className="text-sm text-gray-400 mb-3">
      Скопіюй посилання і додай його як підписку у Google Calendar, Apple Calendar або інший календар — заняття оновлюватимуться автоматично.
      </p>
      <details className="mb-4">
      <summary className="text-sm text-gray-400 cursor-pointer hover:text-black transition">
          Як додати підписку?
      </summary>
      <div className="mt-2 text-sm text-gray-500 flex flex-col gap-1 pl-3 border-l">
          <p><span className="font-medium">Google Calendar:</span> "Інші календарі" → "+" → "За URL" → встав посилання</p>
          <p><span className="font-medium">Apple Calendar:</span> Файл → Нова підписка на календар → встав посилання</p>
          <p><span className="font-medium">Outlook:</span> Додати календар → З інтернету → встав посилання</p>
      </div>
      </details>
      {token ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={getUrl()}
            readOnly
            className="border rounded-lg px-3 py-2 text-sm flex-1 bg-gray-50 text-gray-500 outline-none"
          />
          <button
            onClick={copyUrl}
            className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition"
          >
            {copied ? "Скопійовано!" : "Копіювати"}
          </button>
          <button
            onClick={generateToken}
            className="border rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 transition"
          >
            Оновити
          </button>
        </div>
      ) : (
        <button
          onClick={generateToken}
          disabled={loading}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Генерація..." : "Отримати посилання"}
        </button>
      )}
    </div>
  )
}