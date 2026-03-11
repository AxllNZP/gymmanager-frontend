// src/app/core/models/membresia.model.ts — COMPLETO
export interface ClienteAdicional {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

export interface MembresiaRequest {
  clienteId: number;
  planId: number;
  clientesAdicionalesIds?: number[];
}

export interface RenovacionRequest {
  planId: number;
  clientesAdicionalesIds?: number[];
}

export interface MembresiaResponse {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellido: string;
  clienteDni: string;
  planId: number;
  planNombre: string;
  planNumeroPersonas: number;
  planPrecio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  createdAt: string;
  clientesAdicionales: ClienteAdicional[]; // ← tipado correcto
}