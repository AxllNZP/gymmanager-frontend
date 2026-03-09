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
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioResponse } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class Usuarios implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<UsuarioResponse>();
  columnas = ['usuario', 'email', 'rol', 'estado', 'acciones'];

  loading = false;
  mostrarFormulario = false;
  editandoId: number | null = null;
  mostrarPassword = false;

  roles = ['ADMIN', 'RECEPCIONISTA', 'CONTADOR', 'DUENO'];

  usuarioForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['RECEPCIONISTA', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.listarTodos().subscribe({
      next: (res: any) => {
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

  abrirFormulario(usuario?: UsuarioResponse): void {
    this.mostrarFormulario = true;
    if (usuario) {
      this.editandoId = usuario.id;
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role,
        password: ''
      });
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    } else {
      this.editandoId = null;
      this.usuarioForm.reset({ role: 'RECEPCIONISTA' });
      this.usuarioForm.get('password')?.setValidators(
        [Validators.required, Validators.minLength(8)]
      );
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.mostrarPassword = false;
    this.usuarioForm.reset({ role: 'RECEPCIONISTA' });
  }

  guardar(): void {
    if (this.usuarioForm.invalid) return;
    this.loading = true;

    const valor = this.usuarioForm.value;
    const request: any = {
      nombre: valor.nombre,
      email: valor.email,
      role: valor.role
    };

    if (valor.password) request.password = valor.password;

    const operacion = this.editandoId
      ? this.usuarioService.actualizar(this.editandoId, request)
      : this.usuarioService.crear(request);

    operacion.subscribe({
      next: () => {
        this.snackBar.open(
          this.editandoId ? 'Usuario actualizado' : 'Usuario creado',
          'Cerrar', { duration: 3000 }
        );
        this.cerrarFormulario();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Error al guardar',
          'Cerrar', { duration: 4000 }
        );
      }
    });
  }

  desactivar(id: number): void {
    if (!confirm('¿Desactivar este usuario?')) return;
    this.usuarioService.desactivar(id).subscribe({
      next: () => {
        this.snackBar.open('Usuario desactivado', 'Cerrar', { duration: 3000 });
        this.cargarUsuarios();
      }
    });
  }

  getRolIcon(rol: string): string {
    switch (rol) {
      case 'ADMIN': return 'admin_panel_settings';
      case 'RECEPCIONISTA': return 'badge';
      case 'CONTADOR': return 'calculate';
      case 'DUENO': return 'business_center';
      default: return 'person';
    }
  }

  getRolClass(rol: string): string {
    switch (rol) {
      case 'ADMIN': return 'rol-admin';
      case 'RECEPCIONISTA': return 'rol-recepcionista';
      case 'CONTADOR': return 'rol-contador';
      case 'DUENO': return 'rol-dueno';
      default: return '';
    }
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) return partes[0].charAt(0) + partes[1].charAt(0);
    return partes[0].charAt(0);
  }

  soyYo(usuario: UsuarioResponse): boolean {
    return usuario.email === this.authService.getUsuario()?.email;
  }
}