import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';

interface SiteInfo {
  name: string;
  message: string;
  contactEmail: string;
  schedule: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);

  protected readonly title = 'FunKids';
  protected siteInfo: SiteInfo | null = null;
  protected readonly activities = [
    {
      title: 'Talleres creativos',
      description: 'Pintura, manualidades y juegos sensoriales para despertar la imaginacion.'
    },
    {
      title: 'Juegos activos',
      description: 'Espacios para moverse, explorar y compartir con seguridad.'
    },
    {
      title: 'Momentos en familia',
      description: 'Instancias pensadas para disfrutar juntos y crear recuerdos bonitos.'
    }
  ];

  constructor() {
    this.http.get<SiteInfo>('http://localhost:3000/api/info').subscribe({
      next: (info) => {
        this.siteInfo = info;
      }
    });
  }
}
