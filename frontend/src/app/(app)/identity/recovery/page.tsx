import React from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, 
  Smartphone, CheckCircle2, Lock 
} from 'lucide-react'

export default function IdentityRecoveryInitialPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Identity Recovery Ladder • Step 1</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Trainee T001</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Initiate Autonomous Identity Recovery
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Recover control of trainee profile after SIM loss, phone change or device failure without creating a duplicate record.
        </p>
      </div>

      {/* 3-Step Recovery Path Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-sky-50 border-2 border-sky-600 rounded-xl">
          <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">1</span>
          <h3 className="font-bold text-slate-900 text-sm">Assess Access State</h3>
          <p className="text-slate-600 mt-1">Determine available channels and lost credentials.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl opacity-60">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold mb-2">2</span>
          <h3 className="font-bold text-slate-900 text-sm">Select Trusted Anchors</h3>
          <p className="text-slate-500 mt-1">Corroborate identity using secondary verified anchors.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl opacity-60">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold mb-2">3</span>
          <h3 className="font-bold text-slate-900 text-sm">Attach & Update DSIG</h3>
          <p className="text-slate-500 mt-1">New active anchor attached with continuity preserved.</p>
        </div>
      </div>

      {/* Main Assessment Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">Current Profile Identity Status</h2>
          <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500">Registered Name</span>
              <p className="font-bold text-slate-900 mt-0.5">Ravi Kumar</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500">Trainee Core ID</span>
              <p className="font-bold text-slate-900 mt-0.5 font-mono">T001</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
          <Lock size={18} className="text-blue-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">No SMS Gateway Vulnerability</span>
            <p className="mt-0.5">
              Instead of relying exclusively on mobile OTP, CONTINUUM verifies continuity by computing cross-anchor similarity across verified email, training certificates and past employment records.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Link
            href="/identity/recovery/anchors"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow transition-colors"
          >
            <span>Proceed to Select Secondary Anchors</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
