import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { FormPoliticoComponent } from '../../components/form-politico/form-politico.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
  politicos: any[] = [];
  loading = false;

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarPoliticos();
  }

  async cargarPoliticos() {
    this.loading = true;
    this.politicos = await this.dbService.obtenerTodosPoliticos();
    this.loading = false;
  }

  async abrirFormulario(politico?: any) {
    const modal = await this.modalController.create({
      component: FormPoliticoComponent,
      componentProps: {
        politico: politico || null
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data) {
      if (politico) {
        await this.dbService.actualizarPolitico(politico.id, data);
        this.mostrarToast('Político actualizado correctamente');
      } else {
        await this.dbService.crearPolitico(data);
        this.mostrarToast('Político creado correctamente');
      }
      await this.cargarPoliticos();
    }
  }

  async eliminarPolitico(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Deseas eliminar este político?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.dbService.eliminarPolitico(id);
            this.mostrarToast('Político eliminado correctamente');
            await this.cargarPoliticos();
          }
        }
      ]
    });

    await alert.present();
  }

  logout() {
    this.authService.logout();
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