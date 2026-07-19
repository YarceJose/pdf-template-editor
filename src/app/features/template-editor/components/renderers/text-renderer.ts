import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { TemplateComponent, TextComponent } from '../../../../shared/models/template-json.model';
import { StyleResolverService } from '../../services/style-resolver.service';
import { BindingService } from '../../services/binding.service';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-text-renderer',
  template: `
    @if (!hidden) {
      <div
        class="text-component"
        [class.selected]="selected()"
        [class.clickable]="true"
        [style.left]="left()"
        [style.top]="top()"
        [style.width]="width()"
        [style.height]="height()"
        [style.text-align]="alignment"
        [style.font-family]="resolvedStyle?.fontFamily"
        [style.font-size]="resolvedStyle?.fontSize"
        [style.font-weight]="resolvedStyle?.fontWeight"
        [style.color]="resolvedStyle?.color"
        [style.line-height]="resolvedStyle?.lineHeight"
        (click)="clicked.emit(); $event.stopPropagation()"
      >
        @if (prefix) {<span class="prefix">{{ prefix }}</span>}{{ displayValue }}@if (suffix) {<span class="suffix">{{ suffix }}</span>}
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .text-component {
      position: absolute;
      overflow: hidden;
      white-space: nowrap;
      cursor: pointer;
      box-sizing: border-box;
      transition: outline-color 0.1s;
      outline: 1.5px solid transparent;
      outline-offset: 1px;
    }
    .text-component.selected {
      outline-color: #2563EB;
    }
    .text-component:hover:not(.selected) {
      outline-color: rgba(37, 99, 235, 0.4);
    }
    .prefix, .suffix {
      white-space: pre;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextRenderer {
  private styleResolver = inject(StyleResolverService);
  private bindingService = inject(BindingService);

  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();

  private get comp(): TextComponent {
    return this.component() as TextComponent;
  }

  get resolvedStyle() {
    return this.styleResolver.resolve(this.comp?.styleRef);
  }

  get displayValue(): string {
    const c = this.comp;
    if (!c) return '';
    if (c.binding) {
      if (this.bindingService.shouldHide(c.binding)) return '';
      return this.bindingService.resolveBinding(c.binding);
    }
    return c.staticValue ?? '';
  }

  get hidden(): boolean {
    const c = this.comp;
    if (!c) return true;
    if (c.binding && this.bindingService.shouldHide(c.binding)) return true;
    return false;
  }

  get prefix(): string {
    return this.comp?.prefix ?? '';
  }

  get suffix(): string {
    return this.comp?.suffix ?? '';
  }

  get alignment(): string {
    return this.comp?.alignment ?? 'Left';
  }

  left = () => `${(this.comp?.position?.x ?? 0) * PT_TO_PX * this.zoom()}px`;
  top = () => `${(this.comp?.position?.y ?? 0) * PT_TO_PX * this.zoom()}px`;
  width = () => `${(this.comp?.size?.width ?? 50) * PT_TO_PX * this.zoom()}px`;
  height = () => `${(this.comp?.size?.height ?? 10) * PT_TO_PX * this.zoom()}px`;
}
