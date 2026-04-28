import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardContent,
  IonButton, IonIcon, IonAvatar, IonSpinner,
  IonButtons, IonChip, IonSearchbar, IonMenuButton,
  ActionSheetController, ModalController,
} from '@ionic/angular/standalone';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
    IonButtons, IonChip, IonSearchbar, IonMenuButton,
  ],
  templateUrl: './politicos.page.html',
  styleUrls: ['./politicos.page.scss'],
})
export class PoliticosPage implements OnInit {
  politicos: PoliticoConCargo[] = [];
  politicosFiltrados: PoliticoConCargo[] = [];
  cargos: Cargo[] = [];
  cargoSeleccionado: Cargo | null = null;
  partidoFiltro: { id: string; nombre: string } | null = null;
  textoBusqueda: string = '';
  loading = false;

  constructor(
    private dbService: DatabaseService,
    private actionSheetCtrl: ActionSheetController,
    private modalController: ModalController,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
    const params = this.route.snapshot.queryParams;
    if (params['partido_id'] && params['partido_nombre']) {
      this.partidoFiltro = { id: params['partido_id'], nombre: params['partido_nombre'] };
      this.aplicarFiltros();
    }
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

  aplicarFiltros() {
    const texto = (this.textoBusqueda || '').toLowerCase().trim();
    let base = [...this.politicos];
    if (this.cargoSeleccionado) {
      base = base.filter(p => p.cargo_nombre === this.cargoSeleccionado!.nombre);
    }
    if (this.partidoFiltro) {
      base = base.filter(p => p.partido_id === this.partidoFiltro!.id);
    }
    if (texto) {
      base = base.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(texto) ||
        (p.partido_nombre || '').toLowerCase().includes(texto) ||
        (p.entidad_nombre || '').toLowerCase().includes(texto)
      );
    }
    this.politicosFiltrados = base;
  }

  limpiarFiltroPartido() {
    this.partidoFiltro = null;
    this.aplicarFiltros();
  }

  async abrirFiltro() {
    const buttons = [
      {
        text: 'Todos los cargos',
        handler: () => {
          this.cargoSeleccionado = null;
          this.aplicarFiltros();
        },
      },
      ...this.cargos.map((cargo) => ({
        text: cargo.nombre,
        handler: () => {
          this.cargoSeleccionado = cargo;
          this.aplicarFiltros();
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
    this.aplicarFiltros();
  }

  async abrirDetalle(politico: PoliticoConCargo) {
    const modal = await this.modalController.create({
      component: DetallePoliticoComponent,
      componentProps: { politico },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
  }
}
