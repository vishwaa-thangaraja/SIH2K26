'use client'

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Award, Building2, CheckCircle2, TrendingUp, 
  ArrowRight, ShieldCheck, Users, Star 
} from 'lucide-react'

export default function ProviderScorecardsPage() {
  const [providers, setProviders] = useState<any[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/intelligence/provider-comparison`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setProviders(data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Provider Performance Index</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Outcome-Based Accountability</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Training Provider Outcome Scorecards
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Shift from attendance-based compliance to verified multi-year 6M–12M livelihood retention and wage adequacy benchmarks.
          </p>
        </div>

        <span className="bg-emerald-50 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full font-bold border border-emerald-200 self-start md:self-auto">
          {providers.length} Accredited Providers
        </span>
      </div>

      {/* Provider Detailed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => {
          return (
            <div
              key={p.provider_id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{p.provider_id}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5">{p.provider_name}</h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Award size={18} />
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Total Certified Cohort</span>
                    <span className="font-bold text-slate-900">{p.total_trainees.toLocaleString()} Trainees</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">6-Month Verified Placement</span>
                      <span className="text-emerald-700 font-bold">{Math.round(p.placement_rate_6m * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${p.placement_rate_6m * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">12-Month Retention Stability</span>
                      <span className="text-blue-700 font-bold">{Math.round(p.placement_rate_12m * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.placement_rate_12m * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Wage Adequacy</span>
                      <span className="font-bold text-slate-900 text-sm">{p.wage_adequacy_score} / 1.0</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Evidence Quality</span>
                      <span className="font-bold text-emerald-700 text-sm">{p.evidence_quality_score} / 1.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs py-2.5 px-3 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5">
                <span>View Full Provider Audit</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
