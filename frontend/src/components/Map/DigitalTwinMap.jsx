import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, Flame, Eye, Navigation, AlertTriangle, Bus, 
  Building, Hotel, Car, Zap, RefreshCw, ZoomIn, Compass, Key, Check, Globe, MapPin, Sparkles
} from 'lucide-react';

const DEFAULT_CENTER = [51.5387, -0.0165];
const DEFAULT_ZOOM = 14;

const TILE_LAYERS = {
  VOYAGER: {
    name: 'Vector Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 20
  },
  DARK: {
    name: 'Cyber Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 20
  },
  SATELLITE: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  OSM: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }
};

// Create custom DOM markers using Leaflet divIcon
const createVenueIcon = (name, occPct, isCritical) => {
  const strokeColor = isCritical ? '#e11d48' : occPct > 80 ? '#d97706' : '#0284c7';
  const bgColor = isCritical ? '#ffe4e6' : occPct > 80 ? '#fef3c7' : '#e0f2fe';
  const textColor = isCritical ? '#9f1239' : occPct > 80 ? '#92400e' : '#0369a1';
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: white;
          border: 2px solid ${strokeColor};
          border-radius: 12px;
          padding: 4px 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 11px;
          color: #0f172a;
        ">
          <span style="font-size: 14px;">🏟️</span>
          <span>${name}</span>
          <span style="
            background: ${bgColor};
            color: ${textColor};
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-family: monospace;
          ">${Math.round(occPct)}%</span>
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid ${strokeColor};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createTransitIcon = (name, type, waitMins, isCritical) => {
  const emoji = type === 'METRO' ? '🚄' : '🚌';
  const badgeColor = isCritical ? '#e11d48' : '#d97706';
  
  return L.divIcon({
    className: 'custom-transit-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: #0f172a;
          color: white;
          border: 2px solid ${badgeColor};
          border-radius: 10px;
          padding: 3px 7px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          font-family: sans-serif;
          font-weight: 700;
          font-size: 10px;
        ">
          <span>${emoji}</span>
          <span>${name}</span>
          <span style="
            background: ${badgeColor};
            color: white;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 900;
          ">${waitMins}m</span>
        </div>
        <div style="
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid #0f172a;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createHotelIcon = (name, occPct) => {
  return L.divIcon({
    className: 'custom-hotel-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: white;
          border: 2px solid #7c3aed;
          border-radius: 10px;
          padding: 3px 6px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          font-family: sans-serif;
          font-weight: 700;
          font-size: 10px;
          color: #4c1d95;
        ">
          <span>🏨</span>
          <span>${name}</span>
          <span style="background: #f3e8ff; color: #6b21a8; padding: 1px 4px; border-radius: 4px; font-size: 9px;">${Math.round(occPct)}%</span>
        </div>
        <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #7c3aed;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createVehicleIcon = (type, label) => {
  const emoji = type === 'METRO_TRAIN' ? '🚄' : '🚐';
  const color = type === 'METRO_TRAIN' ? '#3b82f6' : '#059669';
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        width: 26px;
        height: 26px;
        background: white;
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        font-size: 13px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createVisitorIcon = (size, isRerouted) => {
  const color = isRerouted ? '#059669' : '#0284c7';
  const r = Math.min(18, Math.max(10, Math.sqrt(size) * 0.7));
  
  return L.divIcon({
    className: 'custom-visitor-marker',
    html: `
      <div style="
        width: ${r * 2}px;
        height: ${r * 2}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        opacity: 0.85;
        box-shadow: 0 2px 5px rgba(0,0,0,0.25);
        transform: translate(-50%, -50%);
        cursor: pointer;
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export default function DigitalTwinMap({ telemetry, activeRole }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({
    venues: null,
    transit: null,
    hotels: null,
    roads: null,
    agents: null,
    heat: null
  });

  const [mapMode, setMapMode] = useState('VOYAGER'); // VOYAGER, DARK, SATELLITE, OSM
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoadFlows, setShowRoadFlows] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const venues = telemetry?.venues || [];
  const transitNodes = telemetry?.transit_nodes || [];
  const hotels = telemetry?.hotels || [];
  const parkingHubs = telemetry?.parking_hubs || [];
  const roads = telemetry?.roads || [];
  const agents = telemetry?.agents || [];

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer
    const layerConfig = TILE_LAYERS.VOYAGER;
    const tileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || 'abc'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer groups for clean updating
    layersRef.current.heat = L.layerGroup().addTo(map);
    layersRef.current.roads = L.layerGroup().addTo(map);
    layersRef.current.venues = L.layerGroup().addTo(map);
    layersRef.current.transit = L.layerGroup().addTo(map);
    layersRef.current.hotels = L.layerGroup().addTo(map);
    layersRef.current.agents = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Tile layer switching
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const config = TILE_LAYERS[mapMode] || TILE_LAYERS.VOYAGER;
    
    mapRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc'
    }).addTo(mapRef.current);
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [mapMode]);

  // 3. Pan on active role change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (activeRole === 'VENUE_OPS') {
      map.flyTo([51.5386, -0.0164], 15, { duration: 1.2 });
    } else if (activeRole === 'TRANSIT_CHIEF') {
      map.flyTo([51.5415, -0.0042], 15, { duration: 1.2 });
    } else if (activeRole === 'HOSPITALITY_LEAD') {
      map.flyTo([51.5342, -0.0125], 15, { duration: 1.2 });
    } else if (activeRole === 'PUBLIC_SAFETY') {
      map.flyTo([51.5387, -0.0165], 14, { duration: 1.2 });
    }
  }, [activeRole]);

  // 4. Update Static Layers (Venues, Transit, Hotels, Roads, Heatmap)
  useEffect(() => {
    if (!mapRef.current) return;

    // Roads Layer
    const roadsLayer = layersRef.current.roads;
    if (roadsLayer) {
      roadsLayer.clearLayers();
      if (showRoadFlows) {
        roads.forEach(road => {
          const raw = road.coordinates || road.path_coords || [];
          if (raw.length < 2) return;
          const latLngs = raw.map(pt => [pt[0], pt[1]]);
          
          const isClosed = road.is_closed || road.status === 'CLOSED';
          const color = isClosed ? '#e11d48' : road.congestion_pct > 75 ? '#e11d48' : road.congestion_pct > 50 ? '#d97706' : '#0284c7';
          const weight = isClosed ? 6 : road.congestion_pct > 75 ? 5 : 4;
          
          const polyline = L.polyline(latLngs, {
            color,
            weight,
            opacity: 0.9,
            dashArray: isClosed ? '6, 8' : null
          });

          polyline.on('click', () => {
            setSelectedEntity({ type: 'ROAD', data: road });
          });

          roadsLayer.addLayer(polyline);
        });
      }
    }

    // Venues Layer & Heatmap Circles
    const venuesLayer = layersRef.current.venues;
    const heatLayer = layersRef.current.heat;
    if (venuesLayer && heatLayer) {
      venuesLayer.clearLayers();
      heatLayer.clearLayers();

      venues.forEach(venue => {
        const isCrit = venue.risk_level === 'CRITICAL';
        const icon = createVenueIcon(venue.name, venue.occupancy_pct, isCrit);
        const marker = L.marker([venue.lat, venue.lng], { icon });
        marker.on('click', () => {
          setSelectedEntity({ type: 'VENUE', data: venue });
        });
        venuesLayer.addLayer(marker);

        // Heat circle
        if (showHeatmap) {
          const radius = Math.max(120, venue.current_occupancy / 180);
          const circle = L.circle([venue.lat, venue.lng], {
            radius,
            color: isCrit ? '#e11d48' : venue.occupancy_pct > 80 ? '#d97706' : '#0284c7',
            fillColor: isCrit ? '#e11d48' : venue.occupancy_pct > 80 ? '#f59e0b' : '#38bdf8',
            fillOpacity: 0.2,
            weight: 1.5
          });
          heatLayer.addLayer(circle);
        }
      });
    }

    // Transit Nodes Layer
    const transitLayer = layersRef.current.transit;
    if (transitLayer) {
      transitLayer.clearLayers();
      transitNodes.forEach(t => {
        const isCrit = t.risk_level === 'CRITICAL';
        const icon = createTransitIcon(t.name, t.type, t.avg_wait_time_mins, isCrit);
        const marker = L.marker([t.lat, t.lng], { icon });
        marker.on('click', () => {
          setSelectedEntity({ type: 'TRANSIT', data: t });
        });
        transitLayer.addLayer(marker);
      });
    }

    // Hotels Layer
    const hotelsLayer = layersRef.current.hotels;
    if (hotelsLayer) {
      hotelsLayer.clearLayers();
      hotels.forEach(h => {
        const icon = createHotelIcon(h.name, h.occupancy_pct);
        const marker = L.marker([h.lat, h.lng], { icon });
        marker.on('click', () => {
          setSelectedEntity({ type: 'HOTEL', data: h });
        });
        hotelsLayer.addLayer(marker);
      });
    }
  }, [venues, transitNodes, hotels, roads, showRoadFlows, showHeatmap]);

  // 5. Update Dynamic Moving Agents (Vehicles & Visitor Groups)
  useEffect(() => {
    if (!mapRef.current) return;
    const agentsLayer = layersRef.current.agents;
    if (!agentsLayer) return;

    agentsLayer.clearLayers();

    if (showVehicles) {
      agents.forEach(agent => {
        if (!agent.lat || !agent.lng) return;

        let icon;
        if (agent.type === 'VISITOR_GROUP') {
          icon = createVisitorIcon(agent.size || 100, agent.rerouted);
        } else {
          icon = createVehicleIcon(agent.type, agent.label);
        }

        const marker = L.marker([agent.lat, agent.lng], { icon });
        marker.on('click', () => {
          setSelectedEntity({ type: 'AGENT', data: agent });
        });

        agentsLayer.addLayer(marker);
      });
    }
  }, [agents, showVehicles]);

  const handlePanTo = (lat, lng, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[540px] rounded-2xl overflow-hidden glass-panel border border-slate-200 shadow-md flex flex-col min-w-0">
      
      {/* Top Floating GIS Control Bar */}
      <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-[1000] flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-lg max-w-[calc(100%-20px)]">
        
        {/* Style Modes */}
        <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
          {Object.entries(TILE_LAYERS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setMapMode(key)}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapMode === key 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showHeatmap 
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Crowd Density Heatmap"
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Crowd Heat</span>
        </button>

        <button
          onClick={() => setShowVehicles(!showVehicles)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showVehicles 
              ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Moving Fleet & Cohorts"
        >
          <Bus className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Fleet</span>
        </button>

        <button
          onClick={() => setShowRoadFlows(!showRoadFlows)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showRoadFlows 
              ? 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Arterial Road Congestion Flow"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">Road Flow</span>
        </button>
      </div>

      {/* Camera Jump Presets (Desktop) */}
      <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-[1000] hidden xl:flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-lg">
        <button
          onClick={() => handlePanTo(51.5387, -0.0165, 14)}
          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Reset District
        </button>
        <button
          onClick={() => handlePanTo(51.5386, -0.0164, 16)}
          className="px-2.5 py-1 text-xs font-bold text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
        >
          Stadium
        </button>
        <button
          onClick={() => handlePanTo(51.5415, -0.0042, 16)}
          className="px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
        >
          HyperMetro
        </button>
      </div>

      {/* Main Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full flex-1 z-0 relative bg-slate-100" 
        style={{ minHeight: '520px' }}
      />

      {/* Selected Entity Details Overlay Card */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 z-[1000] max-w-sm w-[calc(100%-32px)] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl space-y-2.5 animate-fade-in">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">
                {selectedEntity.type} TELEMETRY
              </span>
              <h4 className="text-sm font-black text-slate-900 font-heading">
                {selectedEntity.data.name || selectedEntity.data.label}
              </h4>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {selectedEntity.type === 'VENUE' && (
            <div className="space-y-1.5 text-xs text-slate-600">
              <p><strong>Scheduled Event:</strong> {selectedEntity.data.scheduled_event}</p>
              <p><strong>Current Occupancy:</strong> {(selectedEntity.data.current_occupancy || 0).toLocaleString()} / {(selectedEntity.data.capacity || 0).toLocaleString()} ({selectedEntity.data.occupancy_pct}%)</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${selectedEntity.data.occupancy_pct > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                  style={{ width: `${selectedEntity.data.occupancy_pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-slate-500">
                <span>Inflow: <strong className="text-emerald-700">{selectedEntity.data.inflow_rate} pax/min</strong></span>
                <span>Outflow: <strong className="text-amber-700">{selectedEntity.data.outflow_rate} pax/min</strong></span>
              </div>
            </div>
          )}

          {selectedEntity.type === 'TRANSIT' && (
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Transit Hub Type:</strong> {selectedEntity.data.type} Express Network</p>
              <p><strong>Passengers Queued:</strong> {(selectedEntity.data.current_waiting || 0).toLocaleString()} pax</p>
              <p><strong>Headway Wait Time:</strong> <strong className="text-amber-700">{selectedEntity.data.avg_wait_time_mins} mins</strong></p>
              <p><strong>Active Vehicles:</strong> {selectedEntity.data.active_vehicles || 18} units</p>
            </div>
          )}

          {selectedEntity.type === 'HOTEL' && (
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Occupied Rooms:</strong> {selectedEntity.data.occupied_rooms} / {selectedEntity.data.total_rooms} ({selectedEntity.data.occupancy_pct}%)</p>
              <p><strong>Evacuation Buffer:</strong> <strong className="text-emerald-700">{selectedEntity.data.evacuation_buffer_capacity} beds ready</strong></p>
            </div>
          )}

          {selectedEntity.type === 'ROAD' && (
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Congestion Level:</strong> <strong className="text-cyan-700">{selectedEntity.data.congestion_pct}%</strong></p>
              <p><strong>Average Speed:</strong> {Math.round(selectedEntity.data.current_speed_kmh || 45)} km/h</p>
              <p><strong>Status:</strong> {selectedEntity.data.status || 'CLEAR'}</p>
            </div>
          )}

          {selectedEntity.type === 'AGENT' && (
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Entity Type:</strong> {selectedEntity.data.type}</p>
              <p><strong>Headcount:</strong> {selectedEntity.data.size} passengers</p>
              <p><strong>Speed:</strong> {selectedEntity.data.speed_kmh} km/h</p>
              {selectedEntity.data.rerouted && <p className="text-emerald-700 font-bold">✨ AI Rerouted</p>}
            </div>
          )}
        </div>
      )}

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-3.5 left-3.5 z-[1000] hidden sm:flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 text-xs text-slate-700 shadow-lg">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-xs"></span>
          <span>Normal Flow</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
          <span>Moderate Load</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Surge / Bottleneck</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
          <span>AI Optimized</span>
        </div>
      </div>

    </div>
  );
}
