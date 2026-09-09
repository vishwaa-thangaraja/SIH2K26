'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { TIMELINE_MILESTONES, MOCK_TRAINEE } from '@/lib/mockData'
import { MOCK_SEARCH_DATASET } from '@/lib/mockSearchData'
import { 
  Building2, CheckCircle2, AlertCircle, ArrowLeft, 
  TrendingUp, ShieldCheck, FileCheck, Network, UserCheck, Search
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts'

export default function LongitudinalTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || 'T001'
  const [liveTrainee, setLiveTrainee] = React.useState<any>(null)
  const [allTrainees, setAllTrainees] = React.useState<{ trainee_id: string; name: string }[]>([])

  React.useEffect(() => {
    fetch(`http://127.0.0.1:8000/trainees/${id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setLiveTrainee(data)
      })
      .catch(() => {})
  }, [id])

  React.useEffect(() => {
    fetch('http://127.0.0.1:8000/trainees?limit=100')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllTrainees(data.map((t: any) => ({
            trainee_id: t.trainee_id,
            name: t.name,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const found = MOCK_SEARCH_DATASET.find((t) => t.trainee_id === id || t.id === id)

  const traineeName = liveTrainee ? liveTrainee.name : (found ? found.name : MOCK_TRAINEE.name)
  const traineeWage = found ? found.monthly_wage : 21000

  const wageTrendData = [
    { milestone: 'Training', wage: 0, date: 'Apr 2023' },
    { milestone: '3M', wage: Math.round(traineeWage * 0.75), date: 'Jul 2023' },
    { milestone: '6M', wage: Math.round(traineeWage * 0.90), date: 'Oct 2023' },
    { milestone: '12M', wage: traineeWage, date: 'Apr 2024' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/advanced-search" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
              <Search size={12} /> Trainee Directory
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Trainee {id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Longitudinal Outcome Timeline
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Multi-year trajectory tracking for <strong>{traineeName}</strong> from certification to 24-month livelihood stability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Trainee Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
            <UserCheck size={16} className="text-sky-700" />
            <span className="text-xs font-semibold text-slate-700">Select:</span>
            <select
              value={id}
              onChange={(e) => router.push(`/trainees/${e.target.value}/timeline`)}
              className="text-xs font-semibold bg-transparent text-slate-900 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value={id}>{id} - {traineeName}</option>
              {allTrainees.filter(t => t.trainee_id !== id).map(t => (
                <option key={t.trainee_id} value={t.trainee_id}>
                  {t.trainee_id} - {t.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            href={`/dsig?trainee_id=${id}`}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Network size={14} />
            DSIG Tracker
          </Link>
        </div>
      </div>

      {/* Wage Progression Area Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Verified Wage Progression (INR / Month)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Continuous trajectory over 12 months after certification</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            +33.3% Wage Growth
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wageTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="milestone" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Monthly Wage']} 
                labelFormatter={(label) => `Milestone: ${label}`}
              />
              <Area type="monotone" dataKey="wage" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#wageGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Cards Vertical Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Milestone Event Provenance Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIMELINE_MILESTONES.map((milestone, i) => {
            const isCompleted = milestone.status === 'completed'
            const isCurrent = milestone.status === 'current'
            const isUnknown = milestone.status === 'unknown'

            return (
              <div 
                key={i} 
                className={`p-5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-blue-50/50 border-blue-300 shadow-md ring-1 ring-blue-300' 
                    : isUnknown
                    ? 'bg-amber-50/30 border-amber-200 shadow-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      isCompleted 
                        ? 'bg-blue-600 text-white' 
                        : isCurrent 
                        ? 'bg-emerald-600 text-white' 
                        : isUnknown
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {milestone.milestone}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{milestone.label}</h3>
                      <p className="text-[11px] text-slate-500">{milestone.date}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Active Livelihood
                    </span>
                  )}
                  {isUnknown && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Pending Signal
                    </span>
                  )}
                </div>

                {isUnknown ? (
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>No Fresh Signal Recorded:</strong> Under the SIH 26135 longitudinal governance framework, missing data is not counted as unemployment until verified through authoritative checks.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {milestone.employer && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Employer Organization</span>
                        <span className="font-semibold text-slate-800">{milestone.employer}</span>
                      </div>
                    )}

                    {milestone.wage && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monthly Compensation</span>
                        <span className="font-bold text-slate-900">₹{milestone.wage.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Evidence Provenance</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 size={12} /> {Math.round(milestone.confidence * 100)}% Corroboration
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
