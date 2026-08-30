'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Network, Users, ClipboardList, 
  FileSearch, BarChart3, Award, Map, CheckSquare, Shield 
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'DSIG Graph', icon: Network, href: '/dsig' },
  { label: 'Trainees', icon: Users, href: '/trainees/T001' },
  { label: 'Outcomes', icon: ClipboardList, href: '/outcomes' },
  { label: 'Evidence', icon: FileSearch, href: '/evidence/upload' },
  { label: 'Intelligence', icon: BarChart3, href: '/intelligence' },
  { label: 'Scorecards', icon: Award, href: '/scorecards' },
  { label: 'Regional Map', icon: Map, href: '/regional-analytics' },
  { label: 'Attestation', icon: CheckSquare, href: '/attestation' },
  { label: 'Identity', icon: Shield, href: '/identity/update' },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto hidden md:flex">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Menu</h2>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-gov-blue text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded text-center uppercase tracking-wider">
          Trainee View
        </div>
      </div>
    </aside>
  )
}
