import React from 'react'
import Link from 'next/link'
import { MOCK_DSIG_NODES, MOCK_TRAINEE } from '@/lib/mockData'
import { 
  Shield, Phone, Mail, GraduationCap, Building2, 
  ArrowRight, CheckCircle2, History, RefreshCw, Plus 
} from 'lucide-react'

export default function IdentityUpdatePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <span>Identity Lifecycle Hub</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Trainee T001</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Identity & Verified Anchors
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Update contact channels, attach government e-KYC credentials, or initiate identity recovery without fragmenting records.
          </p>
        </div>

        <Link
          href="/dsig"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <span>View DSIG Graph</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/identity/update/phone"
          className="bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Update Phone Anchor</h3>
            <p className="text-xs text-slate-500 mt-1">
              Migrate active phone to new number while preserving historical anchor link.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1 mt-4">
            Simulate Update <ArrowRight size={12} />
          </span>
        </Link>

        <Link
          href="/identity/recovery"
          className="bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Identity Recovery Ladder</h3>
            <p className="text-xs text-slate-500 mt-1">
              Recover access when old phone/SIM is lost using multi-anchor verification.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 inline-flex items-center gap-1 mt-4">
            Start Recovery <ArrowRight size={12} />
          </span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm opacity-60 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
              <Plus size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Attach New e-KYC</h3>
            <p className="text-xs text-slate-500 mt-1">
              Link authorized DigiLocker / e-Shram credentials to identity profile.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Coming soon in Sandbox</span>
        </div>
      </div>

      {/* Active vs Historical Anchors Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">All Connected Identity Anchors</h2>
          <span className="text-xs text-slate-500">{MOCK_DSIG_NODES.length} Total Nodes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Anchor Type</th>
                <th className="p-3.5">Label</th>
                <th className="p-3.5">Anchor Value</th>
                <th className="p-3.5">Verification Method</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DSIG_NODES.map((node) => (
                <tr key={node.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900 capitalize">{node.node_type}</td>
                  <td className="p-3.5 font-semibold text-slate-800">{node.label}</td>
                  <td className="p-3.5 font-mono text-slate-700">{node.value}</td>
                  <td className="p-3.5 text-slate-600">{node.verification_method.replace('_', ' ')}</td>
                  <td className="p-3.5 font-bold text-slate-900">{Math.round(node.confidence * 100)}%</td>
                  <td className="p-3.5">
                    {node.is_active ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 size={10} /> ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        <History size={10} /> HISTORICAL
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
