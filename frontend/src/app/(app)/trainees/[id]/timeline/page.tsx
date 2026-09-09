'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { TIMELINE_MILESTONES, MOCK_TRAINEE } from '@/lib/mockData'
import { MOCK_SEARCH_DATASET } from '@/lib/mockSearchData'
import { 
  Building2, CheckCircle2, AlertCircle, ArrowLeft, 
  TrendingUp, ShieldCheck, FileCheck, Network, UserCheck, Search,
  Send, Phone, Clock, MessageSquare, Check, X, RefreshCw, Zap
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
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <Link
            href={`/dsig?trainee_id=${id}`}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Network size={14} />
            DSIG Tracker
          </Link>

          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-150 active:scale-95"
          >
            <Send size={14} />
            Follow-Up Outreach
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
                  <span className="text-slate-500 font-semibold">Carrier Gateway:</span>
                  <span className="text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                    SIMULATED CELLULAR GATEWAY (AIRTEL / JIO DLT)
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
    </div>
  )
}

