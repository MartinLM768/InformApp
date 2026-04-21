import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonIcon,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { Politico } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';

addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline });

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

  form: Politico = {
    nombre: '',
    apellido: '',
    cargo: '',
    partido: '',
    departamento: '',
    foto_url: '',
    bio: '',
    email: '',
    telefono: '',
    fecha_inicio: '',
  };

  cargos = ['Presidente', 'Vicepresidente', 'Senador', 'Representante'];
  departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
    'Bogotá D.C.',
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    if (this.politico) {
      this.form = { ...this.politico };
    }
  }

  async guardar() {
    if (this.validarFormulario()) {
      await this.modalController.dismiss({ action: 'guardar', data: this.form });
    }
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

  private validarFormulario(): boolean {
    if (!this.form.nombre || !this.form.apellido || !this.form.cargo || !this.form.partido) {
      alert('Por favor completa nombre, apellido, cargo y partido');
      return false;
    }
    return true;
  }
}