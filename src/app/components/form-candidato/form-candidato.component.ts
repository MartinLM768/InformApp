import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonTextarea, IonToggle, IonIcon, IonSelect, IonSelectOption,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { DatabaseService, Candidato } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';

addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline });

interface FormCandidato {
  nombre: string;
  apellido: string;
  foto_url: string;
  vicepresidente_nombre: string;
  vicepresidente_apellido: string;
  foto_vicepresidente_url: string;
  partido_id: string;
  bio: string;
  propuesta_clave: string;
  sitio_web: string;
  twitter_url: string;
  instagram_url: string;
  activo: boolean;
}

@Component({
  selector: 'app-form-candidato',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonTextarea, IonToggle, IonIcon, IonSelect, IonSelectOption,
  ],
  templateUrl: './form-candidato.component.html',
  styleUrls: ['./form-candidato.component.scss'],
})
export class FormCandidatoComponent implements OnInit {
  @Input() candidato: Candidato | null = null;

  form: FormCandidato = {
    nombre: '', apellido: '', foto_url: '',
    vicepresidente_nombre: '', vicepresidente_apellido: '', foto_vicepresidente_url: '',
    partido_id: '', bio: '', propuesta_clave: '',
    sitio_web: '', twitter_url: '', instagram_url: '',
    activo: true,
  };

  partidos: { id: string; nombre: string }[] = [];

  constructor(
    private dbService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {}

  async ngOnInit() {
    this.partidos = await this.dbService.obtenerPartidosSimple();

    if (this.candidato) {
      this.form = {
        nombre: this.candidato.nombre,
        apellido: this.candidato.apellido,
        foto_url: this.candidato.foto_url || '',
        vicepresidente_nombre: this.candidato.vicepresidente_nombre || '',
        vicepresidente_apellido: this.candidato.vicepresidente_apellido || '',
        foto_vicepresidente_url: this.candidato.foto_vicepresidente_url || '',
        partido_id: this.candidato.partido_id || '',
        bio: this.candidato.bio || '',
        propuesta_clave: this.candidato.propuesta_clave || '',
        sitio_web: this.candidato.sitio_web || '',
        twitter_url: this.candidato.twitter_url || '',
        instagram_url: this.candidato.instagram_url || '',
        activo: this.candidato.activo,
      };
    }
  }

  async guardar() {
    if (!this.form.nombre.trim() || !this.form.apellido.trim()) {
      alert('Nombre y apellido son obligatorios');
      return;
    }
    await this.modalController.dismiss({ action: 'guardar', data: this.form });
  }

  async cerrar() {
    await this.modalController.dismiss();
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Eliminar candidato',
      message: `¿Seguro que deseas eliminar a ${this.form.nombre} ${this.form.apellido}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive',
          handler: async () => { await this.modalController.dismiss({ action: 'eliminar' }); } },
      ],
    });
    await alert.present();
  }
}
