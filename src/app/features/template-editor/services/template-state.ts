import { Injectable, signal, computed } from '@angular/core';
import { PlacedField, getSectionForY, clampToSection, PageSection } from '../../../shared/models/placed-field.model';
import { FieldDefinition } from '../../../shared/models/field.model';
import { DesignTemplate } from '../../../shared/models/design-templates.model';

let nextId = 1;

interface HistoryEntry {
  fields: PlacedField[];
  selectedId: string | null;
}

export interface DetailTableColumn {
  id: string;
  header: string;
  bindingSource: string;
  bindingDataType: string;
  width: number;
  align: 'Left' | 'Right' | 'Center';
  format?: string;
  fieldKey: string;
  requiredTier: 'obligatorio_siempre' | 'obligatorio_validacion' | 'opcional';
}

interface SnapshotEntry {
  fields: PlacedField[];
  tableColumns: DetailTableColumn[];
  userRequiredKeys: Set<string>;
}

@Injectable({ providedIn: 'root' })
export class TemplateStateService {
  placedFields = signal<PlacedField[]>([]);
  selectedFieldId = signal<string | null>(null);
  zoom = signal(1);

  /** Campos que el usuario marcó como obligatorios (fieldKey → true) */
  userRequiredKeys = signal<Set<string>>(new Set());

  /** Columnas de la tabla de detalle */
  detailTableColumns = signal<DetailTableColumn[]>([]);

  /** Snapshot del último estado guardado (para descartar boceto) */
  private savedSnapshot = signal<SnapshotEntry | null>(null);

  /** Indica si hay cambios sin guardar respecto al snapshot */
  hasUnsavedChanges = computed(() => {
    const snap = this.savedSnapshot();
    if (!snap) return this.placedFields().length > 0;
    return JSON.stringify(snap.fields) !== JSON.stringify(this.placedFields()) ||
           JSON.stringify(snap.tableColumns) !== JSON.stringify(this.detailTableColumns());
  });

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

  /**
   * Agrega un campo al canvas.
   * Si el campo tiene section asignada, la usa. Si no, infiere por posición Y.
   */
  addField(def: FieldDefinition, x: number, y: number): PlacedField | null {
    // Validar que no se esté duplicando un campo obligatorio ya existente
    if (def.requiredTier === 'obligatorio_siempre') {
      const exists = this.placedFields().some((f) => f.fieldKey === def.fieldKey);
      if (exists) return null;
    }

    this.pushHistory();

    // La sección viene del diccionario, no se infiere del nodo XML
    const targetSection = def.section;

    const newField: PlacedField = {
      id: `field_${nextId++}`,
      fieldKey: def.fieldKey,
      label: def.label,
      placeholder: def.placeholder,
      category: def.category,
      section: targetSection,
      origin: def.origin,
      sourceNode: def.sourceNode,
      type: def.type,
      requiredTier: def.requiredTier,
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
    return newField;
  }

  selectField(id: string | null): void {
    this.selectedFieldId.set(id);
  }

  /**
   * Mueve un campo. Valida que no cruce los límites de su sección asignada.
   * Solo permite mover dentro de la sección declarada del campo.
   */
  moveField(id: string, x: number, y: number): { success: boolean; reason?: string } {
    const field = this.placedFields().find((f) => f.id === id);
    if (!field) return { success: false, reason: 'Campo no encontrado' };

    // No mover campos de sistema (CUFE, QR, etc.) — fijos en pie
    if (field.origin === 'system') {
      return { success: false, reason: `"${field.label}" es un campo de sistema y no se puede mover` };
    }

    // No mover campos obligatorios siempre — están fijos por diseño
    if (field.requiredTier === 'obligatorio_siempre') {
      return { success: false, reason: `"${field.label}" es obligatorio y no se puede reubicar` };
    }

    // Validar que el campo no cruce los límites de su sección (eje Y)
    const clampedY = clampToSection(y, field.height, field.section);

    // Validar límites de página (10mm margen)
    const clampedX = Math.max(10, Math.min(x, 210 - field.width - 10));
    const finalY = Math.max(10, Math.min(clampedY, 297 - field.height - 10));

    this.pushHistory();
    this.placedFields.update((fields) =>
      fields.map((f) => (f.id === id ? { ...f, x: clampedX, y: finalY } : f))
    );
    return { success: true };
  }

  /**
   * Actualiza un campo desde el panel de propiedades.
   * Valida que fieldKey no se pueda cambiar.
   */
  updateField(updated: PlacedField): void {
    const current = this.placedFields().find((f) => f.id === updated.id);
    if (!current) return;

    // Nunca permitir cambiar fieldKey
    updated.fieldKey = current.fieldKey;

    // Nunca permitir cambiar origin
    updated.origin = current.origin;

    this.pushHistory();
    this.placedFields.update((fields) =>
      fields.map((f) => (f.id === updated.id ? updated : f))
    );
  }

  /**
   * Elimina un campo. Los campos obligatorios siempre no se pueden eliminar.
   */
  deleteField(id: string): { success: boolean; reason?: string } {
    const field = this.placedFields().find((f) => f.id === id);
    if (!field) return { success: false, reason: 'Campo no encontrado' };

    // No eliminar campos obligatorios siempre
    if (field.requiredTier === 'obligatorio_siempre') {
      return { success: false, reason: `"${field.label}" es obligatorio y no se puede eliminar` };
    }

    this.pushHistory();
    this.placedFields.update((fields) => fields.filter((f) => f.id !== id));
    this.selectedFieldId.set(null);
    return { success: true };
  }

  /**
   * Alterna si un campo opcional es requerido por el usuario.
   * Cuando se marca, el campo se agrega a userRequiredKeys.
   * Cuando se desmarca, se elimina de userRequiredKeys.
   */
  toggleUserRequired(fieldKey: string): void {
    this.userRequiredKeys.update((keys) => {
      const next = new Set(keys);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
      } else {
        next.add(fieldKey);
      }
      return next;
    });
  }

  /**
   * Verifica si un campo fue marcado como requerido por el usuario.
   */
  isUserRequired(fieldKey: string): boolean {
    return this.userRequiredKeys().has(fieldKey);
  }

  /**
   * Verifica si un drop es válido: la sección destino debe coincidir con la sección del campo.
   */
  canDropInSection(fieldDef: FieldDefinition, targetYmm: number): boolean {
    const targetSection = getSectionForY(targetYmm);
    return fieldDef.section === targetSection;
  }

  /**
   * Obtiene la sección visual para una posición Y.
   */
  getSectionForY(yMm: number) {
    return getSectionForY(yMm);
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
    this.userRequiredKeys.set(new Set());
    this.detailTableColumns.set([]);
    this.saveSnapshot();
  }

  reset(): void {
    this.pushHistory();
    this.placedFields.set([]);
    this.selectedFieldId.set(null);
    this.userRequiredKeys.set(new Set());
    this.detailTableColumns.set([]);
    this.saveSnapshot();
  }

  // ============================================
  // SNAPSHOT — Guardar / Descartar Boceto
  // ============================================

  /**
   * Guarda el estado actual como snapshot (último estado guardado).
   * Se llama después de un Guardar exitoso o al cargar una plantilla.
   */
  saveSnapshot(): void {
    this.savedSnapshot.set({
      fields: structuredClone(this.placedFields()),
      tableColumns: structuredClone(this.detailTableColumns()),
      userRequiredKeys: new Set(this.userRequiredKeys()),
    });
  }

  /**
   * Descarta los cambios no guardados y vuelve al último snapshot.
   * No toca endpoints de borrado ni afecta versiones persistidas.
   */
  discardDraft(): void {
    const snap = this.savedSnapshot();
    if (!snap) {
      this.reset();
      return;
    }
    this.pushHistory();
    this.placedFields.set(structuredClone(snap.fields));
    this.detailTableColumns.set(structuredClone(snap.tableColumns));
    this.userRequiredKeys.set(new Set(snap.userRequiredKeys));
    this.selectedFieldId.set(null);
  }

  // ============================================
  // DETALLE TABLE — Columnas dinámicas
  // ============================================

  /**
   * Agrega una columna a la tabla de detalle.
   * Valida que no se duplique y que el section sea válido.
   */
  addDetailColumn(col: Omit<DetailTableColumn, 'id'>): { success: boolean; reason?: string } {
    const existing = this.detailTableColumns();
    if (existing.some((c) => c.bindingSource === col.bindingSource)) {
      return { success: false, reason: `La columna "${col.header}" ya existe en la tabla` };
    }
    const newCol: DetailTableColumn = { ...col, id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    this.detailTableColumns.update((cols) => [...cols, newCol]);
    return { success: true };
  }

  /**
   * Elimina una columna de la tabla de detalle.
   * Las columnas de campos obligatorios siempre no se pueden eliminar.
   */
  removeDetailColumn(colId: string): { success: boolean; reason?: string } {
    const col = this.detailTableColumns().find((c) => c.id === colId);
    if (!col) return { success: false, reason: 'Columna no encontrada' };
    if (col.requiredTier === 'obligatorio_siempre') {
      return { success: false, reason: `"${col.header}" es obligatoria y no se puede eliminar` };
    }
    this.detailTableColumns.update((cols) => cols.filter((c) => c.id !== colId));
    return { success: true };
  }

  /**
   * Actualiza el ancho de una columna.
   */
  updateColumnWidth(colId: string, width: number): void {
    const clamped = Math.max(20, Math.min(width, 200));
    this.detailTableColumns.update((cols) =>
      cols.map((c) => (c.id === colId ? { ...c, width: clamped } : c))
    );
  }
}
