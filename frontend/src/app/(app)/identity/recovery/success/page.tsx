'use client'

import React from 'react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { 
  CheckCircle2, ArrowRight, ShieldCheck, 
  Network, LayoutDashboard, History, Phone 
} from 'lucide-react'

export default function RecoveryApprovedPage() {
  const { activeTrainee } = useRole()
  const traineeId = activeTrainee.trainee_id || 'T002'
  const traineeName = activeTrainee.name || 'Priya S'
  const currentPhone = activeTrainee.phone || '+91 93847 59007'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Protocol Succeeded
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Identity Recovery Approved &amp; DSIG Updated
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Autonomous verification ladder approved attachment of new mobile anchor to Trainee Core <strong>{traineeId}</strong>.
          </p>
        </div>

        {/* State Changes Table */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Target Identity Record</span>
            <span className="font-bold text-slate-900">{traineeName} ({traineeId})</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">New Active Phone Anchor</span>
            <span className="font-bold text-emerald-700 font-mono">{currentPhone}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Prior Phone Anchor Status</span>
            <span className="font-semibold text-slate-700">+91 91234 56780 (Preserved in DSIG)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Multi-Year Outcome Continuity</span>
            <span className="font-bold text-blue-700">100% Intact (No Duplication)</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/dsig"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-lg shadow transition-colors"
          >
            <Network size={16} />
            <span>View Updated DSIG Graph</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs py-3 px-5 rounded-lg transition-colors"
          >
            <LayoutDashboard size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
