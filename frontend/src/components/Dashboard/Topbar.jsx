import React from 'react';
import { 
  Play, Pause, RotateCcw, Zap, CloudRain, Sun, Wind, 
  Shield, Building2, Bus, Hotel, Users, GitCompare, LayoutGrid
} from 'lucide-react';

export const ROLES = [
  { id: 'MASTER_ORCHESTRATOR', name: 'Master Orchestrator', shortName: 'Master', icon: Zap, color: 'from-cyan-600 to-blue-600' },
  { id: 'VENUE_OPS', name: 'Venue Operations', shortName: 'Venues', icon: Building2, color: 'from-emerald-600 to-teal-600' },
  { id: 'TRANSIT_CHIEF', name: 'Transit & Mobility', shortName: 'Transit', icon: Bus, color: 'from-amber-600 to-orange-600' },
  { id: 'HOSPITALITY_LEAD', name: 'Hospitality Lead', shortName: 'Hospitality', icon: Hotel, color: 'from-purple-600 to-pink-600' },
  { id: 'PUBLIC_SAFETY', name: 'Public Safety', shortName: 'Safety', icon: Shield, color: 'from-rose-600 to-red-600' },
];

export default function Topbar({ 
  telemetry, 
  activeRole, 
  setActiveRole, 
  onToggleSim, 
  onSetSpeed, 
  onResetSim,
  onOpenBeforeAfter,
  onOpenInfraModal
}) {
  const isRunning = telemetry?.is_running ?? true;
  const speed = telemetry?.speed_multiplier ?? 1.0;
  const time = telemetry?.event_time ?? '19:45:00';
  const weather = telemetry?.weather;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 sticky top-0 z-50 shadow-sm w-full max-w-[1920px] mx-auto box-border">
      {/* Responsive Header: flex-col on mobile/tablet, single flex-row on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5 sm:gap-2 lg:gap-3 w-full min-w-0">
        
        {/* Top/Main Row: Brand on Left, Controls & 'Before vs After' on Right (for mobile/tablet) */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 min-w-0 w-full lg:w-auto">
          {/* Brand & Event Title */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20 border border-white/40 shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-cyan-500"></span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <h1 className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-slate-900 font-heading whitespace-nowrap">
                  EVENTFLOW AI
                </h1>
                <span className="hidden sm:inline-block text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
                  PS 8
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 font-medium whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="hidden sm:inline">Olympic District Digital Twin</span>
                <span className="inline sm:hidden">Digital Twin</span>
              </p>
            </div>
          </div>

          {/* Right Controls for Mobile / Compact Viewports (< lg) */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Live Clock Badge */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-cyan-200 shadow-2xs shrink-0 select-none">
              <span className={`text-[8px] uppercase font-black tracking-wider flex items-center gap-1 ${isRunning ? 'text-cyan-600' : 'text-amber-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isRunning ? 'LIVE' : 'PAUSED'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 tracking-wider">{time}</span>
            </div>

            {/* Play/Pause & Speed/Reset Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-inner shrink-0">
              <button
                onClick={onToggleSim}
                className={`p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                  isRunning 
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-xs' 
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-xs animate-pulse'
                }`}
                title={isRunning ? "Pause Simulation" : "Start Simulation"}
              >
                {isRunning ? <Pause className="w-3 h-3 fill-amber-700 text-amber-700" /> : <Play className="w-3 h-3 fill-emerald-700 text-emerald-700 ml-0.5" />}
              </button>

              <div className="flex items-center ml-0.5 border-l border-slate-200 pl-0.5">
                <button
                  onClick={() => onSetSpeed(speed === 1.0 ? 2.0 : speed === 2.0 ? 5.0 : 1.0)}
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
                  title="Cycle speed (1x, 2x, 5x)"
                >
                  {speed}x
                </button>
              </div>

              <button
                onClick={onResetSim}
                className="p-1 ml-0.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200/70 rounded-lg transition-all active:scale-90 active:rotate-180 cursor-pointer"
                title="Reset Simulation Baseline"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Before vs After Button (Mobile) */}
            <button
              onClick={onOpenBeforeAfter}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-[11px] font-bold text-white shadow-md shadow-cyan-600/20 border border-cyan-500/30 transition-all hover:shadow-lg active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              title="Open Before vs After Comparison Modal"
            >
              <GitCompare className="w-3 h-3" />
              <span>Before vs After</span>
            </button>
          </div>
        </div>

        {/* Center: Role Navigation Bar (Master, Venues, Transit, Hospitality, Public Safety) */}
        <nav 
          aria-label="Operational Roles" 
          className="flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-xl border border-slate-200/80 shadow-inner overflow-x-auto no-scrollbar min-w-0 w-full lg:w-auto lg:flex-1 max-w-fit justify-start lg:justify-center mx-auto"
        >
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive 
                    ? `bg-gradient-to-r ${role.color} text-white shadow-md shadow-slate-300 font-bold scale-[1.02]`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
                title={role.name}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden 2xl:inline">{role.name}</span>
                <span className="inline 2xl:hidden">{role.shortName}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls for Desktop Viewports (lg:flex, hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 shrink-0">
          {/* Weather Badge */}
          {weather && (
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-2xs shrink-0 select-none">
              {weather.condition === 'THUNDERSTORM' ? (
                <CloudRain className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="font-bold text-slate-800">{weather.temperature_c}°C</span>
            </div>
          )}

          {/* Live Event Clock */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-50 border border-cyan-200 shadow-2xs shrink-0 select-none">
            <span className={`text-[9px] uppercase font-black tracking-wider flex items-center gap-1 ${isRunning ? 'text-cyan-600' : 'text-amber-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {isRunning ? 'LIVE' : 'PAUSED'}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 tracking-wider">
              {time}
            </span>
          </div>

          {/* Play/Pause & Speed Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shadow-inner shrink-0">
            <button
              onClick={onToggleSim}
              className={`p-1 sm:p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                isRunning 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-xs' 
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-xs animate-pulse'
              }`}
              title={isRunning ? "Pause Simulation" : "Start Simulation"}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-amber-700 text-amber-700" /> : <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700 ml-0.5" />}
            </button>

            <div className="flex items-center ml-0.5 border-l border-slate-200 pl-0.5">
              {[1.0, 2.0, 5.0].map((s) => (
                <button
                  key={s}
                  onClick={() => onSetSpeed(s)}
                  className={`px-1.5 sm:px-2 py-0.5 text-[11px] font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                    speed === s 
                      ? 'bg-cyan-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`Set Speed ${s}x`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={onResetSim}
              className="p-1 sm:p-1.5 ml-0.5 text-slate-500 hover:text-rose-600 hover:bg-slate-200/70 rounded-lg transition-all active:scale-90 active:rotate-180 cursor-pointer"
              title="Reset Simulation Baseline"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Action Modals */}
          <button
            onClick={onOpenInfraModal}
            className="hidden 2xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-300 shadow-2xs transition-all hover:shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
            title="Open Infrastructure Matrix"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-600" />
            <span>Matrix</span>
          </button>

          {/* Before vs After Button (Desktop) */}
          <button
            onClick={onOpenBeforeAfter}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-md shadow-cyan-600/20 border border-cyan-500/30 transition-all hover:shadow-lg active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            title="Open Before vs After Comparison Modal"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Before vs After</span>
          </button>
        </div>

      </div>
    </header>
  );
}
