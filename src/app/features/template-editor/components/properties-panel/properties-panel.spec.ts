import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideAngularModule } from 'lucide-angular';
import { MousePointer2, Lock, Trash2, Bold, Italic, Underline, AlertCircle, AlertTriangle } from 'lucide-angular';
import { PropertiesPanel } from './properties-panel';

describe('PropertiesPanel', () => {
  let component: PropertiesPanel;
  let fixture: ComponentFixture<PropertiesPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PropertiesPanel,
        LucideAngularModule.pick({ MousePointer2, Lock, Trash2, Bold, Italic, Underline, AlertCircle, AlertTriangle }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
