import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApi } from './admin-api';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <main class="page-shell admin-page" *ngIf="landing() as landingData">
      <section class="page-section admin-layout" *ngIf="session(); else loginView">
        <div class="admin-header-card">
          <div>
            <p class="eyebrow">Panel administrador</p>
            <h1>Ventas y tickets del sorteo</h1>
            <p class="lead">
              Revisa quien compro, cuando se registro cada venta y cuantas participaciones tiene cada cliente.
            </p>
          </div>

          <div class="admin-header-card__actions">
            <p class="admin-user">{{ session()?.profile?.name }}</p>
            <button class="button secondary" type="button" (click)="logout()">Cerrar sesion</button>
          </div>
        </div>

        <div class="admin-summary" *ngIf="dashboard() as dashboardData">
          <article class="meta-card">
            <span>Ventas</span>
            <strong>{{ dashboardData.stats.totalOrders }}</strong>
          </article>
          <article class="meta-card">
            <span>Recaudacion</span>
            <strong>{{ dashboardData.stats.totalRevenue | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
          </article>
          <article class="meta-card">
            <span>Participaciones</span>
            <strong>{{ dashboardData.stats.totalParticipations }}</strong>
          </article>
          <article class="meta-card">
            <span>Ventas en efectivo</span>
            <strong>{{ dashboardData.stats.cashSales }}</strong>
          </article>
        </div>

        <section class="admin-grid" *ngIf="dashboard() as dashboardData">
          <aside class="admin-card">
            <p class="eyebrow subtle">Venta manual</p>
            <h2>Ingresar pago en efectivo</h2>
            <p class="admin-copy">Registra compras presenciales para que el panel mantenga el total de tickets y participaciones.</p>

            <form [formGroup]="cashSaleForm" (ngSubmit)="submitCashSale()" class="purchase-form">
              <label class="field">
                <span>Nombre completo</span>
                <input type="text" formControlName="fullName" placeholder="Ej: Jane Doe" />
              </label>

              <label class="field">
                <span>Telefono</span>
                <input type="tel" formControlName="phone" placeholder="+56 9 1234 5678" />
              </label>

              <label class="field">
                <span>Email opcional</span>
                <input type="email" formControlName="email" placeholder="cliente@correo.cl" />
              </label>

              <label class="field">
                <span>Modalidad de tickets</span>
                <select formControlName="packageId">
                  <option value="">Selecciona una opcion</option>
                  <option *ngFor="let option of landingData.packages" [value]="option.id">{{ option.label }}</option>
                </select>
              </label>

              <label class="field">
                <span>Nota interna</span>
                <input type="text" formControlName="notes" placeholder="Ej: Pago en caja principal" />
              </label>

              <button class="button primary submit-button" type="submit" [disabled]="isSavingCashSale()">
                {{ isSavingCashSale() ? 'Guardando...' : 'Guardar venta en efectivo' }}
              </button>

              <p class="helper-text">Perfil demo admin: {{ adminCredentialsHint }}</p>
              <p class="error server-error" *ngIf="cashSaleMessage()">{{ cashSaleMessage() }}</p>
            </form>
          </aside>

          <section class="admin-card admin-card--table">
            <p class="eyebrow subtle">Compras registradas</p>
            <h2>Historial del sorteo</h2>
            <p class="admin-copy">Incluye compras online y ventas ingresadas manualmente desde el panel.</p>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Canal</th>
                    <th>Tickets</th>
                    <th>Participaciones</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of dashboardData.orders">
                    <td>
                      <strong>{{ order.participant.fullName }}</strong>
                      <small>{{ order.participant.email || order.participant.phone || 'Sin contacto' }}</small>
                    </td>
                    <td>
                      <strong>{{ order.createdAt | date: 'dd/MM/yyyy' }}</strong>
                      <small>{{ order.createdAt | date: 'HH:mm' }}</small>
                    </td>
                    <td>
                      <strong>{{ order.sourceLabel }}</strong>
                      <small>{{ order.order.paymentLabel }}</small>
                    </td>
                    <td>
                      <strong>{{ order.order.ticketNumbers.length }}</strong>
                      <small>{{ order.order.packageLabel }}</small>
                    </td>
                    <td>
                      <strong>{{ order.order.participations }}</strong>
                      <small>{{ order.order.ticketNumbers.join(', ') }}</small>
                    </td>
                    <td>
                      <strong>{{ order.order.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
                      <small>{{ order.status === 'paid' ? 'Pagado' : 'Pendiente' }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </section>

      <ng-template #loginView>
        <section class="page-section admin-login">
          <article class="admin-card admin-card--login">
            <p class="eyebrow">Acceso administrador</p>
            <h1>Ingresa al panel del sorteo</h1>
            <p class="lead">Desde aqui puedes revisar las compras y registrar ventas en efectivo.</p>

            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="purchase-form">
              <label class="field">
                <span>Email admin</span>
                <input type="email" formControlName="email" placeholder="admin@funkids.cl" />
              </label>

              <label class="field">
                <span>Contrasena</span>
                <input type="password" formControlName="password" placeholder="Admin123!" />
              </label>

              <button class="button primary submit-button" type="submit" [disabled]="isLoggingIn()">
                {{ isLoggingIn() ? 'Ingresando...' : 'Entrar al panel' }}
              </button>

              <p class="helper-text">Credenciales demo: {{ adminCredentialsHint }}</p>
              <p class="error server-error" *ngIf="loginError()">{{ loginError() }}</p>
            </form>
          </article>
        </section>
      </ng-template>
    </main>
  `,
})
export class AdminPage {
  private readonly adminApi = inject(AdminApi);
  private readonly landingApi = inject(LandingApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly session = computed(() => this.adminApi.session());
  protected readonly dashboard = computed(() => this.adminApi.dashboard());
  protected readonly landing = computed(() => this.landingApi.landing());
  protected readonly isLoggingIn = signal(false);
  protected readonly isSavingCashSale = signal(false);
  protected readonly loginError = signal('');
  protected readonly cashSaleMessage = signal('');
  protected readonly adminCredentialsHint = 'admin@funkids.cl / Admin123!';

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['admin@funkids.cl', [Validators.required, Validators.email]],
    password: ['Admin123!', Validators.required],
  });

  protected readonly cashSaleForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    packageId: ['', Validators.required],
    notes: [''],
  });

  constructor() {
    this.landingApi.loadLanding();

    if (this.adminApi.session()) {
      this.refreshDashboard();
    }
  }

  protected submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginError.set('Revisa las credenciales antes de continuar.');
      return;
    }

    this.isLoggingIn.set(true);
    this.loginError.set('');

    this.adminApi.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isLoggingIn.set(false);
        this.refreshDashboard();
      },
      error: (error) => {
        this.loginError.set(error.error?.message ?? 'No fue posible iniciar sesion.');
        this.isLoggingIn.set(false);
      },
    });
  }

  protected submitCashSale() {
    if (this.cashSaleForm.invalid) {
      this.cashSaleForm.markAllAsTouched();
      this.cashSaleMessage.set('Completa los datos obligatorios de la venta.');
      return;
    }

    this.isSavingCashSale.set(true);
    this.cashSaleMessage.set('');

    this.adminApi.createCashSale(this.cashSaleForm.getRawValue()).subscribe({
      next: (response) => {
        this.cashSaleMessage.set(response.message);
        this.cashSaleForm.reset({
          fullName: '',
          phone: '',
          email: '',
          packageId: '',
          notes: '',
        });
        this.isSavingCashSale.set(false);
      },
      error: (error) => {
        this.cashSaleMessage.set(error.error?.message ?? 'No fue posible registrar la venta.');
        this.isSavingCashSale.set(false);
      },
    });
  }

  protected logout() {
    this.adminApi.logout();
  }

  private refreshDashboard() {
    this.adminApi.loadDashboard().subscribe({
      error: () => {
        this.adminApi.logout();
        this.loginError.set('La sesion admin expiro. Vuelve a ingresar.');
      },
    });
  }
}
