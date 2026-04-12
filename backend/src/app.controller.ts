import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';
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

  @Post('admin/draw-winner')
  drawAdminWinner(@Headers('authorization') authorization?: string) {
    return this.appService.drawAdminWinner(authorization);
  }

  @Post('admin/cash-sale')
  createAdminCashSale(@Headers('authorization') authorization: string | undefined, @Body() body: Record<string, unknown>) {
    return this.appService.createAdminCashSale(authorization, body);
  }

  @Put('admin/orders/:id')
  updateAdminOrder(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.appService.updateAdminOrder(authorization, id, body);
  }

  @Delete('admin/orders/:id')
  deleteAdminOrder(@Headers('authorization') authorization: string | undefined, @Param('id') id: string) {
    return this.appService.deleteAdminOrder(authorization, id);
  }
}
