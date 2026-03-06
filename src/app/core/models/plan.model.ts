export interface PlanRequest {
  nombre: string;
  descripcion: string;
  numeroPersonas: number;
  precio: number;
}

export interface PlanResponse {
  id: number;
  nombre: string;
  descripcion: string;
  numeroPersonas: number;
  precio: number;
  activo: boolean;
  createdAt: string;
}