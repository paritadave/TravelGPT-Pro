import React, { useState } from 'react';
import { Trip, Persona } from '../types';
import { checkVisaRequirement } from '../utils/visaChecker';
import { Sparkles, Loader2, Compass, DollarSign, Calendar, MapPin, X, ShieldCheck } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (newTrip: Trip) => void;
  personas: Persona[];
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onAddTrip,
  personas,
}) => {
  const [destination, setDestination] = useState('Kyoto, Japan');
  const [startingCity, setStartingCity] = useState('San Francisco, CA');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(2000);
  const [persona, setPersona] = useState(personas[0]?.name || 'Balanced Explorer');
  const [interests, setInterests] = useState<string[]>(['Sightseeing', 'Food & Dining', '🌱 Veg / Vegan Diet']);
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presetInterests = [
    'Sightseeing',
    'Food & Dining',
    '🌱 Veg / Vegan Diet',
    '👶 Baby & Toddler Friendly',
    '♿ Wheelchair Accessible',
    '🌾 Gluten-Free Options',
    '🐾 Pet Friendly',
    '🌙 Halal Food',
    '🌿 Eco-Friendly',
    '📸 Photography & Scenic Spots',
    'Culture & Temples',
    'Shopping & Markets',
    'Hiking & Nature',
    'Nightlife & Bars',
    'Relaxation & Spa',
  ];

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleAddCustomInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setCustomInterest('');
    }
  };

  const handleGenerateTrip = async () => {
    if (!destination.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startingCity,
          days,
          budget,
          persona,
          interests,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API route returned non-JSON.');
      }

      const data = await res.json();

      if (data.success && data.itinerary) {
        const itin = data.itinerary;
        const newTrip: Trip = {
          id: 'trip-' + Date.now(),
          title: itin.title || `${destination} ${days}-Day AI Trip`,
          destination: itin.destination || destination,
          startingCity,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
          totalDays: days,
          budget,
          currency: 'USD',
          travelerPersona: persona,
          status: 'upcoming',
          coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
          days: itin.days || [],
          flights: [],
          hotels: [],
          packingCategories: [],
          expenses: [],
          journalEntries: [],
        };

        onAddTrip(newTrip);
        onClose();
      } else {
        throw new Error('Fallback to local creation');
      }
    } catch {
      // Generate multi-day trip fallback matching user interests
      const hasVeg = interests.some((i) => i.toLowerCase().includes('veg'));
      const hasBaby = interests.some((i) => i.toLowerCase().includes('baby'));

      const generatedDays = Array.from({ length: days }).map((_, idx) => {
        const dNum = idx + 1;
        let theme = `Day ${dNum} - Highlights & Local Discovery`;
        if (dNum === 1) theme = 'Day 1 - Arrival, Hotel Check-in & Evening Stroll';
        if (dNum === days) theme = `Day ${days} - Cultural Landmarks, Souvenirs & Departure`;

        return {
          dayNumber: dNum,
          date: `Day ${dNum}`,
          theme,
          dailyBudgetSpent: Math.round(budget / days),
          weatherForecast: '☀️ 23°C Clear & Pleasant',
          activities: [
            {
              id: `act-${dNum}-1`,
              title: dNum === 1 ? 'Check-in & Neighborhood Orientation' : `${destination} Historic Landmarks Tour`,
              time: '09:30 AM',
              location: `${destination} Central Square`,
              category: 'sightseeing' as const,
              cost: dNum === 1 ? 0 : 25,
              rating: 4.8,
              notes: hasBaby ? 'Pram/stroller accessible route with shaded seating areas.' : 'Iconic photo spot and historic overview.',
            },
            {
              id: `act-${dNum}-2`,
              title: hasVeg ? 'Gourmet Organic Veg & Plant-Based Lunch' : 'Authentic Regional Food Market Tour',
              time: '01:00 PM',
              location: `${destination} Culinary Quarter`,
              category: 'food' as const,
              cost: 30,
              rating: 4.9,
              notes: hasVeg ? 'Features certified vegan/vegetarian dishes and fresh juices.' : 'Local culinary specialties and fresh seasonal bites.',
            },
            {
              id: `act-${dNum}-3`,
              title: 'Cultural Museum & Scenic Viewpoint',
              time: '04:00 PM',
              location: `${destination} Heritage Center`,
              category: 'sightseeing' as const,
              cost: 15,
              rating: 4.7,
              notes: 'Interactive exhibits and panoramic views over the city.',
            },
            {
              id: `act-${dNum}-4`,
              title: 'Relaxing Evening Stroll & Dinner',
              time: '07:30 PM',
              location: `${destination} Waterfront / Old Town`,
              category: 'relaxation' as const,
              cost: 45,
              rating: 4.8,
              notes: 'Atmospheric dining and stroll along lit pedestrian avenues.',
            },
          ],
        };
      });

      const newTrip: Trip = {
        id: 'trip-' + Date.now(),
        title: `${destination} ${days}-Day AI Journey`,
        destination,
        startingCity: startingCity || 'Home City',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
        totalDays: days,
        budget,
        currency: 'USD',
        travelerPersona: persona,
        status: 'upcoming',
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
        days: generatedDays,
        flights: [
          {
            id: 'fl-1',
            airline: 'Global Airways',
            logo: '✈️',
            flightNumber: 'GA-842',
            departureAirport: startingCity || 'SFO',
            arrivalAirport: destination.slice(0, 3).toUpperCase(),
            departureTime: '08:30 AM',
            arrivalTime: '02:15 PM',
            duration: '5h 45m',
            stops: 0,
            price: Math.round(budget * 0.35),
            currency: 'USD',
            co2Emissions: '140kg CO2',
            aiScore: 98,
            tags: ['Non-stop', 'Best Value'],
            bookingUrl: 'https://google.com/flights',
          },
        ],
        hotels: [
          {
            id: 'ht-1',
            name: `${destination} Grand Central Hotel`,
            stars: 4,
            rating: 4.8,
            reviewsCount: 340,
            pricePerNight: Math.round((budget * 0.4) / days),
            currency: 'USD',
            location: 'Downtown Center',
            neighborhood: 'Central Quarter',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
            amenities: ['Free High-Speed Wi-Fi', 'Breakfast Included', 'Family Friendly', 'Spa & Pool'],
            aiMatchScore: 96,
            distanceToCenter: '0.4 km from center',
            bookingUrl: 'https://google.com/travel/hotels',
          },
        ],
        packingCategories: [
          {
            category: 'Essential Gear',
            items: [
              { id: 'pk-1', name: 'Passport & Travel Documents', packed: false, essential: true, category: 'Essential Gear' },
              { id: 'pk-2', name: 'Universal Plug Adapter', packed: false, essential: true, category: 'Essential Gear' },
              { id: 'pk-3', name: 'Portable Power Bank', packed: false, essential: true, category: 'Essential Gear' },
              { id: 'pk-4', name: 'Comfy Walking Shoes', packed: false, essential: true, category: 'Essential Gear' },
            ],
          },
        ],
        expenses: [],
        journalEntries: [],
      };

      onAddTrip(newTrip);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Sparkles className="h-4 w-4" /> Multi-Agent AI Generator
          </div>
          <h2 className="text-xl font-extrabold text-white">Plan New AI Journey</h2>
          <p className="text-xs text-slate-400">Specify destination and preferences to orchestrate 10 travel agents.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Paris, France"
                className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-cyan-500"
              />
              {destination && (() => {
                const liveVisaInfo = checkVisaRequirement('United States', destination);
                return (
                  <div className={`mt-2 p-2 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${liveVisaInfo.badgeStyle.bg} ${liveVisaInfo.badgeStyle.text} ${liveVisaInfo.badgeStyle.border}`}>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-semibold">
                      {liveVisaInfo.statusHeading} ({liveVisaInfo.allowedStay})
                    </span>
                  </div>
                );
              })()}
            </div>
            <div>
              <label className="text-slate-400 font-medium">Starting City</label>
              <input
                type="text"
                value={startingCity}
                onChange={(e) => setStartingCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Target Budget ($ USD)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value) || 100)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-medium">Traveler Persona Style</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-medium"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.budgetLevel} • {p.pace})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-medium">Personalization, Dietary & Special Needs</label>
              <span className="text-[10px] text-cyan-400 font-medium">{interests.length} Selected</span>
            </div>

            {/* Interest Chips Selection */}
            <div className="flex flex-wrap gap-1.5 mt-2 max-h-40 overflow-y-auto p-1 bg-slate-950/40 border border-slate-800 rounded-xl">
              {presetInterests.map((item) => {
                const selected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{selected ? '✓' : '+'}</span>
                    <span>{item}</span>
                  </button>
                );
              })}

              {/* User Custom Added Interests */}
              {interests
                .filter((item) => !presetInterests.includes(item))
                .map((custom) => (
                  <div
                    key={custom}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-medium flex items-center gap-1.5"
                  >
                    <span>✓ {custom}</span>
                    <button
                      type="button"
                      onClick={() => toggleInterest(custom)}
                      className="text-emerald-400 hover:text-white font-bold text-xs"
                      title="Remove custom option"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>

            {/* Custom Input Field to Add Any Requirement */}
            <form onSubmit={handleAddCustomInterest} className="flex gap-2 mt-2.5">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add option e.g. Veg diet, Baby friendly, Jain food..."
                className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomInterest()}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition"
              >
                + Add Option
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white px-3 py-2">
            Cancel
          </button>
          <button
            onClick={handleGenerateTrip}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{loading ? '10 Agents Generating Itinerary...' : 'Orchestrate AI Trip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
