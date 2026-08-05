import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'cyan' }) {
  const variantStyles = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      glow: 'hover:shadow-cyan-500/10',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      trendBg: 'text-cyan-400 bg-cyan-500/10'
    },
    rose: {
      border: 'hover:border-rose-500/40',
      glow: 'hover:shadow-rose-500/10',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      trendBg: 'text-rose-400 bg-rose-500/10'
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      glow: 'hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      trendBg: 'text-emerald-400 bg-emerald-500/10'
    },
    amber: {
      border: 'hover:border-amber-500/40',
      glow: 'hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      trendBg: 'text-amber-400 bg-amber-500/10'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.cyan;

  return (
    <div className={`glass-card rounded-2xl p-5 transition-all duration-300 shadow-xl ${currentVariant.border} ${currentVariant.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${currentVariant.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {trend && (
          <span className={`px-2 py-0.5 rounded-md font-semibold font-mono text-[11px] ${currentVariant.trendBg}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
