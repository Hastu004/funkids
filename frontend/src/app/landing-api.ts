import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type PaymentMethodId = 'transbank' | 'khipu';

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
    ticketPrice: number;
    totalTickets: number;
    remainingTickets: number;
    legalDisclaimer: string;
  };
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
    ticketCount: number;
    ticketNumbers: string[];
    amount: number;
    paymentMethod: PaymentMethodId;
    paymentLabel: string;
  };
  nextStep: string;
  message: string;
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
}
