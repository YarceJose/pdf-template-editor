import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { TemplateDocument } from '../../../shared/models/template-json.model';
import { TemplateSerializerService } from './template-serializer';
import { TemplateStateService } from './template-state';
import { PlacedField } from '../../../shared/models/placed-field.model';
import { DetailTableColumn } from './template-state';

export interface LoadedTemplate {
  document: TemplateDocument;
  fields: PlacedField[];
  detailColumns: DetailTableColumn[];
}

@Injectable({ providedIn: 'root' })
export class TemplateLoaderService {
  private http = inject(HttpClient);
  private serializer = inject(TemplateSerializerService);
  private state = inject(TemplateStateService);
  private platformId = inject(PLATFORM_ID);

  private baseTemplate$?: Observable<TemplateDocument>;

  /**
   * Carga la plantilla base desde assets (singleton cached).
   * En SSR retorna null para evitar errores de prerender.
   */
  loadBaseTemplate(): Observable<TemplateDocument | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    if (!this.baseTemplate$) {
      this.baseTemplate$ = this.http.get<TemplateDocument>(
        'assets/templates/base-factura-dian.json'
      ).pipe(shareReplay(1));
    }
    return this.baseTemplate$;
  }

  /**
   * Carga la plantilla base y la convierte a PlacedField[] para el canvas.
   */
  loadBaseAsFields(): Observable<LoadedTemplate | null> {
    return this.loadBaseTemplate().pipe(
      map((doc) => {
        if (!doc) return null;
        const { fields, detailColumns } = this.serializer.deserialize(doc);
        return { document: doc, fields, detailColumns };
      })
    );
  }

  /**
   * Carga la plantilla base directamente en el state del editor.
   */
  loadIntoEditor(): Observable<void> {
    return this.loadBaseAsFields().pipe(
      map((result) => {
        if (!result) return;
        const { fields, detailColumns } = result;
        this.state.loadFields(fields);
        this.state.detailTableColumns.set(detailColumns);
        this.state.saveSnapshot();
      })
    );
  }
}
