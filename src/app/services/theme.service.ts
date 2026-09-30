import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Conserva el tema elegido y lo refleja en las variables CSS globales.
export type ThemeType = 'claro' | 'azul' | 'carbon';

export interface ThemeOption {
  id: ThemeType;
  nombre: string;
  subtitulo: string;
  icono: string;
  bgHex: string;
  textColor: string;
  accentColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'informapp_selected_theme';

  readonly themes: ThemeOption[] = [
    {
      id: 'claro',
      nombre: 'Fondo Claro',
      subtitulo: 'Blanco Pergamino',
      icono: 'sunny-outline',
      bgHex: '#F8F5EE',
      textColor: '#0A2342',
      accentColor: '#C8102E',
    },
    {
      id: 'azul',
      nombre: 'Fondo Oscuro',
      subtitulo: 'Azul Patria',
      icono: 'contrast-outline',
      bgHex: '#0A2342',
      textColor: '#FFFFFF',
      accentColor: '#C8102E',
    },
    {
      id: 'carbon',
      nombre: 'Fondo Negro',
      subtitulo: 'Carbón Noche',
      icono: 'moon-outline',
      bgHex: '#1A1A1A',
      textColor: '#FFFFFF',
      accentColor: '#C8102E',
    },
  ];

  private currentThemeSubject = new BehaviorSubject<ThemeType>('claro');
  currentTheme$: Observable<ThemeType> = this.currentThemeSubject.asObservable();

  constructor() {
    this.inicializarTema();
  }

  get currentTheme(): ThemeType {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: ThemeType) {
    this.currentThemeSubject.next(theme);
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de tema en localStorage', e);
    }
    this.aplicarTemaAlDOM(theme);
  }

  private inicializarTema() {
    let savedTheme: ThemeType = 'claro';
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeType;
      if (stored === 'claro' || stored === 'azul' || stored === 'carbon') {
        savedTheme = stored;
      }
    } catch (e) {
      console.warn('Error al leer el tema almacenado', e);
    }

    this.currentThemeSubject.next(savedTheme);
    this.aplicarTemaAlDOM(savedTheme);
  }

  private aplicarTemaAlDOM(theme: ThemeType) {
    const body = document.body;
    body.classList.remove('theme-claro', 'theme-azul', 'theme-carbon');
    body.classList.add(`theme-${theme}`);

    // Sincronizar atributo data-theme en html
    document.documentElement.setAttribute('data-theme', theme);
  }
}
