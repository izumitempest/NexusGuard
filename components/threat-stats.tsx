import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface ThreatStatsProps {
  statistics: any[]
  threats: any[]
}

export function ThreatStats({ statistics, threats }: ThreatStatsProps) {
  const totalThreats = threats.length
  const activeThreats = threats.filter((t: any) => t.status === "active").length
  const criticalThreats = threats.filter((t: any) => t.severity === "critical").length
  const resolvedThreats = threats.filter((t: any) => t.status === "resolved").length

  const stats = [
    {
      title: "Total Threats",
      value: totalThreats,
      icon: Shield,
      description: "Detected in last 24h",
      color: "text-primary",
    },
    {
      title: "Active Threats",
      value: activeThreats,
      icon: AlertTriangle,
      description: "Requiring attention",
      color: "text-chart-4",
    },
    {
      title: "Critical Severity",
      value: criticalThreats,
      icon: XCircle,
      description: "High priority alerts",
      color: "text-destructive",
    },
    {
      title: "Resolved",
      value: resolvedThreats,
      icon: CheckCircle,
      description: "Successfully mitigated",
      color: "text-chart-3",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
