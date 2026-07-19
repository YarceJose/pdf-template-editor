import { Injectable, inject } from '@angular/core';
import { PlacedField, getSectionForY, PAGE_SECTIONS } from '../../../shared/models/placed-field.model';
import { FIELD_CATEGORIES, FieldDefinition } from '../../../shared/models/field.model';
import { TemplateStateService } from './template-state';

export interface ValidationError {
  fieldId: string;
  fieldKey: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MIN_WIDTH_MM = 20;
const MIN_HEIGHT_MM = 5;
const MAX_WIDTH_MM = 190;
const MAX_HEIGHT_MM = 277;
const MARGIN_MM = 10;

@Injectable({ providedIn: 'root' })
export class FieldValidationService {
  private state = inject(TemplateStateService);
  validate(fields: PlacedField[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of fields) {
      // Dimensiones mínimas
      if (field.width < MIN_WIDTH_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": ancho mínimo ${MIN_WIDTH_MM}mm (actual: ${field.width}mm)`,
          severity: 'error',
          code: 'MIN_WIDTH',
        });
      }
      if (field.height < MIN_HEIGHT_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": alto mínimo ${MIN_HEIGHT_MM}mm (actual: ${field.height}mm)`,
          severity: 'error',
          code: 'MIN_HEIGHT',
        });
      }

      // Dimensiones máximas
      if (field.width > MAX_WIDTH_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": ancho máximo ${MAX_WIDTH_MM}mm (actual: ${field.width}mm)`,
          severity: 'error',
          code: 'MAX_WIDTH',
        });
      }
      if (field.height > MAX_HEIGHT_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": alto máximo ${MAX_HEIGHT_MM}mm (actual: ${field.height}mm)`,
          severity: 'error',
          code: 'MAX_HEIGHT',
        });
      }

      // Fuera de página (eje X)
      if (field.x < MARGIN_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": posición X menor al margen (${field.x}mm < ${MARGIN_MM}mm)`,
          severity: 'error',
          code: 'OUT_OF_PAGE_LEFT',
        });
      }
      if (field.x + field.width > A4_WIDTH_MM - MARGIN_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": se sale del ancho de la página (${field.x + field.width}mm > ${A4_WIDTH_MM - MARGIN_MM}mm)`,
          severity: 'error',
          code: 'OUT_OF_PAGE_RIGHT',
        });
      }

      // Fuera de página (eje Y)
      if (field.y < MARGIN_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": posición Y menor al margen (${field.y}mm < ${MARGIN_MM}mm)`,
          severity: 'error',
          code: 'OUT_OF_PAGE_TOP',
        });
      }
      if (field.y + field.height > A4_HEIGHT_MM - MARGIN_MM) {
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": se sale del alto de la página (${field.y + field.height}mm > ${A4_HEIGHT_MM - MARGIN_MM}mm)`,
          severity: 'error',
          code: 'OUT_OF_PAGE_BOTTOM',
        });
      }

      // Fuera de sección asignada
      const currentSection = getSectionForY(field.y);
      if (currentSection !== field.section) {
        const zone = PAGE_SECTIONS.find((z) => z.key === field.section);
        errors.push({
          fieldId: field.id,
          fieldKey: field.fieldKey,
          message: `"${field.label}": está en sección "${currentSection}" pero pertenece a "${field.section}" (${zone?.yStart}-${zone?.yEnd}mm)`,
          severity: 'error',
          code: 'WRONG_SECTION',
        });
      }
    }

    // Superposición de campos
    const overlaps = this.findOverlaps(fields);
    for (const overlap of overlaps) {
      errors.push({
        fieldId: overlap.a.id,
        fieldKey: overlap.a.fieldKey,
        message: `"${overlap.a.label}" se superpone con "${overlap.b.label}"`,
        severity: 'warning',
        code: 'OVERLAP',
      });
    }

    return errors;
  }

  /**
   * Valida que todos los campos obligatorios estén presentes en el template.
   * Compara contra el diccionario DIAN.
   */
  validateRequiredFields(fields: PlacedField[]): ValidationError[] {
    const errors: ValidationError[] = [];

    const requiredFields = FIELD_CATEGORIES
      .flatMap((g) => g.fields)
      .filter((f) => f.requiredTier === 'obligatorio_siempre');

    const placedKeys = new Set(fields.map((f) => f.fieldKey));

    for (const req of requiredFields) {
      if (!placedKeys.has(req.fieldKey)) {
        errors.push({
          fieldId: '',
          fieldKey: req.fieldKey,
          message: `Campo obligatorio faltante: "${req.label}" (${req.fieldKey})`,
          severity: 'error',
          code: 'MISSING_REQUIRED',
        });
      }
    }

    return errors;
  }

  /**
   * Valida campos que el usuario marcó como obligatorios via checkbox
   * pero no están en el template.
   */
  validateConditionalRequired(fields: PlacedField[]): ValidationError[] {
    const errors: ValidationError[] = [];

    const userRequiredKeys = this.state.userRequiredKeys();
    const placedKeys = new Set(fields.map((f) => f.fieldKey));

    for (const key of userRequiredKeys) {
      if (!placedKeys.has(key)) {
        // Buscar el label del campo en el diccionario
        const allFields = FIELD_CATEGORIES.flatMap((g) => g.fields);
        const def = allFields.find((f) => f.fieldKey === key);
        const label = def?.label ?? key;

        errors.push({
          fieldId: '',
          fieldKey: key,
          message: `Campo marcado como obligatorio pero no está en el template: "${label}"`,
          severity: 'error',
          code: 'CONDITIONAL_REQUIRED_MISSING',
        });
      }
    }

    return errors;
  }

  /**
   * Valida un template completo (todos los checks).
   */
  validateAll(fields: PlacedField[]): ValidationError[] {
    return [
      ...this.validate(fields),
      ...this.validateRequiredFields(fields),
      ...this.validateConditionalRequired(fields),
    ];
  }

  getErrorSummary(errors: ValidationError[]): { errors: number; warnings: number } {
    return {
      errors: errors.filter((e) => e.severity === 'error').length,
      warnings: errors.filter((e) => e.severity === 'warning').length,
    };
  }

  private findOverlaps(fields: PlacedField[]): { a: PlacedField; b: PlacedField }[] {
    const overlaps: { a: PlacedField; b: PlacedField }[] = [];
    for (let i = 0; i < fields.length; i++) {
      for (let j = i + 1; j < fields.length; j++) {
        if (this.rectsOverlap(fields[i], fields[j])) {
          overlaps.push({ a: fields[i], b: fields[j] });
        }
      }
    }
    return overlaps;
  }

  private rectsOverlap(a: PlacedField, b: PlacedField): boolean {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }
}
