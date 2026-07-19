import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  inject,
} from '@angular/core';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FieldItem, MM_TO_PX } from '../field-item/field-item';
import { TableRenderer } from '../renderers/table-renderer';
import { PlacedField, PAGE_SECTIONS, PageSectionZone } from '../../../../shared/models/placed-field.model';
import { FieldDefinition } from '../../../../shared/models/field.model';
import { TemplateStateService } from '../../services/template-state';

@Component({
  selector: 'app-canvas',
  imports: [CdkDropList, FieldItem, TableRenderer],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Canvas {
  private state = inject(TemplateStateService);

  placedFields = input<PlacedField[]>([]);
  selectedFieldId = input<string | null>(null);
  zoom = input(1);

  fieldSelected = output<string>();
  fieldMoved = output<{ id: string; x: number; y: number }>();
  fieldDropped = output<{ def: FieldDefinition; x: number; y: number }>();
  pageClicked = output<void>();
  detailTableSelected = output<void>();

  readonly A4_WIDTH_MM = 210;
  readonly A4_HEIGHT_MM = 297;
  sections = PAGE_SECTIONS;

  nonDetalleFields = computed(() => {
    return this.placedFields().filter((f) => f.section !== 'detalle');
  });

  hasDetailTable = computed(() => this.state.detailTableColumns().length > 0);
  detailTableComponent = this.state.detailTableComponent;

  detalleZone = PAGE_SECTIONS.find((s) => s.key === 'detalle')!;

  pageWidthPx = computed(() => this.A4_WIDTH_MM * MM_TO_PX * this.zoom());
  pageHeightPx = computed(() => this.A4_HEIGHT_MM * MM_TO_PX * this.zoom());

  sectionStyle(section: PageSectionZone) {
    const z = this.zoom();
    return {
      top: `${section.yStart * MM_TO_PX * z}px`,
      height: `${(section.yEnd - section.yStart) * MM_TO_PX * z}px`,
      width: '100%',
    };
  }

  sectionLabelStyle(section: PageSectionZone) {
    const z = this.zoom();
    const topPx = section.yStart * MM_TO_PX * z;
    return { top: `${topPx}px` };
  }

  detailTableLeft = computed(() => `${10 * MM_TO_PX * this.zoom()}px`);
  detailTableTop = computed(() => `${(this.detalleZone.yStart + 5) * MM_TO_PX * this.zoom()}px`);
  detailTableWidth = computed(() => `${(this.A4_WIDTH_MM - 20) * MM_TO_PX * this.zoom()}px`);

  onDrop(event: CdkDragDrop<unknown, unknown>): void {
    const def = event.item.data as FieldDefinition;
    if (!def) return;

    const containerRect = (event.container.element.nativeElement as HTMLElement).getBoundingClientRect();
    const dropX = event.dropPoint.x - containerRect.left;
    const dropY = event.dropPoint.y - containerRect.top;

    const scale = MM_TO_PX * this.zoom();
    const xMm = Math.max(0, Math.round((dropX / scale) * 10) / 10);
    const yMm = Math.max(0, Math.round((dropY / scale) * 10) / 10);

    this.fieldDropped.emit({ def, x: xMm, y: yMm });
  }

  onFieldSelected(id: string): void {
    this.fieldSelected.emit(id);
  }

  onFieldMoved(event: { id: string; x: number; y: number }): void {
    this.fieldMoved.emit(event);
  }

  onPageClick(): void {
    this.pageClicked.emit();
  }

  isSelected(id: string): boolean {
    return this.selectedFieldId() === id;
  }

  trackByFieldId(_index: number, field: PlacedField): string {
    return field.id;
  }

  trackBySection(_index: number, section: PageSectionZone): string {
    return section.key;
  }
}
