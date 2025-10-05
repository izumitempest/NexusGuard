import { type NextRequest, NextResponse } from "next/server"
import { getThreatStatistics, getThreatTrends } from "@/lib/threat-queries"
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = Number.parseInt(searchParams.get("days") || "7")

    const statsCacheKey = CACHE_KEYS.STATISTICS
    const trendsCacheKey = CACHE_KEYS.TRENDS(days)

    const [cachedStats, cachedTrends] = await Promise.all([
      getCached<any[]>(statsCacheKey),
      getCached<any[]>(trendsCacheKey),
    ])

    if (cachedStats && cachedTrends) {
      return NextResponse.json({
        success: true,
        data: {
          statistics: cachedStats,
          trends: cachedTrends,
        },
        cached: true,
      })
    }

    const [statistics, trends] = await Promise.all([getThreatStatistics(), getThreatTrends(days)])

    await Promise.all([
      setCached(statsCacheKey, statistics, CACHE_TTL.STATISTICS),
      setCached(trendsCacheKey, trends, CACHE_TTL.TRENDS),
    ])

    return NextResponse.json({
      success: true,
      data: {
        statistics,
        trends,
      },
      cached: false,
    })
  } catch (error) {
    console.error("[v0] Error fetching statistics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
