import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('landing')
  getLandingData() {
    return this.appService.getLandingData();
  }

  @Post('purchase')
  createPurchase(@Body() body: Record<string, unknown>) {
    return this.appService.createPurchase(body);
  }
}
