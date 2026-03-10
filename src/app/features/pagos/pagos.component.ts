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
import { MatTabsModule } from '@angular/material/tabs';
import { PagoService } from '../../core/services/pago.service';
import { ClienteService } from '../../core/services/cliente.service';
import { MembresiaService } from '../../core/services/membresia.service';
import { PagoResponse } from '../../core/models/pago.model';
import { ClienteResponse } from '../../core/models/cliente.model';
import { MembresiaResponse } from '../../core/models/membresia.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pagos',
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
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class Pagos implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<PagoResponse>();
  columnas = ['cliente', 'plan', 'monto', 'metodo', 'estado', 'fecha', 'acciones'];

  loading = false;
  mostrarFormulario = false;

  clientes: ClienteResponse[] = [];
  membresiasCliente: MembresiaResponse[] = [];

  pagoForm: FormGroup;

  metodosPago = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'];

  constructor(
    private pagoService: PagoService,
    private clienteService: ClienteService,
    private membresiaService: MembresiaService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.pagoForm = this.fb.group({
      clienteId: ['', Validators.required],
      membresiaId: ['', Validators.required],
      metodoPago: ['EFECTIVO', Validators.required],
      descuento: [0],
      motivoDescuento: ['']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngAfterViewInit(): void {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;

  setTimeout(() => {
    this.cargarPagos();
  });
}

  cargarPagos(): void {
    this.loading = true;
    this.pagoService.listarTodos().subscribe({
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

  onClienteChange(clienteId: number): void {
    if (!clienteId) return;
    this.pagoForm.patchValue({ membresiaId: '' });
    this.membresiaService.obtenerPorCliente(clienteId).subscribe({
      next: (res: any) => {
        this.membresiasCliente = res.data.filter(
          (m: MembresiaResponse) =>
            m.estado === 'ACTIVA' || m.estado === 'POR_VENCER'
        );
      }
    });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(): void {
    this.pagoForm.reset({
      metodoPago: 'EFECTIVO',
      descuento: 0
    });
    this.membresiasCliente = [];
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.pagoForm.reset({ metodoPago: 'EFECTIVO', descuento: 0 });
    this.membresiasCliente = [];
  }

  // ✅ CORREGIDO: busca la membresía seleccionada, no siempre la primera
  getMembresiaSeleccionada(): MembresiaResponse | undefined {
    const membresiaId = this.pagoForm.get('membresiaId')?.value;
    return this.membresiasCliente.find(m => m.id === membresiaId);
  }

  getMontoFinal(): number {
    const membresia = this.getMembresiaSeleccionada();
    const descuento = this.pagoForm.get('descuento')?.value || 0;
    return membresia ? membresia.planPrecio - descuento : 0;
  }

  guardar(): void {
    if (this.pagoForm.invalid) return;
    this.loading = true;

    const request = {
      membresiaId: this.pagoForm.value.membresiaId,
      clienteId: this.pagoForm.value.clienteId,
      metodoPago: this.pagoForm.value.metodoPago,
      descuento: this.pagoForm.value.descuento || 0,
      motivoDescuento: this.pagoForm.value.motivoDescuento || null
    };

    this.pagoService.registrar(request).subscribe({
      next: () => {
        this.snackBar.open(
          '✅ Pago registrado. Se enviará correo de confirmación.',
          'Cerrar', { duration: 4000 }
        );
        this.cerrarFormulario();
        this.cargarPagos();
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Error al registrar pago',
          'Cerrar', { duration: 4000 }
        );
      }
    });
  }

  anular(id: number): void {
    if (!confirm('¿Anular este pago?')) return;
    this.pagoService.anular(id).subscribe({
      next: () => {
        this.snackBar.open('Pago anulado', 'Cerrar', { duration: 3000 });
        this.cargarPagos();
      },
      error: (err: any) => {
        this.snackBar.open(
          err.error?.message || 'Error al anular',
          'Cerrar', { duration: 4000 }
        );
      }
    });
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'COMPLETADO': return 'badge-success';
      case 'PENDIENTE': return 'badge-warning';
      case 'ANULADO': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  getMetodoIcon(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO': return 'payments';
      case 'YAPE': return 'phone_iphone';
      case 'PLIN': return 'phone_iphone';
      case 'TRANSFERENCIA': return 'account_balance';
      default: return 'payments';
    }
  }

  esAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }
}
