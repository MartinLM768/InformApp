import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonTextarea, IonToggle, IonIcon, IonSelect, IonSelectOption, IonNote,
  ModalController, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DatabaseService, Candidato } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, alertCircleOutline } from 'ionicons/icons';

addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline, 'alert-circle-outline': alertCircleOutline });

@Component({
  selector: 'app-form-candidato',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonTextarea, IonToggle, IonIcon, IonSelect, IonSelectOption, IonNote,
  ],
  templateUrl: './form-candidato.component.html',
  styleUrls: ['./form-candidato.component.scss'],
})
export class FormCandidatoComponent implements OnInit {
  @Input() candidato: Candidato | null = null;

  form: FormGroup;
  partidos: { id: string; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    addIcons({ closeOutline, trashOutline, alertCircleOutline });

    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      foto_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      partido_id: [''],
      vicepresidente_nombre: [''],
      vicepresidente_apellido: [''],
      foto_vicepresidente_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      propuesta_clave: [''],
      bio: [''],
      sitio_web: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      twitter_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      instagram_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      activo: [true],
    });
  }

  async ngOnInit() {
    this.partidos = await this.dbService.obtenerPartidosSimple();

    if (this.candidato) {
      this.form.patchValue({
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
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.mostrarToast('Por favor completa los campos requeridos correctamente', 'warning');
      return;
    }
    await this.modalController.dismiss({ action: 'guardar', data: this.form.value });
  }

  async cerrar() {
    await this.modalController.dismiss();
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Eliminar candidato',
      message: `¿Seguro que deseas eliminar a ${this.form.get('nombre')?.value} ${this.form.get('apellido')?.value}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive',
          handler: async () => { await this.modalController.dismiss({ action: 'eliminar' }); } },
      ],
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' = 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
