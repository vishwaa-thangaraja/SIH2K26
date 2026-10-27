# Software Architecture & System Design Description (SDD)
## AICTE PRAVAAH-SMART: Unified Approval Workflow, Compliance Monitoring & Escalation System

**Document Version:** 2.4.0 (Production & Future-Proof Engineering Release)  
**Problem Statement ID:** 26262  
**Target Organization:** All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India  
**Applicability Horizon:** Approval Process Handbook (APH) 2026–2035+ Architecture  
**File Location:** `D:\Documents\SEM V\SIH 2026\26262\SYSTEM_DESIGN_DESCRIPTION.md`

---

## 1. Executive Summary & Design Philosophy

The **AICTE PRAVAAH-SMART** platform is engineered as an **Event-Driven, Metadata-Configurable, Hexagonal (Ports & Adapters) Regulatory Operating System**. 

The fundamental failure of legacy government workflow systems stems from **rigid, procedural hardcoding**: when policies change (e.g., APH norms revised, new committee types added, document requirements altered), traditional codebases require deep refactoring. 

### Core Architectural Axioms for Permanent Future-Proofing:
1. **Zero-Code Policy Mutation (Metadata-Driven Engine):** Workflow tracks, stage sequences, deadlines, scrutiny checklists, and escalation matrices are stored as **Versioned Declarative Schemas**, not compiled application code. A new APH handbook simply instantiates a new versioned policy set without modifying engine code.
2. **Strict Separation of Coordination vs. Regulatory Judgement:** The software automates deterministic coordination, reminder dispatch, geofence verification, and escalation routing, but guarantees **statutory regulatory sovereignty** (mandatory dual-signoff by authorized human officers for legal approvals).
3. **Hexagonal Modularity (Pluggable Micro-Engines):** Every subsystem—Workflow, Compliance Watchdog, Document Sentinel, EVC Scheduler, Alert Bus, and Audit Ledger—communicates through well-defined Domain Event Contracts and Abstract Interfaces. External services (e.g., DigiLocker, ISRO Bhuvan GIS, SMS Gateways, e-Pramaan SSO) plug into adapters without altering domain core logic.
4. **Append-Only Immutable Event Sourcing:** No historical compliance, scrutiny, or audit record is ever updated in place (`UPDATE`). All state transitions are modeled as cryptographically hashed, append-only domain events (`EventType`, `Actor`, `BeforeState`, `AfterState`, `Hash`), guaranteeing permanent forensic trace and legal admissibility.

---

## 2. High-Level Architecture (C4 Architecture Model)

```
+-----------------------------------------------------------------------------------------------------+
|                                          STAKEHOLDERS                                               |
|  [Institutional Applicants]  [Regional Officers (RO)]  [Scrutiny Experts]  [EVC Panel]  [HQ/SAC]   |
+-----------------------------------------------------------------------------------------------------+
                                                  |  (HTTPS / TLS 1.3 / mTLS / WebSockets)
                                                  v
+-----------------------------------------------------------------------------------------------------+
|                                 EDGE & ACCESS GATEWAY (KONG / NGINX)                                 |
|  - Rate Limiting & DoS Guard   - JWT / e-Pramaan SSO Token Validation   - Role-Based Access Control |
+-----------------------------------------------------------------------------------------------------+
                                                  |
         +----------------------------------------+----------------------------------------+
         |                                        |                                        |
         v                                        v                                        v
+-----------------------+              +-----------------------+              +-----------------------+
|   WORKFLOW & STATE    |              |  COMPLIANCE & LEASE   |              |  EVC INSPECTION &     |
|   MACHINE SERVICE     |              |   SENTINEL SERVICE    |              |  GEOFENCE DISPATCH    |
| - APH Track Routing   |              | - 30-Yr Lease Radar   |              | - Panel CoI Matcher   |
| - Deficiency Manager  |              | - Undertaking Lock    |              | - GPS Geofence Guard  |
| - Stage Transitions   |              | - Checksum Pulse      |              | - 10-Day SLA Watcher  |
+-----------------------+              +-----------------------+              +-----------------------+
         |                                        |                                        |
         +----------------------------------------+----------------------------------------+
                                                  | (Asynchronous Pub/Sub Domain Events)
                                                  v
+-----------------------------------------------------------------------------------------------------+
|                           DISTRIBUTED EVENT STREAM & INTEGRATION BUS (KAFKA / RABBITMQ)             |
|   Topics: application.submitted | stage.advanced | deficiency.reverted | evc.delayed | doc.expiring   |
+-----------------------------------------------------------------------------------------------------+
         |                                        |                                        |
         v                                        v                                        v
+-----------------------+              +-----------------------+              +-----------------------+
|  CASCADING ESCALATION |              |  IMMUTABLE REGULATORY |              |  NOTIFICATION &       |
|    SLA CONTROLLER     |              |  AUDIT LEDGER SERVICE |              |  OMNICHANNEL ENGINE   |
| - Tier 1: Soft Alerts |              | - SHA-256 HMAC Blocks |              | - DigiLocker Dispatch |
| - Tier 2: Standby Pool|              | - Tamper-Proof Trail  |              | - SMS / WhatsApp API  |
| - Tier 3: Apex Vigil  |              | - Legal Cert Generator|              | - Speed Post Barcode  |
+-----------------------+              +-----------------------+              +-----------------------+
                                                  |
                                                  v
+-----------------------------------------------------------------------------------------------------+
|                                     DATA & STORAGE TIER                                              |
|  [PostgreSQL 16+ Relational DB]     [Redis 7 Cluster Cache]     [MinIO / S3 Encrypted Document Store]|
|  - Strict Foreign Keys & ACID       - SLA Countdown Timers       - AES-256 GCM Envelope Encryption   |
|  - Versioned Workflow Schemas       - Distributed Lock Guards    - Immutable Versioned Object Storage|
+-----------------------------------------------------------------------------------------------------+
```

---

## 3. Micro-Engine Specifications

### 3.1. Engine 1: Declarative Workflow Orchestration Engine (DWOE)
The workflow engine operates on a **Generalized Finite State Machine (FSM)**. It is decoupled from any hardcoded stage names.
- **Workflow Track Definition Schema (`workflow_tracks`)**:
  - `track_id`: Unique identifier (e.g., `TRACK_A_EOA`, `TRACK_B_NEW_CAMPUS`, `TRACK_C_APPEALS`, `TRACK_D_SURPRISE`).
  - `aph_edition_year`: Target handbook edition (e.g., `2026-27`).
  - `stages_pipeline`: An ordered array of stage configuration tokens.
  - `transition_rules`: Declarative predicates that determine when an application can legally move forward, revert for deficiency, or branch into an EVC queue.

```json
{
  "trackId": "TRACK_B_NEW_CAMPUS",
  "version": "2026.1",
  "pipeline": [
    {
      "stageId": "STAGE_PRELIM",
      "slaDays": 5,
      "authorizedRoles": ["DESK_OFFICER"],
      "mandatoryChecklist": ["affidavits_verified", "processing_fee_cleared"]
    },
    {
      "stageId": "STAGE_SCRUTINY",
      "slaDays": 14,
      "authorizedRoles": ["SCRUTINY_CONVENER"],
      "deficiencyAllowed": true,
      "onDeficiencyTargetStage": "STAGE_PRELIM",
      "nextStage": "STAGE_EVC_ALLOCATION"
    },
    {
      "stageId": "STAGE_EVC_ALLOCATION",
      "slaDays": 10,
      "autoTrigger": true,
      "authorizedRoles": ["EVC_COORDINATOR", "RO"],
      "nextStage": "STAGE_EVC_SCRUTINY"
    },
    {
      "stageId": "STAGE_COMPETENT_AUTH",
      "slaDays": 7,
      "authorizedRoles": ["MEMBER_SECRETARY"],
      "canGrantConditional": true
    }
  ]
}
```

*Future Enhancement Applicability:* If AICTE introduces a new track in 2028 (e.g., "Industry-Integrated Skill Polytech Track"), an administrator uploads a new JSON definition via the APH Rules Configurator. **Zero code deployment is required.**

---

### 3.2. Engine 2: EVC Geofenced Dispatch & Anti-Conflict Matcher
Addresses Section C of the problem statement:
- **Conflict-of-Interest (CoI) Auto-Filtering:** Matches 3-member panels (Chairman, Domain Specialist, Architect) such that:
  $$\text{Panelist State} \neq \text{Institution State}$$
  $$\text{Panelist Alumni/Employer} \cap \text{Trustees/Institution} = \emptyset$$
- **GPS Spatial Geofence Verification:**
  - Upon arrival, each panelist checks in using the mobile inspection client.
  - The system computes the **Haversine Distance**:
    $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  - If $d \le 250\text{ meters}$ for all 3 members synchronously, the checklist unlocks.
- **Enforced 10-Day SLA with Sub-Milestones:**
  - Milestone 1 (Day 1–3): Expert Confirmation.
  - Milestone 2 (Day 4–7): Physical On-Site Inspection.
  - Milestone 3 (Day 8–10): Joint Digital Report Submission. If Day 10 is reached without a signed report, the case escalates directly to Tier-2.

---

### 3.3. Engine 3: Tamper-Evident Document Pulse & Lease Sentinel
Addresses Section E of the problem statement:
- **Continuous Expiry Radar:** Evaluates time-to-expiry horizon:
  $$\Delta t = T_{\text{expiry}} - T_{\text{current}}$$
  - **Zone 1: Safe** ($\Delta t > 90 \text{ days}$) $\to$ Routine background audit.
  - **Zone 2: Warning** ($30 < \Delta t \le 90 \text{ days}$) $\to$ Automated Tier-1 reminder via SMS and email.
  - **Zone 3: Critical** ($0 \le \Delta t \le 30 \text{ days}$) $\to$ Automated Tier-2 urgent notices, DigiLocker dispatch, and alert flag on the RO dashboard.
  - **Zone 4: Expired / Deficient** ($\Delta t < 0$) $\to$ Automatic **Approval Renewal Freeze**.
- **Cryptographic Integrity Checksum (SHA-256):**
  - Upon upload of any registered lease deed, fire NOC, or structural certificate:
    $$\text{Checksum} = \text{HMAC-SHA256}(\text{FileBytes}, K_{\text{AICTE\_REGULATORY}})$$
  - Stored in the immutable ledger. When an institution requests extension or renewal, the system verifies that the baseline registered deed was not retroactively swapped with unencumbered land.

---

### 3.4. Engine 4: Time-Bound Undertaking & Provisional Approval Lock
Addresses Section D of the problem statement:
- **Provisional State Machine:** Approvals granted with conditions enter a `PROVISIONAL_UNDERTAKING_LOCK` state.
- **Active Countdown & Show-Cause Generation:**
  - Live days-remaining calculation:
    $$D_{\text{rem}} = \text{DueDate} - \text{CurrentDate}$$
  - If $D_{\text{rem}} \le 0$ without a verified submission, the lock converts to `WITHHELD / SCN_TRIGGERED`.
  - The system automatically compiles an electronic **Show-Cause Notice (SCN)** citation draft citing the unfulfilled undertaking clauses, pre-filling evidence logs, and queueing it for the Standing Hearing Committee (SHC).
- **Statutory Safeguard Dual-Signoff:**
  $$\text{Regularization} = \text{Verify}(\text{Desk Officer}) \land \text{Ratify}(\text{Regional Officer})$$
  Ensures machine automation assists the flow, but regulatory accountability is formally certified by authorized human officers.

---

### 3.5. Engine 5: Cascading SLA Auto-Escalation Engine
Addresses Section F of the problem statement:
- **Self-Healing Reassignment Protocol:**
  - **Tier 1 (T - 2 Days):** Soft alert to the assigned reviewer.
  - **Tier 2 (T - 0 Days SLA Breach):** If the application stays dormant for $>120 \text{ hours}$ (5 days without reviewer action), the engine **unassigns the dormant reviewer** and automatically reallocates the file to the next active reviewer in **Standby Reviewer Pool B**.
  - **Tier 3 (T + 3 Days Chronic Delay):** Escalates directly to the Member Secretary and Central Vigilance Officer with an explainable diagnostic root-cause summary:
    $$\text{Diagnostic Log} = \{\text{Stage}, \text{AssignedActor}, \text{InactivityDuration}, \text{PoolReassignmentHistory}, \text{CalculatedRiskScore}\}$$

---

## 4. Universal Database Schema (PostgreSQL DDL)

The data model is engineered to be **future-proof**: it utilizes JSONB columns for stage-specific scrutiny checklists, document metadata, and dynamic APH rules, meaning new fields can be added without running DDL schema migrations.

```sql
-- 1. INSTITUTIONS MASTER TABLE
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pid VARCHAR(32) UNIQUE NOT NULL, -- AICTE Permanent ID (e.g. 1-9382103)
    name VARCHAR(255) NOT NULL,
    region_code VARCHAR(16) NOT NULL, -- NRO, WRO, SRO, SWRO, etc.
    state VARCHAR(64) NOT NULL,
    address TEXT NOT NULL,
    trust_society_name VARCHAR(255) NOT NULL,
    established_year INT NOT NULL,
    geo_point_lat NUMERIC(9,6) NOT NULL,
    geo_point_lng NUMERIC(9,6) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DYNAMIC WORKFLOW DEFINITION
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id VARCHAR(64) NOT NULL, -- SCRUTINY_ONLY, SCRUTINY_EVC, etc.
    aph_edition VARCHAR(16) NOT NULL, -- 2026-27, 2027-28
    is_active BOOLEAN DEFAULT TRUE,
    pipeline_schema JSONB NOT NULL, -- Dynamic ordered stages, SLAs, checklists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. APPLICATIONS TABLE (STATE MACHINE)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_number VARCHAR(64) UNIQUE NOT NULL, -- APP-2026-NRO-1042
    institution_id UUID REFERENCES institutions(id),
    track_id VARCHAR(64) NOT NULL,
    current_stage VARCHAR(64) NOT NULL,
    sub_stage VARCHAR(128),
    assigned_user_id UUID,
    assigned_role VARCHAR(64) NOT NULL,
    days_in_current_stage INT DEFAULT 0,
    sla_threshold_days INT NOT NULL,
    stage_entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL, -- IN_PROGRESS, DEFICIENT_REVERTED, APPROVED, ESCALATED
    risk_score INT DEFAULT 0,
    deficiencies_log JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb, -- Intake, Courses, Built-up area
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. EVC INSPECTIONS TABLE
CREATE TABLE evc_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evc_code VARCHAR(64) UNIQUE NOT NULL,
    application_id UUID REFERENCES applications(id),
    status VARCHAR(64) NOT NULL,
    scheduled_date DATE,
    sla_deadline DATE,
    committee_members JSONB NOT NULL, -- List of experts, contacts, institutions
    geofence_lat NUMERIC(9,6) NOT NULL,
    geofence_lng NUMERIC(9,6) NOT NULL,
    geofence_radius_meters INT DEFAULT 250,
    geofence_verified BOOLEAN DEFAULT FALSE,
    inspection_checklist JSONB DEFAULT '{}'::jsonb,
    report_submitted_at TIMESTAMP WITH TIME ZONE,
    report_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TIME-BOUND UNDERTAKINGS (PROVISIONAL LOCK)
CREATE TABLE compliance_undertakings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ut_code VARCHAR(64) UNIQUE NOT NULL,
    application_id UUID REFERENCES applications(id),
    institution_id UUID REFERENCES institutions(id),
    condition_text TEXT NOT NULL,
    prescribed_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(64) NOT NULL, -- UNDER_EXECUTION, PENDING_VERIFICATION, REGULARIZED, BREACHED
    lock_status VARCHAR(64) NOT NULL, -- PROVISIONAL_ACTIVE, REGULARIZED, WITHHELD_SCN
    evidence_payload JSONB DEFAULT '{}'::jsonb, -- Document URLs, NABL invoices, photos
    verified_by_user UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRESCRIBED DOCUMENTS & LEASE SENTINEL
CREATE TABLE prescribed_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_code VARCHAR(64) UNIQUE NOT NULL,
    institution_id UUID REFERENCES institutions(id),
    document_type VARCHAR(64) NOT NULL, -- LEASE_DEED, FIRE_NOC, BUILDING_SAFETY
    reg_number VARCHAR(128) NOT NULL,
    sub_registrar_office VARCHAR(255),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    file_storage_path TEXT NOT NULL,
    notices_dispatched_count INT DEFAULT 0,
    last_notice_date DATE,
    renewal_status VARCHAR(64) DEFAULT 'ORIGINAL_VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. APPEND-ONLY CRYPTOGRAPHIC AUDIT STREAM
CREATE TABLE audit_ledger (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(128) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL, -- STAGE_ADVANCE, DEFICIENCY_REVERT, AUTO_ESCALATE
    target_entity_type VARCHAR(64) NOT NULL, -- APPLICATION, UNDERTAKING, DOCUMENT
    target_entity_id VARCHAR(128) NOT NULL,
    payload_before JSONB,
    payload_after JSONB,
    summary_remark TEXT NOT NULL,
    ip_address VARCHAR(45),
    sha256_block_hash VARCHAR(64) NOT NULL -- Hash over (id, timestamp, actor, action, payload, prev_hash)
);
```

---

## 5. Security Architecture, Zero-Trust RBAC & Encryption

```
+----------------------------------------------------------------------------------------------------+
|                                    SECURITY MATRIX & ENCRYPTION BOUNDARY                           |
+----------------------------------------------------------------------------------------------------+
| Data In-Transit       | TLS 1.3 enforced across all external and inter-service channels.            |
| Data At-Rest          | AES-256-GCM table-space encryption; sensitive document envelopes encrypted. |
| Authentication        | OpenID Connect (OIDC) integrated with Govt. e-Pramaan Single Sign-On (SSO).|
| Session Management    | Stateless Cryptographic JWT with RS256 signing; 15-minute token TTL.        |
| Document Immutability | SHA-256 checksum recorded in append-only ledger before saving to disk.     |
+----------------------------------------------------------------------------------------------------+
```

### Role-Based Access Control (RBAC) Matrix:
| Role | View Own | View Regional | View National | Authorize Stage | Return Deficiency | Edit APH Rules | Sign Certificates |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Institution** | ✅ | ❌ | ❌ | ❌ (Submit only) | ❌ | ❌ | ❌ |
| **Desk Officer** | ❌ | ✅ | ❌ | ✅ (Prelim only) | ✅ | ❌ | ❌ |
| **Scrutiny Expert** | ❌ | Assigned | ❌ | ✅ (Scrutiny) | ✅ | ❌ | ❌ |
| **EVC Expert** | ❌ | Assigned | ❌ | ✅ (Inspection) | ❌ | ❌ | ❌ |
| **Regional Officer** | ❌ | ✅ | ❌ | ✅ (Regional) | ✅ | ❌ | ✅ |
| **Member Secretary** | ❌ | ❌ | ✅ | ✅ (Final EoA) | ✅ | ❌ | ✅ |
| **System Admin** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## 6. Future Enhancement Roadmap (Plug-and-Play Integrations)

Because of the decoupled Hexagonal Architecture and Event Bus, the following enhancements plug into the platform **without modifying the existing core workflow**:

```
+---------------------------------------------------------------------------------------+
|                       EXTENSIBILITY & FUTURE PLUGINS LAYER                            |
+---------------------------------------------------------------------------------------+
|  [Plugin: ISRO Bhuvan Satellite Verification]   --> Consumes 'evc.scheduled' event     |
|  [Plugin: DigiLocker Direct Pull API]           --> Consumes 'document.upload' event   |
|  [Plugin: State Revenue Dept Land Title Sync]   --> Consumes 'document.verify' event   |
|  [Plugin: AI Predictive Document Authenticator] --> Consumes 'evidence.uploaded' event |
+---------------------------------------------------------------------------------------+
```

1. **Satellite Land & Built-up Verification (ISRO Bhuvan Adapter):**  
   Consumes `evc.scheduled` events. Queries Bhuvan API for geo-coordinates to compare built-up roof area with claimed square meters before the EVC arrives.
2. **DigiLocker Direct API Ingestion:**  
   Replaces manual PDF uploads for Land Titles and Fire Safety NOCs with authenticated, machine-readable XML/PDF artifacts directly from state municipal servers.
3. **AI-Assisted Scrutiny Summarizer (Non-Decisional):**  
   Reads multi-page affidavits and highlights potential discrepancies (e.g., student-faculty ratio discrepancy between payslips and roster) for Scrutiny Experts to review.
4. **State University Affiliation Bus (Webhooks):**  
   Automatically emits a signed `eoa.issued` webhook payload to affiliating state technical universities (e.g., AKTU, Anna University, VTU) to prevent unapproved courses from being listed in state counseling portals.

---

## 7. How to Use This Document for Evaluation & Defense

When judges or evaluators ask:
- *"What happens if AICTE changes the Approval Process Handbook rules next year?"*  
  👉 **Answer:** *"Our system uses a Declarative Workflow Engine. Workflows and deadlines are versioned JSON policies stored in our database. A new APH handbook is simply registered as a new policy version without altering any core engine code."*
- *"Does this system violate statutory regulations by letting software make approval decisions?"*  
  👉 **Answer:** *"No. Section 2.11 of our design strictly enforces the Regulatory Safeguard Axiom. The system automates SLA tracking, scheduling, geofence validation, and auto-escalation, but regulatory decisions strictly mandate dual-signoff by authorized statutory authorities."*
- *"How do you prevent an institution from falsifying land documents or submitting fake compliance reports?"*  
  👉 **Answer:** *"Every prescribed document is cryptographically fingerprinted using SHA-256 upon initial registration. Furthermore, undertakings operate under a Provisional Approval Countdown Lock that automatically triggers Show-Cause proceedings if dual-signoff verification is not achieved before deadline T-0."*

---
*End of System Design Description.*
