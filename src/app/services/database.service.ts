import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from 'capacitor-sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private platform = '';

  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform = 'web'; // Cambia según la plataforma
    await this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqlite.createConnection(
        'informappdb',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();

      // Crear tablas
      await this.crearTablas();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando BD:', error);
    }
  }

  private async crearTablas() {
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
        fechaInicio TEXT
      );
    `;

    const sqlUsuarios = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `;

    try {
      await this.db.execute(sqlPoliticos);
      await this.db.execute(sqlUsuarios);
      
      // Insertar usuario admin por defecto
      await this.insertarAdminPorDefecto();
    } catch (error) {
      console.error('Error creando tablas:', error);
    }
  }

  private async insertarAdminPorDefecto() {
    try {
      await this.db.run(
        `INSERT OR IGNORE INTO usuarios (username, password) 
         VALUES (?, ?)`,
        ['admin', 'admin123'] // En producción, usar hash
      );
    } catch (error) {
      console.error('Error insertando admin:', error);
    }
  }

  // CRUD Políticos
  async obtenerTodosPoliticos() {
    try {
      const result = await this.db.query('SELECT * FROM politicos');
      return result.values || [];
    } catch (error) {
      console.error('Error obteniendo políticos:', error);
      return [];
    }
  }

  async obtenerPoliticoPorId(id: number) {
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

  async obtenerPoliticosPorCargo(cargo: string) {
    try {
      const result = await this.db.query(
        'SELECT * FROM politicos WHERE cargo = ?',
        [cargo]
      );
      return result.values || [];
    } catch (error) {
      console.error('Error obteniendo políticos por cargo:', error);
      return [];
    }
  }

  async crearPolitico(politico: any) {
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
          politico.fechaInicio || null
        ]
      );
      return result.changes?.lastId;
    } catch (error) {
      console.error('Error creando político:', error);
      return null;
    }
  }

  async actualizarPolitico(id: number, politico: any) {
    try {
      await this.db.run(
        `UPDATE politicos SET 
         nombre = ?, apellido = ?, cargo = ?, partido = ?, 
         departamento = ?, foto = ?, bio = ?, email = ?, 
         telefono = ?, fechaInicio = ? 
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
          id
        ]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando político:', error);
      return false;
    }
  }

  async eliminarPolitico(id: number) {
    try {
      await this.db.run('DELETE FROM politicos WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando político:', error);
      return false;
    }
  }

  // Validar usuario
  async validarUsuario(username: string, password: string) {
    try {
      const result = await this.db.query(
        'SELECT * FROM usuarios WHERE username = ? AND password = ?',
        [username, password]
      );
      return result.values && result.values.length > 0;
    } catch (error) {
      console.error('Error validando usuario:', error);
      return false;
    }
  }
}