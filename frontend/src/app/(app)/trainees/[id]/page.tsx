import React from 'react'
import Link from 'next/link'
import { MOCK_TRAINEE, MOCK_OUTCOMES, MOCK_EVIDENCE } from '@/lib/mockData'
import { MOCK_SEARCH_DATASET } from '@/lib/mockSearchData'
import { 
  User, ShieldCheck, Phone, Mail, GraduationCap, 
  Building2, Calendar, FileText, CheckCircle2, ArrowRight, Network 
} from 'lucide-react'

export default async function TraineeProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Try fetching live trainee from database
  let liveTrainee: any = null
  try {
    const res = await fetch(`http://127.0.0.1:8000/trainees/${id}`, { cache: 'no-store' })
    if (res.ok) liveTrainee = await res.json()
  } catch (err) {}

  const found = MOCK_SEARCH_DATASET.find((t) => t.trainee_id === id || t.id === id)

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
    monthly_wage: 18000,
    current_employer: 'Accredited Industry Partner',
    current_role: 'Certified Associate',
    confidence_score: 95,
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
          <p className="text-base font-bold text-slate-900 mt-1">{MOCK_EVIDENCE.length} Records</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Payslips + Attestations</p>
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
            {MOCK_OUTCOMES.map((ev) => (
              <div key={ev.event_id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ev.employer_name || 'Unrecorded Period'}</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{ev.milestone}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    {ev.role ? `${ev.role} • ₹${ev.wage_monthly?.toLocaleString()} / mo` : 'Unknown status (awaiting signal)'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.verification_status === 'verified' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ev.verification_status.toUpperCase()}
                  </span>
                  <p className="text-slate-400 text-[10px] mt-1">{ev.start_date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
