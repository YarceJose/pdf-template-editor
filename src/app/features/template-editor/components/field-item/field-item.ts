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

  /**
   * Single source of truth for position.
   * CDK reads this to position the element via transform.
   * After drag ends, we update state → this recomputes → CDK resets.
   */
  freePosition = computed(() => {
    const f = this.field();
    const z = this.zoom();
    return { x: f.x * MM_TO_PX * z, y: f.y * MM_TO_PX * z };
  });

  styleWidth = computed(() => `${this.field().width * MM_TO_PX * this.zoom()}px`);
  styleHeight = computed(() => `${this.field().height * MM_TO_PX * this.zoom()}px`);
  styleFontSize = computed(() => `${this.field().fontSize * this.zoom()}pt`);

  isLocked = computed(() => this.field().requiredTier === 'obligatorio_siempre');
  isSystem = computed(() => this.field().origin === 'system');
  canDrag = computed(() => !this.isLocked() && !this.isSystem());

  onSelect(): void {
    this.fieldSelected.emit(this.field().id);
  }

  onDragEnded(event: CdkDragEnd): void {
    if (!this.canDrag()) return;

    const scale = MM_TO_PX * this.zoom();
    const pos = event.source.getFreeDragPosition();
    const newXMm = Math.max(0, Math.round((pos.x / scale) * 10) / 10);
    const newYMm = Math.max(0, Math.round((pos.y / scale) * 10) / 10);

    this.fieldMoved.emit({ id: this.field().id, x: newXMm, y: newYMm });
  }
}
