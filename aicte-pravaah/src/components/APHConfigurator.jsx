import React, { useState } from 'react';
import { 
  Sliders, ShieldCheck, CheckCircle2, Save, RefreshCw, 
  Settings, Clock, AlertTriangle, Sparkles 
} from 'lucide-react';

export function APHConfigurator({ 
  aphConfig, 
  onUpdateConfig 
}) {
  const [config, setConfig] = useState({ ...aphConfig });
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateConfig(config);
    setSavedMsg('Approval Process Handbook (APH) Regulatory Rules updated in live engine! All stage SLAs re-indexed.');
    setTimeout(() => setSavedMsg(''), 4500);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-600" />
              APH Regulatory Rules & Dynamic SLA Timeline Configurator
            </h2>
            <p className="text-xs text-slate-500">
              Authorized administrators can tune processing timelines, auto-escalation thresholds, and compliance safeguards without code changes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold">
              APH Handbook Edition 2026-27
            </span>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 font-bold text-xs animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        {/* Stage Turnaround SLAs */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            1. Stage-Wise Maximum Processing Turnaround Timelines (Days):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Scrutiny Stage SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.scrutinySlaDays}
                  onChange={(e) => setConfig({ ...config, scrutinySlaDays: Number(e.target.value) })}
                  className="w-20 p-2 text-xs font-bold border rounded-lg"
                />
                <span className="text-xs text-slate-500">Days (Max)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">EVC Report SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.evcSlaDays}
                  onChange={(e) => setConfig({ ...config, evcSlaDays: Number(e.target.value) })}
                  className="w-20 p-2 text-xs font-bold border rounded-lg"
                />
                <span className="text-xs text-slate-500">Days (Max)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">SHC Hearing SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.shcSlaDays}
                  onChange={(e) => setConfig({ ...config, shcSlaDays: Number(e.target.value) })}
                  className="w-20 p-2 text-xs font-bold border rounded-lg"
                />
                <span className="text-xs text-slate-500">Days (Max)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Undertaking Max Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.undertakingMaxDays}
                  onChange={(e) => setConfig({ ...config, undertakingMaxDays: Number(e.target.value) })}
                  className="w-20 p-2 text-xs font-bold border rounded-lg"
                />
                <span className="text-xs text-slate-500">Days (Max)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Document Validity & Notice Horizons */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            2. Prescribed Document Validity Sentinel Horizons:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Advance Warning Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.documentExpiryWarningDays}
                  onChange={(e) => setConfig({ ...config, documentExpiryWarningDays: Number(e.target.value) })}
                  className="w-20 p-2 text-xs font-bold border rounded-lg"
                />
                <span className="text-xs text-slate-500">Days before expiration to initiate soft alerts</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">Critical Expiry Freeze Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.documentCriticalDays}
                  onChange={(e) => setConfig({ ...config, documentCriticalDays: Number(e.target.value) })}
                  className="w-20 p-2 text-xs font-bold border rounded-lg"
                />
                <span className="text-xs text-slate-500">Days before expiration to freeze expansion requests</span>
              </div>
            </div>

          </div>
        </div>

        {/* Regulatory Safeguard Toggles */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            3. Regulatory Safeguards & Automated Integrity Toggles:
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.mandatoryEvcForNewColleges}
                onChange={(e) => setConfig({ ...config, mandatoryEvcForNewColleges: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <div>
                <strong className="text-slate-900 block">Mandatory EVC for All New Technical Campuses & New Program Tracks</strong>
                <span className="text-slate-500">Prevents direct approval without physical on-site inspection.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoLockOnExpiredLease}
                onChange={(e) => setConfig({ ...config, autoLockOnExpiredLease: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <div>
                <strong className="text-slate-900 block">Automatic Approval Lock on Expired 30-Year Registered Land Leases</strong>
                <span className="text-slate-500">Institutions with lapsed land deeds cannot receive digital EoA certificates.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.dualSignoffRequiredForUndertakings}
                onChange={(e) => setConfig({ ...config, dualSignoffRequiredForUndertakings: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <div>
                <strong className="text-slate-900 block">Enforce Dual-Signoff for Time-Bound Undertakings (Desk Officer + RO)</strong>
                <span className="text-slate-500">Guarantees human regulatory judgement cannot be bypassed by automated scripts.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Apply Regulatory Policy Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
}
