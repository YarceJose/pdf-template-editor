import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import {
  Search, ChevronDown, ChevronRight, GripVertical,
  Type, Heading, Tags, Variable, Hash, Calendar, Table, Minus, Square, Image as ImageIcon, QrCode,
  AlignLeft, AlignCenterHorizontal, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  Grid3x3, Magnet, ZoomIn, ZoomOut, Undo2, Redo2, Eye, Trash2, Download, X,
  Building2, User, ShoppingCart, Calculator, PenTool, Pencil,
  Copy, AlertTriangle, AlertCircle, FileText,
  ChevronUp, Bold, Italic, Underline, MousePointer2, Plus, Save, CheckCircle, Loader2, Lock,
  RotateCcw, Check
} from 'lucide-angular';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Search, ChevronDown, ChevronRight, GripVertical,
        Type, Heading, Tags, Variable, Hash, Calendar, Table, Minus, Square, Image: ImageIcon, QrCode,
        AlignLeft, AlignCenterHorizontal, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
        Grid3x3, Magnet, ZoomIn, ZoomOut, Undo2, Redo2, Eye, Trash2, Download, X,
        Building2, User, ShoppingCart, Calculator, PenTool, Pencil,
        Copy, AlertTriangle, AlertCircle, FileText,
        ChevronUp, Bold, Italic, Underline, MousePointer2, Plus, Save, CheckCircle, Loader2, Lock,
        RotateCcw, Check
      })
    )
  ]
};
