import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Generate demo threat data for the dashboard
    const threatTypes = ["malware", "zero_day", "apt"]
    const severities = ["critical", "high", "medium", "low"]
    const statuses = ["active", "resolved", "false_positive"]

    const demoThreats = []

    for (let i = 0; i < 50; i++) {
      const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const confidence = 60 + Math.random() * 40

      // Random date within last 7 days
      const daysAgo = Math.floor(Math.random() * 7)
      const detectedAt = new Date()
      detectedAt.setDate(detectedAt.getDate() - daysAgo)

      demoThreats.push({
        threat_type: threatType,
        severity,
        status,
        confidence: Math.round(confidence * 100) / 100,
        file_name: `suspicious_file_${i}.exe`,
        file_size: Math.floor(1000 + Math.random() * 50000),
        source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        description: `Detected ${threatType} with ${severity} severity`,
        detected_at: detectedAt.toISOString(),
      })
    }

    // Insert demo data
    for (const threat of demoThreats) {
      await sql`
        INSERT INTO threats (
          threat_type, severity, confidence, file_name, file_size,
          source_ip, description, status, detected_at
        )
        VALUES (
          ${threat.threat_type}, ${threat.severity}, ${threat.confidence},
          ${threat.file_name}, ${threat.file_size}, ${threat.source_ip},
          ${threat.description}, ${threat.status}, ${threat.detected_at}
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${demoThreats.length} demo threats`,
    })
  } catch (error) {
    console.error("[v0] Error seeding demo data:", error)
    return NextResponse.json({ success: false, error: "Failed to seed demo data" }, { status: 500 })
  }
}
