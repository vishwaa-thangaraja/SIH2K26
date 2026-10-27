-- Test + demo script for schema.sql. ALL DATA BELOW IS SYNTHETIC.
SET search_path = aicte, public;
\set ON_ERROR_STOP off
\pset pager off

-- ---------- seed: one synthetic institution, two sources, two cases ----------
INSERT INTO dataset (label, is_synthetic, description) VALUES ('SYN-DEMO-1', true, 'demo scenario');
INSERT INTO region (name) VALUES ('Demo Region');
INSERT INTO state (name, region_id) VALUES ('Demo State', 1);
INSERT INTO district (state_id, name) VALUES (1, 'Demo District');
INSERT INTO institution (permanent_id, name, district_id, pincode)
  VALUES ('SYN-0001', 'Institution A', 1, '600001');
INSERT INTO source_system (code, name, bureau_id) VALUES
  ('PGRC_LOG','PGRC register', (SELECT bureau_id FROM bureau_cell WHERE code='PGRC')),
  ('RB_LOG','RB case file',   (SELECT bureau_id FROM bureau_cell WHERE code='RB'));
INSERT INTO app_user (username, display_name) VALUES ('reviewer1','Demo Reviewer');

INSERT INTO complaint_case (source_id, source_ref, track_type_id, received_on, dataset_id) VALUES
  (1,'P-104',(SELECT track_type_id FROM track_type WHERE code='PGRC_COMPLAINT'),'2026-07-01',1),
  (2,'R-208',(SELECT track_type_id FROM track_type WHERE code='SHOW_CAUSE'),    '2026-07-10',1);
INSERT INTO case_institution_link (case_id, inst_id, method, tier, review_state) VALUES
  (1,1,'EXACT_PERMANENT_ID','HIGH','AUTO_ACCEPTED'),(2,1,'EXACT_PERMANENT_ID','HIGH','AUTO_ACCEPTED');

-- P-104: received 1 Jul (recorded same day), under process 3 Jul
INSERT INTO case_event (case_id,event_type_id,event_time,recorded_at,provenance,to_status_id,to_bureau_id)
  SELECT 1,(SELECT event_type_id FROM event_type WHERE code='RECEIVED'),'2026-07-01 10:00+00','2026-07-01 10:05+00',
         'SOURCE_STATED',(SELECT status_id FROM canonical_status WHERE code='PENDING'),
         (SELECT bureau_id FROM bureau_cell WHERE code='PGRC');
INSERT INTO case_event (case_id,event_type_id,event_time,recorded_at,provenance,to_status_id)
  SELECT 1,(SELECT event_type_id FROM event_type WHERE code='STATUS_CHANGE'),'2026-07-03 11:00+00','2026-07-03 11:02+00',
         'SOURCE_STATED',(SELECT status_id FROM canonical_status WHERE code='UNDER_PROCESS');
-- R-208: HAPPENED 10 Jul but only RECORDED (late import) 18 Jul
INSERT INTO case_event (case_id,event_type_id,event_time,recorded_at,provenance,to_status_id,to_bureau_id)
  SELECT 2,(SELECT event_type_id FROM event_type WHERE code='RECEIVED'),'2026-07-10 09:00+00','2026-07-18 14:00+00',
         'SOURCE_STATED',(SELECT status_id FROM canonical_status WHERE code='UNDER_PROCESS'),
         (SELECT bureau_id FROM bureau_cell WHERE code='RB');

-- engine proposes a relationship 19 Jul; reviewer confirms 20 Jul
INSERT INTO relationship (case_a_id,case_b_id,rel_type_id,tier,recorded_at)
  VALUES (1,2,(SELECT rel_type_id FROM relationship_type WHERE code='RELATED_PARALLEL'),'MEDIUM','2026-07-19 09:00+00');
INSERT INTO relationship_reason (rel_id, reason_code_id)
  SELECT 1, reason_code_id FROM reason_code WHERE code IN ('SAME_INST_HIGH','DIFFERENT_LINEAGE');
INSERT INTO relationship_review (rel_id,status,recorded_at) VALUES (1,'PROPOSED','2026-07-19 09:00+00');
INSERT INTO relationship_review (rel_id,status,decided_by_user_id,rationale,recorded_at)
  VALUES (1,'CONFIRMED',1,'Same institution, parallel tracks, coordinate','2026-07-20 12:00+00');

\echo
\echo '=== T1: system KNEW on 15 Jul (RECORDED basis): expect ONLY P-104'
SELECT c.source_ref, s.code AS status, b.code AS bureau
FROM case_state_asof('2026-07-15 23:59+00','RECORDED') st
JOIN complaint_case c USING (case_id)
JOIN canonical_status s ON s.status_id = st.status_id
JOIN bureau_cell b ON b.bureau_id = st.bureau_id ORDER BY 1;

\echo '=== T2: what HAD HAPPENED by 15 Jul (WORLD basis): expect P-104 AND R-208'
SELECT c.source_ref, s.code AS status, b.code AS bureau
FROM case_state_asof('2026-07-15 23:59+00','WORLD') st
JOIN complaint_case c USING (case_id)
JOIN canonical_status s ON s.status_id = st.status_id
JOIN bureau_cell b ON b.bureau_id = st.bureau_id ORDER BY 1;

\echo '=== T3: relationship review state as-of 19 Jul 12:00 (expect PROPOSED), 21 Jul (expect CONFIRMED), 18 Jul (expect no rows)'
SELECT '19 Jul' AS asof, review_status FROM relationship_asof('2026-07-19 12:00+00');
SELECT '21 Jul' AS asof, review_status FROM relationship_asof('2026-07-21 12:00+00');
SELECT '18 Jul' AS asof, review_status FROM relationship_asof('2026-07-18 12:00+00');

\echo '=== T4: correction event supersedes an earlier event (P-104 status wrongly UNDER_PROCESS -> corrected to PENDING)'
INSERT INTO case_event (case_id,event_type_id,event_time,recorded_at,provenance,to_status_id,corrects_event_id)
  SELECT 1,(SELECT event_type_id FROM event_type WHERE code='CORRECTION'),'2026-07-03 11:00+00','2026-07-25 08:00+00',
         'SOURCE_STATED',(SELECT status_id FROM canonical_status WHERE code='PENDING'), 2;
SELECT '24 Jul (before correction recorded)' AS asof, s.code FROM case_state_asof('2026-07-24 00:00+00') st
  JOIN canonical_status s USING (status_id) WHERE st.case_id = 1;
SELECT '26 Jul (after correction recorded)'  AS asof, s.code FROM case_state_asof('2026-07-26 00:00+00') st
  JOIN canonical_status s USING (status_id) WHERE st.case_id = 1;

\echo
\echo '=== GUARD CHECKS: every statement below MUST fail ==='
\echo '-- G1 UPDATE on append-only case_event'
UPDATE case_event SET remarks = 'tamper' WHERE event_id = 1;
\echo '-- G2 DELETE on append-only relationship_review'
DELETE FROM relationship_review;
\echo '-- G3 enabling an unverified, non-demo rule'
INSERT INTO rule (kind,name,enabled) VALUES ('SLA','bad rule',true);
\echo '-- G4 claiming verified without source and reviewer'
INSERT INTO rule (kind,name,is_verified) VALUES ('SLA','bad rule 2',true);
\echo '-- G5 relationship pair in wrong order (a > b)'
INSERT INTO relationship (case_a_id,case_b_id,rel_type_id,tier) VALUES (2,1,1,'LOW');
\echo '-- G6 dismissing without a rationale'
INSERT INTO relationship_review (rel_id,status,decided_by_user_id) VALUES (1,'DISMISSED',1);
\echo '-- G7 signal with two value kinds at once'
INSERT INTO signal (case_id,signal_type_id,value_text,doc_id,method,tier)
  VALUES (1,1,'x',1,'RULE_EXACT','HIGH');
\echo '-- G8 unit that belongs to a different institution'
INSERT INTO institution (permanent_id,name) VALUES ('SYN-0002','Institution B');
INSERT INTO institution_unit (inst_id,unit_name) VALUES (2,'B campus');
INSERT INTO case_institution_link (case_id,inst_id,unit_id,method,tier,review_state) VALUES (1,1,1,'MANUAL','HIGH','AUTO_ACCEPTED');
\echo '-- G9 duplicate source case ID'
INSERT INTO complaint_case (source_id,source_ref,track_type_id,received_on,dataset_id) VALUES (1,'P-104',1,'2026-07-01',1);
\echo '-- G10 case without a dataset label'
INSERT INTO complaint_case (source_id,source_ref,track_type_id,received_on) VALUES (1,'P-999',1,'2026-07-01');

\echo
\echo '=== ALLOWED: a demo-flagged rule CAN be enabled (labelled illustrative) ==='
INSERT INTO rule (kind,name,enabled,is_demo) VALUES ('SLA','demo SLA (illustrative)',true,true);
SELECT rule_id, name, enabled, is_verified, is_demo FROM rule;

\echo
\echo '=== T5: audit hash chain ==='
INSERT INTO audit_event (actor_user_id,action_id,target_table,target_id,reason)
  VALUES (1,(SELECT action_id FROM audit_action WHERE code='RELATIONSHIP_DECISION'),'relationship','1','confirmed');
INSERT INTO audit_event (actor_user_id,action_id,target_table,target_id,reason)
  VALUES (1,(SELECT action_id FROM audit_action WHERE code='UNMASK'),'case_text','1','demo unmask');
INSERT INTO audit_event (actor_user_id,action_id,target_table,target_id)
  VALUES (1,(SELECT action_id FROM audit_action WHERE code='EXPORT'),'report','monthly');
SELECT 'intact chain -> first broken id (NULL = intact)' AS check, audit_verify() AS result;
BEGIN;
ALTER TABLE audit_event DISABLE TRIGGER trg_audit_event_ro;      -- simulate an insider bypassing the guard
UPDATE audit_event SET reason = 'edited later' WHERE audit_id = 2;
SELECT 'after tampering row 2 -> first broken id' AS check, audit_verify() AS result;
ROLLBACK;
SELECT 'after rollback -> intact again' AS check, audit_verify() AS result;

\echo
\echo '=== T6: evidence reuse = plain query on document.sha256 (no extra table needed) ==='
INSERT INTO document (case_id,uri,sha256) VALUES
  (1,'file://syn/report_a.pdf', sha256('same-bytes'::bytea)),
  (2,'file://syn/report_copy.pdf', sha256('same-bytes'::bytea));
SELECT d1.case_id AS case_a, d2.case_id AS case_b FROM document d1
JOIN document d2 ON d1.sha256 = d2.sha256 AND d1.case_id < d2.case_id;

\echo
\echo '=== T7: current-state view and derived region ==='
SELECT c.source_ref, s.code AS status, b.code AS bureau
FROM v_case_current v JOIN complaint_case c USING (case_id)
JOIN canonical_status s ON s.status_id = v.status_id
JOIN bureau_cell b ON b.bureau_id = v.bureau_id ORDER BY 1;
SELECT inst_id, region_name FROM v_institution_region WHERE inst_id = 1;

\echo
\echo '=== T8: Real-Time Dashboard KPIs & Bureau Workload ==='
SELECT * FROM v_dashboard_kpis;
SELECT * FROM v_dashboard_bureau_workload;
SELECT * FROM v_dashboard_aging_breakdown;

\echo
\echo '=== T9: Contradiction Sentinel (PGRC Disposed vs RB Under Process/Show Cause) ==='
-- Simulate PGRC marking P-104 as DISPOSED (clean chit issued), while R-208 in RB is still UNDER_PROCESS
INSERT INTO case_event (case_id,event_type_id,event_time,recorded_at,provenance,to_status_id)
  SELECT 1,(SELECT event_type_id FROM event_type WHERE code='DISPOSAL'),'2026-07-28 10:00+00','2026-07-28 10:05+00',
         'SOURCE_STATED',(SELECT status_id FROM canonical_status WHERE code='DISPOSED');

SELECT institution_name, bureau_a_code, bureau_a_status, bureau_b_code, bureau_b_status, severity, warning_message
FROM v_cross_bureau_contradictions;

\echo
\echo '=== T10: Inter-Bureau Joint Review Session Protocol ==='
INSERT INTO joint_review_session (inst_id, initiator_bureau_id, target_bureau_id, initiated_by_user_id, coordination_reason)
  VALUES (1, (SELECT bureau_id FROM bureau_cell WHERE code='RB'), (SELECT bureau_id FROM bureau_cell WHERE code='PGRC'), 1,
          'Contradiction detected: PGRC disposed complaint while RB Show-Cause notice is active');
INSERT INTO joint_review_case (session_id, case_id) VALUES (1, 1), (1, 2);

SELECT session_id, inst_id, status, coordination_reason, created_at FROM joint_review_session;

\echo '-- Guard check: mutation on joint_review_case MUST fail (append-only)'
DELETE FROM joint_review_case WHERE session_id = 1;
