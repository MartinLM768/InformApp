import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';

// EXPORTAR LAS INTERFACES
export interface Politico {
  id?: number;
  nombre: string;
  apellido: string;
  cargo: string;
  partido: string;
  departamento?: string;
  foto?: string;
  bio?: string;
  email?: string;
  telefono?: string;
  fechaInicio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Usuario {
  id?: number;
  username: string;
  passwordHash: string;
  email?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private isNative: boolean = false;
  private isInitialized: boolean = false;

  constructor(private storage: Storage) {
    this.detectPlatform();
  }

  private detectPlatform(): void {
    this.isNative =
      (window as any).Capacitor &&
      (window as any).Capacitor.getPlatform() !== 'web';
    console.log('Plataforma detectada:', this.isNative ? 'Nativa' : 'Web');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (this.isNative) {
        await this.initializeSQLite();
      } else {
        await this.initializeStorage();
      }
      this.isInitialized = true;
      console.log(
        'Base de datos inicializada:',
        this.isNative ? 'SQLite' : 'Storage'
      );
    } catch (error) {
      console.error('Error inicializando BD:', error);
      throw error;
    }
  }

  private async initializeSQLite(): Promise<void> {
    try {
      this.db = await this.sqlite.createConnection(
        'informappdb',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      await this.createTablesNative();
      await this.insertDefaultAdminNative();
      console.log('SQLite inicializado correctamente');
    } catch (error) {
      console.error('Error en SQLite:', error);
      // Fallback a Storage si falla SQLite
      this.isNative = false;
      await this.initializeStorage();
    }
  }

  private async initializeStorage(): Promise<void> {
    try {
      await this.storage.create();
      await this.initializeStorageData();
      console.log('Storage inicializado correctamente');
    } catch (error) {
      console.error('Error en Storage:', error);
      throw error;
    }
  }

  private async initializeStorageData(): Promise<void> {
    const politicos = await this.storage.get('politicos');
    const usuarios = await this.storage.get('usuarios');

    if (!politicos) {
      await this.storage.set('politicos', []);
    }

    if (!usuarios) {
      await this.storage.set('usuarios', [
        {
          id: 1,
          username: 'admin',
          passwordHash: 'admin123',
          email: 'admin@informapp.com',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }

  private async createTablesNative(): Promise<void> {
    const sqlPoliticos = `
      CREATE TABLE IF NOT EXISTS politicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        cargo TEXT NOT NULL,
        partido TEXT NOT NULL,
        departamento TEXT,
        foto TEXT,
        bio TEXT,
        email TEXT,
        telefono TEXT,
        fechaInicio TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const sqlUsuarios = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        email TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const sqlAuditoria = `
      CREATE TABLE IF NOT EXISTS auditoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT,
        accion TEXT,
        tabla TEXT,
        registroId INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        detalles TEXT
      );
    `;

    try {
      await this.db.execute(sqlPoliticos);
      await this.db.execute(sqlUsuarios);
      await this.db.execute(sqlAuditoria);
      console.log('Tablas creadas correctamente');
    } catch (error) {
      console.error('Error creando tablas:', error);
    }
  }

  private async insertDefaultAdminNative(): Promise<void> {
    try {
      await this.db.run(
        `INSERT OR IGNORE INTO usuarios (username, passwordHash, email) 
         VALUES (?, ?, ?)`,
        ['admin', 'admin123', 'admin@informapp.com']
      );
    } catch (error) {
      console.error('Error insertando admin:', error);
    }
  }

  // ===== CRUD POLÍTICOS =====

  async obtenerTodosPoliticos(): Promise<Politico[]> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const politicos = await this.storage.get('politicos');
      return politicos
        ? politicos.sort((a: any, b: any) =>
            a.apellido.localeCompare(b.apellido)
          )
        : [];
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM politicos ORDER BY apellido ASC'
      );
      return result.values || [];
    } catch (error) {
      console.error('Error obteniendo políticos:', error);
      return [];
    }
  }

  async obtenerPoliticoPorId(id: number): Promise<Politico | null> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const politicos = await this.storage.get('politicos');
      return politicos
        ? politicos.find((p: any) => p.id === id) || null
        : null;
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM politicos WHERE id = ?',
        [id]
      );
      return result.values?.[0] || null;
    } catch (error) {
      console.error('Error obteniendo político:', error);
      return null;
    }
  }

  async obtenerPoliticosPorCargo(cargo: string): Promise<Politico[]> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const politicos = await this.storage.get('politicos');
      return politicos
        ? politicos
            .filter((p: any) => p.cargo === cargo)
            .sort((a: any, b: any) =>
              a.apellido.localeCompare(b.apellido)
            )
        : [];
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM politicos WHERE cargo = ? ORDER BY apellido ASC',
        [cargo]
      );
      return result.values || [];
    } catch (error) {
      console.error('Error obteniendo políticos por cargo:', error);
      return [];
    }
  }

  async crearPolitico(politico: Politico): Promise<number | null> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const politicos = await this.storage.get('politicos');
      const id =
        politicos && politicos.length > 0
          ? Math.max(...politicos.map((p: any) => p.id)) + 1
          : 1;

      const nuevoPolitico: Politico = {
        id,
        ...politico,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPoliticos = politicos
        ? [...politicos, nuevoPolitico]
        : [nuevoPolitico];
      await this.storage.set('politicos', updatedPoliticos);
      await this.registrarAuditoriaWeb('crear', 'politicos', id, politico);
      return id;
    }

    try {
      const result = await this.db.run(
        `INSERT INTO politicos 
         (nombre, apellido, cargo, partido, departamento, foto, bio, email, telefono, fechaInicio) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          politico.nombre,
          politico.apellido,
          politico.cargo,
          politico.partido,
          politico.departamento || null,
          politico.foto || null,
          politico.bio || null,
          politico.email || null,
          politico.telefono || null,
          politico.fechaInicio || null,
        ]
      );
      const id = result.changes?.lastId || null;
      if (id) {
        await this.registrarAuditoria('crear', 'politicos', id, politico);
      }
      return id;
    } catch (error) {
      console.error('Error creando político:', error);
      return null;
    }
  }

  async actualizarPolitico(id: number, politico: Politico): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const politicos = await this.storage.get('politicos');
      if (!politicos) return false;

      const index = politicos.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        politicos[index] = {
          ...politicos[index],
          ...politico,
          updatedAt: new Date().toISOString(),
        };
        await this.storage.set('politicos', politicos);
        await this.registrarAuditoriaWeb('actualizar', 'politicos', id, politico);
        return true;
      }
      return false;
    }

    try {
      await this.db.run(
        `UPDATE politicos SET 
         nombre = ?, apellido = ?, cargo = ?, partido = ?, 
         departamento = ?, foto = ?, bio = ?, email = ?, 
         telefono = ?, fechaInicio = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          politico.nombre,
          politico.apellido,
          politico.cargo,
          politico.partido,
          politico.departamento || null,
          politico.foto || null,
          politico.bio || null,
          politico.email || null,
          politico.telefono || null,
          politico.fechaInicio || null,
          id,
        ]
      );
      await this.registrarAuditoria('actualizar', 'politicos', id, politico);
      return true;
    } catch (error) {
      console.error('Error actualizando político:', error);
      return false;
    }
  }

  async eliminarPolitico(id: number): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const politicos = await this.storage.get('politicos');
      if (!politicos) return false;

      const index = politicos.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        politicos.splice(index, 1);
        await this.storage.set('politicos', politicos);
        await this.registrarAuditoriaWeb('eliminar', 'politicos', id, null);
        return true;
      }
      return false;
    }

    try {
      await this.db.run('DELETE FROM politicos WHERE id = ?', [id]);
      await this.registrarAuditoria('eliminar', 'politicos', id, null);
      return true;
    } catch (error) {
      console.error('Error eliminando político:', error);
      return false;
    }
  }

  // ===== AUTENTICACIÓN =====

  async validarUsuario(
    username: string,
    password: string
  ): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.isNative) {
      const usuarios = await this.storage.get('usuarios');
      return usuarios
        ? usuarios.some(
            (u: any) =>
              u.username === username && u.passwordHash === password
          )
        : false;
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM usuarios WHERE username = ? AND passwordHash = ?',
        [username, password]
      );
      return (result.values && result.values.length > 0) || false;
    } catch (error) {
      console.error('Error validando usuario:', error);
      return false;
    }
  }

  // ===== AUDITORIA =====

  private async registrarAuditoria(
    accion: string,
    tabla: string,
    registroId: number,
    detalles: any
  ): Promise<void> {
    if (!this.isNative) return;

    const usuario = sessionStorage.getItem('username') || 'sistema';

    try {
      await this.db.run(
        `INSERT INTO auditoria (usuario, accion, tabla, registroId, detalles)
         VALUES (?, ?, ?, ?, ?)`,
        [usuario, accion, tabla, registroId, JSON.stringify(detalles)]
      );
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }

  private async registrarAuditoriaWeb(
    accion: string,
    tabla: string,
    registroId: number,
    detalles: any
  ): Promise<void> {
    // Opcional: guardar en Storage si es necesario
    console.log(
      `[AUDITORIA WEB] ${accion} - ${tabla} - ID: ${registroId}`
    );
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}