import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CdkDrag, CdkDragStart, CdkDropList } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import {
  FIELD_CATEGORIES,
  FieldDefinition,
} from '../../../../shared/models/field.model';
import { TemplateStateService } from '../../services/template-state';

interface SourceTableGroup {
  key: string;
  label: string;
  fields: FieldDefinition[];
}

const SOURCE_TABLE_LABELS: Record<string, string> = {
  'InvcHead': 'Encabezado (InvcHead)',
  'Company': 'Empresa (Company)',
  'Customer': 'Cliente (Customer)',
  'InvcDtl': 'Detalle (InvcDtl)',
  'InvcTax': 'Impuestos (InvcTax)',
  'system': 'Sistema',
};

@Component({
  selector: 'app-sidebar-fields',
  imports: [CdkDrag, CdkDropList, LucideAngularModule],
  templateUrl: './sidebar-fields.html',
  styleUrl: './sidebar-fields.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarFields {
  private state = inject(TemplateStateService);
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  searchQuery = signal('');
  collapsedSections = signal<Set<string>>(new Set());

  /** Fields grouped by source table (sourceNode) */
  sourceGroups = computed(() => {
    const allFields = FIELD_CATEGORIES.flatMap((g) => g.fields);
    const query = this.searchQuery().toLowerCase().trim();

    const grouped = new Map<string, FieldDefinition[]>();

    for (const field of allFields) {
      const node = field.origin === 'system' ? 'system' : (field.sourceNode ?? 'unknown');
      if (query && !field.label.toLowerCase().includes(query) && !field.fieldKey.toLowerCase().includes(query)) {
        continue;
      }
      if (!grouped.has(node)) grouped.set(node, []);
      grouped.get(node)!.push(field);
    }

    const order = ['InvcHead', 'Company', 'Customer', 'InvcDtl', 'InvcTax', 'system'];
    const groups: SourceTableGroup[] = [];

    for (const key of order) {
      const fields = grouped.get(key);
      if (fields && fields.length > 0) {
        groups.push({ key, label: SOURCE_TABLE_LABELS[key] ?? key, fields });
      }
    }

    // Any remaining groups not in order
    for (const [key, fields] of grouped) {
      if (!order.includes(key)) {
        groups.push({ key, label: SOURCE_TABLE_LABELS[key] ?? key, fields });
      }
    }

    return groups;
  });

  isRequired(field: FieldDefinition): boolean {
    if (field.requiredTier === 'obligatorio_siempre') return true;
    return this.state.isUserRequired(field.fieldKey);
  }

  isRequiredDisabled(field: FieldDefinition): boolean {
    return field.requiredTier === 'obligatorio_siempre';
  }

  onToggleRequired(field: FieldDefinition): void {
    if (field.requiredTier === 'obligatorio_siempre') return;
    this.state.toggleUserRequired(field.fieldKey);
  }

  onSearchInput(event: Event): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    const value = (event.target as HTMLInputElement).value;
    this.searchTimeout = setTimeout(() => {
      this.searchQuery.set(value);
    }, 200);
  }

  toggleSection(key: string): void {
    this.collapsedSections.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  isSectionCollapsed(key: string): boolean {
    return this.collapsedSections().has(key);
  }

  onDragStarted(event: CdkDragStart<FieldDefinition>): void {
    // Future: emit event or track drag state
  }

  trackByGroup(_index: number, group: SourceTableGroup): string {
    return group.key;
  }

  isPlaced(field: FieldDefinition): boolean {
    return this.state.placedFields().some((f) => f.fieldKey === field.fieldKey);
  }

  placedCount(group: SourceTableGroup): number {
    const placed = this.state.placedFields();
    return group.fields.filter((f) => placed.some((p) => p.fieldKey === f.fieldKey)).length;
  }

  trackByField(_index: number, field: FieldDefinition): string {
    return field.id;
  }
}
