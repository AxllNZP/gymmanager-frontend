import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { ReporteService } from '../../core/services/reporte.service';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { MembresiaResponse } from '../../core/models/membresia.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class Dashboard implements OnInit {

  dashboard: DashboardResponse | null = null;
  porVencer: MembresiaResponse[] = [];
  loading = true;

  columnasPorVencer = ['cliente', 'plan', 'fechaFin', 'estado'];

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
  setTimeout(() => {
    this.cargarDashboard();
    this.cargarPorVencer();
  });
}

  cargarDashboard(): void {
    this.reporteService.getDashboard().subscribe({
      next: (res) => {
        this.dashboard = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  cargarPorVencer(): void {
    this.reporteService.getMembresiasPorVencer().subscribe({
      next: (res) => { this.porVencer = res.data; }
    });
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'badge-success';
      case 'POR_VENCER': return 'badge-warning';
      case 'EXPIRADA': return 'badge-danger';
      default: return 'badge-muted';
    }
  }
}