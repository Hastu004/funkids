import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type FormControl } from '@angular/forms';
import { AdminApi, type AdminOrder, type AdminRaffleWinner, type AdminRole, type ManualSaleMethod } from './admin-api';
import { LandingApi } from './landing-api';

const PHONE_PATTERN = /^\+56 9 \d{4} \d{4}$/;

interface WinnerPreview {
  fullName: string;
  ticketNumber: string;
  packageLabel: string;
}

interface SaleMethodOption {
  id: ManualSaleMethod;
  label: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <main class="page-shell admin-page" *ngIf="landing() as landingData">
      <aside class="toast-message" *ngIf="toast() as toastState" [class.toast-message--error]="toastState.type === 'error'">
        <strong>{{ toastState.title }}</strong>
        <p>{{ toastState.message }}</p>
      </aside>

      <section class="page-section admin-layout" *ngIf="session(); else loginView">
        <div class="admin-header-card">
          <div class="admin-header-card__copy">
            <p class="eyebrow">{{ isAdmin() ? 'Panel administrador' : 'Panel vendedor' }}</p>
            <h1 class="admin-title">{{ isAdmin() ? 'Historial del sorteo' : 'Registrar ventas' }}</h1>
            <p class="lead admin-lead">
              {{ isAdmin() ? 'Filtra, edita y exporta registros desde una sola tabla.' : 'Registra ventas manuales de tickets para el sorteo.' }}
            </p>
          </div>

          <div class="admin-header-card__actions">
            <p class="admin-user">{{ session()?.profile?.name }}</p>
            <div class="admin-header-card__buttons">
              <button class="button secondary" type="button" (click)="downloadExcel()" *ngIf="isAdmin()">
                Descargar Excel
              </button>
              <button class="button secondary" type="button" (click)="logout()">Cerrar sesion</button>
            </div>
          </div>
        </div>

        <div class="admin-summary" *ngIf="isAdmin() && dashboard() as dashboardData">
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
            <span>Ventas manuales</span>
            <strong>{{ dashboardData.stats.cashSales }}</strong>
          </article>
        </div>

        <section class="admin-grid" [class.admin-grid--editing]="!!editingOrder()" *ngIf="isAdmin() && dashboard() as dashboardData">
          <aside class="admin-stack" *ngIf="editingOrder()">
            <article class="admin-card">
              <p class="eyebrow subtle">Editar</p>
              <h2>Actualizar registro</h2>
              <p class="admin-copy">Modifica datos del cliente, estado, modalidad o nota interna.</p>

              <form [formGroup]="editForm" (ngSubmit)="submitEdit()" class="purchase-form">
                <label class="field">
                  <span>Nombre completo</span>
                  <input type="text" formControlName="fullName" />
                </label>

                <label class="field">
                  <span>Telefono</span>
                  <input
                    type="tel"
                    formControlName="phone"
                    inputmode="numeric"
                    maxlength="15"
                    placeholder="+56 9 1234 5678"
                    (input)="formatEditPhone()"
                  />
                  <small class="error" *ngIf="hasEditError('phone', 'required') || hasEditError('phone', 'pattern')">
                    Ingresa el telefono con formato +56 9 1234 5678.
                  </small>
                </label>

                <label class="field">
                  <span>Email opcional</span>
                  <input type="email" formControlName="email" placeholder="cliente@correo.cl" (blur)="normalizeEditEmail()" />
                  <small class="error" *ngIf="hasEditError('email', 'email')">
                    Si ingresas un email, debe tener un formato valido.
                  </small>
                </label>

                <label class="field">
                  <span>Modalidad de tickets</span>
                  <select formControlName="packageId">
                    <option value="">Selecciona una opcion</option>
                    <option *ngFor="let option of landingData.packages" [value]="option.id">{{ option.label }}</option>
                  </select>
                </label>

                <label class="field">
                  <span>Estado</span>
                  <select formControlName="status">
                    <option value="paid">Pagado</option>
                    <option value="pending_payment">Pendiente</option>
                  </select>
                </label>

                <label class="field">
                  <span>Nota interna</span>
                  <input type="text" formControlName="notes" />
                </label>

                <div class="admin-inline-actions">
                  <button class="button primary" type="submit" [disabled]="isUpdatingOrder()">
                    {{ isUpdatingOrder() ? 'Guardando...' : 'Actualizar' }}
                  </button>
                  <button class="button secondary" type="button" (click)="cancelEdit()">Cancelar</button>
                </div>

                <p class="error server-error" *ngIf="editMessage()">{{ editMessage() }}</p>
              </form>
            </article>
          </aside>

          <section class="admin-card admin-card--table">
            <div class="admin-table-header">
              <div>
                <p class="eyebrow subtle">Registros</p>
                <h2>Historial del sorteo</h2>
                <p class="admin-copy">Filtra por cliente, canal o estado.</p>
              </div>

              <div class="admin-table-header__actions">
                <button class="button secondary admin-button" type="button" (click)="openDrawModal()">
                  Elegir ganador
                </button>
                <button class="button primary admin-button admin-button--create" type="button" (click)="openCreateModal()">
                  Crear venta
                </button>
              </div>
            </div>

            <article class="admin-winner-card" *ngIf="dashboardData.latestWinner as latestWinner">
              <div>
                <p class="eyebrow subtle">Ultimo ganador</p>
                <h3>{{ latestWinner.fullName }}</h3>
                <p class="admin-copy">
                  Ticket ganador {{ latestWinner.ticketNumber }} · {{ latestWinner.packageLabel }}
                </p>
              </div>

              <div class="admin-winner-card__meta">
                <span>{{ latestWinner.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                <strong>{{ latestWinner.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
              </div>
            </article>

            <div class="admin-filters">
              <label class="field">
                <span>Buscar</span>
                <input
                  type="search"
                  [value]="searchTerm()"
                  placeholder="Nombre, email, telefono o ticket"
                  (input)="setSearch(($any($event.target).value ?? '').toString())"
                />
              </label>

              <label class="field">
                <span>Canal</span>
                <select [value]="channelFilter()" (change)="setChannel(($any($event.target).value ?? 'all').toString())">
                  <option value="all">Todos</option>
                  <option value="webpay">Webpay</option>
                  <option value="cash">Efectivo</option>
                </select>
              </label>

              <label class="field">
                <span>Estado</span>
                <select [value]="statusFilter()" (change)="setStatus(($any($event.target).value ?? 'all').toString())">
                  <option value="all">Todos</option>
                  <option value="paid">Pagado</option>
                  <option value="pending_payment">Pendiente</option>
                </select>
              </label>
            </div>

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
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of paginatedOrders()">
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
                    <td>
                      <div class="admin-row-actions">
                        <button
                          class="button secondary admin-button"
                          type="button"
                          (click)="resendEmail(order)"
                          [disabled]="resendingEmailOrderId() === order.id || !order.participant.email"
                          [title]="order.participant.email ? 'Reenviar comprobante' : 'Este registro no tiene email asociado'"
                        >
                          {{
                            resendingEmailOrderId() === order.id
                              ? 'Enviando...'
                              : order.participant.email
                                ? 'Reenviar correo'
                                : 'Sin email'
                          }}
                        </button>
                        <button class="button secondary admin-button" type="button" (click)="startEdit(order)">Editar</button>
                        <button class="button secondary admin-button danger" type="button" (click)="deleteOrder(order)">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="paginatedOrders().length === 0">
                    <td colspan="7">
                      <div class="admin-empty-state">No hay registros que coincidan con los filtros aplicados.</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="admin-pagination" *ngIf="filteredOrders().length > 0">
              <p>
                Mostrando {{ paginationStart() }}-{{ paginationEnd() }} de {{ filteredOrders().length }} registros
              </p>
              <div class="admin-inline-actions">
                <button class="button secondary admin-button" type="button" (click)="previousPage()" [disabled]="currentPage() === 1">
                  Anterior
                </button>
                <strong>Pagina {{ currentPage() }} / {{ totalPages() }}</strong>
                <button
                  class="button secondary admin-button"
                  type="button"
                  (click)="nextPage()"
                  [disabled]="currentPage() === totalPages()"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </section>

        <section class="admin-card" *ngIf="isSeller()">
          <p class="eyebrow subtle">Nueva venta</p>
          <h2>Registrar venta manual</h2>
          <p class="admin-copy">Selecciona modalidad de pago y registra al participante.</p>

          <form [formGroup]="cashSaleForm" (ngSubmit)="submitCashSale()" class="purchase-form">
            <div class="admin-modal__grid">
              <label class="field">
                <span>Nombre completo</span>
                <input type="text" formControlName="fullName" placeholder="Ej: Jane Doe" />
              </label>

              <label class="field">
                <span>Telefono</span>
                <input
                  type="tel"
                  formControlName="phone"
                  inputmode="numeric"
                  maxlength="15"
                  placeholder="+56 9 1234 5678"
                  (input)="formatCashSalePhone()"
                />
                <small class="error" *ngIf="hasCashSaleError('phone', 'required') || hasCashSaleError('phone', 'pattern')">
                  Ingresa el telefono con formato +56 9 1234 5678.
                </small>
              </label>

              <label class="field">
                <span>Email opcional</span>
                <input type="email" formControlName="email" placeholder="cliente@correo.cl" (blur)="normalizeCashSaleEmail()" />
                <small class="error" *ngIf="hasCashSaleError('email', 'email')">
                  Si ingresas un email, debe tener un formato valido.
                </small>
              </label>

              <label class="field">
                <span>Modalidad de tickets</span>
                <select formControlName="packageId">
                  <option value="">Selecciona una opcion</option>
                  <option *ngFor="let option of landingData.packages" [value]="option.id">{{ option.label }}</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span>Metodo de pago</span>
              <select formControlName="saleMethod">
                <option *ngFor="let option of manualSaleMethods" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>

            <label class="field" *ngIf="requiresReceiptReference()">
              <span>Comprobante o ID del comprobante</span>
              <input type="text" formControlName="receiptReference" placeholder="Ej: T123456789" />
            </label>

            <label class="field">
              <span>Nota interna</span>
              <input type="text" formControlName="notes" placeholder="Ej: Venta en caja principal" />
            </label>

            <div class="admin-inline-actions">
              <button class="button primary" type="submit" [disabled]="isSavingCashSale()">
                {{ isSavingCashSale() ? 'Guardando...' : 'Registrar venta' }}
              </button>
            </div>

            <p class="error server-error" *ngIf="cashSaleMessage()">{{ cashSaleMessage() }}</p>
          </form>

          <section class="seller-recent-sales">
            <div class="seller-recent-sales__header">
              <h3>Ultimas 3 ventas registradas</h3>
              <p class="admin-copy">Se actualizan apenas registras una nueva venta.</p>
            </div>

            <div class="seller-recent-sales__list" *ngIf="recentSellerOrders().length > 0; else sellerRecentSalesEmpty">
              <article class="seller-recent-sale" *ngFor="let order of recentSellerOrders()">
                <div>
                  <strong>{{ order.participant.fullName }}</strong>
                  <p>{{ order.order.packageLabel }} · {{ order.order.paymentLabel }}</p>
                </div>
                <div class="seller-recent-sale__meta">
                  <span>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                  <strong>{{ order.order.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
                </div>
              </article>
            </div>

            <ng-template #sellerRecentSalesEmpty>
              <p class="admin-copy seller-recent-sales__empty">Aun no hay ventas manuales para mostrar.</p>
            </ng-template>
          </section>
        </section>
      </section>

      <div class="admin-modal-backdrop" *ngIf="isCreateModalOpen()" (click)="closeCreateModal()">
        <article class="admin-modal" (click)="$event.stopPropagation()">
          <div class="admin-modal__header">
            <div>
              <p class="eyebrow subtle">Crear</p>
              <h2>Ingresar venta manual</h2>
              <p class="admin-copy">Registra ventas manuales para sumar tickets y participaciones al historial.</p>
            </div>

            <button class="button secondary admin-button" type="button" (click)="closeCreateModal()">
              Cerrar
            </button>
          </div>

          <form [formGroup]="cashSaleForm" (ngSubmit)="submitCashSale()" class="purchase-form admin-modal__form">
            <div class="admin-modal__grid">
              <label class="field">
                <span>Nombre completo</span>
                <input type="text" formControlName="fullName" placeholder="Ej: Jane Doe" />
              </label>

              <label class="field">
                <span>Telefono</span>
                <input
                  type="tel"
                  formControlName="phone"
                  inputmode="numeric"
                  maxlength="15"
                  placeholder="+56 9 1234 5678"
                  (input)="formatCashSalePhone()"
                />
                <small class="error" *ngIf="hasCashSaleError('phone', 'required') || hasCashSaleError('phone', 'pattern')">
                  Ingresa el telefono con formato +56 9 1234 5678.
                </small>
              </label>

              <label class="field">
                <span>Email opcional</span>
                <input type="email" formControlName="email" placeholder="cliente@correo.cl" (blur)="normalizeCashSaleEmail()" />
                <small class="error" *ngIf="hasCashSaleError('email', 'email')">
                  Si ingresas un email, debe tener un formato valido.
                </small>
              </label>

              <label class="field">
                <span>Modalidad de tickets</span>
                <select formControlName="packageId">
                  <option value="">Selecciona una opcion</option>
                  <option *ngFor="let option of landingData.packages" [value]="option.id">{{ option.label }}</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span>Metodo de pago</span>
              <select formControlName="saleMethod">
                <option *ngFor="let option of manualSaleMethods" [value]="option.id">{{ option.label }}</option>
              </select>
            </label>

            <label class="field" *ngIf="requiresReceiptReference()">
              <span>Comprobante o ID del comprobante</span>
              <input type="text" formControlName="receiptReference" placeholder="Ej: T123456789" />
            </label>

            <label class="field">
              <span>Nota interna</span>
              <input type="text" formControlName="notes" placeholder="Ej: Pago en caja principal" />
            </label>

            <div class="admin-inline-actions">
              <button class="button primary" type="submit" [disabled]="isSavingCashSale()">
                {{ isSavingCashSale() ? 'Guardando...' : 'Guardar venta' }}
              </button>
              <button class="button secondary" type="button" (click)="closeCreateModal()">Cancelar</button>
            </div>

            <p class="error server-error" *ngIf="cashSaleMessage()">{{ cashSaleMessage() }}</p>
          </form>
        </article>
      </div>

      <div class="admin-modal-backdrop" *ngIf="isDrawModalOpen()" (click)="closeDrawModal()">
        <article class="admin-modal admin-modal--winner" (click)="$event.stopPropagation()">
          <div class="admin-modal__header">
            <div>
              <p class="eyebrow subtle">Sorteo</p>
              <h2>Elegir ganador</h2>
              <p class="admin-copy">Se considera una entrada por cada ticket pagado para que mas tickets impliquen mas probabilidad.</p>
            </div>

            <button class="button secondary admin-button" type="button" (click)="closeDrawModal()" [disabled]="isDrawingWinner()">
              Cerrar
            </button>
          </div>

          <section class="winner-draw-panel" *ngIf="!revealedWinner(); else winnerReveal">
            <div class="winner-draw-spinner" [class.winner-draw-spinner--active]="isDrawingWinner()">
              <span class="winner-draw-spinner__halo"></span>
              <span class="winner-draw-spinner__dot"></span>
              <p class="eyebrow subtle">Seleccion aleatoria</p>
              <h3>{{ animatedWinnerPreview()?.fullName || 'Listo para sortear' }}</h3>
              <p class="admin-copy">
                {{
                  animatedWinnerPreview()
                    ? animatedWinnerPreview()?.ticketNumber + ' · ' + animatedWinnerPreview()?.packageLabel
                    : 'Usa el boton para iniciar el sorteo ponderado por tickets.'
                }}
              </p>
            </div>

            <div class="winner-draw-stats">
              <article class="meta-card">
                <span>Clientes habilitados</span>
                <strong>{{ eligiblePaidCustomersCount() }}</strong>
              </article>
              <article class="meta-card">
                <span>Tickets habilitados</span>
                <strong>{{ eligiblePaidTicketsCount() }}</strong>
              </article>
            </div>

            <div class="admin-inline-actions">
              <button class="button primary" type="button" (click)="startWinnerDraw()" [disabled]="isDrawingWinner()">
                {{ isDrawingWinner() ? 'Barajando tickets...' : 'Sortear ahora' }}
              </button>
            </div>

            <p class="error server-error" *ngIf="drawWinnerError()">{{ drawWinnerError() }}</p>
          </section>

          <ng-template #winnerReveal>
            <section class="winner-reveal-card" *ngIf="revealedWinner() as winner">
              <p class="eyebrow subtle">Ganador confirmado</p>
              <h3>{{ winner.fullName }}</h3>
              <p class="winner-reveal-card__ticket">Ticket ganador {{ winner.ticketNumber }}</p>

              <dl class="winner-reveal-grid">
                <div>
                  <dt>Email</dt>
                  <dd>{{ winner.email || 'Sin email' }}</dd>
                </div>
                <div>
                  <dt>Telefono</dt>
                  <dd>{{ winner.phone || 'Sin telefono' }}</dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>{{ winner.packageLabel }}</dd>
                </div>
                <div>
                  <dt>Tickets del cliente</dt>
                  <dd>{{ winner.ticketCount }}</dd>
                </div>
                <div>
                  <dt>Total compra</dt>
                  <dd>{{ winner.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</dd>
                </div>
                <div>
                  <dt>Fecha sorteo</dt>
                  <dd>{{ winner.createdAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
                </div>
              </dl>

              <div class="admin-inline-actions">
                <button class="button primary" type="button" (click)="runAnotherDraw()">
                  Sortear nuevamente
                </button>
                <button class="button secondary" type="button" (click)="closeDrawModal()">Cerrar</button>
              </div>
            </section>
          </ng-template>
        </article>
      </div>

      <ng-template #loginView>
        <section class="page-section admin-login">
          <article class="admin-card admin-card--login">
            <p class="eyebrow">Acceso al panel</p>
            <h1>Ingresa con tu rol</h1>
            <p class="lead">Administrador o vendedor, segun las credenciales configuradas en el servidor.</p>

            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="purchase-form">
              <label class="field">
                <span>Email</span>
                <input type="email" formControlName="email" placeholder="correo de acceso" />
              </label>

              <label class="field">
                <span>Contrasena</span>
                <input type="password" formControlName="password" placeholder="Tu contrasena" />
              </label>

              <button class="button primary submit-button" type="submit" [disabled]="isLoggingIn()">
                {{ isLoggingIn() ? 'Ingresando...' : 'Entrar al panel' }}
              </button>

              <p class="helper-text">Usa las credenciales configuradas para tu rol.</p>
              <p class="error server-error" *ngIf="loginError()">{{ loginError() }}</p>
            </form>
          </article>
        </section>
      </ng-template>
    </main>
  `,
})
export class AdminPage implements OnDestroy {
  private readonly adminApi = inject(AdminApi);
  private readonly landingApi = inject(LandingApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly pageSize = 30;

  protected readonly session = computed(() => this.adminApi.session());
  protected readonly currentRole = computed<AdminRole>(() => this.session()?.profile.role ?? 'admin');
  protected readonly isAdmin = computed(() => this.currentRole() === 'admin');
  protected readonly isSeller = computed(() => this.currentRole() === 'seller');
  protected readonly dashboard = computed(() => this.adminApi.dashboard());
  protected readonly landing = computed(() => this.landingApi.landing());
  protected readonly searchTerm = signal('');
  protected readonly channelFilter = signal<'all' | 'webpay' | 'cash'>('all');
  protected readonly statusFilter = signal<'all' | 'paid' | 'pending_payment'>('all');
  protected readonly currentPage = signal(1);
  protected readonly editingOrder = signal<AdminOrder | null>(null);
  protected readonly isCreateModalOpen = signal(false);
  protected readonly isDrawModalOpen = signal(false);
  protected readonly isLoggingIn = signal(false);
  protected readonly isSavingCashSale = signal(false);
  protected readonly isUpdatingOrder = signal(false);
  protected readonly isDrawingWinner = signal(false);
  protected readonly resendingEmailOrderId = signal<string | null>(null);
  protected readonly loginError = signal('');
  protected readonly cashSaleMessage = signal('');
  protected readonly editMessage = signal('');
  protected readonly drawWinnerError = signal('');
  protected readonly revealedWinner = signal<AdminRaffleWinner | null>(null);
  protected readonly animatedWinnerPreview = signal<WinnerPreview | null>(null);
  protected readonly toast = signal<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  protected readonly manualSaleMethods: SaleMethodOption[] = [
    { id: 'cash', label: 'Efectivo' },
    { id: 'transfer', label: 'Transferencia' },
    { id: 'debit', label: 'Debito' },
    { id: 'credit', label: 'Credito' },
  ];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private winnerAnimationTimer: ReturnType<typeof setInterval> | null = null;
  private winnerRevealTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly filteredOrders = computed(() => {
    const dashboard = this.dashboard();
    if (!dashboard) {
      return [];
    }

    const search = this.searchTerm().trim().toLowerCase();
    const channel = this.channelFilter();
    const status = this.statusFilter();

    return dashboard.orders.filter((order) => {
      const matchesSearch =
        !search ||
        [
          order.participant.fullName,
          order.participant.email ?? '',
          order.participant.phone ?? '',
          order.order.packageLabel,
          order.order.ticketNumbers.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(search);

      const matchesChannel = channel === 'all' || order.channel === channel;
      const matchesStatus = status === 'all' || order.status === status;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize)));
  protected readonly paginatedOrders = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredOrders().slice(start, start + this.pageSize);
  });
  protected readonly paginationStart = computed(() => {
    if (this.filteredOrders().length === 0) {
      return 0;
    }

    return (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize + 1;
  });
  protected readonly paginationEnd = computed(() => {
    return Math.min(this.paginationStart() + this.paginatedOrders().length - 1, this.filteredOrders().length);
  });
  protected readonly eligiblePaidOrders = computed(() =>
    (this.dashboard()?.orders ?? []).filter((order) => order.status === 'paid' && order.order.ticketNumbers.length > 0),
  );
  protected readonly recentSellerOrders = computed(() =>
    (this.dashboard()?.orders ?? []).filter((order) => order.channel === 'cash').slice(0, 3),
  );
  protected readonly eligiblePaidTicketsCount = computed(() =>
    this.eligiblePaidOrders().reduce((sum, order) => sum + order.order.participations, 0),
  );
  protected readonly eligiblePaidCustomersCount = computed(() => this.eligiblePaidOrders().length);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly cashSaleForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    email: ['', Validators.email],
    packageId: ['', Validators.required],
    saleMethod: ['cash' as ManualSaleMethod, Validators.required],
    receiptReference: [''],
    notes: [''],
  });

  protected readonly requiresReceiptReference = computed(() => {
    const method = this.cashSaleForm.controls.saleMethod.value;
    return method === 'debit' || method === 'credit';
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    email: ['', Validators.email],
    packageId: ['', Validators.required],
    status: ['paid' as 'paid' | 'pending_payment', Validators.required],
    notes: [''],
  });

  constructor() {
    this.landingApi.loadLanding();
    this.syncReceiptReferenceValidator(this.cashSaleForm.controls.saleMethod.value);
    this.cashSaleForm.controls.saleMethod.valueChanges.subscribe((method) => {
      this.syncReceiptReferenceValidator(method);
    });

    if (this.adminApi.session()) {
      this.refreshDashboard();
    }
  }

  ngOnDestroy() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.clearWinnerAnimation();
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
    this.formatCashSalePhone();
    this.normalizeCashSaleEmail();

    if (this.cashSaleForm.invalid) {
      this.cashSaleForm.markAllAsTouched();
      this.cashSaleMessage.set('Completa los datos obligatorios de la venta.');
      return;
    }

    this.isSavingCashSale.set(true);
    this.cashSaleMessage.set('');

    this.adminApi.createCashSale(this.cashSaleForm.getRawValue()).subscribe({
      next: (response) => {
        this.cashSaleMessage.set('');
        this.showToast('success', 'Venta registrada', response.message);
        this.cashSaleForm.reset({
          fullName: '',
          phone: '',
          email: '',
          packageId: '',
          saleMethod: 'cash',
          receiptReference: '',
          notes: '',
        });
        this.syncReceiptReferenceValidator('cash');
        this.currentPage.set(1);
        this.isCreateModalOpen.set(false);
        this.isSavingCashSale.set(false);
      },
      error: (error) => {
        this.cashSaleMessage.set(error.error?.message ?? 'No fue posible registrar la venta.');
        this.isSavingCashSale.set(false);
      },
    });
  }

  protected submitEdit() {
    if (!this.isAdmin()) {
      return;
    }

    const currentOrder = this.editingOrder();
    if (!currentOrder) {
      return;
    }

    this.formatEditPhone();
    this.normalizeEditEmail();

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.editMessage.set('Completa los campos del registro antes de guardar.');
      return;
    }

    this.isUpdatingOrder.set(true);
    this.editMessage.set('');

    this.adminApi.updateOrder(currentOrder.id, this.editForm.getRawValue()).subscribe({
      next: (response) => {
        this.editMessage.set(response.message);
        this.editingOrder.set(response.order);
        this.isUpdatingOrder.set(false);
      },
      error: (error) => {
        this.editMessage.set(error.error?.message ?? 'No fue posible actualizar el registro.');
        this.isUpdatingOrder.set(false);
      },
    });
  }

  protected startEdit(order: AdminOrder) {
    if (!this.isAdmin()) {
      return;
    }

    this.editingOrder.set(order);
    this.editMessage.set('');
    this.editForm.reset({
      fullName: order.participant.fullName,
      phone: order.participant.phone ?? '',
      email: order.participant.email ?? '',
      packageId: order.order.packageId,
      status: order.status,
      notes: order.notes ?? '',
    });
    this.formatEditPhone();
    this.normalizeEditEmail();
  }

  protected cancelEdit() {
    if (!this.isAdmin()) {
      return;
    }

    this.editingOrder.set(null);
    this.editMessage.set('');
    this.editForm.reset({
      fullName: '',
      phone: '',
      email: '',
      packageId: '',
      status: 'paid',
      notes: '',
    });
  }

  protected deleteOrder(order: AdminOrder) {
    if (!this.isAdmin()) {
      return;
    }

    const shouldDelete = typeof window === 'undefined' ? true : window.confirm(`Eliminar registro de ${order.participant.fullName}?`);
    if (!shouldDelete) {
      return;
    }

    this.editMessage.set('');
    this.cashSaleMessage.set('');

    this.adminApi.deleteOrder(order.id).subscribe({
      next: (response) => {
        if (this.editingOrder()?.id === order.id) {
          this.cancelEdit();
        }

        this.cashSaleMessage.set(response.message);
        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
      },
      error: (error) => {
        this.cashSaleMessage.set(error.error?.message ?? 'No fue posible eliminar el registro.');
      },
    });
  }

  protected resendEmail(order: AdminOrder) {
    if (!this.isAdmin()) {
      return;
    }

    if (!order.participant.email || this.resendingEmailOrderId() === order.id) {
      return;
    }

    this.resendingEmailOrderId.set(order.id);

    this.adminApi.resendOrderEmail(order.id).subscribe({
      next: (response) => {
        this.resendingEmailOrderId.set(null);
        this.showToast('success', 'Correo enviado', response.message);
      },
      error: (error) => {
        this.resendingEmailOrderId.set(null);
        this.showToast('error', 'No se pudo enviar', error.error?.message ?? 'No fue posible reenviar el correo.');
      },
    });
  }

  protected openDrawModal() {
    if (!this.isAdmin()) {
      return;
    }

    this.drawWinnerError.set('');
    this.revealedWinner.set(null);
    this.animatedWinnerPreview.set(null);
    this.isDrawModalOpen.set(true);
  }

  protected closeDrawModal() {
    if (!this.isAdmin()) {
      return;
    }

    if (this.isDrawingWinner()) {
      return;
    }

    this.drawWinnerError.set('');
    this.revealedWinner.set(null);
    this.animatedWinnerPreview.set(null);
    this.isDrawModalOpen.set(false);
    this.clearWinnerAnimation();
  }

  protected startWinnerDraw() {
    if (!this.isAdmin()) {
      return;
    }

    if (this.isDrawingWinner()) {
      return;
    }

    const ticketPool = this.buildWinnerPreviewPool();
    if (ticketPool.length === 0) {
      this.drawWinnerError.set('No hay compras pagadas con tickets disponibles para realizar el sorteo.');
      return;
    }

    this.drawWinnerError.set('');
    this.revealedWinner.set(null);
    this.isDrawingWinner.set(true);
    this.isDrawModalOpen.set(true);
    this.animatedWinnerPreview.set(ticketPool[0] ?? null);
    this.startWinnerAnimation(ticketPool);

    const drawStartedAt = Date.now();
    const minimumAnimationMs = 3200;

    this.adminApi.drawWinner().subscribe({
      next: (response) => {
        const delay = Math.max(0, minimumAnimationMs - (Date.now() - drawStartedAt));
        this.winnerRevealTimer = setTimeout(() => {
          this.clearWinnerAnimation();
          this.revealedWinner.set(response.winner);
          this.animatedWinnerPreview.set({
            fullName: response.winner.fullName,
            ticketNumber: response.winner.ticketNumber,
            packageLabel: response.winner.packageLabel,
          });
          this.isDrawingWinner.set(false);
          this.showToast('success', 'Ganador seleccionado', response.message);
        }, delay);
      },
      error: (error) => {
        this.clearWinnerAnimation();
        this.isDrawingWinner.set(false);
        this.drawWinnerError.set(error.error?.message ?? 'No fue posible completar el sorteo.');
      },
    });
  }

  protected runAnotherDraw() {
    if (!this.isAdmin()) {
      return;
    }

    this.revealedWinner.set(null);
    this.startWinnerDraw();
  }

  protected setSearch(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  protected setChannel(value: string) {
    this.channelFilter.set(value === 'webpay' || value === 'cash' ? value : 'all');
    this.currentPage.set(1);
  }

  protected setStatus(value: string) {
    this.statusFilter.set(value === 'paid' || value === 'pending_payment' ? value : 'all');
    this.currentPage.set(1);
  }

  protected previousPage() {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  protected nextPage() {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  protected downloadExcel() {
    if (!this.isAdmin()) {
      return;
    }

    const rows = this.filteredOrders();
    const workbook = buildExcelWorkbook(rows);
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'funkids-registros.xls';
    link.click();
    URL.revokeObjectURL(url);
  }

  protected logout() {
    this.adminApi.logout();
  }

  protected openCreateModal() {
    if (!this.isAdmin()) {
      return;
    }

    this.cashSaleMessage.set('');
    this.isCreateModalOpen.set(true);
  }

  protected closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  protected hasCashSaleError(controlName: keyof typeof this.cashSaleForm.controls, errorName: string) {
    const control = this.cashSaleForm.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  protected hasEditError(controlName: keyof typeof this.editForm.controls, errorName: string) {
    const control = this.editForm.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  protected formatCashSalePhone() {
    this.applyPhoneMask(this.cashSaleForm.controls.phone);
  }

  protected formatEditPhone() {
    this.applyPhoneMask(this.editForm.controls.phone);
  }

  protected normalizeCashSaleEmail() {
    this.normalizeEmailControl(this.cashSaleForm.controls.email);
  }

  protected normalizeEditEmail() {
    this.normalizeEmailControl(this.editForm.controls.email);
  }

  private syncReceiptReferenceValidator(method: ManualSaleMethod) {
    const control = this.cashSaleForm.controls.receiptReference;
    const requiresReference = method === 'debit' || method === 'credit';

    if (requiresReference) {
      control.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      control.clearValidators();
      control.setValue('', { emitEvent: false });
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  private showToast(type: 'success' | 'error', title: string, message: string) {
    this.toast.set({ type, title, message });

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toast.set(null);
      this.toastTimer = null;
    }, 4200);
  }

  private refreshDashboard() {
    this.adminApi.loadDashboard().subscribe({
      next: () => {
        this.currentPage.set(1);
      },
      error: (error) => {
        const status = Number(error?.status ?? 0);
        const message = error?.error?.message ?? 'No fue posible cargar el panel. Intenta nuevamente.';

        if (status === 401 || status === 403) {
          this.adminApi.logout();
          this.loginError.set('La sesion expiro. Vuelve a ingresar.');
          return;
        }

        this.showToast('error', 'No se pudo cargar el panel', message);
        this.loginError.set(message);
      },
    });
  }

  private buildWinnerPreviewPool() {
    return this.eligiblePaidOrders().flatMap((order) =>
      order.order.ticketNumbers.map((ticketNumber) => ({
        fullName: order.participant.fullName,
        ticketNumber,
        packageLabel: order.order.packageLabel,
      })),
    );
  }

  private startWinnerAnimation(pool: WinnerPreview[]) {
    this.clearWinnerAnimation();
    this.winnerAnimationTimer = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * pool.length);
      this.animatedWinnerPreview.set(pool[nextIndex] ?? pool[0] ?? null);
    }, 110);
  }

  private clearWinnerAnimation() {
    if (this.winnerAnimationTimer) {
      clearInterval(this.winnerAnimationTimer);
      this.winnerAnimationTimer = null;
    }

    if (this.winnerRevealTimer) {
      clearTimeout(this.winnerRevealTimer);
      this.winnerRevealTimer = null;
    }
  }

  private applyPhoneMask(control: FormControl<string>) {
    const digits = control.value.replace(/\D/g, '').slice(0, 11);

    if (!digits) {
      control.setValue('', { emitEvent: false });
      return;
    }

    let formatted = '';

    if (digits.startsWith('56')) {
      const nationalDigits = digits.slice(2);
      formatted = '+56';

      if (nationalDigits.length > 0) {
        formatted += ` ${nationalDigits.slice(0, 1)}`;
      }

      if (nationalDigits.length > 1) {
        formatted += ` ${nationalDigits.slice(1, 5)}`;
      }

      if (nationalDigits.length > 5) {
        formatted += ` ${nationalDigits.slice(5, 9)}`;
      }
    } else {
      const normalizedDigits = digits.startsWith('9') ? digits : `9${digits}`.slice(0, 9);
      formatted = '+56';

      if (normalizedDigits.length > 0) {
        formatted += ` ${normalizedDigits.slice(0, 1)}`;
      }

      if (normalizedDigits.length > 1) {
        formatted += ` ${normalizedDigits.slice(1, 5)}`;
      }

      if (normalizedDigits.length > 5) {
        formatted += ` ${normalizedDigits.slice(5, 9)}`;
      }
    }

    control.setValue(formatted, { emitEvent: false });
  }

  private normalizeEmailControl(control: FormControl<string>) {
    control.setValue(control.value.trim().toLowerCase(), { emitEvent: false });
  }
}

function buildExcelWorkbook(orders: AdminOrder[]) {
  const rows = orders
    .map(
      (order) => `
        <tr>
          <td>${escapeExcel(order.participant.fullName)}</td>
          <td>${escapeExcel(order.participant.email ?? '')}</td>
          <td>${escapeExcel(order.participant.phone ?? '')}</td>
          <td>${escapeExcel(order.createdAt)}</td>
          <td>${escapeExcel(order.sourceLabel)}</td>
          <td>${escapeExcel(order.status)}</td>
          <td>${escapeExcel(order.order.packageLabel)}</td>
          <td>${order.order.ticketNumbers.length}</td>
          <td>${order.order.participations}</td>
          <td>${order.order.amount}</td>
          <td>${escapeExcel(order.order.ticketNumbers.join(', '))}</td>
          <td>${escapeExcel(order.notes ?? '')}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #d0d7e2; padding: 8px; text-align: left; }
        th { background: #e7f5ff; color: #3f95cc; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Fecha</th>
            <th>Canal</th>
            <th>Estado</th>
            <th>Modalidad</th>
            <th>Tickets</th>
            <th>Participaciones</th>
            <th>Total</th>
            <th>Numeros</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
  </html>`;
}

function escapeExcel(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
