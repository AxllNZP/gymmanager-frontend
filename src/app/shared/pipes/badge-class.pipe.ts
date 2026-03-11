import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforma un string de estado de negocio en una clase CSS de badge.
 *
 * Uso en template: [ngClass]="row.estado | badgeClass"
 *
 * Cubre estados de: Membresía, Pago, y cualquier entidad activo/inactivo
 * que use este mismo vocabulario de estados.
 */
@Pipe({
  name: 'badgeClass',
  standalone: true,
  // pure: true (default) — Angular solo re-evalúa si el valor de entrada cambia.
  // Perfecto aquí porque 'ACTIVA' siempre produce 'badge-success'.
})
export class BadgeClassPipe implements PipeTransform {
  transform(estado: string): string {
    switch (estado) {
      case 'ACTIVA':
      case 'COMPLETADO':
        return 'badge-success';

      case 'POR_VENCER':
      case 'PENDIENTE':
        return 'badge-warning';

      case 'EXPIRADA':
      case 'ANULADO':
      case 'CANCELADA':
        return 'badge-danger';

      default:
        return 'badge-muted';
    }
  }
}