import React, { useState } from 'react';
import { Trip, PackingCategory, PackingItem } from '../types';
import { Package, CheckSquare, Square, Sparkles, Plus, Loader2 } from 'lucide-react';

interface PackingViewProps {
  activeTrip: Trip | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const PackingView: React.FC<PackingViewProps> = ({ activeTrip, onUpdateTrip }) => {
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Essentials & Tech');

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

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

  const handleGenerateAIPacking = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/packing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: activeTrip.destination,
          days: activeTrip.totalDays,
          weather: 'Sunny 24°C',
          activities: ['Walking tours', 'Temple visits', 'Ramen dining'],
        }),
      });
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
      }
    } catch (e) {
      console.error(e);
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

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Package className="h-4 w-4" /> Smart Packing Agent
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Weather & Duration Packing Checklist</h1>
          <p className="text-xs text-slate-400 mt-1">
            Trip: {activeTrip.title} • {allItems.length} total items
          </p>
        </div>

        <button
          onClick={handleGenerateAIPacking}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>Generate AI Packing List</span>
        </button>
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
          placeholder="Add custom item (e.g. Toothbrush, Camera charger)..."
          className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none"
        >
          <option value="Essentials & Tech">Essentials & Tech</option>
          <option value="Clothing & Footwear">Clothing & Footwear</option>
          <option value="Toiletries & Meds">Toiletries & Meds</option>
          <option value="Documents">Documents</option>
        </select>
        <button
          onClick={handleAddItem}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Packing Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTrip.packingCategories.map((cat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">{cat.category}</h3>

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
