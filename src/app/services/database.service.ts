import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Politico {
  id?: number;
  nombre: string;
  apellido: string;
  cargo: string;
  partido: string;
  departamento?: string;
  foto_url?: string;
  bio?: string;
  email?: string;
  telefono?: string;
  fecha_inicio?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async initialize(): Promise<void> {
    // Supabase no necesita inicialización local
    console.log('Conectado a Supabase');
  }

  async obtenerTodosPoliticos(): Promise<Politico[]> {
    const { data, error } = await this.supabase
      .from('politicos')
      .select('*')
      .order('orden_cargo', { ascending: true})
      .order('apellido', { ascending: true });

    if (error) {
      console.error('Error obteniendo políticos:', error);
      return [];
    }
    return data || [];
  }

  async obtenerPoliticosPorCargo(cargo: string): Promise<Politico[]> {
    const { data, error } = await this.supabase
      .from('politicos')
      .select('*')
      .eq('cargo', cargo)
      .order('apellido', { ascending: true });

    if (error) {
      console.error('Error filtrando políticos:', error);
      return [];
    }
    return data || [];
  }

  async obtenerPoliticoPorId(id: number): Promise<Politico | null> {
    const { data, error } = await this.supabase
      .from('politicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo político:', error);
      return null;
    }
    return data;
  }

  async crearPolitico(politico: Politico): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('politicos')
      .insert(politico)
      .select('id')
      .single();

    if (error) {
      console.error('Error creando político:', error);
      return null;
    }
    return data?.id || null;
  }

  async actualizarPolitico(id: number, politico: Partial<Politico>): Promise<boolean> {
    const { error } = await this.supabase
      .from('politicos')
      .update({ ...politico, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando político:', error);
      return false;
    }
    return true;
  }

  async eliminarPolitico(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('politicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando político:', error);
      return false;
    }
    return true;
  }

  async validarUsuario(username: string, password: string): Promise<boolean> {
    // Por ahora validación simple, luego se puede migrar a Supabase Auth
    return username === 'admin' && password === 'admin123';
  }
}