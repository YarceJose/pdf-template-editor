import { Injectable, inject, signal } from '@angular/core';
import { Asset } from '../../../shared/models/template-json.model';
import { TemplateJsonService } from './template-json.service';

/**
 * Gestiona assets (imágenes) del template.
 * Resuelve assetId → URL/objectKey para renderizar.
 */
@Injectable({ providedIn: 'root' })
export class AssetService {
  private templateJson = inject(TemplateJsonService);

  /** Cache de URLs blob locales */
  private blobUrls = signal<Map<string, string>>(new Map());

  /** Resuelve un assetId a su URL de renderizado */
  resolveAssetUrl(assetId: string): string | undefined {
    // Primero buscar en cache de blobs
    const cached = this.blobUrls().get(assetId);
    if (cached) return cached;

    // Luego buscar en assets del documento
    const assets = this.templateJson.assets();
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return undefined;

    // Por ahora retornamos objectKey como placeholder
    // En producción esto resolvería contra un backend/S3
    return asset.objectKey;
  }

  /** Registra un blob URL local (para uploads del usuario) */
  registerBlobUrl(assetId: string, url: string): void {
    this.blobUrls.update((map) => {
      const next = new Map(map);
      next.set(assetId, url);
      return next;
    });
  }

  /** Obtiene la lista de assets disponibles */
  getAvailableAssets(): Asset[] {
    return this.templateJson.assets();
  }
}
