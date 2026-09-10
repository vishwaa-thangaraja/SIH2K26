'use client'

import React, { useState, useEffect } from 'react'
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
  const { role, activeTrainee } = useRole()
  const isGovernmentOfficial = role === 'analyst'

  const [searchQuery, setSearchQuery] = useState('')
  const [allDrawerOpen, setAllDrawerOpen] = useState(false)
  const [filterFlyoutOpen, setFilterFlyoutOpen] = useState(false)

  // Dynamic Scroll & Hover states
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    if (isGovernmentOfficial) {
      // Check if it's a specific Trainee ID format (e.g. T001, T002, etc.)
      if (/^T\d+$/i.test(query)) {
        router.push(`/trainees/${query.toUpperCase()}/timeline`)
      } else {
        router.push(`/advanced-search?q=${encodeURIComponent(query)}`)
      }
    } else {
      if (/^T\d+$/i.test(query)) {
        router.push(`/trainees/${query.toUpperCase()}`)
      } else {
        router.push(`/outcomes?q=${encodeURIComponent(query)}`)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('continuum_role')
    localStorage.removeItem('continuum_active_trainee_id')
    router.push('/')
  }

  // ── Analyst Nav Items ──
  const analystNavItems: NavItem[] = [
    { label: 'Macro Intelligence', href: '/intelligence', icon: BarChart3 },
    { label: 'Import Training Data', href: '/intake/import', icon: Upload },
    { label: 'Advanced Filter Search', href: '/advanced-search', icon: Filter, isFilter: true },
    { label: 'Policy Directives', href: '/intelligence/policy', icon: LineChart },
    { label: 'Provider Scorecards', href: '/scorecards', icon: Award },
    { label: 'Regional Skill Map', href: '/regional-analytics', icon: Map },
    { label: 'Trainee Audit Records', href: '/trainees/T001/timeline', icon: ClipboardList },
    { label: 'DSIG Graph Audit', href: '/dsig', icon: Network },
    { label: 'Evidence OCR Engine', href: '/evidence/DOC001/extraction', icon: FileSearch },
  ]

  // ── Trainee Nav Items (Anchored to authenticated active trainee) ──
  const traineeNavItems: NavItem[] = [
    { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My 360° Profile', href: `/trainees/${activeTrainee?.trainee_id || 'T001'}`, icon: User },
    { label: 'Identity Graph (DSIG)', href: '/dsig', icon: Network },
    { label: 'Manage Identity', href: '/identity/update', icon: Shield },
    { label: 'Identity Recovery', href: '/identity/recovery', icon: RefreshCw },
    { label: 'Outcome Ledger & Wages', href: '/outcomes', icon: ClipboardList },
    { label: 'Claim New Outcome', href: `/outcomes/new?trainee_id=${activeTrainee?.trainee_id || 'T001'}`, icon: BookOpen },
    { label: 'Upload Evidence', href: `/evidence/upload?trainee_id=${activeTrainee?.trainee_id || 'T001'}`, icon: Upload },
    { label: 'Employer Attestation', href: '/attestation', icon: CheckSquare },
  ]

  const activeNavItems = isGovernmentOfficial ? analystNavItems : traineeNavItems

  return (
    <>
      {/* Top Hover Sensor: Invisible trigger strip fixed at top when scrolled down */}
      {isScrolled && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          className="fixed top-0 left-0 right-0 h-4 z-50 pointer-events-auto cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Main Header Container with Auto-Hide and Hover-to-Open */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full shrink-0 flex flex-col font-sans z-40 transition-all duration-300 ease-in-out ${
          isScrolled
            ? `fixed top-0 left-0 right-0 shadow-2xl ${
                isHovered
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-[calc(100%-8px)] opacity-95 hover:translate-y-0 hover:opacity-100'
              }`
            : 'relative translate-y-0 opacity-100 shadow-sm'
        }`}
      >
        {/* Visual cue strip visible at top when header is tucked away */}
        {isScrolled && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-amber-400 to-sky-400 cursor-pointer animate-pulse" />
        )}

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

        {/* Center Search Bar for Officials, or Privacy Verification Banner for Learners */}
        {isGovernmentOfficial ? (
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-2 items-center h-11 rounded-xl overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-sky-400 border border-slate-300">
            <div className="flex items-center gap-1.5 pl-3.5 pr-2 text-slate-500 shrink-0">
              <Search size={16} className="text-slate-400" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Trainee ID (e.g. T001) or Location (e.g. Madurai, Coimbatore)..."
              className="flex-1 px-2 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium h-full"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-full flex items-center justify-center transition-colors shrink-0 font-bold text-xs"
              title="Search by Trainee ID or Location"
            >
              <span>Search</span>
            </button>
          </form>
        ) : (
          <div className="hidden md:flex flex-1 max-w-xl mx-4 items-center justify-center">
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-blue-100 text-xs shadow-inner">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>
                Authenticated Learner: <strong className="text-white font-bold">{activeTrainee?.name || 'Candidate'}</strong> ({activeTrainee?.trainee_id || 'T001'})
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                Private Session
              </span>
            </div>
          </div>
        )}

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
              <div className="w-8 h-8 rounded-lg bg-blue-600 border border-white/20 flex items-center justify-center text-white font-black text-xs uppercase">
                {activeTrainee?.initials || 'TR'}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-300 font-medium">
                  Trainee {activeTrainee?.trainee_id || 'T001'} • {activeTrainee?.program || 'NSQF Level 5'}
                </span>
                <span className="font-bold text-white text-xs">
                  {activeTrainee?.name || 'Candidate'} ({activeTrainee?.district || 'India'})
                </span>
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
    </>
  )
}
