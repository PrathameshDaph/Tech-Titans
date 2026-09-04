import React, { useState, useEffect } from 'react';
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

  const horizons = predictions?.horizons || [];
  const selectedHorizon = horizons.find(h => h.horizon_minutes === activeHorizon) || horizons[1] || horizons[0];

  const chartData = {
    labels: horizons.map(h => `T+${h.horizon_minutes}m`),
    datasets: [
      {
        label: 'Predicted Road Congestion (%)',
        data: horizons.map(h => h.predicted_congestion_index),
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
              {predictions?.algorithm || "XGBoost & Temporal Graph Neural Predictor"}
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshPredictions}
          className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-1"
          title="Recalculate AI Prediction"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Horizon Tabs */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-inner min-w-0 overflow-x-auto no-scrollbar">
        {[30, 60, 90, 120].map((mins) => {
          const hData = horizons.find(h => h.horizon_minutes === mins);
          const isCrit = hData?.risk_level === 'CRITICAL';
          const isHigh = hData?.risk_level === 'HIGH';
          return (
            <button
              key={mins}
              onClick={() => setActiveHorizon(mins)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
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
            <span className="font-extrabold text-slate-900 font-mono text-sm">{selectedHorizon.predicted_visitors.toLocaleString()} pax</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Predicted Peak Congestion:</span>
            <span className={`font-black font-mono text-sm ${selectedHorizon.predicted_congestion_index > 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {selectedHorizon.predicted_congestion_index}%
            </span>
          </div>

          <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-800">
              Identified Bottleneck Zones (T+{activeHorizon}m):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {selectedHorizon.bottleneck_zones.map((zone, idx) => (
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
      {predictions?.key_findings && (
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            AI Executive Insights:
          </div>
          <ul className="space-y-1 text-slate-600 text-xs pl-2 border-l-2 border-cyan-500/60 font-medium">
            {predictions.key_findings.slice(0, 2).map((kf, i) => (
              <li key={i} className="leading-relaxed">{kf}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
