import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const snackBar    = inject(MatSnackBar);
  const token       = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {
        case 401:
          // Sesión expirada — limpiar y redirigir
          authService.logout();
          snackBar.open('Tu sesión expiró. Por favor, iniciá sesión nuevamente.', 'Cerrar', {
            duration: 5000,
            panelClass: ['snack-warning'],
          });
          break;

        case 403:
          // Sin permisos — redirigir sin cerrar sesión
          router.navigate(['/dashboard']);
          snackBar.open('No tenés permisos para realizar esta acción.', 'Cerrar', {
            duration: 4000,
            panelClass: ['snack-warning'],
          });
          break;

        case 0:
        case 503:
          // Sin conexión o servidor caído
          snackBar.open('No se pudo conectar al servidor. Verificá tu conexión.', 'Cerrar', {
            duration: 5000,
          });
          break;

        // Los errores 400, 404, 409, 422 son errores de negocio
        // Los componentes los manejan porque tienen contexto
        // (saben qué operación estaban haciendo)
        // Por eso los dejamos pasar con throwError
      }

      // Re-lanza el error para que el componente también pueda manejarlo
      // si necesita hacer algo específico (como limpiar su loading state)
      return throwError(() => error);
    })
  );
};