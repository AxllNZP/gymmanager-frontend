import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { MembresiaRequest, MembresiaResponse, RenovacionRequest } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class MembresiaService {

  private baseUrl = 'http://localhost:8080/api/membresias';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<ApiResponse<MembresiaResponse[]>> {
    return this.http.get<ApiResponse<MembresiaResponse[]>>(this.baseUrl);
  }

  listarActivas(): Observable<ApiResponse<MembresiaResponse[]>> {
    return this.http.get<ApiResponse<MembresiaResponse[]>>(`${this.baseUrl}/activas`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<MembresiaResponse>> {
    return this.http.get<ApiResponse<MembresiaResponse>>(`${this.baseUrl}/${id}`);
  }

  obtenerPorCliente(clienteId: number): Observable<ApiResponse<MembresiaResponse[]>> {
    return this.http.get<ApiResponse<MembresiaResponse[]>>(
      `${this.baseUrl}/cliente/${clienteId}`);
  }

  crear(request: MembresiaRequest): Observable<ApiResponse<MembresiaResponse>> {
    return this.http.post<ApiResponse<MembresiaResponse>>(this.baseUrl, request);
  }

  renovar(id: number, request: RenovacionRequest): Observable<ApiResponse<MembresiaResponse>> {
    return this.http.post<ApiResponse<MembresiaResponse>>(
      `${this.baseUrl}/${id}/renovar`, request);
  }
}