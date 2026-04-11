import { BadRequestException, Injectable } from '@nestjs/common';

type PaymentMethod = 'transbank' | 'khipu';
type PackageId = 'pkg_2000' | 'pkg_5000' | 'pkg_15000' | 'pkg_30000';

interface PurchasePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  packageId?: PackageId;
  wantsAccount?: boolean;
  password?: string;
  paymentMethod?: PaymentMethod;
  acceptedTerms?: boolean;
}

const packages = [
  { id: 'pkg_2000' as const, amount: 2000, participations: 1, label: '$2.000 · 1 ticket' },
  { id: 'pkg_5000' as const, amount: 5000, participations: 3, label: '$5.000 · 3 tickets' },
  { id: 'pkg_15000' as const, amount: 15000, participations: 10, label: '$15.000 · 10 tickets' },
  { id: 'pkg_30000' as const, amount: 30000, participations: 25, label: '$30.000 · 25 tickets' },
];

@Injectable()
export class AppService {
  getLandingData() {
    return {
      brand: 'FunKids',
      hero: {
        badge: 'Bases legales del sorteo',
        title: 'Compra tus tickets.',
        description:
          'La compra requiere un correo valido y el pago puede realizarse con Transbank o Khipu.',
      },
      raffle: {
        title: 'Cumpleanos Sonado Fun Kids',
        drawDate: '30 de junio de 2026',
        salePeriod: '16 de abril de 2026 al 29 de junio de 2026',
        maxParticipations: 1000,
        legalDisclaimer:
          'La participacion implica aceptacion total de las bases y no aplica derecho a retracto por tratarse de un producto digital.',
      },
      highlights: [
        {
          title: 'Tickets del sorteo',
          description: 'La compra se realiza en modalidades definidas en las bases.',
        },
        {
          title: 'Sorteo en vivo',
          description: 'El sorteo se realizara mediante transmision en vivo el 30 de junio de 2026.',
        },
        {
          title: 'Mayor de 18 anos',
          description: 'Pueden participar personas mayores de 18 anos con residencia en Chile.',
        },
      ],
      faqs: [
        {
          question: 'Como se participa?',
          answer: 'La compra se realiza seleccionando una de las modalidades disponibles.',
        },
        {
          question: 'Cuando se realiza el sorteo?',
          answer: 'El sorteo se realiza el 30 de junio de 2026 mediante transmision en vivo via Instagram.',
        },
        {
          question: 'Quien puede participar?',
          answer: 'Personas mayores de 18 anos con residencia en Chile. No pueden participar trabajadores del organizador.',
        },
      ],
      contact: {
        email: 'sorteo@funkids.cl',
        schedule: 'Atencion digital de lunes a domingo, 09:00 a 20:00.',
      },
      packages,
      paymentMethods: [
        {
          id: 'transbank',
          name: 'Transbank',
          description: 'Pago online.',
        },
        {
          id: 'khipu',
          name: 'Khipu',
          description: 'Pago online.',
        },
      ],
    };
  }

  createPurchase(payload: PurchasePayload) {
    const email = payload.email?.trim().toLowerCase();
    const fullName = payload.fullName?.trim();
    const wantsAccount = Boolean(payload.wantsAccount);
    const acceptedTerms = Boolean(payload.acceptedTerms);
    const selectedPackage = packages.find((item) => item.id === payload.packageId);

    if (!fullName) {
      throw new BadRequestException('El nombre es obligatorio.');
    }

    if (!email || !this.isValidEmail(email)) {
      throw new BadRequestException('Debes ingresar un email valido.');
    }

    if (!selectedPackage) {
      throw new BadRequestException('Debes seleccionar una modalidad de tickets.');
    }

    if (!acceptedTerms) {
      throw new BadRequestException('Debes aceptar las bases legales.');
    }

    if (!payload.paymentMethod || !['transbank', 'khipu'].includes(payload.paymentMethod)) {
      throw new BadRequestException('Selecciona un medio de pago disponible.');
    }

    if (wantsAccount && (!payload.password || payload.password.trim().length < 6)) {
      throw new BadRequestException('Si deseas registrarte, la contrasena debe tener al menos 6 caracteres.');
    }

    const ticketNumbers = Array.from({ length: selectedPackage.participations }, (_, index) => {
      return `FK-${String(1200 + index + Math.floor(Math.random() * 8000)).padStart(4, '0')}`;
    });

    return {
      status: 'pending_payment',
      participant: {
        fullName,
        email,
        phone: payload.phone?.trim() || null,
        wantsAccount,
      },
      order: {
        packageId: selectedPackage.id,
        packageLabel: selectedPackage.label,
        participations: selectedPackage.participations,
        ticketNumbers,
        amount: selectedPackage.amount,
        paymentMethod: payload.paymentMethod,
        paymentLabel:
          payload.paymentMethod === 'transbank' ? 'Transbank' : 'Khipu',
      },
      nextStep:
        payload.paymentMethod === 'transbank'
          ? 'Redirigir al checkout de Transbank para completar el pago.'
          : 'Redirigir a Khipu para completar la transferencia guiada.',
      message:
        'Solicitud recibida. En una integracion real, aqui se generaria la sesion de pago y se enviaria el comprobante al email del cliente.',
    };
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  }
}
