import React, { useState } from 'react';
import { FlightOption, Trip } from '../types';
import { Plane, Sparkles, Filter, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

interface FlightIntelligenceViewProps {
  flights: FlightOption[];
  activeTrip: Trip | null;
  onSelectFlight?: (flight: FlightOption) => void;
}

export const FlightIntelligenceView: React.FC<FlightIntelligenceViewProps> = ({
  flights,
  activeTrip,
  onSelectFlight,
}) => {
  const [filterStops, setFilterStops] = useState<number | 'all'>('all');
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const filtered = flights.filter((f) => {
    if (filterStops === 'all') return true;
    return f.stops === filterStops;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Plane className="h-4 w-4" /> Flight Intelligence Agent
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Live Flight Radar & Comparison</h1>
          <p className="text-xs text-slate-400 mt-1">
            Route: {activeTrip?.startingCity || 'SFO'} ✈️ {activeTrip?.destination || 'HND / NRT'} • Real-time price trends & AI score
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 p-1 rounded-xl text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => setFilterStops('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStops === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Flights
          </button>
          <button
            onClick={() => setFilterStops(0)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStops === 0 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Non-stop Only
          </button>
        </div>
      </div>

      {/* Flight Options Cards List */}
      <div className="space-y-4">
        {filtered.map((flight) => {
          const isSelected = selectedFlightId === flight.id;
          return (
            <div
              key={flight.id}
              className={`p-6 rounded-2xl bg-slate-900 border transition ${
                isSelected ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Airline & Tag Badges */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{flight.logo}</span>
                    <div>
                      <h3 className="font-bold text-white text-base">{flight.airline}</h3>
                      <p className="text-xs text-slate-400">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> AI Score: {flight.aiScore} / 10
                    </span>
                    {flight.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Times & Route Diagram */}
                <div className="flex items-center justify-between lg:justify-center gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{flight.departureTime}</div>
                    <div className="text-xs text-slate-400 font-mono">{flight.departureAirport}</div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <span className="text-[11px] text-slate-400 font-mono">{flight.duration}</span>
                    <div className="w-28 h-0.5 bg-slate-700 relative my-1">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-1">
                        <Plane className="h-3.5 w-3.5 text-cyan-400 rotate-90" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</span>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-white">{flight.arrivalTime}</div>
                    <div className="text-xs text-slate-400 font-mono">{flight.arrivalAirport}</div>
                  </div>
                </div>

                {/* Price & Selection */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ${flight.price} <span className="text-xs font-normal text-slate-400">{flight.currency}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{flight.co2Emissions}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFlightId(flight.id);
                        if (onSelectFlight) onSelectFlight(flight);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Selected
                        </>
                      ) : (
                        'Select Flight'
                      )}
                    </button>

                    <a
                      href={flight.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Book on external partner"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
