import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { clientSim } from './simulation/clientSimulator';
import { 
  getClientPredictions, 
  getClientOptimization, 
  getClientBeforeAfter, 
  getClientCopilotResponse 
} from './simulation/clientAI';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function App() {
  // Always initialize with instant, fully populated digital twin telemetry
  const [telemetry, setTelemetry] = useState(() => clientSim.getTelemetryState());
  const [activeRole, setActiveRole] = useState('MASTER_ORCHESTRATOR');
  const [predictions, setPredictions] = useState(() => getClientPredictions(clientSim.getTelemetryState()));
  const [optimizationData, setOptimizationData] = useState(null);
  const [copilotResponse, setCopilotResponse] = useState(null);
  const [beforeAfterData, setBeforeAfterData] = useState(() => getClientBeforeAfter(false));
  
  // Modals
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);
  const [isInfraModalOpen, setIsInfraModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // 1. Live Simulation Ticking Loop (Local client-side digital twin)
  useEffect(() => {
    const isRunning = telemetry?.is_running ?? true;
    const speed = telemetry?.speed_multiplier ?? 1.0;
    
    if (!isRunning) return;

    // Interval inversely proportional to speed (default 1000ms at 1x, 500ms at 2x, 200ms at 5x)
    const intervalMs = Math.max(150, Math.floor(1000 / speed));

    const timer = setInterval(() => {
      const nextState = clientSim.step();
      setTelemetry(nextState);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [telemetry?.is_running, telemetry?.speed_multiplier]);

  // 2. Initial State Fetch and WebSocket Connection (with live server sync if available)
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/state`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      // Graceful fallback to client simulator
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/prediction/forecast`);
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
        return;
      }
    } catch (e) {}
    // Client AI fallback
    setPredictions(getClientPredictions(clientSim.getTelemetryState()));
  }, []);

  useEffect(() => {
    fetchState();
    fetchPredictions();

    // Setup WebSocket if available
    let ws;
    try {
      let wsUrl = import.meta.env.VITE_WS_URL;
      if (!wsUrl) {
        if (API_BASE.startsWith('https://')) {
          wsUrl = API_BASE.replace('https://', 'wss://') + '/ws/telemetry';
        } else if (API_BASE.startsWith('http://')) {
          wsUrl = API_BASE.replace('http://', 'ws://') + '/ws/telemetry';
        } else {
          wsUrl = 'ws://127.0.0.1:8000/ws/telemetry';
        }
      }
      ws = new WebSocket(wsUrl);
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          setTelemetry(data);
        } catch (err) {}
      };
      ws.onerror = () => {
        // Fallback to local simulator
      };
    } catch (e) {}

    // Polling fallback to server if online
    const interval = setInterval(fetchState, 3000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [fetchState, fetchPredictions]);

  // 3. Instant Simulation Control Handlers
  const handleToggleSim = async () => {
    const currentRunning = telemetry?.is_running ?? true;
    const nextRunning = !currentRunning;
    const updated = clientSim.setRunning(nextRunning);
    setTelemetry(updated);

    // Sync with backend if reachable
    try {
      const endpoint = nextRunning ? '/api/simulation/start' : '/api/simulation/pause';
      await fetch(`${API_BASE}${endpoint}`, { method: 'POST' });
    } catch (e) {}
  };

  const handleSetSpeed = async (speed) => {
    const updated = clientSim.setSpeed(speed);
    setTelemetry(updated);

    // Sync with backend if reachable
    try {
      await fetch(`${API_BASE}/api/simulation/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiplier: speed })
      });
    } catch (e) {}
  };

  const handleResetSim = async () => {
    const updated = clientSim.reset();
    setTelemetry(updated);
    setOptimizationData(null);
    setDemoStep(1);
    setPredictions(getClientPredictions(updated));
    setBeforeAfterData(getClientBeforeAfter(false));

    // Sync with backend if reachable
    try {
      await fetch(`${API_BASE}/api/simulation/reset`, { method: 'POST' });
      fetchState();
      fetchPredictions();
    } catch (e) {}
  };

  const handleTriggerScenario = async (scenarioReq) => {
    const updated = clientSim.triggerScenario(scenarioReq.scenario_type);
    setTelemetry(updated);
    setDemoStep(2);
    setPredictions(getClientPredictions(updated));

    // Sync with backend if reachable
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioReq)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    return { status: "TRIGGERED", scenario: scenarioReq.scenario_type };
  };

  const handleRunOptimization = async () => {
    // Generate Pareto Optimal solution instantly
    const optResult = getClientOptimization(telemetry);
    setOptimizationData(optResult);
    setDemoStep(3);

    // Sync with backend if reachable
    try {
      const res = await fetch(`${API_BASE}/api/optimization/run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOptimizationData(data);
      }
    } catch (e) {}
  };

  const handleApplyOptimization = async (interventions) => {
    const updated = clientSim.applyOptimizations(interventions);
    setTelemetry(updated);
    setDemoStep(4);
    setPredictions(getClientPredictions(updated));
    const ba = getClientBeforeAfter(true);
    setBeforeAfterData(ba);

    // Sync with backend if reachable
    try {
      await fetch(`${API_BASE}/api/optimization/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interventions: interventions || [
          "DEPLOY_SHUTTLE_BRIDGE",
          "REDISTRIBUTE_PEDESTRIANS",
          "DYNAMIC_LANE_REVERSAL",
          "ACTIVATE_HOTEL_BUFFER"
        ]})
      });
    } catch (e) {}
  };

  const handleCopilotQuery = async (queryText) => {
    try {
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
    } catch (e) {}

    const clientRes = getClientCopilotResponse(queryText, activeRole, telemetry);
    setCopilotResponse(clientRes);
    return clientRes;
  };

  const handleOpenBeforeAfter = async () => {
    const isOpt = (telemetry?.applied_optimizations?.length || 0) > 0;
    setBeforeAfterData(getClientBeforeAfter(isOpt));

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

        {/* Responsive Demo Walkthrough Flow Bar */}
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
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 cursor-pointer ${
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
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 cursor-pointer ${
                demoStep === 2 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs scale-[1.01]' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">2</span>
              <span className="truncate">Trigger Surge / Stress</span>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => handleDemoStepClick(3)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 cursor-pointer ${
                demoStep === 3 
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-xs scale-[1.01]' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">3</span>
              <span className="truncate">Run OR-Tools Solver</span>
            </button>

            {/* Step 4 */}
            <button
              onClick={() => handleDemoStepClick(4)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-w-0 cursor-pointer ${
                demoStep === 4 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs scale-[1.01]' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono shrink-0">4</span>
              <span className="truncate">Apply & Verify Impact</span>
            </button>
          </div>
        </div>

        {/* Role-Specific Operational Directive Banner */}
        <RoleOperationalBanner 
          activeRole={activeRole} 
          telemetry={telemetry} 
          onOpenInfraModal={() => setIsInfraModalOpen(true)}
        />

        {/* Core Digital Twin Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full min-w-0">
          
          {/* Main Map & Live Visual Digital Twin (7 cols on lg, 8 cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-w-0 w-full">
            {/* Map Container */}
            <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading tracking-tight">
                    District Geographic Digital Twin
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {telemetry?.agents?.length || 56} Tracked Fleet & Cohorts
                  </span>
                </div>
              </div>

              {/* Digital Twin Map View */}
              <DigitalTwinMap 
                telemetry={telemetry} 
                activeRole={activeRole} 
              />
            </div>

            {/* Predictive Intelligence Panel */}
            <PredictionPanel 
              predictions={predictions} 
              activeRole={activeRole} 
            />

            {/* Scenario Sandbox */}
            <ScenarioSandbox 
              onTriggerScenario={handleTriggerScenario}
              activeScenario={telemetry?.active_scenario}
            />
          </div>

          {/* Right AI Copilot & Optimization Column (5 cols on lg, 4 cols on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-w-0 w-full">
            
            {/* Multi-Objective Optimization Engine */}
            <OptimizationPanel 
              optimizationData={optimizationData}
              onRunOptimization={handleRunOptimization}
              onApplyOptimization={handleApplyOptimization}
              isOptimized={isOptimized}
              onOpenBeforeAfter={handleOpenBeforeAfter}
            />

            {/* AI Copilot Interactive Chat */}
            <AICopilotChat 
              activeRole={activeRole}
              onSendQuery={handleCopilotQuery}
              copilotResponse={copilotResponse}
              telemetry={telemetry}
            />

            {/* Live Operational Alerts Feed */}
            <LiveAlertFeed 
              alerts={telemetry?.alerts} 
            />

          </div>

        </div>
      </main>

      {/* Before vs After Impact Analysis Modal */}
      <BeforeAfterModal 
        isOpen={isBeforeAfterOpen}
        onClose={() => setIsBeforeAfterOpen(false)}
        comparisonData={beforeAfterData}
      />

      {/* Hospitality & Transport Multi-Modal Matrix Modal */}
      <HospitalityTransportModal 
        isOpen={isInfraModalOpen}
        onClose={() => setIsInfraModalOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
