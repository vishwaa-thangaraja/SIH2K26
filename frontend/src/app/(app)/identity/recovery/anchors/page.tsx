'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, 
  Mail, GraduationCap, Building2, Smartphone 
} from 'lucide-react'

export default function TrustedAnchorsPage() {
  const [selectedAnchors, setSelectedAnchors] = useState<string[]>(['email', 'training', 'ekyc'])

  const toggleAnchor = (id: string) => {
    if (selectedAnchors.includes(id)) {
      setSelectedAnchors(selectedAnchors.filter(a => a !== id))
    } else {
      setSelectedAnchors([...selectedAnchors, id])
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Identity Recovery Ladder • Step 2</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Secondary Anchor Selection</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Corroborating Trusted Anchors
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Choose verified anchors to substantiate your identity recovery claim without human gatekeeping delays.
        </p>
      </div>

      {/* Anchor Selection Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Email Anchor */}
          <div
            onClick={() => toggleAnchor('email')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedAnchors.includes('email')
                ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Mail size={16} />
              </div>
              <input
                type="checkbox"
                checked={selectedAnchors.includes('email')}
                onChange={() => {}}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Verified Email Address</h3>
            <p className="text-slate-600 mt-0.5 font-mono">ravi.kumar@example.com</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-2">
              Confidence: 97%
            </span>
          </div>

          {/* Training Record Anchor */}
          <div
            onClick={() => toggleAnchor('training')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedAnchors.includes('training')
                ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GraduationCap size={16} />
              </div>
              <input
                type="checkbox"
                checked={selectedAnchors.includes('training')}
                onChange={() => {}}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">PMKVY Training Certificate</h3>
            <p className="text-slate-600 mt-0.5">NSQF Level 5 (Welding) • PMKVY-2023-T001</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-2">
              Confidence: 100%
            </span>
          </div>

          {/* DigiLocker e-KYC Anchor */}
          <div
            onClick={() => toggleAnchor('ekyc')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedAnchors.includes('ekyc')
                ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <input
                type="checkbox"
                checked={selectedAnchors.includes('ekyc')}
                onChange={() => {}}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">DigiLocker Mock Sandbox</h3>
            <p className="text-slate-600 mt-0.5">Authoritative e-KYC Verification Token</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-2">
              Confidence: 95%
            </span>
          </div>

          {/* Employer Anchor */}
          <div
            onClick={() => toggleAnchor('employer')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedAnchors.includes('employer')
                ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <input
                type="checkbox"
                checked={selectedAnchors.includes('employer')}
                onChange={() => {}}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Past Employer Contact</h3>
            <p className="text-slate-600 mt-0.5">XYZ Fabricators (3M Milestone Record)</p>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded mt-2">
              Confidence: 78%
            </span>
          </div>
        </div>

        {/* Combined Confidence Calculation */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Cumulative Anchor Weight: 0.97</span>
              <p className="text-[11px] text-emerald-800">
                {selectedAnchors.length} secondary anchors selected. Exceeds mandatory 0.85 threshold for autonomous recovery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-slate-100">
          <Link
            href="/identity/recovery"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
          >
            Back
          </Link>
          <Link
            href="/identity/match"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow transition-colors"
          >
            <span>Run Probabilistic Match Engine</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
