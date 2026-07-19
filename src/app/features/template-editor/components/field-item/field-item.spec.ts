import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldItem, MM_TO_PX } from './field-item';
import { PlacedField } from '../../../../shared/models/placed-field.model';

const mockField: PlacedField = {
  id: 'field_1',
  fieldKey: 'test',
  label: 'Test',
  placeholder: 'test',
  category: 'encabezado',
  section: 'encabezado',
  origin: 'xml-mapping',
  sourceNode: 'test',
  type: 'string',
  requiredTier: 'opcional',
  x: 10,
  y: 10,
  width: 40,
  height: 8,
  fontSize: 10,
  bold: false,
  italic: false,
  underline: false,
};

describe('FieldItem', () => {
  let component: FieldItem;
  let fixture: ComponentFixture<FieldItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldItem],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldItem);
    fixture.componentRef.setInput('field', mockField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('freePosition should compute px from mm*zoom', () => {
    fixture.componentRef.setInput('zoom', 1);
    const pos = component.freePosition();
    expect(pos.x).toBeCloseTo(10 * MM_TO_PX, 1);
    expect(pos.y).toBeCloseTo(10 * MM_TO_PX, 1);
  });

  it('freePosition should scale with zoom', () => {
    fixture.componentRef.setInput('zoom', 1.5);
    const pos = component.freePosition();
    expect(pos.x).toBeCloseTo(10 * MM_TO_PX * 1.5, 1);
    expect(pos.y).toBeCloseTo(10 * MM_TO_PX * 1.5, 1);
  });

  it('freePosition should have no residual transform — same position before/after state', () => {
    fixture.componentRef.setInput('zoom', 1);
    const pos1 = component.freePosition();
    const pos2 = component.freePosition();
    expect(pos1.x).toBe(pos2.x);
    expect(pos1.y).toBe(pos2.y);
  });

  it('should disable drag for locked fields', () => {
    fixture.componentRef.setInput('field', { ...mockField, requiredTier: 'obligatorio_siempre' });
    expect(component.canDrag()).toBeFalsy();
  });

  it('should disable drag for system fields', () => {
    fixture.componentRef.setInput('field', { ...mockField, origin: 'system', sourceNode: null });
    expect(component.canDrag()).toBeFalsy();
  });

  it('should enable drag for optional fields', () => {
    fixture.componentRef.setInput('field', { ...mockField, requiredTier: 'opcional' });
    expect(component.canDrag()).toBeTruthy();
  });

  it('styleWidth/styleHeight should use MM_TO_PX conversion', () => {
    fixture.componentRef.setInput('zoom', 1);
    expect(component.styleWidth()).toBe(`${40 * MM_TO_PX}px`);
    expect(component.styleHeight()).toBe(`${8 * MM_TO_PX}px`);
  });
});
