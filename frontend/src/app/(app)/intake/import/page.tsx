'use client'

import React, { useState, useMemo, ChangeEvent } from 'react'
import Link from 'next/link'
import {
  Upload, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  ShieldCheck, Sparkles, RefreshCw, Eye, Database, Filter, Search,
  Download, ArrowLeft, Check, Layers, AlertCircle, ChevronRight,
  Info, BarChart2, ShieldAlert
} from 'lucide-react'

// Schema requirements defined for Module 1
const EXPECTED_COLUMNS = [
  'trainee_id', 'name', 'date_of_birth', 'gender', 'contact_number', 'email',
  'district', 'state', 'training_provider', 'training_centre', 'course', 'sector', 'batch_id',
  'training_start_date', 'training_end_date', 'training_status',
  'attendance_percentage', 'assessment_score', 'assessment_result',
  'certification_status', 'certification_date',
  'skill_1', 'skill_2', 'skill_3', 'skill_4'
]

interface IssueDetail {
  row: number
  trainee_id: string
  field: string
  value: string
  problem: string
  suggested_fix: string
}

interface ValidationResponse {
  filename: string
  total_rows: number
  valid_rows: number
  invalid_rows: number
  duplicates_dropped?: number
  categories: {
    duplicates: number
    missing_fields: number
    date_format_or_sequence: number
    numeric_out_of_range: number
    logical_constraint: number
  }
  issues: IssueDetail[]
  records: any[]
}

interface ImportSummaryResult {
  batch_id: string
  filename: string
  total_rows: number
  imported_count: number
  skipped_count: number
  trainees_created: number
  trainees_updated: number
  duplicate_count: number
  timestamp: string
}

export default function TrainingIntakeImportPage() {
  // Workflow Step: 1 = Upload, 2 = Validating, 3 = Validation Result, 4 = Preview, 5 = Confirmation, 6 = Summary
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; rowCountEstimate: number } | null>(null)
  const [isDemoData, setIsDemoData] = useState<boolean>(false)

  // Validation state
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null)

  // Preview filtering & search
  const [previewTab, setPreviewTab] = useState<'all' | 'valid' | 'issues'>('all')
  const [previewSearch, setPreviewSearch] = useState<string>('')
  const [previewPage, setPreviewPage] = useState<number>(1)
  const pageSize = 10

  // Import Execution state
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [importSummary, setImportSummary] = useState<ImportSummaryResult | null>(null)

  // ── 1. LOAD SYNTHETIC DEMO CSV ──
  const handleLoadDemoCSV = async () => {
    try {
      setValidationError(null)
      const res = await fetch('/demo_data/CONTINUUM_Module1_Demo_Training_Import.csv')
      if (!res.ok) {
        throw new Error('Failed to load demo CSV from public bundle.')
      }
      const text = await res.text()
      const lines = text.trim().split('\n').filter(Boolean)
      const rowCount = Math.max(0, lines.length - 1) // exclude header

      setFileContent(text)
      setSelectedFile(null)
      setIsDemoData(true)
      setFileDetails({
        name: 'CONTINUUM_Module1_Demo_Training_Import.csv (Preloaded Synthetic Dataset)',
        size: `${(text.length / 1024).toFixed(1)} KB`,
        rowCountEstimate: rowCount,
      })
    } catch (err: any) {
      setValidationError(err.message || 'Error loading demo dataset.')
    }
  }

  // ── 1B. DOWNLOAD EMPTY / SAMPLE CSV TEMPLATE ──
  const handleDownloadTemplateCSV = () => {
    const headers = [
      'trainee_id', 'name', 'date_of_birth', 'gender', 'contact_number', 'email',
      'district', 'state', 'training_provider', 'training_centre', 'course', 'sector',
      'batch_id', 'training_start_date', 'training_end_date', 'training_status',
      'attendance_percentage', 'assessment_score', 'assessment_result',
      'certification_status', 'certification_date', 'skill_1', 'skill_2', 'skill_3', 'skill_4'
    ]
    const sampleRow = [
      'T001', 'Aarav Kumar', '1995-01-01', 'Male', '9876543210', 'aarav.kumar@example.com',
      'Chennai', 'Tamil Nadu', 'SkillBridge Training Services', 'Guindy Centre', 'Data Analytics', 'IT-ITeS',
      'BATCH-2026-01', '2026-01-05', '2026-03-06', 'Completed', '88', '75', 'Pass',
      'Certified', '2026-03-22', 'Excel', 'SQL', 'Python', 'PowerBI'
    ]
    const csvString = headers.join(',') + '\n' + sampleRow.join(',') + '\n'
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'CONTINUUM_Training_Intake_Template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ── PROCESS ANY SELECTED / DROPPED FILE ──
  const processSelectedFile = (file: File) => {
    setValidationError(null)
    setIsDemoData(false)
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.trim().split('\n').filter(Boolean)
      setFileContent(text)
      setFileDetails({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        rowCountEstimate: Math.max(0, lines.length - 1),
      })
    }
    reader.readAsText(file)
  }

  // ── 2. HANDLE LOCAL FILE SELECTION ──
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) processSelectedFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // ── 3. TRIGGER VALIDATION ──
  const handleTriggerValidation = async () => {
    if (!fileContent.trim()) {
      setValidationError('Please select or load a CSV file first.')
      return
    }

    setIsValidating(true)
    setValidationError(null)
    setCurrentStep(2)

    try {
      const res = await fetch('http://127.0.0.1:8000/intake/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileDetails?.name || 'uploaded_training_data.csv',
          csv_content: fileContent,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.detail || `Validation server returned status ${res.status}`)
      }

      const data: ValidationResponse = await res.json()
      setValidationData(data)
      setCurrentStep(3)
    } catch (err: any) {
      setValidationError(err.message || 'Validation request failed. Ensure backend server is running.')
      setCurrentStep(1)
    } finally {
      setIsValidating(false)
    }
  }

  // ── 4. CONFIRM & PERSIST TO CONTINUUM DATABASE ──
  const handleConfirmImport = async () => {
    if (!validationData) return

    setIsImporting(true)
    setValidationError(null)

    try {
      const res = await fetch('http://127.0.0.1:8000/intake/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: validationData.filename,
          records: validationData.records,
          total_rows: validationData.total_rows,
          duplicate_count: validationData.categories.duplicates,
          warnings_count: validationData.issues.length,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.detail || 'Import commit failed.')
      }

      const result: ImportSummaryResult = await res.json()
      setImportSummary(result)
      setCurrentStep(6)
    } catch (err: any) {
      setValidationError(err.message || 'Failed to persist records to database.')
    } finally {
      setIsImporting(false)
    }
  }

  // ── RESET WORKFLOW ──
  const handleResetWorkflow = () => {
    setSelectedFile(null)
    setFileContent('')
    setFileDetails(null)
    setIsDemoData(false)
    setValidationData(null)
    setImportSummary(null)
    setValidationError(null)
    setCurrentStep(1)
  }

  // ── Filtered preview records ──
  const filteredRecords = useMemo(() => {
    if (!validationData?.records) return []
    let list = validationData.records

    if (previewTab === 'valid') {
      list = list.filter((r) => r.status === 'valid')
    } else if (previewTab === 'issues') {
      list = list.filter((r) => r.status !== 'valid')
    }

    if (previewSearch.trim()) {
      const query = previewSearch.toLowerCase()
      list = list.filter(
        (r) =>
          r.trainee_id?.toLowerCase().includes(query) ||
          r.name?.toLowerCase().includes(query) ||
          r.course?.toLowerCase().includes(query) ||
          r.district?.toLowerCase().includes(query) ||
          r.training_provider?.toLowerCase().includes(query)
      )
    }

    return list
  }, [validationData, previewTab, previewSearch])

  const totalPreviewPages = Math.ceil(filteredRecords.length / pageSize) || 1
  const paginatedRecords = useMemo(() => {
    const start = (previewPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, previewPage])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in-up font-sans">
      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <Layers size={14} />
            <span>CONTINUUM Ingestion Protocol</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>Module 1: Intake &amp; Onboarding</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Import Training &amp; Trainee Intake
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
            Ingest structured training completion and baseline assessment datasets from partner institutes. 
            All incoming records undergo 7 automated schema, range, and logic validation checks before creating normalized identity anchors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentStep > 1 && (
            <button
              onClick={handleResetWorkflow}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              <RefreshCw size={13} />
              <span>Reset Import</span>
            </button>
          )}
          <Link
            href="/intelligence"
            className="inline-flex items-center gap-1.5 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Admin Overview</span>
          </Link>
        </div>
      </div>

      {/* ── PROGRESS STEPPER ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            { stepNum: 1, label: '1. Select / Drop File' },
            { stepNum: 2, label: '2. Schema Validation' },
            { stepNum: 3, label: '3. Issues & Review' },
            { stepNum: 4, label: '4. Preview Normalized' },
            { stepNum: 5, label: '5. Confirmation & Summary' },
          ].map((item) => {
            const isCompleted =
              (item.stepNum === 1 && currentStep > 1) ||
              (item.stepNum === 2 && currentStep >= 3) ||
              (item.stepNum === 3 && currentStep >= 4) ||
              (item.stepNum === 4 && currentStep >= 5) ||
              (item.stepNum === 5 && currentStep === 6)
            const isCurrent =
              (item.stepNum === 1 && currentStep === 1) ||
              (item.stepNum === 2 && currentStep === 2) ||
              (item.stepNum === 3 && currentStep === 3) ||
              (item.stepNum === 4 && currentStep === 4) ||
              (item.stepNum === 5 && (currentStep === 5 || currentStep === 6))

            return (
              <div
                key={item.stepNum}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-bold'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check size={11} /> : item.stepNum}
                </div>
                <span className="truncate">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ERROR NOTICE BANNER ── */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900 shadow-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-950">Ingestion Error / Notice</p>
            <p className="mt-0.5">{validationError}</p>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STATE 1: UPLOAD SCREEN
         ════════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Box */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Upload size={18} className="text-blue-600" />
                  Upload Training Intake File
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accepts CSV or Excel-compatible delimited tabular datasets (UTF-8).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Single-Click Download Sample Template CSV Button */}
                <button
                  type="button"
                  onClick={handleDownloadTemplateCSV}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download size={13} className="text-slate-700" />
                  <span>Download Sample CSV Template</span>
                </button>

                {/* Quick Load Demo Button */}
                <button
                  type="button"
                  onClick={handleLoadDemoCSV}
                  className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-sky-600" />
                  <span>Load Synthetic Demo CSV (100 Rows)</span>
                </button>
              </div>
            </div>

            {/* Dropzone Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                fileDetails
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                id="csv-file-input"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                    fileDetails ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {fileDetails ? <CheckCircle2 size={28} /> : <FileText size={28} />}
                </div>

                {fileDetails ? (
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900 text-sm">{fileDetails.name}</p>
                    <p className="text-xs text-slate-500">
                      Size: <span className="font-mono font-bold text-slate-700">{fileDetails.size}</span> • Estimated Rows:{' '}
                      <span className="font-mono font-bold text-blue-700">{fileDetails.rowCountEstimate} rows</span>
                    </p>
                    {isDemoData && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full mt-1">
                        <Sparkles size={11} /> Benchmark Dataset Loaded (95 Valid, 5 Known Deviations)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label
                      htmlFor="csv-file-input"
                      className="inline-block font-extrabold text-slate-900 text-sm hover:text-blue-700 cursor-pointer"
                    >
                      Click to browse or drag and drop your training file here
                    </label>
                    <p className="text-xs text-slate-500">
                      Standard CONTINUUM schema headers required. Max 25 MB.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <label
                    htmlFor="csv-file-input"
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    <span>{fileDetails ? 'Choose Different File' : 'Select Local CSV File'}</span>
                  </label>

                  {fileDetails && (
                    <button
                      type="button"
                      onClick={handleTriggerValidation}
                      className="inline-flex items-center gap-2 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <ShieldCheck size={15} className="text-emerald-400" />
                      <span>Validate File ({fileDetails.rowCountEstimate} Rows)</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Ingestion Pipeline Explanation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Info size={15} className="text-blue-600 shrink-0" />
                <span>CONTINUUM Modular Workflow Context</span>
              </div>
              <p className="leading-relaxed">
                This intake step creates foundational records across 5 normalized relational entities:
                <span className="font-semibold text-slate-900"> Trainee</span>, 
                <span className="font-semibold text-slate-900"> TrainingRecord</span>, 
                <span className="font-semibold text-slate-900"> AssessmentRecord</span>, 
                <span className="font-semibold text-slate-900"> CertificationRecord</span>, and 
                <span className="font-semibold text-slate-900"> TraineeSkill</span>. 
                Existing trainee IDs will have their profile anchors enriched without creating duplicate personas.
              </p>
            </div>
          </div>

          {/* Right Column: Schema Specifications */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Database size={16} className="text-sky-600" />
                  Mandatory Schema Fields
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  22 normalized columns evaluated across 7 rule dimensions.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Core Columns Required
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXPECTED_COLUMNS.map((col) => (
                    <span
                      key={col}
                      className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Enforced Validation Rules
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Exact column header completeness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Missing value detection (name, course, district)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>In-file duplicate Trainee ID isolation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>ISO date format (YYYY-MM-DD) & sequence checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Attendance &amp; Assessment numeric range (0–100)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Logical consistency (Completed requires End Date)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <a
                href="/demo_data/CONTINUUM_Module1_Demo_Training_Import.csv"
                download="CONTINUUM_Module1_Template.csv"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                <Download size={14} />
                <span>Download Sample CSV Template</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STATE 2: VALIDATING SPINNER
         ════════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center space-y-4 shadow-xs">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Running CONTINUUM Ingestion Engine...
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Validating columns, checking duplicates, parsing ISO dates, and checking constraint integrity.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STATE 3: VALIDATION RESULT & ISSUES SCREEN
         ════════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && validationData && (
        <div className="space-y-6">
          {/* Automatic Duplicate Drop Notification Banner */}
          {(validationData.duplicates_dropped || validationData.categories.duplicates > 0) && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-900 shadow-xs">
              <ShieldAlert size={18} className="text-sky-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-sky-950">
                  Duplicate Records Auto-Cleaned ({validationData.duplicates_dropped ?? validationData.categories.duplicates} Duplicate Rows Detected)
                </p>
                <p className="text-sky-800 leading-relaxed">
                  CONTINUUM has automatically identified and dropped {validationData.duplicates_dropped ?? validationData.categories.duplicates} redundant trainee entries to safeguard identity continuity and prevent fraudulent duplicate credential creation. The clean, unique records are ready for ingestion without requiring manual file edits.
                </p>
              </div>
            </div>
          )}

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Rows Evaluated</span>
              <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
                {validationData.total_rows}
              </div>
              <p className="text-xs text-slate-500 mt-1">Source: {validationData.filename}</p>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs bg-emerald-50/20">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Ready for Ingestion</span>
              <div className="text-3xl font-black text-emerald-700 mt-1 font-mono">
                {validationData.valid_rows}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                <CheckCircle2 size={13} />
                <span>
                  {((validationData.valid_rows / (validationData.total_rows || 1)) * 100).toFixed(1)}% Valid Pass Rate
                </span>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs bg-amber-50/20">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Require Review / Skipped</span>
              <div className="text-3xl font-black text-amber-700 mt-1 font-mono">
                {validationData.invalid_rows}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1">
                <AlertTriangle size={13} />
                <span>Isolated without breaking batch</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quality Score</span>
                <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
                  {((validationData.valid_rows / (validationData.total_rows || 1)) * 100).toFixed(0)}/100
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Rule engine: NSQF-v2 Schema Standard
              </span>
            </div>
          </div>

          {/* Issue Categories Badges */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-600" />
              Categorized Issue Breakdown ({validationData.issues.length} flagged occurrences)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Duplicate IDs</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {validationData.categories.duplicates}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Missing Values</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {validationData.categories.missing_fields}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Invalid Dates</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {validationData.categories.date_format_or_sequence}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Numeric Range Errors</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {validationData.categories.numeric_out_of_range}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Logical Conflicts</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {validationData.categories.logical_constraint}
                </p>
              </div>
            </div>
          </div>

          {/* Problematic Rows Detail Table */}
          {validationData.issues.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    Problematic Rows Requiring Institute Review
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These rows violate ingestion integrity rules and will be skipped during database commit.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full shrink-0">
                  {validationData.issues.length} Action Items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">CSV Row</th>
                      <th className="px-4 py-3">Trainee ID</th>
                      <th className="px-4 py-3">Field</th>
                      <th className="px-4 py-3">Current Value</th>
                      <th className="px-4 py-3">Validation Problem</th>
                      <th className="px-4 py-3">Suggested Remediation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validationData.issues.map((issue, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          Row {issue.row}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                          {issue.trainee_id || '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {issue.field}
                          </code>
                        </td>
                        <td className="px-4 py-3 font-mono text-rose-600 font-bold max-w-[150px] truncate">
                          {issue.value || '<empty>'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <AlertCircle size={12} className="text-rose-500 shrink-0" />
                            {issue.problem}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-emerald-800 font-medium bg-emerald-50/40">
                          {issue.suggested_fix}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Re-upload / Modify File</span>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Preview Normalized Data ({validationData.valid_rows} Records)</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STATE 4: PREVIEW SCREEN
         ════════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && validationData && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  setPreviewTab('all')
                  setPreviewPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records ({validationData.total_rows})
              </button>
              <button
                onClick={() => {
                  setPreviewTab('valid')
                  setPreviewPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  previewTab === 'valid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Ready to Import ({validationData.valid_rows})</span>
              </button>
              <button
                onClick={() => {
                  setPreviewTab('issues')
                  setPreviewPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  previewTab === 'issues' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                <AlertTriangle size={13} />
                <span>Flagged Deviations ({validationData.invalid_rows})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={previewSearch}
                onChange={(e) => {
                  setPreviewSearch(e.target.value)
                  setPreviewPage(1)
                }}
                placeholder="Search ID, name, course, district..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Showing {paginatedRecords.length} of {filteredRecords.length} records in current view
              </span>
              <span className="text-slate-500 font-medium">
                Page {previewPage} of {totalPreviewPages}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Trainee ID</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Contact &amp; Email</th>
                    <th className="px-3 py-3">District / State</th>
                    <th className="px-3 py-3">Course &amp; Batch</th>
                    <th className="px-3 py-3">Training Status</th>
                    <th className="px-3 py-3">Attendance</th>
                    <th className="px-3 py-3">Score &amp; Cert</th>
                    <th className="px-3 py-3">Normalized Skills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {paginatedRecords.map((r, i) => {
                    const isValid = r.status === 'valid'
                    return (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          isValid ? 'hover:bg-slate-50/80' : 'bg-rose-50/20 hover:bg-rose-50/40'
                        }`}
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          {isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              <XCircle size={11} /> Flagged
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {r.trainee_id}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{r.name || '—'}</p>
                          <p className="text-[11px] text-slate-500">{r.gender || '—'} • {r.date_of_birth || '—'}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="font-mono text-slate-800 font-semibold">{r.contact_number || r.phone || '—'}</p>
                          <p className="text-[11px] text-blue-700 font-medium truncate max-w-[170px]">{r.email || '—'}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{r.district || '—'}</p>
                          <p className="text-[11px] text-slate-500">{r.state || '—'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">{r.course || '—'}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{r.batch_id || '—'}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.training_status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : r.training_status === 'Dropped Out'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.training_status || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono">
                          <span className="font-bold text-slate-900">{r.attendance_percentage}%</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-mono text-slate-900 font-bold">
                            <span>{r.assessment_score}/100</span>
                            <span className="text-[10px] text-slate-500 font-sans">({r.assessment_result})</span>
                          </div>
                          <p className="text-[10px] text-emerald-700 font-semibold">{r.certification_status}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {[r.skill_1, r.skill_2, r.skill_3, r.skill_4]
                              .filter(Boolean)
                              .map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 truncate"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPreviewPages > 1 && (
              <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                  disabled={previewPage === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPreviewPages) }).map((_, idx) => {
                    const pageNumber = idx + 1
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPreviewPage(pageNumber)}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold ${
                          previewPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                  disabled={previewPage === totalPreviewPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Validation Breakdown</span>
            </button>

            <button
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <CheckCircle2 size={15} />
              <span>Proceed to Ingestion Confirmation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STATE 5: PRE-COMMIT CONFIRMATION SCREEN
         ════════════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && validationData && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
              <Database size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Confirm Training Records Ingestion
            </h2>
            <p className="text-xs text-slate-500">
              Please review the commit parameters before normalizing records into the CONTINUUM identity ledger.
            </p>
          </div>

          {/* Summary Metric Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 divide-y divide-slate-200 text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Source Ingestion File:</span>
              <span className="font-mono font-bold text-slate-900">{validationData.filename}</span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Total Valid Records to Ingest:</span>
              <span className="font-mono font-black text-emerald-700 text-sm">
                {validationData.valid_rows} Records
              </span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Flagged Records to Skip:</span>
              <span className="font-mono font-bold text-amber-700">
                {validationData.invalid_rows} Records
              </span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-600">Normalized Entity Breakdown:</span>
              <span className="text-slate-900 font-semibold">
                Trainee, Training, Assessment, Certification, Skills
              </span>
            </div>
          </div>

          {/* Identity Update Policy Notice */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <ShieldCheck size={16} className="text-blue-700 shrink-0" />
              <span>Identity Continuity &amp; Merge Policy</span>
            </div>
            <p className="leading-relaxed">
              Records with existing Trainee IDs (e.g. <code>T001</code>) will not overwrite prior identity graphs. 
              Their demographic anchors will be enriched, and new training, assessment, and certification rows will link directly to their persistent CONTINUUM timeline.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(4)}
              disabled={isImporting}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Preview</span>
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="inline-flex items-center gap-2 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Committing to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Confirm and Import ({validationData.valid_rows} Records)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          STATE 6: IMPORT SUMMARY SCREEN
         ════════════════════════════════════════════════════════════════════ */}
      {currentStep === 6 && importSummary && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Import Complete!
            </h2>
            <p className="text-xs text-slate-500">
              Batch <span className="font-mono font-bold text-blue-700">{importSummary.batch_id}</span> successfully committed to CONTINUUM database.
            </p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Processed</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {importSummary.total_rows}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Imported</span>
              <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                {importSummary.imported_count}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Skipped</span>
              <p className="text-2xl font-black text-amber-700 font-mono mt-0.5">
                {importSummary.skipped_count}
              </p>
            </div>
          </div>

          {/* Breakdown Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5 text-slate-600">
            <div className="flex justify-between">
              <span>New Trainee Personas Created:</span>
              <span className="font-mono font-bold text-slate-900">{importSummary.trainees_created}</span>
            </div>
            <div className="flex justify-between">
              <span>Existing Trainee Profiles Enriched:</span>
              <span className="font-mono font-bold text-blue-700">{importSummary.trainees_updated}</span>
            </div>
            <div className="flex justify-between">
              <span>Duplicate In-Batch Records Handled:</span>
              <span className="font-mono font-bold text-slate-700">{importSummary.duplicate_count}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-500">
              <span>Commit Timestamp:</span>
              <span className="font-mono text-[11px]">{new Date(importSummary.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleResetWorkflow}
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 rounded-xl transition-colors"
            >
              <RefreshCw size={14} />
              <span>Import Another File</span>
            </button>

            <Link
              href="/advanced-search"
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <Search size={14} />
              <span>View Imported Trainees</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
