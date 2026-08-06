import React, { useState } from 'react';
import { Trip, Activity, ActivityCategory } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Sparkles,
  CloudSun,
  Utensils,
  Compass,
  Bus,
  Bed,
  Smile,
  Zap,
  GripVertical,
  Wind,
  Droplets,
  ArrowRightLeft,
  RefreshCw,
  Sun,
  Info,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItineraryViewProps {
  activeTrip: Trip | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

interface SortableActivityItemProps {
  activity: Activity;
  index: number;
  totalActivities: number;
  categoryIcons: Record<ActivityCategory, any>;
  convertCost: (cost: number) => string;
  onDelete: (id: string) => void;
  onUpdateTime: (id: string, newTime: string) => void;
}

const SortableActivityItem: React.FC<SortableActivityItemProps> = ({
  activity,
  categoryIcons,
  convertCost,
  onDelete,
  onUpdateTime,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const CategoryIcon = categoryIcons[activity.category] || Compass;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
        isDragging
          ? 'opacity-60 border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50 shadow-2xl z-50 scale-[1.01]'
          : 'bg-slate-800/60 border-slate-700/70 hover:border-cyan-500/50 hover:bg-slate-800'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Drag Handle with dnd-kit listeners and attributes */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-700/50 transition cursor-grab active:cursor-grabbing self-center shrink-0 touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder activity"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          <CategoryIcon className="h-5 w-5" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Editable Time Slot Badge */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-500/80 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-500/50 rounded-lg px-2 py-0.5 transition shrink-0">
              <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={activity.time}
                onChange={(e) => onUpdateTime(activity.id, e.target.value)}
                className="bg-transparent text-xs font-bold text-cyan-300 font-mono outline-none w-20 focus:text-white"
                placeholder="10:00 AM"
                title="Click to edit activity time slot"
              />
            </div>

            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {activity.category}
            </span>
          </div>
          <h3 className="font-bold text-white text-sm truncate">{activity.title}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
            <span className="truncate">{activity.location}</span>
          </p>
          {activity.notes && <p className="text-xs text-slate-300 italic pt-1">{activity.notes}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
          </div>
          {activity.cost > 0 && (
            <div className="text-[10px] text-slate-400 font-mono">
              ({convertCost(activity.cost)})
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(activity.id)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
            title="Remove activity"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ItineraryView: React.FC<ItineraryViewProps> = ({ activeTrip, onUpdateTrip }) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);

  // Weather Widget State
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Currency Converter State
  const [targetCurrency, setTargetCurrency] = useState<string>('JPY');
  const [customAmount, setCustomAmount] = useState<string>('50');

  // New Activity Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityCategory>('sightseeing');
  const [newCost, setNewCost] = useState('20');
  const [newNotes, setNewNotes] = useState('');

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!activeTrip) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active trip selected. Please select or create a trip from the dashboard.</p>
      </div>
    );
  }

  const currentDay = activeTrip.days.find((d) => d.dayNumber === selectedDayNumber) || activeTrip.days[0];

  const categoryIcons: Record<ActivityCategory, any> = {
    sightseeing: Compass,
    food: Utensils,
    transit: Bus,
    accommodation: Bed,
    relaxation: Smile,
    adventure: Zap,
  };

  // Currency Exchange Rates dictionary
  const exchangeRates: Record<string, { rate: number; symbol: string; label: string }> = {
    JPY: { rate: 154.5, symbol: '¥', label: 'Japanese Yen' },
    EUR: { rate: 0.92, symbol: '€', label: 'Euro' },
    GBP: { rate: 0.78, symbol: '£', label: 'British Pound' },
    AUD: { rate: 1.52, symbol: 'A$', label: 'Australian Dollar' },
    CAD: { rate: 1.36, symbol: 'C$', label: 'Canadian Dollar' },
    SGD: { rate: 1.34, symbol: 'S$', label: 'Singapore Dollar' },
    THB: { rate: 36.2, symbol: '฿', label: 'Thai Baht' },
  };

  const currInfo = exchangeRates[targetCurrency] || exchangeRates.JPY;

  const convertCost = (usdAmount: number) => {
    const val = usdAmount * currInfo.rate;
    return `${currInfo.symbol}${Math.round(val).toLocaleString()}`;
  };

  // Temperature helper
  const formatTemp = (celsiusTemp: number) => {
    if (tempUnit === 'F') {
      const fahrenheit = Math.round((celsiusTemp * 9) / 5 + 32);
      return `${fahrenheit}°F`;
    }
    return `${celsiusTemp}°C`;
  };

  // Handle drag end using dnd-kit sortable
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !currentDay) return;

    const oldIndex = currentDay.activities.findIndex((act) => act.id === active.id);
    const newIndex = currentDay.activities.findIndex((act) => act.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedActivities = arrayMove(currentDay.activities, oldIndex, newIndex);

      const updatedDays = activeTrip.days.map((d) => {
        if (d.dayNumber === selectedDayNumber) {
          return { ...d, activities: reorderedActivities };
        }
        return d;
      });

      onUpdateTrip({ ...activeTrip, days: updatedDays });
    }
  };

  const handleAddActivity = () => {
    if (!newTitle.trim()) return;

    const activity: Activity = {
      id: 'act-' + Date.now(),
      title: newTitle,
      time: newTime,
      location: newLocation || activeTrip.destination,
      category: newCategory,
      cost: parseFloat(newCost) || 0,
      notes: newNotes,
    };

    const updatedDays = activeTrip.days.map((d) => {
      if (d.dayNumber === selectedDayNumber) {
        return {
          ...d,
          activities: [...d.activities, activity],
          dailyBudgetSpent: d.dailyBudgetSpent + activity.cost,
        };
      }
      return d;
    });

    onUpdateTrip({ ...activeTrip, days: updatedDays });
    setNewTitle('');
    setNewLocation('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleDeleteActivity = (actId: string) => {
    const updatedDays = activeTrip.days.map((d) => {
      if (d.dayNumber === selectedDayNumber) {
        const filtered = d.activities.filter((a) => a.id !== actId);
        const newTotalCost = filtered.reduce((acc, curr) => acc + curr.cost, 0);
        return { ...d, activities: filtered, dailyBudgetSpent: newTotalCost };
      }
      return d;
    });
    onUpdateTrip({ ...activeTrip, days: updatedDays });
  };

  const handleUpdateTime = (actId: string, newTime: string) => {
    if (!currentDay || !activeTrip) return;

    const updatedActivities = currentDay.activities.map((act) => {
      if (act.id === actId) {
        return { ...act, time: newTime };
      }
      return act;
    });

    const updatedDays = activeTrip.days.map((d) => {
      if (d.dayNumber === selectedDayNumber) {
        return { ...d, activities: updatedActivities };
      }
      return d;
    });

    onUpdateTrip({ ...activeTrip, days: updatedDays });
  };

  const handleAIReplanDay = async () => {
    setIsReplanning(true);
    try {
      const res = await fetch('/api/ai/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: 'Optimize route order to reduce transit time and insert a recommended local coffee break',
          currentItinerary: currentDay,
          tripDetails: { destination: activeTrip.destination },
        }),
      });
      const data = await res.json();
      if (data.success && data.plan?.revisedActivities) {
        const revised = data.plan.revisedActivities.map((ra: any, idx: number) => ({
          id: 'rev-' + Date.now() + '-' + idx,
          title: ra.title,
          time: ra.time,
          location: ra.location || activeTrip.destination,
          category: ra.category || 'sightseeing',
          cost: ra.cost || 15,
          notes: ra.notes || 'Optimized by TravelGPT Pro',
        }));

        const updatedDays = activeTrip.days.map((d) => {
          if (d.dayNumber === selectedDayNumber) {
            return {
              ...d,
              activities: revised,
              dailyBudgetSpent: revised.reduce((acc: number, c: any) => acc + c.cost, 0),
            };
          }
          return d;
        });

        onUpdateTrip({ ...activeTrip, days: updatedDays });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplanning(false);
    }
  };

  const handleRefreshWeather = () => {
    setIsRefreshingWeather(true);
    setTimeout(() => {
      setIsRefreshingWeather(false);
    }, 600);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Calendar className="h-4 w-4" /> Dynamic Itinerary Engine
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">{activeTrip.title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTrip.destination} • {activeTrip.totalDays} Days • Persona: {activeTrip.travelerPersona}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAIReplanDay}
            disabled={isReplanning}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isReplanning ? 'AI Optimizing Day...' : 'AI Replan Day'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <Plus className="h-4 w-4" /> Add Activity
          </button>
        </div>
      </div>

      {/* Days Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activeTrip.days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayNumber(day.dayNumber)}
            className={`px-4 py-3 rounded-xl border text-xs text-left shrink-0 transition ${
              selectedDayNumber === day.dayNumber
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>Day {day.dayNumber}</span>
              <span className="text-[10px] text-emerald-400 font-mono">${day.dailyBudgetSpent}</span>
            </div>
            <div className="text-[11px] font-normal text-slate-400 mt-0.5 line-clamp-1">{day.theme}</div>
          </button>
        ))}
      </div>

      {/* Interactive Weather & Currency Intelligence Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Intelligence Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <CloudSun className="h-4 w-4" /> Weather Intelligence Agent ({activeTrip.destination})
            </div>

            <div className="flex items-center gap-2">
              {/* C / F Unit Toggle */}
              <div className="flex items-center bg-slate-800 border border-slate-700 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${
                    tempUnit === 'C' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${
                    tempUnit === 'F' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °F
                </button>
              </div>

              <button
                onClick={handleRefreshWeather}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Refresh Live Weather"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingWeather ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Main Weather Metric */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Sun className="h-8 w-8" />
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">{formatTemp(23)}</div>
                <div className="text-xs text-amber-300 font-medium">Sunny & Mild</div>
                <div className="text-[10px] text-slate-400">High: {formatTemp(26)} • Low: {formatTemp(16)}</div>
              </div>
            </div>

            {/* Weather Secondary Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Humidity</div>
                  <div className="font-bold text-white font-mono">62%</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-2">
                <Wind className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Wind</div>
                  <div className="font-bold text-white font-mono">12 km/h</div>
                </div>
              </div>
            </div>

            {/* Weather Tip Box */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Perfect conditions for walking tours! Light layers recommended for morning and evening.</span>
            </div>
          </div>
        </div>

        {/* Currency Converter Quick Tool */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ArrowRightLeft className="h-4 w-4" /> Live Currency Converter
            </div>

            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 outline-none font-semibold"
            >
              {Object.entries(exchangeRates).map(([code, info]) => (
                <option key={code} value={code}>
                  {code} ({info.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400">USD ($)</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full mt-0.5 bg-slate-800 border border-slate-700 text-white rounded-lg p-2 font-mono text-xs outline-none"
                />
              </div>
              <div className="text-slate-500 pt-4">=</div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400">{currInfo.label}</label>
                <div className="mt-0.5 bg-slate-800/80 border border-slate-700/80 text-emerald-300 font-bold font-mono rounded-lg p-2 text-xs truncate">
                  {convertCost(parseFloat(customAmount) || 0)}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-1">
              Rate: 1 USD = {currInfo.symbol}{currInfo.rate} {targetCurrency}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Details Header */}
      {currentDay && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Day {currentDay.dayNumber} Overview
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                  <GripVertical className="h-3 w-3 text-cyan-400" /> Drag handles to reorder activities
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">{currentDay.theme}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentDay.date}</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                <CloudSun className="h-4 w-4 text-amber-400" />
                <span>{currentDay.weatherForecast}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span>
                  Day Spend: ${currentDay.dailyBudgetSpent} ({convertCost(currentDay.dailyBudgetSpent)})
                </span>
              </div>
            </div>
          </div>

          {/* Activities List Timeline with dnd-kit Sortable */}
          {currentDay.activities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No activities scheduled for this day yet. Click "Add Activity" or use "AI Replan Day".
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={currentDay.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {currentDay.activities.map((act, index) => (
                    <SortableActivityItem
                      key={act.id}
                      activity={act}
                      index={index}
                      totalActivities={currentDay.activities.length}
                      categoryIcons={categoryIcons}
                      convertCost={convertCost}
                      onDelete={handleDeleteActivity}
                      onUpdateTime={handleUpdateTime}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Activity (Day {selectedDayNumber})</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Activity Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Visit Meiji Shrine"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Est. Cost ($)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food & Dining</option>
                  <option value="transit">Transit / Travel</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="relaxation">Relaxation / Spa</option>
                  <option value="adventure">Adventure / Sports</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Location Spot</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Harajuku, Tokyo"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Notes / Tips</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Best to go early to avoid long queues"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


