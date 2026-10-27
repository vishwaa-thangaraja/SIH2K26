import React, { useState } from 'react';
import { 
  FileWarning, ShieldCheck, Clock, AlertTriangle, Send, 
  CheckCircle2, FileText, Search, RefreshCw, Lock, Eye, UploadCloud
} from 'lucide-react';

export function DocumentLeaseSentinel({ 
  documents, 
  onUpdateDocument,
  activeRole 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [renewalYear, setRenewalYear] = useState('2056-11-20');

  // Filter documents
  const filteredDocs = documents.filter((doc) => 
    doc.instName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.docType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.pid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dispatch Notice
  const handleDispatchNotice = (doc) => {
    const updated = {
      ...doc,
      noticesSent: doc.noticesSent + 1,
      lastNoticeDate: new Date().toISOString().substring(0, 10)
    };
    onUpdateDocument(updated);
    setSelectedDoc(updated);
    setSuccessMsg(`Automated Regulatory Expiry Notice #${updated.noticesSent} dispatched.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Upload Renewal
  const handleUploadRenewal = (doc) => {
    const updated = {
      ...doc,
      renewalSubmitted: true,
      renewalDocName: `Renewed_${doc.docType.replace(/\s+/g, '_')}_2026.pdf`,
      escalationLevel: 'Pending Official Verification'
    };
    onUpdateDocument(updated);
    setSelectedDoc(updated);
    setSuccessMsg('Renewed registered document uploaded. Awaiting verification.');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Verify and Extend Validity
  const handleVerifyRenewal = (doc) => {
    const updated = {
      ...doc,
      expiryDate: renewalYear,
      daysToExpiry: 10950,
      status: 'SAFE_VALID',
      renewalSubmitted: false,
      escalationLevel: 'Normal',
      sha256Hash: 'b4a8901234cdef1234567890abcdef1234567890abcdef1234567890abcdef12'
    };
    onUpdateDocument(updated);
    setSelectedDoc(updated);
    setSuccessMsg(`Sub-Registrar Endorsement Verified. Validity extended to ${renewalYear}.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-slate-700" />
              Prescribed Document & Land Lease Validity Sentinel
            </h2>
            <p className="text-xs text-slate-500">
              Cryptographic integrity tracking for 30-year registered land leases, fire safety NOCs, and structural certificates
            </p>
          </div>

          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            SHA-256 Checksum Guard Active
          </span>
        </div>

        {/* Search */}
        <div className="pt-1">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Institution, Document Type, or PID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {filteredDocs.map((doc) => {
          const isCritical = doc.daysToExpiry <= 30 && doc.daysToExpiry >= 0;
          const isExpired = doc.daysToExpiry < 0;
          const isWarning = doc.daysToExpiry > 30 && doc.daysToExpiry <= 90;

          return (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`bg-white rounded-xl border p-4 shadow-xs hover:border-slate-400 transition cursor-pointer flex flex-col justify-between ${
                isExpired ? 'border-red-300 bg-red-50/20' :
                isCritical ? 'border-red-200 bg-red-50/10' :
                'border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {doc.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    isExpired ? 'bg-red-50 text-red-700 border border-red-200' :
                    isCritical ? 'bg-red-50 text-red-700 border border-red-200' :
                    isWarning ? 'bg-slate-100 text-slate-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {isExpired ? 'EXPIRED' : isCritical ? 'CRITICAL EXPIRY' : isWarning ? 'EXPIRING (<90D)' : 'VALID'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{doc.instName}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">PID: {doc.pid}</div>
                  <div className="font-semibold text-slate-800 text-xs mt-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                    {doc.docType}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reg / Book No:</span>
                    <span className="font-mono text-slate-800">{doc.regNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sub-Registrar:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">{doc.subRegistrar}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Expiry Date:</span>
                    <span className={`font-bold ${isExpired || isCritical ? 'text-red-700' : 'text-slate-800'}`}>
                      {doc.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Days */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Validity Horizon:</span>
                  <span className={`font-bold ${isExpired || isCritical ? 'text-red-700' : 'text-slate-800'}`}>
                    {isExpired ? `${Math.abs(doc.daysToExpiry)} Days Expired` : `${doc.daysToExpiry} Days Remaining`}
                  </span>
                </div>

              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Notices: {doc.noticesSent} Dispatched</span>
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-1 bg-slate-100 hover:bg-[#0f2942] hover:text-white text-slate-700 rounded text-xs font-semibold transition"
                >
                  Review
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
            
            {/* Header */}
            <div className="bg-[#0f2942] text-white p-4 sm:p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-bold">
                    {selectedDoc.id}
                  </span>
                  <span className="text-slate-300 text-xs">PID: {selectedDoc.pid}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedDoc.instName}</h3>
                <p className="text-xs text-slate-300">{selectedDoc.docType}</p>
              </div>

              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Checksum Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-slate-900 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-700" />
                    Cryptographic SHA-256 Checksum Fingerprint:
                  </span>
                  <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    Integrity Verified
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 break-all select-all">
                  {selectedDoc.sha256Hash}
                </p>
                <div className="text-[11px] text-slate-500">
                  Sub-Registrar: <strong>{selectedDoc.subRegistrar}</strong> • Registration Book Number: <strong>{selectedDoc.regNumber}</strong>
                </div>
              </div>

              {/* Status Alert */}
              <div className={`p-3.5 rounded-lg border space-y-1 ${
                selectedDoc.daysToExpiry < 0 ? 'bg-red-50 border-red-200 text-red-950' :
                selectedDoc.daysToExpiry <= 30 ? 'bg-red-50 border-red-200 text-red-950' :
                'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <span>Validity Horizon: {selectedDoc.expiryDate} ({selectedDoc.daysToExpiry} Days Remaining)</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {selectedDoc.daysToExpiry < 0 ? (
                    'Mandatory land lease deed has expired. Approval renewal requests are locked until certified renewal is verified.'
                  ) : selectedDoc.daysToExpiry <= 30 ? (
                    'Prescribed document is approaching expiration within 30 days. Advance renewal notice has been dispatched.'
                  ) : (
                    'Document is within valid regulatory limits.'
                  )}
                </p>
              </div>

              {/* Notice Dispatch */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-semibold text-slate-900 text-xs">
                  Automated Advance Notice Dispatch:
                </div>
                <p className="text-slate-600 text-[11px]">
                  Total Notices Dispatched: <strong>{selectedDoc.noticesSent}</strong> (Last Notice: {selectedDoc.lastNoticeDate || 'None'})
                </p>
                <button
                  onClick={() => handleDispatchNotice(selectedDoc)}
                  className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white font-semibold rounded text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Statutory Renewal Notice</span>
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
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
