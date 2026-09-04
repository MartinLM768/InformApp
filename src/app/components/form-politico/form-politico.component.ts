// Componente de formulario para crear o editar políticos en la base de datos
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonIcon, IonNote,
  ModalController, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DatabaseService, Politico, Cargo } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, alertCircleOutline } from 'ionicons/icons';

// Registro de iconos
addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline, 'alert-circle-outline': alertCircleOutline });

@Component({
  selector: 'app-form-politico',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonIcon, IonNote,
  ],
  templateUrl: './form-politico.component.html',
  styleUrls: ['./form-politico.component.scss'],
})
export class FormPoliticoComponent implements OnInit {
  @Input() politico: Politico | null = null;

  form: FormGroup;
  cargos: Cargo[] = [];
  partidos: { id: string; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    addIcons({ closeOutline, trashOutline, alertCircleOutline });

    // Inicialización del formulario reactivo con validadores
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      cargo_id: [''],
      entidad_id: [''],
      partido_id: [null],
      fecha_inicio_cargo: ['', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      lugar_nacimiento: [''],
      fecha_nacimiento: ['', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      foto_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      twitter_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      instagram_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      sitio_web: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      bio: [''],
      activo: [true],
    });
  }

  async ngOnInit() {
    // Carga inicial de datos de referencia (cargos y partidos) desde la base de datos
    [this.cargos, this.partidos] = await Promise.all([
      this.dbService.obtenerCargos(),
      this.dbService.obtenerPartidosSimple(),
    ]);

    // Si estamos editando, poblamos el formulario con los datos existentes
    if (this.politico) {
      const cargoActual = await this.dbService.obtenerCargoActualDePolitico(this.politico.id);

      this.form.patchValue({
        nombre: this.politico.nombre,
        apellido: this.politico.apellido,
        foto_url: this.politico.foto_url || '',
        bio: this.politico.bio || '',
        fecha_nacimiento: this.politico.fecha_nacimiento || '',
        lugar_nacimiento: this.politico.lugar_nacimiento || '',
        partido_id: this.politico.partido_id || null,
        twitter_url: this.politico.twitter_url || '',
        instagram_url: this.politico.instagram_url || '',
        sitio_web: this.politico.sitio_web || '',
        activo: this.politico.activo,
        cargo_id: cargoActual?.cargo_id || '',
        entidad_id: cargoActual?.entidad_id || '',
        fecha_inicio_cargo: cargoActual?.fecha_inicio || '',
      });
    }
  }

  // Helpers para validación en la plantilla
  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  // Cierra el modal enviando los datos del formulario de vuelta
  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.mostrarToast('Por favor completa los campos requeridos correctamente', 'warning');
      return;
    }
    await this.modalController.dismiss({ action: 'guardar', data: this.form.value });
  }

  // Cierra el modal sin realizar cambios
  async cerrar() {
    await this.modalController.dismiss();
  }

  // Muestra una alerta de confirmación antes de eliminar permanentemente
  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Eliminar político',
      message: `¿Seguro que deseas eliminar a ${this.form.get('nombre')?.value} ${this.form.get('apellido')?.value}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.modalController.dismiss({ action: 'eliminar', data: this.form.value });
          },
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
