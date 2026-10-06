import { Injectable } from '@angular/core';
import { Cargo, DatabaseService, PoliticoConCargo } from './database.service';

@Injectable({ providedIn: 'root' })
export class ChatbotLocalService {
  constructor(private dbService: DatabaseService) {}

  async responder(pregunta: string): Promise<string> {
    const texto = this.normalizar(pregunta);
    if (!texto) return 'Escribe una pregunta sobre un cargo, una rama del Estado o un político.';

    const [cargos, politicos] = await Promise.all([
      this.dbService.obtenerCargos(),
      this.dbService.obtenerPoliticosConDetalle(),
    ]);

    if (/(hola|buenas|ayuda|que puedes|qué puedes)/.test(texto)) {
      return 'Puedo explicar qué hace un cargo, indicar a qué rama pertenece, mostrar quién ocupa un cargo y buscar información de un político. Por ejemplo: “¿Qué hace un gobernador?” o “¿Quién es el presidente?”.';
    }

    const politico = this.buscarPolitico(texto, politicos);
    if (politico) return this.respuestaPolitico(politico);

    const cargo = this.buscarCargo(texto, cargos);
    if (cargo) {
      const ocupantes = politicos.filter((item) => this.normalizar(item.cargo_nombre || '') === this.normalizar(cargo.nombre));
      return this.respuestaCargo(cargo, ocupantes);
    }

    if (/(rama|ramas|poder|estado|gobierno|ejecutiv|legislativ|judicial)/.test(texto)) {
      return 'El Estado se organiza en ramas con funciones distintas: la Ejecutiva administra y ejecuta políticas públicas; la Legislativa crea, reforma y controla las leyes; y la Judicial interpreta las normas y administra justicia. Los cargos y nombres exactos pueden variar según el país y la entidad.';
    }

    if (/(senado|senador|camara|cámara|congreso|representante)/.test(texto)) {
      return 'El Congreso pertenece a la rama Legislativa. Sus integrantes participan en la creación de leyes, el debate de asuntos públicos y el control político del gobierno.';
    }

    return 'No encontré una coincidencia exacta en los datos disponibles. Prueba preguntando por un cargo (“¿Qué hace un alcalde?”), una rama (“¿Qué hace la rama Legislativa?”) o el nombre de un político.';
  }

  private buscarCargo(texto: string, cargos: Cargo[]): Cargo | undefined {
    return [...cargos]
      .sort((a, b) => b.nombre.length - a.nombre.length)
      .find((cargo) => texto.includes(this.normalizar(cargo.nombre)));
  }

  private buscarPolitico(texto: string, politicos: PoliticoConCargo[]): PoliticoConCargo | undefined {
    return politicos.find((politico) => {
      const nombre = this.normalizar(`${politico.nombre} ${politico.apellido}`);
      return nombre.length > 4 && texto.includes(nombre);
    });
  }

  private respuestaCargo(cargo: Cargo, ocupantes: PoliticoConCargo[]): string {
    const descripcion = cargo.descripcion || this.descripcionPorCargo(cargo.nombre);
    const personas = ocupantes.slice(0, 5).map((item) => `${item.nombre} ${item.apellido}`).join(', ');
    const titulares = personas
      ? ` En los datos actuales aparecen: ${personas}${ocupantes.length > 5 ? ' y más.' : '.'}`
      : ' No hay un político asociado a este cargo en los datos actuales.';
    return `${cargo.nombre} pertenece al nivel ${cargo.nivel || 'correspondiente'} y a la rama ${cargo.rama || 'pública'}. ${descripcion}.${titulares}`;
  }

  private respuestaPolitico(politico: PoliticoConCargo): string {
    const nombre = `${politico.nombre} ${politico.apellido}`;
    const cargo = politico.cargo_nombre || 'cargo no especificado';
    const partido = politico.partido_nombre ? `, del partido ${politico.partido_nombre}` : '';
    const entidad = politico.entidad_nombre ? ` en ${politico.entidad_nombre}` : '';
    return `${nombre} ocupa el cargo de ${cargo}${entidad}${partido}. Puedes abrir su perfil para consultar la información disponible.`;
  }

  private descripcionPorCargo(nombre: string): string {
    const cargo = this.normalizar(nombre);
    if (cargo.includes('presidente')) return 'Dirige el Poder Ejecutivo y orienta la administración general del país';
    if (cargo.includes('gobernador')) return 'Dirige la administración de un departamento o región y coordina sus políticas públicas';
    if (cargo.includes('alcalde')) return 'Dirige la administración municipal y gestiona los servicios y asuntos de la ciudad o municipio';
    if (cargo.includes('senador') || cargo.includes('representante')) return 'Participa en la creación de leyes y ejerce control político desde el Congreso';
    return 'Es una función pública con responsabilidades definidas por la ley y la entidad a la que pertenece';
  }

  private normalizar(valor: string): string {
    return valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }
}
