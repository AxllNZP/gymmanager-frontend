import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { MembresiaService } from '../../core/services/membresia.service';
import { ClienteService } from '../../core/services/cliente.service';
import { PlanService } from '../../core/services/plan.service';
import { MembresiaResponse } from '../../core/models/membresia.model';
import { ClienteResponse } from '../../core/models/cliente.model';
import { PlanResponse } from '../../core/models/plan.model';

@Component({
  selector: 'app-membresias',
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
    MatChipsModule
  ],
  templateUrl: './membresias.component.html',
  styleUrl: './membresias.component.css'
})
export class Membresias implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<MembresiaResponse>();
  columnas = ['cliente', 'plan', 'fechas', 'adicionales', 'estado', 'acciones'];

  loading = false;
  mostrarFormulario = false;
  modoRenovacion = false;
  membresiaRenovarId: number | null = null;

  clientes: ClienteResponse[] = [];
  planes: PlanResponse[] = [];

  membresiaForm: FormGroup;

  constructor(
    private membresiaService: MembresiaService,
    private clienteService: ClienteService,
    private planService: PlanService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.membresiaForm = this.fb.group({
      clienteId: ['', Validators.required],
      planId: ['', Validators.required],
      clientesAdicionalesIds: [[]]
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarPlanes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    setTimeout(() => {
    this.cargarMembresias();
  });
  }

  cargarMembresias(): void {
    this.loading = true;
    this.membresiaService.listarTodas().subscribe({
      next: (res: any) => {
        this.dataSource.data = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  cargarClientes(): void {
    this.clienteService.listarActivos().subscribe({
      next: (res: any) => { this.clientes = res.data; }
    });
  }

  cargarPlanes(): void {
    this.planService.listarActivos().subscribe({
      next: (res: any) => { this.planes = res.data; }
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
    const plan = this.getPlanSeleccionado();
    return plan ? plan.numeroPersonas - 1 : 0;
  }

  abrirFormularioNuevo(): void {
    this.modoRenovacion = false;
    this.membresiaRenovarId = null;
    this.membresiaForm.reset({ clientesAdicionalesIds: [] });
    this.membresiaForm.get('clienteId')?.enable();
    this.mostrarFormulario = true;
  }

  abrirRenovacion(membresia: MembresiaResponse): void {
    this.modoRenovacion = true;
    this.membresiaRenovarId = membresia.id;
    this.membresiaForm.patchValue({
      clienteId: membresia.clienteId,
      planId: membresia.planId,
      clientesAdicionalesIds: membresia.clientesAdicionales?.map((c: any) => c.id) || []
    });
    this.membresiaForm.get('clienteId')?.disable();
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoRenovacion = false;
    this.membresiaRenovarId = null;
    this.membresiaForm.reset({ clientesAdicionalesIds: [] });
    this.membresiaForm.get('clienteId')?.enable();
  }

  guardar(): void {
    if (this.membresiaForm.invalid) return;
    this.loading = true;

    const valor = this.membresiaForm.getRawValue();

    if (this.modoRenovacion && this.membresiaRenovarId) {
      const request = {
        planId: valor.planId,
        clientesAdicionalesIds: valor.clientesAdicionalesIds || []
      };
      this.membresiaService.renovar(this.membresiaRenovarId, request).subscribe({
        next: () => {
          this.snackBar.open('Membresía renovada exitosamente', 'Cerrar',
            { duration: 3000 });
          this.cerrarFormulario();
          this.cargarMembresias();
        },
        error: (err: any) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Error al renovar',
            'Cerrar', { duration: 4000 });
        }
      });
    } else {
      const request = {
        clienteId: valor.clienteId,
        planId: valor.planId,
        clientesAdicionalesIds: valor.clientesAdicionalesIds || []
      };
      this.membresiaService.crear(request).subscribe({
        next: () => {
          this.snackBar.open('Membresía creada exitosamente', 'Cerrar',
            { duration: 3000 });
          this.cerrarFormulario();
          this.cargarMembresias();
        },
        error: (err: any) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Error al crear',
            'Cerrar', { duration: 4000 });
        }
      });
    }
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'badge-success';
      case 'POR_VENCER': return 'badge-warning';
      case 'EXPIRADA': return 'badge-danger';
      case 'CANCELADA': return 'badge-muted';
      default: return 'badge-muted';
    }
  }
}
