import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  username = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async login() {
    if (!this.username || !this.password) {
      this.mostrarToast('Por favor completa todos los campos');
      return;
    }

    this.loading = true;
    const success = await this.authService.login(this.username, this.password);

    if (success) {
      this.mostrarToast('Bienvenido, administrador');
      this.router.navigate(['/admin']);
    } else {
      this.mostrarToast('Usuario o contraseña incorrectos');
    }

    this.loading = false;
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}