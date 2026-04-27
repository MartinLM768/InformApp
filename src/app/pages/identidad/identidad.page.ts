import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonBadge,
  IonLabel,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVerticalOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-identidad',
  templateUrl: './identidad.page.html',
  styleUrls: ['./identidad.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonBadge,
    IonLabel,
    IonList,
    IonItem,
    RouterLink,
  ]
})
export class IdentidadPage implements OnInit {

  activeTab = 'marca';

  constructor() {
    addIcons({ ellipsisVerticalOutline });
  }

  ngOnInit() {}
}