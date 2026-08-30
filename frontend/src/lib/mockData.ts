import type {
  Trainee, DSIGNode, DSIGEdge, OutcomeEvent, EvidenceRecord,
  ProviderScorecard, RegionalSkillGap, PolicyInsight, IdentityMatchResult
} from '@/types'

export const MOCK_TRAINEE: Trainee = {
  trainee_id: 'T001',
  name: 'Ravi Kumar',
  email: 'ravi.kumar@example.com',
  phone: '+91 98765 43210',
  program: 'Advanced Welding (NSQF L5)',
  provider: 'PMKVY National Training Center',
  enrollment_date: '2023-01-15',
  completion_date: '2023-04-30',
  status: 'active',
}

export const MOCK_DSIG_NODES: DSIGNode[] = [
  {
    id: 'core-T001',
    node_id: 'core-T001',
    trainee_id: 'T001',
    node_type: 'identity',
    label: 'Trainee Core',
    value: 'T001',
    is_active: true,
    valid_from: '2023-01-15',
    valid_until: null,
    confidence: 1.0,
    verification_method: 'platform_registration',
  },
  {
    id: 'phone-A',
    node_id: 'phone-A',
    trainee_id: 'T001',
    node_type: 'phone',
    label: 'Primary Phone (Historical)',
    value: '+91 91234 56780',
    is_active: false,
    valid_from: '2023-01-15',
    valid_until: '2023-09-01',
    confidence: 0.95,
    verification_method: 'otp_verified',
  },
  {
    id: 'phone-B',
    node_id: 'phone-B',
    trainee_id: 'T001',
    node_type: 'phone',
    label: 'Primary Phone (Active)',
    value: '+91 98765 43210',
    is_active: true,
    valid_from: '2023-09-01',
    valid_until: null,
    confidence: 0.98,
    verification_method: 'digilocker_ekyc',
  },
  {
    id: 'email-1',
    node_id: 'email-1',
    trainee_id: 'T001',
    node_type: 'email',
    label: 'Verified Email',
    value: 'ravi.kumar@example.com',
    is_active: true,
    valid_from: '2023-01-15',
    valid_until: null,
    confidence: 0.97,
    verification_method: 'email_otp',
  },
  {
    id: 'training-1',
    node_id: 'training-1',
    trainee_id: 'T001',
    node_type: 'training',
    label: 'Training ID (NSQF L5)',
    value: 'PMKVY-2023-T001',
    is_active: true,
    valid_from: '2023-01-15',
    valid_until: null,
    confidence: 1.0,
    verification_method: 'provider_record',
  },
  {
    id: 'employer-A',
    node_id: 'employer-A',
    trainee_id: 'T001',
    node_type: 'employer',
    label: 'ABC Manufacturing (Active)',
    value: 'ABC Manufacturing Pvt Ltd',
    is_active: true,
    valid_from: '2023-09-15',
    valid_until: null,
    confidence: 0.86,
    verification_method: 'employer_attestation',
  },
  {
    id: 'employer-B',
    node_id: 'employer-B',
    trainee_id: 'T001',
    node_type: 'employer',
    label: 'XYZ Fabricators (Former)',
    value: 'XYZ Fabricators',
    is_active: false,
    valid_from: '2023-06-01',
    valid_until: '2023-09-10',
    confidence: 0.78,
    verification_method: 'payslip_evidence',
  },
]

export const MOCK_DSIG_EDGES: DSIGEdge[] = [
  { id: 'e1', edge_id: 'e1', source: 'core-T001', target: 'phone-A', edge_type: 'has_anchor', label: 'Primary Phone (Jan–Sep 2023)', valid_from: '2023-01-15', valid_until: '2023-09-01', confidence: 0.95 },
  { id: 'e2', edge_id: 'e2', source: 'phone-A', target: 'phone-B', edge_type: 'phone_change', label: 'Phone Updated Sep 2023', valid_from: '2023-09-01', valid_until: null, confidence: 0.98 },
  { id: 'e3', edge_id: 'e3', source: 'core-T001', target: 'email-1', edge_type: 'has_anchor', label: 'Verified Email', valid_from: '2023-01-15', valid_until: null, confidence: 0.97 },
  { id: 'e4', edge_id: 'e4', source: 'core-T001', target: 'training-1', edge_type: 'has_anchor', label: 'NSQF Training ID', valid_from: '2023-01-15', valid_until: null, confidence: 1.0 },
  { id: 'e5', edge_id: 'e5', source: 'phone-B', target: 'employer-A', edge_type: 'employed_by', label: 'ABC Mfg (Current)', valid_from: '2023-09-15', valid_until: null, confidence: 0.86 },
  { id: 'e6', edge_id: 'e6', source: 'phone-A', target: 'employer-B', edge_type: 'employed_by', label: 'XYZ Fabricators (Former)', valid_from: '2023-06-01', valid_until: '2023-09-10', confidence: 0.78 },
]

export const MOCK_OUTCOMES: OutcomeEvent[] = [
  { event_id: 'EV001', trainee_id: 'T001', event_type: 'employment', employer_name: 'XYZ Fabricators', employer_gstn: null, role: 'Junior Welder', wage_monthly: 15000, start_date: '2023-06-01', end_date: '2023-09-10', milestone: '3M', confidence_score: 0.78, verification_status: 'verified', evidence_count: 2 },
  { event_id: 'EV002', trainee_id: 'T001', event_type: 'unknown', employer_name: null, employer_gstn: null, role: null, wage_monthly: null, start_date: '2023-09-11', end_date: '2023-09-14', milestone: '6M', confidence_score: 0.0, verification_status: 'pending', evidence_count: 0 },
  { event_id: 'EV003', trainee_id: 'T001', event_type: 'employment', employer_name: 'ABC Manufacturing Pvt Ltd', employer_gstn: '33AABCA1234B1Z5', role: 'CNC Operator', wage_monthly: 18000, start_date: '2023-09-15', end_date: null, milestone: '6M', confidence_score: 0.86, verification_status: 'verified', evidence_count: 3 },
  { event_id: 'EV004', trainee_id: 'T001', event_type: 'employment', employer_name: 'ABC Manufacturing Pvt Ltd', employer_gstn: '33AABCA1234B1Z5', role: 'CNC Operator (Senior)', wage_monthly: 20000, start_date: '2024-04-01', end_date: null, milestone: '12M', confidence_score: 0.91, verification_status: 'verified', evidence_count: 4 },
]

export const MOCK_EVIDENCE: EvidenceRecord[] = [
  {
    evidence_id: 'DOC001',
    trainee_id: 'T001',
    event_id: 'EV003',
    evidence_type: 'payslip',
    filename: 'payslip_oct2023.pdf',
    upload_date: '2023-10-30T18:45:00',
    ocr_status: 'completed',
    extracted_fields: {
      employer: { value: 'ABC Manufacturing Pvt Ltd', confidence: 0.97 },
      role: { value: 'CNC Operator', confidence: 0.94 },
      date: { value: '01 Oct 2023', confidence: 0.99 },
      wage: { value: '₹18,000', confidence: 0.96 },
    },
    document_consistency: 0.93,
    claim_match_score: 0.91,
  },
  {
    evidence_id: 'DOC002',
    trainee_id: 'T001',
    event_id: 'EV003',
    evidence_type: 'offer_letter',
    filename: 'offer_letter_sept2023.pdf',
    upload_date: '2023-09-16T10:00:00',
    ocr_status: 'completed',
    extracted_fields: {
      employer: { value: 'ABC Manufacturing Pvt Ltd', confidence: 0.99 },
      role: { value: 'CNC Operator', confidence: 0.98 },
      date: { value: '15 Sep 2023', confidence: 0.99 },
      wage: { value: '₹18,000', confidence: 0.95 },
    },
    document_consistency: 0.96,
    claim_match_score: 0.94,
  },
  {
    evidence_id: 'DOC003',
    trainee_id: 'T001',
    event_id: 'EV003',
    evidence_type: 'employer_attestation',
    filename: 'employer_attestation.json',
    upload_date: '2023-10-02T09:15:00',
    ocr_status: 'completed',
    extracted_fields: null,
    document_consistency: 1.0,
    claim_match_score: 1.0,
  },
]

export const MOCK_PROVIDERS: ProviderScorecard[] = [
  { provider_id: 'P001', provider_name: 'PMKVY National Training Center', total_trainees: 1240, placement_rate_3m: 0.72, placement_rate_6m: 0.81, placement_rate_12m: 0.76, wage_adequacy_score: 0.78, retention_rate_6m: 0.68, evidence_quality_score: 0.84 },
  { provider_id: 'P002', provider_name: 'DDUGKY Skills Hub (Madurai)', total_trainees: 890, placement_rate_3m: 0.61, placement_rate_6m: 0.69, placement_rate_12m: 0.64, wage_adequacy_score: 0.65, retention_rate_6m: 0.59, evidence_quality_score: 0.71 },
  { provider_id: 'P003', provider_name: 'NAPS Apprenticeship Hub (TN)', total_trainees: 456, placement_rate_3m: 0.88, placement_rate_6m: 0.91, placement_rate_12m: 0.87, wage_adequacy_score: 0.82, retention_rate_6m: 0.79, evidence_quality_score: 0.92 },
]

export const MOCK_SKILL_GAPS: RegionalSkillGap[] = [
  { 
    district_name: 'Madurai', 
    state: 'Tamil Nadu', 
    lat: 9.9252, 
    lng: 78.1198, 
    skill_demand_score: 88, 
    skill_supply_score: 62, 
    gap_ratio: 0.28, 
    top_demanded_skills: ['CNC Machine Operation', 'Precision Welding (L5)', 'Auto Components'], 
    top_supplied_skills: ['Retail Sales', 'Basic IT Support', 'Data Entry'] 
  },
  { 
    district_name: 'Coimbatore', 
    state: 'Tamil Nadu', 
    lat: 11.0168, 
    lng: 76.9558, 
    skill_demand_score: 84, 
    skill_supply_score: 59, 
    gap_ratio: 0.27, 
    top_demanded_skills: ['Industrial Automation', 'Pump Fabrication', 'Textile Machinery'], 
    top_supplied_skills: ['General IT', 'Customer Service', 'Retail'] 
  },
  { 
    district_name: 'Tiruchirappalli', 
    state: 'Tamil Nadu', 
    lat: 10.7905, 
    lng: 78.7047, 
    skill_demand_score: 74, 
    skill_supply_score: 51, 
    gap_ratio: 0.26, 
    top_demanded_skills: ['Heavy Boiler Welding', 'Fabrication Quality Audit', 'Thermal Plant Mechanics'], 
    top_supplied_skills: ['Electrical Maintenance', 'Logistics', 'Retail'] 
  },
  { 
    district_name: 'Chennai', 
    state: 'Tamil Nadu', 
    lat: 13.0827, 
    lng: 80.2707, 
    skill_demand_score: 92, 
    skill_supply_score: 68, 
    gap_ratio: 0.26, 
    top_demanded_skills: ['EV Assembly & Diagnostics', 'Robotics Technician', 'Industrial IoT'], 
    top_supplied_skills: ['Software QA', 'BPO Support', 'Telecom'] 
  },
  { 
    district_name: 'Salem', 
    state: 'Tamil Nadu', 
    lat: 11.6643, 
    lng: 78.1460, 
    skill_demand_score: 66, 
    skill_supply_score: 49, 
    gap_ratio: 0.25, 
    top_demanded_skills: ['Steel Fabrication', 'Textile Dyeing & Process', 'Sago & Food Automation'], 
    top_supplied_skills: ['Agriculture Tech', 'Retail Sales', 'Basic Wiring'] 
  },
  { 
    district_name: 'Tirunelveli', 
    state: 'Tamil Nadu', 
    lat: 8.7139, 
    lng: 77.7567, 
    skill_demand_score: 60, 
    skill_supply_score: 45, 
    gap_ratio: 0.25, 
    top_demanded_skills: ['Renewable Wind Energy Tech', 'Solar Grid Installation', 'Food Processing'], 
    top_supplied_skills: ['General Electrical', 'Masonry', 'Retail'] 
  },
]

export const MOCK_POLICY_INSIGHTS: PolicyInsight[] = [
  { id: 'PI001', title: 'Expand Precision Welding Seats in Madurai', description: 'Industrial clusters in Madurai & Kappalur demonstrate 28% skill deficit in NSQF L5 welding and CNC setup. Increase subsidized seats for regional PMKVY centers.', priority: 'high', category: 'skill', data_point: '14,200 unfilled regional slots' },
  { id: 'PI002', title: 'PMKVY Center Outperforms on 6M Outcomes', description: 'PMKVY National Training Center shows 81% placement rate at 6M vs 69% sector average. Replicate curriculum and employer linkage model to other providers.', priority: 'high', category: 'provider', data_point: '81% vs 69% sector average' },
  { id: 'PI003', title: 'Coimbatore-Tirupur Industrial Corridor', description: 'Manufacturing corridor shows consistent 27% gap ratio. CNC operation, fabrication, and industrial automation are critically under-supplied.', priority: 'medium', category: 'region', data_point: '27% gap ratio, 2 districts' },
  { id: 'PI004', title: 'Enhance Evidence Quality Standards', description: 'Only 71% of providers meet minimum evidence quality score (0.80 threshold). Mandate digital employer attestation to improve data integrity.', priority: 'medium', category: 'provider', data_point: '29% providers below threshold' },
  { id: 'PI005', title: 'Gig Worker Outcome Tracking Gap', description: 'Gig and self-employment outcomes are 4x harder to verify than formal employment. Develop alternative evidence pathways (platform data, UPI records).', priority: 'low', category: 'funding', data_point: '4x verification difficulty ratio' },
]

export const MOCK_IDENTITY_MATCH: IdentityMatchResult = {
  same_person_probability: 0.94,
  factors: {
    name_score: 0.96,
    course_match: 0.98,
    employer_history_match: 0.87,
    geographic_plausibility: 0.91,
  },
  reasons: [
    'Same training course history (Advanced Welding NSQF L5)',
    'Verified email anchor matches',
    'Historical training ID is consistent',
    'Plausible geographic transition (same cluster)',
  ],
  recommendation: 'Approve identity merge. Confidence exceeds 0.90 threshold with 4 corroborating factors.',
}

export const TIMELINE_MILESTONES = [
  { milestone: 'Train', date: '30 Apr 2023', status: 'completed', label: 'Training Completed', employer: null, wage: null, confidence: 1.0, color: 'gov-green' },
  { milestone: '3M', date: '30 Jul 2023', status: 'completed', label: 'Employed — XYZ Fabricators', employer: 'XYZ Fabricators', wage: 15000, confidence: 0.78, color: 'gov-blue' },
  { milestone: '6M', date: '30 Oct 2023', status: 'current', label: 'Employed — ABC Manufacturing', employer: 'ABC Manufacturing Pvt Ltd', wage: 18000, confidence: 0.86, color: 'gov-blue' },
  { milestone: 'Unknown', date: 'Sep 2023', status: 'unknown', label: 'No Evidence Yet', employer: null, wage: null, confidence: 0.0, color: 'gov-amber' },
  { milestone: '12M', date: '30 Apr 2024', status: 'completed', label: 'Employed — ABC Manufacturing', employer: 'ABC Manufacturing Pvt Ltd', wage: 20000, confidence: 0.91, color: 'gov-blue' },
  { milestone: '24M', date: 'Apr 2025', status: 'pending', label: 'Follow-up Scheduled', employer: null, wage: null, confidence: 0.0, color: 'gov-gray' },
]
