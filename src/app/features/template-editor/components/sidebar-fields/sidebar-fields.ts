import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CdkDrag, CdkDragStart, CdkDropList } from '@angular/cdk/drag-drop';
import {
  FIELD_CATEGORIES,
  FieldCategoryGroup,
  FieldDefinition,
} from '../../../../shared/models/field.model';

@Component({
  selector: 'app-sidebar-fields',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './sidebar-fields.html',
  styleUrl: './sidebar-fields.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarFields {
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  searchQuery = signal('');
  collapsedSections = signal<Set<string>>(new Set());

  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return FIELD_CATEGORIES;

    return FIELD_CATEGORIES.map((group: FieldCategoryGroup) => ({
      ...group,
      fields: group.fields.filter(
        (f: FieldDefinition) =>
          f.label.toLowerCase().includes(query) ||
          f.placeholder.toLowerCase().includes(query)
      ),
    })).filter((group: FieldCategoryGroup) => group.fields.length > 0);
  });

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

  trackByGroup(_index: number, group: FieldCategoryGroup): string {
    return group.key;
  }

  trackByField(_index: number, field: FieldDefinition): string {
    return field.id;
  }
}
