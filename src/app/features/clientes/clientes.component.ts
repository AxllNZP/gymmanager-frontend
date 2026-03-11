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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmService } from '../../core/services/confirm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs/operators';
import { ClienteService } from '../../core/services/cliente.service';
import { ClienteResponse, ClienteRequest } from '../../core/models/cliente.model';
import { AuthService } from '../../core/services/auth.service';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatSelectModule,
    MatCheckboxModule, MatTooltipModule, MatProgressSpinnerModule,
    BadgeClassPipe,
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class Clientes implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef     = inject(DestroyRef);
  private readonly clienteService = inject(ClienteService);
  private readonly fb             = inject(FormBuilder);
  private readonly snackBar       = inject(MatSnackBar);
  readonly authService            = inject(AuthService);

  dataSource = new MatTableDataSource<ClienteResponse>();
  columnas   = ['nombre', 'dni', 'email', 'telefono', 'estadoMembresia', 'acciones'];

  loading           = false;
  mostrarFormulario = false;
  editandoId: number | null = null;

  clienteForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    fechaNacimiento: [''],
    direccion: [''],
    peso: [''],
    talla: [''],
    datosMedicos: [''],
    consentimientoDatosSensibles: [false],
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;

    this.clienteService.listarTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(cliente?: ClienteResponse): void {
    this.mostrarFormulario = true;

    if (cliente) {
      this.editandoId = cliente.id;
      this.clienteForm.patchValue(cliente);
    } else {
      this.editandoId = null;
      this.clienteForm.reset({ consentimientoDatosSensibles: false });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.clienteForm.reset({ consentimientoDatosSensibles: false });
  }

  guardar(): void {
    if (this.clienteForm.invalid) return;

    const request: ClienteRequest = this.clienteForm.value;
    this.loading = true;

    const operacion = this.editandoId
      ? this.clienteService.actualizar(this.editandoId, request)
      : this.clienteService.crear(request);

    operacion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.editandoId ? 'Cliente actualizado' : 'Cliente creado',
            'Cerrar',
            { duration: 3000 }
          );

          this.cerrarFormulario();
          this.cargarClientes();
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(
            err.error?.message || 'Error al guardar',
            'Cerrar',
            { duration: 4000 }
          );
        },
      });
  }

  desactivar(id: number): void {
  this.confirmService
    .danger(
      'Desactivar cliente',
      'El cliente perderá acceso al sistema. ¿Estás seguro?',
      'Sí, desactivar'
    )
    .pipe(
      // filter(Boolean) es equivalente a filter(result => result === true)
      // Si el usuario cancela, el Observable no continúa — cero código defensivo
      filter(Boolean),
      // switchMap transforma el boolean en la operación real
      // "cuando confirme, ejecutá esto"
      switchMap(() => this.clienteService.desactivar(id)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: () => {
        this.snackBar.open('Cliente desactivado', 'Cerrar', { duration: 3000 });
        this.cargarClientes();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al desactivar', 'Cerrar', {
          duration: 4000,
        });
      },
    });
}

  esAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }
}