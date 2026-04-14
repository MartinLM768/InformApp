import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-politico',
  templateUrl: './form-politico.component.html',
  styleUrls: ['./form-politico.component.scss']
})
export class FormPoliticoComponent implements OnInit {
  @Input() politico: any;
  form!: FormGroup;

  cargos = ['Presidente', 'Vicepresidente', 'Senador', 'Representante'];
  departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
  }

  private inicializarFormulario() {
    this.form = this.fb.group({
      nombre: [this.politico?.nombre || '', Validators.required],
      apellido: [this.politico?.apellido || '', Validators.required],
      cargo: [this.politico?.cargo || '', Validators.required],
      partido: [this.politico?.partido || '', Validators.required],
      departamento: [this.politico?.departamento || ''],
      foto: [this.politico?.foto || ''],
      email: [this.politico?.email || '', Validators.email],
      telefono: [this.politico?.telefono || ''],
      bio: [this.politico?.bio || ''],
      fechaInicio: [this.politico?.fechaInicio || '']
    });
  }

  guardar() {
    if (this.form.valid) {
      this.modalController.dismiss(this.form.value);
    }
  }

  cancelar() {
    this.modalController.dismiss();
  }
}