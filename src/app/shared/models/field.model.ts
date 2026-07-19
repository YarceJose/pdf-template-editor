// ============================================
// FIELD MODELS — DIAN Electronic Invoicing
// Extended with fieldKey, section, origin, type, requiredTier
// ============================================

import { PageSection } from './placed-field.model';

export type FieldCategory =
  | 'encabezado'
  | 'cliente'
  | 'detalle'
  | 'totales'
  | 'pie'
  | 'custom'
  | 'table'
  | 'element';

export type FieldOrigin = 'xml-mapping' | 'system';
export type FieldType = 'string' | 'decimal' | 'date' | 'integer' | 'qrcode' | 'text-block' | 'image';

export type RequiredTier =
  | 'obligatorio_siempre'      // Sin color — no se puede eliminar ni modificar
  | 'obligatorio_validacion'   // Amarillo — obligatorio pero condicional
  | 'opcional';                // Verde — eliminable, configurable

export interface FieldDefinition {
  /** ID interno del campo */
  id: string;
  /** Nombre técnico inmutable (mapeo XML), nunca se edita desde UI */
  fieldKey: string;
  /** Título visible, editable desde panel de propiedades */
  label: string;
  /** Categoría visual del campo */
  category: FieldCategory;
  /** Sección del canvas donde DEBE ir (debe coincidir con PageSection) */
  section: PageSection;
  /** Origen del dato */
  origin: FieldOrigin;
  /** Nodo XML de origen (null para campos de sistema) */
  sourceNode: string | null;
  /** Tipo de dato */
  type: FieldType;
  /** Nivel de obligatoriedad */
  requiredTier: RequiredTier;
  /** Texto placeholder en canvas */
  placeholder: string;
  /** Dimensiones por defecto */
  defaultWidthMm?: number;
  defaultHeightMm?: number;
}

export interface FieldCategoryGroup {
  key: FieldCategory;
  label: string;
  fields: FieldDefinition[];
}

// ============================================
// DICcionario de campos DIAN — Facturación Electrónica
// Basado en DiccionarioDeDatosFE + XML de ejemplo
// ============================================

export const FIELD_CATEGORIES: FieldCategoryGroup[] = [
  // ============================================
  // ENCABEZADO — Datos del emisor + identidad documento
  // ============================================
  {
    key: 'encabezado',
    label: 'Encabezado',
    fields: [
      // --- Emisor (Company) ---
      { id: 'company_name', fieldKey: 'CompanyName', label: 'Razón Social', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Razón Social]' },
      { id: 'company_nit', fieldKey: 'TaxID', label: 'NIT Emisor', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[NIT Emisor]' },
      { id: 'company_address', fieldKey: 'Address1', label: 'Dirección Emisor', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Dirección Emisor]' },
      { id: 'company_city', fieldKey: 'City', label: 'Ciudad Emisor', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Company', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Ciudad Emisor]' },
      { id: 'company_logo', fieldKey: 'Logo', label: 'Logo Empresa', category: 'encabezado', section: 'encabezado', origin: 'system', sourceNode: null, type: 'image', requiredTier: 'obligatorio_siempre', placeholder: '[Logo]', defaultWidthMm: 35, defaultHeightMm: 25 },

      // --- Identidad del documento (InvcHead) ---
      { id: 'invoice_type', fieldKey: 'InvoiceType', label: 'Tipo de Documento', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Tipo Doc]' },
      { id: 'invoice_num', fieldKey: 'InvoiceNum', label: 'Número de Factura', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Nro Factura]' },
      { id: 'legal_number', fieldKey: 'LegalNumber', label: 'Número Legal', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Nro Legal]' },
      { id: 'invoice_date', fieldKey: 'InvoiceDate', label: 'Fecha de Emisión', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date', requiredTier: 'obligatorio_siempre', placeholder: '[Fecha Emisión]' },
      { id: 'due_date', fieldKey: 'DueDate', label: 'Fecha de Vencimiento', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date', requiredTier: 'obligatorio_siempre', placeholder: '[Fecha Vencimiento]' },
      { id: 'resolution', fieldKey: 'Resolution1', label: 'Resolución DIAN', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Resolución]' },
      { id: 'currency', fieldKey: 'CurrencyCode', label: 'Moneda', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Moneda]' },
      { id: 'invoice_comment', fieldKey: 'InvoiceComment', label: 'Observaciones', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[Observaciones]' },
      { id: 'invoice_period', fieldKey: 'InvoicePeriod', label: 'Periodo Facturado', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Periodo]' },
      { id: 'legends', fieldKey: 'Legends1', label: 'Leyendas', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Leyendas]' },

      // --- Forma de pago (obligatorio validación) ---
      { id: 'payment_means_id', fieldKey: 'PaymentMeansID_c', label: 'Medio de Pago', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_validacion', placeholder: '[Medio Pago]' },
      { id: 'payment_means_desc', fieldKey: 'PaymentMeansDescription', label: 'Descripción Medio Pago', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Desc Medio Pago]' },
      { id: 'payment_means_code', fieldKey: 'PaymentMeansCode_c', label: 'Código Medio Pago', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'obligatorio_validacion', placeholder: '[Cód Medio Pago]' },
      { id: 'payment_duration', fieldKey: 'PaymentDurationMeasure', label: 'Plazo de Pago', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'integer', requiredTier: 'obligatorio_validacion', placeholder: '[Plazo Pago]' },
      { id: 'payment_due_date', fieldKey: 'PaymentDueDate', label: 'Fecha Límite de Pago', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date', requiredTier: 'obligatorio_validacion', placeholder: '[Fecha Límite Pago]' },

      // --- Motivo NC/DC ---
      { id: 'cm_reason_code', fieldKey: 'CMReasonCode_c', label: 'Código Motivo NC', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[Cód Motivo NC]' },
      { id: 'cm_reason_desc', fieldKey: 'CMReasonDesc_c', label: 'Descripción Motivo NC', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[Desc Motivo NC]' },
      { id: 'dm_reason_code', fieldKey: 'DMReasonCode_c', label: 'Código Motivo ND', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[Cód Motivo ND]' },
      { id: 'dm_reason_desc', fieldKey: 'DMReasonDesc_c', label: 'Descripción Motivo ND', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[Desc Motivo ND]' },

      // --- Referencia (anulación) ---
      { id: 'invoice_ref', fieldKey: 'InvoiceRef', label: 'Factura Referencia', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[Factura Ref]' },
      { id: 'invoice_ref_cufe', fieldKey: 'InvoiceRefCufe', label: 'CUFE Referencia', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'string', requiredTier: 'opcional', placeholder: '[CUFE Ref]' },
      { id: 'invoice_ref_date', fieldKey: 'InvoiceRefDate', label: 'Fecha Ref', category: 'encabezado', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date', requiredTier: 'opcional', placeholder: '[Fecha Ref]' },
    ],
  },

  // ============================================
  // CLIENTE — Datos del adquirente
  // ============================================
  {
    key: 'cliente',
    label: 'Cliente',
    fields: [
      { id: 'customer_name', fieldKey: 'CustomerName', label: 'Nombre Cliente', category: 'cliente', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Nombre Cliente]' },
      { id: 'customer_nit', fieldKey: 'TaxID', label: 'NIT Cliente', category: 'cliente', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[NIT Cliente]' },
      { id: 'customer_address', fieldKey: 'Address1', label: 'Dirección Cliente', category: 'cliente', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Dirección Cliente]' },
      { id: 'customer_city', fieldKey: 'City', label: 'Ciudad Cliente', category: 'cliente', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Ciudad Cliente]' },
      { id: 'customer_phone', fieldKey: 'PhoneNum', label: 'Teléfono Cliente', category: 'cliente', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer', type: 'string', requiredTier: 'opcional', placeholder: '[Teléfono Cliente]' },
      { id: 'customer_email', fieldKey: 'EmailAddress', label: 'Correo Cliente', category: 'cliente', section: 'encabezado', origin: 'xml-mapping', sourceNode: 'Customer', type: 'string', requiredTier: 'opcional', placeholder: '[Correo Cliente]' },
    ],
  },

  // ============================================
  // DETALLE — Líneas de producto/servicio
  // ============================================
  {
    key: 'detalle',
    label: 'Detalle',
    fields: [
      { id: 'item_code', fieldKey: 'PartNum', label: 'Código', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Código]' },
      { id: 'item_description', fieldKey: 'LineDesc', label: 'Descripción', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Descripción]' },
      { id: 'item_quantity', fieldKey: 'InvcQty', label: 'Cantidad', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Cantidad]' },
      { id: 'item_unit_price', fieldKey: 'DocUnitPrice', label: 'Valor Unitario', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Valor Unitario]' },
      { id: 'item_total', fieldKey: 'DocExtPrice', label: 'Valor Total Línea', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Valor Total]' },
      { id: 'item_discount', fieldKey: 'DocDiscount', label: 'Descuento', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcDtl', type: 'decimal', requiredTier: 'opcional', placeholder: '[Descuento]' },

      // --- Impuestos por línea (InvcTax) ---
      { id: 'tax_code', fieldKey: 'TaxCode', label: 'Código Impuesto', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcTax', type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[Cód Impuesto]' },
      { id: 'tax_amount', fieldKey: 'DocTaxAmt', label: 'Valor Impuesto', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcTax', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Valor Impuesto]' },
      { id: 'tax_rate', fieldKey: 'Rate', label: 'Tarifa Impuesto', category: 'detalle', section: 'detalle', origin: 'xml-mapping', sourceNode: 'InvcTax', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Tarifa %]' },
    ],
  },

  // ============================================
  // TOTALES — Montos agregados
  // ============================================
  {
    key: 'totales',
    label: 'Totales',
    fields: [
      { id: 'subtotal', fieldKey: 'DspDocSubTotal', label: 'Subtotal', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Subtotal]' },
      { id: 'total_tax', fieldKey: 'DocTaxAmt', label: 'Total Impuestos', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Total Impuestos]' },
      { id: 'wh_tax', fieldKey: 'DocWHTaxAmt', label: 'Retención en la Fuente', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Retención]' },
      { id: 'discount_total', fieldKey: 'Discount', label: 'Descuento Total', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Descuento Total]' },
      { id: 'grand_total', fieldKey: 'DspDocInvoiceAmt', label: 'Valor Total', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal', requiredTier: 'obligatorio_siempre', placeholder: '[Valor Total]' },
      { id: 'exchange_rate', fieldKey: 'CalculationRate_c', label: 'Tasa de Cambio', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'decimal', requiredTier: 'obligatorio_validacion', placeholder: '[Tasa Cambio]' },
      { id: 'exchange_date', fieldKey: 'DateCalculationRate_c', label: 'Fecha Tasa Cambio', category: 'totales', section: 'totales', origin: 'xml-mapping', sourceNode: 'InvcHead', type: 'date', requiredTier: 'obligatorio_validacion', placeholder: '[Fecha Tasa Cambio]' },
    ],
  },

  // ============================================
  // PIE DE PÁGINA — Campos de sistema
  // ============================================
  {
    key: 'pie',
    label: 'Pie de Página',
    fields: [
      { id: 'qr_code', fieldKey: 'QRCode', label: 'Código QR DIAN', category: 'pie', section: 'pie', origin: 'system', sourceNode: null, type: 'qrcode', requiredTier: 'obligatorio_siempre', placeholder: '[QR DIAN]', defaultWidthMm: 40, defaultHeightMm: 40 },
      { id: 'cufe', fieldKey: 'CUFE', label: 'CUFE', category: 'pie', section: 'pie', origin: 'system', sourceNode: null, type: 'string', requiredTier: 'obligatorio_siempre', placeholder: '[CUFE]', defaultWidthMm: 120, defaultHeightMm: 15 },
      { id: 'signature_line', fieldKey: 'SignatureLine', label: 'Línea de Firma', category: 'pie', section: 'pie', origin: 'system', sourceNode: null, type: 'text-block', requiredTier: 'obligatorio_siempre', placeholder: '[Firma]', defaultWidthMm: 80, defaultHeightMm: 20 },
      { id: 'signing_time', fieldKey: 'SigningTime', label: 'Fecha/Hora Firma', category: 'pie', section: 'pie', origin: 'system', sourceNode: null, type: 'date', requiredTier: 'obligatorio_siempre', placeholder: '[Fecha Firma]' },
    ],
  },
];

// ============================================
// Utility: buscar campo por fieldKey
// ============================================
export function findFieldByKey(fieldKey: string): FieldDefinition | undefined {
  for (const group of FIELD_CATEGORIES) {
    const found = group.fields.find((f) => f.fieldKey === fieldKey);
    if (found) return found;
  }
  return undefined;
}

// ============================================
// Utility: obtener todos los campos de una sección
// ============================================
export function getFieldsBySection(section: FieldDefinition['section']): FieldDefinition[] {
  return FIELD_CATEGORIES
    .flatMap((g) => g.fields)
    .filter((f) => f.section === section);
}

// ============================================
// Utility: verificar si un campo es editable
// ============================================
export function isFieldEditable(field: FieldDefinition): boolean {
  return field.requiredTier !== 'obligatorio_siempre';
}

// ============================================
// SAMPLE VALUES — Valores realistas para preview de factura colombiana
// ============================================
export const SAMPLE_VALUES: Record<string, string> = {
  // Emisor
  CompanyName: 'Distribuidora Nacional S.A.S.',
  TaxID: '900123456-7',
  Address1: 'Cra 7 # 40-62, Piso 5',
  City: 'Bogotá D.C.',
  Logo: '',

  // Documento
  InvoiceType: 'Factura electrónica',
  InvoiceNum: 'FE-0001245',
  LegalNumber: '1124567890123456789',
  InvoiceDate: '18/07/2026',
  DueDate: '17/08/2026',
  Resolution1: 'RES-2024-0001234',
  CurrencyCode: 'COP',
  InvoiceComment: 'Servicio de consultoría IT',
  InvoicePeriod: 'Julio 2026',
  Legends1: 'Autorización DIAN 18012024',

  // Pago
  PaymentMeansID_c: 'Pago electrónico',
  PaymentMeansDescription: 'Transferencia bancaria',
  PaymentMeansCode_c: '1',
  PaymentDurationMeasure: '30',
  PaymentDueDate: '17/08/2026',

  // NC/DC
  CMReasonCode_c: '01',
  CMReasonDesc_c: 'Anulación de la factura',
  DMReasonCode_c: '02',
  DMReasonDesc_c: 'Corrección del valor',

  // Referencia
  InvoiceRef: 'FE-0001200',
  InvoiceRefCufe: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  InvoiceRefDate: '01/07/2026',

  // Cliente
  CustomerName: 'Comercializadora Andina Ltda.',
  CustomerTaxID: '800987654-3',
  CustomerAddress1: 'Calle 50 # 13-20, Of 301',
  CustomerCity: 'Medellín',
  PhoneNum: '+57 604 4567890',
  EmailAddress: 'compras@andina.com.co',

  // Detalle
  PartNum: 'SERV-CONS-001',
  LineDesc: 'Consultoría en implementación ERP',
  InvcQty: '240.00',
  DocUnitPrice: '150,000.00',
  DocExtPrice: '36,000,000.00',
  DocDiscount: '1,800,000.00',

  // Impuestos
  TaxCode: 'IVA',
  DocTaxAmt: '6,120,000.00',
  Rate: '19.00%',

  // Totales
  DspDocSubTotal: '36,000,000.00',
  DocWHTaxAmt: '1,440,000.00',
  Discount: '1,800,000.00',
  DspDocInvoiceAmt: '38,880,000.00',
  CalculationRate_c: '1.00',
  DateCalculationRate_c: '18/07/2026',

  // Pie
  QRCode: '',
  CUFE: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
  SignatureLine: '',
  SigningTime: '18/07/2026 14:32:15',
};

/**
 * Returns the realistic sample value for a given fieldKey.
 */
export function getSampleValue(fieldKey: string): string {
  return SAMPLE_VALUES[fieldKey] ?? '';
}
