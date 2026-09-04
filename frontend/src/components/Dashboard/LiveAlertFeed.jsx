import React from 'react';
import { AlertTriangle, CheckCircle2, Info, Bell, ShieldAlert } from 'lucide-react';

export default function LiveAlertFeed({ alerts, onAcknowledgeAlert }) {
  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          border: 'border-rose-200 bg-rose-50/70',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: ShieldAlert,
          iconColor: 'text-rose-600',
          titleColor: 'text-rose-950'
        };
      case 'HIGH':
        return {
          border: 'border-amber-200 bg-amber-50/70',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-950'
        };
      case 'MODERATE':
        return {
          border: 'border-yellow-200 bg-yellow-50/70',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: Info,
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-950'
        };
      default:
        return {
          border: 'border-slate-200 bg-slate-50/70',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          titleColor: 'text-slate-900'
        };
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 font-heading">
              Live Alert & Incident Telemetry
            </h2>
            <p className="text-xs text-slate-500">Automated sensor & vision stream</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
          {alerts?.length || 0} Events
        </span>
      </div>

      {/* Alert Feed Items */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {(!alerts || alerts.length === 0) ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No active incidents. System operating under nominal baseline.
          </div>
        ) : (
          alerts.map((alt) => {
            const style = getSeverityStyle(alt.severity);
            const Icon = style.icon;
            return (
              <div
                key={alt.id}
                className={`p-3.5 rounded-xl border ${style.border} transition-all space-y-2 shadow-xs`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
                    <h4 className={`text-xs font-bold ${style.titleColor} font-heading`}>
                      {alt.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${style.badge}`}>
                      {alt.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alt.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {alt.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                  <span className="text-slate-600">
                    Action: <strong className="text-cyan-800 font-bold">{alt.action_required}</strong>
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">Source: {alt.source}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
