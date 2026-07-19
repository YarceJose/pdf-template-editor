import { Component, ChangeDetectionStrategy, input, output, inject, signal, HostBinding, HostListener } from '@angular/core';
import { TemplateComponent } from '../../../../shared/models/template-json.model';
import { TemplateJsonService } from '../../services/template-json.service';
import { TextRenderer } from './text-renderer';
import { ImageRenderer } from './image-renderer';
import { RectangleRenderer } from './rectangle-renderer';
import { LineRenderer } from './line-renderer';
import { TableRenderer } from './table-renderer';

const PT_TO_PX = 1.3333;

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
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentRenderer {
  private state = inject(TemplateJsonService);

  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();

  /** Delta de arrastre en curso (px), aplicado como preview visual antes de confirmar */
  private dragDeltaPx = signal({ x: 0, y: 0 });

  @HostBinding('style.transform')
  get dragTransform(): string {
    const d = this.dragDeltaPx();
    return d.x || d.y ? `translate(${d.x}px, ${d.y}px)` : '';
  }

  @HostBinding('style.cursor')
  cursor = 'grab';

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.stopPropagation();

    const startClientX = event.clientX;
    const startClientY = event.clientY;

    const onMove = (e: PointerEvent) => {
      this.dragDeltaPx.set({ x: e.clientX - startClientX, y: e.clientY - startClientY });
    };

    const onUp = (e: PointerEvent) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      const delta = this.dragDeltaPx();
      this.dragDeltaPx.set({ x: 0, y: 0 });

      if (Math.abs(delta.x) < 2 && Math.abs(delta.y) < 2) return;

      const scale = PT_TO_PX * this.zoom();
      this.state.moveComponent(this.component().id, delta.x / scale, delta.y / scale);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }
}
