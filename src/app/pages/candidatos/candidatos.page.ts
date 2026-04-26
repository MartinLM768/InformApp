import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonIcon, IonChip, IonLabel, IonButtons, IonButton,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { timeOutline, globeOutline, logoTwitter, logoInstagram, settingsOutline } from 'ionicons/icons';

addIcons({ 'time-outline': timeOutline, 'globe-outline': globeOutline, 'logo-twitter': logoTwitter, 'logo-instagram': logoInstagram, 'settings-outline': settingsOutline });

export interface Candidato {
  nombre: string;
  apellido: string;
  partido: string;
  partido_color: string;
  partido_siglas: string;
  foto_url?: string;
  bio: string;
  propuesta_clave: string;
  sitio_web?: string;
  twitter_url?: string;
  instagram_url?: string;
}

@Component({
  selector: 'app-candidatos',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent, IonIcon, IonChip, IonLabel, IonButtons, IonButton,
  ],
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
})
export class CandidatosPage implements OnInit, OnDestroy {

  // 31 de mayo de 2026 a las 8:00 AM hora Colombia (UTC-5)
  private readonly META = new Date('2026-05-31T08:00:00-05:00').getTime();

  dias = 0;
  horas = 0;
  minutos = 0;
  segundos = 0;
  eleccionesIniciadas = false;
  private intervalo?: ReturnType<typeof setInterval>;

  candidatos: Candidato[] = [
    {
      nombre: 'Gustavo',
      apellido: 'Bolívar',
      partido: 'Pacto Histórico',
      partido_color: '#6B2D8B',
      partido_siglas: 'PH',
      bio: 'Ex senador, escritor y productor de televisión. Uno de los artífices de la campaña presidencial de Gustavo Petro en 2022. Propone continuar las reformas sociales del gobierno actual.',
      propuesta_clave: 'Continuidad del cambio, reformas sociales y lucha contra la corrupción.',
    },
    {
      nombre: 'Paloma',
      apellido: 'Valencia Laserna',
      partido: 'Centro Democrático',
      partido_color: '#FF6600',
      partido_siglas: 'CD',
      bio: 'Senadora del Centro Democrático, abogada y politóloga. Ha sido una de las voces más críticas del gobierno Petro y propone un viraje hacia la seguridad y el libre mercado.',
      propuesta_clave: 'Seguridad ciudadana, libre empresa y reversión de las reformas del gobierno Petro.',
    },
    {
      nombre: 'Germán',
      apellido: 'Vargas Lleras',
      partido: 'Cambio Radical',
      partido_color: '#00AEEF',
      partido_siglas: 'CR',
      bio: 'Ex vicepresidente de Colombia (2014-2018), ingeniero civil con décadas de experiencia política. Conocido por su gestión en infraestructura y vivienda.',
      propuesta_clave: 'Infraestructura, seguridad y estabilidad económica.',
    },
    {
      nombre: 'Alejandro',
      apellido: 'Gaviria Uribe',
      partido: 'Partido Liberal',
      partido_color: '#FF0000',
      partido_siglas: 'PLC',
      bio: 'Ex rector de la Universidad de los Andes y ex ministro de Salud. Economista y escritor, representa el centro político moderado.',
      propuesta_clave: 'Educación, salud pública y reformas estructurales moderadas.',
    },
    {
      nombre: 'Vicky',
      apellido: 'Dávila',
      partido: 'Independiente',
      partido_color: '#37474F',
      partido_siglas: 'IND',
      bio: 'Periodista y directora de la Revista Semana. Candidata independiente con un discurso anticorrupción y de orden institucional.',
      propuesta_clave: 'Transparencia, lucha anticorrupción y recuperación institucional.',
    },
  ];

  ngOnInit() {
    this.calcularTiempo();
    this.intervalo = setInterval(() => this.calcularTiempo(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
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

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  abrirUrl(url?: string) {
    if (url) window.open(url, '_blank');
  }
}
