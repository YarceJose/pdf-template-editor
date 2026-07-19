import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  detail?: string;
  duration: number;
  timestamp: number;
}

let nextToastId = 1;

@Injectable({ providedIn: 'root' })
export class ToastNotificationService {
  toasts = signal<Toast[]>([]);

  private defaults: Record<ToastType, { duration: number }> = {
    error:    { duration: 5000 },
    warning:  { duration: 4000 },
    success:  { duration: 3000 },
    info:     { duration: 3000 },
  };

  show(type: ToastType, message: string, detail?: string, duration?: number): number {
    const id = nextToastId++;
    const dur = duration ?? this.defaults[type].duration;

    const toast: Toast = {
      id,
      type,
      message,
      detail,
      duration: dur,
      timestamp: Date.now(),
    };

    this.toasts.update((list) => [...list, toast]);

    if (dur > 0) {
      setTimeout(() => this.dismiss(id), dur);
    }

    return id;
  }

  error(message: string, detail?: string): number {
    return this.show('error', message, detail);
  }

  warning(message: string, detail?: string): number {
    return this.show('warning', message, detail);
  }

  success(message: string, detail?: string): number {
    return this.show('success', message, detail);
  }

  info(message: string, detail?: string): number {
    return this.show('info', message, detail);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  dismissAll(): void {
    this.toasts.set([]);
  }
}
