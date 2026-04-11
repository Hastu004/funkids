import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSiteInfo() {
    return {
      name: 'FunKids',
      message: 'Te esperamos para una tarde llena de juegos y creatividad.',
      contactEmail: 'hola@funkids.cl',
      schedule: 'lunes a sabado de 10:00 a 18:00',
    };
  }
}
