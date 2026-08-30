'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Map, AlertCircle, TrendingUp, Users, ArrowRight } from 'lucide-react'

// Dynamically import Leaflet map with SSR disabled
const SkillGapMap = dynamic(() => import('@/components/map/SkillGapMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 font-medium text-sm">
      Initializing Geographic Intelligence Engine...
    </div>
  ),
})

export default function RegionalAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Spatial Demand Intelligence</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Madurai &amp; Southern Industrial Corridor</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Regional Skill-Gap &amp; Demand Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            District-wise visualization mapping industry labor demand against verified certified graduate supply in Tamil Nadu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1.5 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            High Deficit: Madurai &amp; Coimbatore
          </span>
        </div>
      </div>

      {/* Interactive Map Component */}
      <SkillGapMap />

      {/* Regional Takeaways Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-sky-600" />
          Spatial Resource Allocation Directives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <strong className="text-slate-900 block text-sm mb-1">Madurai Auto &amp; Precision Cluster</strong>
            <p>28% unmet demand in CNC machine operation and precision fabrication. Recommend expanding PMKVY capacity by 450 seats in Kappalur &amp; Melur.</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <strong className="text-slate-900 block text-sm mb-1">Coimbatore Engineering &amp; Pump Corridor</strong>
            <p>27% gap in industrial automation, robotics technician setup, and high-efficiency motor fabrication.</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <strong className="text-slate-900 block text-sm mb-1">Tiruchirappalli Heavy Fabrication Hub</strong>
            <p>26% gap in specialized boiler welding (NSQF Level 5) and thermal power component quality assurance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
