'use client'

import React from 'react'
import Link from 'next/link'
import { MOCK_PROVIDERS, MOCK_SKILL_GAPS } from '@/lib/mockData'
import { 
  BarChart3, TrendingUp, Award, Map, ArrowRight, 
  ShieldCheck, AlertCircle, Sparkles, Building2, Users 
} from 'lucide-react'
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts'

const providerComparisonData = [
  { name: 'PMKVY Center', '3M': 72, '6M': 81, '12M': 76 },
  { name: 'DDUGKY Hub', '3M': 61, '6M': 69, '12M': 64 },
  { name: 'NAPS Hub', '3M': 88, '6M': 91, '12M': 87 },
]

export default function OutcomeIntelligenceDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Macro Governance Intelligence</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Policy Feedback Loop</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Outcome &amp; Institutional Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Aggregated longitudinal metrics converting verified 3M–24M livelihood events into provider performance and regional skill-gap interventions.
          </p>
        </div>

        <Link
          href="/intelligence/policy"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Sparkles size={14} className="text-sky-400" />
          <span>View Policy Recommendations</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Macro Pipeline Stepper Flow */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-3">
          Continuous Longitudinal Feedback Architecture
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-white/10 border border-white/10 p-3 rounded-lg">
            <span className="text-sky-400 font-bold block text-sm">1. Verified Events</span>
            <span className="text-slate-300 text-[11px] mt-0.5 block">Cryptographic outcome ledger</span>
          </div>
          <div className="bg-white/10 border border-white/10 p-3 rounded-lg">
            <span className="text-emerald-400 font-bold block text-sm">2. Provider Scores</span>
            <span className="text-slate-300 text-[11px] mt-0.5 block">6M–12M wage &amp; retention rates</span>
          </div>
          <div className="bg-white/10 border border-white/10 p-3 rounded-lg">
            <span className="text-amber-400 font-bold block text-sm">3. Regional Demand</span>
            <span className="text-slate-300 text-[11px] mt-0.5 block">District-level skill deficit map</span>
          </div>
          <div className="bg-sky-500 text-slate-950 font-bold p-3 rounded-lg flex flex-col justify-center">
            <span className="block text-sm">4. Policy Action</span>
            <span className="text-[11px] text-slate-900 mt-0.5 block">Funding &amp; seat allocations</span>
          </div>
        </div>
      </div>

      {/* Core Analytics Grid: Provider Chart + Skill Deficit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Rate BarChart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Verified Placement Retention by Provider (%)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">3-Month, 6-Month, and 12-Month outcome benchmarks</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              3 Centers Audited
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(val) => [`${val}%`, 'Placement Rate']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="3M" fill="#0284c7" name="3M Placement" radius={[4, 4, 0, 0]} />
                <Bar dataKey="6M" fill="#16a34a" name="6M Placement" radius={[4, 4, 0, 0]} />
                <Bar dataKey="12M" fill="#9333ea" name="12M Placement" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Hotspot Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                Critical Deficit: Electrician &amp; CNC
              </h3>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Pune &amp; Mumbai manufacturing belt demonstrates severe structural demand outstripping certified supply.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1 text-slate-700">
                  <span>Market Industry Demand</span>
                  <span className="text-slate-900 font-bold">12,450 Slots (High)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-slate-700">
                  <span>Certified Supply (Annual)</span>
                  <span className="text-red-600 font-bold">3,120 Candidates (Low)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/regional-analytics"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-lg shadow transition-colors"
          >
            <Map size={16} />
            <span>Open Regional Skill Heatmap</span>
          </Link>
        </div>
      </div>

      {/* Provider Scorecard Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Provider Outcome Accountability Rankings</h2>
          <Link href="/scorecards" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
            Scorecards <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Provider Organization</th>
                <th className="p-3.5">Total Trainees</th>
                <th className="p-3.5">3M Placement</th>
                <th className="p-3.5">6M Placement</th>
                <th className="p-3.5">12M Placement</th>
                <th className="p-3.5">Wage Adequacy</th>
                <th className="p-3.5">Evidence Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PROVIDERS.map((p) => (
                <tr key={p.provider_id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{p.provider_name}</td>
                  <td className="p-3.5 font-mono text-slate-700">{p.total_trainees.toLocaleString()}</td>
                  <td className="p-3.5 font-semibold text-slate-800">{Math.round(p.placement_rate_3m * 100)}%</td>
                  <td className="p-3.5 font-bold text-emerald-700">{Math.round(p.placement_rate_6m * 100)}%</td>
                  <td className="p-3.5 font-semibold text-slate-800">{Math.round(p.placement_rate_12m * 100)}%</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{p.wage_adequacy_score}</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[11px]">
                      {p.evidence_quality_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
