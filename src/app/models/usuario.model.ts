export interface Usuario {
  id: number;
  username: string;
  password: string; // En producción, debería estar hasheada
}