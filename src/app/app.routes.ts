import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// ─── ROLES DEL SISTEMA (sincronizados con Role.RoleName en el backend) ────────
//
//   ADMIN         — acceso total
//   RECEPCIONISTA — operaciones diarias (clientes, membresías, pagos, asistencias)
//   ENTRENADOR    — antes llamado CONTADOR (DataInitializer migra la BD automáticamente)
//                   puede ver asistencias y clientes, no gestiona pagos
//   DUENO         — vista gerencial (asistencias, reportes, pagos lectura)
//
// CAMBIOS:
//   - 'CONTADOR' eliminado de todas las rutas (no existe en el backend)
//   - 'ENTRENADOR' añadido a asistencias y clientes
//   - Ruta 'cupones' añadida para Fase 2
// ─────────────────────────────────────────────────────────────────────────────

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
        canActivate: [roleGuard(['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR'])],
        loadComponent: () =>
          import('./features/clientes/clientes.component')
            .then(m => m.Clientes)
      },
      {
        path: 'planes',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/planes/planes.component')
            .then(m => m.Planes)
      },
      {
        path: 'membresias',
        canActivate: [roleGuard(['ADMIN', 'RECEPCIONISTA'])],
        loadComponent: () =>
          import('./features/membresias/membresias.component')
            .then(m => m.Membresias)
      },
      {
        path: 'pagos',
        canActivate: [roleGuard(['ADMIN', 'RECEPCIONISTA', 'DUENO'])],
        loadComponent: () =>
          import('./features/pagos/pagos.component')
            .then(m => m.Pagos)
      },
      {
        path: 'asistencias',
        canActivate: [roleGuard(['ADMIN', 'RECEPCIONISTA', 'ENTRENADOR', 'DUENO'])],
        loadComponent: () =>
          import('./features/asistencias/asistencias.component')
            .then(m => m.Asistencias)
      },
      {
        path: 'reportes',
        canActivate: [roleGuard(['ADMIN', 'DUENO', 'RECEPCIONISTA'])],
        loadComponent: () =>
          import('./features/reportes/reportes.component')
            .then(m => m.Reportes)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/usuarios/usuarios.component')
            .then(m => m.Usuarios)
      },
      {
        path: 'cupones',
        canActivate: [roleGuard(['ADMIN', 'DUENO'])],
        loadComponent: () =>
          import('./features/cupones/cupones.component')
            .then(m => m.Cupones)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
