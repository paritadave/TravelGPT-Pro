import React, { useState } from 'react';
import { Trip, Activity } from '../types';
import { MapPin, Compass, ShieldCheck, Navigation, Layers, ExternalLink } from 'lucide-react';

interface MapViewProps {
  activeTrip: Trip | null;
}

export const MapView: React.FC<MapViewProps> = ({ activeTrip }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

  const currentDay = activeTrip.days.find((d) => d.dayNumber === selectedDay) || activeTrip.days[0];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Compass className="h-4 w-4" /> Navigation Agent & Map Explorer
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Route & Spot Visualizer</h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTrip.destination} • Interactive route overlay for Day {selectedDay}
          </p>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {activeTrip.days.map((d) => (
            <button
              key={d.dayNumber}
              onClick={() => setSelectedDay(d.dayNumber)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedDay === d.dayNumber
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Stage (Canvas Mockup with Nodes) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[420px] relative flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-200 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-cyan-400" /> Layer: Safety & Activity Route
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Neighborhood Safety: 9.8 / 10
            </div>
          </div>

          {/* Map Node Route Visualization */}
          <div className="relative z-10 my-8 py-6 px-4 flex flex-col sm:flex-row items-center justify-around gap-6">
            {currentDay?.activities.map((act, idx) => (
              <div
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className={`relative group cursor-pointer transition transform hover:-translate-y-1 ${
                  selectedActivity?.id === act.id ? 'scale-110' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/30 border border-white/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="mt-2 text-center max-w-[120px]">
                  <div className="text-xs font-bold text-white truncate">{act.title}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{act.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
            <span>GPS Coordinates mapped via Google Maps Platform</span>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(activeTrip.destination)}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Open in Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Spot Details Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="h-4 w-4 text-cyan-400" /> Spot Details
          </h3>

          {selectedActivity ? (
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-xs text-cyan-400 font-mono">{selectedActivity.time}</div>
              <h4 className="font-bold text-white text-sm">{selectedActivity.title}</h4>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedActivity.location}
              </p>
              {selectedActivity.notes && <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-700">{selectedActivity.notes}</p>}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Click on any pin on the map stage to view spot details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
