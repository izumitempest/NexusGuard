import { sql } from "./db"
import type { Threat, ThreatIndicator, ThreatAnalysis } from "./db"

export async function getRecentThreats(limit = 50) {
  const threats = await sql`
    SELECT * FROM threats 
    ORDER BY detected_at DESC 
    LIMIT ${limit}
  `
  return threats as Threat[]
}

export async function getThreatById(id: number) {
  const threats = await sql`
    SELECT * FROM threats WHERE id = ${id}
  `
  return threats[0] as Threat | undefined
}

export async function getThreatStatistics() {
  const stats = await sql`
    SELECT 
      threat_type,
      COUNT(*) as total,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
    FROM threats
    WHERE detected_at >= NOW() - INTERVAL '24 hours'
    GROUP BY threat_type
  `
  return stats
}

export async function getThreatTrends(days = 7) {
  const trends = await sql`
    SELECT 
      DATE(detected_at) as date,
      threat_type,
      COUNT(*) as count
    FROM threats
    WHERE detected_at >= NOW() - (${days} || ' days')::interval
    GROUP BY DATE(detected_at), threat_type
    ORDER BY date DESC
  `
  return trends
}

export async function getThreatIndicators(threatId: number) {
  const indicators = await sql`
    SELECT * FROM threat_indicators 
    WHERE threat_id = ${threatId}
  `
  return indicators as ThreatIndicator[]
}

export async function getThreatAnalysis(threatId: number) {
  const analysis = await sql`
    SELECT * FROM threat_analysis 
    WHERE threat_id = ${threatId}
    ORDER BY created_at DESC
    LIMIT 1
  `
  return analysis[0] as ThreatAnalysis | undefined
}

export async function createThreat(threat: Omit<Threat, "id" | "created_at" | "updated_at" | "detected_at">) {
  const result = await sql`
    INSERT INTO threats (
      threat_type, severity, confidence, file_hash, file_name, 
      file_size, source_ip, destination_ip, description, raw_data, status
    )
    VALUES (
      ${threat.threat_type}, ${threat.severity}, ${threat.confidence},
      ${threat.file_hash || null}, ${threat.file_name || null},
      ${threat.file_size || null}, ${threat.source_ip || null},
      ${threat.destination_ip || null}, ${threat.description || null},
      ${JSON.stringify(threat.raw_data || {})}, ${threat.status || "active"}
    )
    RETURNING *
  `
  return result[0] as Threat
}

export async function updateThreatStatus(id: number, status: "active" | "resolved" | "false_positive") {
  const result = await sql`
    UPDATE threats 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] as Threat | undefined
}
