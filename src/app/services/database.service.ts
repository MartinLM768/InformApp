import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// ─────────────────────────────────────────────
// Tipos que reflejan el esquema real en Supabase
// ─────────────────────────────────────────────

export interface Politico {
  id: string;                  // uuid
  nombre: string;
  apellido: string;
  foto_url?: string;
  bio?: string;
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  partido_id?: string;
  twitter_url?: string;
  instagram_url?: string;
  sitio_web?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Cargo {
  id: string;
  nombre: string;
  rama: string;
  nivel: string;
  orden: number;
  descripcion?: string;
}

export interface PoliticoCargo {
  id: string;
  politico_id: string;
  cargo_id: string;
  entidad_id?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  es_actual: boolean;
}

export interface PoliticoConCargo {
  id: string;
  nombre: string;
  apellido: string;
  foto_url?: string;
  bio?: string;
  partido_nombre?: string;
  partido_color?: string;
  cargo_nombre?: string;
  cargo_rama?: string;
  entidad_nombre?: string;
}

export interface Partido {
  id: string;
  nombre: string;
  siglas?: string;
  logo_url?: string;
  color_hex?: string;
  ideologia?: string;
  sitio_web?: string;
  activo: boolean;
  cantidad_politicos?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.supabaseAdmin = createClient(environment.supabaseUrl, environment.supabaseServiceKey);
  }

  async initialize(): Promise<void> {
    console.log('Conectado a Supabase');
  }

  // ─────────────────────────────────────────────
  // POLÍTICOS — con join a cargos, partidos y entidades
  // ─────────────────────────────────────────────

  async obtenerPoliticosConDetalle(): Promise<PoliticoConCargo[]> {
    const { data, error } = await this.supabase
      .from('politicos')
      .select(`
        id,
        nombre,
        apellido,
        foto_url,
        bio,
        activo,
        partidos (
          nombre,
          color_hex
        ),
        politicos_cargos (
          es_actual,
          fecha_inicio,
          cargos (
            id,
            nombre,
            rama,
            orden
          ),
          entidades (
            nombre
          )
        )
      `)
      .eq('activo', true)
      .order('apellido', { ascending: true });

    if (error) {
      console.error('Error obteniendo políticos con detalle:', error);
      return [];
    }

    return (data || []).map((p: any) => {
      const cargoActual = (p.politicos_cargos || [])
        .filter((pc: any) => pc.es_actual)
        .sort((a: any, b: any) => (a.cargos?.orden ?? 99) - (b.cargos?.orden ?? 99))[0];

      return {
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        foto_url: p.foto_url,
        bio: p.bio,
        partido_nombre: p.partidos?.nombre,
        partido_color: p.partidos?.color_hex,
        cargo_nombre: cargoActual?.cargos?.nombre,
        cargo_rama: cargoActual?.cargos?.rama,
        entidad_nombre: cargoActual?.entidades?.nombre,
      } as PoliticoConCargo;
    });
  }

  // ─────────────────────────────────────────────
  // CARGOS — para el filtro inteligente
  // ─────────────────────────────────────────────

  async obtenerCargos(): Promise<Cargo[]> {
    const { data, error } = await this.supabase
      .from('cargos')
      .select('id, nombre, rama, nivel, orden, descripcion')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error obteniendo cargos:', error);
      return [];
    }
    return data || [];
  }

  // ─────────────────────────────────────────────
  // PARTIDOS con conteo de políticos
  // ─────────────────────────────────────────────

  async obtenerPartidos(): Promise<Partido[]> {
    const { data, error } = await this.supabase
      .from('partidos')
      .select(`
        id,
        nombre,
        siglas,
        logo_url,
        color_hex,
        ideologia,
        sitio_web,
        activo,
        politicos (id)
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error obteniendo partidos:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      siglas: p.siglas,
      logo_url: p.logo_url,
      color_hex: p.color_hex,
      ideologia: p.ideologia,
      sitio_web: p.sitio_web,
      activo: p.activo,
      cantidad_politicos: (p.politicos || []).length,
    } as Partido));
  }

  // ─────────────────────────────────────────────
  // ADMIN — crear / editar / eliminar
  // ─────────────────────────────────────────────

  async crearPolitico(politico: Omit<Politico, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await this.supabaseAdmin
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

  async actualizarPolitico(id: string, politico: Partial<Politico>): Promise<boolean> {
    const { error } = await this.supabaseAdmin
      .from('politicos')
      .update({ ...politico, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando político:', error);
      return false;
    }
    return true;
  }

  async eliminarPolitico(id: string): Promise<boolean> {
    const { error } = await this.supabaseAdmin
      .from('politicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando político:', error);
      return false;
    }
    return true;
  }

  async asignarCargo(politicoCargo: Omit<PoliticoCargo, 'id'>): Promise<boolean> {
    const { error } = await this.supabaseAdmin
      .from('politicos_cargos')
      .insert(politicoCargo);

    if (error) {
      console.error('Error asignando cargo:', error);
      return false;
    }
    return true;
  }

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────


  async obtenerPartidosSimple(): Promise<{ id: string; nombre: string }[]> {
    const { data, error } = await this.supabase
      .from('partidos')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre', { ascending: true });
    if (error) { console.error('Error obteniendo partidos simples:', error); return []; }
    return data || [];
  }

  async validarUsuario(username: string, password: string): Promise<boolean> {
    const usuarios = [
      { username: 'Martinlm768', password: 'NTRisBAD29' },
      { username: 'Santiago', password: 'squiñones' },
    ];
    return usuarios.some((u) => u.username === username && u.password === password);
  }

  // ─────────────────────────────────────────────
  // Métodos legacy para compatibilidad con componentes existentes
  // ─────────────────────────────────────────────

  async obtenerTodosPoliticos(): Promise<PoliticoConCargo[]> {
    return this.obtenerPoliticosConDetalle();
  }

  async obtenerPoliticosPorCargo(cargoNombre: string): Promise<PoliticoConCargo[]> {
    const todos = await this.obtenerPoliticosConDetalle();
    return todos.filter((p) => p.cargo_nombre === cargoNombre);
  }

  async obtenerPoliticoPorId(id: string): Promise<Politico | null> {
    const { data, error } = await this.supabase
      .from('politicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo político por id:', error);
      return null;
    }
    return data;
  }
}
