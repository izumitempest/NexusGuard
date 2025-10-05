"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ThreatListProps {
  threats: any[]
  onUpdate: () => void
}

export function ThreatList({ threats, onUpdate }: ThreatListProps) {
  const updateThreatStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/threats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      onUpdate()
    } catch (error) {
      console.error("[v0] Error updating threat:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getThreatTypeColor = (type: string) => {
    switch (type) {
      case "malware":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "zero_day":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "apt":
        return "bg-chart-5/10 text-chart-5 border-chart-5/20"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Threats</CardTitle>
        <CardDescription>Latest detected threats and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {threats.slice(0, 20).map((threat: any) => (
            <div
              key={threat.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{threat.file_name || "Unknown File"}</p>
                    <Badge variant="outline" className={getThreatTypeColor(threat.threat_type)}>
                      {threat.threat_type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{threat.source_ip || "N/A"}</span>
                    <span>•</span>
                    <span>{new Date(threat.detected_at).toLocaleString()}</span>
                    <span>•</span>
                    <span>{threat.confidence.toFixed(1)}% confidence</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
                <Badge variant={threat.status === "active" ? "default" : "outline"}>{threat.status}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateThreatStatus(threat.id, "resolved")}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateThreatStatus(threat.id, "false_positive")}>
                      <XCircle className="mr-2 h-4 w-4" />
                      False Positive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {threats.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No threats detected yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
