# Interview Tracker - Comprehensive Implementation Log

This document serves as the detailed technical record of the Interview Tracker's backend evolution. It tracks architectural decisions, schema designs, data ingestion strategies, and optimization steps.

---

## 🏗 Phase 0: The Knowledge Base Foundation (Completed)

**Objective**: Build a robust, data-rich backend capable of storing, organizing, and querying thousands of DSA problems with deep company insights.

### 1. Architecture & Technology Stack
- **Runtime**: Node.js (v20+ recommended)
- **Framework**: **NestJS** (Modular, Dependency Injection-based architecture).
- **Language**: TypeScript (Strict typing).
- **Database**: 
  - **Type**: SQLite (File-based for rapid dev), compatible with PostgreSQL for production.
  - **ORM**: **TypeORM** (Code-first approach).
- **API Style**: REST (Controllers) + Internal Services.

### 2. Database Schema Design

We implemented a **Normalized Relational Schema** optimized for both "Tag Filtering" and "Frequency Sorting".

#### A. Core Entity: `DsaProblem`
*   **Table**: `dsa_problem`
*   **Purpose**: Stores the immutable definition of a LeetCode problem.
*   **Columns**:
    *   `id` (UUID): Primary Key.
    *   `title` (String): "Two Sum".
    *   `titleSlug` (String): "two-sum" (Unique Index).
    *   `difficulty` (Enum/String): "Easy", "Medium", "Hard".
    *   `platformProblemId` (String): LeetCode's ID (e.g. "1").
    *   `isPaidOnly` (Boolean): Tracks if it requires premium.
    *   `description` (Text): HTML content (currently null, fetched on demand).

#### B. The Taxonomy: `Tag`
*   **Table**: `tag`
*   **Purpose**: Generic categorization for fast filtering (many-to-many).
*   **Columns**:
    *   `id` (UUID).
    *   `name` (String): "Array", "DP", "Google", "Amazon".
    *   `category` (String): `'topic'` or `'company'`.
*   **Relation**: Many-to-Many with `DsaProblem` via `dsa_problem_tags_tag`.

#### C. The Optimization: `CompanyProblem` (New!)
*   **Table**: `company_problem`
*   **Purpose**: Solves the "Sorting by Frequency" problem. Instead of a generic tag, this stores detailed metadata about a problem's relevance to a specific company.
*   **Columns**:
    *   `id` (Int): PK.
    *   `companyName` (String): "Google", "Uber" (Indexed).
    *   `frequency` (Float): 0.0 - 100.0 (Indexed for sorting).
    *   `duration` (String): "30d", "6m", "all".
    *   `problemId`: FK to `DsaProblem`.
*   **Performance**: Enables O(1) + Index Scan queries like:
    ```sql
    SELECT * FROM company_problem 
    WHERE companyName = 'Google' 
    ORDER BY frequency DESC 
    LIMIT 50;
    ```

---

### 3. Data Ingestion Engines

We built a multi-stage ingestion pipeline to populate this knowledge base.

#### Stage 1: Official LeetCode Data
*   **Source**: LeetCode GraphQL API (`https://leetcode.com/graphql`).
*   **Method**: `POST /ingestion/leetcode { slug: "two-sum" }`.
*   **Service Logic**:
    *   Fetches live Title, Difficulty, and **Topic Tags** (Array, DP).
    *   Upserts `DsaProblem` and `Tag` entities.

#### Stage 2: Bulk Seeding (Blind 75)
*   **Script**: `server/scripts/seed.ts`.
*   **Logic**: Iterates a curated list of "Blind 75" slugs and triggers Stage 1 for each.
*   **Status**: Populated 75 core problems into the DB.

#### Stage 3: The "LiquidSLR" Enrichment (High-Frequency Data)
*   **Source**: A massive GitHub repository (`liquidslr/leetcode-company-wise-problems`) containing 300+ company CSVs, updated June 2025.
*   **Endpoint**: `POST /ingestion/companies/liquidslr`.
*   **Service Logic**:
    1.  Recursively scans 300+ directories (Google, Facebook, etc.).
    2.  Pulls existing Problems into memory map.
    3.  **Full Ingestion**: If a problem in the CSV is missing from DB, it is **Created** instantly using CSV metadata (Title, Difficulty, Topics).
    4.  **Optimized Write**:
        *   **Tagging**: Adds a generic `Tag` (e.g., "Google") to the problem.
        *   **Stats**: Creates/Updates `CompanyProblem` entity with the exact `Frequency` score.
    5.  **Result**: We now have thousands of data points linking Companies to Problems with frequency data, without external API calls.

---

### 4. API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ingestion/leetcode` | Ingests a single problem from LeetCode. |
| `POST` | `/ingestion/companies` | (Legacy) Ingests tags from simple JSON map. |
| `POST` | `/ingestion/companies/liquidslr` | **(Primary)** Scans local CSV dataset and populates `CompanyProblem` stats. |

---

## 🤖 Phase 1: The "Recruiter Agent" (Completed)

**Objective**: Develop a high-intelligence AI Agent that acts as a personal interview coach, leveraging premium DSA frequency data.

### 1. Modular Architecture (SOLID Principles)
The Agent module was refactored from a monolithic service into a decoupled, scalable architecture:

*   **`AiProviderService`**: Encapsulates all LLM-specific logic. It handles HTTP communication with the Gemini API, JSON cleaning, and error handling. This allows swapping AI providers (e.g., OpenAI, Claude) without touching business logic.
*   **`IntentAnalyzerService`**: Dedicated to parsing unstructured user input. It uses advanced prompt engineering to extract entities like `company`, `role`, `timeframe`, and `domain`. It also provides a robust fallback mechanism using keyword matching.
*   **`PlanGeneratorService`**: The "Creative" core. It takes retrieved raw data (top problems) and user context to craft a formatted, educational study plan.
*   **`AgentService` (Orchestrator)**: Acts as a Facade. It manages the high-level workflow: Analyze Intent → Retrieve Data (RAG) → Generate Plan.

### 2. Advanced Prompt Engineering
We implemented a two-stage prompt pipeline:

#### A. Intent Extraction Prompt
- **Persona**: Elite Technical Consultant.
- **Goal**: Deterministic data extraction.
- **Output**: Strict JSON.
- **Context**: Extracts nuances like role seniority (L3 vs L6) which influences plan complexity.

#### B. Educational Plan Generation Prompt
- **Persona**: MAANG Interview Coach.
- **RAG Integration**: Injects the top 15 highest-frequency problems directly into the prompt context.
- **Structure**:
    1.  **Strategic Overview**: Company-specific hiring philosophies.
    2.  **Daily Roadmap**: Logical grouping of problems.
    3.  **Technical Deep Dive**: Analysis of common themes (e.g., "Google loves Graphs").
    4.  **Recruiter Tips**: Insights into "Googliness", Amazon LP, or Meta's speed focus.

### 3. Retrieval-Augmented Generation (RAG)
Instead of relying on's outdated knowledge, we provide it with our **Ground Truth** data:
- The system identifies the company.
- Pulls from the `CompanyProblem` table (populated from LiquidSLR).
- Feeds the AI with actual problem titles, difficulty levels, and frequency percentages.
- Result: **Zero hallucination** in study plans regarding problem relevance.

### 4. Technical Integration Details
- **Provider**: Google Gemini (`gemini-1.5-flash` model).
- **Protocol**: REST over HTTPS via NestJS `HttpModule`.
- **Environment**: Configured via `@nestjs/config` for secure API Key management.
- **Safety**: Multi-layer error handling ensures that if the AI fails, the user still receives at least the raw list of top problems.

---

## 🔜 Phase 2: Frontend Dashboard (Next Steps)
With a high-performing backend, the focus shifts to the user interface.

1.  **Framework**: Vite + React + TypeScript.
2.  **State Management**: React Query for API fetching.
3.  **UI/UX**:
    - Dashboard showing "At a Glance" stats.
### 5. Final Verification (End-to-End)
*   **Test Case**: "Uber DSA round scheduled for SDE2 role in 1 week".
*   **Result**: 
    *   AI correctly identified the company and role seniority.
    *   Successfully retrieved Uber's top 15 problems from the DB.
    *   Generated a premium markdown plan including 6-day scheduling, Uber-specific geospatial technical context, and behavioral strategies aligned with Uber's "Execute and Hustle" culture.
    *   **Latency**: Full plan generation completed in ~45s.
    *   **Success**: Zero hallucinations, high architectural relevance for SDE2 level.
