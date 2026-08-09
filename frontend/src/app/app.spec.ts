import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { HomePage } from './home-page';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render top navigation links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inicio');
    expect(compiled.textContent).toContain('Bases legales');
    expect(compiled.textContent).toContain('Login');
  });

  it('should show the closed raffle notice without a purchase form', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Este sorteo ya no está disponible.');
    expect(compiled.textContent).toContain('Estamos trabajando en un próximo sorteo.');
    expect(compiled.querySelector('form')).toBeNull();
  });
});
