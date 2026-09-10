# 🇮🇳 CONTINUUM | Smart India Hackathon 2026 (Problem Statement 26135)
## Autonomous Longitudinal Trainee Outcome Tracking & Skill Identity Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-yellow?style=flat-square&logo=python)](https://python.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLModel-003B57?style=flat-square&logo=sqlite)](https://sqlmodel.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An enterprise-grade, longitudinal livelihood outcome verification system strictly adhering to **Official Indian Government Portal design standards** (Ministry of Skill Development and Entrepreneurship - MSDE). 

CONTINUUM extends the trainee lifecycle far beyond one-time training completion to track multi-year **3M, 6M, 12M, and 24M wage progression**, **employment retention**, **spatial skill-gap deficits**, and **autonomous document provenance verification**.

---

## 🌟 Key Architectural Capabilities & Modules

### 1. Module 1: Enterprise Training Data Intake & Ingestion (`/intake/import`)
- **4-Step Guided Wizard**: File Upload & Parsing -> Structural & Cross-Field Validation -> Issue Review & Auto-Deduplication -> Database Commit.
- **Automated Deduplication Engine**: Duplicate trainee IDs in incoming batch CSVs are identified and reconciled without system interruption.
- **One-Click Demo Loading**: Built-in 100-row synthetic PMKVY/DDUGKY dataset (`CONTINUUM_Module1_Demo_Training_Import.csv`) demonstrating valid passes and live schema error catching.
- **Dynamic Entity Extraction**: Automatically normalizes and persists Trainees, Training Records, Assessment Records, Certification Records, and Skills into SQLite.

### 2. Autonomous OCR Fallback Engine (Tesseract) (`/evidence/[id]/extraction`)
- **Offline Document Extraction**: When employers do not respond to attestations, candidates upload smartphone photos of salary slips or bank credit SMS alerts.
- **Structured Parsing**: Extracts Employer Name, GSTIN (15-character Indian format), Employee Name & ID, and Financial Ledger figures.
- **3-State Mathematical Consistency Equation**:
  - `Verified` (Gross Pay - Total Deductions == Net Pay): Autonomously validates outcome with **86%–94%** confidence when candidate identity matches.
  - `Unverified` (Figures missing/undetected or Bank SMS): Emits an explicit advisory notice without falsely penalizing the candidate with a mismatch or variance badge.
  - `Mismatch` (Discrepant figures detected): Flags genuine calculation errors with red discrepancy alerts.
- **Sample Document Viewer**: Offline sample assets included under `backend/uploads/` for zero 404 image errors.

### 3. Dynamic Skill Identity Graph (DSIG) (`/dsig`)
- **Decoupled Identity**: Decouples platform identity from volatile phone numbers. When phone numbers migrate, temporal transition edges preserve identity continuity across multiple training programs.
- **Interactive Graph**: Interactive React Flow canvas with node inspection, confidence weighting, and candidate switcher.

### 4. Dynamic Corridor Telemetry & Macro Governance (`/intelligence`)
- **Madurai & Kappalur Industrial Corridor Telemetry**: Computes market demand slots, certified supply, and gap ratios (`2.10x`) dynamically from `RegionalSkillGap` and live database trainees.
- **Real-Time Macro KPIs**: Dynamic tracking of total audited candidates, attendance rates, assessment pass rates, and training provider comparisons.

### 5. Spatial Demand & Regional Skill-Gap Map (`/regional-analytics`)
- **Interactive Leaflet GIS Heatmap**: Centered on Madurai & Southern Industrial Corridors.
- **Live Database Synchronization**: Marker radius and certified supply dynamically compute from live database trainees and certifications.
- **Spatial Allocation Directives**: Takeaway cards are generated dynamically from top-deficit districts in SQLite with actionable seat expansion recommendations.

### 6. Dynamic Multi-Attribute Advanced Search (`/advanced-search`)
- **10-Per-Page Interactive Pagination**: Clean pagination controls with total record counts.
- **Live Filter Facets**: Dynamic checkboxes for Sectors, NSQF Levels, and District Clusters derived directly from database records.
- **Direct Candidate Actions**: One-click jumps to Trainee Profile (`/trainees/[id]`), DSIG Graph (`/dsig`), and Wage Progression Timeline (`/trainees/[id]/timeline`).

---

## 📋 System Prerequisites

| Tool | Minimum Version | Download Link | Verification Command |
|---|---|---|---|
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com/downloads) | `git --version` |
| **Python** | 3.10+ (tested up to 3.14) | [python.org](https://www.python.org/downloads/) *(Check "Add Python to PATH")* | `python --version` |
| **Node.js** | 18.18+ or 20.x+ (LTS) | [nodejs.org](https://nodejs.org/) | `node -v` & `npm -v` |

---

## 🚀 Collaborator Setup Guide (Step-by-Step)

### Scenario A: For Collaborators Who Already Have the Repo (Pulling Updates)

If you already cloned the repo previously and just want the latest updates:

1. **Open Command Prompt / PowerShell** in the project folder and pull:
   ```cmd
   git pull origin main
   ```
2. **Double-click `run-dev.bat`** in File Explorer (or run `.\run-dev.bat` in terminal).
3. **Done!** The browser will automatically open at `http://localhost:3000`.

---

### Scenario B: For Collaborators Setting Up for the First Time (Fresh Clone)

If you are setting up the project on a new computer:

1. **Clone the Repository**:
   ```cmd
   git clone https://github.com/vishwaa-thangaraja/SIH2K26.git
   cd SIH2K26
   ```

2. **Install Backend Dependencies**:
   ```cmd
   cd backend
   pip install -r requirements.txt
   cd ..
   ```
   *(Optional: If you prefer using a virtual environment: `python -m venv venv`, `.\venv\Scripts\activate`, then `pip install -r requirements.txt`)*

3. **Launch the Application**:
   Double-click **`run-dev.bat`** (or type `.\run-dev.bat` in terminal).

   > **What `run-dev.bat` automatically handles for you:**
   > - Checks if `frontend/node_modules` exists; if missing, automatically runs `npm install`.
   > - Runs `python seed_data.py` to verify and seed all 13 SQLite database tables.
   > - Starts the FastAPI backend server on `http://localhost:8000`.
   > - Starts the Next.js frontend server on `http://localhost:3000`.
   > - Opens `http://localhost:3000` in your default browser automatically.

---

### Scenario C: For macOS / Linux Users (Manual Launch)

If your teammate is developing on macOS or Linux:

1. **Terminal 1 (Backend)**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python seed_data.py
   python -m uvicorn main:app --reload --port 8000
   ```

2. **Terminal 2 (Frontend)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

---

## 🧪 Instant 3-Second Automated Verification

We have included an end-to-end regression verification script so any collaborator can verify their local setup instantly:

```cmd
python backend/test_e2e_verification.py
```

### What this script verifies:
- **All 13 Database Tables**: Verifies that `Trainee`, `OutcomeEvent`, `EvidenceRecord`, `DSIGNode`, `RegionalSkillGap`, `TrainingRecord`, etc., are properly populated.
- **FastAPI Modular Endpoints**: Tests all 14 core REST endpoints (`/trainees`, `/outcomes`, `/evidence`, `/intelligence`, `/intake`, `/communications`).
- **Autonomous OCR Fallback Engine**: Tests mathematical verification (Gross - Deductions == Net), discrepancy flags, missing number advisory notices, and Bank Credit SMS parsing.

---

## 🗺️ Key Application Routes

| Route | Module | Purpose & Demo Actions |
|---|---|---|
| **`/`** | **Authentication Gateway** | Dual login: Government Official (SSO/2FA/Division) vs. Trainee/Learner. |
| **`/intake/import`** | **Module 1: Intake** | CSV batch upload wizard, live validation, auto-deduplication, and DB commit. |
| **`/advanced-search`** | **Search Workspace** | 10-per-page paginated candidate directory with dynamic facets and direct DSIG links. |
| **`/regional-analytics`** | **Regional Skill Map** | Interactive Leaflet GIS heatmap mapping district skill deficits dynamically from SQLite. |
| **`/intelligence`** | **Macro Intelligence** | Real-time governance KPIs, provider comparison charts, and live corridor telemetry. |
| **`/scorecards`** | **Provider Scorecards** | Outcome-based institutional ranking based on retention stability and wage adequacy. |
| **`/dsig`** | **DSIG Graph Audit** | Interactive React Flow identity graph with multi-candidate switcher. |
| **`/trainees/[id]`** | **Trainee 360 Profile** | Live candidate profile displaying verified wage, employer, and outcome history from SQLite. |
| **`/trainees/[id]/timeline`** | **Trainee Timeline** | Multi-year wage progression curve with candidate switcher and DSIG tracker. |
| **`/evidence/[id]/extraction`**| **Autonomous OCR** | Tesseract extraction viewer with 3-state math verification, GSTIN, and ledger breakdown. |
| **`/evidence/[id]/comparison`**| **Claim Comparison** | Side-by-side comparison between employer claims and candidate evidence. |
| **`/attestation`** | **Employer Attestation** | One-tap digital confirmation portal for employer HR representatives. |
| **`/identity/recovery`** | **Identity Recovery** | Multi-tier ladder resolving SIM/contact migrations via anchor thresholds. |

---

## 🏛️ System Architecture

```
[ Institutional Data / CSV Batch ]
                │
                ▼
   [ Module 1 Ingestion Engine ] ──► Schema Validation & Auto-Deduplication
                │
                ▼
  [ SQLite / SQLModel Database ] (continuum.db <-> initial_seed.json)
    ├── Trainees (95 records, core identity)
    ├── Training Records (95 records: attendance, providers)
    ├── Assessment Records (95 records: scores, results)
    ├── Certification Records (95 records: cert IDs, dates)
    ├── Outcome Events & Evidence Records (11 outcomes, 8 evidence docs)
    ├── Regional Skill Gaps (5 industrial corridors)
    └── DSIG Identity Nodes & Edges (198 nodes, 6 edges)
                │
    ┌───────────┼───────────────────────────┐
    ▼           ▼                           ▼
[ DSIG Graph ] [ Regional GIS Map ] [ Macro Telemetry & OCR ]
(React Flow)   (Leaflet TN Grid)    (FastAPI / Tesseract / Recharts)
```

---

## 👥 Authors & Acknowledgments

- **Hackathon:** Smart India Hackathon (SIH 2026) — Problem Statement 26135
- **Developed for:** Ministry of Skill Development and Entrepreneurship (MSDE), Government of India
- **Repository:** [`https://github.com/vishwaa-thangaraja/SIH2K26`](https://github.com/vishwaa-thangaraja/SIH2K26)
