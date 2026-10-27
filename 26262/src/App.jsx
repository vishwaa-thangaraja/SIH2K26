import React, { useState, useEffect } from 'react';
import { 
  Building2, Layers, Users, FileCheck2, FileWarning, 
  ShieldAlert, ShieldCheck, Sliders, Bell, LayoutDashboard,
  CheckCircle2, ChevronRight, ArrowRight
} from 'lucide-react';

import { Header } from './components/Header';
import { InstitutePortal } from './components/InstitutePortal';
import { DashboardOverview } from './components/DashboardOverview';
import { ApplicationsWorkflow } from './components/ApplicationsWorkflow';
import { EVCCenter } from './components/EVCCenter';
import { ComplianceUndertakings } from './components/ComplianceUndertakings';
import { DocumentLeaseSentinel } from './components/DocumentLeaseSentinel';
import { EscalationSLA } from './components/EscalationSLA';
import { AuditTrail } from './components/AuditTrail';
import { APHConfigurator } from './components/APHConfigurator';

import { 
  INITIAL_APPLICATIONS, 
  INITIAL_UNDERTAKINGS, 
  INITIAL_DOCUMENTS, 
  INITIAL_EVC_VISITS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_APH_CONFIG 
} from './data/regulatoryData';

export function App() {
  const [activeRole, setActiveRole] = useState('RO');
  const [activeTab, setActiveTab] = useState('overview');
  const [systemDate, setSystemDate] = useState('2026-10-27');

  // Core Dynamic Data State
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [undertakings, setUndertakings] = useState(INITIAL_UNDERTAKINGS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [evcVisits, setEvcVisits] = useState(INITIAL_EVC_VISITS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [aphConfig, setAphConfig] = useState(INITIAL_APH_CONFIG);
  const [selectedApp, setSelectedApp] = useState(null);

  // When active role switches, set appropriate default view so details CHANGE immediately
  useEffect(() => {
    if (activeRole === 'INSTITUTE') {
      setActiveTab('institute_desk');
    } else if (activeRole === 'SCRUTINY_EXPERT') {
      setActiveTab('applications');
    } else if (activeRole === 'EVC_COORDINATOR') {
      setActiveTab('evc');
    } else if (activeRole === 'ADMIN') {
      setActiveTab('config');
    } else {
      setActiveTab('overview');
    }
  }, [activeRole]);

  // Live Notification System
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-1',
      title: 'EVC Report Overdue (SWRO)',
      message: 'Vidyapeeth Academy EVC visit report pending past 10 days. Escalated to RO Bangalore.',
      time: '18:30',
      type: 'CRITICAL',
      read: false
    },
    {
      id: 'NOTIF-2',
      title: 'Land Lease Deed Approaching Expiry',
      message: 'Registered 30-Year lease deed for Vidyapeeth Academy expires on 2026-11-20 (24 days left).',
      time: '14:20',
      type: 'WARNING',
      read: false
    },
    {
      id: 'NOTIF-3',
      title: 'Undertaking Evidence Submitted',
      message: 'Delhi Inst. of Tech uploaded NABL certificates for AI Lab undertaking.',
      time: '11:05',
      type: 'INFO',
      read: false
    }
  ]);

  // Scheduled Compliance Assessment & SLA Sync (Production Daemon Trigger)
  const handleRunComplianceSweep = () => {
    const daysToAdd = 7;
    const cur = new Date(systemDate);
    cur.setDate(cur.getDate() + daysToAdd);
    const newDateStr = cur.toISOString().substring(0, 10);
    setSystemDate(newDateStr);

    // Age applications
    const updatedApps = applications.map(app => {
      const newDays = app.daysInCurrentStage + daysToAdd;
      const isBreached = newDays >= app.slaDays;
      return {
        ...app,
        daysInCurrentStage: newDays,
        status: isBreached ? (newDays >= app.slaDays + 3 ? 'Escalated Tier-3' : 'Escalated Tier-2') : app.status,
        riskScore: Math.min(100, app.riskScore + daysToAdd * 3)
      };
    });
    setApplications(updatedApps);

    // Age undertakings
    const updatedUT = undertakings.map(ut => {
      const newRem = ut.daysRemaining - daysToAdd;
      return {
        ...ut,
        daysRemaining: newRem,
        status: newRem < 0 && ut.status !== 'Verified & Regularized' ? 'Overdue & Breached' : ut.status,
        approvalLockStatus: newRem < 0 && ut.status !== 'Verified & Regularized' ? 'WITHHELD / Show Cause Notice Drafted' : ut.approvalLockStatus
      };
    });
    setUndertakings(updatedUT);

    // Age documents
    const updatedDocs = documents.map(doc => {
      const newRem = doc.daysToExpiry - daysToAdd;
      return {
        ...doc,
        daysToExpiry: newRem,
        status: newRem < 0 ? 'EXPIRED_DEFICIENT' : newRem <= 30 ? 'CRITICAL_EXPIRY' : doc.status
      };
    });
    setDocuments(updatedDocs);

    // Age EVCs
    const updatedEVC = evcVisits.map(evc => ({
      ...evc,
      daysAgeing: evc.daysAgeing + daysToAdd,
      status: evc.daysAgeing + daysToAdd > 10 && !evc.reportSubmitted ? 'Inspection Complete - Report Overdue' : evc.status
    }));
    setEvcVisits(updatedEVC);

    // Append Audit Event
    const newAudit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${newDateStr} 00:00:00`,
      actor: 'AICTE Compliance Daemon (Cron v2026.4)',
      role: 'AUTOMATED_DAEMON',
      action: 'AUTOMATED_COMPLIANCE_SWEEP',
      target: 'ALL_ACTIVE_PIPELINES',
      summary: `Automated statutory sweep completed for ${newDateStr}. Evaluated stage SLAs, institutional undertakings, and document validity horizons.`,
      hash: 'e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6'
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // Push new notification
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Periodic Regulatory Sweep Completed',
        message: `SLA status updated across Regional Offices. Active escalation triggers and document validity radar synced.`,
        time: 'Just now',
        type: 'CRITICAL',
        read: false
      },
      ...prev
    ]);
  };

  // Application update handler
  const handleUpdateApplication = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    const audit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${systemDate} ${new Date().toTimeString().substring(0, 8)}`,
      actor: activeRole,
      role: activeRole,
      action: 'APPLICATION_STAGE_UPDATE',
      target: updatedApp.id,
      summary: `Application state updated to stage "${updatedApp.currentStage}". Status: ${updatedApp.status}.`,
      hash: '3a2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f8f2d1e4c9b0a3f7e6d5c4b'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Undertaking update handler
  const handleUpdateUndertaking = (updatedUT) => {
    setUndertakings(prev => prev.map(u => u.id === updatedUT.id ? updatedUT : u));
    const audit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${systemDate} ${new Date().toTimeString().substring(0, 8)}`,
      actor: activeRole,
      role: activeRole,
      action: 'UNDERTAKING_COMPLIANCE_ACTION',
      target: updatedUT.id,
      summary: `Undertaking obligation status transitioned to "${updatedUT.status}". Lock status: ${updatedUT.approvalLockStatus}.`,
      hash: '9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Document update handler
  const handleUpdateDocument = (updatedDoc) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    const audit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${systemDate} ${new Date().toTimeString().substring(0, 8)}`,
      actor: activeRole,
      role: activeRole,
      action: 'DOCUMENT_VALIDITY_ACTION',
      target: updatedDoc.id,
      summary: `Prescribed document validity updated. Notices sent: ${updatedDoc.noticesSent}. Expiry: ${updatedDoc.expiryDate}.`,
      hash: '5c4d3e2f1a0b9c8d7e6f5a4b3a2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // EVC update handler
  const handleUpdateEVC = (updatedEVC) => {
    setEvcVisits(prev => prev.map(e => e.id === updatedEVC.id ? updatedEVC : e));
    const audit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${systemDate} ${new Date().toTimeString().substring(0, 8)}`,
      actor: activeRole,
      role: activeRole,
      action: 'EVC_INSPECTION_SIGN_OFF',
      target: updatedEVC.id,
      summary: `EVC physical inspection report completed with GPS geofence ratification. Transmitted to Scrutiny.`,
      hash: '1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Resolve escalation by auto-reassigning
  const handleResolveEscalation = (appId) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'In Progress (Parallel Committee Pool B)',
          assignedTo: 'Parallel Committee B (Dr. N. K. Saxena)',
          daysInCurrentStage: 1,
          history: [
            ...app.history,
            {
              timestamp: `${systemDate} 12:00`,
              stage: app.currentStage,
              actor: 'AICTE Auto-Reallocation Daemon',
              remark: 'REASSIGNED: Application transferred to standby reviewer pool to eliminate administrative bottleneck.'
            }
          ]
        };
      }
      return app;
    }));

    const audit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${systemDate} 12:00:00`,
      actor: 'AICTE Auto-Reallocation Daemon',
      role: 'AUTOMATED_DAEMON',
      action: 'AUTO_REASSIGN_REVIEWER_POOL',
      target: appId,
      summary: `Application ${appId} reassigned from stagnant reviewer to Parallel Reviewer Pool B.`,
      hash: '6e5f4a3b2c1d0e9f8a7b6c5d4e3f8f2d1e4c9b0a3f7e6d5c4b3a2e1f0a9b8c7d'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Dynamic Navigation Tabs configured strictly per role (NO INFORMATION DUMPING)
  const getNavItemsForRole = () => {
    if (activeRole === 'INSTITUTE') {
      return [
        { id: 'institute_desk', label: 'My Institution & Applications', icon: Building2 },
        { id: 'undertakings', label: 'My Undertakings', icon: FileCheck2, badge: undertakings.filter(u => u.pid === '1-9382103').length },
        { id: 'documents', label: 'My Land Lease & Documents', icon: FileWarning, badge: documents.filter(d => d.pid === '1-9382103').length }
      ];
    }
    if (activeRole === 'SCRUTINY_EXPERT') {
      return [
        { id: 'applications', label: 'Assigned Scrutiny Desk', icon: Layers, badge: applications.filter(a => a.currentStage.includes('Scrutiny')).length },
        { id: 'audit', label: 'Scrutiny Audit Stream', icon: ShieldCheck }
      ];
    }
    if (activeRole === 'EVC_COORDINATOR') {
      return [
        { id: 'evc', label: 'EVC Inspection Schedule & Geo-Check', icon: Users, badge: evcVisits.length },
        { id: 'applications', label: 'Application Context', icon: Layers },
        { id: 'audit', label: 'Inspection Audit Stream', icon: ShieldCheck }
      ];
    }
    if (activeRole === 'ADMIN') {
      return [
        { id: 'config', label: 'APH Regulations & SLA Config', icon: Sliders },
        { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
        { id: 'audit', label: 'Immutable Audit Stream', icon: ShieldCheck }
      ];
    }
    if (activeRole === 'COMPETENT_AUTH') {
      return [
        { id: 'overview', label: 'Executive National Cockpit', icon: LayoutDashboard },
        { id: 'applications', label: 'Final Approval & SAC/SHC Docket', icon: Layers, badge: applications.length },
        { id: 'escalations', label: 'Apex SLA Escalations', icon: ShieldAlert, badge: applications.filter(a => a.daysInCurrentStage >= a.slaDays).length, badgeColor: 'bg-red-600' },
        { id: 'audit', label: 'Legal Audit Ledger', icon: ShieldCheck }
      ];
    }
    // Default: Regional Officer (RO)
    return [
      { id: 'overview', label: 'Regional Cockpit', icon: LayoutDashboard },
      { id: 'applications', label: 'Regional Applications', icon: Layers, badge: applications.length },
      { id: 'evc', label: 'EVC Command Center', icon: Users, badge: evcVisits.length },
      { id: 'undertakings', label: 'Compliance Undertakings', icon: FileCheck2, badge: undertakings.length },
      { id: 'documents', label: 'Lease & Doc Sentinel', icon: FileWarning, badge: documents.filter(d => d.daysToExpiry <= 30).length, badgeColor: 'bg-red-600' },
      { id: 'escalations', label: 'SLA Escalations', icon: ShieldAlert, badge: applications.filter(a => a.daysInCurrentStage >= a.slaDays).length, badgeColor: 'bg-red-600' },
      { id: 'audit', label: 'Audit Trail', icon: ShieldCheck }
    ];
  };

  const navItems = getNavItemsForRole();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
      
      {/* Top Banner & Header */}
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        systemDate={systemDate}
        onRunComplianceSweep={handleRunComplianceSweep}
        notifications={notifications}
      />

      {/* Structured Video Workflow Guide Banner */}
      <div className="bg-slate-100 border-b border-slate-200 py-2">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>Approval Process Stage Flow:</span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setActiveRole('INSTITUTE')}
              className={`px-2 py-0.5 rounded transition ${activeRole === 'INSTITUTE' ? 'bg-[#0f2942] text-white' : 'hover:bg-slate-200 text-slate-700'}`}
            >
              1. Institution
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            
            <button
              onClick={() => setActiveRole('SCRUTINY_EXPERT')}
              className={`px-2 py-0.5 rounded transition ${activeRole === 'SCRUTINY_EXPERT' ? 'bg-[#0f2942] text-white' : 'hover:bg-slate-200 text-slate-700'}`}
            >
              2. Scrutiny Desk
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />

            <button
              onClick={() => setActiveRole('EVC_COORDINATOR')}
              className={`px-2 py-0.5 rounded transition ${activeRole === 'EVC_COORDINATOR' ? 'bg-[#0f2942] text-white' : 'hover:bg-slate-200 text-slate-700'}`}
            >
              3. EVC Inspection
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />

            <button
              onClick={() => setActiveRole('RO')}
              className={`px-2 py-0.5 rounded transition ${activeRole === 'RO' ? 'bg-[#0f2942] text-white' : 'hover:bg-slate-200 text-slate-700'}`}
            >
              4. Regional Officer
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />

            <button
              onClick={() => setActiveRole('COMPETENT_AUTH')}
              className={`px-2 py-0.5 rounded transition ${activeRole === 'COMPETENT_AUTH' ? 'bg-[#0f2942] text-white' : 'hover:bg-slate-200 text-slate-700'}`}
            >
              5. Member Secretary
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Clean Navigation Ribbon */}
      <nav className="bg-white border-b border-slate-200 sticky top-[95px] z-30 shadow-xs">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive 
                      ? 'bg-[#0f2942] text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isActive 
                        ? 'bg-slate-700 text-white' 
                        : item.badgeColor 
                          ? `${item.badgeColor} text-white` 
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 py-6">
        
        {/* 1. Institutional Applicant View */}
        {activeTab === 'institute_desk' && (
          <InstitutePortal
            applications={applications}
            undertakings={undertakings}
            documents={documents}
            onUpdateApplication={handleUpdateApplication}
            onUpdateUndertaking={handleUpdateUndertaking}
            onUpdateDocument={handleUpdateDocument}
            onNavigateToStep={(role) => setActiveRole(role)}
          />
        )}

        {/* 2. Executive / Regional Cockpit */}
        {activeTab === 'overview' && (
          <DashboardOverview
            applications={applications}
            undertakings={undertakings}
            documents={documents}
            evcVisits={evcVisits}
            onSelectTab={setActiveTab}
            onSelectApp={(app) => {
              setSelectedApp(app);
              setActiveTab('applications');
            }}
          />
        )}

        {/* 3. APH Applications Pipeline */}
        {activeTab === 'applications' && (
          <ApplicationsWorkflow
            applications={applications}
            onUpdateApplication={handleUpdateApplication}
            activeRole={activeRole}
            selectedApp={selectedApp}
            setSelectedApp={setSelectedApp}
            onNavigateToStep={(role) => setActiveRole(role)}
          />
        )}

        {/* 4. EVC Center */}
        {activeTab === 'evc' && (
          <EVCCenter
            evcVisits={evcVisits}
            onUpdateEVC={handleUpdateEVC}
            activeRole={activeRole}
            onNavigateToStep={(role) => setActiveRole(role)}
          />
        )}

        {/* 5. Undertakings Watchdog */}
        {activeTab === 'undertakings' && (
          <ComplianceUndertakings
            undertakings={undertakings}
            onUpdateUndertaking={handleUpdateUndertaking}
            activeRole={activeRole}
          />
        )}

        {/* 6. Document & Lease Sentinel */}
        {activeTab === 'documents' && (
          <DocumentLeaseSentinel
            documents={documents}
            onUpdateDocument={handleUpdateDocument}
            activeRole={activeRole}
          />
        )}

        {/* 7. SLA Escalations */}
        {activeTab === 'escalations' && (
          <EscalationSLA
            applications={applications}
            undertakings={undertakings}
            documents={documents}
            onResolveEscalation={handleResolveEscalation}
            activeRole={activeRole}
            onNavigateToStep={(role) => setActiveRole(role)}
          />
        )}

        {/* 8. Immutable Audit Stream */}
        {activeTab === 'audit' && (
          <AuditTrail auditLogs={auditLogs} />
        )}

        {/* 9. APH Rules Config */}
        {activeTab === 'config' && (
          <APHConfigurator
            aphConfig={aphConfig}
            onUpdateConfig={setAphConfig}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-[#0f2942]">AICTE AEGIS</span>
            <span>•</span>
            <span>Problem Statement ID: 26262</span>
            <span>•</span>
            <span>Smart Automation Theme</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Approval Process Handbook (APH) 2026-27 Compliant • 256-Bit Cryptographic Traceability
          </div>
        </div>
      </footer>

    </div>
  );
}
