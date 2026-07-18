import { PlacedField } from './placed-field.model';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  fields: Omit<PlacedField, 'id'>[];
}

let tplFieldId = 1;

function makeField(overrides: Partial<PlacedField> & { fieldId: string; label: string; category: string }): Omit<PlacedField, 'id'> {
  return {
    placeholder: `[${overrides.label}]`,
    section: 'body',
    x: 10,
    y: 10,
    width: 40,
    height: 8,
    fontSize: 10,
    bold: false,
    italic: false,
    underline: false,
    ...overrides,
  };
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'factura-electronica',
    name: 'Factura Electrónica DIAN',
    description: 'Plantilla estándar para facturación electrónica colombiana',
    fields: [
      makeField({ fieldId: 'company_logo', label: 'Logo Empresa', category: 'company', x: 10, y: 10, width: 40, height: 20, section: 'header' }),
      makeField({ fieldId: 'company_name', label: 'Nombre Empresa', category: 'company', x: 60, y: 10, width: 80, height: 8, fontSize: 14, bold: true, section: 'header' }),
      makeField({ fieldId: 'company_nit', label: 'NIT', category: 'company', x: 60, y: 20, width: 80, height: 8, section: 'header' }),
      makeField({ fieldId: 'company_address', label: 'Dirección', category: 'company', x: 60, y: 28, width: 80, height: 8, section: 'header' }),
      makeField({ fieldId: 'customer_name', label: 'Nombre Cliente', category: 'customer', x: 10, y: 60, width: 90, height: 8, bold: true, section: 'body' }),
      makeField({ fieldId: 'customer_nit', label: 'NIT Cliente', category: 'customer', x: 110, y: 60, width: 50, height: 8, section: 'body' }),
      makeField({ fieldId: 'customer_address', label: 'Dirección Cliente', category: 'customer', x: 10, y: 70, width: 150, height: 8, section: 'body' }),
      makeField({ fieldId: 'item_code', label: 'Código', category: 'items', x: 10, y: 100, width: 30, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'item_description', label: 'Descripción', category: 'items', x: 42, y: 100, width: 70, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'item_quantity', label: 'Cantidad', category: 'items', x: 114, y: 100, width: 20, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'item_unit_price', label: 'Valor Unitario', category: 'items', x: 136, y: 100, width: 30, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'subtotal', label: 'Subtotal', category: 'totals', x: 120, y: 200, width: 50, height: 7, section: 'body' }),
      makeField({ fieldId: 'iva', label: 'IVA', category: 'totals', x: 120, y: 210, width: 50, height: 7, section: 'body' }),
      makeField({ fieldId: 'total', label: 'Total', category: 'totals', x: 120, y: 220, width: 50, height: 8, bold: true, fontSize: 12, section: 'body' }),
      makeField({ fieldId: 'qr_code', label: 'Código QR DIAN', category: 'qr', x: 150, y: 250, width: 40, height: 40, section: 'footer' }),
      makeField({ fieldId: 'issue_date', label: 'Fecha de Emisión', category: 'dates', x: 10, y: 255, width: 60, height: 7, section: 'footer' }),
    ],
  },
  {
    id: 'factura-simple',
    name: 'Factura Simple',
    description: 'Diseño minimalista sin tabla de detalle',
    fields: [
      makeField({ fieldId: 'company_name', label: 'Nombre Empresa', category: 'company', x: 10, y: 10, width: 100, height: 10, fontSize: 16, bold: true, section: 'header' }),
      makeField({ fieldId: 'company_nit', label: 'NIT', category: 'company', x: 10, y: 22, width: 100, height: 7, section: 'header' }),
      makeField({ fieldId: 'customer_name', label: 'Nombre Cliente', category: 'customer', x: 10, y: 50, width: 100, height: 8, section: 'body' }),
      makeField({ fieldId: 'total', label: 'Total', category: 'totals', x: 120, y: 180, width: 60, height: 10, bold: true, fontSize: 14, section: 'body' }),
      makeField({ fieldId: 'qr_code', label: 'Código QR DIAN', category: 'qr', x: 150, y: 255, width: 40, height: 35, section: 'footer' }),
    ],
  },
  {
    id: 'cotizacion',
    name: 'Cotización',
    description: 'Plantilla para cotizaciones con tabla de items',
    fields: [
      makeField({ fieldId: 'company_name', label: 'Nombre Empresa', category: 'company', x: 10, y: 10, width: 80, height: 10, fontSize: 14, bold: true, section: 'header' }),
      makeField({ fieldId: 'customer_name', label: 'Nombre Cliente', category: 'customer', x: 10, y: 50, width: 90, height: 8, bold: true, section: 'body' }),
      makeField({ fieldId: 'item_code', label: 'Código', category: 'items', x: 10, y: 90, width: 30, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'item_description', label: 'Descripción', category: 'items', x: 42, y: 90, width: 80, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'item_quantity', label: 'Cantidad', category: 'items', x: 124, y: 90, width: 20, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'item_unit_price', label: 'Valor Unitario', category: 'items', x: 146, y: 90, width: 30, height: 6, fontSize: 8, section: 'body' }),
      makeField({ fieldId: 'total', label: 'Total', category: 'totals', x: 120, y: 220, width: 50, height: 8, bold: true, section: 'body' }),
      makeField({ fieldId: 'issue_date', label: 'Fecha de Emisión', category: 'dates', x: 10, y: 255, width: 60, height: 7, section: 'footer' }),
    ],
  },
];
