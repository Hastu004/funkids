import { connect } from 'cloudflare:sockets';

export type PaymentMethod = 'transbank';
export type PackageId = 'pkg_2000' | 'pkg_5000' | 'pkg_15000' | 'pkg_30000';
export type SaleChannel = 'webpay' | 'cash';

export interface PurchasePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  packageId?: PackageId;
  wantsAccount?: boolean;
  password?: string;
  paymentMethod?: PaymentMethod;
  acceptedTerms?: boolean;
}

export interface AdminLoginPayload {
  email?: string;
  password?: string;
}

export interface AdminCashSalePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  packageId?: PackageId;
  notes?: string;
}

export interface AdminOrderUpdatePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  packageId?: PackageId;
  status?: 'paid' | 'pending_payment';
  notes?: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  channel: SaleChannel;
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
    paymentMethod: PaymentMethod;
    paymentLabel: string;
  };
}

interface AdminConfig {
  email: string;
  password: string;
  sessionSecret: string;
}

interface TransbankConfig {
  environment: 'integration' | 'production';
  commerceCode: string;
  apiKey: string;
  apiBaseUrl: string;
  appUrl: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  helloHost: string;
  timeoutMs: number;
}

interface PagesEnv {
  DB?: D1Database;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  TRANSBANK_ENVIRONMENT?: string;
  TRANSBANK_COMMERCE_CODE?: string;
  TRANSBANK_API_KEY?: string;
  PUBLIC_APP_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USERNAME?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM_EMAIL?: string;
  SMTP_FROM_NAME?: string;
  SMTP_SECURE?: string;
  SMTP_HELLO_HOST?: string;
  SMTP_TIMEOUT_MS?: string;
}

interface OrderRow {
  id: string;
  created_at: string;
  channel: SaleChannel;
  status: 'paid' | 'pending_payment';
  source_label: string;
  notes: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  wants_account: number;
  package_id: PackageId;
  package_label: string;
  participations: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_label: string;
}

interface WebpayTransactionRow {
  order_id: string;
  buy_order: string;
  session_id: string;
  token: string;
  redirect_url: string;
  environment: 'integration' | 'production';
  status: string;
  response_code: number | null;
  authorization_code: string | null;
  payment_type_code: string | null;
  transaction_date: string | null;
  accounting_date: string | null;
  card_number: string | null;
  vci: string | null;
  last_error: string | null;
  raw_response: string | null;
  created_at: string;
  updated_at: string;
}

interface ReceiptDeliveryRow {
  order_id: string;
  recipient_email: string | null;
  sent_at: string | null;
  last_error: string | null;
  attempts: number;
  updated_at: string;
}

interface InternalNotificationDeliveryRow {
  order_id: string;
  recipients: string;
  sent_at: string | null;
  last_error: string | null;
  attempts: number;
  updated_at: string;
}

const internalNotificationRecipients = ['hernan.astudillo.r@gmail.com', 'jbrito@funkids.cl'] as const;

interface RaffleWinnerRow {
  id: number;
  order_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  ticket_number: string;
  ticket_count: number;
  package_label: string;
  amount: number;
  created_at: string;
}

interface RaffleWinnerRecord {
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

interface WebpayTransactionRecord {
  orderId: string;
  buyOrder: string;
  sessionId: string;
  token: string;
  redirectUrl: string;
  environment: 'integration' | 'production';
  status: string;
  responseCode: number | null;
  authorizationCode: string | null;
  paymentTypeCode: string | null;
  transactionDate: string | null;
  accountingDate: string | null;
  cardNumber: string | null;
  vci: string | null;
  lastError: string | null;
  rawResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WebpayCreateTransactionResponse {
  token: string;
  url: string;
}

interface WebpayCommitResponse {
  vci?: string | null;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail?: {
    card_number?: string | null;
  } | null;
  accounting_date?: string | null;
  transaction_date?: string | null;
  authorization_code?: string | null;
  payment_type_code?: string | null;
  response_code?: number | null;
}

const packages = [
  { id: 'pkg_2000' as const, amount: 2000, participations: 1, label: '$2.000 · 1 ticket' },
  { id: 'pkg_5000' as const, amount: 5000, participations: 3, label: '$5.000 · 3 tickets' },
  { id: 'pkg_15000' as const, amount: 15000, participations: 10, label: '$15.000 · 10 tickets' },
  { id: 'pkg_30000' as const, amount: 30000, participations: 25, label: '$30.000 · 25 tickets' },
];

export function getLandingData() {
  return {
    brand: 'FunKids',
    hero: {
      badge: 'Bases legales del sorteo',
      title: 'Compra tus tickets.',
      description: 'La compra requiere un correo valido y el pago se realiza online con Webpay.',
    },
    raffle: {
      title: 'Cumpleaños Soñado Fun Kids',
      drawDate: '31 de julio de 2026',
      salePeriod: '16 de abril de 2026 al 31 de julio de 2026',
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
        description: 'El sorteo se realizara mediante transmision en vivo el 31 de julio de 2026.',
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
        answer: 'El sorteo se realiza el 31 de julio de 2026 mediante transmision en vivo via Instagram.',
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
          'El sorteo se desarrollara entre el 16 de abril de 2026 y el 31 de julio de 2026.',
          'El sorteo se realizara el dia 31 de julio de 2026 mediante transmision en vivo.',
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

export async function createPurchase(payload: PurchasePayload, env: unknown, request: Request) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  await ensureWebpaySchema(dbResult.db);

  const webpayConfig = getTransbankConfig(env, request);
  if ('error' in webpayConfig) {
    return webpayConfig.error;
  }

  const email = payload.email?.trim().toLowerCase();
  const fullName = payload.fullName?.trim();
  const wantsAccount = Boolean(payload.wantsAccount);
  const acceptedTerms = Boolean(payload.acceptedTerms);
  const selectedPackage = packages.find((item) => item.id === payload.packageId);

  if (!fullName) {
    return jsonError('El nombre es obligatorio.', 400);
  }

  if (!email || !isValidEmail(email)) {
    return jsonError('Debes ingresar un email valido.', 400);
  }

  if (!selectedPackage) {
    return jsonError('Debes seleccionar una modalidad de tickets.', 400);
  }

  if (!acceptedTerms) {
    return jsonError('Debes aceptar las bases legales.', 400);
  }

  if (payload.paymentMethod !== 'transbank') {
    return jsonError('Selecciona un medio de pago disponible.', 400);
  }

  if (wantsAccount && (!payload.password || payload.password.trim().length < 6)) {
    return jsonError('Si deseas registrarte, la contrasena debe tener al menos 6 caracteres.', 400);
  }

  const record = buildOrderRecord({
    fullName,
    email,
    phone: payload.phone?.trim() || null,
    packageId: selectedPackage.id,
    wantsAccount,
    source: 'webpay',
    status: 'pending_payment',
    notes: null,
  });

  const buyOrder = sanitizeBuyOrder(record.id);
  const sessionId = buildSessionId(record.id);
  const returnUrl = `${webpayConfig.appUrl}/api/webpay/return`;

  let webpayTransaction: WebpayTransactionRecord;

  try {
    const createdTransaction = await createWebpayTransaction(webpayConfig, {
      buyOrder,
      sessionId,
      amount: record.order.amount,
      returnUrl,
    });

    const now = new Date().toISOString();
    webpayTransaction = {
      orderId: record.id,
      buyOrder,
      sessionId,
      token: createdTransaction.token,
      redirectUrl: createdTransaction.url,
      environment: webpayConfig.environment,
      status: 'CREATED',
      responseCode: null,
      authorizationCode: null,
      paymentTypeCode: null,
      transactionDate: null,
      accountingDate: null,
      cardNumber: null,
      vci: null,
      lastError: null,
      rawResponse: JSON.stringify(createdTransaction),
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible iniciar el pago en Webpay.';
    return jsonError(message, 502);
  }

  try {
    await insertOrder(dbResult.db, record);
    await insertWebpayTransaction(dbResult.db, webpayTransaction);
  } catch (error) {
    await dbResult.db.batch([
      dbResult.db.prepare('DELETE FROM order_tickets WHERE order_id = ?').bind(record.id),
      dbResult.db.prepare('DELETE FROM orders WHERE id = ?').bind(record.id),
    ]);

    const message = error instanceof Error ? error.message : 'No fue posible guardar la transaccion de Webpay.';
    return jsonError(message, 500);
  }

  return Response.json({
    status: 'redirect_required',
    participant: record.participant,
    order: record.order,
    nextStep: 'Redirigiendo al checkout de Webpay para completar el pago.',
    message: 'Tu compra fue preparada correctamente. Te redirigiremos a Webpay para completar el pago.',
    webpay: {
      token: webpayTransaction.token,
      url: webpayTransaction.redirectUrl,
      buyOrder: webpayTransaction.buyOrder,
      sessionId: webpayTransaction.sessionId,
    },
  });
}

export async function adminLogin(payload: AdminLoginPayload, env: unknown) {
  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password?.trim();

  if (email !== config.email || password !== config.password) {
    return jsonError('Credenciales de administrador invalidas.', 401);
  }

  const token = await signAdminToken(config);

  return Response.json({
    token,
    profile: {
      name: 'Administrador FunKids',
      email: config.email,
      role: 'admin',
    },
  });
}

export async function getAdminOrders(request: Request, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  await ensureRaffleWinnerSchema(dbResult.db);

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  const orders = await fetchOrders(dbResult.db);
  const latestWinner = await findLatestRaffleWinner(dbResult.db);

  return Response.json({
    profile: {
      name: 'Administrador FunKids',
      email: config.email,
      role: 'admin',
    },
    stats: buildDashboardStats(orders),
    orders,
    latestWinner,
  });
}

export async function drawAdminWinner(request: Request, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  await ensureRaffleWinnerSchema(dbResult.db);

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  const orders = await fetchOrders(dbResult.db);
  const eligibleOrders = orders.filter((order) => order.status === 'paid' && order.order.ticketNumbers.length > 0);

  if (eligibleOrders.length === 0) {
    return jsonError('No hay compras pagadas con tickets disponibles para realizar el sorteo.', 400);
  }

  const ticketPool = eligibleOrders.flatMap((order) =>
    order.order.ticketNumbers.map((ticketNumber) => ({
      order,
      ticketNumber,
    })),
  );

  const drawnEntry = ticketPool[randomInt(ticketPool.length)];
  const createdAt = new Date().toISOString();

  const winner = await insertRaffleWinner(dbResult.db, {
    orderId: drawnEntry.order.id,
    fullName: drawnEntry.order.participant.fullName,
    email: drawnEntry.order.participant.email,
    phone: drawnEntry.order.participant.phone,
    ticketNumber: drawnEntry.ticketNumber,
    ticketCount: drawnEntry.order.order.ticketNumbers.length,
    packageLabel: drawnEntry.order.order.packageLabel,
    amount: drawnEntry.order.order.amount,
    createdAt,
  });

  return Response.json({
    message: `Ganador seleccionado: ${winner.fullName}.`,
    winner,
    eligibleEntries: ticketPool.length,
    eligibleCustomers: eligibleOrders.length,
  });
}

export async function createAdminCashSale(request: Request, payload: AdminCashSalePayload, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  await ensureReceiptSchema(dbResult.db);
  await ensureInternalNotificationSchema(dbResult.db);

  const fullName = payload.fullName?.trim();
  const phone = payload.phone?.trim();
  const email = payload.email?.trim().toLowerCase() || null;
  const selectedPackage = packages.find((item) => item.id === payload.packageId);

  if (!fullName) {
    return jsonError('El nombre es obligatorio para registrar la venta.', 400);
  }

  if (!phone) {
    return jsonError('El telefono es obligatorio para registrar la venta.', 400);
  }

  if (email && !isValidEmail(email)) {
    return jsonError('Si ingresas un email, debe ser valido.', 400);
  }

  if (!selectedPackage) {
    return jsonError('Debes seleccionar una modalidad de tickets.', 400);
  }

  const record = buildOrderRecord({
    fullName,
    email,
    phone,
    packageId: selectedPackage.id,
    wantsAccount: false,
    source: 'cash',
    status: 'paid',
    notes: payload.notes?.trim() || 'Venta ingresada por administrador.',
  });

  await insertOrder(dbResult.db, record);
  await attemptAutomaticOrderEmails(dbResult.db, env, record.id);
  const orders = await fetchOrders(dbResult.db);

  return Response.json({
    message: 'Venta en efectivo registrada correctamente.',
    order: record,
    stats: buildDashboardStats(orders),
  });
}

export async function resendAdminOrderReceipt(request: Request, orderId: string, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  await ensureReceiptSchema(dbResult.db);

  try {
    const delivery = await deliverOrderReceipt(dbResult.db, env, orderId, { force: true });
    return Response.json({
      message: `Correo enviado correctamente a ${delivery.recipient}.`,
      deliveredAt: delivery.sentAt,
      orderId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible reenviar el correo.';
    return jsonError(message, 502);
  }
}

export async function updateAdminOrder(
  request: Request,
  orderId: string,
  payload: AdminOrderUpdatePayload,
  env: unknown,
) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  const currentOrder = await findOrderById(dbResult.db, orderId);
  if (!currentOrder) {
    return jsonError('Registro no encontrado.', 404);
  }

  const selectedPackage = packages.find((item) => item.id === (payload.packageId ?? currentOrder.order.packageId));
  if (!selectedPackage) {
    return jsonError('Debes seleccionar una modalidad de tickets.', 400);
  }

  const fullName = payload.fullName?.trim();
  if (!fullName) {
    return jsonError('El nombre es obligatorio.', 400);
  }

  const phone = payload.phone?.trim();
  if (!phone) {
    return jsonError('El telefono es obligatorio.', 400);
  }

  const email = payload.email?.trim().toLowerCase() || null;
  if (email && !isValidEmail(email)) {
    return jsonError('Si ingresas un email, debe ser valido.', 400);
  }

  const updatedOrder: OrderRecord = {
    ...currentOrder,
    status: payload.status === 'pending_payment' ? 'pending_payment' : 'paid',
    notes: payload.notes?.trim() || null,
    participant: {
      ...currentOrder.participant,
      fullName,
      email,
      phone,
    },
    order: {
      ...currentOrder.order,
      packageId: selectedPackage.id,
      packageLabel: selectedPackage.label,
      participations: selectedPackage.participations,
      ticketNumbers: generateTicketNumbers(selectedPackage.participations),
      amount: selectedPackage.amount,
    },
  };

  await replaceOrder(dbResult.db, updatedOrder);
  const orders = await fetchOrders(dbResult.db);

  return Response.json({
    message: 'Registro actualizado correctamente.',
    order: updatedOrder,
    stats: buildDashboardStats(orders),
  });
}

export async function deleteAdminOrder(request: Request, orderId: string, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  await ensureWebpaySchema(dbResult.db);

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  const currentOrder = await findOrderById(dbResult.db, orderId);
  if (!currentOrder) {
    return jsonError('Registro no encontrado.', 404);
  }

  await dbResult.db.batch([
    dbResult.db.prepare('DELETE FROM order_tickets WHERE order_id = ?').bind(orderId),
    dbResult.db.prepare('DELETE FROM webpay_transactions WHERE order_id = ?').bind(orderId),
    dbResult.db.prepare('DELETE FROM orders WHERE id = ?').bind(orderId),
  ]);

  const orders = await fetchOrders(dbResult.db);

  return Response.json({
    message: 'Registro eliminado correctamente.',
    order: currentOrder,
    stats: buildDashboardStats(orders),
  });
}

export async function handleWebpayReturn(request: Request, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  await ensureWebpaySchema(dbResult.db);
  await ensureReceiptSchema(dbResult.db);
  await ensureInternalNotificationSchema(dbResult.db);

  const webpayConfig = getTransbankConfig(env, request);
  if ('error' in webpayConfig) {
    return webpayConfig.error;
  }

  const params = await readIncomingParams(request);
  const tokenWs = params.get('token_ws')?.trim();
  const tbkToken = params.get('TBK_TOKEN')?.trim();
  const buyOrder = params.get('TBK_ORDEN_COMPRA')?.trim() || params.get('buy_order')?.trim() || null;
  const sessionId = params.get('TBK_ID_SESION')?.trim() || params.get('session_id')?.trim() || null;

  if (tbkToken) {
    try {
      const result = await settleAbortedWebpayTransaction(dbResult.db, webpayConfig, tbkToken, buyOrder, sessionId);
      return redirectToWebpayResult(webpayConfig.appUrl, result.orderId);
    } catch (error) {
      const orderId = buyOrder ?? (sessionId ? await findOrderIdBySessionId(dbResult.db, sessionId) : null);
      if (orderId) {
        await updateWebpayTransactionState(dbResult.db, orderId, {
          status: 'ERROR',
          lastError: error instanceof Error ? error.message : 'No fue posible consultar el estado de Webpay.',
          rawResponse: JSON.stringify({ token: tbkToken, buyOrder, sessionId }),
        });
      }
      return redirectToWebpayResult(webpayConfig.appUrl, orderId);
    }
  }

  if (tokenWs) {
    try {
      const result = await commitWebpayPayment(dbResult.db, webpayConfig, tokenWs);
      if (isApprovedWebpayTransaction(result.transaction)) {
        await attemptAutomaticOrderEmails(dbResult.db, env, result.orderId);
      }
      return redirectToWebpayResult(webpayConfig.appUrl, result.orderId);
    } catch (error) {
      const current = await findWebpayTransactionByToken(dbResult.db, tokenWs);
      if (current?.orderId) {
        await updateWebpayTransactionState(dbResult.db, current.orderId, {
          status: 'ERROR',
          lastError: error instanceof Error ? error.message : 'No fue posible confirmar el pago en Webpay.',
          rawResponse: JSON.stringify({ token: tokenWs }),
        });
      }
      return redirectToWebpayResult(webpayConfig.appUrl, current?.orderId ?? null);
    }
  }

  const fallbackOrderId = buyOrder ?? (sessionId ? await findOrderIdBySessionId(dbResult.db, sessionId) : null);
  if (fallbackOrderId) {
    await updateWebpayTransactionState(dbResult.db, fallbackOrderId, {
      status: 'TIMEOUT',
      lastError: 'El pago no fue completado y la sesion expiro o fue cerrada por el usuario.',
      rawResponse: JSON.stringify({
        event: 'timeout_or_closed',
        buyOrder,
        sessionId,
      }),
    });
  }

  return redirectToWebpayResult(webpayConfig.appUrl, fallbackOrderId);
}

export async function getWebpayResult(orderId: string, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
  }

  await ensureWebpaySchema(dbResult.db);

  const order = await findOrderById(dbResult.db, orderId);
  if (!order) {
    return jsonError('No encontramos la compra solicitada.', 404);
  }

  const transaction = await findWebpayTransactionByOrderId(dbResult.db, orderId);
  const paymentState = normalizeWebpayState(order, transaction);

  return Response.json({
    orderId: order.id,
    status: paymentState.status,
    title: paymentState.title,
    message: paymentState.message,
    participant: order.participant,
    order: order.order,
    payment: transaction
      ? {
          buyOrder: transaction.buyOrder,
          sessionId: transaction.sessionId,
          token: transaction.token,
          status: transaction.status,
          responseCode: transaction.responseCode,
          authorizationCode: transaction.authorizationCode,
          paymentTypeCode: transaction.paymentTypeCode,
          cardNumber: transaction.cardNumber,
          transactionDate: transaction.transactionDate,
          accountingDate: transaction.accountingDate,
          vci: transaction.vci,
          lastError: transaction.lastError,
        }
      : null,
  });
}

function getDb(env: unknown): { db: D1Database } | { error: Response } {
  const db = (env as PagesEnv | undefined)?.DB;
  if (!db) {
    return { error: jsonError('No hay base de datos D1 configurada.', 500) };
  }

  return { db };
}

function getTransbankConfig(env: unknown, request: Request): TransbankConfig | { error: Response } {
  const source = (env ?? {}) as PagesEnv;
  const environment = String(source.TRANSBANK_ENVIRONMENT ?? 'integration').trim().toLowerCase();
  const commerceCode = String(source.TRANSBANK_COMMERCE_CODE ?? '').trim();
  const apiKey = String(source.TRANSBANK_API_KEY ?? '').trim();
  const requestOrigin = new URL(request.url).origin;
  const appUrl = String(source.PUBLIC_APP_URL ?? requestOrigin).trim().replace(/\/$/, '');

  if (environment !== 'integration' && environment !== 'production') {
    return { error: jsonError('TRANSBANK_ENVIRONMENT debe ser "integration" o "production".', 500) };
  }

  if (!commerceCode || !apiKey) {
    return {
      error: jsonError('Faltan credenciales de Transbank en el servidor.', 500),
    };
  }

  return {
    environment,
    commerceCode,
    apiKey,
    apiBaseUrl: environment === 'production' ? 'https://webpay3g.transbank.cl' : 'https://webpay3gint.transbank.cl',
    appUrl,
  };
}

async function ensureWebpaySchema(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS webpay_transactions (
        order_id TEXT PRIMARY KEY,
        buy_order TEXT NOT NULL UNIQUE,
        session_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        redirect_url TEXT NOT NULL,
        environment TEXT NOT NULL,
        status TEXT NOT NULL,
        response_code INTEGER,
        authorization_code TEXT,
        payment_type_code TEXT,
        transaction_date TEXT,
        accounting_date TEXT,
        card_number TEXT,
        vci TEXT,
        last_error TEXT,
        raw_response TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_webpay_transactions_token ON webpay_transactions(token)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_webpay_transactions_buy_order ON webpay_transactions(buy_order)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_webpay_transactions_session_id ON webpay_transactions(session_id)'),
  ]);
}

async function ensureReceiptSchema(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS receipt_deliveries (
        order_id TEXT PRIMARY KEY,
        recipient_email TEXT,
        sent_at TEXT,
        last_error TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_receipt_deliveries_sent_at ON receipt_deliveries(sent_at)'),
  ]);
}

async function ensureInternalNotificationSchema(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS internal_notification_deliveries (
        order_id TEXT PRIMARY KEY,
        recipients TEXT NOT NULL,
        sent_at TEXT,
        last_error TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_internal_notification_deliveries_sent_at ON internal_notification_deliveries(sent_at)',
    ),
  ]);
}

async function ensureRaffleWinnerSchema(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS raffle_winners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        ticket_number TEXT NOT NULL,
        ticket_count INTEGER NOT NULL,
        package_label TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_raffle_winners_created_at ON raffle_winners(created_at DESC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_raffle_winners_order_id ON raffle_winners(order_id)'),
  ]);
}

function getAdminConfig(env: unknown): AdminConfig | { error: Response } {
  const source = (env ?? {}) as PagesEnv;
  const email = String(source.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = String(source.ADMIN_PASSWORD ?? '').trim();
  const sessionSecret = String(source.ADMIN_SESSION_SECRET ?? '').trim();

  if (!email || !password || !sessionSecret) {
    return {
      error: jsonError('Configuracion de administrador incompleta en el servidor.', 500),
    };
  }

  return { email, password, sessionSecret };
}

function getSmtpConfig(env: unknown): SmtpConfig {
  const source = (env ?? {}) as PagesEnv;
  const host = String(source.SMTP_HOST ?? '').trim();
  const port = Number.parseInt(String(source.SMTP_PORT ?? '465').trim(), 10);
  const username = String(source.SMTP_USERNAME ?? '').trim();
  const password = String(source.SMTP_PASSWORD ?? '').trim();
  const fromEmail = String(source.SMTP_FROM_EMAIL ?? username).trim();
  const fromName = String(source.SMTP_FROM_NAME ?? 'FunKids').trim() || 'FunKids';
  const secureRaw = String(source.SMTP_SECURE ?? 'true').trim().toLowerCase();
  const helloHost = String(source.SMTP_HELLO_HOST ?? fromEmail.split('@')[1] ?? 'funkids.cl').trim() || 'funkids.cl';
  const timeoutMs = Number.parseInt(String(source.SMTP_TIMEOUT_MS ?? '12000').trim(), 10);

  if (!host || !Number.isFinite(port) || port <= 0 || !username || !password || !fromEmail) {
    throw new Error('Falta configurar SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD o SMTP_FROM_EMAIL.');
  }

  return {
    host,
    port,
    username,
    password,
    fromEmail,
    fromName,
    secure: secureRaw !== 'false',
    helloHost,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 12000,
  };
}

async function ensureAdminAuthorization(request: Request, config: AdminConfig) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return jsonError('No autorizado.', 401);
  }

  const isValid = await verifyAdminToken(token, config);
  if (!isValid) {
    return jsonError('No autorizado.', 401);
  }

  return null;
}

async function fetchOrders(db: D1Database) {
  const orderRowsResult = await db.prepare('SELECT * FROM orders ORDER BY datetime(created_at) DESC').all<OrderRow>();
  const rows = orderRowsResult.results ?? [];

  if (rows.length === 0) {
    return [] as OrderRecord[];
  }

  const ticketQueries = rows.map((row) =>
    db.prepare('SELECT ticket_number FROM order_tickets WHERE order_id = ? ORDER BY ticket_number ASC').bind(row.id),
  );
  const ticketResults = await db.batch(ticketQueries);

  return rows.map((row, index) => {
    const ticketNumbers =
      ((ticketResults[index] as { results?: Array<{ ticket_number: string }> }).results ?? []).map(
        (ticket) => ticket.ticket_number,
      );

    return mapOrderRow(row, ticketNumbers);
  });
}

async function findOrderById(db: D1Database, orderId: string) {
  const rowResult = await db.prepare('SELECT * FROM orders WHERE id = ? LIMIT 1').bind(orderId).first<OrderRow>();
  if (!rowResult) {
    return null;
  }

  const ticketResult = await db
    .prepare('SELECT ticket_number FROM order_tickets WHERE order_id = ? ORDER BY ticket_number ASC')
    .bind(orderId)
    .all<{ ticket_number: string }>();

  return mapOrderRow(rowResult, (ticketResult.results ?? []).map((ticket) => ticket.ticket_number));
}

async function insertWebpayTransaction(db: D1Database, transaction: WebpayTransactionRecord) {
  await db
    .prepare(
      `
        INSERT INTO webpay_transactions (
          order_id, buy_order, session_id, token, redirect_url, environment,
          status, response_code, authorization_code, payment_type_code,
          transaction_date, accounting_date, card_number, vci, last_error,
          raw_response, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      transaction.orderId,
      transaction.buyOrder,
      transaction.sessionId,
      transaction.token,
      transaction.redirectUrl,
      transaction.environment,
      transaction.status,
      transaction.responseCode,
      transaction.authorizationCode,
      transaction.paymentTypeCode,
      transaction.transactionDate,
      transaction.accountingDate,
      transaction.cardNumber,
      transaction.vci,
      transaction.lastError,
      transaction.rawResponse,
      transaction.createdAt,
      transaction.updatedAt,
    )
    .run();
}

async function findWebpayTransactionByOrderId(db: D1Database, orderId: string) {
  const row = await db
    .prepare('SELECT * FROM webpay_transactions WHERE order_id = ? LIMIT 1')
    .bind(orderId)
    .first<WebpayTransactionRow>();

  return row ? mapWebpayTransactionRow(row) : null;
}

async function findWebpayTransactionByToken(db: D1Database, token: string) {
  const row = await db
    .prepare('SELECT * FROM webpay_transactions WHERE token = ? LIMIT 1')
    .bind(token)
    .first<WebpayTransactionRow>();

  return row ? mapWebpayTransactionRow(row) : null;
}

async function findOrderIdBySessionId(db: D1Database, sessionId: string) {
  const row = await db
    .prepare('SELECT order_id FROM webpay_transactions WHERE session_id = ? LIMIT 1')
    .bind(sessionId)
    .first<{ order_id: string }>();

  return row?.order_id ?? null;
}

async function updateOrderPaymentStatus(db: D1Database, orderId: string, status: 'paid' | 'pending_payment') {
  await db.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, orderId).run();
}

async function updateWebpayTransactionState(
  db: D1Database,
  orderId: string,
  input: {
    token?: string;
    redirectUrl?: string;
    status: string;
    responseCode?: number | null;
    authorizationCode?: string | null;
    paymentTypeCode?: string | null;
    transactionDate?: string | null;
    accountingDate?: string | null;
    cardNumber?: string | null;
    vci?: string | null;
    lastError?: string | null;
    rawResponse?: string | null;
  },
) {
  const current = await findWebpayTransactionByOrderId(db, orderId);
  if (!current) {
    return;
  }

  const updatedAt = new Date().toISOString();
  await db
    .prepare(
      `
        UPDATE webpay_transactions
        SET token = ?, redirect_url = ?, status = ?, response_code = ?, authorization_code = ?,
            payment_type_code = ?, transaction_date = ?, accounting_date = ?, card_number = ?,
            vci = ?, last_error = ?, raw_response = ?, updated_at = ?
        WHERE order_id = ?
      `,
    )
    .bind(
      input.token ?? current.token,
      input.redirectUrl ?? current.redirectUrl,
      input.status,
      input.responseCode ?? null,
      input.authorizationCode ?? null,
      input.paymentTypeCode ?? null,
      input.transactionDate ?? null,
      input.accountingDate ?? null,
      input.cardNumber ?? null,
      input.vci ?? null,
      input.lastError ?? null,
      input.rawResponse ?? null,
      updatedAt,
      orderId,
    )
    .run();
}

async function insertOrder(db: D1Database, order: OrderRecord) {
  const statements = [
    db
      .prepare(
        `
          INSERT INTO orders (
            id, created_at, channel, status, source_label, notes,
            full_name, email, phone, wants_account,
            package_id, package_label, participations, amount,
            payment_method, payment_label
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .bind(
        order.id,
        order.createdAt,
        order.channel,
        order.status,
        order.sourceLabel,
        order.notes,
        order.participant.fullName,
        order.participant.email,
        order.participant.phone,
        order.participant.wantsAccount ? 1 : 0,
        order.order.packageId,
        order.order.packageLabel,
        order.order.participations,
        order.order.amount,
        order.order.paymentMethod,
        order.order.paymentLabel,
      ),
    ...order.order.ticketNumbers.map((ticketNumber) =>
      db.prepare('INSERT INTO order_tickets (order_id, ticket_number) VALUES (?, ?)').bind(order.id, ticketNumber),
    ),
  ];

  await db.batch(statements);
}

async function replaceOrder(db: D1Database, order: OrderRecord) {
  await db.batch([
    db
      .prepare(
        `
          UPDATE orders
          SET status = ?, notes = ?, full_name = ?, email = ?, phone = ?,
              package_id = ?, package_label = ?, participations = ?, amount = ?
          WHERE id = ?
        `,
      )
      .bind(
        order.status,
        order.notes,
        order.participant.fullName,
        order.participant.email,
        order.participant.phone,
        order.order.packageId,
        order.order.packageLabel,
        order.order.participations,
        order.order.amount,
        order.id,
      ),
    db.prepare('DELETE FROM order_tickets WHERE order_id = ?').bind(order.id),
    ...order.order.ticketNumbers.map((ticketNumber) =>
      db.prepare('INSERT INTO order_tickets (order_id, ticket_number) VALUES (?, ?)').bind(order.id, ticketNumber),
    ),
  ]);
}

async function getReceiptDelivery(db: D1Database, orderId: string) {
  const row = await db
    .prepare('SELECT * FROM receipt_deliveries WHERE order_id = ? LIMIT 1')
    .bind(orderId)
    .first<ReceiptDeliveryRow>();

  return row ?? null;
}

async function upsertReceiptDelivery(
  db: D1Database,
  input: { orderId: string; recipientEmail: string | null; sentAt: string | null; lastError: string | null },
) {
  const current = await getReceiptDelivery(db, input.orderId);
  const attempts = (current?.attempts ?? 0) + 1;
  const updatedAt = new Date().toISOString();

  await db
    .prepare(
      `
        INSERT INTO receipt_deliveries (order_id, recipient_email, sent_at, last_error, attempts, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET
          recipient_email = excluded.recipient_email,
          sent_at = excluded.sent_at,
          last_error = excluded.last_error,
          attempts = excluded.attempts,
          updated_at = excluded.updated_at
      `,
    )
    .bind(input.orderId, input.recipientEmail, input.sentAt, input.lastError, attempts, updatedAt)
    .run();
}

async function attemptAutomaticReceiptEmail(db: D1Database, env: unknown, orderId: string) {
  try {
    await deliverOrderReceipt(db, env, orderId, { force: false });
  } catch {
    // El comprobante no debe bloquear la compra ni el retorno de Webpay.
  }
}

async function attemptAutomaticInternalNotification(db: D1Database, env: unknown, orderId: string) {
  try {
    await deliverInternalNotificationEmail(db, env, orderId, { force: false });
  } catch {
    // La notificacion interna no debe bloquear la compra ni el retorno de Webpay.
  }
}

async function attemptAutomaticOrderEmails(db: D1Database, env: unknown, orderId: string) {
  await attemptAutomaticReceiptEmail(db, env, orderId);
  await attemptAutomaticInternalNotification(db, env, orderId);
}

async function deliverOrderReceipt(
  db: D1Database,
  env: unknown,
  orderId: string,
  input: { force: boolean },
) {
  await ensureReceiptSchema(db);

  const order = await findOrderById(db, orderId);
  if (!order) {
    throw new Error('No encontramos la compra indicada para enviar el respaldo.');
  }

  const recipient = order.participant.email?.trim().toLowerCase() ?? null;
  if (!recipient) {
    throw new Error('Este registro no tiene un email asociado.');
  }

  const currentDelivery = await getReceiptDelivery(db, orderId);
  if (!input.force && currentDelivery?.sent_at) {
    return {
      recipient,
      sentAt: currentDelivery.sent_at,
      skipped: true,
    };
  }

  const smtpConfig = getSmtpConfig(env);
  const transaction = order.channel === 'webpay' ? await findWebpayTransactionByOrderId(db, orderId) : null;
  const receipt = buildOrderReceiptEmail(order, transaction, smtpConfig);

  try {
    await sendSmtpEmail(smtpConfig, {
      to: [recipient],
      subject: receipt.subject,
      text: receipt.text,
      html: receipt.html,
    });

    const sentAt = new Date().toISOString();
    await upsertReceiptDelivery(db, {
      orderId,
      recipientEmail: recipient,
      sentAt,
      lastError: null,
    });

    return {
      recipient,
      sentAt,
      skipped: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible enviar el correo.';
    await upsertReceiptDelivery(db, {
      orderId,
      recipientEmail: recipient,
      sentAt: null,
      lastError: message,
    });
    throw new Error(message);
  }
}

async function getInternalNotificationDelivery(db: D1Database, orderId: string) {
  const row = await db
    .prepare('SELECT * FROM internal_notification_deliveries WHERE order_id = ? LIMIT 1')
    .bind(orderId)
    .first<InternalNotificationDeliveryRow>();

  return row ?? null;
}

async function findLatestRaffleWinner(db: D1Database) {
  const row = await db
    .prepare('SELECT * FROM raffle_winners ORDER BY datetime(created_at) DESC, id DESC LIMIT 1')
    .first<RaffleWinnerRow>();

  return row ? mapRaffleWinnerRow(row) : null;
}

async function insertRaffleWinner(
  db: D1Database,
  input: Omit<RaffleWinnerRecord, 'id'>,
) {
  const result = await db
    .prepare(
      `
        INSERT INTO raffle_winners (
          order_id, full_name, email, phone, ticket_number, ticket_count, package_label, amount, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      input.orderId,
      input.fullName,
      input.email,
      input.phone,
      input.ticketNumber,
      input.ticketCount,
      input.packageLabel,
      input.amount,
      input.createdAt,
    )
    .run();

  const winnerId = Number(result.meta.last_row_id ?? 0);
  const inserted = await db
    .prepare('SELECT * FROM raffle_winners WHERE id = ? LIMIT 1')
    .bind(winnerId)
    .first<RaffleWinnerRow>();

  if (!inserted) {
    throw new Error('No fue posible recuperar el ganador sorteado.');
  }

  return mapRaffleWinnerRow(inserted);
}

async function upsertInternalNotificationDelivery(
  db: D1Database,
  input: { orderId: string; recipients: string; sentAt: string | null; lastError: string | null },
) {
  const current = await getInternalNotificationDelivery(db, input.orderId);
  const attempts = (current?.attempts ?? 0) + 1;
  const updatedAt = new Date().toISOString();

  await db
    .prepare(
      `
        INSERT INTO internal_notification_deliveries (order_id, recipients, sent_at, last_error, attempts, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(order_id) DO UPDATE SET
          recipients = excluded.recipients,
          sent_at = excluded.sent_at,
          last_error = excluded.last_error,
          attempts = excluded.attempts,
          updated_at = excluded.updated_at
      `,
    )
    .bind(input.orderId, input.recipients, input.sentAt, input.lastError, attempts, updatedAt)
    .run();
}

async function deliverInternalNotificationEmail(
  db: D1Database,
  env: unknown,
  orderId: string,
  input: { force: boolean },
) {
  await ensureInternalNotificationSchema(db);

  const order = await findOrderById(db, orderId);
  if (!order) {
    throw new Error('No encontramos la compra indicada para notificar al equipo.');
  }

  const currentDelivery = await getInternalNotificationDelivery(db, orderId);
  if (!input.force && currentDelivery?.sent_at) {
    return {
      recipients: internalNotificationRecipients.join(', '),
      sentAt: currentDelivery.sent_at,
      skipped: true,
    };
  }

  const smtpConfig = getSmtpConfig(env);
  const transaction = order.channel === 'webpay' ? await findWebpayTransactionByOrderId(db, orderId) : null;
  const notification = buildInternalOrderNotificationEmail(order, transaction, smtpConfig);

  try {
    await sendSmtpEmail(smtpConfig, {
      to: [...internalNotificationRecipients],
      subject: notification.subject,
      text: notification.text,
      html: notification.html,
    });

    const sentAt = new Date().toISOString();
    await upsertInternalNotificationDelivery(db, {
      orderId,
      recipients: internalNotificationRecipients.join(', '),
      sentAt,
      lastError: null,
    });

    return {
      recipients: internalNotificationRecipients.join(', '),
      sentAt,
      skipped: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible enviar la notificacion interna.';
    await upsertInternalNotificationDelivery(db, {
      orderId,
      recipients: internalNotificationRecipients.join(', '),
      sentAt: null,
      lastError: message,
    });
    throw new Error(message);
  }
}

function buildDashboardStats(orders: OrderRecord[]) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.order.amount, 0);
  const totalTickets = orders.reduce((sum, order) => sum + order.order.ticketNumbers.length, 0);
  const totalParticipations = orders.reduce((sum, order) => sum + order.order.participations, 0);
  const cashSales = orders.filter((order) => order.channel === 'cash').length;
  const webpaySales = orders.filter((order) => order.channel === 'webpay').length;

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalTickets,
    totalParticipations,
    cashSales,
    webpaySales,
  };
}

function buildOrderRecord(input: {
  fullName: string;
  email: string | null;
  phone: string | null;
  packageId: PackageId;
  wantsAccount: boolean;
  source: SaleChannel;
  status: 'paid' | 'pending_payment';
  notes: string | null;
  createdAt?: string;
}) {
  const selectedPackage = packages.find((item) => item.id === input.packageId);

  if (!selectedPackage) {
    throw new Error('Package not found');
  }

  return {
    id: `order_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
    channel: input.source,
    status: input.status,
    sourceLabel: input.source === 'cash' ? 'Efectivo' : 'Webpay',
    notes: input.notes,
    participant: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      wantsAccount: input.wantsAccount,
    },
    order: {
      packageId: selectedPackage.id,
      packageLabel: selectedPackage.label,
      participations: selectedPackage.participations,
      ticketNumbers: generateTicketNumbers(selectedPackage.participations),
      amount: selectedPackage.amount,
      paymentMethod: 'transbank' as const,
      paymentLabel: input.source === 'cash' ? 'Venta en efectivo' : 'Webpay by Transbank',
    },
  } satisfies OrderRecord;
}

function mapOrderRow(row: OrderRow, ticketNumbers: string[]) {
  return {
    id: row.id,
    createdAt: row.created_at,
    channel: row.channel,
    status: row.status,
    sourceLabel: row.source_label,
    notes: row.notes,
    participant: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      wantsAccount: Boolean(row.wants_account),
    },
    order: {
      packageId: row.package_id,
      packageLabel: row.package_label,
      participations: row.participations,
      ticketNumbers,
      amount: row.amount,
      paymentMethod: row.payment_method,
      paymentLabel: row.payment_label,
    },
  } satisfies OrderRecord;
}

function mapWebpayTransactionRow(row: WebpayTransactionRow) {
  return {
    orderId: row.order_id,
    buyOrder: row.buy_order,
    sessionId: row.session_id,
    token: row.token,
    redirectUrl: row.redirect_url,
    environment: row.environment,
    status: row.status,
    responseCode: row.response_code,
    authorizationCode: row.authorization_code,
    paymentTypeCode: row.payment_type_code,
    transactionDate: row.transaction_date,
    accountingDate: row.accounting_date,
    cardNumber: row.card_number,
    vci: row.vci,
    lastError: row.last_error,
    rawResponse: row.raw_response,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies WebpayTransactionRecord;
}

function mapRaffleWinnerRow(row: RaffleWinnerRow) {
  return {
    id: row.id,
    orderId: row.order_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    ticketNumber: row.ticket_number,
    ticketCount: row.ticket_count,
    packageLabel: row.package_label,
    amount: row.amount,
    createdAt: row.created_at,
  } satisfies RaffleWinnerRecord;
}

async function createWebpayTransaction(
  config: TransbankConfig,
  input: { buyOrder: string; sessionId: string; amount: number; returnUrl: string },
) {
  return callTransbank<WebpayCreateTransactionResponse>(config, '/rswebpaytransaction/api/webpay/v1.2/transactions', {
    method: 'POST',
    body: {
      buy_order: input.buyOrder,
      session_id: input.sessionId,
      amount: input.amount,
      return_url: input.returnUrl,
    },
  });
}

async function commitWebpayTransaction(config: TransbankConfig, token: string) {
  return callTransbank<WebpayCommitResponse>(config, `/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`, {
    method: 'PUT',
  });
}

async function getWebpayTransactionStatus(config: TransbankConfig, token: string) {
  return callTransbank<WebpayCommitResponse>(config, `/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`, {
    method: 'GET',
  });
}

async function callTransbank<T>(
  config: TransbankConfig,
  path: string,
  input: { method: 'GET' | 'POST' | 'PUT'; body?: Record<string, unknown> },
) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: input.method,
    headers: {
      'Content-Type': 'application/json',
      'Tbk-Api-Key-Id': config.commerceCode,
      'Tbk-Api-Key-Secret': config.apiKey,
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
  });

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && 'error_message' in data && String(data.error_message)) ||
      (typeof data === 'object' && data && 'message' in data && String(data.message)) ||
      `Transbank respondio con estado ${response.status}.`;

    throw new Error(message);
  }

  return data as T;
}

async function commitWebpayPayment(db: D1Database, config: TransbankConfig, token: string) {
  const current = await findWebpayTransactionByToken(db, token);
  const committed = await commitWebpayTransaction(config, token);
  const orderId = committed.buy_order || current?.orderId;

  if (!orderId) {
    throw new Error('No fue posible asociar el pago de Webpay a una compra registrada.');
  }

  await updateWebpayTransactionState(db, orderId, {
    token,
    status: committed.status ?? 'UNKNOWN',
    responseCode: committed.response_code ?? null,
    authorizationCode: committed.authorization_code ?? null,
    paymentTypeCode: committed.payment_type_code ?? null,
    transactionDate: committed.transaction_date ?? null,
    accountingDate: committed.accounting_date ?? null,
    cardNumber: committed.card_detail?.card_number ?? null,
    vci: committed.vci ?? null,
    lastError: isApprovedWebpayTransaction(committed)
      ? null
      : 'Webpay no aprobo la transaccion o el cliente no finalizo correctamente el pago.',
    rawResponse: JSON.stringify(committed),
  });

  await updateOrderPaymentStatus(db, orderId, isApprovedWebpayTransaction(committed) ? 'paid' : 'pending_payment');

  return { orderId, transaction: committed };
}

async function settleAbortedWebpayTransaction(
  db: D1Database,
  config: TransbankConfig,
  token: string,
  buyOrder: string | null,
  sessionId: string | null,
) {
  const current = await findWebpayTransactionByToken(db, token);
  const orderId = current?.orderId ?? buyOrder ?? (sessionId ? await findOrderIdBySessionId(db, sessionId) : null);

  let statusResponse: WebpayCommitResponse | null = null;

  try {
    statusResponse = await getWebpayTransactionStatus(config, token);
  } catch {
    statusResponse = null;
  }

  if (orderId) {
    await updateWebpayTransactionState(db, orderId, {
      token,
      status: statusResponse?.status ?? 'ABORTED',
      responseCode: statusResponse?.response_code ?? null,
      authorizationCode: statusResponse?.authorization_code ?? null,
      paymentTypeCode: statusResponse?.payment_type_code ?? null,
      transactionDate: statusResponse?.transaction_date ?? null,
      accountingDate: statusResponse?.accounting_date ?? null,
      cardNumber: statusResponse?.card_detail?.card_number ?? null,
      vci: statusResponse?.vci ?? null,
      lastError: 'El pago fue abortado, cancelado o expirado antes de completarse.',
      rawResponse: JSON.stringify(
        statusResponse ?? {
          token,
          buyOrder,
          sessionId,
          status: 'ABORTED',
        },
      ),
    });
  }

  return { orderId };
}

function isApprovedWebpayTransaction(transaction: WebpayCommitResponse) {
  return transaction.status === 'AUTHORIZED' && Number(transaction.response_code ?? -1) === 0;
}

async function readIncomingParams(request: Request) {
  const params = new URLSearchParams(new URL(request.url).search);
  const method = request.method.toUpperCase();

  if (method !== 'GET') {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      form.forEach((value, key) => {
        if (typeof value === 'string') {
          params.set(key, value);
        }
      });
    }
  }

  return params;
}

function redirectToWebpayResult(appUrl: string, orderId: string | null) {
  const target = new URL('/pago/resultado', `${appUrl}/`);
  if (orderId) {
    target.searchParams.set('orderId', orderId);
  }

  return Response.redirect(target.toString(), 303);
}

function normalizeWebpayState(order: OrderRecord, transaction: WebpayTransactionRecord | null) {
  if (!transaction) {
    return {
      status: order.status === 'paid' ? 'approved' : 'pending',
      title: order.status === 'paid' ? 'Pago confirmado' : 'Pago pendiente',
      message:
        order.status === 'paid'
          ? 'Tu compra ya se encuentra confirmada.'
          : 'Aun no recibimos confirmacion final de Webpay para esta compra.',
    };
  }

  if (order.status === 'paid' && transaction.status === 'AUTHORIZED' && transaction.responseCode === 0) {
    return {
      status: 'approved',
      title: 'Pago confirmado',
      message: 'La compra fue pagada correctamente en Webpay y tus tickets ya quedaron registrados.',
    };
  }

  if (transaction.status === 'TIMEOUT') {
    return {
      status: 'timeout',
      title: 'Sesion expirada',
      message: transaction.lastError ?? 'La sesion de Webpay expiro antes de completarse.',
    };
  }

  if (transaction.status === 'ABORTED') {
    return {
      status: 'aborted',
      title: 'Pago cancelado',
      message: transaction.lastError ?? 'El pago fue cancelado antes de completarse en Webpay.',
    };
  }

  if (transaction.status === 'AUTHORIZED' && transaction.responseCode !== 0) {
    return {
      status: 'rejected',
      title: 'Pago no aprobado',
      message: transaction.lastError ?? 'Webpay respondio que la transaccion no fue aprobada.',
    };
  }

  return {
    status: order.status === 'paid' ? 'approved' : 'pending',
    title: order.status === 'paid' ? 'Pago confirmado' : 'Pago en revision',
    message:
      transaction.lastError ??
      (order.status === 'paid'
        ? 'La compra ya fue confirmada.'
        : 'Todavia no se pudo determinar el estado final del pago en Webpay.'),
  };
}

function sanitizeBuyOrder(orderId: string) {
  return orderId.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 26);
}

function buildSessionId(orderId: string) {
  return `sess_${orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-18)}`.slice(0, 61);
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function generateTicketNumbers(count: number) {
  return Array.from({ length: count }, () => `FK-${String(1200 + Math.floor(Math.random() * 8000)).padStart(4, '0')}`);
}

function randomInt(maxExclusive: number) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('randomInt requiere un maximo positivo.');
  }

  const maxUint32 = 0xffffffff;
  const limit = Math.floor((maxUint32 + 1) / maxExclusive) * maxExclusive;
  const randomBuffer = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(randomBuffer);
    const value = randomBuffer[0];

    if (value < limit) {
      return value % maxExclusive;
    }
  }
}

function buildOrderReceiptEmail(
  order: OrderRecord,
  transaction: WebpayTransactionRecord | null,
  smtpConfig: SmtpConfig,
) {
  const orderDate = formatReceiptDate(order.createdAt);
  const total = formatCurrency(order.order.amount);
  const tickets = order.order.ticketNumbers.join(', ');
  const paymentStatus = order.status === 'paid' ? 'Pagado' : 'Pendiente';
  const paymentDetail =
    order.channel === 'cash'
      ? 'Venta registrada en efectivo por el equipo administrador.'
      : transaction?.authorizationCode
        ? `Autorizacion Webpay: ${transaction.authorizationCode}`
        : 'Pago procesado con Webpay by Transbank.';
  const subject = `Confirmacion de compra FunKids - ${order.order.packageLabel}`;
  const safeName = escapeHtml(order.participant.fullName);
  const safeTickets = escapeHtml(tickets);
  const safePackage = escapeHtml(order.order.packageLabel);
  const safeEmail = escapeHtml(order.participant.email ?? '');
  const safePhone = escapeHtml(order.participant.phone ?? 'No informado');
  const safePaymentDetail = escapeHtml(paymentDetail);
  const safeStatus = escapeHtml(paymentStatus);
  const safeDate = escapeHtml(orderDate);

  return {
    subject,
    text: [
      `Estimado/a ${order.participant.fullName},`,
      '',
      'Gracias por participar en el sorteo de FunKids.',
      'Hemos registrado correctamente tu compra y este correo funciona como respaldo de la transaccion realizada.',
      '',
      'Resumen de tu compra:',
      `Numero de compra: ${order.id}`,
      `Fecha: ${orderDate}`,
      `Producto digital adquirido: ${order.order.packageLabel}`,
      `Tickets asignados: ${tickets}`,
      `Participaciones: ${order.order.participations}`,
      `Total: ${total}`,
      `Estado: ${paymentStatus}`,
      `Detalle de pago: ${paymentDetail}`,
      '',
      'Conserva este correo como comprobante de compra.',
      'Si necesitas apoyo adicional, puedes responder a este mensaje y nuestro equipo te ayudara a la brevedad.',
      '',
      'Agradecemos sinceramente tu confianza y participacion.',
      '',
      'Atentamente,',
      'Equipo FunKids',
    ].join('\r\n'),
    html: `
      <div style="margin:0;padding:32px;background:#f3f9fd;font-family:Arial,sans-serif;color:#465071">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:26px;overflow:hidden;border:1px solid rgba(91,166,216,0.14);box-shadow:0 24px 56px rgba(49,56,75,0.08)">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#4b99d6 0%,#68b5eb 100%);color:#ffffff">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9">FunKids</p>
            <h1 style="margin:0 0 10px;font-size:30px;line-height:1.05">Confirmacion de compra</h1>
            <p style="margin:0;font-size:15px;line-height:1.6;opacity:0.96">Gracias por participar en nuestro sorteo. A continuacion encontrarás el respaldo de tu compra.</p>
          </div>
          <div style="padding:30px 32px">
            <p style="margin:0 0 22px;font-size:16px;line-height:1.7">Estimado/a <strong>${safeName}</strong>, hemos registrado correctamente tu compra. Te agradecemos por confiar en FunKids y formar parte de esta experiencia.</p>
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:20px">
              <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Numero de compra</strong><br />${escapeHtml(order.id)}</div>
              <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Fecha</strong><br />${safeDate}</div>
              <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Total pagado</strong><br />${escapeHtml(total)}</div>
              <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Estado</strong><br />${safeStatus}</div>
            </div>
            <div style="padding:20px;border-radius:22px;background:linear-gradient(180deg,rgba(233,248,255,0.75),rgba(255,248,252,0.92));margin-bottom:18px">
              <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#4b99d6">${safePackage}</p>
              <p style="margin:0 0 8px">Participaciones asociadas: <strong>${order.order.participations}</strong></p>
              <p style="margin:0">Tickets asignados: <strong>${safeTickets}</strong></p>
            </div>
            <div style="padding:20px;border-radius:22px;background:#f8fcff;margin-bottom:18px">
              <p style="margin:0 0 8px"><strong>Email de contacto</strong>: ${safeEmail}</p>
              <p style="margin:0 0 8px"><strong>Telefono</strong>: ${safePhone}</p>
              <p style="margin:0"><strong>Detalle de pago</strong>: ${safePaymentDetail}</p>
            </div>
            <div style="padding:18px 20px;border-left:4px solid #4b99d6;background:#fbfdff;border-radius:0 18px 18px 0;margin-bottom:20px">
              <p style="margin:0;font-size:14px;line-height:1.7">Te recomendamos conservar este correo como comprobante de tu compra. Si necesitas ayuda o deseas realizar una consulta, puedes responder a este mensaje y nuestro equipo te asistira con gusto.</p>
            </div>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.7">Agradecemos sinceramente tu participacion.</p>
            <p style="margin:0;font-size:15px;line-height:1.7"><strong>Equipo FunKids</strong></p>
          </div>
          <div style="padding:18px 32px;background:#f8fbfe;border-top:1px solid rgba(91,166,216,0.12)">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#6e7592">Este correo fue emitido automaticamente desde ${escapeHtml(smtpConfig.fromEmail)} como respaldo de tu compra en FunKids.</p>
          </div>
        </div>
      </div>
    `,
  };
}

function buildInternalOrderNotificationEmail(
  order: OrderRecord,
  transaction: WebpayTransactionRecord | null,
  smtpConfig: SmtpConfig,
) {
  const orderDate = formatReceiptDate(order.createdAt);
  const total = formatCurrency(order.order.amount);
  const subject = `Nueva compra FunKids - ${order.participant.fullName}`;
  const ticketList = order.order.ticketNumbers.join(', ');
  const contactEmail = order.participant.email ?? 'Sin email';
  const phone = order.participant.phone ?? 'Sin telefono';
  const paymentDetail =
    order.channel === 'cash'
      ? 'Venta en efectivo registrada por el administrador.'
      : transaction?.authorizationCode
        ? `Pago Webpay confirmado. Autorizacion: ${transaction.authorizationCode}`
        : 'Pago Webpay confirmado.';

  return {
    subject,
    text: [
      'Se registro una nueva compra en FunKids.',
      '',
      `Cliente: ${order.participant.fullName}`,
      `Email: ${contactEmail}`,
      `Telefono: ${phone}`,
      `Compra: ${order.id}`,
      `Fecha: ${orderDate}`,
      `Canal: ${order.sourceLabel}`,
      `Estado: ${order.status === 'paid' ? 'Pagado' : 'Pendiente'}`,
      `Modalidad: ${order.order.packageLabel}`,
      `Participaciones: ${order.order.participations}`,
      `Total: ${total}`,
      `Tickets: ${ticketList}`,
      `Detalle de pago: ${paymentDetail}`,
      order.notes ? `Nota: ${order.notes}` : '',
      '',
      `Correo emitido por ${smtpConfig.fromEmail}.`,
    ]
      .filter(Boolean)
      .join('\r\n'),
    html: `
      <div style="margin:0;padding:24px;background:#f4fbff;font-family:Arial,sans-serif;color:#465071">
        <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;border:1px solid rgba(91,166,216,0.14);box-shadow:0 18px 48px rgba(49,56,75,0.08)">
          <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4b99d6">Alerta interna FunKids</p>
          <h1 style="margin:0 0 12px;font-size:28px;line-height:1.05;color:#4b99d6">Nueva compra registrada</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Se registro una nueva compra para <strong>${escapeHtml(order.participant.fullName)}</strong>.</p>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px">
            <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Compra</strong><br />${escapeHtml(order.id)}</div>
            <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Fecha</strong><br />${escapeHtml(orderDate)}</div>
            <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Total</strong><br />${escapeHtml(total)}</div>
            <div style="padding:14px 16px;border-radius:18px;background:#f8fcff"><strong>Estado</strong><br />${escapeHtml(order.status === 'paid' ? 'Pagado' : 'Pendiente')}</div>
          </div>
          <div style="padding:18px;border-radius:20px;background:linear-gradient(180deg,rgba(233,248,255,0.75),rgba(255,248,252,0.92));margin-bottom:18px">
            <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#4b99d6">${escapeHtml(order.order.packageLabel)}</p>
            <p style="margin:0 0 8px">Participaciones: <strong>${order.order.participations}</strong></p>
            <p style="margin:0">Tickets: <strong>${escapeHtml(ticketList)}</strong></p>
          </div>
          <div style="padding:18px;border-radius:20px;background:#f8fcff">
            <p style="margin:0 0 8px"><strong>Email</strong>: ${escapeHtml(contactEmail)}</p>
            <p style="margin:0 0 8px"><strong>Telefono</strong>: ${escapeHtml(phone)}</p>
            <p style="margin:0 0 8px"><strong>Canal</strong>: ${escapeHtml(order.sourceLabel)}</p>
            <p style="margin:0"><strong>Pago</strong>: ${escapeHtml(paymentDetail)}</p>
          </div>
        </div>
      </div>
    `,
  };
}

async function sendSmtpEmail(
  config: SmtpConfig,
  input: {
    to: string[];
    subject: string;
    text: string;
    html: string;
  },
) {
  const socket = connect(
    {
      hostname: config.host,
      port: config.port,
    },
    {
      secureTransport: config.secure ? 'on' : 'starttls',
    },
  );

  await withTimeout(
    socket.opened,
    config.timeoutMs,
    `No fue posible establecer conexion con ${config.host}:${config.port}.`,
  );

  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const client = new SmtpClient(reader, writer, config.timeoutMs);

  try {
    await client.expect(220, 'No hubo saludo inicial del servidor SMTP.');
    await client.send(`EHLO ${config.helloHost}`);
    await client.expect(250, 'El servidor SMTP no acepto EHLO.');

    await client.send('AUTH LOGIN');
    await client.expect(334, 'El servidor SMTP no acepto AUTH LOGIN.');
    await client.send(encodeBase64Utf8(config.username));
    await client.expect(334, 'El servidor SMTP no solicito la contrasena.');
    await client.send(encodeBase64Utf8(config.password));
    await client.expect(235, 'Las credenciales SMTP no fueron aceptadas.');

    await client.send(`MAIL FROM:<${config.fromEmail}>`);
    await client.expect(250, 'El servidor SMTP rechazo el remitente.');
    for (const recipient of input.to) {
      await client.send(`RCPT TO:<${recipient}>`);
      await client.expectAny([250, 251], 'El servidor SMTP rechazo uno de los destinatarios.');
    }
    await client.send('DATA');
    await client.expect(354, 'El servidor SMTP no acepto el contenido del mensaje.');
    await client.sendRaw(`${escapeSmtpData(buildMimeMessage(config, input))}\r\n.\r\n`);
    await client.expect(250, 'El servidor SMTP no confirmo el envio del mensaje.');

    await client.send('QUIT');
    await client.expectAny([221, 250], 'El servidor SMTP no cerro la sesion correctamente.');
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Ignorado: el reader puede quedar cerrado por el servidor o por QUIT.
    }

    try {
      await writer.close();
    } catch {
      try {
        await writer.abort();
      } catch {
        // Ignorado: el servidor puede cerrar antes la conexion luego de QUIT.
      }
    }

    try {
      await socket.close();
    } catch {
      // Ignorado: solo necesitamos liberar la conexion.
    }

    try {
      await withTimeout(socket.closed, 1500, 'Socket close timeout');
    } catch {
      // Ignorado: no queremos dejar colgado el request por el cierre del socket.
    }
  }
}

function buildMimeMessage(
  config: SmtpConfig,
  input: { to: string[]; subject: string; text: string; html: string },
) {
  const boundary = `fk-${crypto.randomUUID()}`;
  const fromHeader = `${encodeMimeHeader(config.fromName)} <${config.fromEmail}>`;
  const messageIdDomain = config.fromEmail.split('@')[1] ?? 'funkids.cl';
  const toHeader = input.to.map((recipient) => `<${recipient}>`).join(', ');

  return [
    `From: ${fromHeader}`,
    `To: ${toHeader}`,
    `Subject: ${encodeMimeHeader(input.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${messageIdDomain}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(encodeBase64Utf8(input.text)),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(encodeBase64Utf8(input.html)),
    '',
    `--${boundary}--`,
  ].join('\r\n');
}

class SmtpClient {
  private readonly decoder = new TextDecoder();
  private buffer = '';

  constructor(
    private readonly reader: ReadableStreamDefaultReader<Uint8Array>,
    private readonly writer: WritableStreamDefaultWriter<Uint8Array>,
    private readonly timeoutMs: number,
  ) {}

  async send(line: string) {
    await this.sendRaw(`${line}\r\n`);
  }

  async sendRaw(payload: string) {
    await withTimeout(
      this.writer.write(new TextEncoder().encode(payload)),
      this.timeoutMs,
      'El servidor SMTP no acepto datos dentro del tiempo esperado.',
    );
  }

  async expect(code: number, errorMessage: string) {
    const response = await this.readResponse();
    if (response.code !== code) {
      throw new Error(`${errorMessage} ${response.message}`.trim());
    }

    return response;
  }

  async expectAny(codes: number[], errorMessage: string) {
    const response = await this.readResponse();
    if (!codes.includes(response.code)) {
      throw new Error(`${errorMessage} ${response.message}`.trim());
    }

    return response;
  }

  private async readResponse() {
    const lines: string[] = [];

    while (true) {
      const nextLines = this.consumeLines();
      if (nextLines.length > 0) {
        lines.push(...nextLines);
        const lastLine = lines[lines.length - 1];
        if (/^\d{3} /.test(lastLine)) {
          return {
            code: Number.parseInt(lastLine.slice(0, 3), 10),
            message: lines.join(' ').trim(),
          };
        }
      }

      const chunk = await withTimeout(
        this.reader.read(),
        this.timeoutMs,
        'El servidor SMTP no respondio dentro del tiempo esperado.',
      );
      if (chunk.done) {
        throw new Error('La conexion SMTP se cerro antes de completar la respuesta.');
      }

      this.buffer += this.decoder.decode(chunk.value, { stream: true });
    }
  }

  private consumeLines() {
    const lines: string[] = [];
    let separatorIndex = this.buffer.indexOf('\r\n');

    while (separatorIndex !== -1) {
      lines.push(this.buffer.slice(0, separatorIndex));
      this.buffer = this.buffer.slice(separatorIndex + 2);
      separatorIndex = this.buffer.indexOf('\r\n');
    }

    return lines;
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function encodeMimeHeader(value: string) {
  return `=?UTF-8?B?${encodeBase64Utf8(value)}?=`;
}

function encodeBase64Utf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function wrapBase64(value: string) {
  return value.match(/.{1,76}/g)?.join('\r\n') ?? value;
}

function escapeSmtpData(value: string) {
  return value.replace(/\r?\n/g, '\r\n').replace(/(^|\r\n)\./g, '$1..');
}

function formatReceiptDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Santiago',
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function signAdminToken(config: AdminConfig) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${config.email}.${expiresAt}`;
  const signature = await createSignature(payload, config.sessionSecret);
  return `${payload}.${signature}`;
}

async function verifyAdminToken(token: string, config: AdminConfig) {
  const parts = token.split('.');
  if (parts.length < 3) {
    return false;
  }

  const expiresAt = Number(parts[parts.length - 2]);
  const signature = parts[parts.length - 1];
  const email = parts.slice(0, -2).join('.');

  if (!email || email !== config.email || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const payload = `${email}.${expiresAt}`;
  const expectedSignature = await createSignature(payload, config.sessionSecret);
  return expectedSignature === signature;
}

async function createSignature(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toHex(signature);
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}
