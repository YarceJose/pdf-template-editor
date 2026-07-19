import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DESIGN_TEMPLATES, DesignTemplate } from '../../../../shared/models/design-templates.model';

export type TextToolType = 'text' | 'heading' | 'label' | 'field' | 'number' | 'date';
export type ElementToolType = 'line' | 'rectangle' | 'image' | 'qr';
export type AlignType = 'left' | 'center-horizontal' | 'right' | 'top' | 'center-vertical' | 'bottom';

@Component({
  selector: 'app-toolbar',
  imports: [LucideAngularModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar {
  documentName = input('Factura Electrónica v1.0');
  canUndo = input(false);
  canRedo = input(false);
  fieldCount = input(0);
  zoomPercent = input(100);
  saveStatus = input<'idle' | 'saving' | 'saved' | 'error'>('idle');
  hasUnsavedChanges = input(false);
  showAdvancedJson = input(false);

  undoClicked = output<void>();
  redoClicked = output<void>();
  zoomInClicked = output<void>();
  zoomOutClicked = output<void>();
  previewClicked = output<void>();
  exportClicked = output<void>();
  saveClicked = output<void>();
  deleteFieldClicked = output<void>();
  discardDraftClicked = output<void>();
  advancedJsonToggleClicked = output<void>();
  templateLoaded = output<DesignTemplate>();

  addTextClicked = output<TextToolType>();
  addTableClicked = output<{ cols: number; rows: number }>();
  addElementClicked = output<ElementToolType>();
  alignClicked = output<AlignType>();
  gridToggleClicked = output<void>();
  snapToggleClicked = output<void>();
  duplicateClicked = output<void>();

  templates = DESIGN_TEMPLATES;

  onTemplateChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const tpl = this.templates.find((t) => t.id === id);
    if (tpl) this.templateLoaded.emit(tpl);
  }
}
