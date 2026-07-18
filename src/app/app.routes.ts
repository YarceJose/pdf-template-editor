import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/template-editor/pages/editor-page/editor-page').then(
        (m) => m.EditorPage
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
