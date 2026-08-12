import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, Activity } from '../types';
import { formatCurrency } from '../utils/currency';
import {
  MapPin,
  Compass,
  ShieldCheck,
  Navigation,
  Layers,
  ExternalLink,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Route,
  Info,
  Calendar,
  Maximize2,
  Eye,
  Utensils,
  Landmark,
  Plane,
  Camera,
  TreePine,
  Coffee,
} from 'lucide-react';

interface MapViewProps {
  activeTrip: Trip | null;
  onUpdateTrip?: (updatedTrip: Trip) => void;
  currency?: string;
}

export const MapView: React.FC<MapViewProps> = ({ activeTrip, onUpdateTrip, currency = 'USD' }) => {
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = All Days, 1+ = specific day
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'hybrid' | 'route' | 'embed'>('hybrid');

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

  // Filter activities by day or all
  const filteredActivitiesWithDay = activeTrip.days
    .filter((d) => selectedDay === 0 || d.dayNumber === selectedDay)
    .flatMap((d) => d.activities.map((a) => ({ ...a, dayNumber: d.dayNumber })));

  const handleOpenMarkerModal = (act: Activity) => {
    setSelectedActivity(act);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (actId: string) => {
    if (!activeTrip || !onUpdateTrip) return;

    const updatedDays = activeTrip.days.map((day) => ({
      ...day,
      activities: day.activities.map((act) =>
        act.id === actId ? { ...act, completed: !act.completed } : act
      ),
    }));

    onUpdateTrip({ ...activeTrip, days: updatedDays });

    if (selectedActivity && selectedActivity.id === actId) {
      setSelectedActivity((prev) => (prev ? { ...prev, completed: !prev.completed } : null));
    }
  };

  // Find next and previous activity for modal cycling
  const currentIndex = filteredActivitiesWithDay.findIndex((a) => a.id === selectedActivity?.id);
  const prevActivity = currentIndex > 0 ? filteredActivitiesWithDay[currentIndex - 1] : null;
  const nextActivity =
    currentIndex >= 0 && currentIndex < filteredActivitiesWithDay.length - 1
      ? filteredActivitiesWithDay[currentIndex + 1]
      : null;

  // Icon mapping for categories
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'food':
        return Utensils;
      case 'culture':
      case 'cultural':
        return Landmark;
      case 'transit':
        return Plane;
      case 'nature':
      case 'relaxation':
        return TreePine;
      case 'shopping':
      case 'entertainment':
        return Camera;
      default:
        return Coffee;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Compass className="h-4 w-4" /> Navigation Agent & Map Visualizer
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Interactive Route & Spot Map</h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTrip.destination} • Click on any map marker pin to open quick itinerary details
          </p>
        </div>

        {/* Day Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedDay === 0
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            All Days ({activeTrip.days.reduce((acc, d) => acc + d.activities.length, 0)})
          </button>
          {activeTrip.days.map((d) => (
            <button
              key={d.dayNumber}
              onClick={() => setSelectedDay(d.dayNumber)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedDay === d.dayNumber
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map Stage + Spot List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas Box */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] relative flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Map Top Bar: View Mode Switcher & Safety Badge */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMapStyle('hybrid')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  mapStyle === 'hybrid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive Nodes
              </button>
              <button
                onClick={() => setMapStyle('embed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  mapStyle === 'embed' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Map View
              </button>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Neighborhood Safety Index: 9.8 / 10
            </div>
          </div>

          {/* MAP CANVAS CONTENT */}
          {mapStyle === 'embed' ? (
            <div className="relative z-10 my-4 h-[380px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                title="Google Maps Location View"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  selectedActivity
                    ? `${selectedActivity.location}, ${activeTrip.destination}`
                    : activeTrip.destination
                )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                <span>📍 Showing coordinates for: <strong className="text-white">{selectedActivity ? selectedActivity.title : activeTrip.destination}</strong></span>
                <span className="text-cyan-400 font-mono text-[11px]">Google Maps Live</span>
              </div>
            </div>
          ) : (
            /* Interactive Node Diagram with Markers */
            <div className="relative z-10 my-6 py-8 px-2 min-h-[340px] flex flex-col justify-center">
              {/* Route Path Connector Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/50 to-emerald-500/30 rounded-full hidden sm:block pointer-events-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
                {filteredActivitiesWithDay.map((act, idx) => {
                  const CategoryIcon = getCategoryIcon(act.category);
                  const isSelected = selectedActivity?.id === act.id;

                  return (
                    <motion.div
                      key={act.id}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOpenMarkerModal(act)}
                      className={`relative cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 group ${
                        isSelected
                          ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-500/20'
                          : act.completed
                          ? 'bg-slate-900/90 border-emerald-500/30 text-slate-300'
                          : 'bg-slate-800/80 border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-800'
                      }`}
                    >
                      {/* Sequence Badge */}
                      <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-slate-950 border border-cyan-400/60 text-cyan-300 font-mono font-bold text-[10px] flex items-center justify-center shadow-md">
                        {idx + 1}
                      </div>

                      {/* Day Tag if All Days selected */}
                      {selectedDay === 0 && (
                        <div className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-300 font-mono text-[9px] font-bold">
                          Day {act.dayNumber}
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Animated Marker Pin Icon */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                              act.completed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950'
                            }`}
                          >
                            <MapPin className="h-5 w-5" />
                          </div>
                          {/* Pulsing ring effect for uncompleted spots */}
                          {!act.completed && (
                            <span className="absolute -inset-1 rounded-xl bg-cyan-500/20 animate-ping opacity-30 pointer-events-none" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">{act.time}</span>
                            {act.completed && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <h4 className="font-extrabold text-white text-xs truncate mt-0.5 group-hover:text-cyan-300 transition">
                            {act.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <CategoryIcon className="h-3 w-3 shrink-0 text-slate-500" />
                            <span className="truncate">{act.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Quick-view hint banner */}
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-cyan-300">
                        <span>Click for Itinerary Details</span>
                        <Eye className="h-3 w-3" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map Footer Bar */}
          <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800 pt-3.5 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Route className="h-3.5 w-3.5 text-cyan-400" /> {filteredActivitiesWithDay.length} Map Locations Plotted
            </span>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(activeTrip.destination)}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 text-xs font-semibold"
            >
              Open Entire Destination in Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Spot List Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-400" /> Itinerary Locations
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {filteredActivitiesWithDay.length} Places
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredActivitiesWithDay.map((act, i) => (
              <div
                key={act.id}
                onClick={() => handleOpenMarkerModal(act)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  selectedActivity?.id === act.id
                    ? 'bg-cyan-950/80 border-cyan-500/80 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{act.title}</div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-slate-500" /> {act.time} • {act.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {act.completed && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      Done
                    </span>
                  )}
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-slate-700/60 text-slate-300 hover:text-cyan-300 hover:bg-slate-700"
                    title="View details modal"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK-VIEW ITINERARY LOCATION MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-20">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        Itinerary Spot Quick View
                      </span>
                      {selectedActivity.completed && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          Completed Activity
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-white truncate">{selectedActivity.title}</h2>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Close Modal (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 flex-1">
                {/* Embedded Live Google Map Preview */}
                <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
                  <iframe
                    title="Spot Google Map Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      `${selectedActivity.location}, ${activeTrip.destination}`
                    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(
                      `${selectedActivity.title} ${selectedActivity.location} ${activeTrip.destination}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg"
                  >
                    <span>Google Maps Directions</span> <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Scheduled Time</span>
                    <span className="font-extrabold text-white text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" /> {selectedActivity.time}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Cost</span>
                    <span className="font-extrabold text-emerald-400 text-xs flex items-center gap-1 mt-0.5 font-mono">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      {formatCurrency(selectedActivity.cost, currency)}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                    <span className="font-extrabold text-cyan-300 text-xs capitalize mt-0.5 block">
                      {selectedActivity.category || 'General'}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating / Reviews</span>
                    <span className="font-extrabold text-amber-400 text-xs flex items-center gap-1 mt-0.5 font-mono">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {selectedActivity.rating || '4.8'} / 5.0
                    </span>
                  </div>
                </div>

                {/* Location Address & Notes */}
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Address / District</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{selectedActivity.location}</p>
                  </div>

                  {selectedActivity.notes && (
                    <div className="pt-3 border-t border-slate-700/60">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5" /> Travel Notes & Tip
                      </span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedActivity.notes}</p>
                    </div>
                  )}
                </div>

                {/* Mark as Completed Toggle Button */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs">
                    <span className="font-bold text-white block">Activity Progress</span>
                    <span className="text-slate-400 text-[11px]">
                      {selectedActivity.completed ? 'Marked as completed on your itinerary' : 'Not completed yet'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(selectedActivity.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      selectedActivity.completed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{selectedActivity.completed ? 'Completed ✓' : 'Mark Completed'}</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer: Prev / Next Cycling Navigation */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <button
                  disabled={!prevActivity}
                  onClick={() => prevActivity && setSelectedActivity(prevActivity)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    prevActivity
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Spot
                </button>

                <span className="text-xs text-slate-400 font-mono">
                  {currentIndex + 1} of {filteredActivitiesWithDay.length}
                </span>

                <button
                  disabled={!nextActivity}
                  onClick={() => nextActivity && setSelectedActivity(nextActivity)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    nextActivity
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Next Spot <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
