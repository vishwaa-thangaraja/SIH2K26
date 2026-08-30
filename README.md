# Skill Bridge | SIH 2026 (Problem Statement 26135)
## Longitudinal Trainee Outcome Tracking Platform — UI V2

Production-grade full-stack migration of the 21-screen prototype adhering to Official Indian Government Portal design standards.

---

## 🏛️ Architecture Overview

The system establishes an autonomous lifecycle beyond one-time training certification:

1. **Dynamic Skill Identity Graph (DSIG):** Multi-anchor graph representation (Mobile, e-KYC, Training Record, Employer) that survives trainee contact/location migrations without fragmenting records.
2. **Multi-Source Evidence Intelligence:** Tesseract OCR wrapper + TF-IDF similarity extraction parsing payslips and offer letters into verified machine-readable claims.
3. **Cryptographic Outcome Event Ledger:** Longitudinal 3M, 6M, 12M, and 24M milestones verified through multi-source convergence (Trainee Claim + OCR + Employer Attestation).
4. **Macro Policy & Institutional Intelligence:** Provider outcome scorecards and district-level skill deficit heatmaps closing the feedback loop into subsequent cohort funding allocations.

---

## 🛠️ Technology Stack

### Frontend (`frontend/`)
- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS + Radix UI primitives
- **Graph Visualization:** `@xyflow/react` (React Flow v12) for interactive DSIG identity exploration
- **Data Charts:** `Recharts` for 3M–24M wage trends and provider benchmarks
- **Geographic Visualizations:** `react-leaflet` / `leaflet` for district skill-gap heatmaps
- **Icons & Typography:** `lucide-react` & Inter (Google Font)

### Backend (`backend/`)
- **Framework:** Python 3.11+ with FastAPI & SQLModel / SQLite
- **AI/ML Matching:** RapidFuzz + Jaro-Winkler for probabilistic multi-anchor recovery
- **OCR Extraction Wrapper:** Tesseract / regular expression entity normalizers
- **Integration Layer:** Abstracted mock connectors for:
  - e-Shram UAN
  - Udyam Registration
  - National Apprenticeship Promotion Scheme (NAPS)
  - GSTN Portal
  - DigiLocker Sandbox
  - Employer One-Tap Attestation Network (WhatsApp / SMS triggers)

---

## 🚀 Quick Start Instructions

### Option 1: Automatic One-Click Launch (Windows)
Double-click `run-dev.bat` in the `UI V2` directory. This will start both the FastAPI backend and the Next.js frontend in separate PowerShell windows.

---

### Option 2: Manual Step-by-Step Setup

#### 1. Start the Backend (FastAPI)
```powershell
cd "D:\Documents\SEM V\SIH 2026\UI V2\backend"

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the SQLite database with Ravi Kumar (T001) demo data
python seed_data.py

# Run the backend server
uvicorn main:app --reload --port 8000
```
- **API URL:** `http://localhost:8000`
- **Swagger Documentation:** `http://localhost:8000/docs`

#### 2. Start the Frontend (Next.js)
```powershell
cd "D:\Documents\SEM V\SIH 2026\UI V2\frontend"

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
- **Web App URL:** `http://localhost:3000`

---

## 🗺️ Route Sitemap & V1 Screen Mapping

| V1 Screen | V2 Next.js Route | Feature Description |
|---|---|---|
| `index.html` | `/` | Login & Demo Entry Portal |
| `trainee_dashboard` | `/dashboard` | Trainee Overview, Active Anchors & Stepper |
| `dsig_identity_graph` | `/dsig` | Interactive React Flow DSIG Graph Canvas |
| `longitudinal_timeline` | `/trainees/T001/timeline` | 3M, 6M, 12M, 24M Wage Progression Chart |
| `outcome_event_ledger` | `/outcomes` | Cryptographic Outcome Chain Ledger |
| `new_employment_event` | `/outcomes/new` | Multi-Step Employment Event Form + AI Classifier |
| `evidence_upload` | `/evidence/upload` | Document Ingestion Dropzone |
| `evidence_extraction` | `/evidence/DOC001/extraction` | Split-Panel OCR Entity Normalizer |
| `claim_evidence_comparison` | `/evidence/DOC001/comparison` | Attribute Alignment & Consistency Matrix |
| `confidence_updated` | `/evidence/DOC001/confidence` | Trust Score Calibration Breakdown |
| `employer_attestation` | `/attestation` | One-Tap HR Confirmation Portal |
| `identity_match_assessment` | `/identity/match` | Probabilistic AI Identity Match (94% Score) |
| `identity_recovery` | `/identity/recovery` | Initial Access Assessment |
| `trusted_anchor` | `/identity/recovery/anchors` | Secondary Anchor Selection (DigiLocker, Email) |
| `recovery_ladder` | `/identity/recovery/ladder` | Multi-Tier Verification Protocol |
| `recovery_approved` | `/identity/recovery/success` | DSIG State Transition Approval |
| `update_identity` | `/identity/update` | Identity Lifecycle & Anchor Management Hub |
| `select_phone_change` | `/identity/update/phone` | Phone Anchor Migration Simulation |
| `outcome_intelligence` | `/intelligence` | Macro Governance & Provider Benchmark Charts |
| `policy_insight` | `/intelligence/policy` | Autonomous Policy Intervention Feed |
| `provider_scorecards` | `/scorecards` | 6M Retention & Wage Adequacy Rankings |
| `regional_skill_map` | `/regional-analytics` | District-Wise Supply vs Demand Leaflet Heatmap |
