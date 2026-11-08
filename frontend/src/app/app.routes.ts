
import { Routes } from '@angular/router';
import { numericIdGuard } from './core/guards/numeric-id-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page')
            .then(m => m.DashboardPage)
      },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/tasks/pages/task-list-page/task-list-page')
                .then(m => m.TaskListPage)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/tasks/pages/task-form-page/task-form-page')
                .then(m => m.TaskFormPage)
          },
          {
            path: ':id',
            canMatch: [numericIdGuard],
            loadComponent: () =>
              import('./features/tasks/pages/task-details-page/task-details-page')
                .then(m => m.TaskDetailsPage)
          },
          {
            path: ':id/edit',
            canMatch: [numericIdGuard],
            loadComponent: () =>
              import('./features/tasks/pages/task-form-page/task-form-page')
                .then(m => m.TaskFormPage)
          },
          
        ]
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found')
        .then(m => m.NotFound)
  }
];
