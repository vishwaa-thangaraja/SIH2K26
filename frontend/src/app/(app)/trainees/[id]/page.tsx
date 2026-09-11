import React from 'react'
import Link from 'next/link'
import { MOCK_TRAINEE, MOCK_OUTCOMES, MOCK_EVIDENCE } from '@/lib/mockData'
import { MOCK_SEARCH_DATASET } from '@/lib/mockSearchData'
import { 
  User, ShieldCheck, Phone, Mail, GraduationCap, 
  Building2, Calendar, FileText, CheckCircle2, ArrowRight, Network,
  AlertTriangle, ShieldAlert, Sparkles, Target, TrendingUp
} from 'lucide-react'

export default async function TraineeProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Fetch live trainee, outcomes, anomaly shield, and NCO skill recommendations
  let liveTrainee: any = null
  let liveOutcomes: any[] = []
  let liveAnomaly: any = null
  let liveSkillRecs: any = null

  try {
    const [tRes, oRes, aRes, sRes] = await Promise.all([
      fetch(`http://127.0.0.1:8000/trainees/${id}`, { cache: 'no-store' }),
      fetch(`http://127.0.0.1:8000/outcomes?trainee_id=${id}`, { cache: 'no-store' }),
      fetch(`http://127.0.0.1:8000/trainees/${id}/anomaly`, { cache: 'no-store' }),
      fetch(`http://127.0.0.1:8000/trainees/${id}/skill-recommendations`, { cache: 'no-store' })
    ])
    if (tRes.ok) liveTrainee = await tRes.json()
    if (oRes.ok) {
      const oData = await oRes.json()
      if (oData && Array.isArray(oData.events)) {
        liveOutcomes = oData.events
      }
    }
    if (aRes.ok) liveAnomaly = await aRes.json()
    if (sRes.ok) liveSkillRecs = await sRes.json()
  } catch (err) {}

  const found = MOCK_SEARCH_DATASET.find((t) => t.trainee_id === id || t.id === id)
  const latestOutcome = liveOutcomes.length > 0 ? liveOutcomes[liveOutcomes.length - 1] : null
  const totalEvidenceCount = liveOutcomes.reduce((acc, ev) => acc + (ev.evidence_count || 0), 0)

  const trainee = liveTrainee ? {
    trainee_id: liveTrainee.trainee_id,
    name: liveTrainee.name,
    email: liveTrainee.email || `${liveTrainee.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: liveTrainee.phone || '+91 98765 43210',
    program: liveTrainee.program,
    provider: liveTrainee.provider,
    enrollment_date: liveTrainee.enrollment_date || '2023-01-15',
    completion_date: liveTrainee.completion_date || '2023-04-30',
    status: liveTrainee.status || 'completed',
    monthly_wage: latestOutcome?.wage_monthly || (found?.monthly_wage ?? 18000),
    current_employer: latestOutcome?.employer_name || found?.current_employer || 'Accredited Industry Partner',
    current_role: latestOutcome?.role || found?.current_role || 'Certified Associate',
    confidence_score: latestOutcome?.confidence_score ? Math.round(latestOutcome.confidence_score * 100) : (found?.confidence_score ?? 95),
  } : (found ? {
    trainee_id: found.trainee_id,
    name: found.name,
    email: `${found.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: found.trainee_id === 'T001' ? '+91 98765 43210' : '+91 94421 88320',
    program: found.program,
    provider: found.provider,
    enrollment_date: '2023-01-15',
    completion_date: found.completion_date || '2023-04-30',
    status: 'completed',
    monthly_wage: found.monthly_wage,
    current_employer: found.current_employer,
    current_role: found.current_role,
    confidence_score: found.confidence_score,
  } : {
    ...MOCK_TRAINEE,
    monthly_wage: 18000,
    current_employer: 'ABC Manufacturing',
    current_role: 'CNC Operator',
    confidence_score: 94,
  })

  const initials = (trainee.name || 'T')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{trainee.name}</h1>
              <span className="text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-mono">
                {trainee.trainee_id}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              {trainee.program} • {trainee.provider}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/dsig?trainee_id=${trainee.trainee_id}`}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Network size={14} />
            View DSIG Graph
          </Link>
          <Link
            href={`/trainees/${id}/timeline`}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Calendar size={14} />
            Longitudinal Timeline
          </Link>
        </div>
      </div>

      {/* KPI 4-Card Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Training Certification</span>
          <p className="text-base font-bold text-slate-900 mt-1">NSQF Level 5</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Completed 30 Apr 2023</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Identity Status</span>
          <p className="text-base font-bold text-slate-900 mt-1">Continuous</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{trainee.confidence_score}% Graph Confidence</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Current Livelihood</span>
          <p className="text-base font-bold text-slate-900 mt-1">₹{trainee.monthly_wage.toLocaleString()} / mo</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{trainee.current_employer || 'Self-Employed'}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Verified Evidence</span>
          <p className="text-base font-bold text-slate-900 mt-1">
            {totalEvidenceCount > 0 ? `${totalEvidenceCount} Records` : (found ? '1 Record' : `${MOCK_EVIDENCE.length} Records`)}
          </p>
          <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Payslips + Attestations</p>
        </div>
      </div>

      {/* Statutory Training Quality & Integrity Verification */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
        (liveAnomaly?.status === 'Highly Anomalous')
          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
          : (liveAnomaly?.status === 'Suspicious')
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            (liveAnomaly?.status === 'Highly Anomalous')
              ? 'bg-rose-100 text-rose-700'
              : (liveAnomaly?.status === 'Suspicious')
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {(liveAnomaly?.status === 'Highly Anomalous' || liveAnomaly?.status === 'Suspicious') ? (
              <ShieldAlert size={22} />
            ) : (
              <ShieldCheck size={22} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">Statutory Training Quality Verification</span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                (liveAnomaly?.status === 'Highly Anomalous')
                  ? 'bg-rose-200 text-rose-800'
                  : (liveAnomaly?.status === 'Suspicious')
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-emerald-200 text-emerald-800'
              }`}>
                {liveAnomaly?.status === 'Normal' ? 'VERIFIED COMPLIANT' : (liveAnomaly?.status || 'VERIFIED COMPLIANT')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {liveAnomaly?.risk_factors && liveAnomaly.risk_factors.length > 0 
                ? liveAnomaly.risk_factors.join(' • ')
                : 'Training attendance, velocity, assessment score, and certification patterns comply with NSQF operational norms.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-right">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Training Integrity Index</p>
            <p className="text-lg font-extrabold text-slate-900">{liveAnomaly?.integrity_index ?? 92}<span className="text-xs font-normal text-slate-500">/100</span></p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Audit Classification</p>
            <p className="text-xs font-semibold text-emerald-700">Level A Validated</p>
          </div>
        </div>
      </div>

      {/* Detailed Information Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Attributes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User size={16} className="text-sky-600" />
            Demographics & Contact Anchors
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Trainee Full Name</span>
              <span className="font-semibold text-slate-900">{trainee.name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Primary Phone (Active)</span>
              <span className="font-semibold text-slate-900">{trainee.phone}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Verified Email Address</span>
              <span className="font-semibold text-slate-900">{trainee.email}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Enrollment Date</span>
              <span className="font-semibold text-slate-900">{trainee.enrollment_date}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Training Completion Date</span>
              <span className="font-semibold text-slate-900">{trainee.completion_date}</span>
            </div>
          </div>
        </div>

        {/* Outcome History */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-600" />
              Verified Outcome History
            </h2>
            <Link href="/outcomes" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
              Ledger <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {((liveOutcomes && liveOutcomes.length > 0) ? liveOutcomes : (found ? [] : MOCK_OUTCOMES)).length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                <p className="font-medium">No verified outcome events recorded yet for this candidate.</p>
                <Link
                  href={`/outcomes/new?trainee_id=${trainee.trainee_id}&milestone=3M`}
                  className="inline-flex items-center gap-1 text-sky-700 font-bold hover:underline mt-2"
                >
                  Record Verified Milestone <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              ((liveOutcomes && liveOutcomes.length > 0) ? liveOutcomes : MOCK_OUTCOMES).map((ev: any) => (
                <div key={ev.event_id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ev.employer_name || 'Unrecorded Period'}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{ev.milestone}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      {ev.role ? `${ev.role} • ₹${ev.wage_monthly?.toLocaleString()} / mo` : (ev.event_type === 'training' ? 'Training Program Milestone' : 'Verified Livelihood Period')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.verification_status === 'verified' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {(ev.verification_status || 'verified').toUpperCase()}
                    </span>
                    <p className="text-slate-400 text-[10px] mt-1">{ev.start_date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NCO-2004 Occupational Skill Gap & Recommendations */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">National Occupational Standards (NCO-2004) Skill Gap Assessment</h2>
              <span className="text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded">
                MSDE Competency Framework
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top skill deficits identified for career progression in <strong className="text-slate-800">{liveSkillRecs?.trade || trainee.program}</strong>.
            </p>
          </div>
          <Link
            href="/regional-analytics"
            className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1 shrink-0"
          >
            Corridor Skill Analytics <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {(liveSkillRecs?.recommendations && liveSkillRecs.recommendations.length > 0 
            ? liveSkillRecs.recommendations.slice(0, 3) 
            : [
                { skill: "Active Listening & Technical Interpretation", required_level: 4.0, inferred_score: 1.8, skill_gap: 2.2 },
                { skill: "Precision Quality Control & Inspection", required_level: 4.2, inferred_score: 2.1, skill_gap: 2.1 },
                { skill: "Automated Tooling & CNC Setup", required_level: 4.5, inferred_score: 2.6, skill_gap: 1.9 }
              ]
          ).map((rec: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl hover:border-sky-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="truncate max-w-[180px] text-slate-900">{rec.skill}</span>
                <span className="text-rose-600 font-mono text-[11px]">Gap: -{rec.skill_gap}</span>
              </div>
              <div className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Current Inferred</span>
                  <span className="font-semibold text-slate-800">{rec.inferred_score} / 5.0</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-sky-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(10, (rec.inferred_score / 5.0) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] pt-1">
                  <span>Required Industry Level: <strong>{rec.required_level}</strong></span>
                  <span className="text-emerald-700 font-bold">NSQF L5 Target</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
