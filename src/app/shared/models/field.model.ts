export type FieldCategory =
  | 'company'
  | 'customer'
  | 'items'
  | 'totals'
  | 'dates'
  | 'qr'
  | 'signature'
  | 'custom'
  | 'table'
  | 'element';

export interface FieldDefinition {
  id: string;
  label: string;
  category: FieldCategory;
  placeholder: string;
  defaultWidthMm?: number;
  defaultHeightMm?: number;
}

export interface FieldCategoryGroup {
  key: FieldCategory;
  label: string;
  fields: FieldDefinition[];
}

export const FIELD_CATEGORIES: FieldCategoryGroup[] = [
  {
    key: 'company',
    label: 'Datos de la Empresa',
    fields: [
      { id: 'company_name', label: 'Nombre Empresa', category: 'company', placeholder: '[Nombre Empresa]' },
      { id: 'company_nit', label: 'NIT', category: 'company', placeholder: '[NIT]' },
      { id: 'company_address', label: 'Dirección', category: 'company', placeholder: '[Dirección]' },
      { id: 'company_phone', label: 'Teléfono', category: 'company', placeholder: '[Teléfono]' },
      { id: 'company_email', label: 'Correo', category: 'company', placeholder: '[Correo]' },
      { id: 'company_logo', label: 'Logo', category: 'company', placeholder: '[Logo]' },
    ],
  },
  {
    key: 'customer',
    label: 'Datos del Cliente',
    fields: [
      { id: 'customer_name', label: 'Nombre Cliente', category: 'customer', placeholder: '[Nombre Cliente]' },
      { id: 'customer_nit', label: 'NIT Cliente', category: 'customer', placeholder: '[NIT Cliente]' },
      { id: 'customer_address', label: 'Dirección Cliente', category: 'customer', placeholder: '[Dirección Cliente]' },
      { id: 'customer_phone', label: 'Teléfono Cliente', category: 'customer', placeholder: '[Teléfono Cliente]' },
      { id: 'customer_email', label: 'Correo Cliente', category: 'customer', placeholder: '[Correo Cliente]' },
    ],
  },
  {
    key: 'items',
    label: 'Detalle de Ítems',
    fields: [
      { id: 'item_code', label: 'Código', category: 'items', placeholder: '[Código]' },
      { id: 'item_description', label: 'Descripción', category: 'items', placeholder: '[Descripción]' },
      { id: 'item_quantity', label: 'Cantidad', category: 'items', placeholder: '[Cantidad]' },
      { id: 'item_unit_price', label: 'Valor Unitario', category: 'items', placeholder: '[Valor Unitario]' },
      { id: 'item_total', label: 'Valor Total', category: 'items', placeholder: '[Valor Total]' },
    ],
  },
  {
    key: 'totals',
    label: 'Totales',
    fields: [
      { id: 'subtotal', label: 'Subtotal', category: 'totals', placeholder: '[Subtotal]' },
      { id: 'iva', label: 'IVA', category: 'totals', placeholder: '[IVA]' },
      { id: 'retention', label: 'Retención', category: 'totals', placeholder: '[Retención]' },
      { id: 'total', label: 'Total', category: 'totals', placeholder: '[Total]' },
    ],
  },
  {
    key: 'dates',
    label: 'Fechas',
    fields: [
      { id: 'issue_date', label: 'Fecha de Emisión', category: 'dates', placeholder: '[Fecha Emisión]' },
      { id: 'due_date', label: 'Fecha de Vencimiento', category: 'dates', placeholder: '[Fecha Vencimiento]' },
      { id: 'payment_method', label: 'Método de Pago', category: 'dates', placeholder: '[Método de Pago]' },
    ],
  },
  {
    key: 'qr',
    label: 'Código QR',
    fields: [
      { id: 'qr_code', label: 'Código QR DIAN', category: 'qr', placeholder: '[QR]' },
    ],
  },
  {
    key: 'signature',
    label: 'Firma',
    fields: [
      { id: 'signature_line', label: 'Línea de Firma', category: 'signature', placeholder: '[Firma]' },
    ],
  },
];
