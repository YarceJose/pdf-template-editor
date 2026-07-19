import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TemplateComponent } from '../../../../shared/models/template-json.model';
import { TextRenderer } from './text-renderer';
import { ImageRenderer } from './image-renderer';
import { RectangleRenderer } from './rectangle-renderer';
import { LineRenderer } from './line-renderer';
import { TableRenderer } from './table-renderer';

@Component({
  selector: 'app-component-renderer',
  imports: [
    TextRenderer,
    ImageRenderer,
    RectangleRenderer,
    LineRenderer,
    TableRenderer,
  ],
  template: `
    @if (component().type === 'Text') {
      <app-text-renderer
        [component]="component()"
        [zoom]="zoom()"
        [selected]="selected()"
        (clicked)="clicked.emit()"
      />
    } @else if (component().type === 'Image') {
      <app-image-renderer
        [component]="component()"
        [zoom]="zoom()"
        [selected]="selected()"
        (clicked)="clicked.emit()"
      />
    } @else if (component().type === 'Rectangle') {
      <app-rectangle-renderer
        [component]="component()"
        [zoom]="zoom()"
        [selected]="selected()"
        (clicked)="clicked.emit()"
      />
    } @else if (component().type === 'Line') {
      <app-line-renderer
        [component]="component()"
        [zoom]="zoom()"
        [selected]="selected()"
        (clicked)="clicked.emit()"
      />
    } @else if (component().type === 'Table') {
      <app-table-renderer
        [component]="component()"
        [zoom]="zoom()"
        [selected]="selected()"
        (clicked)="clicked.emit()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentRenderer {
  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();
}
