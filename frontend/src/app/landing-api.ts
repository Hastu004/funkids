import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type PaymentMethodId = 'transbank';
export type PackageId = 'pkg_2000' | 'pkg_5000' | 'pkg_15000' | 'pkg_30000';

export interface LandingData {
  brand: string;
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  raffle: {
    title: string;
    drawDate: string;
    salePeriod: string;
    maxParticipations: number;
    legalDisclaimer: string;
  };
  prizes: Array<{
    title: string;
    items: string[];
  }>;
  highlights: Array<{
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  contact: {
    email: string;
    schedule: string;
  };
  legalSections: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
  packages: Array<{
    id: PackageId;
    amount: number;
    participations: number;
    label: string;
  }>;
  paymentMethods: Array<{
    id: PaymentMethodId;
    name: string;
    description: string;
  }>;
}

export interface PurchaseResponse {
  status: string;
  participant: {
    fullName: string;
    email: string;
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
  nextStep: string;
  message: string;
  webpay?: {
    token: string;
    url: string;
    buyOrder: string;
    sessionId: string;
  };
}

export interface WebpayResultResponse {
  orderId: string;
  status: 'approved' | 'pending' | 'rejected' | 'aborted' | 'timeout';
  title: string;
  message: string;
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
  payment: {
    buyOrder: string;
    sessionId: string;
    token: string;
    status: string;
    responseCode: number | null;
    authorizationCode: string | null;
    paymentTypeCode: string | null;
    cardNumber: string | null;
    transactionDate: string | null;
    accountingDate: string | null;
    vci: string | null;
    lastError: string | null;
  } | null;
}

const apiBaseUrl =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

@Injectable({ providedIn: 'root' })
export class LandingApi {
  private readonly http = inject(HttpClient);

  readonly landing = signal<LandingData | null>(null);

  loadLanding() {
    if (this.landing()) {
      return;
    }

    this.http.get<LandingData>(`${apiBaseUrl}/landing`).subscribe({
      next: (landing) => this.landing.set(landing),
    });
  }

  purchase(payload: Record<string, unknown>) {
    return this.http.post<PurchaseResponse>(`${apiBaseUrl}/purchase`, payload);
  }

  loadWebpayResult(orderId: string) {
    return this.http.get<WebpayResultResponse>(`${apiBaseUrl}/webpay/result`, {
      params: { orderId },
    });
  }
}
