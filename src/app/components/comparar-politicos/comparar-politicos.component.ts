// Modal que compara la información visible de dos políticos seleccionados.
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, gitCompareOutline, arrowBackOutline } from 'ionicons/icons';
import { PoliticoConCargo } from '../../services/database.service';

addIcons({
  'close-outline': closeOutline,
  'git-compare-outline': gitCompareOutline,
  'arrow-back-outline': arrowBackOutline,
});

@Component({
  selector: 'app-comparar-politicos',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './comparar-politicos.component.html',
  styleUrls: ['./comparar-politicos.component.scss'],
})
export class CompararPoliticosComponent {
  @Input() politico!: PoliticoConCargo;
  @Input() politicos: PoliticoConCargo[] = [];

  seleccionado: PoliticoConCargo | null = null;

  constructor(private modalController: ModalController) {}

  get opciones(): PoliticoConCargo[] {
    return this.politicos.filter(politico => politico.id !== this.politico.id);
  }

  seleccionar(politico: PoliticoConCargo) {
    this.seleccionado = politico;
  }

  volverASeleccion() {
    this.seleccionado = null;
  }

  cerrar() {
    this.modalController.dismiss();
  }

  iniciales(politico: PoliticoConCargo): string {
    return `${politico.nombre.charAt(0)}${politico.apellido.charAt(0)}`.toUpperCase();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('avatar-placeholder.svg')) {
      img.src = 'assets/avatar-placeholder.svg';
    }
  }
}
