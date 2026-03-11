import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReporteService } from '../../core/services/reporte.service';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { MembresiaResponse } from '../../core/models/membresia.model';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTableModule,
    BadgeClassPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class Dashboard implements OnInit {
  // inject() es la forma moderna de inyectar servicios fuera del constructor
  // Funciona igual que el constructor injection pero es más conciso para
  // dependencias "de infraestructura" como DestroyRef
  private readonly destroyRef = inject(DestroyRef);
  private readonly reporteService = inject(ReporteService);

  dashboard: DashboardResponse | null = null;
  porVencer: MembresiaResponse[]      = [];
  loading = true;
  columnasPorVencer = ['cliente', 'plan', 'fechaFin', 'estado'];

  ngOnInit(): void {
    this.cargarDashboard();
    this.cargarPorVencer();
  }

  cargarDashboard(): void {
    this.reporteService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dashboard = res.data;
          this.loading   = false;
        },
        error: () => { this.loading = false; },
      });
  }

  cargarPorVencer(): void {
    this.reporteService.getMembresiasPorVencer()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.porVencer = res.data; },
      });
  }
}