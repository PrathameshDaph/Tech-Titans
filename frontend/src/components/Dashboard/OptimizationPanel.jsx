import React, { useState } from 'react';
import { 
  Sparkles, Check, Play, ArrowRight, ShieldCheck, 
  Bus, GitFork, ArrowLeftRight, Hotel, Zap, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OptimizationPanel({ 
  optimizationData, 
  onRunOptimization, 
  onApplyOptimization, 
  isOptimized 
}) {
  const [isRunningSolver, setIsRunningSolver] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState([
    "DEPLOY_SHUTTLE_BRIDGE",
    "REDISTRIBUTE_PEDESTRIANS",
    "DYNAMIC_LANE_REVERSAL",
    "ACTIVATE_HOTEL_BUFFER"
  ]);

  const handleRunSolver = async () => {
    setIsRunningSolver(true);
    try {
      await onRunOptimization();
    } finally {
      setIsRunningSolver(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApplyOptimization(selectedRecommendations);
      // Trigger celebratory confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#059669', '#3b82f6', '#d97706']
      });
    } finally {
      setIsApplying(false);
    }
  };

  const recommendations = optimizationData?.recommendations || [];

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'TRANSIT': return Bus;
      case 'PEDESTRIAN': return GitFork;
      case 'ROAD_NETWORK': return ArrowLeftRight;
      case 'HOSPITALITY': return Hotel;
      default: return Sparkles;
    }
  };

  return (
    <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between min-w-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2 truncate">
              Google OR-Tools Optimization Engine
            </h2>
            <p className="text-xs text-slate-500 truncate">
              Cross-domain resource balancing & dynamic route gating
            </p>
          </div>
        </div>

        <button
          disabled={isRunningSolver}
          onClick={handleRunSolver}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 border border-cyan-500/30 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 shrink-0 whitespace-nowrap"
        >
          {isRunningSolver ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Solving MIP...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Run OR-Tools Solver</span>
            </>
          )}
        </button>
      </div>

      {/* Solver Status Banner */}
      {optimizationData && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-semibold">Status:</span>
            <span className="font-extrabold text-emerald-700 font-mono">
              {optimizationData.solver_status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 text-xs">
            <span>Solve Time: <strong className="text-cyan-700 font-mono">{optimizationData.solve_time_ms} ms</strong></span>
            <span>Objective Score: <strong className="text-purple-700 font-mono">{optimizationData.objective_value}</strong></span>
          </div>
        </div>
      )}

      {/* Actionable Recommendations List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-xl space-y-2 bg-slate-50/50">
            <p className="font-semibold text-slate-700">No active solver solutions yet.</p>
            <p className="text-slate-500">Trigger a scenario above or click "Run OR-Tools Solver" to generate mathematical recommendations.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const Icon = getDomainIcon(rec.domain);
            return (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-cyan-700 border border-slate-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-heading">
                        {rec.title}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        {rec.domain} • Priority: <span className="text-rose-600">{rec.priority}</span>
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    MIP Verified
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {rec.action_summary}
                </p>

                <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-700 border border-slate-200 font-mono">
                  <span className="text-cyan-800 font-bold">Mathematical Proof:</span> {rec.mathematical_justification}
                </div>

                {/* Expected Impacts */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 text-xs">
                  {Object.entries(rec.expected_impact).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                      <strong className="text-emerald-700 font-bold">{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply Optimization CTA */}
      {recommendations.length > 0 && (
        <button
          disabled={isApplying || isOptimized}
          onClick={handleApply}
          className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
            isOptimized 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default shadow-xs'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/25 cursor-pointer hover:shadow-lg'
          }`}
        >
          {isOptimized ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Optimizations Actively Enacted in Digital Twin</span>
            </>
          ) : isApplying ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Applying Interventions...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Apply Recommendations to Digital Twin</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
