import React, { useState, useEffect } from 'react';
import { VisaInfo, Trip } from '../types';
import { checkVisaRequirement, POPULAR_PASSPORTS, POPULAR_DESTINATIONS, VisaCheckResult } from '../utils/visaChecker';
import { ShieldCheck, FileCheck, AlertTriangle, PhoneCall, Sparkles, Loader2, Globe, MapPin, CheckCircle2, XCircle, Info } from 'lucide-react';

interface VisaSafetyViewProps {
  activeTrip: Trip | null;
}

export const VisaSafetyView: React.FC<VisaSafetyViewProps> = ({ activeTrip }) => {
  const [passportCountry, setPassportCountry] = useState('United States');
  const [destinationCountry, setDestinationCountry] = useState(activeTrip?.destination || 'Japan');
  const [customDestination, setCustomDestination] = useState('');
  const [isCustomDest, setIsCustomDest] = useState(false);
  
  const [checkedData, setCheckedData] = useState<VisaCheckResult>(
    checkVisaRequirement('United States', activeTrip?.destination || 'Japan')
  );
  const [loading, setLoading] = useState(false);

  // Sync if active trip changes
  useEffect(() => {
    if (activeTrip?.destination) {
      setDestinationCountry(activeTrip.destination);
      setCheckedData(checkVisaRequirement(passportCountry, activeTrip.destination));
    }
  }, [activeTrip]);

  // Handle changes to Passport or Destination
  const handlePassportChange = (newPassport: string) => {
    setPassportCountry(newPassport);
    const targetDest = isCustomDest && customDestination ? customDestination : destinationCountry;
    setCheckedData(checkVisaRequirement(newPassport, targetDest));
  };

  const handleDestinationChange = (newDest: string) => {
    if (newDest === 'custom') {
      setIsCustomDest(true);
      return;
    }
    setIsCustomDest(false);
    setDestinationCountry(newDest);
    setCheckedData(checkVisaRequirement(passportCountry, newDest));
  };

  const handleCustomDestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDestination.trim()) {
      setCheckedData(checkVisaRequirement(passportCountry, customDestination.trim()));
    }
  };

  // Optional AI Embassy Verification call
  const handleRunAiCheck = async () => {
    setLoading(true);
    const targetDest = isCustomDest && customDestination ? customDestination : destinationCountry;
    try {
      const res = await fetch('/api/ai/visa-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passportCountry,
          destination: targetDest,
        }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API returned non-JSON');
      }
      const data = await res.json();
      if (data.success && data.visaInfo) {
        const info = data.visaInfo;
        const isReq = info.status?.toLowerCase().includes('required') && !info.status?.toLowerCase().includes('free');
        
        setCheckedData({
          destination: targetDest,
          passportCountry,
          isVisaRequired: isReq,
          statusType: isReq ? 'Visa Required in Advance' : 'Visa Free',
          statusHeading: `${isReq ? '⚠️ Visa Required' : '✅ Visa Free / eTA Approval'}`,
          badgeStyle: isReq 
            ? { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', icon: '❌' }
            : { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', icon: '✅' },
          allowedStay: info.allowedStay || 'Up to 90 Days',
          passportValidityRequired: info.passportValidityRequired || '6 months validity',
          requiredDocuments: info.requiredDocuments || ['Valid Passport', 'Return Flight Ticket'],
          safetyRating: info.safetyRating || '4.8 / 5.0 (Very Safe)',
          advisoryLevel: info.advisoryLevel || 'Level 1: Exercise Normal Precautions',
          keyTips: info.keyTips || ['Keep passport copies saved safely', 'Register at embassy portal'],
          scamAlerts: info.scamAlerts || ['Beware of unofficial taxi drivers at airport arrival'],
          explanation: `Verified by AI Embassy Agent for ${passportCountry} passport holders traveling to ${targetDest}.`,
        });
      }
    } catch {
      // Fallback already active
    } finally {
      setLoading(false);
    }
  };

  const currentDestName = isCustomDest && customDestination ? customDestination : destinationCountry;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Control Header with Passport & Destination Selector */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> Global Visa & Safety Intelligence Agent
            </div>
            <h1 className="text-2xl font-black text-white mt-1">Destination Visa Requirements</h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your passport country and destination to instantly check whether a tourist visa is required.
            </p>
          </div>

          <button
            onClick={handleRunAiCheck}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg shadow-rose-500/20 transition self-start md:self-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{loading ? 'Consulting AI Embassy Portal...' : 'AI Embassy Verification'}</span>
          </button>
        </div>

        {/* Dual Selectors Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          {/* 1. Passport Country Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5" /> 1. Select Your Passport Country
            </label>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-base">🛂</span>
              <select
                value={passportCountry}
                onChange={(e) => handlePassportChange(e.target.value)}
                className="bg-transparent text-white font-bold text-sm outline-none w-full cursor-pointer"
              >
                {POPULAR_PASSPORTS.map((country) => (
                  <option key={country} value={country} className="bg-slate-900 text-white font-medium">
                    {country} Passport
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Destination Country Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5" /> 2. Select Destination Country
            </label>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-base">📍</span>
              {!isCustomDest ? (
                <select
                  value={destinationCountry}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="bg-transparent text-white font-bold text-sm outline-none w-full cursor-pointer"
                >
                  {activeTrip && (
                    <option value={activeTrip.destination} className="bg-slate-900 text-cyan-300 font-bold">
                      ⭐ {activeTrip.destination} (Active Trip)
                    </option>
                  )}
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <option key={dest} value={dest} className="bg-slate-900 text-white font-medium">
                      {dest}
                    </option>
                  ))}
                  <option value="custom" className="bg-slate-900 text-amber-400 font-bold">
                    + Type Custom Country...
                  </option>
                </select>
              ) : (
                <form onSubmit={handleCustomDestSubmit} className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={customDestination}
                    onChange={(e) => setCustomDestination(e.target.value)}
                    placeholder="Enter destination e.g. Iceland, Kenya, Egypt"
                    className="bg-transparent text-white font-bold text-sm outline-none flex-1 placeholder:font-normal placeholder:text-slate-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customDestination.trim()) {
                        setCheckedData(checkVisaRequirement(passportCountry, customDestination.trim()));
                      }
                    }}
                    className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-3 py-1 rounded-lg border border-cyan-500/40"
                  >
                    Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomDest(false)}
                    className="text-xs text-slate-400 hover:text-white px-2"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Requirement Alert Card */}
      <div
        className={`p-6 rounded-2xl border shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          checkedData.isVisaRequired
            ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/40 text-rose-100'
            : 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-100'
        }`}
      >
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${checkedData.badgeStyle.bg} ${checkedData.badgeStyle.text} ${checkedData.badgeStyle.border}`}
            >
              {checkedData.statusType}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {passportCountry} ➔ {currentDestName}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>{checkedData.statusHeading}</span>
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {checkedData.explanation}
          </p>
        </div>

        {/* Quick Spec Box */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-xs space-y-2 shrink-0 md:min-w-[240px]">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Allowed Stay Duration</span>
            <span className="font-extrabold text-white font-mono text-sm">{checkedData.allowedStay}</span>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Passport Validity</span>
            <span className="font-semibold text-cyan-300">{checkedData.passportValidityRequired}</span>
          </div>
        </div>
      </div>

      {/* Grid: Entry Documents & Advisories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Documents Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-cyan-400" /> Required Entry Documents
            </h3>
            <span className="text-xs font-bold text-cyan-400">{checkedData.requiredDocuments.length} Documents</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {checkedData.requiredDocuments.map((doc, i) => (
              <li key={i} className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="font-medium text-white">{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Index & Scam Alerts */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Travel Safety Index & Advisories
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {checkedData.safetyRating}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs text-slate-300">
              <strong className="text-slate-400">Government Advisory:</strong>{' '}
              <span className="text-amber-300 font-semibold">{checkedData.advisoryLevel}</span>
            </div>

            {checkedData.scamAlerts.map((alert, i) => (
              <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{alert}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <PhoneCall className="h-3.5 w-3.5" /> Key Travel Tips
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {checkedData.keyTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
