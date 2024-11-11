import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Movie Manager API by Lucio Fontanari';
  }
}
