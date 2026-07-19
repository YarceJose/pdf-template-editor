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

  it('transformStyle should produce translate from mm*zoom', () => {
    fixture.componentRef.setInput('zoom', 1);
    const t = component.transformStyle();
    const expectedX = 10 * MM_TO_PX;
    const expectedY = 10 * MM_TO_PX;
    expect(t).toContain(`translate(${expectedX}px, ${expectedY}px)`);
  });

  it('transformStyle should scale with zoom', () => {
    fixture.componentRef.setInput('zoom', 1.5);
    const t = component.transformStyle();
    const expectedX = 10 * MM_TO_PX * 1.5;
    const expectedY = 10 * MM_TO_PX * 1.5;
    expect(t).toContain(`translate(${expectedX}px, ${expectedY}px)`);
  });

  it('transformStyle should be deterministic — same state gives same transform', () => {
    fixture.componentRef.setInput('zoom', 1);
    const t1 = component.transformStyle();
    const t2 = component.transformStyle();
    expect(t1).toBe(t2);
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
