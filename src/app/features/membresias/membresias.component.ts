// El fix del setTimeout requiere separar responsabilidades entre hooks:
//
// ngOnInit    → carga inicial de datos (clientes, planes, membresías)
// ngAfterViewInit → solo asignar ViewChild (paginator, sort)
//
// Antes estaban mezclados, lo que forzaba el setTimeout.

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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembresiaService } from '../../core/services/membresia.service';
import { ClienteService } from '../../core/services/cliente.service';
import { PlanService } from '../../core/services/plan.service';
import { MembresiaResponse } from '../../core/models/membresia.model';
import { ClienteResponse } from '../../core/models/cliente.model';
import { PlanResponse } from '../../core/models/plan.model';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule,
    BadgeClassPipe,
  ],
  templateUrl: './membresias.component.html',
  styleUrl: './membresias.component.css',
})
export class Membresias implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly destroyRef       = inject(DestroyRef);
  private readonly membresiaService = inject(MembresiaService);
  private readonly clienteService   = inject(ClienteService);
  private readonly planService      = inject(PlanService);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly fb               = inject(FormBuilder);

  dataSource = new MatTableDataSource<MembresiaResponse>();
  columnas   = ['cliente', 'plan', 'fechas', 'adicionales', 'estado', 'acciones'];

  loading           = false;
  mostrarFormulario = false;
  modoRenovacion    = false;
  membresiaRenovarId: number | null = null;

  clientes: ClienteResponse[] = [];
  planes:   PlanResponse[]    = [];

  membresiaForm: FormGroup = this.fb.group({
    clienteId:             ['', Validators.required],
    planId:                ['', Validators.required],
    clientesAdicionalesIds: [[]],
  });

  ngOnInit(): void {
    // ✅ Toda la carga de datos va aquí
    // ngOnInit se ejecuta ANTES de ngAfterViewInit, así que cuando
    // Angular llegue a ngAfterViewInit los datos ya pueden estar llegando
    // en paralelo (las 3 peticiones son independientes)
    this.cargarMembresias();
    this.cargarClientes();
    this.cargarPlanes();
  }

  ngAfterViewInit(): void {
    // ✅ Solo asignación de ViewChild — cero lógica de negocio aquí
    // Angular garantiza que paginator y sort existen en este punto
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
    // ← setTimeout eliminado — ya no hay conflicto porque cargarMembresias()
    //   está en ngOnInit. Cuando los datos lleguen (async), el paginator
    //   ya estará asignado porque ngAfterViewInit ya se ejecutó.
  }

  cargarMembresias(): void {
    this.loading = true;
    this.membresiaService.listarTodas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  cargarClientes(): void {
    this.clienteService.listarActivos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.clientes = res.data; },
      });
  }

  cargarPlanes(): void {
    this.planService.listarActivos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => { this.planes = res.data; },
      });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  getPlanSeleccionado(): PlanResponse | undefined {
    const planId = this.membresiaForm.get('planId')?.value;
    return this.planes.find(p => p.id === planId);
  }

  getMaxAdicionales(): number {
    return (this.getPlanSeleccionado()?.numeroPersonas ?? 1) - 1;
  }

  abrirFormularioNuevo(): void {
    this.modoRenovacion    = false;
    this.membresiaRenovarId = null;
    this.membresiaForm.reset({ clientesAdicionalesIds: [] });
    this.membresiaForm.get('clienteId')?.enable();
    this.mostrarFormulario = true;
  }

  abrirRenovacion(membresia: MembresiaResponse): void {
    this.modoRenovacion    = true;
    this.membresiaRenovarId = membresia.id;
    this.membresiaForm.patchValue({
      clienteId:             membresia.clienteId,
      planId:                membresia.planId,
      clientesAdicionalesIds: membresia.clientesAdicionales.map(c => c.id),
    });
    this.membresiaForm.get('clienteId')?.disable();
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario  = false;
    this.modoRenovacion     = false;
    this.membresiaRenovarId = null;
    this.membresiaForm.reset({ clientesAdicionalesIds: [] });
    this.membresiaForm.get('clienteId')?.enable();
  }

  guardar(): void {
    if (this.membresiaForm.invalid) return;
    this.loading = true;
    const valor = this.membresiaForm.getRawValue();

    const operacion = this.modoRenovacion && this.membresiaRenovarId
      ? this.membresiaService.renovar(this.membresiaRenovarId, {
          planId:                valor.planId,
          clientesAdicionalesIds: valor.clientesAdicionalesIds ?? [],
        })
      : this.membresiaService.crear({
          clienteId:             valor.clienteId,
          planId:                valor.planId,
          clientesAdicionalesIds: valor.clientesAdicionalesIds ?? [],
        });

    operacion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.modoRenovacion ? 'Membresía renovada' : 'Membresía creada',
            'Cerrar', { duration: 3000 }
          );
          this.cerrarFormulario();
          this.cargarMembresias();
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }
}