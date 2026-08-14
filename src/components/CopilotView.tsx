import React, { useState } from 'react';
import { Trip, AgentType, AgentMessage } from '../types';
import { FormattedAgentText } from './FormattedAgentText';
import {
  Send,
  Bot,
  Sparkles,
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
  Globe,
  ExternalLink,
} from 'lucide-react';

interface CopilotViewProps {
  activeTrip: Trip | null;
  onUpdateTrip?: (trip: Trip) => void;
  onAddTrip?: (trip: Trip) => void;
  onSelectTrip?: (trip: Trip) => void;
  onNavigateTab?: (tab: string) => void;
  currency?: string;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  activeTrip,
  onAddTrip,
  onSelectTrip,
  onNavigateTab,
  currency = 'USD',
}) => {
  const [activeAgent, setActiveAgent] = useState<AgentType>('Coordinator');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'm1',
      agentType: 'Coordinator',
      text: `Hello! I am TravelGPT Pro's Coordinator Agent orchestrating our 10 specialized travel intelligence agents. How can we assist your journey today?`,
      timestamp: '10:00 AM',
      quickActions: [
        { label: 'Optimize Travel Budget', action: 'How can I optimize my travel budget and save money?' },
        { label: 'Flight Price Trends', action: 'When is the best time to book international flights?' },
        { label: 'Top Europe Spots', action: 'Recommend 4 top travel destinations in Europe with estimated budgets' },
        { label: '5-Day Tokyo Trip', action: 'Generate 5-Day Tokyo Trip' },
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

  // Helper to generate a full trip structure for instant loading
  const createGeneratedTrip = (destName: string, daysNum: number = 5): Trip => {
    const isSriLanka = destName.toLowerCase().includes('sri lanka');
    const isThailand = destName.toLowerCase().includes('thailand');
    const isNepal = destName.toLowerCase().includes('nepal');
    const isMaldives = destName.toLowerCase().includes('maldives');

    let title = `${destName} ${daysNum}-Day Adventure`;
    let budget = 650;
    let currencySymbol = '$';

    if (isSriLanka) {
      title = 'Sri Lanka Cultural & Coastal Odyssey';
      budget = 550;
    } else if (isThailand) {
      title = 'Thailand Tropical & Temple Explorer';
      budget = 700;
    } else if (isNepal) {
      title = 'Nepal Himalayan Kingdom Explorer';
      budget = 450;
    } else if (isMaldives) {
      title = 'Maldives Lagoon & Island Getaway';
      budget = 1200;
    }

    const tripId = `trip-gen-${Date.now()}`;

    return {
      id: tripId,
      title,
      destination: destName,
      startingCity: 'New Delhi',
      startDate: '2026-09-10',
      endDate: '2026-09-15',
      totalDays: daysNum,
      status: 'active',
      travelerPersona: 'Cultural Explorer',
      budget: budget,
      currency: currency,
      coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
      days: [
        {
          dayNumber: 1,
          date: 'Day 1',
          theme: 'Arrival & Iconic Highlights',
          dailyBudgetSpent: 90,
          weatherForecast: 'Sunny 28°C',
          activities: [
            {
              id: 'a1',
              title: `Arrival at ${destName} Airport & Hotel Check-in`,
              time: '10:00 AM',
              location: `${destName} Central`,
              category: 'transit',
              cost: 30,
              rating: 4.8,
              notes: 'Private transfer arranged by agent. Check-in and relax.',
              coordinates: { lat: 15.0, lng: 78.0 },
              completed: true,
            },
            {
              id: 'a2',
              title: 'Historic Quarter Guided Walking Tour',
              time: '02:00 PM',
              location: 'Heritage Square',
              category: 'sightseeing',
              cost: 25,
              rating: 4.9,
              notes: 'Explore traditional markets, monuments, and local artisan shops.',
              coordinates: { lat: 15.01, lng: 78.02 },
            },
            {
              id: 'a3',
              title: 'Sunset Dinner at Waterfront Terrace',
              time: '07:00 PM',
              location: 'Harbor Promenade',
              category: 'food',
              cost: 35,
              rating: 4.9,
              notes: 'Sample authentic regional cuisine with scenic evening views.',
            },
          ],
        },
        {
          dayNumber: 2,
          date: 'Day 2',
          theme: 'Nature, Culture & Local Flavor',
          dailyBudgetSpent: 85,
          weatherForecast: 'Partly Cloudy 27°C',
          activities: [
            {
              id: 'a4',
              title: 'Morning Nature & Landmark Trek',
              time: '08:30 AM',
              location: 'Scenic Viewpoint',
              category: 'adventure',
              cost: 20,
              rating: 4.8,
              notes: 'Early morning start to beat the crowds and enjoy panoramic photography.',
            },
            {
              id: 'a5',
              title: 'Street Food & Spice Tasting Market',
              time: '01:00 PM',
              location: 'Central Bazaar',
              category: 'food',
              cost: 15,
              rating: 4.9,
              notes: 'Agent recommended non-touristy stalls for authentic local dishes.',
            },
          ],
        },
      ],
      flights: [
        {
          id: 'f1',
          airline: 'Indigo / SriLankan / AirAsia',
          logo: '✈️',
          flightNumber: '6E-104',
          departureAirport: 'DEL / BOM',
          arrivalAirport: `${destName} International`,
          departureTime: '06:30 AM',
          arrivalTime: '10:15 AM',
          duration: '3h 45m',
          stops: 0,
          price: 180,
          currency: 'USD',
          co2Emissions: '140kg',
          aiScore: 9.6,
          tags: ['Best Value', 'Direct Flight'],
          bookingUrl: 'https://google.com/flights',
        },
      ],
      hotels: [
        {
          id: 'h1',
          name: `${destName} Grand Heritage Resort`,
          stars: 4,
          rating: 4.8,
          reviewsCount: 1240,
          pricePerNight: 85,
          currency: 'USD',
          location: 'Central Avenue',
          neighborhood: 'Historic District',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          amenities: ['Free WiFi', 'Infinity Pool', 'Breakfast Included', 'Airport Shuttle'],
          aiMatchScore: 98,
          distanceToCenter: '0.8 km from center',
          bookingUrl: 'https://booking.com',
        },
      ],
      packingCategories: [
        {
          category: 'Documents & Essentials',
          items: [
            { id: 'p1', name: 'Passport & Travel Insurance', packed: true, essential: true, category: 'Documents' },
            { id: 'p2', name: 'Universal Power Adapter', packed: false, essential: true, category: 'Electronics' },
            { id: 'p3', name: 'Comfortable Walking Shoes', packed: true, essential: true, category: 'Clothing' },
          ],
        },
      ],
      expenses: [
        {
          id: 'e1',
          category: 'transit',
          title: 'Airport Taxi Transfer',
          amount: 35,
          currency: 'USD',
          date: '2026-09-10',
          agentVerified: true,
        },
      ],
      journalEntries: [],
    };
  };

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

    const q = query.toLowerCase();

    // Check if user specifically requested a trip generation
    if (
      q.includes('generate') ||
      q.includes('plan 5-day') ||
      q.includes('plan 4-day') ||
      q.includes('generate 5-day') ||
      q.includes('generate 4-day')
    ) {
      let dest = 'Tokyo';
      if (q.includes('thailand')) dest = 'Thailand';
      else if (q.includes('nepal')) dest = 'Nepal';
      else if (q.includes('maldives')) dest = 'Maldives';
      else if (q.includes('vietnam')) dest = 'Vietnam';
      else if (q.includes('sri lanka')) dest = 'Sri Lanka';
      else if (q.includes('paris') || q.includes('france')) dest = 'Paris';
      else if (q.includes('tokyo') || q.includes('japan')) dest = 'Tokyo';
      else if (q.includes('bali') || q.includes('indonesia')) dest = 'Bali';
      else if (q.includes('rome') || q.includes('italy')) dest = 'Rome';
      else if (q.includes('london') || q.includes('uk')) dest = 'London';
      else {
        const cleaned = query.replace(/generate|plan|create|trip|for|me|5-day|4-day|3-day|day|a/gi, '').trim();
        if (cleaned.length > 2) {
          dest = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
      }

      const newTrip = createGeneratedTrip(dest, 5);
      if (onAddTrip) onAddTrip(newTrip);
      if (onSelectTrip) onSelectTrip(newTrip);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            agentType: 'Coordinator',
            text: `🎉 **Successfully Generated & Activated ${dest} Trip!**\n\nI've created a complete ${dest} itinerary with scheduled daily activities, non-stop flight options, handpicked boutique hotels, and budget breakdown. It is now set as your active trip!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickActions: [
              { label: 'View Daily Itinerary', action: 'Show Itinerary Tab' },
              { label: 'View Interactive Map', action: 'Show Map Tab' },
              { label: 'View Budget Breakdown', action: 'Show Budget Tab' },
            ],
          },
        ]);
        setLoading(false);
      }, 700);
      return;
    }

    if (q.includes('show itinerary tab') && onNavigateTab) {
      onNavigateTab('itinerary');
      setLoading(false);
      return;
    }
    if (q.includes('show map tab') && onNavigateTab) {
      onNavigateTab('map');
      setLoading(false);
      return;
    }
    if (q.includes('show budget tab') && onNavigateTab) {
      onNavigateTab('budget');
      setLoading(false);
      return;
    }

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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API server returned non-JSON. Fallback trigger.');
      }

      const data = await response.json();

      if (data.success && data.response) {
        const qa = [
          { label: 'Optimize Budget', action: 'How can I optimize my travel budget?' },
          { label: 'Flight Booking Tips', action: 'What are the best flight booking strategies?' },
          { label: 'Generate 5-Day Tokyo Trip', action: 'Generate 5-Day Tokyo Trip' },
        ];

        const aiMsg: AgentMessage = {
          id: (Date.now() + 1).toString(),
          agentType: activeAgent,
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: qa,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch {
      // Smart Fallback Intelligence Engine
      const d = activeTrip?.destination || 'your destination';
      let responseText = '';
      const qa = [
        { label: 'Optimize Budget', action: 'How can I optimize my travel budget?' },
        { label: 'Flight Booking Tips', action: 'What are the best flight booking strategies?' },
        { label: 'Generate 5-Day Tokyo Trip', action: 'Generate 5-Day Tokyo Trip' },
      ];

      switch (activeAgent) {
        case 'Planner':
          responseText = `### 🗺️ Custom Itinerary Recommendation for ${d}\n• **Morning (09:00 AM):** Start with a guided walking tour of top cultural landmarks and historic squares.\n• **Afternoon (01:00 PM):** Visit scenic viewing decks, local artisan markets, and regional museum exhibits.\n• **Evening (06:30 PM):** Enjoy a sunset dinner at a waterfront restaurant followed by evening district strolls.`;
          break;
        case 'Flight':
          responseText = `### ✈️ Flight Intelligence for ${d}\n• **Optimal Booking Window:** 6 - 8 weeks prior to departure.\n• **Price Trend:** Direct flights average 15-20% cheaper when departing on Tuesdays and Wednesdays.\n• **Baggage Advice:** Keep essential travel documents, chargers, and medications in carry-on.`;
          break;
        case 'Hotel':
          responseText = `### 🏨 Accommodation Guide for ${d}\n• **City Center Quarter:** High walkability to top sights, dining hubs, and metro lines.\n• **Boutique Stays:** $90 - $160 / night average with complimentary breakfast and high guest ratings.\n• **Quiet Zones:** Recommended for peaceful stays away from nightlife noise.`;
          break;
        case 'Budget':
          responseText = `### 💰 Budget Optimizer for ${d}\n• **Target Allocation:** 40% lodging, 30% dining, 15% activities, 15% local transit.\n• **Savings Strategy:** Purchase multi-day transit passes and city attraction cards to cut expenses by 35%.`;
          break;
        case 'Weather':
          responseText = `### 🌤️ Weather Intelligence for ${d}\n• **Forecast:** Generally pleasant with average highs around 24°C (75°F).\n• **Packing Tip:** Layered breathable clothing and lightweight rain jackets recommended for cool evenings.`;
          break;
        default:
          responseText = `### 🤖 ${activeAgent} Travel Advisory\n\nI've analyzed your query regarding **"${query}"**.\n\n• **Recommended Strategy:** Pace activities by neighborhood to minimize transit time.\n• **Reservations:** Secure popular restaurant and museum tickets 2-3 days in advance.\n• **Flexibility Buffer:** Keep 1-2 hours open in the afternoon for spontaneous local discoveries!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          agentType: activeAgent,
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: qa,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto h-[calc(100vh-85px)] flex flex-col space-y-4">
      {/* Agent Selector Header Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shrink-0 space-y-2 shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5 text-white">
            <Sparkles className="h-4 w-4 text-cyan-400" /> Multi-Agent Copilot Mesh
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">Active Agent: {activeAgent}</span>
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
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-xl">
        {messages.map((m) => {
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

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-sm leading-relaxed shadow-sm">
                  <FormattedAgentText text={m.text} />
                </div>

                {/* Quick Action Suggested Chips */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {m.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qa.action)}
                        className="text-xs bg-slate-800 hover:bg-cyan-950/80 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/60 text-slate-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1 font-medium shadow-sm"
                      >
                        <span>{qa.label}</span>
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
      <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3 shadow-xl">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask ${activeAgent} Agent anything (e.g. "Suggest 5-day itinerary in Tokyo under $1000" or "Best places in Europe")...`}
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

