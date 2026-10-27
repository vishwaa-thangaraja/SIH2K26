import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, ArrowRight, UserCheck, 
  CheckCircle2, Clock, Users, Building2, RotateCw, Filter, Zap
} from 'lucide-react';

export function EscalationSLA({ 
  applications, 
  undertakings, 
  documents,
  onResolveEscalation,
  activeRole,
  onNavigateToStep
}) {
  const [successMsg, setSuccessMsg] = useState('');

  // Collect all active escalations
  const escalatedApps = applications.filter(a => a.daysInCurrentStage >= a.slaDays || a.status.includes('Escalated'));
  const breachedUndertakings = undertakings.filter(u => u.daysRemaining < 0);
  const criticalDocs = documents.filter(d => d.daysToExpiry < 0 || (d.daysToExpiry <= 30 && d.noticesSent >= 3));

  const handleReassign = (appId) => {
    onResolveEscalation(appId);
    setSuccessMsg(`Application ${appId} reassigned to Standby Committee Pool B. Bottleneck cleared.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-700" />
              Cascading SLA Auto-Escalation & Bottleneck Resolution Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Multi-tiered escalation hierarchy ensuring zero administrative pendency through automated reallocation
            </p>
          </div>

          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold self-start sm:self-auto">
            Hierarchy Protocol Active
          </span>
        </div>

        {/* 3-Tier Escalation Hierarchy Standard Infographic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                TIER 1 (SOFT ALERT)
              </span>
              <span className="font-mono text-slate-500 text-[11px]">T-2 Days</span>
            </div>
            <div className="font-semibold text-slate-700">Assigned Case Reviewer</div>
            <p className="text-slate-600 text-[11px]">
              Automated notification to designated scrutiny expert or EVC coordinator.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                TIER 2 (REGIONAL RED)
              </span>
              <span className="font-mono text-slate-500 text-[11px]">T-0 Breach</span>
            </div>
            <div className="font-semibold text-slate-700">Regional Officer (RO)</div>
            <p className="text-slate-600 text-[11px]">
              Automatic reallocation of stagnant cases (&gt;120 hrs) to parallel reviewer pool.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                TIER 3 (EXECUTIVE APEX)
              </span>
              <span className="font-mono text-slate-500 text-[11px]">T+3 Days Breach</span>
            </div>
            <div className="font-semibold text-slate-700">Member Secretary & Central Vigilance</div>
            <p className="text-slate-600 text-[11px]">
              Escalated directly to AICTE HQ executive docket with diagnostic root-cause summary.
            </p>
          </div>

        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>

          {onNavigateToStep && (
            <button
              onClick={() => onNavigateToStep('COMPETENT_AUTH')}
              className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
            >
              <span>Proceed to Step 5: Member Secretary Decision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Active Escalated Cases List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Active Priority Escalations ({escalatedApps.length + breachedUndertakings.length + criticalDocs.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">AUTOMATED SURVEILLANCE ENGINE</span>
        </div>

        {/* Application Stage Breaches */}
        {escalatedApps.map((app) => (
          <div 
            key={app.id}
            className="bg-white rounded-xl border border-red-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-200">
                  {app.daysInCurrentStage >= app.slaDays + 3 ? 'TIER 3 ESCALATION' : 'TIER 2 ESCALATION'}
                </span>
                <span className="font-mono text-slate-700 font-bold">{app.id}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{app.region} Region</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{app.instName}</h4>
              <p className="text-red-800 font-medium">
                Pending at <strong>"{app.currentStage}"</strong> for {app.daysInCurrentStage} days (Prescribed SLA: {app.slaDays} days).
              </p>
              <div className="text-[11px] text-slate-500">
                Assigned Official: <strong>{app.assignedTo}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => handleReassign(app.id)}
                className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#1e3a5f] text-white rounded text-xs font-semibold transition flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reassign to Standby Pool</span>
              </button>
            </div>
          </div>
        ))}

        {/* Breached Undertakings */}
        {breachedUndertakings.map((ut) => (
          <div 
            key={ut.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-200">
                  UNDERTAKING OVERDUE
                </span>
                <span className="font-mono text-slate-700 font-bold">{ut.id}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{ut.instName}</h4>
              <p className="text-slate-700">
                {ut.condition} — <strong className="text-red-700">{Math.abs(ut.daysRemaining)} Days Past Due Date ({ut.dueDate})</strong>
              </p>
              <div className="text-[11px] text-slate-500">
                Status: <strong>{ut.approvalLockStatus}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold border border-slate-200">
                Show-Cause Notice Issued
              </span>
            </div>
          </div>
        ))}

        {/* Critical Documents */}
        {criticalDocs.map((doc) => (
          <div 
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-200">
                  DOCUMENT EXPIRED / CRITICAL
                </span>
                <span className="font-mono text-slate-700 font-bold">{doc.id}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{doc.instName}</h4>
              <p className="text-slate-700">
                {doc.docType} ({doc.regNumber}) expired on <strong>{doc.expiryDate}</strong> ({doc.daysToExpiry} days).
              </p>
              <div className="text-[11px] text-slate-500">
                Notices Sent: <strong>{doc.noticesSent}</strong> • Escalation: <strong>{doc.escalationLevel}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold border border-slate-200">
                Approval Renewal Frozen
              </span>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
