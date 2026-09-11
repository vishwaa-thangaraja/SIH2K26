'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import {
  ShieldCheck, Database, LineChart, Award,
  User, BarChart3, Building2, Smartphone, Mail,
  ArrowRight, Sparkles, Lock, KeyRound, CheckCircle2,
  ChevronRight, ArrowUpRight, Shield, Check
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { setRole, setActiveTraineeId } = useRole()
  const [activeTab, setActiveTab] = useState<'official' | 'employee'>('official')

  // Government Official State
  const [govEmail, setGovEmail] = useState('analyst.msde@gov.in')
  const [govEmpId, setGovEmpId] = useState('MSDE-OFF-8821')
  const [govDivision, setGovDivision] = useState('MSDE Central Policy Division')
  const [govPasscode, setGovPasscode] = useState('••••••••••••')
  const [govLoading, setGovLoading] = useState(false)

  // Trainee Demo Showdown State
  const [traineeList, setTraineeList] = useState<any[]>([
    {
      trainee_id: 'T002',
      name: 'Priya S',
      program: 'Web Development',
      provider: 'Aspire Skills Foundation',
      district: 'Madurai',
      state: 'Tamil Nadu',
      phone: '+91 93847 59007',
      email: 'vishwaat27@gmail.com',
      status: 'completed',
    },
    {
      trainee_id: 'T001',
      name: 'Aarav Kumar',
      program: 'Data Analytics',
      provider: 'SkillBridge Training Services',
      district: 'Madurai',
      state: 'Tamil Nadu',
      phone: '+91 90000 01000',
      email: 'sihcontinuum@gmail.com',
      status: 'placed',
    },
    {
      trainee_id: 'T003',
      name: 'Arun Prakash',
      program: 'Digital Marketing',
      provider: 'Apex Technical Institute',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      phone: '+91 94421 88320',
      email: 'arun.prakash@example.com',
      status: 'completed',
    },
    {
      trainee_id: 'T004',
      name: 'Meena R',
      program: 'Electrical Technician',
      provider: 'Tiruchirappalli Skills Hub',
      district: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      phone: '+91 98401 92837',
      email: 'meena.r@example.com',
      status: 'completed',
    },
    {
      trainee_id: 'T005',
      name: 'Rahul Kumar',
      program: 'Tailoring & Apparel Design',
      provider: 'Salem Vocational Institute',
      district: 'Salem',
      state: 'Tamil Nadu',
      phone: '+91 97890 12345',
      email: 'rahul.kumar@example.com',
      status: 'placed',
    },
  ])
  const [selectedTraineeId, setSelectedTraineeId] = useState('T002')
  const [traineeLoading, setTraineeLoading] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/trainees?limit=100')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize phone & email
          const normalized = data.map((t: any) => ({
            ...t,
            phone: t.phone ? (t.phone.startsWith('+91') ? t.phone : `+91 ${t.phone}`) : '+91 90000 01000',
            email: t.email || `${(t.name || 'trainee').toLowerCase().replace(/\s+/g, '.')}@example.com`
          }))
          setTraineeList(normalized)
        }
      })
      .catch(() => {})
  }, [])

  const currentTrainee = traineeList.find(t => t.trainee_id === selectedTraineeId) || traineeList[0]

  const handleGovLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setGovLoading(true)
    setTimeout(() => {
      setRole('analyst')
      router.push('/intelligence')
    }, 200)
  }

  const handleTraineeLogin = (targetId?: string) => {
    const idToUse = targetId || selectedTraineeId
    setTraineeLoading(true)
    setRole('trainee')
    setActiveTraineeId(idToUse)
    localStorage.setItem('continuum_role', 'trainee')
    localStorage.setItem('continuum_active_trainee_id', idToUse)
    setTimeout(() => {
      router.push('/dashboard')
    }, 200)
  }

  const handleQuickGovDemo = () => {
    setRole('analyst')
    router.push('/intelligence')
  }

  return (
    <main className="min-h-screen bg-slate-50/70 bg-grid-pattern flex flex-col items-center justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── TOP GOVERNMENT HEADER BAR ── */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 px-6 sm:px-12 py-4 flex items-center justify-between transition-all duration-300 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="h-12 px-2 py-0.5 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs shrink-0">
            <img src="/emblem.png" alt="Government of India - MSDE" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
              MINISTRY OF SKILL DEVELOPMENT &amp; ENTREPRENEURSHIP
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5">
              Government of India · Skill India Mission · National Trainee Outcome Platform
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200 text-blue-800 text-xs px-4 py-1.5 rounded-full font-bold shadow-2xs">
            <Award size={14} className="text-blue-600" />
            <span>SIH 2026 · Problem Statement 26135</span>
          </div>
        </div>
      </header>

      {/* ── SPACIOUS HERO SECTION ── */}
      <div className="w-full max-w-4xl px-6 pt-16 pb-10 text-center animate-fade-in-up space-y-4">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 text-xs font-extrabold px-4 py-1.5 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AUTONOMOUS LONGITUDINAL TRAINEE TRACKING SYSTEM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          CONTINUUM
        </h1>
        
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Cryptographic outcome verification, dynamic skill identity continuity (DSIG), and autonomous closed-loop policy reallocation.
        </p>
      </div>

      {/* ── SPACIOUS & SLEEK AUTHENTICATION WORKSPACE ── */}
      <div className="w-full max-w-3xl px-6 pb-16 animate-fade-in-up">
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          
          {/* Segmented Tab Switcher */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
            <div className="grid grid-cols-2 p-1.5 bg-slate-200/60 rounded-2xl gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('official')}
                className={`flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                  activeTab === 'official'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 size={18} className={activeTab === 'official' ? 'text-blue-600' : 'text-slate-500'} />
                <span>Government Official Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('employee')}
                className={`flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                  activeTab === 'employee'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User size={18} className={activeTab === 'employee' ? 'text-blue-600' : 'text-slate-500'} />
                <span>Trainee &amp; Employee Portal</span>
              </button>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="p-8 sm:p-12">
            {activeTab === 'official' ? (
              /* ── GOVERNMENT OFFICIAL AUTH ── */
              <form onSubmit={handleGovLogin} className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Official NIC / Gov Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={govEmail}
                      onChange={(e) => setGovEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-base text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 font-medium"
                      placeholder="officer@nic.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Officer ID / Employee Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={govEmpId}
                        onChange={(e) => setGovEmpId(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-base text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Administrative Directorate
                    </label>
                    <select
                      value={govDivision}
                      onChange={(e) => setGovDivision(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 font-medium cursor-pointer"
                    >
                      <option value="MSDE Central Policy Division">MSDE Central Policy Directorate</option>
                      <option value="Tamil Nadu SSDM">Tamil Nadu SSDM</option>
                      <option value="District Skill Committee Madurai">DSC Madurai Cluster</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleQuickGovDemo}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 px-5 py-3.5 rounded-xl transition-all duration-200"
                  >
                    <Sparkles size={15} className="text-amber-500" />
                    <span>One-Click Demo Official Login</span>
                  </button>

                  <button
                    type="submit"
                    disabled={govLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0B2545] hover:bg-blue-900 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:translate-y-px"
                  >
                    <span>{govLoading ? 'Authenticating...' : 'Sign In as Government Official'}</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </form>
            ) : (
              /* ── TRAINEE / EMPLOYEE DEMO SHOWDOWN AUTH ── */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleTraineeLogin()
                }}
                className="space-y-6 animate-fade-in-up"
              >
                {/* Showdown notice banner */}
                <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200 rounded-2xl px-4 py-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-blue-950 block">
                        Demo Showdown Mode Active
                      </span>
                      <span className="text-[11px] text-blue-700 font-medium">
                        Instant 1-click login with verified candidate biometric &amp; DSIG provenance
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-md shadow-2xs">
                    Live Demo
                  </span>
                </div>

                {/* Quick Switcher 1-Tap Candidate Pills */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                    Quick Select Demo Candidate:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {traineeList.slice(0, 5).map((t) => {
                      const isSelected = t.trainee_id === selectedTraineeId
                      return (
                        <button
                          key={t.trainee_id}
                          type="button"
                          onClick={() => setSelectedTraineeId(t.trainee_id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <span>{t.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {t.trainee_id}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Trainee Dropdown Selector */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Or Select from Registry Database ({traineeList.length} Candidates Available)
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-blue-600" size={18} />
                    <select
                      value={selectedTraineeId}
                      onChange={(e) => setSelectedTraineeId(e.target.value)}
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-900 font-extrabold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer shadow-2xs"
                    >
                      {traineeList.map((t) => (
                        <option key={t.trainee_id} value={t.trainee_id}>
                          {t.trainee_id} — {t.name} ({t.program || 'Vocational Training'} · {t.district || 'Tamil Nadu'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Verified Trainee Dynamic Credential Card */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Verified Identity Provenance Card
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      DSIG Verified
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                          {currentTrainee.name
                            ? currentTrainee.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                            : 'TR'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base">
                              {currentTrainee.name}
                            </span>
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                              {currentTrainee.trainee_id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {currentTrainee.program || 'General Vocational Training'} · {currentTrainee.provider || 'Aspire Foundation'}
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald-700 text-xs font-black bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full uppercase shrink-0">
                        {currentTrainee.status === 'placed' ? 'Placed in Industry' : 'Certified Learner'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Cluster / District:</span>
                        <span className="text-slate-700 font-bold">{currentTrainee.district || 'Madurai'}, {currentTrainee.state || 'Tamil Nadu'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Registered Contact:</span>
                        <span className="text-slate-700 font-mono font-bold truncate block">{currentTrainee.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Launch Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={traineeLoading}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base py-4 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:translate-y-px cursor-pointer"
                  >
                    <span>
                      {traineeLoading
                        ? `Launching Portal as ${currentTrainee.name}...`
                        : `Launch Learner Portal as ${currentTrainee.name} (${currentTrainee.trainee_id})`}
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── 3 SPACIOUS DISPERSED PILLARS (PROFESSIONAL GOV DESIGN) ── */}
      <div className="w-full max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">DSIG Continuity</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Maintains trainee identity provenance across phone changes, geographic migrations, and multi-year employment transitions.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Database size={22} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Multi-Source Verification</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Continuous cross-verification against DigiLocker e-KYC, EPFO contributions, GSTN filings, and digital employer attestations.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-7 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <LineChart size={22} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Closed-Loop Policy Engine</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Autonomous training seat and budget reallocation driven by verified district-level demand deficits and longitudinal wage retention.
            </p>
          </div>

        </div>
      </div>

      {/* ── OFFICIAL FOOTER ── */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        © 2026 Ministry of Skill Development and Entrepreneurship · Government of India · Smart India Hackathon Prototype
      </footer>
    </main>
  )
}
