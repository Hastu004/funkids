import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApi, type AdminOrder } from './admin-api';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <main class="page-shell admin-page" *ngIf="landing() as landingData">
      <aside class="toast-message" *ngIf="toast() as toastState" [class.toast-message--error]="toastState.type === 'error'">
        <strong>{{ toastState.type === 'success' ? 'Correo enviado' : 'No se pudo enviar' }}</strong>
        <p>{{ toastState.message }}</p>
      </aside>

      <section class="page-section admin-layout" *ngIf="session(); else loginView">
        <div class="admin-header-card">
          <div class="admin-header-card__copy">
            <p class="eyebrow">Panel administrador</p>
            <h1 class="admin-title">Historial del sorteo</h1>
            <p class="lead admin-lead">Filtra, edita y exporta registros desde una sola tabla.</p>
          </div>

          <div class="admin-header-card__actions">
            <p class="admin-user">{{ session()?.profile?.name }}</p>
            <div class="admin-header-card__buttons">
              <button class="button secondary" type="button" (click)="downloadExcel()">
                Descargar Excel
              </button>
              <button class="button secondary" type="button" (click)="logout()">Cerrar sesion</button>
            </div>
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

        <section class="admin-grid" [class.admin-grid--editing]="!!editingOrder()" *ngIf="dashboard() as dashboardData">
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
                  <input type="tel" formControlName="phone" />
                </label>

                <label class="field">
                  <span>Email opcional</span>
                  <input type="email" formControlName="email" />
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

              <button class="button primary admin-button admin-button--create" type="button" (click)="openCreateModal()">
                Crear venta
              </button>
            </div>

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
      </section>

      <div class="admin-modal-backdrop" *ngIf="isCreateModalOpen()" (click)="closeCreateModal()">
        <article class="admin-modal" (click)="$event.stopPropagation()">
          <div class="admin-modal__header">
            <div>
              <p class="eyebrow subtle">Crear</p>
              <h2>Ingresar pago en efectivo</h2>
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
            </div>

            <label class="field">
              <span>Nota interna</span>
              <input type="text" formControlName="notes" placeholder="Ej: Pago en caja principal" />
            </label>

            <div class="admin-inline-actions">
              <button class="button primary" type="submit" [disabled]="isSavingCashSale()">
                {{ isSavingCashSale() ? 'Guardando...' : 'Guardar venta en efectivo' }}
              </button>
              <button class="button secondary" type="button" (click)="closeCreateModal()">Cancelar</button>
            </div>

            <p class="error server-error" *ngIf="cashSaleMessage()">{{ cashSaleMessage() }}</p>
          </form>
        </article>
      </div>

      <ng-template #loginView>
        <section class="page-section admin-login">
          <article class="admin-card admin-card--login">
            <p class="eyebrow">Acceso administrador</p>
            <h1>Ingresa al panel del sorteo</h1>
            <p class="lead">Desde aqui puedes revisar las compras y registrar ventas en efectivo.</p>

            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="purchase-form">
              <label class="field">
                <span>Email admin</span>
                <input type="email" formControlName="email" placeholder="correo administrador" />
              </label>

              <label class="field">
                <span>Contrasena</span>
                <input type="password" formControlName="password" placeholder="Tu contrasena" />
              </label>

              <button class="button primary submit-button" type="submit" [disabled]="isLoggingIn()">
                {{ isLoggingIn() ? 'Ingresando...' : 'Entrar al panel' }}
              </button>

              <p class="helper-text">Usa las credenciales configuradas para el panel administrador.</p>
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
  private readonly pageSize = 8;

  protected readonly session = computed(() => this.adminApi.session());
  protected readonly dashboard = computed(() => this.adminApi.dashboard());
  protected readonly landing = computed(() => this.landingApi.landing());
  protected readonly searchTerm = signal('');
  protected readonly channelFilter = signal<'all' | 'webpay' | 'cash'>('all');
  protected readonly statusFilter = signal<'all' | 'paid' | 'pending_payment'>('all');
  protected readonly currentPage = signal(1);
  protected readonly editingOrder = signal<AdminOrder | null>(null);
  protected readonly isCreateModalOpen = signal(false);
  protected readonly isLoggingIn = signal(false);
  protected readonly isSavingCashSale = signal(false);
  protected readonly isUpdatingOrder = signal(false);
  protected readonly resendingEmailOrderId = signal<string | null>(null);
  protected readonly loginError = signal('');
  protected readonly cashSaleMessage = signal('');
  protected readonly editMessage = signal('');
  protected readonly toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

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

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly cashSaleForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    packageId: ['', Validators.required],
    notes: [''],
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    packageId: ['', Validators.required],
    status: ['paid' as 'paid' | 'pending_payment', Validators.required],
    notes: [''],
  });

  constructor() {
    this.landingApi.loadLanding();

    if (this.adminApi.session()) {
      this.refreshDashboard();
    }
  }

  ngOnDestroy() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
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
    const currentOrder = this.editingOrder();
    if (!currentOrder) {
      return;
    }

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
  }

  protected cancelEdit() {
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
    this.cashSaleMessage.set('');
    this.isCreateModalOpen.set(true);
  }

  protected closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  private refreshDashboard() {
    this.adminApi.loadDashboard().subscribe({
      next: () => {
        this.currentPage.set(1);
      },
      error: () => {
        this.adminApi.logout();
        this.loginError.set('La sesion admin expiro. Vuelve a ingresar.');
      },
    });
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
