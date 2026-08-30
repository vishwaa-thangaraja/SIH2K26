import React from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, 
  Sparkles, Layers, Lock 
} from 'lucide-react'

export default function RecoveryLadderPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Identity Recovery Ladder • Step 3</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Verification Protocol</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Multi-Tier Escalation Ladder
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Structured governance protocol evaluating evidence weight against national verification rules.
        </p>
      </div>

      {/* Ladder Steps */}
      <div className="space-y-4">
        {/* Tier 1 */}
        <div className="bg-white border-2 border-emerald-500 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tier 1: Low-Burden Profile Signals</h3>
                <p className="text-xs text-slate-500">Historical enrollment batch, NSQF L5 record, past location cluster</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Satisfied (1.0)
            </span>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="bg-white border-2 border-emerald-500 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tier 2: Authoritative Secondary Anchors</h3>
                <p className="text-xs text-slate-500">DigiLocker sandbox e-KYC reference + verified email token</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Satisfied (0.97)
            </span>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="bg-white border-2 border-sky-500 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                ★
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tier 3: AI Match &amp; Consistency Analysis</h3>
                <p className="text-xs text-slate-500">Probabilistic match score exceeds governance threshold</p>
              </div>
            </div>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              0.94 Probability
            </span>
          </div>
        </div>

        {/* Final Decision Box */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <ShieldCheck size={20} className="text-emerald-700" />
            <span>Autonomous Recovery Rule Satisfied</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            All 3 tiers have successfully corroborated that the recovery applicant is the legitimate owner of Trainee Core <strong>T001</strong>. Ready to attach candidate phone <code>+91 98765 43210</code> as new primary active anchor.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Link
          href="/identity/recovery/anchors"
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          Back
        </Link>
        <Link
          href="/identity/recovery/success"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-colors"
        >
          <span>Authorize Recovery &amp; Update DSIG</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
