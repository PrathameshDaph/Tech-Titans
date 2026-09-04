import React from 'react';
import { 
  X, CheckCircle, TrendingDown, TrendingUp, 
  GitCompare, ShieldCheck, Zap, Activity 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BeforeAfterModal({ isOpen, onClose, comparisonData, isOptimized }) {
  if (!isOpen) return null;

  const metrics = comparisonData || [
    { metric_name: "Avg Road Congestion", before_value: 84.5, after_value: 29.2, unit: "%", improvement_pct: 65.4, is_positive: true },
    { metric_name: "Transit Station Wait Time", before_value: 24.8, after_value: 4.6, unit: "mins", improvement_pct: 81.4, is_positive: true },
    { metric_name: "Turnstile Ingress Queue", before_value: 32.0, after_value: 6.5, unit: "mins", improvement_pct: 79.6, is_positive: true },
    { metric_name: "Critical Risk Bottlenecks", before_value: 6.0, after_value: 1.0, unit: "zones", improvement_pct: 83.3, is_positive: true },
    { metric_name: "Carbon Emissions Rate", before_value: 3420.0, after_value: 1680.0, unit: "kg/hr", improvement_pct: 50.8, is_positive: true }
  ];

  const chartData = {
    labels: metrics.map(m => m.metric_name),
    datasets: [
      {
        label: 'Before AI Intervention (Unmitigated Bottleneck)',
        data: metrics.map(m => m.before_value),
        backgroundColor: 'rgba(225, 29, 72, 0.8)',
        borderColor: '#e11d48',
        borderWidth: 1,
        borderRadius: 8
      },
      {
        label: 'After EventFlow AI Optimization (OR-Tools + Digital Twin)',
        data: metrics.map(m => m.after_value),
        backgroundColor: 'rgba(5, 150, 105, 0.85)',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#475569', font: { size: 11, family: 'Inter', weight: '600' } }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0284c7',
        bodyColor: '#0f172a',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        padding: 10
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#475569', font: { size: 11, weight: '500' } }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading tracking-tight">
              Before vs After AI Optimization Impact Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Quantifiable operational benchmarks comparing unmitigated bottleneck vs EventFlow AI resolution
            </p>
          </div>
        </div>

        {/* Comparative KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-2"
            >
              <span className="text-xs font-bold text-slate-600 block truncate">
                {m.metric_name}
              </span>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-rose-500 line-through mr-2 font-mono font-bold">
                    {m.before_value} {m.unit}
                  </span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {m.after_value} {m.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Efficiency Delta:</span>
                <span className="flex items-center gap-1 font-extrabold text-emerald-700">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  {Math.abs(m.improvement_pct)}% Improvement
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparative Chart */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-600" />
            Performance Delta Metric Visualization
          </h3>
          <div className="h-60 w-full bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Executive Impact Takeaways */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 border border-cyan-200 flex items-start gap-3.5 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-cyan-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm">
              EventFlow AI Cross-Domain Orchestration ROI:
            </h4>
            <p className="leading-relaxed font-normal">
              Enacting Google OR-Tools dynamic route gating, 15 high-capacity express shuttle bridges, 
              and hotel staging buffers resolved the +45,000 attendee surge in <strong className="text-slate-900 font-bold">18 minutes</strong> (down from 72 minutes projected baseline). 
              Carbon emissions were curtailed by <strong className="text-emerald-800 font-bold">50.8%</strong>, and critical safety hazards were reduced to near zero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
