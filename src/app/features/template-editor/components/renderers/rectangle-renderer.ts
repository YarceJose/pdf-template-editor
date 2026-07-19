import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TemplateComponent, RectangleComponent } from '../../../../shared/models/template-json.model';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-rectangle-renderer',
  template: `
    <div
      class="rect-component"
      [class.selected]="selected()"
      [style.left]="left()"
      [style.top]="top()"
      [style.width]="width()"
      [style.height]="height()"
      [style.border]="borderStyle()"
      [style.background]="bgColor()"
      [style.border-radius]="borderRadius()"
      (click)="clicked.emit(); $event.stopPropagation()"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .rect-component {
      position: absolute;
      cursor: pointer;
      outline: 1.5px solid transparent;
      outline-offset: 1px;
      box-sizing: border-box;
    }
    .rect-component.selected {
      outline-color: #2563EB;
    }
    .rect-component:hover:not(.selected) {
      outline-color: rgba(37, 99, 235, 0.4);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RectangleRenderer {
  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();

  private get comp(): RectangleComponent {
    return this.component() as RectangleComponent;
  }

  left = () => `${(this.comp?.position?.x ?? 0) * PT_TO_PX * this.zoom()}px`;
  top = () => `${(this.comp?.position?.y ?? 0) * PT_TO_PX * this.zoom()}px`;
  width = () => `${(this.comp?.size?.width ?? 50) * PT_TO_PX * this.zoom()}px`;
  height = () => `${(this.comp?.size?.height ?? 30) * PT_TO_PX * this.zoom()}px`;

  borderStyle(): string {
    const color = this.comp?.stroke ?? '#000';
    const width = this.comp?.strokeWidth ?? 1;
    return `${width}px solid ${color}`;
  }

  bgColor(): string {
    return this.comp?.fill ?? 'transparent';
  }

  borderRadius(): string {
    return this.comp?.cornerRadius ? `${this.comp.cornerRadius}px` : '0';
  }
}
