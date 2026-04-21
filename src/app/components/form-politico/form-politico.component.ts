import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  ModalController,
} from '@ionic/angular/standalone';
import { Politico } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

addIcons({
  'close-outline': closeOutline,
});

@Component({
  selector: 'app-form-politico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
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
    foto: '',
    bio: '',
    email: '',
    telefono: '',
    fechaInicio: '',
  };

  cargos = ['Presidente', 'Vicepresidente', 'Senador', 'Representante'];
  departamentos = [
    'Amazonas',
    'Antioquia',
    'Arauca',
    'Atlántico',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Casanare',
    'Cauca',
    'Cesar',
    'Chocó',
    'Córdoba',
    'Cundinamarca',
    'Guainía',
    'Guaviare',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Putumayo',
    'Quindío',
    'Risaralda',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
    'Vaupés',
    'Vichada',
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    if (this.politico) {
      this.form = { ...this.politico };
    }
  }

  async guardar() {
    if (this.validarFormulario()) {
      await this.modalController.dismiss(this.form);
    }
  }

  async cerrar() {
    await this.modalController.dismiss();
  }

  private validarFormulario(): boolean {
    if (!this.form.nombre || !this.form.apellido || !this.form.cargo) {
      alert('Por favor completa los campos requeridos');
      return false;
    }
    return true;
  }
}