import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent, TableComponent, TableColumn } from '../../../../shared/models/template-json.model';
import { StyleResolverService } from '../../services/style-resolver.service';
import { BindingService } from '../../services/binding.service';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-table-renderer',
  imports: [CommonModule],
  template: `
    <div
      class="table-wrapper"
      [class.selected]="selected()"
      [style.left]="left()"
      [style.top]="top()"
      [style.width]="width()"
      (click)="clicked.emit(); $event.stopPropagation()"
    >
      <table>
        <thead>
          <tr [style.background]="headerBg()">
            @for (col of columns; track col.id) {
              <th
                [style.width]="colWidth(col)"
                [style.text-align]="col.align"
                [ngStyle]="headerStyle()"
              >{{ col.header }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of mockRows; track $index) {
            <tr [style.background]="rowBg($index)">
              @for (col of columns; track col.id) {
                <td
                  [style.text-align]="col.align"
                  [ngStyle]="rowStyle()"
                >{{ resolveCell(col) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .table-wrapper {
      position: absolute;
      cursor: pointer;
      outline: 1.5px solid transparent;
      outline-offset: 1px;
      box-sizing: border-box;
      overflow: hidden;
    }
    .table-wrapper.selected {
      outline-color: #2563EB;
    }
    .table-wrapper:hover:not(.selected) {
      outline-color: rgba(37, 99, 235, 0.4);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    th, td {
      padding: 2px 4px;
      border: 0.5px solid #CCC;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    th {
      font-weight: 700;
      color: #FFF;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRenderer {
  private styleResolver = inject(StyleResolverService);

  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();

  private get comp(): TableComponent {
    return this.component() as TableComponent;
  }

  get columns(): TableColumn[] {
    return this.comp.columns;
  }

  mockRows = [
    { InvoiceLine: '1', PartNum: 'SRV-CONS-001', LineDesc: 'Consultoría en desarrollo de software', SellingShipQty: '10.00', UnitPrice: '250,000.00', ExtPrice: '2,500,000.00' },
    { InvoiceLine: '2', PartNum: 'LIC-ANG-002', LineDesc: 'Licencia Angular Enterprise', SellingShipQty: '5.00', UnitPrice: '120,000.00', ExtPrice: '600,000.00' },
    { InvoiceLine: '3', PartNum: 'HOS-AWS-003', LineDesc: 'Hosting AWS mensual', SellingShipQty: '1.00', UnitPrice: '350,000.00', ExtPrice: '350,000.00' },
  ];

  left = () => `${(this.comp?.position?.x ?? 0) * PT_TO_PX * this.zoom()}px`;
  top = () => `${(this.comp?.position?.y ?? 0) * PT_TO_PX * this.zoom()}px`;
  width = () => `${(this.comp?.size?.width ?? 100) * PT_TO_PX * this.zoom()}px`;

  headerBg = () => this.comp?.headerBackground ?? '#1A3A5C';

  rowBg = (index: number) => {
    return index % 2 === 1 ? (this.comp?.rowAltBackground ?? '#EEF3F9') : 'transparent';
  };

  headerStyle(): Record<string, string> {
    const style = this.styleResolver.resolve(this.comp?.headerStyleRef);
    if (!style) return {};
    return {
      'font-family': style.fontFamily,
      'font-size': style.fontSize,
      'font-weight': style.fontWeight,
      'color': style.color,
    };
  }

  rowStyle(): Record<string, string> {
    const style = this.styleResolver.resolve(this.comp?.rowStyleRef);
    if (!style) return {};
    return {
      'font-family': style.fontFamily,
      'font-size': style.fontSize,
      'font-weight': style.fontWeight,
      'color': style.color,
    };
  }

  colWidth(col: TableColumn): string {
    const totalWidth = this.comp?.size?.width ?? 100;
    const ratio = col.width / totalWidth;
    return `${ratio * 100}%`;
  }

  resolveCell(col: TableColumn): string {
    if (!col.binding) return '';
    const row = this.mockRows[0];
    const rawValue = (row as Record<string, string>)[col.binding.source] ?? '';
    return rawValue || `[${col.binding.source}]`;
  }
}
