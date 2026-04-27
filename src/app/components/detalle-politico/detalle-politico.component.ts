import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent,
  IonChip, IonLabel, ModalController,
} from '@ionic/angular/standalone';
import { PoliticoConCargo } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, call, mail, location, globeOutline, logoTwitter, logoInstagram } from 'ionicons/icons';

addIcons({
  'close-outline': closeOutline,
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
    IonCardHeader, IonCardTitle, IonCardContent,
    IonChip, IonLabel,
  ],
  templateUrl: './detalle-politico.component.html',
  styleUrls: ['./detalle-politico.component.scss'],
})
export class DetallePoliticoComponent {
  @Input() politico!: PoliticoConCargo;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }
}
