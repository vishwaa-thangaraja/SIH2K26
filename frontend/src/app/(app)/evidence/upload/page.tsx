'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Upload, FileText, CheckCircle2, ArrowRight, 
  ShieldCheck, Sparkles, AlertCircle 
} from 'lucide-react'

export default function EvidenceUploadPage() {
  const [selectedType, setSelectedType] = useState('payslip')
  const [isSimulating, setIsSimulating] = useState(false)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Evidence Ingestion Layer</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Trainee T001</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Livelihood Supporting Evidence
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Unstructured documents are converted into machine-readable verified claims via OCR & entity normalizers.
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-blue-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
          <span>Evidence Upload</span>
        </div>
        <span className="text-slate-300">———</span>
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs">2</span>
          <span>OCR Extraction</span>
        </div>
        <span className="text-slate-300">———</span>
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs">3</span>
          <span>Claim Comparison</span>
        </div>
        <span className="text-slate-300">———</span>
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs">4</span>
          <span>Trust Scoring</span>
        </div>
      </div>

      {/* Document Type Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Select Document Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'payslip', label: 'Monthly Payslip' },
              { id: 'offer', label: 'Offer Letter' },
              { id: 'naps', label: 'NAPS Contract' },
              { id: 'attest', label: 'Employer Proof' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`p-3 rounded-lg border text-xs font-bold transition-all text-center ${
                  selectedType === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 rounded-xl p-8 text-center transition-colors cursor-pointer space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">payslip_oct2023.pdf</h3>
            <p className="text-xs text-slate-500 mt-0.5">Size: 1.2 MB • Type: Salary Statement • Attached to Trainee T001</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} /> Document Ready for OCR Parsing
          </span>
        </div>

        {/* OCR Privacy Rule Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2">
          <ShieldCheck size={16} className="text-slate-700 shrink-0 mt-0.5" />
          <p>
            <strong>Privacy & Integrity Standard:</strong> Raw personal identification records are never stored in plain text. Only necessary outcome attributes (Employer, Role, Date, Wage) are extracted and compared against registered claims.
          </p>
        </div>

        <div className="flex justify-end pt-3">
          <Link
            href="/evidence/DOC001/extraction"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-colors"
          >
            <Sparkles size={16} className="text-sky-400" />
            <span>Trigger OCR Extraction Engine</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
