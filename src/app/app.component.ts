// Componente raíz: contiene el menú global y el outlet de navegación.
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
  podiumOutline, settingsOutline, colorPaletteOutline,
  sunnyOutline, moonOutline, contrastOutline, checkmarkCircle,
} from 'ionicons/icons';
import { ThemeService, ThemeType, ThemeOption } from './services/theme.service';

addIcons({
  'information-circle-outline': informationCircleOutline,
  'people-outline': peopleOutline,
  'flag-outline': flagOutline,
  'podium-outline': podiumOutline,
  'settings-outline': settingsOutline,
  'color-palette-outline': colorPaletteOutline,
  'sunny-outline': sunnyOutline,
  'moon-outline': moonOutline,
  'contrast-outline': contrastOutline,
  'checkmark-circle': checkmarkCircle,
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
  constructor(public themeService: ThemeService) {}

  get themes(): ThemeOption[] {
    return this.themeService.themes;
  }

  get currentTheme(): ThemeType {
    return this.themeService.currentTheme;
  }

  seleccionarTema(themeId: ThemeType) {
    this.themeService.setTheme(themeId);
  }
}

