// Componente de formulario para crear o editar políticos en la base de datos.
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonIcon,
  IonNote,
  ModalController,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { DatabaseService, Politico, Cargo } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, alertCircleOutline } from 'ionicons/icons';

// Registra los iconos usados por la plantilla para que Ionic pueda resolverlos
// por nombre sin cargar todo el catálogo de iconos.
addIcons({ 'close-outline': closeOutline, 'trash-outline': trashOutline, 'alert-circle-outline': alertCircleOutline });

@Component({
  // Selector usado si el componente se inserta directamente en otra plantilla.
  selector: 'app-form-politico',
  // El componente es autónomo: declara aquí sus dependencias de Angular e Ionic.
  standalone: true,
  imports: [
    CommonModule,
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
    IonIcon,
    IonNote,
  ],
  templateUrl: './form-politico.component.html',
  styleUrls: ['./form-politico.component.scss'],
})
export class FormPoliticoComponent implements OnInit {
  // Cuando existe, el formulario funciona en modo edición; si es null, funciona
  // en modo creación.
  @Input() politico: Politico | null = null;

  // Formulario reactivo que concentra valores, validaciones y estado de edición.
  form: FormGroup;
  // Catálogos mostrados en los selectores del formulario.
  cargos: Cargo[] = [];
  partidos: { id: string; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    // Se crea el formulario una sola vez. Los campos de cargo pertenecen a la
    // relación politicos_cargos, mientras que el resto pertenece al político.
    this.form = this.fb.group({
      // Datos obligatorios de identificación del político.
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      // Datos de la relación con el cargo actual.
      cargo_id: [''],
      entidad_id: [''],
      // null representa explícitamente que el político no tiene partido.
      partido_id: [null],
      fecha_inicio_cargo: ['', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      // Información personal opcional.
      lugar_nacimiento: [''],
      fecha_nacimiento: ['', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      // Las URL opcionales deben comenzar por http:// o https://.
      foto_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      twitter_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      instagram_url: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      sitio_web: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
      // Texto libre y estado de publicación del registro.
      bio: [''],
      activo: [true],
    });
  }

  async ngOnInit() {
    // Los dos catálogos son independientes, por lo que se solicitan en paralelo
    // para reducir el tiempo de espera antes de mostrar el formulario.
    [this.cargos, this.partidos] = await Promise.all([
      this.dbService.obtenerCargos(),
      this.dbService.obtenerPartidosSimple(),
    ]);

    if (this.politico) {
      // El cargo actual se consulta aparte porque vive en politicos_cargos y no
      // dentro del registro principal de politicos.
      const cargoActual = await this.dbService.obtenerCargoActualDePolitico(this.politico.id);

      // Se normalizan los campos opcionales para que los controles reciban una
      // cadena vacía o null, en lugar de undefined.
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

  isFieldInvalid(field: string): boolean {
    // Solo se muestra el estado inválido después de que el usuario haya
    // interactuado con el campo, evitando errores visibles al abrir el modal.
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(field: string, error: string): boolean {
    // Permite que la plantilla seleccione un mensaje específico por tipo de error.
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }

  async guardar() {
    // Se bloquea el envío si falta un dato obligatorio o hay una URL/fecha inválida.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.mostrarToast('Por favor completa los campos requeridos correctamente', 'warning');
      return;
    }

    // El componente padre es responsable de persistir los datos. El modal solo
    // devuelve la acción y el payload para mantener separadas ambas tareas.
    const payload = this.form.getRawValue();
    await this.modalController.dismiss({ action: 'guardar', data: payload });
  }

  async cerrar() {
    // Cierra el modal sin enviar cambios al componente padre.
    await this.modalController.dismiss();
  }

  async confirmarEliminar() {
    // Se leen los valores actuales del formulario para construir una confirmación
    // comprensible, incluso si el registro tiene datos incompletos.
    const nombre = this.form.get('nombre')?.value || 'este político';
    const apellido = this.form.get('apellido')?.value || '';

    const alert = await this.alertController.create({
      header: 'Eliminar político',
      message: `¿Seguro que deseas eliminar a ${nombre} ${apellido}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // La eliminación también la ejecuta el componente padre después de
            // recibir esta acción desde el modal.
            await this.modalController.dismiss({ action: 'eliminar', data: this.form.getRawValue() });
          },
        },
      ],
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' = 'warning') {
    // Centraliza los avisos breves de validación para mantener una presentación
    // consistente en todo el formulario.
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}

