import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlanService } from '../../core/services/plan.service';
import { PlanResponse } from '../../core/models/plan.model';
import { AuthService } from '../../core/services/auth.service';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';
import { ConfirmService } from '../../core/services/confirm.service';
import { filter, switchMap } from 'rxjs';
// ← MatSlideToggleModule eliminado

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule,
  ],
  templateUrl: './planes.component.html',
  styleUrl: './planes.component.css',
})
export class Planes implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef  = inject(DestroyRef);
  private readonly planService = inject(PlanService);
  private readonly snackBar    = inject(MatSnackBar);
  private readonly fb          = inject(FormBuilder);
  readonly authService         = inject(AuthService);

  dataSource = new MatTableDataSource<PlanResponse>();
  columnas   = ['nombre', 'personas', 'precio', 'descripcion', 'estado', 'acciones'];

  loading           = false;
  mostrarFormulario = false;
  editandoId: number | null = null;

  planForm: FormGroup = this.fb.group({
    nombre:        ['', Validators.required],
    descripcion:   [''],
    numeroPersonas: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    precio:        ['', [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void { this.cargarPlanes(); }

  cargarPlanes(): void {
    this.loading = true;
    this.planService.listarTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSource.data      = res.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort      = this.sort;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(plan?: PlanResponse): void {
    this.mostrarFormulario = true;
    if (plan) {
      this.editandoId = plan.id;
      this.planForm.patchValue(plan);
    } else {
      this.editandoId = null;
      this.planForm.reset({ numeroPersonas: 1 });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.planForm.reset({ numeroPersonas: 1 });
  }

  guardar(): void {
    if (this.planForm.invalid) return;
    this.loading = true;

    const operacion = this.editandoId
      ? this.planService.actualizar(this.editandoId, this.planForm.value)
      : this.planService.crear(this.planForm.value);

    operacion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.editandoId ? 'Plan actualizado' : 'Plan creado',
            'Cerrar', { duration: 3000 }
          );
          this.cerrarFormulario();
          this.cargarPlanes();
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  toggleEstado(plan: PlanResponse): void {
  const config = plan.activo
    ? {
        titulo:         'Desactivar plan',
        mensaje:        `El plan "${plan.nombre}" dejará de estar disponible para nuevas membresías.`,
        labelConfirmar: 'Desactivar',
        tipo:           'danger' as const,
      }
    : {
        titulo:         'Activar plan',
        mensaje:        `El plan "${plan.nombre}" volverá a estar disponible.`,
        labelConfirmar: 'Activar',
        tipo:           'info' as const,
      };

  this.confirmService
    .confirmar(config)
    .pipe(
      filter(Boolean),
      switchMap(() =>
        plan.activo
          ? this.planService.desactivar(plan.id)
          : this.planService.activar(plan.id)
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: () => {
        this.snackBar.open(
          plan.activo ? 'Plan desactivado' : 'Plan activado',
          'Cerrar', { duration: 3000 }
        );
        this.cargarPlanes();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al cambiar estado', 'Cerrar', {
          duration: 4000,
        });
      },
    });
}

  getPlanIcon(numeroPersonas: number): string {
    if (numeroPersonas === 1) return 'person';
    if (numeroPersonas === 2) return 'group';
    return 'groups';
  }

  getPlanColor(numeroPersonas: number): string {
    if (numeroPersonas === 1) return 'plan-individual';
    if (numeroPersonas === 2) return 'plan-duo';
    return 'plan-familiar';
  }

  esAdmin(): boolean { return this.authService.hasRole('ADMIN'); }
}
