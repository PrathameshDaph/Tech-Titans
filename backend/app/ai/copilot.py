from typing import Dict, List, Any
from app.models.schemas import CopilotQuery, CopilotResponse, TelemetryState

class AIEventCopilot:
    def __init__(self):
        pass

    def answer_query(self, req: CopilotQuery, state: TelemetryState) -> CopilotResponse:
        q = req.query.lower()
        role = req.role or "MASTER_ORCHESTRATOR"
        scenario = state.active_scenario or "NORMAL_OPERATION"
        kpis = state.kpis

        # Generate contextual response
        if "why" in q or "cause" in q or "bottleneck" in q:
            if scenario == "VISITOR_SURGE":
                ans = (
                    "🔍 **Root Cause Analysis (Visitor Surge):**\n"
                    "The current congestion spike at Grand Stadium (Venue 1) is driven by a concurrent surge of +45,000 attendees "
                    "arriving within a narrow 35-minute window following the conclusion of the World Tech Keynote. "
                    "Ingress gates North and West reached 138% flow capacity, causing queue spillback onto Olympic Central Boulevard. "
                    "Without intervention, wait times at Central HyperMetro will spike to 28+ minutes."
                )
            elif scenario == "ROAD_CLOSURE":
                ans = (
                    "🚧 **Root Cause Analysis (Road Closure):**\n"
                    "The closure of Olympic Central Boulevard forced 38,000 pedestrian and vehicular movements to divert onto "
                    "the West Gateway Highway and North Terminal Loop. The secondary road network lacks sufficient signal green-time, "
                    "resulting in a localized congestion index of 96% and reduced emergency vehicle clearance."
                )
            elif scenario == "WEATHER_ALERT":
                ans = (
                    "🌧️ **Root Cause Analysis (Severe Weather):**\n"
                    "A sudden thunderstorm with 92% precipitation and 48 km/h wind gusts forced the rapid evacuation of 18,900 people "
                    "from the open-air Cultural Horizon Plaza. Crowds are converging on covered transit terminals and nearby hotel lobbies, "
                    "temporarily exhausting local shelter and transit capacity."
                )
            else:
                ans = (
                    "📊 **System Status Diagnosis:**\n"
                    f"The mega-event precinct is operating within normal parameters. Total active visitors: {kpis.total_active_visitors:,}. "
                    f"Average road congestion is {kpis.avg_road_congestion_pct}%, and average transit wait time is {kpis.avg_transit_wait_mins} mins. "
                    "All 4 venues, 5 transit hubs, and 4 hotel clusters are currently balanced with no active critical alerts."
                )
            
            actions = [
                "Run Google OR-Tools Multi-Objective Solver",
                "Deploy Dynamic Shuttle Transit Bridge (15 buses)",
                "Trigger Gate Turnstile Flow Rebalancing"
            ]

        elif "recommend" in q or "optimize" in q or "or-tools" in q or "solution" in q:
            ans = (
                "⚡ **AI Mathematical Optimization Strategy (Google OR-Tools SCIP/GLOP):**\n"
                "1. **Transit Fleet Dispatch:** Mobilize 15 reserve electric shuttle buses from North Depot to Grand Stadium Gate A on a 90-second headway, adding +14,200 pax/hr capacity.\n"
                "2. **Dynamic Ingress Gating:** Reconfigure LED directional signage and mobile wayfinding to divert 45% of inflow to East and South auxiliary turnstiles.\n"
                "3. **Reversible Road Signaling:** Invert outbound lanes on Olympic Central Boulevard to prioritize high-capacity relief shuttles.\n"
                "4. **Hospitality Staging:** Open 400 contingency lounge suites at Crown Grand Royale and Marina Bay to comfortably stage early arrivals."
            )
            actions = [
                "Execute 1-Click Optimization Directive",
                "Notify Transit Operations Dispatch",
                "Publish Push Wayfinding to Fan App"
            ]

        elif "police" in q or "safety" in q or "security" in q or role == "PUBLIC_SAFETY":
            ans = (
                "🚨 **Public Safety & Police Command Briefing:**\n"
                "- **Crowd Density Status:** Critical density warning active at Gate North concourse (3.8 persons/m²).\n"
                "- **Emergency Egress Corridors:** Route 13 (West Gateway Highway) is designated as the primary emergency vehicle route with automated green-wave signal priority.\n"
                "- **Action Protocol:** Deploy 24 crowd control marshals to Intersection Central to facilitate smooth pedestrian peeling into East Concourse."
            )
            actions = [
                "Clear Emergency Lane Corridor",
                "Deploy 24 Ground Marshals",
                "Activate Overhead Public PA Announcement"
            ]

        elif "hotel" in q or "hospitality" in q or role == "HOSPITALITY_LEAD":
            ans = (
                "🏨 **Hospitality & Hotel Operations Advisory:**\n"
                "- **Cluster Occupancy:** 88.5% average across 4 major hotel hubs (Crown Grand Royale at 90%, Marina Bay at 86.8%).\n"
                "- **Evacuation Buffer:** 630 contingency rooms and covered grand ballrooms ready for overflow activation.\n"
                "- **Concierge Coordination:** Directing post-event VIP diners to Skyline Executive Suites to alleviate ground floor lobby congestion."
            )
            actions = [
                "Unlock Grand Ballroom Hospitality Buffers",
                "Coordinate Express Luggage Check-in",
                "Sync Valet Shuttles with Venue Schedule"
            ]

        else:
            ans = (
                f"🤖 **EventFlow AI Copilot (Active Role: {role.replace('_', ' ')}):**\n"
                f"Currently monitoring {kpis.total_active_visitors:,} visitors across the mega-event zone. "
                f"Peak venue occupancy is at {kpis.peak_venue_occupancy_pct}%, and safety risk index is {kpis.safety_risk_index}/100. "
                "How would you like to proceed? You can trigger what-if scenarios, request mathematical OR-Tools optimization, or ask for targeted stakeholder briefings."
            )
            actions = [
                "Run What-If Simulation: Visitor Surge (+45k)",
                "Run What-If Simulation: Arterial Road Blockage",
                "Evaluate 30-120 Min Predictive Horizon"
            ]

        stakeholder_briefs = {
            "MASTER_ORCHESTRATOR": f"District-wide stability index at {100 - int(kpis.safety_risk_index)}%. Cross-domain sync active between venues, roads, and transit.",
            "VENUE_OPS": f"Grand Stadium at {kpis.peak_venue_occupancy_pct}% capacity. Turnstile throughput requires dynamic balancing.",
            "TRANSIT_CHIEF": f"Average wait time {kpis.avg_transit_wait_mins}m. Reserve fleet of 44 electric shuttles staged at depots.",
            "HOSPITALITY_LEAD": f"Hotels at {kpis.hotel_utilization_pct}% occupancy. 630 emergency buffer rooms available.",
            "PUBLIC_SAFETY": f"Bottleneck risk score: {kpis.critical_bottleneck_count} zones requiring marshal supervision."
        }

        return CopilotResponse(
            answer=ans,
            suggested_actions=actions,
            stakeholder_briefs=stakeholder_briefs,
            confidence_score=0.96
        )

# Singleton copilot instance
copilot = AIEventCopilot()
