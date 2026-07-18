import { Injectable } from '@angular/core';
import { PlacedField } from '../../../shared/models/placed-field.model';

export interface ValidationError {
  fieldId: string;
  message: string;
  severity: 'error' | 'warning';
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MIN_WIDTH_MM = 20;
const MIN_HEIGHT_MM = 5;
const MAX_WIDTH_MM = 190;
const MAX_HEIGHT_MM = 277;

@Injectable({ providedIn: 'root' })
export class FieldValidationService {
  validate(fields: PlacedField[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of fields) {
      if (field.width < MIN_WIDTH_MM) {
        errors.push({
          fieldId: field.id,
          message: `${field.label}: ancho mínimo ${MIN_WIDTH_MM}mm`,
          severity: 'error',
        });
      }
      if (field.width > MAX_WIDTH_MM) {
        errors.push({
          fieldId: field.id,
          message: `${field.label}: ancho máximo ${MAX_WIDTH_MM}mm`,
          severity: 'error',
        });
      }
      if (field.height < MIN_HEIGHT_MM) {
        errors.push({
          fieldId: field.id,
          message: `${field.label}: alto mínimo ${MIN_HEIGHT_MM}mm`,
          severity: 'error',
        });
      }
      if (field.x + field.width > A4_WIDTH_MM) {
        errors.push({
          fieldId: field.id,
          message: `${field.label}: se sale del ancho de la página`,
          severity: 'error',
        });
      }
      if (field.y + field.height > A4_HEIGHT_MM) {
        errors.push({
          fieldId: field.id,
          message: `${field.label}: se sale del alto de la página`,
          severity: 'error',
        });
      }
    }

    const overlaps = this.findOverlaps(fields);
    for (const overlap of overlaps) {
      errors.push({
        fieldId: overlap.a.id,
        message: `${overlap.a.label} se superpone con ${overlap.b.label}`,
        severity: 'warning',
      });
    }

    return errors;
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
