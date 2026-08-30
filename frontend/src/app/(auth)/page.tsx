import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Database, LineChart, Award } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-between items-center p-4 md:p-8 font-sans">
      {/* Top Govt Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🇮🇳
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ministry of Skill Development & Entrepreneurship</h1>
            <p className="text-xs text-slate-500 font-medium">Government of India | Skill India Mission</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1.5 rounded-full font-semibold">
          <Award size={16} />
          SIH 2026 Problem Statement 26135
        </div>
      </header>

      {/* Main Container Card */}
      <section className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-md p-6 md:p-10 my-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Longitudinal Trainee Tracking System
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Skill Bridge Platform</h2>
            <p className="text-slate-600 mt-1 text-base">
              Autonomous identity continuity, multi-source evidence intelligence & outcome provenance.
            </p>
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-md bg-blue-600 text-white flex items-center justify-center mb-3">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">DSIG Continuity</h3>
            <p className="text-sm text-slate-600">
              Identity survives phone, location, and employer changes without creating duplicate records.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-md bg-emerald-600 text-white flex items-center justify-center mb-3">
              <Database size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Outcome Ledger</h3>
            <p className="text-sm text-slate-600">
              Employment treated as a cryptographically verifiable event, not a one-time unchecked box.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-md bg-amber-600 text-white flex items-center justify-center mb-3">
              <LineChart size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Policy Insight</h3>
            <p className="text-sm text-slate-600">
              Multi-year 3M–24M wage & retention trajectories roll up into provider scores & district skill heatmaps.
            </p>
          </div>
        </div>

        {/* Demo Entry Options */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Interactive Live Prototype</h4>
            <p className="text-sm text-slate-600 mt-0.5">
              Experience the end-to-end pathway as trainee <strong>Ravi Kumar (T001)</strong> or view government macro analytics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow transition-colors"
            >
              Enter as Trainee (Ravi Kumar)
              <ArrowRight size={16} />
            </Link>
            <Link 
              href="/intelligence" 
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm px-5 py-3 rounded-lg shadow-sm transition-colors"
            >
              Policy Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="w-full max-w-5xl text-center py-4 border-t border-slate-200 text-xs text-slate-500">
        <p>© 2026 Ministry of Skill Development and Entrepreneurship. All rights reserved. National Longitudinal Tracking Prototype.</p>
      </footer>
    </main>
  )
}
