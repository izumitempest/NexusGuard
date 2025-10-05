-- Create threats table to store detected threats
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    threat_type VARCHAR(50) NOT NULL, -- 'malware', 'zero_day', 'apt'
    severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    confidence DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    file_hash VARCHAR(64),
    file_name VARCHAR(255),
    file_size INTEGER,
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    description TEXT,
    raw_data JSONB,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'false_positive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create threat_indicators table for IOCs (Indicators of Compromise)
CREATE TABLE IF NOT EXISTS threat_indicators (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER REFERENCES threats(id) ON DELETE CASCADE,
    indicator_type VARCHAR(50) NOT NULL, -- 'ip', 'domain', 'hash', 'url', 'email'
    indicator_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create threat_analysis table for detailed ML analysis results
CREATE TABLE IF NOT EXISTS threat_analysis (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER REFERENCES threats(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20),
    prediction_scores JSONB, -- Store all class probabilities
    features_analyzed JSONB,
    analysis_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create threat_statistics table for dashboard metrics
CREATE TABLE IF NOT EXISTS threat_statistics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    threat_type VARCHAR(50) NOT NULL,
    total_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    false_positive_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, threat_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(threat_type);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_detected_at ON threats(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_type ON threat_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_value ON threat_indicators(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_statistics_date ON threat_statistics(date DESC);
