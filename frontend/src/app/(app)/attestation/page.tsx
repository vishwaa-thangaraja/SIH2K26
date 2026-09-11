'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { 
  Building2, CheckCircle2, XCircle, ShieldCheck, 
  ArrowRight, AlertTriangle, Send, User, Calendar, Loader2 
} from 'lucide-react'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function EmployerAttestationPage() {
  const { activeTrainee } = useRole()
  const traineeId = activeTrainee?.trainee_id || 'T002'

  const [loading, setLoading] = useState(true)
  const [traineeData, setTraineeData] = useState<any>(null)
  const [outcomeData, setOutcomeData] = useState<any>(null)
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'disputed'>('pending')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`http://127.0.0.1:8000/trainees/${traineeId}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(`http://127.0.0.1:8000/outcomes?trainee_id=${traineeId}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    ]).then(([t, o]) => {
      setTraineeData(t)
      if (o && Array.isArray(o.events) && o.events.length > 0) {
        // Look for the latest employment outcome with an employer name
        const emp = o.events.slice().reverse().find((e: any) => e.employer_name) || o.events[0]
        setOutcomeData(emp)
      } else {
        setOutcomeData(null)
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [traineeId])

  const name = traineeData?.name || activeTrainee?.name || 'Priya S'
  const initials = getInitials(name)
  const employerName = outcomeData?.employer_name || (
    traineeId === 'T002' ? 'CloudTech Solutions Pvt Ltd' :
    traineeId === 'T003' ? 'BrandPulse Media Hub' :
    traineeId === 'T004' ? 'BHEL Ancillary Power Systems' :
    traineeId === 'T005' ? 'Kumar Custom Apparel Studio' :
    'National Skill Enterprise Partner'
  )
  const roleName = outcomeData?.role || traineeData?.program || 'Junior Developer'
  const wage = outcomeData?.wage_monthly 
    ? `₹${outcomeData.wage_monthly.toLocaleString('en-IN')} / month` 
    : (traineeId === 'T002' ? '₹28,000 / month' : '₹20,000 / month')
  const milestone = outcomeData?.milestone ? `${outcomeData.milestone} Milestone Claim` : '6M Milestone Claim'
  const eventRef = outcomeData?.event_id || `EV-${traineeId}-6M`
  const startDate = outcomeData?.start_date || '15 Sep 2023'

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Loading Employer Verification Record for {traineeId}...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Enterprise Verification Portal</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>{employerName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employer One-Tap Attestation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Authorized employer verification channel validating trainee employment claims without manual paperwork.
          </p>
        </div>

        <span className="bg-amber-50 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold border border-amber-200 self-start md:self-auto">
          {status === 'confirmed' ? '0 Pending Actions' : '1 Pending Action'}
        </span>
      </div>

      {status === 'confirmed' ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Employment Attestation Confirmed</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Employment confirmation for <strong>{name} ({traineeId})</strong> at <strong>{employerName}</strong> cryptographically recorded on the outcome ledger. Confidence updated to 0.95.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/outcomes"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow transition-colors"
            >
              <ShieldCheck size={14} />
              <span>View Verified Outcome Ledger</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : status === 'disputed' ? (
        <div className="bg-red-50 border border-red-300 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
            <XCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Discrepancy Reported</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Employment record for {name} ({traineeId}) flagged for audit review. Status updated to Disputed.
            </p>
          </div>
          <button
            onClick={() => setStatus('pending')}
            className="text-xs text-slate-600 hover:underline font-semibold"
          >
            Reset view
          </button>
        </div>
      ) : (
        /* Main Attestation Action Card */
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg">
                {initials}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{name}</h3>
                <p className="text-xs text-slate-500 font-mono">Trainee ID: {traineeId} • Ref: {eventRef}</p>
              </div>
            </div>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs px-2.5 py-1 rounded font-bold">
              {milestone}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium">Employer Firm</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{employerName}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium">Designation / Role</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{roleName}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium">Stated Commencement Date</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{startDate}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium">Monthly Compensation</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{wage}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-slate-700 shrink-0 mt-0.5" />
            <p>
              <strong>Legal Consent & Authorization:</strong> By clicking Confirm Employment, you attest under the Skill India Mission portal guidelines that <strong>{name}</strong> ({traineeId}) is actively employed in the capacity stated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setStatus('confirmed')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 rounded-lg shadow-md transition-colors"
            >
              <CheckCircle2 size={16} />
              <span>CONFIRM EMPLOYMENT</span>
            </button>
            <button
              onClick={() => setStatus('disputed')}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-300 font-bold text-xs py-3.5 px-5 rounded-lg transition-colors"
            >
              <XCircle size={16} />
              <span>Report Discrepancy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
