import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { Section } from '../../../../shared/models/template-json.model';
import { ComponentRenderer } from '../renderers/component-renderer';
import { TemplateJsonService } from '../../services/template-json.service';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-section-renderer',
  imports: [ComponentRenderer],
  template: `
    <div
      class="section"
      [style.left]="left()"
      [style.top]="top()"
      [style.width]="width()"
      [style.height]="height()"
      [class.section-selected]="isActive()"
    >
      <div class="section-label">{{ section().type }} — {{ section().id }}</div>
      @for (comp of section().components; track comp.id) {
        <app-component-renderer
          [component]="comp"
          [zoom]="zoom()"
          [selected]="isSelected(comp.id)"
          (clicked)="onComponentClicked(comp.id)"
        />
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .section {
      position: absolute;
      border: 1px dashed rgba(37, 99, 235, 0.15);
      box-sizing: border-box;
    }
    .section-selected {
      border-color: rgba(37, 99, 235, 0.3);
    }
    .section-label {
      position: absolute;
      top: -18px;
      left: 0;
      font-size: 9px;
      font-family: monospace;
      color: rgba(37, 99, 235, 0.4);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionRenderer {
  private state = inject(TemplateJsonService);

  section = input.required<Section>();
  zoom = input(1);

  left = () => `${this.section().bounds.x * PT_TO_PX * this.zoom()}px`;
  top = () => `${this.section().bounds.y * PT_TO_PX * this.zoom()}px`;
  width = () => `${this.section().bounds.width * PT_TO_PX * this.zoom()}px`;
  height = () => `${this.section().bounds.height * PT_TO_PX * this.zoom()}px`;

  isActive = () => this.state.activeSectionId() === this.section().id;

  isSelected(componentId: string): boolean {
    return this.state.selectedComponentId() === componentId;
  }

  onComponentClicked(componentId: string): void {
    this.state.selectComponent(componentId);
  }
}
