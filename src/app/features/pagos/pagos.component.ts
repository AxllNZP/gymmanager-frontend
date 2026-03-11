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
import { PagoService } from '../../core/services/pago.service';
import { ClienteService } from '../../core/services/cliente.service';
import { MembresiaService } from '../../core/services/membresia.service';
import { PagoResponse } from '../../core/models/pago.model';
import { ClienteResponse } from '../../core/models/cliente.model';
import { MembresiaResponse } from '../../core/models/membresia.model';
import { AuthService } from '../../core/services/auth.service';
import { BadgeClassPipe } from '../../shared/pipes/badge-class.pipe';
import { MetodoIconPipe } from '../../shared/pipes/metodo-icon.pipe';
import { ConfirmService } from '../../core/services/confirm.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule, MatProgressSpinnerModule,
    BadgeClassPipe, MetodoIconPipe,
  ],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css',
})
export class Pagos implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly confirmService = inject(ConfirmService);
  private readonly destroyRef       = inject(DestroyRef);
  private readonly pagoService      = inject(PagoService);
  private readonly clienteService   = inject(ClienteService);
  private readonly membresiaService = inject(MembresiaService);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly fb               = inject(FormBuilder);
  readonly authService              = inject(AuthService); // public para el template

  dataSource = new MatTableDataSource<PagoResponse>();
  columnas   = ['cliente', 'plan', 'monto', 'metodo', 'estado', 'fecha', 'acciones'];

  loading           = false;
  mostrarFormulario = false;

  clientes: ClienteResponse[]          = [];
  membresiasCliente: MembresiaResponse[] = [];

  readonly metodosPago = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'] as const;

  pagoForm: FormGroup = this.fb.group({
    clienteId:      ['', Validators.required],
    membresiaId:    ['', Validators.required],
    metodoPago:     ['EFECTIVO', Validators.required],
    descuento:      [0],
    motivoDescuento: [''],
  });

  ngOnInit(): void {
    // ✅ Ambas cargas en ngOnInit — van en paralelo
    this.cargarPagos();
    this.cargarClientes();
  }

  ngAfterViewInit(): void {
    // ✅ Solo ViewChild aquí
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
    // ← setTimeout eliminado
  }

  cargarPagos(): void {
    this.loading = true;
    this.pagoService.listarTodos()
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

  onClienteChange(clienteId: number): void {
    if (!clienteId) return;
    this.pagoForm.patchValue({ membresiaId: '' });
    this.membresiaService.obtenerPorCliente(clienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.membresiasCliente = res.data.filter(
            m => m.estado === 'ACTIVA' || m.estado === 'POR_VENCER'
          );
        },
      });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(): void {
    this.pagoForm.reset({ metodoPago: 'EFECTIVO', descuento: 0 });
    this.membresiasCliente = [];
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.pagoForm.reset({ metodoPago: 'EFECTIVO', descuento: 0 });
    this.membresiasCliente = [];
  }

  getMembresiaSeleccionada(): MembresiaResponse | undefined {
    const membresiaId = this.pagoForm.get('membresiaId')?.value;
    return this.membresiasCliente.find(m => m.id === membresiaId);
  }

  getMontoFinal(): number {
    const descuento = this.pagoForm.get('descuento')?.value ?? 0;
    return (this.getMembresiaSeleccionada()?.planPrecio ?? 0) - descuento;
  }

  guardar(): void {
    if (this.pagoForm.invalid) return;
    this.loading = true;

    this.pagoService.registrar({
      membresiaId:    this.pagoForm.value.membresiaId,
      clienteId:      this.pagoForm.value.clienteId,
      metodoPago:     this.pagoForm.value.metodoPago,
      descuento:      this.pagoForm.value.descuento ?? 0,
      motivoDescuento: this.pagoForm.value.motivoDescuento || undefined,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            '✅ Pago registrado. Se enviará correo de confirmación.',
            'Cerrar', { duration: 4000 }
          );
          this.cerrarFormulario();
          this.cargarPagos();
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Error al registrar pago', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  anular(id: number): void {
  this.confirmService
    .warning(
      'Anular pago',
      'Esta acción revertirá el pago y notificará al sistema contable.',
      'Sí, anular'
    )
    .pipe(
      filter(Boolean),
      switchMap(() => this.pagoService.anular(id)),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: () => {
        this.snackBar.open('Pago anulado', 'Cerrar', { duration: 3000 });
        this.cargarPagos();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al anular', 'Cerrar', {
          duration: 4000,
        });
      },
    });
}

  esAdmin(): boolean { return this.authService.hasRole('ADMIN'); }
}