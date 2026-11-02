import React from 'react';
import { 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Layers 
} from 'lucide-react';

interface KpiMetricsProps {
  metrics: {
    totalOrders: number;
    activeOrders: number;
    totalTarget: number;
    totalCompleted: number;
    totalScrap: number;
    yieldRate: number;
    scrapRate: number;
    stationAvailability: number;
    oee: number;
  };
  unitNoun: string;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ metrics, unitNoun }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* OEE Metric */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition" />
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Overall OEE</span>
          <Gauge className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.oee}%
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">Target 85%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.oee)}%` }}
          />
        </div>
      </div>

      {/* Yield Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">First-Pass Yield</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.yieldRate}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Good output</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.yieldRate)}%` }}
          />
        </div>
      </div>

      {/* Active WIP Batches */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Active WIP</span>
          <Layers className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
            {metrics.activeOrders}
          </span>
          <span className="text-[10px] text-slate-400">batches in line</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 truncate">
          Tracking {unitNoun}s
        </p>
      </div>

      {/* Scrap / Loss Rate */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Scrap Rate</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
            {metrics.scrapRate}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{metrics.totalScrap} units</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.scrapRate * 10)}%` }}
          />
        </div>
      </div>

      {/* Machine Availability */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Equipment Uptime</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.stationAvailability}%
          </span>
          <span className="text-[10px] text-slate-400">Ready</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${metrics.stationAvailability}%` }}
          />
        </div>
      </div>

      {/* Total Units Processed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Shift Completion</span>
          <TrendingUp className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-purple-300 tracking-tight">
            {metrics.totalCompleted}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">/ {metrics.totalTarget}</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${metrics.totalTarget > 0 ? (metrics.totalCompleted / metrics.totalTarget) * 100 : 0}%` }}
          />
        </div>
      </div>

    </div>
  );
};
