import { type NextRequest, NextResponse } from "next/server"
import { createThreat } from "@/lib/threat-queries"
import { sql } from "@/lib/db"
import { checkRateLimit, invalidateThreatCache } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const allowed = await checkRateLimit(`scan:${ip}`, 10, 60)

    if (!allowed) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded. Try again later." }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const sourceIp = formData.get("source_ip") as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Read file data
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Simulate ML model detection
    // In production, this would call the Python PyTorch model
    const detectionResult = simulateDetection(file.name, buffer.length)

    // Create threat record
    const threat = await createThreat({
      threat_type: detectionResult.threat_type,
      severity: detectionResult.severity,
      confidence: detectionResult.confidence,
      file_name: file.name,
      file_size: buffer.length,
      source_ip: sourceIp || undefined,
      description: detectionResult.description,
      raw_data: detectionResult.raw_data,
      status: "active",
    })

    // Store analysis results
    await sql`
      INSERT INTO threat_analysis (
        threat_id, model_name, model_version, 
        prediction_scores, features_analyzed, analysis_time_ms
      )
      VALUES (
        ${threat.id}, ${detectionResult.model_name}, ${detectionResult.model_version},
        ${JSON.stringify(detectionResult.prediction_scores)},
        ${JSON.stringify(detectionResult.features_analyzed)},
        ${detectionResult.analysis_time_ms}
      )
    `

    await invalidateThreatCache()

    return NextResponse.json(
      {
        success: true,
        data: {
          threat,
          detection: detectionResult,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error detecting threat:", error)
    return NextResponse.json({ success: false, error: "Failed to detect threat" }, { status: 500 })
  }
}

// Simulate ML model detection
// In production, this would interface with the Python PyTorch model
function simulateDetection(fileName: string, fileSize: number) {
  const threatTypes = ["malware", "zero_day", "apt"] as const
  const severities = ["critical", "high", "medium", "low"] as const

  // Generate realistic detection results
  const randomThreatType = threatTypes[Math.floor(Math.random() * threatTypes.length)]
  const confidence = 70 + Math.random() * 30 // 70-100%

  let severity: (typeof severities)[number]
  if (confidence > 95) severity = "critical"
  else if (confidence > 85) severity = "high"
  else if (confidence > 75) severity = "medium"
  else severity = "low"

  const predictionScores = {
    malware: Math.random() * 100,
    zero_day: Math.random() * 100,
    apt: Math.random() * 100,
  }

  // Normalize scores
  const total = Object.values(predictionScores).reduce((a, b) => a + b, 0)
  Object.keys(predictionScores).forEach((key) => {
    predictionScores[key as keyof typeof predictionScores] =
      (predictionScores[key as keyof typeof predictionScores] / total) * 100
  })

  return {
    threat_type: randomThreatType,
    severity,
    confidence: Math.round(confidence * 100) / 100,
    description: `Detected ${randomThreatType} with ${severity} severity`,
    model_name: "ThreatDetectionCNN",
    model_version: "1.0.0",
    prediction_scores: predictionScores,
    features_analyzed: {
      file_size: fileSize,
      file_name: fileName,
      entropy: Math.random(),
      suspicious_strings: Math.floor(Math.random() * 10),
    },
    analysis_time_ms: Math.floor(50 + Math.random() * 200),
    raw_data: {
      timestamp: new Date().toISOString(),
      scanner_version: "1.0.0",
    },
  }
}
