import React, { useState } from 'react';
import { Persona } from '../types';
import { User, Brain, Shield, Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ProfileMemoryViewProps {
  selectedPersona: Persona;
  personas: Persona[];
  onChangePersona: (p: Persona) => void;
}

export const ProfileMemoryView: React.FC<ProfileMemoryViewProps> = ({
  selectedPersona,
  personas,
  onChangePersona,
}) => {
  const [memories, setMemories] = useState<string[]>([
    'Prefers non-stop morning flights leaving after 09:00 AM',
    'Needs high-speed WiFi and quiet co-working desk at hotel',
    'Loves specialty third-wave coffee shops within 5 min walking distance',
    'Prefers local public transit and metro IC cards over expensive taxis',
    'Dietary: Flexible pescatarian, open to local seafood and ramen',
  ]);

  const [newMemory, setNewMemory] = useState('');

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;
    setMemories([...memories, newMemory]);
    setNewMemory('');
  };

  const handleDeleteMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Brain className="h-4 w-4" /> Memory Agent & Traveler Profile
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Persistent Traveler Memory Log</h1>
          <p className="text-xs text-slate-400 mt-1">
            TravelGPT Pro learns your preferences across trips to tailor every recommendation.
          </p>
        </div>
      </div>

      {/* Active Persona Selector Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="h-4 w-4 text-cyan-400" /> Active Traveler Persona Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p) => {
            const isSelected = selectedPersona.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onChangePersona(p)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-cyan-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <p className="text-xs text-cyan-400 font-mono">{p.budgetLevel} Budget</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>

                {isSelected && (
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active Profile
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Log List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" /> Learned AI Memory Directives ({memories.length})
          </h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
            placeholder="Add new preference memory (e.g. Always request high floor room)..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none"
          />
          <button
            onClick={handleAddMemory}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-3 rounded-xl transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {memories.map((mem, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>{mem}</span>
              </div>
              <button
                onClick={() => handleDeleteMemory(i)}
                className="text-slate-500 hover:text-red-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
