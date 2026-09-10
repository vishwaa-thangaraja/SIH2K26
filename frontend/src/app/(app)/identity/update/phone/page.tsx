'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { 
  Phone, ArrowRight, ArrowLeft, ShieldCheck, 
  CheckCircle2, AlertTriangle, RefreshCw 
} from 'lucide-react'

export default function PhoneChangePage() {
  const { activeTrainee } = useRole()
  const traineeId = activeTrainee.trainee_id || 'T002'
  const traineeName = activeTrainee.name || 'Priya S'
  const currentPhone = activeTrainee.phone || '+91 93847 59007'

  const [oldPhoneAccess, setOldPhoneAccess] = useState<'yes' | 'no'>('no')
  const [newPhone, setNewPhone] = useState('+91 98765 43210')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <Link href="/identity/update" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1 mb-1">
          <ArrowLeft size={12} /> Back to Identity Hub
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Update Active Phone Anchor
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Migrate mobile number anchor for {traineeName} ({traineeId}) while preserving continuity history.
        </p>
      </div>

      {/* Main Flow Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
          <span className="text-slate-500 font-semibold">Current Primary Phone Anchor:</span>
          <p className="font-mono text-base font-bold text-slate-900">{currentPhone}</p>
          <span className="text-[10px] text-slate-400">Attached: Active • Verification: Telecom OTP Verified</span>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-900 block">
            Do you have access to receive OTP on the old number?
          </label>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setOldPhoneAccess('yes')}
              className={`p-4 rounded-xl border text-left font-bold transition-all ${
                oldPhoneAccess === 'yes'
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-sm">Yes, have access</span>
              <span className="text-[11px] font-normal text-slate-500 mt-0.5 block">Direct dual-OTP verification</span>
            </button>

            <button
              onClick={() => setOldPhoneAccess('no')}
              className={`p-4 rounded-xl border text-left font-bold transition-all ${
                oldPhoneAccess === 'no'
                  ? 'bg-sky-50 border-sky-600 text-sky-950 ring-2 ring-sky-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-sm">No, SIM lost / changed</span>
              <span className="text-[11px] font-normal text-slate-500 mt-0.5 block">Use multi-anchor recovery ladder</span>
            </button>
          </div>
        </div>

        {oldPhoneAccess === 'no' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>Multi-Anchor Escalation Required</span>
            </div>
            <p>
              When primary device access is lost, the platform triggers the <strong>Trusted Anchor Escalation Ladder</strong> (DigiLocker e-KYC, Training Record & Verified Email) to verify identity safely without human fraud vulnerability.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <label className="font-semibold text-slate-700">Enter New Mobile Number:</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Link
            href="/identity/recovery"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow transition-colors"
          >
            <span>Proceed with Identity Recovery Path</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
