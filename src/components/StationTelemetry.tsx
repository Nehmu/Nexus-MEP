import React from 'react';
import { ProductionStation, PipelineStage } from '../nexus/types';
import { 
  Activity, 
  Cpu, 
  Thermometer, 
  Zap, 
  Gauge, 
  User, 
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';

interface StationTelemetryProps {
  stations: ProductionStation[];
  stages: PipelineStage[];
  onToggleStationStatus: (stationId: string) => void;
}

export const StationTelemetry: React.FC<StationTelemetryProps> = ({
  stations,
  stages,
  onToggleStationStatus,
}) => {
  const getStage = (stageId: string) => stages.find(s => s.id === stageId);

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Shop Floor Machine Telemetry & Edge Nodes
          </h3>
          <p className="text-xs text-slate-400">
            Real-time IoT operational telemetry mapped to domain workflow stations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stations.map(station => {
          const stage = getStage(station.stageId);
          const isRunning = station.status === 'running';
          const isWarning = station.status === 'warning';
          const isIdle = station.status === 'idle';

          return (
            <div
              key={station.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isRunning ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse' :
                    isWarning ? 'bg-amber-400 shadow-md shadow-amber-400/50' :
                    'bg-slate-600'
                  }`} />
                  <span className="font-bold text-xs text-slate-200">
                    {station.name}
                  </span>
                </div>

                <button
                  onClick={() => onToggleStationStatus(station.id)}
                  className={`p-1 rounded text-xs transition ${
                    isRunning 
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                  title="Toggle station running/idle status"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Station Assigned Stage */}
              {stage && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3 px-2 py-1 bg-slate-950 rounded border border-slate-800/80">
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: stage.color }} 
                  />
                  <span>Assigned: <strong>{stage.code}</strong> - {stage.name}</span>
                </div>
              )}

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                {station.telemetry.temperatureC !== undefined && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                      <Thermometer className="w-3 h-3 text-rose-400" /> Temp
                    </div>
                    <span className="text-slate-200 font-bold">{station.telemetry.temperatureC}°C</span>
                  </div>
                )}

                {station.telemetry.powerKw !== undefined && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                      <Zap className="w-3 h-3 text-amber-400" /> Power
                    </div>
                    <span className="text-slate-200 font-bold">{station.telemetry.powerKw} kW</span>
                  </div>
                )}

                {station.telemetry.vibrationMmSec !== undefined && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                      <Gauge className="w-3 h-3 text-cyan-400" /> Vib
                    </div>
                    <span className="text-slate-200 font-bold">{station.telemetry.vibrationMmSec} mm/s</span>
                  </div>
                )}

                {station.telemetry.pressureBar !== undefined && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                      <Activity className="w-3 h-3 text-indigo-400" /> Press
                    </div>
                    <span className="text-slate-200 font-bold">{station.telemetry.pressureBar} bar</span>
                  </div>
                )}
              </div>

              {/* Operator */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" /> {station.currentOperator}
                </span>
                <span className="font-mono text-slate-400">
                  {station.speedRatingUnitsPerHour} u/hr
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
