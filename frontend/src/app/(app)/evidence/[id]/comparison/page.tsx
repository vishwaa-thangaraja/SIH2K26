import React from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, 
  ShieldCheck, Send, RotateCcw 
} from 'lucide-react'

export default async function ClaimEvidenceComparisonPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/evidence/${id || 'DOC001'}/extraction`} className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft size={12} /> Extraction
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Step 3</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Claim vs Evidence Comparison
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cross-checking trainee self-reported claim against OCR-extracted payslip parameters.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3.5 py-1.5 rounded-full font-bold">
          <CheckCircle2 size={16} /> 94% Consistency Match
        </span>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Attribute Alignment Matrix</h2>
          <span className="text-xs text-slate-500">Trainee T001 • Event EV003</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Attribute</th>
                <th className="p-3.5">Trainee Claimed Value</th>
                <th className="p-3.5">OCR Extracted Evidence</th>
                <th className="p-3.5">Alignment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Employer Name</td>
                <td className="p-3.5 text-slate-700">ABC Manufacturing Pvt Ltd</td>
                <td className="p-3.5 text-slate-700 font-mono">ABC MANUFACTURING PVT LTD</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <CheckCircle2 size={12} /> Exact Match (1.0)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Occupational Role</td>
                <td className="p-3.5 text-slate-700">CNC Operator</td>
                <td className="p-3.5 text-slate-700 font-mono">CNC OPERATOR</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <CheckCircle2 size={12} /> Exact Match (1.0)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Monthly Compensation</td>
                <td className="p-3.5 text-slate-700">₹18,000</td>
                <td className="p-3.5 text-slate-700 font-mono">INR 18,000.00</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <CheckCircle2 size={12} /> Exact Match (1.0)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Commencement Date</td>
                <td className="p-3.5 text-slate-700">15 Sep 2023</td>
                <td className="p-3.5 text-slate-700 font-mono">01 Oct 2023 (Statement Date)</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    <CheckCircle2 size={12} /> Temporal Alignment (&lt;30d)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Recommendation Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Claim Corroboration Succeeded</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            All 4 primary attributes corroborated by secondary documentary evidence. Ready for one-tap employer attestation trigger.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/attestation"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Send size={14} />
            <span>Trigger Employer Attestation</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
