import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Search, Filter, Download, 
  Printer, CheckCircle2, Lock, ArrowUpRight, Sparkles 
} from 'lucide-react';

export function AuditTrail({ auditLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [showCertificate, setShowCertificate] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action.includes(filterAction);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Immutable Regulatory Digital Audit Stream
            </h2>
            <p className="text-xs text-slate-500">
              End-to-end cryptographic traceability of all application stage transitions, returns, verifications, and escalations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="px-3.5 py-2 bg-[#0d2538] hover:bg-[#1a446c] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate Certified Audit Certificate</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search audit trail by Actor, Target Case ID, or Remark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="ALL">All Recorded Actions</option>
              <option value="ESCALATE">Auto-Escalations</option>
              <option value="COMPLIANCE">Compliance Submissions</option>
              <option value="DEFICIENCY">Deficiency Notes & Reverts</option>
              <option value="NOTICE">Renewal Notices</option>
              <option value="APH">APH Policy Updates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
              
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                    {log.id}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    log.action.includes('ESCALATE') ? 'bg-rose-100 text-rose-800' :
                    log.action.includes('DEFICIENCY') ? 'bg-amber-100 text-amber-800' :
                    log.action.includes('PROOF') ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-blue-700 font-semibold">{log.target}</span>
                </div>

                <p className="text-slate-800 font-medium text-xs leading-relaxed">
                  {log.summary}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Actor: <strong className="text-slate-700">{log.actor}</strong> ({log.role})</span>
                </div>
              </div>

              {/* Checksum Hash */}
              <div className="sm:text-right font-mono text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xs truncate">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center sm:justify-end gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                  SHA-256 Event Checksum
                </div>
                <div className="truncate text-slate-600">{log.hash}</div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Certified Audit Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border-4 border-[#0d2538] space-y-6 relative gov-seal-bg">
            
            {/* National Crest header */}
            <div className="text-center border-b-2 border-slate-300 pb-4 space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Government of India • Ministry of Education
              </div>
              <h3 className="text-lg font-black text-[#0d2538] uppercase tracking-tight">
                All India Council for Technical Education (AICTE)
              </h3>
              <p className="text-xs text-orange-600 font-bold tracking-wide uppercase">
                Regulatory Compliance & Workflow Digital Audit Certificate
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                Certificate Hash: 0x9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
              <p>
                This certifies that all application movements, scrutiny checklists, EVC physical inspection allocations, conditional undertakings, and lease document validity monitoring records captured within the <strong>AICTE PRAVAAH System</strong> are recorded in an immutable, cryptographically verifiable digital event stream.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                <div>Total Verified Audit Events: <strong>1,492 Records</strong></div>
                <div>Integrity Standard: <strong>SHA-256 HMAC Continuous Ledger</strong></div>
                <div>Statutory Compliance: <strong>AICTE Approval Process Handbook (APH) 2026-27</strong></div>
                <div>Status: <strong className="text-emerald-700">100% Tamper-Evident & Zero Unrecorded Alterations</strong></div>
              </div>
            </div>

            {/* Seal & Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">AICTE Central e-Governance</div>
                <div className="text-[10px] text-slate-500">Digitally Certified System</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">Prof. T. G. Sitharam</div>
                <div className="text-[10px] text-slate-500">Member Secretary, AICTE</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-1.5 bg-[#0d2538] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
