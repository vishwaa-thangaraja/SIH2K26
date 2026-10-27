// AICTE Approval Process Handbook (APH) Regulatory Master Dataset & Rules

export const REGIONS = [
  { id: 'NRO', name: 'Northern Regional Office', hq: 'Kanpur', states: 'UP, Uttarakhand', active: 342, pending: 48, overdue: 6 },
  { id: 'NWRO', name: 'North Western Regional Office', hq: 'Chandigarh', states: 'Punjab, Haryana, HP, J&K, Delhi', active: 289, pending: 31, overdue: 3 },
  { id: 'WRO', name: 'Western Regional Office', hq: 'Mumbai', states: 'Maharashtra, Goa', active: 512, pending: 72, overdue: 11 },
  { id: 'SRO', name: 'Southern Regional Office', hq: 'Chennai', states: 'Tamil Nadu, Puducherry', active: 620, pending: 84, overdue: 9 },
  { id: 'SWRO', name: 'South Western Regional Office', hq: 'Bengaluru', states: 'Karnataka, Kerala', active: 480, pending: 56, overdue: 7 },
  { id: 'CRO', name: 'Central Regional Office', hq: 'Bhopal', states: 'MP, Chhattisgarh, Gujarat', active: 310, pending: 39, overdue: 4 },
  { id: 'ERO', name: 'Eastern Regional Office', hq: 'Kolkata', states: 'WB, Bihar, Odisha, Jharkhand', active: 275, pending: 42, overdue: 5 },
  { id: 'SCRO', name: 'South Central Regional Office', hq: 'Hyderabad', states: 'AP, Telangana', active: 490, pending: 63, overdue: 8 }
];

export const ROLES = [
  { id: 'INSTITUTE', label: 'Institutional Applicant', name: 'Dr. R. Ramanathan (Principal)', org: 'Delhi Inst. of Tech & Science (PID: 1-9382103)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'RO', label: 'Regional Officer (RO)', name: 'Shri Arvind Verma, IES', org: 'Northern Regional Office, Kanpur', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'SCRUTINY_EXPERT', label: 'Scrutiny Committee Convener', name: 'Prof. S. K. Mukherjee', org: 'AICTE State Scrutiny Board', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'EVC_COORDINATOR', label: 'EVC Coordinator & Expert', name: 'Dr. Meenakshi Sundaram', org: 'National Expert Visit Panel', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'COMPETENT_AUTH', label: 'Competent Authority (HQ)', name: 'Prof. T. G. Sitharam (Member Secy)', org: 'AICTE HQ, Nelson Mandela Marg, New Delhi', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'ADMIN', label: 'System Administrator', name: 'Er. Rajesh K. (Director - IT)', org: 'AICTE e-Governance Division', badge: 'bg-slate-100 text-slate-800 border-slate-300' }
];

export const WORKFLOW_TRACKS = [
  { id: 'SCRUTINY_ONLY', name: 'Track A: Only Scrutiny', desc: 'Standard EoA (Extension of Approval) without infrastructure change', stages: ['Application Submitted', 'Preliminary Verification', 'Scrutiny', 'Competent Authority Approval', 'EoA Issued'] },
  { id: 'SCRUTINY_EVC', name: 'Track B: Scrutiny + EVC', desc: 'New Institutions, Increase in Intake, or Addition of New Courses', stages: ['Application Submitted', 'Preliminary Verification', 'Scrutiny', 'EVC Scheduling', 'EVC Inspection', 'Scrutiny of EVC Report', 'Competent Authority Approval'] },
  { id: 'EVC_SAC_SHC', name: 'Track C: EVC + SAC/SHC', desc: 'Appeal cases, major infrastructure deficiencies or complaints', stages: ['Application Submitted', 'Initial Review', 'EVC Inspection', 'Standing Hearing Committee (SHC)', 'Standing Appellate Committee (SAC)', 'Final Decision'] },
  { id: 'ONLY_EVC', name: 'Track D: Surprise / Focused EVC', desc: 'Direct verification of unfulfilled undertakings or compliance', stages: ['Order Issued', 'EVC Dispatch', 'Physical Inspection', 'Compliance Verification', 'Report Ratification'] }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 'APP-2026-NRO-1042',
    pid: '1-9382103',
    instName: 'Delhi Institute of Technology & Science',
    type: 'New Technical Campus Setup (Engineering & Management)',
    region: 'NRO',
    track: 'SCRUTINY_EVC',
    currentStage: 'Scrutiny',
    subStage: 'Document & Faculty Cadre Verification',
    submittedDate: '2026-10-14',
    daysInCurrentStage: 13, // Near SLA breach!
    slaDays: 14,
    status: 'In Progress',
    riskScore: 78,
    assignedTo: 'Prof. S. K. Mukherjee (Scrutiny Committee)',
    landAreaAcres: 7.5,
    builtUpAreaSqM: 14200,
    leaseValidUntil: '2056-03-31',
    deficiencies: ['Principal qualification equivalence certificate pending', 'Fire Safety NOC under local renewal'],
    undertakingRequired: true,
    undertakingDetails: {
      type: 'Laboratories Setup for AI & ML Division',
      dueDate: '2026-12-15',
      status: 'Pending Submission',
      penaltyNoticeReady: false
    },
    evcStatus: 'Queued (Awaiting Scrutiny Clearance)',
    history: [
      { timestamp: '2026-10-14 10:30', stage: 'Application Submitted', actor: 'Dr. R. Ramanathan (Principal)', remark: 'Online application with payment challan submitted successfully.' },
      { timestamp: '2026-10-16 14:15', stage: 'Preliminary Verification', actor: 'Desk Officer (NRO)', remark: 'Affidavits 1, 2, 3 verified with digital signature.' },
      { timestamp: '2026-10-18 09:00', stage: 'Scrutiny', actor: 'System Rule Engine', remark: 'Auto-routed to Scrutiny Committee for Technical verification under APH Sec 2.4.' }
    ]
  },
  {
    id: 'APP-2026-SWRO-2091',
    pid: '1-4820194',
    instName: 'Vidyapeeth Academy of Engineering, Bengaluru',
    type: 'Increase in Intake (CSE - Data Science +60 seats)',
    region: 'SWRO',
    track: 'SCRUTINY_EVC',
    currentStage: 'EVC Inspection',
    subStage: 'Physically Verified; Awaiting Geo-Report Upload',
    submittedDate: '2026-10-02',
    daysInCurrentStage: 11, // BREACHED! SLA is 10 days
    slaDays: 10,
    status: 'Escalated Tier-2',
    riskScore: 92,
    assignedTo: 'Dr. Meenakshi Sundaram (EVC Head)',
    landAreaAcres: 12.0,
    builtUpAreaSqM: 28500,
    leaseValidUntil: '2026-11-20', // Critical Document Expiry!
    deficiencies: [],
    undertakingRequired: false,
    evcStatus: 'Overdue Inspection Report',
    history: [
      { timestamp: '2026-10-02 11:20', stage: 'Application Submitted', actor: 'Registrar', remark: 'Application for additional intake filed.' },
      { timestamp: '2026-10-08 17:00', stage: 'Scrutiny', actor: 'Prof. P. Rao', remark: 'Scrutiny cleared with 100% compliance on faculty cadre.' },
      { timestamp: '2026-10-16 10:00', stage: 'EVC Scheduling', actor: 'EVC Portal', remark: '3-member EVC assigned: Dr. Sundaram, Dr. K. Patil, Dr. N. Varma.' },
      { timestamp: '2026-10-26 09:00', stage: 'EVC Inspection', actor: 'System Escalation Engine', remark: 'AUTO-ESCALATION: EVC Report delayed beyond 10-day APH window. Escalated to RO Bangalore.' }
    ]
  },
  {
    id: 'APP-2026-WRO-3310',
    pid: '1-7482910',
    instName: 'Maharashtra Institute of Pharmaceutical Sciences, Pune',
    type: 'Extension of Approval (EoA) 2026-27',
    region: 'WRO',
    track: 'SCRUTINY_ONLY',
    currentStage: 'Competent Authority Approval',
    subStage: 'Awaiting Member Secretary Digital Signoff',
    submittedDate: '2026-10-18',
    daysInCurrentStage: 3,
    slaDays: 7,
    status: 'In Progress',
    riskScore: 15,
    assignedTo: 'Prof. T. G. Sitharam (Member Secy)',
    landAreaAcres: 5.2,
    builtUpAreaSqM: 9800,
    leaseValidUntil: '2048-06-30',
    deficiencies: [],
    undertakingRequired: false,
    evcStatus: 'Not Required (Track A)',
    history: [
      { timestamp: '2026-10-18 09:40', stage: 'Application Submitted', actor: 'Dean Admin', remark: 'EoA renewal submitted.' },
      { timestamp: '2026-10-21 16:30', stage: 'Scrutiny', actor: 'Scrutiny Committee WRO', remark: 'Passed without deficiencies. Zero penalty.' },
      { timestamp: '2026-10-24 11:00', stage: 'Competent Authority Approval', actor: 'System Workflow Engine', remark: 'Auto-staged to Member Secretary for batch approval.' }
    ]
  },
  {
    id: 'APP-2026-SRO-4412',
    pid: '1-6102834',
    instName: 'Coimbatore Institute of Marine & Aeronautical Tech',
    type: 'Introduction of New Course (Aeronautical Engineering)',
    region: 'SRO',
    track: 'EVC_SAC_SHC',
    currentStage: 'Standing Hearing Committee (SHC)',
    subStage: 'Hearing Scheduled for Lab Equipment Discrepancy',
    submittedDate: '2026-09-28',
    daysInCurrentStage: 16, // SLA breach!
    slaDays: 14,
    status: 'Escalated Tier-3',
    riskScore: 96,
    assignedTo: 'Standing Hearing Committee Panel 2',
    landAreaAcres: 15.0,
    builtUpAreaSqM: 32000,
    leaseValidUntil: '2050-12-31',
    deficiencies: ['Wind Tunnel calibration certificate expired', 'Aero Engine test bed noise containment absent'],
    undertakingRequired: true,
    undertakingDetails: {
      type: 'Aero Test Rig Environmental Isolation Undertaking',
      dueDate: '2026-11-10',
      status: 'Overdue Response',
      penaltyNoticeReady: true
    },
    evcStatus: 'Completed (Adverse Remarks)',
    history: [
      { timestamp: '2026-09-28 10:00', stage: 'Application Submitted', actor: 'Chairman Trust', remark: 'New course application filed.' },
      { timestamp: '2026-10-09 11:30', stage: 'EVC Inspection', actor: 'EVC Panel SRO', remark: 'Inspection done: Wind tunnel lack of NABL calibration noted.' },
      { timestamp: '2026-10-15 14:00', stage: 'Standing Hearing Committee (SHC)', actor: 'AICTE Secretariat', remark: 'Referred to SHC due to safety non-compliance.' },
      { timestamp: '2026-10-25 18:00', stage: 'Standing Hearing Committee (SHC)', actor: 'System Escalation Engine', remark: 'AUTO-ESCALATION: SHC Minutes pending > 14 days. Sent to Member Secretary with Red Alert.' }
    ]
  },
  {
    id: 'APP-2026-CRO-5190',
    pid: '1-3329104',
    instName: 'Bhopal Polytechnic & Skill Development College',
    type: 'Change of Site / Location of Technical Campus',
    region: 'CRO',
    track: 'SCRUTINY_EVC',
    currentStage: 'Preliminary Verification',
    subStage: 'Revenue Department Land Title Verification',
    submittedDate: '2026-10-25',
    daysInCurrentStage: 2,
    slaDays: 7,
    status: 'In Progress',
    riskScore: 28,
    assignedTo: 'Desk Officer CRO',
    landAreaAcres: 5.0,
    builtUpAreaSqM: 8500,
    leaseValidUntil: '2026-11-05', // Imminent Expiry in 9 days!
    deficiencies: ['Khasra/Khatauni verification pending from Tehsildar'],
    undertakingRequired: false,
    evcStatus: 'Pending Prelim Clearance',
    history: [
      { timestamp: '2026-10-25 12:10', stage: 'Application Submitted', actor: 'Secretary of Society', remark: 'Site transfer petition submitted under APH Chapter III.' }
    ]
  },
  {
    id: 'APP-2026-ERO-6201',
    pid: '1-8849201',
    instName: 'Kalinga Institute of Polytechnic Studies, Bhubaneswar',
    type: 'Extension of Approval (EoA) with 10% EWS Quota',
    region: 'ERO',
    track: 'SCRUTINY_ONLY',
    currentStage: 'EoA Issued',
    subStage: 'Digital Approval Letter Signed & Dispatched',
    submittedDate: '2026-10-05',
    daysInCurrentStage: 0,
    slaDays: 7,
    status: 'Approved',
    riskScore: 5,
    assignedTo: 'AICTE Automated Dispatch Engine',
    landAreaAcres: 8.0,
    builtUpAreaSqM: 18000,
    leaseValidUntil: '2060-01-01',
    deficiencies: [],
    undertakingRequired: false,
    evcStatus: 'Exempt',
    history: [
      { timestamp: '2026-10-05 15:00', stage: 'Application Submitted', actor: 'Principal', remark: 'EoA filed.' },
      { timestamp: '2026-10-10 12:00', stage: 'Scrutiny', actor: 'Prof. B. Patnaik', remark: 'All norms satisfied.' },
      { timestamp: '2026-10-18 16:45', stage: 'Competent Authority Approval', actor: 'Member Secretary', remark: 'Digital Signature affixed.' },
      { timestamp: '2026-10-19 09:30', stage: 'EoA Issued', actor: 'System', remark: 'EoA Order No. AICTE/ERO/2026/1-8849201 generated on Digilocker.' }
    ]
  }
];

export const INITIAL_UNDERTAKINGS = [
  {
    id: 'UT-2026-001',
    appId: 'APP-2026-NRO-1042',
    pid: '1-9382103',
    instName: 'Delhi Institute of Technology & Science',
    condition: 'Establishment of 3 Advanced AI/GPU Computing Labs & Hiring 4 PhD Faculty',
    prescribedDate: '2026-06-15',
    dueDate: '2026-11-15',
    daysRemaining: 19,
    status: 'Pending Verification',
    evidenceType: 'Geo-tagged Lab Photos + NABL Test Invoices + Faculty Joining Letters',
    submittedAt: '2026-10-24',
    verifiedBy: null,
    approvalLockStatus: 'Conditional Approval Active (Provisional)',
    escalationTriggered: false
  },
  {
    id: 'UT-2026-002',
    appId: 'APP-2026-SRO-4412',
    pid: '1-6102834',
    instName: 'Coimbatore Institute of Marine & Aeronautical Tech',
    condition: 'Acoustic Soundproofing & Vibration Damping of Jet Propulsion Test Bed',
    prescribedDate: '2026-05-10',
    dueDate: '2026-10-20',
    daysRemaining: -7, // Overdue by 7 days!
    status: 'Overdue & Breached',
    evidenceType: 'State Pollution Control Board Acoustic NOC',
    submittedAt: null,
    verifiedBy: null,
    approvalLockStatus: 'WITHHELD / Show Cause Notice Drafted',
    escalationTriggered: true
  },
  {
    id: 'UT-2026-003',
    appId: 'APP-2026-CRO-5190',
    pid: '1-3329104',
    instName: 'Bhopal Polytechnic & Skill Development College',
    condition: 'Barrier-Free Campus for Divyangjan (Lifts, Ramps, Tactile Paving)',
    prescribedDate: '2026-08-01',
    dueDate: '2026-12-30',
    daysRemaining: 64,
    status: 'Under Execution',
    evidenceType: 'PWD Certified Civil Compliance Certificate',
    submittedAt: null,
    verifiedBy: null,
    approvalLockStatus: 'Conditional Approval Active',
    escalationTriggered: false
  },
  {
    id: 'UT-2026-004',
    appId: 'APP-2026-SWRO-2091',
    pid: '1-4820194',
    instName: 'Vidyapeeth Academy of Engineering, Bengaluru',
    condition: 'Creation of 500 Mbps Dedicated Internet Bandwidth & Wi-Fi 6 Mesh',
    prescribedDate: '2026-04-12',
    dueDate: '2026-10-12',
    daysRemaining: 0,
    status: 'Verified & Closed',
    evidenceType: 'ISP Service Level Agreement & Speedtest Telemetry Log',
    submittedAt: '2026-10-08',
    verifiedBy: 'Shri A. K. Hegde (Desk Officer SWRO)',
    approvalLockStatus: 'Regularized (Full Approval Granted)',
    escalationTriggered: false
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'DOC-LEASE-991',
    pid: '1-4820194',
    instName: 'Vidyapeeth Academy of Engineering, Bengaluru',
    docType: 'Registered Land Lease Deed (30-Year)',
    regNumber: 'BLR-R-4912/1996',
    subRegistrar: 'Sub-Registrar Office, Jayanagar, Bengaluru',
    issueDate: '1996-11-20',
    expiryDate: '2026-11-20', // Expiring in 24 days!
    daysToExpiry: 24,
    status: 'CRITICAL_EXPIRY',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    noticesSent: 3,
    lastNoticeDate: '2026-10-20',
    renewalSubmitted: false,
    escalationLevel: 'Tier-2 (Regional Officer Notified)'
  },
  {
    id: 'DOC-FIRE-882',
    pid: '1-3329104',
    instName: 'Bhopal Polytechnic & Skill Development College',
    docType: 'Fire Safety NOC (Annual Renewal)',
    regNumber: 'MP-FS-BPL-2025/849',
    subRegistrar: 'Chief Fire Officer, Bhopal Municipal Corp.',
    issueDate: '2025-11-05',
    expiryDate: '2026-11-05', // Expiring in 9 days!
    daysToExpiry: 9,
    status: 'CRITICAL_EXPIRY',
    sha256Hash: 'a7c93818301820dbca8291028301928019382104810283019481902840192834',
    noticesSent: 4,
    lastNoticeDate: '2026-10-26',
    renewalSubmitted: true,
    renewalDocName: 'Fire_NOC_Renewal_Inspection_Receipt_2026.pdf',
    escalationLevel: 'Pending Official Verification'
  },
  {
    id: 'DOC-BLDG-703',
    pid: '1-9382103',
    instName: 'Delhi Institute of Technology & Science',
    docType: 'Building Structural Stability Certificate (Form B)',
    regNumber: 'PWD/DEL/STABILITY/2021-89',
    subRegistrar: 'Superintending Engineer, CPWD Delhi',
    issueDate: '2021-12-10',
    expiryDate: '2026-12-10', // Expiring in 44 days
    daysToExpiry: 44,
    status: 'WARNING_EXPIRY',
    sha256Hash: 'f482019481920381029381029381029381029381029381029381029381029381',
    noticesSent: 1,
    lastNoticeDate: '2026-10-15',
    renewalSubmitted: false,
    escalationLevel: 'Tier-1 (System Automated Notice)'
  },
  {
    id: 'DOC-ENCUM-512',
    pid: '1-6102834',
    instName: 'Coimbatore Institute of Marine & Aeronautical Tech',
    docType: 'Non-Encumbrance Certificate (30-Year Continuous)',
    regNumber: 'TN-CBE-EC-2024-9921',
    subRegistrar: 'Joint Sub-Registrar II, Coimbatore',
    issueDate: '2024-01-10',
    expiryDate: '2026-09-30', // ALREADY EXPIRED!
    daysToExpiry: -27,
    status: 'EXPIRED_DEFICIENT',
    sha256Hash: '9849201948102948102938102938102938102938102938102938102938102938',
    noticesSent: 5,
    lastNoticeDate: '2026-10-25',
    renewalSubmitted: false,
    escalationLevel: 'Tier-3 (Central Vigilance & Member Secretary Flagged)'
  },
  {
    id: 'DOC-LEASE-102',
    pid: '1-7482910',
    instName: 'Maharashtra Institute of Pharmaceutical Sciences',
    docType: 'Registered Land Lease Deed (99-Year)',
    regNumber: 'MH-PUNE-LL-2015-8120',
    subRegistrar: 'Haveli Sub-Registrar, Pune',
    issueDate: '2015-06-30',
    expiryDate: '2114-06-30',
    daysToExpiry: 32014,
    status: 'SAFE_VALID',
    sha256Hash: '3819204810293810293810293810293810293810293810293810293810293810',
    noticesSent: 0,
    lastNoticeDate: null,
    renewalSubmitted: false,
    escalationLevel: 'Normal'
  }
];

export const INITIAL_EVC_VISITS = [
  {
    id: 'EVC-2026-SWRO-091',
    appId: 'APP-2026-SWRO-2091',
    pid: '1-4820194',
    instName: 'Vidyapeeth Academy of Engineering, Bengaluru',
    purpose: 'Physical Inspection for Intake Expansion (+60 Data Science)',
    allocatedDate: '2026-10-18',
    scheduledDate: '2026-10-22',
    slaDeadline: '2026-10-28', // 10 days from allocation
    daysAgeing: 9,
    status: 'Inspection Complete - Report Overdue',
    committeeMembers: [
      { name: 'Dr. Meenakshi Sundaram (Chairman)', inst: 'IIT Madras', role: 'Chairman', contact: 'msundaram@iitm.ac.in' },
      { name: 'Dr. K. Patil (Expert Member)', inst: 'NIT Surathkal', role: 'Computer Engg Expert', contact: 'kpatil@nits.ac.in' },
      { name: 'Dr. N. Varma (Architect Expert)', inst: 'SPA Vijayawada', role: 'Civil/Architectural Evaluator', contact: 'nvarma@spav.ac.in' }
    ],
    gpsGeoFence: { lat: 12.9716, lng: 77.5946, radiusMeters: 250, verified: true },
    inspectionChecklist: {
      cadreRatioMet: true,
      labEquipmentVerified: true,
      libraryTitlesAdequate: true,
      barrierFreeAccessMet: false,
      antiRaggingCellActive: true
    },
    reportSubmitted: false,
    escalated: true,
    escalationReason: 'Report delayed beyond 48 hours of physical visit'
  },
  {
    id: 'EVC-2026-NRO-104',
    appId: 'APP-2026-NRO-1042',
    pid: '1-9382103',
    instName: 'Delhi Institute of Technology & Science',
    purpose: 'New Technical Campus Infrastructure & Land Norms Verification',
    allocatedDate: null,
    scheduledDate: null,
    slaDeadline: null,
    daysAgeing: 0,
    status: 'In Queue (Awaiting Scrutiny Signoff)',
    committeeMembers: [],
    gpsGeoFence: { lat: 28.6139, lng: 77.2090, radiusMeters: 500, verified: false },
    inspectionChecklist: null,
    reportSubmitted: false,
    escalated: false
  },
  {
    id: 'EVC-2026-SRO-412',
    appId: 'APP-2026-SRO-4412',
    pid: '1-6102834',
    instName: 'Coimbatore Institute of Marine & Aeronautical Tech',
    purpose: 'Aero Labs & Wind Tunnel Verification (Track C)',
    allocatedDate: '2026-10-01',
    scheduledDate: '2026-10-09',
    slaDeadline: '2026-10-11',
    daysAgeing: 26,
    status: 'Report Submitted - Adverse Findings',
    committeeMembers: [
      { name: 'Prof. R. Krishnan', inst: 'MIT Chromepet', role: 'Chairman', contact: 'rkrish@mit.edu' },
      { name: 'Dr. S. Balaji', inst: 'DRDO Aeronautics Lab', role: 'Technical Evaluator', contact: 'sbalaji@drdo.gov.in' }
    ],
    gpsGeoFence: { lat: 11.0168, lng: 76.9558, radiusMeters: 300, verified: true },
    inspectionChecklist: {
      cadreRatioMet: true,
      labEquipmentVerified: false, // DEFICIENT
      libraryTitlesAdequate: true,
      barrierFreeAccessMet: true,
      antiRaggingCellActive: true
    },
    reportSubmitted: true,
    escalated: true,
    escalationReason: 'Escalated to Standing Hearing Committee due to adverse safety findings'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-901',
    timestamp: '2026-10-27 18:30:12',
    actor: 'System Escalation Engine (Cron v2026.4)',
    role: 'AUTOMATED_DAEMON',
    action: 'AUTO_ESCALATE_TIER_2',
    target: 'APP-2026-SWRO-2091',
    summary: 'EVC Report overdue past 10 days. Escalation ticket generated to RO Bangalore.',
    hash: '8f2d1e4c9b0a3f7e6d5c4b3a2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-10-26 14:12:05',
    actor: 'Dr. R. Ramanathan (Principal)',
    role: 'INSTITUTE',
    action: 'COMPLIANCE_PROOF_UPLOAD',
    target: 'UT-2026-001',
    summary: 'Uploaded lab geo-photos and faculty appointment rolls for AI division.',
    hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-10-25 11:05:40',
    actor: 'Prof. S. K. Mukherjee',
    role: 'SCRUTINY_EXPERT',
    action: 'RECORD_DEFICIENCY_NOTE',
    target: 'APP-2026-NRO-1042',
    summary: 'Recorded deficiency: Fire Safety NOC under renewal; flagged for time-bound undertaking.',
    hash: '5d4c3b2a1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-10-24 16:40:22',
    actor: 'Document Sentinel Daemon',
    role: 'AUTOMATED_DAEMON',
    action: 'DISPATCH_RENEWAL_NOTICE',
    target: 'DOC-LEASE-991',
    summary: 'Dispatched 3rd Urgent Notice for Land Lease Deed expiration (Exp: 2026-11-20).',
    hash: '3f7e6d5c4b3a2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f8f2d1e4c9b0a'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-10-23 09:15:00',
    actor: 'Er. Rajesh K. (Admin)',
    role: 'ADMIN',
    action: 'UPDATE_APH_SLA_POLICY',
    target: 'GLOBAL_APH_CONFIG',
    summary: 'Updated Scrutiny stage maximum turnaround SLA from 15 days to 14 days per APH 2026-27.',
    hash: '7e6d5c4b3a2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f8f2d1e4c9b0a3f'
  }
];

export const INITIAL_APH_CONFIG = {
  scrutinySlaDays: 14,
  evcSlaDays: 10,
  shcSlaDays: 14,
  sacSlaDays: 21,
  undertakingMaxDays: 90,
  documentExpiryWarningDays: 90,
  documentCriticalDays: 30,
  autoEscalateTier1DaysBeforeSla: 2,
  autoEscalateTier2BreachedDays: 0,
  autoEscalateTier3DaysAfterBreach: 3,
  mandatoryEvcForNewColleges: true,
  autoLockOnExpiredLease: true,
  dualSignoffRequiredForUndertakings: true
};
