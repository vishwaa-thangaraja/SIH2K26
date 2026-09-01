'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import {
  MapPin, Search, ChevronDown, User, Bell,
  Menu, X, LogOut, BarChart3, Award, Map, LineChart,
  ClipboardList, Network, FileSearch, Filter, ShieldCheck,
  LayoutDashboard, RefreshCw, Upload, CheckSquare, BookOpen, Shield,
  Building2, Sparkles, Landmark, BadgeCheck, FileText
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  isFilter?: boolean
}

export default function AmazonGovHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useRole()
  const isGovernmentOfficial = role === 'analyst'

  const [searchCategory, setSearchCategory] = useState(isGovernmentOfficial ? 'All Sectors' : 'All Modules')
  const [searchQuery, setSearchQuery] = useState('')
  const [allDrawerOpen, setAllDrawerOpen] = useState(false)
  const [filterFlyoutOpen, setFilterFlyoutOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isGovernmentOfficial) {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      if (searchCategory !== 'All Sectors') params.set('sector', searchCategory)
      router.push(`/advanced-search?${params.toString()}`)
    } else {
      if (searchQuery.trim()) {
        router.push(`/outcomes?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('continuum_role')
    router.push('/')
  }

  // ── Analyst Nav Items ──
  const analystNavItems: NavItem[] = [
    { label: 'Macro Intelligence', href: '/intelligence', icon: BarChart3 },
    { label: 'Advanced Filter Search', href: '/advanced-search', icon: Filter, isFilter: true },
    { label: 'Policy Directives', href: '/intelligence/policy', icon: LineChart },
    { label: 'Provider Scorecards', href: '/scorecards', icon: Award },
    { label: 'Regional Skill Map', href: '/regional-analytics', icon: Map },
    { label: 'Trainee Audit Records', href: '/trainees/T001/timeline', icon: ClipboardList },
    { label: 'DSIG Graph Audit', href: '/dsig', icon: Network },
    { label: 'Evidence OCR Engine', href: '/evidence/DOC001/extraction', icon: FileSearch },
  ]

  // ── Trainee Nav Items ──
  const traineeNavItems: NavItem[] = [
    { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My 360° Profile', href: '/trainees/T001', icon: User },
    { label: 'Identity Graph (DSIG)', href: '/dsig', icon: Network },
    { label: 'Manage Identity', href: '/identity/update', icon: Shield },
    { label: 'Identity Recovery', href: '/identity/recovery', icon: RefreshCw },
    { label: 'Outcome Ledger & Wages', href: '/outcomes', icon: ClipboardList },
    { label: 'Claim New Outcome', href: '/outcomes/new', icon: BookOpen },
    { label: 'Upload Evidence', href: '/evidence/upload', icon: Upload },
    { label: 'Employer Attestation', href: '/attestation', icon: CheckSquare },
  ]

  const activeNavItems = isGovernmentOfficial ? analystNavItems : traineeNavItems

  const quickFilterLinks = isGovernmentOfficial ? [
    { label: 'Precision Welding (L5)', query: 'Welding' },
    { label: 'CNC Machine Operation', query: 'CNC' },
    { label: 'Madurai District Cluster', query: 'Madurai' },
    { label: 'Coimbatore Hub', query: 'Coimbatore' },
    { label: 'Chennai EV Cluster', query: 'Chennai' },
    { label: 'NSQF Level 5+', query: 'L5' },
    { label: '6M Retention Verified', query: '6M' },
    { label: 'DigiLocker Authenticated', query: 'DigiLocker' },
  ] : [
    { label: 'My PMKVY Certificate (L5)', query: 'Welding' },
    { label: '3M Milestone Verified', query: '3M' },
    { label: '6M Milestone Verified', query: '6M' },
    { label: '12M Milestone Track', query: '12M' },
    { label: 'DigiLocker e-KYC Active', query: 'DigiLocker' },
    { label: 'EPFO Linked Account', query: 'EPFO' },
  ]

  return (
    <div className="w-full shrink-0 flex flex-col font-sans z-40 relative shadow-sm">
      
      {/* ──────────────────────────────────────────────────────────
          ROW 1: UNIQUE PRIMARY HEADER FOR EACH PORTAL (GOV NAVY #0B2545)
         ────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B2545] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-white/10">
        
        {/* Portal Branding & Emblem */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setAllDrawerOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg lg:hidden text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          
          <Link
            href={isGovernmentOfficial ? "/intelligence" : "/dashboard"}
            className="flex items-center gap-3 hover:opacity-95 transition-opacity"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🇮🇳
            </div>
            <div className="flex flex-col text-left">
              {isGovernmentOfficial ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-white leading-tight">
                      MINISTRY OF SKILL DEVELOPMENT &amp; ENTREPRENEURSHIP
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                      OFFICER VIEW
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">
                    National Longitudinal Outcome Audit &amp; Policy Intelligence System · CONTINUUM
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-white leading-tight">
                      SKILL INDIA DIGITAL WORKFORCE PORTAL
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-black bg-blue-400/20 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded">
                      LEARNER PORTAL
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Government of India · National Trainee Outcome Ledger &amp; Lifetime DSIG
                  </span>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Center Search Bar (Amazon Structure / Government Theme) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-2 items-center h-11 rounded-xl overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-sky-400 border border-slate-300">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 h-full border-r border-slate-300 outline-none cursor-pointer"
          >
            {isGovernmentOfficial ? (
              <>
                <option value="All Sectors">All Sectors</option>
                <option value="Automotive & Precision Welding">Automotive &amp; Welding</option>
                <option value="CNC Machine Operation">CNC Machining</option>
                <option value="Electronics & IoT">Electronics &amp; IoT</option>
                <option value="Healthcare & Nursing">Healthcare &amp; Nursing</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Textiles & Apparel">Textiles &amp; Apparel</option>
              </>
            ) : (
              <>
                <option value="All Modules">All Records</option>
                <option value="Outcomes">Outcome Ledger</option>
                <option value="Evidence">Verified Evidence</option>
                <option value="DSIG">DSIG Anchors</option>
              </>
            )}
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isGovernmentOfficial
                ? "Search trainees, UAN, skill trades, employers, or districts..."
                : "Search outcome milestones, payslips, DSIG graph nodes..."
            }
            className="flex-1 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-medium h-full"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-full flex items-center justify-center transition-colors shrink-0"
            title="Search Portal Database"
          >
            <Search size={18} className="stroke-[2.5]" />
          </button>
        </form>

        {/* Right Action & Profile Area */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Unique Profile Badge for each Role */}
          {isGovernmentOfficial ? (
            <div className="hidden xl:flex items-center gap-3 bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/20 flex items-center justify-center text-amber-300 font-bold text-xs">
                <Building2 size={16} />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-300 font-medium">MSDE Central Policy Division</span>
                <span className="font-bold text-white text-xs">Officer ID: MSDE-OFF-8821</span>
              </div>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-3 bg-white/10 border border-white/15 px-3.5 py-2 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-600 border border-white/20 flex items-center justify-center text-white font-black text-xs">
                RK
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-300 font-medium">Trainee T001 • NSQF Level 5</span>
                <span className="font-bold text-white text-xs">Ravi Kumar (Madurai)</span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-rose-100 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-400/40 px-3.5 py-2.5 rounded-xl transition-all duration-200 shadow-xs active:translate-y-px"
            title="Sign out of CONTINUUM"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          ROW 2: SECONDARY SUB-NAVBAR (GOV BLUE #134074)
         ────────────────────────────────────────────────────────── */}
      <div className="bg-[#134074] text-white px-4 sm:px-8 py-2 flex items-center gap-2 text-xs overflow-x-auto scrollbar-none border-b border-white/10 shadow-xs relative">
        
        {/* 'All' Hamburger Button */}
        <button
          onClick={() => setAllDrawerOpen(!allDrawerOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/15 font-bold shrink-0 text-white bg-white/10 transition-colors"
        >
          <Menu size={15} />
          <span>All Modules</span>
        </button>

        {/* Role-Specific Navigation Tabs */}
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/intelligence' && item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          const isFilterSearch = item.isFilter

          return (
            <div
              key={item.href}
              className="relative group shrink-0"
              onMouseEnter={() => {
                if (isFilterSearch) setFilterFlyoutOpen(true)
              }}
              onMouseLeave={() => {
                if (isFilterSearch) setFilterFlyoutOpen(false)
              }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-blue-700' : 'text-sky-300'} />
                <span>{item.label}</span>
                {isFilterSearch && <ChevronDown size={12} className="text-sky-300 ml-0.5" />}
              </Link>

              {/* Advanced Filter Hover Flyout Menu for Government Official */}
              {isFilterSearch && filterFlyoutOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 uppercase tracking-wider">
                      <Filter size={14} className="text-blue-600" />
                      <span>Live Filter Search</span>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">Engine Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Filter candidate records by retention milestones, wages, NSQF codes, and verified credentials.
                  </p>
                  <div className="space-y-1.5 text-xs font-semibold">
                    <Link
                      href="/advanced-search?q=Welding"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-colors"
                    >
                      <span>🔥 Precision Welding (L5)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Madurai</span>
                    </Link>
                    <Link
                      href="/advanced-search?q=CNC"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-colors"
                    >
                      <span>⚙️ CNC Milling &amp; Machine Tech</span>
                      <span className="text-[10px] text-slate-400 font-mono">Coimbatore</span>
                    </Link>
                    <Link
                      href="/advanced-search"
                      className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 bg-gov-navy hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      <Filter size={13} />
                      <span>Launch Full Filter Workspace</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────
          ROW 3: QUICK SHORTCUTS & COHORT SUB-STRIP
         ────────────────────────────────────────────────────────── */}
      <div className="bg-slate-100 text-slate-700 px-4 sm:px-8 py-2 border-b border-slate-200 text-xs hidden md:flex items-center gap-2 overflow-x-auto">
        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider shrink-0 mr-2">
          {isGovernmentOfficial ? 'Priority Cohorts:' : 'Quick Shortcuts:'}
        </span>
        {quickFilterLinks.map((cat) => (
          <button
            key={cat.label}
            onClick={() => {
              if (isGovernmentOfficial) {
                router.push(`/advanced-search?q=${encodeURIComponent(cat.query)}`)
              } else {
                router.push(`/outcomes?q=${encodeURIComponent(cat.query)}`)
              }
            }}
            className="bg-white hover:bg-blue-50 hover:text-blue-900 hover:border-blue-400 text-slate-700 border border-slate-300 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shadow-2xs"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mobile Drawer Overlay */}
      {allDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="bg-[#0B2545] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl">🇮🇳</div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-sm text-white">
                    {isGovernmentOfficial ? 'MSDE Officer Portal' : 'Skill India Trainee'}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">CONTINUUM · SIH 26135</span>
                </div>
              </div>
              <button onClick={() => setAllDrawerOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              <div>
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-3">
                  Portal Navigation
                </p>
                <div className="space-y-1.5">
                  {activeNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAllDrawerOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-slate-800 font-bold transition-colors"
                      >
                        <Icon size={18} className="text-blue-600" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setAllDrawerOpen(false)}></div>
        </div>
      )}
    </div>
  )
}
