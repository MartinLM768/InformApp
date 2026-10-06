// Servicio de base de datos: centraliza Supabase y las operaciones CRUD de la aplicación.
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
  private supabase!: SupabaseClient;
  private supabaseAdmin!: SupabaseClient;
  private readonly modoLocal = environment.useLocalData;
  private politicosLocales: Politico[] = [];
  private partidosLocales: Partido[] = [];
  private candidatosLocales: Candidato[] = [];
  private cargosLocales: Cargo[] = [];
  private cargosPoliticosLocales: PoliticoCargo[] = [];

  constructor() {
    if (!this.modoLocal) {
      // Inicialización de Supabase solo cuando la aplicación está en modo remoto.
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
      this.supabaseAdmin = createClient(environment.supabaseUrl, environment.supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: 'supabase-admin-key',
        },
        global: { headers: { Authorization: `Bearer ${environment.supabaseServiceKey}` } },
      });
    }
    this.inicializarDatosLocales();
  }

  async initialize(): Promise<void> {
    console.log(this.modoLocal ? 'Usando datos locales para la demostración' : 'Conectado a Supabase');
  }

  private inicializarDatosLocales(): void {
    const leer = <T>(clave: string, inicial: T): T => {
      const guardado = localStorage.getItem(clave);
      if (!guardado) {
        localStorage.setItem(clave, JSON.stringify(inicial));
        return inicial;
      }
      try {
        return JSON.parse(guardado) as T;
      } catch {
        localStorage.setItem(clave, JSON.stringify(inicial));
        return inicial;
      }
    };

    this.partidosLocales = leer<Partido[]>('informapp_partidos_locales', [
      { id: 'partido-alianza', nombre: 'Alianza Democrática', siglas: 'AD', color_hex: '#0B7285', ideologia: 'Centro reformista', activo: true },
      { id: 'partido-progreso', nombre: 'Movimiento Progreso', siglas: 'MP', color_hex: '#E8590C', ideologia: 'Progresismo', activo: true },
    ]);
    this.cargosLocales = leer<Cargo[]>('informapp_cargos_locales', [
      { id: 'cargo-presidente', nombre: 'Presidente', rama: 'Ejecutiva', nivel: 'Nacional', orden: 1, descripcion: 'Máxima autoridad del Poder Ejecutivo' },
      { id: 'cargo-gobernador', nombre: 'Gobernador', rama: 'Ejecutiva', nivel: 'Regional', orden: 2, descripcion: 'Autoridad ejecutiva regional' },
      { id: 'cargo-alcalde', nombre: 'Alcalde', rama: 'Ejecutiva', nivel: 'Municipal', orden: 3, descripcion: 'Autoridad ejecutiva municipal' },
    ]);
    this.politicosLocales = leer<Politico[]>('informapp_politicos_locales', [
      { id: 'politico-maria', nombre: 'María', apellido: 'González', partido_id: 'partido-alianza', bio: 'Servidora pública con experiencia en gestión social.', activo: true },
      { id: 'politico-carlos', nombre: 'Carlos', apellido: 'Ramírez', partido_id: 'partido-progreso', bio: 'Economista y representante regional.', activo: true },
      { id: 'politico-ana', nombre: 'Ana', apellido: 'Torres', partido_id: 'partido-alianza', bio: 'Abogada especializada en políticas públicas.', activo: true },
    ]);
    this.candidatosLocales = leer<Candidato[]>('informapp_candidatos_locales', [
      { id: 'candidato-lucia', nombre: 'Lucía', apellido: 'Mendoza', vicepresidente_nombre: 'Jorge', vicepresidente_apellido: 'Pérez', partido_id: 'partido-alianza', propuesta_clave: 'Transparencia y participación ciudadana.', activo: true },
      { id: 'candidato-diego', nombre: 'Diego', apellido: 'Santos', vicepresidente_nombre: 'Elena', vicepresidente_apellido: 'Rojas', partido_id: 'partido-progreso', propuesta_clave: 'Empleo y desarrollo regional.', activo: true },
    ]);
    this.cargosPoliticosLocales = leer<PoliticoCargo[]>('informapp_cargos_politicos_locales', [
      { id: 'relacion-maria', politico_id: 'politico-maria', cargo_id: 'cargo-presidente', fecha_inicio: '2024-01-01', es_actual: true },
      { id: 'relacion-carlos', politico_id: 'politico-carlos', cargo_id: 'cargo-gobernador', fecha_inicio: '2023-06-15', es_actual: true },
      { id: 'relacion-ana', politico_id: 'politico-ana', cargo_id: 'cargo-alcalde', fecha_inicio: '2025-01-01', es_actual: true },
    ]);
  }

  private guardarDatosLocales(): void {
    localStorage.setItem('informapp_partidos_locales', JSON.stringify(this.partidosLocales));
    localStorage.setItem('informapp_politicos_locales', JSON.stringify(this.politicosLocales));
    localStorage.setItem('informapp_candidatos_locales', JSON.stringify(this.candidatosLocales));
    localStorage.setItem('informapp_cargos_politicos_locales', JSON.stringify(this.cargosPoliticosLocales));
  }

  private nombrePartido(partidoId?: string): Partido | undefined {
    return this.partidosLocales.find((partido) => partido.id === partidoId);
  }

  private detallePolitico(politico: Politico): PoliticoConCargo {
    const relacion = this.cargosPoliticosLocales
      .filter((item) => item.politico_id === politico.id && item.es_actual)
      .sort((a, b) => (this.cargosLocales.find((cargo) => cargo.id === a.cargo_id)?.orden ?? 999) - (this.cargosLocales.find((cargo) => cargo.id === b.cargo_id)?.orden ?? 999))[0];
    const cargo = this.cargosLocales.find((item) => item.id === relacion?.cargo_id);
    const partido = this.nombrePartido(politico.partido_id);
    return { ...politico, partido_nombre: partido?.nombre, partido_color: partido?.color_hex, cargo_nombre: cargo?.nombre, cargo_rama: cargo?.rama, entidad_nombre: undefined };
  }

  private detalleCandidato(candidato: Candidato): Candidato {
    const partido = this.nombrePartido(candidato.partido_id);
    return { ...candidato, partido_nombre: partido?.nombre, partido_siglas: partido?.siglas, partido_color: partido?.color_hex };
  }

  // ─────────────────────────────────────────────
  // POLÍTICOS — con join a cargos, partidos y entidades
  // ─────────────────────────────────────────────

  async obtenerPoliticosConDetalle(): Promise<PoliticoConCargo[]> {
    if (this.modoLocal) {
      return this.politicosLocales
        .filter((politico) => politico.activo)
        .map((politico) => this.detallePolitico(politico))
        .sort((a, b) => (a.cargo_nombre || '').localeCompare(b.cargo_nombre || '') || a.apellido.localeCompare(b.apellido, 'es'));
    }
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
      return this.politicosLocales.filter((politico) => politico.activo).map((politico) => this.detallePolitico(politico));
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
    if (this.modoLocal) return [...this.cargosLocales].sort((a, b) => a.orden - b.orden);
    const { data, error } = await this.supabase
      .from('cargos')
      .select('id, nombre, rama, nivel, orden, descripcion')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error obteniendo cargos:', error);
      return [...this.cargosLocales].sort((a, b) => a.orden - b.orden);
    }
    return data || [];
  }

  // ─────────────────────────────────────────────
  // PARTIDOS con conteo de políticos
  // ─────────────────────────────────────────────

  async obtenerPartidos(): Promise<Partido[]> {
    if (this.modoLocal) {
      return this.partidosLocales.map((partido) => ({
        ...partido,
        cantidad_politicos: this.politicosLocales.filter((politico) => politico.partido_id === partido.id && politico.activo).length,
      }));
    }
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
      return this.partidosLocales.map((partido) => ({
        ...partido,
        cantidad_politicos: this.politicosLocales.filter((politico) => politico.partido_id === partido.id && politico.activo).length,
      }));
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
    if (this.modoLocal) {
      const id = `politico-${Date.now()}`;
      this.politicosLocales.push({ ...politico, id });
      this.guardarDatosLocales();
      return id;
    }
    const camposLimpios: any = {};
    for (const [key, value] of Object.entries(politico)) {
      if (value === '' || value === undefined) {
        camposLimpios[key] = null;
      } else {
        camposLimpios[key] = value;
      }
    }

    console.log('[DB] Creando político', camposLimpios);

    const { data, error } = await this.supabaseAdmin
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
    if (this.modoLocal) {
      const indice = this.politicosLocales.findIndex((item) => item.id === id);
      if (indice < 0) return false;
      this.politicosLocales[indice] = { ...this.politicosLocales[indice], ...politico, id };
      this.guardarDatosLocales();
      return true;
    }
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

    const { data, error } = await this.supabaseAdmin
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
    if (this.modoLocal) {
      this.politicosLocales = this.politicosLocales.filter((item) => item.id !== id);
      this.cargosPoliticosLocales = this.cargosPoliticosLocales.filter((item) => item.politico_id !== id);
      this.guardarDatosLocales();
      return true;
    }
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

  async actualizarOAsignarCargo(politicoCargo: Omit<PoliticoCargo, 'id'>): Promise<boolean> {
    if (this.modoLocal) {
      this.cargosPoliticosLocales = this.cargosPoliticosLocales
        .map((item) => item.politico_id === politicoCargo.politico_id ? { ...item, es_actual: false } : item);
      this.cargosPoliticosLocales.push({ ...politicoCargo, id: `relacion-${Date.now()}` });
      this.guardarDatosLocales();
      return true;
    }
    // Marcar cargos anteriores como no actuales
    await this.supabaseAdmin
      .from('politicos_cargos')
      .update({ es_actual: false })
      .eq('politico_id', politicoCargo.politico_id)
      .eq('es_actual', true);

    // Insertar el nuevo cargo actual
    const { error } = await this.supabaseAdmin
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

  async obtenerPartidosSimple(): Promise<{ id: string; nombre: string }[]> {
    if (this.modoLocal) {
      return this.partidosLocales.filter((partido) => partido.activo).map(({ id, nombre }) => ({ id, nombre }));
    }
    const { data, error } = await this.supabase
      .from('partidos')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre', { ascending: true });
    if (error) {
      console.error('Error obteniendo partidos simples:', error);
      return this.partidosLocales.filter((partido) => partido.activo).map(({ id, nombre }) => ({ id, nombre }));
    }
    return data || [];
  }

  async crearPartido(partido: Omit<Partido, 'id' | 'cantidad_politicos'>): Promise<string | null> {
    if (this.modoLocal) {
      const id = `partido-${Date.now()}`;
      this.partidosLocales.push({ ...partido, id });
      this.guardarDatosLocales();
      return id;
    }
    const { data, error } = await this.supabaseAdmin
      .from('partidos').insert(partido).select('id').single();
    if (error) { console.error('Error creando partido:', error); return null; }
    return data?.id || null;
  }

  async actualizarPartido(id: string, partido: Partial<Omit<Partido, 'id' | 'cantidad_politicos'>>): Promise<boolean> {
    if (this.modoLocal) {
      const indice = this.partidosLocales.findIndex((item) => item.id === id);
      if (indice < 0) return false;
      this.partidosLocales[indice] = { ...this.partidosLocales[indice], ...partido, id };
      this.guardarDatosLocales();
      return true;
    }
    const { error } = await this.supabaseAdmin
      .from('partidos').update(partido).eq('id', id);
    if (error) { console.error('Error actualizando partido:', JSON.stringify(error)); return false; }
    return true;
  }

  async eliminarPartido(id: string): Promise<boolean> {
    if (this.modoLocal) {
      this.partidosLocales = this.partidosLocales.filter((item) => item.id !== id);
      this.guardarDatosLocales();
      return true;
    }
    const { error } = await this.supabaseAdmin
      .from('partidos').delete().eq('id', id);
    if (error) { console.error('Error eliminando partido:', error); return false; }
    return true;
  }

  async validarUsuario(username: string, password: string): Promise<boolean> {
    // Validación local simple, recomendable migrar a autenticación en Supabase
    const usuarios = [
      { username: 'Martinlm768', password: 'NTRisBAD29' },
      { username: 'Santiago', password: 'squiñones' },
      { username: 'btejada', password: '12282958' },
    ];
    return usuarios.some((u) => u.username === username && u.password === password);
  }

  // ─────────────────────────────────────────────
  // CANDIDATOS
  // ─────────────────────────────────────────────

  async obtenerCandidatos(): Promise<Candidato[]> {
    if (this.modoLocal) {
      return this.candidatosLocales
        .filter((candidato) => candidato.activo)
        .map((candidato) => this.detalleCandidato(candidato))
        .sort((a, b) => a.apellido.localeCompare(b.apellido, 'es'));
    }
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

    if (error) {
      console.error('Error obteniendo candidatos:', error);
      return this.candidatosLocales.filter((candidato) => candidato.activo).map((candidato) => this.detalleCandidato(candidato));
    }

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
    if (this.modoLocal) {
      const id = `candidato-${Date.now()}`;
      this.candidatosLocales.push({ ...candidato, id });
      this.guardarDatosLocales();
      return id;
    }
    const { data, error } = await this.supabaseAdmin
      .from('candidatos').insert(candidato).select('id').single();
    if (error) { console.error('Error creando candidato:', error); return null; }
    return data?.id || null;
  }

  async actualizarCandidato(id: string, candidato: Partial<Candidato>): Promise<boolean> {
    if (this.modoLocal) {
      const indice = this.candidatosLocales.findIndex((item) => item.id === id);
      if (indice < 0) return false;
      this.candidatosLocales[indice] = { ...this.candidatosLocales[indice], ...candidato, id };
      this.guardarDatosLocales();
      return true;
    }
    const { partido_nombre, partido_siglas, partido_color, id: _id, ...campos } = candidato as any;
    const camposLimpios: any = {};
    for (const [k, v] of Object.entries(campos)) {
      camposLimpios[k] = (v === '' || v === undefined) ? null : v;
    }
    const { error } = await this.supabaseAdmin
      .from('candidatos').update(camposLimpios).eq('id', id);
    if (error) { console.error('Error actualizando candidato:', JSON.stringify(error)); return false; }
    return true;
  }

  async eliminarCandidato(id: string): Promise<boolean> {
    if (this.modoLocal) {
      this.candidatosLocales = this.candidatosLocales.filter((item) => item.id !== id);
      this.guardarDatosLocales();
      return true;
    }
    const { error } = await this.supabaseAdmin.from('candidatos').delete().eq('id', id);
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
    if (this.modoLocal) return this.politicosLocales.find((politico) => politico.id === id) || null;
    const { data, error } = await this.supabase
      .from('politicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo político por id:', error);
      return this.politicosLocales.find((politico) => politico.id === id) || null;
    }
    return data;
  }

  async obtenerCargoActualDePolitico(politico_id: string): Promise<{ cargo_id: string; entidad_id: string; fecha_inicio: string } | null> {
    if (this.modoLocal) {
      const cargo = this.cargosPoliticosLocales.find((item) => item.politico_id === politico_id && item.es_actual);
      return cargo ? { cargo_id: cargo.cargo_id, entidad_id: cargo.entidad_id || '', fecha_inicio: cargo.fecha_inicio } : null;
    }
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
      const cargo = this.cargosPoliticosLocales.find((item) => item.politico_id === politico_id && item.es_actual);
      return cargo ? { cargo_id: cargo.cargo_id, entidad_id: cargo.entidad_id || '', fecha_inicio: cargo.fecha_inicio } : null;
    }
    return data;
  }
}
