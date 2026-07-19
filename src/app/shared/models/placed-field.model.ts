// ============================================
// PLACED FIELD MODEL — Canvas placed field
// Extended with fieldKey, origin, sourceNode, type, requiredTier
// ============================================

export type PageSection = 'encabezado' | 'detalle' | 'totales' | 'pie';

export interface PageSectionZone {
  key: PageSection;
  label: string;
  yStart: number;  // mm
  yEnd: number;    // mm
  color: string;
}

export const PAGE_SECTIONS: PageSectionZone[] = [
  { key: 'encabezado', label: 'Encabezado', yStart: 0, yEnd: 50, color: '#2563EB' },
  { key: 'detalle',    label: 'Detalle',    yStart: 50, yEnd: 180, color: '#1E293B' },
  { key: 'totales',    label: 'Totales',    yStart: 180, yEnd: 247, color: '#D97706' },
  { key: 'pie',        label: 'Pie de Página', yStart: 247, yEnd: 297, color: '#DC2626' },
];

export function getSectionForY(yMm: number): PageSection {
  if (yMm < 50) return 'encabezado';
  if (yMm < 180) return 'detalle';
  if (yMm < 247) return 'totales';
  return 'pie';
}

export function getSectionZone(section: PageSection): PageSectionZone {
  return PAGE_SECTIONS.find((z) => z.key === section)!;
}

export function clampToSection(yMm: number, heightMm: number, section: PageSection): number {
  const zone = getSectionZone(section);
  const maxY = zone.yEnd - heightMm;
  return Math.max(zone.yStart, Math.min(yMm, maxY));
}

export interface PlacedField {
  id: string;
  /** Nombre técnico inmutable (mapeo XML) */
  fieldKey: string;
  /** Título visible, editable desde panel de propiedades */
  label: string;
  placeholder: string;
  category: string;
  /** Sección asignada (debe coincidir con la sección del campo en el diccionario) */
  section: PageSection;
  /** Origen: xml-mapping o system */
  origin: 'xml-mapping' | 'system';
  /** Nodo XML de origen */
  sourceNode: string | null;
  /** Tipo de dato */
  type: 'string' | 'decimal' | 'date' | 'integer' | 'qrcode' | 'text-block' | 'image';
  /** Nivel de obligatoriedad */
  requiredTier: 'obligatorio_siempre' | 'obligatorio_validacion' | 'opcional';

  // Posición visual (mm)
  x: number;
  y: number;
  width: number;
  height: number;

  // Estilo visual
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;

  /** Data URL de imagen local (solo para type=image) */
  imageUrl?: string;
}
