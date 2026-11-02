import React, { useState } from 'react';
import { WorkOrder, PipelineStage, DynamicFieldDefinition } from '../nexus/types';
import { X, PlusCircle, Layers, Tag } from 'lucide-react';

interface NewWorkOrderModalProps {
  stages: PipelineStage[];
  customFields: DynamicFieldDefinition[];
  unitNoun: string;
  onClose: () => void;
  onCreateOrder: (order: WorkOrder) => void;
}

export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({
  stages,
  customFields,
  unitNoun,
  onClose,
  onCreateOrder,
}) => {
  const initialStage = stages[0];

  const [orderNumber, setOrderNumber] = useState(`WO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [productName, setProductName] = useState('');
  const [batchLot, setBatchLot] = useState(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [targetQuantity, setTargetQuantity] = useState<number>(100);
  const [priority, setPriority] = useState<WorkOrder['priority']>('normal');
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    customFields.forEach(f => {
      if (f.defaultValue !== undefined) {
        init[f.key] = f.defaultValue;
      }
    });
    return init;
  });

  const handleFieldChange = (key: string, value: any) => {
    setDynamicAttributes(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !initialStage) return;

    const newOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      orderNumber,
      productName,
      batchLot,
      currentStageId: initialStage.id,
      targetQuantity: Number(targetQuantity),
      completedQuantity: 0,
      scrapQuantity: 0,
      priority,
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      dynamicAttributes,
      history: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fromStageId: null,
          toStageId: initialStage.id,
          operator: 'Production Dispatcher',
          notes: 'Batch initiated via Nexus EM dynamic dispatcher.',
        },
      ],
    };

    onCreateOrder(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-new-wo-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 id="modal-new-wo-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              Dispatch New {unitNoun} Work Order
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Initializes workflow entry at stage: <strong className="text-cyan-300">{initialStage?.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Work Order #</label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Batch / Lot Identifier</label>
              <input
                type="text"
                value={batchLot}
                onChange={e => setBatchLot(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">Product / Assembly Name</label>
            <input
              type="text"
              placeholder="e.g. Avionics Inverter Subassembly / Alpine Outerwear Shell"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Target Quantity ({unitNoun}s)</label>
              <input
                type="number"
                min="1"
                value={targetQuantity}
                onChange={e => setTargetQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as WorkOrder['priority'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Initial Dynamic JSONB Attributes */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Initial Dynamic Attributes
            </h4>

            <div className="space-y-3">
              {customFields.slice(0, 4).map(field => (
                <div key={field.id} className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-xs text-slate-300 font-medium truncate">
                    {field.label}
                  </label>
                  <div className="col-span-2">
                    {field.type === 'select' && field.options ? (
                      <select
                        value={dynamicAttributes[field.key] || ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                      >
                        <option value="">-- Choose --</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={Boolean(dynamicAttributes[field.key])}
                        onChange={e => handleFieldChange(field.key, e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 h-4 w-4 bg-slate-950"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' || field.type === 'metric' ? 'number' : 'text'}
                        value={dynamicAttributes[field.key] !== undefined ? dynamicAttributes[field.key] : ''}
                        onChange={e => handleFieldChange(field.key, field.type === 'number' || field.type === 'metric' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                        placeholder={`Initial ${field.label}`}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition"
            >
              Dispatch Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
