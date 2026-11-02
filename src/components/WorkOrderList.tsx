import React, { useState } from 'react';
import { WorkOrder, PipelineStage, DynamicFieldDefinition } from '../nexus/types';
import { Search, Eye, Filter, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  stages: PipelineStage[];
  customFields: DynamicFieldDefinition[];
  onSelectOrder: (order: WorkOrder) => void;
  onAdvanceOrder: (order: WorkOrder, targetStageId: string) => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
  workOrders,
  stages,
  customFields,
  onSelectOrder,
  onAdvanceOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('ALL');

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.batchLot.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === 'ALL' || order.currentStageId === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-8">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Product, Batch Lot..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Pipeline Stages ({workOrders.length})</option>
            {stages.map(stg => (
              <option key={stg.id} value={stg.id}>
                {stg.code} - {stg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Order / Batch</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Current Stage</th>
              <th className="py-3 px-4">Units Progress</th>
              <th className="py-3 px-4">Dynamic Attributes (JSONB)</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No work orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const currentStageIdx = stages.findIndex(s => s.id === order.currentStageId);
                const currentStage = stages[currentStageIdx];
                const nextStage = stages[currentStageIdx + 1];

                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-cyan-400">{order.orderNumber}</div>
                      <div className="font-mono text-[10px] text-slate-500">{order.batchLot}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-100">
                      {order.productName}
                    </td>

                    <td className="py-3 px-4">
                      {currentStage ? (
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentStage.color }}
                          />
                          <span className="font-semibold text-slate-200">
                            {currentStage.code}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {currentStage.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unknown Stage</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span>{order.completedQuantity} / {order.targetQuantity}</span>
                        {order.scrapQuantity > 0 && (
                          <span className="text-amber-400 font-mono">({order.scrapQuantity} scrap)</span>
                        )}
                      </div>
                      <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${(order.completedQuantity / order.targetQuantity) * 100}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Object.entries(order.dynamicAttributes).slice(0, 3).map(([key, val]) => (
                          <span 
                            key={key} 
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            {key}: <strong className="text-cyan-400">{String(val)}</strong>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        order.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {order.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Inspect dynamic attributes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {nextStage && (
                          <button
                            onClick={() => onAdvanceOrder(order, nextStage.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
                            title={`Advance to ${nextStage.name}`}
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
