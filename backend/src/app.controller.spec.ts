import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    process.env.ADMIN_EMAIL = 'admin@funkids.cl';
    process.env.ADMIN_PASSWORD = 'Admin123!';
    process.env.ADMIN_SESSION_SECRET = 'test-session-secret';

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
    expect(session.token.split('.').length).toBeGreaterThanOrEqual(3);
  });

  it('creates a manual cash sale for admin', () => {
    const session = appController.adminLogin({
      email: 'admin@funkids.cl',
      password: 'Admin123!',
    });

    const result = appController.createAdminCashSale(`Bearer ${session.token}`, {
      fullName: 'Venta Caja',
      phone: '+56 9 1234 5678',
      packageId: 'pkg_2000',
      notes: 'Caja local',
    });

    expect(result.message).toContain('efectivo');
    expect(result.order.channel).toBe('cash');
    expect(result.order.order.participations).toBe(1);
  });

  it('draws a weighted raffle winner for admin', () => {
    const session = appController.adminLogin({
      email: 'admin@funkids.cl',
      password: 'Admin123!',
    });

    const result = appController.drawAdminWinner(`Bearer ${session.token}`);

    expect(result.winner.fullName).toBeTruthy();
    expect(result.winner.ticketNumber).toContain('FK-');
    expect(result.eligibleEntries).toBeGreaterThan(0);
  });
});
