import React from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, 
  TrendingUp, Layers, Award, FileCheck 
} from 'lucide-react'

export default async function ConfidenceUpdatedPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Trust & Provenance Metric</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Event EV003</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Confidence Score Calibrated: 0.86
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Outcome event at ABC Manufacturing promoted to High-Confidence Verified status following multi-source convergence.
        </p>
      </div>

      {/* Confidence Shift Visualization */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-around py-4 border-b border-slate-100">
          <div className="text-center">
            <span className="text-xs text-slate-500 font-medium block">Initial Claim Score</span>
            <span className="text-2xl font-bold text-slate-400 mt-1 block">0.35</span>
            <span className="text-[10px] text-slate-400">Self-report only</span>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight size={24} className="text-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700 mt-1">+3 Factors Corroborated</span>
          </div>

          <div className="text-center">
            <span className="text-xs text-emerald-800 font-bold block">Calibrated Final Trust</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">0.86</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              High Confidence
            </span>
          </div>
        </div>

        {/* Weighted Convergent Factor Breakdown */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Corroborating Weight Breakdown</h3>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>1. Employer Attestation (HR Signature)</span>
                <span className="text-emerald-700 font-bold">+0.35 Weight (100% Match)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>2. Payslip OCR Extraction & Bank Salary Ref</span>
                <span className="text-blue-700 font-bold">+0.30 Weight (93% Consistency)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>3. DSIG Historical Course Relevance (NSQF L5)</span>
                <span className="text-purple-700 font-bold">+0.21 Weight (94% Alignment)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/outcomes"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-lg shadow transition-colors"
          >
            <ShieldCheck size={16} />
            <span>Return to Outcome Ledger</span>
          </Link>
          <Link
            href="/trainees/T001/timeline"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs py-3 px-4 rounded-lg transition-colors"
          >
            <span>View Updated Timeline</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
