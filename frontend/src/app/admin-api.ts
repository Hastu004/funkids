import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import type { PackageId, PaymentMethodId } from './landing-api';

const apiBaseUrl = '/api';

const ADMIN_STORAGE_KEY = 'funkids_admin_session';

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export interface AdminSession {
  token: string;
  profile: AdminProfile;
}

export interface AdminOrder {
  id: string;
  createdAt: string;
  channel: 'webpay' | 'cash';
  status: 'paid' | 'pending_payment';
  sourceLabel: string;
  notes: string | null;
  participant: {
    fullName: string;
    email: string | null;
    phone: string | null;
    wantsAccount: boolean;
  };
  order: {
    packageId: PackageId;
    packageLabel: string;
    participations: number;
    ticketNumbers: string[];
    amount: number;
    paymentMethod: PaymentMethodId;
    paymentLabel: string;
  };
}

export interface AdminOrderMutationResponse {
  message: string;
  order: AdminOrder;
  stats: AdminDashboardResponse['stats'];
}

export interface AdminReceiptResponse {
  message: string;
  deliveredAt: string;
  orderId: string;
}

export interface AdminRaffleWinner {
  id: number;
  orderId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  ticketNumber: string;
  ticketCount: number;
  packageLabel: string;
  amount: number;
  createdAt: string;
}

export interface AdminDrawWinnerResponse {
  message: string;
  winner: AdminRaffleWinner;
  eligibleEntries: number;
  eligibleCustomers: number;
}

export interface AdminDashboardResponse {
  profile: AdminProfile;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalTickets: number;
    totalParticipations: number;
    cashSales: number;
    webpaySales: number;
  };
  orders: AdminOrder[];
  latestWinner: AdminRaffleWinner | null;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);

  readonly session = signal<AdminSession | null>(readStoredSession());
  readonly dashboard = signal<AdminDashboardResponse | null>(null);

  login(payload: { email: string; password: string }) {
    return this.http.post<AdminSession>(`${apiBaseUrl}/admin/login`, payload).pipe(
      tap((session) => {
        this.session.set(session);
        storeSession(session);
      }),
    );
  }

  logout() {
    this.session.set(null);
    this.dashboard.set(null);
    clearStoredSession();
  }

  loadDashboard() {
    return this.http
      .get<AdminDashboardResponse>(`${apiBaseUrl}/admin/orders`, { headers: this.buildHeaders() })
      .pipe(tap((dashboard) => this.dashboard.set(dashboard)));
  }

  createCashSale(payload: { fullName: string; email: string; phone: string; packageId: string; notes: string }) {
    return this.http
      .post<AdminOrderMutationResponse>(
        `${apiBaseUrl}/admin/cash-sale`,
        payload,
        { headers: this.buildHeaders() },
      )
      .pipe(
        tap((response) => {
          const current = this.dashboard();
          if (!current) {
            return;
          }

          this.dashboard.set({
            ...current,
            stats: response.stats,
            orders: [response.order, ...current.orders],
          });
        }),
      );
  }

  updateOrder(
    orderId: string,
    payload: {
      fullName: string;
      email: string;
      phone: string;
      packageId: string;
      status: 'paid' | 'pending_payment';
      notes: string;
    },
  ) {
    return this.http
      .put<AdminOrderMutationResponse>(`${apiBaseUrl}/admin/orders/${orderId}`, payload, {
        headers: this.buildHeaders(),
      })
      .pipe(
        tap((response) => {
          const current = this.dashboard();
          if (!current) {
            return;
          }

          this.dashboard.set({
            ...current,
            stats: response.stats,
            orders: current.orders.map((order) => (order.id === orderId ? response.order : order)),
          });
        }),
      );
  }

  deleteOrder(orderId: string) {
    return this.http
      .delete<AdminOrderMutationResponse>(`${apiBaseUrl}/admin/orders/${orderId}`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        tap((response) => {
          const current = this.dashboard();
          if (!current) {
            return;
          }

          this.dashboard.set({
            ...current,
            stats: response.stats,
            orders: current.orders.filter((order) => order.id !== orderId),
          });
        }),
      );
  }

  resendOrderEmail(orderId: string) {
    return this.http.post<AdminReceiptResponse>(
      `${apiBaseUrl}/admin/orders/resend-email`,
      { orderId },
      { headers: this.buildHeaders() },
    );
  }

  drawWinner() {
    return this.http
      .post<AdminDrawWinnerResponse>(`${apiBaseUrl}/admin/draw-winner`, {}, { headers: this.buildHeaders() })
      .pipe(
        tap((response) => {
          const current = this.dashboard();
          if (!current) {
            return;
          }

          this.dashboard.set({
            ...current,
            latestWinner: response.winner,
          });
        }),
      );
  }

  private buildHeaders() {
    const token = this.session()?.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
}

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AdminSession;
  } catch {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    return null;
  }
}

function storeSession(session: AdminSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
}
