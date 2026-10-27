import React, { useState } from 'react';
import { 
  Building, CheckCircle2, AlertTriangle, Clock, ShieldAlert, 
  FileCheck2, FileWarning, ArrowUpRight, TrendingUp, Users,
  MapPin, ChevronRight, Activity, X, RotateCw, Send, Eye, ShieldCheck, ArrowRight
} from 'lucide-react';
import { REGIONS } from '../data/regulatoryData';

export function DashboardOverview({ 
  applications, 
  undertakings, 
  documents, 
  evcVisits, 
  onSelectTab,
  onSelectApp 
}) {
  // Drill-down Modal State
  const [activeDrilldown, setActiveDrilldown] = useState(null); 
  // 'ACTIVE_APPS', 'SLA_OVERDUE', 'EVC_INSPECTIONS', 'UNDERTAKINGS', 'LEASE_RADAR', 'REGIONAL_MATRIX', 'AGEING_CASES'

  // Aggregate KPIs
  const totalApps = applications.length;
  const inScrutiny = applications.filter(a => a.currentStage.includes('Scrutiny')).length;
  const inEVC = applications.filter(a => a.currentStage.includes('EVC')).length;
  const inApproval = applications.filter(a => a.currentStage.includes('Approval') || a.currentStage.includes('Hearing')).length;
  
  // Overdue & Breached SLAs
  const overdueApps = applications.filter(a => a.daysInCurrentStage >= a.slaDays);
  const criticalDocs = documents.filter(d => d.daysToExpiry <= 30);
  const overdueUndertakings = undertakings.filter(u => u.daysRemaining < 0);
  const overdueEVCs = evcVisits.filter(e => e.status.includes('Overdue'));

  return (
    <div className="space-y-6 w-full">
      
      {/* Official Government Executive Banner */}
      <div className="bg-[#0f2942] text-white rounded-xl p-6 sm:p-7 border border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-600">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              AICTE National Regulatory Processing Grid • Real-Time Synchronization Active
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Institutional Approval, Compliance & Pendency Cockpit
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Real-time executive oversight across all 10 Regional Offices. Select any metric or jurisdiction below to inspect detailed records, audit histories, and take immediate regulatory action.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSelectTab('applications')}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#0f2942] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Application Pipeline</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveDrilldown('SLA_OVERDUE')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>SLA Overdue ({overdueApps.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 ABSTRACT CLICKABLE METRIC TILES (Click to display details) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Active Pipeline */}
        <div 
          onClick={() => setActiveDrilldown('ACTIVE_APPS')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#0f2942] transition cursor-pointer group"
          title="Click to display detailed applications"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0f2942]">Active Pipeline</span>
            <Building className="w-4 h-4 text-slate-500 group-hover:text-[#0f2942]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalApps}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{inScrutiny} Scrutiny • {inEVC} EVC</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* 2. SLA Overdue */}
        <div 
          onClick={() => setActiveDrilldown('SLA_OVERDUE')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-red-300 shadow-xs hover:border-red-500 transition cursor-pointer group bg-red-50/20"
          title="Click to inspect overdue SLA cases"
        >
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-bold">SLA Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-700" />
          </div>
          <div className="text-3xl font-extrabold text-red-700">{overdueApps.length}</div>
          <div className="text-[11px] text-red-800 font-medium mt-1 flex items-center justify-between">
            <span>Action Required</span>
            <ChevronRight className="w-3.5 h-3.5 text-red-600 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* 3. EVC Inspections */}
        <div 
          onClick={() => setActiveDrilldown('EVC_INSPECTIONS')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#0f2942] transition cursor-pointer group"
          title="Click to view scheduled EVC inspections"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0f2942]">EVC Inspections</span>
            <Users className="w-4 h-4 text-slate-500 group-hover:text-[#0f2942]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{evcVisits.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{overdueEVCs.length > 0 ? `${overdueEVCs.length} Overdue` : 'On Schedule'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* 4. Undertakings */}
        <div 
          onClick={() => setActiveDrilldown('UNDERTAKINGS')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#0f2942] transition cursor-pointer group"
          title="Click to inspect time-bound undertakings"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0f2942]">Undertakings</span>
            <FileCheck2 className="w-4 h-4 text-slate-500 group-hover:text-[#0f2942]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{undertakings.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{overdueUndertakings.length > 0 ? `${overdueUndertakings.length} Overdue` : 'Active Locks'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* 5. Lease Radar */}
        <div 
          onClick={() => setActiveDrilldown('LEASE_RADAR')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#0f2942] transition cursor-pointer group"
          title="Click to view land lease expiry radar"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0f2942]">Lease Radar</span>
            <FileWarning className="w-4 h-4 text-slate-500 group-hover:text-[#0f2942]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{criticalDocs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Expiring &le;30d</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* 6. Processing Turnaround */}
        <div 
          onClick={() => setActiveDrilldown('AGEING_CASES')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-[#0f2942] transition cursor-pointer group"
          title="Click to view stage ageing velocity"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0f2942]">Avg Turnaround</span>
            <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-[#0f2942]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">11.2d</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Limit: 14.0d</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

      </div>

      {/* ABSTRACT REGIONAL JURISDICTIONS & STAGE AGEING (Clean, high-level summary cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Abstract Regional Clusters */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-700" />
                Regional Jurisdictions Executive Summary
              </h3>
              <p className="text-xs text-slate-500">
                Workload distribution across 10 Regional Offices. Click any regional sector to inspect full case details.
              </p>
            </div>
            <button
              onClick={() => setActiveDrilldown('REGIONAL_MATRIX')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#0f2942] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All 10 Offices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Summary Regional Sector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <div 
              onClick={() => setActiveDrilldown('REGIONAL_MATRIX')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Northern & North-Western</span>
                <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">NRO • NWRO</span>
              </div>
              <div className="text-xl font-bold text-slate-800">631 Total Cases</div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <span>In Scrutiny: <strong>79</strong></span>
                <span className="text-red-700 font-semibold">9 Overdue (&gt;14d)</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrilldown('REGIONAL_MATRIX')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Western & Central</span>
                <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">WRO • CRO</span>
              </div>
              <div className="text-xl font-bold text-slate-800">822 Total Cases</div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <span>In Scrutiny: <strong>111</strong></span>
                <span className="text-red-700 font-semibold">15 Overdue (&gt;14d)</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrilldown('REGIONAL_MATRIX')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Southern & South-Western</span>
                <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">SRO • SWRO</span>
              </div>
              <div className="text-xl font-bold text-slate-800">1,100 Total Cases</div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <span>In Scrutiny: <strong>140</strong></span>
                <span className="text-red-700 font-semibold">16 Overdue (&gt;14d)</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveDrilldown('REGIONAL_MATRIX')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Eastern & South-Central</span>
                <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">ERO • SCRO</span>
              </div>
              <div className="text-xl font-bold text-slate-800">765 Total Cases</div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <span>In Scrutiny: <strong>105</strong></span>
                <span className="text-red-700 font-semibold">13 Overdue (&gt;14d)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Stage Ageing & Immediate Priorities */}
        <div className="space-y-4">
          
          {/* Abstract Ageing Card */}
          <div 
            onClick={() => setActiveDrilldown('AGEING_CASES')}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-400 transition cursor-pointer space-y-3.5 group"
            title="Click to inspect stage ageing bottlenecks"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-700" />
                Processing Ageing Spectrum
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">14D MAX SLA</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 font-medium">Within SLA (&lt; 7 Days)</span>
                  <span className="font-bold text-slate-800">68% Healthy</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 font-medium">Nearing Threshold (7-14 Days)</span>
                  <span className="font-bold text-slate-800">22% Warning</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 font-medium">Breached SLA (&gt; 14 Days)</span>
                  <span className="font-bold text-red-700">10% Overdue</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Click to view detailed stage queues</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
          </div>

          {/* Priority Alert Box */}
          <div 
            onClick={() => setActiveDrilldown('SLA_OVERDUE')}
            className="bg-white rounded-xl p-5 border border-red-200 shadow-xs hover:border-red-400 transition cursor-pointer space-y-2.5 bg-red-50/20 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                Immediate Action Queue
              </h3>
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                {overdueApps.length} Cases
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Applications requiring executive intervention or committee standby reallocation under APH Chapter II.
            </p>

            <div className="pt-1 text-[11px] text-red-700 font-semibold flex items-center justify-between">
              <span>Inspect & Reassign Cases</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE DRILL-DOWN MODALS (Everything displays upon clicking) */}
      {/* ========================================================================= */}

      {/* 1. Modal: Active Pipeline Applications */}
      {activeDrilldown === 'ACTIVE_APPS' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Active Applications Pipeline ({applications.length})</h3>
                <p className="text-xs text-slate-300">Select any case to open full scrutiny and approval docket</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto divide-y divide-slate-100 text-xs space-y-1">
              {applications.map((app) => (
                <div 
                  key={app.id}
                  onClick={() => {
                    setActiveDrilldown(null);
                    onSelectApp(app);
                    onSelectTab('applications');
                  }}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer p-2 rounded transition"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{app.instName}</span>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{app.id}</span>
                      <span>•</span>
                      <span>Stage: <strong className="text-slate-800">{app.currentStage}</strong></span>
                      <span>•</span>
                      <span>{app.region} Region</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-semibold">{app.daysInCurrentStage}d / {app.slaDays}d SLA</span>
                    <button className="px-3 py-1 bg-slate-100 text-slate-800 font-semibold rounded hover:bg-[#0f2942] hover:text-white transition">
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: SLA Overdue Cases */}
      {activeDrilldown === 'SLA_OVERDUE' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  SLA Breached Applications ({overdueApps.length})
                </h3>
                <p className="text-xs text-slate-300">Cases exceeding prescribed turnaround limits requiring reallocation or intervention</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {overdueApps.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-red-200 bg-red-50/20 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm">{app.instName}</span>
                    <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded text-[11px]">
                      {app.daysInCurrentStage} Days at Stage (SLA: {app.slaDays}d)
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Stagnant at: <strong className="text-slate-800">"{app.currentStage}"</strong> • Assigned: <strong>{app.assignedTo}</strong>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setActiveDrilldown(null);
                        onSelectApp(app);
                        onSelectTab('applications');
                      }}
                      className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded text-xs font-semibold transition"
                    >
                      Open Case Actions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: EVC Inspections */}
      {activeDrilldown === 'EVC_INSPECTIONS' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Expert Visit Committee (EVC) Schedule</h3>
                <p className="text-xs text-slate-300">Active campus physical inspection allocations</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {evcVisits.map((visit) => (
                <div key={visit.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{visit.instName}</div>
                      <div className="text-slate-500 text-[11px]">{visit.purpose}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[11px]">
                      {visit.status}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Panel: {visit.committeeMembers.map(m => m.name).join(', ') || 'Pending Allocation'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Undertakings */}
      {activeDrilldown === 'UNDERTAKINGS' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Conditional Approval Undertakings</h3>
                <p className="text-xs text-slate-300">Tracking prescribed conditions and compliance countdown locks</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {undertakings.map((ut) => (
                <div key={ut.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-sm">{ut.instName}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${ut.daysRemaining < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-800'}`}>
                      {ut.daysRemaining < 0 ? `Overdue by ${Math.abs(ut.daysRemaining)}d` : `${ut.daysRemaining} Days Left`}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-800">
                    {ut.condition}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Prescribed: {ut.prescribedDate} • Due Date: {ut.dueDate} • Status: <strong>{ut.status}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Lease Radar */}
      {activeDrilldown === 'LEASE_RADAR' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Prescribed Land Lease Expiry Radar</h3>
                <p className="text-xs text-slate-300">Tracking registered land lease deeds and fire safety NOC validity</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {criticalDocs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 text-sm">{doc.instName}</span>
                    <span className="text-red-700 font-bold text-[11px] bg-red-100 px-2 py-0.5 rounded">
                      Expiry: {doc.expiryDate} ({doc.daysToExpiry}d left)
                    </span>
                  </div>
                  <div className="text-slate-700 font-semibold">{doc.docType} ({doc.regNumber})</div>
                  <div className="text-[11px] text-slate-500">
                    Sub-Registrar: {doc.subRegistrar} • Notices Dispatched: {doc.noticesSent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Detailed 10-Region Jurisdiction Matrix */}
      {activeDrilldown === 'REGIONAL_MATRIX' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">All 10 Regional Offices - Complete Pendency Matrix</h3>
                <p className="text-xs text-slate-300">Live operational data and jurisdictional coverage</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Regional Office</th>
                    <th className="py-2.5 px-3">Headquarters & States</th>
                    <th className="py-2.5 px-3 text-center">Active Cases</th>
                    <th className="py-2.5 px-3 text-center">In Scrutiny</th>
                    <th className="py-2.5 px-3 text-center">Overdue (&gt;14d)</th>
                    <th className="py-2.5 px-3 text-right">Jurisdiction Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {REGIONS.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{reg.id}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <strong>{reg.hq}</strong> — <span className="text-slate-500">{reg.states}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{reg.active}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{reg.pending}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-700">{reg.overdue}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{reg.overdue > 6 ? 'Attention Required' : 'Within Limits'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Stage Ageing Breakdown */}
      {activeDrilldown === 'AGEING_CASES' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-300">
            <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Stage Turnaround & Ageing Analysis</h3>
                <p className="text-xs text-slate-300">Compliance turnaround metrics across approval stages</p>
              </div>
              <button onClick={() => setActiveDrilldown(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Stage Turnaround Velocity Rules (APH 2026-27):</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li><strong>Preliminary Scrutiny:</strong> Maximum 7 Days SLA.</li>
                  <li><strong>Technical Scrutiny Committee:</strong> Maximum 14 Days SLA.</li>
                  <li><strong>EVC Scheduling & Report Submission:</strong> Maximum 10 Days SLA.</li>
                  <li><strong>Competent Authority Decision:</strong> Maximum 7 Days SLA.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
