'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { 
  Building2, Sparkles, ArrowRight, ArrowLeft, 
  Upload, CheckCircle2, ShieldCheck, FileCheck,
  MessageSquare, Phone, Check, RefreshCw
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
  const { setActiveTraineeId } = useRole()
  const traineeId = searchParams.get('trainee_id') || 'T001'
  const milestone = searchParams.get('milestone') || '3M'
  const source = searchParams.get('source')

  const [traineeName, setTraineeName] = useState<string>('')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

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
      fetch(`http://127.0.0.1:8000/trainees/${traineeId}`)
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

  const handleSubmitAndVerify = async () => {
    setIsSubmitting(true)
    try {
      if (traineeId) {
        // Close the follow-up feedback loop on the backend
        await fetch(`http://127.0.0.1:8000/communications/respond/${traineeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            milestone: milestone,
            notes: `Self-reported via SMS Follow-Up link: Employer=${formData.employer_name}, Wage=₹${formData.wage_monthly}`
          })
        })
      }
      setSubmissionSuccess(true)
      setTimeout(() => {
        router.push(`/evidence/upload?trainee_id=${traineeId}`)
      }, 1500)
    } catch (err) {
      console.error('Failed to notify communications backend', err)
      router.push(`/evidence/upload?trainee_id=${traineeId}`)
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
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Step 2: Attach Primary Corroborating Evidence
            </h2>

            <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-8 text-center bg-slate-50 cursor-pointer transition-colors space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <Upload size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Upload Payslip, Offer Letter or Apprenticeship Contract</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Supports PDF, PNG, JPG up to 10MB. Mock OCR will automatically extract field values and run consistency checks.
              </p>
              <div className="pt-2">
                <span className="bg-white border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-md font-semibold shadow-sm inline-block">
                  Selected File: payslip_oct2023.pdf
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition-colors"
              >
                Review & Confirm <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Step 3: Review & Initiate Verification Pipeline
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

            {submissionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm">Outreach Response Recorded Successfully!</p>
                  <p className="text-emerald-700">Follow-up ledger updated. Redirecting to evidence processing pipeline...</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Upon submission, OCR intelligence will extract entities from the attached payslip and trigger an automated mock attestation notification to the employer.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting || submissionSuccess}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmitAndVerify}
                disabled={isSubmitting || submissionSuccess}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Recording Response...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Event & Trigger OCR Pipeline</span>
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
