import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
  IonFooter, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline, peopleOutline, flagOutline,
  podiumOutline, settingsOutline,
} from 'ionicons/icons';

addIcons({
  'information-circle-outline': informationCircleOutline,
  'people-outline': peopleOutline,
  'flag-outline': flagOutline,
  'podium-outline': podiumOutline,
  'settings-outline': settingsOutline,
});

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
    IonFooter, IonBadge,
  ],
})
export class AppComponent {
  constructor() {}
}
