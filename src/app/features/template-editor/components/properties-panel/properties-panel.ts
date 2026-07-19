import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PlacedField, clampToSection, getSectionZone } from '../../../../shared/models/placed-field.model';
import { FieldValidationService, ValidationError } from '../../services/field-validation';
import { TemplateStateService } from '../../services/template-state';
import { DetailTableComponent } from '../detail-table/detail-table';
import { FIELD_CATEGORIES } from '../../../../shared/models/field.model';

const A4_W = 210;
const A4_H = 297;
const MARGIN = 10;
const MIN_W = 20;
const MIN_H = 5;
const MAX_W = 190;
const MAX_H = 277;

@Component({
  selector: 'app-properties-panel',
  imports: [FormsModule, LucideAngularModule, DetailTableComponent],
  templateUrl: './properties-panel.html',
  styleUrl: './properties-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesPanel {
  private validation = inject(FieldValidationService);
  private state = inject(TemplateStateService);

  field = input<PlacedField | null>(null);
  isDetailTableSelected = input<boolean>(false);
  fieldUpdated = output<PlacedField>();
  fieldDeleted = output<string>();
  uploadImage = output<void>();

  hasField = computed(() => this.field() !== null);
  isLocked = computed(() => this.field()?.requiredTier === 'obligatorio_siempre');
  isSystem = computed(() => this.field()?.origin === 'system');
  isEditable = computed(() => {
    const f = this.field();
    if (!f) return false;
    return f.requiredTier !== 'obligatorio_siempre';
  });

  /** Lista de fieldKeys disponibles del diccionario DIAN */
  availableFieldKeys = computed(() => {
    const currentKey = this.field()?.fieldKey;
    const allFields = FIELD_CATEGORIES.flatMap((g) => g.fields);
    const uniqueKeys = new Map<string, string>();
    for (const f of allFields) {
      if (!uniqueKeys.has(f.fieldKey)) {
        uniqueKeys.set(f.fieldKey, f.label);
      }
    }
    // Si el campo actual tiene un fieldKey no estándar, agregarlo
    if (currentKey && !uniqueKeys.has(currentKey)) {
      uniqueKeys.set(currentKey, currentKey);
    }
    return Array.from(uniqueKeys.entries()).map(([key, label]) => ({ key, label }));
  });

  /** Puede cambiar fieldKey solo si es editable (no obligatorio_siempre) */
  canChangeBinding = computed(() => {
    const f = this.field();
    if (!f) return false;
    return f.requiredTier !== 'obligatorio_siempre' && f.origin !== 'system';
  });

  sectionBounds = computed(() => {
    const f = this.field();
    if (!f) return { yStart: 0, yEnd: 297, label: 'Página' };
    const zone = getSectionZone(f.section);
    return { yStart: zone.yStart, yEnd: zone.yEnd, label: zone.label };
  });

  fieldErrors = computed<ValidationError[]>(() => {
    const f = this.field();
    if (!f) return [];
    const allErrors = this.validation.validateAll(this.state.placedFields());
    return allErrors.filter((e) => e.fieldId === f.id);
  });

  fieldErrorCount = computed(() => this.fieldErrors().filter((e) => e.severity === 'error').length);
  fieldWarningCount = computed(() => this.fieldErrors().filter((e) => e.severity === 'warning').length);

  updateProperty<K extends keyof PlacedField>(key: K, value: PlacedField[K]): void {
    const f = this.field();
    if (!f) return;

    // Bloquear cambios en origin (nunca)
    if (key === 'origin') return;

    // fieldKey: solo si canChangeBinding
    if (key === 'fieldKey' && !this.canChangeBinding()) return;

    this.fieldUpdated.emit({ ...f, [key]: value });
  }

  updateLabel(value: string): void {
    this.updateProperty('label', value);
  }

  updateNumberProperty(key: 'x' | 'y' | 'width' | 'height' | 'fontSize', rawValue: string): void {
    const f = this.field();
    if (!f) return;

    const num = parseFloat(rawValue);
    if (isNaN(num) || num < 0) return;

    let clamped = num;

    switch (key) {
      case 'x':
        clamped = Math.max(MARGIN, Math.min(num, A4_W - f.width - MARGIN));
        break;
      case 'y': {
        const zone = getSectionZone(f.section);
        const maxY = zone.yEnd - f.height;
        clamped = Math.max(zone.yStart, Math.min(num, maxY));
        clamped = Math.max(MARGIN, Math.min(clamped, A4_H - f.height - MARGIN));
        break;
      }
      case 'width':
        clamped = Math.max(MIN_W, Math.min(num, MAX_W));
        break;
      case 'height':
        clamped = Math.max(MIN_H, Math.min(num, MAX_H));
        break;
      case 'fontSize':
        clamped = Math.max(6, Math.min(num, 72));
        break;
    }

    this.updateProperty(key, clamped);
  }

  toggleBold(): void {
    const f = this.field();
    if (f) this.updateProperty('bold', !f.bold);
  }

  toggleItalic(): void {
    const f = this.field();
    if (f) this.updateProperty('italic', !f.italic);
  }

  toggleUnderline(): void {
    const f = this.field();
    if (f) this.updateProperty('underline', !f.underline);
  }

  updateColorFromHex(key: 'color' | 'borderColor', raw: string): void {
    const val = raw.trim();
    if (!val) {
      this.updateProperty(key, undefined);
    } else if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      this.updateProperty(key, val);
    }
  }

  updateBorderWidth(raw: string): void {
    const num = parseFloat(raw);
    if (isNaN(num) || num < 0) return;
    this.updateProperty('borderWidth', Math.min(5, num));
  }

  onDelete(): void {
    const f = this.field();
    if (f) this.fieldDeleted.emit(f.id);
  }

  private pendingUrl = '';

  onImageUrlChange(url: string): void {
    this.pendingUrl = url.trim();
  }

  onApplyUrl(): void {
    const f = this.field();
    if (!f || !this.pendingUrl) return;
    this.updateProperty('imageUrl', this.pendingUrl);
    this.pendingUrl = '';
  }

  onUploadClick(): void {
    this.uploadImage.emit();
  }

  onRemoveImage(): void {
    this.updateProperty('imageUrl', undefined);
  }

  formatDateDisplay(dateStr: string): string {
    // Formato DD/MM/AAAA para campos de tipo fecha
    if (!dateStr) return '';
    const parts = dateStr.split(/[/\-.]/);
    if (parts.length === 3) {
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
    }
    return dateStr;
  }

  sectionLabel(section: string): string {
    const labels: Record<string, string> = {
      encabezado: 'Encabezado',
      cliente: 'Cliente',
      detalle: 'Detalle',
      totales: 'Totales',
      pie: 'Pie de Página',
    };
    return labels[section] ?? section;
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      string: 'Texto',
      decimal: 'Decimal',
      date: 'Fecha',
      integer: 'Entero',
      qrcode: 'Código QR',
      'text-block': 'Bloque de Texto',
      image: 'Imagen',
    };
    return labels[type] ?? type;
  }
}
