import React, { useState, useEffect } from 'react';
import { INDUSTRY_PRESETS } from './nexus/presets';
import { 
  IndustryPreset, 
  WorkOrder, 
  PipelineStage, 
  DynamicFieldDefinition, 
  ProductionStation 
} from './nexus/types';
import { calculateMesMetrics, canTransitionStage } from './nexus/schemaEngine';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { PipelineBoard } from './components/PipelineBoard';
import { WorkOrderList } from './components/WorkOrderList';
import { StationTelemetry } from './components/StationTelemetry';
import { BatchDetailModal } from './components/BatchDetailModal';
import { SchemaArchitectModal } from './components/SchemaArchitectModal';
import { NewWorkOrderModal } from './components/NewWorkOrderModal';
import { 
  Layers, 
  Sliders, 
  Cpu, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<IndustryPreset>(INDUSTRY_PRESETS[0]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INDUSTRY_PRESETS[0].sampleWorkOrders);
  const [stages, setStages] = useState<PipelineStage[]>(INDUSTRY_PRESETS[0].stages);
  const [customFields, setCustomFields] = useState<DynamicFieldDefinition[]>(INDUSTRY_PRESETS[0].customFields);
  const [stations, setStations] = useState<ProductionStation[]>(INDUSTRY_PRESETS[0].stations);

  // Active view tab ('pipeline' | 'orders' | 'stations')
  const [activeView, setActiveView] = useState<'pipeline' | 'orders' | 'stations'>('pipeline');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [isSchemaArchitectOpen, setIsSchemaArchitectOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // User feedback toast banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Switch facility domain preset
  const handleSelectPreset = (presetId: string) => {
    const selected = INDUSTRY_PRESETS.find(p => p.id === presetId);
    if (!selected) return;
    setCurrentPreset(selected);
    setStages(selected.stages);
    setCustomFields(selected.customFields);
    setWorkOrders(selected.sampleWorkOrders);
    setStations(selected.stations);
    setSelectedOrder(null);
    showToast(`Switched facility domain to: ${selected.name}`, 'info');
  };

  // Advance work order stage
  const handleAdvanceOrder = (order: WorkOrder, targetStageId: string, notes?: string) => {
    const currentStageIdx = stages.findIndex(s => s.id === order.currentStageId);
    const currentStage = stages[currentStageIdx];
    const targetStage = stages.find(s => s.id === targetStageId);

    if (!targetStage) return;

    // Run prerequisite check
    const check = canTransitionStage(order, targetStage, currentStage, customFields);
    if (!check.allowed) {
      showToast(check.reason || 'Transition requirements not met.', 'warning');
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedHistory = [
      ...order.history,
      {
        timestamp,
        fromStageId: currentStage?.id || null,
        toStageId: targetStage.id,
        operator: 'Line Operator #4',
        notes: notes || `Advanced to ${targetStage.name} (${targetStage.code})`,
      },
    ];

    // If reached last stage, mark completed quantity
    const isLastStage = stages[stages.length - 1].id === targetStage.id;
    const completedQty = isLastStage ? order.targetQuantity - order.scrapQuantity : order.completedQuantity;

    const updatedOrder: WorkOrder = {
      ...order,
      currentStageId: targetStage.id,
      completedQuantity: completedQty,
      history: updatedHistory,
    };

    setWorkOrders(prev => prev.map(w => (w.id === order.id ? updatedOrder : w)));
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(updatedOrder);
    }

    showToast(`Batch ${order.orderNumber} advanced to ${targetStage.name}`, 'success');
  };

  // Update order attributes
  const handleUpdateOrder = (updatedOrder: WorkOrder) => {
    setWorkOrders(prev => prev.map(w => (w.id === updatedOrder.id ? updatedOrder : w)));
    setSelectedOrder(updatedOrder);
    showToast(`Work Order ${updatedOrder.orderNumber} attributes updated.`, 'success');
  };

  // Create new work order
  const handleCreateOrder = (newOrder: WorkOrder) => {
    setWorkOrders(prev => [newOrder, ...prev]);
    setIsNewOrderOpen(false);
    showToast(`Work Order ${newOrder.orderNumber} dispatched to floor!`, 'success');
  };

  // Update dynamic schema and stages from Schema Studio
  const handleUpdateSchema = (updatedFields: DynamicFieldDefinition[], updatedStages: PipelineStage[]) => {
    setCustomFields(updatedFields);
    setStages(updatedStages);
    showToast('Dynamic schema & workflow pipeline updated!', 'success');
  };

  // Toggle station status
  const handleToggleStationStatus = (stationId: string) => {
    setStations(prev =>
      prev.map(st => {
        if (st.id === stationId) {
          const nextStatus = st.status === 'running' ? 'idle' : 'running';
          return { ...st, status: nextStatus };
        }
        return st;
      })
    );
  };

  // Simulate an IoT telemetry pulse
  const handleSimulateTick = () => {
    setStations(prev =>
      prev.map(st => {
        if (st.status !== 'running') return st;
        const tempDelta = (Math.random() - 0.5) * 1.5;
        const vibDelta = (Math.random() - 0.5) * 0.05;
        const powDelta = (Math.random() - 0.5) * 0.8;

        return {
          ...st,
          telemetry: {
            ...st.telemetry,
            temperatureC: st.telemetry.temperatureC ? Number((st.telemetry.temperatureC + tempDelta).toFixed(1)) : undefined,
            vibrationMmSec: st.telemetry.vibrationMmSec ? Number(Math.max(0.01, st.telemetry.vibrationMmSec + vibDelta).toFixed(2)) : undefined,
            powerKw: st.telemetry.powerKw ? Number(Math.max(0.5, st.telemetry.powerKw + powDelta).toFixed(1)) : undefined,
          },
        };
      })
    );
    showToast('IoT Telemetry heartbeat broadcasted to all active shop stations.', 'info');
  };

  const metrics = calculateMesMetrics(workOrders, stations);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce-short">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' :
            toast.type === 'warning' ? 'bg-amber-950/90 text-amber-300 border-amber-500/40' :
            'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentPreset={currentPreset}
        allPresets={INDUSTRY_PRESETS}
        onSelectPreset={handleSelectPreset}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenSchemaArchitect={() => setIsSchemaArchitectOpen(true)}
        onSimulateTick={handleSimulateTick}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Industry Facility Profile Banner */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {currentPreset.category}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Schema: <span className="text-cyan-400">{customFields.length} dynamic attributes</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentPreset.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {currentPreset.tagline}. Dynamic workflow routing with adaptive validation rules and zero hardcoded database tables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSchemaArchitectOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect JSONB Schema</span>
            </button>
          </div>
        </div>

        {/* Global Shop Floor KPIs */}
        <KpiMetrics metrics={metrics} unitNoun={currentPreset.unitNoun} />

        {/* Main Workspace Views */}
        {activeView === 'pipeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Live Workflow Pipeline Board
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time batch stage progression with dynamic attribute requirement gates
                </p>
              </div>
            </div>

            <PipelineBoard
              stages={stages}
              workOrders={workOrders}
              customFields={customFields}
              onSelectOrder={setSelectedOrder}
              onAdvanceOrder={handleAdvanceOrder}
            />
          </div>
        )}

        {activeView === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100">
                  Domain Work Order Registry
                </h2>
                <p className="text-xs text-slate-400">
                  Full tabular ledger of production batches and JSONB dynamic parameter sets
                </p>
              </div>
            </div>

            <WorkOrderList
              workOrders={workOrders}
              stages={stages}
              customFields={customFields}
              onSelectOrder={setSelectedOrder}
              onAdvanceOrder={handleAdvanceOrder}
            />
          </div>
        )}

        {activeView === 'stations' && (
          <StationTelemetry
            stations={stations}
            stages={stages}
            onToggleStationStatus={handleToggleStationStatus}
          />
        )}

      </main>

      {/* Modals */}
      {selectedOrder && (
        <BatchDetailModal
          order={selectedOrder}
          stages={stages}
          customFields={customFields}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={handleUpdateOrder}
          onAdvanceStage={handleAdvanceOrder}
        />
      )}

      {isSchemaArchitectOpen && (
        <SchemaArchitectModal
          customFields={customFields}
          stages={stages}
          onClose={() => setIsSchemaArchitectOpen(false)}
          onUpdateSchema={handleUpdateSchema}
        />
      )}

      {isNewOrderOpen && (
        <NewWorkOrderModal
          stages={stages}
          customFields={customFields}
          unitNoun={currentPreset.unitNoun}
          onClose={() => setIsNewOrderOpen(false)}
          onCreateOrder={handleCreateOrder}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <p>Nexus EM • Domain-Agnostic MES Engine • Dynamic JSONB & State Machine Architecture</p>
      </footer>
    </div>
  );
}
