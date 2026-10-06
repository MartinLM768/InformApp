import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonFooter, IonItem, IonInput, IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, sendOutline, sparklesOutline } from 'ionicons/icons';
import { ChatbotLocalService } from '../../services/chatbot-local.service';

interface MensajeChat {
  texto: string;
  autor: 'usuario' | 'asistente';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonFooter, IonItem, IonInput, IonSpinner,
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  pregunta = '';
  procesando = false;
  mensajes: MensajeChat[] = [
    {
      autor: 'asistente',
      texto: 'Hola. Soy el asistente de InformApp. Puedo explicar cargos del Estado y consultar los políticos registrados.',
    },
  ];

  constructor(
    private chatbotService: ChatbotLocalService,
    private modalController: ModalController,
  ) {}

  async enviarPregunta() {
    const pregunta = this.pregunta.trim();
    if (!pregunta || this.procesando) return;

    this.mensajes.push({ autor: 'usuario', texto: pregunta });
    this.pregunta = '';
    this.procesando = true;
    try {
      const respuesta = await this.chatbotService.responder(pregunta);
      this.mensajes.push({ autor: 'asistente', texto: respuesta });
    } finally {
      this.procesando = false;
    }
  }

  usarPregunta(pregunta: string) {
    this.pregunta = pregunta;
    void this.enviarPregunta();
  }

  cerrar() {
    this.modalController.dismiss();
  }
}

addIcons({
  'close-outline': closeOutline,
  'send-outline': sendOutline,
  'sparkles-outline': sparklesOutline,
});
