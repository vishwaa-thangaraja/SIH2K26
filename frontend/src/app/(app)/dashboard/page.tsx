'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, ArrowRight, TrendingUp, CheckCircle2, 
  FileText, Phone, Mail, GraduationCap, Building2, 
  Upload, Network, AlertCircle, Clock, MapPin, User, Sparkles
} from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'

interface OutcomeEvent {
  event_id: string
  trainee_id: string
  event_type: string
  employer_name?: string
  employer_gstn?: string
  role?: string
  wage_monthly?: number
  start_date: string
  milestone: string
  confidence_score: number
  verification_status: string
  evidence_count: number
}

export default function DashboardPage() {
  const { activeTrainee } = useRole()
  const [liveTrainee, setLiveTrainee] = useState<any>(null)
  const [outcomes, setOutcomes] = useState<OutcomeEvent[]>([])
  const [recentComm, setRecentComm] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const traineeId = activeTrainee.trainee_id || 'T002'

  useEffect(() => {
    setLoading(true)

    // 1. Fetch Trainee Metadata
    const fetchTrainee = fetch(`http://127.0.0.1:8000/trainees/${traineeId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setLiveTrainee(data)
      })
      .catch(() => {})

    // 2. Fetch Trainee Outcome Events
    const fetchOutcomes = fetch(`http://127.0.0.1:8000/outcomes?trainee_id=${traineeId}`)
      .then(res => res.ok ? res.json() : { events: [] })
      .then(data => {
        if (data && Array.isArray(data.events)) {
          setOutcomes(data.events)
        }
      })
      .catch(() => {})

    // 3. Fetch Trainee Communication / Activity History
    const fetchComm = fetch(`http://127.0.0.1:8000/communications/history/${traineeId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setRecentComm(data)
      })
      .catch(() => {})

    Promise.allSettled([fetchTrainee, fetchOutcomes, fetchComm]).finally(() => {
      setLoading(false)
    })
  }, [traineeId])

  // Computed values
  const name = liveTrainee?.name || activeTrainee.name || 'Priya S'
  const program = liveTrainee?.program || activeTrainee.program || 'Web Development'
  const provider = liveTrainee?.provider || 'Aspire Skills Foundation'
  const district = liveTrainee?.district || activeTrainee.district || 'Madurai'
  const state = liveTrainee?.state || activeTrainee.state || 'Tamil Nadu'
  const phone = liveTrainee?.phone || activeTrainee.phone || '+91 93847 59007'
  const email = liveTrainee?.email || activeTrainee.email || 'vishwaat27@gmail.com'

  const latestOutcome = outcomes.length > 0 ? outcomes[outcomes.length - 1] : null
  const isEmployed = latestOutcome != null

  // Milestones progression tracker
  const milestones = [
    { label: '3M', completed: outcomes.some(o => o.milestone === '3M') },
    { label: '6M', completed: outcomes.some(o => o.milestone === '6M') },
    { label: '12M', completed: outcomes.some(o => o.milestone === '12M') },
    { label: '24M', completed: outcomes.some(o => o.milestone === '24M') },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-16 w-16 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 items-center justify-center shrink-0 shadow-2xs">
            <img src="/emblem.png" alt="Government of India - MSDE" className="h-full w-auto object-contain" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider">
              <span className="bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                Learner Longitudinal Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-mono text-slate-700">ENROLLMENT ID: {traineeId}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Welcome back, {name}</span>
              <span className="text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                {district}, {state}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Program: <strong className="text-slate-900 font-bold">{program}</strong> • Center: <strong className="text-slate-800">{provider}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3.5 py-2 rounded-xl font-black shadow-2xs">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>DSIG Identity Active</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs px-3.5 py-2 rounded-xl font-black shadow-2xs">
            <Sparkles size={15} className="text-blue-600" />
            <span>Confidence: {latestOutcome ? Math.round(latestOutcome.confidence_score * 100) : 94}%</span>
          </span>
        </div>
      </div>

      {/* 3-Column Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Identity Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                <span>Verified Identity Anchors</span>
              </h2>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {traineeId}
              </span>
            </div>

            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Primary Active Phone</p>
                  <p className="font-bold text-slate-900 font-mono truncate">{phone}</p>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Verified Email Anchor</p>
                  <p className="font-bold text-slate-900 font-mono truncate">{email}</p>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Certified Qualification</p>
                  <p className="font-bold text-slate-900 truncate">{program}</p>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Geographic Cluster</p>
                  <p className="font-bold text-slate-900 truncate">{district}, {state}</p>
                </div>
              </li>
            </ul>
          </div>

          <Link
            href={`/dsig?trainee_id=${traineeId}`}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-blue-800 hover:text-blue-950 font-extrabold text-xs py-3 px-4 rounded-xl border border-slate-200/90 transition-all shadow-2xs"
          >
            <span>Explore {name}&apos;s DSIG Graph</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Outcome Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                <span>Employment &amp; Livelihood</span>
              </h2>
              <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${
                isEmployed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isEmployed ? 'Verified Placed' : 'Training Certified'}
              </span>
            </div>

            {isEmployed ? (
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-4 mb-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    {latestOutcome?.event_type === 'self_employment' ? 'Self-Employed / Enterprise' : 'Active Industry Placement'}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    {latestOutcome?.milestone} Milestone
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="font-black text-slate-900 text-base">{latestOutcome?.employer_name}</span>
                </div>
                <p className="text-xs text-slate-700 font-bold">
                  {latestOutcome?.role} • ₹{latestOutcome?.wage_monthly?.toLocaleString('en-IN')} / month
                </p>
                {latestOutcome?.employer_gstn && (
                  <p className="text-[11px] font-mono text-slate-500 pt-1 border-t border-emerald-200/60">
                    Tax / Udyam ID: {latestOutcome.employer_gstn}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-4 mb-4 space-y-2">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  Post-Training Certification Status
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  Course Completed Successfully
                </p>
                <p className="text-xs text-slate-600">
                  Ready to log employment or self-employment outcomes for longitudinal credential tracking.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Longitudinal Evidence Confidence</span>
                <span className="text-slate-900 font-black">
                  {latestOutcome ? `${Math.round(latestOutcome.confidence_score * 100)}% (Multi-Source Corroborated)` : '92% (Certified Trainee)'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: latestOutcome ? `${latestOutcome.confidence_score * 100}%` : '92%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <Link
              href={`/outcomes/new?trainee_id=${traineeId}`}
              className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-3 rounded-xl shadow-2xs transition-all"
            >
              <FileText size={14} />
              <span>Report Job</span>
            </Link>

            <Link
              href={`/evidence/upload?trainee_id=${traineeId}`}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-3 rounded-xl shadow-2xs transition-all"
            >
              <Upload size={14} />
              <span>OCR Payslip</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Longitudinal Stepper */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-extrabold text-slate-900 text-base">Longitudinal Journey</h2>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                3M–24M Audit Cycle
              </span>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between py-3">
              {milestones.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step.completed
                      ? 'bg-blue-600 text-white shadow-xs'
                      : idx === 0 || (idx > 0 && milestones[idx - 1].completed)
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 ring-offset-1'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {step.completed ? '✓' : step.label}
                  </div>
                  <span className="text-[11px] text-slate-700 mt-1.5 font-extrabold">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {step.completed ? 'Verified' : 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-3 text-xs text-slate-600 leading-relaxed">
              <strong>Autonomous Tracking:</strong> Follow-up notices are dispatched automatically via SMS and verified Email at every retention checkpoint.
            </div>
          </div>

          <Link
            href={`/trainees/${traineeId}/timeline`}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs py-3 px-4 rounded-xl border border-slate-200/90 transition-all shadow-2xs"
          >
            <span>Full Longitudinal Timeline ({traineeId})</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link 
          href={`/outcomes/new?trainee_id=${traineeId}`} 
          className="bg-white hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-5 transition-all shadow-xs flex items-center gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Claim Outcome</h3>
            <p className="text-[11px] text-slate-500 font-medium">Log employment details</p>
          </div>
        </Link>

        <Link 
          href={`/evidence/upload?trainee_id=${traineeId}`} 
          className="bg-white hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-5 transition-all shadow-xs flex items-center gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Upload Evidence</h3>
            <p className="text-[11px] text-slate-500 font-medium">AI Tesseract OCR</p>
          </div>
        </Link>

        <Link 
          href={`/dsig?trainee_id=${traineeId}`} 
          className="bg-white hover:bg-purple-50/60 border border-slate-200/90 hover:border-purple-300 rounded-2xl p-5 transition-all shadow-xs flex items-center gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Network size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">My DSIG Graph</h3>
            <p className="text-[11px] text-slate-500 font-medium">Identity provenance</p>
          </div>
        </Link>

        <Link 
          href={`/trainees/${traineeId}`} 
          className="bg-white hover:bg-amber-50/60 border border-slate-200/90 hover:border-amber-300 rounded-2xl p-5 transition-all shadow-xs flex items-center gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">360 Profile</h3>
            <p className="text-[11px] text-slate-500 font-medium">Full candidate record</p>
          </div>
        </Link>
      </div>

      {/* Recent Verified System Activity */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
            <Clock size={20} className="text-blue-600" />
            <span>Recent Verified System Activity for {name} ({traineeId})</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Audit Provenance Verified
          </span>
        </div>

        <div className="space-y-3.5">
          {recentComm.length > 0 ? (
            recentComm.slice(0, 3).map((comm, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      Official Longitudinal Outreach ({comm.milestone} Checkpoint)
                    </p>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {comm.delivery_reference}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                    {comm.message_body}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">DSIG Identity Anchor Verified</p>
                    <span className="text-xs text-slate-500 font-medium">Platform Onboarding</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Identity continuity record established for {name} ({traineeId}) at {provider}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Training Certification Recorded</p>
                    <span className="text-xs text-slate-500 font-medium">{program}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Completed NSQF curriculum with verified attendance and assessment records in CONTINUUM registry.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
