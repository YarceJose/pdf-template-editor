import {
  Component,
  ChangeDetectionStrategy,
  inject,
  output,
  computed,
} from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { TemplateStateService, DetailTableColumn } from '../../services/template-state';
import { FIELD_CATEGORIES, FieldDefinition } from '../../../../shared/models/field.model';
import { MM_TO_PX } from '../field-item/field-item';

@Component({
  selector: 'app-detail-table',
  imports: [CdkDrag, CdkDropList, LucideAngularModule],
  templateUrl: './detail-table.html',
  styleUrl: './detail-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailTableComponent {
  protected readonly MM_TO_PX = MM_TO_PX;
  private state = inject(TemplateStateService);

  zoom = output<void>();

  columns = this.state.detailTableColumns;

  /** Available fields for adding columns (from InvcDtl and InvcTax) */
  availableFields = computed(() => {
    const detalleFields = FIELD_CATEGORIES
      .flatMap((g) => g.fields)
      .filter((f) => f.section === 'detalle');
    const placedKeys = new Set(this.columns().map((c) => c.bindingSource));
    return detalleFields.filter((f) => !placedKeys.has(f.fieldKey));
  });

  /** Fields from InvcDtl available for adding */
  invcDtlFields = computed(() => {
    return this.availableFields().filter((f) => f.sourceNode === 'InvcDtl');
  });

  /** Fields from InvcTax available for adding */
  invcTaxFields = computed(() => {
    return this.availableFields().filter((f) => f.sourceNode === 'InvcTax');
  });

  totalWidth = computed(() => {
    return this.columns().reduce((sum, c) => sum + c.width, 0);
  });

  onAddColumn(field: FieldDefinition): void {
    const col: Omit<DetailTableColumn, 'id'> = {
      header: field.label,
      bindingSource: field.fieldKey,
      bindingDataType: field.type === 'decimal' ? 'Decimal' : field.type === 'date' ? 'DateTime' : 'String',
      width: 80,
      align: field.type === 'decimal' ? 'Right' : 'Left',
      format: field.type === 'decimal' ? 'C2' : field.type === 'date' ? 'dd/MM/yyyy' : undefined,
      fieldKey: field.fieldKey,
      requiredTier: field.requiredTier,
    };
    this.state.addDetailColumn(col);
  }

  onRemoveColumn(colId: string): void {
    this.state.removeDetailColumn(colId);
  }

  onWidthChange(colId: string, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.state.updateColumnWidth(colId, val);
    }
  }

  onColumnDrop(event: CdkDragDrop<DetailTableColumn[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.state.moveDetailColumn(event.previousIndex, event.currentIndex);
  }

  isDragDisabled(col: DetailTableColumn): boolean {
    return col.requiredTier === 'obligatorio_siempre';
  }

  trackByColId(_index: number, col: DetailTableColumn): string {
    return col.id;
  }

  trackByFieldId(_index: number, field: FieldDefinition): string {
    return field.id;
  }

  requiredBadge(tier: string): string {
    if (tier === 'obligatorio_siempre') return 'Req.';
    if (tier === 'obligatorio_validacion') return 'Cond.';
    return 'Opc.';
  }

  alignLabel(align: string): string {
    if (align === 'Right') return 'Der.';
    if (align === 'Center') return 'Cen.';
    return 'Izq.';
  }
}
