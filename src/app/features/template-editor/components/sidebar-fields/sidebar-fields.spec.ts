import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideAngularModule } from 'lucide-angular';
import { Search, ChevronDown, ChevronRight, GripVertical, Check } from 'lucide-angular';
import { SidebarFields } from './sidebar-fields';

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
