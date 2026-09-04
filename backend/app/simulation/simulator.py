import random
import time
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import networkx as nx

from app.models.schemas import (
    TelemetryState, VenueState, TransitNodeState, HotelClusterState,
    ParkingHubState, RoadEdge, MovingAgent, AgentType, RoadStatus,
    RiskLevel, WeatherCondition, AlertItem, SimulationKPIs, ScenarioTriggerRequest
)
from app.simulation.geo_world import (
    create_venues, create_transit_nodes, create_hotel_clusters,
    create_parking_hubs, create_road_network, build_graph,
    find_shortest_path, NODE_COORDS, BASE_LAT, BASE_LNG
)

class EventSimulator:
    def __init__(self):
        self.tick_count = 0
        self.is_running = True
        self.speed_multiplier = 1.0
        self.base_time = datetime.now()
        
        # Core entities
        self.venues = create_venues()
        self.transit_nodes = create_transit_nodes()
        self.hotels = create_hotel_clusters()
        self.parking_hubs = create_parking_hubs()
        self.roads = create_road_network()
        self.graph = build_graph(self.roads)
        
        self.weather = WeatherCondition(
            condition="CLEAR",
            temperature_c=24.5,
            precipitation_pct=0.0,
            wind_speed_kmh=12.0,
            impact_factor=1.0
        )
        
        self.alerts: List[AlertItem] = []
        self.agents: List[MovingAgent] = []
        self.active_scenario: Optional[str] = None
        self.applied_optimizations: List[str] = []
        
        # Initialize default fleet and visitor groups
        self._init_agents()
        self._generate_initial_alerts()

    def _init_agents(self):
        self.agents = []
        # 1. Transit Shuttles (fixed cyclic routes)
        shuttle_routes = [
            ["transit-2", "gate-north", "venue-2", "junction-hub", "junction-central", "venue-1", "junction-central", "gate-north", "transit-2"],
            ["transit-3", "venue-4", "gate-south", "junction-central", "venue-1", "junction-central", "gate-south", "transit-3"],
            ["transit-4", "gate-west", "junction-central", "venue-3", "transit-1", "venue-3", "junction-central", "gate-west", "transit-4"],
            ["transit-1", "hotel-1", "transit-1", "venue-3", "junction-central", "venue-1", "transit-1"],
            ["transit-5", "hotel-4", "transit-5", "gate-west", "venue-1", "gate-west", "transit-5"]
        ]
        
        for i in range(12):
            route = shuttle_routes[i % len(shuttle_routes)]
            origin = route[0]
            start_coord = NODE_COORDS[origin]
            self.agents.append(
                MovingAgent(
                    id=f"shuttle-{i+1}",
                    type=AgentType.SHUTTLE_BUS,
                    label=f"Express Shuttle #{101 + i}",
                    size=65,
                    lat=start_coord[0],
                    lng=start_coord[1],
                    origin_id=origin,
                    destination_id=route[-1],
                    route_node_ids=route,
                    current_step_idx=i % (len(route) - 1),
                    progress_pct=random.uniform(0.1, 0.9),
                    speed_kmh=35.0,
                    status="EN_ROUTE",
                    rerouted=False
                )
            )

        # 2. Metro high-speed links
        metro_route = ["transit-1", "venue-3", "junction-central", "venue-1", "junction-hub", "venue-2"]
        for j in range(4):
            self.agents.append(
                MovingAgent(
                    id=f"metro-{j+1}",
                    type=AgentType.METRO_TRAIN,
                    label=f"Metro HighCap Train #{800 + j}",
                    size=450,
                    lat=NODE_COORDS["transit-1"][0],
                    lng=NODE_COORDS["transit-1"][1],
                    origin_id="transit-1",
                    destination_id="venue-2",
                    route_node_ids=metro_route,
                    current_step_idx=j % (len(metro_route) - 1),
                    progress_pct=random.uniform(0.1, 0.9),
                    speed_kmh=55.0,
                    status="RAPID_TRANSIT",
                    rerouted=False
                )
            )

        # 3. Visitor Groups (Aggregated cohorts of 50-400 attendees moving between hubs, hotels and venues)
        origins = ["transit-1", "transit-2", "transit-3", "transit-4", "parking-1", "parking-2", "hotel-1", "hotel-3"]
        destinations = ["venue-1", "venue-2", "venue-3", "venue-4"]
        
        for k in range(50):
            orig = random.choice(origins)
            dest = random.choice(destinations)
            route = find_shortest_path(self.graph, orig, dest)
            if len(route) < 2:
                route = [orig, "junction-central", dest]
            
            coord = NODE_COORDS[orig]
            self.agents.append(
                MovingAgent(
                    id=f"group-{k+1}",
                    type=AgentType.VISITOR_GROUP,
                    label=f"Visitor Cohort G-{k+1:02d}",
                    size=random.randint(80, 500),
                    lat=coord[0],
                    lng=coord[1],
                    origin_id=orig,
                    destination_id=dest,
                    route_node_ids=route,
                    current_step_idx=0,
                    progress_pct=random.uniform(0.0, 0.8),
                    speed_kmh=random.uniform(4.0, 5.2),
                    status="WALKING_INFLOW",
                    rerouted=False
                )
            )

    def _generate_initial_alerts(self):
        self.alerts = [
            AlertItem(
                id="alt-101",
                timestamp=self.get_current_time_str(),
                severity=RiskLevel.LOW,
                source="IoT Ingress Gates",
                title="Grand Stadium Gate A Turnstiles Optimal",
                description="Inflow rate steady at 320 pax/min. All 24 biometric turnstiles operational.",
                location_id="venue-1",
                action_required="Standard Monitoring",
                acknowledged=True
            ),
            AlertItem(
                id="alt-102",
                timestamp=self.get_current_time_str(),
                severity=RiskLevel.MODERATE,
                source="AI Transit Vision",
                title="Tech Dome Approaching 82% Occupancy",
                description="AI Keynote overflow anticipated in next 45 mins. Moderate pedestrian queue at Innovation Way.",
                location_id="venue-2",
                action_required="Prepare auxiliary shuttle staging at North Terminal.",
                acknowledged=False
            )
        ]

    def get_current_time_str(self) -> str:
        current_dt = self.base_time + timedelta(seconds=self.tick_count * 5 * self.speed_multiplier)
        return current_dt.strftime("%H:%M:%S")

    def step(self):
        if not self.is_running:
            return
        
        self.tick_count += 1
        
        # 1. Update Agent Positions
        for agent in self.agents:
            self._advance_agent(agent)
            
        # 2. Update Road Congestion and Speeds based on density
        self._update_road_congestion()
        
        # 3. Update Venue and Transit Dynamics
        self._update_venues_and_transit()

    def _advance_agent(self, agent: MovingAgent):
        route = agent.route_node_ids
        if len(route) < 2:
            return

        # Advance progress
        step_idx = agent.current_step_idx
        if step_idx >= len(route) - 1:
            # Reached destination, recycle or pick new mission
            if agent.type in [AgentType.SHUTTLE_BUS, AgentType.METRO_TRAIN]:
                agent.route_node_ids = list(reversed(route))
                agent.current_step_idx = 0
                agent.progress_pct = 0.0
            else:
                # Visitor arrived, pick return journey or new venue
                agent.origin_id = agent.destination_id
                destinations = ["transit-1", "transit-2", "transit-3", "transit-4", "hotel-1", "hotel-2", "hotel-3", "venue-1", "venue-4"]
                new_dest = random.choice([d for d in destinations if d != agent.origin_id])
                agent.destination_id = new_dest
                agent.route_node_ids = find_shortest_path(self.graph, agent.origin_id, agent.destination_id)
                agent.current_step_idx = 0
                agent.progress_pct = 0.0
                agent.rerouted = False
            return

        curr_node = route[step_idx]
        next_node = route[step_idx + 1]
        
        c1 = NODE_COORDS.get(curr_node, [BASE_LAT, BASE_LNG])
        c2 = NODE_COORDS.get(next_node, [BASE_LAT, BASE_LNG])

        # Step speed depends on agent type and weather
        base_step_delta = 0.05 if agent.type == AgentType.VISITOR_GROUP else 0.12
        step_delta = base_step_delta * self.speed_multiplier * self.weather.impact_factor
        
        agent.progress_pct += step_delta
        if agent.progress_pct >= 1.0:
            agent.progress_pct = 0.0
            agent.current_step_idx += 1
            if agent.current_step_idx >= len(route) - 1:
                agent.lat = c2[0]
                agent.lng = c2[1]
                return

        # Interpolate coordinates with slight natural jitter
        p = agent.progress_pct
        agent.lat = c1[0] + (c2[0] - c1[0]) * p
        agent.lng = c1[1] + (c2[1] - c1[1]) * p

    def _update_road_congestion(self):
        # Calculate load per road edge
        road_loads = {r.id: 0 for r in self.roads}
        for agent in self.agents:
            if agent.current_step_idx < len(agent.route_node_ids) - 1:
                u = agent.route_node_ids[agent.current_step_idx]
                v = agent.route_node_ids[agent.current_step_idx + 1]
                # Find road
                for r in self.roads:
                    if (r.from_node == u and r.to_node == v) or (r.from_node == v and r.to_node == u):
                        weight = agent.size if agent.type == AgentType.VISITOR_GROUP else 150
                        road_loads[r.id] += weight

        for r in self.roads:
            if r.is_closed:
                r.status = RoadStatus.CLOSED
                r.congestion_pct = 100.0
                r.current_speed_kmh = 0.0
                continue
            
            # Base congestion + load impact
            load = road_loads.get(r.id, 0)
            density_factor = min(load / 800.0, 1.0)
            
            # Weather impact
            weather_penalty = 1.2 if self.weather.condition == "THUNDERSTORM" else 1.0
            
            r.congestion_pct = min(15.0 + (density_factor * 65.0 * weather_penalty), 98.0)
            r.vehicle_count = int(10 + density_factor * 60)
            r.current_speed_kmh = max(r.free_flow_speed_kmh * (1.0 - (r.congestion_pct / 120.0)), 5.0)
            
            if r.congestion_pct > 80.0:
                r.status = RoadStatus.CRITICAL
            elif r.congestion_pct > 55.0:
                r.status = RoadStatus.CONGESTED
            else:
                r.status = RoadStatus.OPEN

    def _update_venues_and_transit(self):
        # Venues
        for v in self.venues:
            # Active surge adjustment
            if self.active_scenario == "VISITOR_SURGE" and v.id == "venue-1":
                v.inflow_rate = 850
                v.current_occupancy = min(v.current_occupancy + 180, v.capacity + 2000)
            else:
                v.current_occupancy = max(min(v.current_occupancy + random.randint(-40, 50), v.capacity), 2000)
            
            v.occupancy_pct = round((v.current_occupancy / v.capacity) * 100.0, 2)
            if v.occupancy_pct > 92.0:
                v.risk_level = RiskLevel.CRITICAL
            elif v.occupancy_pct > 80.0:
                v.risk_level = RiskLevel.HIGH
            elif v.occupancy_pct > 65.0:
                v.risk_level = RiskLevel.MODERATE
            else:
                v.risk_level = RiskLevel.LOW

        # Transit
        for t in self.transit_nodes:
            if self.active_scenario == "METRO_OUTAGE" and t.id == "transit-1":
                t.current_waiting = min(t.current_waiting + 250, t.capacity)
                t.avg_wait_time_mins = 28.5
                t.risk_level = RiskLevel.CRITICAL
                t.status = "OUTAGE_BOTTLENECK"
            else:
                if "OPTIMIZED_SHUTTLE_SURGE" in self.applied_optimizations:
                    t.avg_wait_time_mins = max(2.5, t.avg_wait_time_mins * 0.95)
                    t.current_waiting = max(400, int(t.current_waiting * 0.96))
                    t.risk_level = RiskLevel.LOW
                    t.status = "AI_OPTIMIZED"
                else:
                    t.avg_wait_time_mins = round(max(3.0, (t.current_waiting / max(t.active_vehicles * 40, 100)) * 2.5), 1)

    def trigger_scenario(self, req: ScenarioTriggerRequest) -> Dict[str, Any]:
        self.active_scenario = req.scenario_type
        self.applied_optimizations = []
        
        if req.scenario_type == "VISITOR_SURGE":
            target_venue = req.target_id or "venue-1"
            # Spawn 25 additional dense visitor groups rushing to venue-1
            origins = ["transit-1", "transit-2", "transit-3", "parking-1", "parking-2"]
            for i in range(25):
                orig = random.choice(origins)
                route = find_shortest_path(self.graph, orig, target_venue)
                coord = NODE_COORDS[orig]
                self.agents.append(
                    MovingAgent(
                        id=f"surge-group-{i+1}",
                        type=AgentType.VISITOR_GROUP,
                        label=f"SURGE Cohort #{i+1}",
                        size=random.randint(300, 750),
                        lat=coord[0],
                        lng=coord[1],
                        origin_id=orig,
                        destination_id=target_venue,
                        route_node_ids=route,
                        current_step_idx=0,
                        progress_pct=0.0,
                        speed_kmh=5.5,
                        status="RAPID_INFLOW_SURGE",
                        rerouted=False
                    )
                )
            
            # Raise Critical Alert
            self.alerts.insert(0, AlertItem(
                id=f"alt-{int(time.time())}",
                timestamp=self.get_current_time_str(),
                severity=RiskLevel.CRITICAL,
                source="AI Ingress Predictor",
                title="SUDDEN VISITOR SURGE DETECTED (+45,000 Expected)",
                description="Ticketing gates and turnstiles at Grand Stadium experiencing 300% capacity influx. Immediate bottleneck expected in 30 mins.",
                location_id=target_venue,
                action_required="Run OR-Tools Dynamic Redistribution and Deploy High-Capacity Shuttles.",
                acknowledged=False
            ))
            return {"status": "SUCCESS", "scenario": "VISITOR_SURGE", "message": "Visitor Surge triggered at Grand Stadium (+45k influx)."}

        elif req.scenario_type == "ROAD_CLOSURE":
            target_road = req.target_id or "road-1"
            # Close road and rebuild graph
            for r in self.roads:
                if r.id == target_road or r.id == "road-2":
                    r.is_closed = True
                    r.status = RoadStatus.CLOSED
                    r.congestion_pct = 100.0
            
            self.graph = build_graph(self.roads)
            
            # Immediately reroute all active agents
            reroute_count = 0
            for agent in self.agents:
                route = agent.route_node_ids
                # If path contains closed road nodes
                if any(node in ["junction-central", "venue-1"] for node in route):
                    new_path = find_shortest_path(self.graph, agent.origin_id, agent.destination_id)
                    agent.route_node_ids = new_path
                    agent.current_step_idx = 0
                    agent.progress_pct = 0.0
                    agent.rerouted = True
                    reroute_count += 1
            
            self.alerts.insert(0, AlertItem(
                id=f"alt-{int(time.time())}",
                timestamp=self.get_current_time_str(),
                severity=RiskLevel.CRITICAL,
                source="Traffic Management Center",
                title=f"CRITICAL ARTERIAL ROAD CLOSURE ({target_road})",
                description=f"Accident & security perimeter closed {target_road}. AI has dynamically rerouted {reroute_count} active visitor cohorts to secondary perimeter corridors.",
                location_id=target_road,
                action_required="Enact Perimeter Gate Diversion and Reverse Lane Signaling.",
                acknowledged=False
            ))
            return {"status": "SUCCESS", "scenario": "ROAD_CLOSURE", "rerouted_agents": reroute_count}

        elif req.scenario_type == "WEATHER_ALERT":
            self.weather = WeatherCondition(
                condition="THUNDERSTORM",
                temperature_c=16.8,
                precipitation_pct=92.0,
                wind_speed_kmh=48.0,
                impact_factor=0.65
            )
            # Outdoor concert venue evacuated
            for v in self.venues:
                if v.id == "venue-4":
                    v.status = "EMERGENCY_EVACUATION"
                    v.risk_level = RiskLevel.CRITICAL
            
            self.alerts.insert(0, AlertItem(
                id=f"alt-{int(time.time())}",
                timestamp=self.get_current_time_str(),
                severity=RiskLevel.HIGH,
                source="MeteoGIS Radar",
                title="SEVERE THUNDERSTORM & GALE ADVISORY",
                description="Heavy precipitation (92%) and 48 km/h winds. Outdoor Cultural Horizon Plaza evacuating 18,900 attendees to indoor transit shelters.",
                location_id="venue-4",
                action_required="Dispatch covered transit fleet and activate hotel lobby evacuation buffers.",
                acknowledged=False
            ))
            return {"status": "SUCCESS", "scenario": "WEATHER_ALERT", "weather": self.weather.dict()}

        elif req.scenario_type == "METRO_OUTAGE":
            metro_hub = "transit-1"
            for t in self.transit_nodes:
                if t.id == metro_hub:
                    t.status = "SYSTEM_FAILURE"
                    t.risk_level = RiskLevel.CRITICAL
                    t.current_waiting = 8400
                    t.avg_wait_time_mins = 34.0
            
            self.alerts.insert(0, AlertItem(
                id=f"alt-{int(time.time())}",
                timestamp=self.get_current_time_str(),
                severity=RiskLevel.CRITICAL,
                source="HyperMetro Traction Control",
                title="SUBSTATION POWER DROP - METRO LINE 1 SUSPENDED",
                description="Central HyperMetro Hub offline. 8,400 passengers trapped in queue. Surface transit demand increased by 380%.",
                location_id="transit-1",
                action_required="Emergency Bus Bridge Deployment from North and West depots.",
                acknowledged=False
            ))
            return {"status": "SUCCESS", "scenario": "METRO_OUTAGE"}

        return {"status": "ERROR", "message": "Unknown scenario"}

    def apply_optimizations(self, intervention_ids: List[str]) -> Dict[str, Any]:
        self.applied_optimizations = intervention_ids
        
        # 1. Clear road blockages if recovery optimized
        if "REOPEN_PERIMETER_LANES" in intervention_ids or "DYNAMIC_LANE_REVERSAL" in intervention_ids:
            for r in self.roads:
                r.is_closed = False
                r.status = RoadStatus.OPEN
                r.congestion_pct = max(20.0, r.congestion_pct * 0.45)
            self.graph = build_graph(self.roads)

        # 2. Deploy 20 AI High-Capacity Autonomous Shuttles
        if "DEPLOY_SHUTTLE_BRIDGE" in intervention_ids or "OPTIMIZED_SHUTTLE_SURGE" in intervention_ids:
            for i in range(15):
                route = ["transit-2", "gate-north", "venue-1", "junction-central", "transit-1", "transit-2"]
                coord = NODE_COORDS["transit-2"]
                self.agents.append(
                    MovingAgent(
                        id=f"ai-shuttle-rapid-{i+1}",
                        type=AgentType.SHUTTLE_BUS,
                        label=f"AI Rapid Express Bus #{900+i}",
                        size=90,
                        lat=coord[0],
                        lng=coord[1],
                        origin_id="transit-2",
                        destination_id="venue-1",
                        route_node_ids=route,
                        current_step_idx=0,
                        progress_pct=random.uniform(0.0, 0.5),
                        speed_kmh=42.0,
                        status="RAPID_RELIEF_SHUTTLE",
                        rerouted=True
                    )
                )

        # 3. Redistribute pedestrian flows
        for agent in self.agents:
            if agent.type == AgentType.VISITOR_GROUP and agent.status == "RAPID_INFLOW_SURGE":
                # Divert 50% to East & South auxiliary gates
                aux_dest = random.choice(["venue-2", "venue-3", "hotel-1", "transit-3"])
                agent.destination_id = aux_dest
                agent.route_node_ids = find_shortest_path(self.graph, agent.origin_id, aux_dest)
                agent.status = "OPTIMIZED_FLOW"
                agent.rerouted = True

        # 4. Ease venue and transit wait times
        for v in self.venues:
            v.risk_level = RiskLevel.LOW
            v.occupancy_pct = min(v.occupancy_pct, 76.0)
            v.current_occupancy = int(v.capacity * 0.74)
            
        for t in self.transit_nodes:
            t.avg_wait_time_mins = max(3.2, t.avg_wait_time_mins * 0.35)
            t.current_waiting = int(t.current_waiting * 0.4)
            t.risk_level = RiskLevel.LOW
            t.status = "AI_STABILIZED"

        self.alerts.insert(0, AlertItem(
            id=f"alt-{int(time.time())}",
            timestamp=self.get_current_time_str(),
            severity=RiskLevel.LOW,
            source="OR-Tools Optimizer",
            title="OPTIMIZATION MEASURES APPLIED SUCCESSFULLY",
            description="Dynamic lane reversal active, 15 express relief shuttles deployed, pedestrian gating balanced. Congestion reduced by 62%.",
            location_id="DISTRICT_WIDE",
            action_required="Maintain real-time telemetry observation.",
            acknowledged=True
        ))

        return {
            "status": "SUCCESS",
            "interventions_applied": intervention_ids,
            "message": "Optimization directives actively running in Digital Twin."
        }

    def get_telemetry_state(self) -> TelemetryState:
        # Calculate Aggregated KPIs
        total_visitors = sum(v.current_occupancy for v in self.venues) + sum(a.size for a in self.agents if a.type == AgentType.VISITOR_GROUP)
        total_transit_pax = sum(t.current_waiting for t in self.transit_nodes) + sum(a.size for a in self.agents if a.type in [AgentType.SHUTTLE_BUS, AgentType.METRO_TRAIN])
        avg_wait = round(sum(t.avg_wait_time_mins for t in self.transit_nodes) / len(self.transit_nodes), 1)
        avg_cong = round(sum(r.congestion_pct for r in self.roads) / len(self.roads), 1)
        peak_occ = round(max(v.occupancy_pct for v in self.venues), 1)
        bottlenecks = sum(1 for r in self.roads if r.status in [RoadStatus.CONGESTED, RoadStatus.CRITICAL, RoadStatus.CLOSED]) + sum(1 for v in self.venues if v.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL])
        
        # Hotel utilization
        tot_rooms = sum(h.total_rooms for h in self.hotels)
        occ_rooms = sum(h.occupied_rooms for h in self.hotels)
        hotel_util = round((occ_rooms / tot_rooms) * 100.0, 1)

        # Risk index
        risk_idx = round(min(100.0, (avg_cong * 0.4) + (bottlenecks * 8.5) + (avg_wait * 1.5)), 1)
        
        # Carbon emission (kg/hr)
        carbon = round(1200.0 + (avg_cong * 25.0) + (len(self.agents) * 12.0), 1)

        kpis = SimulationKPIs(
            total_active_visitors=total_visitors,
            total_transport_passengers=total_transit_pax,
            avg_transit_wait_mins=avg_wait,
            avg_road_congestion_pct=avg_cong,
            peak_venue_occupancy_pct=peak_occ,
            critical_bottleneck_count=bottlenecks,
            safety_risk_index=risk_idx,
            hotel_utilization_pct=hotel_util,
            carbon_emissions_kg_hr=carbon
        )

        return TelemetryState(
            event_time=self.get_current_time_str(),
            tick_count=self.tick_count,
            is_running=self.is_running,
            speed_multiplier=self.speed_multiplier,
            weather=self.weather,
            kpis=kpis,
            venues=self.venues,
            transit_nodes=self.transit_nodes,
            hotels=self.hotels,
            parking_hubs=self.parking_hubs,
            roads=self.roads,
            agents=self.agents,
            alerts=self.alerts[:15],
            active_scenario=self.active_scenario,
            applied_optimizations=self.applied_optimizations
        )

# Singleton simulator instance
simulator = EventSimulator()
