import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TemplateComponent, LineComponent } from '../../../../shared/models/template-json.model';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-line-renderer',
  template: `
    <svg
      class="line-svg"
      [style.left]="svgLeft()"
      [style.top]="svgTop()"
      [style.width]="svgWidth()"
      [style.height]="svgHeight()"
      (click)="clicked.emit(); $event.stopPropagation()"
    >
      <line
        [attr.x1]="lineX1()"
        [attr.y1]="lineY1()"
        [attr.x2]="lineX2()"
        [attr.y2]="lineY2()"
        [attr.stroke]="strokeColor()"
        [attr.stroke-width]="strokeWidth()"
      />
    </svg>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .line-svg {
      position: absolute;
      overflow: visible;
      cursor: pointer;
    }
    .line-svg:hover line {
      filter: brightness(0.8);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineRenderer {
  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();

  private get comp(): LineComponent {
    return this.component() as LineComponent;
  }

  svgLeft = () => {
    const minX = Math.min(this.comp?.start?.x ?? 0, this.comp?.end?.x ?? 0);
    return `${minX * PT_TO_PX * this.zoom()}px`;
  };

  svgTop = () => {
    const minY = Math.min(this.comp?.start?.y ?? 0, this.comp?.end?.y ?? 0);
    return `${minY * PT_TO_PX * this.zoom()}px`;
  };

  svgWidth = () => {
    const w = Math.abs((this.comp?.end?.x ?? 0) - (this.comp?.start?.x ?? 0));
    return `${Math.max(w, 1) * PT_TO_PX * this.zoom()}px`;
  };

  svgHeight = () => {
    const h = Math.abs((this.comp?.end?.y ?? 0) - (this.comp?.start?.y ?? 0));
    return `${Math.max(h, 1) * PT_TO_PX * this.zoom()}px`;
  };

  lineX1 = () => {
    const minX = Math.min(this.comp?.start?.x ?? 0, this.comp?.end?.x ?? 0);
    return ((this.comp?.start?.x ?? 0) - minX) * PT_TO_PX * this.zoom();
  };

  lineY1 = () => {
    const minY = Math.min(this.comp?.start?.y ?? 0, this.comp?.end?.y ?? 0);
    return ((this.comp?.start?.y ?? 0) - minY) * PT_TO_PX * this.zoom();
  };

  lineX2 = () => {
    const minX = Math.min(this.comp?.start?.x ?? 0, this.comp?.end?.x ?? 0);
    return ((this.comp?.end?.x ?? 0) - minX) * PT_TO_PX * this.zoom();
  };

  lineY2 = () => {
    const minY = Math.min(this.comp?.start?.y ?? 0, this.comp?.end?.y ?? 0);
    return ((this.comp?.end?.y ?? 0) - minY) * PT_TO_PX * this.zoom();
  };

  strokeColor = () => this.comp?.stroke ?? '#000';
  strokeWidth = () => this.comp?.strokeWidth ?? 1;
}
