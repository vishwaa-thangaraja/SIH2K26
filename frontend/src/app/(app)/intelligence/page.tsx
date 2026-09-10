'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MOCK_PROVIDERS, MOCK_SKILL_GAPS } from '@/lib/mockData'
import { 
  BarChart3, TrendingUp, Award, Map, ArrowRight, 
  ShieldCheck, AlertCircle, Sparkles, Building2, Users,
  Activity, ArrowUpRight, CheckCircle2, ChevronRight, Upload
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts'

// Longitudinal outcome trajectory data (Area Chart inspired by bklit.com)
const longitudinalWageTrajectoryData = [
  { milestone: 'Enrollment', avgWage: 0, verifiedTrainees: 1480, retentionRate: 100 },
  { milestone: 'Training Exit', avgWage: 12000, verifiedTrainees: 1420, retentionRate: 96 },
  { milestone: '3M Milestone', avgWage: 15400, verifiedTrainees: 1310, retentionRate: 88 },
  { milestone: '6M Milestone', avgWage: 18200, verifiedTrainees: 1220, retentionRate: 82 },
  { milestone: '12M Milestone', avgWage: 22800, verifiedTrainees: 1140, retentionRate: 77 },
  { milestone: '24M Milestone', avgWage: 27500, verifiedTrainees: 980, retentionRate: 66 },
]

// Custom Tooltip component in minimal style
function CustomAreaTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-xl shadow-lg text-xs font-sans space-y-1.5 min-w-[170px]">
        <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
        <div className="flex items-center justify-between text-blue-700">
          <span className="text-slate-500">Average Wage:</span>
          <span className="font-bold font-mono">₹{payload[0]?.value?.toLocaleString()}</span>
        </div>
        {payload[1] && (
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-slate-500">Verified Cohort:</span>
            <span className="font-bold font-mono">{payload[1]?.value?.toLocaleString()}</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function OutcomeIntelligenceDashboard() {
  const [activeMetric, setActiveMetric] = useState<'wage' | 'retention'>('wage')
  const [liveSummary, setLiveSummary] = useState<any>(null)
  const [liveProviders, setLiveProviders] = useState<any[]>([])
  const [liveDeficit, setLiveDeficit] = useState<any>(null)

  useEffect(() => {
    // Fetch live summary from SQLite database
    fetch('http://127.0.0.1:8000/intelligence/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLiveSummary(data)
      })
      .catch(() => {})

    // Fetch live providers comparison from SQLite database
    fetch('http://127.0.0.1:8000/intelligence/provider-comparison')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setLiveProviders(data)
        }
      })
      .catch(() => {})

    // Fetch live hotspot deficit data
    fetch('http://127.0.0.1:8000/intelligence/hotspot-deficit')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLiveDeficit(data)
      })
      .catch(() => {})
  }, [])

  const providerChartData = liveProviders.length > 0
    ? liveProviders.map((p) => ({
        name: p.name || p.provider_name,
        '3M': p['3M'] || 75,
        '6M': p['6M'] || 80,
        '12M': p['12M'] || 78,
      }))
    : [
        { name: 'PMKVY National Center', '3M': 72, '6M': 81, '12M': 76 },
        { name: 'DDUGKY Skills Hub', '3M': 61, '6M': 69, '12M': 64 },
        { name: 'NAPS Apprenticeship', '3M': 88, '6M': 91, '12M': 87 },
      ]

  const totalCandidates = liveSummary?.total_audited_candidates ?? 1480
  const regionalClusters = liveSummary?.regional_clusters_count ?? 6

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── HEADER ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Macro Governance Intelligence</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>Policy Feedback Loop</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Outcome &amp; Institutional Intelligence
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
            Aggregated longitudinal metrics converting verified 3M–24M livelihood signals into institutional accountability and targeted funding directives.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/intake/import"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
          >
            <Upload size={14} className="text-blue-600" />
            <span>Import Training Data</span>
          </Link>

          <Link
            href="/intelligence/policy"
            className="inline-flex items-center gap-2 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
          >
            <Sparkles size={14} className="text-sky-300" />
            <span>Policy Directives (5 Active)</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── 4 KPI CARDS (MINIMAL & SUBTLE - LIVE AGGREGATED) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audited Candidates</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalCandidates.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
            <TrendingUp size={12} />
            <span>{liveSummary?.provenance_trust_pct ?? 94.2}% Provenance Trust</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Assessment Score</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{liveSummary?.avg_assessment_score ?? 82.0}/100</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-0.5">
            <span>Pass Rate: {liveSummary?.pass_rate_pct ?? 92.4}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Attendance Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{liveSummary?.avg_attendance ?? 88.5}%</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
            <span>{liveSummary?.total_certifications ?? 95} Certified Cohort</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regional Clusters</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{regionalClusters} Districts</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
            <span>Active Supply Across Regions</span>
          </div>
        </div>
      </div>

      {/* ── MODULE 1: INTAKE BANNER / CALLOUT ── */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/60">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-sky-400">
            <Upload size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full">
                Module 1 Active
              </span>
              <span className="text-xs text-blue-200">Continuous Data Ingestion Protocol</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Import Training Data &amp; Trainee Onboarding
            </h2>
            <p className="text-xs text-blue-100/80 mt-0.5 max-w-xl">
              Import trainee training records from an institute CSV or Excel file with automated 7-step schema validation and relational normalization.
            </p>
          </div>
        </div>

        <Link
          href="/intake/import"
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-slate-900 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px shrink-0"
        >
          <span>Data Ingestion</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── BKLIT-STYLE SMOOTH AREA CHART (LONGITUDINAL TRAJECTORY) ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all duration-300 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Longitudinal Career &amp; Wage Growth Curve (3M–24M)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous multi-year telemetry tracking monthly wage progression and employment continuity.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setActiveMetric('wage')}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                activeMetric === 'wage'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Average Monthly Wage (₹)
            </button>
            <button
              onClick={() => setActiveMetric('retention')}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                activeMetric === 'retention'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retention Continuity (%)
            </button>
          </div>
        </div>

        {/* Smooth Area Chart Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={longitudinalWageTrajectoryData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="milestone"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => activeMetric === 'wage' ? `₹${val / 1000}k` : `${val}%`}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              {activeMetric === 'wage' ? (
                <Area
                  type="monotone"
                  dataKey="avgWage"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWage)"
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 3, stroke: '#ffffff' }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="retentionRate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRetention)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#ffffff' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── INSTITUTIONAL BENCHMARKS & SKILL GAP HOTSPOTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Placement Rate BarChart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Verified Placement Retention by Provider (%)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">3M, 6M, and 12M outcome comparison across regional training centers</p>
            </div>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              {providerChartData.length} Centers Audited
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(val) => [`${val}%`, 'Placement Rate']} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="3M" fill="#3b82f6" name="3M Placement" radius={[4, 4, 0, 0]} />
                <Bar dataKey="6M" fill="#10b981" name="6M Placement" radius={[4, 4, 0, 0]} />
                <Bar dataKey="12M" fill="#8b5cf6" name="12M Placement" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Gap Hotspot Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle size={17} className="text-amber-600" />
                Critical Deficit: {liveDeficit?.hub_name || 'Madurai Hub'}
              </h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                {liveDeficit?.gap_ratio ? `${liveDeficit.gap_ratio}x Deficit` : 'Calculating...'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {liveDeficit?.trades 
                ? `Industrial corridors in ${liveDeficit.corridor || 'Madurai & Kappalur'} demonstrate high structural demand in ${liveDeficit.trades}.`
                : 'Industrial corridors in Madurai & Kappalur demonstrate high structural demand in CNC Machining and Precision Welding (NSQF L5).'}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1 text-slate-700">
                  <span>Market Industry Demand</span>
                  <span className="text-slate-900 font-bold font-mono">
                    {liveDeficit?.market_demand_slots ? `${liveDeficit.market_demand_slots.toLocaleString()} Slots` : 'Loading...'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${liveDeficit?.demand_pct ?? 50}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1 text-slate-700">
                  <span>Certified Supply</span>
                  <span className="text-rose-600 font-bold font-mono">
                    {liveDeficit?.certified_supply_count ? `${liveDeficit.certified_supply_count.toLocaleString()} Certified` : 'Loading...'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${liveDeficit?.supply_pct ?? 40}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Live Database Records
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {liveDeficit?.live_trainees_in_db ?? 0} Trainees · {liveDeficit?.audited_certified ?? 0} Certified
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/regional-analytics"
            className="w-full inline-flex items-center justify-center gap-2 bg-gov-navy hover:bg-blue-900 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
          >
            <Map size={15} />
            <span>Open Regional Skill Heatmap</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
