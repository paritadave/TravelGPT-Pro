import React from 'react';
import {
  LayoutDashboard,
  Bot,
  CalendarDays,
  Plane,
  Building2,
  Wallet,
  Map,
  ShieldCheck,
  Package,
  BookOpen,
  User,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: undefined },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: '10 Agents' },
    { id: 'itinerary', label: 'Trip Itinerary', icon: CalendarDays, badge: undefined },
    { id: 'flights', label: 'Flight Intelligence', icon: Plane, badge: undefined },
    { id: 'hotels', label: 'Hotel Comparison', icon: Building2, badge: undefined },
    { id: 'budget', label: 'Budget & Expenses', icon: Wallet, badge: undefined },
    { id: 'map', label: 'Interactive Map', icon: Map, badge: undefined },
    { id: 'visa', label: 'Visa & Safety', icon: ShieldCheck, badge: undefined },
    { id: 'packing', label: 'Smart Packing', icon: Package, badge: undefined },
    { id: 'journal', label: 'AI Travel Journal', icon: BookOpen, badge: undefined },
    { id: 'profile', label: 'Profile & Memory', icon: User, badge: undefined },
    { id: 'simulator', label: 'Replanning Engine', icon: Zap, badge: 'Live AI' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto hidden md:flex">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Copilot Modules
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-slate-400 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>LangGraph Multi-Agent</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            10 specialized AI agents orchestrating flight, hotel, weather & budget data in real-time.
          </p>
        </div>
      </div>
    </aside>
  );
};
