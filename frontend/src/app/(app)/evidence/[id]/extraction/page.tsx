import React from 'react'
import Link from 'next/link'
import { MOCK_EVIDENCE } from '@/lib/mockData'
import { 
  FileText, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, ZoomIn, ZoomOut, ShieldCheck 
} from 'lucide-react'

export default async function EvidenceExtractionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const evidence = MOCK_EVIDENCE[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/evidence/upload" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft size={12} /> Upload
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{id || 'DOC001'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Evidence Intelligence & Entity Extraction
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tesseract / PaddleOCR wrapper parsing entity fields from unstructured payslip payload.
          </p>
        </div>

        <Link
          href={`/evidence/${id || 'DOC001'}/comparison`}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <span>Continue to Claim Comparison</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Split-Panel OCR Viewer & Field Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Document Viewer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">{evidence.filename}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><ZoomIn size={16} /></button>
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><ZoomOut size={16} /></button>
            </div>
          </div>

          {/* Document Graphic Mockup */}
          <div className="h-96 bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col justify-between font-mono text-xs text-slate-700 shadow-inner">
            <div className="border-b border-slate-300 pb-3">
              <p className="font-bold text-sm text-slate-900 uppercase">ABC MANUFACTURING PVT LTD</p>
              <p className="text-[10px] text-slate-500">Plot 42, Industrial Area, MIDC Bhosari, Pune - 411026</p>
              <p className="text-[10px] text-slate-500">GSTN: 27AABCA1234B1Z5</p>
            </div>

            <div className="space-y-2 py-2">
              <p className="font-semibold text-slate-900">SALARY STATEMENT FOR OCTOBER 2023</p>
              <p>Employee Name: <strong>RAVI KUMAR</strong></p>
              <p>Designation: <strong>CNC OPERATOR</strong></p>
              <p>Employee ID: <strong>EMP-2023-8841</strong></p>
              <p>Bank Ref / UTR: <strong>HDFC9982716354</strong></p>
            </div>

            <div className="border-t border-slate-300 pt-3 flex justify-between items-center font-bold text-slate-900">
              <span>NET PAYABLE AMOUNT:</span>
              <span className="text-sm bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">INR 18,000.00</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Extracted Entities */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles size={16} className="text-sky-600" />
                Extracted Normalized Entities
              </h3>
              <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded font-bold border border-emerald-200">
                Consistency: 93%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">Employer Entity Name</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">ABC Manufacturing Pvt Ltd</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <CheckCircle2 size={12} /> 97% Conf
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">Occupational Designation</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">CNC Operator</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <CheckCircle2 size={12} /> 94% Conf
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">Commencement / Statement Date</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">01 Oct 2023</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <CheckCircle2 size={12} /> 99% Conf
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">Monthly Compensation</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">₹18,000</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <CheckCircle2 size={12} /> 96% Conf
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg text-xs text-sky-900">
              <strong>Evidence Rule:</strong> Document consistency score measures internal validity across extracted text fields prior to comparing against the trainee&apos;s logged claim.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
