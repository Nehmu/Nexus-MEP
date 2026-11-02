export type FieldType = 'string' | 'number' | 'boolean' | 'select' | 'metric' | 'json';

export interface DynamicFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: string[]; // for select
  unit?: string; // for metric/number
  validationMin?: number;
  validationMax?: number;
  description?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  code: string;
  order: number;
  wipLimit?: number;
  color: string;
  requiredFieldKeys?: string[]; // Dynamic fields that must be filled before leaving this stage
  stationType?: string;
  averageCycleMinutes: number;
}

export interface IndustryPreset {
  id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  unitNoun: string; // e.g. "PCB Batch", "Garment Lot", "Fermentation Vat"
  stages: PipelineStage[];
  customFields: DynamicFieldDefinition[];
  sampleWorkOrders: WorkOrder[];
  stations: ProductionStation[];
}

export interface ProductionStation {
  id: string;
  name: string;
  stageId: string;
  status: 'running' | 'idle' | 'warning' | 'error';
  currentOperator: string;
  speedRatingUnitsPerHour: number;
  telemetry: {
    temperatureC?: number;
    vibrationMmSec?: number;
    powerKw?: number;
    pressureBar?: number;
  };
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  batchLot: string;
  currentStageId: string;
  targetQuantity: number;
  completedQuantity: number;
  scrapQuantity: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  estimatedCompletion: string;
  assignedStationId?: string;
  // Domain-agnostic dynamic attributes payload (like JSONB)
  dynamicAttributes: Record<string, string | number | boolean | Record<string, unknown>>;
  history: StageTransitionLog[];
}

export interface StageTransitionLog {
  timestamp: string;
  fromStageId: string | null;
  toStageId: string;
  operator: string;
  notes?: string;
}
