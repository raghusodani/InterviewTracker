# Interview Tracker Backend (AI-Powered)

This is the NestJS backend for the Interview Tracker application.

## Key Features
- **AI Recruiter Agent**: Modularized agent specialized in MAANG-style interview prep.
- **RAG (Retrieval-Augmented Generation)**: Uses Google Gemini (v1.5 Flash) to generate plans based on real interview frequency data.
- **Full Data Ingestion**: Bulk processing of company-specific DSA problem statistics from LiquidSLR repository.
- **Database**: SQLite with TypeORM for persistence.

## Tech Stack
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite3
- **ORM**: TypeORM
- **AI**: Google Gemini Pro (via REST)
- **Data Source**: LiquidSLR Dataset

## Getting Started

### 1. Prerequisites
- Node.js v18+ (Recommended)
- npm

### 2. Environment Setup
Create a `.env` file in the `server` directory:
```env
GEMINI_API_KEY=your_google_ai_key
PORT=3000
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
# development
npm run start:dev
```

### 5. Ingesting Data
To populate the database with company-specific DSA problems:
```bash
# Full Bulk Ingestion (from liquidslr_repo)
curl -X POST http://localhost:3000/ingestion/companies/liquidslr
```

### 6. Using the AI Agent
Generate personal study plans:
```bash
curl -X POST http://localhost:3000/agent/plan \
     -H "Content-Type: application/json" \
     -d '{"userInput": "I have a Meta interview for a Senior role in 1 week"}'
```

## Project Structure
- `src/agent`: AI processing logic, prompt engineering, and modular specialized services.
- `src/dsa`: Database entities for problems and company statistics.
- `src/ingestion`: Data fetching and bulk loading logic.
- `scripts/data`: Raw data repositories (LiquidSLR).

## License
UNLICENSED
