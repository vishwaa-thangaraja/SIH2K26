'use client'

import React, { useState, useEffect, Suspense } from 'react'
import DSIGGraph from '@/components/dsig/DSIGGraph'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, PhoneCall, RefreshCw, UserCheck } from 'lucide-react'

import { useRole } from '@/contexts/RoleContext'

interface TraineeOption {
  trainee_id: string
  name: string
  program: string
}

function DSIGContent() {
  const searchParams = useSearchParams()
  const initialParamId = searchParams.get('trainee_id')
  const { role, activeTrainee } = useRole()
  const [trainees, setTrainees] = useState<TraineeOption[]>([])
  const effectiveId = activeTrainee?.trainee_id || 'T002'
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(
    role === 'trainee' ? effectiveId : (initialParamId || 'T002')
  )

  useEffect(() => {
    if (role === 'trainee') {
      setSelectedTraineeId(effectiveId)
    } else if (initialParamId) {
      setSelectedTraineeId(initialParamId)
    }
  }, [initialParamId, role, effectiveId])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/trainees?limit=100')
      .then(res => {
        if (!res.ok) return []
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTrainees(data.map((t: any) => ({
            trainee_id: t.trainee_id,
            name: t.name,
            program: t.program
          })))
        }
      })
      .catch(err => console.warn('Could not load trainees list:', err))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Identity Architecture</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Trainee {selectedTraineeId}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dynamic Skill Identity Graph (DSIG)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Continuous graph representation of verified anchors across temporal phone, location &amp; employer migrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Trainee Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
            <UserCheck size={16} className="text-sky-700" />
            <span className="text-xs font-semibold text-slate-700">Trainee:</span>
            {role === 'trainee' ? (
              <span className="text-xs font-bold text-blue-900 font-mono">
                {selectedTraineeId} ({activeTrainee.name})
              </span>
            ) : (
              <select
                value={selectedTraineeId}
                onChange={(e) => setSelectedTraineeId(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-900 focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="T002">T002 - Priya S</option>
                <option value="T001">T001 - Aarav Kumar</option>
                {trainees.map(t => (
                  <option key={t.trainee_id} value={t.trainee_id}>
                    {t.trainee_id} - {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Link
            href="/identity/update/phone"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <PhoneCall size={14} />
            Simulate Phone Change
          </Link>
          <Link
            href="/identity/recovery"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw size={14} />
            Identity Recovery Flow
          </Link>
        </div>
      </div>

      {/* Interactive DSIG React Flow Canvas */}
      <DSIGGraph traineeId={selectedTraineeId} />

      {/* Identity Evolution Chronology */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-sky-600" />
          DSIG Identity Evolution Chronology
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Phase 1 • Oct 2021</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1">Identity Initialized</h4>
            <p className="text-slate-600 mt-1">
              Registered with primary phone +91 91234 56780 and PMKVY Training ID.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Phase 2 • Sep 2023</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1">Phone Anchor Migration</h4>
            <p className="text-slate-600 mt-1">
              Phone updated to +91 98765 43210 via multi-anchor verification. Old anchor archived.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Phase 3 • Oct 2023</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1">Employer Anchor Attached</h4>
            <p className="text-slate-600 mt-1">
              ABC Manufacturing linked as active employer anchor with 0.86 confidence.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Phase 4 • Active</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1">Continuous Integrity</h4>
            <p className="text-slate-700 mt-1">
              All 6M & 12M longitudinal outcome records remain linked to single identity <code>T001</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DSIGPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading DSIG Explorer...</div>}>
      <DSIGContent />
    </Suspense>
  )
}
