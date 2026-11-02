import React, { useState } from 'react';
import { WorkOrder, PipelineStage, DynamicFieldDefinition } from '../nexus/types';
import { validateDynamicAttributes } from '../nexus/schemaEngine';
import { 
  X, 
  Save, 
  ArrowRight, 
  Clock, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  History
} from 'lucide-react';

interface BatchDetailModalProps {
  order: WorkOrder;
  stages: PipelineStage[];
  customFields: DynamicFieldDefinition[];
  onClose: () => void;
  onUpdateOrder: (updatedOrder: WorkOrder) => void;
  onAdvanceStage: (order: WorkOrder, targetStageId: string, notes?: string) => void;
}

export const BatchDetailModal: React.FC<BatchDetailModalProps> = ({
  order,
  stages,
  customFields,
  onClose,
  onUpdateOrder,
  onAdvanceStage,
}) => {
  const [attributes, setAttributes] = useState<Record<string, any>>({ ...order.dynamicAttributes });
  const [completedQty, setCompletedQty] = useState(order.completedQuantity);
  const [scrapQty, setScrapQty] = useState(order.scrapQuantity);
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentStageIdx = stages.findIndex(s => s.id === order.currentStageId);
  const currentStage = stages[currentStageIdx];
  const nextStage = stages[currentStageIdx + 1];

  const validation = validateDynamicAttributes(
    attributes,
    customFields,
    currentStage?.requiredFieldKeys
  );

  const handleFieldChange = (key: string, value: any) => {
    setAttributes(prev => ({
      ...prev,
      [key]: value,
    }));
    setSaveSuccess(false);
  };

  const handleSaveAttributes = () => {
    const updated: WorkOrder = {
      ...order,
      dynamicAttributes: attributes,
      completedQuantity: Number(completedQty),
      scrapQuantity: Number(scrapQty),
    };
    onUpdateOrder(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAdvance = () => {
    if (!nextStage) return;
    if (!validation.valid) return;
    
    // First commit attributes
    const updated: WorkOrder = {
      ...order,
      dynamicAttributes: attributes,
      completedQuantity: Number(completedQty),
      scrapQuantity: Number(scrapQty),
    };
    onAdvanceStage(updated, nextStage.id, advanceNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-batch-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                {order.orderNumber}
              </span>
              <span className="text-slate-400 text-xs font-mono">{order.batchLot}</span>
              <span className="text-xs px-2 py-0.5 rounded uppercase font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {order.priority}
              </span>
            </div>
            <h2 id="modal-batch-title" className="text-base sm:text-lg font-bold text-white mt-1">
              {order.productName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Current Stage Status Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Active Stage</span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: currentStage?.color || '#6366f1' }}
                />
                <span className="text-sm font-bold text-white font-mono">
                  {currentStage?.code} — {currentStage?.name}
                </span>
              </div>
            </div>

            {/* Target vs Completed Inputs */}
            <div className="flex items-center gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Completed Qty</label>
                <input
                  type="number"
                  value={completedQty}
                  onChange={e => setCompletedQty(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono w-24 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Scrap Qty</label>
                <input
                  type="number"
                  value={scrapQty}
                  onChange={e => setScrapQty(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-amber-300 font-mono w-20 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Target</span>
                <span className="font-mono text-slate-300 font-bold py-1 inline-block">
                  {order.targetQuantity} units
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Attributes Grid (Domain-Agnostic JSONB Payload) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Dynamic Process Attributes (JSONB Payload)
                </h3>
                <p className="text-xs text-slate-400">
                  Schema-validated manufacturing parameters for this production run
                </p>
              </div>

              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Attributes Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.map(field => {
                const val = attributes[field.key];
                const error = validation.errors[field.key];
                const isStageReq = currentStage?.requiredFieldKeys?.includes(field.key);

                return (
                  <div 
                    key={field.id}
                    className={`bg-slate-950/70 border rounded-xl p-3.5 transition ${
                      error ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{field.label}</span>
                        {(field.required || isStageReq) && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            {isStageReq ? '(Stage Required)' : '*'}
                          </span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {field.type}
                      </span>
                    </div>

                    {field.description && (
                      <p className="text-[11px] text-slate-400 mb-2">{field.description}</p>
                    )}

                    {/* Dynamic Field Inputs based on type */}
                    {field.type === 'select' && field.options ? (
                      <select
                        value={val !== undefined ? String(val) : ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Select option --</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={e => handleFieldChange(field.key, e.target.checked)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900"
                        />
                        <span className="text-xs text-slate-300">Verified / Checked</span>
                      </label>
                    ) : field.type === 'number' || field.type === 'metric' ? (
                      <div className="relative">
                        <input
                          type="number"
                          value={val !== undefined ? val : ''}
                          onChange={e => handleFieldChange(field.key, e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder={field.unit ? `Enter ${field.unit}` : '0'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                        />
                        {field.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                            {field.unit}
                          </span>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={val !== undefined ? String(val) : ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    )}

                    {error && (
                      <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-1.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleSaveAttributes}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Attributes</span>
              </button>
            </div>
          </div>

          {/* Advance Stage Control */}
          {nextStage && (
            <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> Advance Workflow to Next Stage
                </h4>
                <span className="text-xs font-mono text-cyan-300">
                  Target: {nextStage.code} — {nextStage.name}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Operator Handover Note / Sign-off
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Optical inspection complete, batch handed to testing"
                    value={advanceNotes}
                    onChange={e => setAdvanceNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleAdvance}
                  disabled={!validation.valid}
                  className={`w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    validation.valid
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Advance to {nextStage.code}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {!validation.valid && (
                <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please satisfy all prerequisite dynamic attributes above before moving to next stage.
                </p>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Stage Transition Audit Trail
            </h3>

            <div className="border-l-2 border-slate-800 ml-3 pl-4 space-y-3">
              {order.history.map((log, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-950" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                    <span className="text-slate-300 font-semibold">
                      Transitioned to stage: <strong className="text-cyan-400">{log.toStageId}</strong>
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">by {log.operator}</span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 bg-slate-950 p-2 rounded border border-slate-800">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
