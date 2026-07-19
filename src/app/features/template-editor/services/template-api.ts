import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TemplateSerializerService, TemplateDefinition } from './template-serializer';
import { PlacedField } from '../../../shared/models/placed-field.model';

export interface SaveTemplatePayload {
  template: TemplateDefinition;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveTemplateResponse {
  success: boolean;
  id?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class TemplateApiService {
  private http = inject(HttpClient);
  private serializer = inject(TemplateSerializerService);

  private readonly API_BASE = '/api/templates';

  saveTemplate(fields: PlacedField[], name: string): Observable<SaveTemplateResponse> {
    const template = this.serializer.serialize(fields, name);
    const payload: SaveTemplatePayload = {
      template,
      updatedAt: new Date().toISOString(),
    };

    return this.http.post<SaveTemplateResponse>(this.API_BASE, payload).pipe(
      catchError(this.handleError)
    );
  }

  updateTemplate(id: string, fields: PlacedField[], name: string): Observable<SaveTemplateResponse> {
    const template = this.serializer.serialize(fields, name);
    const payload: SaveTemplatePayload = {
      template,
      updatedAt: new Date().toISOString(),
    };

    return this.http.put<SaveTemplateResponse>(`${this.API_BASE}/${id}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  getTemplate(id: string): Observable<TemplateDefinition> {
    return this.http.get<TemplateDefinition>(`${this.API_BASE}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getTemplates(): Observable<{ templates: TemplateDefinition[] }> {
    return this.http.get<{ templates: TemplateDefinition[] }>(this.API_BASE).pipe(
      catchError(this.handleError)
    );
  }

  deleteTemplate(id: string): Observable<SaveTemplateResponse> {
    return this.http.delete<SaveTemplateResponse>(`${this.API_BASE}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Error desconocido al guardar el template';

    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    } else if (error.status === 400) {
      message = 'Datos inválidos. Verifica la estructura del template.';
    } else if (error.status === 404) {
      message = 'Template no encontrado.';
    } else if (error.status >= 500) {
      message = 'Error del servidor. Intenta de nuevo más tarde.';
    }

    console.error('[TemplateApiService]', error);
    return throwError(() => ({ status: error.status, message }));
  }
}
