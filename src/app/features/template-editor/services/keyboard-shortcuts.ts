import { Injectable, NgZone, inject, OnDestroy } from '@angular/core';
import { TemplateStateService } from './template-state';
import { ToastNotificationService } from '../../../shared/services/toast-notification.service';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService implements OnDestroy {
  private zone = inject(NgZone);
  private state = inject(TemplateStateService);
  private toast = inject(ToastNotificationService);
  private handler: ((e: KeyboardEvent) => void) | null = null;

  init(): void {
    if (typeof document === 'undefined') return;

    this.handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.zone.run(() => this.state.undo());
      }

      if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.zone.run(() => this.state.redo());
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = this.state.selectedFieldId();
        if (id && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
          e.preventDefault();
          this.zone.run(() => {
            const result = this.state.deleteField(id);
            if (!result.success && result.reason) {
              this.toast.warning('No se pudo eliminar', result.reason);
            }
          });
        }
      }
    };

    this.zone.runOutsideAngular(() => {
      document.addEventListener('keydown', this.handler!);
    });
  }

  ngOnDestroy(): void {
    if (this.handler && typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handler);
      this.handler = null;
    }
  }
}
