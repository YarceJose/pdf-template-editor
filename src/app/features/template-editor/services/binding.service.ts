import { Injectable } from '@angular/core';
import { Binding, BindingDataType } from '../../../shared/models/template-json.model';

/**
 * Resuelve bindings a datos mock para previsualización.
 * El diseñador solo almacena la definición del binding.
 * El backend reemplazará estos valores con datos reales.
 */
@Injectable({ providedIn: 'root' })
export class BindingService {
  /** Datos mock por defecto para previsualización */
  private mockData: Record<string, string> = {
    // Company
    'company.Name': 'ACME S.A.S.',
    'company.StateTaxID': '900123456-7',
    'company.Address1': 'Calle 10 #5-20, Centro',
    'company.City': 'Bogotá D.C.',

    // Head
    'head.LegalNumber': 'FE-00001234',
    'head.InvoiceDate': '18/07/2026',
    'head.Resolution1': 'Res. 18760000001 del 01/01/2026',
    'head.InvoiceType': 'Factura Electrónica',
    'head.InvoiceNum': 'INV-2026-001234',
    'head.DueDate': '17/08/2026',
    'head.CurrencyCode': 'COP',
    'head.InvoiceComment': 'Servicio de consultoría técnico-profesional',
    'head.InvoicePeriod': 'Julio 2026',
    'head.Legends1': 'Autorización DIAN 18760000001',
    'head.PaymentMeansDescription': 'Crédito',

    // Customer
    'Name': 'DISTRIBUCIONES XYZ LTDA.',
    'ResaleID': '800987654-3',
    'City': 'Medellín',
    'Address1': 'Carrera 43A #1-50, El Poblado',
    'PhoneNum': '+57 604 2345678',
    'EmailAddress': 'contabilidad@xyz.com',

    // Detail (line items)
    'InvoiceLine': '1',
    'PartNum': 'SRV-CONS-001',
    'LineDesc': 'Consultoría en desarrollo de software',
    'SellingShipQty': '10.00',
    'UnitPrice': '250,000.00',
    'ExtPrice': '2,500,000.00',

    // Totals
    'DspDocSubTotal': '2,500,000.00',
    'DocTaxAmt': '475,000.00',
    'DocWHTaxAmt': '0.00',
    'Discount': '0.00',
    'DspDocInvoiceAmt': '2,975,000.00',
    'CalculationRate_c': '4,150.23',
  };

  /** Resuelve un binding a su valor mock formateado */
  resolveBinding(binding: Binding): string {
    const rawValue = this.mockData[binding.source] ?? `[${binding.source}]`;
    return this.formatValue(rawValue, binding.dataType, binding.format);
  }

  /** Formatea un valor según tipo y formato */
  private formatValue(value: string, dataType: BindingDataType, format?: string): string {
    if (!value || value.startsWith('[')) return value;

    switch (dataType) {
      case 'Decimal':
        return value; // Ya viene formateado del mock
      case 'DateTime':
        return value; // Ya viene formateado como dd/MM/yyyy
      case 'Integer':
        return value;
      case 'String':
      default:
        return value;
    }
  }

  /** Verifica si un binding debe ocultarse (hideIfEmpty + valor vacío) */
  shouldHide(binding?: Binding): boolean {
    if (!binding) return false;
    if (!binding.hideIfEmpty) return false;
    const value = this.mockData[binding.source];
    return !value || value.trim() === '';
  }
}
