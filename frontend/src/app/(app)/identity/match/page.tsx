'use client'

import React from 'react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { 
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react'

export default function IdentityMatchPage() {
  const { activeTrainee } = useRole()
  const traineeId = activeTrainee.trainee_id || 'T002'
  const traineeName = activeTrainee.name || 'Priya S'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Identity Continuity Assessment</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>National Multi-Anchor Protocol</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Identity Match Assessment
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Probabilistic matching evaluating continuity between candidate recovery signal and historical DSIG nodes.
        </p>
      </div>

      {/* Probability Gauge & High Confidence Badge */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-5">
            {/* SVG Donut Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="94, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-slate-900">94%</span>
                <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-500">Match</span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                <CheckCircle2 size={12} /> HIGH MATCH CONFIDENCE
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Same Individual Verified</h3>
              <p className="text-xs text-slate-500">Target Core Node: Trainee {traineeId} ({traineeName})</p>
            </div>
          </div>
        </div>

        {/* 4 Factor Correlation List */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Corroborated Factor Alignment</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Name Match (Multi-Attribute)</span>
                <span className="text-emerald-700 font-bold">96%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Course &amp; Batch Alignment</span>
                <span className="text-emerald-700 font-bold">98%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Geographic Plausibility</span>
                <span className="text-blue-700 font-bold">91%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Employer History Continuity</span>
                <span className="text-purple-700 font-bold">87%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Recommendation */}
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900">
          <p className="font-semibold">Governance Decision Rule:</p>
          <p className="mt-0.5">
            Direct Anchor Attachment Approved: Multi-attribute confidence exceeds statutory threshold (≥ 88%). Automatically attach verified credentials to existing profile ({traineeId}) without creating duplicate citizen persona.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-end pt-2">
          <Link
            href="/identity/recovery/ladder"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-colors"
          >
            <span>Send to Recovery Ladder Verification</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
