// Página de identidad corporativa y acceso a las áreas principales de InformApp.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';

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
    IonButtons,
    IonMenuButton,
  ]
})
export class IdentidadPage implements OnInit {

  activeTab = 'marca';

  constructor() {}

  ngOnInit() {}
}