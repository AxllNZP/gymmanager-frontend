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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClienteService } from '../../core/services/cliente.service';
import { ClienteResponse, ClienteRequest } from '../../core/models/cliente.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-clientes',
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
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class Clientes implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<ClienteResponse>();
  columnas = ['nombre', 'dni', 'email', 'telefono', 'estadoMembresia', 'acciones'];

  loading = false;
  mostrarFormulario = false;
  editandoId: number | null = null;

  clienteForm: FormGroup;

  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.clienteForm = this.fb.group({
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
      consentimientoDatosSensibles: [false]
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.clienteService.listarTodos().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => { this.loading = false; }
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
      this.clienteForm.patchValue({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        dni: cliente.dni,
        email: cliente.email,
        telefono: cliente.telefono,
        fechaNacimiento: cliente.fechaNacimiento,
        direccion: cliente.direccion,
        peso: cliente.peso,
        talla: cliente.talla,
        datosMedicos: cliente.datosMedicos,
        consentimientoDatosSensibles: cliente.consentimientoDatosSensibles
      });
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

    operacion.subscribe({
      next: () => {
        this.snackBar.open(
          this.editandoId ? 'Cliente actualizado' : 'Cliente creado',
          'Cerrar', { duration: 3000 }
        );
        this.cerrarFormulario();
        this.cargarClientes();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Error al guardar',
          'Cerrar', { duration: 4000 }
        );
      }
    });
  }

  desactivar(id: number): void {
    if (!confirm('¿Desactivar este cliente?')) return;
    this.clienteService.desactivar(id).subscribe({
      next: () => {
        this.snackBar.open('Cliente desactivado', 'Cerrar', { duration: 3000 });
        this.cargarClientes();
      }
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

  esAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }
}