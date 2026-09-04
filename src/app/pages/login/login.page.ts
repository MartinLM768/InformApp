// Página de inicio de sesión: maneja las credenciales del usuario admin
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonNote,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline, alertCircleOutline } from 'ionicons/icons';

// Registro de iconos utilizados
addIcons({
  'arrow-back-outline': arrowBackOutline,
  'alert-circle-outline': alertCircleOutline,
});

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonNote,
    IonIcon,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ arrowBackOutline, alertCircleOutline });

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  // Lógica principal de login
  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      await this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const { username, password } = this.loginForm.value;
    this.loading = true; // Activa el spinner de carga
    try {
      // Intenta autenticar usando el servicio de Auth
      const success = await this.authService.login(
        username,
        password
      );

      if (success) {
        await this.mostrarToast('Bienvenido, administrador', 'success');
        this.router.navigate(['/admin']); // Navega al panel administrativo
      } else {
        await this.mostrarToast('Usuario o contraseña incorrectos', 'danger');
      }
    } catch (error) {
      await this.mostrarToast('Error en el login', 'danger');
    } finally {
      this.loading = false; // Desactiva el spinner
    }
  }

  // Utilidad para mostrar notificaciones rápidas al usuario
  private async mostrarToast(
    mensaje: string,
    color: 'success' | 'warning' | 'danger' = 'danger'
  ) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
