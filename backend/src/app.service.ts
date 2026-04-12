import { BadRequestException, Injectable } from '@nestjs/common';

type PaymentMethod = 'transbank';
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
          'La compra requiere un correo valido y el pago se realiza online con Webpay.',
      },
    raffle: {
      title: 'Cumpleanos Sonado Fun Kids',
      drawDate: '30 de junio de 2026',
      salePeriod: '16 de abril de 2026 al 29 de junio de 2026',
      maxParticipations: 1000,
      legalDisclaimer:
        'La participacion implica aceptacion total de las bases y no aplica derecho a retracto por tratarse de un producto digital.',
    },
    prizes: [
      {
        title: 'Cumpleanos Fun Kids Puertas Abiertas - Full',
        items: ['Hasta 25 niños', '3 horas de duracion', 'Juegos y espacio exclusivo', 'Caja sorpresa + pase estrella'],
      },
      {
        title: 'Feria Fun Kids',
        items: [
          'Para 25 niños',
          'Maquina de palomitas',
          'Maquina de burbujas',
          'Algodon de azucar',
          'Aguas saborizadas',
          'Carro de snacks',
          'Stand tipo feria',
          'Juegos recreativos',
          'Valido solo dentro de la comuna de Calama',
        ],
      },
    ],
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
    legalSections: [
      {
        title: 'I. Identificacion del organizador',
        paragraphs: [
          'El presente sorteo es organizado por Fun Kids Diversiones SpA, RUT 76.844.333-5, con domicilio en Avenida Balmaceda 2902, local 1010, comuna de Calama.',
        ],
      },
      {
        title: 'II. Naturaleza del sorteo',
        paragraphs: [
          'El presente sorteo tiene caracter promocional y no constituye un juego de azar en los terminos de la legislacion chilena vigente.',
          'La participacion se obtiene mediante la adquisicion de un producto digital denominado "Participacion Digital Fun Kids – Experiencias", el cual otorga acceso al sorteo.',
          'El producto digital adquirido no corresponde a un boleto de apuesta, sino a un bien intangible promocional.',
        ],
      },
      {
        title: 'III. Vigencia',
        paragraphs: [
          'El sorteo se desarrollara entre el 16 de abril de 2026 y el 29 de junio de 2026.',
          'El sorteo se realizara el dia 30 de junio de 2026 mediante transmision en vivo.',
        ],
      },
      {
        title: 'IV. Mecanica de participacion',
        paragraphs: [
          'La participacion se obtiene mediante la compra de participaciones digitales bajo las siguientes modalidades.',
          '$2.000: 1 participacion. $5.000: 3 participaciones. $15.000: 10 participaciones. $30.000: 25 participaciones.',
          'El maximo total sera de 1.000 participaciones.',
          'Cada participacion sera registrada en una base de datos unica y numerada.',
        ],
      },
      {
        title: 'V. Premio',
        paragraphs: ['El ganador podra elegir una de las siguientes opciones.'],
        bullets: [
          'Opcion 1: Cumpleanos Fun Kids Puertas abiertas - Full.',
          'Hasta 25 niños.',
          '3 horas de duracion.',
          'Juegos y espacio exclusivo.',
          'Caja sorpresa + pase estrella.',
          'Opcion 2: Feria Fun Kids.',
          'Para 25 niños.',
          'Maquina de palomitas.',
          'Maquina de burbujas.',
          'Algodon de azucar.',
          'Aguas saborizadas.',
          'Carro de snacks.',
          'Stand tipo feria.',
          'Juegos recreativos.',
          'Valido solo dentro de la comuna de Calama.',
        ],
      },
      {
        title: 'VI. Condiciones del premio',
        bullets: [
          'El premio debera ser utilizado dentro de un plazo maximo de 12 meses.',
          'El uso del premio estara sujeto a disponibilidad del Organizador.',
          'Podra ser transferido previa autorizacion.',
          'En caso de feria, incluye traslado dentro de Calama.',
          'Cualquier servicio adicional sera de cargo del ganador.',
        ],
      },
      {
        title: 'VII. Participantes',
        bullets: [
          'Podran participar personas mayores de 18 anos con residencia en Chile.',
          'No podran participar trabajadores del Organizador.',
        ],
      },
      {
        title: 'VIII. Sorteo',
        bullets: [
          'El sorteo se realizara mediante seleccion aleatoria usando plataforma digital.',
          'Se elegira un ganador y dos suplentes.',
          'El proceso sera transmitido en vivo via Instagram.',
        ],
      },
      {
        title: 'IX. Responsabilidad',
        bullets: [
          'El Organizador garantiza la correcta ejecucion del sorteo.',
          'No sera responsable por hechos de fuerza mayor.',
          'El Organizador no sera responsable por fallas externas tecnologicas.',
        ],
      },
      {
        title: 'X. Proteccion de datos',
        bullets: [
          'Los datos seran utilizados exclusivamente para fines del sorteo.',
          'El participante autoriza el uso de sus datos para comunicaciones futuras.',
        ],
      },
      {
        title: 'XI. Derecho a retracto',
        bullets: [
          'Al tratarse de un producto digital, no aplica derecho a retracto conforme a la legislacion vigente.',
          'No se realizaran devoluciones una vez efectuada la compra.',
        ],
      },
      {
        title: 'XII. Aceptacion',
        paragraphs: ['La participacion implica la aceptacion total de estas bases.'],
      },
    ],
    packages,
      paymentMethods: [
        {
          id: 'transbank',
          name: 'Webpay',
          description: 'Pago online con Transbank.',
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

    if (payload.paymentMethod !== 'transbank') {
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
        paymentLabel: 'Webpay by Transbank',
      },
      nextStep: 'Redirigir al checkout de Webpay para completar el pago.',
      message:
        'Solicitud recibida. En una integracion real, aqui se generaria la sesion de pago y se enviaria el comprobante al email del cliente.',
    };
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  }
}
