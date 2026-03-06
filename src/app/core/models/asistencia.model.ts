export interface AsistenciaRequest {
  clienteId: number;
  registradoPor?: string;
}

export interface AsistenciaResponse {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellido: string;
  clienteDni: string;
  membresiaId: number;
  estadoMembresia: string;
  fechaEntrada: string;
  fechaSalida: string;
  registradoPor: string;
}