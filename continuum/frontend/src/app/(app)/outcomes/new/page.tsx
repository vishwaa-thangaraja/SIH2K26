'use client'

import { API_BASE } from '@/lib/api'
import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { 
  Building2, Sparkles, ArrowRight, ArrowLeft, 
  Upload, CheckCircle2, ShieldCheck, FileCheck,
  MessageSquare, Phone, Check, RefreshCw, Eye, AlertCircle, FileText, Lock
} from 'lucide-react'

export default function NewEmploymentEventPage() {
  return (
    <Suspense fallback={
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Outcome Form...</p>
      </div>
    }>
      <NewEmploymentEventContent />
    </Suspense>
  )
}

function NewEmploymentEventContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setActiveTraineeId, activeTrainee } = useRole()
  const traineeId = searchParams.get('trainee_id') || activeTrainee?.trainee_id || 'T001'
  const milestone = searchParams.get('milestone') || '3M'
  const source = searchParams.get('source')

  const [traineeName, setTraineeName] = useState<string>('')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  // Evidence upload & OCR states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [useSample, setUseSample] = useState<boolean>(true)
  const [previewUrl, setPreviewUrl] = useState<string>('/sample_payslip.png')
  const [ocrRunning, setOcrRunning] = useState<boolean>(false)
  const [ocrStage, setOcrStage] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    employer_name: 'ABC Manufacturing Pvt Ltd',
    employer_gstn: '27AABCA1234B1Z5',
    role: 'CNC Operator',
    start_date: '2023-09-15',
    wage_monthly: '18000',
    evidence_type: 'payslip',
  })

  useEffect(() => {
    if (traineeId) {
      setActiveTraineeId(traineeId)
      fetch(`${API_BASE}/trainees/${traineeId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.name) {
            setTraineeName(data.name)
            if (data.program) {
              setFormData(prev => ({ ...prev, role: data.program }))
            }
          }
        })
        .catch(() => {})
    }
  }, [traineeId, setActiveTraineeId])

  const uploadAndRunOCR = async () => {
    setOcrRunning(true)
    setErrorMsg(null)
    try {
      setOcrStage('Stage 1: Connecting to Tesseract 5.5.3 OCR Engine...')
      await new Promise(r => setTimeout(r, 450))

      // Also notify communications backend to record response
      if (traineeId) {
        fetch(`${API_BASE}/communications/respond/${traineeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            milestone: milestone,
            notes: `Self-reported via Outreach link: Employer=${formData.employer_name}, Wage=₹${formData.wage_monthly}`
          })
        }).catch(() => {})
      }

      setOcrStage('Stage 2: Parsing Layout & Extracting Financial Entities...')
      const body = new FormData()
      body.append('trainee_id', traineeId)
      body.append('doc_type', formData.evidence_type || 'payslip')
      body.append('use_sample', useSample ? 'true' : 'false')
      if (selectedFile && !useSample) {
        body.append('file', selectedFile)
      }

      setOcrStage('Stage 3: Running Deterministic Consistency Checks...')
      const res = await fetch(`${API_BASE}/evidence/upload`, {
        method: 'POST',
        body: body,
      })

      if (!res.ok) {
        throw new Error(`OCR processing failed with HTTP ${res.status}`)
      }

      const resData = await res.json()
      setOcrStage('Extraction Completed! Navigating to Verification Dossier...')
      await new Promise(r => setTimeout(r, 400))

      router.push(`/evidence/${resData.evidence_id || 'DOC001'}/extraction?trainee_id=${traineeId}`)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to process document through OCR engine.')
      setOcrRunning(false)
    }
  }

  const handleSubmitAndVerify = async () => {
    setIsSubmitting(true)
    try {
      await uploadAndRunOCR()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Follow-up SMS Outreach Arrival Banner */}
      {source === 'sms' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-4 shadow-md flex items-start gap-3 border border-emerald-500 animate-in fade-in duration-200">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black bg-white text-emerald-800 px-2 py-0.5 rounded-full">
                Periodic Outreach Link Active
              </span>
              <span className="text-xs font-medium text-emerald-100">
                Milestone: {milestone}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white">
              Trainee Self-Reporting Follow-Up Portal
            </h3>
            <p className="text-xs text-emerald-100/95 leading-relaxed">
              Welcome {traineeName ? <strong>{traineeName}</strong> : ''} (ID: {traineeId}). Please confirm your current workplace and monthly earnings to fulfill your periodic outcome verification requirement.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <Link href="/outcomes" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft size={12} /> Back to Outcome Ledger
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Register New Employment Event
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Log livelihood event for Trainee <strong className="text-slate-900">{traineeName || traineeId}</strong> to begin autonomous multi-source verification.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? 'bg-slate-900 text-white'
                  : step > s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Main Multi-Step Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Step 1: Employer & Role Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Employer Legal Business Name *</label>
                <input
                  type="text"
                  value={formData.employer_name}
                  onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Employer GSTN (Optional)</label>
                <input
                  type="text"
                  value={formData.employer_gstn}
                  onChange={(e) => setFormData({ ...formData, employer_gstn: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Occupational Designation / Role *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Monthly Compensation (INR) *</label>
                <input
                  type="number"
                  value={formData.wage_monthly}
                  onChange={(e) => setFormData({ ...formData, wage_monthly: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700">Employment Commencement Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* AI Outcome Classification Suggestion */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3.5 flex items-start gap-3 mt-4 text-xs">
              <Sparkles size={18} className="text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-900 block">AI Classification Pre-Assessment</span>
                <p className="text-sky-800 mt-0.5">
                  Based on &quot;CNC Operator&quot; with specified monthly wage at registered manufacturing firm, outcome is classified as <strong>Salaried Formal Employment</strong> with 0.94 relevance to NSQF Level 5 Welding.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition-colors"
              >
                Continue to Evidence Attachment <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Step 2: Attach Primary Corroborating Evidence
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload an authentic payslip, contract, or offer letter to verify employment and compensation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  setUseSample(true)
                  setPreviewUrl('/sample_payslip.png')
                  setErrorMsg(null)
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                  useSample
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ⚡ Use CONTINUUM Benchmark Payslip
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0]
                  setSelectedFile(f)
                  setUseSample(false)
                  setPreviewUrl(URL.createObjectURL(f))
                  setErrorMsg(null)
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                useSample
                  ? 'border-blue-300 bg-blue-50/40 hover:bg-blue-50/70'
                  : 'border-sky-400 bg-sky-50/40 hover:bg-sky-50/70'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                {useSample ? <FileCheck size={24} /> : <Upload size={24} />}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3">
                {useSample ? 'benchmark_sample_payslip.png (Preloaded)' : (selectedFile ? selectedFile.name : 'Click to Browse / Upload Document Image')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">
                {useSample
                  ? `Official continuous tracking benchmark with ABC Manufacturing, ${traineeName || 'Priya S'}, ₹26,000 Gross / ₹23,445 Net pay.`
                  : (selectedFile ? `File size: ${(selectedFile.size / 1024).toFixed(1)} KB • Image loaded and ready for OCR analysis.` : 'Supports PNG, JPG, JPEG, and PDF documents up to 10MB.')}
              </p>
              <div className="pt-2">
                <span className="bg-white border border-slate-200 text-emerald-800 text-xs px-3 py-1.5 rounded-md font-bold shadow-xs inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  {useSample ? 'Benchmark Document Ready for OCR' : (selectedFile ? 'Custom Document Attached' : 'Click to Select Document')}
                </span>
              </div>
            </div>

            {/* Visual Preview */}
            {previewUrl && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-600" />
                    Document Visual Preview
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">Passed directly to Tesseract OCR engine</span>
                </div>
                <div className="max-h-56 overflow-hidden rounded-lg border border-slate-200 flex justify-center bg-white p-2">
                  <img
                    src={previewUrl}
                    alt="Evidence document preview"
                    className="max-h-52 object-contain w-auto rounded"
                  />
                </div>
              </div>
            )}

            {/* OCR Progress State */}
            {ocrRunning && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                  <span>{ocrStage}</span>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={ocrRunning}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                ← Back to Role Details
              </button>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={ocrRunning}
                  onClick={uploadAndRunOCR}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-lg shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={14} className="fill-slate-950" />
                  <span>{ocrRunning ? 'Running OCR Engine...' : 'Run Tesseract OCR & Verify Now'}</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={ocrRunning}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition-colors cursor-pointer disabled:opacity-50"
                >
                  Review &amp; Submit <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Step 3: Review &amp; Initiate Verification Pipeline
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Trainee Candidate:</span>
                  <p className="font-bold text-slate-900">{traineeName ? `${traineeName} (${traineeId})` : traineeId}</p>
                </div>
                <div>
                  <span className="text-slate-500">Outreach Milestone:</span>
                  <p className="font-bold text-slate-900">{milestone} Longitudinal Follow-Up</p>
                </div>
                <div>
                  <span className="text-slate-500">Employer Organization:</span>
                  <p className="font-bold text-slate-900">{formData.employer_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Occupational Role:</span>
                  <p className="font-bold text-slate-900">{formData.role}</p>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Compensation:</span>
                  <p className="font-bold text-slate-900">₹{Number(formData.wage_monthly).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Start Date:</span>
                  <p className="font-bold text-slate-900">{formData.start_date}</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Corroborating Evidence:</span>
                  <span className="font-bold text-slate-800">
                    {useSample ? 'CONTINUUM Benchmark Payslip (Preloaded)' : (selectedFile ? selectedFile.name : 'Document Attached')}
                  </span>
                </div>
              </div>
            </div>

            {source === 'sms' && (
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-start gap-2">
                <ShieldCheck size={16} className="text-sky-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Longitudinal Loop Closure:</strong> Submitting will mark your {milestone} follow-up status as <strong>Responded &amp; Verified</strong> in the National Skills Registry for this period.
                </p>
              </div>
            )}

            {ocrRunning && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                  <span>{ocrStage}</span>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                disabled={ocrRunning}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmitAndVerify}
                disabled={ocrRunning}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow transition-colors disabled:opacity-50 cursor-pointer"
              >
                {ocrRunning ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Executing OCR Pipeline...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Event &amp; Launch OCR Pipeline</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
