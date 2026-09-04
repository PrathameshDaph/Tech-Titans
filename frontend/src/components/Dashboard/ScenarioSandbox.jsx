import React, { useState } from 'react';
import { 
  AlertOctagon, Users, ShieldAlert, CloudLightning, 
  Train, Sliders, Play, RotateCcw, Flame
} from 'lucide-react';

export default function ScenarioSandbox({ activeScenario, onTriggerScenario, onResetSim }) {
  const [surgeScale, setSurgeScale] = useState(50);
  const [roadCapacity, setRoadCapacity] = useState(0);
  const [transitReadiness, setTransitReadiness] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTrigger = async (type, params = {}) => {
    setIsSubmitting(true);
    try {
      await onTriggerScenario({
        scenario_type: type,
        magnitude_pct: surgeScale,
        ...params
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scenarios = [
    {
      id: 'VISITOR_SURGE',
      title: 'Sudden Visitor Surge',
      description: '+45,000 attendees rushing Grand Stadium (Venue 1)',
      icon: Users,
      badge: 'Crowd Pressure',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      color: 'border-rose-200 hover:border-rose-400 text-rose-600 bg-gradient-to-br from-rose-50/60 to-white',
      btnColor: 'text-rose-700 hover:text-rose-900',
      action: () => handleTrigger('VISITOR_SURGE', { target_id: 'venue-1' })
    },
    {
      id: 'ROAD_CLOSURE',
      title: 'Arterial Road Closure',
      description: 'Olympic Central Boulevard spine blocked',
      icon: AlertOctagon,
      badge: 'Traffic Gridlock',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      color: 'border-amber-200 hover:border-amber-400 text-amber-600 bg-gradient-to-br from-amber-50/60 to-white',
      btnColor: 'text-amber-700 hover:text-amber-900',
      action: () => handleTrigger('ROAD_CLOSURE', { target_id: 'road-1' })
    },
    {
      id: 'WEATHER_ALERT',
      title: 'Severe Thunderstorm',
      description: '92% precipitation, evacuate Outdoor Horizon Plaza',
      icon: CloudLightning,
      badge: 'Weather Crisis',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      color: 'border-purple-200 hover:border-purple-400 text-purple-600 bg-gradient-to-br from-purple-50/60 to-white',
      btnColor: 'text-purple-700 hover:text-purple-900',
      action: () => handleTrigger('WEATHER_ALERT')
    },
    {
      id: 'METRO_OUTAGE',
      title: 'HyperMetro Line Outage',
      description: 'Central Substation offline, 8,400 passengers trapped',
      icon: Train,
      badge: 'Transit Shock',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      color: 'border-sky-200 hover:border-sky-400 text-sky-600 bg-gradient-to-br from-sky-50/60 to-white',
      btnColor: 'text-sky-700 hover:text-sky-900',
      action: () => handleTrigger('METRO_OUTAGE')
    }
  ];

  return (
    <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2">
              What-If Scenario Sandbox
            </h2>
            <p className="text-xs text-slate-500">Stress-test district resiliency under high-contingency events</p>
          </div>
        </div>

        {activeScenario && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-800 border border-rose-300 animate-pulse shadow-xs">
              Active: {activeScenario.replace('_', ' ')}
            </span>
            <button
              onClick={onResetSim}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Clear Scenario"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrent = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              disabled={isSubmitting}
              onClick={sc.action}
              className={`p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md ${sc.color} ${
                isCurrent ? 'ring-2 ring-rose-500 shadow-md shadow-rose-500/15' : 'shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 font-heading tracking-wide">
                    {sc.title}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {sc.description}
              </p>
              <div className={`mt-3 flex items-center text-xs font-bold ${sc.btnColor} transition-colors`}>
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Inject Crisis Vector
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive What-If Parameter Sliders */}
      <div className="mt-1 pt-3.5 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5 font-bold">
            <Sliders className="w-4 h-4 text-cyan-600" />
            Surge Magnitude Modifier
          </span>
          <span className="text-cyan-800 font-mono font-bold bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">+{surgeScale}% influx</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={surgeScale}
          onChange={(e) => setSurgeScale(Number(e.target.value))}
          className="w-full accent-cyan-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Simulation Speed: <strong className="text-slate-800 font-semibold">Active</strong></span>
          <span>Buffer Fleet: <strong className="text-slate-800 font-semibold">{transitReadiness}% Standby</strong></span>
        </div>
      </div>
    </div>
  );
}
