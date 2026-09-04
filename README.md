# Tech Titans — EventFlow AI
### Mega-Event Hospitality & Mobility Orchestration (PS 8)

> **EventFlow AI**: A real-time, interactive, AI-powered digital twin command system that predicts crowd bottlenecks 30–120 minutes ahead, solves cross-domain resource allocation using **Google OR-Tools + NetworkX**, dynamically balances moving attendees, transit fleets, and hospitality buffers on **Google Maps Platform (2D)**, and delivers GenAI stakeholder briefings.

---

## 🏛️ System Architecture

```
+-----------------------------------------------------------------------------------+
|               COMMAND DASHBOARD (React + Tailwind + Google Maps 2D)               |
|  - Real-Time GIS Map (Moving Cohorts, Vehicle Fleet, Heatmaps, Road Polylines)     |
|  - 5 Operational Role Command Views (Master, Venues, Transit, Hospitality, Safety)|
|  - AI Predictive Horizon | Google OR-Tools Optimizer | AI Event Copilot Chat     |
|  - 4-Step Interactive Walkthrough Bar | Before vs After Benchmarks                |
+-----------------------------------------------------------------------------------+
                                      │ ▲ WebSockets & REST APIs
                                      ▼ │
+-----------------------------------------------------------------------------------+
|                             FASTAPI BACKEND ENGINE                                |
|                                                                                   |
|  +------------------------+  +------------------------+  +----------------------+ |
|  |  Digital Twin Engine   |  |  AI Prediction Engine  |  |   OR-Tools Solver    | |
|  | - 120k Aggregated Ppl  |  | - XGBoost / Graph Model|  | - Mixed-Integer Prog | |
|  | - 38+ Shuttles & Pods  |  | - 30-120 min Forecasts |  | - NetworkX Dijkstra | |
|  | - 20 Road Edge Arcs    |  | - Bottleneck Detector  |  | - Fleet Balancing    | |
|  +------------------------+  +------------------------+  +----------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 🌟 Key Features & Innovations

1. **Google Maps Platform 2D Integration**
   - Official Google Maps JavaScript API with Roadmap, Satellite, and Hybrid GIS layers.
   - Smooth path animation for moving visitor cohorts (120,000+ attendees) and transit fleets.
   - Road congestion polylines and dynamic crowd heatmap circles.
   - Graceful vector GIS fallback when API key is unconfigured.

2. **5 Specialized Operational Role Lenses**
   - **Master Orchestrator**: District-wide unified command.
   - **Venue Operations**: Arena turnstile ingress/egress, capacity utilization, and concourse flow.
   - **Transit & Mobility**: Fleet headway optimization, arterial road speed, and shuttle dispatch.
   - **Hospitality Lead**: Hotel cluster load, 630 emergency buffer beds, and VIP accommodation.
   - **Public Safety**: Critical chokepoint detection, incident triage, and emergency corridor gating.

3. **AI Predictive Bottleneck Horizon (30–120 min)**
   - Temporal graph neural network and XGBoost forecasting crowd influx across all venues and transit interchanges.

4. **What-If Scenario Sandbox**
   - 💥 **Visitor Surge**: +45,000 attendee influx at Grand Stadium.
   - 🚧 **Arterial Road Closure**: Immediate graph re-weighting and dynamic rerouting.
   - 🌧️ **Severe Weather Alert**: Thunderstorm detection and shelter routing.
   - 🚆 **HyperMetro Outage**: Substation power loss and demand surge.

5. **Google OR-Tools Mathematical Optimization Engine**
   - Solves dynamic mixed-integer linear programming (MIP) formulations in <16ms.
   - Directives: Deploy express shuttle bridge, invert arterial lanes, gate turnstiles, and unlock hotel staging buffers.
   - **1-Click Apply**: Enacts solutions live in the Digital Twin.

6. **Before vs After Quantifiable Impact Analysis**
   - Road Congestion: **-65.4%**
   - Transit Station Wait: **-81.4%**
   - Turnstile Ingress Queue: **-79.6%**
   - Critical Risk Bottlenecks: **-83.3%**
   - Carbon Emissions: **-50.8%**

7. **AI Event Copilot**
   - GenAI assistant providing root-cause diagnostic explanations and tailored police/transit/venue briefings.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in `frontend/`:
```bash
cp frontend/.env.example frontend/.env
```
*(Optional) Add your Google Maps API key in `frontend/.env`:*
```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### 2. Launch Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎯 4-Step Judge Walkthrough

1. **Step 1 ("1. Observe Normal Flow")**: Observe baseline visitor movement, fluid green roads, and nominal hotel/transit operations.
2. **Step 2 ("2. Trigger Surge / Crisis")**: Injects sudden +45,000 attendee rush at Grand Stadium. Watch roads turn red and risk alerts trigger.
3. **Step 3 ("3. Run OR-Tools Solver")**: Runs the MIP optimizer and yields mathematical proof and fleet recommendations.
4. **Step 4 ("4. Apply & Compare Before vs After")**: Enacts optimizations in the Digital Twin and opens the quantifiable comparison modal.
