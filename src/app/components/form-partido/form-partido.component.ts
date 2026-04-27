import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonTextarea, IonToggle, IonIcon,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { Partido } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';

addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline });

interface FormPartido {
  nombre: string;
  siglas: string;
  color_hex: string;
  ideologia: string;
  sitio_web: string;
  logo_url: string;
  activo: boolean;
}

@Component({
  selector: 'app-form-partido',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonTextarea, IonToggle, IonIcon,
  ],
  templateUrl: './form-partido.component.html',
  styleUrls: ['./form-partido.component.scss'],
})
export class FormPartidoComponent implements OnInit {
  @Input() partido: Partido | null = null;

  form: FormPartido = {
    nombre: '',
    siglas: '',
    color_hex: '#0A2342',
    ideologia: '',
    sitio_web: '',
    logo_url: '',
    activo: true,
  };

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    if (this.partido) {
      this.form = {
        nombre: this.partido.nombre,
        siglas: this.partido.siglas || '',
        color_hex: this.partido.color_hex || '#0A2342',
        ideologia: this.partido.ideologia || '',
        sitio_web: this.partido.sitio_web || '',
        logo_url: this.partido.logo_url || '',
        activo: this.partido.activo,
      };
    }
  }

  async guardar() {
    if (!this.form.nombre.trim()) {
      alert('El nombre del partido es obligatorio');
      return;
    }
    await this.modalController.dismiss({ action: 'guardar', data: this.form });
  }

  async cerrar() {
    await this.modalController.dismiss();
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Eliminar partido',
      message: `¿Seguro que deseas eliminar "${this.form.nombre}"? Esto puede afectar a los políticos asociados.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: async () => { await this.modalController.dismiss({ action: 'eliminar' }); },
        },
      ],
    });
    await alert.present();
  }
}
