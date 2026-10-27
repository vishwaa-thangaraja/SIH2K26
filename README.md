# Smart India Hackathon 2026 (SIH 2K26) Repository

This repository contains hackathon solutions developed by the team for **Smart India Hackathon 2026**.

---

## 📁 Repository Directory Structure

```text
SIH2K26/
├── 26262/               # Problem Statement 26262: AEGIS — AICTE Governance & Integrated Compliance System [ACTIVE]
│   ├── src/             # React 18 + Vite 5 Interactive Approval Workflow UI (Port 5173)
│   ├── run.bat          # 1-Click Launch Script
│   ├── VIDEO_PRESENTATION_SCRIPT.md     # Official 3.5 Min Voiceover Script & Walkthrough Flow
│   ├── PRESENTATION_AND_VIDEO_SCRIPT.md # 10-Slide Pitch Deck Specification
│   ├── SYSTEM_DESIGN_DESCRIPTION.md     # Production Hexagonal SDD & DDL Schemas
│   └── README.md        # Technical Documentation & Architecture Overview
│
├── aicte-irccip/        # Problem Statement 26264: AICTE Complaint Cases & Grievance Platform
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

## 🚀 Active Project: AICTE AEGIS (`26262`)

**Problem Statement ID:** 26262  
**Project Name:** AEGIS — AICTE Governance & Integrated Compliance System  
**Organization:** All India Council for Technical Education (AICTE)  
**Theme:** Smart Automation  

### Core Highlights
- **Multi-Track APH Workflow Automation**: Dynamic routing across Scrutiny, EVC, and SAC/SHC stages with strict sequential stage gates.
- **Cascading SLA Auto-Escalation**: Tier 1 (Soft Alert) $\to$ Tier 2 (Regional Red) $\to$ Tier 3 (Apex Executive) with automated standby reviewer pool reassignment.
- **EVC Mobile Sentinel**: 3-member panel conflict-of-interest check and 250m GPS geofenced attendance verification.
- **Time-Bound Undertakings Watchdog**: Active countdown clocks for conditional approvals with automated Show-Cause Notice drafting.
- **30-Year Land Lease Sentinel**: Expiry horizon radar with SHA-256 cryptographic document checksum verification.
- **Official Letter of Approval (LoA)**: Statutory printable order with intake quotas and digital QR seal.

### ⚡ Quick Start (1-Click Run)
```bash
cd 26262
run.bat
```
Launches [http://localhost:5173/](http://localhost:5173/) automatically.

---

## 🚀 Active Project: AICTE AEGIS (`aicte-irccip`)

**Problem Statement ID:** 26264  
**Project Name:** AICTE AEGIS — AI-Enabled Governance & Institutional Surveillance  
**Official Focus:** Integrated Dashboard for Monitoring and Tracking Institution-Related Complaint Cases Across AICTE Bureaus/Cells  

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
