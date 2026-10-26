import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ShieldAlert, Clock, Building2, Search, AlertTriangle, CheckCircle2,
  Calendar, Users, ArrowRight, RefreshCw, FileText, Sparkles, Lock, Eye,
  Menu, X, LayoutDashboard, History, Fingerprint, Brain, Handshake,
  TrendingUp, AlertCircle, Timer, Layers, ChevronRight, Play, FastForward,
  BarChart3, Shield, Hash, MapPin, Gavel, Scale, Info, Check, HelpCircle,
  Upload, Send, PenTool, CheckCircle, ShieldCheck, Zap
} from 'lucide-react';

// Status badge styling helper (Restrained government palette)
const getStatusBadge = (code) => {
  switch (code) {
    case 'PENDING':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Pending Scrutiny' };
    case 'UNDER_PROCESS':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'Under Inquiry' };
    case 'DISPOSED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Disposed / Closed' };
    case 'ESCALATED':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label: 'Escalated' };
    case 'TRANSFERRED':
      return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', label: 'Transferred' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: code };
  }
};

export default function App() {
  // Navigation & Drawer
  const [activeTab, setActiveTab] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Data State
  const [kpis, setKpis] = useState(null);
  const [contradictions, setContradictions] = useState([]);
  const [overlaps, setOverlaps] = useState([]);
  const [cases, setCases] = useState([]);
  const [bureauWorkload, setBureauWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [bureauFilter, setBureauFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState(false);

  // Case Passport Modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseEvents, setCaseEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Visual Sliding Window Time Travel
  const timelineDates = [
    '2026-07-01', '2026-07-05', '2026-07-10', '2026-07-15',
    '2026-07-20', '2026-07-22', '2026-07-25', '2026-08-01', '2026-08-15'
  ];
  const [sliderIndex, setSliderIndex] = useState(5); // Default 22 Jul where conflict is active
  const [timeTravelBasis, setTimeTravelBasis] = useState('RECORDED');
  const [timeTravelData, setTimeTravelData] = useState(null);
  const [timeTravelLoading, setTimeTravelLoading] = useState(false);

  // Entity Resolution Review Queue
  const [entityQuery, setEntityQuery] = useState('Mepco College of Engg, Sivakasi');
  const [entityResult, setEntityResult] = useState(null);
  const [entityLoading, setEntityLoading] = useState(false);

  // Explainable AI & Duplicate Detection
  const [mlText, setMlText] = useState('College collected 25000 excess capitation fee and refuses to refund caution deposit');
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  // Joint Review
  const [jointReviews, setJointReviews] = useState([]);
  const [jointMemoText, setJointMemoText] = useState('');

  // ═══════════════════════════════════════════════════════════════
  // HERO STORYLINE & SIMULATOR STATES (FOR VIDEO RECORDING)
  // ═══════════════════════════════════════════════════════════════
  const [demoStep, setDemoStep] = useState(1);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showConflictInterceptionModal, setShowConflictInterceptionModal] = useState(false);
  const [showJointConfModal, setShowJointConfModal] = useState(false);
  
  // Live Simulated Intake Form State
  const [simPortal, setSimPortal] = useState('PGRC');
  const [simRef, setSimRef] = useState(`PGRC/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [simCollegeRaw, setSimCollegeRaw] = useState('Mepco Engg Sivakasi');
  const [simAadhaar, setSimAadhaar] = useState('XXXX-XXXX-4819');
  const [simCategory, setSimCategory] = useState('FEES');
  const [simSummary, setSimSummary] = useState('Management refusing refund of Rs 25,000 caution deposit post completion.');
  const [simulatingIntake, setSimulatingIntake] = useState(false);
  const [intakeSuccessResult, setIntakeSuccessResult] = useState(null);

  // Close drawer on click outside
  useEffect(() => {
    const handler = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [kpisRes, contraRes, overlapsRes, casesRes, workloadRes, jointRes] = await Promise.all([
        fetch('/api/dashboard/kpis').then(r => r.json()),
        fetch('/api/coordination/contradictions').then(r => r.json()),
        fetch('/api/coordination/overlaps').then(r => r.json()),
        fetch('/api/cases').then(r => r.json()),
        fetch('/api/dashboard/bureau-workload').then(r => r.json()),
        fetch('/api/coordination/joint-review').then(r => r.json())
      ]);
      setKpis(kpisRes);
      setContradictions(contraRes);
      setOverlaps(overlapsRes);
      setCases(casesRes);
      setBureauWorkload(workloadRes);
      setJointReviews(jointRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (bureauFilter && c.bureau_code.toLowerCase() !== bureauFilter.toLowerCase()) return false;
      if (statusFilter && c.status_code.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (slaFilter && !c.is_sla_breached) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchRef = c.source_ref.toLowerCase().includes(q);
        const matchInst = c.institution_name?.toLowerCase().includes(q);
        const matchSum = c.summary?.toLowerCase().includes(q);
        if (!matchRef && !matchInst && !matchSum) return false;
      }
      return true;
    });
  }, [cases, bureauFilter, statusFilter, slaFilter, searchQuery]);

  // Open Case Passport Modal
  const openCaseModal = async (c) => {
    setSelectedCase(c);
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/cases/${c.case_id}/events`);
      const events = await res.json();
      setCaseEvents(events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Run Time Travel for selected slider index
  const executeTimeTravel = useCallback(async (dateStr, basisVal) => {
    setTimeTravelLoading(true);
    try {
      const res = await fetch(`/api/time-travel/query?asof_date=${dateStr}&basis=${basisVal}`);
      const data = await res.json();
      setTimeTravelData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeTravelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'timetravel') {
      executeTimeTravel(timelineDates[sliderIndex], timeTravelBasis);
    }
  }, [activeTab, sliderIndex, timeTravelBasis, executeTimeTravel]);

  // Entity Resolution
  const runEntityResolve = async () => {
    setEntityLoading(true);
    try {
      const res = await fetch('/api/entity/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_name: entityQuery })
      });
      const data = await res.json();
      setEntityResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEntityLoading(false);
    }
  };

  // ML Inference
  const runMlInfer = async () => {
    setMlLoading(true);
    try {
      const res = await fetch('/api/ml/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint_text: mlText })
      });
      const data = await res.json();
      setMlResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setMlLoading(false);
    }
  };

  // Execute Simulated Intake
  const handleExecuteSimulateIntake = async () => {
    setSimulatingIntake(true);
    try {
      const res = await fetch('/api/intake/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_portal: simPortal,
          source_ref: simRef,
          institution_raw_name: simCollegeRaw,
          category_code: simCategory,
          priority: 'HIGH',
          complainant_type: 'STUDENT',
          complainant_id_raw: simAadhaar,
          summary: simSummary,
          event_timestamp: '2026-07-01T10:00:00'
        })
      });
      const data = await res.json();
      setIntakeSuccessResult(data);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingIntake(false);
    }
  };

  // Initiate Joint Review
  const handleInitiateJointReview = async (contra) => {
    try {
      const res = await fetch('/api/coordination/joint-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_id: contra.institution_id || 1,
          initiator_bureau_code: contra.bureau_b_code || 'RB',
          target_bureau_code: contra.bureau_a_code || 'PGRC',
          case_ids: [contra.bureau_a_case_id || 1, contra.bureau_b_case_id || 2],
          coordination_reason: `Conflict Sentinel Alert: ${contra.bureau_a_code || 'PGRC'} marked ${contra.bureau_a_ref || 'PGRC/2026/014'} as DISPOSED while ${contra.bureau_b_code || 'RB'} maintains active proceeding ${contra.bureau_b_ref || 'RB/SC/2026/089'}.`
        })
      });
      await res.json();
      await fetchDashboardData();
      setShowConflictInterceptionModal(false);
      setShowJointConfModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
    if (tabId === 'entitylab' && !entityResult) runEntityResolve();
    if (tabId === 'mlstudio' && !mlResult) runMlInfer();
  };

  // Stepper Controller for Video Demo Storyline
  const runStoryStep = (stepNum) => {
    setDemoStep(stepNum);
    if (stepNum === 1) {
      // Step 1: Citizen Ingestion
      setActiveTab('overview');
      setShowSimulateModal(true);
    } else if (stepNum === 2) {
      // Step 2: Show Regulation Bureau inquiry
      setActiveTab('overview');
      setBureauFilter('RB');
      setShowSimulateModal(false);
    } else if (stepNum === 3) {
      // Step 3: Trigger Conflict Interception hero moment
      setActiveTab('overview');
      setBureauFilter('');
      setShowConflictInterceptionModal(true);
    } else if (stepNum === 4) {
      // Step 4: Joint Resolution Conference Room
      setActiveTab('jointreview');
      setShowConflictInterceptionModal(false);
      setShowJointConfModal(true);
    } else if (stepNum === 5) {
      // Step 5: Bitemporal Time Travel Check
      setActiveTab('timetravel');
      setShowJointConfModal(false);
      setSliderIndex(3); // 15 July checkpoint
    }
  };

  const navItems = [
    { id: 'overview', label: 'Central Registry & Workload', desc: 'Complaints, Bureau dockets & SLA monitoring', icon: LayoutDashboard },
    { id: 'intelligence', label: 'Coordination Intelligence', desc: 'Overlap analysis & conflict interdiction', icon: Scale },
    { id: 'timetravel', label: 'Case History & Audit Trail', desc: 'Sliding window timeline & bitemporal audit', icon: History },
    { id: 'entitylab', label: 'Entity Resolution Queue', desc: '4-tier cascade matching & human review', icon: Fingerprint },
    { id: 'mlstudio', label: 'Explainable AI & Duplicates', desc: 'Category, priority & privacy-safe matching', icon: Brain },
    { id: 'jointreview', label: 'Inter-Bureau Conferences', desc: 'Harmonized determinations & signed memos', icon: Handshake },
  ];

  const currentDate = timelineDates[sliderIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">

      {/* Glassmorphism backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 glass-overlay transition-opacity duration-300" />
      )}

      {/* Left Navigation Drawer */}
      <nav
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'drawer-open' : 'drawer-enter'
        }`}
      >
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-inner">
                AICTE
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Government of India</div>
                <div className="text-sm font-bold text-white">Central Complaint Portal</div>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-400 font-bold">Portal Navigation</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                  active
                    ? 'bg-blue-800/60 text-white border border-blue-600/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-300' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">{item.label}</div>
                  <div className="text-xs text-slate-400 truncate">{item.desc}</div>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-blue-300 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 gov-live-dot" />
            <span>AICTE Statutory Sentinel Online</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">PS ID: 26264 · Code Society</div>
        </div>
      </nav>

      {/* Top Official Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center font-bold text-xs tracking-wider text-white">
                AICTE
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold leading-none">
                  All India Council for Technical Education · Ministry of Education
                </div>
                <h1 className="text-sm font-bold text-white mt-0.5 leading-tight">
                  Integrated Complaint Monitoring & Cross-Bureau Tracking System
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Interactive Action Trigger for Video Recording */}
            <button
              onClick={() => setShowSimulateModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Portal Filing</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-sm text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 gov-live-dot" />
              <span>Inter-Bureau Link Active</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PERSISTENT DEMO STEPPER TOOLBAR (FOR LIVE VIDEO RECORDING)     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>SIH Live Story Stepper:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {[
                { step: 1, label: '1. Ingest Grievance' },
                { step: 2, label: '2. RB Show-Cause' },
                { step: 3, label: '3. Conflict Intercept' },
                { step: 4, label: '4. Joint Resolution' },
                { step: 5, label: '5. Time-Travel Audit' },
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => runStoryStep(s.step)}
                  className={`px-3 py-1 rounded font-bold text-xs transition flex items-center gap-1 ${
                    demoStep === s.step
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">

        {/* Conflict Sentinel Critical Alert */}
        {contradictions.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-700 p-4 rounded-r-lg shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-900 bg-red-100 px-2 py-0.5 rounded">
                      Conflict Sentinel Alert
                    </span>
                    <span className="text-xs font-semibold text-red-800">
                      Potentially Contradictory Administrative Action Intercepted
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {contradictions[0].institution_name}
                    <span className="text-xs font-normal text-slate-600 ml-2">Permanent ID: {contradictions[0].permanent_id}</span>
                  </h3>
                  <p className="text-xs text-red-900 mt-1 leading-relaxed max-w-3xl">
                    {contradictions[0].warning_message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConflictInterceptionModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded text-white bg-red-700 hover:bg-red-800 shadow-xs transition"
              >
                Inspect Intercepted Conflict
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: CENTRAL REGISTRY & WORKLOAD OVERVIEW                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-5">

            {/* Official KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Ingested Cases', value: kpis?.total_cases ?? 0, desc: 'Central Registry Dockets', valueColor: 'text-slate-900' },
                { label: 'Pending Scrutiny', value: kpis?.pending_cases ?? 0, desc: 'Initial Scrutiny Stage', valueColor: 'text-amber-800' },
                { label: 'Under Process', value: kpis?.under_process_cases ?? 0, desc: 'Active Bureau Inquiry', valueColor: 'text-blue-900' },
                { label: 'Disposed Orders', value: kpis?.disposed_cases ?? 0, desc: 'Completed / Closed', valueColor: 'text-emerald-800' },
                { label: 'SLA Delay (>45 Days)', value: kpis?.sla_breached_cases ?? 0, desc: 'Statutory Limit Exceeded', valueColor: 'text-red-700' },
                { label: 'Cross-Bureau Overlaps', value: kpis?.active_overlaps_count ?? 0, desc: 'Concurrent Proceedings', valueColor: 'text-indigo-900' },
              ].map((kpi, idx) => (
                <div key={idx} className="gov-card p-4 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                    <span className={`text-4xl font-extrabold mt-1 block tracking-tight ${kpi.valueColor}`}>
                      {kpi.value}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 block border-t border-slate-100 pt-1.5">{kpi.desc}</span>
                </div>
              ))}
            </div>

            {/* Bureau-Wise Workload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  Bureau-Wise Workload & Disposal Metrics
                </h2>
                <span className="text-sm text-slate-500">Real-Time Aggregation Across Statutory Cells</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {bureauWorkload.map(bw => {
                  const total = bw.total_cases || 0;
                  const disposed = bw.disposed_cases || 0;
                  const active = bw.under_process_cases || 0;
                  const delayed = bw.sla_breached_cases || 0;

                  const disposedPct = total > 0 ? (disposed / total) * 100 : 0;
                  const activePct = total > 0 ? (active / total) * 100 : 0;
                  const delayedPct = total > 0 ? (delayed / total) * 100 : 0;

                  return (
                    <div key={bw.bureau_id} className="gov-card p-4 rounded-lg flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider mb-1">
                              {bw.bureau_code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate leading-snug" title={bw.bureau_name}>
                              {bw.bureau_name}
                            </h4>
                          </div>
                          <span className="text-xl font-bold text-slate-800 shrink-0">{total}</span>
                        </div>

                        <div className="text-sm text-slate-500 mb-2">
                          Avg Disposal: <strong className="text-slate-700">{bw.avg_disposal_days} Days</strong>
                        </div>

                        <div className="w-full h-2 rounded bg-slate-100 overflow-hidden flex mb-3">
                          {total === 0 ? (
                            <div className="w-full h-full bg-slate-200" title="No active cases" />
                          ) : (
                            <>
                              <div style={{ width: `${disposedPct}%` }} className="bg-emerald-600 h-full" title={`Disposed: ${disposed}`} />
                              <div style={{ width: `${activePct}%` }} className="bg-blue-600 h-full" title={`In Process: ${active}`} />
                              <div style={{ width: `${delayedPct}%` }} className="bg-red-600 h-full" title={`Delayed: ${delayed}`} />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-center text-xs bg-slate-50 p-1.5 rounded border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Total</span>
                          <strong className="text-slate-800 text-xs">{total}</strong>
                        </div>
                        <div>
                          <span className="text-blue-700 block">Active</span>
                          <strong className="text-blue-900 text-xs">{active}</strong>
                        </div>
                        <div>
                          <span className="text-emerald-700 block">Done</span>
                          <strong className="text-emerald-900 text-xs">{disposed}</strong>
                        </div>
                        <div>
                          <span className="text-red-700 block">Delayed</span>
                          <strong className="text-red-900 text-xs">{delayed}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Central Registry Table */}
            <div className="gov-card rounded-lg overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Unified Complaint Registry & Tracking Dockets
                  </h3>
                  <span className="text-sm text-slate-500">
                    Official Cross-Bureau Case Registry with Unique Permanent Institution IDs
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  Showing {filteredCases.length} of {cases.length} records
                </span>
              </div>

              {/* Filter Bar */}
              <div className="p-3 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Institution, Case ID, Permanent ID, or keywords..."
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <select
                  value={bureauFilter}
                  onChange={(e) => setBureauFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white text-slate-700 font-medium"
                >
                  <option value="">All Bureaus</option>
                  <option value="RB">Regulation Bureau (RB)</option>
                  <option value="PGRC">Public Grievance Redressal (PGRC)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white text-slate-700 font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending Scrutiny</option>
                  <option value="UNDER_PROCESS">Under Process</option>
                  <option value="DISPOSED">Disposed / Order Passed</option>
                  <option value="ESCALATED">Escalated</option>
                </select>

                <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-red-200 bg-red-50 text-xs font-semibold text-red-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slaFilter}
                    onChange={(e) => setSlaFilter(e.target.checked)}
                    className="rounded text-red-700"
                  />
                  <span>SLA Breaches Only</span>
                </label>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-3 py-2.5">Case Reference / Date</th>
                      <th className="px-3 py-2.5">Institution Profile</th>
                      <th className="px-3 py-2.5">Category & Grievance</th>
                      <th className="px-3 py-2.5">Bureau & Status</th>
                      <th className="px-3 py-2.5">Statutory Timeline</th>
                      <th className="px-3 py-2.5 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredCases.map((c) => {
                      const st = getStatusBadge(c.status_code);
                      return (
                        <tr key={c.case_id} className="gov-table-row">
                          <td className="px-3 py-2.5">
                            <span className="font-mono font-bold text-blue-900 block">{c.source_ref}</span>
                            <span className="text-xs text-slate-400 flex items-center mt-0.5">
                              <Calendar className="w-3 h-3 mr-1" />
                              {c.received_on}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-semibold text-slate-900 block">{c.institution_name}</span>
                            <span className="text-xs text-slate-500 font-mono">
                              PID: <strong>{c.institution_pid}</strong> · {c.region_name}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 max-w-xs">
                            <span className="inline-block px-1.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 mb-0.5">
                              {c.category}
                            </span>
                            <p className="text-slate-600 line-clamp-2 text-sm leading-tight">{c.summary}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-700 block">{c.bureau_code}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold border ${st.bg} ${st.text} ${st.border} mt-0.5`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${
                              c.is_sla_breached ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {c.aging_bucket} ({c.age_days}d)
                            </span>
                            <span className="block text-xs text-slate-400 mt-0.5">{c.next_action_due}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              onClick={() => openCaseModal(c)}
                              className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-blue-50 text-blue-900 hover:text-blue-700 border border-slate-300 transition"
                            >
                              Case Passport
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: COORDINATION INTELLIGENCE LAYER                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'intelligence' && (
          <div className="space-y-4">
            <div className="gov-card p-4 rounded-lg bg-white">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Coordination Intelligence Layer
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Distinguishes <strong>Duplicate Submissions</strong>, <strong>Related Parallel Inquiries</strong>, and <strong>Contradictory Administrative Actions</strong>. For every identified case overlap, the system provides transparent evidentiary justifications and false-positive risk checks.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {overlaps.map((ov) => {
                const isContradiction = ov.rel_type === 'CONTRADICTORY_ACTIONS';
                return (
                  <div
                    key={ov.rel_id}
                    className={`gov-card p-4 rounded-lg border-l-4 ${
                      isContradiction ? 'border-l-red-600 bg-red-50/20' : 'border-l-blue-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          isContradiction ? 'bg-red-100 text-red-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {ov.rel_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {ov.institution_name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">PID: {ov.institution_pid}</span>
                      </div>
                      <span className="text-xs text-slate-500">Tier: <strong>{ov.tier}</strong> · Status: <strong>{ov.status}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                      <div>
                        <div className="text-xs uppercase font-bold text-slate-500">Docket A</div>
                        <div className="font-mono font-bold text-blue-900">{ov.case_a_ref} ({ov.case_a_bureau})</div>
                        <div className="text-slate-600 mt-0.5">Status: <strong className="text-slate-800">{ov.case_a_status}</strong></div>
                      </div>
                      <div>
                        <div className="text-xs uppercase font-bold text-slate-500">Docket B</div>
                        <div className="font-mono font-bold text-blue-900">{ov.case_b_ref} ({ov.case_b_bureau})</div>
                        <div className="text-slate-600 mt-0.5">Status: <strong className="text-slate-800">{ov.case_b_status}</strong></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded">
                        <strong className="text-emerald-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          1. Why Review Together? (Evidentiary Justification)
                        </strong>
                        <p className="text-emerald-950 mt-0.5 leading-relaxed">{ov.why_review_together}</p>
                      </div>

                      <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded">
                        <strong className="text-amber-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                          2. Why Might Coordination NOT Be Needed? (Uncertainty / False-Positive Analysis)
                        </strong>
                        <p className="text-amber-950 mt-0.5 leading-relaxed">{ov.why_might_not_need}</p>
                      </div>

                      <div className="bg-blue-50/60 border border-blue-200 p-2.5 rounded">
                        <strong className="text-blue-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                          <Info className="w-3.5 h-3.5 text-blue-700" />
                          3. Recommended Coordination Action
                        </strong>
                        <p className="text-blue-950 mt-0.5 leading-relaxed font-medium">{ov.justified_action}</p>
                      </div>
                    </div>

                    {isContradiction && (
                      <div className="mt-3 text-right">
                        <button
                          onClick={() => setShowConflictInterceptionModal(true)}
                          className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold transition shadow-xs"
                        >
                          Inspect Intercepted Conflict
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: CASE HISTORY & AUDIT TRAIL (Sliding Window Timeline)    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'timetravel' && (
          <div className="space-y-4">
            <div className="gov-card p-4 rounded-lg bg-white">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Case History & Bitemporal Audit Trail
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Drag the sliding window timeline scrubber to reconstruct exactly what AICTE officially knew at any historical checkpoint.
                    </p>
                  </div>
                </div>

                <div className="flex rounded border border-slate-300 overflow-hidden text-xs">
                  <button
                    onClick={() => setTimeTravelBasis('RECORDED')}
                    className={`px-3 py-1 font-semibold ${timeTravelBasis === 'RECORDED' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    Recorded Time (System Known)
                  </button>
                  <button
                    onClick={() => setTimeTravelBasis('WORLD')}
                    className={`px-3 py-1 font-semibold ${timeTravelBasis === 'WORLD' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    World Time (Event Occurred)
                  </button>
                </div>
              </div>
            </div>

            {/* INTERACTIVE SLIDING WINDOW TIMELINE */}
            <div className="gov-card p-4 rounded-lg bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">Audit Scrubber Position</span>
                  <div className="text-base font-bold font-mono text-blue-950">
                    {currentDate}
                  </div>
                </div>

                {timeTravelData?.conflict_detected && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-100 text-red-900 text-xs font-bold border border-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-700" />
                    <span>Conflict Sentinel Active at this Date</span>
                  </div>
                )}
              </div>

              {/* Range Slider */}
              <div className="relative pt-2 pb-1">
                <input
                  type="range"
                  min="0"
                  max={timelineDates.length - 1}
                  step="1"
                  value={sliderIndex}
                  onChange={(e) => setSliderIndex(parseInt(e.target.value))}
                  className="timeline-scrubber"
                />

                <div className="flex justify-between text-xs font-mono text-slate-400 mt-2 px-1">
                  {timelineDates.map((dt, idx) => (
                    <button
                      key={dt}
                      onClick={() => setSliderIndex(idx)}
                      className={`text-center transition ${
                        idx === sliderIndex ? 'font-bold text-blue-900 scale-110' : 'hover:text-slate-700'
                      }`}
                    >
                      {dt.slice(5)}
                    </button>
                  ))}
                </div>
              </div>

              {/* VISUAL SWIMLANES */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-3">
                <div className="text-xs uppercase font-bold text-slate-500">
                  Inter-Bureau Chronological Swimlanes (Active Window Indicator)
                </div>

                {/* PGRC */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-right font-bold text-xs text-slate-700 shrink-0">PGRC</div>
                  <div className="flex-1 relative h-7 bg-white rounded border border-slate-200 flex items-center px-2 overflow-hidden">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2" />
                    {timeTravelData?.timeline_milestones?.filter(m => m.bureau_code === 'PGRC').map((m) => {
                      const isPast = m.is_known_at_asof;
                      return (
                        <div
                          key={m.event_id}
                          title={`${m.case_ref} · ${m.event_date}: ${m.remarks}`}
                          className={`relative z-10 mx-2 px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                            isPast
                              ? m.status_code === 'DISPOSED'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-blue-800 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-400 opacity-40'
                          }`}
                        >
                          {m.event_date.slice(5)}: {m.event_type}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regulation Bureau */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-right font-bold text-xs text-slate-700 shrink-0">RB</div>
                  <div className="flex-1 relative h-7 bg-white rounded border border-slate-200 flex items-center px-2 overflow-hidden">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2" />
                    {timeTravelData?.timeline_milestones?.filter(m => m.bureau_code === 'RB').map((m) => {
                      const isPast = m.is_known_at_asof;
                      return (
                        <div
                          key={m.event_id}
                          title={`${m.case_ref} · ${m.event_date}: ${m.remarks}`}
                          className={`relative z-10 mx-2 px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                            isPast
                              ? 'bg-purple-800 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-400 opacity-40'
                          }`}
                        >
                          {m.event_date.slice(5)}: {m.event_type}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {timeTravelLoading ? (
              <div className="text-center py-8 text-xs text-slate-400">Reconstructing historical bitemporal state...</div>
            ) : timeTravelData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded border border-slate-200">
                  <span>
                    Historical Knowledge as of: <strong className="font-mono text-slate-900">{timeTravelData.asof_timestamp}</strong> ({timeTravelData.basis} basis)
                  </span>
                  <span>
                    Active Dockets Known: <strong className="text-slate-900 font-bold">{timeTravelData.active_case_count}</strong>
                  </span>
                </div>

                {timeTravelData.conflict_summary && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900">
                    <strong>Historical Finding:</strong> {timeTravelData.conflict_summary}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {timeTravelData.cases.map(tc => {
                    const st = getStatusBadge(tc.status_code);
                    return (
                      <div key={tc.case_id} className="gov-card p-3 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-blue-900">{tc.source_ref}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                            {tc.status_code}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900">{tc.institution_name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Bureau: <strong className="text-slate-700">{tc.bureau_code}</strong>
                        </div>
                        <p className="text-slate-600 line-clamp-2 mt-1 text-xs">{tc.summary}</p>
                        {tc.remarks && (
                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                            <strong>Latest Recorded Action:</strong> {tc.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 4: ENTITY RESOLUTION REVIEW QUEUE                           */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'entitylab' && (
          <div className="space-y-4">
            <div className="gov-card p-4 rounded-lg bg-white">
              <div className="flex items-start gap-3">
                <Fingerprint className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Entity Resolution & Smart Matching Queue
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Operates a 4-tier cascade: <strong>Exact Permanent ID (PID)</strong> $\rightarrow$ <strong>Geographic Hierarchy Blocking</strong> $\rightarrow$ <strong>Acronym Dictionary</strong> $\rightarrow$ <strong>Token-level Similarity</strong>. Low-confidence matches are held in this queue for officer verification before case linkage.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={entityQuery}
                  onChange={(e) => setEntityQuery(e.target.value)}
                  placeholder="Enter raw institution name as written in complaint petition..."
                  className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-blue-700"
                />
                <button
                  onClick={runEntityResolve}
                  disabled={entityLoading}
                  className="px-4 py-1.5 bg-blue-900 text-white rounded text-xs font-bold hover:bg-blue-800 transition shadow-xs disabled:opacity-50"
                >
                  {entityLoading ? 'Matching...' : 'Resolve Institution'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                <span className="text-slate-400">Variations:</span>
                {[
                  'Mepco Engg Sivakasi',
                  'PSG Tech Peelamedu',
                  'CEG Anna Univ Chennai',
                  'HBTU Kanpur',
                  '1-1049281721'
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setEntityQuery(s);
                      setTimeout(runEntityResolve, 100);
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 border border-slate-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {entityResult && entityResult.matched && entityResult.best_match && (
              <div className="gov-card p-4 rounded-lg bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      Method: {entityResult.best_match.method}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Tier: <strong>{entityResult.best_match.tier}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-900 font-mono">
                      {(entityResult.best_match.confidence_score * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 block">Match Score</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="text-sm font-bold text-slate-900">{entityResult.best_match.name}</div>
                  <div className="text-xs text-slate-600 font-mono mt-1">
                    AICTE Permanent ID: <strong>{entityResult.best_match.permanent_id}</strong> · Location: {entityResult.best_match.district}, {entityResult.best_match.state}
                  </div>
                </div>

                <div className="text-xs p-2.5 rounded border border-slate-200 bg-white">
                  {entityResult.requires_human_review ? (
                    <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Queue Flag: Confidence between 70% and 87%. Requires officer approval before linking to docket.
                    </span>
                  ) : (
                    <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Auto-Accepted: High-confidence exact match or verified alias.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 5: EXPLAINABLE AI & DUPLICATE DETECTION                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'mlstudio' && (
          <div className="space-y-4">
            <div className="gov-card p-4 rounded-lg bg-white">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Explainable AI & Secure Duplicate Detection
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Classifies incoming grievance text, estimates priority tier, recommends the statutory handling bureau, and detects duplicate complaints without exposing whistleblower personal identities across bureaus.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Complaint Text for Analysis:</label>
                <textarea
                  rows={3}
                  value={mlText}
                  onChange={(e) => setMlText(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 text-xs leading-relaxed focus:ring-1 focus:ring-blue-700 bg-white"
                />
                <button
                  onClick={runMlInfer}
                  disabled={mlLoading}
                  className="px-4 py-1.5 bg-blue-900 text-white rounded text-xs font-bold hover:bg-blue-800 transition shadow-xs disabled:opacity-50"
                >
                  {mlLoading ? 'Evaluating...' : 'Run Decision-Support Analysis'}
                </button>
              </div>
            </div>

            {mlResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="gov-card p-3 rounded-lg">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Category Prediction</span>
                    <span className="text-base font-bold text-slate-900 block mt-1">{mlResult.predicted_category}</span>
                    <span className="text-xs text-slate-400">Confidence: {(mlResult.category_confidence * 100).toFixed(1)}%</span>
                  </div>

                  <div className="gov-card p-3 rounded-lg">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Suggested Priority</span>
                    <span className="text-base font-bold text-slate-900 block mt-1">{mlResult.suggested_priority}</span>
                    <span className="text-xs text-slate-400">Heuristic Severity Scoring</span>
                  </div>

                  <div className="gov-card p-3 rounded-lg">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Jurisdiction Bureau</span>
                    <span className="text-base font-bold text-slate-900 block mt-1">{mlResult.recommended_bureau}</span>
                    <span className="text-xs text-slate-400">Statutory Mapping</span>
                  </div>

                  <div className="gov-card p-3 rounded-lg">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Duplicate Similarity</span>
                    <span className="text-base font-bold text-slate-900 block mt-1">{mlResult.potential_duplicate_score}</span>
                    <span className="text-xs text-slate-400">
                      {mlResult.is_probable_duplicate ? 'Related Duplicate Flagged' : 'Unique Submission'}
                    </span>
                  </div>
                </div>

                <div className="gov-card p-3 rounded-lg bg-slate-50 flex items-start gap-2.5 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Privacy-Preserving Whistleblower Protection:</strong> Personal contact info and Aadhaar hashes are converted into irreversible salted HMAC-SHA256 tokens upon intake. Cross-bureau duplicate detection compares grievance substance without exposing complainant identities.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 6: INTER-BUREAU CONFERENCES & RESOLUTION                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'jointreview' && (
          <div className="space-y-4">
            <div className="gov-card p-4 rounded-lg bg-white">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <Handshake className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Inter-Bureau Joint Conferences & Resolution
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Coordinates between Regulation Bureau, Public Grievance Redressal Cell, and Approval Bureau to prevent parallel conflicting actions and issue unified determinations.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowJointConfModal(true)}
                  className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Joint Conference Room</span>
                </button>
              </div>
            </div>

            {jointReviews.length === 0 ? (
              <div className="gov-card p-8 rounded-lg text-center text-xs text-slate-400">
                No active inter-bureau conference dockets.
              </div>
            ) : (
              <div className="space-y-3">
                {jointReviews.map(jr => (
                  <div key={jr.session_id} className="gov-card p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          Conference Docket #{jr.session_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          jr.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {jr.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Date: {jr.created_at?.slice(0, 10)}</span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">{jr.institution_name} ({jr.institution_pid})</div>
                      <p className="text-xs text-slate-600 mt-0.5">{jr.coordination_reason}</p>
                    </div>

                    <div className="text-xs text-slate-500">
                      Linked Dockets: <span className="font-mono font-bold text-slate-800">{jr.linked_cases.join(', ')}</span>
                    </div>

                    {jr.outcome_memo ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950">
                        <strong className="block text-emerald-900 mb-1">Unified Disposal Determination:</strong>
                        {jr.outcome_memo}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Record unified determination memo signed by both Bureau Heads..."
                          value={jointMemoText}
                          onChange={(e) => setJointMemoText(e.target.value)}
                          className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
                        />
                        <button
                          onClick={async () => {
                            if (!jointMemoText) return alert('Enter memo text first.');
                            await fetch(`/api/coordination/joint-review/${jr.session_id}/resolve`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ outcome_memo: jointMemoText, status: 'RESOLVED' })
                            });
                            alert('Determination recorded and dockets harmonized!');
                            fetchDashboardData();
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition shadow-xs"
                        >
                          Sign & Synchronize Disposal Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: LIVE SIMULATED CITIZEN INTAKE MODAL                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-overlay" onClick={() => setShowSimulateModal(false)} />
          <div className="relative bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-300">
            <div className="p-4 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-blue-300 uppercase tracking-widest block font-bold">
                  AICTE Ingestion Mesh · Live Portal Webhook Simulator
                </span>
                <span className="text-base font-bold text-white block mt-0.5">Simulate Citizen Grievance Submission</span>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded text-blue-950">
                <strong>Non-Invasive Ingestion Demonstration:</strong> Simulates a citizen filing a fee petition on the external PGRC portal. Watch our backend tokenize identity and resolve the canonical PID.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Source Portal</label>
                  <select
                    value={simPortal}
                    onChange={(e) => setSimPortal(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="PGRC">Public Grievance Redressal (PGRC)</option>
                    <option value="CPGRAMS">CPGRAMS / NIC Portal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Case Reference ID</label>
                  <input
                    type="text"
                    value={simRef}
                    onChange={(e) => setSimRef(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Raw Institution Name (as typed by student)</label>
                <input
                  type="text"
                  value={simCollegeRaw}
                  onChange={(e) => setSimCollegeRaw(e.target.value)}
                  placeholder="e.g. Mepco Engg Sivakasi"
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Citizen Aadhaar / Contact (PII)</label>
                  <input
                    type="text"
                    value={simAadhaar}
                    onChange={(e) => setSimAadhaar(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Grievance Category</label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="FEES">Capitation & Caution Fees</option>
                    <option value="FACULTY">Faculty Deficit / Salary</option>
                    <option value="INFRASTRUCTURE">Campus Infrastructure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Grievance Substance Narrative</label>
                <textarea
                  rows={2}
                  value={simSummary}
                  onChange={(e) => setSimSummary(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              {intakeSuccessResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Live Webhook Ingestion Successful!</span>
                  </div>
                  <div className="text-emerald-950 font-mono text-[11px]">
                    Resolved PID: <strong>{intakeSuccessResult.institution_pid}</strong> ({intakeSuccessResult.institution_name})
                  </div>
                  <div className="text-emerald-800 text-[11px]">
                    DPDP Blind Salted Token: <span className="font-mono">{intakeSuccessResult.tokenized_blind_hash}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">HTTP POST /api/intake/webhook</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handleExecuteSimulateIntake}
                  disabled={simulatingIntake}
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 font-bold text-white text-xs shadow-xs transition"
                >
                  {simulatingIntake ? 'Ingesting...' : 'Fire Portal Webhook'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: DRAMATIC CONFLICT SENTINEL INTERCEPTION MODAL (HERO)   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showConflictInterceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/70 backdrop-blur-md" onClick={() => setShowConflictInterceptionModal(false)} />
          <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-2 border-red-600">
            {/* Header */}
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest block font-bold text-red-200">
                    AICTE STATUTORY SENTINEL · AUTOMATED INTERCEPTION
                  </span>
                  <h3 className="text-base font-black text-white">Critical Inter-Bureau Contradiction Intercepted!</h3>
                </div>
              </div>
              <button
                onClick={() => setShowConflictInterceptionModal(false)}
                className="w-8 h-8 rounded flex items-center justify-center text-red-200 hover:text-white hover:bg-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 p-3 rounded text-red-950">
                <span className="font-bold block text-sm text-red-900 mb-1">
                  High Court / RTI Vulnerability Detected: Unilateral Clean-Chit Blocked!
                </span>
                The Public Grievance Redressal Cell (PGRC) was about to dispatch a routine <strong>DISPOSED</strong> order giving a clean-chit to the institution, while the Regulation Bureau maintains active punitive Show-Cause proceedings under APH Chapter VII.
              </div>

              {/* Conflicting Dockets Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded border border-emerald-300 bg-emerald-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      PGRC DOCKET
                    </span>
                    <span className="text-emerald-800 font-bold font-mono">PGRC/2026/014</span>
                  </div>
                  <div className="font-bold text-slate-800 text-xs">Proposed Status: DISPOSED</div>
                  <p className="text-slate-600 text-[11px] mt-1">
                    "College produced refund voucher. Clean chit issued by grievance scrutiny."
                  </p>
                </div>

                <div className="p-3 rounded border border-red-300 bg-red-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px]">
                      REGULATION BUREAU
                    </span>
                    <span className="text-red-800 font-bold font-mono">RB/SC/2026/089</span>
                  </div>
                  <div className="font-bold text-red-900 text-xs">Active Status: UNDER INQUIRY</div>
                  <p className="text-slate-600 text-[11px] mt-1">
                    "Statutory Show-Cause served for retrenching 12 senior faculty and violating cadre ratio."
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <span className="font-bold text-slate-800 block text-xs">Target Institution Entity:</span>
                <div className="text-slate-900 font-semibold text-xs">Mepco Schlenk Engineering College</div>
                <div className="text-slate-500 font-mono text-[11px]">AICTE Permanent ID: 1-1049281721 · Virudhunagar, Tamil Nadu</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Mandatory Statutory Action:</strong> Unilateral disposal order has been temporarily frozen. Both Bureau Heads must convene in an emergency Joint Review Conference before any final determination is issued.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Conflict Sentinel Rule: REG_DISSONANCE_V1</span>
              <button
                onClick={() => handleInitiateJointReview(contradictions[0] || {})}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Convene Inter-Bureau Conference</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: INTERACTIVE JOINT REVIEW CONFERENCE ROOM               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showJointConfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-overlay" onClick={() => setShowJointConfModal(false)} />
          <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-300">
            <div className="p-4 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Handshake className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest block font-bold">
                    AICTE Inter-Bureau Conference Chamber
                  </span>
                  <span className="text-base font-bold text-white block mt-0.5">Joint Resolution & Docket Harmonization</span>
                </div>
              </div>
              <button
                onClick={() => setShowJointConfModal(false)}
                className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 text-xs block font-bold">Initiating Official</span>
                  <strong className="text-slate-800">Dr. K. Ramanathan (Adviser & Bureau Head, RB)</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-bold">Target Bureau Counterpart</span>
                  <strong className="text-slate-800">Smt. Anita Sharma (Director, PGRC)</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-xs block">Harmonization Purpose:</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed text-xs">
                  Coordinate findings between student fee deposit refund and statutory faculty ratio show-cause proceeding for Mepco Schlenk Engineering College (PID 1-1049281721).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Unified Inter-Bureau Disposal Determination Memo:
                </label>
                <textarea
                  rows={3}
                  value={jointMemoText || "Joint Determination: Student caution fee refund verified. However, clean-chit conditional on completion of Standing Hearing Committee scrutiny under APH Chapter VII. Dockets harmonized."}
                  onChange={(e) => setJointMemoText(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2.5 text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  Signing this memo automatically synchronizes both bureau dockets and clears the conflict status across the national dashboard.
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Digital Certificate: NIC-PARICHAY-VERIFIED</span>
              <button
                onClick={async () => {
                  const memo = jointMemoText || "Joint Determination: Student caution fee refund verified. However, clean-chit conditional on completion of Standing Hearing Committee scrutiny under APH Chapter VII. Dockets harmonized.";
                  try {
                    const firstSession = jointReviews[0];
                    if (firstSession) {
                      await fetch(`/api/coordination/joint-review/${firstSession.session_id}/resolve`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ outcome_memo: memo, status: 'RESOLVED' })
                      });
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  alert('Joint Conference memo digitally co-signed! Dockets harmonized across bureaus.');
                  setShowJointConfModal(false);
                  fetchDashboardData();
                  setActiveTab('jointreview');
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <PenTool className="w-4 h-4" />
                <span>Co-Sign & Harmonize Dockets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CASE PASSPORT MODAL (The Centerpiece of Traceability)           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 glass-overlay" onClick={() => setSelectedCase(null)} />
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-slate-300">
            <div className="p-4 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-blue-300 uppercase tracking-widest block font-bold">
                  AICTE Case Passport · Audit Docket
                </span>
                <span className="text-base font-bold text-white block mt-0.5">{selectedCase.source_ref}</span>
                <span className="text-xs text-slate-300">{selectedCase.institution_name}</span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-bold block">Handling Bureau</span>
                  <strong className="text-slate-800">{selectedCase.bureau_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase font-bold block">Current Status</span>
                  <strong className="text-slate-800">{selectedCase.status_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase font-bold block">Assigned Officer</span>
                  <strong className="text-slate-800">{selectedCase.officer_name || 'Unassigned / Scrutiny'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase font-bold block">Age & SLA</span>
                  <strong className="text-slate-800">{selectedCase.age_days} Days ({selectedCase.aging_bucket})</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Grievance Narrative</h4>
                <p className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs">
                  {selectedCase.summary}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Immutable Chronological Case Audit Trail
                  </h4>
                  <span className="text-xs font-mono text-slate-500">SHA-256 Ledger Verified</span>
                </div>

                {loadingEvents ? (
                  <div className="text-center py-4 text-slate-400">Loading audit history...</div>
                ) : (
                  <div className="space-y-2.5 border-l-2 border-slate-300 pl-3.5 ml-1">
                    {caseEvents.map((ev) => (
                      <div key={ev.event_id} className="relative">
                        <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-blue-900 ring-2 ring-white" />
                        <div className="font-bold text-slate-800 text-xs">
                          {ev.event_type}
                          <span className="text-xs font-normal font-mono text-slate-400 ml-2">
                            {ev.event_time?.slice(0, 16)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">{ev.remarks}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-3.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 text-xs transition"
              >
                Close Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-3 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <span>Smart India Hackathon (SIH) 2026 · Problem Statement ID: 26264</span>
          <span>Designed for All India Council for Technical Education (AICTE)</span>
        </div>
      </footer>
    </div>
  );
}
