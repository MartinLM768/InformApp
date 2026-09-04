// Servicio de autenticación: gestiona el inicio y cierre de sesión
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Estados reactivos para controlar si el usuario está autenticado y quién es
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<string | null>(null);

  // Exposición de estados como observables para que los componentes se suscriban
  isAuthenticated$ = this.isAuthenticated.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private dbService: DatabaseService) {
    // Verifica si ya hay una sesión activa al iniciar el servicio
    this.checkAuthStatus();
  }

  // Verifica en el almacenamiento local si existe un token de administrador
  private checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.isAuthenticated.next(true);
      this.currentUser.next(localStorage.getItem('username'));
    }
  }

  // Realiza el login validando credenciales a través del servicio de base de datos
  async login(username: string, password: string): Promise<boolean> {
    const isValid = await this.dbService.validarUsuario(username, password);
    if (isValid) {
      // Guarda la sesión en el almacenamiento local
      localStorage.setItem('adminToken', 'true');
      localStorage.setItem('username', username);
      this.isAuthenticated.next(true);
      this.currentUser.next(username);
      return true;
    }
    return false;
  }

  // Cierra la sesión, eliminando datos del almacenamiento local y actualizando estados
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('username');
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  // Comprobación síncrona simple del estado de autenticación
  isLoggedIn(): boolean {
    return !!localStorage.getItem('adminToken');
  }
}
