'use client'

import React from 'react'
import { Bell, HelpCircle, User, ArrowLeftRight } from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'

export default function AppHeader({ breadcrumbs }: { breadcrumbs?: string[] }) {
  const { role, setRole } = useRole()
  const isTrainee = role === 'trainee'

  return (
    <header className="h-14 bg-gov-navy text-white flex items-center justify-between px-5 shrink-0 border-b border-white/10">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="2" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="4.93" x2="19.07" y2="6.34" />
          </svg>
          <span className="font-bold text-base tracking-wide">CONTINUUM</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-white/20 ml-1">SIH 26135</span>
        </Link>

        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <span className="hidden lg:block text-xs text-slate-400 font-medium border-l border-white/20 pl-4 ml-1">
            {breadcrumbs.join(' › ')}
          </span>
        )}
      </div>

      {/* Centre: Role Banner */}
      <div className={`hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
        isTrainee
          ? 'bg-blue-600/20 border-blue-400/40 text-blue-200'
          : 'bg-white/10 border-white/20 text-slate-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isTrainee ? 'bg-blue-400' : 'bg-slate-300'}`} />
        {isTrainee ? 'Trainee Portal — Ravi Kumar (T001)' : 'Government Analyst Portal — MSDE'}
      </div>

      {/* Right: Toggle + Actions */}
      <div className="flex items-center gap-3">
        {/* Role Switcher in Header */}
        <button
          onClick={() => setRole(isTrainee ? 'analyst' : 'trainee')}
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white border border-white/20 hover:border-white/40 px-2.5 py-1 rounded-md transition-colors"
          title="Switch portal"
        >
          <ArrowLeftRight size={12} />
          Switch to {isTrainee ? 'Analyst' : 'Trainee'}
        </button>

        <button className="hover:text-white text-slate-400 transition-colors"><Bell size={18} /></button>
        <button className="hover:text-white text-slate-400 transition-colors"><HelpCircle size={18} /></button>

        <div className="flex items-center gap-2 border-l border-white/20 pl-3 ml-1 cursor-pointer">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isTrainee ? 'bg-blue-600' : 'bg-slate-600'}`}>
            <User size={14} />
          </div>
          <span className="text-xs font-semibold hidden sm:block">
            {isTrainee ? 'Ravi Kumar' : 'Analyst View'}
          </span>
        </div>
      </div>
    </header>
  )
}
