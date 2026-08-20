import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/studio.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/auth';
  private readonly TOKEN_KEY = 'studio_jwt_token';
  private readonly USER_KEY = 'studio_user_profile';

  token = signal<string | null>(this.getStoredToken());
  currentUser = signal<any | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    if (res && res.token) {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res));
      this.token.set(res.token);
      this.currentUser.set(res);
    }
  }

  private getStoredToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  private getStoredUser(): any | null {
    if (typeof localStorage === 'undefined') return null;
    const item = localStorage.getItem(this.USER_KEY);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}
