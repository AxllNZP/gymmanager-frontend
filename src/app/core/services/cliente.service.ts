import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { ClienteRequest, ClienteResponse } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private baseUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ApiResponse<ClienteResponse[]>> {
    return this.http.get<ApiResponse<ClienteResponse[]>>(this.baseUrl);
  }

  listarActivos(): Observable<ApiResponse<ClienteResponse[]>> {
    return this.http.get<ApiResponse<ClienteResponse[]>>(`${this.baseUrl}/activos`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<ClienteResponse>> {
    return this.http.get<ApiResponse<ClienteResponse>>(`${this.baseUrl}/${id}`);
  }

  obtenerPorDni(dni: string): Observable<ApiResponse<ClienteResponse>> {
    return this.http.get<ApiResponse<ClienteResponse>>(`${this.baseUrl}/dni/${dni}`);
  }

  crear(request: ClienteRequest): Observable<ApiResponse<ClienteResponse>> {
    return this.http.post<ApiResponse<ClienteResponse>>(this.baseUrl, request);
  }

  actualizar(id: number, request: ClienteRequest): Observable<ApiResponse<ClienteResponse>> {
    return this.http.put<ApiResponse<ClienteResponse>>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/desactivar`, {});
  }
}