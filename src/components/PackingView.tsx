import React, { useState, useEffect } from 'react';
import { Trip, PackingCategory, PackingItem } from '../types';
import {
  Package,
  CheckSquare,
  Square,
  Sparkles,
  Plus,
  Loader2,
  Wifi,
  WifiOff,
  CloudSun,
  Activity,
  Download,
  Info,
  ShieldCheck,
  Luggage,
} from 'lucide-react';

interface PackingViewProps {
  activeTrip: Trip | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const PackingView: React.FC<PackingViewProps> = ({ activeTrip, onUpdateTrip }) => {
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Essentials & Tech');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflinePrompt, setShowOfflinePrompt] = useState(false);
  const [aiSourceNotice, setAiSourceNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflinePrompt(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

  // Extract analyzed climate & activities from activeTrip
  const climateSummary =
    activeTrip.days
      .map((d) => d.weatherForecast)
      .filter(Boolean)
      .slice(0, 3)
      .join(' • ') || '22°C Mild & Pleasant';

  const plannedActivities = Array.from(
    new Set(activeTrip.days.flatMap((d) => d.activities.map((a) => a.title)))
  );

  const displayActivities =
    plannedActivities.length > 0
      ? plannedActivities.slice(0, 4)
      : ['Sightseeing & Walking', 'Dining & Cultural Visits'];

  const allItems = activeTrip.packingCategories.flatMap((c) => c.items);
  const packedCount = allItems.filter((i) => i.packed).length;
  const progressPercent = allItems.length > 0 ? Math.round((packedCount / allItems.length) * 100) : 0;

  const handleTogglePacked = (itemId: string) => {
    const updatedCategories = activeTrip.packingCategories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => (item.id === itemId ? { ...item, packed: !item.packed } : item)),
    }));
    onUpdateTrip({ ...activeTrip, packingCategories: updatedCategories });
  };

  const generateLocalOfflineList = (): PackingCategory[] => {
    const dest = activeTrip.destination;
    const days = activeTrip.totalDays;
    const weatherText = climateSummary.toLowerCase();
    const isRainy = weatherText.includes('rain') || weatherText.includes('shower');
    const isCold = weatherText.includes('cold') || weatherText.includes('snow') || weatherText.includes('15°');
    const isHot = weatherText.includes('hot') || weatherText.includes('sunny') || weatherText.includes('25°') || weatherText.includes('30°');

    const clothingItems: PackingItem[] = [
      { id: 'p-c1', name: `${days}x Tops / Breathable Shirts`, packed: false, essential: true, category: 'Clothing & Footwear' },
      { id: 'p-c2', name: `${Math.min(days, 5)}x Comfortable Pants / Shorts`, packed: false, essential: true, category: 'Clothing & Footwear' },
      { id: 'p-c3', name: 'Ergonomic Walking Shoes', packed: false, essential: true, category: 'Clothing & Footwear' },
    ];

    if (isRainy) {
      clothingItems.push({ id: 'p-c4', name: 'Compact Windproof Umbrella & Rain Poncho', packed: false, essential: true, category: 'Clothing & Footwear' });
    }
    if (isCold) {
      clothingItems.push({ id: 'p-c5', name: 'Thermal Base Layers & Insulated Fleece', packed: false, essential: true, category: 'Clothing & Footwear' });
    }
    if (isHot) {
      clothingItems.push({ id: 'p-c6', name: 'UV-Blocking Sunglasses & Wide-Brim Hat', packed: false, essential: true, category: 'Clothing & Footwear' });
    }

    // Activity-specific gear
    const actText = plannedActivities.join(' ').toLowerCase();
    if (actText.includes('beach') || actText.includes('swim') || actText.includes('water')) {
      clothingItems.push({ id: 'p-c7', name: 'Quick-Dry Swimwear & Microfiber Towel', packed: false, essential: true, category: 'Clothing & Footwear' });
    }
    if (actText.includes('hike') || actText.includes('mountain') || actText.includes('trail')) {
      clothingItems.push({ id: 'p-c8', name: 'Trekking Socks & Moisture-Wicking Layers', packed: false, essential: true, category: 'Clothing & Footwear' });
    }

    const techItems: PackingItem[] = [
      { id: 'p-t1', name: `Universal Power Adapter for ${dest}`, packed: false, essential: true, category: 'Electronics & Tech' },
      { id: 'p-t2', name: '10,000mAh High-Capacity Power Bank', packed: false, essential: true, category: 'Electronics & Tech' },
      { id: 'p-t3', name: 'Smartphone Chargers & Charging Cables', packed: false, essential: true, category: 'Electronics & Tech' },
      { id: 'p-t4', name: 'Noise-Canceling Headphones / Earbuds', packed: false, essential: false, category: 'Electronics & Tech' },
    ];

    const healthItems: PackingItem[] = [
      { id: 'p-h1', name: 'Passport, Visa & Digital Document Copies', packed: false, essential: true, category: 'Documents & Health' },
      { id: 'p-h2', name: 'Broad-Spectrum SPF 50+ Sunscreen', packed: false, essential: true, category: 'Documents & Health' },
      { id: 'p-h3', name: 'Personal First Aid Kit & Travel Meds', packed: false, essential: true, category: 'Documents & Health' },
      { id: 'p-h4', name: 'Hydrating Lip Balm & Refillable Water Bottle', packed: false, essential: false, category: 'Documents & Health' },
    ];

    return [
      { category: 'Clothing & Footwear', items: clothingItems },
      { category: 'Electronics & Tech', items: techItems },
      { category: 'Documents & Health', items: healthItems },
    ];
  };

  const handleGenerateAIPacking = async () => {
    setLoading(true);
    setAiSourceNotice(null);

    // If offline, generate directly with smart offline engine
    if (isOffline) {
      setTimeout(() => {
        const offlineList = generateLocalOfflineList();
        onUpdateTrip({ ...activeTrip, packingCategories: offlineList });
        setAiSourceNotice('Generated via Smart Offline Travel Engine (No internet needed)');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/ai/packing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: activeTrip.destination,
          days: activeTrip.totalDays,
          weather: climateSummary,
          activities: displayActivities,
          interests: activeTrip.interests,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API route returned non-JSON.');
      }
      const data = await res.json();
      if (data.success && data.packingList?.categories) {
        const generatedCats: PackingCategory[] = data.packingList.categories.map((c: any) => ({
          category: c.category,
          items: c.items.map((i: any, idx: number) => ({
            id: 'item-' + Date.now() + '-' + idx,
            name: i.name,
            packed: false,
            essential: i.essential || false,
            category: c.category,
          })),
        }));
        onUpdateTrip({ ...activeTrip, packingCategories: generatedCats });
        setAiSourceNotice('Generated via Live Gemini Multi-Agent Intelligence');
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      // Local fallback packing generator
      const offlineList = generateLocalOfflineList();
      onUpdateTrip({ ...activeTrip, packingCategories: offlineList });
      setAiSourceNotice('Generated via Smart Offline Travel Engine');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: 'item-' + Date.now(),
      name: newItemName,
      packed: false,
      essential: false,
      category: selectedCategory,
    };

    let foundCat = false;
    const updatedCategories = activeTrip.packingCategories.map((cat) => {
      if (cat.category === selectedCategory) {
        foundCat = true;
        return { ...cat, items: [...cat.items, newItem] };
      }
      return cat;
    });

    if (!foundCat) {
      updatedCategories.push({ category: selectedCategory, items: [newItem] });
    }

    onUpdateTrip({ ...activeTrip, packingCategories: updatedCategories });
    setNewItemName('');
  };

  const handleExportOfflineChecklist = () => {
    const lines = [
      `==================================================`,
      `  OFFLINE PACKING CHECKLIST: ${activeTrip.title.toUpperCase()}`,
      `  Destination: ${activeTrip.destination}`,
      `  Duration: ${activeTrip.totalDays} Days`,
      `  Analyzed Climate: ${climateSummary}`,
      `==================================================\n`,
    ];

    activeTrip.packingCategories.forEach((cat) => {
      lines.push(`[ ${cat.category.toUpperCase()} ]`);
      cat.items.forEach((item) => {
        const status = item.packed ? '[x]' : '[ ]';
        const tag = item.essential ? ' *(ESSENTIAL)*' : '';
        lines.push(`  ${status} ${item.name}${tag}`);
      });
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Packing_List_${activeTrip.destination.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Network / Offline Banner Prompt */}
      {isOffline && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-amber-100">You are currently in Offline Mode</p>
              <p className="text-amber-300/80 mt-0.5">
                Don't worry! Your packing checklist is saved locally on your device. The Smart AI Packing generator can run offline using built-in travel logic.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportOfflineChecklist}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl shrink-0 transition"
          >
            <Download className="h-3.5 w-3.5" /> Export TXT
          </button>
        </div>
      )}

      {/* Header & Main AI Analysis Widget */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
              <Package className="h-4 w-4" /> Smart AI Packing Copilot
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Climate, Destination & Activity Packing Generator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Trip: <span className="text-slate-200 font-semibold">{activeTrip.title}</span> ({activeTrip.totalDays} Days) • {allItems.length} Total Items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOffline(!isOffline)}
              title="Toggle simulated offline mode"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border transition ${
                isOffline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isOffline ? <WifiOff className="h-3.5 w-3.5 text-amber-400" /> : <Wifi className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isOffline ? 'Offline Mode' : 'Online Mode'}</span>
            </button>

            <button
              onClick={handleExportOfflineChecklist}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>Export List</span>
            </button>

            <button
              onClick={handleGenerateAIPacking}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-900/20 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>Generate AI Packing List</span>
            </button>
          </div>
        </div>

        {/* AI Analyzed Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Luggage className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Destination & Duration</p>
              <p className="text-xs font-bold text-white mt-0.5">{activeTrip.destination}</p>
              <p className="text-[11px] text-slate-400">{activeTrip.totalDays} Days • Persona: {activeTrip.travelerPersona || 'Standard'}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <CloudSun className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Analyzed Climate</p>
              <p className="text-xs font-bold text-amber-300 mt-0.5">{climateSummary}</p>
              <p className="text-[11px] text-slate-400">Tailors layers, outerwear & UV protection</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Planned Activities</p>
              <p className="text-xs font-bold text-purple-300 mt-0.5 truncate max-w-[220px]">
                {displayActivities.join(', ')}
              </p>
              <p className="text-[11px] text-slate-400">Gear matched to itinerary highlights</p>
            </div>
          </div>
        </div>

        {aiSourceNotice && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{aiSourceNotice}</span>
          </div>
        )}
      </div>

      {/* Progress Meter */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Packing Progress ({packedCount} / {allItems.length} Packed)</span>
          <span className="font-mono text-purple-400 font-bold">{progressPercent}% Ready</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Manual Add Quick Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom item (e.g. Toothbrush, Camera charger, Power strip)..."
          className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-purple-500 transition"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-purple-500 transition"
        >
          <option value="Essentials & Tech">Essentials & Tech</option>
          <option value="Clothing & Footwear">Clothing & Footwear</option>
          <option value="Toiletries & Meds">Toiletries & Meds</option>
          <option value="Documents">Documents</option>
        </select>
        <button
          onClick={handleAddItem}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Packing Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTrip.packingCategories.map((cat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{cat.category}</h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {cat.items.filter((i) => i.packed).length}/{cat.items.length}
              </span>
            </div>

            <div className="space-y-2">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTogglePacked(item.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                    item.packed
                      ? 'bg-purple-950/20 border-purple-900/50 text-slate-400 line-through'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.packed ? (
                      <CheckSquare className="h-4 w-4 text-purple-400 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <span>{item.name}</span>
                  </div>

                  {item.essential && (
                    <span className="text-[10px] font-bold text-rose-400 uppercase px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                      Essential
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

