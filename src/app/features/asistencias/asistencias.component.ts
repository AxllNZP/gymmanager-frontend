import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AsistenciaResponse } from '../../core/models/asistencia.model';
import { ClienteResponse } from '../../core/models/cliente.model';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './asistencias.component.html',
  styleUrl: './asistencias.component.css'
})
export class Asistencias implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSourceHoy = new MatTableDataSource<AsistenciaResponse>();
  dataSourceTodas = new MatTableDataSource<AsistenciaResponse>();
  columnas = ['cliente', 'membresia', 'entrada', 'salida', 'acciones'];

  loading = false;
  mostrarFormulario = false;
  clientes: ClienteResponse[] = [];

  entradaForm: FormGroup;

  constructor(
    private asistenciaService: AsistenciaService,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.entradaForm = this.fb.group({
      clienteId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarHoy();
    this.cargarTodas();
    this.cargarClientes();
  }

  cargarHoy(): void {
    this.loading = true;
    this.asistenciaService.listarHoy().subscribe({
      next: (res: any) => {
        this.dataSourceHoy.data = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  cargarTodas(): void {
    this.asistenciaService.listarTodas().subscribe({
      next: (res: any) => {
        this.dataSourceTodas.data = res.data;
        this.dataSourceTodas.paginator = this.paginator;
        this.dataSourceTodas.sort = this.sort;
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.listarActivos().subscribe({
      next: (res: any) => { this.clientes = res.data; }
    });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSourceTodas.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(): void {
    this.entradaForm.reset();
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.entradaForm.reset();
  }

  registrarEntrada(): void {
    if (this.entradaForm.invalid) return;
    this.loading = true;

    const request = { clienteId: this.entradaForm.value.clienteId };

    this.asistenciaService.registrarEntrada(request).subscribe({
      next: (res: any) => {
        this.snackBar.open(
          `✅ Entrada registrada para ${res.data.clienteNombre}`,
          'Cerrar', { duration: 3000 }
        );
        this.cerrarFormulario();
        this.cargarHoy();
        this.cargarTodas();
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Error al registrar entrada',
          'Cerrar', { duration: 4000 }
        );
      }
    });
  }

  registrarSalida(clienteId: number, nombreCliente: string): void {
    this.asistenciaService.registrarSalida(clienteId).subscribe({
      next: () => {
        this.snackBar.open(
          `✅ Salida registrada para ${nombreCliente}`,
          'Cerrar', { duration: 3000 }
        );
        this.cargarHoy();
        this.cargarTodas();
      },
      error: (err: any) => {
        this.snackBar.open(
          err.error?.message || 'Error al registrar salida',
          'Cerrar', { duration: 4000 }
        );
      }
    });
  }

  getNombreCliente(id: number): string {
    const c = this.clientes.find(c => c.id === id);
    return c ? `${c.nombre} ${c.apellido}` : '';
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'badge-success';
      case 'POR_VENCER': return 'badge-warning';
      case 'EXPIRADA': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  tieneSalida(asistencia: AsistenciaResponse): boolean {
    return !!asistencia.fechaSalida;
  }
}