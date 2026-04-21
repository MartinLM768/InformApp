import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSpinner,
  IonAvatar,
  IonFab,
  IonFabButton,
  IonButtons,
  ModalController,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { DatabaseService, Politico } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { FormPoliticoComponent } from '../../components/form-politico/form-politico.component';
import { addIcons } from 'ionicons';
import { logOutOutline, add, pencil, trash } from 'ionicons/icons';

addIcons({
  'log-out-outline': logOutOutline,
  'add': add,
  'pencil': pencil,
  'trash': trash,
});

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSpinner,
    IonAvatar,
    IonFab,
    IonFabButton,
    IonButtons,
  ],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  politicos: Politico[] = [];
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

  async abrirFormulario(politico?: Politico) {
    const modal = await this.modalController.create({
      component: FormPoliticoComponent,
      componentProps: {
        politico: politico || null,
      },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data) {
      if (politico) {
        const success = await this.dbService.actualizarPolitico(
          politico.id!,
          data
        );
        if (success) {
          await this.mostrarToast('Político actualizado correctamente', 'success');
        }
      } else {
        const id = await this.dbService.crearPolitico(data);
        if (id) {
          await this.mostrarToast('Político creado correctamente', 'success');
        }
      }
      await this.cargarPoliticos();
    }
  }

  async eliminarPolitico(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Deseas eliminar este político?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const success = await this.dbService.eliminarPolitico(id);
            if (success) {
              await this.mostrarToast('Político eliminado correctamente', 'success');
              await this.cargarPoliticos();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  logout() {
    this.authService.logout();
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