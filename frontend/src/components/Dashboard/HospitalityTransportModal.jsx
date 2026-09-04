import React, { useState } from 'react';
import { X, Building, Bus, Hotel, Car, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function HospitalityTransportModal({ isOpen, onClose, telemetry }) {
  const [activeTab, setActiveTab] = useState('VENUES');

  if (!isOpen) return null;

  const venues = telemetry?.venues || [];
  const transitNodes = telemetry?.transit_nodes || [];
  const hotels = telemetry?.hotels || [];
  const parkingHubs = telemetry?.parking_hubs || [];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              District Infrastructure Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Cross-domain live registry of all venues, transit depots, hospitality clusters, and parking hubs
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          {[
            { id: 'VENUES', label: `Venues (${venues.length})`, icon: Building },
            { id: 'TRANSIT', label: `Transit Hubs (${transitNodes.length})`, icon: Bus },
            { id: 'HOTELS', label: `Hotels (${hotels.length})`, icon: Hotel },
            { id: 'PARKING', label: `Smart Parking (${parkingHubs.length})`, icon: Car }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'VENUES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {venues.map((v) => (
              <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-cyan-800 font-heading">{v.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{v.category} • {v.scheduled_event}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${v.risk_level === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                    {v.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs pt-1">
                  <span className="text-slate-600">Occupancy:</span>
                  <span className="font-mono font-bold text-slate-900">{v.current_occupancy.toLocaleString()} / {v.capacity.toLocaleString()} ({v.occupancy_pct}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${v.occupancy_pct > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${v.occupancy_pct}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Inflow: <strong className="text-emerald-700 font-semibold">{v.inflow_rate} pax/min</strong></span>
                  <span>Outflow: <strong className="text-amber-700 font-semibold">{v.outflow_rate} pax/min</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'TRANSIT' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {transitNodes.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-800 font-heading">{t.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{t.type} Transit Backbone</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                    {t.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs pt-1">
                  <span className="text-slate-600">Waiting Passengers:</span>
                  <span className="font-mono font-bold text-slate-900">{t.current_waiting.toLocaleString()} pax</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-600">Average Headway Wait:</span>
                  <span className="font-mono font-bold text-amber-700">{t.avg_wait_time_mins} minutes</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-600">Active Shuttles / Pods:</span>
                  <span className="font-mono font-bold text-cyan-700">{t.active_vehicles} units</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'HOTELS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {hotels.map((h) => (
              <div key={h.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between">
                  <h4 className="font-extrabold text-sm text-purple-800 font-heading">{h.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    {h.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs pt-1">
                  <span className="text-slate-600">Room Occupancy:</span>
                  <span className="font-mono font-bold text-slate-900">{h.occupied_rooms} / {h.total_rooms} ({h.occupancy_pct}%)</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-600">Emergency Buffer Capacity:</span>
                  <span className="font-mono font-bold text-emerald-700">{h.evacuation_buffer_capacity} suites ready</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'PARKING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {parkingHubs.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-start justify-between">
                  <h4 className="font-extrabold text-sm text-cyan-800 font-heading">{p.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {p.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs pt-1">
                  <span className="text-slate-600">Parking Capacity:</span>
                  <span className="font-mono font-bold text-slate-900">{p.occupied_spots} / {p.total_spots} ({p.occupancy_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
