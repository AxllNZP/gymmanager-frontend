import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, ApiResponse } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`, request
    ).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('usuario', JSON.stringify(response.data));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): LoginResponse | null {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRole(): string {
    return this.getUsuario()?.role || '';
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.getRole());
  }
}
