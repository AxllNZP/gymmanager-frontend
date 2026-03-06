export interface PagoRequest {
  membresiaId: number;
  clienteId: number;
  metodoPago: string;
  descuento?: number;
  motivoDescuento?: string;
}

export interface PagoResponse {
  id: number;
  membresiaId: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellido: string;
  planNombre: string;
  montoOriginal: number;
  descuento: number;
  monto: number;
  motivoDescuento: string;
  metodoPago: string;
  estado: string;
  correoEnviado: boolean;
  usuarioRegistroNombre: string;
  fechaPago: string;
}