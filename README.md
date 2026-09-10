# 🇮🇳 CONTINUUM | SIH 2026 (Problem Statement 26135)
## Autonomous Longitudinal Trainee Outcome Tracking & Skill Identity Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLModel-003B57?style=flat-square&logo=sqlite)](https://sqlmodel.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An enterprise-grade, longitudinal livelihood outcome verification system strictly adhering to **Official Indian Government Portal design standards** (Ministry of Skill Development and Entrepreneurship - MSDE). CONTINUUM extends the trainee lifecycle far beyond training certification to track multi-year 3M, 6M, 12M, and 24M wage progression, job retention, and spatial skill-gap metrics.

---

## 🌟 Key Functional Innovations & Capabilities

### 1. Module 1: Enterprise Training Data Intake & Ingestion (/intake/import)
- **4-Step Guided Wizard**: File Upload & Parsing -> Structural & Cross-Field Validation -> Issue Review & Auto-Deduplication -> Database Commit.
- **Auto-Deduplication Engine**: Duplicate trainee IDs in incoming batch CSVs are automatically detected and dropped without requiring admin friction, displaying a clear count of duplicates resolved.
- **One-Click Demo Loading**: Built-in 100-row synthetic PMKVY/DDUGKY dataset (CONTINUUM_Module1_Demo_Training_Import.csv) testing valid passes and real-time schema error catching.
- **Dynamic Entity Extraction**: Automatically persists Trainees, Training Records, Assessment Records, Certification Records, and Skills into SQLite.

### 2. Version-Controlled Persistence & Automatic 1-Time Seeding
- **Zero Data Loss for Collaborators**: The active database is captured in ackend/initial_seed.json (95 Trainees, 95 Training Records, 95 Assessments, 95 Certifications, 380 Skills).
- **Auto-Initialization**: When a collaborator pulls or clones this repository, ackend/seed_data.py auto-populates continuum.db **only if the database is empty**. If the database already exists, it is left completely untouched to safeguard all live records.

### 3. Dynamic Multi-Attribute Advanced Search (/advanced-search)
- **10-Per-Page Interactive Pagination**: Smooth pagination (Showing 1–10 of X), Previous/Next controls, and direct page jumping.
- **Live Filter Facets**: Checkbox facets for Sector & Trade, NSQF Level, and District/Cluster are dynamically computed from the effective dataset rather than hardcoded.
- **Universal DSIG Tracker & Candidate Timeline Integration**: Every row features dedicated action buttons to launch that candidate's **DSIG Tracker** (/dsig?trainee_id=...) and **Longitudinal Timeline** (/trainees/.../timeline).

### 4. Dynamic Skill Identity Graph (DSIG) (/dsig)
- **Decoupled Identity**: Decouples platform identity from volatile phone numbers. When phone numbers migrate, temporal transition edges preserve identity continuity.
- **Live Candidate Switcher**: Switch between any trainee in the database via the header selector to inspect their interactive React Flow identity graph and anchor weights.

### 5. Live Spatial Demand & Regional Skill-Gap Map (/regional-analytics)
- **Leaflet GIS Map**: Geographic visualization centered on **Madurai & Kappalur Industrial Corridor** and South India clusters.
- **Dynamic Supply Sync**: Marker radius and certified graduate supply dynamically compute from live database trainees, updating hotspot deficit ratios in real-time.

### 6. Macro Governance Intelligence & Provider Scorecards
- **Macro Intelligence (/intelligence)**: Real-time aggregated KPIs (Audited Candidates, Avg Assessment Score, Attendance Rate, Pass Rate), Provider Placement comparison bar charts, and Kappalur deficit gauges.
- **Provider Scorecards (/scorecards)**: Shifts institutional evaluation from attendance compliance to 6M–12M livelihood retention stability and wage adequacy.

---

## 📋 System Prerequisites

| Prerequisite | Minimum Version | Download Link | Verification Command |
|---|---|---|---|
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com/downloads) | git --version |
| **Node.js** | 18.18.0+ or 20.x+ | [nodejs.org](https://nodejs.org/) (LTS recommended) | 
ode -v & 
pm -v |
| **Python** | 3.10+ (tested up to 3.14+) | [python.org](https://www.python.org/downloads/) | python --version |

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
`
git clone https://github.com/vishwaa-thangaraja/SIH2K26.git
cd SIH2K26
`

### Option A: One-Click Development Launch (Windows)
Double-click the included batch script in the root directory:
`cmd
run-dev.bat
`
* **What it does:** Installs backend dependencies, auto-initializes the database if empty, launches FastAPI on http://localhost:8000, launches Next.js on http://localhost:3000, and opens your web browser.

---

### Option B: Manual Setup

#### 2. Backend Setup (FastAPI)
`ash
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Auto-seed the database (auto-populates from initial_seed.json if empty)
python seed_data.py

# Start FastAPI backend
python -m uvicorn main:app --reload --port 8000
`
- **Backend API:** http://localhost:8000
- **Interactive Swagger Docs:** http://localhost:8000/docs

#### 3. Frontend Setup (Next.js)
In a second terminal window:
`ash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
`
- **Web Portal:** http://localhost:3000

---

## 🗺️ Key Application Routes

| Route | Portal / Module | Description |
|---|---|---|
| **/** | **Authentication Gateway** | Dual-tab login: Government Official (SSO/2FA/Division) vs. Trainee/Learner. |
| **/intake/import** | **Module 1: Intake** | CSV batch upload wizard, live data validation, auto-deduplication, and DB commit. |
| **/advanced-search** | **Search Workspace** | 10-per-page paginated candidate directory with dynamic facets and DSIG links. |
| **/regional-analytics** | **Regional Skill Map** | Interactive Leaflet heatmap of district skill deficits and dynamic supply. |
| **/intelligence** | **Macro Intelligence** | Real-time governance KPIs, provider comparison charts, and policy triggers. |
| **/intelligence/policy** | **Policy Directives** | Human-in-the-loop autonomous funding and seat allocation directives. |
| **/scorecards** | **Provider Scorecards** | Outcome-based accountability rankings for accredited training centers. |
| **/dsig** | **DSIG Graph Audit** | Interactive React Flow identity graph with multi-candidate selector. |
| **/trainees/[id]/timeline** | **Trainee Timeline** | Multi-year wage progression curve, candidate switcher, and DSIG tracker. |
| **/trainees/[id]** | **Trainee 360 Profile** | Live candidate profile, institutional credentials, and active anchors. |
| **/outcomes** | **Outcome Ledger** | Cryptographic outcome ledger with employer verification status. |
| **/attestation** | **Employer Attestation** | One-tap employer HR digital confirmation portal. |
| **/identity/recovery** | **Identity Recovery** | Multi-tier ladder resolving SIM/contact migrations via anchor thresholds. |

---

## 🏛️ System Architecture

`
[ Institutional Data / CSV Batch ]
                │
                ▼
   [ Module 1 Ingestion Engine ] ──► Schema Validation & Auto-Deduplication
                │
                ▼
  [ SQLite / SQLModel Database ] (continuum.db <-> initial_seed.json)
    ├── Trainees (Core Identity)
    ├── Training Records (Batches, Attendance, Providers)
    ├── Assessment Records (Scores, Results)
    ├── Certification Records (Cert IDs, Dates)
    └── Trainee Skills & Batch Logs
                │
    ┌───────────┼───────────────────────┐
    ▼           ▼                       ▼
[ DSIG Graph ] [ Regional GIS Map ] [ Macro KPIs & Scorecards ]
(React Flow)   (Leaflet TN Grid)    (Recharts & Policy Loop)
`

---

## 👥 Authors & Acknowledgments

- **Hackathon:** Smart India Hackathon (SIH 2026) — Problem Statement 26135
- **Developed for:** Ministry of Skill Development and Entrepreneurship (MSDE), Government of India
