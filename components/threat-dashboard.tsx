"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThreatStats } from "@/components/threat-stats"
import { ThreatList } from "@/components/threat-list"
import { ThreatChart } from "@/components/threat-chart"
import { FileUpload } from "@/components/file-upload"
import { Shield, Activity, Database } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ThreatDashboard() {
  const [isDemoSeeded, setIsDemoSeeded] = useState(false)
  const { data: threatsData, mutate: mutateThreats } = useSWR("/api/threats?limit=50", fetcher, {
    refreshInterval: 5000,
  })
  const { data: statsData } = useSWR("/api/threats/statistics?days=7", fetcher, {
    refreshInterval: 10000,
  })

  const threats = threatsData?.data || []
  const statistics = statsData?.data?.statistics || []
  const trends = statsData?.data?.trends || []

  const seedDemoData = async () => {
    try {
      const response = await fetch("/api/seed-demo-data", { method: "POST" })
      if (response.ok) {
        setIsDemoSeeded(true)
        mutateThreats()
      }
    } catch (error) {
      console.error("[v0] Error seeding demo data:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Threat Detection System</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Security Operations Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Live Monitoring
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto flex-1 space-y-6 px-6 py-6">
        {/* Demo Data Seeder */}
        {threats.length === 0 && !isDemoSeeded && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                No Threat Data Available
              </CardTitle>
              <CardDescription>Seed the database with demo threat data to explore the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={seedDemoData}>Generate Demo Data</Button>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <ThreatStats statistics={statistics} threats={threats} />

        {/* Charts and Upload */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ThreatChart trends={trends} />
          <FileUpload onUploadComplete={mutateThreats} />
        </div>

        {/* Threat List */}
        <ThreatList threats={threats} onUpdate={mutateThreats} />
      </div>
    </div>
  )
}
