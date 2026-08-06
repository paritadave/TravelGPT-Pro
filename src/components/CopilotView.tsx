import React, { useState } from 'react';
import { Trip, AgentType, AgentMessage } from '../types';
import {
  Send,
  Bot,
  Sparkles,
  User,
  Compass,
  Plane,
  Building2,
  Utensils,
  Wallet,
  CloudSun,
  MapPin,
  Package,
  ShieldCheck,
  Brain,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface CopilotViewProps {
  activeTrip: Trip | null;
  onUpdateTrip?: (trip: Trip) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({ activeTrip }) => {
  const [activeAgent, setActiveAgent] = useState<AgentType>('Coordinator');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'm1',
      agentType: 'Coordinator',
      text: `Hello! I am TravelGPT Pro's Coordinator Agent orchestrating our 10 specialized travel intelligence agents for ${
        activeTrip ? activeTrip.destination : 'your next destination'
      }. How can we assist your journey today?`,
      timestamp: '10:00 AM',
      quickActions: [
        { label: 'Optimize 5-Day Budget', action: 'How can I trim $200 from our current itinerary budget?' },
        { label: 'Check Flight Price Trends', action: 'Are flight prices for Tokyo expected to drop next week?' },
        { label: 'Find Hidden Food Spots', action: 'Recommend 3 authentic non-touristy food gems near Shinjuku.' },
      ],
    },
  ]);

  const agentsList: { type: AgentType; name: string; icon: any; color: string }[] = [
    { type: 'Coordinator', name: 'Coordinator', icon: Bot, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { type: 'Planner', name: 'Trip Planner', icon: Compass, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { type: 'Flight', name: 'Flight Agent', icon: Plane, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    { type: 'Hotel', name: 'Hotel Agent', icon: Building2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { type: 'Restaurant', name: 'Food & Dining', icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { type: 'Budget', name: 'Budget Optimizer', icon: Wallet, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { type: 'Weather', name: 'Weather Radar', icon: CloudSun, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
    { type: 'Navigation', name: 'Navigation Route', icon: MapPin, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { type: 'Packing', name: 'Smart Packing', icon: Package, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { type: 'Visa', name: 'Visa & Safety', icon: ShieldCheck, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { type: 'Memory', name: 'Traveler Memory', icon: Brain, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      agentType: 'Coordinator',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          activeAgent,
          context: {
            destination: activeTrip?.destination,
            budget: activeTrip?.budget,
            days: activeTrip?.totalDays,
            persona: activeTrip?.travelerPersona,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMsg: AgentMessage = {
          id: (Date.now() + 1).toString(),
          agentType: activeAgent,
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          agentType: activeAgent,
          text: `⚠️ Agent note: Unable to connect live service (${error.message}). Showing localized response: For ${activeTrip?.destination || 'your destination'}, we recommend prioritizing morning activities to beat crowds and booking bullet train tickets 3 days in advance.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto h-[calc(100vh-85px)] flex flex-col space-y-4">
      {/* Agent Selector Header Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5 text-white">
            <Sparkles className="h-4 w-4 text-cyan-400" /> Multi-Agent Copilot Mesh
          </span>
          <span className="text-[11px] text-cyan-400">Active Agent: {activeAgent}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {agentsList.map((ag) => {
            const Icon = ag.icon;
            const isSelected = activeAgent === ag.type;
            return (
              <button
                key={ag.type}
                onClick={() => setActiveAgent(ag.type)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium shrink-0 transition ${
                  isSelected ? ag.color + ' ring-1 ring-cyan-400' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{ag.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.agentType === 'Coordinator' && m.id !== 'm1' && !messages.find(x => x.id === m.id && x.text.startsWith('Hello!'));
          const currentAgentInfo = agentsList.find((a) => a.type === m.agentType) || agentsList[0];
          const AgentIcon = currentAgentInfo.icon;

          return (
            <div key={m.id} className={`flex gap-3 max-w-3xl ${m.id === 'm1' ? 'mx-auto' : ''}`}>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs border ${
                  m.id === 'm1'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : currentAgentInfo.color
                }`}
              >
                <AgentIcon className="h-4 w-4" />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {m.agentType} Agent
                    <span className="text-[10px] font-normal text-slate-400">• {m.timestamp}</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                  {m.text}
                </div>

                {/* Quick Action Suggested Chips */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {m.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qa.action)}
                        className="text-xs bg-slate-800 hover:bg-cyan-950/50 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-slate-300 px-3 py-1.5 rounded-lg transition"
                      >
                        ⚡ {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs p-3 rounded-xl bg-slate-800/50 border border-slate-700 w-fit">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{activeAgent} Agent analyzing travel intelligence...</span>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask ${activeAgent} Agent anything (e.g. "Suggest 3-day itinerary in Tokyo under $1000")...`}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 px-3 py-1.5 outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition font-medium flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
