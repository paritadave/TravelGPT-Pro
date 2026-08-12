import React, { useState } from 'react';
import { Trip, JournalEntry } from '../types';
import { BookOpen, Sparkles, MapPin, Plus, Loader2 } from 'lucide-react';

interface JournalViewProps {
  activeTrip: Trip | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ activeTrip, onUpdateTrip }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('Inspired');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

  const handleGenerateAndSaveEntry = async () => {
    if (!title.trim() || !notes.trim()) return;
    setIsGenerating(true);

    let content = notes;
    try {
      const res = await fetch('/api/ai/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location || activeTrip.destination,
          date: new Date().toISOString().split('T')[0],
          bulletNotes: notes,
          mood,
        }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API route returned non-JSON.');
      }
      const data = await res.json();
      if (data.success && data.story) {
        content = data.story;
      }
    } catch {
      const loc = location || activeTrip.destination;
      content = `The air in ${loc} carried a distinct magic today. ${notes}\n\nWalking through the historic streets with a feeling of pure ${mood.toLowerCase()}, every corner offered something memorable. From the local sights to the rich aromas of street side cafes, this day will remain a highlight of our journey.`;
    } finally {
      setIsGenerating(false);
    }

    const newEntry: JournalEntry = {
      id: 'j-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title,
      content,
      location: location || activeTrip.destination,
      mood,
      photoUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80',
      tags: ['TravelLog', mood],
    };

    onUpdateTrip({
      ...activeTrip,
      journalEntries: [newEntry, ...activeTrip.journalEntries],
    });

    setTitle('');
    setNotes('');
    setLocation('');
    setShowModal(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <BookOpen className="h-4 w-4" /> Travel Writer & Memory Agent
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">AI Travel Journal & Memories</h1>
          <p className="text-xs text-slate-400 mt-1">
            Trip: {activeTrip.title} • {activeTrip.journalEntries.length} Saved Entries
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="h-4 w-4" /> Write Journal Entry
        </button>
      </div>

      {/* Journal Cards List */}
      <div className="space-y-6">
        {activeTrip.journalEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No memories recorded for this trip yet. Click "Write Journal Entry" to capture your moments!
          </div>
        ) : (
          activeTrip.journalEntries.map((entry) => (
            <div key={entry.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-cyan-400 font-mono">{entry.date}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{entry.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {entry.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    Mood: {entry.mood}
                  </span>
                </div>
              </div>

              {entry.photoUrl && (
                <div className="h-64 rounded-xl overflow-hidden relative">
                  <img src={entry.photoUrl} alt={entry.title} className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {entry.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Capture Travel Moment</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Entry Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Shibuya Crossing Sunset"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Location Spot</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Shibuya, Tokyo"
                    className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                  >
                    <option value="Inspired">Inspired</option>
                    <option value="Awestruck">Awestruck</option>
                    <option value="Relaxed">Relaxed</option>
                    <option value="Adventurous">Adventurous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400">Bullet Notes / Memories (AI will polish into story)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Great coffee at Fuglen, walked down Yoyogi park, saw neon lights at Shibuya..."
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none h-28"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="text-xs text-slate-400 px-3 py-2">
                Cancel
              </button>
              <button
                onClick={handleGenerateAndSaveEntry}
                disabled={isGenerating}
                className="text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{isGenerating ? 'AI Writing Story...' : 'Save AI Story'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
