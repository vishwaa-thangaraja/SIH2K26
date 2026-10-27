import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, Bell, Clock, Calendar, 
  UserCheck, RefreshCw, ChevronDown, CheckCircle, 
  AlertTriangle, ArrowRight, Zap, FileText
} from 'lucide-react';
import { ROLES } from '../data/regulatoryData';

export function Header({ 
  activeRole, 
  setActiveRole, 
  systemDate, 
  onRunComplianceSweep,
  notifications
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Real-time ticking clock for production fidelity
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentRoleObj = ROLES.find(r => r.id === activeRole) || ROLES[0];
  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Main Government Banner */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Council Details */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Emblem Circle */}
            <div className="relative flex-shrink-0 w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-[#0f2942] to-[#1e3a5f] rounded-full p-1 border-2 border-orange-500 shadow-md flex items-center justify-center text-white">
              <div className="text-center">
                <span className="block text-[11px] font-bold tracking-widest text-orange-400">AICTE</span>
                <span className="block text-[8px] font-medium uppercase tracking-tight text-slate-300">Govt of India</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-0.5 border-2 border-white">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  अखिल भारतीय तकनीकी शिक्षा परिषद्
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded border border-orange-200">
                  NATIONAL REGULATORY PORTAL
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#0f2942] tracking-tight flex items-center gap-2">
                AICTE PRAVAAH
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 hidden md:inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Continuous Compliance Sentinel
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Unified Approval Workflow, Institutional Compliance Monitoring & Automated Escalation Management System
              </p>
            </div>
          </div>

          {/* Interactive Controls Bar: System Time & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Real-Time Live Clock & Server Indicator */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1.5 shadow-xs">
              <div className="flex items-center space-x-2 px-2 text-xs font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span className="font-semibold text-slate-900">{systemDate}</span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <Clock className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                <span className="font-mono font-semibold text-slate-700 hidden sm:inline">{currentTime || '10:00:00 AM'} IST</span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-[11px] text-emerald-700 font-semibold hidden md:flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  NIC Server Active
                </span>
              </div>
              <div className="border-l border-slate-200 pl-1.5">
                <button
                  onClick={onRunComplianceSweep}
                  title="Run Scheduled Compliance Assessment & SLA Sync"
                  className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded shadow-xs transition flex items-center gap-1 active:scale-95"
                >
                  <RefreshCw className="w-3 h-3 text-blue-600" />
                  <span>Sync SLA Cycle</span>
                </button>
              </div>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-xs transition ${currentRoleObj.badge}`}
              >
                <UserCheck className="w-4 h-4" />
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-slate-500 font-normal">Active Role</span>
                  <span className="block font-bold">{currentRoleObj.label}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-1" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Officer / Role Delegation
                  </div>
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setActiveRole(role.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start space-x-2 transition ${
                        activeRole === role.id ? 'bg-orange-50/70 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        <UserCheck className={`w-3.5 h-3.5 ${activeRole === role.id ? 'text-orange-600 font-bold' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{role.label}</div>
                        <div className="text-[11px] text-slate-600">{role.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{role.org}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Alert Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 relative transition"
                title="System Notifications & Regulatory Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadAlerts}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-slate-700" />
                      Live Alert Feed & Escalations
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {unreadAlerts} Unacknowledged
                    </span>
                  </div>
                  <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-2.5 rounded-lg text-xs border transition ${
                          notif.type === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-900' :
                          notif.type === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                          'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="flex items-center gap-1">
                            {notif.type === 'CRITICAL' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                            {notif.title}
                          </span>
                          <span className="text-[10px] opacity-75 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Sub-banner: Current Session Context Bar */}
      <div className="bg-[#0f2942] text-white border-t border-slate-700 py-1.5 text-xs">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-orange-500/30 text-orange-300 rounded font-semibold text-[10px] tracking-wide border border-orange-400/30">
              LOGGED IN AS:
            </span>
            <span className="font-semibold text-slate-100">{currentRoleObj.name}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 text-[11px] hidden sm:inline">{currentRoleObj.org}</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit Cryptographic Audit Stream Active
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              APH Regulations 2026-27 Compliant
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
