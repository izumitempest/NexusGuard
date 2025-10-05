# Threat Detection System

An intelligent threat detection system powered by deep learning that identifies and classifies malware, zero-day exploits, and advanced persistent threats (APTs).

## Features

- **Deep Learning Detection**: PyTorch-based CNN model for threat classification
- **Real-time Monitoring**: Live dashboard with threat statistics and trends
- **File Scanning**: Upload files for instant threat analysis
- **Redis Caching**: High-performance caching for faster response times
- **Rate Limiting**: Protection against API abuse
- **PostgreSQL Database**: Persistent storage for threat data and analysis results

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Caching**: Redis (Upstash)
- **ML Model**: PyTorch (Python)
- **Charts**: Recharts

## Getting Started

### Prerequisites

1. Neon PostgreSQL database (already connected)
2. Upstash Redis (optional, for caching)

### Setup Database

1. Run the database migration script:
   - Navigate to the Scripts tab in v0
   - Execute `001_create_threat_tables.sql`

2. Seed demo data (optional):
   - Click "Generate Demo Data" button in the dashboard
   - Or call `POST /api/seed-demo-data`

### Running the Application

The application is ready to run in v0. Simply:

1. Preview the application
2. Generate demo data if needed
3. Upload files to scan for threats
4. Monitor threats in real-time

## API Endpoints

### Threats

- `GET /api/threats?limit=50` - Get recent threats
- `POST /api/threats` - Create a new threat
- `GET /api/threats/[id]` - Get threat details
- `PATCH /api/threats/[id]` - Update threat status

### Statistics

- `GET /api/threats/statistics?days=7` - Get threat statistics and trends

### Detection

- `POST /api/detect` - Upload file for threat detection

### Demo Data

- `POST /api/seed-demo-data` - Seed database with demo threats

## Redis Integration

Redis is used for:

- **Caching**: Threat lists, statistics, and trends
- **Rate Limiting**: Prevent API abuse (10 scans per minute per IP)
- **Cache Invalidation**: Automatic cache clearing on data updates

To enable Redis:
1. Add Upstash for Redis integration in Project Settings
2. The system will automatically use Redis when available
3. Falls back gracefully if Redis is not configured

## PyTorch Model

The threat detection model is located in `scripts/`:

- `threat_detection_model.py` - Main detection model
- `train_threat_model.py` - Training script

To train the model:
1. Navigate to Scripts tab
2. Run `train_threat_model.py`
3. Model will be saved as `threat_detection_model.pth`

## Architecture

\`\`\`
┌─────────────────┐
│   Dashboard     │  Next.js + React
└────────┬────────┘
         │
┌────────▼────────┐
│   API Routes    │  Next.js API
└────┬───────┬────┘
     │       │
┌────▼───┐ ┌▼─────┐
│ Redis  │ │ Neon │  Caching + Database
└────────┘ └──────┘
     │
┌────▼────────────┐
│ PyTorch Model   │  Threat Detection
└─────────────────┘
\`\`\`

## Security Features

- Rate limiting on file uploads
- SQL injection protection via parameterized queries
- Input validation on all API endpoints
- Secure file handling
- Status-based threat management

## Future Enhancements

- Real PyTorch model integration via API
- Advanced threat intelligence feeds
- Automated threat response workflows
- Multi-user authentication
- Threat hunting capabilities
- Integration with SIEM systems
