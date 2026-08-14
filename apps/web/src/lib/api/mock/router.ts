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
  if (path === '/financial/reports/trial-balance') {
    return {
      businessDate: (params.get('date') || '').slice(0, 10),
      propertyId: params.get('propertyId') || 'prop_mock_1',
      rows: [],
      totalDebit: 0,
      totalCredit: 0,
    };
  }
  if (path === '/financial/journals') {
    const propertyId = params.get('propertyId');
    const date = params.get('date');
    return mockDb.journalEntries.filter((entry: any) => {
      if (propertyId && entry.propertyId !== propertyId) return false;
      if (date && String(entry.entryDate).slice(0, 10) !== date.slice(0, 10)) {
        return false;
      }
      return true;
    });
  }
  if (path === '/financial/gl-accounts') {
    return [{ id: 'gl_1100', code: '1100', name: 'Accounts Receivable' }];
  }
}

function handleFinancialPost(path: string, body: any) {
  if (path !== '/financial/journals') return;
  const existing = mockDb.journalEntries.find(
    (entry: any) =>
      entry.propertyId === body.propertyId &&
      String(entry.entryDate).slice(0, 10) ===
        String(body.businessDate).slice(0, 10) &&
      entry.source === (body.source || 'MANUAL'),
  );
  if (existing) return existing;
  const created = {
    id: `je_mock_${Date.now()}`,
    entryNumber: `JE-${String(body.businessDate).slice(0, 10)}`,
    propertyId: body.propertyId,
    entryDate: body.businessDate,
    source: body.source || 'MANUAL',
    isPosted: true,
    lines: [],
  };
  mockDb.journalEntries.push(created);
  return created;
}

function handleFinancial(
  method: string,
  path: string,
  params: URLSearchParams,
  body?: any,
) {
  if (method === 'GET') return handleFinancialGet(path, params);
  if (method === 'POST') return handleFinancialPost(path, body);
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

function getFolioPropertyCurrency(folioId: string): string {
  const propertyId = getFolioPropertyId(folioId);
  const property = mockDb.properties.find((p: any) => p.id === propertyId);
  return property?.currency || 'THB';
}

function findExchangeRate(
  baseCurrency: string,
  targetCurrency: string,
  date: string,
) {
  const dateKey = toDateKey(date);
  const matches = mockDb.exchangeRates.filter(
    (rate: any) =>
      rate.isActive &&
      String(rate.baseCurrency).toUpperCase() === baseCurrency.toUpperCase() &&
      String(rate.targetCurrency).toUpperCase() ===
        targetCurrency.toUpperCase() &&
      toDateKey(rate.effectiveDate) <= dateKey,
  );
  matches.sort((a: any, b: any) =>
    toDateKey(b.effectiveDate).localeCompare(toDateKey(a.effectiveDate)),
  );
  return matches[0];
}

function applyCashFxConversion(
  tc: any,
  body: any,
  folioId: string,
): { net: number; reference: string } {
  const net = Number(body.amountNet);
  const reference = body.reference || '';
  if (tc.code !== '9000') {
    return { net, reference };
  }
  const currency = body.currency as string | undefined;
  const propertyCurrency = getFolioPropertyCurrency(folioId);
  if (!currency || currency.toUpperCase() === propertyCurrency.toUpperCase()) {
    return { net, reference };
  }
  if (body.foreignAmount === undefined) {
    throw new APIError(400, 'Bad Request', {
      message:
        'foreignAmount is required when posting cash in a foreign currency',
    });
  }
  const rateRow = findExchangeRate(
    propertyCurrency,
    currency,
    body.businessDate || new Date().toISOString(),
  );
  if (!rateRow) {
    throw new APIError(400, 'Bad Request', {
      message: 'No exchange rate found for this currency and business date',
    });
  }
  const rate = Number(rateRow.rate);
  return {
    net: round2(Number(body.foreignAmount) * rate),
    reference: `FX ${currency.toUpperCase()} ${body.foreignAmount} @ ${rate.toFixed(4)}`,
  };
}

function handleExchangeRatesGet(path: string, params: URLSearchParams) {
  if (path !== '/exchange-rates') return;
  const baseCurrency = params.get('baseCurrency');
  const targetCurrency = params.get('targetCurrency');
  const date = params.get('date');
  if (baseCurrency && targetCurrency && date) {
    const rate = findExchangeRate(baseCurrency, targetCurrency, date);
    if (!rate) {
      throw new APIError(404, 'Not Found', {
        message: 'Exchange rate not found',
      });
    }
    return rate;
  }
  return mockDb.exchangeRates.filter((rate: any) => rate.isActive);
}

function handleExchangeRatesPost(path: string, body: any) {
  if (path !== '/exchange-rates') return;
  const baseCurrency = String(body.baseCurrency || '').toUpperCase();
  const targetCurrency = String(body.targetCurrency || '').toUpperCase();
  const effectiveDate = body.effectiveDate;
  const duplicate = mockDb.exchangeRates.find(
    (rate: any) =>
      rate.baseCurrency === baseCurrency &&
      rate.targetCurrency === targetCurrency &&
      toDateKey(rate.effectiveDate) === toDateKey(effectiveDate),
  );
  if (duplicate) {
    throw new APIError(409, 'Conflict', {
      message: 'Exchange rate already exists for this pair and date',
    });
  }
  const created = {
    id: `fx_mock_${Date.now()}`,
    baseCurrency,
    targetCurrency,
    rate: Number(body.rate),
    effectiveDate,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  mockDb.exchangeRates.push(created);
  return created;
}

function handleExchangeRatesPatch(path: string, body: any) {
  const match = /^\/exchange-rates\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const idx = mockDb.exchangeRates.findIndex(
    (rate: any) => rate.id === match[1],
  );
  if (idx === -1) {
    throw new APIError(404, 'Not Found', {
      message: 'Exchange rate not found',
    });
  }
  mockDb.exchangeRates[idx] = { ...mockDb.exchangeRates[idx], ...body };
  return mockDb.exchangeRates[idx];
}

function handleExchangeRates(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (method === 'GET') return handleExchangeRatesGet(path, params);
  if (method === 'POST') return handleExchangeRatesPost(path, body);
  if (method === 'PATCH') return handleExchangeRatesPatch(path, body);
}

function snapshotMockFolioCharges(folioId: string) {
  const windowIds = new Set(
    mockDb.folioWindows
      .filter((window: any) => window.folioId === folioId)
      .map((window: any) => window.id),
  );
  let amountNet = 0;
  let amountTax = 0;
  let amountTotal = 0;
  for (const line of mockDb.folioTransactions) {
    if (!windowIds.has(line.windowId) || line.isVoid || line.sign !== 1) {
      continue;
    }
    amountNet += Number(line.amountNet);
    amountTax += Number(line.amountTax);
    amountTotal += Number(line.amountTotal);
  }
  return {
    amountNet: Math.round(amountNet * 100) / 100,
    amountTax: Math.round(amountTax * 100) / 100,
    amountTotal: Math.round(amountTotal * 100) / 100,
  };
}

function nextMockInvoiceNumber(propertyId: string, businessDate: string) {
  const year = String(businessDate).slice(0, 4);
  const prefix = `TI-${year}-`;
  const count = mockDb.taxInvoices.filter(
    (invoice: any) =>
      invoice.propertyId === propertyId &&
      String(invoice.invoiceNumber).startsWith(prefix),
  ).length;
  return `${prefix}${String(count + 1).padStart(6, '0')}`;
}

function handleTaxInvoicesGet(path: string, params: URLSearchParams) {
  if (path === '/tax-invoices') {
    const propertyId = params.get('propertyId');
    const businessDate = params.get('businessDate');
    return mockDb.taxInvoices.filter((invoice: any) => {
      if (propertyId && invoice.propertyId !== propertyId) return false;
      if (
        businessDate &&
        String(invoice.businessDate).slice(0, 10) !== businessDate.slice(0, 10)
      ) {
        return false;
      }
      return true;
    });
  }
  const match = /^\/tax-invoices\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const invoice = mockDb.taxInvoices.find((row: any) => row.id === match[1]);
  if (!invoice) {
    throw new APIError(404, 'Not Found', {
      message: 'Tax invoice not found',
    });
  }
  return invoice;
}

function handleTaxInvoicesPost(path: string, body: any) {
  const voidMatch = /^\/tax-invoices\/([a-zA-Z0-9_-]+)\/void$/.exec(path);
  if (voidMatch) {
    const invoice = mockDb.taxInvoices.find(
      (row: any) => row.id === voidMatch[1],
    );
    if (!invoice) {
      throw new APIError(404, 'Not Found', {
        message: 'Tax invoice not found',
      });
    }
    if (invoice.status === 'VOID') {
      throw new APIError(409, 'Conflict', {
        message: 'Tax invoice is already void',
      });
    }
    invoice.status = 'VOID';
    invoice.voidReason = body.reason;
    invoice.voidedAt = new Date().toISOString();
    invoice.voidedBy = body.voidedBy;
    return invoice;
  }
  if (path !== '/tax-invoices') return;
  const folio = mockDb.folios.find((row: any) => row.id === body.folioId);
  if (!folio) {
    throw new APIError(404, 'Not Found', { message: 'Folio not found' });
  }
  const existing = mockDb.taxInvoices.find(
    (row: any) => row.folioId === body.folioId && row.status !== 'VOID',
  );
  if (existing) {
    throw new APIError(409, 'Conflict', {
      message: 'An active tax invoice already exists for this folio',
    });
  }
  const property = mockDb.properties[0];
  const snapshot = snapshotMockFolioCharges(folio.id);
  const guest = folio.reservation?.guest;
  const created = {
    id: `ti_mock_${Date.now()}`,
    invoiceNumber: nextMockInvoiceNumber(
      property.id,
      property.businessDate || new Date().toISOString(),
    ),
    propertyId: property.id,
    folioId: folio.id,
    reservationId: folio.reservationId,
    businessDate: property.businessDate,
    taxId: body.taxId,
    branchNumber: body.branchNumber || null,
    buyerName:
      body.buyerName || (guest ? `${guest.firstName} ${guest.lastName}` : null),
    ...snapshot,
    status: 'OPEN',
    issuedAt: new Date().toISOString(),
    issuedBy: body.issuedBy,
    voidReason: null,
    voidedAt: null,
    voidedBy: null,
    property: {
      id: property.id,
      name: property.name,
      address: property.address,
      taxId: property.taxId,
    },
    folio: { id: folio.id, folioNumber: folio.folioNumber },
    reservation: folio.reservation
      ? {
          id: folio.reservationId,
          confirmNumber: folio.reservation.confirmNumber || 'CONF',
          guest: folio.reservation.guest,
        }
      : null,
  };
  mockDb.taxInvoices.push(created);
  return created;
}

function handleTaxInvoices(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/tax-invoices')) return;
  if (method === 'GET') return handleTaxInvoicesGet(path, params);
  if (method === 'POST') return handleTaxInvoicesPost(path, body);
}

function nextMockArAccountNumber(propertyId: string) {
  const count = mockDb.arAccounts.filter(
    (account: any) => account.propertyId === propertyId,
  ).length;
  return `AR-${String(count + 1).padStart(6, '0')}`;
}

function nextMockArInvoiceNumber(propertyId: string, date: string) {
  const year = String(date).slice(0, 4);
  const prefix = `AR-${year}-`;
  const count = mockDb.invoices.filter(
    (invoice: any) =>
      invoice.propertyId === propertyId &&
      String(invoice.invoiceNumber).startsWith(prefix),
  ).length;
  return `${prefix}${String(count + 1).padStart(6, '0')}`;
}

function mockOutstanding(invoice: any) {
  return (
    Math.round((Number(invoice.amount) - Number(invoice.paidAmount)) * 100) /
    100
  );
}

function mockAging(accountId: string, asOf: string) {
  const invoices = mockDb.invoices.filter(
    (invoice: any) =>
      invoice.arAccountId === accountId && invoice.status !== 'VOID',
  );
  const totals = { current: 0, days30: 0, days60: 0, days90: 0 };
  for (const invoice of invoices) {
    const open = mockOutstanding(invoice);
    if (open <= 0) continue;
    const due = new Date(
      `${String(invoice.dueDate).slice(0, 10)}T00:00:00.000Z`,
    );
    const asOfDate = new Date(`${asOf.slice(0, 10)}T00:00:00.000Z`);
    const days = Math.floor((asOfDate.getTime() - due.getTime()) / 86400000);
    let bucket: keyof typeof totals = 'current';
    if (days > 60) bucket = 'days90';
    else if (days > 30) bucket = 'days60';
    else if (days > 0) bucket = 'days30';
    totals[bucket] += open;
  }
  const account = mockDb.arAccounts.find((row: any) => row.id === accountId);
  return {
    arAccountId: accountId,
    asOf: asOf.slice(0, 10),
    currentBalance: Number(account?.currentBalance || 0),
    ...totals,
  };
}

function handleArAccountsGet(path: string, params: URLSearchParams) {
  if (path === '/ar-accounts') {
    const propertyId = params.get('propertyId');
    return mockDb.arAccounts.filter(
      (account: any) => !propertyId || account.propertyId === propertyId,
    );
  }
  const agingMatch = /^\/ar-accounts\/([a-zA-Z0-9_-]+)\/aging$/.exec(path);
  if (agingMatch) {
    const asOf = params.get('asOf') || new Date().toISOString();
    return mockAging(agingMatch[1], asOf);
  }
  const statementMatch = /^\/ar-accounts\/([a-zA-Z0-9_-]+)\/statement$/.exec(
    path,
  );
  if (statementMatch) {
    const account = mockDb.arAccounts.find(
      (row: any) => row.id === statementMatch[1],
    );
    if (!account) {
      throw new APIError(404, 'Not Found', { message: 'AR account not found' });
    }
    const asOf = params.get('asOf') || new Date().toISOString();
    const aging = mockAging(account.id, asOf);
    return {
      accountNumber: account.accountNumber,
      companyName: account.companyName,
      asOf: aging.asOf,
      currentBalance: account.currentBalance,
      aging: {
        current: aging.current,
        days30: aging.days30,
        days60: aging.days60,
        days90: aging.days90,
      },
      invoices: mockDb.invoices.filter(
        (invoice: any) =>
          invoice.arAccountId === account.id && invoice.status !== 'VOID',
      ),
    };
  }
  const match = /^\/ar-accounts\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const account = mockDb.arAccounts.find((row: any) => row.id === match[1]);
  if (!account) {
    throw new APIError(404, 'Not Found', { message: 'AR account not found' });
  }
  return account;
}

function handleArAccountsPost(path: string, body: any) {
  if (path === '/ar-accounts') {
    const property =
      mockDb.properties.find((row: any) => row.id === body.propertyId) ||
      mockDb.properties[0];
    const created = {
      id: `ar_mock_${Date.now()}`,
      propertyId: body.propertyId,
      accountNumber:
        body.accountNumber || nextMockArAccountNumber(body.propertyId),
      companyName: body.companyName,
      contactPerson: body.contactPerson || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      creditLimit: body.creditLimit,
      currentBalance: 0,
      paymentTerms: body.paymentTerms ?? 30,
      isActive: body.isActive ?? true,
      property,
    };
    mockDb.arAccounts.push(created);
    return created;
  }
  const transferMatch = /^\/ar-accounts\/([a-zA-Z0-9_-]+)\/transfer$/.exec(
    path,
  );
  if (!transferMatch) return;
  const account = mockDb.arAccounts.find(
    (row: any) => row.id === transferMatch[1],
  );
  if (!account) {
    throw new APIError(404, 'Not Found', { message: 'AR account not found' });
  }
  if (!account.isActive) {
    throw new APIError(409, 'Conflict', { message: 'AR account is inactive' });
  }
  const folio = mockDb.folios.find((row: any) => row.id === body.folioId);
  if (!folio) {
    throw new APIError(404, 'Not Found', { message: 'Folio not found' });
  }
  if (folio.status === 'CLOSED' || folio.status === 'POSTED_TO_CITY_LEDGER') {
    throw new APIError(409, 'Conflict', {
      message: 'Folio cannot be transferred to city ledger',
    });
  }
  const existing = mockDb.invoices.find(
    (row: any) => row.folioId === folio.id && row.status !== 'VOID',
  );
  if (existing) {
    throw new APIError(409, 'Conflict', {
      message: 'An active city ledger invoice already exists for this folio',
    });
  }
  const amount = Number(folio.balance);
  if (amount <= 0) {
    throw new APIError(400, 'Bad Request', {
      message: 'Folio has no balance to transfer',
    });
  }
  requireOpenShiftForCashier(body.userId, account.propertyId);
  const invoiceDate = String(folio.businessDate || new Date().toISOString());
  const due = new Date(`${invoiceDate.slice(0, 10)}T00:00:00.000Z`);
  due.setUTCDate(due.getUTCDate() + Number(account.paymentTerms || 30));
  const invoice = {
    id: `inv_mock_${Date.now()}`,
    invoiceNumber: nextMockArInvoiceNumber(account.propertyId, invoiceDate),
    propertyId: account.propertyId,
    arAccountId: account.id,
    folioId: folio.id,
    invoiceDate,
    dueDate: due.toISOString(),
    amount,
    paidAmount: 0,
    status: 'OPEN',
    arAccount: {
      id: account.id,
      accountNumber: account.accountNumber,
      companyName: account.companyName,
    },
    folio: { id: folio.id, folioNumber: folio.folioNumber },
    payments: [],
  };
  mockDb.invoices.push(invoice);
  account.currentBalance = Number(account.currentBalance) + amount;
  folio.balance = 0;
  folio.status = 'POSTED_TO_CITY_LEDGER';
  folio.isClosed = true;
  const window = mockDb.folioWindows.find(
    (row: any) => row.folioId === folio.id && row.windowNumber === 1,
  );
  if (window) window.balance = 0;
  return invoice;
}

function handleArInvoicesGet(path: string, params: URLSearchParams) {
  if (path === '/ar-invoices') {
    const propertyId = params.get('propertyId');
    const arAccountId = params.get('arAccountId');
    return mockDb.invoices.filter((invoice: any) => {
      if (propertyId && invoice.propertyId !== propertyId) return false;
      if (arAccountId && invoice.arAccountId !== arAccountId) return false;
      return true;
    });
  }
  const match = /^\/ar-invoices\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const invoice = mockDb.invoices.find((row: any) => row.id === match[1]);
  if (!invoice) {
    throw new APIError(404, 'Not Found', { message: 'Invoice not found' });
  }
  return invoice;
}

function handleArInvoicesPost(path: string, body: any) {
  const match = /^\/ar-invoices\/([a-zA-Z0-9_-]+)\/payments$/.exec(path);
  if (!match) return;
  const invoice = mockDb.invoices.find((row: any) => row.id === match[1]);
  if (!invoice) {
    throw new APIError(404, 'Not Found', { message: 'Invoice not found' });
  }
  if (invoice.status === 'PAID' || invoice.status === 'VOID') {
    throw new APIError(409, 'Conflict', {
      message: 'Invoice cannot accept a payment',
    });
  }
  const open = mockOutstanding(invoice);
  if (Number(body.amount) - open > 0.001) {
    throw new APIError(400, 'Bad Request', {
      message: 'Payment exceeds the invoice outstanding balance',
    });
  }
  invoice.paidAmount = Number(invoice.paidAmount) + Number(body.amount);
  invoice.status = mockOutstanding(invoice) <= 0 ? 'PAID' : 'PARTIAL';
  const account = mockDb.arAccounts.find(
    (row: any) => row.id === invoice.arAccountId,
  );
  if (account) {
    account.currentBalance =
      Number(account.currentBalance) - Number(body.amount);
  }
  mockDb.invoicePayments.push({
    id: `pay_mock_${Date.now()}`,
    invoiceId: invoice.id,
    ...body,
  });
  return invoice;
}

function handleArAccounts(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (path.startsWith('/ar-accounts')) {
    if (method === 'GET') return handleArAccountsGet(path, params);
    if (method === 'POST') return handleArAccountsPost(path, body);
    return;
  }
  if (path.startsWith('/ar-invoices')) {
    if (method === 'GET') return handleArInvoicesGet(path, params);
    if (method === 'POST') return handleArInvoicesPost(path, body);
  }
}

function handleCardPreauthsGet(path: string, params: URLSearchParams) {
  if (path === '/card-preauths') {
    const reservationId = params.get('reservationId');
    return mockDb.cardPreauths.filter(
      (row: any) => !reservationId || row.reservationId === reservationId,
    );
  }
  const match = /^\/card-preauths\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  return mockDb.cardPreauths.find((row: any) => row.id === match[1]);
}

function handleCardPreauthsPost(path: string, body: any) {
  const captureMatch = /^\/card-preauths\/([a-zA-Z0-9_-]+)\/capture$/.exec(
    path,
  );
  if (captureMatch) {
    const hold = mockDb.cardPreauths.find(
      (row: any) => row.id === captureMatch[1],
    );
    if (!hold) {
      throw new APIError(404, 'Not Found', { message: 'Pre-auth not found' });
    }
    if (hold.status !== 'HELD' && hold.status !== 'INCREMENTAL') {
      throw new APIError(409, 'Conflict', {
        message: 'Pre-authorization cannot be captured',
      });
    }
    const folio = mockDb.folios.find((row: any) => row.id === body.folioId);
    if (!folio) {
      throw new APIError(404, 'Not Found', { message: 'Folio not found' });
    }
    requireOpenShiftForCashier(body.userId, mockDb.properties[0]?.id);
    const amount = Number(body.amount ?? hold.amount);
    folio.balance = Number(folio.balance) - amount;
    hold.status = 'CAPTURED';
    hold.capturedAmount = amount;
    hold.folioId = folio.id;
    return hold;
  }
  const releaseMatch = /^\/card-preauths\/([a-zA-Z0-9_-]+)\/release$/.exec(
    path,
  );
  if (releaseMatch) {
    const hold = mockDb.cardPreauths.find(
      (row: any) => row.id === releaseMatch[1],
    );
    if (!hold) {
      throw new APIError(404, 'Not Found', { message: 'Pre-auth not found' });
    }
    if (hold.status !== 'HELD' && hold.status !== 'INCREMENTAL') {
      throw new APIError(409, 'Conflict', {
        message: 'Pre-authorization cannot be released',
      });
    }
    hold.status = 'RELEASED';
    return hold;
  }
  if (path !== '/card-preauths') return;
  const reservation = mockDb.reservations.find(
    (row: any) => row.id === body.reservationId,
  );
  if (!reservation) {
    throw new APIError(404, 'Not Found', { message: 'Reservation not found' });
  }
  const created = {
    id: `pa_mock_${Date.now()}`,
    reservationId: body.reservationId,
    amount: body.amount,
    status: 'HELD',
    last4: body.last4,
    expiryMonth: body.expiryMonth,
    expiryYear: body.expiryYear,
    manualRef: body.manualRef,
    capturedAmount: null,
    folioId: null,
    createdBy: body.createdBy,
  };
  mockDb.cardPreauths.push(created);
  return created;
}

function handleCardPreauthsPatch(path: string, body: any) {
  const match = /^\/card-preauths\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const hold = mockDb.cardPreauths.find((row: any) => row.id === match[1]);
  if (!hold) {
    throw new APIError(404, 'Not Found', { message: 'Pre-auth not found' });
  }
  if (hold.status !== 'HELD' && hold.status !== 'INCREMENTAL') {
    throw new APIError(409, 'Conflict', {
      message: 'Pre-authorization cannot be incremented',
    });
  }
  if (Number(body.amount) <= Number(hold.amount)) {
    throw new APIError(400, 'Bad Request', {
      message: 'Incremental amount must be greater than the current hold',
    });
  }
  hold.amount = body.amount;
  hold.status = 'INCREMENTAL';
  return hold;
}

function handleCardPreauths(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/card-preauths')) return;
  if (method === 'GET') return handleCardPreauthsGet(path, params);
  if (method === 'POST') return handleCardPreauthsPost(path, body);
  if (method === 'PATCH') return handleCardPreauthsPatch(path, body);
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

  const { net, reference } = applyCashFxConversion(tc, body, folioId);
  const srv = tc.hasService ? net * ((tc.serviceRate as number) / 100) : 0;
  const tax = tc.hasTax ? (net + srv) * ((tc.taxRate as number) / 100) : 0;
  const sign = tc.type === 'CHARGE' ? 1 : -1;
  const total = (net + srv + tax) * sign;

  const folioForAr = mockDb.folios.find((row: any) => row.id === folioId);
  if (sign > 0 && folioForAr?.arAccountId) {
    const account = mockDb.arAccounts.find(
      (row: any) => row.id === folioForAr.arAccountId,
    );
    if (account) {
      const remaining =
        Number(account.creditLimit) - Number(account.currentBalance);
      const projected = Number(folioForAr.balance) + total;
      if (projected > remaining) {
        throw new APIError(409, 'Conflict', {
          message: 'Folio balance exceeds the company AR credit limit',
        });
      }
    }
  }

  const newTrx = {
    id: `ft_mock_${Date.now()}`,
    windowId,
    trxCodeId: tc.id,
    amountNet: net,
    amountService: srv,
    amountTax: tax,
    amountTotal: total,
    sign,
    reference,
    userId: postUserId,
    shiftId: postShift?.id ?? null,
    createdAt: new Date().toISOString(),
    isVoid: false,
  };

  mockDb.folioTransactions.push(newTrx);
  handleFolioPostWindowBalance(windowId, folioId, total);

  const folio = mockDb.folios.find((row: any) => row.id === folioId);
  const property = mockDb.properties[0];
  const limit = folio?.creditLimit ?? property?.defaultCreditLimit ?? null;
  const exceeded =
    limit !== null && folio && Number(folio.balance) > Number(limit);
  return { id: newTrx.id, creditLimitExceeded: exceeded || undefined };
}

function handleFolioCheckout(path: string, body: any) {
  const match = /^\/folios\/([a-zA-Z0-9_-]+)\/checkout$/.exec(path);
  if (!match) return;
  const folio = mockDb.folios.find((row: any) => row.id === match[1]);
  if (!folio) {
    throw new APIError(404, 'Not Found', { message: 'Folio not found' });
  }
  const property = mockDb.properties[0];
  const limit = folio.creditLimit ?? property?.defaultCreditLimit ?? null;
  if (limit !== null && Number(folio.balance) > Number(limit)) {
    throw new APIError(409, 'Conflict', {
      message: 'Folio balance exceeds credit limit',
    });
  }
  if (folio.status === 'CLOSED' || folio.isClosed) {
    throw new APIError(409, 'Conflict', { message: 'Folio is already closed' });
  }
  folio.status = 'CLOSED';
  folio.isClosed = true;
  folio.closedAt = new Date().toISOString();
  folio.closedBy = body?.userId;
  return folio;
}

function handleFolioCreditLimit(path: string, body: any) {
  const match = /^\/folios\/([a-zA-Z0-9_-]+)\/credit-limit$/.exec(path);
  if (!match) return;
  const folio = mockDb.folios.find((row: any) => row.id === match[1]);
  if (!folio) {
    throw new APIError(404, 'Not Found', { message: 'Folio not found' });
  }
  folio.creditLimit = body.creditLimit ?? null;
  return folio;
}

function handleFolioArAccount(path: string, body: any) {
  const match = /^\/folios\/([a-zA-Z0-9_-]+)\/ar-account$/.exec(path);
  if (!match) return;
  const folio = mockDb.folios.find((row: any) => row.id === match[1]);
  if (!folio) {
    throw new APIError(404, 'Not Found', { message: 'Folio not found' });
  }
  folio.arAccountId = body.arAccountId ?? null;
  return folio;
}

function handleFolios(method: string, path: string, body: any) {
  if (method === 'GET') return handleFolioGet(path);
  if (method === 'PATCH') {
    return (
      handleFolioCreditLimit(path, body) ?? handleFolioArAccount(path, body)
    );
  }
  if (method === 'POST') {
    const checkout = handleFolioCheckout(path, body);
    if (checkout !== undefined) return checkout;
    return handleFolioPost(path, body);
  }
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
      () => handleFinancial(method, path, params, body),
      () => handleNightAudit(method, path, body),
      () => handleShifts(method, path, body, params),
      () => handleExchangeRates(method, path, body, params),
      () => handleTaxInvoices(method, path, body, params),
      () => handleArAccounts(method, path, body, params),
      () => handleCardPreauths(method, path, body, params),
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
