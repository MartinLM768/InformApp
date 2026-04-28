import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonIcon, IonChip, IonLabel,
  IonButtons, IonButton, IonSpinner, IonSearchbar, IonMenuButton,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { timeOutline, globeOutline, logoTwitter, logoInstagram, settingsOutline } from 'ionicons/icons';
import { DatabaseService, Candidato } from '../../services/database.service';

addIcons({ 'time-outline': timeOutline, 'globe-outline': globeOutline, 'logo-twitter': logoTwitter, 'logo-instagram': logoInstagram, 'settings-outline': settingsOutline });

@Component({
  selector: 'app-candidatos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent, IonIcon, IonChip, IonLabel,
    IonButtons, IonButton, IonSpinner, IonSearchbar, IonMenuButton,
  ],
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
})
export class CandidatosPage implements OnInit, OnDestroy {

  private readonly META = new Date('2026-05-31T08:00:00-05:00').getTime();

  dias = 0; horas = 0; minutos = 0; segundos = 0;
  eleccionesIniciadas = false;
  private intervalo?: ReturnType<typeof setInterval>;

  candidatos: Candidato[] = [];
  candidatosFiltrados: Candidato[] = [];
  textoBusqueda: string = '';
  loading = false;

  constructor(private dbService: DatabaseService) {}

  async ngOnInit() {
    this.calcularTiempo();
    this.intervalo = setInterval(() => this.calcularTiempo(), 1000);
    await this.cargarCandidatos();
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  async cargarCandidatos() {
    this.loading = true;
    this.candidatos = await this.dbService.obtenerCandidatos();
    this.candidatosFiltrados = [...this.candidatos];
    this.loading = false;
  }

  filtrarCandidatos() {
    const texto = (this.textoBusqueda || '').toLowerCase().trim();
    if (!texto) {
      this.candidatosFiltrados = [...this.candidatos];
      return;
    }
    this.candidatosFiltrados = this.candidatos.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(texto) ||
      `${c.vicepresidente_nombre || ''} ${c.vicepresidente_apellido || ''}`.toLowerCase().includes(texto) ||
      (c.partido_nombre || '').toLowerCase().includes(texto) ||
      (c.partido_siglas || '').toLowerCase().includes(texto)
    );
  }

  private calcularTiempo() {
    const diff = this.META - Date.now();
    if (diff <= 0) {
      this.eleccionesIniciadas = true;
      this.dias = this.horas = this.minutos = this.segundos = 0;
      if (this.intervalo) clearInterval(this.intervalo);
      return;
    }
    this.dias     = Math.floor(diff / 86400000);
    this.horas    = Math.floor((diff % 86400000) / 3600000);
    this.minutos  = Math.floor((diff % 3600000) / 60000);
    this.segundos = Math.floor((diff % 60000) / 1000);
  }

  pad(n: number): string { return n.toString().padStart(2, '0'); }

  abrirUrl(url?: string) { if (url) window.open(url, '_blank'); }

  iniciales(nombre?: string, apellido?: string): string {
    return `${(nombre || '?').charAt(0)}${(apellido || '').charAt(0)}`;
  }
}
