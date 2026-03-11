import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReporteService } from '../../core/services/reporte.service';
import { PagoResponse } from '../../core/models/pago.model';
import { MembresiaResponse } from '../../core/models/membresia.model';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';
import { MetodoIconPipe } from '../../shared/pipes/metodo-icon.pipe';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    BadgeClassPipe,
    MetodoIconPipe
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class Reportes implements OnInit {

  private readonly destroyRef = inject(DestroyRef);
  private readonly reporteService = inject(ReporteService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  filtroForm!: FormGroup;

  pagos: PagoResponse[] = [];
  membresiasExpiradas: MembresiaResponse[] = [];
  membresiasPorVencer: MembresiaResponse[] = [];

  dataSourcePagos = new MatTableDataSource<PagoResponse>();
  dataSourceExpiradas = new MatTableDataSource<MembresiaResponse>();
  dataSourcePorVencer = new MatTableDataSource<MembresiaResponse>();

  columnasPagos = ['cliente', 'plan', 'metodo', 'monto', 'fecha'];
  columnasMembresias = ['cliente', 'plan', 'fechaFin', 'estado'];

  loadingPagos = false;
  loadingExpiradas = false;
  loadingPorVencer = false;
  exportandoPdf = false;
  exportandoExcel = false;

  totalRecaudado = 0;

  ngOnInit(): void {

    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString().split('T')[0];

    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    this.filtroForm = this.fb.group({
      inicio: [primerDia, Validators.required],
      fin: [ultimoDia, Validators.required]
    });

    this.buscarPagos();
    this.cargarExpiradas();
    this.cargarPorVencer();
  }

  buscarPagos(): void {

    if (this.filtroForm.invalid) return;

    this.loadingPagos = true;
    const { inicio, fin } = this.filtroForm.value;

    this.reporteService.getPagosPorPeriodo(inicio, fin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {

          this.pagos = res.data;
          this.dataSourcePagos.data = res.data;

          this.totalRecaudado = res.data
            .filter(p => p.estado === 'COMPLETADO')
            .reduce((sum, p) => sum + p.monto, 0);

          this.loadingPagos = false;
        },
        error: () => { this.loadingPagos = false; }
      });
  }

  cargarExpiradas(): void {

    this.loadingExpiradas = true;

    this.reporteService.getMembresiasExpiradas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSourceExpiradas.data = res.data;
          this.loadingExpiradas = false;
        },
        error: () => { this.loadingExpiradas = false; }
      });
  }

  cargarPorVencer(): void {

    this.loadingPorVencer = true;

    this.reporteService.getMembresiasPorVencer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSourcePorVencer.data = res.data;
          this.loadingPorVencer = false;
        },
        error: () => { this.loadingPorVencer = false; }
      });
  }

  exportarPdf(): void {

    if (this.filtroForm.invalid) return;

    this.exportandoPdf = true;
    const { inicio, fin } = this.filtroForm.value;

    this.reporteService.exportarPdf(inicio, fin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = url;
          a.download = `reporte-pagos-${inicio}-${fin}.pdf`;
          a.click();

          URL.revokeObjectURL(url);

          this.exportandoPdf = false;

          this.snackBar.open('PDF descargado', 'Cerrar', { duration: 3000 });
        },
        error: () => {

          this.exportandoPdf = false;

          this.snackBar.open('Error al exportar PDF', 'Cerrar', { duration: 3000 });
        }
      });
  }

  exportarExcel(): void {

    if (this.filtroForm.invalid) return;

    this.exportandoExcel = true;
    const { inicio, fin } = this.filtroForm.value;

    this.reporteService.exportarExcel(inicio, fin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');

          a.href = url;
          a.download = `reporte-pagos-${inicio}-${fin}.xlsx`;
          a.click();

          URL.revokeObjectURL(url);

          this.exportandoExcel = false;

          this.snackBar.open('Excel descargado', 'Cerrar', { duration: 3000 });
        },
        error: () => {

          this.exportandoExcel = false;

          this.snackBar.open('Error al exportar Excel', 'Cerrar', { duration: 3000 });
        }
      });
  }
}