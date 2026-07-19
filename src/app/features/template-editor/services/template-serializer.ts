import { Injectable } from '@angular/core';
import { PlacedField, PageSection } from '../../../shared/models/placed-field.model';

export interface TemplateDefinition {
  version: string;
  name: string;
  page: {
    widthMm: number;
    heightMm: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
  };
  fields: SerializedField[];
}

export interface SerializedField {
  id: string;
  fieldKey: string;
  label: string;
  placeholder: string;
  category: string;
  section: PageSection;
  origin: 'xml-mapping' | 'system';
  sourceNode: string | null;
  type: 'string' | 'decimal' | 'date' | 'integer' | 'qrcode' | 'text-block' | 'image';
  requiredTier: 'obligatorio_siempre' | 'obligatorio_validacion' | 'opcional';
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fontSize: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class TemplateSerializerService {
  serialize(fields: PlacedField[], name: string): TemplateDefinition {
    return {
      version: '1.0.0',
      name,
      page: {
        widthMm: 210,
        heightMm: 297,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
      },
      fields: fields.map((f) => this.serializeField(f)),
    };
  }

  private serializeField(field: PlacedField): SerializedField {
    return {
      id: field.id,
      fieldKey: field.fieldKey,
      label: field.label,
      placeholder: field.placeholder,
      category: field.category,
      section: field.section,
      origin: field.origin,
      sourceNode: field.sourceNode,
      type: field.type,
      requiredTier: field.requiredTier,
      position: { x: field.x, y: field.y },
      size: { width: field.width, height: field.height },
      style: {
        fontSize: field.fontSize,
        bold: field.bold,
        italic: field.italic,
        underline: field.underline,
      },
    };
  }

  deserialize(json: TemplateDefinition): PlacedField[] {
    return json.fields.map((sf) => ({
      id: sf.id,
      fieldKey: sf.fieldKey,
      label: sf.label,
      placeholder: sf.placeholder,
      category: sf.category,
      section: sf.section,
      origin: sf.origin,
      sourceNode: sf.sourceNode ?? null,
      type: sf.type,
      requiredTier: sf.requiredTier,
      x: sf.position.x,
      y: sf.position.y,
      width: sf.size.width,
      height: sf.size.height,
      fontSize: sf.style.fontSize,
      bold: sf.style.bold,
      italic: sf.style.italic,
      underline: sf.style.underline,
    }));
  }

  toJSON(fields: PlacedField[], name: string): string {
    return JSON.stringify(this.serialize(fields, name), null, 2);
  }
}
