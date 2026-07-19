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
      // Move below section (encabezado ends at 65mm, height=8)
      state.moveField(field.id, 10, 60);
      expect(state.placedFields()[0].y).toBeLessThanOrEqual(57);
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

// ============================================
// DETAIL TABLE — Columnas dinámicas
// ============================================
describe('TemplateStateService — Detail Table Columns', () => {
  let state: TemplateStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(TemplateStateService);
  });

  it('should add a column and update detailTableComponent with full contract structure', () => {
    state.addDetailColumn({
      header: 'Codigo',
      bindingSource: 'PartNum',
      bindingDataType: 'String',
      width: 65,
      align: 'Left',
      fieldKey: 'PartNum',
      requiredTier: 'opcional',
    });

    const cols = state.detailTableColumns();
    expect(cols.length).toBe(1);
    expect(cols[0].header).toBe('Codigo');
    expect(cols[0].bindingSource).toBe('PartNum');

    // Verify detailTableComponent produces valid TableComponent
    const tbl = state.detailTableComponent();
    expect(tbl.type).toBe('Table');
    expect(tbl.columns.length).toBe(1);
    expect(tbl.columns[0].header).toBe('Codigo');
    expect(tbl.columns[0].binding?.source).toBe('PartNum');
    expect(tbl.columns[0].binding?.dataType).toBe('String');
    expect(tbl.columns[0].width).toBe(65);
    expect(tbl.columns[0].align).toBe('Left');
  });

  it('should reject column with duplicate bindingSource', () => {
    state.addDetailColumn({
      header: 'Codigo',
      bindingSource: 'PartNum',
      bindingDataType: 'String',
      width: 65,
      align: 'Left',
      fieldKey: 'PartNum',
      requiredTier: 'opcional',
    });
    const result = state.addDetailColumn({
      header: 'Codigo Dup',
      bindingSource: 'PartNum',
      bindingDataType: 'String',
      width: 40,
      align: 'Left',
      fieldKey: 'PartNum',
      requiredTier: 'opcional',
    });
    expect(result.success).toBeFalsy();
    expect(result.reason).toContain('ya existe');
    expect(state.detailTableColumns().length).toBe(1);
  });

  it('should block removal of obligatorio_siempre column', () => {
    state.addDetailColumn({
      header: 'Linea',
      bindingSource: 'InvoiceLine',
      bindingDataType: 'Integer',
      width: 24,
      align: 'Center',
      fieldKey: 'InvoiceLine',
      requiredTier: 'obligatorio_siempre',
    });
    const col = state.detailTableColumns()[0];
    const result = state.removeDetailColumn(col.id);
    expect(result.success).toBeFalsy();
    expect(result.reason).toContain('obligatoria');
    expect(state.detailTableColumns().length).toBe(1);
  });

  it('should allow removal of opcional column', () => {
    state.addDetailColumn({
      header: 'Descripcion',
      bindingSource: 'LineDesc',
      bindingDataType: 'String',
      width: 150,
      align: 'Left',
      fieldKey: 'LineDesc',
      requiredTier: 'opcional',
    });
    const col = state.detailTableColumns()[0];
    const result = state.removeDetailColumn(col.id);
    expect(result.success).toBeTruthy();
    expect(state.detailTableColumns().length).toBe(0);
  });

  it('should clamp column width between 20 and 200', () => {
    state.addDetailColumn({
      header: 'Test',
      bindingSource: 'TestCol',
      bindingDataType: 'String',
      width: 65,
      align: 'Left',
      fieldKey: 'TestCol',
      requiredTier: 'opcional',
    });
    const col = state.detailTableColumns()[0];
    state.updateColumnWidth(col.id, 5);
    expect(state.detailTableColumns()[0].width).toBe(20);
    state.updateColumnWidth(col.id, 300);
    expect(state.detailTableColumns()[0].width).toBe(200);
  });
});

// ============================================
// DISCARD DRAFT — Restaurar snapshot
// ============================================
describe('TemplateStateService — Discard Draft', () => {
  let state: TemplateStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(TemplateStateService);
  });

  it('should restore state to last snapshot after discard', () => {
    // Initial state: empty, save snapshot
    state.saveSnapshot();
    expect(state.hasUnsavedChanges()).toBeFalsy();

    // Make changes
    state.addField(baseDef, 20, 30);
    state.addDetailColumn({
      header: 'Test',
      bindingSource: 'TestCol',
      bindingDataType: 'String',
      width: 65,
      align: 'Left',
      fieldKey: 'TestCol',
      requiredTier: 'opcional',
    });
    expect(state.placedFields().length).toBe(1);
    expect(state.detailTableColumns().length).toBe(1);
    expect(state.hasUnsavedChanges()).toBeTruthy();

    // Discard
    state.discardDraft();
    expect(state.placedFields().length).toBe(0);
    expect(state.detailTableColumns().length).toBe(0);
    expect(state.hasUnsavedChanges()).toBeFalsy();
  });

  it('should restore to empty state when discarding a new template (no prior snapshot)', () => {
    // Never called saveSnapshot — savedSnapshot is null
    state.addField(baseDef, 20, 30);
    expect(state.placedFields().length).toBe(1);

    // Discard with no snapshot → calls reset()
    state.discardDraft();
    expect(state.placedFields().length).toBe(0);
    expect(state.detailTableColumns().length).toBe(0);
  });

  it('should not call any delete endpoint on discard', () => {
    state.saveSnapshot();
    state.addField(baseDef, 20, 30);
    state.discardDraft();
    // No error thrown, no endpoint invoked — state simply restored
    expect(state.placedFields().length).toBe(0);
  });

  it('should restore userRequiredKeys on discard', () => {
    state.saveSnapshot();
    state.toggleUserRequired('TestField');
    expect(state.isUserRequired('TestField')).toBeTruthy();

    state.discardDraft();
    expect(state.isUserRequired('TestField')).toBeFalsy();
  });
});
