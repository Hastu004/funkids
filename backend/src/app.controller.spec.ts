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
});
