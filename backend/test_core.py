import sys
import os

# Ensure backend directory in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.simulation.simulator import simulator
from app.ai.predictor import predictor
from app.ai.optimizer import optimizer
from app.ai.copilot import copilot
from app.models.schemas import ScenarioTriggerRequest, CopilotQuery

def test_simulator_and_geo():
    print("Testing Simulator & Geo District...")
    state = simulator.get_telemetry_state()
    assert len(state.venues) == 4, "Should have 4 venues"
    assert len(state.transit_nodes) == 5, "Should have 5 transit nodes"
    assert len(state.roads) == 20, "Should have 20 roads"
    assert len(state.agents) >= 50, "Should have active agents"
    
    # Test step
    simulator.step()
    state_after = simulator.get_telemetry_state()
    assert state_after.tick_count == 1, "Tick should increment"
    print("[PASSED] Simulator step passed.")

def test_ai_predictor():
    print("Testing AI Predictor...")
    state = simulator.get_telemetry_state()
    preds = predictor.forecast(state)
    assert len(preds.horizons) == 4, "Should have 4 horizons (30, 60, 90, 120 mins)"
    assert preds.horizons[0].predicted_visitors > 0
    print(f"[PASSED] AI Predictor passed. Generated {len(preds.horizons)} horizons. Algorithm: {preds.algorithm}")

def test_ortools_optimizer():
    print("Testing Google OR-Tools Optimizer...")
    # Trigger scenario first
    simulator.trigger_scenario(ScenarioTriggerRequest(scenario_type="VISITOR_SURGE"))
    state = simulator.get_telemetry_state()
    
    res = optimizer.solve_multi_objective(state)
    assert res.solver_status == "OPTIMAL_SOLUTION_CONVERGED"
    assert len(res.recommendations) >= 3
    print(f"[PASSED] OR-Tools Optimizer passed in {res.solve_time_ms}ms with {len(res.recommendations)} actionable recommendations.")

def test_copilot():
    print("Testing AI Event Copilot...")
    state = simulator.get_telemetry_state()
    ans = copilot.answer_query(CopilotQuery(query="Why is there a bottleneck at Grand Stadium?"), state)
    assert len(ans.answer) > 50
    assert len(ans.suggested_actions) > 0
    print("[PASSED] AI Copilot passed.")

if __name__ == "__main__":
    print("--- Running EventFlow AI Core Verification ---")
    test_simulator_and_geo()
    test_ai_predictor()
    test_ortools_optimizer()
    test_copilot()
    print("[SUCCESS] ALL CORE TESTS PASSED SUCCESSFULLY!")

