# AICTE Case Coordination & Regulatory Intelligence Platform
**Smart India Hackathon 2026 | Problem Statement ID: 26264**  

---

## 1. Problem Landscape
1. **Scattered Records**: Complaint records are scattered across different bureaus (Regulation Bureau, PGRC, Approval Bureau, Regional Offices).
2. **Naming Discrepancies**: The same institution may appear under different names or abbreviations across portals.
3. **Conflicting Decisions**: Different bureaus may make conflicting decisions (e.g. PGRC clean-chit while Regulation Bureau has an active Show-Cause notice).
4. **Untracked Case History**: Important case history and evidentiary audit trails are difficult to track across time.
5. **Confidentiality Risks**: Sensitive whistleblower testimony and sub-judice documents need strict protection without breaking inter-bureau coordination.

---

## 2. Core Innovations & Implementation Mapping
All innovations are fully embedded and operational in this system:

| Innovation Mandate | Implemented Component in System | Technical Detail |
| :--- | :--- | :--- |
| **Case Passport** | Interactive Case Dossier & Event Log | Maintains complete chronological history of every case update, officer assignment, and status change. |
| **Conflict Detection System (Contradiction Detection)** | Contradiction Sentinel (`v_cross_bureau_contradictions` & Red Banner) | Identifies conflicting actions between bureaus and halts unilateral disposal before a case is closed. |
| **Secure Duplicate Detection** | Air-Gapped Blind Handshake Protocol | Finds related complaints using salted HMAC-SHA256 tokens without exposing sensitive citizen/whistleblower identities. |
| **Smart Institution Matching** | 4-Tier Cascaded Entity Resolver | Identifies the same institution even when names differ (Exact PID $\to$ Geo Blocking $\to$ RapidFuzz $\to$ Jaro-Winkler). |
| **Explainable AI** | Multi-Signal Reason Codes & NLP Service | Shows why cases are considered related with statutory reason codes (`SAME_INST_HIGH`, `CLAUSE_OVERLAP`). |
| **Unified Complaint Registry** | Master Complaint Ledger | Centralized record of complaints using unique case IDs and verified AICTE Permanent IDs (PID). |
| **Cross-Bureau Case Tracker** | Real-time Searchable Case Table | Tracks complaint progress across AICTE bureaus and surfaces overlapping proceedings. |
| **Case History and Audit Trail** | Bitemporal "As-of" Time Travel Machine | Reconstructs past case statuses as of any historical calendar date (`case_state_asof`). |
| **Coordination Dashboard** | Executive Single-Window UI | Displays pending cases, delays (>45 days), bureau workload, and resolution status. |

---

## 3. How to Run

### Backend (Port 8000)
```bash
cd backend
python run.py
```
* API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Frontend (Port 3000)
```bash
cd frontend
npm run dev
```
* Dashboard URL: [http://localhost:3000](http://localhost:3000)
