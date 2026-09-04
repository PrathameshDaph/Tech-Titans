from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EntityType(str, Enum):
    VENUE = "VENUE"
    TRANSIT_HUB = "TRANSIT_HUB"
    HOTEL_CLUSTER = "HOTEL_CLUSTER"
    PARKING_HUB = "PARKING_HUB"
    GATE = "GATE"
    INTERSECTION = "INTERSECTION"

class RoadStatus(str, Enum):
    OPEN = "OPEN"
    CONGESTED = "CONGESTED"
    CRITICAL = "CRITICAL"
    CLOSED = "CLOSED"

class AgentType(str, Enum):
    VISITOR_GROUP = "VISITOR_GROUP"
    SHUTTLE_BUS = "SHUTTLE_BUS"
    METRO_TRAIN = "METRO_TRAIN"
    EMERGENCY_VEHICLE = "EMERGENCY_VEHICLE"
    AUTONOMOUS_POD = "AUTONOMOUS_POD"

class GeoPoint(BaseModel):
    lat: float
    lng: float

class VenueState(BaseModel):
    id: str
    name: str
    category: str
    lat: float
    lng: float
    capacity: int
    current_occupancy: int
    occupancy_pct: float
    inflow_rate: int  # people per minute
    outflow_rate: int
    status: str
    scheduled_event: str
    event_phase: str  # PRE_EVENT, IN_PROGRESS, PEAK_EXIT, POST_EVENT
    risk_level: RiskLevel

class TransitNodeState(BaseModel):
    id: str
    name: str
    type: str  # METRO, SHUTTLE, BUS, TRAM
    lat: float
    lng: float
    capacity: int
    current_waiting: int
    avg_wait_time_mins: float
    active_vehicles: int
    dispatch_frequency_mins: float
    status: str
    risk_level: RiskLevel

class HotelClusterState(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    total_rooms: int
    occupied_rooms: int
    occupancy_pct: float
    checkin_queue: int
    evacuation_buffer_capacity: int
    status: str

class ParkingHubState(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    total_spots: int
    occupied_spots: int
    occupancy_pct: float
    inflow_rate: int
    status: str

class RoadEdge(BaseModel):
    id: str
    name: str
    from_node: str
    to_node: str
    coordinates: List[List[float]]  # [[lat, lng], ...]
    length_meters: float
    free_flow_speed_kmh: float
    current_speed_kmh: float
    congestion_pct: float
    vehicle_count: int
    capacity: int
    status: RoadStatus
    is_closed: bool = False

class MovingAgent(BaseModel):
    id: str
    type: AgentType
    label: str
    size: int  # aggregated head count for visitor group or passenger count
    lat: float
    lng: float
    origin_id: str
    destination_id: str
    route_node_ids: List[str]
    current_step_idx: int
    progress_pct: float
    speed_kmh: float
    status: str
    rerouted: bool = False

class WeatherCondition(BaseModel):
    condition: str  # CLEAR, LIGHT_RAIN, THUNDERSTORM, EXTREME_HEAT
    temperature_c: float
    precipitation_pct: float
    wind_speed_kmh: float
    impact_factor: float

class AlertItem(BaseModel):
    id: str
    timestamp: str
    severity: RiskLevel
    source: str
    title: str
    description: str
    location_id: Optional[str] = None
    action_required: str
    acknowledged: bool = False

class SimulationKPIs(BaseModel):
    total_active_visitors: int
    total_transport_passengers: int
    avg_transit_wait_mins: float
    avg_road_congestion_pct: float
    peak_venue_occupancy_pct: float
    critical_bottleneck_count: int
    safety_risk_index: float  # 0 - 100
    hotel_utilization_pct: float
    carbon_emissions_kg_hr: float

class TelemetryState(BaseModel):
    event_time: str
    tick_count: int
    is_running: bool
    speed_multiplier: float
    weather: WeatherCondition
    kpis: SimulationKPIs
    venues: List[VenueState]
    transit_nodes: List[TransitNodeState]
    hotels: List[HotelClusterState]
    parking_hubs: List[ParkingHubState]
    roads: List[RoadEdge]
    agents: List[MovingAgent]
    alerts: List[AlertItem]
    active_scenario: Optional[str] = None
    applied_optimizations: List[str] = []

class ScenarioTriggerRequest(BaseModel):
    scenario_type: str  # VISITOR_SURGE, ROAD_CLOSURE, WEATHER_ALERT, METRO_OUTAGE, VENUE_DELAY
    target_id: Optional[str] = None
    magnitude_pct: Optional[float] = 50.0
    duration_mins: Optional[int] = 60
    custom_params: Optional[Dict[str, Any]] = None

class HorizonPrediction(BaseModel):
    horizon_minutes: int  # 30, 60, 90, 120
    predicted_visitors: int
    predicted_congestion_index: float
    venue_risks: Dict[str, float]  # venue_id -> occupancy pct
    transit_wait_times: Dict[str, float]  # transit_id -> wait mins
    bottleneck_zones: List[str]
    risk_level: RiskLevel
    anomaly_probability: float

class PredictionResponse(BaseModel):
    generated_at: str
    algorithm: str
    horizons: List[HorizonPrediction]
    key_findings: List[str]
    root_cause_analysis: str

class OptimizationRecommendation(BaseModel):
    id: str
    domain: str  # TRANSIT, PEDESTRIAN, ROAD_NETWORK, HOSPITALITY
    priority: str  # URGENT, HIGH, MEDIUM
    title: str
    action_summary: str
    mathematical_justification: str
    target_entities: List[str]
    parameters: Dict[str, Any]
    expected_impact: Dict[str, str]

class OptimizationRunResponse(BaseModel):
    solver_status: str
    solve_time_ms: float
    objective_value: float
    total_interventions: int
    recommendations: List[OptimizationRecommendation]
    summary: str

class BeforeAfterComparison(BaseModel):
    metric_name: str
    before_value: float
    after_value: float
    unit: str
    improvement_pct: float
    is_positive: bool

class CopilotQuery(BaseModel):
    query: str
    role: Optional[str] = "MASTER_ORCHESTRATOR"
    context_zone: Optional[str] = None

class CopilotResponse(BaseModel):
    answer: str
    suggested_actions: List[str]
    stakeholder_briefs: Dict[str, str]
    confidence_score: float
