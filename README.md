# 🇮🇳 Skill Bridge | SIH 2026 (Problem Statement 26135)
## Autonomous Longitudinal Trainee Outcome Tracking Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An enterprise-grade, longitudinal livelihood outcome verification system strictly following **Official Indian Government Portal design standards**. Extends the trainee lifecycle beyond certification to track multi-year 3M, 6M, 12M, and 24M wage, retention, and spatial skill-gap metrics.

---

## 📋 System Prerequisites (Install Before Cloning)

Before pulling and running the project, ensure your machine has the following tools installed:

| Prerequisite | Minimum Version | Download Link | Verification Command |
|---|---|---|---|
| **Git** | `2.x+` | [git-scm.com](https://git-scm.com/downloads) | `git --version` |
| **Node.js** | `18.18.0+` or `20.x+` | [nodejs.org](https://nodejs.org/) (LTS recommended) | `node -v` & `npm -v` |
| **Python** | `3.10+` (supports up to `3.14+`) | [python.org](https://www.python.org/downloads/) | `python --version` |

> ⚠️ **Windows Note during Python installation:** Check the box **"Add Python to PATH"** in the installer.

---

## 🚀 Step-by-Step Installation & Setup Guide

### 1. Clone the Repository
Open your terminal (PowerShell, Command Prompt, or Git Bash) and run:
```bash
git clone https://github.com/vishwaa-thangaraja/SIH2K26.git
cd SIH2K26
```

---

### Option A: One-Click Development Launch (Windows)
If you are on Windows, simply double-click the included batch script:
```cmd
run-dev.bat
```
* **What it does:** Installs backend dependencies, seeds the database, starts FastAPI on `http://localhost:8000`, starts Next.js on `http://localhost:3000`, and **automatically opens your web browser**.

---

### Option B: Manual Setup (Cross-Platform)

#### 2. Backend Setup (FastAPI)
Open a new terminal window in the project root:

```bash
# Navigate to backend directory
cd backend

# (Optional but recommended) Create virtual environment
python -m venv venv

# Activate virtual environment:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt
# (or: python -m pip install -r requirements.txt)

# Seed the SQLite database with demo data (Trainee T001: Ravi Kumar)
python seed_data.py

# Start the FastAPI backend server
python -m uvicorn main:app --reload --port 8000
```
- **Backend API URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`

---

#### 3. Frontend Setup (Next.js)
Open a **second terminal window** in the project root:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
- **Web Application Portal:** `http://localhost:3000`

---

## 🗺️ Key Application Routes & Navigation

| Route | Page Name | Key Features |
|---|---|---|
| **`/`** | **Portal Entry** | Role-based switcher (Trainee View vs. Policy Analyst View). |
| **`/dashboard`** | **Trainee Overview** | Active identity status, 3M–24M milestone stepper, recent activity log. |
| **`/dsig`** | **DSIG Identity Graph** | Interactive **React Flow** canvas showing core identity, active & historical anchors, and temporal transitions. |
| **`/trainees/T001/timeline`** | **Longitudinal Timeline** | **Recharts** area chart showing 33.3% wage progression (₹15k ➔ ₹20k). |
| **`/outcomes`** | **Outcome Event Ledger** | Cryptographic outcome ledger with expandable provenance audit inspector. |
| **`/outcomes/new`** | **Register Outcome** | 3-step employment logger with AI trade relevance classifier. |
| **`/evidence/upload`** | **Evidence Ingestion** | Drag-and-drop zone for salary payslips, offer letters, and NAPS contracts. |
| **`/evidence/DOC001/extraction`** | **AI OCR Extraction** | Split-panel OCR normalizer extracting Employer, Role, Date, and Wage. |
| **`/evidence/DOC001/comparison`** | **Claim vs. Evidence** | Field-by-field alignment matrix (Exact Match vs. Deviation). |
| **`/evidence/DOC001/confidence`** | **Trust Calibration** | 0.86 confidence score breakdown across convergent data sources. |
| **`/attestation`** | **Employer Portal** | One-tap digital HR confirmation / dispute action screen. |
| **`/identity/match`** | **Identity Match** | RapidFuzz + Jaro-Winkler probabilistic matching score (94% confidence). |
| **`/identity/update`** | **Identity Hub** | Multi-anchor lifecycle management & historical anchor audit table. |
| **`/identity/recovery`** | **Recovery Ladder** | Multi-tier escalation path resolving SIM/phone changes safely. |
| **`/intelligence`** | **Macro Intelligence** | Multi-provider 3M/6M/12M placement retention charts. |
| **`/intelligence/policy`** | **Policy Interventions** | Autonomous funding and seat allocation directives. |
| **`/scorecards`** | **Provider Scorecards** | 6-month retention and wage adequacy accountability rankings. |
| **`/regional-analytics`** | **Skill-Gap Map** | **Leaflet** interactive geographic heatmap centered on **Madurai & Southern Corridor**. |

---

## 🏛️ Core Architectural Pillars

1. **Dynamic Skill Identity Graph (DSIG):**
   Decouples platform identity from fragile static phone numbers. When trainee contacts migrate, a temporal transition edge is added while core identity `T001` remains continuous.

2. **Multi-Source Evidence Intelligence:**
   Converts unstructured payslip PDFs into structured data via OCR field normalizers and cross-checks them against self-reported claims.

3. **Employer One-Tap Attestation:**
   Provides authorized HR representatives with zero-friction verification links to confirm employment and wage parameters.

4. **Closed-Loop Policy Intelligence:**
   Rolls up 3M–24M verified livelihood outcomes into district-level skill deficit heatmaps to dynamically adjust subsidized training seats.

---

## 🛠️ Troubleshooting & FAQ

* **Q: `npm install` shows peer dependency errors?**  
  *A:* Make sure you are using Node.js 18 or 20 LTS. If on a custom npm version, run `npm install --legacy-peer-deps`.

* **Q: Port 3000 or 8000 is already in use?**  
  *A:* Stop existing instances or specify custom ports:
  - Frontend: `npm run dev -- -p 3001`
  - Backend: `python -m uvicorn main:app --port 8001`

* **Q: Map shows gray tiles?**  
  *A:* Ensure an active internet connection is available on first load so OpenStreetMap tiles can cache locally.

---

## 👥 Authors & Acknowledgments

- **Team:** Smart India Hackathon (SIH 2026) — Problem Statement 26135
- **Developed for:** Ministry of Skill Development and Entrepreneurship (MSDE), Government of India
