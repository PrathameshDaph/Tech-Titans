// EventFlow AI — High-Fidelity Client-Side Digital Twin & Simulation Engine
// Powers full simulation, vehicle animation, OR-Tools optimization, predictive analytics, and Copilot client-side

export const BASE_LAT = 51.5387;
export const BASE_LNG = -0.0165;

export const NODE_COORDS = {
  // Venues
  "venue-1": [51.5386, -0.0164],
  "venue-2": [51.5452, -0.0102],
  "venue-3": [51.5398, -0.0078],
  "venue-4": [51.5320, -0.0195],

  // Transit Hubs
  "transit-1": [51.5415, -0.0042],
  "transit-2": [51.5490, -0.0135],
  "transit-3": [51.5295, -0.0120],
  "transit-4": [51.5360, -0.0310],
  "transit-5": [51.5440, -0.0240],

  // Hotels
  "hotel-1": [51.5460, -0.0015],
  "hotel-2": [51.5340, -0.0050],
  "hotel-3": [51.5280, -0.0180],
  "hotel-4": [51.5475, -0.0220],

  // Parking Hubs
  "parking-1": [51.5510, -0.0170],
  "parking-2": [51.5345, -0.0285],
  "parking-3": [51.5265, -0.0105],

  // Junctions
  "junction-central": [51.5370, -0.0120],
  "junction-north": [51.5470, -0.0140],
  "junction-south": [51.5305, -0.0150],
  "junction-west": [51.5365, -0.0240],
  "junction-hub": [51.5420, -0.0090],

  // Gates
  "gate-north": [51.5420, -0.0150],
  "gate-south": [51.5350, -0.0175],
  "gate-east": [51.5380, -0.0110],
  "gate-west": [51.5375, -0.0210]
};

export function createInitialVenues() {
  return [
    {
      id: "venue-1",
      name: "Global Grand Stadium",
      category: "Main Arena",
      lat: 51.5386,
      lng: -0.0164,
      capacity: 80000,
      current_occupancy: 54200,
      occupancy_pct: 67.75,
      inflow_rate: 320,
      outflow_rate: 110,
      status: "OPEN",
      scheduled_event: "World Championship Grand Finale",
      event_phase: "IN_PROGRESS",
      risk_level: "LOW"
    },
    {
      id: "venue-2",
      name: "Tech & Cyber Dome",
      category: "Exhibition & Keynote",
      lat: 51.5452,
      lng: -0.0102,
      capacity: 35000,
      current_occupancy: 28500,
      occupancy_pct: 81.43,
      inflow_rate: 210,
      outflow_rate: 190,
      status: "OPEN",
      scheduled_event: "Global AI & Robotics Summit",
      event_phase: "IN_PROGRESS",
      risk_level: "MODERATE"
    },
    {
      id: "venue-3",
      name: "Aquatic Innovation Center",
      category: "Aquatics & Sports",
      lat: 51.5398,
      lng: -0.0078,
      capacity: 22000,
      current_occupancy: 14300,
      occupancy_pct: 65.0,
      inflow_rate: 90,
      outflow_rate: 75,
      status: "OPEN",
      scheduled_event: "International Invitational Finals",
      event_phase: "IN_PROGRESS",
      risk_level: "LOW"
    },
    {
      id: "venue-4",
      name: "Cultural Horizon Plaza",
      category: "Concerts & Fan Zone",
      lat: 51.5320,
      lng: -0.0195,
      capacity: 28000,
      current_occupancy: 18900,
      occupancy_pct: 67.5,
      inflow_rate: 180,
      outflow_rate: 120,
      status: "OPEN",
      scheduled_event: "Global Music & Cultural Gala",
      event_phase: "IN_PROGRESS",
      risk_level: "LOW"
    }
  ];
}

export function createInitialTransitNodes() {
  return [
    {
      id: "transit-1",
      name: "Central HyperMetro Hub",
      type: "METRO",
      lat: 51.5415,
      lng: -0.0042,
      capacity: 14000,
      current_waiting: 3100,
      avg_wait_time_mins: 4.2,
      active_vehicles: 18,
      dispatch_frequency_mins: 2.5,
      status: "OPTIMAL",
      risk_level: "LOW"
    },
    {
      id: "transit-2",
      name: "North Express Shuttle Depot",
      type: "SHUTTLE",
      lat: 51.5490,
      lng: -0.0135,
      capacity: 9000,
      current_waiting: 1850,
      avg_wait_time_mins: 5.0,
      active_vehicles: 24,
      dispatch_frequency_mins: 3.0,
      status: "OPTIMAL",
      risk_level: "LOW"
    },
    {
      id: "transit-3",
      name: "South Multi-Modal Plaza",
      type: "BUS/BRT",
      lat: 51.5295,
      lng: -0.0120,
      capacity: 11000,
      current_waiting: 2900,
      avg_wait_time_mins: 6.1,
      active_vehicles: 20,
      dispatch_frequency_mins: 3.5,
      status: "OPTIMAL",
      risk_level: "LOW"
    },
    {
      id: "transit-4",
      name: "West Park & Ride Terminal",
      type: "SHUTTLE",
      lat: 51.5360,
      lng: -0.0310,
      capacity: 8500,
      current_waiting: 1400,
      avg_wait_time_mins: 4.8,
      active_vehicles: 16,
      dispatch_frequency_mins: 4.0,
      status: "OPTIMAL",
      risk_level: "LOW"
    },
    {
      id: "transit-5",
      name: "SkyTram Waterfront Link",
      type: "TRAM",
      lat: 51.5440,
      lng: -0.0240,
      capacity: 5000,
      current_waiting: 950,
      avg_wait_time_mins: 3.5,
      active_vehicles: 8,
      dispatch_frequency_mins: 2.0,
      status: "OPTIMAL",
      risk_level: "LOW"
    }
  ];
}

export function createInitialHotels() {
  return [
    {
      id: "hotel-1",
      name: "Crown Grand Royale & Towers",
      lat: 51.5460,
      lng: -0.0015,
      total_rooms: 1400,
      occupied_rooms: 1260,
      occupancy_pct: 90.0,
      checkin_queue: 42,
      evacuation_buffer_capacity: 180,
      status: "HIGH_DEMAND"
    },
    {
      id: "hotel-2",
      name: "Skyline Executive Suites",
      lat: 51.5340,
      lng: -0.0050,
      total_rooms: 950,
      occupied_rooms: 780,
      occupancy_pct: 82.1,
      checkin_queue: 25,
      evacuation_buffer_capacity: 140,
      status: "NORMAL"
    },
    {
      id: "hotel-3",
      name: "Marina Bay Summit Resort",
      lat: 51.5280,
      lng: -0.0180,
      total_rooms: 1600,
      occupied_rooms: 1390,
      occupancy_pct: 86.87,
      checkin_queue: 38,
      evacuation_buffer_capacity: 220,
      status: "HIGH_DEMAND"
    },
    {
      id: "hotel-4",
      name: "Athletes & VIP Residence Lodge",
      lat: 51.5475,
      lng: -0.0220,
      total_rooms: 850,
      occupied_rooms: 810,
      occupancy_pct: 95.29,
      checkin_queue: 12,
      evacuation_buffer_capacity: 90,
      status: "NEAR_CAPACITY"
    }
  ];
}

export function createInitialParkingHubs() {
  return [
    {
      id: "parking-1",
      name: "North Mega Deck Alpha",
      lat: 51.5510,
      lng: -0.0170,
      total_spots: 5000,
      occupied_spots: 3600,
      occupancy_pct: 72.0,
      inflow_rate: 35,
      status: "AVAILABLE"
    },
    {
      id: "parking-2",
      name: "West Smart Park Beta",
      lat: 51.5345,
      lng: -0.0285,
      total_spots: 4200,
      occupied_spots: 2950,
      occupancy_pct: 70.24,
      inflow_rate: 28,
      status: "AVAILABLE"
    },
    {
      id: "parking-3",
      name: "South Express Lot Gamma",
      lat: 51.5265,
      lng: -0.0105,
      total_spots: 3800,
      occupied_spots: 2400,
      occupancy_pct: 63.16,
      inflow_rate: 22,
      status: "AVAILABLE"
    }
  ];
}

export function createInitialRoadNetwork() {
  return [
    { id: "road-1", name: "Olympic Boulevard Express", from_node: "transit-1", to_node: "venue-1", distance_km: 1.8, lanes: 4, is_closed: false, congestion_pct: 42.5, current_speed_kmh: 48.0, free_flow_speed_kmh: 60.0, status: "CLEAR", path_coords: [[51.5415, -0.0042], [51.5395, -0.0100], [51.5386, -0.0164]] },
    { id: "road-2", name: "North Innovation Arterial", from_node: "transit-2", to_node: "venue-2", distance_km: 1.2, lanes: 3, is_closed: false, congestion_pct: 65.0, current_speed_kmh: 32.0, free_flow_speed_kmh: 50.0, status: "MODERATE", path_coords: [[51.5490, -0.0135], [51.5470, -0.0115], [51.5452, -0.0102]] },
    { id: "road-3", name: "Cyber Way Concourse", from_node: "venue-2", to_node: "junction-hub", distance_km: 0.8, lanes: 2, is_closed: false, congestion_pct: 58.0, current_speed_kmh: 28.0, free_flow_speed_kmh: 40.0, status: "MODERATE", path_coords: [[51.5452, -0.0102], [51.5435, -0.0095], [51.5420, -0.0090]] },
    { id: "road-4", name: "Aquatic Drive East", from_node: "venue-3", to_node: "junction-central", distance_km: 1.1, lanes: 3, is_closed: false, congestion_pct: 35.0, current_speed_kmh: 42.0, free_flow_speed_kmh: 50.0, status: "CLEAR", path_coords: [[51.5398, -0.0078], [51.5385, -0.0100], [51.5370, -0.0120]] },
    { id: "road-5", name: "South Festival Promenade", from_node: "transit-3", to_node: "venue-4", distance_km: 1.4, lanes: 3, is_closed: false, congestion_pct: 48.0, current_speed_kmh: 38.0, free_flow_speed_kmh: 50.0, status: "CLEAR", path_coords: [[51.5295, -0.0120], [51.5305, -0.0150], [51.5320, -0.0195]] },
    { id: "road-6", name: "West Gate Corridor", from_node: "transit-4", to_node: "gate-west", distance_km: 1.5, lanes: 3, is_closed: false, congestion_pct: 30.0, current_speed_kmh: 45.0, free_flow_speed_kmh: 50.0, status: "CLEAR", path_coords: [[51.5360, -0.0310], [51.5365, -0.0240], [51.5375, -0.0210]] },
    { id: "road-7", name: "Central Loop Arterial", from_node: "junction-central", to_node: "venue-1", distance_km: 0.9, lanes: 4, is_closed: false, congestion_pct: 72.0, current_speed_kmh: 22.0, free_flow_speed_kmh: 50.0, status: "HEAVY", path_coords: [[51.5370, -0.0120], [51.5378, -0.0145], [51.5386, -0.0164]] },
    { id: "road-8", name: "North Gate Shuttle Link", from_node: "parking-1", to_node: "transit-2", distance_km: 0.9, lanes: 2, is_closed: false, congestion_pct: 25.0, current_speed_kmh: 42.0, free_flow_speed_kmh: 45.0, status: "CLEAR", path_coords: [[51.5510, -0.0170], [51.5500, -0.0150], [51.5490, -0.0135]] },
    { id: "road-9", name: "Crown Hotel VIP Shuttle Way", from_node: "hotel-1", to_node: "transit-1", distance_km: 0.8, lanes: 2, is_closed: false, congestion_pct: 38.0, current_speed_kmh: 36.0, free_flow_speed_kmh: 40.0, status: "CLEAR", path_coords: [[51.5460, -0.0015], [51.5435, -0.0028], [51.5415, -0.0042]] },
    { id: "road-10", name: "South Perimeter Highway", from_node: "parking-3", to_node: "transit-3", distance_km: 1.0, lanes: 3, is_closed: false, congestion_pct: 32.0, current_speed_kmh: 45.0, free_flow_speed_kmh: 50.0, status: "CLEAR", path_coords: [[51.5265, -0.0105], [51.5280, -0.0112], [51.5295, -0.0120]] }
  ];
}

export function createInitialAgents() {
  const shuttleRoutes = [
    ["transit-2", "gate-north", "venue-2", "junction-hub", "junction-central", "venue-1", "junction-central", "gate-north", "transit-2"],
    ["transit-3", "venue-4", "gate-south", "junction-central", "venue-1", "junction-central", "gate-south", "transit-3"],
    ["transit-4", "gate-west", "junction-central", "venue-3", "transit-1", "venue-3", "junction-central", "gate-west", "transit-4"],
    ["transit-1", "hotel-1", "transit-1", "venue-3", "junction-central", "venue-1", "transit-1"],
    ["transit-5", "hotel-4", "transit-5", "gate-west", "venue-1", "gate-west", "transit-5"]
  ];

  const agents = [];

  // 1. Shuttles
  for (let i = 0; i < 12; i++) {
    const route = shuttleRoutes[i % shuttleRoutes.length];
    const orig = route[0];
    const c = NODE_COORDS[orig] || [BASE_LAT, BASE_LNG];
    agents.push({
      id: `shuttle-${i + 1}`,
      type: "SHUTTLE_BUS",
      label: `Express Shuttle #${101 + i}`,
      size: 65,
      lat: c[0],
      lng: c[1],
      origin_id: orig,
      destination_id: route[route.length - 1],
      route_node_ids: route,
      current_step_idx: i % (route.length - 1),
      progress_pct: (i * 0.15) % 1.0,
      speed_kmh: 35.0,
      status: "EN_ROUTE",
      rerouted: false
    });
  }

  // 2. Metro Trains
  const metroRoute = ["transit-1", "venue-3", "junction-central", "venue-1", "junction-hub", "venue-2"];
  for (let j = 0; j < 4; j++) {
    const c = NODE_COORDS["transit-1"];
    agents.push({
      id: `metro-${j + 1}`,
      type: "METRO_TRAIN",
      label: `Metro HighCap Train #${800 + j}`,
      size: 450,
      lat: c[0],
      lng: c[1],
      origin_id: "transit-1",
      destination_id: "venue-2",
      route_node_ids: metroRoute,
      current_step_idx: j % (metroRoute.length - 1),
      progress_pct: (j * 0.25) % 1.0,
      speed_kmh: 55.0,
      status: "RAPID_TRANSIT",
      rerouted: false
    });
  }

  // 3. Visitor Cohorts
  const origins = ["transit-1", "transit-2", "transit-3", "transit-4", "parking-1", "parking-2", "hotel-1", "hotel-3"];
  const destinations = ["venue-1", "venue-2", "venue-3", "venue-4"];

  for (let k = 0; k < 40; k++) {
    const orig = origins[k % origins.length];
    const dest = destinations[k % destinations.length];
    const route = [orig, "junction-central", dest];
    const c = NODE_COORDS[orig] || [BASE_LAT, BASE_LNG];
    agents.push({
      id: `group-${k + 1}`,
      type: "VISITOR_GROUP",
      label: `Visitor Cohort G-${String(k + 1).padStart(2, '0')}`,
      size: 100 + (k * 20),
      lat: c[0],
      lng: c[1],
      origin_id: orig,
      destination_id: dest,
      route_node_ids: route,
      current_step_idx: 0,
      progress_pct: (k * 0.08) % 1.0,
      speed_kmh: 4.8,
      status: "WALKING_INFLOW",
      rerouted: false
    });
  }

  return agents;
}

export function createInitialAlerts() {
  return [
    {
      id: "alt-101",
      timestamp: "19:45:00",
      severity: "LOW",
      source: "IoT Ingress Gates",
      title: "Grand Stadium Gate A Turnstiles Optimal",
      description: "Inflow rate steady at 320 pax/min. All 24 biometric turnstiles operational.",
      location_id: "venue-1",
      action_required: "Standard Monitoring",
      acknowledged: true
    },
    {
      id: "alt-102",
      timestamp: "19:44:15",
      severity: "MODERATE",
      source: "AI Transit Vision",
      title: "Tech Dome Approaching 82% Occupancy",
      description: "AI Keynote overflow anticipated in next 45 mins. Moderate pedestrian queue at Innovation Way.",
      location_id: "venue-2",
      action_required: "Prepare auxiliary shuttle staging at North Terminal.",
      acknowledged: false
    }
  ];
}

export function createInitialKPIs() {
  return {
    total_active_visitors: 115900,
    peak_expected_visitors: 165000,
    avg_road_congestion_pct: 48.6,
    avg_transit_wait_time_mins: 4.7,
    avg_turnstile_queue_mins: 3.8,
    active_critical_bottlenecks: 0,
    evacuation_readiness_pct: 94.2,
    hotel_buffer_utilization_pct: 88.5,
    carbon_emission_index: 68.4
  };
}

export function createInitialTelemetry() {
  return {
    event_time: "19:45:00",
    tick: 0,
    is_running: true,
    speed_multiplier: 1.0,
    weather: {
      condition: "CLEAR",
      temperature_c: 24.5,
      precipitation_pct: 0.0,
      wind_speed_kmh: 12.0,
      impact_factor: 1.0
    },
    venues: createInitialVenues(),
    transit_nodes: createInitialTransitNodes(),
    hotels: createInitialHotels(),
    parking_hubs: createInitialParkingHubs(),
    roads: createInitialRoadNetwork(),
    agents: createInitialAgents(),
    alerts: createInitialAlerts(),
    kpis: createInitialKPIs(),
    active_scenario: null,
    applied_optimizations: []
  };
}

// Digital Twin Simulation Class
export class ClientSimulator {
  constructor() {
    this.state = createInitialTelemetry();
    this.baseDate = new Date();
  }

  getTelemetryState() {
    return { ...this.state };
  }

  setRunning(isRunning) {
    this.state.is_running = isRunning;
    return this.getTelemetryState();
  }

  setSpeed(speed) {
    this.state.speed_multiplier = speed;
    return this.getTelemetryState();
  }

  reset() {
    this.state = createInitialTelemetry();
    this.baseDate = new Date();
    return this.getTelemetryState();
  }

  formatTime(totalSeconds) {
    const startHour = 19;
    const startMin = 45;
    const startSec = 0;
    const total = startHour * 3600 + startMin * 60 + startSec + totalSeconds;
    const h = Math.floor((total / 3600) % 24);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  step() {
    if (!this.state.is_running) return this.getTelemetryState();

    this.state.tick += 1;
    this.state.event_time = this.formatTime(Math.floor(this.state.tick * 2 * this.state.speed_multiplier));

    // Advance agents
    const speedMult = this.state.speed_multiplier;
    this.state.agents.forEach(agent => {
      const route = agent.route_node_ids;
      if (!route || route.length < 2) return;

      const baseStep = agent.type === 'VISITOR_GROUP' ? 0.04 : 0.09;
      agent.progress_pct += baseStep * speedMult;

      if (agent.progress_pct >= 1.0) {
        agent.progress_pct = 0.0;
        agent.current_step_idx = (agent.current_step_idx + 1) % (route.length - 1);
      }

      const currNode = route[agent.current_step_idx];
      const nextNode = route[agent.current_step_idx + 1] || route[0];
      const c1 = NODE_COORDS[currNode] || [BASE_LAT, BASE_LNG];
      const c2 = NODE_COORDS[nextNode] || [BASE_LAT, BASE_LNG];

      const p = agent.progress_pct;
      agent.lat = c1[0] + (c2[0] - c1[0]) * p;
      agent.lng = c1[1] + (c2[1] - c1[1]) * p;
    });

    // Gentle fluctuation of road congestion
    this.state.roads.forEach(r => {
      if (r.is_closed) {
        r.congestion_pct = 100.0;
        r.status = "CLOSED";
      } else {
        const jitter = (Math.sin(this.state.tick * 0.1 + r.distance_km) * 1.5);
        r.congestion_pct = Math.max(10, Math.min(95, r.congestion_pct + jitter));
        r.status = r.congestion_pct > 75 ? "HEAVY" : r.congestion_pct > 50 ? "MODERATE" : "CLEAR";
      }
    });

    return { ...this.state };
  }

  triggerScenario(scenarioType) {
    this.state.active_scenario = scenarioType;

    if (scenarioType === "TURNSTILE_FAILURE") {
      this.state.kpis.avg_turnstile_queue_mins = 28.5;
      this.state.kpis.active_critical_bottlenecks = 3;
      this.state.alerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: this.state.event_time,
        severity: "CRITICAL",
        source: "Turnstile Ingress Sensor Array",
        title: "CRITICAL: 16 Gates Offline at Grand Stadium",
        description: "Ingress queue time spiked to 28.5 mins. Immediate pedestrian surge at North Gate Plaza.",
        location_id: "venue-1",
        action_required: "Activate Auxiliary Gateways & Deploy Rapid Queue Stewards.",
        acknowledged: false
      });
    } else if (scenarioType === "SEVERE_WEATHER") {
      this.state.weather = {
        condition: "THUNDERSTORM",
        temperature_c: 18.0,
        precipitation_pct: 92.0,
        wind_speed_kmh: 48.0,
        impact_factor: 0.6
      };
      this.state.kpis.avg_road_congestion_pct = 82.4;
      this.state.kpis.avg_transit_wait_time_mins = 14.8;
      this.state.alerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: this.state.event_time,
        severity: "HIGH",
        source: "Meteo AI Radar",
        title: "Flash Thunderstorm Warning — Surface Mobility Impeded",
        description: "Visibility reduced. Transit speeds reduced by 40%. Indoor concourses receiving crowd surges.",
        location_id: "district-wide",
        action_required: "Deploy covered shuttle buffers and open hotel staging lounges.",
        acknowledged: false
      });
    } else if (scenarioType === "VIP_CONVOY") {
      this.state.kpis.avg_road_congestion_pct = 68.0;
      this.state.roads.forEach(r => {
        if (r.id === "road-1" || r.id === "road-7") {
          r.congestion_pct = 88.0;
          r.status = "HEAVY";
        }
      });
      this.state.alerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: this.state.event_time,
        severity: "HIGH",
        source: "Security Protocol AI",
        title: "VIP Dignitary Motorcade Rolling Road Closure",
        description: "Olympic Boulevard Express reserved for 12 minutes. Traffic diverted to West Gate Corridor.",
        location_id: "road-1",
        action_required: "Execute Dynamic Traffic Signal Preemption.",
        acknowledged: false
      });
    } else if (scenarioType === "METRO_BREAKDOWN") {
      this.state.transit_nodes[0].current_waiting = 7200;
      this.state.transit_nodes[0].avg_wait_time_mins = 19.5;
      this.state.transit_nodes[0].risk_level = "CRITICAL";
      this.state.kpis.avg_transit_wait_time_mins = 18.2;
      this.state.kpis.active_critical_bottlenecks = 4;
      this.state.alerts.unshift({
        id: `alt-${Date.now()}`,
        timestamp: this.state.event_time,
        severity: "CRITICAL",
        source: "HyperMetro Track Telemetry",
        title: "Signaling Fault — Line 1 Stopped at Central Hub",
        description: "Subway service halted. Over 7,000 commuters accumulating at Central Concourse.",
        location_id: "transit-1",
        action_required: "Deploy 25 Bus Bridging Units from North Depot immediately.",
        acknowledged: false
      });
    }

    return { ...this.state };
  }

  applyOptimizations(interventions) {
    this.state.applied_optimizations = interventions || [
      "DEPLOY_SHUTTLE_BRIDGE",
      "REDISTRIBUTE_PEDESTRIANS",
      "DYNAMIC_LANE_REVERSAL",
      "ACTIVATE_HOTEL_BUFFER"
    ];

    // Substantially improve KPIs
    this.state.kpis.avg_road_congestion_pct = 29.2;
    this.state.kpis.avg_transit_wait_time_mins = 4.6;
    this.state.kpis.avg_turnstile_queue_mins = 4.1;
    this.state.kpis.active_critical_bottlenecks = 0;
    this.state.kpis.evacuation_readiness_pct = 98.9;

    this.state.roads.forEach(r => {
      r.congestion_pct = Math.min(38.0, r.congestion_pct * 0.45);
      r.status = "CLEAR";
    });

    this.state.alerts.unshift({
      id: `alt-${Date.now()}`,
      timestamp: this.state.event_time,
      severity: "LOW",
      source: "OR-Tools Multi-Objective Solver",
      title: "OPTIMIZATION APPLIED: District Flow Stabilized",
      description: "Shuttle bridge deployed, 3 lanes reversed, and turnstile bypasses enabled. Congestion reduced by 65%.",
      location_id: "district-wide",
      action_required: "Monitor new equilibrium.",
      acknowledged: true
    });

    return { ...this.state };
  }
}

export const clientSim = new ClientSimulator();
