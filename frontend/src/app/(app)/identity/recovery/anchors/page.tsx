'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, 
  Mail, GraduationCap, Building2, Landmark,
  AlertTriangle
} from 'lucide-react'

interface AnchorItem {
  id: string
  title: string
  subtitle: string
  confidence: number
  weight: number
  icon: React.ElementType
  colorClass: string
  bgClass: string
}

const AVAILABLE_ANCHORS: AnchorItem[] = [
  {
    id: 'email',
    title: 'Verified Email Address',
    subtitle: 'ravi.kumar@example.com',
    confidence: 97,
    weight: 0.25,
    icon: Mail,
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-100',
  },
  {
    id: 'training',
    title: 'PMKVY Training Certificate',
    subtitle: 'NSQF Level 5 (Welding) • PMKVY-2023-T001',
    confidence: 100,
    weight: 0.35,
    icon: GraduationCap,
    colorClass: 'text-indigo-700',
    bgClass: 'bg-indigo-100',
  },
  {
    id: 'ekyc',
    title: 'DigiLocker Mock Sandbox',
    subtitle: 'Authoritative e-KYC Verification Token',
    confidence: 95,
    weight: 0.40,
    icon: ShieldCheck,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-100',
  },
  {
    id: 'employer',
    title: 'Past Employer Contact',
    subtitle: 'XYZ Fabricators (3M Milestone Record)',
    confidence: 78,
    weight: 0.20,
    icon: Building2,
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-100',
  },
  {
    id: 'pfms',
    title: 'PFMS / Bank Account Seed',
    subtitle: 'State Bank of India (DBT Verified Account)',
    confidence: 99,
    weight: 0.30,
    icon: Landmark,
    colorClass: 'text-purple-700',
    bgClass: 'bg-purple-100',
  },
]

const THRESHOLD = 0.85

export default function TrustedAnchorsPage() {
  const [selectedAnchors, setSelectedAnchors] = useState<string[]>(['email', 'training', 'ekyc'])

  const toggleAnchor = (id: string) => {
    if (selectedAnchors.includes(id)) {
      setSelectedAnchors(selectedAnchors.filter(a => a !== id))
    } else {
      setSelectedAnchors([...selectedAnchors, id])
    }
  }

  // Calculate cumulative weight dynamically
  const cumulativeWeight = useMemo(() => {
    const total = selectedAnchors.reduce((sum, id) => {
      const anchor = AVAILABLE_ANCHORS.find(a => a.id === id)
      return sum + (anchor ? anchor.weight : 0)
    }, 0)
    return Math.min(Number(total.toFixed(2)), 1.0)
  }, [selectedAnchors])

  const isThresholdMet = cumulativeWeight >= THRESHOLD
  const progressPercentage = Math.min(Math.round((cumulativeWeight / 1.0) * 100), 100)

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
          {AVAILABLE_ANCHORS.map((anchor) => {
            const isSelected = selectedAnchors.includes(anchor.id)
            const Icon = anchor.icon

            return (
              <div
                key={anchor.id}
                onClick={() => toggleAnchor(anchor.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${anchor.bgClass} ${anchor.colorClass} flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{anchor.title}</h3>
                <p className="text-slate-600 mt-0.5 font-mono text-[11px]">{anchor.subtitle}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Confidence: {anchor.confidence}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    Weight: +{anchor.weight.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Combined Confidence Calculation - DYNAMIC */}
        <div className={`p-5 border rounded-xl transition-all ${
          isThresholdMet 
            ? 'bg-emerald-50 border-emerald-300' 
            : 'bg-amber-50 border-amber-300'
        }`}>
          <div className="flex items-start gap-3.5">
            {isThresholdMet ? (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={24} className="text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm font-extrabold ${isThresholdMet ? 'text-emerald-950' : 'text-amber-950'}`}>
                  Cumulative Anchor Weight: <span className="font-mono text-base">{cumulativeWeight.toFixed(2)}</span> / 1.00
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isThresholdMet 
                    ? 'bg-emerald-200 text-emerald-900' 
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {isThresholdMet ? 'Threshold Satisfied (≥ 0.85)' : `Deficit: ${(THRESHOLD - cumulativeWeight).toFixed(2)}`}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                {/* 0.85 threshold marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10" 
                  style={{ left: '85%' }} 
                  title="Mandatory 0.85 Threshold"
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    isThresholdMet ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className={`text-xs ${isThresholdMet ? 'text-emerald-800' : 'text-amber-800'}`}>
                {isThresholdMet ? (
                  <>
                    <strong>{selectedAnchors.length} secondary anchors selected</strong>. Exceeds mandatory {THRESHOLD} threshold for autonomous recovery. Probabilistic match engine is unlocked.
                  </>
                ) : (
                  <>
                    <strong>Insufficient anchor weight:</strong> Currently at {cumulativeWeight.toFixed(2)}. You need at least {THRESHOLD} to bypass manual desk audit. Please select additional corroborating anchors above.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-slate-100 items-center">
          <Link
            href="/identity/recovery"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <Link
            href={isThresholdMet ? "/identity/match" : "#"}
            onClick={(e) => {
              if (!isThresholdMet) {
                e.preventDefault()
                alert(`Cumulative anchor weight (${cumulativeWeight.toFixed(2)}) is below the required 0.85 threshold. Please select more anchors.`)
              }
            }}
            className={`inline-flex items-center gap-2 font-bold text-xs px-6 py-3 rounded-lg shadow transition-colors ${
              isThresholdMet
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Run Probabilistic Match Engine</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
