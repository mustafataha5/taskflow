
import { Routes } from '@angular/router';
import { numericIdGuard } from './core/guards/numeric-id-guard';
import { taskIdGuard } from './core/guards/task-id.guard-guard';

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
            pathMatch: 'full',
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
            path: ':id/edit',
            canMatch: [numericIdGuard],
            canActivate: [taskIdGuard],
            loadComponent: () =>
              import('./features/tasks/pages/task-form-page/task-form-page')
                .then(m => m.TaskFormPage)
          },
          {
            path: ':id',
            canMatch: [numericIdGuard],
            canActivate: [taskIdGuard],
            loadComponent: () =>
              import('./features/tasks/pages/task-details-page/task-details-page')
                .then(m => m.TaskDetailsPage)
          }
        ]
      },

      // NotFound keeps the MainLayout
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found')
            .then(m => m.NotFound)
      }
    ]
  }
];
