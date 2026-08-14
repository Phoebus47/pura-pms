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

function buildDailyRevenueReport(propertyId: string, date: string) {
  const dateKey = toDateKey(date);
  const summary: Record<
    string,
    { net: number; tax: number; service: number; total: number }
  > = {};

  for (const trx of mockDb.folioTransactions) {
    if (trx.isVoid) continue;
    const window = mockDb.folioWindows.find((w: any) => w.id === trx.windowId);
    const folio = mockDb.folios.find((f: any) => f.id === window?.folioId);
    const reservation = mockDb.reservations.find(
      (r: any) => r.id === folio?.reservationId,
    );
    if (reservation && reservation.propertyId !== propertyId) continue;
    if (trx.businessDate && toDateKey(trx.businessDate) !== dateKey) continue;
    const code = mockDb.transactionCodes.find(
      (c: any) => c.id === trx.trxCodeId,
    );
    const group = code?.group || 'MISC';
    if (!summary[group]) {
      summary[group] = { net: 0, tax: 0, service: 0, total: 0 };
    }
    summary[group].net += Number(trx.amountNet) || 0;
    summary[group].tax += Number(trx.amountTax) || 0;
    summary[group].service += Number(trx.amountService) || 0;
    summary[group].total += Number(trx.amountTotal) || 0;
  }

  const totalRevenue = Object.values(summary).reduce(
    (sum, bucket) => sum + bucket.total,
    0,
  );
  return {
    businessDate: dateKey,
    propertyId,
    summary,
    totalRevenue: round2(totalRevenue),
  };
}

function buildDailyFlash(propertyId: string, date: string) {
  const drr = buildDailyRevenueReport(propertyId, date);
  const rooms = mockDb.rooms.filter((r: any) => r.propertyId === propertyId);
  const reservations = mockDb.reservations.filter(
    (r: any) =>
      r.propertyId === propertyId &&
      r.status !== 'CANCELLED' &&
      r.status !== 'NO_SHOW',
  );
  const occupied = reservations.filter((r: any) => r.status === 'CHECKED_IN');
  const occupiedRooms = new Set(occupied.map((r: any) => r.roomId)).size;
  const totalRooms = rooms.length;
  return {
    businessDate: drr.businessDate,
    propertyId,
    occupancy: {
      totalRooms,
      occupiedRooms,
      occupancyRate:
        totalRooms > 0
          ? Math.round((occupiedRooms / totalRooms) * 10000) / 100
          : 0,
    },
    arrivals: reservations.filter((r: any) => r.status === 'CONFIRMED').length,
    departures: reservations.filter((r: any) => r.status === 'CHECKED_OUT')
      .length,
    stayOvers: occupiedRooms,
    roomRevenue: drr.summary.ROOM?.total ?? 0,
    totalRevenue: drr.totalRevenue,
  };
}

function handleFinancialGet(path: string, params: URLSearchParams) {
  if (path === '/financial/transaction-codes') {
    return mockDb.transactionCodes;
  }
  if (path === '/financial/reason-codes') {
    return mockDb.reasonCodes;
  }
  if (path === '/financial/reports/drr') {
    return buildDailyRevenueReport(
      params.get('propertyId') || 'prop_mock_1',
      params.get('date') || new Date().toISOString(),
    );
  }
  if (path === '/financial/reports/flash') {
    return buildDailyFlash(
      params.get('propertyId') || 'prop_mock_1',
      params.get('date') || new Date().toISOString(),
    );
  }
}

function handleFinancial(
  method: string,
  path: string,
  params: URLSearchParams,
) {
  if (method === 'GET') return handleFinancialGet(path, params);
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

function toDateKey(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveCashierUserId(userId?: string): string {
  if (!userId || userId === 'CURRENT_USER') return 'usr_mock_1';
  return userId;
}

function findOpenShift(userId: string, propertyId?: string) {
  return mockDb.shifts.find(
    (s: any) =>
      s.status === 'OPEN' &&
      s.userId === userId &&
      (!propertyId || s.propertyId === propertyId),
  );
}

function getFolioPropertyId(folioId: string): string | undefined {
  const folio = mockDb.folios.find((f: any) => f.id === folioId);
  const reservation = mockDb.reservations.find(
    (r: any) => r.id === folio?.reservationId,
  );
  return reservation?.propertyId;
}

function requireOpenShiftForCashier(userId: string, propertyId?: string) {
  if (userId === 'SYSTEM') return null;
  const shift = findOpenShift(userId, propertyId);
  if (!shift) {
    throw new APIError(400, 'Bad Request', {
      message: 'No open shift for this user and property',
    });
  }
  return shift;
}

function computeExpectedCash(shift: any): number {
  const cashCodeIds = new Set(
    mockDb.transactionCodes
      .filter((c: any) => c.code === '9000')
      .map((c: any) => c.id),
  );
  const lines = mockDb.folioTransactions.filter(
    (t: any) => t.shiftId === shift.id && cashCodeIds.has(t.trxCodeId),
  );
  let cashIn = 0;
  let cashOut = 0;
  for (const line of lines) {
    const magnitude = Math.abs(Number(line.amountTotal));
    if (line.sign === -1) cashIn += magnitude;
    else if (line.sign === 1) cashOut += magnitude;
  }
  return round2(Number(shift.openingCash) + cashIn - cashOut);
}

function enrichShift(shift: any, withLines: boolean) {
  const expectedCash =
    shift.status === 'OPEN' ? computeExpectedCash(shift) : shift.expectedCash;
  const result: any = { ...shift, expectedCash };
  if (withLines) {
    const txs = mockDb.folioTransactions.filter(
      (t: any) => t.shiftId === shift.id,
    );
    const cashIds = new Set(
      mockDb.transactionCodes
        .filter((c: any) => c.code === '9000')
        .map((c: any) => c.id),
    );
    result.transactionCount = txs.length;
    result.cashLines = txs.filter((t: any) => cashIds.has(t.trxCodeId));
  }
  return result;
}

function nextShiftNumber(businessDate: string): string {
  const ymd = toDateKey(businessDate).replaceAll('-', '');
  return `SH-${ymd}-mock-${mockDb.shifts.length + 1}`;
}

function createOpenShift(input: {
  userId: string;
  propertyId: string;
  openingCash: number;
  businessDate: string;
  handoverFromShiftId?: string | null;
  notes?: string | null;
}) {
  const shift = {
    id: `sh_mock_${Date.now()}_${mockDb.shifts.length}`,
    shiftNumber: nextShiftNumber(input.businessDate),
    userId: input.userId,
    propertyId: input.propertyId,
    businessDate: input.businessDate,
    startTime: new Date().toISOString(),
    endTime: null,
    openingCash: Number(input.openingCash),
    closingCash: null,
    expectedCash: Number(input.openingCash),
    cashVariance: null,
    status: 'OPEN',
    closedBy: null,
    managerApprovedBy: null,
    managerApprovedAt: null,
    varianceReason: null,
    handoverToUserId: null,
    handoverFromShiftId: input.handoverFromShiftId ?? null,
    notes: input.notes ?? null,
  };
  mockDb.shifts.push(shift);
  return shift;
}

function closeShiftRecord(
  shift: any,
  closingCash: number,
  userId: string,
  varianceReason?: string,
  notes?: string,
) {
  if (shift.status !== 'OPEN') {
    throw new APIError(400, 'Bad Request', {
      message: 'Shift is not OPEN',
    });
  }
  const expectedCash = computeExpectedCash(shift);
  const variance = round2(Number(closingCash) - expectedCash);
  if (variance !== 0 && !varianceReason) {
    throw new APIError(400, 'Bad Request', {
      message: 'varianceReason is required when cash does not balance',
    });
  }
  shift.expectedCash = expectedCash;
  shift.closingCash = Number(closingCash);
  shift.cashVariance = variance;
  shift.status = variance === 0 ? 'BALANCED' : 'CLOSED';
  shift.endTime = new Date().toISOString();
  shift.closedBy = userId;
  shift.varianceReason = varianceReason || null;
  if (notes !== undefined) shift.notes = notes;
  return shift;
}

function handleShiftsGet(path: string, params: URLSearchParams) {
  if (path === '/shifts') {
    const propertyId = params.get('propertyId');
    const businessDate = params.get('businessDate');
    let list = mockDb.shifts;
    if (propertyId) {
      list = list.filter((s: any) => s.propertyId === propertyId);
    }
    if (businessDate) {
      const key = toDateKey(businessDate);
      list = list.filter((s: any) => toDateKey(s.businessDate) === key);
    }
    return list.map((s: any) => enrichShift(s, false));
  }

  if (path === '/shifts/current') {
    const propertyId = params.get('propertyId');
    const userId = resolveCashierUserId(params.get('userId') || undefined);
    const shift = mockDb.shifts.find(
      (s: any) =>
        s.status === 'OPEN' &&
        s.userId === userId &&
        s.propertyId === propertyId,
    );
    if (!shift) {
      throw new APIError(404, 'Not Found', { message: 'No open shift' });
    }
    return enrichShift(shift, false);
  }

  const match = /^\/shifts\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const shift = mockDb.shifts.find((s: any) => s.id === match[1]);
  if (!shift) {
    throw new APIError(404, 'Not Found', { message: 'Shift not found' });
  }
  return enrichShift(shift, true);
}

function handleShiftsOpen(body: any) {
  if (!body?.propertyId || !body?.userId || body.openingCash === undefined) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId, userId, and openingCash are required',
    });
  }
  const userId = resolveCashierUserId(body.userId);
  if (
    mockDb.shifts.some((s: any) => s.userId === userId && s.status === 'OPEN')
  ) {
    throw new APIError(409, 'Conflict', {
      message: 'User already has an OPEN shift',
    });
  }
  const property = mockDb.properties.find((p: any) => p.id === body.propertyId);
  const businessDate =
    body.businessDate || property?.businessDate || new Date().toISOString();
  return createOpenShift({
    userId,
    propertyId: body.propertyId,
    openingCash: Number(body.openingCash),
    businessDate,
    notes: body.notes ?? null,
  });
}

function findShiftOr404(id: string) {
  const shift = mockDb.shifts.find((s: any) => s.id === id);
  if (!shift) {
    throw new APIError(404, 'Not Found', { message: 'Shift not found' });
  }
  return shift;
}

function handleShiftsClose(path: string, body: any) {
  const match = /^\/shifts\/([a-zA-Z0-9_-]+)\/close$/.exec(path);
  if (!match) return;
  if (body?.closingCash === undefined || !body?.userId) {
    throw new APIError(400, 'Bad Request', {
      message: 'closingCash and userId are required',
    });
  }
  const shift = findShiftOr404(match[1]);
  return closeShiftRecord(
    shift,
    Number(body.closingCash),
    body.userId,
    body.varianceReason,
    body.notes,
  );
}

function handleShiftsApprove(path: string, body: any) {
  const match = /^\/shifts\/([a-zA-Z0-9_-]+)\/approve$/.exec(path);
  if (!match) return;
  if (!body?.userId) {
    throw new APIError(400, 'Bad Request', { message: 'userId is required' });
  }
  const shift = findShiftOr404(match[1]);
  if (shift.status !== 'CLOSED') {
    throw new APIError(400, 'Bad Request', {
      message: 'Only CLOSED shifts can be approved',
    });
  }
  const approver = mockDb.users.find((u: any) => u.id === body.userId);
  const isAdmin = approver?.role === 'ADMIN';
  if (body.userId === shift.userId && !isAdmin) {
    throw new APIError(403, 'Forbidden', {
      message: 'Cannot self-approve',
    });
  }
  shift.status = 'BALANCED';
  shift.managerApprovedBy = body.userId;
  shift.managerApprovedAt = new Date().toISOString();
  if (body.notes !== undefined) shift.notes = body.notes;
  return shift;
}

function handleShiftsHandover(path: string, body: any) {
  const match = /^\/shifts\/([a-zA-Z0-9_-]+)\/handover$/.exec(path);
  if (!match) return;
  if (!body?.toUserId || body.countedCash === undefined || !body?.userId) {
    throw new APIError(400, 'Bad Request', {
      message: 'toUserId, countedCash, and userId are required',
    });
  }
  const shift = findShiftOr404(match[1]);
  const toUserId = resolveCashierUserId(body.toUserId);
  if (
    mockDb.shifts.some((s: any) => s.userId === toUserId && s.status === 'OPEN')
  ) {
    throw new APIError(409, 'Conflict', {
      message: 'Target user already has an OPEN shift',
    });
  }
  closeShiftRecord(
    shift,
    Number(body.countedCash),
    body.userId,
    body.varianceReason || body.notes,
    body.notes,
  );
  shift.handoverToUserId = toUserId;
  const opened = createOpenShift({
    userId: toUserId,
    propertyId: shift.propertyId,
    openingCash: Number(body.countedCash),
    businessDate: shift.businessDate,
    handoverFromShiftId: shift.id,
    notes: body.notes ?? null,
  });
  return { closed: shift, opened };
}

function handleShifts(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/shifts')) return;
  if (method === 'GET') return handleShiftsGet(path, params);
  if (method === 'POST' && path === '/shifts') return handleShiftsOpen(body);
  if (method === 'POST') {
    return (
      handleShiftsClose(path, body) ??
      handleShiftsApprove(path, body) ??
      handleShiftsHandover(path, body)
    );
  }
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
  if (existing?.status === 'IN_PROGRESS') {
    return {
      status: 'ALREADY_IN_PROGRESS',
      message: 'Night audit for this date is already in progress',
    };
  }

  const hasOpenShift = mockDb.shifts.some((s: any) => {
    if (s.status !== 'OPEN' || s.propertyId !== body.propertyId) return false;
    if (body.businessDate && s.businessDate) {
      return toDateKey(s.businessDate) === toDateKey(body.businessDate);
    }
    return true;
  });
  if (hasOpenShift) {
    throw new APIError(400, 'Bad Request', {
      message: 'Cannot start night audit while shifts are OPEN',
    });
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

  const voidUserId =
    body?.userId === 'SYSTEM' ? 'SYSTEM' : resolveCashierUserId(body?.userId);
  const folioIdForVoid = mockDb.folioWindows.find(
    (w: any) => w.id === original.windowId,
  )?.folioId;
  const voidShift =
    voidUserId === 'SYSTEM'
      ? null
      : requireOpenShiftForCashier(
          voidUserId,
          folioIdForVoid ? getFolioPropertyId(folioIdForVoid) : undefined,
        );

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
    userId: voidUserId,
    shiftId: voidShift?.id ?? null,
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

  const postUserId =
    body?.userId === 'SYSTEM' ? 'SYSTEM' : resolveCashierUserId(body?.userId);
  const postShift = requireOpenShiftForCashier(
    postUserId,
    getFolioPropertyId(folioId),
  );

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
    userId: postUserId,
    shiftId: postShift?.id ?? null,
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
      stays: Array.isArray(body?.stays) ? body.stays : [],
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
      () => handleFinancial(method, path, params),
      () => handleNightAudit(method, path, body),
      () => handleShifts(method, path, body, params),
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
