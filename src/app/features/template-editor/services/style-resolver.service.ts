import { Injectable, inject } from '@angular/core';
import { FontDefinition, resolveStyle } from '../../../shared/models/template-json.model';
import { TemplateJsonService } from './template-json.service';

/**
 * Resuelve styleRef → FontDefinition.
 * Centraliza la lógica de estilos para no duplicar en cada renderer.
 */
@Injectable({ providedIn: 'root' })
export class StyleResolverService {
  private templateJson = inject(TemplateJsonService);

  /** Resuelve un styleRef a su FontDefinition completa */
  resolve(styleRef?: string): ResolvedStyle | undefined {
    if (!styleRef) return undefined;
    const fonts = this.templateJson.styles();
    const font = resolveStyle(fonts, styleRef);
    if (!font) return undefined;
    return this.toResolvedStyle(font);
  }

  /** Resuelve un styleRef directamente desde una lista de fonts (para uso offline) */
  resolveFromFonts(fonts: FontDefinition[], styleRef?: string): ResolvedStyle | undefined {
    if (!styleRef) return undefined;
    const font = resolveStyle(fonts, styleRef);
    if (!font) return undefined;
    return this.toResolvedStyle(font);
  }

  private toResolvedStyle(font: FontDefinition): ResolvedStyle {
    return {
      fontFamily: font.family,
      fontSize: `${font.size}pt`,
      fontWeight: font.bold ? '700' : '400',
      color: font.color,
      lineHeight: `${font.size * 1.4}pt`,
    };
  }
}

export interface ResolvedStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  lineHeight: string;
}
