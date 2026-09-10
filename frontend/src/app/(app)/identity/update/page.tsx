'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { 
  Shield, Phone, Mail, GraduationCap, Building2, 
  ArrowRight, CheckCircle2, History, RefreshCw, Plus, ShieldCheck 
} from 'lucide-react'

export default function IdentityUpdatePage() {
  const { activeTrainee } = useRole()
  const [nodes, setNodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const traineeId = activeTrainee.trainee_id || 'T002'
  const traineeName = activeTrainee.name || 'Priya S'

  useEffect(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:8000/trainees/${traineeId}/dsig`)
      .then(res => res.ok ? res.json() : { nodes: [] })
      .then(data => {
        if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
          setNodes(data.nodes)
        } else {
          // Default synthesis for active trainee
          setNodes([
            {
              id: 1,
              node_type: 'identity',
              label: 'CONTINUUM DSIG Core',
              value: traineeId,
              verification_method: 'biometric_registration',
              confidence: 1.0,
              is_active: true
            },
            {
              id: 2,
              node_type: 'phone',
              label: 'Primary Phone Anchor',
              value: activeTrainee.phone || '+91 93847 59007',
              verification_method: 'telecom_otp',
              confidence: 0.95,
              is_active: true
            },
            {
              id: 3,
              node_type: 'email',
              label: 'Verified Email Anchor',
              value: activeTrainee.email || 'vishwaat27@gmail.com',
              verification_method: 'smtp_magic_link',
              confidence: 0.98,
              is_active: true
            },
            {
              id: 4,
              node_type: 'training',
              label: 'NSQF Accredited Qualification',
              value: activeTrainee.program || 'Web Development',
              verification_method: 'assessor_certificate',
              confidence: 0.99,
              is_active: true
            }
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [traineeId, activeTrainee])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <span>Identity Lifecycle Hub</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="font-mono text-slate-700">Trainee {traineeId} • {traineeName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Manage Identity &amp; Verified Anchors
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Update contact channels, attach government e-KYC credentials, or initiate identity recovery without fragmenting {traineeName}&apos;s longitudinal records.
          </p>
        </div>

        <Link
          href={`/dsig?trainee_id=${traineeId}`}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <span>View {traineeName}&apos;s DSIG Graph</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/identity/update/phone?trainee_id=${traineeId}`}
          className="bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Phone size={20} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Update Phone Anchor</h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Migrate active phone to new number while preserving {traineeName}&apos;s historical continuity anchors.
            </p>
          </div>
          <span className="text-xs font-black text-blue-700 inline-flex items-center gap-1 mt-5">
            Simulate Update <ArrowRight size={12} />
          </span>
        </Link>

        <Link
          href={`/identity/recovery?trainee_id=${traineeId}`}
          className="bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Identity Recovery Ladder</h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Recover profile control via multi-anchor fallback ladder after lost device or SIM deactivation.
            </p>
          </div>
          <span className="text-xs font-black text-purple-700 inline-flex items-center gap-1 mt-5">
            Start Recovery Flow <ArrowRight size={12} />
          </span>
        </Link>

        <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center mb-3">
              <Plus size={20} />
            </div>
            <h3 className="font-extrabold text-slate-700 text-base">Attach New Anchor</h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Connect DigiLocker, e-Shram UAN, or APAAR ID to strengthen autonomous confidence weight.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 mt-5">
            Government e-KYC Bridge Active
          </span>
        </div>
      </div>

      {/* Connected Identity Anchors Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h2 className="font-black text-slate-900 text-sm">
              Connected Identity Anchors for {traineeName} ({traineeId})
            </h2>
          </div>
          <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {nodes.length} Verified Anchors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-4">Anchor Type</th>
                <th className="p-4">Label</th>
                <th className="p-4">Anchor Value</th>
                <th className="p-4">Verification Method</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nodes.map((node: any, idx: number) => (
                <tr key={node.id || node.node_id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-black text-slate-900 capitalize">{node.node_type}</td>
                  <td className="p-4 font-bold text-slate-800">{node.label}</td>
                  <td className="p-4 font-mono font-bold text-blue-900">{node.value}</td>
                  <td className="p-4 text-slate-600 font-medium">{String(node.verification_method || 'platform').replace('_', ' ')}</td>
                  <td className="p-4 font-black text-slate-900">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                      {Math.round((node.confidence || 0.95) * 100)}%
                    </span>
                  </td>
                  <td className="p-4">
                    {node.is_active !== false ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={11} /> ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <History size={11} /> HISTORICAL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
