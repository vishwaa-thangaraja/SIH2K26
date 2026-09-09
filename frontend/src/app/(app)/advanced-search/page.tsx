'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MOCK_SEARCH_DATASET, SearchTraineeRecord } from '@/lib/mockSearchData'
import {
  Search, Filter, X, ChevronRight, Check,
  ShieldCheck, AlertTriangle, Building2, Calendar,
  User, Download, ArrowUpDown, SlidersHorizontal,
  ExternalLink, Network, CheckCircle2, RotateCcw,
  Sparkles, Landmark, BadgeCheck, FileText, ChevronDown,
  Send, Zap, RefreshCw, Radio, Phone, MessageSquare, Clock
} from 'lucide-react'

export default function AdvancedFilterSearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Advanced Filter Engine...</p>
      </div>
    }>
      <AdvancedFilterSearchContent />
    </Suspense>
  )
}

function AdvancedFilterSearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialSector = searchParams.get('sector') || ''

  // Filter drawer open state (defaults to false so it does not always occupy space unless toggled/hovered)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  // Search keyword
  const [searchTerm, setSearchTerm] = useState(initialQuery)

  // Filter States (Checkboxes & Range - No Dropdowns!)
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([])
  const [selectedVerification, setSelectedVerification] = useState<string[]>([])
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    initialSector && initialSector !== 'All Sectors' ? [initialSector] : []
  )
  const [selectedNsqf, setSelectedNsqf] = useState<number[]>([])
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([])
  
  // Wage Filter (Slider and Quick Presets)
  const [wageMin, setWageMin] = useState<number>(10000)
  const [wageMax, setWageMax] = useState<number>(45000)
  const [selectedWagePreset, setSelectedWagePreset] = useState<string | null>(null)

  // Sort State
  const [sortBy, setSortBy] = useState<'confidence' | 'wage_desc' | 'wage_asc' | 'retention'>('confidence')

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const PAGE_SIZE = 10

  // Live database trainees state
  const [liveTrainees, setLiveTrainees] = useState<SearchTraineeRecord[]>([])

  // Batch follow-up outreach state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<any>(null)
  const [broadcastMilestone, setBroadcastMilestone] = useState('3M')
  const [summaryStats, setSummaryStats] = useState<{
    total_sent: number
    total_delivered: number
    total_responded: number
    response_rate_percent: number
    unverified_candidates: number
  } | null>(null)

  const fetchSummaryStats = () => {
    fetch('http://127.0.0.1:8000/communications/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSummaryStats(data)
      })
      .catch(() => {})
  }

  const handleTriggerBatchBroadcast = async () => {
    setIsBroadcasting(true)
    setIsBatchModalOpen(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/communications/broadcast-unverified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone: broadcastMilestone,
          sender: 'OFFICER_BULK_OUTREACH',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setBroadcastResult(data)
        fetchSummaryStats()
      } else {
        alert('Failed to trigger broadcast. Please check backend server status.')
      }
    } catch (e) {
      console.error(e)
      alert('Error connecting to communications service.')
    } finally {
      setIsBroadcasting(false)
    }
  }

  useEffect(() => {
    fetch('http://127.0.0.1:8000/trainees')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped: SearchTraineeRecord[] = data.map((t: any) => ({
            id: t.trainee_id,
            trainee_id: t.trainee_id,
            name: t.name,
            gender: (t.gender === 'Female' ? 'Female' : 'Male') as any,
            social_category: 'OBC',
            is_rural: true,
            program: t.program || 'Vocational Training',
            sector: (t.sector || 'Automotive & Precision Welding') as any,
            nsqf_level: t.nsqf_level || 4,
            provider: t.provider || 'Accredited Center',
            district: (t.district || 'Madurai') as any,
            state: t.state || 'Tamil Nadu',
            current_employer: null,
            current_role: null,
            employment_type: 'wage_employed',
            monthly_wage: 18000,
            wage_growth_pct: 25.0,
            milestone_progress: { training: true, m3: true, m6: false, m12: false, m24: false },
            retention_months: 6,
            confidence_score: 95,
            verification_sources: ['Training Ingestion Protocol', 'Institutional Assessment'],
            dsig_node_count: 4,
            flagged_for_audit: false,
            completion_date: t.completion_date || '2026-03-30',
            uan_epfo_matched: false,
            digilocker_verified: true,
          }))
          setLiveTrainees(mapped)
        }
      })
      .catch(() => {})
    fetchSummaryStats()
  }, [])

  // Combined dataset: live database trainees take precedence
  const effectiveDataset = useMemo(() => {
    if (liveTrainees.length === 0) return MOCK_SEARCH_DATASET
    const liveIds = new Set(liveTrainees.map((t) => t.trainee_id))
    const existingFiltered = MOCK_SEARCH_DATASET.filter((t) => !liveIds.has(t.trainee_id))
    return [...liveTrainees, ...existingFiltered]
  }, [liveTrainees])

  // Dynamically compute available filter facets from the effective dataset
  const dynamicFilterFacets = useMemo(() => {
    const sectors = new Set<string>()
    const nsqfLevels = new Set<number>()
    const districts = new Set<string>()

    effectiveDataset.forEach((t) => {
      if (t.sector) sectors.add(t.sector)
      if (t.nsqf_level) nsqfLevels.add(t.nsqf_level)
      if (t.district) districts.add(t.district)
    })

    return {
      sectors: Array.from(sectors).sort(),
      nsqfLevels: Array.from(nsqfLevels).sort((a, b) => a - b),
      districts: Array.from(districts).sort(),
    }
  }, [effectiveDataset])

  // Update from URL params if changed
  useEffect(() => {
    if (initialQuery) setSearchTerm(initialQuery)
    if (initialSector && initialSector !== 'All Sectors') {
      setSelectedSectors([initialSector])
    }
  }, [initialQuery, initialSector])

  // Helper toggle functions
  const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  const handleWagePreset = (min: number, max: number, presetLabel: string) => {
    if (selectedWagePreset === presetLabel) {
      setWageMin(10000)
      setWageMax(45000)
      setSelectedWagePreset(null)
    } else {
      setWageMin(min)
      setWageMax(max)
      setSelectedWagePreset(presetLabel)
    }
  }

  const handleClearAllFilters = () => {
    setSearchTerm('')
    setSelectedMilestones([])
    setSelectedVerification([])
    setSelectedSectors([])
    setSelectedNsqf([])
    setSelectedDistricts([])
    setSelectedProviders([])
    setSelectedDemographics([])
    setWageMin(10000)
    setWageMax(45000)
    setSelectedWagePreset(null)
  }

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchTerm) count++
    count += selectedMilestones.length
    count += selectedVerification.length
    count += selectedSectors.length
    count += selectedNsqf.length
    count += selectedDistricts.length
    count += selectedProviders.length
    count += selectedDemographics.length
    if (wageMin > 10000 || wageMax < 45000 || selectedWagePreset) count++
    return count
  }, [searchTerm, selectedMilestones, selectedVerification, selectedSectors, selectedNsqf, selectedDistricts, selectedProviders, selectedDemographics, wageMin, wageMax, selectedWagePreset])

  // Filter Algorithm
  const filteredResults = useMemo(() => {
    return effectiveDataset.filter((item) => {
      // Keyword search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesQuery =
          item.name.toLowerCase().includes(q) ||
          item.trainee_id.toLowerCase().includes(q) ||
          item.program.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.sector.toLowerCase().includes(q) ||
          (item.current_employer && item.current_employer.toLowerCase().includes(q)) ||
          (item.current_role && item.current_role.toLowerCase().includes(q))
        if (!matchesQuery) return false
      }

      // Milestones
      if (selectedMilestones.length > 0) {
        const matchesMilestone = selectedMilestones.some(m => {
          if (m === '3m' && item.milestone_progress.m3) return true
          if (m === '6m' && item.milestone_progress.m6) return true
          if (m === '12m' && item.milestone_progress.m12) return true
          if (m === '24m' && item.milestone_progress.m24) return true
          if (m === 'wage_employed' && item.employment_type === 'wage_employed') return true
          if (m === 'self_employed' && item.employment_type === 'self_employed') return true
          return false
        })
        if (!matchesMilestone) return false
      }

      // Verification sources
      if (selectedVerification.length > 0) {
        const matchesVerif = selectedVerification.some(v => {
          if (v === 'digilocker' && item.digilocker_verified) return true
          if (v === 'epfo' && item.uan_epfo_matched) return true
          if (v === 'high_confidence' && item.confidence_score >= 90) return true
          if (v === 'audit_flagged' && item.flagged_for_audit) return true
          return false
        })
        if (!matchesVerif) return false
      }

      // Sectors
      if (selectedSectors.length > 0 && !selectedSectors.includes(item.sector)) {
        return false
      }

      // NSQF Level
      if (selectedNsqf.length > 0 && !selectedNsqf.includes(item.nsqf_level)) {
        return false
      }

      // District
      if (selectedDistricts.length > 0 && !selectedDistricts.includes(item.district)) {
        return false
      }

      // Provider
      if (selectedProviders.length > 0 && !selectedProviders.some(p => item.provider.includes(p))) {
        return false
      }

      // Demographics
      if (selectedDemographics.length > 0) {
        const matchesDemo = selectedDemographics.some(d => {
          if (d === 'female' && item.gender === 'Female') return true
          if (d === 'male' && item.gender === 'Male') return true
          if (d === 'sc_st' && item.social_category === 'SC/ST') return true
          if (d === 'rural' && item.is_rural) return true
          return false
        })
        if (!matchesDemo) return false
      }

      // Wage Range
      if (item.monthly_wage < wageMin || item.monthly_wage > wageMax) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'confidence') return b.confidence_score - a.confidence_score
      if (sortBy === 'wage_desc') return b.monthly_wage - a.monthly_wage
      if (sortBy === 'wage_asc') return a.monthly_wage - b.monthly_wage
      if (sortBy === 'retention') return b.retention_months - a.retention_months
      return 0
    })
  }, [effectiveDataset, searchTerm, selectedMilestones, selectedVerification, selectedSectors, selectedNsqf, selectedDistricts, selectedProviders, selectedDemographics, wageMin, wageMax, sortBy])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMilestones, selectedVerification, selectedSectors, selectedNsqf, selectedDistricts, selectedProviders, selectedDemographics, wageMin, wageMax, sortBy])

  // Pagination calculation (10 per page)
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE))
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredResults.slice(start, start + PAGE_SIZE)
  }, [filteredResults, currentPage])

  return (
    <div className="space-y-4">
      {/* ── TOP HEADER (GOVERNMENT PALETTE) ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <span>National Outcome Ledger</span>
              <ChevronRight size={12} className="text-slate-400" />
              <span>Multi-Source Verification Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Advanced Filter Search
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Filter multi-year 3M, 6M, 12M &amp; 24M trainee outcome records using structured checkboxes and wage intervals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle Filter Drawer Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`inline-flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-lg border transition-all shadow-xs ${
                isFilterDrawerOpen
                  ? 'bg-gov-navy text-white border-gov-navy'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} className={isFilterDrawerOpen ? 'text-sky-300' : 'text-blue-600'} />
              <span>{isFilterDrawerOpen ? 'Hide Filter Panel' : 'Show Advanced Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isFilterDrawerOpen ? 'bg-sky-400 text-gov-navy' : 'bg-blue-600 text-white'
                }`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                alert(`Exporting ${filteredResults.length} trainee records as Provenance CSV...`)
              }}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition-colors"
            >
              <Download size={14} />
              <span>Export Cohort</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-2.5 rounded-lg transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── AUTONOMOUS LONGITUDINAL OUTREACH BANNER ── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-md border border-blue-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Zap size={10} className="fill-amber-300" /> Longitudinal Follow-Up Engine
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Telecom Cellular Gateway
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            1-Click Batch Follow-Up Broadcast
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Continuum automatically scans the outcome ledger for trainees with pending periodic verifications ({summaryStats ? summaryStats.unverified_candidates : '30+'} candidates) and dispatches a verified SMS follow-up with a direct self-reporting portal link.
          </p>
          {summaryStats && (
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-blue-200/80 font-medium">
              <span>Dispatched: <strong className="text-white">{summaryStats.total_sent}</strong></span>
              <span>•</span>
              <span>Delivered: <strong className="text-emerald-400">{summaryStats.total_delivered}</strong></span>
              <span>•</span>
              <span>Trainee Responses: <strong className="text-sky-300">{summaryStats.total_responded}</strong></span>
              <span>•</span>
              <span>Response Rate: <strong className="text-amber-300">{summaryStats.response_rate_percent}%</strong></span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <select
            value={broadcastMilestone}
            onChange={(e) => setBroadcastMilestone(e.target.value)}
            disabled={isBroadcasting}
            className="bg-blue-950/80 border border-blue-700 text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer hover:border-blue-500"
          >
            <option value="3M">Milestone: 3-Month Follow-Up</option>
            <option value="6M">Milestone: 6-Month Retention</option>
            <option value="12M">Milestone: 1-Year Wage Increment</option>
            <option value="24M">Milestone: 2-Year Long-Term</option>
          </select>

          <button
            onClick={handleTriggerBatchBroadcast}
            disabled={isBroadcasting}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isBroadcasting ? (
              <>
                <RefreshCw size={14} className="animate-spin text-slate-950" />
                <span>Broadcasting Packets...</span>
              </>
            ) : (
              <>
                <Zap size={14} className="fill-slate-950" />
                <span>⚡ Broadcast Follow-Up to All Due Trainees</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── RESULTS CONTROL & SORT BAR ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="sm:hidden inline-flex items-center gap-1.5 text-blue-700 font-bold border border-blue-200 bg-blue-50 px-2.5 py-1 rounded-md"
          >
            <Filter size={13} />
            <span>Filters</span>
          </button>
          <span>
            Showing <strong>{filteredResults.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredResults.length)}</strong> of <strong>{filteredResults.length}</strong> outcome records
          </span>
          {searchTerm && (
            <span> for <strong className="text-blue-700">"{searchTerm}"</strong></span>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="confidence">Confidence Score: High to Low</option>
            <option value="wage_desc">Monthly Wage: High to Low</option>
            <option value="wage_asc">Monthly Wage: Low to High</option>
            <option value="retention">Retention Duration: Longest First</option>
          </select>
        </div>
      </div>

      {/* ── APPLIED FILTER TAGS BAR ── */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Applied Filters:</span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded-md font-medium">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:text-rose-600"><X size={12} /></button>
            </span>
          )}

          {selectedSectors.map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-900 px-2 py-0.5 rounded-md font-medium">
              Sector: {s}
              <button onClick={() => setSelectedSectors(selectedSectors.filter(x => x !== s))} className="hover:text-rose-600"><X size={12} /></button>
            </span>
          ))}

          {selectedDistricts.map(d => (
            <span key={d} className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-900 px-2 py-0.5 rounded-md font-medium">
              District: {d}
              <button onClick={() => setSelectedDistricts(selectedDistricts.filter(x => x !== d))} className="hover:text-rose-600"><X size={12} /></button>
            </span>
          ))}

          {selectedNsqf.map(n => (
            <span key={n} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-0.5 rounded-md font-medium">
              NSQF L{n}
              <button onClick={() => setSelectedNsqf(selectedNsqf.filter(x => x !== n))} className="hover:text-rose-600"><X size={12} /></button>
            </span>
          ))}

          {selectedWagePreset && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-medium">
              Wage: {selectedWagePreset}
              <button onClick={() => { setWageMin(10000); setWageMax(45000); setSelectedWagePreset(null) }} className="hover:text-rose-600"><X size={12} /></button>
            </span>
          )}

          <button
            onClick={handleClearAllFilters}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-bold ml-auto hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── 2-COLUMN DYNAMIC LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* ──────────────────────────────────────────────────────────
            FLYOUT / SLIDE-OVER FILTER PANEL (FIGURE 2 STYLE)
            (NO DROPDOWNS - ONLY CHECKBOXES, SLIDERS & CATEGORY BUTTONS)
           ────────────────────────────────────────────────────────── */}
        {isFilterDrawerOpen && (
          <aside className="lg:col-span-4 bg-white border-2 border-blue-100 rounded-xl p-5 shadow-lg space-y-6 self-start animate-in fade-in slide-in-from-left duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gov-navy" />
                <h2 className="font-extrabold text-sm text-gov-navy uppercase tracking-wide">
                  Structured Filters
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {activeFiltersCount > 0 && (
                  <span className="text-[11px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    {activeFiltersCount} Active
                  </span>
                )}
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                  title="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 1. OUTCOME & RETENTION MILESTONES */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Retention Milestone
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                {[
                  { id: '3m', label: '3-Month Retention Verified' },
                  { id: '6m', label: '6-Month Retention Verified' },
                  { id: '12m', label: '12-Month Career Continuity' },
                  { id: '24m', label: '24-Month Longitudinal Track' },
                  { id: 'wage_employed', label: 'Formal Wage Employed' },
                  { id: 'self_employed', label: 'Self-Employed / Udyam' },
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group">
                    <input
                      type="checkbox"
                      checked={selectedMilestones.includes(item.id)}
                      onChange={() => setSelectedMilestones(toggleArrayItem(selectedMilestones, item.id))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. VERIFICATION & TRUST SIGNALS */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Verification Engine &amp; Trust
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                {[
                  { id: 'digilocker', label: 'DigiLocker e-KYC (100%)' },
                  { id: 'epfo', label: 'EPFO / UAN Linked (>90%)' },
                  { id: 'high_confidence', label: 'High Confidence (≥90%)' },
                  { id: 'audit_flagged', label: 'Flagged for Audit (<80%)' },
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group">
                    <input
                      type="checkbox"
                      checked={selectedVerification.includes(item.id)}
                      onChange={() => setSelectedVerification(toggleArrayItem(selectedVerification, item.id))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. MONTHLY WAGE (PRICE FILTER STYLE - FIGURE 2) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Monthly Wage (₹)
                </h3>
                <span className="text-xs font-extrabold text-blue-900 font-mono">
                  ₹{wageMin.toLocaleString()} – ₹{wageMax.toLocaleString()}+
                </span>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={10000}
                  max={45000}
                  step={2500}
                  value={wageMax}
                  onChange={(e) => {
                    setWageMax(Number(e.target.value))
                    setSelectedWagePreset(null)
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>₹10,000</span>
                  <span>₹25,000</span>
                  <span>₹45,000+</span>
                </div>
              </div>

              {/* Quick Range Links (Amazon Style) */}
              <div className="space-y-1 text-xs text-slate-700 pt-1">
                {[
                  { label: 'Up to ₹15,000', min: 10000, max: 15000 },
                  { label: '₹15,000 – ₹20,000', min: 15000, max: 20000 },
                  { label: '₹20,000 – ₹28,000', min: 20000, max: 28000 },
                  { label: '₹28,000 – ₹35,000', min: 28000, max: 35000 },
                  { label: 'Over ₹35,000', min: 35000, max: 45000 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleWagePreset(preset.min, preset.max, preset.label)}
                    className={`w-full text-left py-1 px-2 rounded transition-colors block text-xs ${
                      selectedWagePreset === preset.label
                        ? 'font-extrabold text-blue-900 bg-blue-50'
                        : 'hover:text-blue-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. SECTOR & TRADE */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Sector &amp; Trade
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 max-h-48 overflow-y-auto pr-1">
                {dynamicFilterFacets.sectors.map(sector => (
                  <label key={sector} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector)}
                      onChange={() => setSelectedSectors(toggleArrayItem(selectedSectors, sector))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform truncate">{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. NSQF LEVEL */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                NSQF Qualification Level
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                {dynamicFilterFacets.nsqfLevels.map(lvl => (
                  <label key={lvl} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group">
                    <input
                      type="checkbox"
                      checked={selectedNsqf.includes(lvl)}
                      onChange={() => setSelectedNsqf(toggleArrayItem(selectedNsqf, lvl))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      NSQF Level {lvl} {lvl >= 5 ? '(Specialized)' : '(Foundation)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 6. DISTRICT / REGIONAL CLUSTER */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                District / Cluster
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 max-h-48 overflow-y-auto pr-1">
                {dynamicFilterFacets.districts.map(dist => (
                  <label key={dist} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group">
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(dist)}
                      onChange={() => setSelectedDistricts(toggleArrayItem(selectedDistricts, dist))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">{dist} Cluster</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 7. DEMOGRAPHICS & SOCIAL CATEGORY */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Demographics &amp; Inclusivity
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                {[
                  { id: 'female', label: 'Female Candidates' },
                  { id: 'male', label: 'Male Candidates' },
                  { id: 'sc_st', label: 'SC/ST Beneficiaries' },
                  { id: 'rural', label: 'Rural Candidates' },
                ].map(demo => (
                  <label key={demo.id} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group">
                    <input
                      type="checkbox"
                      checked={selectedDemographics.includes(demo.id)}
                      onChange={() => setSelectedDemographics(toggleArrayItem(selectedDemographics, demo.id))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">{demo.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Close / Apply button */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleClearAllFilters}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Apply &amp; Close
              </button>
            </div>
          </aside>
        )}

        {/* ──────────────────────────────────────────────────────────
            RESULTS FEED CONTAINER
           ────────────────────────────────────────────────────────── */}
        <div className={isFilterDrawerOpen ? 'lg:col-span-8 space-y-4' : 'lg:col-span-12 space-y-4'}>
          
          {/* Results List */}
          {filteredResults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search size={24} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">No matching outcome records found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your search filters, adjusting the monthly wage slider, or removing specific district criteria.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1.5 bg-gov-navy text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {paginatedResults.map((trainee) => (
                <div
                  key={trainee.id}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4 group"
                >
                  {/* Top Row: Avatar + Details + Wage Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gov-navy text-white font-black flex items-center justify-center text-base shrink-0 shadow-xs">
                        {trainee.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/trainees/${trainee.trainee_id}`}
                            className="font-extrabold text-base text-slate-900 hover:text-blue-700 transition-colors"
                          >
                            {trainee.name}
                          </Link>
                          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {trainee.trainee_id}
                          </span>
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                            NSQF L{trainee.nsqf_level}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {trainee.district}, {trainee.state}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {trainee.program} • <span className="text-slate-500">{trainee.provider}</span>
                        </p>

                        <div className="flex items-center gap-2 text-xs pt-0.5">
                          <span className="text-slate-500">Current Employer:</span>
                          <span className="font-bold text-slate-800">
                            {trainee.current_employer || 'Self-Employed / Freelance'}
                          </span>
                          {trainee.current_role && (
                            <span className="text-slate-500">({trainee.current_role})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Wage Metric Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left sm:text-right shrink-0 min-w-[170px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Verified Monthly Wage
                      </span>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        ₹{trainee.monthly_wage.toLocaleString()}
                        <span className="text-xs font-normal text-slate-500"> /mo</span>
                      </div>
                      <div className="flex items-center justify-start sm:justify-end gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          +{trainee.wage_growth_pct}% Growth
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({trainee.retention_months}M retained)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Longitudinal Milestone Progress (3M -> 6M -> 12M -> 24M) */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                      <span>Longitudinal Outcome Provenance Track:</span>
                      <span className="text-slate-500 font-mono">
                        DSIG Graph: {trainee.dsig_node_count} Cryptographic Anchors
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-[10px] text-center font-bold">
                      <div className="bg-emerald-100 text-emerald-900 py-1 px-1.5 rounded flex items-center justify-center gap-1">
                        <Check size={11} className="stroke-[3]" /> Training Cert
                      </div>

                      <div className={`py-1 px-1.5 rounded flex items-center justify-center gap-1 ${
                        trainee.milestone_progress.m3
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trainee.milestone_progress.m3 && <Check size={11} className="stroke-[3]" />}
                        3M Milestone
                      </div>

                      <div className={`py-1 px-1.5 rounded flex items-center justify-center gap-1 ${
                        trainee.milestone_progress.m6
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trainee.milestone_progress.m6 && <Check size={11} className="stroke-[3]" />}
                        6M Milestone
                      </div>

                      <div className={`py-1 px-1.5 rounded flex items-center justify-center gap-1 ${
                        trainee.milestone_progress.m12
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trainee.milestone_progress.m12 && <Check size={11} className="stroke-[3]" />}
                        12M Milestone
                      </div>

                      <div className={`py-1 px-1.5 rounded flex items-center justify-center gap-1 ${
                        trainee.milestone_progress.m24
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trainee.milestone_progress.m24 && <Check size={11} className="stroke-[3]" />}
                        24M Milestone
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Trust Badges & Action Links */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    
                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        trainee.confidence_score >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : trainee.confidence_score >= 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        <ShieldCheck size={13} />
                        {trainee.confidence_score}% Confidence
                      </span>

                      {trainee.digilocker_verified && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-200">
                          <BadgeCheck size={12} /> DigiLocker e-KYC
                        </span>
                      )}

                      {trainee.uan_epfo_matched && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-purple-200">
                          <Landmark size={12} /> EPFO Linked
                        </span>
                      )}

                      {trainee.flagged_for_audit && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          <AlertTriangle size={12} /> Flagged for Audit
                        </span>
                      )}
                    </div>

                    {/* Action Links - Direct Per-Trainee DSIG Tracker & Timeline */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        href={`/trainees/${trainee.trainee_id}`}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                        title={`View 360° Profile for ${trainee.name}`}
                      >
                        <User size={13} />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href={`/dsig?trainee_id=${trainee.trainee_id}`}
                        className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                        title={`Open dynamic 1:1 Skill Identity Graph for ${trainee.name}`}
                      >
                        <Network size={13} />
                        <span>DSIG Tracker</span>
                      </Link>

                      <Link
                        href={`/trainees/${trainee.trainee_id}/timeline`}
                        className="inline-flex items-center gap-1 text-white bg-gov-navy hover:bg-blue-900 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                        title={`Open longitudinal outcome timeline for ${trainee.name}`}
                      >
                        <Calendar size={13} />
                        <span>Timeline</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Pagination Controls (10 per page) */}
          {filteredResults.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-700 shadow-xs">
              <span className="text-slate-500 font-medium">
                Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({filteredResults.length} total trainees)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ‹ Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true
                    if (page === 1 || page === totalPages) return true
                    return Math.abs(page - currentPage) <= 1
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1]
                    const showEllipsis = prevPage && page - prevPage > 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-gov-navy text-white font-black shadow-xs'
                              : 'border border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    )
                  })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ── BATCH BROADCAST DISPATCH MODAL ── */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Autonomous SMS Outreach Dispatcher
                  </h3>
                  <p className="text-xs text-slate-400">
                    Milestone: {broadcastMilestone} Follow-Up Outreach Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {isBroadcasting ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900 text-sm">Transmitting Cellular SMS Follow-Ups...</p>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Connecting to telecom cellular gateways (SIM-AIRTEL / SIM-JIO) and dispatching personalized magic update links to candidate registered phones.
                    </p>
                  </div>
                </div>
              ) : broadcastResult ? (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Target Candidates</span>
                      <span className="text-lg font-black text-slate-900">{broadcastResult.total_unverified_candidates}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Successfully Dispatched</span>
                      <span className="text-lg font-black text-emerald-600">{broadcastResult.dispatched_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Gateway Status</span>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mt-1">
                        Active (Simulated Gateway)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                    <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Each candidate receives an official SMS with a secure direct portal link. When a candidate uploads payslip/wage updates, the follow-up log automatically registers their response and marks them verified for this period!
                    </span>
                  </div>

                  {/* Dispatched candidates table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-slate-700 text-[11px] flex justify-between items-center">
                      <span>Dispatched SMS Audit Log</span>
                      <span className="text-slate-500 text-[10px]">{broadcastResult.results?.length || 0} Records</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {broadcastResult.results && broadcastResult.results.length > 0 ? (
                        broadcastResult.results.map((r: any, idx: number) => (
                          <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{r.trainee_name}</span>
                                <span className="text-[10px] font-mono text-slate-500">({r.trainee_id})</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span>📱 {r.phone_number}</span>
                                <span>•</span>
                                <span>Ref: {r.delivery_reference}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} /> Delivered
                              </span>
                              <a
                                href={r.portal_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                              >
                                Test Portal Link <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-500">
                          All candidates in this cohort already have verified outcomes!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Logged to Ministry Audit Ledger with tamper-evident delivery reference.
              </span>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Close & Review Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
