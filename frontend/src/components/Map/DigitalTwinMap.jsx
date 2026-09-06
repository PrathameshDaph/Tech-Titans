import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  GoogleMap, useJsApiLoader, Marker as GMarker, InfoWindow as GInfoWindow, Polyline as GPolyline, Circle as GCircle 
} from '@react-google-maps/api';
import { 
  Layers, Flame, Eye, Navigation, AlertTriangle, Bus, 
  Building, Hotel, Car, Zap, RefreshCw, ZoomIn, Compass, Key, Check, Globe, MapPin, Sparkles, X, Settings
} from 'lucide-react';

const DEFAULT_CENTER = { lat: 51.5387, lng: -0.0165 };
const DEFAULT_CENTER_ARR = [51.5387, -0.0165];
const DEFAULT_ZOOM = 14;
const MAP_LIBRARIES = ['places', 'visualization'];

const TILE_LAYERS = {
  VOYAGER: {
    name: 'Vector Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 20
  },
  DARK: {
    name: 'Cyber Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 20
  },
  SATELLITE: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    maxZoom: 19
  },
  OSM: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }
};

// SVG Icon helpers for Leaflet divIcons
const createVenueIcon = (name, occPct, isCritical) => {
  const strokeColor = isCritical ? '#e11d48' : occPct > 80 ? '#d97706' : '#0284c7';
  const bgColor = isCritical ? '#ffe4e6' : occPct > 80 ? '#fef3c7' : '#e0f2fe';
  const textColor = isCritical ? '#9f1239' : occPct > 80 ? '#92400e' : '#0369a1';
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <div style="background: white; border: 2px solid ${strokeColor}; border-radius: 12px; padding: 4px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 5px; white-space: nowrap; font-family: sans-serif; font-weight: 800; font-size: 11px; color: #0f172a;">
          <span style="font-size: 14px;">🏟️</span>
          <span>${name}</span>
          <span style="background: ${bgColor}; color: ${textColor}; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-family: monospace;">${Math.round(occPct)}%</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${strokeColor}; margin-top: -1px;"></div>
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
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <div style="background: #0f172a; color: white; border: 2px solid ${badgeColor}; border-radius: 10px; padding: 3px 7px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 5px; white-space: nowrap; font-family: sans-serif; font-weight: 700; font-size: 10px;">
          <span>${emoji}</span>
          <span>${name}</span>
          <span style="background: ${badgeColor}; color: white; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 900;">${waitMins}m</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0f172a;"></div>
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
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <div style="background: white; border: 2px solid #7c3aed; border-radius: 10px; padding: 3px 6px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px; white-space: nowrap; font-family: sans-serif; font-weight: 700; font-size: 10px; color: #4c1d95;">
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

const createVehicleIcon = (type) => {
  const emoji = type === 'METRO_TRAIN' ? '🚄' : '🚐';
  const color = type === 'METRO_TRAIN' ? '#3b82f6' : '#059669';
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="width: 26px; height: 26px; background: white; border: 2px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); font-size: 13px; cursor: pointer; transform: translate(-50%, -50%);">
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
      <div style="width: ${r * 2}px; height: ${r * 2}px; background: ${color}; border: 2px solid white; border-radius: 50%; opacity: 0.85; box-shadow: 0 2px 5px rgba(0,0,0,0.25); transform: translate(-50%, -50%); cursor: pointer;"></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Isolated Google Map Error Boundary to catch any script/runtime issues without crashing the app
class GoogleMapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Google Maps rendering error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[520px] flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center rounded-2xl space-y-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-white">Google Maps Loader Notice</h4>
          <p className="text-xs text-slate-400 max-w-md">
            {this.state.error?.message || 'Google Maps JS loader requires a page refresh with new API options.'}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => this.props.onSwitchToLeaflet()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              Switch to Free OpenGIS Leaflet
            </button>
            <button
              onClick={() => this.props.onOpenKeyModal()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all"
            >
              Update API Key
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Subcomponent that only calls useJsApiLoader when rendered
function GoogleMapsRenderer({
  apiKey,
  googleMapMode,
  roads,
  venues,
  transitNodes,
  hotels,
  agents,
  showRoadFlows,
  showVehicles,
  showHeatmap,
  setSelectedEntity,
  setGoogleMapInstance,
  onSwitchToLeaflet,
  onOpenKeyModal
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES
  });

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[520px] flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center rounded-2xl space-y-3">
        <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-white">Google Maps Authentication Error</h4>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          {loadError.message || 'The Google Maps JavaScript API could not be verified. Ensure Maps JavaScript API is enabled in your Google Cloud Console.'}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onSwitchToLeaflet}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            Use OpenGIS Engine (No Key Needed)
          </button>
          <button
            onClick={onOpenKeyModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-all"
          >
            Change API Key
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[520px] flex flex-col items-center justify-center bg-slate-900 text-white rounded-2xl space-y-2">
        <div className="flex items-center gap-2.5 text-cyan-400 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Connecting to Google Maps Platform...</span>
        </div>
        <p className="text-xs text-slate-400">Streaming vector tiles and satellite feeds</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 relative bg-slate-100" style={{ minHeight: '520px' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={setGoogleMapInstance}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeId: googleMapMode.toLowerCase()
        }}
      >
        {/* Heatmap Circles */}
        {showHeatmap && venues.map(v => {
          const isCrit = v.risk_level === 'CRITICAL';
          return (
            <GCircle
              key={`heat-${v.id}`}
              center={{ lat: v.lat, lng: v.lng }}
              radius={Math.max(120, (v.current_occupancy || 5000) / 180)}
              options={{
                strokeColor: isCrit ? '#e11d48' : v.occupancy_pct > 80 ? '#d97706' : '#0284c7',
                strokeOpacity: 0.8,
                strokeWeight: 1.5,
                fillColor: isCrit ? '#e11d48' : v.occupancy_pct > 80 ? '#f59e0b' : '#38bdf8',
                fillOpacity: 0.25
              }}
            />
          );
        })}

        {/* Roads */}
        {showRoadFlows && roads.map(r => {
          const pts = (r.coordinates || r.path_coords || []).map(p => ({ lat: p[0], lng: p[1] }));
          if (pts.length < 2) return null;
          const isClosed = r.is_closed || r.status === 'CLOSED';
          return (
            <GPolyline
              key={r.id}
              path={pts}
              options={{
                strokeColor: isClosed ? '#e11d48' : r.congestion_pct > 75 ? '#e11d48' : r.congestion_pct > 50 ? '#d97706' : '#0284c7',
                strokeWeight: isClosed ? 6 : 4,
                strokeOpacity: 0.9
              }}
              onClick={() => setSelectedEntity({ type: 'ROAD', data: r })}
            />
          );
        })}

        {/* Venues */}
        {venues.map(v => (
          <GMarker
            key={v.id}
            position={{ lat: v.lat, lng: v.lng }}
            title={`${v.name} (${v.occupancy_pct}%)`}
            onClick={() => setSelectedEntity({ type: 'VENUE', data: v })}
          />
        ))}

        {/* Transit */}
        {transitNodes.map(t => (
          <GMarker
            key={t.id}
            position={{ lat: t.lat, lng: t.lng }}
            title={`${t.name} (${t.avg_wait_time_mins}m wait)`}
            onClick={() => setSelectedEntity({ type: 'TRANSIT', data: t })}
          />
        ))}

        {/* Hotels */}
        {hotels.map(h => (
          <GMarker
            key={h.id}
            position={{ lat: h.lat, lng: h.lng }}
            title={`${h.name} (${h.occupancy_pct}%)`}
            onClick={() => setSelectedEntity({ type: 'HOTEL', data: h })}
          />
        ))}

        {/* Vehicles */}
        {showVehicles && agents.map(a => (
          <GMarker
            key={a.id}
            position={{ lat: a.lat, lng: a.lng }}
            title={`${a.type} (${a.speed_kmh} km/h)`}
            onClick={() => setSelectedEntity({ type: 'AGENT', data: a })}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

export default function DigitalTwinMap({ telemetry, activeRole }) {
  // 1. API Key & Map Engine selection
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('EVENTFLOW_GMAPS_KEY') || envKey || '';
  });
  const [engine, setEngine] = useState(() => {
    return localStorage.getItem('EVENTFLOW_MAP_ENGINE') || (apiKey ? 'GOOGLE_MAPS' : 'LEAFLET');
  });
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // 2. Leaflet References
  const leafletContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletTileLayerRef = useRef(null);
  const leafletLayersRef = useRef({
    venues: null,
    transit: null,
    hotels: null,
    roads: null,
    agents: null,
    heat: null
  });

  // Google Map ref
  const [googleMapInstance, setGoogleMapInstance] = useState(null);

  // Map display settings
  const [mapMode, setMapMode] = useState('VOYAGER'); // VOYAGER, DARK, SATELLITE, OSM
  const [googleMapMode, setGoogleMapMode] = useState('ROADMAP'); // ROADMAP, SATELLITE, HYBRID
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

  // Key Saving Handler
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (cleanKey) {
      localStorage.setItem('EVENTFLOW_GMAPS_KEY', cleanKey);
      localStorage.setItem('EVENTFLOW_MAP_ENGINE', 'GOOGLE_MAPS');
      setApiKey(cleanKey);
      setEngine('GOOGLE_MAPS');
      setShowKeyModal(false);
      // Reload ensures Google Maps JS API script loader initializes cleanly with the new key
      window.location.reload();
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('EVENTFLOW_GMAPS_KEY');
    localStorage.setItem('EVENTFLOW_MAP_ENGINE', 'LEAFLET');
    setApiKey('');
    setInputKey('');
    setEngine('LEAFLET');
    setShowKeyModal(false);
    window.location.reload();
  };

  const handleToggleEngine = (newEngine) => {
    if (newEngine === 'GOOGLE_MAPS' && !apiKey) {
      setShowKeyModal(true);
      return;
    }
    setEngine(newEngine);
    localStorage.setItem('EVENTFLOW_MAP_ENGINE', newEngine);
  };

  // Determine effective engine
  const isGoogleActive = engine === 'GOOGLE_MAPS' && Boolean(apiKey);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (isGoogleActive) return;
    if (!leafletContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(leafletContainerRef.current, {
      center: DEFAULT_CENTER_ARR,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerConfig = TILE_LAYERS[mapMode] || TILE_LAYERS.VOYAGER;
    const tileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || 'abc'
    }).addTo(map);
    leafletTileLayerRef.current = tileLayer;

    leafletLayersRef.current.heat = L.layerGroup().addTo(map);
    leafletLayersRef.current.roads = L.layerGroup().addTo(map);
    leafletLayersRef.current.venues = L.layerGroup().addTo(map);
    leafletLayersRef.current.transit = L.layerGroup().addTo(map);
    leafletLayersRef.current.hotels = L.layerGroup().addTo(map);
    leafletLayersRef.current.agents = L.layerGroup().addTo(map);

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isGoogleActive]);

  // Leaflet Tile layer switching
  useEffect(() => {
    if (isGoogleActive || !leafletMapRef.current || !leafletTileLayerRef.current) return;
    const config = TILE_LAYERS[mapMode] || TILE_LAYERS.VOYAGER;
    
    leafletMapRef.current.removeLayer(leafletTileLayerRef.current);
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc'
    }).addTo(leafletMapRef.current);
    newLayer.bringToBack();
    leafletTileLayerRef.current = newLayer;
  }, [mapMode, isGoogleActive]);

  // Role Camera Pan
  useEffect(() => {
    if (isGoogleActive && googleMapInstance) {
      if (activeRole === 'VENUE_OPS') googleMapInstance.panTo({ lat: 51.5386, lng: -0.0164 });
      else if (activeRole === 'TRANSIT_CHIEF') googleMapInstance.panTo({ lat: 51.5415, lng: -0.0042 });
      else if (activeRole === 'HOSPITALITY_LEAD') googleMapInstance.panTo({ lat: 51.5342, lng: -0.0125 });
      else if (activeRole === 'PUBLIC_SAFETY') googleMapInstance.panTo({ lat: 51.5387, lng: -0.0165 });
    } else if (leafletMapRef.current) {
      if (activeRole === 'VENUE_OPS') leafletMapRef.current.flyTo([51.5386, -0.0164], 15, { duration: 1.0 });
      else if (activeRole === 'TRANSIT_CHIEF') leafletMapRef.current.flyTo([51.5415, -0.0042], 15, { duration: 1.0 });
      else if (activeRole === 'HOSPITALITY_LEAD') leafletMapRef.current.flyTo([51.5342, -0.0125], 15, { duration: 1.0 });
      else if (activeRole === 'PUBLIC_SAFETY') leafletMapRef.current.flyTo([51.5387, -0.0165], 14, { duration: 1.0 });
    }
  }, [activeRole, isGoogleActive, googleMapInstance]);

  // Leaflet Static & Road Layers
  useEffect(() => {
    if (isGoogleActive || !leafletMapRef.current) return;

    // Roads
    const roadsLayer = leafletLayersRef.current.roads;
    if (roadsLayer) {
      roadsLayer.clearLayers();
      if (showRoadFlows) {
        roads.forEach(road => {
          const raw = road.coordinates || road.path_coords || [];
          if (raw.length < 2) return;
          const latLngs = raw.map(pt => [pt[0], pt[1]]);
          const isClosed = road.is_closed || road.status === 'CLOSED';
          const color = isClosed ? '#e11d48' : road.congestion_pct > 75 ? '#e11d48' : road.congestion_pct > 50 ? '#d97706' : '#0284c7';
          const polyline = L.polyline(latLngs, { color, weight: isClosed ? 6 : 4, opacity: 0.9, dashArray: isClosed ? '6,8' : null });
          polyline.on('click', () => setSelectedEntity({ type: 'ROAD', data: road }));
          roadsLayer.addLayer(polyline);
        });
      }
    }

    // Venues & Heat
    const venuesLayer = leafletLayersRef.current.venues;
    const heatLayer = leafletLayersRef.current.heat;
    if (venuesLayer && heatLayer) {
      venuesLayer.clearLayers();
      heatLayer.clearLayers();

      venues.forEach(venue => {
        const isCrit = venue.risk_level === 'CRITICAL';
        const icon = createVenueIcon(venue.name, venue.occupancy_pct, isCrit);
        const marker = L.marker([venue.lat, venue.lng], { icon });
        marker.on('click', () => setSelectedEntity({ type: 'VENUE', data: venue }));
        venuesLayer.addLayer(marker);

        if (showHeatmap) {
          const circle = L.circle([venue.lat, venue.lng], {
            radius: Math.max(120, (venue.current_occupancy || 5000) / 180),
            color: isCrit ? '#e11d48' : venue.occupancy_pct > 80 ? '#d97706' : '#0284c7',
            fillColor: isCrit ? '#e11d48' : venue.occupancy_pct > 80 ? '#f59e0b' : '#38bdf8',
            fillOpacity: 0.2,
            weight: 1.5
          });
          heatLayer.addLayer(circle);
        }
      });
    }

    // Transit
    const transitLayer = leafletLayersRef.current.transit;
    if (transitLayer) {
      transitLayer.clearLayers();
      transitNodes.forEach(t => {
        const isCrit = t.risk_level === 'CRITICAL';
        const icon = createTransitIcon(t.name, t.type, t.avg_wait_time_mins, isCrit);
        const marker = L.marker([t.lat, t.lng], { icon });
        marker.on('click', () => setSelectedEntity({ type: 'TRANSIT', data: t }));
        transitLayer.addLayer(marker);
      });
    }

    // Hotels
    const hotelsLayer = leafletLayersRef.current.hotels;
    if (hotelsLayer) {
      hotelsLayer.clearLayers();
      hotels.forEach(h => {
        const icon = createHotelIcon(h.name, h.occupancy_pct);
        const marker = L.marker([h.lat, h.lng], { icon });
        marker.on('click', () => setSelectedEntity({ type: 'HOTEL', data: h }));
        hotelsLayer.addLayer(marker);
      });
    }
  }, [venues, transitNodes, hotels, roads, showRoadFlows, showHeatmap, isGoogleActive]);

  // Leaflet Dynamic Agents Layer
  useEffect(() => {
    if (isGoogleActive || !leafletMapRef.current) return;
    const agentsLayer = leafletLayersRef.current.agents;
    if (!agentsLayer) return;

    agentsLayer.clearLayers();
    if (showVehicles) {
      agents.forEach(agent => {
        if (!agent.lat || !agent.lng) return;
        const icon = agent.type === 'VISITOR_GROUP' 
          ? createVisitorIcon(agent.size || 100, agent.rerouted)
          : createVehicleIcon(agent.type);
        const marker = L.marker([agent.lat, agent.lng], { icon });
        marker.on('click', () => setSelectedEntity({ type: 'AGENT', data: agent }));
        agentsLayer.addLayer(marker);
      });
    }
  }, [agents, showVehicles, isGoogleActive]);

  const handlePanTo = (lat, lng, zoom = 15) => {
    if (isGoogleActive && googleMapInstance) {
      googleMapInstance.panTo({ lat, lng });
      googleMapInstance.setZoom(zoom);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[540px] rounded-2xl overflow-hidden glass-panel border border-slate-200 shadow-md flex flex-col min-w-0">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-[1000] flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-lg max-w-[calc(100%-20px)]">
        
        {/* Map Engine Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => handleToggleEngine('LEAFLET')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              !isGoogleActive 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>OpenGIS</span>
          </button>
          <button
            onClick={() => {
              if (apiKey) handleToggleEngine('GOOGLE_MAPS');
              else setShowKeyModal(true);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isGoogleActive 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps</span>
            {apiKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
          </button>
        </div>

        {/* Style Modes for Leaflet */}
        {!isGoogleActive && (
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {Object.entries(TILE_LAYERS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setMapMode(key)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  mapMode === key 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>
        )}

        {/* Style Modes for Google Maps */}
        {isGoogleActive && (
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {['ROADMAP', 'SATELLITE', 'HYBRID'].map((mode) => (
              <button
                key={mode}
                onClick={() => setGoogleMapMode(mode)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  googleMapMode === mode 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Layer Toggles */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showHeatmap 
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Crowd Heatmap"
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden md:inline">Heat</span>
        </button>

        <button
          onClick={() => setShowVehicles(!showVehicles)}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showVehicles 
              ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Fleet & Cohorts"
        >
          <Bus className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden md:inline">Fleet</span>
        </button>

        <button
          onClick={() => setShowRoadFlows(!showRoadFlows)}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showRoadFlows 
              ? 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Road Flow"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden md:inline">Roads</span>
        </button>

        {/* Google Maps Key Setup Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            apiKey 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
          }`}
          title="Configure Google Maps API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{apiKey ? 'Key Set' : 'Add API Key'}</span>
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

      {/* Google Maps JS API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Google Maps API Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your Google Cloud Maps JavaScript API Key
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Google Maps API Key:
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-600 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p>💡 <strong>Note:</strong> EventFlow AI already includes a fast, zero-dependency <strong>OpenGIS Leaflet Engine</strong> out of the box.</p>
                <p>If you wish to use Google Maps Platform satellite & vector tiles, enter your key and click Save. The app will activate Google Maps mode.</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save & Activate Key
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Map Render Area */}
      {isGoogleActive ? (
        <GoogleMapErrorBoundary
          onSwitchToLeaflet={() => handleToggleEngine('LEAFLET')}
          onOpenKeyModal={() => setShowKeyModal(true)}
        >
          <GoogleMapsRenderer
            key={apiKey}
            apiKey={apiKey}
            googleMapMode={googleMapMode}
            roads={roads}
            venues={venues}
            transitNodes={transitNodes}
            hotels={hotels}
            agents={agents}
            showRoadFlows={showRoadFlows}
            showVehicles={showVehicles}
            showHeatmap={showHeatmap}
            setSelectedEntity={setSelectedEntity}
            setGoogleMapInstance={setGoogleMapInstance}
            onSwitchToLeaflet={() => handleToggleEngine('LEAFLET')}
            onOpenKeyModal={() => setShowKeyModal(true)}
          />
        </GoogleMapErrorBoundary>
      ) : (
        /* Leaflet OpenGIS Map Rendering (Active by default, 100% working) */
        <div 
          ref={leafletContainerRef} 
          className="w-full h-full flex-1 z-0 relative bg-slate-100" 
          style={{ minHeight: '520px' }}
        />
      )}

      {/* Selected Entity Details Card */}
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
              className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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
