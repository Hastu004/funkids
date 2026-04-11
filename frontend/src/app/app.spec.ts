import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const request = httpMock.expectOne('http://localhost:3000/api/landing');
    request.flush({
      brand: 'FunKids',
      hero: { badge: 'badge', title: 'Compra tus tickets FunKids en minutos.', description: 'desc' },
      raffle: {
        title: 'Gran sorteo FunKids',
        drawDate: '31 de mayo de 2026',
        ticketPrice: 3500,
        totalTickets: 5000,
        remainingTickets: 1200,
        legalDisclaimer: 'legal',
      },
      highlights: [],
      faqs: [],
      contact: { email: 'sorteo@funkids.cl', schedule: '09:00 a 20:00' },
      paymentMethods: [{ id: 'transbank', name: 'Transbank', description: 'Pago online' }],
    });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the raffle headline', () => {
    const fixture = TestBed.createComponent(App);
    const request = httpMock.expectOne('http://localhost:3000/api/landing');
    request.flush({
      brand: 'FunKids',
      hero: { badge: 'badge', title: 'Compra tus tickets FunKids en minutos.', description: 'desc' },
      raffle: {
        title: 'Gran sorteo FunKids',
        drawDate: '31 de mayo de 2026',
        ticketPrice: 3500,
        totalTickets: 5000,
        remainingTickets: 1200,
        legalDisclaimer: 'legal',
      },
      highlights: [],
      faqs: [],
      contact: { email: 'sorteo@funkids.cl', schedule: '09:00 a 20:00' },
      paymentMethods: [{ id: 'transbank', name: 'Transbank', description: 'Pago online' }],
    });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Compra tus tickets FunKids en minutos.');
  });
});
