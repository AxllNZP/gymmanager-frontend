import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.Dashboard)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes.component')
            .then(m => m.Clientes)
      },
      {
        path: 'planes',
        loadComponent: () =>
          import('./features/planes/planes.component')
            .then(m => m.Planes)
      },
      {
        path: 'membresias',
        loadComponent: () =>
          import('./features/membresias/membresias.component')
            .then(m => m.Membresias)
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/pagos/pagos.component')
            .then(m => m.Pagos)
      },
      {
        path: 'asistencias',
        loadComponent: () =>
          import('./features/asistencias/asistencias.component')
            .then(m => m.Asistencias)
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes.component')
            .then(m => m.Reportes)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios.component')
            .then(m => m.Usuarios)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];