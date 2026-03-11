import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  /**
   * Abre un diálogo de confirmación y devuelve un Observable<boolean>.
   *
   * Uso:
   *   this.confirmService.confirmar({
   *     titulo: 'Desactivar cliente',
   *     mensaje: '¿Estás seguro? Esta acción no se puede deshacer.'
   *   }).subscribe(confirmado => {
   *     if (confirmado) { ... }
   *   });
   *
   * O con el patrón filter() + switchMap() para mayor elegancia (ver abajo)
   */
  confirmar(data: ConfirmDialogData): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data,
      // Configuración visual del overlay
      panelClass:   'confirm-dialog-panel',
      backdropClass: 'confirm-backdrop',
      disableClose: true, // ← usuario debe hacer click en un botón, no en el backdrop
      autoFocus:    true,
    });

    return ref.afterClosed().pipe(
      // afterClosed emite undefined si el usuario cierra sin hacer click
      // lo normalizamos a false para que el Observable siempre emita boolean
      map(result => result === true)
    );
  }

  // Shortcuts semánticos — mejoran la legibilidad en los componentes

  danger(titulo: string, mensaje: string, labelConfirmar = 'Eliminar'): Observable<boolean> {
    return this.confirmar({ titulo, mensaje, labelConfirmar, tipo: 'danger' });
  }

  warning(titulo: string, mensaje: string, labelConfirmar = 'Continuar'): Observable<boolean> {
    return this.confirmar({ titulo, mensaje, labelConfirmar, tipo: 'warning' });
  }
}