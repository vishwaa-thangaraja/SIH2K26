# CONTINUUM: EXHAUSTIVE SYSTEM SPECIFICATION & ARCHITECTURAL GROUND TRUTH
## Complete Reference for SIH 2026 (Problem Statement 26135 - MSDE, Government of India)

---

### 1. IDENTITY & PROBLEM STATEMENT
- **Project Name**: CONTINUUM (National Longitudinal Outcome Audit & Autonomous Skill Identity System)
- **Authority**: Ministry of Skill Development and Entrepreneurship (MSDE), Government of India
- **Problem Statement (SIH 2026)**: PS 26135
- **Core Premise**: Indian vocational skilling currently loses tracking of trainees upon certification. CONTINUUM bridges the 3M–24M gap by:
  1. Decoupling identity from volatile phone numbers via a Dynamic Skill Identity Graph (DSIG).
  2. Ingesting & auto-deduplicating institutional training data (Module 1).
  3. Verifying multi-source employment evidence (Payslip OCR, Employer HR Attestation, EPFO UAN, DigiLocker).
  4. Feeding real-time spatial skill-gap analytics and closed-loop policy directives back into state training quotas.
- **Design System**: Strict Official Indian Government Portal Design Standards (Gov Navy `#0B2545`, Ashoka Lion Emblem 🇮🇳, dual-portal persona views, zero generic SaaS styling).

---

### 2. FULL TECH STACK & CONFIGURATION
- **Frontend**: Next.js 15.5 App Router, React 18/19, TypeScript 5.x, Tailwind CSS 3.4.
- **Visual Engines**:
  - `@xyflow/react` (React Flow) for interactive graph rendering.
  - `Recharts` for fluid wage curves, provider comparison bar charts, and deficit gauges.
  - `Leaflet` + `OpenStreetMap` for GIS district deficit mapping.
- **Backend**: FastAPI (Python 3.10+), Uvicorn server on port 8000.
- **Database & Persistence**:
  - SQLite with WAL mode enabled (`backend/continuum.db`).
  - ORM: SQLModel (SQLAlchemy 2.0 core + Pydantic v2).
  - Version-Controlled Portable Seed: `backend/initial_seed.json` (95 Trainees, 95 Training Records, 95 Assessments, 95 Certifications, 380 Skills, Batch Logs).
  - Auto-Initializer: `backend/seed_data.py` auto-seeds if DB is empty; never overwrites existing data.

---

### 3. COMPLETE DATABASE SCHEMA & RELATIONS
1. **Trainee** (`trainee_id` PK): Core identity storing name, gender, DOB, email, phone, district, state, program, provider, enrollment_date, completion_date, status.
2. **TrainingRecord** (`record_id` PK): Maps `trainee_id`, batch_id, training_provider, training_centre, course, sector, attendance_percentage, training_status, start/end dates.
3. **AssessmentRecord** (`assessment_id` PK): Maps `trainee_id`, training_record_id, course, assessment_score (0-100), assessment_result (Pass/Fail), agency, assessment_date.
4. **CertificationRecord** (`certification_id` PK): Maps `trainee_id`, training_record_id, course, certification_status (Certified/Pending), certification_date.
5. **TraineeSkill** (`id` PK): Normalized table mapping `trainee_id`, skill_name, source, acquired_date.
6. **ImportBatchLog** (`batch_id` PK): Tracks CSV filename, total_rows, valid_rows, imported_rows, skipped_rows, duplicate_count, timestamp.
7. **DSIGNode** (`node_id` PK): Stores trainee_id, node_type (`identity` | `phone` | `email` | `training` | `employer`), label, value, is_active (bool), valid_from, confidence (0.0-1.0), verification_method.
8. **DSIGEdge** (`edge_id` PK): Stores trainee_id, source_node_id, target_node_id, edge_type (`identity_link` | `certification` | `credential` | `employment` | `temporal_migration`), label, valid_from, confidence.
9. **OutcomeEvent** (`event_id` PK): Livelihood milestones (3M, 6M, 12M, 24M), employer_name, role, wage_monthly, verification_status, confidence_score.

---

### 4. DUAL-PORTAL AUTHENTICATION & HEADER BEHAVIOR (Route: `/`)
Handled by `RoleContext` (`frontend/src/contexts/RoleContext.tsx`):
- **Government Official Portal** (`role: 'analyst'`):
  - Access: Macro Intelligence, Intake Import, Advanced Filter Search, Policy Directives, Provider Scorecards, Regional Skill Map, Trainee Audit Records, DSIG Graph Audit.
  - Header: `#0B2545` Gov Navy bar with Ashoka Lion Emblem, `MINISTRY OF SKILL DEVELOPMENT & ENTREPRENEURSHIP`, `OFFICER VIEW` gold badge, Officer ID card.
  - Header Search: Regex `^T\d+$` (e.g. `T001`) jumps to `/trainees/{id}/timeline`. Any other text jumps to `/advanced-search?q={query}`.
- **Trainee / Learner Portal** (`role: 'trainee'`):
  - Access: Dashboard, My 360 Profile, Identity Graph (DSIG), Manage Identity, Identity Recovery, Outcome Ledger, Register Outcome, Upload Evidence, Employer Attestation.
  - Header: Skill India Digital Workforce Portal, `LEARNER PORTAL` blue badge, Ravi Kumar profile card, quick logout.

---

### 5. EXHAUSTIVE SPECIFICATION OF ALL 23 ROUTES

#### Module 1: Enterprise Training Intake Wizard (`/intake/import`)
- 4-Step Guided Wizard:
  1. Upload CSV or click "Load Synthetic Demo CSV (100 Rows)".
  2. Live schema & cross-field validation (validates mandatory fields, ISO/Commonwealth date formats, 0-100 attendance & score ranges, completion logic).
  3. Duplicate Dropping & Review: Auto-detects duplicates against existing SQLite database records AND repeated IDs within the file; flags duplicates as `is_duplicate_dropped: True` and displays an auto-drop counter badge.
  4. Database Commit: Normalizes rows into `Trainee`, `TrainingRecord`, `AssessmentRecord`, `CertificationRecord`, `TraineeSkill`, and `ImportBatchLog`.

#### Advanced Multi-Attribute Search Workspace (`/advanced-search`)
- 10-Item Interactive Pagination (`PAGE_SIZE = 10`): Dynamic range indicator ("Showing 1–10 of X candidates"), Previous/Next controls, numbered page buttons.
- Dynamic Filter Facets: Checkboxes for Sector & Trade, NSQF Level, and District/Cluster are dynamically computed from `effectiveDataset` via `dynamicFilterFacets`.
- Wage Range Slider: Range ₹10,000 to ₹45,000 with quick presets (<₹15k, ₹15k–25k, >₹25k).
- Milestone Progress Checkboxes: Training, 3M, 6M, 12M, 24M.
- Candidate Row Actions:
  - "DSIG Tracker": Routes to `/dsig?trainee_id={id}`.
  - "Timeline": Routes to `/trainees/{id}/timeline`.

#### Dynamic Skill Identity Graph (DSIG) (`/dsig`)
- Interactive React Flow canvas with custom nodes (`CustomDSIGNode`).
- Node Types & Icons: Core Identity (dark circular badge), Phone (emerald/slate phone), Email (sky mail), Training (indigo graduation cap), Employer (amber building).
- State: Active (green border/pulse) vs Historical (dashed border/grey).
- Live Multi-Candidate Dropdown: Populated from `GET /trainees`.
- Real-Time Backend Synthesis: `GET /trainees/{id}/dsig` synthesizes nodes and directional edges dynamically if missing.
- Node Inspector: Clicking any node opens verification metadata, confidence score, and verification method.
- Evolution Chronology: 4-phase audit cards (Oct 2021 Registration, Sep 2023 Phone Migration, Oct 2023 Employer Attached, Active Integrity).

#### Longitudinal Trainee Timeline (`/trainees/[id]/timeline`)
- Live Trainee Dropdown: Switches between any candidate in the database.
- Wage Progression Area Chart (Recharts): Plots training exit (₹0) -> 3M (75%) -> 6M (90%) -> 12M (100% wage) with gradient fill.
- Milestone Cards: 5 chronological cards (Training Exit, 3M Employment, 6M Retention, 12M Wage Review, 24M Career Maturity) with status badges (Completed, Current, Unknown).
- DSIG Tracker Button: Jump directly to candidate's identity graph.

#### Trainee 360° Profile (`/trainees/[id]`)
- Server-side rendered profile fetching `GET /trainees/{id}`.
- Displays candidate initials, NSQF level, district, phone, email, training provider, enrollment/completion dates, active employment card (₹18,000/mo, ABC Manufacturing).
- Direct buttons to DSIG Graph (`/dsig?trainee_id={id}`) and Longitudinal Timeline.

#### Macro Governance Intelligence (`/intelligence`)
- 4 Live KPI Cards: Audited Candidates (with % Provenance Trust), Avg Assessment Score (with Pass Rate %), Avg Attendance Rate (with Certified Cohort count), Regional Clusters count.
- Longitudinal Wage Curve: Fluid Area Chart tracking wage trajectories from Enrollment to 24M.
- Provider Placement Bar Chart: Multi-provider comparison (3M, 6M, 12M) populated dynamically from SQLite `TrainingRecord`.
- Madurai & Kappalur Deficit Gauge: Market demand slots vs certified supply count vs gap ratio.

#### Policy Directive & Recommendation Engine (`/intelligence/policy`)
- Human-in-the-loop autonomous policy intervention engine.
- Priority-tagged directives:
  - High Priority: Reallocate 450 PMKVY seats to CNC Machining in Kappalur/Madurai.
  - High Priority: Flag Training Provider P002 for audit due to 12M retention drop (<65%).
  - Medium Priority: NSQF Level 5 stipend incentive for precision welding.
  - Medium Priority: Mandatory EPFO UAN seed during enrollment.
- Action: "Export Policy Brief (PDF)".

#### Provider Outcome Scorecards (`/scorecards`)
- Shifts evaluation from attendance compliance to 6M placement, 12M retention stability, wage adequacy scores, and evidence quality.
- Dynamically groups and sorts all providers from `TrainingRecord`.

#### Regional Spatial Skill-Gap Map (`/regional-analytics`)
- Interactive Leaflet OpenStreetMap centered on Tamil Nadu (lat 10.5, lng 78.0).
- Dynamic Marker Radii: Calculated as `Math.max(10, Math.min(28, 12 + traineeCount * 1.5))`.
- Deficit Color Coding: Red (Gap >= 27%), Amber (25% - 27%), Green (< 25%).
- Interactive District Sidebar: Displays demand score, certified supply graduates count, and demanded vs supplied skill tags.

#### Outcome Provenance Ledger & Registration (`/outcomes`, `/outcomes/new`)
- Filter tabs (All, Verified Only, Pending) and employer search.
- Expandable event row inspector showing cryptographic verification chain.
- 3-Step Outcome Logger with AI trade relevance check.

#### One-Tap Employer Attestation Portal (`/attestation`)
- HR representative confirmation portal displaying trainee credentials, proposed role (CNC Machinist), and wage (₹18,000/mo).
- Buttons: "Verify & Attest Employment" (issues cryptographic HR signature) vs "Report Discrepancy".

#### Evidence Forensic Extraction & Confidence Calibration (`/evidence/*`)
- `/evidence/upload`: Drag & drop salary slips, offer letters, NAPS contracts.
- `/evidence/[id]/extraction`: Split-panel OCR normalizer (document viewer on left, extracted fields on right).
- `/evidence/[id]/comparison`: Field-by-field matrix comparing Self-Reported Claim vs OCR Evidence (Exact Match vs Deviation).
- `/evidence/[id]/confidence`: Multi-source confidence breakdown calculating 0.86 composite score:
  - Payslip OCR Extraction: 0.35 weight
  - Employer Attestation: 0.30 weight
  - EPFO / UAN Match: 0.20 weight
  - DigiLocker Academic Anchor: 0.15 weight

#### Identity Migration & Dynamic Recovery Ladder (`/identity/*`)
- `/identity/update`: Multi-anchor lifecycle management & historical anchor audit table.
- `/identity/update/phone`: Simulates phone change from +91 91234 56780 to +91 98765 43210, logging a temporal migration edge to DSIG.
- `/identity/recovery`: Multi-tier escalation path resolving SIM/phone loss.
- `/identity/recovery/anchors`: Dynamic Anchor Weighting:
  - Email Anchor: 0.25
  - Training Certificate: 0.35
  - DigiLocker Aadhaar eKYC: 0.40
  - Employer HR Attestation: 0.20
  - PFMS Bank Account: 0.30
  - Mathematical Lock: Cumulative score must reach >= 0.85 before authorizing credential re-binding.
- `/identity/recovery/ladder`: Step-by-step verification progress.
- `/identity/recovery/success`: Identity restored confirmation with continuous historical link.

---

### 6. HOW REAL-TIME DYNAMIC PROPAGATION WORKS
Whenever data is added or modified in the platform:
1. `continuum.db` updates tables (`Trainee`, `TrainingRecord`, `AssessmentRecord`, `CertificationRecord`, `TraineeSkill`).
2. `/advanced-search` instantly updates its 10-per-page pagination and adds any new sectors/districts to filter facets.
3. `/dsig` and `/trainees/[id]/timeline` instantly populate their candidate selector dropdowns with the new candidates.
4. `/intelligence` recalculates macro KPIs, provider placement bar charts, and deficit ratios.
5. `/regional-analytics` redraws Leaflet marker circles and updates certified supply graduate counts.
