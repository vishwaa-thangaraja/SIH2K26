# Smart India Hackathon 2026 (SIH 2K26) Repository

This repository contains hackathon solutions developed by the team for **Smart India Hackathon 2026**.

---

## 📁 Repository Directory Structure

```text
SIH2K26/
├── aicte-irccip/        # AICTE Regulatory Case Coordination & Monitoring Platform [ACTIVE]
│   ├── backend/         # FastAPI REST API & Core Intelligence Services (Port 8000)
│   ├── frontend/        # React + Vite Interactive Dashboard UI (Port 3000)
│   ├── ml/              # Standalone CaseLink ML Training & Evaluation Pipelines
│   ├── docs/            # Technical Architecture, SRS & Solution Specifications
│   ├── schema.sql       # 3NF PostgreSQL Relational Schema (55 tables/views/triggers)
│   ├── tests.sql        # Automated SQL Verification Test Suites (T1-T10)
│   └── README.md        # Detailed Documentation & Setup Instructions
│
└── continuum/           # Continuum Project
    ├── backend/         # FastAPI Backend & Integration Connectors
    ├── frontend/        # Next.js Application
    ├── ML/              # Machine Learning Models & Skill Gap Analysis
    └── README.md        # Continuum Documentation
```

---

## 🚀 Active Project: AICTE Case Coordination & Regulatory Intelligence Platform (`aicte-irccip`)

**Problem Statement ID:** 26264  
**Title:** Integrated Regulatory Case Coordination & Monitoring Platform (IRCCIP)  

### Core Highlights
- **Case Passport**: Interactive Case Dossier & Complete Event Audit Trail.
- **Contradiction Sentinel**: Cross-bureau conflict detection halting unilateral case closures.
- **Air-Gapped Blind Handshake**: Salted HMAC-SHA256 duplicate detection safeguarding whistleblower confidentiality.
- **4-Tier Cascaded Entity Resolution**: Normalizes and matches institutions across disparate registries (Exact PID $\to$ Geo Blocking $\to$ RapidFuzz $\to$ Jaro-Winkler).
- **Bitemporal "As-Of" Time Travel**: Historical snapshot reconstruction of case states as of any past calendar date.

### ⚡ Quick Start Guide (Zero-Effort 1-Click Launch)

#### Option A: Windows 1-Click (Recommended for Evaluators & ZIP Downloads)
Just double-click:
👉 **`1_CLICK_RUN_ALL.bat`** (at the root of this repository)

*It automatically sets up Python `venv`, installs `requirements.txt`, runs `npm install`, starts Backend (port 8000) and Frontend (port 3000), and auto-launches your browser at `http://localhost:3000`!*

---

#### Option B: Manual Terminal Execution

##### 1. Backend Setup
```bash
cd aicte-irccip/backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python run.py
```
* API Server: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

##### 2. Frontend Setup
```bash
cd aicte-irccip/frontend
npm install
npm run dev
```
* Web Dashboard: [http://localhost:3000](http://localhost:3000)

---

## 📦 Archived Project: Continuum (`continuum`)

See [continuum/README.md](continuum/README.md) for full instructions and architecture details for the Continuum application.
