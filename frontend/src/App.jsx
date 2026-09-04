import React, { useState, useEffect, useCallback } from 'react';
import Topbar from './components/Dashboard/Topbar';
import KpiCards from './components/Dashboard/KpiCards';
import RoleOperationalBanner from './components/Dashboard/RoleOperationalBanner';
import DigitalTwinMap from './components/Map/DigitalTwinMap';
import ScenarioSandbox from './components/Dashboard/ScenarioSandbox';
import PredictionPanel from './components/Dashboard/PredictionPanel';
import OptimizationPanel from './components/Dashboard/OptimizationPanel';
import AICopilotChat from './components/Dashboard/AICopilotChat';
import LiveAlertFeed from './components/Dashboard/LiveAlertFeed';
import BeforeAfterModal from './components/Dashboard/BeforeAfterModal';
import HospitalityTransportModal from './components/Dashboard/HospitalityTransportModal';
import { Sparkles, HelpCircle, ChevronRight, CheckCircle, ArrowRight, Play, Zap, GitCompare } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [activeRole, setActiveRole] = useState('MASTER_ORCHESTRATOR');
  const [predictions, setPredictions] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [copilotResponse, setCopilotResponse] = useState(null);
  const [beforeAfterData, setBeforeAfterData] = useState(null);
  
  // Modals
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);
  const [isInfraModalOpen, setIsInfraModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // 1. Initial State Fetch and WebSocket Connection
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/state`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.warn("Polling fallback:", e);
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/prediction/forecast`);
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      }
    } catch (e) {
      console.error("Failed to fetch predictions:", e);
    }
  }, []);

  useEffect(() => {
    fetchState();
    fetchPredictions();

    // Setup WebSocket
    let ws;
    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/telemetry');
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          setTelemetry(data);
        } catch (err) {}
      };
      ws.onerror = () => {
        console.log("WebSocket fallback to polling");
      };
    } catch (e) {}

    // Polling fallback
    const interval = setInterval(fetchState, 1500);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [fetchState, fetchPredictions]);

  // 2. Control Handlers
  const handleToggleSim = async () => {
    const isRunning = telemetry?.is_running ?? true;
    const endpoint = isRunning ? '/api/simulation/pause' : '/api/simulation/start';
    await fetch(`${API_BASE}${endpoint}`, { method: 'POST' });
    fetchState();
  };

  const handleSetSpeed = async (speed) => {
    await fetch(`${API_BASE}/api/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier: speed })
    });
    fetchState();
  };

  const handleResetSim = async () => {
    await fetch(`${API_BASE}/api/simulation/reset`, { method: 'POST' });
    setOptimizationData(null);
    setDemoStep(1);
    fetchState();
    fetchPredictions();
  };

  const handleTriggerScenario = async (scenarioReq) => {
    const res = await fetch(`${API_BASE}/api/scenarios/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioReq)
    });
    setDemoStep(2);
    fetchState();
    fetchPredictions();
    return res.json();
  };

  const handleRunOptimization = async () => {
    const res = await fetch(`${API_BASE}/api/optimization/run`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setOptimizationData(data);
      setDemoStep(3);
    }
  };

  const handleApplyOptimization = async (interventions) => {
    const res = await fetch(`${API_BASE}/api/optimization/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interventions: interventions || [
        "DEPLOY_SHUTTLE_BRIDGE",
        "REDISTRIBUTE_PEDESTRIANS",
        "DYNAMIC_LANE_REVERSAL",
        "ACTIVATE_HOTEL_BUFFER"
      ]})
    });
    if (res.ok) {
      setDemoStep(4);
      fetchState();
      fetchPredictions();
      // Fetch Before-After Data
      const baRes = await fetch(`${API_BASE}/api/kpis/before-after`);
      if (baRes.ok) {
        const baData = await baRes.json();
        setBeforeAfterData(baData);
      }
    }
  };

  const handleCopilotQuery = async (queryText) => {
    const res = await fetch(`${API_BASE}/api/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText, role: activeRole })
    });
    if (res.ok) {
      const data = await res.json();
      setCopilotResponse(data);
      return data;
    }
  };

  const handleOpenBeforeAfter = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kpis/before-after`);
      if (res.ok) {
        const data = await res.json();
        setBeforeAfterData(data);
      }
    } catch (e) {}
    setIsBeforeAfterOpen(true);
  };

  // Demo step direct action click handler
  const handleDemoStepClick = async (step) => {
    setDemoStep(step);
    if (step === 1) {
      handleResetSim();
    } else if (step === 2) {
      handleTriggerScenario({ scenario_type: 'VISITOR_SURGE', magnitude_pct: 50, target_id: 'venue-1' });
    } else if (step === 3) {
      handleRunOptimization();
    } else if (step === 4) {
      await handleApplyOptimization();
      handleOpenBeforeAfter();
    }
  };

  const isOptimized = (telemetry?.applied_optimizations?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white w-full overflow-x-hidden">
      {/* Topbar Navigation Header */}
      <Topbar
        telemetry={telemetry}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onToggleSim={handleToggleSim}
        onSetSpeed={handleSetSpeed}
        onResetSim={handleResetSim}
        onOpenBeforeAfter={handleOpenBeforeAfter}
        onOpenInfraModal={() => setIsInfraModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 p-2.5 sm:p-4 md:p-5 lg:p-6 space-y-4 max-w-[1920px] mx-auto w-full min-w-0 box-border">
        {/* KPI Cards Row */}
        <KpiCards kpis={telemetry?.kpis} activeRole={activeRole} />

        {/* Responsive Demo Walkthrough Flow Bar (100% visible at 100% zoom across 1366x768, 1440x900, 1920x1080) */}
        <div className="glass-panel p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-r from-sky-50 via-white to-purple-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs min-w-0">
          <div className="flex items-center gap-2 shrink-0 px-1">
            <span className="px-2 py-0.5 rounded-md bg-cyan-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
              DEMO FLOW
            </span>
            <span className="text-slate-700 font-bold hidden sm:inline text-xs">Walkthrough Steps:</span>
          </div>

          {/* 4 Interactive Responsive Step Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 flex-1 min-w-0">
            {/* Step 1 */}
            <button
              onClick={() => handleDemoStepClick(1)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 ${
                demoStep === 1 
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 shadow-xs scale-[1.01]' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cyan-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">1</span>
              <span className="truncate">Observe Normal Flow</span>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => handleDemoStepClick(2)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 ${
                demoStep === 2 
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs scale-[1.01]' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">2</span>
              <span className="truncate">Trigger Surge / Crisis</span>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => handleDemoStepClick(3)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 ${
                demoStep === 3 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs scale-[1.01]' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">3</span>
              <span className="truncate">Run OR-Tools Solver</span>
            </button>

            {/* Step 4: Prominently Visible & Clickable */}
            <button
              onClick={() => handleDemoStepClick(4)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black transition-all min-w-0 ${
                demoStep === 4 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-xs scale-[1.01]' 
                  : 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
              }`}
              title="Apply Recommendations & Open Before vs After Comparison"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">4</span>
              <span className="truncate">Apply & Compare Before vs After</span>
            </button>
          </div>
        </div>

        {/* Active Role Operational Lens Banner */}
        <RoleOperationalBanner
          activeRole={activeRole}
          telemetry={telemetry}
          onOpenInfraModal={() => setIsInfraModalOpen(true)}
        />

        {/* 2-Column Master Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0">
          {/* Left / Center Column (7 Cols): Digital Twin Map + Sandbox + Optimization */}
          <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
            {/* Main Interactive Map (Google Maps 2D) */}
            <div className="h-[520px] w-full min-w-0">
              <DigitalTwinMap
                telemetry={telemetry}
                activeRole={activeRole}
              />
            </div>

            {/* Scenario Sandbox & What-If Controls */}
            <ScenarioSandbox
              activeScenario={telemetry?.active_scenario}
              onTriggerScenario={handleTriggerScenario}
              onResetSim={handleResetSim}
            />

            {/* Google OR-Tools Optimization Panel */}
            <OptimizationPanel
              optimizationData={optimizationData}
              onRunOptimization={handleRunOptimization}
              onApplyOptimization={handleApplyOptimization}
              isOptimized={isOptimized}
            />
          </div>

          {/* Right Column (5 Cols): AI Prediction Horizon + Copilot Chat + Live Alert Feed */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-w-0">
            {/* AI Predictive Horizon */}
            <PredictionPanel
              predictions={predictions}
              onRefreshPredictions={fetchPredictions}
              isOptimized={isOptimized}
            />

            {/* AI Event Copilot Chat */}
            <AICopilotChat
              copilotResponse={copilotResponse}
              onSendQuery={handleCopilotQuery}
              activeRole={activeRole}
              telemetry={telemetry}
            />

            {/* Live Alerts Stream */}
            <LiveAlertFeed
              alerts={telemetry?.alerts}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <BeforeAfterModal
        isOpen={isBeforeAfterOpen}
        onClose={() => setIsBeforeAfterOpen(false)}
        comparisonData={beforeAfterData}
        isOptimized={isOptimized}
      />

      <HospitalityTransportModal
        isOpen={isInfraModalOpen}
        onClose={() => setIsInfraModalOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
