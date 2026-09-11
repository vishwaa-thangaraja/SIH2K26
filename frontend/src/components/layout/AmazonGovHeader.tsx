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
  Building2, Sparkles, Landmark, BadgeCheck, FileText, Compass
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  isFilter?: boolean
}

interface ModuleItem {
  label: string
  href: string
  icon: React.ElementType
  desc: string
  badge?: string
}

interface ModuleSection {
  category: string
  items: ModuleItem[]
}

export default function AmazonGovHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, activeTrainee } = useRole()
  const isGovernmentOfficial = role === 'analyst'

  const [searchQuery, setSearchQuery] = useState('')
  const [allDrawerOpen, setAllDrawerOpen] = useState(false)
  const [drawerFilter, setDrawerFilter] = useState('')
  const [filterFlyoutOpen, setFilterFlyoutOpen] = useState(false)

  // Dynamic Scroll state for subtle elevation shadow
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when All Modules drawer is open
  useEffect(() => {
    if (allDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [allDrawerOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    if (isGovernmentOfficial) {
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

  // ── Analyst Nav Items (Horizontal Sub-Bar) ──
  const analystNavItems: NavItem[] = [
    { label: 'Macro Intelligence', href: '/intelligence', icon: BarChart3 },
    { label: 'Import Training Data', href: '/intake/import', icon: Upload },
    { label: 'Advanced Filter Search', href: '/advanced-search', icon: Filter, isFilter: true },
    { label: 'Policy Directive and Recommendation', href: '/intelligence/policy', icon: LineChart },
    { label: 'Provider Scorecards', href: '/scorecards', icon: Award },
    { label: 'Regional Skill Map', href: '/regional-analytics', icon: Map },
    { label: 'Trainee Audit Records', href: '/trainees/T001/timeline', icon: ClipboardList },
    { label: 'DSIG Graph Audit', href: '/dsig', icon: Network },
    { label: 'Evidence OCR Engine', href: '/evidence/DOC-096BF585/extraction', icon: FileSearch },
  ]

  // ── Trainee Nav Items (Horizontal Sub-Bar) ──
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

  // ── All Modules Catalog (Comprehensive Directory) ──
  const allModuleSections: ModuleSection[] = [
    {
      category: 'Macro Governance & Policy Loop',
      items: [
        { label: 'Macro Outcome Intelligence', href: '/intelligence', icon: BarChart3, desc: 'Aggregated longitudinal 3M–24M KPIs & benchmarks', badge: 'Live Data' },
        { label: 'Policy Directive and Recommendation', href: '/intelligence/policy', icon: LineChart, desc: 'Automated seat & funding reallocation interventions', badge: 'Active' },
        { label: 'Training Provider Scorecards', href: '/scorecards', icon: Award, desc: 'Institutional placement & wage adequacy rankings' },
        { label: 'Regional GIS Skill-Gap Map', href: '/regional-analytics', icon: Map, desc: 'Spatial district-wise labor deficit & supply heatmap', badge: 'GIS Heatmap' },
      ],
    },
    {
      category: 'Data Intake & Candidate Search',
      items: [
        { label: 'Module 1: Intake & Ingestion', href: '/intake/import', icon: Upload, desc: 'CSV batch upload, schema validation & auto-deduplication', badge: 'Wizard' },
        { label: 'Advanced Filter Search', href: '/advanced-search', icon: Filter, desc: '10-per-page faceted search by sector, NSQF & district', badge: 'Faceted' },
      ],
    },
    {
      category: 'Candidate Skill Identity & Career Progression',
      items: [
        { label: 'Trainee 360° Profile', href: `/trainees/${activeTrainee?.trainee_id || 'T001'}`, icon: User, desc: 'Institutional credentials, verified wage & employment history' },
        { label: 'Longitudinal Wage Timeline', href: `/trainees/${activeTrainee?.trainee_id || 'T001'}/timeline`, icon: ClipboardList, desc: 'Multi-year trajectory & career milestone progression' },
        { label: 'Dynamic Skill Identity Graph (DSIG)', href: '/dsig', icon: Network, desc: 'Decoupled graph identity resolving SIM/contact migrations', badge: 'Graph Engine' },
        { label: 'Identity Recovery Protocol', href: '/identity/recovery', icon: RefreshCw, desc: 'Multi-tier anchor threshold verification for migrated contacts' },
        { label: 'Identity Contact Update', href: '/identity/update', icon: Shield, desc: 'Update mobile & address credentials securely' },
      ],
    },
    {
      category: 'Autonomous Evidence Verification & Attestation',
      items: [
        { label: 'Autonomous Payslip OCR Engine', href: '/evidence/DOC-096BF585/extraction', icon: FileSearch, desc: 'Tesseract OCR with Gross - Deductions == Net equation check', badge: 'Tesseract' },
        { label: 'Evidence vs Claim Comparison', href: '/evidence/DOC-096BF585/comparison', icon: BadgeCheck, desc: 'Automated side-by-side claim & document verification' },
        { label: 'Outcome Ledger & Wage History', href: '/outcomes', icon: FileText, desc: 'Tamper-evident log of verified employment outcomes' },
        { label: 'Upload Evidence Document', href: `/evidence/upload?trainee_id=${activeTrainee?.trainee_id || 'T001'}`, icon: Upload, desc: 'Submit salary slips, bank credit SMS or offer letters' },
        { label: 'Employer HR Attestation', href: '/attestation', icon: CheckSquare, desc: 'One-tap digital outcome confirmation portal for employers' },
      ],
    },
  ]

  // Filter sections if search term is entered
  const filteredSections = allModuleSections.map((sec) => ({
    ...sec,
    items: sec.items.filter(
      (it) =>
        it.label.toLowerCase().includes(drawerFilter.toLowerCase()) ||
        it.desc.toLowerCase().includes(drawerFilter.toLowerCase()) ||
        sec.category.toLowerCase().includes(drawerFilter.toLowerCase())
    ),
  })).filter((sec) => sec.items.length > 0)

  return (
    <>
      {/* Main Header Container - Native Smooth Sticky Header (Zero Jump, Zero Jitter) */}
      <header
        className={`sticky top-0 z-40 w-full shrink-0 flex flex-col font-sans transition-shadow duration-200 ${
          isScrolled ? 'shadow-lg border-b border-slate-900/40' : 'shadow-xs'
        }`}
      >

        {/* ──────────────────────────────────────────────────────────
            ROW 1: UNIQUE PRIMARY HEADER (GOV NAVY #0B2545)
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

            <Link href={isGovernmentOfficial ? '/intelligence' : '/dashboard'} className="flex items-center gap-3 group">
              <div className="h-10 px-2 py-1 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img src="/emblem.png" alt="Government of India - MSDE" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    MINISTRY OF SKILL DEVELOPMENT &amp; ENTREPRENEURSHIP
                  </span>
                  <span className="hidden md:inline-block text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-xs">
                    {isGovernmentOfficial ? 'Officer View' : 'Trainee View'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium tracking-wide">
                  Autonomous Longitudinal Livelihood Intelligence System · CONTINUUM
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isGovernmentOfficial
                      ? 'Search by Trainee ID (e.g. T001) or Location (e.g. Madurai)...'
                      : 'Search your verified outcomes or employer records...'
                  }
                  className="w-full bg-slate-900/90 text-white placeholder-slate-400 text-xs px-4 py-2.5 pl-10 pr-24 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
                />
                <Search size={15} className="absolute left-3.5 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {isGovernmentOfficial ? (
              <div className="hidden lg:flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-400/30">
                  🏛️
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-semibold text-slate-300 text-[10px]">MSDE Central Policy Division</span>
                  <span className="font-bold text-white text-[11px]">Officer ID: MSDE-OFF-8821</span>
                </div>
              </div>
            ) : (
              <Link
                href={`/trainees/${activeTrainee?.trainee_id || 'T001'}`}
                className="hidden lg:flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-400/30">
                  <User size={13} />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-semibold text-slate-300 text-[10px]">Trainee Candidate</span>
                  <span className="font-bold text-white text-[11px]">{activeTrainee?.name || 'Ravi Kumar'} ({activeTrainee?.trainee_id || 'T001'})</span>
                </div>
              </Link>
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
          
          {/* 'All Modules' Hamburger Button */}
          <button
            onClick={() => setAllDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 font-bold shrink-0 text-white bg-white/15 transition-all shadow-xs active:scale-95"
            title="Open Complete Modules Directory"
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

                {/* Advanced Filter Hover Flyout Menu */}
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
      </header>

      {/* ──────────────────────────────────────────────────────────
          ALL MODULES FULL-VIEWPORT DRAWER (RENDERED AT ROOT LEVEL)
         ────────────────────────────────────────────────────────── */}
      {allDrawerOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex animate-in fade-in duration-200">
          {/* Left Drawer Panel */}
          <div className="w-[400px] max-w-[90vw] bg-white h-screen max-h-screen shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 z-[10000] border-r border-slate-200 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="bg-[#0B2545] text-white p-5 flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-9 px-2 py-0.5 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
                  <img src="/emblem.png" alt="MSDE Emblem" className="h-7 w-auto object-contain" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">CONTINUUM</span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                      All Modules
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">
                    {isGovernmentOfficial ? 'MSDE Officer Portal Directory' : 'Skill India Trainee Directory'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAllDrawerOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={drawerFilter}
                  onChange={(e) => setDrawerFilter(e.target.value)}
                  placeholder="Filter modules (e.g. OCR, Intake, Map, DSIG)..."
                  className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs px-3.5 py-2 pl-9 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                {drawerFilter && (
                  <button
                    onClick={() => setDrawerFilter('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Module List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-6 text-xs divide-y divide-slate-100">
              {filteredSections.length > 0 ? (
                filteredSections.map((sec, secIdx) => (
                  <div key={sec.category} className={secIdx > 0 ? 'pt-5' : ''}>
                    <p className="font-black text-slate-400 uppercase tracking-wider text-[10px] mb-2.5 flex items-center justify-between">
                      <span>{sec.category}</span>
                      <span className="text-[9px] font-medium text-slate-400">({sec.items.length})</span>
                    </p>
                    <div className="space-y-1">
                      {sec.items.map((item) => {
                        const Icon = item.icon
                        const isCurrentPage = pathname === item.href

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setAllDrawerOpen(false)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 group ${
                              isCurrentPage
                                ? 'bg-blue-50 border border-blue-200 text-blue-900'
                                : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isCurrentPage ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs tracking-tight truncate group-hover:text-blue-700">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-800">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                                {item.desc}
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Compass size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-600">No modules match &quot;{drawerFilter}&quot;</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try searching for &apos;OCR&apos;, &apos;Intake&apos;, &apos;Map&apos;, or &apos;Trainee&apos;</p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pb-2 border-b border-slate-200/60">
                <span>Active Role: <strong className="text-slate-800">{isGovernmentOfficial ? 'MSDE Official' : 'Candidate'}</strong></span>
                <Link
                  href="/"
                  onClick={() => setAllDrawerOpen(false)}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Switch Role
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors shadow-xs text-xs"
              >
                <LogOut size={15} />
                <span>Sign Out of CONTINUUM</span>
              </button>
            </div>
          </div>

          {/* Clickable Backdrop to Close */}
          <div className="flex-1 cursor-pointer" onClick={() => setAllDrawerOpen(false)}></div>
        </div>
      )}
    </>
  )
}
