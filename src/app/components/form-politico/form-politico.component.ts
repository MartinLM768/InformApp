import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonIcon,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { DatabaseService, Politico, Cargo } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';

addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline });

// Formulario plano para crear/editar — campos que realmente existen en la tabla politicos
interface FormPolitico {
  nombre: string;
  apellido: string;
  foto_url: string;
  bio: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  partido_id: string;
  twitter_url: string;
  instagram_url: string;
  sitio_web: string;
  activo: boolean;
  // cargo se guarda en politicos_cargos, aquí lo usamos solo en el form
  cargo_id: string;
  entidad_id: string;
  fecha_inicio_cargo: string;
}

@Component({
  selector: 'app-form-politico',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonIcon,
  ],
  templateUrl: './form-politico.component.html',
  styleUrls: ['./form-politico.component.scss'],
})
export class FormPoliticoComponent implements OnInit {
  @Input() politico: Politico | null = null;

  form: FormPolitico = {
    nombre: '',
    apellido: '',
    foto_url: '',
    bio: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    partido_id: '',
    twitter_url: '',
    instagram_url: '',
    sitio_web: '',
    activo: true,
    cargo_id: '',
    entidad_id: '',
    fecha_inicio_cargo: '',
  };

  cargos: Cargo[] = [];
  partidos: { id: string; nombre: string }[] = [];

  constructor(
    private dbService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({ closeOutline, trashOutline });
  }

  async ngOnInit() {
    // Cargar cargos y partidos desde Supabase
    this.cargos = await this.dbService.obtenerCargos();
    this.partidos = await this.dbService.obtenerPartidosSimple();

    if (this.politico) {
      this.form = {
        nombre: this.politico.nombre,
        apellido: this.politico.apellido,
        foto_url: this.politico.foto_url || '',
        bio: this.politico.bio || '',
        fecha_nacimiento: this.politico.fecha_nacimiento || '',
        lugar_nacimiento: this.politico.lugar_nacimiento || '',
        partido_id: this.politico.partido_id || '',
        twitter_url: this.politico.twitter_url || '',
        instagram_url: this.politico.instagram_url || '',
        sitio_web: this.politico.sitio_web || '',
        activo: this.politico.activo,
        cargo_id: '',
        entidad_id: '',
        fecha_inicio_cargo: '',
      };
    }
  }

  async guardar() {
    if (!this.form.nombre || !this.form.apellido) {
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
      header: 'Eliminar político',
      message: `¿Seguro que deseas eliminar a ${this.form.nombre} ${this.form.apellido}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.modalController.dismiss({ action: 'eliminar', data: this.form });
          },
        },
      ],
    });
    await alert.present();
  }
}
