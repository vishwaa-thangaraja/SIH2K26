import React, { useState } from 'react';
import { 
  Users, MapPin, Calendar, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, FileText, Camera, Navigation, 
  Send, UserPlus, Eye, CheckSquare, ArrowRight
} from 'lucide-react';

export function EVCCenter({ 
  evcVisits, 
  onUpdateEVC,
  activeRole,
  onNavigateToStep
}) {
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [checklist, setChecklist] = useState({
    cadreRatio: true,
    labEquipment: true,
    library: true,
    barrierFree: true,
    antiRagging: true
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Submit Inspection Report
  const handleSubmitReport = (visit) => {
    const updated = {
      ...visit,
      status: 'Inspection Report Submitted (Compliant)',
      reportSubmitted: true,
      inspectionChecklist: checklist,
      escalated: false
    };
    onUpdateEVC(updated);
    setSelectedVisit(updated);
    setSuccessMsg('EVC Physical Inspection Report & Geotagged Evidence successfully signed and submitted.');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              Expert Visit Committee (EVC) Inspection Management
            </h2>
            <p className="text-xs text-slate-500">
              3-member panel coordination, GPS geofenced campus verification, and 10-day turnaround monitoring
            </p>
          </div>

          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold self-start sm:self-auto">
            Standard: Max 10-Day Report Turnaround
          </span>
        </div>
      </div>

      {/* Grid of EVC Inspections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {evcVisits.map((visit) => {
          const isOverdue = visit.status.includes('Overdue');

          return (
            <div 
              key={visit.id}
              onClick={() => setSelectedVisit(visit)}
              className={`bg-white rounded-xl border p-4 shadow-xs hover:border-slate-400 transition cursor-pointer flex flex-col justify-between ${
                isOverdue ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {visit.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    isOverdue 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : visit.reportSubmitted 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {visit.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{visit.instName}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">PID: {visit.pid} • App: {visit.appId}</div>
                  <p className="text-xs text-slate-700 font-medium mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                    {visit.purpose}
                  </p>
                </div>

                {/* Dates & Ageing */}
                <div className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <span className="font-semibold text-slate-800">{visit.scheduledDate || 'Pending Assignment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SLA Deadline:</span>
                    <span className="font-semibold text-slate-800">{visit.slaDeadline || '10 Days upon Allocation'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Ageing:</span>
                    <span className={`font-bold ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                      {visit.daysAgeing} Days Active
                    </span>
                  </div>
                </div>

                {/* Geo-Fence Status */}
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Navigation className="w-3.5 h-3.5 text-slate-700" />
                    GPS Perimeter Verification:
                  </span>
                  {visit.gpsGeoFence.verified ? (
                    <span className="text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      &le;250m Verified
                    </span>
                  ) : (
                    <span className="text-slate-400">Pending Site Check</span>
                  )}
                </div>

              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{visit.committeeMembers.length} Experts on Panel</span>
                <button 
                  onClick={() => setSelectedVisit(visit)}
                  className="px-3 py-1 bg-slate-100 hover:bg-[#0f2942] hover:text-white text-slate-700 rounded text-xs font-semibold transition"
                >
                  Review
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* EVC Inspection Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            
            {/* Header */}
            <div className="bg-[#0f2942] text-white p-4 sm:p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-bold">
                    {selectedVisit.id}
                  </span>
                  <span className="text-slate-300 text-xs">{selectedVisit.appId}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedVisit.instName}</h3>
                <p className="text-xs text-slate-300">{selectedVisit.purpose}</p>
              </div>

              <button 
                onClick={() => setSelectedVisit(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>

                  {onNavigateToStep && (
                    <button
                      onClick={() => {
                        setSelectedVisit(null);
                        onNavigateToStep('RO');
                      }}
                      className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
                    >
                      <span>Proceed to Step 4: Regional Officer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Geofence Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-slate-700" />
                    GPS Perimeter Audit & Attendance Check-in
                  </span>
                  <span className="font-mono text-slate-500">
                    LAT: {selectedVisit.gpsGeoFence.lat}, LNG: {selectedVisit.gpsGeoFence.lng}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  EVC Mobile Sentinel mandates that all 3 committee experts synchronize check-in within a 250m perimeter of the registered survey boundary coordinates before the on-site inspection checklist unlocks.
                </p>
              </div>

              {/* Panel Roster */}
              <div>
                <div className="font-semibold text-slate-900 text-xs mb-2">
                  Constituent Expert Visit Panel (APH Clause 2.6):
                </div>
                {selectedVisit.committeeMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedVisit.committeeMembers.map((m, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-700 font-semibold">{m.role}</div>
                        <div className="text-[11px] text-slate-500">{m.inst}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">{m.contact}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-500 text-center">
                    Automated panel allocation in progress (conflict-of-interest check active).
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="font-semibold text-slate-900 text-xs">
                  Physical Verification Checklist:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.cadreRatio} 
                      onChange={(e) => setChecklist({ ...checklist, cadreRatio: e.target.checked })}
                    />
                    <span>Faculty cadre & PhD ratio verified in-person</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.labEquipment} 
                      onChange={(e) => setChecklist({ ...checklist, labEquipment: e.target.checked })}
                    />
                    <span>Working lab setups & machine calibration verified</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.library} 
                      onChange={(e) => setChecklist({ ...checklist, library: e.target.checked })}
                    />
                    <span>Library titles, volumes & IEEE e-journal subscriptions</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.barrierFree} 
                      onChange={(e) => setChecklist({ ...checklist, barrierFree: e.target.checked })}
                    />
                    <span>Barrier-free ramps & Divyangjan accessibility</span>
                  </label>
                </div>

                <button
                  onClick={() => handleSubmitReport(selectedVisit)}
                  className="w-full mt-2 py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded font-semibold text-xs transition"
                >
                  Affix 3-Member Digital Signatures & Transmit Inspection Report
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedVisit(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
