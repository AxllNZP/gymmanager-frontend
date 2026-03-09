import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { PlanRequest, PlanResponse } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {

  private baseUrl = 'http://localhost:8080/api/planes';

  constructor(private http: HttpClient) {}

  listarActivos(): Observable<ApiResponse<PlanResponse[]>> {
    return this.http.get<ApiResponse<PlanResponse[]>>(this.baseUrl);
  }

  listarTodos(): Observable<ApiResponse<PlanResponse[]>> {
    return this.http.get<ApiResponse<PlanResponse[]>>(`${this.baseUrl}/todos`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<PlanResponse>> {
    return this.http.get<ApiResponse<PlanResponse>>(`${this.baseUrl}/${id}`);
  }

  crear(request: PlanRequest): Observable<ApiResponse<PlanResponse>> {
    return this.http.post<ApiResponse<PlanResponse>>(this.baseUrl, request);
  }

  actualizar(id: number, request: PlanRequest): Observable<ApiResponse<PlanResponse>> {
    return this.http.put<ApiResponse<PlanResponse>>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  activar(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/activar`, {});
  }
}