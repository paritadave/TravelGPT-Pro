import React, { useState } from 'react';
import { HotelOption, Trip } from '../types';
import { Building2, Star, Sparkles, MapPin, ExternalLink, CheckCircle2, Shield } from 'lucide-react';

interface HotelIntelligenceViewProps {
  hotels: HotelOption[];
  activeTrip: Trip | null;
  onSelectHotel?: (hotel: HotelOption) => void;
}

export const HotelIntelligenceView: React.FC<HotelIntelligenceViewProps> = ({
  hotels,
  activeTrip,
  onSelectHotel,
}) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Building2 className="h-4 w-4" /> Hotel & Boutique Stay Agent
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Accommodations Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Destination: {activeTrip?.destination || 'Tokyo, Japan'} • Matched with persona: {activeTrip?.travelerPersona || 'Boutique'}
          </p>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => {
          const isSelected = selectedHotelId === hotel.id;
          return (
            <div
              key={hotel.id}
              className={`rounded-2xl bg-slate-900 border overflow-hidden transition flex flex-col justify-between ${
                isSelected ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Hotel Cover Image */}
                <div className="h-48 relative overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles className="h-3 w-3" /> {hotel.aiMatchScore}% AI Match
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{hotel.rating}</span>
                      <span className="text-slate-400 font-normal">({hotel.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{hotel.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      {hotel.location} • <span className="italic text-slate-500">{hotel.neighborhood}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">{hotel.distanceToCenter}</p>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.map((am, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-slate-300 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded-md"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-5 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    ${hotel.pricePerNight} <span className="text-xs font-normal text-slate-400">/ night</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedHotelId(hotel.id);
                      if (onSelectHotel) onSelectHotel(hotel);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Booked
                      </>
                    ) : (
                      'Reserve Stay'
                    )}
                  </button>

                  <a
                    href={hotel.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
