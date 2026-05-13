"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Analytics = {
  totalStudents: number
  totalClasses: number
  totalBookings: number
  popularClasses: { title: string; bookings: number; date: string }[]
  bookingsByWeek: { week: string; count: number }[]
}

export default function AnalyticsClient() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData)
  }, [])

  if (!data) return <p className="text-gray-400">Завантаження...</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Учнів</p>
          <p className="text-3xl font-semibold">{data.totalStudents}</p>
        </div>
        <div className="border rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Занять</p>
          <p className="text-3xl font-semibold">{data.totalClasses}</p>
        </div>
        <div className="border rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Записів</p>
          <p className="text-3xl font-semibold">{data.totalBookings}</p>
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-6">Записи по тижнях</h2>
        {data.bookingsByWeek.length === 0 ? (
          <p className="text-gray-400 text-sm">Недостатньо даних</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.bookingsByWeek}>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Записів" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Популярні заняття</h2>
        {data.popularClasses.length === 0 ? (
          <p className="text-gray-400 text-sm">Немає даних</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.popularClasses.map((c, i) => (
              <div key={i} className="flex justify-between items-center border rounded-lg p-3">
                <p className="text-sm font-medium">{c.title}</p>
                <span className="text-sm text-gray-400">{c.bookings} записів</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}