import React from 'react';
import { 
  Zap, Building2, Bus, Hotel, Shield, 
  ArrowRight, AlertCircle, CheckCircle2, Sliders, Users, Flame, Navigation
} from 'lucide-react';

const ROLE_DETAILS = {
  MASTER_ORCHESTRATOR: {
    title: 'Master District Orchestrator',
    tagline: 'Unified Cross-Domain Command & Real-Time Digital Twin',
    description: 'Synthesizing simultaneous telemetry across 4 Olympic Arenas, 5 Multi-Modal Transit Hubs, 4 Hospitality Zones, and Public Safety Corridors.',
    icon: Zap,
    color: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    highlights: [
      { label: 'Arenas Monitored', value: '4 Active Venues' },
      { label: 'Transit Network', value: '5 Multi-Modal Hubs' },
      { label: 'Hotel Clusters', value: '4 Districts (86% Load)' },
      { label: 'Safety Index', value: 'Nominal Operations' }
    ]
  },
  VENUE_OPS: {
    title: 'Venue Operations Command',
    tagline: 'Turnstile Throughput, Arena Occupancy & Crowd Egress Control',
    description: 'Real-time monitoring of Grand Stadium, Tech Dome, Horizon Plaza, and Aquatics Center capacity, ingress/egress rates, and concourse bottlenecks.',
    icon: Building2,
    color: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    highlights: [
      { label: 'Peak Arena', value: 'Grand Stadium (88%)' },
      { label: 'Turnstile Inflow', value: '2,450 pax/min' },
      { label: 'Queue Wait Time', value: '6.5 mins avg' },
      { label: 'Concourse Status', value: 'Flow Gated via Turnstiles' }
    ]
  },
  TRANSIT_CHIEF: {
    title: 'Transit & Mobility Command',
    tagline: 'Multi-Modal Dispatch, Arterial Flow & Shuttle Fleet Balancing',
    description: 'Dynamic bus bridge allocation, HyperMetro headway optimization, and adaptive traffic signal control across 20 arterial corridors.',
    icon: Bus,
    color: 'from-amber-600 to-orange-600',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    highlights: [
      { label: 'Active Fleet', value: '38 Shuttles & Pods' },
      { label: 'Average Headway', value: '4.6 mins' },
      { label: 'Road Congestion', value: '29.2% (Fluid)' },
      { label: 'Shuttle Express Bridge', value: 'Olympic Blvd Standby' }
    ]
  },
  HOSPITALITY_LEAD: {
    title: 'Hospitality & Accommodation Lead',
    tagline: 'Hotel Cluster Capacity, Staging Buffers & VIP Movement',
    description: 'Coordinating 4 luxury and athlete hotel clusters, managing 630 emergency buffer beds, and synchronizing attendee check-ins with event schedules.',
    icon: Hotel,
    color: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
    highlights: [
      { label: 'Total Rooms', value: '3,850 Units' },
      { label: 'Occupancy Rate', value: '86% Bal.' },
      { label: 'Emergency Buffer', value: '630 Ready Suites' },
      { label: 'VIP Staging', value: 'Horizon Palace Synced' }
    ]
  },
  PUBLIC_SAFETY: {
    title: 'Public Safety & Risk Command',
    tagline: 'Bottleneck Detection, Incident Response & Emergency Corridors',
    description: 'Early warning crowd crush prevention, medical dispatch routing, severe weather shelter activation, and security perimeter enforcement.',
    icon: Shield,
    color: 'from-rose-600 to-red-600',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    highlights: [
      { label: 'Critical Bottlenecks', value: '0 Active Chokepoints' },
      { label: 'Emergency Corridors', value: '100% Clear' },
      { label: 'Police/Medic Units', value: '24 Units Deployed' },
      { label: 'Risk Prediction', value: 'Low Risk (AI Gated)' }
    ]
  }
};

export default function RoleOperationalBanner({ activeRole, telemetry, onOpenInfraModal }) {
  const role = ROLE_DETAILS[activeRole] || ROLE_DETAILS.MASTER_ORCHESTRATOR;
  const Icon = role.icon;

  return (
    <div className="glass-panel p-3.5 md:p-4 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-r from-white via-slate-50/70 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs transition-all animate-fade-in">
      {/* Left: Role identity and mandate */}
      <div className="flex items-start sm:items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${role.color} text-white shadow-md shadow-slate-300 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight font-heading">
              {role.title}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${role.badgeBg}`}>
              OPERATIONAL VIEW
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5 font-medium line-clamp-1">
            {role.tagline}
          </p>
        </div>
      </div>

      {/* Center: Live Role Focus Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
        {role.highlights.map((h, i) => (
          <div key={i} className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 block truncate">{h.label}</span>
            <span className="text-xs font-bold text-slate-800 font-mono block truncate">{h.value}</span>
          </div>
        ))}
      </div>

      {/* Right: Quick Action Button */}
      <button
        onClick={onOpenInfraModal}
        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs text-xs font-bold transition-all shrink-0 hover:shadow-xs"
      >
        <span>Deep Dive Matrix</span>
        <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />
      </button>
    </div>
  );
}
