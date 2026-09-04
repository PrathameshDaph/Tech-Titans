import networkx as nx
import math
from typing import Dict, List, Any
from app.models.schemas import (
    VenueState, TransitNodeState, HotelClusterState, ParkingHubState, 
    RoadEdge, RoadStatus, RiskLevel
)

# Geographic District Center (e.g. Olympic & Expo Park Precinct)
BASE_LAT = 51.5387
BASE_LNG = -0.0165

def create_venues() -> List[VenueState]:
    return [
        VenueState(
            id="venue-1",
            name="Global Grand Stadium",
            category="Main Arena",
            lat=51.5386,
            lng=-0.0164,
            capacity=80000,
            current_occupancy=54200,
            occupancy_pct=67.75,
            inflow_rate=320,
            outflow_rate=110,
            status="OPEN",
            scheduled_event="World Championship Grand Finale",
            event_phase="IN_PROGRESS",
            risk_level=RiskLevel.LOW
        ),
        VenueState(
            id="venue-2",
            name="Tech & Cyber Dome",
            category="Exhibition & Keynote",
            lat=51.5452,
            lng=-0.0102,
            capacity=35000,
            current_occupancy=28500,
            occupancy_pct=81.43,
            inflow_rate=210,
            outflow_rate=190,
            status="OPEN",
            scheduled_event="Global AI & Robotics Summit",
            event_phase="IN_PROGRESS",
            risk_level=RiskLevel.MODERATE
        ),
        VenueState(
            id="venue-3",
            name="Aquatic Innovation Center",
            category="Aquatics & Sports",
            lat=51.5398,
            lng=-0.0078,
            capacity=22000,
            current_occupancy=14300,
            occupancy_pct=65.0,
            inflow_rate=90,
            outflow_rate=75,
            status="OPEN",
            scheduled_event="International Invitational Finals",
            event_phase="IN_PROGRESS",
            risk_level=RiskLevel.LOW
        ),
        VenueState(
            id="venue-4",
            name="Cultural Horizon Plaza",
            category="Concerts & Fan Zone",
            lat=51.5320,
            lng=-0.0195,
            capacity=28000,
            current_occupancy=18900,
            occupancy_pct=67.5,
            inflow_rate=180,
            outflow_rate=120,
            status="OPEN",
            scheduled_event="Global Music & Cultural Gala",
            event_phase="IN_PROGRESS",
            risk_level=RiskLevel.LOW
        )
    ]

def create_transit_nodes() -> List[TransitNodeState]:
    return [
        TransitNodeState(
            id="transit-1",
            name="Central HyperMetro Hub",
            type="METRO",
            lat=51.5415,
            lng=-0.0042,
            capacity=14000,
            current_waiting=3100,
            avg_wait_time_mins=4.2,
            active_vehicles=18,
            dispatch_frequency_mins=2.5,
            status="OPTIMAL",
            risk_level=RiskLevel.LOW
        ),
        TransitNodeState(
            id="transit-2",
            name="North Express Shuttle Depot",
            type="SHUTTLE",
            lat=51.5490,
            lng=-0.0135,
            capacity=9000,
            current_waiting=1850,
            avg_wait_time_mins=5.0,
            active_vehicles=24,
            dispatch_frequency_mins=3.0,
            status="OPTIMAL",
            risk_level=RiskLevel.LOW
        ),
        TransitNodeState(
            id="transit-3",
            name="South Multi-Modal Plaza",
            type="BUS/BRT",
            lat=51.5295,
            lng=-0.0120,
            capacity=11000,
            current_waiting=2900,
            avg_wait_time_mins=6.1,
            active_vehicles=20,
            dispatch_frequency_mins=3.5,
            status="OPTIMAL",
            risk_level=RiskLevel.LOW
        ),
        TransitNodeState(
            id="transit-4",
            name="West Park & Ride Terminal",
            type="SHUTTLE",
            lat=51.5360,
            lng=-0.0310,
            capacity=8500,
            current_waiting=1400,
            avg_wait_time_mins=4.8,
            active_vehicles=16,
            dispatch_frequency_mins=4.0,
            status="OPTIMAL",
            risk_level=RiskLevel.LOW
        ),
        TransitNodeState(
            id="transit-5",
            name="SkyTram Waterfront Link",
            type="TRAM",
            lat=51.5440,
            lng=-0.0240,
            capacity=5000,
            current_waiting=950,
            avg_wait_time_mins=3.5,
            active_vehicles=8,
            dispatch_frequency_mins=2.0,
            status="OPTIMAL",
            risk_level=RiskLevel.LOW
        )
    ]

def create_hotel_clusters() -> List[HotelClusterState]:
    return [
        HotelClusterState(
            id="hotel-1",
            name="Crown Grand Royale & Towers",
            lat=51.5460,
            lng=-0.0015,
            total_rooms=1400,
            occupied_rooms=1260,
            occupancy_pct=90.0,
            checkin_queue=42,
            evacuation_buffer_capacity=180,
            status="HIGH_DEMAND"
        ),
        HotelClusterState(
            id="hotel-2",
            name="Skyline Executive Suites",
            lat=51.5340,
            lng=-0.0050,
            total_rooms=950,
            occupied_rooms=780,
            occupancy_pct=82.1,
            checkin_queue=25,
            evacuation_buffer_capacity=140,
            status="NORMAL"
        ),
        HotelClusterState(
            id="hotel-3",
            name="Marina Bay Summit Resort",
            lat=51.5280,
            lng=-0.0180,
            total_rooms=1600,
            occupied_rooms=1390,
            occupancy_pct=86.87,
            checkin_queue=38,
            evacuation_buffer_capacity=220,
            status="HIGH_DEMAND"
        ),
        HotelClusterState(
            id="hotel-4",
            name="Athletes & VIP Residence Lodge",
            lat=51.5475,
            lng=-0.0220,
            total_rooms=850,
            occupied_rooms=810,
            occupancy_pct=95.29,
            checkin_queue=12,
            evacuation_buffer_capacity=90,
            status="NEAR_CAPACITY"
        )
    ]

def create_parking_hubs() -> List[ParkingHubState]:
    return [
        ParkingHubState(
            id="parking-1",
            name="North Mega Deck Alpha",
            lat=51.5510,
            lng=-0.0170,
            total_spots=5000,
            occupied_spots=3600,
            occupancy_pct=72.0,
            inflow_rate=35,
            status="AVAILABLE"
        ),
        ParkingHubState(
            id="parking-2",
            name="West Smart Park Beta",
            lat=51.5345,
            lng=-0.0285,
            total_spots=4200,
            occupied_spots=2950,
            occupancy_pct=70.24,
            inflow_rate=28,
            status="AVAILABLE"
        ),
        ParkingHubState(
            id="parking-3",
            name="South Express Lot Gamma",
            lat=51.5265,
            lng=-0.0105,
            total_spots=3800,
            occupied_spots=2400,
            occupancy_pct=63.16,
            inflow_rate=22,
            status="AVAILABLE"
        )
    ]

# Nodes dict for fast lookup
NODE_COORDS = {
    # Venues
    "venue-1": [51.5386, -0.0164],
    "venue-2": [51.5452, -0.0102],
    "venue-3": [51.5398, -0.0078],
    "venue-4": [51.5320, -0.0195],
    # Transit
    "transit-1": [51.5415, -0.0042],
    "transit-2": [51.5490, -0.0135],
    "transit-3": [51.5295, -0.0120],
    "transit-4": [51.5360, -0.0310],
    "transit-5": [51.5440, -0.0240],
    # Hotels
    "hotel-1": [51.5460, -0.0015],
    "hotel-2": [51.5340, -0.0050],
    "hotel-3": [51.5280, -0.0180],
    "hotel-4": [51.5475, -0.0220],
    # Parking
    "parking-1": [51.5510, -0.0170],
    "parking-2": [51.5345, -0.0285],
    "parking-3": [51.5265, -0.0105],
    # Key Intersections / Gates
    "gate-north": [51.5470, -0.0150],
    "gate-east": [51.5410, -0.0065],
    "gate-south": [51.5310, -0.0160],
    "gate-west": [51.5370, -0.0250],
    "junction-central": [51.5400, -0.0140],
    "junction-hub": [51.5430, -0.0120]
}

def create_road_network() -> List[RoadEdge]:
    edges_def = [
        ("road-1", "Olympic Central Boulevard", "venue-1", "junction-central", 550, 45.0),
        ("road-2", "Grand Stadium North Concourse", "junction-central", "junction-hub", 450, 45.0),
        ("road-3", "Tech Avenue Expressway", "junction-hub", "venue-2", 600, 50.0),
        ("road-4", "Innovation Way", "venue-2", "gate-north", 500, 40.0),
        ("road-5", "North Terminal Parkway", "gate-north", "transit-2", 400, 45.0),
        ("road-6", "Aquatic Promenade", "junction-central", "venue-3", 650, 35.0),
        ("road-7", "Metro Link Boulevard", "venue-3", "transit-1", 450, 40.0),
        ("road-8", "Hotel Plaza Corridor", "transit-1", "hotel-1", 600, 40.0),
        ("road-9", "East Gate Arterial", "venue-3", "gate-east", 350, 40.0),
        ("road-10", "South Concourse Drive", "junction-central", "gate-south", 900, 50.0),
        ("road-11", "Cultural Parkway", "gate-south", "venue-4", 400, 35.0),
        ("road-12", "South Transit Spine", "venue-4", "transit-3", 550, 45.0),
        ("road-13", "West Gateway Highway", "junction-central", "gate-west", 800, 55.0),
        ("road-14", "Park & Ride Expressway", "gate-west", "transit-4", 650, 50.0),
        ("road-15", "SkyLink Corridor", "gate-west", "transit-5", 700, 45.0),
        ("road-16", "Perimeter Ring Road North", "transit-5", "hotel-4", 600, 50.0),
        ("road-17", "North Parking Access Loop", "transit-2", "parking-1", 450, 40.0),
        ("road-18", "West Parking Spur", "transit-4", "parking-2", 400, 40.0),
        ("road-19", "South Marina Link", "transit-3", "hotel-3", 450, 35.0),
        ("road-20", "Executive East Spine", "transit-1", "hotel-2", 700, 40.0)
    ]

    roads = []
    for r_id, r_name, u, v, length, speed in edges_def:
        coord_u = NODE_COORDS[u]
        coord_v = NODE_COORDS[v]
        # Intermediate curve point for realistic curvature
        mid_lat = (coord_u[0] + coord_v[0]) / 2 + (0.0003 if "Boulevard" in r_name else -0.0002)
        mid_lng = (coord_u[1] + coord_v[1]) / 2
        
        roads.append(
            RoadEdge(
                id=r_id,
                name=r_name,
                from_node=u,
                to_node=v,
                coordinates=[coord_u, [mid_lat, mid_lng], coord_v],
                length_meters=length,
                free_flow_speed_kmh=speed,
                current_speed_kmh=speed * 0.85,
                congestion_pct=28.0,
                vehicle_count=18,
                capacity=80,
                status=RoadStatus.OPEN,
                is_closed=False
            )
        )
    return roads

def build_graph(roads: List[RoadEdge]) -> nx.Graph:
    G = nx.Graph()
    for node, coords in NODE_COORDS.items():
        G.add_node(node, lat=coords[0], lng=coords[1])
    
    for r in roads:
        # If road is closed, assign massive cost penalty
        if r.is_closed or r.status == RoadStatus.CLOSED:
            weight = 999999.0
        else:
            # Weight is travel time in seconds: length / (speed_m_s)
            speed_ms = max(r.current_speed_kmh, 5.0) * (1000.0 / 3600.0)
            weight = r.length_meters / speed_ms
        
        G.add_edge(r.from_node, r.to_node, id=r.id, weight=weight, length=r.length_meters, status=r.status)
    return G

def find_shortest_path(G: nx.Graph, origin: str, dest: str) -> List[str]:
    try:
        path = nx.shortest_path(G, source=origin, target=dest, weight="weight")
        return path
    except Exception:
        # Fallback to direct connection if path not found
        return [origin, dest]
