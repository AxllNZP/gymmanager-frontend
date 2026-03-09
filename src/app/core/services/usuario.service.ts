import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { UsuarioRequest, UsuarioResponse } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private baseUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.get<ApiResponse<UsuarioResponse>>(`${this.baseUrl}/${id}`);
  }

  crear(request: UsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.post<ApiResponse<UsuarioResponse>>(this.baseUrl, request);
  }

  actualizar(id: number, request: UsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.put<ApiResponse<UsuarioResponse>>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  desbloquear(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/desbloquear`, {});
  }
}