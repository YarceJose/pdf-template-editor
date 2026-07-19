import { Injectable, signal, computed } from '@angular/core';
import {
  TemplateDocument,
  Section,
  TemplateComponent,
  FontDefinition,
  Asset,
  findComponentById,
  DeepPartial,
} from '../../../shared/models/template-json.model';

/**
 * Servicio central — el JSON es el ÚNICO estado del diseñador.
 * Toda modificación pasa por aquí. La UI se reconstruye desde esta señal.
 */
@Injectable({ providedIn: 'root' })
export class TemplateJsonService {
  /** El documento completo — single source of truth */
  document = signal<TemplateDocument | null>(null);

  /** ID del componente actualmente seleccionado */
  selectedComponentId = signal<string | null>(null);

  /** ID de la sección activa (para agregar componentes) */
  activeSectionId = signal<string | null>(null);

  /** Historial para undo/redo */
  private undoStack = signal<TemplateDocument[]>([]);
  private redoStack = signal<TemplateDocument[]>([]);

  // ============================================
  // COMPUTED
  // ============================================
  hasDocument = computed(() => this.document() !== null);
  sections = computed(() => this.document()?.sections ?? []);
  page = computed(() => this.document()?.page);
  styles = computed(() => this.document()?.styles.fonts ?? []);
  assets = computed(() => this.document()?.assets ?? []);

  selectedComponent = computed(() => {
    const id = this.selectedComponentId();
    const doc = this.document();
    if (!id || !doc) return null;
    const result = findComponentById(doc.sections, id);
    return result?.component ?? null;
  });

  selectedSection = computed(() => {
    const id = this.selectedComponentId();
    const doc = this.document();
    if (!id || !doc) return null;
    const result = findComponentById(doc.sections, id);
    return result?.section ?? null;
  });

  canUndo = computed(() => this.undoStack().length > 0);
  canRedo = computed(() => this.redoStack().length > 0);

  // ============================================
  // LOAD / SAVE
  // ============================================

  /** Carga un documento JSON completo */
  loadDocument(doc: TemplateDocument): void {
    this.document.set(doc);
    this.selectedComponentId.set(null);
    this.activeSectionId.set(doc.sections[0]?.id ?? null);
    this.undoStack.set([]);
    this.redoStack.set([]);
  }

  /** Exporta el documento actual (serializa a JSON) */
  exportDocument(): TemplateDocument | null {
    return this.document();
  }

  // ============================================
  // SELECCIÓN
  // ============================================

  selectComponent(id: string | null): void {
    this.selectedComponentId.set(id);
    if (id) {
      const doc = this.document();
      if (doc) {
        const result = findComponentById(doc.sections, id);
        if (result) this.activeSectionId.set(result.section.id);
      }
    }
  }

  // ============================================
  // MODIFICACIONES — Cada una persiste en el JSON
  // ============================================

  /** Actualiza position de un componente */
  updateComponentPosition(componentId: string, x: number, y: number): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result) {
        result.component.position = { x, y };
      }
    });
  }

  /** Actualiza size de un componente */
  updateComponentSize(componentId: string, width: number, height: number): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result) {
        result.component.size = { width, height };
        // Para líneas, actualizar end position
        if (result.component.type === 'Line') {
          const comp = result.component;
          comp.end = { x: comp.start.x + width, y: comp.start.y + height };
        }
      }
    });
  }

  /** Actualiza propiedades de un componente Text */
  updateTextComponent(componentId: string, updates: Partial<{
    staticValue: string;
    prefix: string;
    suffix: string;
    styleRef: string;
    alignment: 'Left' | 'Center' | 'Right' | 'Justify';
    hideIfEmpty: boolean;
  }>): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result && result.component.type === 'Text') {
        Object.assign(result.component, updates);
      }
    });
  }

  /** Actualiza propiedades de un componente Image */
  updateImageComponent(componentId: string, updates: Partial<{
    assetId: string;
    fit: 'Contain' | 'Cover' | 'Fill' | 'None';
  }>): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result && result.component.type === 'Image') {
        Object.assign(result.component, updates);
      }
    });
  }

  /** Actualiza propiedades de un componente Rectangle */
  updateRectangleComponent(componentId: string, updates: Partial<{
    stroke: string;
    strokeWidth: number;
    fill: string | null;
    cornerRadius: number;
  }>): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result && result.component.type === 'Rectangle') {
        Object.assign(result.component, updates);
      }
    });
  }

  /** Actualiza propiedades de un componente Line */
  updateLineComponent(componentId: string, updates: Partial<{
    stroke: string;
    strokeWidth: number;
    start: { x: number; y: number };
    end: { x: number; y: number };
  }>): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result && result.component.type === 'Line') {
        Object.assign(result.component, updates);
      }
    });
  }

  /** Actualiza propiedades de un componente Table */
  updateTableComponent(componentId: string, updates: Partial<{
    headerStyleRef: string;
    rowStyleRef: string;
    headerBackground: string;
    rowAltBackground: string;
    borderColor: string;
    borderWidth: number;
    repeatHeaderOnNewPage: boolean;
    rowHeight: number;
  }>): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result && result.component.type === 'Table') {
        Object.assign(result.component, updates);
      }
    });
  }

  /** Actualiza una columna de tabla */
  updateTableColumn(componentId: string, columnId: string, updates: Partial<{
    header: string;
    width: number;
    align: 'Left' | 'Center' | 'Right';
  }>): void {
    this.mutateDocument((doc) => {
      const result = findComponentById(doc.sections, componentId);
      if (result && result.component.type === 'Table') {
        const col = result.component.columns.find((c) => c.id === columnId);
        if (col) Object.assign(col, updates);
      }
    });
  }

  /** Actualiza bounds de una sección */
  updateSectionBounds(sectionId: string, bounds: Partial<{ x: number; y: number; width: number; height: number }>): void {
    this.mutateDocument((doc) => {
      const section = doc.sections.find((s) => s.id === sectionId);
      if (section) {
        Object.assign(section.bounds, bounds);
      }
    });
  }

  /** Agrega un componente a una sección */
  addComponent(sectionId: string, component: TemplateComponent): void {
    this.mutateDocument((doc) => {
      const section = doc.sections.find((s) => s.id === sectionId);
      if (section) {
        section.components.push(component);
      }
    });
  }

  /** Elimina un componente */
  removeComponent(componentId: string): void {
    this.mutateDocument((doc) => {
      for (const section of doc.sections) {
        const idx = section.components.findIndex((c) => c.id === componentId);
        if (idx !== -1) {
          section.components.splice(idx, 1);
          break;
        }
      }
    });
    if (this.selectedComponentId() === componentId) {
      this.selectedComponentId.set(null);
    }
  }

  /** Duplica un componente */
  duplicateComponent(componentId: string): TemplateComponent | null {
    const result = findComponentById(this.document()?.sections ?? [], componentId);
    if (!result) return null;

    const clone: TemplateComponent = JSON.parse(JSON.stringify(result.component));
    clone.id = `${clone.id}_copy_${Date.now()}`;
    clone.position = { x: clone.position.x + 10, y: clone.position.y + 10 };

    this.addComponent(result.section.id, clone);
    this.selectComponent(clone.id);
    return clone;
  }

  // ============================================
  // UNDO / REDO
  // ============================================

  undo(): void {
    const stack = this.undoStack();
    if (stack.length === 0) return;

    const current = this.document();
    if (current) this.redoStack.update((s) => [...s, JSON.parse(JSON.stringify(current))]);

    const prev = stack[stack.length - 1];
    this.undoStack.update((s) => s.slice(0, -1));
    this.document.set(prev);
  }

  redo(): void {
    const stack = this.redoStack();
    if (stack.length === 0) return;

    const current = this.document();
    if (current) this.undoStack.update((s) => [...s, JSON.parse(JSON.stringify(current))]);

    const next = stack[stack.length - 1];
    this.redoStack.update((s) => s.slice(0, -1));
    this.document.set(next);
  }

  // ============================================
  // MUTATION HELPER — push history + apply
  // ============================================

  private mutateDocument(mutator: (doc: TemplateDocument) => void): void {
    const current = this.document();
    if (!current) return;

    // Push current state to undo stack
    this.undoStack.update((s) => [...s, JSON.parse(JSON.stringify(current))]);
    this.redoStack.set([]);

    // Clone and mutate
    const clone: TemplateDocument = JSON.parse(JSON.stringify(current));
    mutator(clone);

    // Set new state — Angular signals will trigger re-render
    this.document.set(clone);
  }
}
