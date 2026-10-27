# AICTE PRAVAAH — Integrated Approval Workflow Automation & Compliance Monitoring

**Problem Statement ID:** 26262  
**Theme:** Smart Automation  
**Organization:** All India Council for Technical Education (AICTE)  
**Applicable Regulations:** AICTE Approval Process Handbook (APH) 2026-27  

---

## 🎯 Executive Overview

**AICTE PRAVAAH** is a unified, secure, and configurable national platform that automates approval-related workflows, enforces strict statutory SLAs, monitors institutional compliance, and resolves administrative bottlenecks across all 10 AICTE Regional Offices.

---

## 🏛️ Key System Pillars & Capabilities

1. **Multi-Track Approval Routing (Section A):**
   - Implements Track A (Scrutiny Only - EoA), Track B (Scrutiny + EVC for New Campuses), Track C (EVC + SAC/SHC for Appeals), and Track D (Focused Surprise EVC).
   - Strict stage-gated transition controls ensuring only authorized actions appear based on current stage and officer credentials.
   - Formal Deficiencies Notice generation with instant rollback and compliance tracking.

2. **National Executive Cockpit & Ageing Radar (Section B):**
   - Real-time monitoring across 10 Regional Offices (NRO, NWRO, WRO, SRO, SWRO, CRO, ERO, etc.).
   - Abstract metric tiles with drill-down modals (Active Pipelines, Overdue Breaches, EVC Visits, Undertakings, Land Lease Radar).
   - Real-time regulatory date-advancement engine simulating compliance sweeps and ageing.

3. **EVC Mobile Sentinel & Geofence Verification (Section C):**
   - 3-Member Expert Visit Committee allocation with automated Conflict-of-Interest verification.
   - 250-meter GPS perimeter geofence enforcement before on-site checklists unlock.
   - 10-day turnaround deadline watchdog with automated escalation for delayed inspection reports.

4. **Time-Bound Undertakings & Provisional Approval Locks (Section D):**
   - Manages conditional approvals granted subject to time-bound infrastructure obligations (e.g. 60-day lab equipment setup).
   - Live countdown clocks ($T-60 \to T-0$).
   - Automated Show-Cause Notice (SCN) generation and admission freeze upon deadline breach.

5. **30-Year Land Lease & Prescribed Document Sentinel (Section E):**
   - Multi-horizon expiry radar (90, 60, 30 days) for registered Sub-Registrar lease deeds.
   - SHA-256 cryptographic checksums ensuring zero unauthorized document modification.
   - Multi-tiered automated renewal notices.

6. **Novelty 1: Cascading SLA Auto-Escalation Engine:**
   - Multi-tiered escalation: Tier 1 (Soft Alert at T-2) $\to$ Tier 2 (Regional Red at T-0) $\to$ Tier 3 (Apex Executive at T+3).
   - **Self-Healing Reallocation**: Stagnant cases (>120 hrs) can be automatically reassigned to a parallel standby reviewer pool to eliminate bureaucratic bottlenecks.

7. **Novelty 2: Official Generated AICTE Order (Letter of Approval - LoA):**
   - Generates official, printable AICTE orders with Ministry of Education statutory format, approved intake tables, digital QR verification, and provisional undertaking lock clauses.

---

## ⚡ Quick Start (1-Click Run)

### Windows 1-Click Launch
Double-click `run.bat` in this folder. It will install dependencies, launch your browser at `http://localhost:5173/`, and run the Vite server.

### Manual Terminal Execution
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🏗️ Technology Stack
- **Frontend Framework:** React 18, Vite 5
- **Styling & UI:** Tailwind CSS, Lucide React
- **Architecture:** Hexagonal / Decoupled Ports & Adapters Architecture
- **Cryptographic Integrity:** SHA-256 Checksum Validation
