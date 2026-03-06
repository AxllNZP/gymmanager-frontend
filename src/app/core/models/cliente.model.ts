export interface ClienteRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  fotoUrl?: string;
  peso?: number;
  talla?: number;
  datosMedicos?: string;
  consentimientoDatosSensibles: boolean;
}

export interface ClienteResponse {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  fotoUrl: string;
  peso: number;
  talla: number;
  datosMedicos: string;
  consentimientoDatosSensibles: boolean;
  consentimientoFecha: string;
  activo: boolean;
  createdAt: string;
  estadoMembresia: string;
  fechaFinMembresia: string;
}