import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { TemplateComponent, ImageComponent } from '../../../../shared/models/template-json.model';
import { AssetService } from '../../services/asset.service';

const PT_TO_PX = 1.3333;

@Component({
  selector: 'app-image-renderer',
  template: `
    <div
      class="image-component"
      [class.selected]="selected()"
      [style.left]="left()"
      [style.top]="top()"
      [style.width]="width()"
      [style.height]="height()"
      [style.object-fit]="fit"
      (click)="clicked.emit(); $event.stopPropagation()"
    >
      @if (assetUrl) {
        <img [src]="assetUrl" [style.object-fit]="fit" alt="asset" />
      } @else {
        <div class="image-placeholder">
          <span>{{ assetId }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
    }
    .image-component {
      position: absolute;
      overflow: hidden;
      cursor: pointer;
      outline: 1.5px solid transparent;
      outline-offset: 1px;
      box-sizing: border-box;
    }
    .image-component.selected {
      outline-color: #2563EB;
    }
    .image-component:hover:not(.selected) {
      outline-color: rgba(37, 99, 235, 0.4);
    }
    img {
      width: 100%;
      height: 100%;
      display: block;
    }
    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(37, 99, 235, 0.08);
      border: 1.5px dashed rgba(37, 99, 235, 0.3);
      border-radius: 4px;
      font-size: 10px;
      color: rgba(37, 99, 235, 0.6);
      font-family: monospace;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageRenderer {
  private assetService = inject(AssetService);

  component = input.required<TemplateComponent>();
  zoom = input(1);
  selected = input(false);
  clicked = output<void>();

  private get comp(): ImageComponent {
    return this.component() as ImageComponent;
  }

  get assetUrl(): string | undefined {
    return this.assetService.resolveAssetUrl(this.comp?.assetId ?? '');
  }

  get assetId(): string {
    return this.comp?.assetId ?? '';
  }

  get fit(): string {
    return this.comp?.fit ?? 'Contain';
  }

  left = () => `${(this.comp?.position?.x ?? 0) * PT_TO_PX * this.zoom()}px`;
  top = () => `${(this.comp?.position?.y ?? 0) * PT_TO_PX * this.zoom()}px`;
  width = () => `${(this.comp?.size?.width ?? 40) * PT_TO_PX * this.zoom()}px`;
  height = () => `${(this.comp?.size?.height ?? 40) * PT_TO_PX * this.zoom()}px`;
}
