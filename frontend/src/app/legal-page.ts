import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="page-shell" *ngIf="data() as landing">
      <section class="page-section legal-page">
        <div class="faq-header">
          <p class="eyebrow">Bases legales</p>
          <h1>{{ landing.raffle.title }}</h1>
          <p class="lead">A continuacion se presenta la informacion completa de las bases legales del sorteo.</p>
          <div class="hero-actions">
            <a class="button primary" routerLink="/comprar">Comprar tickets</a>
            <a class="button secondary" routerLink="/">Volver al inicio</a>
          </div>
        </div>

        <div class="legal-sections">
          <article class="legal-card" *ngFor="let section of landing.legalSections">
            <h2>{{ section.title }}</h2>
            <p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>
            <div class="legal-options" *ngIf="isPrizeSection(section)">
              <article class="legal-option-card" *ngFor="let option of getPrizeOptions(section.bullets ?? [])">
                <h3>{{ option.title }}</h3>
                <ul>
                  <li *ngFor="let bullet of option.items">{{ bullet }}</li>
                </ul>
              </article>
            </div>
            <ul *ngIf="section.bullets?.length && !isPrizeSection(section)">
              <li *ngFor="let bullet of section.bullets">{{ bullet }}</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  `,
})
export class LegalPage {
  private readonly api = inject(LandingApi);

  protected readonly data = computed(() => this.api.landing());

  protected isPrizeSection(section: { title: string }) {
    return section.title.trim().startsWith('V. Premio');
  }

  protected getPrizeOptions(bullets: string[]) {
    const options: Array<{ title: string; items: string[] }> = [];
    let currentOption: { title: string; items: string[] } | null = null;

    for (const bullet of bullets) {
      if (bullet.startsWith('Opcion 1:') || bullet.startsWith('Opcion 2:')) {
        currentOption = {
          title: bullet.replace(/^Opcion \d:\s*/u, '').trim(),
          items: [],
        };
        options.push(currentOption);
        continue;
      }

      if (currentOption) {
        currentOption.items.push(bullet);
      }
    }

    return options;
  }

  constructor() {
    this.api.loadLanding();
  }
}
