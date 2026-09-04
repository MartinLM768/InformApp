// Servicio de gestión de políticos: actúa como intermediario (store) entre la base de datos y los componentes
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService, PoliticoConCargo, Cargo } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class PoliticosService {
  // Estado centralizado para almacenar la lista de políticos y permitir reactividad
  private politicosSubject = new BehaviorSubject<PoliticoConCargo[]>([]);
  politicos$: Observable<PoliticoConCargo[]> = this.politicosSubject.asObservable();

  constructor(private dbService: DatabaseService) {
    // Carga inicial de datos al instanciar el servicio
    this.cargarPoliticos();
  }

  // Obtiene los datos de la base de datos y actualiza el Subject reactivo
  async cargarPoliticos(): Promise<void> {
    try {
      const politicos = await this.dbService.obtenerPoliticosConDetalle();
      this.politicosSubject.next(politicos);
    } catch (error) {
      console.error('Error cargando políticos:', error);
    }
  }

  // Método directo para obtener políticos frescos de la DB
  async obtenerPoliticos(): Promise<PoliticoConCargo[]> {
    return this.dbService.obtenerPoliticosConDetalle();
  }

  // Filtra políticos por nombre de cargo usando el servicio de base de datos
  async obtenerPorCargo(cargoNombre: string): Promise<PoliticoConCargo[]> {
    return this.dbService.obtenerPoliticosPorCargo(cargoNombre);
  }

  // Recupera la lista de cargos disponibles
  async obtenerCargos(): Promise<Cargo[]> {
    return this.dbService.obtenerCargos();
  }

  // Devuelve el valor actual de los políticos ya cargados en el estado local
  obtenerPoliticosActuales(): PoliticoConCargo[] {
    return this.politicosSubject.value;
  }
}
