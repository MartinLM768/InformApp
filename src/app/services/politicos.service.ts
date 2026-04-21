import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService, Politico } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class PoliticosService {
  private politicosSubject = new BehaviorSubject<Politico[]>([]);
  politicos$: Observable<Politico[]> = this.politicosSubject.asObservable();

  private cargosDefinidos = [
    'Presidente',
    'Vicepresidente',
    'Senador',
    'Representante',
  ];

  constructor(private dbService: DatabaseService) {
    this.cargarPoliticos();
  }

  async cargarPoliticos(): Promise<void> {
    try {
      const politicos = await this.dbService.obtenerTodosPoliticos();
      this.politicosSubject.next(politicos);
    } catch (error) {
      console.error('Error cargando políticos:', error);
    }
  }

  async obtenerPoliticos(): Promise<Politico[]> {
    return await this.dbService.obtenerTodosPoliticos();
  }

  async obtenerPorCargo(cargo: string): Promise<Politico[]> {
    return await this.dbService.obtenerPoliticosPorCargo(cargo);
  }

  async obtenerPorId(id: number): Promise<Politico | null> {
    return await this.dbService.obtenerPoliticoPorId(id);
  }

  async crear(politico: Politico): Promise<number | null> {
    const id = await this.dbService.crearPolitico(politico);
    if (id) {
      await this.cargarPoliticos();
    }
    return id;
  }

  async actualizar(id: number, politico: Politico): Promise<boolean> {
    const success = await this.dbService.actualizarPolitico(id, politico);
    if (success) {
      await this.cargarPoliticos();
    }
    return success;
  }

  async eliminar(id: number): Promise<boolean> {
    const success = await this.dbService.eliminarPolitico(id);
    if (success) {
      await this.cargarPoliticos();
    }
    return success;
  }

  getCargosDefinidos(): string[] {
    return [...this.cargosDefinidos];
  }

  obtenerPoliticosActuales(): Politico[] {
    return this.politicosSubject.value;
  }
}