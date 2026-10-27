import React, { useState } from 'react';
import { 
  Search, Filter, CheckCircle2, Clock, AlertTriangle, 
  ArrowRight, ShieldCheck, FileText, Building2, MapPin, 
  ChevronRight, X, AlertCircle, RotateCcw, Send, CheckSquare,
  Calendar, Layers, Eye
} from 'lucide-react';
import { WORKFLOW_TRACKS } from '../data/regulatoryData';
import { OfficialLoAModal } from './OfficialLoAModal';

export function ApplicationsWorkflow({ 
  applications, 
  onUpdateApplication, 
  activeRole,
  selectedApp,
  setSelectedApp,
  onNavigateToStep
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [loaModalOpen, setLoaModalOpen] = useState(false);
  
  // Modal Action Form States
  const [actionForm, setActionForm] = useState(null); // 'ADVANCE', 'DEFICIENCY', 'CONDITIONAL'
  const [deficiencyReason, setDeficiencyReason] = useState('');
  const [checklist, setChecklist] = useState({
    landNorms: true,
    builtUpArea: true,
    cadreRatio: true,
    fireNoc: true,
    barrierFree: true
  });
  const [undertakingDays, setUndertakingDays] = useState(60);
  const [undertakingText, setUndertakingText] = useState('Procure specialized laboratory workstations within 60 days');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.instName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.pid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'ALL' || app.track === selectedTrack;
    const matchesRegion = selectedRegion === 'ALL' || app.region === selectedRegion;
    return matchesSearch && matchesTrack && matchesRegion;
  });

  // Handle stage advancement according to strict sequential APH pipeline
  const handleAdvanceStage = (app) => {
    const trackObj = WORKFLOW_TRACKS.find(t => t.id === app.track);
    const currentIdx = trackObj.stages.indexOf(app.currentStage);
    
    if (currentIdx < trackObj.stages.length - 1) {
      const nextStage = trackObj.stages[currentIdx + 1];
      const isFinal = nextStage.includes('Approval') || nextStage.includes('Issued');
      
      const updatedApp = {
        ...app,
        currentStage: nextStage,
        daysInCurrentStage: 0,
        status: isFinal ? 'Approved' : 'In Progress',
        history: [
          ...app.history,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            stage: nextStage,
            actor: activeRole,
            remark: `Stage verified & promoted to "${nextStage}". Checklist confirmed.`
          }
        ]
      };
      onUpdateApplication(updatedApp);
      setSelectedApp(updatedApp);
      setActionSuccessMsg(`Case successfully advanced to next prescribed stage: "${nextStage}".`);
      setTimeout(() => setActionSuccessMsg(''), 4500);
      setActionForm(null);
    }
  };

  // Handle deficiency return
  const handleRevertApplication = (app) => {
    if (!deficiencyReason.trim()) {
      alert('Mandatory Regulation: Please enter the exact deficiency reason referencing APH norms.');
      return;
    }
    const updatedApp = {
      ...app,
      status: 'Deficiency Action Required',
      deficiencies: [...app.deficiencies, deficiencyReason],
      history: [
        ...app.history,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          stage: app.currentStage,
          actor: activeRole,
          remark: `DEFICIENCY NOTICE: ${deficiencyReason}`
        }
      ]
    };
    onUpdateApplication(updatedApp);
    setSelectedApp(updatedApp);
    setActionSuccessMsg('Deficiency notice issued to institution. Case queued for compliance rectification.');
    setDeficiencyReason('');
    setTimeout(() => setActionSuccessMsg(''), 4500);
    setActionForm(null);
  };

  // Handle granting conditional approval (Competent Authority only)
  const handleGrantConditionalApproval = (app) => {
    const updatedApp = {
      ...app,
      currentStage: 'Conditional Approval Granted',
      status: 'Provisional Approval (Under Undertaking)',
      undertakingRequired: true,
      undertakingDetails: {
        type: undertakingText,
        dueDate: new Date(Date.now() + undertakingDays * 86400000).toISOString().substring(0, 10),
        status: 'Active (Provisional Lock)',
        penaltyNoticeReady: false
      },
      history: [
        ...app.history,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          stage: 'Conditional Approval Granted',
          actor: 'Member Secretary / Competent Authority',
          remark: `CONDITIONAL APPROVAL: Granted under ${undertakingDays}-day undertaking compliance lock.`
        }
      ]
    };
    onUpdateApplication(updatedApp);
    setSelectedApp(updatedApp);
    setActionSuccessMsg(`Provisional approval granted subject to ${undertakingDays}-day compliance countdown.`);
    setTimeout(() => setActionSuccessMsg(''), 4500);
    setActionForm(null);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              APH Approval Applications Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              End-to-end multi-track routing covering Scrutiny, EVC inspections, and Competent Authority approvals
            </p>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Total Pipeline: <strong className="text-slate-900">{filteredApps.length} Applications</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Institution, Application ID, or Permanent ID (PID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium"
            >
              <option value="ALL">All APH Tracks</option>
              <option value="SCRUTINY_ONLY">Track A: Only Scrutiny (EoA)</option>
              <option value="SCRUTINY_EVC">Track B: Scrutiny + EVC (New Campus)</option>
              <option value="EVC_SAC_SHC">Track C: EVC + SAC/SHC (Appeals)</option>
              <option value="ONLY_EVC">Track D: Surprise / Focused EVC</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium"
            >
              <option value="ALL">All Regions (National)</option>
              <option value="NRO">Northern (Kanpur)</option>
              <option value="NWRO">North Western (Chandigarh)</option>
              <option value="WRO">Western (Mumbai)</option>
              <option value="SRO">Southern (Chennai)</option>
              <option value="SWRO">South Western (Bengaluru)</option>
              <option value="CRO">Central (Bhopal)</option>
              <option value="ERO">Eastern (Kolkata)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f2942] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Application ID & Institution</th>
                <th className="py-3 px-3">APH Track</th>
                <th className="py-3 px-3">Processing Stage</th>
                <th className="py-3 px-3 text-center">Stage Ageing / SLA</th>
                <th className="py-3 px-3">Assigned Desk</th>
                <th className="py-3 px-3 text-center">Compliance Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredApps.map((app) => {
                const isOverdue = app.daysInCurrentStage >= app.slaDays;

                return (
                  <tr 
                    key={app.id} 
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.instName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.2 rounded">{app.id}</span>
                        <span>•</span>
                        <span>PID: {app.pid}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{app.region}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {app.track.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{app.currentStage}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px]">{app.subStage}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] inline-flex items-center gap-1 ${
                        isOverdue 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {app.daysInCurrentStage}d / {app.slaDays}d SLA
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <div className="text-[11px]">{app.assignedTo}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {app.deficiencies.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold">
                          {app.deficiencies.length} Deficiencies
                        </span>
                      ) : app.status === 'Approved' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          In Order
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-[#0f2942] hover:text-white text-slate-700 rounded text-xs font-semibold transition"
                      >
                        Inspect
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage-Gated Sequential Detail & Action Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            
            {/* Header */}
            <div className="bg-[#0f2942] text-white p-4 sm:p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-100 rounded text-[10px] font-bold">
                    {selectedApp.track.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300 text-xs">PID: {selectedApp.pid}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 text-xs">{selectedApp.region} Regional Office</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">{selectedApp.instName}</h3>
                <p className="text-xs text-slate-300">{selectedApp.type}</p>
              </div>

              <button 
                onClick={() => {
                  setSelectedApp(null);
                  setActionForm(null);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>{actionSuccessMsg}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeRole === 'SCRUTINY_EXPERT' && onNavigateToStep && (
                      <button
                        onClick={() => {
                          setSelectedApp(null);
                          onNavigateToStep('EVC_COORDINATOR');
                        }}
                        className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                      >
                        <span>Proceed to Step 3: EVC Inspection</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {(selectedApp.status.includes('Approved') || selectedApp.undertakingRequired) && (
                      <button
                        onClick={() => setLoaModalOpen(true)}
                        className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Official AICTE Order (LoA)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Strict Sequential Stepper */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Workflow Route Execution (APH Regulations 2026-27):
                </div>
                {(() => {
                  const trackObj = WORKFLOW_TRACKS.find(t => t.id === selectedApp.track);
                  const currentIdx = trackObj.stages.indexOf(selectedApp.currentStage);

                  return (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {trackObj.stages.map((stageName, idx) => {
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <React.Fragment key={stageName}>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-semibold ${
                              isCurrent ? 'bg-[#0f2942] text-white border-[#0f2942]' :
                              isPast ? 'bg-slate-100 text-slate-800 border-slate-300' :
                              'bg-white text-slate-400 border-slate-200'
                            }`}>
                              {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />}
                              {isCurrent && <Clock className="w-3.5 h-3.5 text-white" />}
                              <span>{stageName}</span>
                            </div>
                            {idx < trackObj.stages.length - 1 && (
                              <ChevronRight className="w-3 h-3 text-slate-300" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Land Area & Built-Up Norm</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">{selectedApp.landAreaAcres} Acres ({selectedApp.builtUpAreaSqM} sq.m)</div>
                  <div className="text-[11px] text-slate-600">Prescribed: 5.0 Acres (Met)</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Land Lease Expiry</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">{selectedApp.leaseValidUntil}</div>
                  <div className="text-[11px] text-slate-600">Registered Sub-Registrar Deed</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Stage Ageing / SLA</span>
                  <div className={`text-xs font-bold mt-1 ${selectedApp.daysInCurrentStage >= selectedApp.slaDays ? 'text-red-700' : 'text-slate-900'}`}>
                    {selectedApp.daysInCurrentStage} Days (SLA Limit: {selectedApp.slaDays} Days)
                  </div>
                  <div className="text-[11px] text-slate-600">Assigned: {selectedApp.assignedTo}</div>
                </div>
              </div>

              {/* Deficiencies Alert */}
              {selectedApp.deficiencies.length > 0 && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1">
                  <div className="font-bold text-red-950 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-700" />
                    Recorded Deficiencies:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-red-900 text-xs">
                    {selectedApp.deficiencies.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* STRICT STAGE-GATED ACTION DESK */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    Authorized Action for Stage: "{selectedApp.currentStage}"
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Logged as: {activeRole}</span>
                </div>

                {/* Conditional Actions strictly based on CURRENT stage */}
                {(() => {
                  const stage = selectedApp.currentStage;

                  // 1. STAGE: SCRUTINY
                  if (stage.includes('Scrutiny') || stage.includes('Preliminary')) {
                    return (
                      <div className="space-y-3">
                        <div className="text-[11px] text-slate-600">
                          As Scrutiny Authority, verify statutory checklists. If compliant, promote to EVC queue. If deficient, record regulatory reason to revert.
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setActionForm(actionForm === 'ADVANCE' ? null : 'ADVANCE')}
                            className="px-3.5 py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify Checklist & Clear Stage</span>
                          </button>

                          <button
                            onClick={() => setActionForm(actionForm === 'DEFICIENCY' ? null : 'DEFICIENCY')}
                            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Record Deficiency & Return to Institute</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 2. STAGE: EVC SCHEDULING & INSPECTION
                  if (stage.includes('EVC')) {
                    return (
                      <div className="space-y-3">
                        <div className="text-[11px] text-slate-600">
                          Application is in the Expert Visit Committee (EVC) queue. Physical inspection and 3-member joint report submission required.
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setActionForm(actionForm === 'ADVANCE' ? null : 'ADVANCE')}
                            className="px-3.5 py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Affix 3-Member Signatures & Transmit EVC Report</span>
                          </button>

                          <button
                            onClick={() => setActionForm(actionForm === 'DEFICIENCY' ? null : 'DEFICIENCY')}
                            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Record Adverse Infrastructure Deficiency</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 3. STAGE: COMPETENT AUTHORITY / SAC / SHC (FINAL DECISION)
                  if (stage.includes('Competent Authority') || stage.includes('Standing Hearing') || stage.includes('SAC')) {
                    return (
                      <div className="space-y-3">
                        <div className="text-[11px] text-slate-600">
                          Final statutory decision stage. Competent Authority may grant full approval, or conditional approval subject to an undertaking countdown lock.
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAdvanceStage(selectedApp)}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Grant Final Regulatory Approval (Issue EoA)</span>
                          </button>

                          <button
                            onClick={() => setActionForm(actionForm === 'CONDITIONAL' ? null : 'CONDITIONAL')}
                            className="px-3.5 py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Grant Conditional Approval (Lock with Undertaking)</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 4. APPROVED / COMPLETED OR CONDITIONAL APPROVAL
                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Regulatory Clearance Granted under APH 2026-27</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-normal mt-0.5">
                            Official AICTE Letter of Approval (LoA) order signed with 256-bit cryptographic timestamp.
                          </div>
                        </div>

                        <button
                          onClick={() => setLoaModalOpen(true)}
                          className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Official AICTE Order (LoA)</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Sub-form: Advance */}
                {actionForm === 'ADVANCE' && (
                  <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-2 mt-2">
                    <div className="font-semibold text-slate-900 text-xs">
                      Mandatory APH Statutory Verification Checklist:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={checklist.landNorms} 
                          onChange={(e) => setChecklist({ ...checklist, landNorms: e.target.checked })} 
                        />
                        <span>Land title & zoning norms verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={checklist.builtUpArea} 
                          onChange={(e) => setChecklist({ ...checklist, builtUpArea: e.target.checked })} 
                        />
                        <span>Built-up instructional carpet area adequate</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={checklist.fireNoc} 
                          onChange={(e) => setChecklist({ ...checklist, fireNoc: e.target.checked })} 
                        />
                        <span>State Fire Safety NOC in order</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={checklist.cadreRatio} 
                          onChange={(e) => setChecklist({ ...checklist, cadreRatio: e.target.checked })} 
                        />
                        <span>Faculty cadre ratio & qualifications met</span>
                      </label>
                    </div>
                    <button
                      onClick={() => handleAdvanceStage(selectedApp)}
                      className="mt-2 w-full py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white font-semibold rounded text-xs transition"
                    >
                      Authorize Transition to Next Prescribed Stage
                    </button>
                  </div>
                )}

                {/* Sub-form: Deficiency Revert */}
                {actionForm === 'DEFICIENCY' && (
                  <div className="p-3 bg-white border border-red-300 rounded-lg space-y-2 mt-2">
                    <div className="font-semibold text-red-950 text-xs">
                      State Specific Deficiency under APH 2026-27:
                    </div>
                    <textarea
                      rows={3}
                      value={deficiencyReason}
                      onChange={(e) => setDeficiencyReason(e.target.value)}
                      placeholder="Specify exact clause (e.g., 'APH Clause 2.4.2: Built-up area shortfall in Computer Center; NABL calibration certificates missing for CNC machine.')..."
                      className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-red-600 focus:outline-none"
                    ></textarea>
                    <button
                      onClick={() => handleRevertApplication(selectedApp)}
                      className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Issue Official Deficiency Notice & Revert Application</span>
                    </button>
                  </div>
                )}

                {/* Sub-form: Conditional Undertaking */}
                {actionForm === 'CONDITIONAL' && (
                  <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-2 mt-2">
                    <div className="font-semibold text-slate-900 text-xs">
                      Configure Time-Bound Undertaking & Provisional Approval Lock:
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Undertaking Obligation Text:</label>
                      <input
                        type="text"
                        value={undertakingText}
                        onChange={(e) => setUndertakingText(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">Compliance Deadline Window:</label>
                        <select
                          value={undertakingDays}
                          onChange={(e) => setUndertakingDays(Number(e.target.value))}
                          className="p-1.5 text-xs border border-slate-300 rounded"
                        >
                          <option value={30}>30 Days</option>
                          <option value={60}>60 Days</option>
                          <option value={90}>90 Days</option>
                          <option value={180}>180 Days</option>
                        </select>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-4">
                        Failure to verify by T-0 automatically triggers Show-Cause proceedings.
                      </div>
                    </div>
                    <button
                      onClick={() => handleGrantConditionalApproval(selectedApp)}
                      className="w-full py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white font-semibold rounded text-xs transition mt-2"
                    >
                      Grant Provisional Approval under Undertaking Lock
                    </button>
                  </div>
                )}

              </div>

              {/* Chronological Case Movement */}
              <div>
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Case Movement & Decision Audit History:
                </div>
                <div className="border border-slate-200 rounded divide-y divide-slate-100 text-xs">
                  {selectedApp.history.map((h, i) => (
                    <div key={i} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-bold text-slate-900">{h.stage}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({h.actor})</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">{h.remark}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 transition"
              >
                Close Case Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Official AICTE Letter of Approval (LoA) Modal */}
      <OfficialLoAModal
        isOpen={loaModalOpen}
        onClose={() => setLoaModalOpen(false)}
        application={selectedApp}
      />

    </div>
  );
}
