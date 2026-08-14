import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, Persona, FlightOption, HotelOption } from './types';
import { SAMPLE_TRIPS, INITIAL_PERSONAS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CopilotView } from './components/CopilotView';
import { ItineraryView } from './components/ItineraryView';
import { FlightIntelligenceView } from './components/FlightIntelligenceView';
import { HotelIntelligenceView } from './components/HotelIntelligenceView';
import { BudgetDashboardView } from './components/BudgetDashboardView';
import { MapView } from './components/MapView';
import { VisaSafetyView } from './components/VisaSafetyView';
import { PackingView } from './components/PackingView';
import { JournalView } from './components/JournalView';
import { ProfileMemoryView } from './components/ProfileMemoryView';
import { TripSimulatorView } from './components/TripSimulatorView';
import { NewTripModal } from './components/NewTripModal';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(SAMPLE_TRIPS);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(SAMPLE_TRIPS[0]);
  const [personas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(INITIAL_PERSONAS[3]);
  const [currency, setCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);

  const handleSelectTrip = (trip: Trip) => {
    setActiveTrip(trip);
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setActiveTrip(updatedTrip);
    setTrips(trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  const handleAddTrip = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    setActiveTrip(newTrip);
    setActiveTab('itinerary');
  };

  const handleSelectFlight = (flight: FlightOption) => {
    if (!activeTrip) return;
    const exists = activeTrip.flights.some((f) => f.id === flight.id);
    const updated = exists
      ? activeTrip.flights
      : [...activeTrip.flights, flight];
    handleUpdateTrip({ ...activeTrip, flights: updated });
  };

  const handleSelectHotel = (hotel: HotelOption) => {
    if (!activeTrip) return;
    const exists = activeTrip.hotels.some((h) => h.id === hotel.id);
    const updated = exists
      ? activeTrip.hotels
      : [...activeTrip.hotels, hotel];
    handleUpdateTrip({ ...activeTrip, hotels: updated });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        activeTrip={activeTrip}
        trips={trips}
        onSelectTrip={handleSelectTrip}
        onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
        selectedPersona={selectedPersona}
        onChangePersona={setSelectedPersona}
        personas={personas}
        currency={currency}
        onChangeCurrency={setCurrency}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Body Area */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Mobile Navigation Strip */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex items-center justify-around py-2 px-1 text-[10px]">
          {[
            { id: 'dashboard', label: 'Home' },
            { id: 'copilot', label: 'Copilot' },
            { id: 'itinerary', label: 'Itinerary' },
            { id: 'flights', label: 'Flights' },
            { id: 'budget', label: 'Budget' },
            { id: 'simulator', label: 'Replan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-1 font-semibold ${
                activeTab === tab.id ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  activeTrip={activeTrip}
                  trips={trips}
                  selectedPersona={selectedPersona}
                  onSelectTrip={handleSelectTrip}
                  onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
                  onNavigateTab={setActiveTab}
                  currency={currency}
                />
              )}

              {activeTab === 'copilot' && (
                <CopilotView
                  activeTrip={activeTrip}
                  onAddTrip={handleAddTrip}
                  onSelectTrip={handleSelectTrip}
                  onNavigateTab={setActiveTab}
                  currency={currency}
                />
              )}

              {activeTab === 'itinerary' && (
                <ItineraryView activeTrip={activeTrip} onUpdateTrip={handleUpdateTrip} currency={currency} />
              )}

              {activeTab === 'flights' && (
                <FlightIntelligenceView
                  flights={activeTrip?.flights || []}
                  activeTrip={activeTrip}
                  onSelectFlight={handleSelectFlight}
                  currency={currency}
                />
              )}

              {activeTab === 'hotels' && (
                <HotelIntelligenceView
                  hotels={activeTrip?.hotels || []}
                  activeTrip={activeTrip}
                  onSelectHotel={handleSelectHotel}
                  currency={currency}
                />
              )}

              {activeTab === 'budget' && (
                <BudgetDashboardView
                  activeTrip={activeTrip}
                  onUpdateTrip={handleUpdateTrip}
                  currency={currency}
                />
              )}

              {activeTab === 'map' && (
                <MapView
                  activeTrip={activeTrip}
                  onUpdateTrip={handleUpdateTrip}
                  currency={currency}
                />
              )}

              {activeTab === 'visa' && <VisaSafetyView activeTrip={activeTrip} />}

              {activeTab === 'packing' && (
                <PackingView activeTrip={activeTrip} onUpdateTrip={handleUpdateTrip} />
              )}

              {activeTab === 'journal' && (
                <JournalView activeTrip={activeTrip} onUpdateTrip={handleUpdateTrip} />
              )}

              {activeTab === 'profile' && (
                <ProfileMemoryView
                  selectedPersona={selectedPersona}
                  personas={personas}
                  onChangePersona={setSelectedPersona}
                />
              )}

              {activeTab === 'simulator' && (
                <TripSimulatorView activeTrip={activeTrip} onUpdateTrip={handleUpdateTrip} currency={currency} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* New AI Trip Generation Modal */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onAddTrip={handleAddTrip}
        personas={personas}
      />
    </div>
  );
}
