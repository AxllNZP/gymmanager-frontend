import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

// Contrato de datos que recibe el diálogo
// Tiparlo bien significa que TypeScript nos avisa si pasamos datos incorrectos
export interface ConfirmDialogData {
  titulo:  string;
  mensaje: string;
  // Opcionales — tienen defaults razonables
  labelConfirmar?: string;
  labelCancelar?:  string;
  tipo?:           'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">

      <div class="confirm-header" [ngClass]="'header-' + data.tipo">
        <div class="confirm-icon-wrap" [ngClass]="'icon-' + data.tipo">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <h2 class="confirm-titulo">{{ data.titulo }}</h2>
      </div>

      <p class="confirm-mensaje">{{ data.mensaje }}</p>

      <div class="confirm-actions">
        <button mat-stroked-button
                class="btn-cancelar"
                [mat-dialog-close]="false">
          {{ data.labelCancelar ?? 'Cancelar' }}
        </button>
        <button mat-raised-button
                class="btn-confirmar"
                [ngClass]="'btn-' + data.tipo"
                [mat-dialog-close]="true"
                cdkFocusInitial>
          {{ data.labelConfirmar ?? 'Confirmar' }}
        </button>
      </div>

    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 8px;
      min-width: 340px;
      max-width: 420px;
      background: var(--card-bg);
    }

    .confirm-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 8px 12px;
    }

    .confirm-icon-wrap {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .confirm-icon-wrap mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    /* Variantes de color */
    .icon-danger  { background: rgba(244,67,54,0.15);  color: #f44336; }
    .icon-warning { background: rgba(255,152,0,0.15);  color: #ff9800; }
    .icon-info    { background: rgba(33,150,243,0.15); color: #2196f3; }

    .confirm-titulo {
      font-family: 'Rajdhani', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-light);
      margin: 0;
    }

    .confirm-mensaje {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
      padding: 0 8px 20px;
      margin: 0;
    }

    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 0 8px 8px;
    }

    .btn-cancelar {
      color: var(--text-muted) !important;
      border-color: var(--border) !important;
    }

    /* Botón confirmar por variante */
    .btn-danger  {
      background: linear-gradient(135deg, #f44336, #c62828) !important;
      color: white !important;
    }
    .btn-warning {
      background: linear-gradient(135deg, #ff9800, #e65100) !important;
      color: white !important;
    }
    .btn-info {
      background: linear-gradient(135deg, #2196f3, #1565c0) !important;
      color: white !important;
    }
  `],
})
export class ConfirmDialogComponent {
  // MAT_DIALOG_DATA es un token de inyección especial de Angular Material
  // que le pasa los datos que enviaste en dialog.open(Component, { data: {...} })
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Valor por defecto para tipo — si no se pasa, es 'danger'
    this.data.tipo = this.data.tipo ?? 'danger';
  }

  getIcon(): string {
    switch (this.data.tipo) {
      case 'warning': return 'warning';
      case 'info':    return 'help_outline';
      default:        return 'delete_forever';
    }
  }
}