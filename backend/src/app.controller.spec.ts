import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns landing data', () => {
    const landing = appController.getLandingData();
    expect(landing.brand).toBe('FunKids');
    expect(landing.paymentMethods).toHaveLength(1);
  });

  it('creates a purchase with a valid email', () => {
    const result = appController.createPurchase({
      fullName: 'Cliente Demo',
      email: 'cliente@correo.cl',
      packageId: 'pkg_5000',
      acceptedTerms: true,
      wantsAccount: false,
      paymentMethod: 'transbank',
    });

    expect(result.status).toBe('pending_payment');
    expect(result.order.amount).toBe(5000);
  });

  it('rejects invalid email payloads', () => {
    expect(() =>
      appController.createPurchase({
        fullName: 'Cliente Demo',
        email: 'correo-invalido',
        packageId: 'pkg_2000',
        acceptedTerms: true,
        paymentMethod: 'transbank',
      }),
    ).toThrow(BadRequestException);
  });

  it('authenticates the admin demo user', () => {
    const session = appController.adminLogin({
      email: 'admin@funkids.cl',
      password: 'Admin123!',
    });

    expect(session.profile.role).toBe('admin');
    expect(session.token).toContain('funkids-admin');
  });

  it('creates a manual cash sale for admin', () => {
    const result = appController.createAdminCashSale('Bearer funkids-admin-demo-token', {
      fullName: 'Venta Caja',
      phone: '+56 9 1234 5678',
      packageId: 'pkg_2000',
      notes: 'Caja local',
    });

    expect(result.message).toContain('efectivo');
    expect(result.order.channel).toBe('cash');
    expect(result.order.order.participations).toBe(1);
  });
});
