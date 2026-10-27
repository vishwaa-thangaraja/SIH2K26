import React from 'react';
import { 
  X, Printer, Download, CheckCircle2, ShieldCheck, 
  Building2, QrCode, FileText, Lock
} from 'lucide-react';

export function OfficialLoAModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-10 border-4 border-[#0f2942] space-y-6 relative text-slate-800 font-serif">
        
        {/* Close Button (Hidden on Print) */}
        <div className="absolute top-4 right-4 print:hidden flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Order</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
          <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-500">
            Government of India • Ministry of Education
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0f2942] uppercase tracking-tight font-serif">
            All India Council for Technical Education
          </h2>
          <div className="text-xs font-sans font-semibold text-slate-600">
            (A Statutory Body of the Government of India) • Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
          </div>
          <div className="inline-block mt-1 px-3 py-0.5 rounded bg-slate-100 text-[#0f2942] text-[11px] font-sans font-bold border border-slate-300">
            OFFICIAL ORDER: PROVISIONAL EXTENSION OF APPROVAL (EoA) 2026-27
          </div>
        </div>

        {/* Order Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-sans text-slate-700 pb-2 border-b border-slate-200 gap-2">
          <div>
            <strong>F.No. Northern/2026-27/{application.pid || '1-9382103'}/EoA</strong>
          </div>
          <div>
            Date of Dispatch: <strong>27-Oct-2026</strong>
          </div>
        </div>

        {/* Addressee */}
        <div className="text-xs font-sans text-slate-800 space-y-1">
          <div>To,</div>
          <div className="font-bold text-slate-900">The Principal / Director,</div>
          <div className="font-semibold text-slate-900">{application.instName}</div>
          <div className="text-slate-600">PID: {application.pid} • Region: {application.region} Regional Office</div>
        </div>

        {/* Subject */}
        <div className="text-xs font-sans bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
          <strong>Sub:</strong> Grant of <strong>Provisional Extension of Approval (EoA)</strong> for the Academic Session 2026-27 under AICTE Approval Process Handbook (APH) subject to <strong>Time-Bound Compliance Undertaking</strong> — Reg.
        </div>

        {/* Letter Body */}
        <div className="text-xs text-slate-700 space-y-3 leading-relaxed font-sans">
          <p>
            Sir/Madam, in terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2026 and applicable standards, I am directed to convey the provisional approval to the institution named above for the academic programs and intake indicated below:
          </p>

          {/* Approved Intake Table */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                <tr>
                  <th className="p-2">Program / Level</th>
                  <th className="p-2">Approved Course</th>
                  <th className="p-2 text-center">Affiliating Body</th>
                  <th className="p-2 text-center">Intake (2026-27)</th>
                  <th className="p-2 text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium">Engineering & Tech (UG)</td>
                  <td className="p-2 font-bold text-slate-900">Computer Science & Engineering</td>
                  <td className="p-2 text-center">Dr. APJ Abdul Kalam Tech Univ</td>
                  <td className="p-2 text-center font-bold">120</td>
                  <td className="p-2 text-right text-emerald-800 font-bold">Approved</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Engineering & Tech (UG)</td>
                  <td className="p-2 font-bold text-slate-900">Artificial Intelligence & Machine Learning</td>
                  <td className="p-2 text-center">Dr. APJ Abdul Kalam Tech Univ</td>
                  <td className="p-2 text-center font-bold">60</td>
                  <td className="p-2 text-right text-emerald-800 font-bold">Approved</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Management (PG)</td>
                  <td className="p-2 font-bold text-slate-900">Master of Business Administration (MBA)</td>
                  <td className="p-2 text-center">Dr. APJ Abdul Kalam Tech Univ</td>
                  <td className="p-2 text-center font-bold">60</td>
                  <td className="p-2 text-right text-emerald-800 font-bold">Approved</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mandatory Undertaking Condition */}
          <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-lg text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-[#0f2942]">
              <Lock className="w-3.5 h-3.5 text-amber-800" />
              SPECIAL REGULATORY CONDITION (TIME-BOUND UNDERTAKING LOCK):
            </div>
            <p className="text-[11px] leading-relaxed">
              This approval is strictly provisional and bound to the fulfillment of the submitted undertaking: 
              <strong className="block mt-0.5">"Establishment of 3 Advanced Computing & AI Divisions + NABL Calibration certification within 60 Days."</strong>
              Failure to submit verified evidence before deadline <strong>15-Dec-2026</strong> shall automatically freeze admission clearances and initiate Show-Cause proceedings under APH Section 2.11 without further notice.
            </p>
          </div>
        </div>

        {/* Official Signatures & Digital Cryptographic Seal */}
        <div className="pt-4 border-t-2 border-slate-800 flex items-end justify-between font-sans text-xs">
          <div className="space-y-1">
            <div className="w-20 h-20 bg-slate-50 border-2 border-slate-300 rounded p-1 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-800" />
            </div>
            <div className="text-[9px] font-mono text-slate-500">
              e-Signed: SHA256/0x9f8a...3f2a
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="font-serif italic text-base font-bold text-[#0f2942]">
              Prof. T. G. Sitharam
            </div>
            <div className="font-bold text-slate-900 text-xs">Member Secretary</div>
            <div className="text-[11px] text-slate-600">All India Council for Technical Education</div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Digitally Certified under IT Act 2000
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
