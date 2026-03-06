export interface UsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  role: string;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  role: string;
  activo: boolean;
  createdAt: string;
}