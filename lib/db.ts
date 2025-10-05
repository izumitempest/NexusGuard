import { neon } from "@neondatabase/serverless"

// Create a singleton SQL client
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Type definitions for our database models
export interface Threat {
  id: number
  threat_type: "malware" | "zero_day" | "apt"
  severity: "critical" | "high" | "medium" | "low"
  confidence: number
  file_hash?: string
  file_name?: string
  file_size?: number
  source_ip?: string
  destination_ip?: string
  description?: string
  raw_data?: Record<string, any>
  detected_at: Date
  status: "active" | "resolved" | "false_positive"
  created_at: Date
  updated_at: Date
}

export interface ThreatIndicator {
  id: number
  threat_id: number
  indicator_type: "ip" | "domain" | "hash" | "url" | "email"
  indicator_value: string
  created_at: Date
}

export interface ThreatAnalysis {
  id: number
  threat_id: number
  model_name: string
  model_version?: string
  prediction_scores: Record<string, number>
  features_analyzed: Record<string, any>
  analysis_time_ms: number
  created_at: Date
}

export interface ThreatStatistics {
  id: number
  date: string
  threat_type: string
  total_count: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  resolved_count: number
  false_positive_count: number
  created_at: Date
}
