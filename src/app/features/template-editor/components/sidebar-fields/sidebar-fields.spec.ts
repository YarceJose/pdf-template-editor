import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideAngularModule } from 'lucide-angular';
import { Search, ChevronDown, ChevronRight, GripVertical, Check } from 'lucide-angular';
import { SidebarFields } from './sidebar-fields';
import { TemplateStateService } from '../../services/template-state';

describe('SidebarFields', () => {
  let component: SidebarFields;
  let fixture: ComponentFixture<SidebarFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarFields,
        LucideAngularModule.pick({ Search, ChevronDown, ChevronRight, GripVertical, Check }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarFields);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('SidebarFields — Mandatorio checkbox behavior', () => {
  let component: SidebarFields;
  let fixture: ComponentFixture<SidebarFields>;
  let state: TemplateStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarFields,
        LucideAngularModule.pick({ Search, ChevronDown, ChevronRight, GripVertical, Check }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarFields);
    component = fixture.componentInstance;
    state = TestBed.inject(TemplateStateService);
    await fixture.whenStable();
  });

  it('obligatorio_siempre field should be checked and disabled', () => {
    const lockedField = component.sourceGroups()
      .flatMap((g) => g.fields)
      .find((f) => f.requiredTier === 'obligatorio_siempre')!;

    expect(component.isRequired(lockedField)).toBeTruthy();
    expect(component.isRequiredDisabled(lockedField)).toBeTruthy();
  });

  it('opcional field should be unchecked and enabled', () => {
    const optionalField = component.sourceGroups()
      .flatMap((g) => g.fields)
      .find((f) => f.requiredTier === 'opcional')!;

    expect(component.isRequired(optionalField)).toBeFalsy();
    expect(component.isRequiredDisabled(optionalField)).toBeFalsy();
  });

  it('toggling an optional field updates userRequiredKeys', () => {
    const optionalField = component.sourceGroups()
      .flatMap((g) => g.fields)
      .find((f) => f.requiredTier === 'opcional')!;

    expect(state.isUserRequired(optionalField.fieldKey)).toBeFalsy();
    component.onToggleRequired(optionalField);
    expect(state.isUserRequired(optionalField.fieldKey)).toBeTruthy();
    component.onToggleRequired(optionalField);
    expect(state.isUserRequired(optionalField.fieldKey)).toBeFalsy();
  });

  it('toggling an obligatorio_siempre field is a no-op', () => {
    const lockedField = component.sourceGroups()
      .flatMap((g) => g.fields)
      .find((f) => f.requiredTier === 'obligatorio_siempre')!;

    component.onToggleRequired(lockedField);
    expect(state.isUserRequired(lockedField.fieldKey)).toBeFalsy();
  });
});
