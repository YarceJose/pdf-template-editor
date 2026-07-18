import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { PlacedField } from '../../../../shared/models/placed-field.model';

export const MM_TO_PX = 3.7795275591;

@Component({
  selector: 'app-field-item',
  imports: [CdkDrag],
  templateUrl: './field-item.html',
  styleUrl: './field-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldItem {
  field = input.required<PlacedField>();
  selected = input(false);
  zoom = input(1);

  fieldSelected = output<string>();
  fieldMoved = output<{ id: string; x: number; y: number }>();

  styleLeft = computed(() => `${this.field().x * MM_TO_PX * this.zoom()}px`);
  styleTop = computed(() => `${this.field().y * MM_TO_PX * this.zoom()}px`);
  styleWidth = computed(() => `${this.field().width * MM_TO_PX * this.zoom()}px`);
  styleHeight = computed(() => `${this.field().height * MM_TO_PX * this.zoom()}px`);
  styleFontSize = computed(() => `${this.field().fontSize * this.zoom()}pt`);

  onSelect(): void {
    this.fieldSelected.emit(this.field().id);
  }

  onDragEnded(event: CdkDragEnd): void {
    const f = this.field();
    const delta = event.distance;
    const scale = MM_TO_PX * this.zoom();
    const newX = f.x + delta.x / scale;
    const newY = f.y + delta.y / scale;
    this.fieldMoved.emit({ id: f.id, x: Math.max(0, newX), y: Math.max(0, newY) });
  }
}
