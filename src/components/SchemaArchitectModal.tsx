import React, { useState } from 'react';
import { DynamicFieldDefinition, PipelineStage, FieldType } from '../nexus/types';
import { 
  X, 
  Plus, 
  Layers, 
  Code, 
  Trash2, 
  Check, 
  Settings2, 
  HelpCircle,
  Copy
} from 'lucide-react';

interface SchemaArchitectModalProps {
  customFields: DynamicFieldDefinition[];
  stages: PipelineStage[];
  onClose: () => void;
  onUpdateSchema: (fields: DynamicFieldDefinition[], stages: PipelineStage[]) => void;
}

export const SchemaArchitectModal: React.FC<SchemaArchitectModalProps> = ({
  customFields,
  stages,
  onClose,
  onUpdateSchema,
}) => {
  const [fields, setFields] = useState<DynamicFieldDefinition[]>([...customFields]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([...stages]);
  const [activeTab, setActiveTab] = useState<'fields' | 'stages' | 'json'>('fields');
  const [copied, setCopied] = useState(false);

  // New field state
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FieldType>('string');
  const [newRequired, setNewRequired] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [newMin, setNewMin] = useState<string>('');
  const [newMax, setNewMax] = useState<string>('');

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newLabel) return;

    const sanitizedKey = newKey.replace(/\s+/g, '_').toLowerCase();

    const created: DynamicFieldDefinition = {
      id: `custom_${Date.now()}`,
      key: sanitizedKey,
      label: newLabel,
      type: newType,
      required: newRequired,
      unit: newUnit || undefined,
      validationMin: newMin !== '' ? Number(newMin) : undefined,
      validationMax: newMax !== '' ? Number(newMax) : undefined,
    };

    const nextFields = [...fields, created];
    setFields(nextFields);
    onUpdateSchema(nextFields, pipelineStages);

    // Reset inputs
    setNewKey('');
    setNewLabel('');
    setNewUnit('');
    setNewMin('');
    setNewMax('');
    setNewRequired(false);
  };

  const handleDeleteField = (id: string) => {
    const nextFields = fields.filter(f => f.id !== id);
    setFields(nextFields);
    onUpdateSchema(nextFields, pipelineStages);
  };

  const handleCopyJson = () => {
    const payload = JSON.stringify({ fields, stages: pipelineStages }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-architect-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-cyan-400" />
              <h2 id="modal-architect-title" className="text-base sm:text-lg font-bold text-white">
                Nexus EM Schema & Workflow Architect Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Domain-agnostic dynamic data modeling: configure custom JSONB attributes and custom stages
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveTab('fields')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'fields'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Dynamic Attributes ({fields.length})
          </button>
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'stages'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Pipeline Stages ({pipelineStages.length})
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'json'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSONB Schema Blueprint
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'fields' && (
            <div className="space-y-6">
              {/* Add New Dynamic Field Form */}
              <form onSubmit={handleAddField} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Dynamic Attribute Definition
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Key Name (Identifier)</label>
                    <input
                      type="text"
                      placeholder="e.g. solder_paste_viscosity"
                      value={newKey}
                      onChange={e => setNewKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">UI Display Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Solder Paste Viscosity"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Data Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as FieldType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="string">String / Text</option>
                      <option value="number">Number</option>
                      <option value="metric">Metric (with unit)</option>
                      <option value="boolean">Boolean (Toggle)</option>
                      <option value="select">Dropdown Select</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Measurement Unit (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. cPs, °C, mm, bar"
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Min Threshold</label>
                    <input
                      type="number"
                      placeholder="Min limit"
                      value={newMin}
                      onChange={e => setNewMin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Max Threshold</label>
                    <input
                      type="number"
                      placeholder="Max limit"
                      value={newMax}
                      onChange={e => setNewMax(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={newRequired}
                        onChange={e => setNewRequired(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-400 focus:ring-cyan-400 h-4 w-4 bg-slate-900"
                      />
                      <span>Mandatory Field</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Save to Dynamic Schema
                </button>
              </form>

              {/* Current Attributes List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">
                  Registered Dynamic Attributes in Active Facility
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fields.map(field => (
                    <div
                      key={field.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {field.key}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="text-[10px] text-amber-400 font-mono">*req</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>}
                        </div>
                        {(field.validationMin !== undefined || field.validationMax !== undefined) && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Range: [{field.validationMin ?? '-∞'}, {field.validationMax ?? '+∞'}]
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition"
                        title="Delete dynamic field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300">
                Pipeline Stages Execution Sequence
              </h4>
              <div className="space-y-3">
                {pipelineStages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-slate-500 w-5">
                        #{idx + 1}
                      </span>
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stage.color }} 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {stage.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-100">
                            {stage.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>Avg Cycle: ~{stage.averageCycleMinutes} min</span>
                          <span>WIP Limit: {stage.wipLimit ?? 'Unlimited'}</span>
                          {stage.requiredFieldKeys && (
                            <span className="text-cyan-400">
                              Enforces: {stage.requiredFieldKeys.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Serialized schema specification ready for PostgreSQL JSONB or document storage
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
                {JSON.stringify({ fields, stages: pipelineStages }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
