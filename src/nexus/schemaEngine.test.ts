import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDynamicAttributes, canTransitionStage, calculateMesMetrics } from './schemaEngine';
import { DynamicFieldDefinition, PipelineStage, WorkOrder, ProductionStation } from './types';

test('dynamic attribute validation passes valid payload', () => {
  const schema: DynamicFieldDefinition[] = [
    { id: '1', key: 'lotNumber', label: 'Lot Number', type: 'string', required: true },
    { id: '2', key: 'temperature', label: 'Temperature', type: 'metric', required: true, validationMin: 180, validationMax: 260 },
  ];

  const payload = {
    lotNumber: 'LOT-2026-X1',
    temperature: 215,
  };

  const result = validateDynamicAttributes(payload, schema);
  assert.equal(result.valid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('dynamic attribute validation flags out-of-range number and missing required fields', () => {
  const schema: DynamicFieldDefinition[] = [
    { id: '1', key: 'lotNumber', label: 'Lot Number', type: 'string', required: true },
    { id: '2', key: 'temperature', label: 'Temperature', type: 'metric', required: true, validationMin: 180, validationMax: 260 },
  ];

  const invalidPayload = {
    temperature: 300, // exceeds 260
  };

  const result = validateDynamicAttributes(invalidPayload, schema);
  assert.equal(result.valid, false);
  assert.ok(result.errors.lotNumber);
  assert.ok(result.errors.temperature);
});

test('canTransitionStage enforces stage-specific prerequisite attributes', () => {
  const schema: DynamicFieldDefinition[] = [
    { id: '1', key: 'opticalInspectionResult', label: 'AOI Inspection', type: 'select', required: false, options: ['PASS', 'FAIL', 'REWORK'] },
  ];

  const currentStage: PipelineStage = {
    id: 's-aoi',
    name: 'AOI Optical Inspection',
    code: 'AOI',
    order: 2,
    color: '#06b6d4',
    averageCycleMinutes: 4,
    requiredFieldKeys: ['opticalInspectionResult'],
  };

  const nextStage: PipelineStage = {
    id: 's-test',
    name: 'In-Circuit Test',
    code: 'ICT',
    order: 3,
    color: '#3b82f6',
    averageCycleMinutes: 10,
  };

  const workOrderWithoutPrereq: WorkOrder = {
    id: 'wo-1',
    orderNumber: 'WO-8801',
    productName: 'Flight Controller Rev B',
    batchLot: 'B26-09',
    currentStageId: 's-aoi',
    targetQuantity: 100,
    completedQuantity: 0,
    scrapQuantity: 0,
    priority: 'high',
    createdAt: '2026-11-02T05:00:00Z',
    estimatedCompletion: '2026-11-02T12:00:00Z',
    dynamicAttributes: {},
    history: [],
  };

  const transitionCheck = canTransitionStage(workOrderWithoutPrereq, nextStage, currentStage, schema);
  assert.equal(transitionCheck.allowed, false);

  // When attribute is provided
  workOrderWithoutPrereq.dynamicAttributes.opticalInspectionResult = 'PASS';
  const approvedCheck = canTransitionStage(workOrderWithoutPrereq, nextStage, currentStage, schema);
  assert.equal(approvedCheck.allowed, true);
});

test('calculateMesMetrics correctly computes OEE and Yield Rate', () => {
  const orders: WorkOrder[] = [
    {
      id: '1',
      orderNumber: 'WO-1',
      productName: 'Widget A',
      batchLot: 'L1',
      currentStageId: 's1',
      targetQuantity: 100,
      completedQuantity: 95,
      scrapQuantity: 5,
      priority: 'normal',
      createdAt: '',
      estimatedCompletion: '',
      dynamicAttributes: {},
      history: [],
    },
  ];

  const stations: ProductionStation[] = [
    {
      id: 'st-1',
      name: 'Station 1',
      stageId: 's1',
      status: 'running',
      currentOperator: 'Alice',
      speedRatingUnitsPerHour: 50,
      telemetry: {},
    },
  ];

  const metrics = calculateMesMetrics(orders, stations);
  assert.equal(metrics.yieldRate, 95);
  assert.equal(metrics.scrapRate, 5);
  assert.ok(metrics.oee > 0);
});
