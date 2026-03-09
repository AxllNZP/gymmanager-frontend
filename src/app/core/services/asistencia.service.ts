import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { AsistenciaRequest, AsistenciaResponse } from '../models/asistencia.model';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {

  private baseUrl = 'http://localhost:8080/api/asistencias';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<ApiResponse<AsistenciaResponse[]>> {
    return this.http.get<ApiResponse<AsistenciaResponse[]>>(this.baseUrl);
  }

  listarHoy(): Observable<ApiResponse<AsistenciaResponse[]>> {
    return this.http.get<ApiResponse<AsistenciaResponse[]>>(`${this.baseUrl}/hoy`);
  }

  listarPorCliente(clienteId: number): Observable<ApiResponse<AsistenciaResponse[]>> {
    return this.http.get<ApiResponse<AsistenciaResponse[]>>(
      `${this.baseUrl}/cliente/${clienteId}`);
  }

  registrarEntrada(request: AsistenciaRequest): Observable<ApiResponse<AsistenciaResponse>> {
    return this.http.post<ApiResponse<AsistenciaResponse>>(
      `${this.baseUrl}/entrada`, request);
  }

  registrarSalida(clienteId: number): Observable<ApiResponse<AsistenciaResponse>> {
    return this.http.patch<ApiResponse<AsistenciaResponse>>(
      `${this.baseUrl}/salida/${clienteId}`, {});
  }
}