import { Injectable } from '@angular/core';
import { PlacedField, PageSection, PAGE_SECTIONS } from '../../../shared/models/placed-field.model';
import { DetailTableColumn } from './template-state';
import {
  TemplateDocument,
  Section,
  SectionType,
  TextComponent,
  ImageComponent,
  RectangleComponent,
  FontDefinition,
  TemplateComponent,
  Binding,
  BindingDataType,
} from '../../../shared/models/template-json.model';

// ============================================
// MAPPINGS — PlacedField → Target JSON
// ============================================

/** PageSection → Section type */
const SECTION_TYPE_MAP: Record<PageSection, SectionType> = {
  encabezado: 'Header',
  detalle: 'Detail',
  totales: 'Totals',
  pie: 'Footer',
};

/** Section type → data context path (root-relative) */
const SECTION_DATA_CONTEXT: Record<PageSection, string> = {
  encabezado: '/ARInvoiceDataSet/InvcHead',
  detalle: '/ARInvoiceDataSet/InvcDtl',
  totales: '/ARInvoiceDataSet/InvcHead',
  pie: '/ARInvoiceDataSet/InvcHead',
};

/** Section bounds (pt) — matching the target JSON */
const SECTION_BOUNDS: Record<PageSection, { x: number; y: number; width: number; height: number }> = {
  encabezado: { x: 40, y: 40, width: 515.28, height: 130 },
  detalle:    { x: 40, y: 268, width: 515.28, height: 380 },
  totales:    { x: 300, y: 660, width: 255, height: 100 },
  pie:        { x: 40, y: 770, width: 515.28, height: 60 },
};

/** sourceNode → data context path (relative to root) */
const SOURCE_NODE_PATH: Record<string, string> = {
  Company: '/ARInvoiceDataSet/Company',
  Customer: '/ARInvoiceDataSet/Customer',
  InvcHead: '/ARInvoiceDataSet/InvcHead',
  InvcDtl: '/ARInvoiceDataSet/InvcDtl',
  InvcTax: '/ARInvoiceDataSet/InvcTax',
};

/** fieldKey → binding source (relative to the data context node) */
const FIELD_KEY_BINDING: Record<string, (sourceNode: string) => string> = {
  CompanyName: () => 'Name',
  TaxID: (node) => node === 'Customer' ? 'ResaleID' : 'StateTaxID',
  Address1: () => 'Address1',
  City: () => 'City',
  InvoiceType: () => 'InvoiceType',
  InvoiceNum: () => 'InvoiceNum',
  LegalNumber: () => 'LegalNumber',
  InvoiceDate: () => 'InvoiceDate',
  DueDate: () => 'DueDate',
  Resolution1: () => 'Resolution1',
  CurrencyCode: () => 'CurrencyCode',
  InvoiceComment: () => 'InvoiceComment',
  InvoicePeriod: () => 'InvoicePeriod',
  Legends1: () => 'Legends1',
  PaymentMeansID_c: () => 'PaymentMeansID_c',
  PaymentMeansDescription: () => 'PaymentMeansDescription',
  PaymentMeansCode_c: () => 'PaymentMeansCode_c',
  PaymentDurationMeasure: () => 'PaymentDurationMeasure',
  PaymentDueDate: () => 'PaymentDueDate',
  CMReasonCode_c: () => 'CMReasonCode_c',
  CMReasonDesc_c: () => 'CMReasonDesc_c',
  DMReasonCode_c: () => 'DMReasonCode_c',
  DMReasonDesc_c: () => 'DMReasonDesc_c',
  InvoiceRef: () => 'InvoiceRef',
  InvoiceRefCufe: () => 'InvoiceRefCufe',
  InvoiceRefDate: () => 'InvoiceRefDate',
  CustomerName: () => 'Name',
  PhoneNum: () => 'PhoneNum',
  EmailAddress: () => 'EmailAddress',
  PartNum: () => 'PartNum',
  LineDesc: () => 'LineDesc',
  InvcQty: () => 'SellingShipQty',
  DocUnitPrice: () => 'UnitPrice',
  DocExtPrice: () => 'ExtPrice',
  DocDiscount: () => 'DocDiscount',
  TaxCode: () => 'TaxCode',
  DocTaxAmt: () => 'DocTaxAmt',
  Rate: () => 'Rate',
  DspDocSubTotal: () => 'DspDocSubTotal',
  DocWHTaxAmt: () => 'DocWHTaxAmt',
  Discount: () => 'Discount',
  DspDocInvoiceAmt: () => 'DspDocInvoiceAmt',
  CalculationRate_c: () => 'CalculationRate_c',
  DateCalculationRate_c: () => 'DateCalculationRate_c',
};

/** Map dataType from our model to target binding dataType */
const DATA_TYPE_MAP: Record<string, BindingDataType> = {
  string: 'String',
  decimal: 'Decimal',
  date: 'DateTime',
  integer: 'Integer',
};

/** Infer format from field type */
function inferFormat(type: string, fieldKey: string): string | undefined {
  if (type === 'date') return 'dd/MM/yyyy';
  if (type === 'decimal') {
    if (fieldKey.includes('Rate') || fieldKey === 'Rate') return 'N2';
    return 'C2';
  }
  return undefined;
}

// ============================================
// MM → PT conversion
// ============================================
const MM_TO_PT = 2.834645669;

// ============================================
// SERIALIZE SERVICE
// ============================================

@Injectable({ providedIn: 'root' })
export class TemplateSerializerService {

  /**
   * Serializa placedFields + detailColumns al formato target JSON.
   * Este es el cuerpo exacto que el back espera.
   */
  serialize(
    fields: PlacedField[],
    name: string,
    detailColumns: DetailTableColumn[] = [],
    options: {
      templateId?: string;
      companyId?: string;
      documentType?: string;
      version?: number;
    } = {}
  ): TemplateDocument {
    const templateId = options.templateId ?? this.generateUUID();
    const companyId = options.companyId ?? '830005919';
    const documentType = options.documentType ?? 'InvoiceType';
    const version = options.version ?? 1;

    // 1. Collect unique styles from fields
    const styles = this.buildStyles(fields);

    // 2. Collect assets (image fields)
    const assets = this.buildAssets(fields, companyId);

    // 3. Group fields by section
    const sectionFields = this.groupBySection(fields);

    // 4. Build sections
    const sections = this.buildSections(sectionFields, detailColumns, styles);

    return {
      schemaVersion: 3,
      templateId,
      name,
      version,
      status: 'Draft',
      companyId,
      documentType,
      culture: 'es-CO',
      unit: 'pt',
      dataSource: {
        format: 'ARInvoiceDataSet',
        root: '/ARInvoiceDataSet',
        collections: {
          lines: { path: '/ARInvoiceDataSet/InvcDtl', key: 'InvoiceLine' },
          taxes: { path: '/ARInvoiceDataSet/InvcTax', key: 'InvoiceLine' },
        },
      },
      page: {
        size: 'A4',
        width: 595.28,
        height: 841.89,
        orientation: 'Portrait',
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
      },
      assets,
      styles,
      sections,
    };
  }

  toJSON(
    fields: PlacedField[],
    name: string,
    detailColumns: DetailTableColumn[] = [],
    options?: {
      templateId?: string;
      companyId?: string;
      documentType?: string;
      version?: number;
    }
  ): string {
    return JSON.stringify(this.serialize(fields, name, detailColumns, options), null, 2);
  }

  // ============================================
  // STYLES — Build from field properties
  // ============================================

  private buildStyles(fields: PlacedField[]): { fonts: FontDefinition[] } {
    const styleMap = new Map<string, FontDefinition>();
    let counter = 0;

    for (const f of fields) {
      if (f.type === 'image' || f.type === 'qrcode') continue;

      const key = `${f.fontSize}-${f.bold}-${f.color ?? '#222222'}`;
      if (!styleMap.has(key)) {
        counter++;
        styleMap.set(key, {
          id: `f-${counter}`,
          family: 'Arial',
          size: f.fontSize,
          bold: f.bold,
          color: f.color ?? '#222222',
        });
      }
    }

    // Ensure base styles exist
    if (!styleMap.has('15-true-#1A3A5C')) {
      styleMap.set('15-true-#1A3A5C', { id: 'f-title', family: 'Arial', size: 15, bold: true, color: '#1A3A5C' });
    }
    if (!styleMap.has('10-true-#333333')) {
      styleMap.set('10-true-#333333', { id: 'f-subtitle', family: 'Arial', size: 10, bold: true, color: '#333333' });
    }
    if (!styleMap.has('8-true-#555555')) {
      styleMap.set('8-true-#555555', { id: 'f-label', family: 'Arial', size: 8, bold: true, color: '#555555' });
    }
    if (!styleMap.has('8-false-#222222')) {
      styleMap.set('8-false-#222222', { id: 'f-body', family: 'Arial', size: 8, bold: false, color: '#222222' });
    }
    if (!styleMap.has('8-true-#FFFFFF')) {
      styleMap.set('8-true-#FFFFFF', { id: 'f-th', family: 'Arial', size: 8, bold: true, color: '#FFFFFF' });
    }
    if (!styleMap.has('7-false-#777777')) {
      styleMap.set('7-false-#777777', { id: 'f-small', family: 'Arial', size: 7, bold: false, color: '#777777' });
    }

    return { fonts: Array.from(styleMap.values()) };
  }

  /** Find the styleRef for a field based on its properties */
  private resolveStyleRef(field: PlacedField, fonts: FontDefinition[]): string {
    const color = field.color ?? '#222222';
    // Try exact match first
    const exact = fonts.find((f) => f.size === field.fontSize && f.bold === field.bold && f.color === color);
    if (exact) return exact.id;

    // Fallback to base styles
    if (field.fontSize >= 14 && field.bold) return 'f-title';
    if (field.fontSize >= 10 && field.bold) return 'f-subtitle';
    if (field.bold) return 'f-label';
    if (field.fontSize <= 7) return 'f-small';
    return 'f-body';
  }

  // ============================================
  // ASSETS — Image fields
  // ============================================

  private buildAssets(fields: PlacedField[], companyId: string): { id: string; type: string; objectKey: string }[] {
    const assets: { id: string; type: string; objectKey: string }[] = [];

    for (const f of fields) {
      if (f.type === 'image') {
        assets.push({
          id: `asset-${f.id}`,
          type: 'Image',
          objectKey: f.imageUrl
            ? `data:image/png;base64,...`
            : `assets/${companyId}/logo.png`,
        });
      }
    }

    // Ensure logo asset exists
    if (assets.length === 0) {
      assets.push({
        id: 'logo-emisor',
        type: 'Image',
        objectKey: `assets/${companyId}/logo.png`,
      });
    }

    return assets;
  }

  // ============================================
  // SECTIONS — Group fields by section
  // ============================================

  private groupBySection(fields: PlacedField[]): Map<PageSection, PlacedField[]> {
    const map = new Map<PageSection, PlacedField[]>();
    for (const section of PAGE_SECTIONS) {
      map.set(section.key, []);
    }
    for (const f of fields) {
      const arr = map.get(f.section);
      if (arr) arr.push(f);
    }
    return map;
  }

  private buildSections(
    sectionFields: Map<PageSection, PlacedField[]>,
    detailColumns: DetailTableColumn[],
    styles: { fonts: FontDefinition[] }
  ): Section[] {
    const sections: Section[] = [];

    // Header section (encabezado)
    const headerFields = sectionFields.get('encabezado') ?? [];
    sections.push(this.buildHeaderSection(headerFields, styles));

    // Customer section (derived from encabezado fields with sourceNode=Customer)
    const customerFields = headerFields.filter((f) => f.sourceNode === 'Customer');
    if (customerFields.length > 0) {
      sections.push(this.buildCustomerSection(customerFields, styles));
    }

    // Company section (derived from encabezado fields with sourceNode=Company)
    const companyFields = headerFields.filter((f) => f.sourceNode === 'Company');
    sections.push(this.buildCompanySection(companyFields));

    // Detail section
    const detailFields = sectionFields.get('detalle') ?? [];
    sections.push(this.buildDetailSection(detailFields, detailColumns, styles));

    // Taxes section
    sections.push(this.buildTaxesSection());

    // Totals section
    const totalsFields = sectionFields.get('totales') ?? [];
    sections.push(this.buildTotalsSection(totalsFields, styles));

    // Footer section (pie)
    const footerFields = sectionFields.get('pie') ?? [];
    sections.push(this.buildFooterSection(footerFields, styles));

    return sections;
  }

  private buildHeaderSection(fields: PlacedField[], styles: { fonts: FontDefinition[] }): Section {
    const components: TemplateComponent[] = [];

    // Logo image
    const logoField = fields.find((f) => f.type === 'image');
    if (logoField) {
      components.push({
        id: `img-logo`,
        type: 'Image',
        position: { x: 0, y: 0 },
        size: { width: this.mmToPt(logoField.width), height: this.mmToPt(logoField.height) },
        assetId: logoField.imageUrl ? `asset-${logoField.id}` : 'logo-emisor',
        fit: 'Contain',
      } as ImageComponent);
    }

    // Text fields (non-image, non-QR)
    const textFields = fields.filter((f) => f.type !== 'image' && f.type !== 'qrcode');
    for (const f of textFields) {
      const sourceNode = f.sourceNode ?? 'InvcHead';
      const bindingSource = this.resolveBindingSource(f.fieldKey, sourceNode);
      const isLabel = f.showLabel;

      const comp: TextComponent = {
        id: `txt-${f.id}`,
        type: 'Text',
        position: { x: this.mmToPt(f.x - 40), y: this.mmToPt(f.y - 40) },
        size: { width: this.mmToPt(f.width), height: this.mmToPt(f.height) },
        styleRef: this.resolveStyleRef(f, styles.fonts),
        alignment: this.mapAlignment(f.textAlign),
      };

      if (isLabel) {
        comp.prefix = `${f.label}: `;
      }

      if (f.origin === 'xml-mapping' && bindingSource) {
        const hideIfEmpty = (f.type === 'date' || f.type === 'decimal') && f.requiredTier === 'opcional';
        comp.binding = {
          source: bindingSource,
          dataType: DATA_TYPE_MAP[f.type] ?? 'String',
          format: inferFormat(f.type, f.fieldKey),
          ...(hideIfEmpty ? { hideIfEmpty: true } : {}),
        };
      } else if (f.type === 'string' || f.type === 'text-block') {
        comp.staticValue = f.label;
      }

      components.push(comp);
    }

    // Legal info box (rectangle)
    components.push({
      id: 'box-legal',
      type: 'Rectangle',
      position: { x: 320, y: 0 },
      size: { width: 195, height: 90 },
      stroke: '#1A3A5C',
      strokeWidth: 1,
      fill: null,
      cornerRadius: 4,
    } as RectangleComponent);

    return {
      id: 'header',
      type: 'Header',
      layout: 'Absolute',
      contextType: 'Single',
      dataContexts: {
        head: '/ARInvoiceDataSet/InvcHead',
        company: '/ARInvoiceDataSet/Company',
        customer: '/ARInvoiceDataSet/Customer',
        taxScheme: '/ARInvoiceDataSet/detailTaxScheme',
        taxSchemeCustomer: '/ARInvoiceDataSet/DetailTaxSchemeCustomer',
      },
      bounds: SECTION_BOUNDS.encabezado,
      components,
    };
  }

  private buildCustomerSection(fields: PlacedField[], styles: { fonts: FontDefinition[] }): Section {
    const components: TemplateComponent[] = [];

    components.push({
      id: 'rect-cust',
      type: 'Rectangle',
      position: { x: 0, y: 0 },
      size: { width: 515.28, height: 78 },
      stroke: '#CCCCCC',
      strokeWidth: 0.75,
      cornerRadius: 4,
    } as RectangleComponent);

    components.push({
      id: 'lbl-cust',
      type: 'Text',
      position: { x: 10, y: 6 },
      size: { width: 300, height: 12 },
      styleRef: 'f-label',
      staticValue: 'ADQUIRENTE',
    } as TextComponent);

    for (const f of fields) {
      const bindingSource = this.resolveBindingSource(f.fieldKey, 'Customer');
      const prefixMap: Record<string, string> = {
        CustomerName: 'Señor(es): ',
        TaxID: 'NIT/CC: ',
        City: 'Ciudad: ',
        Address1: 'Dirección: ',
      };

      const comp: TextComponent = {
        id: `txt-cust-${f.id}`,
        type: 'Text',
        position: { x: 10, y: this.mmToPt(f.y - 65) + 22 },
        size: { width: this.mmToPt(f.width), height: 14 },
        styleRef: this.resolveStyleRef(f, styles.fonts),
        prefix: prefixMap[f.fieldKey] ?? '',
      };

      if (bindingSource) {
        comp.binding = {
          source: bindingSource,
          dataType: DATA_TYPE_MAP[f.type] ?? 'String',
        };
      }

      components.push(comp);
    }

    return {
      id: 'customer',
      type: 'Customer',
      layout: 'Absolute',
      contextType: 'Single',
      dataContext: '/ARInvoiceDataSet/Customer',
      bounds: { x: 40, y: 180, width: 515.28, height: 78 },
      components,
    };
  }

  private buildCompanySection(fields: PlacedField[]): Section {
    return {
      id: 'company',
      type: 'Company',
      layout: 'Absolute',
      contextType: 'Single',
      dataContext: '/ARInvoiceDataSet/Company',
      bounds: { x: 40, y: 262, width: 515.28, height: 0 },
      components: [],
    };
  }

  private buildDetailSection(
    fields: PlacedField[],
    detailColumns: DetailTableColumn[],
    styles: { fonts: FontDefinition[] }
  ): Section {
    const components: TemplateComponent[] = [];

    // Build table from detailColumns if available
    if (detailColumns.length > 0) {
      components.push({
        id: 'tbl-detail',
        type: 'Table',
        headerStyleRef: 'f-th',
        rowStyleRef: 'f-body',
        headerBackground: '#1A3A5C',
        rowAltBackground: '#EEF3F9',
        borderColor: '#CCCCCC',
        borderWidth: 0.5,
        repeatHeaderOnNewPage: true,
        rowHeight: 15,
        columns: detailColumns.map((col) => ({
          id: col.id,
          header: col.header,
          width: col.width,
          align: col.align as 'Left' | 'Center' | 'Right',
          binding: {
            source: col.bindingSource,
            dataType: col.bindingDataType as 'String' | 'Decimal' | 'DateTime' | 'Integer',
            format: col.format,
          },
        })),
      } as any);
    }

    return {
      id: 'detail',
      type: 'Detail',
      layout: 'Flow',
      contextType: 'Collection',
      dataContext: '/ARInvoiceDataSet/InvcDtl',
      bounds: SECTION_BOUNDS.detalle,
      components,
    };
  }

  private buildTaxesSection(): Section {
    return {
      id: 'taxes',
      type: 'Taxes',
      layout: 'Flow',
      contextType: 'Collection',
      dataContext: '/ARInvoiceDataSet/InvcTax',
      bounds: { x: 40, y: 650, width: 250, height: 0 },
      components: [],
      relatedTo: { collection: '/ARInvoiceDataSet/InvcDtl', key: 'InvoiceLine' },
    };
  }

  private buildTotalsSection(fields: PlacedField[], styles: { fonts: FontDefinition[] }): Section {
    const components: TemplateComponent[] = [];

    // Label/value pairs for totals
    const totalPairs = [
      { label: 'Subtotal:', fieldKey: 'DspDocSubTotal' },
      { label: 'Descuento:', fieldKey: 'Discount', optional: true },
      { label: 'IVA:', fieldKey: 'DocTaxAmt' },
      { label: 'Retenciones:', fieldKey: 'DocWHTaxAmt', optional: true },
    ];

    for (let i = 0; i < totalPairs.length; i++) {
      const pair = totalPairs[i];
      const y = i * 16;

      // Label
      components.push({
        id: `lbl-${pair.fieldKey}`,
        type: 'Text',
        position: { x: 0, y },
        size: { width: 130, height: 14 },
        styleRef: 'f-label',
        staticValue: pair.label,
      } as TextComponent);

      // Value
      const valueField = fields.find((f) => f.fieldKey === pair.fieldKey);
      const comp: TextComponent = {
        id: `val-${pair.fieldKey}`,
        type: 'Text',
        position: { x: 130, y },
        size: { width: 125, height: 14 },
        styleRef: valueField ? this.resolveStyleRef(valueField, styles.fonts) : 'f-body',
        alignment: 'Right',
      };

      comp.binding = {
        source: pair.fieldKey,
        dataType: 'Decimal',
        format: 'C2',
        sourceCurrency: 'Transaction',
      };
      if (pair.optional) {
        comp.binding.hideIfEmpty = true;
      }

      components.push(comp);
    }

    // Separator line
    components.push({
      id: 'line-total-sep',
      type: 'Line',
      start: { x: 0, y: 68 },
      end: { x: 255, y: 68 },
      stroke: '#1A3A5C',
      strokeWidth: 1,
    } as any);

    // Grand total label
    components.push({
      id: 'lbl-grand',
      type: 'Text',
      position: { x: 0, y: 74 },
      size: { width: 130, height: 18 },
      styleRef: 'f-subtitle',
      staticValue: 'TOTAL A PAGAR:',
    } as TextComponent);

    // Grand total value
    const grandField = fields.find((f) => f.fieldKey === 'DspDocInvoiceAmt');
    components.push({
      id: 'val-grand',
      type: 'Text',
      position: { x: 130, y: 74 },
      size: { width: 125, height: 18 },
      styleRef: grandField ? this.resolveStyleRef(grandField, styles.fonts) : 'f-subtitle',
      alignment: 'Right',
      binding: {
        source: 'DspDocInvoiceAmt',
        dataType: 'Decimal',
        format: 'C2',
        sourceCurrency: 'Transaction',
      },
    } as TextComponent);

    return {
      id: 'totals',
      type: 'Totals',
      layout: 'Absolute',
      contextType: 'Single',
      dataContext: '/ARInvoiceDataSet/InvcHead',
      bounds: SECTION_BOUNDS.totales,
      components,
    };
  }

  private buildFooterSection(fields: PlacedField[], styles: { fonts: FontDefinition[] }): Section {
    const components: TemplateComponent[] = [];

    // QR Code (placeholder)
    const qrField = fields.find((f) => f.type === 'qrcode');
    if (qrField) {
      components.push({
        id: `img-qr`,
        type: 'Image',
        position: { x: this.mmToPt(qrField.x - 40), y: this.mmToPt(qrField.y - 260) },
        size: { width: this.mmToPt(qrField.width), height: this.mmToPt(qrField.height) },
        assetId: 'qr-placeholder',
        fit: 'Contain',
      } as ImageComponent);
    }

    // CUFE text
    const cufeField = fields.find((f) => f.fieldKey === 'CUFE');
    if (cufeField) {
      components.push({
        id: `txt-cufe`,
        type: 'Text',
        position: { x: 0, y: 0 },
        size: { width: 350, height: 14 },
        styleRef: 'f-small',
        binding: { source: 'CUFE', dataType: 'String' },
      } as TextComponent);
    }

    // Comment
    const commentField = fields.find((f) => f.fieldKey === 'InvoiceComment');
    if (commentField) {
      components.push({
        id: 'txt-comment',
        type: 'Text',
        position: { x: 0, y: 0 },
        size: { width: 350, height: 28 },
        styleRef: 'f-small',
        hideIfEmpty: true,
        prefix: 'Observaciones: ',
        binding: { source: 'InvoiceComment', dataType: 'String', hideIfEmpty: true },
      } as TextComponent);
    }

    // Legal note
    components.push({
      id: 'txt-legal-note',
      type: 'Text',
      position: { x: 0, y: 46 },
      size: { width: 515.28, height: 12 },
      styleRef: 'f-small',
      staticValue: 'Representación gráfica de factura electrónica de venta - Resolución DIAN vigente.',
    } as TextComponent);

    return {
      id: 'footer',
      type: 'Footer',
      layout: 'Absolute',
      contextType: 'Single',
      dataContext: '/ARInvoiceDataSet/InvcHead',
      bounds: SECTION_BOUNDS.pie,
      components,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private mmToPt(mm: number): number {
    return Math.round(mm * MM_TO_PT * 100) / 100;
  }

  private resolveBindingSource(fieldKey: string, sourceNode: string): string | null {
    const resolver = FIELD_KEY_BINDING[fieldKey];
    if (resolver) return resolver(sourceNode);
    // Fallback: use fieldKey as-is (relative to context)
    return fieldKey;
  }

  private mapAlignment(textAlign?: string): 'Left' | 'Center' | 'Right' | undefined {
    if (textAlign === 'center') return 'Center';
    if (textAlign === 'right') return 'Right';
    if (textAlign === 'left') return 'Left';
    return undefined;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ============================================
  // DESERIALIZE — From TemplateDocument back to PlacedField[]
  // ============================================

  /**
   * Convierte un TemplateDocument (JSON del back) a PlacedField[] para el canvas.
   * Maneja: Text (binding y static), Image, Rectangle (skip), Line (skip), Table (→ detailColumns).
   */
  deserialize(doc: TemplateDocument): { fields: PlacedField[]; detailColumns: DetailTableColumn[] } {
    const fields: PlacedField[] = [];
    let detailColumns: DetailTableColumn[] = [];

    // Build a style lookup map
    const styleMap = new Map<string, FontDefinition>();
    for (const font of doc.styles.fonts) {
      styleMap.set(font.id, font);
    }

    for (const section of doc.sections) {
      const pageSection = this.sectionTypeToPageSection(section.type);

      for (const comp of section.components) {
        switch (comp.type) {
          case 'Text':
            this.deserializeText(comp, section, pageSection, styleMap, fields);
            break;
          case 'Image':
            this.deserializeImage(comp, section, pageSection, fields);
            break;
          case 'Table':
            detailColumns = this.deserializeTable(comp);
            break;
          // Rectangle, Line → skip (decorative, not placed fields)
        }
      }
    }

    return { fields, detailColumns };
  }

  private deserializeText(
    comp: any,
    section: Section,
    pageSection: PageSection,
    styleMap: Map<string, FontDefinition>,
    fields: PlacedField[]
  ): void {
    const sectionBounds = section.bounds;

    // Resolve style
    const font = comp.styleRef ? styleMap.get(comp.styleRef) : undefined;
    const fontSize = font?.size ?? 8;
    const bold = font?.bold ?? false;
    const color = font?.color ?? '#222222';

    // Resolve position (relative to section → absolute mm)
    const xPt = sectionBounds.x + (comp.position?.x ?? 0);
    const yPt = sectionBounds.y + (comp.position?.y ?? 0);
    const wPt = comp.size?.width ?? 100;
    const hPt = comp.size?.height ?? 14;

    const xMm = xPt / MM_TO_PT;
    const yMm = yPt / MM_TO_PT;
    const wMm = wPt / MM_TO_PT;
    const hMm = hPt / MM_TO_PT;

    // Determine fieldKey and binding info
    let fieldKey = comp.id;
    let sourceNode: string | null = null;
    let origin: 'xml-mapping' | 'system' = 'xml-mapping';
    let type: PlacedField['type'] = 'string';
    let label = comp.staticValue ?? comp.id;
    let requiredTier: PlacedField['requiredTier'] = 'opcional';
    const showLabel = !!comp.prefix;

    if (comp.binding) {
      const binding = comp.binding as Binding;
      const resolved = this.resolveDeserializedBinding(binding, section);
      fieldKey = resolved.fieldKey;
      sourceNode = resolved.sourceNode;
      type = this.bindingDataTypeToFieldType(binding.dataType);
      label = this.findFieldLabel(fieldKey) ?? fieldKey;
      requiredTier = this.inferRequiredTier(fieldKey);
    } else if (comp.staticValue) {
      // Static text — no XML binding
      origin = 'system';
      sourceNode = null;
      fieldKey = comp.id;
      label = comp.staticValue;
      requiredTier = 'opcional';
    }

    // Determine category from sourceNode
    const category = sourceNode === 'Customer' ? 'cliente' :
                     sourceNode === 'Company' ? 'encabezado' :
                     pageSection === 'encabezado' ? 'encabezado' :
                     pageSection === 'detalle' ? 'detalle' :
                     pageSection === 'totales' ? 'totales' : 'pie';

    fields.push({
      id: comp.id,
      fieldKey,
      label,
      placeholder: `[${label}]`,
      category,
      section: pageSection,
      origin,
      sourceNode,
      type,
      requiredTier,
      x: xMm,
      y: yMm,
      width: wMm,
      height: hMm,
      fontSize,
      bold,
      italic: false,
      underline: false,
      textAlign: comp.alignment?.toLowerCase() ?? 'left',
      showLabel,
    });
  }

  private deserializeImage(
    comp: any,
    section: Section,
    pageSection: PageSection,
    fields: PlacedField[]
  ): void {
    const sectionBounds = section.bounds;
    const xMm = (sectionBounds.x + (comp.position?.x ?? 0)) / MM_TO_PT;
    const yMm = (sectionBounds.y + (comp.position?.y ?? 0)) / MM_TO_PT;
    const wMm = (comp.size?.width ?? 100) / MM_TO_PT;
    const hMm = (comp.size?.height ?? 50) / MM_TO_PT;

    const isLogo = comp.assetId === 'logo-emisor';
    const isQR = comp.id.includes('qr');

    fields.push({
      id: comp.id,
      fieldKey: isLogo ? 'Logo' : isQR ? 'QRCode' : comp.assetId,
      label: isLogo ? 'Logo Empresa' : isQR ? 'Código QR DIAN' : comp.assetId,
      placeholder: isLogo ? '[Logo]' : isQR ? '[QR DIAN]' : `[${comp.assetId}]`,
      category: pageSection === 'pie' ? 'pie' : 'encabezado',
      section: pageSection,
      origin: 'system',
      sourceNode: null,
      type: isQR ? 'qrcode' : 'image',
      requiredTier: 'obligatorio_siempre',
      x: xMm,
      y: yMm,
      width: wMm,
      height: hMm,
      fontSize: 10,
      bold: false,
      italic: false,
      underline: false,
    });
  }

  private deserializeTable(comp: any): DetailTableColumn[] {
    if (!comp.columns) return [];

    return comp.columns.map((col: any) => ({
      id: col.id,
      header: col.header,
      bindingSource: col.binding?.source ?? col.id,
      bindingDataType: col.binding?.dataType ?? 'String',
      width: col.width,
      align: (col.align ?? 'Left') as 'Left' | 'Right' | 'Center',
      format: col.binding?.format,
      fieldKey: col.binding?.source ?? col.id,
      requiredTier: 'obligatorio_siempre' as const,
    }));
  }

  /**
   * Resuelve un binding.source a fieldKey + sourceNode.
   * Formatos posibles:
   *   "company.Name"       → fieldKey=CompanyName, sourceNode=Company
   *   "head.LegalNumber"   → fieldKey=LegalNumber, sourceNode=InvcHead
   *   "Name"               → fieldKey=CustomerName, sourceNode=context section
   *   "/ARInvoiceDataSet/..." → full path
   */
  private resolveDeserializedBinding(
    binding: Binding,
    section: Section
  ): { fieldKey: string; sourceNode: string | null } {
    const source = binding.source;

    // Full path: /ARInvoiceDataSet/InvcHead/PaymentMeansDescription
    if (source.startsWith('/')) {
      const parts = source.split('/');
      const nodeName = parts[2]; // InvcHead, Company, Customer, etc.
      const fieldPath = parts.slice(3).join('.');
      return {
        fieldKey: this.bindingPathToFieldKey(fieldPath, nodeName),
        sourceNode: nodeName,
      };
    }

    // Prefixed: "company.Name", "head.LegalNumber"
    const dotIndex = source.indexOf('.');
    if (dotIndex > 0) {
      const prefix = source.substring(0, dotIndex);
      const fieldPath = source.substring(dotIndex + 1);
      const nodeMap: Record<string, string> = {
        company: 'Company',
        head: 'InvcHead',
        customer: 'Customer',
      };
      const sourceNode = nodeMap[prefix] ?? prefix;
      return {
        fieldKey: this.bindingPathToFieldKey(fieldPath, sourceNode),
        sourceNode,
      };
    }

    // Relative: "Name", "ResaleID", "DspDocSubTotal"
    // Infer sourceNode from section type
    const sourceNode = section.type === 'Customer' ? 'Customer' :
                       section.type === 'Header' ? 'InvcHead' :
                       section.type === 'Totals' ? 'InvcHead' :
                       section.type === 'Footer' ? 'InvcHead' : null;

    return {
      fieldKey: this.bindingPathToFieldKey(source, sourceNode ?? 'InvcHead'),
      sourceNode,
    };
  }

  /** Maps binding field path back to our fieldKey */
  private bindingPathToFieldKey(path: string, sourceNode: string): string {
    // Reverse lookup from FIELD_KEY_BINDING
    for (const [key, resolver] of Object.entries(FIELD_KEY_BINDING)) {
      const resolved = resolver(sourceNode);
      if (resolved === path) return key;
    }
    // Fallback: return path as-is
    return path;
  }

  /** Reverse lookup for field label from our field definitions */
  private findFieldLabel(fieldKey: string): string | null {
    // Import would be circular, so hardcode common ones
    const labels: Record<string, string> = {
      CompanyName: 'Razón Social',
      TaxID: 'NIT',
      Address1: 'Dirección',
      City: 'Ciudad',
      InvoiceType: 'Tipo de Documento',
      InvoiceNum: 'Número de Factura',
      LegalNumber: 'Número Legal',
      InvoiceDate: 'Fecha de Emisión',
      DueDate: 'Fecha de Vencimiento',
      Resolution1: 'Resolución DIAN',
      CurrencyCode: 'Moneda',
      InvoiceComment: 'Observaciones',
      CustomerName: 'Nombre Cliente',
      PartNum: 'Código',
      LineDesc: 'Descripción',
      SellingShipQty: 'Cantidad',
      UnitPrice: 'Valor Unitario',
      ExtPrice: 'Valor Total',
      DspDocSubTotal: 'Subtotal',
      DocTaxAmt: 'IVA',
      DocWHTaxAmt: 'Retención',
      Discount: 'Descuento',
      DspDocInvoiceAmt: 'Total',
      QRCode: 'Código QR DIAN',
      CUFE: 'CUFE',
      Logo: 'Logo Empresa',
    };
    return labels[fieldKey] ?? null;
  }

  /** Infers requiredTier from fieldKey */
  private inferRequiredTier(fieldKey: string): PlacedField['requiredTier'] {
    // System fields are always mandatory
    if (['QRCode', 'CUFE', 'Logo', 'SignatureLine', 'SigningTime'].includes(fieldKey)) {
      return 'obligatorio_siempre';
    }
    // Most header/detail fields are mandatory
    if (['CompanyName', 'TaxID', 'InvoiceNum', 'LegalNumber', 'InvoiceDate',
         'PartNum', 'LineDesc', 'SellingShipQty', 'UnitPrice', 'ExtPrice',
         'DspDocSubTotal', 'DocTaxAmt', 'DspDocInvoiceAmt'].includes(fieldKey)) {
      return 'obligatorio_siempre';
    }
    return 'opcional';
  }

  private sectionTypeToPageSection(sectionType: string): PageSection {
    const map: Record<string, PageSection> = {
      Header: 'encabezado',
      Customer: 'encabezado',
      Company: 'encabezado',
      Detail: 'detalle',
      Taxes: 'detalle',
      Totals: 'totales',
      Footer: 'pie',
    };
    return map[sectionType] ?? 'encabezado';
  }

  private bindingDataTypeToFieldType(dataType: string): PlacedField['type'] {
    const map: Record<string, PlacedField['type']> = {
      String: 'string',
      Decimal: 'decimal',
      DateTime: 'date',
      Integer: 'integer',
    };
    return map[dataType] ?? 'string';
  }
}
