import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService, PoliticoConCargo, Cargo } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class PoliticosService {
  private politicosSubject = new BehaviorSubject<PoliticoConCargo[]>([]);
  politicos$: Observable<PoliticoConCargo[]> = this.politicosSubject.asObservable();

  constructor(private dbService: DatabaseService) {
    this.cargarPoliticos();
  }

  async cargarPoliticos(): Promise<void> {
    try {
      const politicos = await this.dbService.obtenerPoliticosConDetalle();
      this.politicosSubject.next(politicos);
    } catch (error) {
      console.error('Error cargando políticos:', error);
    }
  }

  async obtenerPoliticos(): Promise<PoliticoConCargo[]> {
    return this.dbService.obtenerPoliticosConDetalle();
  }

  async obtenerPorCargo(cargoNombre: string): Promise<PoliticoConCargo[]> {
    return this.dbService.obtenerPoliticosPorCargo(cargoNombre);
  }

  async obtenerCargos(): Promise<Cargo[]> {
    return this.dbService.obtenerCargos();
  }

  obtenerPoliticosActuales(): PoliticoConCargo[] {
    return this.politicosSubject.value;
  }
}
