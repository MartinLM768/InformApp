import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonToggle, IonIcon, IonNote,
  ModalController, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { Partido } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, alertCircleOutline } from 'ionicons/icons';

addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline, 'alert-circle-outline': alertCircleOutline });

@Component({
  selector: 'app-form-partido',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonToggle, IonIcon, IonNote,
  ],
  templateUrl: './form-partido.component.html',
  styleUrls: ['./form-partido.component.scss'],
})
export class FormPartidoComponent implements OnInit {
  @Input() partido: Partido | null = null;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    addIcons({ closeOutline, trashOutline, alertCircleOutline });

    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      siglas: ['', [Validators.maxLength(10)]],
      color_hex: ['#0A2342', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
      ideologia: [''],
      sitio_web: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      logo_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      activo: [true],
    });
  }

  ngOnInit() {
    if (this.partido) {
      this.form.patchValue({
        nombre: this.partido.nombre,
        siglas: this.partido.siglas || '',
        color_hex: this.partido.color_hex || '#0A2342',
        ideologia: this.partido.ideologia || '',
        sitio_web: this.partido.sitio_web || '',
        logo_url: this.partido.logo_url || '',
        activo: this.partido.activo,
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

  actualizarColor(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    if (valor) {
      this.form.patchValue({ color_hex: valor });
      this.form.get('color_hex')?.markAsDirty();
    }
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
      header: 'Eliminar partido',
      message: `¿Seguro que deseas eliminar "${this.form.get('nombre')?.value}"? Esto puede afectar a los políticos asociados.`,
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
