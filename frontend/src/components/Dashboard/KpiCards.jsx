import React from 'react';
import { Users, Activity, Clock, ShieldAlert, Building, Hotel, CheckCircle } from 'lucide-react';

export default function KpiCards({ kpis, activeRole }) {
  const currentKpis = kpis || {};

  const getRoleBadge = (metricKey) => {
    if (activeRole === 'VENUE_OPS' && (metricKey === 'venue' || metricKey === 'visitors')) {
      return { text: 'Primary Focus', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20' };
    }
    if (activeRole === 'TRANSIT_CHIEF' && (metricKey === 'transit' || metricKey === 'road')) {
      return { text: 'Primary Focus', color: 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-500/20' };
    }
    if (activeRole === 'HOSPITALITY_LEAD' && (metricKey === 'hotel' || metricKey === 'visitors')) {
      return { text: 'Primary Focus', color: 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-500/20' };
    }
    if (activeRole === 'PUBLIC_SAFETY' && (metricKey === 'safety' || metricKey === 'road')) {
      return { text: 'Primary Focus', color: 'bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-500/20' };
    }
    return null;
  };

  const totalVisitors = currentKpis.total_active_visitors ?? 115900;
  const transitPax = currentKpis.total_transport_passengers ?? 28400;
  const roadCong = currentKpis.avg_road_congestion_pct ?? 48.6;
  const transitWait = currentKpis.avg_transit_wait_mins ?? currentKpis.avg_transit_wait_time_mins ?? 4.7;
  const venueOcc = currentKpis.peak_venue_occupancy_pct ?? 81.4;
  const bottlenecks = currentKpis.critical_bottleneck_count ?? currentKpis.active_critical_bottlenecks ?? 0;
  const hotelLoad = currentKpis.hotel_utilization_pct ?? currentKpis.hotel_buffer_utilization_pct ?? 88.5;

  const cards = [
    {
      key: "visitors",
      label: "Total Active Attendees",
      value: totalVisitors.toLocaleString(),
      subtext: `${transitPax.toLocaleString()} in transit`,
      icon: Users,
      bgColor: "bg-gradient-to-b from-sky-50/70 to-white",
      borderColor: "border-sky-200/80",
      textColor: "text-sky-600",
      iconBg: "bg-sky-100/80 text-sky-600",
      badge: "District Wide",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200"
    },
    {
      key: "road",
      label: "Road Congestion Index",
      value: `${roadCong}%`,
      subtext: roadCong > 65 ? "High Congestion" : "Fluid Traffic Flow",
      icon: Activity,
      bgColor: roadCong > 65 ? "bg-gradient-to-b from-rose-50/70 to-white" : "bg-gradient-to-b from-emerald-50/70 to-white",
      borderColor: roadCong > 65 ? "border-rose-200/90" : "border-emerald-200/90",
      textColor: roadCong > 65 ? "text-rose-600" : "text-emerald-600",
      iconBg: roadCong > 65 ? "bg-rose-100/80 text-rose-600" : "bg-emerald-100/80 text-emerald-600",
      badge: roadCong > 65 ? "Bottleneck" : "Optimal",
      badgeColor: roadCong > 65 ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      key: "transit",
      label: "Avg Transit Wait Time",
      value: `${transitWait} min`,
      subtext: "Across 5 Multi-Modal Hubs",
      icon: Clock,
      bgColor: transitWait > 15 ? "bg-gradient-to-b from-amber-50/70 to-white" : "bg-gradient-to-b from-blue-50/70 to-white",
      borderColor: transitWait > 15 ? "border-amber-200/90" : "border-blue-200/90",
      textColor: transitWait > 15 ? "text-amber-600" : "text-blue-600",
      iconBg: transitWait > 15 ? "bg-amber-100/80 text-amber-600" : "bg-blue-100/80 text-blue-600",
      badge: `${transitWait > 15 ? "Surge" : "Normal"} Headway`,
      badgeColor: transitWait > 15 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      key: "venue",
      label: "Peak Arena Utilization",
      value: `${venueOcc}%`,
      subtext: "Grand Stadium / Tech Dome",
      icon: Building,
      bgColor: venueOcc > 90 ? "bg-gradient-to-b from-rose-50/70 to-white" : "bg-gradient-to-b from-purple-50/70 to-white",
      borderColor: venueOcc > 90 ? "border-rose-200/90" : "border-purple-200/90",
      textColor: venueOcc > 90 ? "text-rose-600" : "text-purple-600",
      iconBg: venueOcc > 90 ? "bg-rose-100/80 text-rose-600" : "bg-purple-100/80 text-purple-600",
      badge: "Turnstiles Synced",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200"
    },
    {
      key: "safety",
      label: "Active Risk Bottlenecks",
      value: bottlenecks,
      subtext: bottlenecks > 0 ? "AI Rerouting Active" : "No Critical Chokepoints",
      icon: ShieldAlert,
      bgColor: bottlenecks > 0 ? "bg-gradient-to-b from-rose-50/70 to-white" : "bg-gradient-to-b from-emerald-50/70 to-white",
      borderColor: bottlenecks > 0 ? "border-rose-200/90" : "border-emerald-200/90",
      textColor: bottlenecks > 0 ? "text-rose-600" : "text-emerald-600",
      iconBg: bottlenecks > 0 ? "bg-rose-100/80 text-rose-600" : "bg-emerald-100/80 text-emerald-600",
      badge: bottlenecks > 0 ? "Attention Required" : "Cleared",
      badgeColor: bottlenecks > 0 ? "bg-rose-100 text-rose-800 border-rose-200 animate-pulse" : "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      key: "hotel",
      label: "Hotel & Hospitality Load",
      value: `${hotelLoad}%`,
      subtext: "4 Major Clusters Balanced",
      icon: Hotel,
      bgColor: "bg-gradient-to-b from-amber-50/70 to-white",
      borderColor: "border-amber-200/80",
      textColor: "text-amber-600",
      iconBg: "bg-amber-100/80 text-amber-600",
      badge: "630 Buffer Beds",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 min-w-0">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const roleBadge = getRoleBadge(card.key);
        return (
          <div
            key={idx}
            className={`p-3 sm:p-4 rounded-2xl border ${card.borderColor} ${card.bgColor} relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md shadow-2xs space-y-2 min-w-0 ${
              roleBadge ? 'ring-2 ring-cyan-500/30' : ''
            }`}
          >
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs font-bold text-slate-600 tracking-wide truncate min-w-0">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconBg} shadow-2xs shrink-0 ml-1`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black tracking-tight text-slate-900 font-heading truncate">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 min-w-0">
              <span className="text-slate-500 font-medium truncate min-w-0 mr-1">{card.subtext}</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] font-extrabold border shrink-0 ${roleBadge ? roleBadge.color : card.badgeColor}`}>
                {roleBadge ? roleBadge.text : card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
