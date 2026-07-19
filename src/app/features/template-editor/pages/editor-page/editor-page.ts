import { Component, ChangeDetectionStrategy, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Toolbar, TextToolType, ElementToolType, AlignType } from '../../components/toolbar/toolbar';
import { SidebarFields } from '../../components/sidebar-fields/sidebar-fields';
import { Canvas } from '../../components/canvas/canvas';
import { PropertiesPanel } from '../../components/properties-panel/properties-panel';
import { PreviewModal } from '../../components/preview-modal/preview-modal';
import { SectionRenderer } from '../../components/section-renderer/section-renderer';
import { TemplateStateService } from '../../services/template-state';
import { TemplateSerializerService } from '../../services/template-serializer';
import { TemplateApiService } from '../../services/template-api';
import { TemplateJsonService } from '../../services/template-json.service';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts';
import { FieldDefinition } from '../../../../shared/models/field.model';
import { PlacedField } from '../../../../shared/models/placed-field.model';
import { DesignTemplate } from '../../../../shared/models/design-templates.model';
import { TemplateDocument } from '../../../../shared/models/template-json.model';
import facturaEstandarArinvoice from '../../../../../assets/templates/factura-estandar-arinvoice.json';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-editor-page',
  imports: [Toolbar, SidebarFields, Canvas, PropertiesPanel, PreviewModal, SectionRenderer],
  templateUrl: './editor-page.html',
  styleUrl: './editor-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPage implements OnInit {
  private state = inject(TemplateStateService);
  private serializer = inject(TemplateSerializerService);
  private api = inject(TemplateApiService);
  private templateJson = inject(TemplateJsonService);
  private keyboard = inject(KeyboardShortcutsService);

  @ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;

  placedFields = this.state.placedFields;
  selectedFieldId = this.state.selectedFieldId;
  selectedField = this.state.selectedField;
  zoom = this.state.zoom;
  canUndo = this.state.canUndo;
  canRedo = this.state.canRedo;
  fieldCount = this.state.fieldCount;
  hasUnsavedChanges = this.state.hasUnsavedChanges;
  isDetailTableSelected = this.state.selectedDetailTable;

  showPreview = signal(false);
  showGrid = signal(false);
  snapEnabled = signal(false);
  saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  private currentTemplateId = signal<string | null>(null);

  // ============================================
  // DISEÑO JSON AVANZADO — contrato TemplateDocument (secciones/componentes en pt)
  // ============================================
  showAdvancedJson = signal(false);
  advancedSections = this.templateJson.sections;
  advancedPageWidthPx = () => (this.templateJson.page()?.width ?? 0) * PT_TO_PX * this.zoom();
  advancedPageHeightPx = () => (this.templateJson.page()?.height ?? 0) * PT_TO_PX * this.zoom();

  ngOnInit(): void {
    this.keyboard.init();
  }

  onToggleAdvancedJson(): void {
    if (!this.templateJson.hasDocument()) {
      this.templateJson.loadDocument(facturaEstandarArinvoice as unknown as TemplateDocument);
    }
    this.showAdvancedJson.update((v) => !v);
  }

  onAdvancedPageClicked(): void {
    this.templateJson.selectComponent(null);
  }

  get zoomPercent(): number {
    return Math.round(this.zoom() * 100);
  }

  onFieldDropped(event: { def: FieldDefinition; x: number; y: number }): void {
    this.state.addField(event.def, event.x, event.y);
  }

  onFieldSelected(id: string): void {
    this.state.selectField(id);
  }

  onFieldMoved(event: { id: string; x: number; y: number }): void {
    this.state.moveField(event.id, event.x, event.y);
  }

  onFieldUpdated(updated: PlacedField): void {
    this.state.updateField(updated);
  }

  onFieldDeleted(id: string): void {
    this.state.deleteField(id);
  }

  onPageClicked(): void {
    this.state.selectField(null);
  }

  onDetailTableSelected(): void {
    this.state.selectDetailTable();
  }

  onUndo(): void {
    this.state.undo();
  }

  onRedo(): void {
    this.state.redo();
  }

  onZoomIn(): void {
    this.state.zoomIn();
  }

  onZoomOut(): void {
    this.state.zoomOut();
  }

  onDeleteField(): void {
    const id = this.selectedFieldId();
    if (id) this.state.deleteField(id);
  }

  onDiscardDraft(): void {
    this.state.discardDraft();
  }

  onPreview(): void {
    this.showPreview.set(true);
  }

  onClosePreview(): void {
    this.showPreview.set(false);
  }

  onExport(): void {
    const json = this.showAdvancedJson()
      ? JSON.stringify(this.templateJson.exportDocument(), null, 2)
      : this.serializer.toJSON(this.placedFields(), 'template_definition');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.showAdvancedJson() ? 'template_definition_json.json' : 'template_definition.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  onSave(): void {
    const id = this.currentTemplateId();
    const fields = this.placedFields();
    const name = 'Factura Electrónica v1.0';

    this.saveStatus.set('saving');

    const request$ = id
      ? this.api.updateTemplate(id, fields, name)
      : this.api.saveTemplate(fields, name);

    request$.subscribe({
      next: (res) => {
        if (res.id) this.currentTemplateId.set(res.id);
        this.state.saveSnapshot();
        this.saveStatus.set('saved');
        setTimeout(() => this.saveStatus.set('idle'), 2000);
      },
      error: () => {
        this.saveStatus.set('error');
        setTimeout(() => this.saveStatus.set('idle'), 3000);
      },
    });
  }

  onTemplateLoaded(template: DesignTemplate): void {
    this.state.loadTemplate(template);
  }

  onAddText(type: TextToolType): void {
    const labelMap: Record<TextToolType, string> = {
      text: 'Texto',
      heading: 'Encabezado',
      label: 'Label',
      field: 'Campo',
      number: 'Número',
      date: 'Fecha',
    };
    const def: FieldDefinition = {
      id: `custom-${type}-${Date.now()}`,
      fieldKey: `Custom_${type}_${Date.now()}`,
      label: labelMap[type],
      placeholder: `[${labelMap[type]}]`,
      category: 'custom',
      section: 'encabezado',
      origin: 'xml-mapping',
      sourceNode: null,
      type: 'text-block',
      requiredTier: 'opcional',
      defaultWidthMm: type === 'heading' ? 80 : 50,
      defaultHeightMm: type === 'heading' ? 12 : 6,
    };
    this.state.addField(def, 20, 60);
  }

  onAddTable(event: { cols: number; rows: number }): void {
    const { cols, rows } = event;
    const def: FieldDefinition = {
      id: `table-${cols}x${rows}-${Date.now()}`,
      fieldKey: `Table_${cols}x${rows}_${Date.now()}`,
      label: `Tabla ${cols}×${rows}`,
      placeholder: `[Tabla ${cols}×${rows}]`,
      category: 'table',
      section: 'detalle',
      origin: 'xml-mapping',
      sourceNode: null,
      type: 'text-block',
      requiredTier: 'opcional',
      defaultWidthMm: cols * 30,
      defaultHeightMm: rows * 8,
    };
    this.state.addField(def, 10, 60);
  }

  onAddElement(type: ElementToolType): void {
    if (type === 'image') {
      this.imageFileInput.nativeElement.click();
      return;
    }
    const configMap: Record<string, { label: string; w: number; h: number }> = {
      line: { label: 'Línea', w: 100, h: 1 },
      rectangle: { label: 'Caja', w: 50, h: 30 },
      qr: { label: 'Código QR', w: 25, h: 25 },
    };
    const cfg = configMap[type];
    const def: FieldDefinition = {
      id: `element-${type}-${Date.now()}`,
      fieldKey: `Element_${type}_${Date.now()}`,
      label: cfg.label,
      placeholder: `[${cfg.label}]`,
      category: 'element',
      section: 'encabezado',
      origin: 'xml-mapping',
      sourceNode: null,
      type: type === 'qr' ? 'qrcode' : 'text-block',
      requiredTier: 'opcional',
      defaultWidthMm: cfg.w,
      defaultHeightMm: cfg.h,
    };
    this.state.addField(def, 10, 60);
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const def: FieldDefinition = {
        id: `image-${Date.now()}`,
        fieldKey: `Image_${Date.now()}`,
        label: file.name.replace(/\.[^.]+$/, ''),
        placeholder: '[Imagen]',
        category: 'element',
        section: 'encabezado',
        origin: 'xml-mapping',
        sourceNode: null,
        type: 'image',
        requiredTier: 'opcional',
        defaultWidthMm: 40,
        defaultHeightMm: 30,
      };
      const placed = this.state.addField(def, 10, 60);
      if (placed) {
        this.state.updateFieldImage(placed.id, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onAlign(alignment: AlignType): void {
    const fields = this.placedFields();
    const selId = this.selectedFieldId();
    if (!selId || fields.length === 0) return;

    const selected = fields.find((f) => f.id === selId);
    if (!selected) return;

    const PAGE_WIDTH_MM = 210;
    const PAGE_HEIGHT_MM = 297;

    let x = selected.x;
    let y = selected.y;

    switch (alignment) {
      case 'left': x = 10; break;
      case 'center-horizontal': x = (PAGE_WIDTH_MM - selected.width) / 2; break;
      case 'right': x = PAGE_WIDTH_MM - 10 - selected.width; break;
      case 'top': y = 10; break;
      case 'center-vertical': y = (PAGE_HEIGHT_MM - selected.height) / 2; break;
      case 'bottom': y = PAGE_HEIGHT_MM - 10 - selected.height; break;
    }

    this.state.moveField(selId, Math.max(10, x), Math.max(10, y));
  }

  onGridToggle(): void {
    this.showGrid.set(!this.showGrid());
  }

  onSnapToggle(): void {
    this.snapEnabled.set(!this.snapEnabled());
  }
}
