import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonList, IonListHeader,
  IonLabel, IonItem, IonSpinner, IonAvatar,
  IonFab, IonFabButton, IonButtons,
  ModalController, ToastController, AlertController,
} from '@ionic/angular/standalone';
import { DatabaseService, PoliticoConCargo } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { FormPoliticoComponent } from '../../components/form-politico/form-politico.component';
import { addIcons } from 'ionicons';
import { logOutOutline, add, pencil, briefcaseOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

addIcons({ 'log-out-outline': logOutOutline, 'add': add, 'pencil': pencil, 'briefcase-outline': briefcaseOutline });

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonList, IonListHeader,
    IonLabel, IonItem, IonSpinner, IonAvatar,
    IonFab, IonFabButton, IonButtons,
  ],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  politicos: PoliticoConCargo[] = [];
  loading = false;

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.cargarPoliticos();
  }

  async cargarPoliticos() {
    this.loading = true;
    this.politicos = await this.dbService.obtenerPoliticosConDetalle();
    this.loading = false;
  }

  async abrirFormulario(politico?: PoliticoConCargo) {
    // Para editar necesitamos el Politico base (sin joins), lo buscamos por id
    const politicoBase = politico ? await this.dbService.obtenerPoliticoPorId(politico.id) : null;

    const modal = await this.modalController.create({
      component: FormPoliticoComponent,
      componentProps: { politico: politicoBase },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;

    if (data.action === 'eliminar') {
      const success = await this.dbService.eliminarPolitico(politico!.id);
      if (success) await this.mostrarToast('Político eliminado', 'success');
    } else if (data.action === 'guardar') {
      const { cargo_id, entidad_id, fecha_inicio_cargo, ...politicoData } = data.data;
      if (politico) {
        // Actualizar datos base
        await this.dbService.actualizarPolitico(politico.id, politicoData);
        // Si cambió el cargo, registrar en politicos_cargos
        if (cargo_id && fecha_inicio_cargo) {
          await this.dbService.asignarCargo({
            politico_id: politico.id,
            cargo_id,
            entidad_id: entidad_id || undefined,
            fecha_inicio: fecha_inicio_cargo,
            es_actual: true,
          });
        }
        await this.mostrarToast('Político actualizado', 'success');
      } else {
        const id = await this.dbService.crearPolitico(politicoData);
        // Si se especificó cargo, asignarlo en politicos_cargos
        if (id && cargo_id && fecha_inicio_cargo) {
          await this.dbService.asignarCargo({
            politico_id: id,
            cargo_id,
            entidad_id: entidad_id || undefined,
            fecha_inicio: fecha_inicio_cargo,
            es_actual: true,
          });
        }
        if (id) await this.mostrarToast('Político creado', 'success');
      }
    }

    await this.cargarPoliticos();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/home']);
          },
        },
      ],
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
