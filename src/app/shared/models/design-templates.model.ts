import { PlacedField, PageSection } from './placed-field.model';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  fields: Omit<PlacedField, 'id'>[];
}

function makeField(overrides: Partial<PlacedField> & { fieldKey: string; label: string; category: string }): Omit<PlacedField, 'id'> {
  return {
    placeholder: `[${overrides.label}]`,
    section: 'detalle',
    origin: 'system',
    sourceNode: null,
    type: 'string',
    requiredTier: 'opcional',
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
      makeField({ fieldKey: 'Logo', label: 'Logo Empresa', category: 'encabezado', x: 10, y: 10, width: 40, height: 20, section: 'encabezado', origin: 'system', type: 'image' }),
      makeField({ fieldKey: 'CompanyName', label: 'Nombre Empresa', category: 'encabezado', x: 60, y: 10, width: 80, height: 8, fontSize: 14, bold: true, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company' }),
      makeField({ fieldKey: 'TaxID', label: 'NIT', category: 'encabezado', x: 60, y: 20, width: 80, height: 8, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company' }),
      makeField({ fieldKey: 'Address1', label: 'Dirección', category: 'encabezado', x: 60, y: 28, width: 80, height: 8, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company' }),
      makeField({ fieldKey: 'CustomerName', label: 'Nombre Cliente', category: 'cliente', x: 10, y: 60, width: 90, height: 8, bold: true, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer' }),
      makeField({ fieldKey: 'TaxID', label: 'NIT Cliente', category: 'cliente', x: 110, y: 60, width: 50, height: 8, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer' }),
      makeField({ fieldKey: 'Address1', label: 'Dirección Cliente', category: 'cliente', x: 10, y: 70, width: 150, height: 8, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer' }),
      makeField({ fieldKey: 'PartNum', label: 'Código', category: 'detalle', x: 10, y: 100, width: 30, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl' }),
      makeField({ fieldKey: 'LineDesc', label: 'Descripción', category: 'detalle', x: 42, y: 100, width: 70, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl' }),
      makeField({ fieldKey: 'InvcQty', label: 'Cantidad', category: 'detalle', x: 114, y: 100, width: 20, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal' }),
      makeField({ fieldKey: 'DocUnitPrice', label: 'Valor Unitario', category: 'detalle', x: 136, y: 100, width: 30, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal' }),
      makeField({ fieldKey: 'DspDocSubTotal', label: 'Subtotal', category: 'totales', x: 120, y: 200, width: 50, height: 7, section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal' }),
      makeField({ fieldKey: 'DocTaxAmt', label: 'IVA', category: 'totales', x: 120, y: 210, width: 50, height: 7, section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal' }),
      makeField({ fieldKey: 'DspDocInvoiceAmt', label: 'Total', category: 'totales', x: 120, y: 220, width: 50, height: 8, bold: true, fontSize: 12, section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal' }),
      makeField({ fieldKey: 'QRCode', label: 'Código QR DIAN', category: 'pie', x: 150, y: 250, width: 40, height: 40, section: 'pie', origin: 'system', type: 'qrcode' }),
      makeField({ fieldKey: 'InvoiceDate', label: 'Fecha de Emisión', category: 'encabezado', x: 10, y: 255, width: 60, height: 7, section: 'pie', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date' }),
    ],
  },
  {
    id: 'factura-simple',
    name: 'Factura Simple',
    description: 'Diseño minimalista sin tabla de detalle',
    fields: [
      makeField({ fieldKey: 'CompanyName', label: 'Nombre Empresa', category: 'encabezado', x: 10, y: 10, width: 100, height: 10, fontSize: 16, bold: true, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company' }),
      makeField({ fieldKey: 'TaxID', label: 'NIT', category: 'encabezado', x: 10, y: 22, width: 100, height: 7, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company' }),
      makeField({ fieldKey: 'CustomerName', label: 'Nombre Cliente', category: 'cliente', x: 10, y: 50, width: 100, height: 8, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer' }),
      makeField({ fieldKey: 'DspDocInvoiceAmt', label: 'Total', category: 'totales', x: 120, y: 180, width: 60, height: 10, bold: true, fontSize: 14, section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal' }),
      makeField({ fieldKey: 'QRCode', label: 'Código QR DIAN', category: 'pie', x: 150, y: 255, width: 40, height: 35, section: 'pie', origin: 'system', type: 'qrcode' }),
    ],
  },
  {
    id: 'cotizacion',
    name: 'Cotización',
    description: 'Plantilla para cotizaciones con tabla de items',
    fields: [
      makeField({ fieldKey: 'CompanyName', label: 'Nombre Empresa', category: 'encabezado', x: 10, y: 10, width: 80, height: 10, fontSize: 14, bold: true, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company' }),
      makeField({ fieldKey: 'CustomerName', label: 'Nombre Cliente', category: 'cliente', x: 10, y: 50, width: 90, height: 8, bold: true, section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer' }),
      makeField({ fieldKey: 'PartNum', label: 'Código', category: 'detalle', x: 10, y: 90, width: 30, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl' }),
      makeField({ fieldKey: 'LineDesc', label: 'Descripción', category: 'detalle', x: 42, y: 90, width: 80, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl' }),
      makeField({ fieldKey: 'InvcQty', label: 'Cantidad', category: 'detalle', x: 124, y: 90, width: 20, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal' }),
      makeField({ fieldKey: 'DocUnitPrice', label: 'Valor Unitario', category: 'detalle', x: 146, y: 90, width: 30, height: 6, fontSize: 8, section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal' }),
      makeField({ fieldKey: 'DspDocInvoiceAmt', label: 'Total', category: 'totales', x: 120, y: 220, width: 50, height: 8, bold: true, section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal' }),
      makeField({ fieldKey: 'InvoiceDate', label: 'Fecha de Emisión', category: 'encabezado', x: 10, y: 255, width: 60, height: 7, section: 'pie', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date' }),
    ],
  },
];
