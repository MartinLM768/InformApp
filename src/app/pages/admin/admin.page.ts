import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonList, IonListHeader,
  IonLabel, IonItem, IonSpinner, IonAvatar,
  IonFab, IonFabButton, IonButtons, IonSegment,
  IonSegmentButton, IonBadge,
  ModalController, ToastController, AlertController,
} from '@ionic/angular/standalone';
import { DatabaseService, PoliticoConCargo, Partido, Candidato } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { FormPoliticoComponent } from '../../components/form-politico/form-politico.component';
import { FormPartidoComponent } from '../../components/form-partido/form-partido.component';
import { FormCandidatoComponent } from '../../components/form-candidato/form-candidato.component';
import { addIcons } from 'ionicons';
import {
  logOutOutline, add, pencil, peopleOutline,
  flagOutline, personOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';

addIcons({
  'log-out-outline': logOutOutline, 'add': add, 'pencil': pencil,
  'people-outline': peopleOutline, 'flag-outline': flagOutline,
  'person-outline': personOutline,
});

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonList, IonListHeader,
    IonLabel, IonItem, IonSpinner, IonAvatar,
    IonFab, IonFabButton, IonButtons, IonSegment,
    IonSegmentButton, IonBadge,
  ],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  seccion: 'politicos' | 'partidos' | 'candidatos' = 'politicos';

  politicos: PoliticoConCargo[] = [];
  partidos: Partido[] = [];
  candidatos: Candidato[] = [];
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
    await this.cargarTodo();
  }

  async cargarTodo() {
    this.loading = true;
    [this.politicos, this.partidos, this.candidatos] = await Promise.all([
      this.dbService.obtenerPoliticosConDetalle(),
      this.dbService.obtenerPartidos(),
      this.dbService.obtenerCandidatos(),
    ]);
    this.loading = false;
  }

  // ── POLÍTICOS ───────────────────────────────────────

  async abrirFormPolitico(politico?: PoliticoConCargo) {
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
      await this.dbService.eliminarPolitico(politico!.id);
      await this.mostrarToast('Político eliminado', 'success');
    } else if (data.action === 'guardar') {
      const { cargo_id, entidad_id, fecha_inicio_cargo, ...politicoData } = data.data;
      if (politico) {
        await this.dbService.actualizarPolitico(politico.id, politicoData);
        if (cargo_id) {
          await this.dbService.actualizarOAsignarCargo({
            politico_id: politico.id, cargo_id,
            entidad_id: entidad_id || undefined,
            fecha_inicio: fecha_inicio_cargo || new Date().toISOString().split('T')[0],
            es_actual: true,
          });
        }
        await this.mostrarToast('Político actualizado', 'success');
      } else {
        const id = await this.dbService.crearPolitico(politicoData);
        if (id && cargo_id) {
          await this.dbService.actualizarOAsignarCargo({
            politico_id: id, cargo_id,
            entidad_id: entidad_id || undefined,
            fecha_inicio: fecha_inicio_cargo || new Date().toISOString().split('T')[0],
            es_actual: true,
          });
        }
        if (id) await this.mostrarToast('Político creado', 'success');
      }
    }
    this.politicos = await this.dbService.obtenerPoliticosConDetalle();
  }

  // ── PARTIDOS ────────────────────────────────────────

  async abrirFormPartido(partido?: Partido) {
    const modal = await this.modalController.create({
      component: FormPartidoComponent,
      componentProps: { partido: partido || null },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;

    if (data.action === 'eliminar') {
      await this.dbService.eliminarPartido(partido!.id);
      await this.mostrarToast('Partido eliminado', 'success');
    } else if (data.action === 'guardar') {
      if (partido) {
        await this.dbService.actualizarPartido(partido.id, data.data);
        await this.mostrarToast('Partido actualizado', 'success');
      } else {
        const id = await this.dbService.crearPartido(data.data);
        if (id) await this.mostrarToast('Partido creado', 'success');
      }
    }
    this.partidos = await this.dbService.obtenerPartidos();
  }

  // ── CANDIDATOS ──────────────────────────────────────

  async abrirFormCandidato(candidato?: Candidato) {
    const modal = await this.modalController.create({
      component: FormCandidatoComponent,
      componentProps: { candidato: candidato || null },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;

    if (data.action === 'eliminar') {
      await this.dbService.eliminarCandidato(candidato!.id);
      await this.mostrarToast('Candidato eliminado', 'success');
    } else if (data.action === 'guardar') {
      if (candidato) {
        await this.dbService.actualizarCandidato(candidato.id, data.data);
        await this.mostrarToast('Candidato actualizado', 'success');
      } else {
        const id = await this.dbService.crearCandidato(data.data);
        if (id) await this.mostrarToast('Candidato creado', 'success');
      }
    }
    this.candidatos = await this.dbService.obtenerCandidatos();
  }

  // ── LOGOUT ──────────────────────────────────────────

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', role: 'destructive',
          handler: () => { this.authService.logout(); this.router.navigate(['/home']); } },
      ],
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message: mensaje, duration: 2000, position: 'bottom', color,
    });
    await toast.present();
  }
}
