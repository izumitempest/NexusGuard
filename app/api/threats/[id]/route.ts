import { type NextRequest, NextResponse } from "next/server"
import { getThreatById, updateThreatStatus, getThreatIndicators, getThreatAnalysis } from "@/lib/threat-queries"
import { getCached, setCached, deleteCached, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid threat ID" }, { status: 400 })
    }

    const cacheKey = CACHE_KEYS.THREAT_DETAIL(id)
    const cached = await getCached<any>(cacheKey)

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      })
    }

    const threat = await getThreatById(id)

    if (!threat) {
      return NextResponse.json({ success: false, error: "Threat not found" }, { status: 404 })
    }

    // Get related data
    const [indicators, analysis] = await Promise.all([getThreatIndicators(id), getThreatAnalysis(id)])

    const result = {
      ...threat,
      indicators,
      analysis,
    }

    await setCached(cacheKey, result, CACHE_TTL.THREAT_DETAIL)

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    })
  } catch (error) {
    console.error("[v0] Error fetching threat:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch threat" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid threat ID" }, { status: 400 })
    }

    if (!body.status || !["active", "resolved", "false_positive"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 })
    }

    const threat = await updateThreatStatus(id, body.status)

    if (!threat) {
      return NextResponse.json({ success: false, error: "Threat not found" }, { status: 404 })
    }

    await deleteCached(CACHE_KEYS.THREAT_DETAIL(id))

    return NextResponse.json({
      success: true,
      data: threat,
    })
  } catch (error) {
    console.error("[v0] Error updating threat:", error)
    return NextResponse.json({ success: false, error: "Failed to update threat" }, { status: 500 })
  }
}
