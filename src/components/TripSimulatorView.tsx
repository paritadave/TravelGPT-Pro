import React, { useState } from 'react';
import { Trip } from '../types';
import { Zap, AlertCircle, CheckCircle2, ArrowRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface TripSimulatorViewProps {
  activeTrip: Trip | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const TripSimulatorView: React.FC<TripSimulatorViewProps> = ({ activeTrip, onUpdateTrip }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('Heavy Rain & Thunderstorm on Day 2');
  const [loading, setLoading] = useState(false);
  const [replanResult, setReplanResult] = useState<any>(null);

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

  const scenarioPresets = [
    { title: '🌧️ Heavy Rain & Thunderstorm on Day 2', scenario: 'Torrential rain on Day 2. Swap outdoor walking tours for indoor museum, digital art gallery, and covered arcade dining.' },
    { title: '✈️ Flight Delayed 4 Hours', scenario: 'Flight delayed by 4 hours. Push back check-in time and reschedule first evening dinner reservation.' },
    { title: '💸 Unexpected $200 Budget Constraint', scenario: 'Need to trim $200 from overall trip. Replace 2 high-cost activities with top-rated free gardens and street food markets.' },
    { title: '👟 Sore Feet / Need Low-Pace Afternoon', scenario: 'Traveler fatigued after 20k steps. Replace afternoon walking tour with relaxing traditional tea ceremony and scenic river cruise.' },
  ];

  const handleSimulateDisruption = async (customScenario?: string) => {
    const scenarioToUse = customScenario || selectedScenario;
    setLoading(true);
    setReplanResult(null);

    try {
      const res = await fetch('/api/ai/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenarioToUse,
          currentItinerary: activeTrip.days[0],
          tripDetails: { destination: activeTrip.destination },
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setReplanResult(data.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTrip = () => {
    if (!replanResult || !replanResult.revisedActivities) return;

    const revisedActs = replanResult.revisedActivities.map((ra: any, idx: number) => ({
      id: 'sim-' + idx,
      title: ra.title,
      time: ra.time,
      location: ra.location || activeTrip.destination,
      category: ra.category || 'relaxation',
      cost: ra.cost || 15,
      notes: ra.notes || 'Replanned by AI Trip Simulator',
    }));

    const updatedDays = activeTrip.days.map((d, i) => {
      if (i === 0) {
        return {
          ...d,
          activities: revisedActs,
          dailyBudgetSpent: revisedActs.reduce((acc: number, c: any) => acc + c.cost, 0),
        };
      }
      return d;
    });

    onUpdateTrip({ ...activeTrip, days: updatedDays });
    alert('Replanned itinerary applied to Day 1!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Zap className="h-4 w-4" /> Live Replanning Engine & Trip Simulator
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">"What-If" Scenario Generator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Test real-world travel disruptions and see TravelGPT Pro recalculate your trip in real-time.
          </p>
        </div>
      </div>

      {/* Preset Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarioPresets.map((sp, idx) => (
          <div
            key={idx}
            onClick={() => {
              setSelectedScenario(sp.scenario);
              handleSimulateDisruption(sp.scenario);
            }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition cursor-pointer group space-y-2"
          >
            <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition flex items-center justify-between">
              <span>{sp.title}</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-xs text-slate-400">{sp.scenario}</p>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">LangGraph Multi-Agent Engine Recalculating...</div>
          <p className="text-xs text-slate-400">Rebalancing transit times, activity costs, and weather dependencies.</p>
        </div>
      )}

      {/* Simulation Result Output Card */}
      {replanResult && !loading && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/50 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Simulation Output</span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">Disruption Recalculation Complete</h2>
            </div>

            <button
              onClick={handleApplyToTrip}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <CheckCircle2 className="h-4 w-4" /> Apply Revised Plan
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50 text-xs text-purple-200">
              <strong>Impact Analysis:</strong> {replanResult.impactAnalysis}
            </div>

            {replanResult.agentNotes && (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <strong>Coordinator Agent Note:</strong> {replanResult.agentNotes}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revised Activities Schedule</h4>
              {replanResult.revisedActivities?.map((act: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-400 font-mono mr-2">{act.time}</span>
                    <span className="font-bold text-white">{act.title}</span>
                    {act.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{act.notes}</p>}
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">${act.cost || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
