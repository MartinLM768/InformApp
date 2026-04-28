import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSpinner,
  IonButtons,
  IonBadge,
  IonChip,
  IonSearchbar,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  peopleOutline,
  globeOutline,
} from 'ionicons/icons';

addIcons({
  'settings-outline': settingsOutline,
  'people-outline': peopleOutline,
  'globe-outline': globeOutline,
});

export interface Partido {
  id: string;
  nombre: string;
  siglas?: string;
  logo_url?: string;
  color_hex?: string;
  ideologia?: string;
  sitio_web?: string;
  activo: boolean;
  cantidad_politicos?: number;
}

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonSpinner,
    IonButtons,
    IonBadge,
    IonChip,
    IonSearchbar,
    IonMenuButton,
  ],
  templateUrl: './partidos.page.html',
  styleUrls: ['./partidos.page.scss'],
})
export class PartidosPage implements OnInit {
  partidos: Partido[] = [];
  partidosFiltrados: Partido[] = [];
  textoBusqueda: string = '';
  loading = false;

  constructor(private dbService: DatabaseService) {}

  async ngOnInit() {
    await this.cargarPartidos();
  }

  async cargarPartidos() {
    this.loading = true;
    try {
      this.partidos = await this.dbService.obtenerPartidos();
      this.partidosFiltrados = [...this.partidos];
    } catch (e) {
      console.error('Error cargando partidos:', e);
    }
    this.loading = false;
  }

  filtrarPartidos() {
    const texto = (this.textoBusqueda || '').toLowerCase().trim();
    if (!texto) {
      this.partidosFiltrados = [...this.partidos];
      return;
    }
    this.partidosFiltrados = this.partidos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      (p.siglas || '').toLowerCase().includes(texto) ||
      (p.ideologia || '').toLowerCase().includes(texto)
    );
  }

  abrirSitioWeb(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }
}
