import { API_BASE } from '@/lib/api'
import React from 'react'
import Link from 'next/link'
import { 
  Sparkles, ArrowLeft, ArrowRight, AlertTriangle, 
  Award, TrendingUp, Building2, Download, CheckCircle2, ShieldCheck 
} from 'lucide-react'

export default async function PolicyInsightsPage() {
  let liveDirectives: any[] = []
  try {
    const res = await fetch(`${API_BASE}/intelligence/policy-insights`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        liveDirectives = data
      }
    }
  } catch (e) {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/intelligence" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft size={12} /> Macro Intelligence
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Policy Feedback System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Policy Directive and Recommendation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Evidence-backed policy directives generated from longitudinal 3M–24M outcome trends and regional deficits. <span className="font-semibold text-slate-800">Human-in-the-loop: CONTINUUM recommends, authorized administrators decide.</span>
          </p>
        </div>

        <button className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start md:self-auto">
          <Download size={14} />
          Export Policy Brief (PDF)
        </button>
      </div>

      {/* Intervention Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {liveDirectives.map((item: any) => {
          const isHigh = item.priority === 'high'
          const isMed = item.priority === 'medium'

          return (
            <div
              key={item.id}
              className={`p-6 rounded-xl border transition-all ${
                isHigh
                  ? 'bg-red-50/30 border-red-200 shadow-sm'
                  : isMed
                  ? 'bg-amber-50/20 border-amber-200 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isHigh 
                    ? 'bg-red-100 text-red-800' 
                    : isMed 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.priority} Priority • {item.category.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{item.id}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Core Evidence Data Point:</span>
                <span className="font-bold text-slate-900">{item.data_point}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Policy Governance Closing Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Closing the Training-to-Livelihood Loop</h3>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Policy insights feed directly into subsequent cohort funding allocations, adjusting subsidized seats toward verified high-demand trades.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition-colors whitespace-nowrap"
        >
          <span>Return to Trainee Dashboard</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
