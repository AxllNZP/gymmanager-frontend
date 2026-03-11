// Asistencias tenía el loading flag compartido entre "cargar hoy"
// y "enviar formulario" — los separamos:

import { Component, OnInit, AfterViewInit, ViewChild, DestroyRef, inject } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AsistenciaResponse } from '../../core/models/asistencia.model';
import { ClienteResponse } from '../../core/models/cliente.model';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule, MatTabsModule,
    BadgeClassPipe,
  ],
  templateUrl: './asistencias.component.html',
  styleUrl: './asistencias.component.css',
})
export class Asistencias implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly destroyRef       = inject(DestroyRef);
  private readonly asistenciaService = inject(AsistenciaService);
  private readonly clienteService   = inject(ClienteService);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly fb               = inject(FormBuilder);

  dataSourceHoy   = new MatTableDataSource<AsistenciaResponse>();
  dataSourceTodas = new MatTableDataSource<AsistenciaResponse>();
  columnas = ['cliente', 'membresia', 'entrada', 'salida', 'acciones'];

  // ✅ Dos flags separados — cada uno con su responsabilidad clara
  loadingDatos     = false; // ← carga de tablas
  loadingFormulario = false; // ← envío del formulario

  mostrarFormulario = false;
  clientes: ClienteResponse[] = [];

  entradaForm: FormGroup = this.fb.group({
    clienteId: ['', Validators.required],
  });

  ngOnInit(): void {
    // ✅ Carga de datos en ngOnInit
    this.cargarHoy();
    this.cargarClientes();
  }

  ngAfterViewInit(): void {
    // ✅ Solo ViewChild aquí
    this.dataSourceTodas.paginator = this.paginator;
    this.dataSourceTodas.sort      = this.sort;
    this.cargarTodas();
    // Nota: cargarTodas va aquí porque necesita que sort y paginator
    // estén asignados ANTES de que lleguen los datos
  }

  cargarHoy(): void {
    this.loadingDatos = true;
    this.asistenciaService.listarHoy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSourceHoy.data = res.data;
          this.loadingDatos = false;
        },
        error: () => { this.loadingDatos = false; },
      });
  }

  cargarTodas(): void {
    this.asistenciaService.listarTodas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.dataSourceTodas.data = res.data; },
      });
  }

  cargarClientes(): void {
    this.clienteService.listarActivos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.clientes = res.data; },
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
    this.loadingFormulario = true; // ← solo afecta el botón del formulario

    this.asistenciaService
      .registrarEntrada({ clienteId: this.entradaForm.value.clienteId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.snackBar.open(
            `✅ Entrada registrada para ${res.data.clienteNombre}`,
            'Cerrar', { duration: 3000 }
          );
          this.loadingFormulario = false;
          this.cerrarFormulario();
          this.cargarHoy();
          this.cargarTodas();
        },
        error: (err) => {
          this.loadingFormulario = false;
          this.snackBar.open(err.error?.message || 'Error al registrar entrada', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  registrarSalida(clienteId: number, nombreCliente: string): void {
    this.asistenciaService.registrarSalida(clienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            `✅ Salida registrada para ${nombreCliente}`,
            'Cerrar', { duration: 3000 }
          );
          this.cargarHoy();
          this.cargarTodas();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al registrar salida', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  tieneSalida(asistencia: AsistenciaResponse): boolean {
    return !!asistencia.fechaSalida;
  }
}