import React, { useState } from 'react';
import { VisaInfo, Trip } from '../types';
import { ShieldCheck, FileCheck, AlertTriangle, PhoneCall, Sparkles, Loader2, Globe } from 'lucide-react';

interface VisaSafetyViewProps {
  activeTrip: Trip | null;
}

export const VisaSafetyView: React.FC<VisaSafetyViewProps> = ({ activeTrip }) => {
  const [passportCountry, setPassportCountry] = useState('United States');
  const [visaData, setVisaData] = useState<VisaInfo | null>(activeTrip?.visaInfo || null);
  const [loading, setLoading] = useState(false);

  const handleCheckVisa = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/visa-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passportCountry,
          destination: activeTrip?.destination || 'Japan',
        }),
      });
      const data = await res.json();
      if (data.success && data.visaInfo) {
        setVisaData(data.visaInfo);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <ShieldCheck className="h-4 w-4" /> Visa & Safety Intelligence Agent
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Immigration & Safety Advisory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Destination: {activeTrip?.destination || 'Japan'} • Passport Check
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-white">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={passportCountry}
              onChange={(e) => setPassportCountry(e.target.value)}
              className="bg-transparent outline-none font-semibold text-cyan-300"
            >
              <option value="United States">US Passport</option>
              <option value="United Kingdom">UK Passport</option>
              <option value="Canada">Canada Passport</option>
              <option value="Australia">Australia Passport</option>
              <option value="Germany">Germany Passport</option>
              <option value="India">India Passport</option>
            </select>
          </div>

          <button
            onClick={handleCheckVisa}
            disabled={loading}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Run Visa Check</span>
          </button>
        </div>
      </div>

      {visaData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Box */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400">Entry Requirement Status</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{visaData.status}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Safety Index</span>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">{visaData.safetyRating}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-300">
                <strong>Allowed Stay:</strong> {visaData.allowedStay}
              </div>
              <div className="text-slate-300">
                <strong>Passport Validity:</strong> {visaData.passportValidityRequired}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-cyan-400" /> Required Entry Documents
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {visaData.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safety & Scam Alerts */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Local Advisories & Scam Alerts
            </h4>

            <div className="space-y-2">
              {visaData.scamAlerts.map((alert, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  ⚠️ {alert}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-rose-400" /> Emergency Tips
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {visaData.keyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
