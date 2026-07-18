import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlacedField } from '../../../../shared/models/placed-field.model';

@Component({
  selector: 'app-properties-panel',
  imports: [FormsModule],
  templateUrl: './properties-panel.html',
  styleUrl: './properties-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesPanel {
  field = input<PlacedField | null>(null);
  fieldUpdated = output<PlacedField>();
  fieldDeleted = output<string>();

  hasField = computed(() => this.field() !== null);

  updateProperty<K extends keyof PlacedField>(key: K, value: PlacedField[K]): void {
    const f = this.field();
    if (!f) return;
    this.fieldUpdated.emit({ ...f, [key]: value });
  }

  updateNumberProperty(key: 'x' | 'y' | 'width' | 'height' | 'fontSize', rawValue: string): void {
    const num = parseFloat(rawValue);
    if (isNaN(num) || num < 0) return;
    this.updateProperty(key, num);
  }

  toggleBold(): void {
    const f = this.field();
    if (f) this.updateProperty('bold', !f.bold);
  }

  toggleItalic(): void {
    const f = this.field();
    if (f) this.updateProperty('italic', !f.italic);
  }

  toggleUnderline(): void {
    const f = this.field();
    if (f) this.updateProperty('underline', !f.underline);
  }

  onDelete(): void {
    const f = this.field();
    if (f) this.fieldDeleted.emit(f.id);
  }
}
