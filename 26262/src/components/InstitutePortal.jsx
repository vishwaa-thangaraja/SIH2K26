import React, { useState } from 'react';
import { 
  Building2, FileText, AlertCircle, Clock, CheckCircle2, 
  UploadCloud, Send, FileCheck2, FileWarning, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';

export function InstitutePortal({ 
  applications, 
  undertakings, 
  documents,
  onUpdateApplication,
  onUpdateUndertaking,
  onUpdateDocument,
  onNavigateToStep
}) {
  // Institutional Scope: Delhi Institute of Technology & Science (PID: 1-9382103)
  const myApp = applications.find(a => a.pid === '1-9382103') || applications[0];
  const myUndertakings = undertakings.filter(u => u.pid === '1-9382103');
  const myDocs = documents.filter(d => d.pid === '1-9382103');

  const [rectificationText, setRectificationText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleRespondDeficiency = (e) => {
    e.preventDefault();
    if (!rectificationText.trim()) {
      alert('Please state the rectification details and reference the uploaded documents.');
      return;
    }

    const updated = {
      ...myApp,
      status: 'In Progress (Resubmitted for Re-Scrutiny)',
      deficiencies: [],
      history: [
        ...myApp.history,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          stage: myApp.currentStage,
          actor: 'Dr. R. Ramanathan (Principal)',
          remark: `COMPLIANCE RESUBMISSION: ${rectificationText}. Transmitted to Scrutiny Committee.`
        }
      ]
    };
    onUpdateApplication(updated);
    setRectificationText('');
    setUploadOpen(false);
    setHasSubmitted(true);
    setSuccessMsg('Rectification response successfully transmitted to Scrutiny Committee! Ready for Step 2.');
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Video Presentation Flow Next Step Guide Banner */}
      <div className="bg-[#0f2942] text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
            1
          </span>
          <div>
            <div className="text-xs font-bold text-orange-400 uppercase tracking-wide">Video Flow Step 1 of 5: Institutional Perspective</div>
            <div className="text-xs text-slate-200">Submit deficiency rectification for Delhi Institute of Technology (PID: 1-9382103)</div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToStep('SCRUTINY_EXPERT')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95"
        >
          <span>Proceed to Step 2: Scrutiny Desk</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Institution Master Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                AICTE PID: 1-9382103
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">Northern Regional Office (NRO, Kanpur)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Delhi Institute of Technology & Science
            </h2>
            <p className="text-xs text-slate-600">
              Plot 4B, Knowledge Park III, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh - 201310
            </p>
          </div>

          <div className="text-left md:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>Principal: <strong className="text-slate-900">Dr. R. Ramanathan, Ph.D.</strong></div>
            <div>Affiliated University: <strong className="text-slate-900">Dr. APJ Abdul Kalam Tech Univ.</strong></div>
            <div>Campus Land Area: <strong className="text-slate-900">7.5 Acres (Approved)</strong></div>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-slate-500 font-medium block">Current Application Status</span>
            <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {myApp.currentStage}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{myApp.id}</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-slate-500 font-medium block">Compliance Undertakings</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {myUndertakings.length} Active Condition(s)
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">AI Lab Setup (Due in 19 Days)</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-slate-500 font-medium block">Statutory Land Lease</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              Registered 30-Year Lease
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Valid until 31-Mar-2056</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => onNavigateToStep('SCRUTINY_EXPERT')}
            className="px-3 py-1.5 bg-[#0f2942] text-white rounded font-bold hover:bg-[#1e3a5f] transition flex items-center gap-1"
          >
            <span>Switch to Scrutiny Desk ➔</span>
          </button>
        </div>
      )}

      {/* Primary Section: Active Application Lifecycle */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Application Lifecycle & Approval Movement: {myApp.id}
            </h3>
            <p className="text-xs text-slate-500">
              {myApp.type} • Track B (Scrutiny + EVC)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 self-start sm:self-auto">
            Stage: {myApp.currentStage} ({myApp.daysInCurrentStage} Days Active)
          </span>
        </div>

        {/* Sequential Step Gate Progress */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-600 mb-2">Prescribed Approval Processing Stages:</div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            
            <div className="p-2.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-900">
              <div className="font-bold">1. Submission</div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </div>
            </div>

            <div className="p-2.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-900">
              <div className="font-bold">2. Preliminary Desk</div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </div>
            </div>

            <div className="p-2.5 rounded border bg-blue-50 border-blue-300 text-blue-950 ring-1 ring-blue-300">
              <div className="font-bold">3. Scrutiny Committee</div>
              <div className="text-[11px] text-blue-800 flex items-center gap-1 mt-1 font-semibold">
                <Clock className="w-3 h-3" />
                In Progress
              </div>
            </div>

            <div className="p-2.5 rounded border bg-white border-slate-200 text-slate-400">
              <div className="font-bold">4. Expert Visit (EVC)</div>
              <div className="text-[11px] mt-1">Pending Scrutiny</div>
            </div>

            <div className="p-2.5 rounded border bg-white border-slate-200 text-slate-400">
              <div className="font-bold">5. Competent Authority</div>
              <div className="text-[11px] mt-1">Final Approval</div>
            </div>

          </div>
        </div>

        {/* Active Action Required: Deficiency Box if present */}
        {myApp.deficiencies && myApp.deficiencies.length > 0 && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950 text-xs">
                  Official Deficiency Notice Issued by Scrutiny Committee:
                </h4>
                <p className="text-xs text-red-800 mt-1">
                  The scrutiny committee has identified the following required clarifications before your application can advance to the Expert Visit Committee (EVC) stage:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-red-900 font-medium">
                  {myApp.deficiencies.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {!uploadOpen ? (
              <button
                onClick={() => setUploadOpen(true)}
                className="px-4 py-2 bg-[#0f2942] hover:bg-[#1e3a5f] text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                Submit Rectification & Upload Clarification Documents
              </button>
            ) : (
              <form onSubmit={handleRespondDeficiency} className="p-4 bg-white rounded-lg border border-slate-200 space-y-3 mt-2">
                <div className="font-semibold text-slate-900 text-xs">
                  Rectification Response Form:
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">
                    State details of rectified compliance and reference uploaded files:
                  </label>
                  <textarea
                    rows={3}
                    value={rectificationText}
                    onChange={(e) => setRectificationText(e.target.value)}
                    placeholder="e.g., 'Attached Principal equivalence certification issued by AIU and renewed Fire Safety inspection challan No. FS-2026-88.'"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  ></textarea>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Submit to Scrutiny Committee
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Case Movement Audit */}
        <div>
          <div className="font-semibold text-slate-800 text-xs mb-2">
            Chronological Processing History:
          </div>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
            {myApp.history.map((h, i) => (
              <div key={i} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-900">{h.stage}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{h.remark}</p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {h.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Section: My Compliance Undertakings & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Undertakings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              Time-Bound Undertakings (Conditional Approval)
            </h4>
            <span className="text-[10px] font-semibold text-slate-500">Obligation Watch</span>
          </div>

          {myUndertakings.map((ut) => (
            <div key={ut.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900">{ut.condition}</span>
                <span className="text-[11px] text-blue-700 font-bold">{ut.daysRemaining} Days Left</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Prescribed Date: <strong>{ut.prescribedDate}</strong> • Due Date: <strong>{ut.dueDate}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Required Evidence: <span className="font-medium">{ut.evidenceType}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">{ut.approvalLockStatus}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                  {ut.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Prescribed Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileWarning className="w-4 h-4 text-slate-700" />
              Prescribed Documents & Validity Monitor
            </h4>
            <span className="text-[10px] font-semibold text-slate-500">Document Sentinel</span>
          </div>

          {myDocs.map((doc) => (
            <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900">{doc.docType}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                  {doc.daysToExpiry > 30 ? 'Valid' : 'Warning'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Reg No: <strong>{doc.regNumber}</strong> • Expiry: <strong>{doc.expiryDate}</strong>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                SHA-256: {doc.sha256Hash}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
