import React from 'react';
import { PipelineStage, WorkOrder, DynamicFieldDefinition } from '../nexus/types';
import { 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  Eye, 
  Flame, 
  Tag
} from 'lucide-react';

interface PipelineBoardProps {
  stages: PipelineStage[];
  workOrders: WorkOrder[];
  customFields: DynamicFieldDefinition[];
  onSelectOrder: (order: WorkOrder) => void;
  onAdvanceOrder: (order: WorkOrder, targetStageId: string) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  stages,
  workOrders,
  customFields,
  onSelectOrder,
  onAdvanceOrder,
}) => {
  const getOrdersForStage = (stageId: string) => {
    return workOrders.filter(w => w.currentStageId === stageId);
  };

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> URGENT</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'normal':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">NORMAL</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">LOW</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-max items-start">
        {stages.map((stage, idx) => {
          const ordersInStage = getOrdersForStage(stage.id);
          const nextStage = stages[idx + 1];
          const isOverWip = stage.wipLimit && ordersInStage.length > stage.wipLimit;

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0 flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl p-3 shadow-md"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-800"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {stage.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-100 truncate max-w-[140px]">
                        {stage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> ~{stage.averageCycleMinutes}m cycle
                      </span>
                    </div>
                  </div>
                </div>

                {/* WIP Badge */}
                <div 
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isOverWip
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                  title={stage.wipLimit ? `WIP Limit: ${stage.wipLimit}` : 'No WIP limit'}
                >
                  {ordersInStage.length} {stage.wipLimit ? `/ ${stage.wipLimit}` : ''}
                </div>
              </div>

              {/* Stage Prerequisite Requirements Notice */}
              {stage.requiredFieldKeys && stage.requiredFieldKeys.length > 0 && (
                <div className="mb-2.5 px-2 py-1 bg-slate-950/60 rounded border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="truncate">Requires: {stage.requiredFieldKeys.join(', ')}</span>
                  <Tag className="w-2.5 h-2.5 text-cyan-400 ml-1 flex-shrink-0" />
                </div>
              )}

              {/* Work Order Cards */}
              <div className="space-y-3 min-h-[140px]">
                {ordersInStage.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 text-xs">
                    <span>Stage Empty</span>
                    <span className="text-[10px] text-slate-700">Awaiting WIP feed</span>
                  </div>
                ) : (
                  ordersInStage.map(order => {
                    // Check if required fields are satisfied
                    const missingFields = (stage.requiredFieldKeys || []).filter(
                      k => order.dynamicAttributes[k] === undefined || order.dynamicAttributes[k] === ''
                    );
                    const canAdvance = missingFields.length === 0 && Boolean(nextStage);

                    return (
                      <div
                        key={order.id}
                        className="bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 shadow-sm hover:shadow-indigo-500/5 transition group flex flex-col justify-between"
                      >
                        {/* Top info */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              {order.orderNumber}
                            </span>
                            {getPriorityBadge(order.priority)}
                          </div>

                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                            {order.productName}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                            <span className="font-mono text-[10px] text-slate-500">
                              {order.batchLot}
                            </span>
                            <span className="font-mono text-slate-300">
                              Qty: <strong>{order.targetQuantity}</strong>
                            </span>
                          </div>

                          {/* Dynamic JSONB Attributes Snapshot (Chips) */}
                          <div className="flex flex-wrap gap-1 mb-2.5">
                            {Object.entries(order.dynamicAttributes).slice(0, 3).map(([key, value]) => {
                              const fieldDef = customFields.find(f => f.key === key);
                              return (
                                <span
                                  key={key}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 truncate max-w-[150px]"
                                  title={`${fieldDef?.label || key}: ${String(value)}`}
                                >
                                  {key}: <strong className="text-cyan-300">{String(value)}</strong>
                                </span>
                              );
                            })}
                          </div>

                          {/* Missing Prerequisite Warning */}
                          {missingFields.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-2 bg-amber-500/10 p-1 rounded border border-amber-500/20">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">Fill {missingFields[0]} to advance</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2 mt-1">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 transition py-1 px-2 rounded hover:bg-slate-800"
                            title="Inspect dynamic attributes & logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {nextStage ? (
                            <button
                              onClick={() => onAdvanceOrder(order, nextStage.id)}
                              disabled={!canAdvance}
                              className={`flex items-center gap-1 text-[11px] font-semibold py-1 px-2.5 rounded transition ${
                                canAdvance
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                              }`}
                              title={
                                canAdvance
                                  ? `Advance to ${nextStage.name}`
                                  : `Prerequisites not met (${missingFields.join(', ')})`
                              }
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Final Stage
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
