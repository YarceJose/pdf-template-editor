import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastNotificationService } from '../../services/toast-notification.service';

@Component({
  selector: 'app-toast',
  imports: [LucideAngularModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  toastService = inject(ToastNotificationService);
  toasts = this.toastService.toasts;

  iconMap: Record<string, string> = {
    error: 'AlertCircle',
    warning: 'AlertTriangle',
    success: 'CheckCircle',
    info: 'Info',
  };

  getIcon(type: string): string {
    return this.iconMap[type] ?? 'Info';
  }

  onDismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
