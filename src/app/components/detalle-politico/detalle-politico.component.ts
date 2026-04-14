import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-politico',
  templateUrl: './detalle-politico.component.html',
  styleUrls: ['./detalle-politico.component.scss']
})
export class DetallePoliticoComponent {
  @Input() politico: any;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }
}