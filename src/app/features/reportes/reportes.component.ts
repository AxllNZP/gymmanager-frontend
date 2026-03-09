import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReporteService } from '../../core/services/reporte.service';
import { PagoResponse } from '../../core/models/pago.model';
import { MembresiaResponse } from '../../core/models/membresia.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class Reportes implements OnInit {

  filtroForm: FormGroup;

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

  constructor(
    private reporteService: ReporteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString().split('T')[0];
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    this.filtroForm = this.fb.group({
      inicio: [primerDia, Validators.required],
      fin: [ultimoDia, Validators.required]
    });
  }

  ngOnInit(): void {
    this.buscarPagos();
    this.cargarExpiradas();
    this.cargarPorVencer();
  }

  buscarPagos(): void {
    if (this.filtroForm.invalid) return;
    this.loadingPagos = true;

    const { inicio, fin } = this.filtroForm.value;

    this.reporteService.getPagosPorPeriodo(inicio, fin).subscribe({
      next: (res: any) => {
        this.pagos = res.data;
        this.dataSourcePagos.data = res.data;
        this.totalRecaudado = res.data
          .filter((p: PagoResponse) => p.estado === 'COMPLETADO')
          .reduce((sum: number, p: PagoResponse) => sum + p.monto, 0);
        this.loadingPagos = false;
      },
      error: () => { this.loadingPagos = false; }
    });
  }

  cargarExpiradas(): void {
    this.loadingExpiradas = true;
    this.reporteService.getMembresiasExpiradas().subscribe({
      next: (res: any) => {
        this.dataSourceExpiradas.data = res.data;
        this.loadingExpiradas = false;
      },
      error: () => { this.loadingExpiradas = false; }
    });
  }

  cargarPorVencer(): void {
    this.loadingPorVencer = true;
    this.reporteService.getMembresiasPorVencer().subscribe({
      next: (res: any) => {
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

    this.reporteService.exportarPdf(inicio, fin).subscribe({
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

    this.reporteService.exportarExcel(inicio, fin).subscribe({
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

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'badge-success';
      case 'POR_VENCER': return 'badge-warning';
      case 'EXPIRADA': return 'badge-danger';
      case 'COMPLETADO': return 'badge-success';
      case 'ANULADO': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  getMetodoIcon(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO': return 'payments';
      case 'YAPE': return 'phone_iphone';
      case 'PLIN': return 'phone_iphone';
      case 'TRANSFERENCIA': return 'account_balance';
      default: return 'payments';
    }
  }
}