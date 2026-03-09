import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { PagoRequest, PagoResponse } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {

  private baseUrl = 'http://localhost:8080/api/pagos';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ApiResponse<PagoResponse[]>> {
    return this.http.get<ApiResponse<PagoResponse[]>>(this.baseUrl);
  }

  listarPorMes(): Observable<ApiResponse<PagoResponse[]>> {
    return this.http.get<ApiResponse<PagoResponse[]>>(`${this.baseUrl}/mes-actual`);
  }

  listarPorCliente(clienteId: number): Observable<ApiResponse<PagoResponse[]>> {
    return this.http.get<ApiResponse<PagoResponse[]>>(
      `${this.baseUrl}/cliente/${clienteId}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<PagoResponse>> {
    return this.http.get<ApiResponse<PagoResponse>>(`${this.baseUrl}/${id}`);
  }

  registrar(request: PagoRequest): Observable<ApiResponse<PagoResponse>> {
    return this.http.post<ApiResponse<PagoResponse>>(this.baseUrl, request);
  }

  anular(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/anular`, {});
  }
}