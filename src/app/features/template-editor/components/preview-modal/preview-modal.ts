import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  inject,
} from '@angular/core';
import { TemplateSerializerService, TemplateDefinition } from '../../services/template-serializer';
import { FieldValidationService, ValidationError } from '../../services/field-validation';
import { PlacedField } from '../../../../shared/models/placed-field.model';

@Component({
  selector: 'app-preview-modal',
  imports: [],
  templateUrl: './preview-modal.html',
  styleUrl: './preview-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewModal {
  private serializer = inject(TemplateSerializerService);
  private validation = inject(FieldValidationService);

  fields = input<PlacedField[]>([]);
  templateName = input('Factura Electrónica v1.0');
  closed = output<void>();

  templateJson = computed(() => {
    return this.serializer.toJSON(this.fields(), this.templateName());
  });

  templateObj = computed(() => {
    return this.serializer.serialize(this.fields(), this.templateName());
  });

  errors = computed(() => this.validation.validate(this.fields()));
  errorCount = computed(() => this.errors().filter((e) => e.severity === 'error').length);
  warningCount = computed(() => this.errors().filter((e) => e.severity === 'warning').length);

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  onDownloadJson(): void {
    const json = this.templateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.templateName().replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onCopyJson(): void {
    navigator.clipboard.writeText(this.templateJson());
  }

  trackByError(_index: number, error: ValidationError): string {
    return `${error.fieldId}-${error.message}`;
  }
}
