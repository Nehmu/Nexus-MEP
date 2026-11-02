import React from 'react';
import { IndustryPreset } from '../nexus/types';
import { 
  Factory, 
  Cpu, 
  Scissors, 
  FlaskConical, 
  Settings2, 
  PlusCircle, 
  Activity, 
  Radio,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentPreset: IndustryPreset;
  allPresets: IndustryPreset[];
  onSelectPreset: (presetId: string) => void;
  onOpenNewOrder: () => void;
  onOpenSchemaArchitect: () => void;
  onSimulateTick: () => void;
  activeView: 'pipeline' | 'orders' | 'stations';
  setActiveView: (view: 'pipeline' | 'orders' | 'stations') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  allPresets,
  onSelectPreset,
  onOpenNewOrder,
  onOpenSchemaArchitect,
  onSimulateTick,
  activeView,
  setActiveView,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-4 h-4" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />;
      default:
        return <Factory className="w-4 h-4" />;
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Factory className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  NEXUS <span className="text-cyan-400 font-extrabold">EM</span>
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold">
                  Domain-Agnostic MES
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Dynamic Schema & Adaptive Workflow Execution Engine
              </p>
            </div>
          </div>

          {/* Industry Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium px-2 hidden md:inline">
              Facility Domain:
            </span>
            {allPresets.map(preset => {
              const isActive = preset.id === currentPreset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={preset.tagline}
                >
                  {getIcon(preset.icon)}
                  <span className="hidden lg:inline">{preset.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Controls & Modals */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateTick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Simulate IoT station telemetry pulse"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Telemetry Pulse</span>
            </button>

            <button
              onClick={onOpenSchemaArchitect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
              title="Open Dynamic Schema & Pipeline Architect"
            >
              <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Schema Studio</span>
            </button>

            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Work Order</span>
            </button>
          </div>
        </div>

        {/* View Navigation Bar */}
        <div className="flex items-center justify-between py-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                activeView === 'pipeline'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Adaptive Pipeline ({currentPreset.stages.length} Stages)
            </button>
            <button
              onClick={() => setActiveView('orders')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                activeView === 'orders'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-cyan-400" />
              Work Order Matrix
            </button>
            <button
              onClick={() => setActiveView('stations')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium ${
                activeView === 'stations'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Shop Floor Machines ({currentPreset.stations.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Engine: <strong className="text-slate-300">JSONB Dynamic V2</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>Unit: <strong className="text-cyan-300">{currentPreset.unitNoun}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
