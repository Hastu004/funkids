import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
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

  @Post('admin/login')
  adminLogin(@Body() body: Record<string, unknown>) {
    return this.appService.adminLogin(body);
  }

  @Get('admin/orders')
  getAdminOrders(@Headers('authorization') authorization?: string) {
    return this.appService.getAdminOrders(authorization);
  }

  @Post('admin/cash-sale')
  createAdminCashSale(@Headers('authorization') authorization: string | undefined, @Body() body: Record<string, unknown>) {
    return this.appService.createAdminCashSale(authorization, body);
  }
}
