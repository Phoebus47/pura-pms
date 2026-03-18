/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIError } from '../client';
import { mockDb } from './data';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseUrl(urlStr: string) {
  const [path, query] = urlStr.split('?');
  const params = new URLSearchParams(query || '');
  return { path, params };
}

function handleAuth(method: string, path: string, body: any) {
  if (path === '/auth/login' && method === 'POST') {
    const user = mockDb.users.find(
      (u: any) => u.email === body.email && u.password === body.password,
    );
    if (!user) {
      throw new APIError(401, 'Unauthorized', {
        message: 'Invalid credentials',
      });
    }
    return {
      access_token: 'mock-jwt-token-demo-12345',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = mockDb.users[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}

function handleMetrics(method: string, path: string) {
  if (method === 'GET') {
    if (path === '/metrics/occupancy') {
      return {
        totalRooms: 15,
        occupiedRooms: 1,
        vacantRooms: 14,
        occupancyRate: 6.67,
      };
    }
    if (path === '/metrics/arrivals') {
      return { arrivals: 0, departures: 0, stayOvers: 1 };
    }
  }
}

function populateWindow(w: any) {
  const transactions = mockDb.folioTransactions
    .filter((t: any) => t.windowId === w.id)
    .map((t: any) => ({
      ...t,
      trxCode: mockDb.transactionCodes.find((c: any) => c.id === t.trxCodeId),
    }));
  return { ...w, transactions };
}

function populateFolio(f: any) {
  const windows = mockDb.folioWindows
    .filter((w: any) => w.folioId === f.id)
    .map(populateWindow);
  return { ...f, windows };
}

function handleFolioGet(path: string) {
  if (path === '/folios/transactions/codes') {
    return mockDb.transactionCodes;
  }

  if (path.startsWith('/folios/reservation/')) {
    const resId = path.split('/').pop();
    const folios = mockDb.folios.filter((f: any) => f.reservationId === resId);
    return folios.map(populateFolio);
  }
}

function handleFolioPostWindowBalance(
  windowId: string,
  folioId: string,
  total: number,
) {
  const win = mockDb.folioWindows.find((w: any) => w.id === windowId);
  win!.balance += total;

  const fol = mockDb.folios.find((f: any) => f.id === folioId);
  if (fol) fol.balance += total;
}

function handleFinancialGet(path: string) {
  if (path === '/financial/transaction-codes') {
    return mockDb.transactionCodes;
  }
  if (path === '/financial/reason-codes') {
    return mockDb.reasonCodes;
  }
}

function handleFinancial(method: string, path: string) {
  if (method === 'GET') return handleFinancialGet(path);
}

function handleNightAuditStatus(path: string) {
  const match = /^\/night-audit\/status\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match) return;

  const propertyId = decodeURIComponent(match[1]);
  const businessDate = decodeURIComponent(match[2]);

  const audit = mockDb.nightAudits.find(
    (a: any) => a.propertyId === propertyId && a.businessDate === businessDate,
  );
  if (!audit) {
    return { status: 'NOT_STARTED' };
  }

  const errors = mockDb.auditErrors.filter(
    (e: any) => e.nightAuditId === audit.id,
  );
  const reports = mockDb.reportArchives.filter(
    (r: any) => r.nightAuditId === audit.id,
  );

  return { ...audit, errors, reports };
}

function handleNightAuditRun(body: any) {
  if (!body?.propertyId || !body?.businessDate) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId and businessDate are required',
    });
  }

  const existing = mockDb.nightAudits.find(
    (a: any) =>
      a.propertyId === body.propertyId && a.businessDate === body.businessDate,
  );
  if (existing?.status === 'COMPLETED') {
    return {
      status: 'ALREADY_COMPLETED',
      message: 'Night audit for this date is already completed',
    };
  }

  const audit = existing ?? {
    id: `na_mock_${Date.now()}`,
    propertyId: body.propertyId,
    businessDate: body.businessDate,
    roomsPosted: 0,
    revenuePosted: 0,
    startedAt: null,
    completedAt: null,
    status: 'PENDING',
  };

  audit.status = 'IN_PROGRESS';
  audit.startedAt = new Date().toISOString();

  if (!existing) {
    mockDb.nightAudits.push(audit);
  }

  // For demo/mock purposes we complete immediately and create a report archive.
  audit.roomsPosted = 1;
  audit.revenuePosted = 3500;
  audit.status = 'COMPLETED';
  audit.completedAt = new Date().toISOString();

  mockDb.reportArchives.push({
    id: `ra_mock_${Date.now()}`,
    nightAuditId: audit.id,
    reportType: 'NIGHT_AUDIT_SUMMARY',
    reportName: `Night Audit Summary - ${new Date(body.businessDate).toLocaleDateString()}`,
  });

  return {
    status: 'STARTED',
    nightAuditId: audit.id,
    message: 'Night audit job queued',
  };
}

function handleNightAudit(method: string, path: string, body: any) {
  if (method === 'GET') return handleNightAuditStatus(path);
  if (method === 'POST' && path === '/night-audit/run')
    return handleNightAuditRun(body);
}

function handleFolioVoid(path: string, body: any) {
  const match = /^\/folios\/transactions\/([a-zA-Z0-9_-]+)\/void$/.exec(path);
  if (!match) return;

  const trxId = match[1];
  const original = mockDb.folioTransactions.find((t: any) => t.id === trxId);
  if (!original) {
    throw new APIError(404, 'Not Found', { message: 'Transaction not found' });
  }
  if (original.isVoid) {
    throw new APIError(400, 'Bad Request', {
      message: 'Transaction is already voided',
    });
  }
  if (!body?.reasonCodeId) {
    throw new APIError(400, 'Bad Request', {
      message: 'reasonCodeId is required for voiding',
    });
  }
  const reason = mockDb.reasonCodes.find(
    (r: any) => r.id === body.reasonCodeId,
  );
  if (reason?.isActive !== true) {
    throw new APIError(400, 'Bad Request', {
      message: 'Invalid or inactive reason code',
    });
  }

  const correction = {
    id: `ft_void_${Date.now()}`,
    windowId: original.windowId,
    trxCodeId: original.trxCodeId,
    amountNet: original.amountNet,
    amountService: original.amountService,
    amountTax: original.amountTax,
    amountTotal: original.amountTotal,
    sign: original.sign * -1,
    reference: original.reference || '',
    remark: body.remark || '',
    reasonCodeId: body.reasonCodeId,
    createdAt: new Date().toISOString(),
    isVoid: true,
    relatedTrxId: original.id,
  };

  mockDb.folioTransactions.push(correction);

  original.isVoid = true;
  original.reasonCodeId = body.reasonCodeId;
  original.relatedTrxId = correction.id;

  const folioId = mockDb.folioWindows.find(
    (w: any) => w.id === original.windowId,
  )?.folioId;
  const totalImpact = Number(original.amountTotal) * original.sign * -1;
  if (folioId) {
    handleFolioPostWindowBalance(original.windowId, folioId, totalImpact);
  }

  return { id: correction.id };
}

function handleFolioPost(path: string, body: any) {
  const voidRes = handleFolioVoid(path, body);
  if (voidRes !== undefined) return voidRes;

  const match = /^\/folios\/([a-zA-Z0-9_-]+)\/transactions$/.exec(path);
  if (!match) return;

  const folioId = match[1];
  const windowId = mockDb.folioWindows.find(
    (w: any) => w.folioId === folioId && w.windowNumber === body.windowNumber,
  )?.id;

  if (!windowId) {
    throw new APIError(404, 'Not Found', { message: 'Window not found' });
  }

  const tc = mockDb.transactionCodes.find((c: any) => c.id === body.trxCodeId);
  if (!tc) {
    throw new APIError(404, 'Not Found', { message: 'Trx Code not found' });
  }

  const net = Number(body.amountNet);
  const srv = tc.hasService ? net * ((tc.serviceRate as number) / 100) : 0;
  const tax = tc.hasTax ? (net + srv) * ((tc.taxRate as number) / 100) : 0;
  const sign = tc.type === 'CHARGE' ? 1 : -1;
  const total = (net + srv + tax) * sign;

  const newTrx = {
    id: `ft_mock_${Date.now()}`,
    windowId,
    trxCodeId: tc.id,
    amountNet: net,
    amountService: srv,
    amountTax: tax,
    amountTotal: total,
    sign,
    reference: body.reference || '',
    userId: 'usr_mock_1',
    createdAt: new Date().toISOString(),
    isVoid: false,
  };

  mockDb.folioTransactions.push(newTrx);
  handleFolioPostWindowBalance(windowId, folioId, total);

  return { id: newTrx.id };
}

function handleFolios(method: string, path: string, body: any) {
  if (method === 'GET') return handleFolioGet(path);
  if (method === 'POST') return handleFolioPost(path, body);
}

function handlePropertiesGet(path: string) {
  if (path === '/properties') return mockDb.properties;
  const match = /^\/properties\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) return mockDb.properties.find((p: any) => p.id === match[1]);
}

function handlePropertiesPost(path: string, body: any) {
  if (path === '/properties') {
    const newProp = {
      ...body,
      id: `prop_mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockDb.properties.push(newProp);
    return newProp;
  }
}

function handlePropertiesPatch(path: string, body: any) {
  const match = /^\/properties\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    const idx = mockDb.properties.findIndex((p: any) => p.id === match[1]);
    if (idx !== -1) {
      mockDb.properties[idx] = { ...mockDb.properties[idx], ...body };
    }
    return mockDb.properties[idx];
  }
}

function handlePropertiesDelete(path: string) {
  const match = /^\/properties\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    mockDb.properties = mockDb.properties.filter((p: any) => p.id !== match[1]);
    return { success: true };
  }
}

function handleProperties(method: string, path: string, body: any) {
  if (method === 'GET') return handlePropertiesGet(path);
  if (method === 'POST') return handlePropertiesPost(path, body);
  if (method === 'PATCH') return handlePropertiesPatch(path, body);
  if (method === 'DELETE') return handlePropertiesDelete(path);
}

function handleRoomsGet(path: string) {
  if (path === '/rooms') return mockDb.rooms;
  const match = /^\/rooms\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) return mockDb.rooms.find((r: any) => r.id === match[1]);
}

function handleRoomsPost(path: string, body: any) {
  if (path === '/rooms') {
    const newRoom = { ...body, id: `rm_mock_${Date.now()}` };
    mockDb.rooms.push(newRoom);
    return newRoom;
  }
}

function handleRoomsPatch(path: string, body: any) {
  let match = /^\/rooms\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    const idx = mockDb.rooms.findIndex((r: any) => r.id === match[1]);
    if (idx !== -1) mockDb.rooms[idx] = { ...mockDb.rooms[idx], ...body };
    return mockDb.rooms[idx];
  }
  match = /^\/rooms\/([a-zA-Z0-9_-]+)\/status$/.exec(path);
  if (match) {
    const idx = mockDb.rooms.findIndex((r: any) => r.id === match[1]);
    if (idx !== -1) mockDb.rooms[idx].status = body.status;
    return mockDb.rooms[idx];
  }
}

function handleRoomsDelete(path: string) {
  const match = /^\/rooms\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    mockDb.rooms = mockDb.rooms.filter((r: any) => r.id !== match[1]);
    return { success: true };
  }
}

function handleRooms(method: string, path: string, body: any) {
  if (method === 'GET') return handleRoomsGet(path);
  if (method === 'POST') return handleRoomsPost(path, body);
  if (method === 'PATCH') return handleRoomsPatch(path, body);
  if (method === 'DELETE') return handleRoomsDelete(path);
}

function updateReservationRoomStatus(res: any, status: string) {
  if (res.roomId) {
    const rmIdx = mockDb.rooms.findIndex((r: any) => r.id === res.roomId);
    if (rmIdx !== -1) mockDb.rooms[rmIdx].status = status;
  }
}

function handleReservationsGet(path: string) {
  if (path === '/reservations') return mockDb.reservations;
  const match = /^\/reservations\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) return mockDb.reservations.find((r: any) => r.id === match[1]);
}

function handleReservationsPost(path: string, body: any) {
  if (path === '/reservations') {
    const randomSuffix = Math.floor(Math.random() * 10000); // NOSONAR
    const newRes = {
      ...body,
      id: `res_mock_${Date.now()}`,
      confirmNumber: `CN-DM-${randomSuffix}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
    mockDb.reservations.push(newRes);
    return newRes;
  }
  let match = /^\/reservations\/([a-zA-Z0-9_-]+)\/check-in$/.exec(path);
  if (match) {
    const idx = mockDb.reservations.findIndex((r: any) => r.id === match[1]);
    if (idx !== -1) {
      mockDb.reservations[idx].status = 'CHECKED_IN';
      updateReservationRoomStatus(mockDb.reservations[idx], 'OCCUPIED_CLEAN');
    }
    return mockDb.reservations[idx];
  }
  match = /^\/reservations\/([a-zA-Z0-9_-]+)\/check-out$/.exec(path);
  if (match) {
    const idx = mockDb.reservations.findIndex((r: any) => r.id === match[1]);
    if (idx !== -1) {
      mockDb.reservations[idx].status = 'CHECKED_OUT';
      updateReservationRoomStatus(mockDb.reservations[idx], 'VACANT_DIRTY');
    }
    return mockDb.reservations[idx];
  }
}

function handleReservationsPatch(path: string, body: any) {
  const match = /^\/reservations\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    const idx = mockDb.reservations.findIndex((r: any) => r.id === match[1]);
    if (idx !== -1) {
      mockDb.reservations[idx] = { ...mockDb.reservations[idx], ...body };
    }
    return mockDb.reservations[idx];
  }
}

function handleReservationsDelete(path: string) {
  const match = /^\/reservations\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    mockDb.reservations = mockDb.reservations.filter(
      (r: any) => r.id !== match[1],
    );
    return { success: true };
  }
}

function handleReservations(method: string, path: string, body: any) {
  if (method === 'GET') return handleReservationsGet(path);
  if (method === 'POST') return handleReservationsPost(path, body);
  if (method === 'PATCH') return handleReservationsPatch(path, body);
  if (method === 'DELETE') return handleReservationsDelete(path);
}

function handleGuestsGet(path: string, params: URLSearchParams) {
  if (path === '/guests') {
    let filtered = mockDb.guests;
    if (params.get('search')) {
      const s = params.get('search')!.toLowerCase();
      filtered = filtered.filter(
        (g: any) =>
          g.firstName.toLowerCase().includes(s) ||
          g.lastName.toLowerCase().includes(s),
      );
    }
    return {
      data: filtered,
      total: filtered.length,
      limit: Number(params.get('limit')) || 50,
      offset: Number(params.get('offset')) || 0,
    };
  }
  const match = /^\/guests\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) return mockDb.guests.find((g: any) => g.id === match[1]);
}

function handleGuestsPost(path: string, body: any) {
  if (path === '/guests') {
    const newGuest = {
      ...body,
      id: `gst_mock_${Date.now()}`,
      totalStays: 0,
      totalRevenue: 0,
      vipLevel: body.vipLevel || 0,
      isBlacklist: false,
    };
    mockDb.guests.unshift(newGuest);
    return newGuest;
  }
}

function handleGuestsPatch(path: string, body: any) {
  let match = /^\/guests\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    const idx = mockDb.guests.findIndex((g: any) => g.id === match[1]);
    if (idx !== -1) mockDb.guests[idx] = { ...mockDb.guests[idx], ...body };
    return mockDb.guests[idx];
  }

  match = /^\/guests\/([a-zA-Z0-9_-]+)\/blacklist$/.exec(path);
  if (match) {
    const idx = mockDb.guests.findIndex((g: any) => g.id === match[1]);
    if (idx !== -1)
      mockDb.guests[idx].isBlacklist = !mockDb.guests[idx].isBlacklist;
    return mockDb.guests[idx];
  }
}

function handleGuestsDelete(path: string) {
  const match = /^\/guests\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    mockDb.guests = mockDb.guests.filter((g: any) => g.id !== match[1]);
    return { success: true };
  }
}

function handleGuests(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (method === 'GET') return handleGuestsGet(path, params);
  if (method === 'POST') return handleGuestsPost(path, body);
  if (method === 'PATCH') return handleGuestsPatch(path, body);
  if (method === 'DELETE') return handleGuestsDelete(path);
}

export async function routeMockRequest<T>(
  endpoint: string,
  options: any,
): Promise<T> {
  await delay(200 + Math.random() * 300); // NOSONAR

  const { path, params } = parseUrl(endpoint);
  const method = options.method || 'GET';

  let body: any = null;

  try {
    body = options.body ? JSON.parse(options.body) : null;
    console.log(
      `[MOCK API] ${method} ${path}`,
      body || params.toString() || '',
    );

    const handlers = [
      () => handleAuth(method, path, body),
      () => handleMetrics(method, path),
      () => handleFinancial(method, path),
      () => handleNightAudit(method, path, body),
      () => handleFolios(method, path, body),
      () => handleProperties(method, path, body),
      () => handleRooms(method, path, body),
      () => handleReservations(method, path, body),
      () => handleGuests(method, path, body, params),
    ];

    for (const handler of handlers) {
      const result = handler();
      if (result !== undefined) return result as unknown as T;
    }

    throw new APIError(404, 'Not Found', {
      message: `Mock route not defined: ${method} ${path}`,
    });
  } catch (err: any) {
    if (err instanceof APIError) throw err;
    throw new APIError(500, 'Internal Mock Server Error', {
      message: err.message,
    });
  }
}
