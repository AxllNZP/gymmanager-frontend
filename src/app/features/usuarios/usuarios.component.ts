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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioResponse, UsuarioRequest } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class Usuarios implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef     = inject(DestroyRef);
  private readonly usuarioService = inject(UsuarioService);
  private readonly snackBar       = inject(MatSnackBar);
  private readonly fb             = inject(FormBuilder);
  readonly authService            = inject(AuthService);

  dataSource = new MatTableDataSource<UsuarioResponse>();
  columnas   = ['usuario', 'email', 'rol', 'estado', 'acciones'];

  loading           = false;
  mostrarFormulario = false;
  editandoId: number | null = null;
  mostrarPassword   = false;

  readonly roles = ['ADMIN', 'RECEPCIONISTA', 'CONTADOR', 'DUENO'] as const;

  usuarioForm: FormGroup = this.fb.group({
    nombre:   ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role:     ['RECEPCIONISTA', Validators.required],
  });

  ngOnInit(): void { this.cargarUsuarios(); }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.listarTodos()
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

  abrirFormulario(usuario?: UsuarioResponse): void {
    this.mostrarFormulario = true;

    if (usuario) {
      this.editandoId = usuario.id;
      this.usuarioForm.patchValue({ ...usuario, password: '' });

      // En edición la contraseña es opcional — quitamos validadores
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    } else {
      this.editandoId = null;
      this.usuarioForm.reset({ role: 'RECEPCIONISTA' });

      // En creación la contraseña es obligatoria — restauramos validadores
      this.usuarioForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoId        = null;
    this.mostrarPassword   = false;
    this.usuarioForm.reset({ role: 'RECEPCIONISTA' });
  }

  guardar(): void {
    if (this.usuarioForm.invalid) return;
    this.loading = true;

    const { nombre, email, role, password } = this.usuarioForm.value;

    // Construimos el request de forma type-safe:
    // password solo se incluye si el usuario lo ingresó (edición lo deja vacío)
    const request: UsuarioRequest = {
      nombre,
      email,
      role,
      ...(password ? { password } : {}),
    };

    const operacion = this.editandoId
      ? this.usuarioService.actualizar(this.editandoId, request)
      : this.usuarioService.crear(request);

    operacion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.editandoId ? 'Usuario actualizado' : 'Usuario creado',
            'Cerrar', { duration: 3000 }
          );
          this.cerrarFormulario();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  desactivar(id: number): void {
  this.confirmService
    .danger(
      'Desactivar usuario',
      'El usuario perderá acceso al sistema inmediatamente.',
      'Sí, desactivar'
    )
    .pipe(
      filter(Boolean),
      switchMap(() => this.usuarioService.desactivar(id)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: () => {
        this.snackBar.open('Usuario desactivado', 'Cerrar', { duration: 3000 });
        this.cargarUsuarios();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al desactivar', 'Cerrar', {
          duration: 4000,
        });
      },
    });
}

  getRolIcon(rol: string): string {
    const icons: Record<string, string> = {
      ADMIN:          'admin_panel_settings',
      RECEPCIONISTA:  'badge',
      CONTADOR:       'calculate',
      DUENO:          'business_center',
    };
    return icons[rol] ?? 'person';
  }

  getRolClass(rol: string): string {
    const classes: Record<string, string> = {
      ADMIN:          'rol-admin',
      RECEPCIONISTA:  'rol-recepcionista',
      CONTADOR:       'rol-contador',
      DUENO:          'rol-dueno',
    };
    return classes[rol] ?? '';
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? partes[0][0] + partes[1][0]
      : partes[0][0];
  }

  soyYo(usuario: UsuarioResponse): boolean {
    return usuario.email === this.authService.getUsuario()?.email;
  }
}