import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline, Circle, OverlayView 
} from '@react-google-maps/api';
import { 
  Layers, Flame, Eye, Navigation, AlertTriangle, Bus, 
  Building, Hotel, Car, Zap, RefreshCw, ZoomIn, Compass, Key, Check, Globe
} from 'lucide-react';

const MAP_LIBRARIES = ['places', 'visualization'];

const DEFAULT_CENTER = { lat: 51.5387, lng: -0.0165 };

// Modern light theme styling for Google Maps 2D
const LIGHT_MAP_STYLES = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }, { lightness: 17 }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f8fafc" }, { lightness: 20 }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }, { lightness: 17 }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#cbd5e1" }, { lightness: 29 }, { weight: 0.2 }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }, { lightness: 18 }]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }, { lightness: 16 }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }, { lightness: 21 }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dcfce7" }, { lightness: 21 }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 2 }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ saturation: 36 }, { color: "#334155" }, { lightness: 20 }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }, { weight: 1.2 }]
  }
];

// Helper to create SVG data URL icons for Google Maps
const getVenueMarkerIcon = (occPct, isCritical) => {
  const color = isCritical ? '#e11d48' : occPct > 80 ? '#d97706' : '#0284c7';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="white" stroke="${color}" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"/>
      <rect x="9" y="9" width="28" height="28" rx="8" fill="${color}" fill-opacity="0.1"/>
      <text x="23" y="27" font-family="sans-serif" font-size="11" font-weight="900" fill="${color}" text-anchor="middle">${Math.round(occPct)}%</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getTransitMarkerIcon = (type, waitMins, isCritical) => {
  const color = isCritical ? '#e11d48' : '#d97706';
  const emoji = type === 'METRO' ? '🚆' : '🚌';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect x="4" y="4" width="32" height="32" rx="10" fill="${color}" stroke="white" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <text x="20" y="24" font-size="14" text-anchor="middle">${emoji}</text>
      <circle cx="31" cy="9" r="8" fill="#0f172a" stroke="white" stroke-width="1.5"/>
      <text x="31" y="12" font-family="sans-serif" font-size="8" font-weight="bold" fill="#fef08a" text-anchor="middle">${waitMins}m</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getHotelMarkerIcon = (occPct) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <rect x="3" y="3" width="30" height="30" rx="8" fill="#7c3aed" stroke="white" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"/>
      <text x="18" y="20" font-size="12" text-anchor="middle">🏨</text>
      <text x="18" y="30" font-family="sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">${occPct}%</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getVisitorMarkerIcon = (size, isSurge, isRerouted) => {
  const color = isRerouted ? '#059669' : isSurge ? '#e11d48' : '#0284c7';
  const radius = Math.min(16, Math.max(8, Math.sqrt(size) * 0.8));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${radius * 2}" height="${radius * 2}" viewBox="0 0 ${radius * 2} ${radius * 2}">
      <circle cx="${radius}" cy="${radius}" r="${radius - 1.5}" fill="${color}" stroke="white" stroke-width="2" fill-opacity="0.9" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.25))"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getVehicleMarkerIcon = (type) => {
  const emoji = type === 'METRO_TRAIN' ? '🚄' : '🚐';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="white" stroke="#0284c7" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"/>
      <text x="16" y="21" font-size="13" text-anchor="middle">${emoji}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export default function DigitalTwinMap({ telemetry, activeRole }) {
  // 1. API Key detection (from .env or localStorage override)
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('EVENTFLOW_GMAPS_KEY') || envKey || '';
  });
  const [inputKey, setInputKey] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  // 2. Google Maps JS API loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES
  });

  // Map state
  const [mapInstance, setMapInstance] = useState(null);
  const [mapMode, setMapMode] = useState('ROADMAP'); // ROADMAP, SATELLITE, HYBRID
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

  // Handle role-based camera updates
  useEffect(() => {
    if (!mapInstance) return;
    if (activeRole === 'VENUE_OPS') {
      mapInstance.panTo({ lat: 51.5386, lng: -0.0164 });
      mapInstance.setZoom(15);
    } else if (activeRole === 'TRANSIT_CHIEF') {
      mapInstance.panTo({ lat: 51.5415, lng: -0.0042 });
      mapInstance.setZoom(15);
    } else if (activeRole === 'HOSPITALITY_LEAD') {
      mapInstance.panTo({ lat: 51.5342, lng: -0.0125 });
      mapInstance.setZoom(15);
    } else if (activeRole === 'PUBLIC_SAFETY') {
      mapInstance.panTo({ lat: 51.5387, lng: -0.0165 });
      mapInstance.setZoom(14);
    }
  }, [activeRole, mapInstance]);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      localStorage.setItem('EVENTFLOW_GMAPS_KEY', inputKey.trim());
      setApiKey(inputKey.trim());
      setShowKeyPrompt(false);
    }
  };

  const getRoadColor = (road) => {
    if (road.is_closed || road.status === 'CLOSED') return '#e11d48';
    if (road.congestion_pct > 75) return '#e11d48';
    if (road.congestion_pct > 50) return '#d97706';
    return '#0284c7';
  };

  const handlePanTo = (lat, lng, zoom = 15) => {
    if (mapInstance) {
      mapInstance.panTo({ lat, lng });
      mapInstance.setZoom(zoom);
    }
  };

  // If API key is missing or load failed, render clean Digital Twin fallback
  const isKeyActive = Boolean(apiKey && !loadError);

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden glass-panel border border-slate-200 shadow-md flex flex-col min-w-0">
      {/* Top Floating Control Bar */}
      <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-lg max-w-[calc(100%-20px)]">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMapMode('ROADMAP')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mapMode === 'ROADMAP' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Map
          </button>
          <button
            onClick={() => setMapMode('SATELLITE')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mapMode === 'SATELLITE' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapMode('HYBRID')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mapMode === 'HYBRID' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hybrid
          </button>
        </div>

        {/* Layer Toggles */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all ${
            showHeatmap 
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Crowd Heat</span>
        </button>

        <button
          onClick={() => setShowVehicles(!showVehicles)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all ${
            showVehicles 
              ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Bus className="w-3.5 h-3.5 text-amber-600" />
          <span>Fleet</span>
        </button>

        <button
          onClick={() => setShowRoadFlows(!showRoadFlows)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all ${
            showRoadFlows 
              ? 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span>Road Flow</span>
        </button>
      </div>

      {/* Camera Presets & Key Config Badge */}
      <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-20 hidden md:flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-lg">
        <button
          onClick={() => handlePanTo(51.5387, -0.0165, 14)}
          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Reset District
        </button>
        <button
          onClick={() => handlePanTo(51.5386, -0.0164, 16)}
          className="px-2.5 py-1 text-xs font-bold text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
        >
          Arena 1
        </button>
        <button
          onClick={() => handlePanTo(51.5415, -0.0042, 16)}
          className="px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
        >
          Metro Hub
        </button>
        <button
          onClick={() => setShowKeyPrompt(!showKeyPrompt)}
          className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Google Maps API Key Setup"
        >
          <Key className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* API Key Entry Modal/Bar if Prompted or Key Missing */}
      {showKeyPrompt && (
        <div className="absolute top-16 right-3.5 z-30 w-80 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-600" /> Google Maps API Key
            </span>
            <button 
              onClick={() => setShowKeyPrompt(false)} 
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Configure <code className="text-cyan-700 font-mono font-bold">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="font-mono">.env</code> or paste your key below:
          </p>
          <form onSubmit={handleSaveKey} className="space-y-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:border-cyan-600 outline-none"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Save & Activate Map
            </button>
          </form>
        </div>
      )}

      {/* Main Map Render Area */}
      <div className="w-full h-full flex-1 relative bg-slate-50">
        {isKeyActive && isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={DEFAULT_CENTER}
            zoom={14}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: LIGHT_MAP_STYLES,
              mapTypeId: mapMode.toLowerCase()
            }}
          >
            {/* Road Congestion Polylines */}
            {showRoadFlows && roads.map((road) => {
              const path = road.coordinates.map(coord => ({ lat: coord[0], lng: coord[1] }));
              const color = getRoadColor(road);
              const isClosed = road.is_closed || road.status === 'CLOSED';
              return (
                <Polyline
                  key={road.id}
                  path={path}
                  options={{
                    strokeColor: color,
                    strokeOpacity: 0.9,
                    strokeWeight: isClosed ? 6 : 4,
                    zIndex: isClosed ? 10 : 5
                  }}
                  onClick={() => setSelectedEntity({ type: 'ROAD', data: road, pos: path[Math.floor(path.length / 2)] })}
                />
              );
            })}

            {/* Crowd Density Heatmap Circles */}
            {showHeatmap && venues.map((v) => (
              <Circle
                key={`heat-${v.id}`}
                center={{ lat: v.lat, lng: v.lng }}
                radius={v.current_occupancy / 50}
                options={{
                  fillColor: v.risk_level === 'CRITICAL' ? '#e11d48' : v.occupancy_pct > 80 ? '#d97706' : '#0284c7',
                  fillOpacity: 0.18,
                  strokeColor: v.risk_level === 'CRITICAL' ? '#e11d48' : '#0284c7',
                  strokeWeight: 1.5,
                  zIndex: 2
                }}
              />
            ))}

            {/* Venues */}
            {venues.map((venue) => (
              <Marker
                key={venue.id}
                position={{ lat: venue.lat, lng: venue.lng }}
                icon={{
                  url: getVenueMarkerIcon(venue.occupancy_pct, venue.risk_level === 'CRITICAL'),
                  anchor: new window.google.maps.Point(23, 23)
                }}
                onClick={() => setSelectedEntity({ type: 'VENUE', data: venue, pos: { lat: venue.lat, lng: venue.lng } })}
              />
            ))}

            {/* Transit Nodes */}
            {transitNodes.map((transit) => (
              <Marker
                key={transit.id}
                position={{ lat: transit.lat, lng: transit.lng }}
                icon={{
                  url: getTransitMarkerIcon(transit.type, transit.avg_wait_time_mins, transit.risk_level === 'CRITICAL'),
                  anchor: new window.google.maps.Point(20, 20)
                }}
                onClick={() => setSelectedEntity({ type: 'TRANSIT', data: transit, pos: { lat: transit.lat, lng: transit.lng } })}
              />
            ))}

            {/* Hotels */}
            {hotels.map((hotel) => (
              <Marker
                key={hotel.id}
                position={{ lat: hotel.lat, lng: hotel.lng }}
                icon={{
                  url: getHotelMarkerIcon(Math.round(hotel.occupancy_pct)),
                  anchor: new window.google.maps.Point(18, 18)
                }}
                onClick={() => setSelectedEntity({ type: 'HOTEL', data: hotel, pos: { lat: hotel.lat, lng: hotel.lng } })}
              />
            ))}

            {/* Moving Visitor Groups & Vehicle Fleet */}
            {agents.map((agent) => {
              if (agent.type === 'VISITOR_GROUP') {
                const isSurge = agent.status.includes('SURGE');
                return (
                  <Marker
                    key={agent.id}
                    position={{ lat: agent.lat, lng: agent.lng }}
                    icon={{
                      url: getVisitorMarkerIcon(agent.size, isSurge, agent.rerouted),
                      anchor: new window.google.maps.Point(10, 10)
                    }}
                    onClick={() => setSelectedEntity({ type: 'AGENT', data: agent, pos: { lat: agent.lat, lng: agent.lng } })}
                  />
                );
              } else if (showVehicles) {
                return (
                  <Marker
                    key={agent.id}
                    position={{ lat: agent.lat, lng: agent.lng }}
                    icon={{
                      url: getVehicleMarkerIcon(agent.type),
                      anchor: new window.google.maps.Point(16, 16)
                    }}
                    onClick={() => setSelectedEntity({ type: 'AGENT', data: agent, pos: { lat: agent.lat, lng: agent.lng } })}
                  />
                );
              }
              return null;
            })}

            {/* Selected InfoWindow Popup */}
            {selectedEntity && (
              <InfoWindow
                position={selectedEntity.pos}
                onCloseClick={() => setSelectedEntity(null)}
              >
                <div className="p-2 min-w-[200px] text-slate-800 font-sans space-y-1.5">
                  {selectedEntity.type === 'VENUE' && (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <h4 className="font-extrabold text-sm text-cyan-800">{selectedEntity.data.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800">
                          {selectedEntity.data.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600"><strong>Event:</strong> {selectedEntity.data.scheduled_event}</p>
                      <p className="text-xs text-slate-600">
                        <strong>Occupancy:</strong> {selectedEntity.data.current_occupancy.toLocaleString()} / {selectedEntity.data.capacity.toLocaleString()} ({selectedEntity.data.occupancy_pct}%)
                      </p>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${selectedEntity.data.occupancy_pct > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                          style={{ width: `${selectedEntity.data.occupancy_pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1">
                        Inflow: <strong className="text-emerald-700">{selectedEntity.data.inflow_rate} pax/min</strong> | Outflow: <strong className="text-amber-700">{selectedEntity.data.outflow_rate} pax/min</strong>
                      </p>
                    </>
                  )}

                  {selectedEntity.type === 'TRANSIT' && (
                    <>
                      <h4 className="font-extrabold text-sm text-amber-800">{selectedEntity.data.name}</h4>
                      <p className="text-xs text-slate-600"><strong>Type:</strong> {selectedEntity.data.type} Backbone</p>
                      <p className="text-xs text-slate-600"><strong>Waiting:</strong> {selectedEntity.data.current_waiting.toLocaleString()} pax</p>
                      <p className="text-xs text-slate-600"><strong>Headway Wait:</strong> <strong className="text-amber-700">{selectedEntity.data.avg_wait_time_mins} mins</strong></p>
                    </>
                  )}

                  {selectedEntity.type === 'HOTEL' && (
                    <>
                      <h4 className="font-extrabold text-sm text-purple-800">{selectedEntity.data.name}</h4>
                      <p className="text-xs text-slate-600"><strong>Rooms:</strong> {selectedEntity.data.occupied_rooms} / {selectedEntity.data.total_rooms} ({selectedEntity.data.occupancy_pct}%)</p>
                      <p className="text-xs text-slate-600"><strong>Evacuation Buffer:</strong> <strong className="text-emerald-700">{selectedEntity.data.evacuation_buffer_capacity} suites</strong></p>
                    </>
                  )}

                  {selectedEntity.type === 'ROAD' && (
                    <>
                      <h4 className="font-extrabold text-sm text-slate-900">{selectedEntity.data.name}</h4>
                      <p className="text-xs text-slate-600"><strong>Congestion:</strong> {selectedEntity.data.congestion_pct}%</p>
                      <p className="text-xs text-slate-600"><strong>Speed:</strong> {Math.round(selectedEntity.data.current_speed_kmh)} km/h</p>
                      {selectedEntity.data.is_closed && <p className="text-rose-600 font-bold text-xs">⛔ ROAD CLOSED</p>}
                    </>
                  )}

                  {selectedEntity.type === 'AGENT' && (
                    <>
                      <h4 className="font-extrabold text-sm text-slate-900">{selectedEntity.data.label}</h4>
                      <p className="text-xs text-slate-600"><strong>Headcount:</strong> {selectedEntity.data.size} pax</p>
                      {selectedEntity.data.rerouted && <p className="text-emerald-700 font-bold text-xs">✨ AI Rerouted</p>}
                    </>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          /* Clean 2D Digital Twin GIS Visualizer (Fallback when API key is unconfigured) */
          <div className="w-full h-full flex flex-col items-center justify-center relative p-6 bg-gradient-to-b from-sky-50/40 via-white to-slate-100 overflow-hidden select-none">
            {/* Background GIS Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-60"></div>

            {/* SVG Vector Overlays for Roads & Venues */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="none">
              {/* Roads */}
              <line x1="120" y1="240" x2="680" y2="240" stroke="#0284c7" strokeWidth="6" strokeOpacity="0.8" />
              <line x1="400" y1="80" x2="400" y2="440" stroke="#0284c7" strokeWidth="5" strokeOpacity="0.7" />
              <line x1="200" y1="120" x2="600" y2="380" stroke="#d97706" strokeWidth="4" strokeOpacity="0.8" strokeDasharray="6,4" />
            </svg>

            {/* Interactive Notice Badge */}
            <div className="z-10 max-w-md w-full bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-xl text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center mx-auto shadow-xs">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Google Maps Platform Ready
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  EventFlow AI is integrated with Google Maps JavaScript API. Add your <code className="text-cyan-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="font-mono">.env</code> to activate live tiles.
                </p>
              </div>

              {/* Quick Input Form */}
              <form onSubmit={handleSaveKey} className="flex gap-2">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste Google Maps API Key here..."
                  className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-cyan-600 outline-none shadow-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Activate
                </button>
              </form>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Active Venues: <strong className="text-slate-700">{venues.length}</strong></span>
                <span>•</span>
                <span>Transit Nodes: <strong className="text-slate-700">{transitNodes.length}</strong></span>
                <span>•</span>
                <span>Hotels: <strong className="text-slate-700">{hotels.length}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3.5 left-3.5 z-20 hidden sm:flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 text-xs text-slate-700 shadow-lg">
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

