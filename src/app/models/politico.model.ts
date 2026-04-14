export interface Politico {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string; // 'Presidente', 'Vicepresidente', 'Senador', etc.
  partido: string;
  departamento?: string; // Para senadores y representantes
  foto?: string; // URL o base64 de foto
  bio?: string;
  email?: string;
  telefono?: string;
  fechaInicio?: string;
}