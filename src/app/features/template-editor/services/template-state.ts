import { Injectable, signal, computed } from '@angular/core';
import { PlacedField, getSectionForY } from '../../../shared/models/placed-field.model';
import { FieldDefinition } from '../../../shared/models/field.model';
import { DesignTemplate } from '../../../shared/models/design-templates.model';

let nextId = 1;

interface HistoryEntry {
  fields: PlacedField[];
  selectedId: string | null;
}

@Injectable({ providedIn: 'root' })
export class TemplateStateService {
  placedFields = signal<PlacedField[]>([]);
  selectedFieldId = signal<string | null>(null);
  zoom = signal(1);

  private undoStack = signal<HistoryEntry[]>([]);
  private redoStack = signal<HistoryEntry[]>([]);

  selectedField = computed(() => {
    const id = this.selectedFieldId();
    if (!id) return null;
    return this.placedFields().find((f) => f.id === id) ?? null;
  });

  canUndo = computed(() => this.undoStack().length > 0);
  canRedo = computed(() => this.redoStack().length > 0);
  fieldCount = computed(() => this.placedFields().length);

  private pushHistory(): void {
    const entry: HistoryEntry = {
      fields: this.placedFields(),
      selectedId: this.selectedFieldId(),
    };
    this.undoStack.update((s) => [...s, entry]);
    this.redoStack.set([]);
  }

  addField(def: FieldDefinition, x: number, y: number): void {
    this.pushHistory();
    const newField: PlacedField = {
      id: `field_${nextId++}`,
      fieldId: def.id,
      label: def.label,
      placeholder: def.placeholder,
      category: def.category,
      section: getSectionForY(y),
      x,
      y,
      width: def.defaultWidthMm ?? 40,
      height: def.defaultHeightMm ?? 8,
      fontSize: 10,
      bold: false,
      italic: false,
      underline: false,
    };
    this.placedFields.update((f) => [...f, newField]);
    this.selectedFieldId.set(newField.id);
  }

  selectField(id: string | null): void {
    this.selectedFieldId.set(id);
  }

  moveField(id: string, x: number, y: number): void {
    this.pushHistory();
    this.placedFields.update((fields) =>
      fields.map((f) => (f.id === id ? { ...f, x, y, section: getSectionForY(y) } : f))
    );
  }

  updateField(updated: PlacedField): void {
    this.pushHistory();
    this.placedFields.update((fields) =>
      fields.map((f) => (f.id === updated.id ? updated : f))
    );
  }

  deleteField(id: string): void {
    this.pushHistory();
    this.placedFields.update((fields) => fields.filter((f) => f.id !== id));
    this.selectedFieldId.set(null);
  }

  undo(): void {
    const stack = this.undoStack();
    if (stack.length === 0) return;

    const current: HistoryEntry = {
      fields: this.placedFields(),
      selectedId: this.selectedFieldId(),
    };
    this.redoStack.update((s) => [...s, current]);

    const prev = stack[stack.length - 1];
    this.undoStack.update((s) => s.slice(0, -1));
    this.placedFields.set(prev.fields);
    this.selectedFieldId.set(prev.selectedId);
  }

  redo(): void {
    const stack = this.redoStack();
    if (stack.length === 0) return;

    const current: HistoryEntry = {
      fields: this.placedFields(),
      selectedId: this.selectedFieldId(),
    };
    this.undoStack.update((s) => [...s, current]);

    const next = stack[stack.length - 1];
    this.redoStack.update((s) => s.slice(0, -1));
    this.placedFields.set(next.fields);
    this.selectedFieldId.set(next.selectedId);
  }

  zoomIn(): void {
    this.zoom.update((z) => Math.min(z + 0.1, 2));
  }

  zoomOut(): void {
    this.zoom.update((z) => Math.max(z - 0.1, 0.3));
  }

  loadTemplate(template: DesignTemplate): void {
    this.pushHistory();
    const fields: PlacedField[] = template.fields.map((f) => ({
      ...f,
      id: `field_${nextId++}`,
    }));
    this.placedFields.set(fields);
    this.selectedFieldId.set(null);
  }

  reset(): void {
    this.pushHistory();
    this.placedFields.set([]);
    this.selectedFieldId.set(null);
  }
}
