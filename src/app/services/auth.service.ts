import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<string | null>(null);

  isAuthenticated$ = this.isAuthenticated.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private dbService: DatabaseService) {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.isAuthenticated.next(true);
      this.currentUser.next(localStorage.getItem('username'));
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    const isValid = await this.dbService.validarUsuario(username, password);
    if (isValid) {
      localStorage.setItem('adminToken', 'true');
      localStorage.setItem('username', username);
      this.isAuthenticated.next(true);
      this.currentUser.next(username);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('username');
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('adminToken');
  }
}