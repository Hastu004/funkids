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

interface PagesEnv {
  DB?: D1Database;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
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

export async function createPurchase(payload: PurchasePayload, env: unknown) {
  const dbResult = getDb(env);
  if ('error' in dbResult) {
    return dbResult.error;
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

  await insertOrder(dbResult.db, record);

  return Response.json({
    status: 'pending_payment',
    participant: record.participant,
    order: record.order,
    nextStep: 'Redirigir al checkout de Webpay para completar el pago.',
    message:
      'Solicitud recibida. En una integracion real, aqui se generaria la sesion de pago y se enviaria el comprobante al email del cliente.',
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

  const config = getAdminConfig(env);
  if ('error' in config) {
    return config.error;
  }

  const authError = await ensureAdminAuthorization(request, config);
  if (authError) {
    return authError;
  }

  const orders = await fetchOrders(dbResult.db);

  return Response.json({
    profile: {
      name: 'Administrador FunKids',
      email: config.email,
      role: 'admin',
    },
    stats: buildDashboardStats(orders),
    orders,
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
  const orders = await fetchOrders(dbResult.db);

  return Response.json({
    message: 'Venta en efectivo registrada correctamente.',
    order: record,
    stats: buildDashboardStats(orders),
  });
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
    dbResult.db.prepare('DELETE FROM orders WHERE id = ?').bind(orderId),
  ]);

  const orders = await fetchOrders(dbResult.db);

  return Response.json({
    message: 'Registro eliminado correctamente.',
    order: currentOrder,
    stats: buildDashboardStats(orders),
  });
}

function getDb(env: unknown): { db: D1Database } | { error: Response } {
  const db = (env as PagesEnv | undefined)?.DB;
  if (!db) {
    return { error: jsonError('No hay base de datos D1 configurada.', 500) };
  }

  return { db };
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

function generateTicketNumbers(count: number) {
  return Array.from({ length: count }, () => `FK-${String(1200 + Math.floor(Math.random() * 8000)).padStart(4, '0')}`);
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
