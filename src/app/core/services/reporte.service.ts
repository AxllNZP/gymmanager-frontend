import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { DashboardResponse } from '../models/dashboard.model';
import { PagoResponse } from '../models/pago.model';
import { MembresiaResponse } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {

  private baseUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DashboardResponse>> {
    return this.http.get<ApiResponse<DashboardResponse>>(`${this.baseUrl}/dashboard`);
  }

  getPagosPorPeriodo(inicio: string, fin: string): Observable<ApiResponse<PagoResponse[]>> {
    return this.http.get<ApiResponse<PagoResponse[]>>(
      `${this.baseUrl}/pagos?inicio=${inicio}&fin=${fin}`);
  }

  getMembresiasExpiradas(): Observable<ApiResponse<MembresiaResponse[]>> {
    return this.http.get<ApiResponse<MembresiaResponse[]>>(
      `${this.baseUrl}/membresias/expiradas`);
  }

  getMembresiasPorVencer(): Observable<ApiResponse<MembresiaResponse[]>> {
    return this.http.get<ApiResponse<MembresiaResponse[]>>(
      `${this.baseUrl}/membresias/por-vencer`);
  }

  exportarPdf(inicio: string, fin: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/exportar/pdf?inicio=${inicio}&fin=${fin}`,
      { responseType: 'blob' }
    );
  }

  exportarExcel(inicio: string, fin: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/exportar/excel?inicio=${inicio}&fin=${fin}`,
      { responseType: 'blob' }
    );
  }
}