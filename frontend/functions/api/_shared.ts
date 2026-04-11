export type PaymentMethod = 'transbank' | 'khipu';

export interface PurchasePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  ticketCount?: number;
  wantsAccount?: boolean;
  password?: string;
  paymentMethod?: PaymentMethod;
  acceptedTerms?: boolean;
}

export function getLandingData() {
  return {
    brand: 'FunKids',
    hero: {
      badge: 'Sorteo solidario y familiar',
      title: 'Compra tus tickets FunKids en minutos.',
      description:
        'Tus clientes pueden participar del sorteo registrandose o comprando solo con su email. El flujo deja claro que el correo debe ser valido y permite pagar con Transbank o Khipu.',
    },
    raffle: {
      title: 'Gran sorteo FunKids',
      drawDate: '31 de mayo de 2026',
      ticketPrice: 3500,
      totalTickets: 5000,
      remainingTickets: 1874,
      legalDisclaimer:
        'La participacion queda sujeta a validacion de pago, revision del email ingresado y aceptacion de las bases legales del sorteo.',
    },
    highlights: [
      {
        title: 'Registro opcional',
        description:
          'Cada cliente elige si quiere crear una cuenta o comprar rapido indicando solo sus datos esenciales.',
      },
      {
        title: 'Email validado',
        description:
          'El formulario exige un correo con formato valido para asegurar confirmaciones y envio de comprobantes.',
      },
      {
        title: 'Dos medios de pago',
        description:
          'Checkout preparado para Transbank y Khipu, mostrando el canal elegido antes de confirmar.',
      },
    ],
    faqs: [
      {
        question: 'Se puede comprar sin registrarse?',
        answer:
          'Si. El cliente puede completar una compra express usando su nombre, email valido y la cantidad de tickets.',
      },
      {
        question: 'Cuando se confirma la compra?',
        answer:
          'La compra se confirma una vez recibido el pago y enviado el comprobante al email del participante.',
      },
      {
        question: 'Que pasa si el cliente quiere cuenta?',
        answer:
          'Puede activar la opcion de registro durante la compra y definir una contrasena para futuras compras.',
      },
    ],
    contact: {
      email: 'sorteo@funkids.cl',
      schedule: 'Atencion digital de lunes a domingo, 09:00 a 20:00.',
    },
    paymentMethods: [
      {
        id: 'transbank',
        name: 'Transbank',
        description: 'Pago con tarjetas en el checkout del sorteo.',
      },
      {
        id: 'khipu',
        name: 'Khipu',
        description: 'Transferencia guiada y confirmacion online de pago.',
      },
    ],
  };
}

export function createPurchase(payload: PurchasePayload) {
  const email = payload.email?.trim().toLowerCase();
  const fullName = payload.fullName?.trim();
  const wantsAccount = Boolean(payload.wantsAccount);
  const acceptedTerms = Boolean(payload.acceptedTerms);
  const ticketCount = Number(payload.ticketCount);

  if (!fullName) {
    return jsonError('El nombre es obligatorio.', 400);
  }

  if (!email || !isValidEmail(email)) {
    return jsonError('Debes ingresar un email valido.', 400);
  }

  if (!Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 20) {
    return jsonError('La cantidad de tickets debe ser entre 1 y 20.', 400);
  }

  if (!acceptedTerms) {
    return jsonError('Debes aceptar las bases legales.', 400);
  }

  if (!payload.paymentMethod || !['transbank', 'khipu'].includes(payload.paymentMethod)) {
    return jsonError('Selecciona un medio de pago disponible.', 400);
  }

  if (wantsAccount && (!payload.password || payload.password.trim().length < 6)) {
    return jsonError('Si deseas registrarte, la contrasena debe tener al menos 6 caracteres.', 400);
  }

  const amount = ticketCount * 3500;
  const ticketNumbers = Array.from({ length: ticketCount }, (_, index) => {
    return `FK-${String(1200 + index + Math.floor(Math.random() * 8000)).padStart(4, '0')}`;
  });

  return Response.json({
    status: 'pending_payment',
    participant: {
      fullName,
      email,
      phone: payload.phone?.trim() || null,
      wantsAccount,
    },
    order: {
      ticketCount,
      ticketNumbers,
      amount,
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
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}
