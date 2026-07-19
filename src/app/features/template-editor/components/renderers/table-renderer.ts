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
          @for (row of placeholderRows; track $index) {
            <tr [style.background]="rowBg($index)">
              @for (col of columns; track col.id) {
                <td
                  [style.text-align]="col.align"
                  [ngStyle]="rowStyle()"
                >{{ resolveCell(col, row) }}</td>
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

  /** Design-time placeholder rows — show binding source names, not real data */
  get placeholderRows(): Record<string, string>[] {
    const placeholders: Record<string, string>[] = [];
    for (let i = 0; i < 3; i++) {
      const row: Record<string, string> = {};
      for (const col of this.columns) {
        row[col.binding?.source ?? ''] = `[${col.binding?.source ?? ''}]`;
      }
      placeholders.push(row);
    }
    return placeholders;
  }

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

  resolveCell(col: TableColumn, row: Record<string, string>): string {
    if (!col.binding) return '';
    return row[col.binding.source] ?? `[${col.binding.source}]`;
  }
}
