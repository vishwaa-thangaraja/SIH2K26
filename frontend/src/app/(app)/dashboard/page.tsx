import React from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, ArrowRight, TrendingUp, CheckCircle2, 
  FileText, Phone, Mail, GraduationCap, Building2, 
  Upload, Network, AlertCircle, Clock
} from 'lucide-react'
import { MOCK_TRAINEE, MOCK_OUTCOMES, TIMELINE_MILESTONES } from '@/lib/mockData'

export default function DashboardPage() {
  const currentOutcome = MOCK_OUTCOMES.find(o => o.event_id === 'EV003')

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Trainee Longitudinal Overview</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>ID: {MOCK_TRAINEE.trainee_id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {MOCK_TRAINEE.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Program: <strong className="text-slate-800">{MOCK_TRAINEE.program}</strong> ({MOCK_TRAINEE.provider})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-full font-bold">
            <ShieldCheck size={16} /> Identity Active & Continuous
          </span>
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-full font-bold">
            Confidence: 94%
          </span>
        </div>
      </div>

      {/* 3-Column Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Identity Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="font-bold text-slate-900 text-base">Identity Summary</h2>
              <span className="text-xs text-slate-500 font-mono">T001</span>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Primary Active Phone</p>
                  <p className="font-semibold text-slate-900">{MOCK_TRAINEE.phone}</p>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Verified Email Anchor</p>
                  <p className="font-semibold text-slate-900">{MOCK_TRAINEE.email}</p>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Certification Level</p>
                  <p className="font-semibold text-slate-900">NSQF Level 5 (Welding)</p>
                </div>
              </li>
            </ul>
          </div>

          <Link
            href="/dsig"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-sky-700 font-semibold text-xs py-2.5 px-3 rounded-lg border border-slate-200 transition-colors"
          >
            <span>Explore Identity Graph (DSIG)</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Outcome Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="font-bold text-slate-900 text-base">Outcome Status</h2>
              <TrendingUp size={18} className="text-emerald-600" />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Current Employment Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="font-extrabold text-slate-900 text-base">EMPLOYED</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 font-semibold">{currentOutcome?.employer_name}</p>
              <p className="text-xs text-slate-600">{currentOutcome?.role} • ₹18,000 / month</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Outcome Confidence</span>
                <span className="text-slate-900 font-bold">0.86 (High Evidence)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
          </div>

          <Link
            href="/outcomes"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-colors"
          >
            <span>View Outcome Ledger</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Longitudinal Stepper */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="font-bold text-slate-900 text-base">Longitudinal Journey</h2>
              <span className="text-xs text-sky-700 font-semibold">3M–24M Track</span>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between py-2 text-xs">
              {TIMELINE_MILESTONES.map((step, idx) => {
                const isCompleted = step.status === 'completed'
                const isCurrent = step.status === 'current'
                const isUnknown = step.status === 'unknown'

                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCompleted 
                        ? 'bg-blue-600 text-white' 
                        : isCurrent 
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 ring-offset-1'
                        : isUnknown
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {isCompleted ? '✓' : step.milestone}
                    </div>
                    <span className="text-[10px] text-slate-600 mt-1 font-medium text-center">
                      {step.milestone}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-3 text-[11px] text-slate-600">
              <strong>Note:</strong> &quot;Unknown&quot; milestones represent temporary absence of freshly logged evidence, never assumed unemployment.
            </div>
          </div>

          <Link
            href="/trainees/T001/timeline"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs py-2.5 px-3 rounded-lg border border-slate-200 transition-colors"
          >
            <span>Full Longitudinal Timeline</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link 
          href="/outcomes/new" 
          className="bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg p-4 transition-all shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">New Employment</h3>
            <p className="text-[11px] text-slate-500">Log job placement</p>
          </div>
        </Link>

        <Link 
          href="/evidence/upload" 
          className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg p-4 transition-all shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Upload Payslip</h3>
            <p className="text-[11px] text-slate-500">AI OCR extraction</p>
          </div>
        </Link>

        <Link 
          href="/dsig" 
          className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg p-4 transition-all shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Network size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">DSIG Graph</h3>
            <p className="text-[11px] text-slate-500">Identity anchors</p>
          </div>
        </Link>

        <Link 
          href="/attestation" 
          className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg p-4 transition-all shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Employer Portal</h3>
            <p className="text-[11px] text-slate-500">One-tap attestation</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-slate-500" />
          Recent Verified System Activity
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Payslip OCR Extraction Completed</p>
                <span className="text-xs text-slate-500 font-medium">2 days ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Oct 2023 payslip matched to ABC Manufacturing Pvt Ltd. Field consistency: 93%.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Employer Attestation Received</p>
                <span className="text-xs text-slate-500 font-medium">5 days ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Authorized HR representative at ABC Manufacturing verified active employment as CNC Operator.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <Phone size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Active Phone Anchor Updated</p>
                <span className="text-xs text-slate-500 font-medium">2 weeks ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Primary phone anchor +91 98765 43210 attached via trusted recovery ladder. Historical anchor preserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
