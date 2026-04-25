import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardContent,
  IonButton, IonIcon, IonAvatar, IonSpinner,
  IonButtons, IonChip,
  ActionSheetController, ModalController,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { DatabaseService, PoliticoConCargo, Cargo } from '../../services/database.service';
import { DetallePoliticoComponent } from '../../components/detalle-politico/detalle-politico.component';
import { addIcons } from 'ionicons';
import { eyeOutline, settingsOutline, filterOutline, closeCircleOutline, personOutline } from 'ionicons/icons';

addIcons({ 'settings-outline': settingsOutline, 'eye-outline': eyeOutline, 'filter-outline': filterOutline, 'close-circle-outline': closeCircleOutline, 'person-outline': personOutline });

@Component({
  selector: 'app-politicos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardContent,
    IonButton, IonIcon, IonAvatar, IonSpinner,
    IonButtons, IonChip,
  ],
  templateUrl: './politicos.page.html',
  styleUrls: ['./politicos.page.scss'],
})
export class PoliticosPage implements OnInit {
  politicos: PoliticoConCargo[] = [];
  politicosFiltrados: PoliticoConCargo[] = [];
  cargos: Cargo[] = [];
  cargoSeleccionado: Cargo | null = null;
  loading = false;

  constructor(
    private dbService: DatabaseService,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    try {
      this.cargos = await this.dbService.obtenerCargos();
      this.politicos = await this.dbService.obtenerPoliticosConDetalle();
      this.politicosFiltrados = [...this.politicos];
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
    this.loading = false;
  }

  async abrirFiltro() {
    const buttons = [
      {
        text: 'Todos los cargos',
        handler: () => {
          this.cargoSeleccionado = null;
          this.politicosFiltrados = [...this.politicos];
        },
      },
      ...this.cargos.map((cargo) => ({
        text: cargo.nombre,
        handler: () => {
          this.cargoSeleccionado = cargo;
          this.politicosFiltrados = this.politicos.filter((p) => p.cargo_nombre === cargo.nombre);
        },
      })),
      { text: 'Cancelar', role: 'cancel' },
    ];

    const sheet = await this.actionSheetCtrl.create({
      header: 'Filtrar por cargo',
      buttons,
    });
    await sheet.present();
  }

  limpiarFiltro() {
    this.cargoSeleccionado = null;
    this.politicosFiltrados = [...this.politicos];
  }

  async abrirDetalle(politico: PoliticoConCargo) {
    const modal = await this.modalController.create({
      component: DetallePoliticoComponent,
      componentProps: { politico },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.9,
    });
    await modal.present();
  }
}
