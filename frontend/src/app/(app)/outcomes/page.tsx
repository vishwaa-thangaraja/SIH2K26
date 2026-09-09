'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MOCK_OUTCOMES } from '@/lib/mockData'
import { OutcomeEvent } from '@/types'
import { 
  Building2, Plus, Filter, Search, CheckCircle2, 
  AlertCircle, ShieldCheck, FileText, ArrowRight, ExternalLink,
  Zap, MessageSquare, Send
} from 'lucide-react'

export default function OutcomeLedgerPage() {
  const [outcomes, setOutcomes] = useState<OutcomeEvent[]>(MOCK_OUTCOMES)
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all')
  const [selectedEvent, setSelectedEvent] = useState<OutcomeEvent>(MOCK_OUTCOMES[2])
  const [searchTerm, setSearchTerm] = useState('')
  const [commStats, setCommStats] = useState<{
    total_sent: number
    total_delivered: number
    total_responded: number
    response_rate_percent: number
    unverified_candidates: number
  } | null>(null)

  useEffect(() => {
    // Fetch live outcomes from SQLite database
    fetch('http://127.0.0.1:8000/outcomes')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.events && data.events.length > 0) {
          setOutcomes(data.events)
          setSelectedEvent(data.events[0])
        }
      })
      .catch(() => {})

    // Fetch live communications outreach stats
    fetch('http://127.0.0.1:8000/communications/summary')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setCommStats({
            total_sent: data.total_sent || 0,
            total_delivered: data.total_delivered || 0,
            total_responded: data.total_responded || 0,
            response_rate_percent: data.response_rate_percent || 0,
            unverified_candidates: data.unverified_trainees_count || 0
          })
        }
      })
      .catch(() => {})
  }, [])

  const filteredOutcomes = outcomes.filter((ev) => {
    if (filter === 'verified' && ev.verification_status !== 'verified') return false
    if (filter === 'pending' && ev.verification_status === 'verified') return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const emp = (ev.employer_name || '').toLowerCase()
      const role = (ev.role || '').toLowerCase()
      const id = (ev.event_id || '').toLowerCase()
      return emp.includes(q) || role.includes(q) || id.includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Outcome Provenance Ledger</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Trainee T001 (Ravi Kumar)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Livelihood Event Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cryptographic outcome chain logging employment start, transitions, wage updates & corroborating evidence.
          </p>
        </div>

        <Link
          href="/outcomes/new"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} />
          Register New Outcome Event
        </Link>
      </div>

      {/* Longitudinal Outreach Activity Banner */}
      {commStats && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                <Zap size={10} className="fill-amber-300" /> Longitudinal Follow-Up Engine
              </span>
              <span className="text-xs text-blue-200">
                Unverified Due: <strong className="text-white">{commStats.unverified_candidates} candidates</strong>
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Autonomous Periodic Outreach & Outcome Verification Activity
            </h2>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-200 font-medium">
              <span>Total Dispatched: <strong className="text-white font-bold">{commStats.total_sent}</strong></span>
              <span>•</span>
              <span>Delivered: <strong className="text-emerald-400 font-bold">{commStats.total_delivered}</strong></span>
              <span>•</span>
              <span>Candidate Responses: <strong className="text-sky-300 font-bold">{commStats.total_responded}</strong></span>
              <span>•</span>
              <span>Response Rate: <strong className="text-amber-300 font-bold">{commStats.response_rate_percent}%</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/trainees/T001/timeline"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <MessageSquare size={13} />
              <span>Trainee Outreach</span>
            </Link>
            <Link
              href="/advanced-search"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all"
            >
              <Zap size={13} className="fill-slate-950" />
              <span>1-Click Broadcast</span>
            </Link>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Events ({outcomes.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'verified' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Verified Only ({outcomes.filter(e => e.verification_status === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({outcomes.filter(e => e.verification_status !== 'verified').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employer or role..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Main Table + Event Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Event ID</th>
                  <th className="p-3.5">Milestone</th>
                  <th className="p-3.5">Employer / Organization</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Wage</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOutcomes.map((ev) => {
                  const isSelected = selectedEvent.event_id === ev.event_id

                  return (
                    <tr
                      key={ev.event_id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-50/70 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5 font-mono text-slate-900 font-bold">{ev.event_id}</td>
                      <td className="p-3.5">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          {ev.milestone}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">{ev.employer_name || '—'}</td>
                      <td className="p-3.5 text-slate-700">{ev.role || '—'}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {ev.wage_monthly ? `₹${ev.wage_monthly.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800">{Math.round(ev.confidence_score * 100)}%</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ev.verification_status === 'verified' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ev.verification_status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Event Deep Dive Inspector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Event Provenance Deep Dive</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {selectedEvent.employer_name || 'Pending Outcome Check'}
              </h3>
              <p className="text-xs text-slate-500">Event ID: {selectedEvent.event_id}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Milestone Marker</span>
                <span className="font-bold text-slate-900">{selectedEvent.milestone} Post-Cert</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Occupational Role</span>
                <span className="font-bold text-slate-900">{selectedEvent.role || 'Unspecified'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Monthly Compensation</span>
                <span className="font-bold text-slate-900">
                  {selectedEvent.wage_monthly ? `₹${selectedEvent.wage_monthly.toLocaleString()}` : '—'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Commencement Date</span>
                <span className="font-semibold text-slate-800">{selectedEvent.start_date}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Employer GSTN</span>
                <span className="font-mono text-slate-800">{selectedEvent.employer_gstn || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block mb-1">Corroborating Evidence</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="font-semibold text-slate-800">{selectedEvent.evidence_count} Verified Records</span>
                  </div>
                  <Link 
                    href="/evidence/DOC001/extraction" 
                    className="text-sky-700 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    View OCR <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </div>

            {/* 4-Step Lifecycle */}
            <div className="border-t border-slate-200 pt-3">
              <span className="text-xs font-bold text-slate-700 block mb-2">Verification Lifecycle Track</span>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-1.5 rounded font-semibold">
                  1. Claim ✓
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-1.5 rounded font-semibold">
                  2. OCR ✓
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-1.5 rounded font-semibold">
                  3. Employer ✓
                </div>
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-1.5 rounded font-bold">
                  4. Verified ✓
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/evidence/DOC001/confidence"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-colors"
          >
            <span>Inspect Confidence Factors</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
