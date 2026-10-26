-- =====================================================================
-- PS 26264 | Institution-Wide Regulatory Case Coordination Platform
-- PostgreSQL 15+ | 3NF core schema | bitemporal event history
-- Rule of the schema: source cases are never merged, deleted or overwritten.
-- "Current state" is DERIVED from the append-only event log (views/functions),
-- never stored as a mutable column. That is what makes as-of time travel work.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS aicte;
SET search_path = aicte, public;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------
-- 0. GENERIC GUARDS
-- ---------------------------------------------------------------------
CREATE FUNCTION forbid_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'table % is append-only (% blocked)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = '55000';
END $$;

-- ---------------------------------------------------------------------
-- 1. GEOGRAPHY  (region -> state -> district; region is DERIVED for an
--    institution via district -> state -> region, so no transitive dependency)
-- ---------------------------------------------------------------------
CREATE TABLE region (
  region_id  smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL UNIQUE
);
CREATE TABLE state (
  state_id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  region_id  smallint NOT NULL REFERENCES region
);
CREATE TABLE district (
  district_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  state_id    smallint NOT NULL REFERENCES state,
  name        text NOT NULL,
  UNIQUE (state_id, name)
);

-- ---------------------------------------------------------------------
-- 2. ORGANISATION + LOOKUPS (all config, no code changes for new bureaus)
-- ---------------------------------------------------------------------
CREATE TABLE bureau_cell (
  bureau_id  smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  kind       text NOT NULL CHECK (kind IN ('BUREAU','CELL','REGIONAL_OFFICE','COMMITTEE')),
  region_id  smallint REFERENCES region          -- only for regional offices
);
CREATE TABLE source_system (
  source_id  smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  bureau_id  smallint NOT NULL REFERENCES bureau_cell   -- owning bureau/cell
);
CREATE TABLE track_type (
  track_type_id  smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code           text NOT NULL UNIQUE,
  name           text NOT NULL,
  is_illustrative boolean NOT NULL DEFAULT true  -- true until mapped to a verified AICTE process
);
CREATE TABLE canonical_status (
  status_id  smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       text NOT NULL UNIQUE,
  name       text NOT NULL
);
CREATE TABLE status_mapping (                     -- source status word -> canonical status
  source_id  smallint NOT NULL REFERENCES source_system,
  status_raw text NOT NULL,
  status_id  smallint NOT NULL REFERENCES canonical_status,
  is_verified boolean NOT NULL DEFAULT false,
  PRIMARY KEY (source_id, status_raw)
);
CREATE TABLE complaint_category (
  category_id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  name          text NOT NULL,
  is_restricted boolean NOT NULL DEFAULT false    -- e.g. sensitive categories: stricter access
);
CREATE TABLE category_mapping (
  source_id    smallint NOT NULL REFERENCES source_system,
  category_raw text NOT NULL,
  category_id  smallint NOT NULL REFERENCES complaint_category,
  PRIMARY KEY (source_id, category_raw)
);
CREATE TABLE event_type (
  event_type_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  name          text NOT NULL
);
CREATE TABLE signal_type (
  signal_type_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code           text NOT NULL UNIQUE
);
CREATE TABLE relationship_type (
  rel_type_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL
);
CREATE TABLE reason_code (
  reason_code_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code           text NOT NULL UNIQUE,
  description    text NOT NULL
);
CREATE TABLE alert_type (
  alert_type_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  name          text NOT NULL
);
CREATE TABLE audit_action (
  action_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      text NOT NULL UNIQUE
);
CREATE TABLE dataset (                            -- every case belongs to a labelled dataset
  dataset_id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label        text NOT NULL UNIQUE,
  is_synthetic boolean NOT NULL,
  description  text
);

-- ---------------------------------------------------------------------
-- 3. PEOPLE, ROLES, ACCESS
--    officer  = people named in SOURCE records (may never log in here)
--    app_user = accounts of THIS platform
-- ---------------------------------------------------------------------
CREATE TABLE officer (
  officer_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id    smallint NOT NULL REFERENCES source_system,
  external_ref text NOT NULL,
  name         text NOT NULL,
  designation  text,
  bureau_id    smallint REFERENCES bureau_cell,
  UNIQUE (source_id, external_ref)
);
CREATE TABLE app_user (
  user_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username     text NOT NULL UNIQUE,
  display_name text NOT NULL,
  email        text UNIQUE,
  officer_id   bigint REFERENCES officer,
  is_active    boolean NOT NULL DEFAULT true
);
CREATE TABLE role (
  role_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code    text NOT NULL UNIQUE,
  name    text NOT NULL
);
CREATE TABLE permission (
  permission_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE
);
CREATE TABLE role_permission (
  role_id       smallint NOT NULL REFERENCES role,
  permission_id smallint NOT NULL REFERENCES permission,
  PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE user_role (
  user_id bigint   NOT NULL REFERENCES app_user,
  role_id smallint NOT NULL REFERENCES role,
  PRIMARY KEY (user_id, role_id)
);
CREATE TABLE user_scope (                         -- bureau/region restriction rows
  scope_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id   bigint NOT NULL REFERENCES app_user,
  bureau_id smallint REFERENCES bureau_cell,
  region_id smallint REFERENCES region,
  CHECK (num_nonnulls(bureau_id, region_id) >= 1)
);

-- ---------------------------------------------------------------------
-- 4. INSTITUTION REGISTRY
-- ---------------------------------------------------------------------
CREATE TABLE institution (
  inst_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  permanent_id text UNIQUE,                       -- AICTE Permanent ID (format NOT enforced: unverified)
  name         text NOT NULL,
  address_line text,
  district_id  int REFERENCES district,
  pincode      char(6) CHECK (pincode ~ '^[0-9]{6}$'),
  is_active    boolean NOT NULL DEFAULT true
);
CREATE TABLE institution_unit (                   -- campus / unit when a PID is shared
  unit_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inst_id   bigint NOT NULL REFERENCES institution,
  unit_name text NOT NULL,
  UNIQUE (inst_id, unit_name),
  UNIQUE (unit_id, inst_id)                       -- target for the composite FK below
);
CREATE TABLE institution_name_variant (
  variant_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inst_id         bigint NOT NULL REFERENCES institution,
  variant_text    text NOT NULL,
  normalized_text text NOT NULL,
  is_verified     boolean NOT NULL DEFAULT false,
  UNIQUE (inst_id, normalized_text)
);
CREATE TABLE name_abbreviation (                  -- editable normaliser dictionary
  abbr      text PRIMARY KEY,
  expansion text NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. INGESTION  (freshness + raw payload for snapshot diffs)
-- ---------------------------------------------------------------------
CREATE TABLE ingest_batch (
  batch_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id   smallint NOT NULL REFERENCES source_system,
  dataset_id  smallint NOT NULL REFERENCES dataset,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status      text NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING','SUCCESS','PARTIAL','FAILED')),
  row_count   int,
  file_sha256 bytea CHECK (octet_length(file_sha256) = 32)
);
CREATE TABLE staging_source_record (              -- opaque raw payload; NOT part of the normalised model
  record_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id    bigint NOT NULL REFERENCES ingest_batch,
  source_ref  text NOT NULL,
  payload     jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. CASES  (immutable identity facts only; status/bureau/officer live in events)
-- ---------------------------------------------------------------------
CREATE TABLE complaint_case (
  case_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id     smallint NOT NULL REFERENCES source_system,
  source_ref    text NOT NULL,                    -- the original case ID, never replaced
  track_type_id smallint NOT NULL REFERENCES track_type,
  category_id   smallint REFERENCES complaint_category,
  category_raw  text,
  received_on   date NOT NULL,
  dataset_id    smallint NOT NULL REFERENCES dataset,
  first_batch_id bigint REFERENCES ingest_batch,
  recorded_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, source_ref)
);
CREATE TABLE case_text (                          -- split out: sensitive free text, tighter access
  case_id     bigint PRIMARY KEY REFERENCES complaint_case,
  summary     text NOT NULL,
  language    text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE case_institution_link (              -- append-only history of the resolver's decisions
  link_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id    bigint NOT NULL REFERENCES complaint_case,
  inst_id    bigint NOT NULL REFERENCES institution,
  unit_id    bigint,
  method     text NOT NULL CHECK (method IN ('EXACT_PERMANENT_ID','NAME_GEO_EXACT','FUZZY','MANUAL')),
  tier       text NOT NULL CHECK (tier IN ('HIGH','MEDIUM','LOW')),
  review_state text NOT NULL CHECK (review_state IN ('AUTO_ACCEPTED','PENDING_REVIEW','CONFIRMED','REJECTED')),
  decided_by_user_id bigint REFERENCES app_user,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (unit_id, inst_id) REFERENCES institution_unit (unit_id, inst_id),
  CHECK (review_state IN ('AUTO_ACCEPTED','PENDING_REVIEW') OR decided_by_user_id IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 7. EVENT LOG  (append-only, BITEMPORAL)
--    event_time  = when it happened in the world (as stated / observed)
--    recorded_at = when THIS platform learned it
--    Corrections never edit: a new event with corrects_event_id supersedes.
-- ---------------------------------------------------------------------
CREATE TABLE case_event (
  event_id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id          bigint NOT NULL REFERENCES complaint_case,
  event_type_id    smallint NOT NULL REFERENCES event_type,
  event_time       timestamptz NOT NULL,
  recorded_at      timestamptz NOT NULL DEFAULT now(),
  provenance       text NOT NULL CHECK (provenance IN ('SOURCE_STATED','OBSERVED_DIFF')),
  batch_id         bigint REFERENCES ingest_batch,
  actor_officer_id bigint REFERENCES officer,
  from_status_id   smallint REFERENCES canonical_status,
  to_status_id     smallint REFERENCES canonical_status,
  from_bureau_id   smallint REFERENCES bureau_cell,
  to_bureau_id     smallint REFERENCES bureau_cell,
  from_officer_id  bigint REFERENCES officer,
  to_officer_id    bigint REFERENCES officer,
  remarks          text,
  corrects_event_id bigint REFERENCES case_event
);
CREATE INDEX ix_event_case_rec  ON case_event (case_id, recorded_at);
CREATE INDEX ix_event_case_time ON case_event (case_id, event_time);

CREATE TABLE document (                           -- references only; no file copies
  doc_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id     bigint NOT NULL REFERENCES complaint_case,
  uri         text NOT NULL,
  file_name   text,
  sha256      bytea CHECK (octet_length(sha256) = 32),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_id, uri)
);
CREATE INDEX ix_doc_sha ON document (sha256) WHERE sha256 IS NOT NULL;
CREATE TABLE event_document (
  event_id bigint NOT NULL REFERENCES case_event,
  doc_id   bigint NOT NULL REFERENCES document,
  PRIMARY KEY (event_id, doc_id)
);

-- ---------------------------------------------------------------------
-- 8. DOCUMENTED LINEAGE (official handoffs only; inferred links never go here)
-- ---------------------------------------------------------------------
CREATE TABLE case_lineage (
  lineage_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_case_id bigint NOT NULL REFERENCES complaint_case,
  child_case_id  bigint NOT NULL REFERENCES complaint_case,
  basis          text NOT NULL CHECK (basis IN ('SOURCE_TRANSFER_RECORD','CASE_REFERENCE','OFFICER_CONFIRMED')),
  source_ref     text,
  from_rel_id    bigint,                           -- FK added after relationship exists
  confirmed_by_user_id bigint REFERENCES app_user,
  event_time     timestamptz,
  recorded_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_case_id, child_case_id),
  CHECK (parent_case_id <> child_case_id),
  CHECK (basis <> 'OFFICER_CONFIRMED' OR confirmed_by_user_id IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 9. RULES (config; unverified => disabled; demo values explicitly flagged)
-- ---------------------------------------------------------------------
CREATE TABLE rule (
  rule_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('SLA','ESCALATION','WORKFLOW_EXPECTATION','CLAUSE_MAPPING','MATCH_PARAMETER')),
  name        text NOT NULL,
  enabled     boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  is_demo     boolean NOT NULL DEFAULT false,      -- illustrative value, allowed ONLY for synthetic datasets
  source_ref  text,
  effective_from date NOT NULL DEFAULT current_date,
  effective_to   date,
  reviewed_by_user_id bigint REFERENCES app_user,
  version     int NOT NULL DEFAULT 1,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT enabled OR is_verified OR is_demo),
  CHECK (NOT (is_verified AND is_demo)),
  CHECK (NOT is_verified OR (source_ref IS NOT NULL AND reviewed_by_user_id IS NOT NULL))
);
CREATE TABLE sla_rule (
  rule_id        bigint PRIMARY KEY REFERENCES rule,
  track_type_id  smallint NOT NULL REFERENCES track_type,
  category_id    smallint REFERENCES complaint_category,
  warn_after_days smallint NOT NULL,
  due_after_days  smallint NOT NULL,
  CHECK (warn_after_days < due_after_days)
);
CREATE TABLE escalation_step (
  step_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rule_id    bigint NOT NULL REFERENCES rule,
  step_no    smallint NOT NULL,
  role_id    smallint NOT NULL REFERENCES role,
  after_days smallint NOT NULL,
  UNIQUE (rule_id, step_no)
);
CREATE TABLE workflow_expectation (                -- "after X, Y should be recorded within N days"
  rule_id               bigint PRIMARY KEY REFERENCES rule,
  track_type_id         smallint NOT NULL REFERENCES track_type,
  trigger_event_type_id smallint NOT NULL REFERENCES event_type,
  expected_event_type_id smallint NOT NULL REFERENCES event_type,
  within_days           smallint NOT NULL CHECK (within_days > 0)
);
CREATE TABLE match_parameter (                     -- tuned thresholds, with their provenance
  rule_id      bigint NOT NULL REFERENCES rule,
  param_name   text NOT NULL,
  param_value  numeric NOT NULL,
  tuned_on_dataset_id smallint REFERENCES dataset,
  PRIMARY KEY (rule_id, param_name)
);
CREATE TABLE regulatory_clause (                   -- taxonomy; illustrative until verified
  clause_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doc_code    text NOT NULL,
  clause_ref  text NOT NULL,
  title       text NOT NULL,
  version     text NOT NULL,
  effective_from date,
  effective_to   date,
  is_verified boolean NOT NULL DEFAULT false,
  source_url  text,
  verified_by_user_id bigint REFERENCES app_user,
  UNIQUE (doc_code, clause_ref, version),
  CHECK (NOT is_verified OR (source_url IS NOT NULL AND verified_by_user_id IS NOT NULL))
);
CREATE TABLE clause_keyword (
  clause_id bigint NOT NULL REFERENCES regulatory_clause,
  keyword   text NOT NULL,
  rule_id   bigint REFERENCES rule,                -- gate: only enabled rules may use it
  PRIMARY KEY (clause_id, keyword)
);

-- ---------------------------------------------------------------------
-- 10. SIGNALS  (evidence extracted from ONE case, with provenance)
-- ---------------------------------------------------------------------
CREATE TABLE complainant_token (                   -- keyed HMAC token; raw identity is never stored
  token_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token       bytea NOT NULL,
  key_version smallint NOT NULL,
  UNIQUE (token, key_version)
);
CREATE TABLE signal (
  signal_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id        bigint NOT NULL REFERENCES complaint_case,
  signal_type_id smallint NOT NULL REFERENCES signal_type,
  clause_id      bigint REFERENCES regulatory_clause,
  doc_id         bigint REFERENCES document,
  token_id       bigint REFERENCES complainant_token,
  value_text     text,                              -- period, outcome code, stage code, ...
  method         text NOT NULL CHECK (method IN
                   ('RULE_EXACT','RULE_KEYWORD','FUZZY_STRING','TFIDF','ENCODER','HASH_SHA256','HMAC','MANUAL')),
  tier           text NOT NULL CHECK (tier IN ('HIGH','MEDIUM','LOW')),
  source_ref     text,
  rule_id        bigint REFERENCES rule,
  recorded_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(clause_id, doc_id, token_id, value_text) = 1)
);
CREATE INDEX ix_signal_case ON signal (case_id, signal_type_id);

-- ---------------------------------------------------------------------
-- 11. RELATIONSHIPS (proposals) + append-only REVIEW history
-- ---------------------------------------------------------------------
CREATE TABLE relationship (
  rel_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_a_id    bigint NOT NULL REFERENCES complaint_case,
  case_b_id    bigint NOT NULL REFERENCES complaint_case,
  rel_type_id  smallint NOT NULL REFERENCES relationship_type,
  tier         text NOT NULL CHECK (tier IN ('HIGH','MEDIUM','LOW')),
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,                         -- engine re-run replaces a row with a new one
  CHECK (case_a_id < case_b_id),                     -- normalised pair: no (A,B)/(B,A) duplicates
  CHECK (superseded_at IS NULL OR superseded_at > recorded_at)
);
CREATE UNIQUE INDEX ux_rel_live ON relationship (case_a_id, case_b_id, rel_type_id)
  WHERE superseded_at IS NULL;
CREATE TABLE relationship_reason (
  rel_id         bigint NOT NULL REFERENCES relationship,
  reason_code_id smallint NOT NULL REFERENCES reason_code,
  PRIMARY KEY (rel_id, reason_code_id)
);
CREATE TABLE relationship_signal (
  rel_id    bigint NOT NULL REFERENCES relationship,
  signal_id bigint NOT NULL REFERENCES signal,
  PRIMARY KEY (rel_id, signal_id)
);
CREATE TABLE relationship_review (
  review_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rel_id      bigint NOT NULL REFERENCES relationship,
  status      text NOT NULL CHECK (status IN
                ('PROPOSED','CONFIRMED','DISMISSED','NEEDS_INFO','COORDINATION_REQUESTED')),
  decided_by_user_id bigint REFERENCES app_user,
  rationale   text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status = 'PROPOSED' OR decided_by_user_id IS NOT NULL),
  CHECK (status <> 'DISMISSED' OR rationale IS NOT NULL)
);
CREATE INDEX ix_review_rel ON relationship_review (rel_id, recorded_at);
ALTER TABLE case_lineage ADD FOREIGN KEY (from_rel_id) REFERENCES relationship;

-- ---------------------------------------------------------------------
-- 12. ALERTS (+ append-only acknowledgement history)
-- ---------------------------------------------------------------------
CREATE TABLE alert (
  alert_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alert_type_id smallint NOT NULL REFERENCES alert_type,
  case_id      bigint REFERENCES complaint_case,
  rel_id       bigint REFERENCES relationship,
  rule_id      bigint REFERENCES rule,
  escalation_step_id bigint REFERENCES escalation_step,
  responsible_bureau_id smallint NOT NULL REFERENCES bureau_cell,
  reason       text NOT NULL,
  raised_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(case_id, rel_id) >= 1)
);
CREATE TABLE alert_ack (
  ack_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alert_id    bigint NOT NULL REFERENCES alert,
  status      text NOT NULL CHECK (status IN ('ACKNOWLEDGED','RESOLVED','SNOOZED','ESCALATED')),
  by_user_id  bigint NOT NULL REFERENCES app_user,
  note        text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- ---------------------------------------------------------------------
-- 12.1 INTER-BUREAU JOINT COORDINATION PROTOCOL
--      Enables RB and PGRC to formalise cross-bureau coordination,
--      confer on overlapping cases, and record unified action memos.
-- ---------------------------------------------------------------------
CREATE TABLE joint_review_session (
  session_id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inst_id              bigint NOT NULL REFERENCES institution,
  initiator_bureau_id  smallint NOT NULL REFERENCES bureau_cell,
  target_bureau_id     smallint NOT NULL REFERENCES bureau_cell,
  initiated_by_user_id bigint NOT NULL REFERENCES app_user,
  status               text NOT NULL DEFAULT 'REQUESTED' 
                       CHECK (status IN ('REQUESTED','IN_CONFERENCE','RESOLVED','DISMISSED')),
  coordination_reason  text NOT NULL,
  outcome_memo         text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  resolved_at          timestamptz,
  CHECK (initiator_bureau_id <> target_bureau_id)
);

CREATE TABLE joint_review_case (
  session_id           bigint NOT NULL REFERENCES joint_review_session ON DELETE RESTRICT,
  case_id              bigint NOT NULL REFERENCES complaint_case ON DELETE RESTRICT,
  added_at             timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, case_id)
);

-- 13. AUDIT LOG (append-only + hash chain => tamper-evident)
--     target_table/target_id are deliberately polymorphic (no FK) as in any audit log.
-- ---------------------------------------------------------------------
CREATE TABLE audit_event (
  audit_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id bigint REFERENCES app_user,
  action_id     smallint NOT NULL REFERENCES audit_action,
  target_table  text NOT NULL,
  target_id     text NOT NULL,
  reason        text,
  at            timestamptz NOT NULL DEFAULT now(),
  prev_hash     bytea NOT NULL,
  row_hash      bytea NOT NULL
);
CREATE FUNCTION audit_chain() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_prev bytea;
BEGIN
  PERFORM pg_advisory_xact_lock(727001);            -- serialise chain extension
  SELECT row_hash INTO v_prev FROM audit_event ORDER BY audit_id DESC LIMIT 1;
  NEW.prev_hash := COALESCE(v_prev, '\x00'::bytea);
  NEW.row_hash  := sha256(NEW.prev_hash || convert_to(concat_ws('|',
      COALESCE(NEW.actor_user_id::text,''), NEW.action_id::text, NEW.target_table,
      NEW.target_id, COALESCE(NEW.reason,''), extract(epoch FROM NEW.at)::text), 'UTF8'));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_chain BEFORE INSERT ON audit_event
  FOR EACH ROW EXECUTE FUNCTION audit_chain();

CREATE FUNCTION audit_verify() RETURNS bigint LANGUAGE plpgsql STABLE AS $$
DECLARE r record; v_prev bytea := '\x00'::bytea;
BEGIN                                                -- returns first broken audit_id, or NULL if intact
  FOR r IN SELECT * FROM audit_event ORDER BY audit_id LOOP
    IF r.prev_hash <> v_prev OR r.row_hash <> sha256(r.prev_hash || convert_to(concat_ws('|',
         COALESCE(r.actor_user_id::text,''), r.action_id::text, r.target_table,
         r.target_id, COALESCE(r.reason,''), extract(epoch FROM r.at)::text), 'UTF8')) THEN
      RETURN r.audit_id;
    END IF;
    v_prev := r.row_hash;
  END LOOP;
  RETURN NULL;
END $$;

-- ---------------------------------------------------------------------
-- 14. APPEND-ONLY ENFORCEMENT
-- ---------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['case_event','relationship_review','alert_ack','audit_event',
                           'case_institution_link','case_lineage','joint_review_case']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_ro BEFORE UPDATE OR DELETE ON %I
                    FOR EACH ROW EXECUTE FUNCTION forbid_mutation()', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_notrunc BEFORE TRUNCATE ON %I
                    FOR EACH STATEMENT EXECUTE FUNCTION forbid_mutation()', t, t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 15. TIME TRAVEL: derived state, never stored
--     p_basis 'RECORDED' = "what the system knew on p_ts"   (recorded_at <= p_ts)
--     p_basis 'WORLD'    = "what had happened by p_ts"      (event_time  <= p_ts)
-- ---------------------------------------------------------------------
CREATE FUNCTION case_state_asof(p_ts timestamptz, p_basis text DEFAULT 'RECORDED')
RETURNS TABLE (case_id bigint, status_id smallint, bureau_id smallint,
               officer_id bigint, last_event_time timestamptz)
LANGUAGE sql STABLE AS $$
  WITH visible AS (
    SELECT * FROM case_event e
    WHERE (p_basis = 'RECORDED' AND e.recorded_at <= p_ts)
       OR (p_basis = 'WORLD'    AND e.event_time  <= p_ts)
  ), ev AS (                                         -- drop events that a visible correction replaced
    SELECT v.* FROM visible v
    WHERE NOT EXISTS (SELECT 1 FROM visible c WHERE c.corrects_event_id = v.event_id)
  )
  SELECT c.case_id,
    (SELECT e.to_status_id FROM ev e WHERE e.case_id = c.case_id AND e.to_status_id IS NOT NULL
       ORDER BY e.event_time DESC, e.event_id DESC LIMIT 1),
    (SELECT e.to_bureau_id FROM ev e WHERE e.case_id = c.case_id AND e.to_bureau_id IS NOT NULL
       ORDER BY e.event_time DESC, e.event_id DESC LIMIT 1),
    (SELECT e.to_officer_id FROM ev e WHERE e.case_id = c.case_id AND e.to_officer_id IS NOT NULL
       ORDER BY e.event_time DESC, e.event_id DESC LIMIT 1),
    (SELECT max(e.event_time) FROM ev e WHERE e.case_id = c.case_id)
  FROM complaint_case c
  WHERE EXISTS (SELECT 1 FROM ev e WHERE e.case_id = c.case_id);
$$;

CREATE FUNCTION relationship_asof(p_ts timestamptz)
RETURNS TABLE (rel_id bigint, case_a_id bigint, case_b_id bigint,
               rel_type_id smallint, tier text, review_status text)
LANGUAGE sql STABLE AS $$
  SELECT r.rel_id, r.case_a_id, r.case_b_id, r.rel_type_id, r.tier,
    (SELECT v.status FROM relationship_review v
       WHERE v.rel_id = r.rel_id AND v.recorded_at <= p_ts
       ORDER BY v.recorded_at DESC, v.review_id DESC LIMIT 1)
  FROM relationship r
  WHERE r.recorded_at <= p_ts AND (r.superseded_at IS NULL OR r.superseded_at > p_ts);
$$;

CREATE VIEW v_case_current AS SELECT * FROM case_state_asof(now(), 'RECORDED');

CREATE VIEW v_case_institution_current AS        -- latest resolver decision per case
  SELECT DISTINCT ON (case_id) case_id, inst_id, unit_id, method, tier, review_state, recorded_at
  FROM case_institution_link ORDER BY case_id, recorded_at DESC, link_id DESC;

CREATE VIEW v_institution_region AS               -- region is derived, not stored on institution
  SELECT i.inst_id, d.district_id, s.state_id, r.region_id, r.name AS region_name
  FROM institution i
  LEFT JOIN district d ON d.district_id = i.district_id
  LEFT JOIN state s    ON s.state_id    = d.state_id
  LEFT JOIN region r   ON r.region_id   = s.region_id;

CREATE VIEW v_case_detail_current AS
  SELECT 
    c.case_id,
    c.source_ref,
    c.received_on,
    c.track_type_id,
    tt.name AS track_type_name,
    il.inst_id,
    i.permanent_id,
    i.name AS institution_name,
    ir.region_name,
    st.status_id,
    cs.code AS status_code,
    cs.name AS status_name,
    st.bureau_id,
    bc.code AS bureau_code,
    bc.name AS bureau_name,
    st.officer_id,
    off.name AS officer_name,
    st.last_event_time,
    (CURRENT_DATE - c.received_on) AS age_days,
    CASE 
      WHEN (CURRENT_DATE - c.received_on) <= 15 THEN '< 15 Days'
      WHEN (CURRENT_DATE - c.received_on) <= 30 THEN '15-30 Days'
      WHEN (CURRENT_DATE - c.received_on) <= 60 THEN '30-60 Days'
      ELSE '> 60 Days (Breached)'
    END AS aging_bucket,
    CASE 
      WHEN (CURRENT_DATE - c.received_on) > 45 AND cs.code NOT IN ('DISPOSED','TRANSFERRED') THEN true
      ELSE false
    END AS is_sla_breached,
    CASE 
      WHEN cs.code = 'PENDING' THEN 'Initial Scrutiny & Bureau Verification'
      WHEN cs.code = 'UNDER_PROCESS' THEN 'Fact-Finding Hearing / Joint Coordination Review'
      WHEN cs.code = 'ESCALATED' THEN 'Competent Authority / SAC Final Determination'
      WHEN cs.code = 'DISPOSED' THEN 'Disposal Order Issued & Digitally Archived'
      ELSE 'Action Pending Assignment'
    END AS next_action_due
  FROM complaint_case c
  JOIN v_case_current st ON st.case_id = c.case_id
  LEFT JOIN track_type tt ON tt.track_type_id = c.track_type_id
  LEFT JOIN canonical_status cs ON cs.status_id = st.status_id
  LEFT JOIN bureau_cell bc ON bc.bureau_id = st.bureau_id
  LEFT JOIN officer off ON off.officer_id = st.officer_id
  LEFT JOIN v_case_institution_current il ON il.case_id = c.case_id
  LEFT JOIN institution i ON i.inst_id = il.inst_id
  LEFT JOIN v_institution_region ir ON ir.inst_id = i.inst_id;

-- Cross-Bureau Contradiction Sentinel:
-- Detects regulatory dissonance (e.g. PGRC disposed/closed while RB has active show cause)
CREATE VIEW v_cross_bureau_contradictions AS
  SELECT 
    a.inst_id,
    a.permanent_id,
    a.institution_name,
    a.case_id AS bureau_a_case_id,
    a.source_ref AS bureau_a_ref,
    a.bureau_code AS bureau_a_code,
    a.status_code AS bureau_a_status,
    b.case_id AS bureau_b_case_id,
    b.source_ref AS bureau_b_ref,
    b.bureau_code AS bureau_b_code,
    b.status_code AS bureau_b_status,
    'CRITICAL_REGULATORY_CONTRADICTION' AS severity,
    'Potential contradictory administrative action: One bureau has disposed/cleared case while another bureau maintains active scrutiny/show-cause' AS warning_message
  FROM v_case_detail_current a
  JOIN v_case_detail_current b 
    ON a.inst_id = b.inst_id 
   AND a.bureau_id <> b.bureau_id 
   AND a.case_id < b.case_id
  WHERE (a.status_code = 'DISPOSED' AND b.status_code IN ('UNDER_PROCESS','PENDING','ESCALATED'))
     OR (b.status_code = 'DISPOSED' AND a.status_code IN ('UNDER_PROCESS','PENDING','ESCALATED'));

-- Real-Time Single-Row Executive Rollup KPI View for Dashboard Header
CREATE VIEW v_dashboard_kpis AS
  SELECT 
    COUNT(*)::bigint AS total_cases,
    COUNT(*) FILTER (WHERE status_code = 'PENDING')::bigint AS total_pending,
    COUNT(*) FILTER (WHERE status_code = 'UNDER_PROCESS')::bigint AS total_under_process,
    COUNT(*) FILTER (WHERE status_code = 'DISPOSED')::bigint AS total_disposed,
    COUNT(*) FILTER (WHERE status_code = 'TRANSFERRED')::bigint AS total_transferred,
    COUNT(*) FILTER (WHERE status_code = 'ESCALATED')::bigint AS total_escalated,
    COUNT(*) FILTER (WHERE is_sla_breached = true)::bigint AS total_sla_breached,
    (SELECT COUNT(DISTINCT inst_id)::bigint FROM v_case_institution_current WHERE inst_id IS NOT NULL) AS institutions_monitored,
    (SELECT COUNT(*)::bigint FROM relationship r WHERE r.tier IN ('HIGH','MEDIUM') AND r.superseded_at IS NULL) AS potential_overlaps_count,
    (SELECT COUNT(*)::bigint FROM v_cross_bureau_contradictions) AS active_contradictions_count
  FROM v_case_detail_current;

-- Real-Time Bureau-Wise Workload & Disposal Summary
CREATE VIEW v_dashboard_bureau_workload AS
  SELECT 
    bc.bureau_id,
    bc.code AS bureau_code,
    bc.name AS bureau_name,
    COUNT(c.case_id)::bigint AS total_cases,
    COUNT(c.case_id) FILTER (WHERE c.status_code = 'PENDING')::bigint AS pending_cases,
    COUNT(c.case_id) FILTER (WHERE c.status_code = 'UNDER_PROCESS')::bigint AS under_process_cases,
    COUNT(c.case_id) FILTER (WHERE c.status_code = 'DISPOSED')::bigint AS disposed_cases,
    COUNT(c.case_id) FILTER (WHERE c.is_sla_breached = true)::bigint AS sla_breached_cases,
    ROUND(COALESCE(AVG(c.age_days) FILTER (WHERE c.status_code = 'DISPOSED'), 0), 1) AS avg_disposal_days
  FROM bureau_cell bc
  LEFT JOIN v_case_detail_current c ON c.bureau_id = bc.bureau_id
  GROUP BY bc.bureau_id, bc.code, bc.name;

-- SLA Aging Analysis Breakdown for AICTE Vigilance & Senior Administration
CREATE VIEW v_dashboard_aging_breakdown AS
  SELECT 
    bc.code AS bureau_code,
    bc.name AS bureau_name,
    COUNT(c.case_id) FILTER (WHERE c.aging_bucket = '< 15 Days' AND c.status_code <> 'DISPOSED')::bigint AS age_less_15d,
    COUNT(c.case_id) FILTER (WHERE c.aging_bucket = '15-30 Days' AND c.status_code <> 'DISPOSED')::bigint AS age_15_to_30d,
    COUNT(c.case_id) FILTER (WHERE c.aging_bucket = '30-60 Days' AND c.status_code <> 'DISPOSED')::bigint AS age_30_to_60d,
    COUNT(c.case_id) FILTER (WHERE c.aging_bucket = '> 60 Days (Breached)' AND c.status_code <> 'DISPOSED')::bigint AS age_over_60d_breached
  FROM bureau_cell bc
  LEFT JOIN v_case_detail_current c ON c.bureau_id = bc.bureau_id
  GROUP BY bc.bureau_id, bc.code, bc.name;

-- ---------------------------------------------------------------------
-- 16. SEARCH INDEXES (Postgres only; no separate search engine)
-- ---------------------------------------------------------------------
CREATE INDEX ix_inst_name_trgm   ON institution USING gin (name gin_trgm_ops);
CREATE INDEX ix_variant_trgm     ON institution_name_variant USING gin (normalized_text gin_trgm_ops);
CREATE INDEX ix_casetext_fts     ON case_text USING gin (to_tsvector('simple', summary));
CREATE INDEX ix_case_received    ON complaint_case (received_on);
CREATE INDEX ix_link_case        ON case_institution_link (case_id, recorded_at);
CREATE INDEX ix_link_inst        ON case_institution_link (inst_id);

-- ---------------------------------------------------------------------
-- 17. LOOKUP SEEDS (codes only; nothing here claims to be official AICTE procedure)
-- ---------------------------------------------------------------------
INSERT INTO canonical_status (code, name) VALUES
 ('PENDING','Pending'),('UNDER_PROCESS','Under Process'),('DISPOSED','Disposed'),
 ('TRANSFERRED','Transferred'),('ESCALATED','Escalated'),('UNMAPPED','Unknown / Unmapped');
INSERT INTO event_type (code, name) VALUES
 ('RECEIVED','Case received'),('STATUS_CHANGE','Status change'),('BUREAU_TRANSFER','Bureau/Cell transfer'),
 ('OFFICER_ASSIGN','Officer assigned'),('ESCALATION','Escalation'),('REMARK','Remark'),
 ('DOCUMENT_ADDED','Document added'),('DISPOSAL','Disposal'),('CORRECTION','Correction');
INSERT INTO signal_type (code) VALUES
 ('INSTITUTION'),('CLAUSE'),('TIME_PERIOD'),('COMPLAINANT_BLIND'),('DOC_HASH'),('OUTCOME'),('STAGE'),('TEXT_SIM');
INSERT INTO relationship_type (code, name) VALUES
 ('PROBABLE_HANDOFF','Probable handoff (inferred, unconfirmed)'),
 ('POTENTIAL_DUPLICATE','Potential duplicate submission'),
 ('RELATED_PARALLEL','Related parallel cases'),
 ('POSSIBLE_EVIDENCE_REUSE','Possible evidence reuse (identical file)'),
 ('OUTCOME_DIFFERS','Recorded outcomes differ - review context'),
 ('DUPLICATE_SUBMISSION','Duplicate submission across intake channels'),
 ('CONTRADICTORY_ACTIONS','Contradictory administrative actions across bureaus'),
 ('CASE_TRANSFER','Documented inter-bureau case transfer');
INSERT INTO reason_code (code, description) VALUES
 ('SAME_INST_HIGH','Both cases resolved to the same institution (high confidence)'),
 ('SAME_INST_UNIT','Same institution and same unit/campus'),
 ('CLAUSE_OVERLAP','Overlapping regulatory clause signals'),
 ('TEXT_SIM_HIGH','High text similarity between case summaries'),
 ('SAME_PERIOD','Same academic year / time period'),
 ('DIFFERENT_LINEAGE','No documented lineage between the cases'),
 ('IDENTICAL_FILE','Byte-identical document hash'),
 ('SHARED_COMPLAINANT_TOKEN','Same blind complainant token (supporting signal only)'),
 ('OUTCOMES_DIFFER','Normalised outcomes differ in a comparable context'),
 ('REGULATORY_CONTRADICTION_RISK','Disposal in one bureau conflicts with active punitive proceeding in another bureau'),
 ('PUNITIVE_VS_DISPOSAL_CONFLICT','Premature clean-chit detected during active Show-Cause proceeding');
INSERT INTO alert_type (code, name) VALUES
 ('OVERLAP','Potential Overlapping Cases - Coordination Required'),
 ('CONTRADICTION_DISSONANCE','Regulatory Action Dissonance - Contradiction Alert'),
 ('JOINT_REVIEW_REQUESTED','Joint Inter-Bureau Coordination Requested'),
 ('PENDING_REMINDER','Pending case reminder'),('SLA_APPROACHING','Approaching deadline'),
 ('SLA_OVERDUE','Overdue'),('ESCALATION_DUE','Escalation due'),
 ('UNACKNOWLEDGED','Unacknowledged alert'),('DATA_UNAVAILABLE','Data unavailable / stale feed');
INSERT INTO audit_action (code) VALUES
 ('LOGIN'),('VIEW_SENSITIVE'),('UNMASK'),('EXPORT'),('RELATIONSHIP_DECISION'),
 ('RULE_CHANGE'),('PERMISSION_CHANGE'),('LINEAGE_CONFIRM'),('JOINT_REVIEW_INIT'),('CONTRADICTION_FLAGGED');
INSERT INTO role (code, name) VALUES
 ('OFFICER','Case officer'),('NODAL','Bureau/Cell nodal officer'),('SUPERVISOR','Supervisory officer'),
 ('COMPETENT_AUTH','Competent authority'),('REGIONAL','Regional office user'),
 ('REVIEWER','Relationship reviewer'),('ADMIN','Administrator');
INSERT INTO bureau_cell (code, name, kind) VALUES      -- the two named in the PS; add others via config
 ('RB','Regulation Bureau','BUREAU'),('PGRC','Public Grievance Redressal Cell','CELL');
INSERT INTO track_type (code, name) VALUES              -- illustrative until verified
 ('PGRC_COMPLAINT','PGRC complaint'),('SCSC_REVIEW','Complaint scrutiny'),
 ('EVC_SCRUTINY','Expert visit / scrutiny'),('SHOW_CAUSE','Show-cause'),
 ('HEARING','Hearing'),('COURT_MATTER','Court matter'),('CPGRAMS','CPGRAMS grievance'),
 ('REFERENCE','VIP / other reference');
INSERT INTO name_abbreviation VALUES
 ('engg','engineering'),('inst','institute'),('coll','college'),('tech','technology'),
 ('univ','university'),('polytechnic','polytechnic'),('mgmt','management');

-- ---------------------------------------------------------------------
-- 18. ROLES AT DATABASE LEVEL (defence in depth behind the trigger guards)
-- ---------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aicte_app') THEN
    CREATE ROLE aicte_app NOLOGIN;
  END IF;
END $$;
GRANT USAGE ON SCHEMA aicte TO aicte_app;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA aicte TO aicte_app;
GRANT UPDATE ON institution, institution_unit, institution_name_variant, rule, relationship,
                app_user, officer, ingest_batch, regulatory_clause, joint_review_session TO aicte_app;
-- no DELETE anywhere; event/review/ack/audit/link/lineage tables are additionally trigger-guarded
GRANT USAGE ON ALL SEQUENCES IN SCHEMA aicte TO aicte_app;
