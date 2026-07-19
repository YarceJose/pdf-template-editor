import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideAngularModule } from 'lucide-angular';
import {
  Search, ChevronDown, ChevronRight, GripVertical,
  Type, Heading, Tags, Variable, Hash, Calendar, Table, Minus, Square, Image, QrCode,
  AlignLeft, AlignCenterHorizontal, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  Grid3x3, Magnet, ZoomIn, ZoomOut, Undo2, Redo2, Eye, Trash2, Download, X,
  Building2, User, ShoppingCart, Calculator, PenTool,
  Copy, AlertTriangle, AlertCircle, FileText,
  ChevronUp, Bold, Italic, Underline, MousePointer2, Plus, Save, CheckCircle, Loader2, Lock
} from 'lucide-angular';
import { EditorPage } from './editor-page';

describe('EditorPage', () => {
  let component: EditorPage;
  let fixture: ComponentFixture<EditorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditorPage,
        LucideAngularModule.pick({
          Search, ChevronDown, ChevronRight, GripVertical,
          Type, Heading, Tags, Variable, Hash, Calendar, Table, Minus, Square, Image, QrCode,
          AlignLeft, AlignCenterHorizontal, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
          Grid3x3, Magnet, ZoomIn, ZoomOut, Undo2, Redo2, Eye, Trash2, Download, X,
          Building2, User, ShoppingCart, Calculator, PenTool,
          Copy, AlertTriangle, AlertCircle, FileText,
          ChevronUp, Bold, Italic, Underline, MousePointer2, Plus, Save, CheckCircle, Loader2, Lock
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
