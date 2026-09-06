import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, Cpu, CheckCircle2, ChevronRight, RefreshCw, BarChart2 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PredictionPanel({ predictions, onRefreshPredictions, isOptimized }) {
  const [activeHorizon, setActiveHorizon] = useState(60);

  const horizons = predictions?.horizons || [
    { horizon_minutes: 30, horizon_mins: 30, predicted_visitors: 118000, projected_active_visitors: 118000, predicted_congestion_index: 52.0, predicted_avg_congestion_pct: 52.0, risk_level: 'MODERATE', bottleneck_zones: ["Olympic Boulevard Corridor"] },
    { horizon_minutes: 60, horizon_mins: 60, predicted_visitors: 126000, projected_active_visitors: 126000, predicted_congestion_index: 68.4, predicted_avg_congestion_pct: 68.4, risk_level: 'HIGH', bottleneck_zones: ["Grand Stadium Gate A", "Central HyperMetro Ingress"] },
    { horizon_minutes: 90, horizon_mins: 90, predicted_visitors: 139000, projected_active_visitors: 139000, predicted_congestion_index: 74.2, predicted_avg_congestion_pct: 74.2, risk_level: 'HIGH', bottleneck_zones: ["Tech Dome Concourse", "North Express Hub"] },
    { horizon_minutes: 120, horizon_mins: 120, predicted_visitors: 148000, projected_active_visitors: 148000, predicted_congestion_index: 79.0, predicted_avg_congestion_pct: 79.0, risk_level: 'CRITICAL', bottleneck_zones: ["Grand Stadium Turnstiles", "Central Loop Spine"] }
  ];

  const selectedHorizon = horizons.find(h => (h.horizon_minutes || h.horizon_mins) === activeHorizon) || horizons[1] || horizons[0];

  const chartData = {
    labels: horizons.map(h => `T+${h.horizon_minutes || h.horizon_mins || 60}m`),
    datasets: [
      {
        label: 'Predicted Road Congestion (%)',
        data: horizons.map(h => h.predicted_congestion_index ?? h.predicted_avg_congestion_pct ?? 45.0),
        borderColor: '#e11d48',
        backgroundColor: 'rgba(225, 29, 72, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#e11d48'
      },
      {
        label: 'Safe Capacity Threshold (65%)',
        data: horizons.map(() => 65),
        borderColor: 'rgba(5, 150, 105, 0.7)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#475569',
          font: { size: 11, family: 'Inter', weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0284c7',
        bodyColor: '#0f172a',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  const projVisitors = selectedHorizon?.predicted_visitors ?? selectedHorizon?.projected_active_visitors ?? 126000;
  const projCong = selectedHorizon?.predicted_congestion_index ?? selectedHorizon?.predicted_avg_congestion_pct ?? 68.4;
  const rawBottlenecks = selectedHorizon?.bottleneck_zones || [
    "Grand Stadium Gate A (Turnstiles Overload)",
    "Central HyperMetro Ingress"
  ];
  const bottleneckList = Array.isArray(rawBottlenecks) 
    ? rawBottlenecks.map(b => (typeof b === 'object' ? (b.zone_name || b.zone_id || 'Bottleneck Zone') : String(b)))
    : ["Grand Stadium Gate A"];

  const keyFindings = predictions?.key_findings || [
    "District equilibrium stable. Inflow patterns nominal across all 4 arena concourses.",
    "Transit HyperMetro Line 1 operating at optimal throughput of 4.2 min headways."
  ];

  return (
    <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 min-w-0">
      {/* Panel Header */}
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 shadow-xs shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2 truncate">
              AI Predictive Bottleneck Horizon (30–120m)
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {predictions?.algorithm || predictions?.prediction_engine || "XGBoost & Temporal Graph Neural Predictor"}
            </p>
          </div>
        </div>

        {onRefreshPredictions && (
          <button
            onClick={onRefreshPredictions}
            className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-1 cursor-pointer"
            title="Recalculate AI Prediction"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizon Tabs */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-inner min-w-0 overflow-x-auto no-scrollbar">
        {[30, 60, 90, 120].map((mins) => {
          const hData = horizons.find(h => (h.horizon_minutes || h.horizon_mins) === mins);
          const riskStr = hData?.risk_level || hData?.predicted_risk_level;
          const isCrit = riskStr === 'CRITICAL';
          const isHigh = riskStr === 'HIGH';
          return (
            <button
              key={mins}
              onClick={() => setActiveHorizon(mins)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeHorizon === mins
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>T+{mins}m</span>
              {(isCrit || isHigh) && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${isCrit ? 'bg-rose-400 animate-ping' : 'bg-amber-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Prediction Chart */}
      <div className="h-40 w-full relative bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Selected Horizon Metrics Card */}
      {selectedHorizon && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Projected District Headcount:</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">{projVisitors.toLocaleString()} pax</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Predicted Peak Congestion:</span>
            <span className={`font-black font-mono text-sm ${projCong > 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {projCong}%
            </span>
          </div>

          <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-800">
              Identified Bottleneck Zones (T+{activeHorizon}m):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {bottleneckList.map((zone, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 shadow-2xs"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  {zone}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Root Cause & Key Findings */}
      {keyFindings && (
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            AI Executive Insights:
          </div>
          <ul className="space-y-1 text-slate-600 text-xs pl-2 border-l-2 border-cyan-500/60 font-medium">
            {keyFindings.slice(0, 2).map((kf, i) => (
              <li key={i} className="leading-relaxed">{typeof kf === 'object' ? JSON.stringify(kf) : String(kf)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
