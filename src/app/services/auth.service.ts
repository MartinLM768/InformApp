// Servicio de autenticación: gestiona el inicio y cierre de sesión
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<string | null>(null);
  private authInitialization: Promise<void>;

  isAuthenticated$ = this.isAuthenticated.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private dbService: DatabaseService) {
    this.authInitialization = this.initializeAuthState();
    this.dbService.onAuthStateChange((_event, session) => {
      this.updateStateFromSession(session);
    });
  }

  private async initializeAuthState(): Promise<void> {
    const { data, error } = await this.dbService.getSession();
    if (error) {
      console.error('Error restaurando sesión de Supabase:', error);
      this.isAuthenticated.next(false);
      this.currentUser.next(null);
      return;
    }
    this.updateStateFromSession(data.session);
  }

  private updateStateFromSession(session: Session | null): void {
    if (session?.user) {
      this.isAuthenticated.next(true);
      this.currentUser.next(session.user.email ?? null);
      return;
    }
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  async login(email: string, password: string): Promise<boolean> {
    return this.dbService.signInWithPassword(email, password);
  }

  async logout(): Promise<void> {
    await this.dbService.signOut();
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  async isLoggedIn(): Promise<boolean> {
    await this.authInitialization;
    return this.isAuthenticated.value;
  }
}
