import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Trophy, Flame } from 'lucide-react';

interface CircularProgressProps {
  completedCount: number;
  totalCount: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  completedCount,
  totalCount,
  size = 130,
  strokeWidth = 10,
  title = "Itinerary Progress",
  subtitle = "Completed Activities",
  className = "",
}) => {
  const percentage = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Motivational message based on percentage
  const getMotivationalMessage = () => {
    if (totalCount === 0) return { text: "Add activities to track progress!", icon: Sparkles, color: "text-slate-400" };
    if (percentage === 0) return { text: "Your adventure awaits! Mark items as you explore.", icon: Sparkles, color: "text-cyan-400" };
    if (percentage < 30) return { text: "Off to a fantastic start! Safe travels!", icon: Flame, color: "text-amber-400" };
    if (percentage < 60) return { text: "Great momentum! Keep exploring!", icon: Flame, color: "text-amber-400" };
    if (percentage < 100) return { text: "Over halfway there! You're crushing your trip goals!", icon: Sparkles, color: "text-cyan-400" };
    return { text: "Incredible! 100% of itinerary completed! 🎉", icon: Trophy, color: "text-emerald-400 font-bold" };
  };

  const motivation = getMotivationalMessage();
  const MotivationIcon = motivation.icon;

  return (
    <div className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col items-center sm:flex-row sm:items-center justify-between gap-6 ${className}`}>
      {/* Subtle Background Glow */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Circular Progress Graphic */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
              <stop offset="50%" stopColor="#3b82f6" /> {/* blue-500 */}
              <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b" // slate-800
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Progress Stroke */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#circleGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        {/* Center Text Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            key={percentage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black text-white font-mono tracking-tight"
          >
            {percentage}%
          </motion.span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Done
          </span>
        </div>
      </div>

      {/* Information & Motivational Message */}
      <div className="space-y-2 flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-extrabold text-white">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
            {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
          </span>
          <span className="text-xs text-slate-400">activities checked off</span>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Motivational Banner */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-300 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl">
          <MotivationIcon className={`h-4 w-4 shrink-0 ${motivation.color}`} />
          <p className="truncate font-medium">{motivation.text}</p>
        </div>
      </div>
    </div>
  );
};
