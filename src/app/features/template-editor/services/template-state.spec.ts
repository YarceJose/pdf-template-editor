import { TestBed } from '@angular/core/testing';
import { TemplateStateService } from './template-state';
import { FieldDefinition } from '../../../shared/models/field.model';

const baseDef: FieldDefinition = {
  id: 'test-field',
  fieldKey: 'TestField',
  label: 'Test Field',
  placeholder: '[Test]',
  category: 'encabezado',
  section: 'encabezado',
  origin: 'xml-mapping',
  sourceNode: 'InvcHead',
  type: 'string',
  requiredTier: 'opcional',
  defaultWidthMm: 40,
  defaultHeightMm: 8,
};

describe('TemplateStateService — Positioning', () => {
  let state: TemplateStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(TemplateStateService);
  });

  describe('addField', () => {
    it('should add field at specified mm position', () => {
      state.addField(baseDef, 20, 30);
      const fields = state.placedFields();
      expect(fields.length).toBe(1);
      expect(fields[0].x).toBe(20);
      expect(fields[0].y).toBe(30);
      expect(fields[0].width).toBe(40);
      expect(fields[0].height).toBe(8);
    });

    it('should preserve fieldKey immutability', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      expect(field.fieldKey).toBe('TestField');
    });
  });

  describe('moveField — section clamping', () => {
    it('should clamp Y to section start if below', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      // Move above section (encabezado starts at 0)
      state.moveField(field.id, 10, -5);
      expect(state.placedFields()[0].y).toBeGreaterThanOrEqual(0);
    });

    it('should clamp Y to section end minus height', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      // Move below section (encabezado ends at 50mm, height=8)
      state.moveField(field.id, 10, 45);
      expect(state.placedFields()[0].y).toBeLessThanOrEqual(42);
    });

    it('should clamp X to page margins (10mm–160mm for 40mm field)', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      // Move left of margin
      state.moveField(field.id, 0, 10);
      expect(state.placedFields()[0].x).toBe(10);
      // Move right past page edge
      state.moveField(field.id, 200, 10);
      expect(state.placedFields()[0].x).toBe(210 - 40 - 10);
    });

    it('should reject move for system fields', () => {
      const sysDef: FieldDefinition = { ...baseDef, fieldKey: 'QR', origin: 'system', sourceNode: null };
      state.addField(sysDef, 10, 250);
      const field = state.placedFields()[0];
      const result = state.moveField(field.id, 50, 50);
      expect(result.success).toBeFalsy();
      expect(result.reason).toContain('sistema');
    });

    it('should reject move for obligatorio_siempre fields', () => {
      const lockedDef: FieldDefinition = { ...baseDef, requiredTier: 'obligatorio_siempre' };
      state.addField(lockedDef, 10, 10);
      const field = state.placedFields()[0];
      const result = state.moveField(field.id, 50, 50);
      expect(result.success).toBeFalsy();
      expect(result.reason).toContain('obligatorio');
    });
  });

  describe('updateField — fieldKey immutability', () => {
    it('should not allow changing fieldKey', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      state.updateField({ ...field, fieldKey: 'HACKED' });
      expect(state.placedFields()[0].fieldKey).toBe('TestField');
    });

    it('should not allow changing origin', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      state.updateField({ ...field, origin: 'system' });
      expect(state.placedFields()[0].origin).toBe('xml-mapping');
    });

    it('should update x/y from properties panel', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      state.updateField({ ...field, x: 25.5, y: 33.3 });
      expect(state.placedFields()[0].x).toBe(25.5);
      expect(state.placedFields()[0].y).toBe(33.3);
    });
  });

  describe('position independence from label/binding', () => {
    it('changing position should not alter label', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      state.moveField(field.id, 50, 50);
      expect(state.placedFields()[0].label).toBe('Test Field');
    });

    it('changing label should not alter position', () => {
      state.addField(baseDef, 10, 10);
      const field = state.placedFields()[0];
      state.updateField({ ...field, label: 'New Label' });
      expect(state.placedFields()[0].x).toBe(10);
      expect(state.placedFields()[0].y).toBe(10);
    });
  });
});
