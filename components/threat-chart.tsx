"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ThreatChartProps {
  trends: any[]
}

export function ThreatChart({ trends }: ThreatChartProps) {
  // Group trends by date
  const chartData = trends.reduce((acc: any[], trend: any) => {
    const date = new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const existing = acc.find((item) => item.date === date)

    if (existing) {
      existing[trend.threat_type] = Number.parseInt(trend.count)
    } else {
      acc.push({
        date,
        [trend.threat_type]: Number.parseInt(trend.count),
      })
    }

    return acc
  }, [] as any[])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threat Trends</CardTitle>
        <CardDescription>Detection patterns over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="malware" fill="hsl(var(--chart-1))" name="Malware" />
            <Bar dataKey="zero_day" fill="hsl(var(--chart-2))" name="Zero-Day" />
            <Bar dataKey="apt" fill="hsl(var(--chart-5))" name="APT" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
