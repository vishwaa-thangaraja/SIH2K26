import React, { useState } from 'react';
import { 
  FileCheck2, Clock, AlertTriangle, ShieldCheck, UploadCloud, 
  CheckCircle2, FileText, Send, Eye, AlertCircle
} from 'lucide-react';

export function ComplianceUndertakings({ 
  undertakings, 
  onUpdateUndertaking,
  activeRole 
}) {
  const [selectedUT, setSelectedUT] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle verifying and regularizing by Regional Officer / Competent Authority
  const handleVerifyUndertaking = (ut) => {
    const updated = {
      ...ut,
      status: 'Verified & Regularized',
      verifiedBy: `${activeRole} (Digital Signoff Recorded)`,
      approvalLockStatus: 'Regularized (Permanent EoA Granted)',
      escalationTriggered: false
    };
    onUpdateUndertaking(updated);
    setSelectedUT(updated);
    setSuccessMsg('Undertaking satisfactorily verified. Approval Lock lifted and regular approval certificate released.');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Handle issuing Show-Cause Notice for breached undertaking
  const handleIssueSCN = (ut) => {
    const updated = {
      ...ut,
      status: 'Show-Cause Notice Dispatched',
      approvalLockStatus: 'WITHHELD / Referred to SAC/SHC Hearing'
    };
    onUpdateUndertaking(updated);
    setSelectedUT(updated);
    setSuccessMsg(`Show-Cause Notice AICTE/LEGAL/SCN-${ut.pid} dispatched to Institution & Affiliating University.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              Time-Bound Undertakings & Institutional Compliance Watchdog
            </h2>
            <p className="text-xs text-slate-500">
              Monitoring conditional approvals, tracking mandatory rectification deadlines, and preventing regulatory drift
            </p>
          </div>

          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold self-start sm:self-auto">
            Provisional Approval Lock Protocol
          </span>
        </div>
      </div>

      {/* Grid of Undertakings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {undertakings.map((ut) => {
          const isOverdue = ut.daysRemaining < 0;
          const isPending = ut.status === 'Pending Verification';
          const isVerified = ut.status.includes('Verified');

          return (
            <div 
              key={ut.id}
              onClick={() => setSelectedUT(ut)}
              className={`bg-white rounded-xl border p-4 shadow-xs hover:border-slate-400 transition cursor-pointer flex flex-col justify-between ${
                isOverdue ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {ut.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    isOverdue 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : isVerified 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ut.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{ut.instName}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">PID: {ut.pid} • App: {ut.appId}</div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 mt-2">
                    {ut.condition}
                  </div>
                </div>

                {/* Deadlines */}
                <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase">Prescription Date:</span>
                    <span className="font-medium text-slate-800">{ut.prescribedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase">Compliance Deadline:</span>
                    <span className={`font-bold ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                      {ut.dueDate}
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Time Remaining:</span>
                  <span className={`font-bold ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                    {isOverdue ? `Overdue by ${Math.abs(ut.daysRemaining)} Days` : `${ut.daysRemaining} Days Left`}
                  </span>
                </div>

                {/* Approval Lock Badge */}
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                  <span>Lock Status: <strong>{ut.approvalLockStatus}</strong></span>
                </div>

              </div>

              {/* Action Trigger */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Click to review evidence</span>
                <button
                  onClick={() => setSelectedUT(ut)}
                  className="px-3 py-1 bg-slate-100 hover:bg-[#0f2942] hover:text-white text-slate-700 rounded text-xs font-semibold transition"
                >
                  Review
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Undertaking Detail & Dual-Signoff Modal */}
      {selectedUT && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            
            {/* Header */}
            <div className="bg-[#0f2942] text-white p-4 sm:p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-bold">
                    {selectedUT.id}
                  </span>
                  <span className="text-slate-300 text-xs">PID: {selectedUT.pid}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedUT.instName}</h3>
                <p className="text-xs text-slate-300">{selectedUT.condition}</p>
              </div>

              <button 
                onClick={() => setSelectedUT(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Obligation Details */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Statutory Compliance Condition:
                </div>
                <p className="text-slate-800 font-semibold text-xs leading-relaxed">
                  {selectedUT.condition}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-600">
                  <div>Required Evidence: <strong className="text-slate-800">{selectedUT.evidenceType}</strong></div>
                  <div>Current Status: <strong className="text-slate-800">{selectedUT.status}</strong></div>
                </div>
              </div>

              {/* Official Verification Controls (For RO / Admin) */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  Statutory Dual-Signoff Certification:
                </h4>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleVerifyUndertaking(selectedUT)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Evidence & Lift Provisional Approval Lock</span>
                  </button>

                  {selectedUT.daysRemaining < 0 && (
                    <button
                      onClick={() => handleIssueSCN(selectedUT)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Issue Automatic Show-Cause Notice (SCN)</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUT(null)}
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
