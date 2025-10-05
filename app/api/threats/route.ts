import { type NextRequest, NextResponse } from "next/server"
import { getRecentThreats, createThreat } from "@/lib/threat-queries"
import { getCached, setCached, CACHE_KEYS, CACHE_TTL, invalidateThreatCache } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const cacheKey = CACHE_KEYS.THREATS_LIST(limit)
    const cached = await getCached<any[]>(cacheKey)

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
        cached: true,
      })
    }

    const threats = await getRecentThreats(limit)

    await setCached(cacheKey, threats, CACHE_TTL.THREATS_LIST)

    return NextResponse.json({
      success: true,
      data: threats,
      count: threats.length,
      cached: false,
    })
  } catch (error) {
    console.error("[v0] Error fetching threats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch threats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.threat_type || !body.severity || !body.confidence) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const threat = await createThreat({
      threat_type: body.threat_type,
      severity: body.severity,
      confidence: body.confidence,
      file_hash: body.file_hash,
      file_name: body.file_name,
      file_size: body.file_size,
      source_ip: body.source_ip,
      destination_ip: body.destination_ip,
      description: body.description,
      raw_data: body.raw_data,
      status: body.status || "active",
    })

    await invalidateThreatCache()

    return NextResponse.json(
      {
        success: true,
        data: threat,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating threat:", error)
    return NextResponse.json({ success: false, error: "Failed to create threat" }, { status: 500 })
  }
}
