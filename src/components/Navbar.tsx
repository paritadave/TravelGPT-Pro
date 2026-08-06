import React from 'react';
import { Trip, Persona } from '../types';
import { Compass, Plus, Sparkles, User, Globe, ChevronDown, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTrip: Trip | null;
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onOpenNewTripModal: () => void;
  selectedPersona: Persona;
  onChangePersona: (persona: Persona) => void;
  personas: Persona[];
  currency: string;
  onChangeCurrency: (curr: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTrip,
  trips,
  onSelectTrip,
  onOpenNewTripModal,
  selectedPersona,
  onChangePersona,
  personas,
  currency,
  onChangeCurrency,
  activeTab,
  onTabChange,
}) => {
  const [showTripDropdown, setShowTripDropdown] = React.useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md bg-opacity-95 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Compass className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                TravelGPT Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI-Native Multi-Agent Copilot</p>
          </div>
        </div>

        {/* Active Trip Quick Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowTripDropdown(!showTripDropdown)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs px-3.5 py-2 rounded-lg transition text-slate-200 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="max-w-[160px] truncate">
              {activeTrip ? activeTrip.title : 'Select Active Trip'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showTripDropdown && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                My Saved Trips
              </div>
              {trips.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTrip(t);
                    setShowTripDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition ${
                    activeTrip?.id === t.id ? 'bg-cyan-950/40 text-cyan-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{t.title}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{t.status}</span>
                </button>
              ))}
              <div className="p-1.5 border-t border-slate-700/60">
                <button
                  onClick={() => {
                    onOpenNewTripModal();
                    setShowTripDropdown(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1.5 rounded-md font-medium transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Plan New Trip
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Tools: Persona, Currency, New Trip Button */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher Badge */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-200 transition"
              title="Active Traveler Persona"
            >
              <img
                src={selectedPersona.avatar}
                alt={selectedPersona.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-400"
              />
              <span className="font-medium text-cyan-300">{selectedPersona.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showPersonaDropdown && (
              <div className="absolute top-full mt-2 right-0 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-700/60">
                  Select Traveler Persona
                </div>
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onChangePersona(p);
                      setShowPersonaDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 flex items-start gap-3 hover:bg-slate-700/60 transition ${
                      selectedPersona.id === p.id ? 'bg-slate-700/80 text-white' : 'text-slate-300'
                    }`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">{p.budgetLevel}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300">
            {['USD', 'EUR', 'JPY'].map((curr) => (
              <button
                key={curr}
                onClick={() => onChangeCurrency(curr)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                  currency === curr ? 'bg-cyan-600 text-white shadow-sm' : 'hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Plan New Trip CTA Button */}
          <button
            onClick={onOpenNewTripModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New AI Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
