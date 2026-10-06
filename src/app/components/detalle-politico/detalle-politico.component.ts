// Modal de consulta que presenta el perfil completo de un político.
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonCard,
  IonCardContent,
  IonChip, IonLabel, ModalController,
} from '@ionic/angular/standalone';
import { PoliticoConCargo } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, call, mail, location, globeOutline, logoTwitter, logoInstagram, searchOutline } from 'ionicons/icons';

addIcons({
  'close-outline': closeOutline,
  'search-outline': searchOutline,
  'call-outline': call,
  'mail-outline': mail,
  'location-outline': location,
  'globe-outline': globeOutline,
  'logo-twitter': logoTwitter,
  'logo-instagram': logoInstagram,
});

@Component({
  selector: 'app-detalle-politico',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon, IonCard,
    IonCardContent,
    IonChip, IonLabel,
  ],
  templateUrl: './detalle-politico.component.html',
  styleUrls: ['./detalle-politico.component.scss'],
})
export class DetallePoliticoComponent {
  @Input() politico!: PoliticoConCargo;
  fotoAmpliada = false;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }

  abrirFotoAmpliada() {
    this.fotoAmpliada = true;
  }

  cerrarFotoAmpliada() {
    this.fotoAmpliada = false;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('avatar-placeholder.svg')) {
      img.src = 'assets/avatar-placeholder.svg';
    }
  }
}
