import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  ModalController,
} from '@ionic/angular/standalone';
import { Politico } from '../../services/database.service';
import { addIcons } from 'ionicons';
import { closeOutline, call, mail, location } from 'ionicons/icons';

addIcons({
  'close-outline': closeOutline,
  'call-outline': call,
  'mail-outline': mail,
  'location-outline': location,
});

@Component({
  selector: 'app-detalle-politico',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonLabel,
  ],
  templateUrl: './detalle-politico.component.html',
  styleUrls: ['./detalle-politico.component.scss'],
})
export class DetallePoliticoComponent {
  @Input() politico!: Politico;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }
}