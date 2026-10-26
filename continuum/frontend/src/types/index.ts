export interface Trainee {
  trainee_id: string
  name: string
  email: string
  phone: string
  program: string
  provider: string
  enrollment_date: string
  completion_date: string | null
  status: string
}

export type DSIGNode = {
  id: string
  node_id: string
  trainee_id: string
  node_type: 'identity' | 'phone' | 'email' | 'employer' | 'training'
  label: string
  value: string
  is_active: boolean
  valid_from: string
  valid_until: string | null
  confidence: number
  verification_method: string
  [key: string]: unknown
}

export type DSIGEdge = {
  id: string
  edge_id: string
  source: string
  target: string
  edge_type: string
  label: string
  valid_from: string
  valid_until: string | null
  confidence: number
  [key: string]: unknown
}

export type OutcomeType = 'employment' | 'self_employment' | 'gig' | 'apprenticeship' | 'unemployment' | 'unknown'
export type MilestoneType = '3M' | '6M' | '12M' | '24M' | 'current'
export type VerificationStatus = 'pending' | 'verified' | 'disputed'

export interface OutcomeEvent {
  event_id: string
  trainee_id: string
  event_type: OutcomeType
  employer_name: string | null
  employer_gstn: string | null
  role: string | null
  wage_monthly: number | null
  start_date: string
  end_date: string | null
  milestone: MilestoneType
  confidence_score: number
  verification_status: VerificationStatus
  evidence_count: number
}

export type EvidenceType = 'payslip' | 'offer_letter' | 'apprenticeship_doc' | 'employer_attestation'

export interface EvidenceRecord {
  evidence_id: string
  trainee_id: string
  event_id: string | null
  evidence_type: EvidenceType
  filename: string
  upload_date: string
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed'
  extracted_fields: Record<string, { value: string; confidence: number }> | null
  document_consistency: number | null
  claim_match_score: number | null
}

export interface ProviderScorecard {
  provider_id: string
  provider_name: string
  total_trainees: number
  placement_rate_3m: number
  placement_rate_6m: number
  placement_rate_12m: number
  wage_adequacy_score: number
  retention_rate_6m: number
  evidence_quality_score: number
}

export interface RegionalSkillGap {
  district_name: string
  state: string
  lat: number
  lng: number
  skill_demand_score: number
  skill_supply_score: number
  gap_ratio: number
  top_demanded_skills: string[]
  top_supplied_skills: string[]
}

export interface PolicyInsight {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'provider' | 'skill' | 'region' | 'funding'
  data_point: string
}

export interface IdentityMatchResult {
  same_person_probability: number
  factors: {
    name_score: number
    course_match: number
    employer_history_match: number
    geographic_plausibility: number
  }
  reasons: string[]
  recommendation: string
}
