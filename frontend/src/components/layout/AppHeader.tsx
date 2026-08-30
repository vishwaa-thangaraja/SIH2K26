import React from 'react'
import { Bell, HelpCircle, User } from 'lucide-react'
import Link from 'next/link'

export default function AppHeader({ breadcrumbs }: { breadcrumbs: string[] }) {
  return (
    <header className="h-16 bg-gov-navy text-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
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
          <span className="font-bold text-lg">Skill Bridge</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs ml-2 border border-white/20">SIH 26135</span>
        </Link>
      </div>

      <div className="flex-1 flex justify-center text-sm text-slate-300">
        {breadcrumbs.length > 0 && breadcrumbs.join(' > ')}
      </div>

      <div className="flex items-center gap-4">
        <button className="hover:text-white text-slate-300"><Bell size={20} /></button>
        <button className="hover:text-white text-slate-300"><HelpCircle size={20} /></button>
        <div className="flex items-center gap-2 border-l border-white/20 pl-4 ml-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gov-blue flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-sm font-medium">Ravi Kumar</span>
        </div>
      </div>
    </header>
  )
}
