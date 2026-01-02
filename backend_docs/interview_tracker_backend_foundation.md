# Interview Tracker – Backend Foundation (Problem & Resource System)

This document defines the **foundational backend design** for an Interview Tracker system.
The goal of this phase is to build a **strong, searchable, AI-ready knowledge base**
before introducing interview events, AI planning, or web intelligence.

This file is intended to be:
- Downloadable
- Repo-ready
- Implementation-oriented
- Free / open-source friendly

---

## 1. Design Goals

1. Create structured problem & resource datasets for:
   - DSA
   - LLD
   - HLD
   - Behavioral
2. Ensure everything is **tag-driven** and **searchable**
3. Keep the system AI-ready (tags, metadata, clean schema)
4. Avoid premature AI or web scraping
5. Use only free / open-source components

---

## 2. Recommended Backend Stack (Free & Proven)

### Backend
- **Node.js + NestJS (TypeScript)**
  - Unified language stack (TS on Front & Back)
  - Strong architectural patterns (Controllers, Services, DI) matches Spring Boot philosophy
  - Excellent support for AI/Web libraries (LangChain.js, Puppeteer)

### Database
- **PostgreSQL**
  - Free & open source
  - JSONB support
  - Full-text search
  - Excellent indexing

### Cache
- **Redis**
  - Used later for search & AI decision caching

### Deployment
- Local Docker
- Fly.io / Railway free tier
- AWS EC2 t3.micro (free-tier eligible)

---

## 3. Phase-wise Implementation Plan

### Phase 0 — Knowledge Foundation (Current Phase)
- Problem & resource schema
- Tagging system
- **Ingestion Engine**:
  - LeetCode GraphQL Integration (DSA + Tags)
  - Seed File Loader (HLD/LLD)
- CRUD APIs
- Search APIs

### Phase 1 — Interview Events (Later)
- Interview event entity
- Tag-based querying of problem sets

### Phase 2 — AI Integration (Later)
- AI planners
- AI ranking
- AI enrichment & summaries

---

## 4. Core Shared Concepts

### 4.1 Tags

Tags are the backbone of search and future AI reasoning.

```sql
tags (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  category TEXT,      -- topic, pattern, difficulty, system, company
  created_at TIMESTAMP
);
```

Examples:
- topic: arrays, trees, dp
- pattern: sliding-window, two-pointers
- system: caching, sharding
- difficulty: easy, medium, hard

---

### 4.2 Resource Links

Reusable references attached to problems.

```sql
resource_links (
  id UUID PRIMARY KEY,
  title TEXT,
  url TEXT,
  type TEXT,        -- blog, video, repo, article
  source TEXT,      -- youtube, leetcode, github
  created_at TIMESTAMP
);
```

---

## 5. DSA Problem Model

### Table

```sql
dsa_problems (
  id UUID PRIMARY KEY,
  title TEXT,
  platform TEXT,                -- leetcode, gfg, codeforces
  platform_problem_id TEXT,
  difficulty TEXT,              -- easy, medium, hard
  description TEXT,
  url TEXT,
  created_at TIMESTAMP
);
```

### Mapping Tables

```sql
dsa_problem_tags (
  problem_id UUID REFERENCES dsa_problems(id),
  tag_id UUID REFERENCES tags(id)
);

dsa_problem_resources (
  problem_id UUID REFERENCES dsa_problems(id),
  resource_id UUID REFERENCES resource_links(id)
);
```

---

## 6. LLD Problem Model

### Table

```sql
lld_problems (
  id UUID PRIMARY KEY,
  title TEXT,                   -- Design Parking Lot
  domain TEXT,                  -- ecommerce, infra, payments
  difficulty TEXT,
  expected_time_minutes INT,
  description TEXT,
  created_at TIMESTAMP
);
```

### Mapping Tables

```sql
lld_problem_tags (
  problem_id UUID REFERENCES lld_problems(id),
  tag_id UUID REFERENCES tags(id)
);

lld_problem_resources (
  problem_id UUID REFERENCES lld_problems(id),
  resource_id UUID REFERENCES resource_links(id)
);
```

Common tags:
- oops
- solid
- extensibility
- concurrency

---

## 7. HLD Problem Model

### Table

```sql
hld_problems (
  id UUID PRIMARY KEY,
  title TEXT,                   -- Design URL Shortener
  scale TEXT,                   -- small, medium, internet-scale
  domain TEXT,                  -- social, payments, infra
  description TEXT,
  created_at TIMESTAMP
);
```

### Mapping Tables

```sql
hld_problem_tags (
  problem_id UUID REFERENCES hld_problems(id),
  tag_id UUID REFERENCES tags(id)
);

hld_problem_resources (
  problem_id UUID REFERENCES hld_problems(id),
  resource_id UUID REFERENCES resource_links(id)
);
```

Common tags:
- caching
- sharding
- consistency
- queues
- rate-limiting

---

## 8. Behavioral Resources Model

### Table

```sql
behavioral_resources (
  id UUID PRIMARY KEY,
  title TEXT,                -- Tell me about a conflict
  competency TEXT,           -- leadership, ownership
  framework TEXT,            -- STAR
  description TEXT,
  created_at TIMESTAMP
);
```

### Mapping Table

```sql
behavioral_resource_tags (
  resource_id UUID REFERENCES behavioral_resources(id),
  tag_id UUID REFERENCES tags(id)
);
```

---

## 9. Search API Design (Critical)

### Generic Search Endpoint

```
GET /search
```

### Query Parameters

- type: dsa | lld | hld | behavioral
- tags: comma-separated
- difficulty (optional)
- limit (default 20)

### Example

```
GET /search?type=dsa&tags=arrays,sliding-window&difficulty=medium
```

### Backend Behavior
- Join problem tables with tag mappings
- Rank by tag overlap
- Return structured results

---

## 10. Indexing Strategy

Indexes are mandatory for performance.

```sql
CREATE INDEX idx_dsa_problem_tags ON dsa_problem_tags(tag_id);
CREATE INDEX idx_lld_problem_tags ON lld_problem_tags(tag_id);
CREATE INDEX idx_hld_problem_tags ON hld_problem_tags(tag_id);
CREATE INDEX idx_behavioral_tags ON behavioral_resource_tags(tag_id);
```

---

## 11. API Summary

### CRUD APIs

```
POST   /dsa/problems
GET    /dsa/problems/{id}
PUT    /dsa/problems/{id}
DELETE /dsa/problems/{id}
```

(Similar for LLD, HLD, Behavioral)

### Tags

```
POST /tags
GET  /tags
```

### Search

```
GET /search
```

---

## 12. Why This Foundation Works

- Search quality depends on schema, not AI
- Tags become the language AI will speak later
- Problems and resources stay deterministic
- AI later becomes a planner and ranker, not a generator

This foundation prevents noisy prep, hallucinations, and weak recommendations.

---

## 13. Next Steps

1. Implement schema in PostgreSQL
2. Build Spring Boot entities & repositories
3. Implement CRUD APIs
4. Implement tag-based search
5. Seed initial data manually

Only after this → Interview Events → AI → Web Intelligence
