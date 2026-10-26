'use client'

import { API_BASE } from '@/lib/api'
import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { 
  Upload, FileText, CheckCircle2, ArrowRight, 
  ShieldCheck, Sparkles, AlertCircle, Loader2, Image as ImageIcon, Eye,
  Lock
} from 'lucide-react'

export default function EvidenceUploadPage() {
  return (
    <Suspense fallback={
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Ingestion Form...</p>
      </div>
    }>
      <EvidenceUploadContent />
    </Suspense>
  )
}

function EvidenceUploadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role, activeTrainee, setActiveTraineeId } = useRole()
  const isGovernmentOfficial = role === 'analyst'

  const paramTraineeId = searchParams.get('trainee_id')
  const [selectedType, setSelectedType] = useState('payslip')
  const [traineeId, setTraineeId] = useState(paramTraineeId || activeTrainee?.trainee_id || 'T001')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [useSample, setUseSample] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string>('/sample_payslip.png')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (paramTraineeId) {
      setTraineeId(paramTraineeId.toUpperCase())
      setActiveTraineeId(paramTraineeId.toUpperCase())
    } else if (activeTrainee?.trainee_id) {
      setTraineeId(activeTrainee.trainee_id)
    }
  }, [paramTraineeId, activeTrainee?.trainee_id, setActiveTraineeId])

  const effectiveTraineeId = traineeId || activeTrainee?.trainee_id || 'T001'
  const isLockedToTrainee = !isGovernmentOfficial || !!paramTraineeId

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setUseSample(false)
      setPreviewUrl(URL.createObjectURL(file))
      setErrorMsg(null)
    }
  }

  const handleUseSample = () => {
    setSelectedFile(null)
    setUseSample(true)
    setPreviewUrl('/sample_payslip.png')
    setErrorMsg(null)
  }

  const handleRunOCR = async () => {
    setIsProcessing(true)
    setErrorMsg(null)

    try {
      setProcessingStage('Stage 1: Initializing Tesseract 5.5.3 OCR Engine...')
      await new Promise(r => setTimeout(r, 600))

      setProcessingStage('Stage 2: Parsing Layout & Extracting Financial Entities...')
      const formData = new FormData()
      formData.append('trainee_id', effectiveTraineeId)
      formData.append('doc_type', selectedType)
      formData.append('use_sample', useSample ? 'true' : 'false')

      if (selectedFile && !useSample) {
        formData.append('file', selectedFile)
      }

      setProcessingStage('Stage 3: Running Deterministic Consistency & Identity Verification...')
      const res = await fetch(`${API_BASE}/evidence/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`OCR Pipeline failed with status: ${res.status}`)
      }

      const data = await res.json()
      setProcessingStage('Completed! Navigating to Explainable Assessment...')
      await new Promise(r => setTimeout(r, 400))

      router.push(`/evidence/${data.evidence_id || 'DOC001'}/extraction?trainee_id=${effectiveTraineeId}`)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to process document through OCR pipeline')
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
          <span>Evidence Ingestion Layer</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Trainee Outcome Verification</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Livelihood Supporting Evidence
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Unstructured documents are converted into machine-readable verified claims via Tesseract OCR and deterministic consistency checks.
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

      {/* Configuration & Ingestion */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Target CONTINUUM Trainee
            </label>
            {isLockedToTrainee ? (
              <div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center uppercase">
                      {activeTrainee?.initials || 'TR'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {activeTrainee?.name || 'Trainee'} ({effectiveTraineeId})
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {activeTrainee?.program || 'Vocational Training'} • Verified Learner Session
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    <Lock size={10} /> Authenticated
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-blue-600 shrink-0" />
                  <span>Privacy Safeguard: Submissions are cryptographically bound to your identity only.</span>
                </p>
              </div>
            ) : (
              <select
                value={traineeId}
                onChange={(e) => setTraineeId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="T001">T001 — Aarav Kumar (Data Analytics)</option>
                <option value="T002">T002 — Priya S (Web Development)</option>
                <option value="T003">T003 — Arun Prakash (Digital Marketing)</option>
                <option value="T004">T004 — Meena R (Electrical Technician)</option>
                <option value="T005">T005 — Rahul Kumar (Tailoring & Apparel Design)</option>
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Document Category
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="payslip">Monthly Payslip (With PF/ESI)</option>
              <option value="offer">Formal Offer Letter</option>
              <option value="naps">NAPS Apprenticeship Contract</option>
              <option value="attest">Direct Employer Attestation Proof</option>
            </select>
          </div>
        </div>

        {/* Source Switcher */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Source
            </label>
            <button
              type="button"
              onClick={handleUseSample}
              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                useSample 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⚡ Use CONTINUUM Benchmark Sample Payslip
            </button>
          </div>

          {/* Upload Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              useSample 
                ? 'border-blue-300 bg-blue-50/40' 
                : 'border-sky-300 bg-sky-50/40 hover:bg-sky-50'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,.pdf" 
              className="hidden" 
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                {useSample ? <FileText size={24} /> : <Upload size={24} />}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {useSample ? 'benchmark_sample_payslip.png (Preloaded)' : (selectedFile ? selectedFile.name : 'Click to Upload Document Image')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {useSample 
                    ? `Sample payslip with ABC Manufacturing, ${activeTrainee?.name || 'Candidate'}, ₹26,000 Gross / ₹23,445 Net` 
                    : (selectedFile ? `Size: ${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports PNG, JPG, JPEG payslip scans')}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                <CheckCircle2 size={13} /> {useSample ? 'Benchmark Sample Ready for OCR' : (selectedFile ? 'Image Loaded' : 'Click to Browse File')}
              </span>
            </div>
          </div>
        </div>

        {/* Live Image Preview */}
        {previewUrl && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-blue-600" />
                Document Visual Preview
              </span>
              <span className="text-[11px] font-normal text-slate-500">Passed directly to Tesseract OCR engine</span>
            </div>
            <div className="max-h-56 overflow-hidden rounded-lg border border-slate-200 flex justify-center bg-white">
              <img 
                src={previewUrl} 
                alt="Payslip preview" 
                className="max-h-56 object-contain w-auto"
              />
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span>{processingStage}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OCR Privacy Rule Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2">
          <ShieldCheck size={16} className="text-slate-700 shrink-0 mt-0.5" />
          <p>
            <strong>Deterministic Evidence Audit:</strong> The pipeline extracts entity key-pairs, tests arithmetic balance equations, checks PF & ESI thresholds, and performs fuzzy candidate verification against CONTINUUM registry records.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleRunOCR}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin text-sky-400" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-sky-400" />
                <span>Execute OCR & Validation Engine</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
