'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { TIMELINE_MILESTONES, MOCK_TRAINEE } from '@/lib/mockData'
import { MOCK_SEARCH_DATASET } from '@/lib/mockSearchData'
import { 
  Building2, CheckCircle2, AlertCircle, ArrowLeft, 
  TrendingUp, ShieldCheck, FileCheck, Network, UserCheck, Search,
  Send, Phone, Clock, MessageSquare, Check, X, RefreshCw, Zap, Mail,
  Sparkles, ExternalLink, Loader2, Edit3, Save
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts'

export default function LongitudinalTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || 'T001'
  const [liveTrainee, setLiveTrainee] = React.useState<any>(null)
  const [allTrainees, setAllTrainees] = React.useState<{ trainee_id: string; name: string }[]>([])

  // Messaging / Follow-Up State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = React.useState(false)
  const [selectedMilestone, setSelectedMilestone] = React.useState('6M')
  const [isSending, setIsSending] = React.useState(false)
  const [sendResult, setSendResult] = React.useState<any>(null)
  const [commHistory, setCommHistory] = React.useState<any[]>([])

  const fetchHistory = React.useCallback(() => {
    fetch(`http://127.0.0.1:8000/communications/history/${id}`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) setCommHistory(data)
      })
      .catch(() => {})
  }, [id])

  React.useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleSendFollowUp = async () => {
    setIsSending(true)
    setSendResult(null)
    try {
      const res = await fetch('http://127.0.0.1:8000/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainee_id: id,
          milestone: selectedMilestone,
        })
      })
      const data = await res.json()
      setSendResult(data)
      fetchHistory()
    } catch (err) {
      setSendResult({ success: false, error: 'Connection failed to backend gateway.' })
    } finally {
      setIsSending(false)
    }
  }

  // Batch Broadcast State
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false)
  const [broadcastMilestone, setBroadcastMilestone] = React.useState('3M')
  const [isBroadcasting, setIsBroadcasting] = React.useState(false)
  const [broadcastResult, setBroadcastResult] = React.useState<any>(null)

  const handleTriggerBatchBroadcast = async () => {
    setIsBroadcasting(true)
    setIsBatchModalOpen(true)
    setBroadcastResult(null)
    try {
      const res = await fetch('http://127.0.0.1:8000/communications/broadcast-unverified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone: broadcastMilestone,
          sender: 'OFFICER_BULK_OUTREACH',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setBroadcastResult(data)
        fetchHistory()
      } else {
        alert('Failed to trigger broadcast. Please check backend server status.')
      }
    } catch (e) {
      console.error(e)
      alert('Error connecting to communications service.')
    } finally {
      setIsBroadcasting(false)
    }
  }

  // Admin Trainee Edit State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    provider: '',
    district: '',
    state: '',
    status: 'completed'
  })
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)
  const [editSuccessMsg, setEditSuccessMsg] = React.useState<string | null>(null)

  const handleOpenEditModal = () => {
    setEditForm({
      name: liveTrainee?.name || traineeName || '',
      email: liveTrainee?.email || (found as any)?.email || '',
      phone: liveTrainee?.phone || (found as any)?.phone || '',
      program: liveTrainee?.program || (found as any)?.program || 'Vocational Training',
      provider: liveTrainee?.provider || (found as any)?.provider || 'Accredited Center',
      district: liveTrainee?.district || (found as any)?.district || 'Madurai',
      state: liveTrainee?.state || (found as any)?.state || 'Tamil Nadu',
      status: liveTrainee?.status || 'completed'
    })
    setEditSuccessMsg(null)
    setIsEditModalOpen(true)
  }

  const handleSaveTraineeUpdates = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingEdit(true)
    setEditSuccessMsg(null)
    try {
      const res = await fetch(`http://127.0.0.1:8000/trainees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        setLiveTrainee(data.trainee)
        setEditSuccessMsg('Trainee record updated successfully in CONTINUUM registry.')
        setTimeout(() => {
          setIsEditModalOpen(false)
          setEditSuccessMsg(null)
        }, 1100)
      } else {
        alert('Failed to update trainee record. Please check backend server.')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating trainee details.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  React.useEffect(() => {
    fetch(`http://127.0.0.1:8000/trainees/${id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setLiveTrainee(data)
      })
      .catch(() => {})
  }, [id])

  React.useEffect(() => {
    fetch('http://127.0.0.1:8000/trainees?limit=100')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllTrainees(data.map((t: any) => ({
            trainee_id: t.trainee_id,
            name: t.name,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const found = MOCK_SEARCH_DATASET.find((t) => t.trainee_id === id || t.id === id)

  const traineeName = liveTrainee ? liveTrainee.name : (found ? found.name : MOCK_TRAINEE.name)
  const traineeWage = found ? found.monthly_wage : 21000

  const wageTrendData = [
    { milestone: 'Training', wage: 0, date: 'Apr 2023' },
    { milestone: '3M', wage: Math.round(traineeWage * 0.75), date: 'Jul 2023' },
    { milestone: '6M', wage: Math.round(traineeWage * 0.90), date: 'Oct 2023' },
    { milestone: '12M', wage: traineeWage, date: 'Apr 2024' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/advanced-search" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
              <Search size={12} /> Trainee Directory
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Trainee {id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Longitudinal Outcome Timeline
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Multi-year trajectory tracking for <strong>{traineeName}</strong> from certification to 24-month livelihood stability.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              <Phone size={11} className="text-emerald-600" />
              {liveTrainee?.phone || (found as any)?.phone || '+91 90000 01000'}
            </span>
            <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              <Mail size={11} className="text-blue-600" />
              {liveTrainee?.email || (found as any)?.email || `${id.toLowerCase()}@example.com`}
            </span>
            {liveTrainee?.program && (
              <span className="inline-flex items-center gap-1 font-medium bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                Trade: {liveTrainee.program}
              </span>
            )}
            {liveTrainee?.district && (
              <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                📍 {liveTrainee.district}, {liveTrainee.state || 'Tamil Nadu'}
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase text-[10px]">
              Status: {liveTrainee?.status || 'Active'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Trainee Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
            <UserCheck size={16} className="text-sky-700" />
            <span className="text-xs font-semibold text-slate-700">Select:</span>
            <select
              value={id}
              onChange={(e) => router.push(`/trainees/${e.target.value}/timeline`)}
              className="text-xs font-semibold bg-transparent text-slate-900 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value={id}>{id} - {traineeName}</option>
              {allTrainees.filter(t => t.trainee_id !== id).map(t => (
                <option key={t.trainee_id} value={t.trainee_id}>
                  {t.trainee_id} - {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Edit trainee demographic, contact, and vocational records (Administrator / Officer Override)"
          >
            <Edit3 size={13} className="text-sky-700" />
            <span>Edit Trainee Details</span>
          </button>

          <Link
            href={`/dsig?trainee_id=${id}`}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Network size={13} />
            <span>DSIG Tracker</span>
          </Link>

          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-lg shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
            title="Broadcast follow-up messages to all currently unupdated candidates in the registry"
          >
            <Zap size={13} className="fill-slate-950" />
            <span>Broadcast to All Unverified</span>
          </button>

          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Send size={13} />
            <span>Follow-Up Outreach</span>
          </button>
        </div>
      </div>

      {/* Wage Progression Area Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Verified Wage Progression (INR / Month)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Continuous trajectory over 12 months after certification</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            +33.3% Wage Growth
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wageTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="milestone" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Monthly Wage']} 
                labelFormatter={(label) => `Milestone: ${label}`}
              />
              <Area type="monotone" dataKey="wage" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#wageGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Cards Vertical Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Milestone Event Provenance Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIMELINE_MILESTONES.map((milestone, i) => {
            const isCompleted = milestone.status === 'completed'
            const isCurrent = milestone.status === 'current'
            const isUnknown = milestone.status === 'unknown'

            return (
              <div 
                key={i} 
                className={`p-5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-blue-50/50 border-blue-300 shadow-md ring-1 ring-blue-300' 
                    : isUnknown
                    ? 'bg-amber-50/30 border-amber-200 shadow-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      isCompleted 
                        ? 'bg-blue-600 text-white' 
                        : isCurrent 
                        ? 'bg-emerald-600 text-white' 
                        : isUnknown
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {milestone.milestone}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{milestone.label}</h3>
                      <p className="text-[11px] text-slate-500">{milestone.date}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Active Livelihood
                    </span>
                  )}
                  {isUnknown && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Pending Signal
                    </span>
                  )}
                </div>

                {isUnknown ? (
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>No Fresh Signal Recorded:</strong> Under the SIH 26135 longitudinal governance framework, missing data is not counted as unemployment until verified through authoritative checks.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {milestone.employer && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Employer Organization</span>
                        <span className="font-semibold text-slate-800">{milestone.employer}</span>
                      </div>
                    )}

                    {milestone.wage && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monthly Compensation</span>
                        <span className="font-bold text-slate-900">₹{milestone.wage.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Evidence Provenance</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 size={12} /> {Math.round(milestone.confidence * 100)}% Corroboration
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── LONGITUDINAL OUTCOME FOLLOW-UP AUDIT LOG ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Longitudinal Follow-Up Communication Log</h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
            {commHistory.length} Dispatched Events
          </span>
        </div>

        {commHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            <Clock size={24} className="mx-auto text-slate-300 mb-2" />
            No follow-up messages dispatched for this candidate yet. Click <strong>&quot;Follow-Up Outreach&quot;</strong> to send an SMS check.
          </div>
        ) : (
          <div className="space-y-3">
            {commHistory.map((item) => (
              <div key={item.communication_id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{item.communication_id}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                      {item.milestone} Check
                    </span>
                    <span className="text-slate-500 font-medium">To: {item.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      <Check size={10} /> {item.status.toUpperCase()}
                    </span>
                    {item.response_received ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        ✓ Response Recorded
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Awaiting Response
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 font-sans leading-relaxed">
                  &quot;{item.message_body}&quot;
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Carrier Ref: <strong className="text-slate-600 font-mono">{item.delivery_reference}</strong></span>
                  <span>Sent: {new Date(item.sent_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOLLOW-UP DISPATCH MODAL ── */}
      {isFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  <Send size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Government Trainee Follow-Up Dispatch</h3>
                  <p className="text-[10px] text-slate-300">Ministry of Skill Development &amp; Entrepreneurship</p>
                </div>
              </div>
              <button
                onClick={() => { setIsFollowUpModalOpen(false); setSendResult(null) }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Recipient Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Candidate:</span>
                  <span className="font-extrabold text-slate-900">{traineeName} ({id})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Registered Phone:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Phone size={12} className="text-emerald-600" />
                    {liveTrainee?.phone || (found as any)?.phone || '+91 90000 01000'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Registered Email:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Mail size={12} className="text-blue-600" />
                    {liveTrainee?.email || (found as any)?.email || `${id.toLowerCase()}@example.com`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Outreach Channels:</span>
                  <span className="text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                    DUAL CHANNEL (SMS + OFFICIAL EMAIL NOTICE)
                  </span>
                </div>
              </div>

              {/* Milestone Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Longitudinal Follow-Up Reason / Milestone:</label>
                <div className="grid grid-cols-4 gap-2">
                  {['3M', '6M', '12M', '24M'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMilestone(m)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedMilestone === m
                          ? 'bg-gov-navy text-white border-gov-navy shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m} Check
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">SMS Message Preview (Delivered to Trainee Mobile):</label>
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-slate-800 leading-relaxed font-sans text-xs">
                  Gov of India (MSDE - CONTINUUM): Hello <strong>{traineeName}</strong>, your <strong>{selectedMilestone}</strong> longitudinal outcome check is due. Please confirm your employment &amp; salary update here:
                  <div className="mt-1 text-sky-700 font-mono text-[11px] underline break-all">
                    http://localhost:3000/outcomes/new?trainee_id={id}&amp;milestone={selectedMilestone}&amp;source=sms
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Link automatically pre-loads trainee profile and initiates payslip/wage upload loop.
                </p>
              </div>

              {/* Dispatch Result Message */}
              {sendResult && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  sendResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {sendResult.success ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
                  <div>
                    <strong className="block text-xs font-bold">
                      {sendResult.success ? 'SMS Dispatched Successfully!' : 'Dispatch Error'}
                    </strong>
                    <p className="text-[11px] mt-0.5">
                      {sendResult.success
                        ? `Carrier Ref: ${sendResult.delivery_reference} (${sendResult.provider})`
                        : sendResult.error}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Official Government Outreach Channel</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIsFollowUpModalOpen(false); setSendResult(null) }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendFollowUp}
                  className="inline-flex items-center gap-2 bg-gov-navy hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send Follow-Up SMS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BATCH BROADCAST MODAL (WHOLE COHORT OUTREACH) ── */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Zap size={20} className="fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    1-Click Batch Follow-Up Broadcast
                  </h3>
                  <p className="text-xs text-blue-200/90">
                    Dispatches personalized follow-up SMS &amp; official email notices to all candidates with pending updates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBatchModalOpen(false)
                  setBroadcastResult(null)
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {isBroadcasting ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <Loader2 size={44} className="animate-spin text-blue-600" />
                    <Zap size={18} className="absolute inset-0 m-auto text-amber-500 fill-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Transmitting Batch Longitudinal Follow-Ups...</h4>
                    <p className="text-slate-500 text-xs max-w-sm">
                      Connecting to telecom cellular gateways (SIM-AIRTEL / SIM-JIO) and sending authenticated Gmail notices with secure portal links.
                    </p>
                  </div>
                </div>
              ) : broadcastResult ? (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Cohort Targets</span>
                      <span className="text-lg font-black text-slate-900">{broadcastResult.total_unverified_candidates}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Successfully Dispatched</span>
                      <span className="text-lg font-black text-emerald-600">{broadcastResult.dispatched_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Outreach Channels</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mt-1">
                        SMS + Real Gmail SMTP
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                    <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Each unupdated candidate received an official notification with their direct portal link. When they submit an employer/salary update, their status is automatically marked verified!
                    </span>
                  </div>

                  {/* Dispatched candidates table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-slate-700 text-[11px] flex justify-between items-center">
                      <span>Dispatched Follow-Up Audit Log</span>
                      <span className="text-slate-500 text-[10px]">{broadcastResult.results?.length || 0} Records</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {broadcastResult.results && broadcastResult.results.length > 0 ? (
                        broadcastResult.results.map((r: any, idx: number) => (
                          <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{r.trainee_name}</span>
                                <span className="text-[10px] font-mono text-slate-500">({r.trainee_id})</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span>📱 {r.phone_number}</span>
                                <span>•</span>
                                <span>Ref: {r.delivery_reference}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} /> Dispatched
                              </span>
                              <a
                                href={r.portal_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                              >
                                Test Portal Link <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-500">
                          All candidates in this cohort already have verified outcomes!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Select Periodic Milestone:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {['3M', '6M', '12M', '24M'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setBroadcastMilestone(m)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            broadcastMilestone === m
                              ? 'bg-gov-navy text-white border-gov-navy shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {m} Check
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs leading-relaxed space-y-1">
                    <strong>Autonomous Cohort Outreach:</strong>
                    <p>
                      This will transmit follow-up communications to all <strong>94 unverified candidates</strong> in the registry who have not yet submitted proof for the {broadcastMilestone} milestone.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official MSDE Continuous Tracking System
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsBatchModalOpen(false)
                    setBroadcastResult(null)
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {broadcastResult ? 'Done' : 'Cancel'}
                </button>
                {!broadcastResult && (
                  <button
                    disabled={isBroadcasting}
                    onClick={handleTriggerBatchBroadcast}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Zap size={14} className="fill-slate-950" />
                    <span>Transmit Batch Broadcast to Cohort</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN EDIT TRAINEE MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    Modify Trainee Record
                  </h3>
                  <p className="text-xs text-blue-200/90">
                    Administrator console to update candidate particulars in CONTINUUM registry &amp; DSIG identity graph.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditSuccessMsg(null)
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTraineeUpdates} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {editSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{editSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Trainee ID (Readonly) */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Trainee Identifier</label>
                    <input
                      type="text"
                      disabled
                      value={id}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-bold cursor-not-allowed text-xs"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Registry Status *</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    >
                      <option value="completed">Completed</option>
                      <option value="placed">Placed</option>
                      <option value="verified">Verified</option>
                      <option value="active">Active</option>
                      <option value="dropout">Dropout</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Full Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="e.g. candidate@example.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    />
                  </div>
                </div>

                {/* Program & Provider */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Program / Course *</label>
                    <input
                      type="text"
                      required
                      value={editForm.program}
                      onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                      placeholder="e.g. CNC Operator / Welder"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Training Provider *</label>
                    <input
                      type="text"
                      required
                      value={editForm.provider}
                      onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                      placeholder="e.g. NSTI Chennai"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    />
                  </div>
                </div>

                {/* District & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">District</label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                      placeholder="e.g. Madurai"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-gov-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                  <span className="font-bold block">🔒 Cryptographic DSIG Audit Sync:</span>
                  <p>
                    Saving changes immediately updates the candidate in SQLite and synchronizes their DSIG identity nodes (Phone &amp; Email) to maintain cryptographic auditability.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditSuccessMsg(null)
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-1.5 bg-gov-navy hover:bg-blue-900 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Updates...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

