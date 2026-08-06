import React, { useState } from 'react';
import { Trip, Persona } from '../types';
import {
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  Zap,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  Plus,
  Plane,
  Building2,
  DollarSign,
  ArrowRightLeft,
  RefreshCw,
  Coins,
} from 'lucide-react';

interface DashboardViewProps {
  activeTrip: Trip | null;
  trips: Trip[];
  selectedPersona: Persona;
  onSelectTrip: (trip: Trip) => void;
  onOpenNewTripModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeTrip,
  trips,
  selectedPersona,
  onSelectTrip,
  onOpenNewTripModal,
  onNavigateTab,
}) => {
  // Currency Converter State
  const [sourceCurrency, setSourceCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('JPY');
  const [amount, setAmount] = useState<string>('100');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Exchange rates relative to USD
  const ratesToUSD: Record<string, { rate: number; symbol: string; name: string }> = {
    USD: { rate: 1.0, symbol: '$', name: 'US Dollar' },
    EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.78, symbol: '£', name: 'British Pound' },
    JPY: { rate: 154.5, symbol: '¥', name: 'Japanese Yen' },
    AUD: { rate: 1.52, symbol: 'A$', name: 'Australian Dollar' },
    CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
    SGD: { rate: 1.34, symbol: 'S$', name: 'Singapore Dollar' },
    THB: { rate: 36.2, symbol: '฿', name: 'Thai Baht' },
    INR: { rate: 83.5, symbol: '₹', name: 'Indian Rupee' },
  };

  const convertValue = (valStr: string, src: string, tgt: string) => {
    const num = parseFloat(valStr) || 0;
    const srcRate = ratesToUSD[src]?.rate || 1;
    const tgtRate = ratesToUSD[tgt]?.rate || 1;
    // convert from src to USD, then from USD to tgt
    const usdVal = num / srcRate;
    const finalVal = usdVal * tgtRate;
    return finalVal;
  };

  const convertedResult = convertValue(amount, sourceCurrency, targetCurrency);
  const currentTgtInfo = ratesToUSD[targetCurrency] || ratesToUSD.JPY;
  const currentSrcInfo = ratesToUSD[sourceCurrency] || ratesToUSD.USD;

  const handleSwapCurrencies = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const quickPrompts = [
    { title: 'Tokyo Tech & Foodie Tour', budget: '$1,800', days: '5 Days', prompt: 'Plan a 5-day foodie and electronics trip in Tokyo under $1,800 USD.' },
    { title: 'Romantic Amalfi Coast', budget: '€3,500', days: '7 Days', prompt: 'Plan a 7-day luxury romantic coastal getaway in Amalfi and Capri.' },
    { title: 'Swiss Alps Hiking & Train', budget: '$2,200', days: '4 Days', prompt: 'Create an eco-hiking 4-day Swiss Alps itinerary with panoramic train rides.' },
    { title: 'Digital Nomad Bali Hub', budget: '$1,200', days: '14 Days', prompt: 'Find the best 14-day laptop-friendly stay in Canggu and Ubud with fast WiFi.' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner & Persona Info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 border border-slate-800 p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TravelGPT Pro Copilot Active</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white">
              Where to next, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{selectedPersona.name}?</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your multi-agent AI copilot is calibrated to <strong className="text-white">{selectedPersona.tag}</strong> preferences ({selectedPersona.budgetLevel} budget, {selectedPersona.pace} pace).
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {selectedPersona.priorities.map((p, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                  ✓ {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
            <button
              onClick={onOpenNewTripModal}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Create New AI Trip</span>
            </button>
            <button
              onClick={() => onNavigateTab('copilot')}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm px-5 py-3 rounded-xl font-medium transition"
            >
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Chat Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Main Page Dashboard Currency Converter Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Live Global Travel Currency Converter
              </h2>
              <p className="text-xs text-slate-400">Instant exchange rates & multi-currency budget calculator</p>
            </div>
          </div>

          <button
            onClick={handleRefreshRates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
            title="Refresh exchange rates"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh Rates</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Converter Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
              {/* From Input */}
              <div className="sm:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label className="font-semibold">From Amount</label>
                  <select
                    value={sourceCurrency}
                    onChange={(e) => setSourceCurrency(e.target.value)}
                    className="bg-slate-900 text-emerald-400 font-bold rounded px-1.5 py-0.5 outline-none border border-slate-700 text-xs cursor-pointer"
                  >
                    {Object.entries(ratesToUSD).map(([code, info]) => (
                      <option key={code} value={code}>
                        {code} ({info.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400 font-mono">{currentSrcInfo.symbol}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-transparent text-white text-xl font-bold font-mono outline-none"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-1 flex items-center justify-center">
                <button
                  onClick={handleSwapCurrencies}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 transition"
                  title="Swap Currencies"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              {/* To Output */}
              <div className="sm:col-span-5 bg-slate-800/80 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label className="font-semibold">Converted Value</label>
                  <select
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                    className="bg-slate-900 text-emerald-400 font-bold rounded px-1.5 py-0.5 outline-none border border-slate-700 text-xs cursor-pointer"
                  >
                    {Object.entries(ratesToUSD).map(([code, info]) => (
                      <option key={code} value={code}>
                        {code} ({info.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-400 font-mono">{currentTgtInfo.symbol}</span>
                  <div className="w-full text-white text-xl font-black font-mono truncate">
                    {convertedResult.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Quick Amount:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['20', '50', '100', '500', '1000'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition ${
                      amount === val
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {currentSrcInfo.symbol}{val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Rate Cards Grid */}
          <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Current Rate Reference</span>
              <span className="text-[10px] text-emerald-400 font-mono">1 {sourceCurrency} =</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'INR'].map((code) => {
                if (code === sourceCurrency) return null;
                const info = ratesToUSD[code];
                const rateVal = convertValue('1', sourceCurrency, code);

                return (
                  <button
                    key={code}
                    onClick={() => setTargetCurrency(code)}
                    className={`p-2 rounded-lg border text-left transition ${
                      targetCurrency === code
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 font-medium">{info.name}</div>
                    <div className="text-xs font-bold font-mono text-emerald-300 mt-0.5">
                      {info.symbol}{rateVal < 10 ? rateVal.toFixed(2) : Math.round(rateVal).toLocaleString()} {code}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Avg. Generation Time</div>
            <div className="text-lg font-bold text-white">&lt; 2.4 Seconds</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Budget Efficiency</div>
            <div className="text-lg font-bold text-white">+28% Saved</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active AI Agents</div>
            <div className="text-lg font-bold text-white">10 Orchestrated</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Live Cities Covered</div>
            <div className="text-lg font-bold text-white">14,200+ Destinations</div>
          </div>
        </div>
      </div>

      {/* Active Trip Spotlight */}
      {activeTrip && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <span>Active Trip Spotlight</span>
            </h2>
            <button
              onClick={() => onNavigateTab('itinerary')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Full Interactive Itinerary <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3">
            <div className="h-56 md:h-full relative overflow-hidden">
              <img
                src={activeTrip.coverImage}
                alt={activeTrip.destination}
                className="w-full h-full object-cover transition hover:scale-105 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold uppercase tracking-wide">
                  {activeTrip.status}
                </span>
                <h3 className="text-xl font-extrabold mt-1">{activeTrip.destination}</h3>
                <p className="text-xs text-slate-300">{activeTrip.totalDays} Days • {activeTrip.travelerPersona}</p>
              </div>
            </div>

            <div className="p-6 md:col-span-2 flex flex-col justify-between space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Dates
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {activeTrip.startDate} to {activeTrip.endDate}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Budget
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    ${activeTrip.budget} {activeTrip.currency}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Visa Status
                  </div>
                  <div className="text-sm font-semibold text-emerald-400 mt-1">
                    {activeTrip.visaInfo?.status || 'Visa Free'}
                  </div>
                </div>
              </div>

              {/* Quick Actions for active trip */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onNavigateTab('itinerary')}
                  className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs px-3 py-2 rounded-lg font-medium transition"
                >
                  <Calendar className="h-3.5 w-3.5" /> View Day Itinerary
                </button>

                <button
                  onClick={() => onNavigateTab('flights')}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg font-medium transition"
                >
                  <Plane className="h-3.5 w-3.5 text-blue-400" /> Flights ({activeTrip.flights.length})
                </button>

                <button
                  onClick={() => onNavigateTab('hotels')}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg font-medium transition"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-400" /> Stays ({activeTrip.hotels.length})
                </button>

                <button
                  onClick={() => onNavigateTab('simulator')}
                  className="flex items-center gap-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 text-xs px-3 py-2 rounded-lg font-medium transition ml-auto"
                >
                  <Zap className="h-3.5 w-3.5" /> Replan Disruption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant AI Trip Prompts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <span>Instant AI Copilot Prompt Starters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickPrompts.map((item, idx) => (
            <div
              key={idx}
              onClick={onOpenNewTripModal}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-cyan-400">{item.days}</span>
                  <span className="font-mono text-emerald-400">{item.budget}</span>
                </div>
                <h3 className="font-bold text-white text-sm mt-1 group-hover:text-cyan-300 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 italic">
                  "{item.prompt}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Generate with AI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Trips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Saved Trips</h2>
          <button
            onClick={onOpenNewTripModal}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add Destination
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTrip(t)}
              className={`rounded-xl bg-slate-900 border p-4 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                activeTrip?.id === t.id
                  ? 'border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={t.coverImage}
                    alt={t.destination}
                    className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{t.destination}</h3>
                    <p className="text-xs text-slate-400">{t.totalDays} Days • ${t.budget} {t.currency}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    t.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : t.status === 'upcoming'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {t.startDate}
                </span>
                <span className="text-cyan-400 font-medium group-hover:underline">Manage Trip →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
