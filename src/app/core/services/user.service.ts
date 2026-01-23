import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8000/api/auth/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}/`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}/`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/`);
  }

  toggleUserStatus(id: number): Observable<{ status: string; is_blocked: boolean }>{
    return this.http.post<{ status: string; is_blocked: boolean }>(`${this.API_URL}/${id}/toggle-status/`, {});
  }

  resetUserPassword(id: number): Observable<{ status: string }>{
    return this.http.post<{ status: string }>(`${this.API_URL}/${id}/reset-password/`, {});
  }
}
