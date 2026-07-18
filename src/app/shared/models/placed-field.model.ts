export type PageSection = 'header' | 'body' | 'footer';

export interface PageSectionZone {
  key: PageSection;
  label: string;
  yStart: number;  // mm
  yEnd: number;    // mm
  color: string;
}

export const PAGE_SECTIONS: PageSectionZone[] = [
  { key: 'header', label: 'Encabezado', yStart: 0, yEnd: 50, color: '#E35E14' },
  { key: 'body',   label: 'Cuerpo',     yStart: 50, yEnd: 247, color: '#2D3539' },
  { key: 'footer', label: 'Pie de Página', yStart: 247, yEnd: 297, color: '#7D091B' },
];

export function getSectionForY(yMm: number): PageSection {
  if (yMm < 50) return 'header';
  if (yMm < 247) return 'body';
  return 'footer';
}

export interface PlacedField {
  id: string;
  fieldId: string;
  label: string;
  placeholder: string;
  category: string;
  section: PageSection;
  x: number;      // mm desde izquierda
  y: number;      // mm desde arriba
  width: number;  // mm
  height: number; // mm
  fontSize: number; // pt
  bold: boolean;
  italic: boolean;
  underline: boolean;
}
