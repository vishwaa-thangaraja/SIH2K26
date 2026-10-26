import os
import json
from datetime import date, datetime, timezone
from sqlmodel import Session, select

from database import engine, create_db_and_tables
from models.trainee import Trainee, DSIGNode, DSIGEdge
from models.outcome import OutcomeEvent, EvidenceRecord
from models.provider import ProviderScorecard, RegionalSkillGap
from models.training_intake import TrainingRecord, AssessmentRecord, CertificationRecord, TraineeSkill, ImportBatchLog
from models.communication import CommunicationLog

def p_date(v):
    if not v:
        return None
    if isinstance(v, str):
        try:
            return datetime.strptime(v[:10], '%Y-%m-%d').date()
        except Exception:
            return None
    return v

def p_dt(v):
    if not v:
        return None
    if isinstance(v, str):
        try:
            return datetime.fromisoformat(v)
        except Exception:
            try:
                return datetime.strptime(v[:19], '%Y-%m-%d %H:%M:%S')
            except Exception:
                return datetime.now(timezone.utc)
    return v

def seed_all():
    create_db_and_tables()
    seed_path = os.path.join(os.path.dirname(__file__), 'initial_seed.json')

    with Session(engine) as db:
        if os.path.exists(seed_path):
            try:
                with open(seed_path, 'r', encoding='utf-8') as f:
                    seed_dict = json.load(f)

                # 1. Trainees
                if not db.exec(select(Trainee)).first() and 'trainee' in seed_dict:
                    for r in seed_dict.get('trainee', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['enrollment_date'] = p_date(d.get('enrollment_date'))
                        d['completion_date'] = p_date(d.get('completion_date'))
                        d['date_of_birth'] = p_date(d.get('date_of_birth'))
                        db.add(Trainee(**d))
                    db.commit()

                # 2. DSIG Nodes
                if not db.exec(select(DSIGNode)).first() and 'dsignode' in seed_dict:
                    for r in seed_dict.get('dsignode', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['is_active'] = bool(d.get('is_active', True))
                        d['valid_from'] = p_date(d.get('valid_from'))
                        d['valid_until'] = p_date(d.get('valid_until'))
                        db.add(DSIGNode(**d))
                    db.commit()

                # 3. DSIG Edges
                if not db.exec(select(DSIGEdge)).first() and 'dsigedge' in seed_dict:
                    for r in seed_dict.get('dsigedge', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['valid_from'] = p_date(d.get('valid_from'))
                        d['valid_until'] = p_date(d.get('valid_until'))
                        db.add(DSIGEdge(**d))
                    db.commit()

                # 4. Outcomes
                if not db.exec(select(OutcomeEvent)).first() and 'outcomeevent' in seed_dict:
                    for r in seed_dict.get('outcomeevent', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['start_date'] = p_date(d.get('start_date'))
                        d['end_date'] = p_date(d.get('end_date'))
                        db.add(OutcomeEvent(**d))
                    db.commit()

                # 5. Evidence Records
                if not db.exec(select(EvidenceRecord)).first() and 'evidencerecord' in seed_dict:
                    for r in seed_dict.get('evidencerecord', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['upload_date'] = p_dt(d.get('upload_date'))
                        db.add(EvidenceRecord(**d))
                    db.commit()

                # 6. Provider Scorecards
                if not db.exec(select(ProviderScorecard)).first() and 'providerscorecard' in seed_dict:
                    for r in seed_dict.get('providerscorecard', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['updated_at'] = p_dt(d.get('updated_at'))
                        db.add(ProviderScorecard(**d))
                    db.commit()

                # 7. Regional Skill Gaps
                if not db.exec(select(RegionalSkillGap)).first() and 'regionalskillgap' in seed_dict:
                    for r in seed_dict.get('regionalskillgap', []):
                        d = dict(r)
                        d.pop('id', None)
                        db.add(RegionalSkillGap(**d))
                    db.commit()

                # 8. Training Records
                if not db.exec(select(TrainingRecord)).first() and 'trainingrecord' in seed_dict:
                    for r in seed_dict.get('trainingrecord', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['training_start_date'] = p_date(d.get('training_start_date'))
                        d['training_end_date'] = p_date(d.get('training_end_date'))
                        d['created_at'] = p_dt(d.get('created_at'))
                        db.add(TrainingRecord(**d))
                    db.commit()

                # 9. Assessment Records
                if not db.exec(select(AssessmentRecord)).first() and 'assessmentrecord' in seed_dict:
                    for r in seed_dict.get('assessmentrecord', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['assessment_date'] = p_date(d.get('assessment_date'))
                        db.add(AssessmentRecord(**d))
                    db.commit()

                # 10. Certification Records
                if not db.exec(select(CertificationRecord)).first() and 'certificationrecord' in seed_dict:
                    for r in seed_dict.get('certificationrecord', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['certification_date'] = p_date(d.get('certification_date'))
                        db.add(CertificationRecord(**d))
                    db.commit()

                # 11. Trainee Skills
                if not db.exec(select(TraineeSkill)).first() and 'traineeskill' in seed_dict:
                    for r in seed_dict.get('traineeskill', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['acquired_date'] = p_date(d.get('acquired_date'))
                        db.add(TraineeSkill(**d))
                    db.commit()

                # 12. Import Batch Logs
                if not db.exec(select(ImportBatchLog)).first() and 'importbatchlog' in seed_dict:
                    for r in seed_dict.get('importbatchlog', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['imported_at'] = p_dt(d.get('imported_at'))
                        db.add(ImportBatchLog(**d))
                    db.commit()

                # 13. Communication Logs
                if not db.exec(select(CommunicationLog)).first() and 'communicationlog' in seed_dict:
                    for r in seed_dict.get('communicationlog', []):
                        d = dict(r)
                        d.pop('id', None)
                        d['is_simulated'] = bool(d.get('is_simulated', True))
                        d['response_received'] = bool(d.get('response_received', False))
                        d['sent_at'] = p_dt(d.get('sent_at'))
                        d['responded_at'] = p_dt(d.get('responded_at'))
                        db.add(CommunicationLog(**d))
                    db.commit()

                print('[CONTINUUM SEED] Successfully verified and initialized all 13 database tables.')
                return

            except Exception as e:
                print(f'[CONTINUUM SEED] Warning: Error during initial_seed.json ingestion: {e}')

        # Fallback manual seed if initial_seed.json is absent
        if not db.exec(select(Trainee)).first():
            t = Trainee(
                trainee_id='T001', name='Ravi Kumar', email='ravi.kumar@example.com',
                phone='+91 98765 43210', program='Advanced Welding (NSQF L5)',
                provider='PMKVY National Training Center (Madurai)', enrollment_date=date(2023, 1, 15),
                completion_date=date(2023, 4, 30), status='completed'
            )
            db.add(t)

        if not db.exec(select(RegionalSkillGap)).first():
            gaps = [
                RegionalSkillGap(district_name='Madurai', state='Tamil Nadu', lat=9.9252, lng=78.1198, skill_demand_score=88, skill_supply_score=62, gap_ratio=1.42, top_demanded_skills=json.dumps(['CNC Machine Operation', 'Precision Welding (L5)', 'Auto Components']), top_supplied_skills='[]'),
                RegionalSkillGap(district_name='Coimbatore', state='Tamil Nadu', lat=11.0168, lng=76.9558, skill_demand_score=84, skill_supply_score=59, gap_ratio=1.42, top_demanded_skills=json.dumps(['Industrial Automation', 'Pump Fabrication', 'Textile Machinery']), top_supplied_skills='[]'),
                RegionalSkillGap(district_name='Tiruchirappalli', state='Tamil Nadu', lat=10.7905, lng=78.7047, skill_demand_score=74, skill_supply_score=51, gap_ratio=1.45, top_demanded_skills=json.dumps(['Heavy Boiler Welding', 'Fabrication Quality Audit', 'Thermal Plant Mechanics']), top_supplied_skills='[]'),
                RegionalSkillGap(district_name='Chennai', state='Tamil Nadu', lat=13.0827, lng=80.2707, skill_demand_score=92, skill_supply_score=68, gap_ratio=1.35, top_demanded_skills=json.dumps(['EV Assembly & Diagnostics', 'Robotics Technician', 'Industrial IoT']), top_supplied_skills='[]'),
                RegionalSkillGap(district_name='Salem', state='Tamil Nadu', lat=11.6643, lng=78.1460, skill_demand_score=66, skill_supply_score=49, gap_ratio=1.35, top_demanded_skills=json.dumps(['Steel Fabrication', 'Textile Dyeing & Process', 'Food Automation']), top_supplied_skills='[]')
            ]
            db.add_all(gaps)

        db.commit()
        print('[CONTINUUM SEED] Database initialization completed.')

if __name__ == '__main__':
    seed_all()
