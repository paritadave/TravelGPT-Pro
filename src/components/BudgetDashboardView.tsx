import React, { useState } from 'react';
import { Trip, Expense } from '../types';
import {
  Wallet,
  DollarSign,
  Plus,
  TrendingDown,
  Sparkles,
  ArrowRightLeft,
  PieChart,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface BudgetDashboardViewProps {
  activeTrip: Trip | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
  currency: string;
}

export const BudgetDashboardView: React.FC<BudgetDashboardViewProps> = ({
  activeTrip,
  onUpdateTrip,
  currency,
}) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('45');
  const [category, setCategory] = useState<Expense['category']>('food');

  // Currency Converter State
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('JPY');
  const [convertAmount, setConvertAmount] = useState('100');

  if (!activeTrip) {
    return <div className="p-8 text-center text-slate-400">Please select an active trip.</div>;
  }

  const totalBudget = activeTrip.budget;
  const totalSpent = activeTrip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const percentSpent = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  const categoryTotals: Record<string, number> = {
    flights: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    transit: 0,
    other: 0,
  };

  activeTrip.expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleAddExpense = () => {
    if (!title.trim()) return;

    const newExp: Expense = {
      id: 'exp-' + Date.now(),
      title,
      amount: parseFloat(amount) || 0,
      category,
      currency,
      date: new Date().toISOString().split('T')[0],
      agentVerified: true,
    };

    onUpdateTrip({
      ...activeTrip,
      expenses: [...activeTrip.expenses, newExp],
    });

    setTitle('');
    setShowAddExpense(false);
  };

  // Rates approximation
  const exchangeRates: Record<string, number> = {
    USD_JPY: 154.5,
    JPY_USD: 0.0065,
    USD_EUR: 0.92,
    EUR_USD: 1.09,
    EUR_JPY: 168.0,
  };

  const getConvertedVal = () => {
    const val = parseFloat(convertAmount) || 0;
    if (convertFrom === convertTo) return val;
    const pair = `${convertFrom}_${convertTo}`;
    const rate = exchangeRates[pair] || 1;
    return (val * rate).toFixed(2);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Wallet className="h-4 w-4" /> Budget Optimizer Agent
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Financial Intelligence & Expenses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Trip: {activeTrip.title} • Target Budget: ${totalBudget} {currency}
          </p>
        </div>

        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="h-4 w-4" /> Log Expense
        </button>
      </div>

      {/* Budget Meter Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Total Spent</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                ${totalSpent}{' '}
                <span className="text-sm font-normal text-slate-400">/ ${totalBudget} {currency}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Remaining Budget</div>
              <div className={`text-xl font-bold font-mono mt-1 ${totalBudget - totalSpent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                ${totalBudget - totalSpent} {currency}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Spent {percentSpent}%</span>
              <span>Target Limit</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentSpent > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                }`}
                style={{ width: `${percentSpent}%` }}
              ></div>
            </div>
          </div>

          {/* Category Breakdown Progress */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-cyan-400" /> Spending by Category
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(categoryTotals).map(([cat, val]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <div className="text-[11px] uppercase text-slate-400 font-semibold">{cat}</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">${val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Currency Converter Tool Widget */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <ArrowRightLeft className="h-4 w-4" /> Live Currency Converter
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400">Amount</label>
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400">From</label>
                <select
                  value={convertFrom}
                  onChange={(e) => setConvertFrom(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2 outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">To</label>
                <select
                  value={convertTo}
                  onChange={(e) => setConvertTo(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2 outline-none"
                >
                  <option value="JPY">JPY (¥)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <div className="text-xs text-slate-400">Converted Value</div>
              <div className="text-xl font-bold text-cyan-300 font-mono mt-1">
                {getConvertedVal()} {convertTo}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Expense Ledger ({activeTrip.expenses.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">AI Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeTrip.expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white">{exp.title}</td>
                  <td className="p-3 uppercase text-[10px] text-cyan-400 font-mono">{exp.category}</td>
                  <td className="p-3 text-slate-400">{exp.date}</td>
                  <td className="p-3 text-right font-bold text-emerald-400 font-mono">${exp.amount}</td>
                  <td className="p-3 text-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Log New Expense</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Expense Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ramen Dinner"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400">Amount (${currency})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense['category'])}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                >
                  <option value="flights">Flights</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Food & Dining</option>
                  <option value="activities">Activities</option>
                  <option value="transit">Transit</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowAddExpense(false)} className="text-xs text-slate-400 px-3 py-2">
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
