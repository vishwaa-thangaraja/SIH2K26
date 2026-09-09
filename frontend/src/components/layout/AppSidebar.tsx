'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import {
  LayoutDashboard, Network, User, ClipboardList,
  FileSearch, CheckSquare, Shield, Upload,
  BarChart3, Award, Map, LineChart, BookOpen,
  RefreshCw, ChevronRight,
} from 'lucide-react'

// ── TRAINEE NAV ────────────────────────────────────────────────────────────────
const traineeNav = [
  {
    group: 'My Account',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'My Profile', icon: User, href: '/trainees/T001' },
    ],
  },
  {
    group: 'My Identity',
    items: [
      { label: 'Identity Graph', icon: Network, href: '/dsig' },
      { label: 'Manage Identity', icon: Shield, href: '/identity/update' },
      { label: 'Identity Recovery', icon: RefreshCw, href: '/identity/recovery' },
    ],
  },
  {
    group: 'My Outcomes',
    items: [
      { label: 'Outcome Ledger', icon: ClipboardList, href: '/outcomes' },
      { label: 'Register Outcome', icon: BookOpen, href: '/outcomes/new' },
      { label: 'Upload Evidence', icon: Upload, href: '/evidence/upload' },
    ],
  },
  {
    group: 'Verification',
    items: [
      { label: 'Employer Attestation', icon: CheckSquare, href: '/attestation' },
      { label: 'View Evidence', icon: FileSearch, href: '/evidence/DOC001/extraction' },
    ],
  },
]

// ── ANALYST NAV ────────────────────────────────────────────────────────────────
const analystNav = [
  {
    group: 'Intelligence & Discovery',
    items: [
      { label: 'Import Training Data', icon: Upload, href: '/intake/import' },
      { label: 'Advanced Filter Search', icon: FileSearch, href: '/advanced-search' },
      { label: 'Macro Intelligence', icon: BarChart3, href: '/intelligence' },
      { label: 'Policy Directives', icon: LineChart, href: '/intelligence/policy' },
    ],
  },
  {
    group: 'Program Oversight',
    items: [
      { label: 'Provider Scorecards', icon: Award, href: '/scorecards' },
      { label: 'Regional Skill Map', icon: Map, href: '/regional-analytics' },
    ],
  },
  {
    group: 'Trainee Records',
    items: [
      { label: 'Trainee Timeline', icon: ClipboardList, href: '/trainees/T001/timeline' },
      { label: 'Identity Audit', icon: Network, href: '/dsig' },
    ],
  },
]

function NavGroup({
  group,
  items,
  pathname,
  accentClass,
}: {
  group: string
  items: { label: string; icon: React.ElementType; href: string }[]
  pathname: string
  accentClass: string
}) {
  return (
    <div className="mb-4">
      <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
        {group}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                isActive
                  ? `${accentClass} text-white shadow-sm`
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight size={12} className="opacity-70" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { role, setRole } = useRole()

  const isTrainee = role === 'trainee'
  const navGroups = isTrainee ? traineeNav : analystNav
  const accentClass = isTrainee ? 'bg-blue-600' : 'bg-slate-800'
  const roleBadgeClass = isTrainee
    ? 'bg-blue-50 border-blue-200 text-blue-800'
    : 'bg-slate-100 border-slate-300 text-slate-700'

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto hidden md:flex">

      {/* Role Switcher Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 px-1">
          Active Portal
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setRole('trainee')}
            className={`text-xs font-bold py-1.5 rounded-md border transition-colors ${
              isTrainee
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            Trainee
          </button>
          <button
            onClick={() => setRole('analyst')}
            className={`text-xs font-bold py-1.5 rounded-md border transition-colors ${
              !isTrainee
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-500 hover:text-slate-800'
            }`}
          >
            Analyst
          </button>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroup
            key={group.group}
            group={group.group}
            items={group.items}
            pathname={pathname}
            accentClass={accentClass}
          />
        ))}
      </nav>

      {/* Role Badge Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className={`px-3 py-2 border rounded-md text-center text-[11px] font-extrabold uppercase tracking-wider ${roleBadgeClass}`}>
          {isTrainee ? '👤 Trainee View — Ravi Kumar' : '🏛️ Government Analyst View'}
        </div>
      </div>
    </aside>
  )
}
