import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSpinner,
  ModalController,
  IonButtons,
  IonLabel,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { DatabaseService, Politico } from '../../services/database.service';
import { DetallePoliticoComponent } from '../../components/detalle-politico/detalle-politico.component';
import { addIcons } from 'ionicons';
import { eyeOutline, settingsOutline, briefcaseOutline } from 'ionicons/icons';

addIcons({
  'settings-outline': settingsOutline,
  'eye-outline': eyeOutline,
});

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonSpinner,
    IonButtons,
    IonLabel,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  politicos: Politico[] = [];
  politicosFiltered: Politico[] = [];
  cargosSeleccionado = '';
  loading = false;

  cargos = [
    { value: '', label: 'Todos' },
    { value: 'Presidente', label: 'Presidente' },
    { value: 'Vicepresidente', label: 'Vicepresidente' },
    { value: 'Senador', label: 'Senado' },
    { value: 'Representante', label: 'Cámara' },
  ];

  constructor(
    private dbService: DatabaseService,
    private modalController: ModalController
  ) {
      addIcons({settingsOutline,eyeOutline,briefcaseOutline});}

  async ngOnInit() {
    await this.dbService.initialize();
    await this.cargarPoliticos();
  }

  async cargarPoliticos() {
    this.loading = true;
    this.politicos = await this.dbService.obtenerTodosPoliticos();
    this.aplicarFiltro();
    this.loading = false;
  }

  aplicarFiltro() {
    if (!this.cargosSeleccionado) {
      this.politicosFiltered = [...this.politicos];
    } else {
      this.politicosFiltered = this.politicos.filter(
        (p) => p.cargo === this.cargosSeleccionado
      );
    }
  }

  async abrirDetalle(politico: Politico) {
    const modal = await this.modalController.create({
      component: DetallePoliticoComponent,
      componentProps: { politico },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.9,
    });
    await modal.present();
  }
}