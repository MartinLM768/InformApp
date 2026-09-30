// Servicio de base de datos: gestiona la conexión con Supabase y las operaciones CRUD para políticos, partidos, cargos y candidatos
import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js';
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
  fecha_nacimiento?: string;
  lugar_nacimiento?: string;
  sitio_web?: string;
  twitter_url?: string;
  instagram_url?: string;
  partido_id?: string;
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

export interface Candidato {
  id: string;
  nombre: string;
  apellido: string;
  foto_url?: string;
  vicepresidente_nombre?: string;
  vicepresidente_apellido?: string;
  foto_vicepresidente_url?: string;
  partido_id?: string;
  bio?: string;
  propuesta_clave?: string;
  sitio_web?: string;
  twitter_url?: string;
  instagram_url?: string;
  activo: boolean;
  // Campos del join con partidos
  partido_nombre?: string;
  partido_siglas?: string;
  partido_color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Cliente público de Supabase (usa sesión del usuario autenticado).
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async initialize(): Promise<void> {
    console.log('Conectado a Supabase');
  }

  // ─────────────────────────────────────────────
  // POLÍTICOS — con join a cargos, partidos y entidades
  // ─────────────────────────────────────────────

  async obtenerPoliticosConDetalle(): Promise<PoliticoConCargo[]> {
    // Consulta los políticos activos incluyendo datos de partidos y cargos actuales
    const { data, error } = await this.supabase
      .from('politicos')
      .select(`
        id,
        nombre,
        apellido,
        foto_url,
        bio,
        fecha_nacimiento,
        lugar_nacimiento,
        sitio_web,
        twitter_url,
        instagram_url,
        activo,
        partido_id,
        partidos!politicos_partido_id_fkey (
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

    // Mapeo y procesamiento de los datos recibidos (cálculo de cargo actual)
    const politicos = (data || []).map((p: any) => {
      const cargoActual = (p.politicos_cargos || [])
        .filter((pc: any) => pc.es_actual)
        .sort((a: any, b: any) => (a.cargos?.orden ?? 99) - (b.cargos?.orden ?? 99))[0];

      return {
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        foto_url: p.foto_url,
        bio: p.bio,
        fecha_nacimiento: p.fecha_nacimiento,
        lugar_nacimiento: p.lugar_nacimiento,
        sitio_web: p.sitio_web,
        twitter_url: p.twitter_url,
        instagram_url: p.instagram_url,
        partido_id: p.partido_id,
        partido_nombre: p.partidos?.nombre,
        partido_color: p.partidos?.color_hex,
        cargo_nombre: cargoActual?.cargos?.nombre,
        cargo_rama: cargoActual?.cargos?.rama,
        cargo_orden: cargoActual?.cargos?.orden ?? 999,
        entidad_nombre: cargoActual?.entidades?.nombre,
      };
    });

    // Ordenamiento final de los políticos procesados
    return politicos.sort((a: any, b: any) => {
      if (a.cargo_orden !== b.cargo_orden) return a.cargo_orden - b.cargo_orden;
      return a.apellido.localeCompare(b.apellido, 'es');
    }) as PoliticoConCargo[];
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
        politicos!politicos_partido_id_fkey (id)
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
  // Nota: estas escrituras dependen de sesión autenticada y políticas RLS
  // configuradas en Supabase para permitir operaciones administrativas.

  async crearPolitico(politico: Omit<Politico, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const camposLimpios: any = {};
    for (const [key, value] of Object.entries(politico)) {
      if (value === '' || value === undefined) {
        camposLimpios[key] = null;
      } else {
        camposLimpios[key] = value;
      }
    }

    console.log('[DB] Creando político', camposLimpios);

    const { data, error } = await this.supabase
      .from('politicos')
      .insert(camposLimpios)
      .select('id')
      .single();

    if (error) {
      console.error('Error creando político:', error);
      return null;
    }
    return data?.id || null;
  }

  async actualizarPolitico(id: string, politico: Partial<Politico>): Promise<boolean> {
    const { id: _id, created_at, updated_at, ...campos } = politico as any;

    const camposLimpios: any = {};
    for (const [key, value] of Object.entries(campos)) {
      if (value === '' || value === undefined) {
        camposLimpios[key] = null;
      } else {
        camposLimpios[key] = value;
      }
    }

    console.log('[DB] Actualizando político', id, camposLimpios);

    const { data, error } = await this.supabase
      .from('politicos')
      .update(camposLimpios)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[DB] Error actualizando político:', JSON.stringify(error));
      return false;
    }

    console.log('[DB] Político actualizado:', data);
    return true;
  }

  async eliminarPolitico(id: string): Promise<boolean> {
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

  async asignarCargo(politicoCargo: Omit<PoliticoCargo, 'id'>): Promise<boolean> {
    const { error } = await this.supabase
      .from('politicos_cargos')
      .insert(politicoCargo);

    if (error) {
      console.error('Error asignando cargo:', error);
      return false;
    }
    return true;
  }

  async actualizarOAsignarCargo(politicoCargo: Omit<PoliticoCargo, 'id'>): Promise<boolean> {
    // Marcar cargos anteriores como no actuales
    await this.supabase
      .from('politicos_cargos')
      .update({ es_actual: false })
      .eq('politico_id', politicoCargo.politico_id)
      .eq('es_actual', true);

    // Insertar el nuevo cargo actual
    const { error } = await this.supabase
      .from('politicos_cargos')
      .insert({ ...politicoCargo, es_actual: true });

    if (error) {
      console.error('Error actualizando cargo:', JSON.stringify(error));
      return false;
    }
    return true;
  }

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────

  async signInWithPassword(email: string, password: string): Promise<boolean> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error autenticando en Supabase Auth:', error);
      return false;
    }
    return true;
  }

  async signOut(): Promise<boolean> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error cerrando sesión en Supabase Auth:', error);
      return false;
    }
    return true;
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async obtenerPartidosSimple(): Promise<{ id: string; nombre: string }[]> {
    const { data, error } = await this.supabase
      .from('partidos')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre', { ascending: true });
    if (error) { console.error('Error obteniendo partidos simples:', error); return []; }
    return data || [];
  }

  async crearPartido(partido: Omit<Partido, 'id' | 'cantidad_politicos'>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('partidos').insert(partido).select('id').single();
    if (error) { console.error('Error creando partido:', error); return null; }
    return data?.id || null;
  }

  async actualizarPartido(id: string, partido: Partial<Omit<Partido, 'id' | 'cantidad_politicos'>>): Promise<boolean> {
    const { error } = await this.supabase
      .from('partidos').update(partido).eq('id', id);
    if (error) { console.error('Error actualizando partido:', JSON.stringify(error)); return false; }
    return true;
  }

  async eliminarPartido(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('partidos').delete().eq('id', id);
    if (error) { console.error('Error eliminando partido:', error); return false; }
    return true;
  }

  // ─────────────────────────────────────────────
  // CANDIDATOS
  // ─────────────────────────────────────────────

  async obtenerCandidatos(): Promise<Candidato[]> {
    const { data, error } = await this.supabase
      .from('candidatos')
      .select(`
        id, nombre, apellido, foto_url,
        vicepresidente_nombre, vicepresidente_apellido, foto_vicepresidente_url,
        partido_id, bio, propuesta_clave,
        sitio_web, twitter_url, instagram_url, activo,
        partidos!candidatos_partido_id_fkey (
          nombre, siglas, color_hex
        )
      `)
      .eq('activo', true)
      .order('apellido', { ascending: true });

    if (error) { console.error('Error obteniendo candidatos:', error); return []; }

    return (data || []).map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      apellido: c.apellido,
      foto_url: c.foto_url,
      vicepresidente_nombre: c.vicepresidente_nombre,
      vicepresidente_apellido: c.vicepresidente_apellido,
      foto_vicepresidente_url: c.foto_vicepresidente_url,
      partido_id: c.partido_id,
      bio: c.bio,
      propuesta_clave: c.propuesta_clave,
      sitio_web: c.sitio_web,
      twitter_url: c.twitter_url,
      instagram_url: c.instagram_url,
      activo: c.activo,
      partido_nombre: c.partidos?.nombre,
      partido_siglas: c.partidos?.siglas,
      partido_color: c.partidos?.color_hex,
    } as Candidato));
  }

  async crearCandidato(candidato: Omit<Candidato, 'id' | 'partido_nombre' | 'partido_siglas' | 'partido_color'>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('candidatos').insert(candidato).select('id').single();
    if (error) { console.error('Error creando candidato:', error); return null; }
    return data?.id || null;
  }

  async actualizarCandidato(id: string, candidato: Partial<Candidato>): Promise<boolean> {
    const { partido_nombre, partido_siglas, partido_color, id: _id, ...campos } = candidato as any;
    const camposLimpios: any = {};
    for (const [k, v] of Object.entries(campos)) {
      camposLimpios[k] = (v === '' || v === undefined) ? null : v;
    }
    const { error } = await this.supabase
      .from('candidatos').update(camposLimpios).eq('id', id);
    if (error) { console.error('Error actualizando candidato:', JSON.stringify(error)); return false; }
    return true;
  }

  async eliminarCandidato(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('candidatos').delete().eq('id', id);
    if (error) { console.error('Error eliminando candidato:', error); return false; }
    return true;
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

  async obtenerCargoActualDePolitico(politico_id: string): Promise<{ cargo_id: string; entidad_id: string; fecha_inicio: string } | null> {
    const { data, error } = await this.supabase
      .from('politicos_cargos')
      .select('cargo_id, entidad_id, fecha_inicio')
      .eq('politico_id', politico_id)
      .eq('es_actual', true)
      .order('fecha_inicio', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No hay cargo actual — no es un error crítico
      return null;
    }
    return data;
  }
}
