import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { ModalController } from '@ionic/angular';
import { DetallePoliticoComponent } from '../../components/detalle-politico/detalle-politico.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  politicos: any[] = [];
  cargos: string[] = ['Presidente', 'Vicepresidente', 'Senador', 'Representante'];
  cargosSeleccionado = '';
  politicosFiltered: any[] = [];

  constructor(
    private dbService: DatabaseService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    await this.cargarPoliticos();
  }

  async cargarPoliticos() {
    this.politicos = await this.dbService.obtenerTodosPoliticos();
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.cargosSeleccionado) {
      this.politicosFiltered = this.politicos.filter(
        p => p.cargo === this.cargosSeleccionado
      );
    } else {
      this.politicosFiltered = this.politicos;
    }
  }

  async abrirDetalle(politico: any) {
    const modal = await this.modalController.create({
      component: DetallePoliticoComponent,
      componentProps: {
        politico: politico
      }
    });
    return await modal.present();
  }
}