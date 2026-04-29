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
  IonMenuButton,
} from '@ionic/angular/standalone';
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
    IonMenuButton,
    RouterLink,
  ]
})
export class IdentidadPage implements OnInit {

  activeTab = 'marca';

  constructor() {}

  ngOnInit() {}
}