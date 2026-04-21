import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonText,
  ToastController,
} from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

addIcons({
  'arrow-back-outline': arrowBackOutline,
});

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonText,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async login() {
    if (!this.username || !this.password) {
      await this.mostrarToast('Por favor completa todos los campos', 'warning');
      return;
    }

    this.loading = true;
    try {
      const success = await this.authService.login(
        this.username,
        this.password
      );

      if (success) {
        await this.mostrarToast('Bienvenido, administrador', 'success');
        this.router.navigate(['/admin']);
      } else {
        await this.mostrarToast('Usuario o contraseña incorrectos', 'danger');
      }
    } catch (error) {
      await this.mostrarToast('Error en el login', 'danger');
    } finally {
      this.loading = false;
    }
  }

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