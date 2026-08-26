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

function handleFolioGet(path: string, params?: URLSearchParams) {
  if (path === '/folios/transactions/codes') {
    return mockDb.transactionCodes;
  }

  if (path === '/folios') {
    const status = params?.get('status');
    const propertyId = params?.get('propertyId');
    return mockDb.folios
      .filter((folio: any) => !status || folio.status === status)
      .filter((folio: any) => {
        if (!propertyId) return true;
        const reservation = mockDb.reservations.find(
          (row: any) => row.id === folio.reservationId,
        );
        return reservation?.propertyId === propertyId;
      })
      .slice(0, 100)
      .map((folio: any) => ({
        id: folio.id,
        folioNumber: folio.folioNumber,
        status: folio.status,
        balance: folio.balance,
        reservationId: folio.reservationId,
        reservation: folio.reservation,
      }));
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

function handlePartnerHotelsGet(path: string, params: URLSearchParams) {
  if (path === '/partner-hotels') {
    const propertyId = params.get('propertyId');
    return mockDb.partnerHotels.filter(
      (row: any) => !propertyId || row.propertyId === propertyId,
    );
  }
  const match = /^\/partner-hotels\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const hotel = mockDb.partnerHotels.find((row: any) => row.id === match[1]);
  if (!hotel) {
    throw new APIError(404, 'Not Found', {
      message: 'Partner hotel not found',
    });
  }
  return hotel;
}

function handlePartnerHotelsPost(path: string, body: any) {
  if (path !== '/partner-hotels') return;
  const existing = mockDb.partnerHotels.find(
    (row: any) => row.propertyId === body.propertyId && row.name === body.name,
  );
  if (existing) {
    throw new APIError(400, 'Bad Request', {
      message: `Partner hotel with name ${body.name} already exists for this property`,
    });
  }
  const hotel = {
    id: `ph_mock_${Date.now()}`,
    propertyId: body.propertyId,
    name: body.name,
    address: body.address,
    phone: body.phone,
    contactPerson: body.contactPerson,
    isActive: body.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockDb.partnerHotels.push(hotel);
  return hotel;
}

function handlePartnerHotelsPatch(path: string, body: any) {
  const match = /^\/partner-hotels\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const hotel = mockDb.partnerHotels.find((row: any) => row.id === match[1]);
  if (!hotel) {
    throw new APIError(404, 'Not Found', {
      message: 'Partner hotel not found',
    });
  }
  Object.assign(hotel, body, { updatedAt: new Date().toISOString() });
  return hotel;
}

function handlePartnerHotels(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/partner-hotels')) return;
  if (method === 'GET') return handlePartnerHotelsGet(path, params);
  if (method === 'POST') return handlePartnerHotelsPost(path, body);
  if (method === 'PATCH') return handlePartnerHotelsPatch(path, body);
}

function mockDerivedAmount(parentAmount: number, mode: string, value: number) {
  const next =
    mode === 'PERCENT_OFFSET'
      ? parentAmount * (1 + value / 100)
      : parentAmount + value;
  return Math.round((next + Number.EPSILON) * 100) / 100;
}

function cascadeMockRates(parentId: string, parentAmount: number) {
  const children = mockDb.rates.filter(
    (row: any) => row.parentRateId === parentId,
  );
  for (const child of children) {
    child.amount = mockDerivedAmount(
      parentAmount,
      child.deriveMode,
      Number(child.deriveValue),
    );
    cascadeMockRates(child.id, child.amount);
  }
}

function handleRatesGet(path: string, params: URLSearchParams) {
  if (path === '/rates') {
    const propertyId = params.get('propertyId');
    const roomTypeId = params.get('roomTypeId');
    return mockDb.rates.filter(
      (row: any) =>
        (!propertyId || row.propertyId === propertyId) &&
        (!roomTypeId || row.roomTypeId === roomTypeId),
    );
  }
  const match = /^\/rates\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const rate = mockDb.rates.find((row: any) => row.id === match[1]);
  if (!rate) {
    throw new APIError(404, 'Not Found', { message: 'Rate not found' });
  }
  return rate;
}

function handleRatesPost(path: string, body: any) {
  if (path !== '/rates') return;
  const parent = body.parentRateId
    ? mockDb.rates.find((row: any) => row.id === body.parentRateId)
    : null;
  if (body.parentRateId && !parent) {
    throw new APIError(404, 'Not Found', { message: 'Parent rate not found' });
  }
  const amount = parent
    ? mockDerivedAmount(
        Number(parent.amount),
        body.deriveMode,
        Number(body.deriveValue),
      )
    : Number(body.amount);
  const rate = {
    id: `rate_mock_${Date.now()}`,
    code: body.code,
    name: body.name,
    roomTypeId: body.roomTypeId,
    propertyId: body.propertyId,
    amount,
    startDate: body.startDate,
    endDate: body.endDate,
    daysOfWeek: body.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    isActive: body.isActive ?? true,
    parentRateId: body.parentRateId || null,
    deriveMode: body.deriveMode || null,
    deriveValue: body.deriveValue ?? null,
    parentRate: parent
      ? {
          id: parent.id,
          code: parent.code,
          name: parent.name,
          amount: parent.amount,
        }
      : null,
  };
  mockDb.rates.push(rate);
  return rate;
}

function handleRatesPatch(path: string, body: any) {
  const match = /^\/rates\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const rate = mockDb.rates.find((row: any) => row.id === match[1]);
  if (!rate) {
    throw new APIError(404, 'Not Found', { message: 'Rate not found' });
  }
  if (rate.parentRateId && body.amount !== undefined) {
    throw new APIError(400, 'Bad Request', {
      message: 'Amount of a derived rate is calculated from its parent',
    });
  }
  Object.assign(rate, body);
  if (body.amount !== undefined) {
    cascadeMockRates(rate.id, Number(rate.amount));
  }
  return rate;
}

function handleYield(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (path !== '/yield' && !path.startsWith('/yield/')) return;

  if (method === 'GET' && path === '/yield/pace') {
    const rooms = mockDb.rooms.filter(
      (row: any) => row.status !== 'OUT_OF_ORDER',
    );
    const occupied = mockDb.reservations.filter(
      (row: any) => row.status === 'CHECKED_IN' || row.status === 'CONFIRMED',
    ).length;
    const occupancyPct =
      rooms.length > 0
        ? Math.round((occupied / rooms.length) * 10000) / 100
        : 0;
    const stayDate = new Date().toISOString().slice(0, 10);
    return {
      from: stayDate,
      to: stayDate,
      days: [
        {
          stayDate,
          lastYearDate: stayDate,
          capacity: rooms.length,
          occupied,
          occupancyPct,
          lastYearOccupied: occupied,
          lastYearOccupancyPct: occupancyPct,
          paceDeltaPct: 0,
          alert: false,
        },
      ],
    };
  }

  if (method === 'GET' && path === '/yield/recommendations') {
    const status = params.get('status');
    return mockDb.yieldRecommendations.filter(
      (row: any) => !status || row.status === status,
    );
  }

  if (method === 'POST' && path === '/yield/recommendations/generate') {
    const rate = mockDb.rates.find((row: any) => !row.parentRateId);
    if (!rate) return [];
    const rec = {
      id: `yield_rec_${Date.now()}`,
      propertyId: body.propertyId || rate.propertyId,
      roomTypeId: rate.roomTypeId,
      rateId: rate.id,
      stayDate: new Date().toISOString().slice(0, 10),
      currentAmount: Number(rate.amount),
      recommendedAmount: Math.round(Number(rate.amount) * 1.1 * 100) / 100,
      occupancyPct: 90,
      paceDeltaPct: 5,
      competitorAmount: null,
      reason: 'HIGH_DEMAND',
      status: 'PENDING',
      rate: { id: rate.id, code: rate.code, name: rate.name },
    };
    mockDb.yieldRecommendations.push(rec);
    return [rec];
  }

  const applyMatch = /^\/yield\/recommendations\/([a-zA-Z0-9_-]+)\/apply$/.exec(
    path,
  );
  if (method === 'POST' && applyMatch) {
    const rec = mockDb.yieldRecommendations.find(
      (row: any) => row.id === applyMatch[1],
    );
    if (!rec) {
      throw new APIError(404, 'Not Found', {
        message: 'Recommendation not found',
      });
    }
    rec.status = 'APPLIED';
    const rate = mockDb.rates.find((row: any) => row.id === rec.rateId);
    if (rate) {
      rate.amount = rec.recommendedAmount;
    }
    return rec;
  }

  const dismissMatch =
    /^\/yield\/recommendations\/([a-zA-Z0-9_-]+)\/dismiss$/.exec(path);
  if (method === 'POST' && dismissMatch) {
    const rec = mockDb.yieldRecommendations.find(
      (row: any) => row.id === dismissMatch[1],
    );
    if (!rec) {
      throw new APIError(404, 'Not Found', {
        message: 'Recommendation not found',
      });
    }
    rec.status = 'DISMISSED';
    return rec;
  }

  if (method === 'GET' && path === '/yield/competitors') {
    return mockDb.competitorRates;
  }

  if (method === 'POST' && path === '/yield/competitors') {
    const row = {
      id: `comp_mock_${Date.now()}`,
      propertyId: body.propertyId,
      competitorName: body.competitorName,
      roomTypeId: body.roomTypeId || null,
      stayDate: body.stayDate,
      amount: Number(body.amount),
      notes: body.notes || null,
    };
    mockDb.competitorRates.push(row);
    return row;
  }

  const patchMatch = /^\/yield\/competitors\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (method === 'PATCH' && patchMatch) {
    const row = mockDb.competitorRates.find(
      (item: any) => item.id === patchMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'Competitor rate not found',
      });
    }
    Object.assign(row, body);
    return row;
  }
}

function handleRates(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (path !== '/rates' && !path.startsWith('/rates/')) return;
  if (method === 'GET') return handleRatesGet(path, params);
  if (method === 'POST') return handleRatesPost(path, body);
  if (method === 'PATCH') return handleRatesPatch(path, body);
}

function mockBlockPickup(block: any) {
  const pickedUp = mockDb.reservations.filter(
    (row: any) =>
      row.blockId === block.id &&
      row.status !== 'CANCELLED' &&
      row.status !== 'NO_SHOW',
  ).length;
  const remaining = Math.max(
    0,
    Number(block.allottedRooms) - Number(block.releasedRooms || 0) - pickedUp,
  );
  return {
    blockId: block.id,
    allottedRooms: block.allottedRooms,
    releasedRooms: block.releasedRooms || 0,
    pickedUp,
    remaining,
    nights: [
      {
        stayDate: String(block.startDate).slice(0, 10),
        allotted: block.allottedRooms,
        pickedUp,
        remaining,
      },
    ],
  };
}

function handleBlocks(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (path !== '/blocks' && !path.startsWith('/blocks/')) return;

  if (method === 'GET' && path === '/blocks') {
    const propertyId = params.get('propertyId');
    return mockDb.roomBlocks.filter(
      (row: any) => !propertyId || row.propertyId === propertyId,
    );
  }

  if (method === 'POST' && path === '/blocks') {
    const row = {
      id: `block_mock_${Date.now()}`,
      releasedRooms: 0,
      status: 'OPEN',
      inventoryMode:
        body.kind === 'GROUP' ? 'DEDICATED' : body.inventoryMode || 'GENERAL',
      _count: { reservations: 0 },
      ...body,
    };
    mockDb.roomBlocks.push(row);
    return row;
  }

  const pickupMatch = /^\/blocks\/([a-zA-Z0-9_-]+)\/pickup$/.exec(path);
  if (method === 'GET' && pickupMatch) {
    const block = mockDb.roomBlocks.find(
      (row: any) => row.id === pickupMatch[1],
    );
    if (!block) {
      throw new APIError(404, 'Not Found', { message: 'Block not found' });
    }
    return mockBlockPickup(block);
  }

  const releaseMatch = /^\/blocks\/([a-zA-Z0-9_-]+)\/release$/.exec(path);
  if (method === 'POST' && releaseMatch) {
    const block = mockDb.roomBlocks.find(
      (row: any) => row.id === releaseMatch[1],
    );
    if (!block) {
      throw new APIError(404, 'Not Found', { message: 'Block not found' });
    }
    const report = mockBlockPickup(block);
    block.releasedRooms = (block.releasedRooms || 0) + report.remaining;
    block.status = 'RELEASED';
    return block;
  }

  const attachMatch = /^\/blocks\/([a-zA-Z0-9_-]+)\/reservations$/.exec(path);
  if (method === 'POST' && attachMatch) {
    const block = mockDb.roomBlocks.find(
      (row: any) => row.id === attachMatch[1],
    );
    if (!block) {
      throw new APIError(404, 'Not Found', { message: 'Block not found' });
    }
    const reservation = mockDb.reservations.find(
      (row: any) => row.id === body.reservationId,
    );
    if (reservation) {
      reservation.blockId = block.id;
    }
    return mockBlockPickup(block);
  }
}

const HK_CHECKLIST_ITEMS = [
  { code: 'BED', required: true },
  { code: 'BATH', required: true },
  { code: 'LINEN', required: true },
  { code: 'AMENITIES', required: true },
  { code: 'MINIBAR', required: false },
];

function handleHousekeeping(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (path !== '/housekeeping/board' && !path.startsWith('/housekeeping/')) {
    return;
  }

  if (method === 'GET' && path === '/housekeeping/board') {
    const propertyId = params.get('propertyId');
    return mockDb.rooms.filter(
      (row: any) => !propertyId || row.propertyId === propertyId,
    );
  }

  if (method === 'GET' && path === '/housekeeping/checklist') {
    return HK_CHECKLIST_ITEMS;
  }

  const cleanMatch = /^\/housekeeping\/rooms\/([a-zA-Z0-9_-]+)\/clean$/.exec(
    path,
  );
  if (method === 'POST' && cleanMatch) {
    const room = mockDb.rooms.find((row: any) => row.id === cleanMatch[1]);
    if (!room) {
      throw new APIError(404, 'Not Found', { message: 'Room not found' });
    }
    if (room.guestRequest === 'DND') {
      throw new APIError(400, 'Bad Request', {
        message: 'Clear Do Not Disturb before marking the room clean',
      });
    }
    room.hkStage = 'CLEAN';
    if (room.status === 'VACANT_DIRTY') room.status = 'VACANT_CLEAN';
    if (room.status === 'OCCUPIED_DIRTY') room.status = 'OCCUPIED_CLEAN';
    return room;
  }

  const guestRequestMatch =
    /^\/housekeeping\/rooms\/([a-zA-Z0-9_-]+)\/guest-request$/.exec(path);
  if (method === 'POST' && guestRequestMatch) {
    const room = mockDb.rooms.find(
      (row: any) => row.id === guestRequestMatch[1],
    );
    if (!room) {
      throw new APIError(404, 'Not Found', { message: 'Room not found' });
    }
    if (!['NONE', 'DND', 'MUR'].includes(body.request)) {
      throw new APIError(400, 'Bad Request', {
        message: 'request must be NONE, DND, or MUR',
      });
    }
    room.guestRequest = body.request;
    room.guestRequestNote =
      body.request === 'NONE'
        ? null
        : body.note || room.guestRequestNote || null;
    room.guestRequestUpdatedAt = new Date().toISOString();
    room.guestRequestUpdatedBy = body.updatedBy;
    return room;
  }

  const inspectMatch =
    /^\/housekeeping\/rooms\/([a-zA-Z0-9_-]+)\/inspections$/.exec(path);
  if (method === 'POST' && inspectMatch) {
    const room = mockDb.rooms.find((row: any) => row.id === inspectMatch[1]);
    if (!room) {
      throw new APIError(404, 'Not Found', { message: 'Room not found' });
    }
    const requiredFailed = (body.lines || []).some(
      (line: any) =>
        ['BED', 'BATH', 'LINEN', 'AMENITIES'].includes(line.itemCode) &&
        !line.passed,
    );
    const row = {
      id: `insp_mock_${Date.now()}`,
      roomId: room.id,
      result: requiredFailed ? 'FAILED' : 'PASSED',
      lines: body.lines || [],
    };
    mockDb.housekeepingInspections.push(row);
    if (requiredFailed) {
      room.hkStage = 'DIRTY';
      if (room.status === 'VACANT_CLEAN') room.status = 'VACANT_DIRTY';
      if (room.status === 'OCCUPIED_CLEAN') room.status = 'OCCUPIED_DIRTY';
    } else {
      room.hkStage = 'READY';
    }
    return row;
  }

  if (method === 'GET' && inspectMatch) {
    return mockDb.housekeepingInspections.filter(
      (row: any) => row.roomId === inspectMatch[1],
    );
  }
}

const HB_CATALOG = {
  jobTypes: ['PRINT', 'KEYCARD_ENCODE', 'PASSPORT_SCAN', 'ID_CARD_READ'],
  deviceTypes: [
    'PRINTER',
    'KEY_CARD_ENCODER',
    'PASSPORT_SCANNER',
    'SMART_CARD_READER',
  ],
  vendors: ['GENERIC', 'VINGCARD', 'SALTO', 'HAFELE'],
};

function simulatedHardwareResult(job: any) {
  if (job.type === 'PRINT') return { printed: true };
  if (job.type === 'KEYCARD_ENCODE') {
    return { encoded: true, roomNumber: job.payload?.roomNumber ?? '101' };
  }
  if (job.type === 'PASSPORT_SCAN') {
    return {
      firstName: 'SOMCHAI',
      lastName: 'JAADEE',
      nationality: 'THA',
      idType: 'PASSPORT',
      idNumber: 'AA1234567',
    };
  }
  return { citizenId: '1234567890123', firstName: 'Somchai', lastName: 'Suk' };
}

function buildMockRegCardSnapshots(reservation: any) {
  const property = mockDb.properties.find(
    (row: any) => row.id === reservation.propertyId,
  );
  const room = mockDb.rooms.find((row: any) => row.id === reservation.roomId);
  const guest = mockDb.guests.find(
    (row: any) => row.id === reservation.guestId,
  );
  const roomType = mockDb.roomTypes.find(
    (row: any) => row.id === room?.roomTypeId,
  );
  return {
    guestSnapshot: {
      firstName: guest?.firstName || 'Guest',
      lastName: guest?.lastName || 'Name',
      email: guest?.email || null,
      phone: guest?.phone || null,
      idType: guest?.idType || null,
      idNumber: guest?.idNumber || null,
      nationality: guest?.nationality || null,
      dateOfBirth: guest?.dateOfBirth || null,
      address: guest?.address || null,
    },
    staySnapshot: {
      confirmNumber: reservation.confirmNumber,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights || 1,
      adults: reservation.adults || 1,
      children: reservation.children || 0,
      roomNumber: room?.number || '—',
      roomTypeName: roomType?.name || null,
      rateCode: reservation.rateCode || null,
      roomRate: Number(reservation.roomRate || 0),
    },
    propertySnapshot: {
      name: property?.name || 'Pura',
      address: property?.address || null,
      phone: property?.phone || null,
      taxId: property?.taxId || null,
    },
  };
}

function handleRegistrationCardsGet(path: string, params: URLSearchParams) {
  if (path === '/registration-cards') {
    const reservationId = params.get('reservationId');
    return mockDb.registrationCards
      .filter(
        (row: any) => !reservationId || row.reservationId === reservationId,
      )
      .sort((a: any, b: any) => b.version - a.version);
  }
  const match = /^\/registration-cards\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (!match) return;
  const card = mockDb.registrationCards.find((row: any) => row.id === match[1]);
  if (!card) {
    throw new APIError(404, 'Not Found', {
      message: 'Registration card not found',
    });
  }
  return card;
}

function handleRegistrationCardsPost(path: string, body: any) {
  const signMatch = /^\/registration-cards\/([a-zA-Z0-9_-]+)\/sign$/.exec(path);
  if (signMatch) {
    const card = mockDb.registrationCards.find(
      (row: any) => row.id === signMatch[1],
    );
    if (!card) {
      throw new APIError(404, 'Not Found', {
        message: 'Registration card not found',
      });
    }
    if (card.status !== 'DRAFT') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only draft registration cards can be signed',
      });
    }
    card.status = 'SIGNED';
    card.signatureData = body.signatureData;
    card.signedAt = new Date().toISOString();
    card.signedByGuestName = body.signedByGuestName;
    return card;
  }

  const voidMatch = /^\/registration-cards\/([a-zA-Z0-9_-]+)\/void$/.exec(path);
  if (voidMatch) {
    const card = mockDb.registrationCards.find(
      (row: any) => row.id === voidMatch[1],
    );
    if (!card) {
      throw new APIError(404, 'Not Found', {
        message: 'Registration card not found',
      });
    }
    if (card.status !== 'SIGNED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only signed registration cards can be voided',
      });
    }
    card.status = 'VOID';
    card.voidReason = body.reason;
    card.voidedAt = new Date().toISOString();
    card.voidedBy = body.voidedBy;
    return card;
  }

  const printMatch = /^\/registration-cards\/([a-zA-Z0-9_-]+)\/print-job$/.exec(
    path,
  );
  if (printMatch) {
    const card = mockDb.registrationCards.find(
      (row: any) => row.id === printMatch[1],
    );
    if (!card) {
      throw new APIError(404, 'Not Found', {
        message: 'Registration card not found',
      });
    }
    if (card.status !== 'SIGNED') {
      throw new APIError(409, 'Conflict', {
        message: 'Only signed registration cards can be printed',
      });
    }
    const job = {
      id: `hb_job_${Date.now()}`,
      propertyId: card.propertyId,
      type: 'PRINT',
      status: 'PENDING',
      requestedBy: body.requestedBy,
      reservationId: card.reservationId,
      payload: {
        jobType: 'REG_CARD',
        registrationCardId: card.id,
      },
      createdAt: new Date().toISOString(),
    };
    mockDb.hardwareJobs.push(job);
    return job;
  }

  if (path !== '/registration-cards') return;

  const reservation = mockDb.reservations.find(
    (row: any) => row.id === body.reservationId,
  );
  if (!reservation) {
    throw new APIError(404, 'Not Found', { message: 'Reservation not found' });
  }

  const existingDraft = mockDb.registrationCards.find(
    (row: any) =>
      row.reservationId === body.reservationId && row.status === 'DRAFT',
  );
  if (existingDraft) return existingDraft;

  const latest = mockDb.registrationCards
    .filter((row: any) => row.reservationId === body.reservationId)
    .sort((a: any, b: any) => b.version - a.version)[0];
  const snapshots = buildMockRegCardSnapshots(reservation);
  const created = {
    id: `rc_mock_${Date.now()}`,
    propertyId: reservation.propertyId,
    reservationId: body.reservationId,
    version: (latest?.version || 0) + 1,
    status: 'DRAFT',
    ...snapshots,
    signatureData: null,
    signedAt: null,
    signedByGuestName: null,
    voidReason: null,
    voidedAt: null,
    voidedBy: null,
    createdBy: body.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reservation: {
      id: reservation.id,
      confirmNumber: reservation.confirmNumber,
      status: reservation.status,
    },
    property: {
      id: reservation.propertyId,
      name: snapshots.propertySnapshot.name,
    },
  };
  mockDb.registrationCards.push(created);
  return created;
}

function handleRegistrationCards(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/registration-cards')) return;
  if (method === 'GET') return handleRegistrationCardsGet(path, params);
  if (method === 'POST') return handleRegistrationCardsPost(path, body);
}

function handleWakeUpCallsGet(path: string, params: URLSearchParams) {
  if (path !== '/wake-up-calls') return;
  const reservationId = params.get('reservationId');
  const propertyId = params.get('propertyId');
  const scheduledDate = params.get('scheduledDate');
  if (!reservationId && !propertyId) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId or reservationId is required',
    });
  }
  return mockDb.wakeUpCalls
    .filter((row: any) => {
      if (reservationId) return row.reservationId === reservationId;
      if (row.propertyId !== propertyId) return false;
      if (scheduledDate && row.scheduledDate !== scheduledDate) return false;
      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
}

function handleWakeUpCallsPost(path: string, body: any) {
  const completeMatch = /^\/wake-up-calls\/([a-zA-Z0-9_-]+)\/complete$/.exec(
    path,
  );
  if (completeMatch) {
    const row = mockDb.wakeUpCalls.find(
      (item: any) => item.id === completeMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'Wake-up call not found',
      });
    }
    if (row.status !== 'SCHEDULED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only scheduled wake-up calls can be updated',
      });
    }
    row.status = 'COMPLETED';
    row.completedAt = new Date().toISOString();
    row.completedBy = body.completedBy;
    row.updatedAt = new Date().toISOString();
    return row;
  }

  const missMatch = /^\/wake-up-calls\/([a-zA-Z0-9_-]+)\/miss$/.exec(path);
  if (missMatch) {
    const row = mockDb.wakeUpCalls.find(
      (item: any) => item.id === missMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'Wake-up call not found',
      });
    }
    if (row.status !== 'SCHEDULED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only scheduled wake-up calls can be updated',
      });
    }
    row.status = 'MISSED';
    row.missedAt = new Date().toISOString();
    row.missedBy = body.missedBy;
    row.updatedAt = new Date().toISOString();
    return row;
  }

  const cancelMatch = /^\/wake-up-calls\/([a-zA-Z0-9_-]+)\/cancel$/.exec(path);
  if (cancelMatch) {
    const row = mockDb.wakeUpCalls.find(
      (item: any) => item.id === cancelMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'Wake-up call not found',
      });
    }
    if (row.status !== 'SCHEDULED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only scheduled wake-up calls can be updated',
      });
    }
    row.status = 'CANCELLED';
    row.cancelledAt = new Date().toISOString();
    row.cancelledBy = body.cancelledBy;
    row.cancelReason = body.cancelReason || null;
    row.updatedAt = new Date().toISOString();
    return row;
  }

  if (path !== '/wake-up-calls') return;

  const reservation = mockDb.reservations.find(
    (row: any) => row.id === body.reservationId,
  );
  if (!reservation) {
    throw new APIError(404, 'Not Found', { message: 'Reservation not found' });
  }
  if (!['CONFIRMED', 'CHECKED_IN'].includes(reservation.status)) {
    throw new APIError(400, 'Bad Request', {
      message:
        'Wake-up calls can only be scheduled for confirmed or checked-in reservations',
    });
  }
  if (!reservation.roomId || !reservation.room) {
    throw new APIError(400, 'Bad Request', {
      message:
        'Reservation must have a room assigned to schedule a wake-up call',
    });
  }

  const scheduledAt = new Date(body.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new APIError(400, 'Bad Request', {
      message: 'scheduledAt must be a valid date',
    });
  }
  const scheduledDate = scheduledAt.toISOString().slice(0, 10);
  const created = {
    id: `wu_mock_${Date.now()}`,
    propertyId: reservation.propertyId,
    reservationId: reservation.id,
    roomId: reservation.roomId,
    scheduledAt: scheduledAt.toISOString(),
    scheduledDate,
    status: 'SCHEDULED',
    notes: body.notes?.trim() || null,
    scheduledBy: body.scheduledBy,
    completedAt: null,
    completedBy: null,
    missedAt: null,
    missedBy: null,
    cancelledAt: null,
    cancelledBy: null,
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reservation: {
      id: reservation.id,
      confirmNumber: reservation.confirmNumber,
      status: reservation.status,
      guest: reservation.guest
        ? {
            firstName: reservation.guest.firstName,
            lastName: reservation.guest.lastName,
          }
        : undefined,
    },
    room: {
      id: reservation.room.id,
      number: reservation.room.number,
    },
    property: {
      id: reservation.propertyId,
      name:
        mockDb.properties.find((p: any) => p.id === reservation.propertyId)
          ?.name || 'Pura',
    },
  };
  mockDb.wakeUpCalls.push(created);
  return created;
}

function handleWakeUpCalls(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/wake-up-calls')) return;
  if (method === 'GET') {
    if (path === '/wake-up-calls') {
      return handleWakeUpCallsGet(path, params);
    }
    const match = /^\/wake-up-calls\/([a-zA-Z0-9_-]+)$/.exec(path);
    if (!match) return;
    const row = mockDb.wakeUpCalls.find((item: any) => item.id === match[1]);
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'Wake-up call not found',
      });
    }
    return row;
  }
  if (method === 'POST') return handleWakeUpCallsPost(path, body);
}

function isThaiNationalityMock(value: string | undefined): boolean {
  return ['TH', 'THA', 'THAI', 'THAILAND'].includes(
    (value ?? '').trim().toUpperCase(),
  );
}

function handleTm30ReportsGet(path: string, params: URLSearchParams) {
  if (path === '/tm30-reports/export') {
    const propertyId = params.get('propertyId') || '';
    const rows = mockDb.tm30Reports.filter(
      (row: any) => row.propertyId === propertyId,
    );
    const header =
      'PASSPORT\tFULL_NAME\tNATIONALITY\tDOB\tROOM\tARRIVAL\tDEPARTURE\tADDRESS';
    const lines = rows.map(
      (row: any) =>
        `${row.passportNumber}\t${row.fullName}\t${row.nationality}\t${String(row.dateOfBirth || '').slice(0, 10)}\t${row.roomNumber}\t${String(row.arrivalDate).slice(0, 10)}\t${String(row.departureDate || '').slice(0, 10)}\t${row.addressInThailand || ''}`,
    );
    return {
      filename: `tm30-${propertyId}.tsv`,
      text: [header, ...lines].join('\n'),
    };
  }
  if (path !== '/tm30-reports') return;
  const propertyId = params.get('propertyId');
  if (!propertyId) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId is required',
    });
  }
  const status = params.get('status');
  const overdue = params.get('overdue') === 'true';
  return mockDb.tm30Reports
    .filter((row: any) => {
      if (row.propertyId !== propertyId) return false;
      if (status && row.status !== status) return false;
      if (
        overdue &&
        (row.status !== 'PENDING' || new Date(row.dueAt) >= new Date())
      ) {
        return false;
      }
      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
}

function handleTm30ReportsPost(path: string, body: any) {
  if (path === '/tm30-reports/generate') {
    const created: any[] = [];
    const skipped: Array<{ reservationId: string; reason: string }> = [];
    const stays = mockDb.reservations.filter(
      (row: any) =>
        row.status === 'CHECKED_IN' && row.propertyId === body.propertyId,
    );
    for (const stay of stays) {
      const guest =
        mockDb.guests.find((g: any) => g.id === stay.guestId) || stay.guest;
      if (!guest?.nationality) {
        skipped.push({ reservationId: stay.id, reason: 'MISSING_NATIONALITY' });
        continue;
      }
      if (isThaiNationalityMock(guest.nationality)) {
        skipped.push({ reservationId: stay.id, reason: 'THAI_NATIONAL' });
        continue;
      }
      if (!guest.idNumber) {
        skipped.push({ reservationId: stay.id, reason: 'MISSING_PASSPORT' });
        continue;
      }
      const exists = mockDb.tm30Reports.find(
        (row: any) =>
          row.reservationId === stay.id && row.guestId === stay.guestId,
      );
      if (exists) {
        skipped.push({ reservationId: stay.id, reason: 'ALREADY_EXISTS' });
        continue;
      }
      const arrival = new Date(stay.checkIn);
      const row = {
        id: `tm_mock_${Date.now()}_${stay.id}`,
        propertyId: stay.propertyId,
        reservationId: stay.id,
        guestId: stay.guestId,
        passportNumber: guest.idNumber,
        fullName: `${guest.firstName} ${guest.lastName}`.trim(),
        nationality: guest.nationality,
        dateOfBirth: guest.dateOfBirth || null,
        roomNumber: stay.room?.number || '—',
        arrivalDate: arrival.toISOString().slice(0, 10),
        departureDate: stay.checkOut
          ? new Date(stay.checkOut).toISOString().slice(0, 10)
          : null,
        addressInThailand:
          mockDb.properties.find((p: any) => p.id === stay.propertyId)
            ?.address || null,
        status: 'PENDING',
        dueAt: new Date(arrival.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: null,
        confirmedAt: null,
        failedAt: null,
        failureReason: null,
        referenceNo: null,
        generatedBy: body.generatedBy,
        submittedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reservation: {
          id: stay.id,
          confirmNumber: stay.confirmNumber,
          status: stay.status,
        },
      };
      mockDb.tm30Reports.push(row);
      created.push(row);
    }
    return { created, skipped };
  }

  const submitMatch = /^\/tm30-reports\/([a-zA-Z0-9_-]+)\/submit$/.exec(path);
  if (submitMatch) {
    const row = mockDb.tm30Reports.find(
      (item: any) => item.id === submitMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'TM.30 report not found',
      });
    }
    if (row.status !== 'PENDING') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only pending TM.30 reports can be submitted',
      });
    }
    row.status = 'SUBMITTED';
    row.submittedAt = new Date().toISOString();
    row.submittedBy = body.submittedBy;
    row.referenceNo = body.referenceNo || row.referenceNo;
    return row;
  }

  const confirmMatch = /^\/tm30-reports\/([a-zA-Z0-9_-]+)\/confirm$/.exec(path);
  if (confirmMatch) {
    const row = mockDb.tm30Reports.find(
      (item: any) => item.id === confirmMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'TM.30 report not found',
      });
    }
    if (row.status !== 'SUBMITTED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only submitted TM.30 reports can be confirmed or failed',
      });
    }
    row.status = 'CONFIRMED';
    row.confirmedAt = new Date().toISOString();
    row.referenceNo = body.referenceNo || row.referenceNo;
    return row;
  }

  const failMatch = /^\/tm30-reports\/([a-zA-Z0-9_-]+)\/fail$/.exec(path);
  if (failMatch) {
    const row = mockDb.tm30Reports.find(
      (item: any) => item.id === failMatch[1],
    );
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'TM.30 report not found',
      });
    }
    if (row.status !== 'SUBMITTED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only submitted TM.30 reports can be confirmed or failed',
      });
    }
    row.status = 'FAILED';
    row.failedAt = new Date().toISOString();
    row.failureReason = body.failureReason;
    return row;
  }
}

function handleTm30Reports(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/tm30-reports')) return;
  if (method === 'GET') {
    const listed = handleTm30ReportsGet(path, params);
    if (listed !== undefined) return listed;
    const match = /^\/tm30-reports\/([a-zA-Z0-9_-]+)$/.exec(path);
    if (!match) return;
    const row = mockDb.tm30Reports.find((item: any) => item.id === match[1]);
    if (!row) {
      throw new APIError(404, 'Not Found', {
        message: 'TM.30 report not found',
      });
    }
    return row;
  }
  if (method === 'POST') return handleTm30ReportsPost(path, body);
}

function isLostFoundOverdueMock(row: any): boolean {
  if (row.status !== 'FOUND') return false;
  const end =
    new Date(row.foundAt).getTime() + row.retentionDays * 24 * 60 * 60 * 1000;
  return end < Date.now();
}

function findLostFoundItem(id: string) {
  const row = mockDb.lostFoundItems.find((item: any) => item.id === id);
  if (!row) {
    throw new APIError(404, 'Not Found', {
      message: `Lost-and-found item with ID ${id} not found`,
    });
  }
  return row;
}

function handleLostFoundGet(path: string, params: URLSearchParams) {
  if (path !== '/lost-found') return;
  const propertyId = params.get('propertyId');
  if (!propertyId) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId is required',
    });
  }
  const status = params.get('status');
  const overdue = params.get('overdue') === 'true';
  return mockDb.lostFoundItems
    .filter((row: any) => {
      if (row.propertyId !== propertyId) return false;
      if (status && row.status !== status) return false;
      if (overdue && !isLostFoundOverdueMock(row)) return false;
      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime(),
    );
}

function handleLostFoundPost(path: string, body: any) {
  const claimMatch = /^\/lost-found\/([a-zA-Z0-9_-]+)\/claim$/.exec(path);
  if (claimMatch) {
    const row = findLostFoundItem(claimMatch[1]);
    if (row.status !== 'FOUND') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only found items can be claimed or disposed',
      });
    }
    row.status = 'CLAIMED';
    row.claimedAt = new Date().toISOString();
    row.claimedBy = body.claimedBy;
    row.guestId = body.guestId || row.guestId;
    row.updatedAt = new Date().toISOString();
    return row;
  }

  const returnMatch = /^\/lost-found\/([a-zA-Z0-9_-]+)\/return$/.exec(path);
  if (returnMatch) {
    const row = findLostFoundItem(returnMatch[1]);
    if (row.status !== 'CLAIMED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only claimed items can be returned',
      });
    }
    row.status = 'RETURNED';
    row.returnedAt = new Date().toISOString();
    row.returnedTo = body.returnedTo;
    row.updatedAt = new Date().toISOString();
    return row;
  }

  const disposeMatch = /^\/lost-found\/([a-zA-Z0-9_-]+)\/dispose$/.exec(path);
  if (disposeMatch) {
    const row = findLostFoundItem(disposeMatch[1]);
    if (row.status !== 'FOUND') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only found items can be claimed or disposed',
      });
    }
    row.status = 'DISPOSED';
    row.disposedAt = new Date().toISOString();
    row.disposedBy = body.disposedBy;
    row.disposeReason = body.disposeReason;
    row.updatedAt = new Date().toISOString();
    return row;
  }

  if (path !== '/lost-found') return;
  const property = mockDb.properties.find((p: any) => p.id === body.propertyId);
  if (!property) {
    throw new APIError(404, 'Not Found', { message: 'Property not found' });
  }
  const foundAt = body.foundAt ? new Date(body.foundAt) : new Date();
  if (Number.isNaN(foundAt.getTime())) {
    throw new APIError(400, 'Bad Request', {
      message: 'foundAt must be a valid date',
    });
  }
  const guest = body.guestId
    ? mockDb.guests.find((g: any) => g.id === body.guestId)
    : null;
  if (body.guestId && !guest) {
    throw new APIError(404, 'Not Found', { message: 'Guest not found' });
  }
  const created = {
    id: `lf_mock_${Date.now()}`,
    propertyId: body.propertyId,
    itemDescription: body.itemDescription,
    locationFound: body.locationFound,
    roomNumber: body.roomNumber || null,
    foundBy: body.foundBy,
    foundAt: foundAt.toISOString(),
    notes: body.notes || null,
    guestId: body.guestId || null,
    status: 'FOUND',
    claimedAt: null,
    claimedBy: null,
    returnedAt: null,
    returnedTo: null,
    disposedAt: null,
    disposedBy: null,
    disposeReason: null,
    retentionDays: body.retentionDays ?? 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    guest: guest
      ? { id: guest.id, firstName: guest.firstName, lastName: guest.lastName }
      : null,
    property: { id: property.id, name: property.name },
  };
  mockDb.lostFoundItems.push(created);
  return created;
}

function handleLostFound(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/lost-found')) return;
  if (method === 'GET') {
    const listed = handleLostFoundGet(path, params);
    if (listed !== undefined) return listed;
    const match = /^\/lost-found\/([a-zA-Z0-9_-]+)$/.exec(path);
    if (!match) return;
    return findLostFoundItem(match[1]);
  }
  if (method === 'POST') return handleLostFoundPost(path, body);
}

function findGuestMessage(id: string) {
  const row = mockDb.guestMessages.find((item: any) => item.id === id);
  if (!row) {
    throw new APIError(404, 'Not Found', {
      message: `Guest message with ID ${id} not found`,
    });
  }
  return row;
}

function handleGuestMessagesGet(path: string, params: URLSearchParams) {
  if (path !== '/guest-messages') return;
  const propertyId = params.get('propertyId');
  if (!propertyId) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId is required',
    });
  }
  const guestId = params.get('guestId');
  const reservationId = params.get('reservationId');
  const unread = params.get('unread') === 'true';
  return mockDb.guestMessages
    .filter((row: any) => {
      if (row.propertyId !== propertyId) return false;
      if (guestId && row.guestId !== guestId) return false;
      if (reservationId && row.reservationId !== reservationId) return false;
      if (unread && row.readAt) return false;
      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function handleGuestMessagesPost(path: string, body: any) {
  const readMatch = /^\/guest-messages\/([a-zA-Z0-9_-]+)\/read$/.exec(path);
  if (readMatch) {
    const row = findGuestMessage(readMatch[1]);
    if (!row.readAt) {
      row.readAt = new Date().toISOString();
      row.updatedAt = new Date().toISOString();
    }
    return row;
  }

  if (path !== '/guest-messages') return;
  if (body.channel && body.channel !== 'IN_APP') {
    throw new APIError(400, 'Bad Request', {
      message: 'Only IN_APP channel is supported in v1',
    });
  }
  if (body.direction === 'OUTBOUND' && !body.sentBy) {
    throw new APIError(400, 'Bad Request', {
      message: 'Outbound messages require sentBy',
    });
  }
  const property = mockDb.properties.find((p: any) => p.id === body.propertyId);
  if (!property) {
    throw new APIError(404, 'Not Found', { message: 'Property not found' });
  }
  const guest = mockDb.guests.find((g: any) => g.id === body.guestId);
  if (!guest) {
    throw new APIError(404, 'Not Found', { message: 'Guest not found' });
  }
  const created = {
    id: `msg_mock_${Date.now()}`,
    propertyId: body.propertyId,
    guestId: body.guestId,
    reservationId: body.reservationId || null,
    direction: body.direction,
    channel: 'IN_APP',
    content: body.content,
    sentBy: body.sentBy || null,
    readAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    },
    property: { id: property.id, name: property.name },
  };
  mockDb.guestMessages.push(created);
  return created;
}

function handleGuestMessages(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/guest-messages')) return;
  if (method === 'GET') {
    const listed = handleGuestMessagesGet(path, params);
    if (listed !== undefined) return listed;
    const match = /^\/guest-messages\/([a-zA-Z0-9_-]+)$/.exec(path);
    if (!match) return;
    return findGuestMessage(match[1]);
  }
  if (method === 'POST') return handleGuestMessagesPost(path, body);
}

function findGuestFeedback(id: string) {
  const row = mockDb.guestFeedbacks.find((item: any) => item.id === id);
  if (!row) {
    throw new APIError(404, 'Not Found', {
      message: `Guest feedback with ID ${id} not found`,
    });
  }
  return row;
}

function handleGuestFeedbackGet(path: string, params: URLSearchParams) {
  if (path !== '/guest-feedback') return;
  const propertyId = params.get('propertyId');
  if (!propertyId) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId is required',
    });
  }
  const guestId = params.get('guestId');
  const status = params.get('status');
  return mockDb.guestFeedbacks
    .filter((row: any) => {
      if (row.propertyId !== propertyId) return false;
      if (guestId && row.guestId !== guestId) return false;
      if (status && row.status !== status) return false;
      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
}

function handleGuestFeedbackPost(path: string, body: any) {
  const reviewMatch = /^\/guest-feedback\/([a-zA-Z0-9_-]+)\/review$/.exec(path);
  if (reviewMatch) {
    const row = findGuestFeedback(reviewMatch[1]);
    if (row.status === 'OPEN') {
      row.status = 'REVIEWED';
      row.reviewedAt = new Date().toISOString();
      row.reviewedBy = body.reviewedBy;
      row.updatedAt = new Date().toISOString();
    }
    return row;
  }

  if (path !== '/guest-feedback') return;
  if (!Number.isInteger(body.score) || body.score < 1 || body.score > 5) {
    throw new APIError(400, 'Bad Request', {
      message: 'Score must be between 1 and 5',
    });
  }
  const property = mockDb.properties.find((p: any) => p.id === body.propertyId);
  if (!property) {
    throw new APIError(404, 'Not Found', { message: 'Property not found' });
  }
  const guest = mockDb.guests.find((g: any) => g.id === body.guestId);
  if (!guest) {
    throw new APIError(404, 'Not Found', { message: 'Guest not found' });
  }
  const created = {
    id: `fb_mock_${Date.now()}`,
    propertyId: body.propertyId,
    guestId: body.guestId,
    reservationId: body.reservationId || null,
    score: body.score,
    comment: body.comment || null,
    status: 'OPEN',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    },
    property: { id: property.id, name: property.name },
  };
  mockDb.guestFeedbacks.push(created);
  return created;
}

function handleGuestFeedback(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/guest-feedback')) return;
  if (method === 'GET') return handleGuestFeedbackGet(path, params);
  if (method === 'POST') return handleGuestFeedbackPost(path, body);
}

function findGuestComplaint(id: string) {
  const row = mockDb.guestComplaints.find((item: any) => item.id === id);
  if (!row) {
    throw new APIError(404, 'Not Found', {
      message: `Guest complaint with ID ${id} not found`,
    });
  }
  return row;
}

function handleGuestComplaintsGet(path: string, params: URLSearchParams) {
  const match = /^\/guest-complaints\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) return findGuestComplaint(match[1]);
  if (path !== '/guest-complaints') return;
  const propertyId = params.get('propertyId');
  if (!propertyId) {
    throw new APIError(400, 'Bad Request', {
      message: 'propertyId is required',
    });
  }
  const status = params.get('status');
  return mockDb.guestComplaints
    .filter((row: any) => {
      if (row.propertyId !== propertyId) return false;
      if (status && row.status !== status) return false;
      return true;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function handleGuestComplaintsPost(path: string, body: any) {
  const startMatch = /^\/guest-complaints\/([a-zA-Z0-9_-]+)\/start$/.exec(path);
  if (startMatch) {
    const row = findGuestComplaint(startMatch[1]);
    if (row.status === 'OPEN') {
      row.status = 'IN_PROGRESS';
      row.assignedTo = body.assignedTo || row.assignedTo;
      row.updatedAt = new Date().toISOString();
    }
    return row;
  }

  const resolveMatch = /^\/guest-complaints\/([a-zA-Z0-9_-]+)\/resolve$/.exec(
    path,
  );
  if (resolveMatch) {
    const row = findGuestComplaint(resolveMatch[1]);
    if (row.status === 'OPEN' || row.status === 'IN_PROGRESS') {
      row.status = 'RESOLVED';
      row.resolutionNote = body.resolutionNote;
      row.resolvedAt = new Date().toISOString();
      row.resolvedBy = body.resolvedBy;
      row.updatedAt = new Date().toISOString();
    }
    return row;
  }

  const closeMatch = /^\/guest-complaints\/([a-zA-Z0-9_-]+)\/close$/.exec(path);
  if (closeMatch) {
    const row = findGuestComplaint(closeMatch[1]);
    if (row.status === 'RESOLVED') {
      row.status = 'CLOSED';
      row.closedAt = new Date().toISOString();
      row.closedBy = body.closedBy;
      row.updatedAt = new Date().toISOString();
    }
    return row;
  }

  if (path !== '/guest-complaints') return;
  const property = mockDb.properties.find((p: any) => p.id === body.propertyId);
  if (!property) {
    throw new APIError(404, 'Not Found', { message: 'Property not found' });
  }
  const guest = body.guestId
    ? mockDb.guests.find((g: any) => g.id === body.guestId)
    : null;
  if (body.guestId && !guest) {
    throw new APIError(404, 'Not Found', { message: 'Guest not found' });
  }
  const created = {
    id: `gc_mock_${Date.now()}`,
    propertyId: body.propertyId,
    guestId: body.guestId || null,
    reservationId: body.reservationId || null,
    category: body.category,
    severity: body.severity || 'MEDIUM',
    subject: body.subject,
    description: body.description,
    status: 'OPEN',
    openedBy: body.openedBy,
    assignedTo: null,
    resolutionNote: null,
    resolvedAt: null,
    resolvedBy: null,
    closedAt: null,
    closedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    guest: guest
      ? { id: guest.id, firstName: guest.firstName, lastName: guest.lastName }
      : null,
    property: { id: property.id, name: property.name },
  };
  mockDb.guestComplaints.push(created);
  return created;
}

function handleGuestComplaints(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/guest-complaints')) return;
  if (method === 'GET') return handleGuestComplaintsGet(path, params);
  if (method === 'POST') return handleGuestComplaintsPost(path, body);
}

function handleHardwareBridge(
  method: string,
  path: string,
  body: any,
  params: URLSearchParams,
) {
  if (!path.startsWith('/hardware-bridge')) return;

  if (method === 'GET' && path === '/hardware-bridge/catalog') {
    return HB_CATALOG;
  }

  if (method === 'GET' && path === '/hardware-bridge/agents') {
    const propertyId = params.get('propertyId');
    return mockDb.hardwareAgents.filter(
      (row: any) => !propertyId || row.propertyId === propertyId,
    );
  }

  if (method === 'POST' && path === '/hardware-bridge/agents') {
    const row = {
      id: `hb_agent_${Date.now()}`,
      propertyId: body.propertyId,
      name: body.name,
      machineId: body.machineId,
      isActive: true,
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockDb.hardwareAgents.push(row);
    return row;
  }

  const heartbeatMatch =
    /^\/hardware-bridge\/agents\/([a-zA-Z0-9_-]+)\/heartbeat$/.exec(path);
  if (method === 'POST' && heartbeatMatch) {
    const agent = mockDb.hardwareAgents.find(
      (row: any) => row.id === heartbeatMatch[1],
    );
    if (!agent) {
      throw new APIError(404, 'Not Found', { message: 'Agent not found' });
    }
    agent.lastSeenAt = new Date().toISOString();
    return agent;
  }

  if (method === 'GET' && path === '/hardware-bridge/jobs') {
    const propertyId = params.get('propertyId');
    return mockDb.hardwareJobs.filter(
      (row: any) => !propertyId || row.propertyId === propertyId,
    );
  }

  if (method === 'POST' && path === '/hardware-bridge/jobs') {
    const row = {
      id: `hb_job_${Date.now()}`,
      propertyId: body.propertyId,
      agentId: body.agentId ?? null,
      type: body.type,
      status: 'PENDING',
      requestedBy: body.requestedBy,
      payload: body.payload || {},
      result: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    mockDb.hardwareJobs.push(row);
    return row;
  }

  const jobActionMatch =
    /^\/hardware-bridge\/jobs\/([a-zA-Z0-9_-]+)\/(complete|fail|simulate)$/.exec(
      path,
    );
  if (method === 'POST' && jobActionMatch) {
    const job = mockDb.hardwareJobs.find(
      (row: any) => row.id === jobActionMatch[1],
    );
    if (!job) {
      throw new APIError(404, 'Not Found', { message: 'Job not found' });
    }
    const action = jobActionMatch[2];
    if (action === 'fail') {
      job.status = 'FAILED';
      job.errorMessage = body?.errorMessage || 'failed';
      job.completedAt = new Date().toISOString();
      return job;
    }
    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    job.result =
      action === 'simulate'
        ? simulatedHardwareResult(job)
        : (body?.result ?? {});
    return job;
  }
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

function handleFolioReopen(path: string) {
  const match = /^\/folios\/([a-zA-Z0-9_-]+)\/reopen$/.exec(path);
  if (!match) return;
  const folio = mockDb.folios.find((row: any) => row.id === match[1]);
  if (!folio) {
    throw new APIError(404, 'Not Found', { message: 'Folio not found' });
  }
  if (folio.status !== 'CLOSED') {
    throw new APIError(409, 'Conflict', {
      message:
        'Only a closed folio can be reopened for a post-departure charge',
    });
  }
  folio.status = 'OPEN';
  folio.isClosed = false;
  folio.closedAt = null;
  folio.closedBy = null;
  return folio;
}

function handleFolioPost(path: string, body: any) {
  const voidRes = handleFolioVoid(path, body);
  if (voidRes !== undefined) return voidRes;

  const reopenRes = handleFolioReopen(path);
  if (reopenRes !== undefined) return reopenRes;

  const match = /^\/folios\/([a-zA-Z0-9_-]+)\/transactions$/.exec(path);
  if (!match) return;

  const folioId = match[1];
  const folioForStatus = mockDb.folios.find((row: any) => row.id === folioId);
  if (folioForStatus && folioForStatus.status !== 'OPEN') {
    throw new APIError(409, 'Conflict', {
      message: 'Folio is not open for posting. Reopen a closed folio first.',
    });
  }

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

function handleFolios(
  method: string,
  path: string,
  body: any,
  params?: URLSearchParams,
) {
  if (method === 'GET') return handleFolioGet(path, params);
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

const BLOCKED_MOVE_STATUSES = new Set([
  'OUT_OF_ORDER',
  'OUT_OF_SERVICE',
  'OCCUPIED_CLEAN',
  'OCCUPIED_DIRTY',
]);

function calendarDate(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

function hasNoShowCharge(reservationId: string, trxCodeId: string): boolean {
  const folio = mockDb.folios.find(
    (row: any) => row.reservationId === reservationId,
  );
  if (!folio) return false;
  const windowIds = new Set(
    mockDb.folioWindows
      .filter((window: any) => window.folioId === folio.id)
      .map((window: any) => window.id),
  );
  return mockDb.folioTransactions.some(
    (txn: any) =>
      txn.trxCodeId === trxCodeId && !txn.isVoid && windowIds.has(txn.windowId),
  );
}

function postMockNoShowCharge(reservation: any, body: any) {
  const trxCode = mockDb.transactionCodes.find((c: any) => c.code === '1006');
  const folio = mockDb.folios.find(
    (row: any) => row.reservationId === reservation.id,
  );
  if (!trxCode || !folio || hasNoShowCharge(reservation.id, trxCode.id)) {
    return;
  }
  const window = mockDb.folioWindows.find(
    (row: any) => row.folioId === folio.id && row.windowNumber === 1,
  );
  if (!window) return;
  const amount = Number(reservation.roomRate) || 0;
  mockDb.folioTransactions.push({
    id: `ft_noshow_${Date.now()}`,
    windowId: window.id,
    trxCodeId: trxCode.id,
    amountNet: amount,
    amountService: 0,
    amountTax: 0,
    amountTotal: amount,
    sign: 1,
    reference: `No-show ${reservation.confirmNumber}`,
    remark: body?.reason,
    userId: body?.userId || 'usr_mock_1',
    createdAt: new Date().toISOString(),
    isVoid: false,
  });
}

function applyNoShow(reservationId: string, body: any) {
  const idx = mockDb.reservations.findIndex((r: any) => r.id === reservationId);
  if (idx === -1) {
    throw new APIError(404, 'Not Found', { message: 'Reservation not found' });
  }

  const reservation = mockDb.reservations[idx];
  if (reservation.status !== 'CONFIRMED') {
    throw new APIError(400, 'Bad Request', {
      message: 'Only confirmed reservations can be marked no-show',
    });
  }

  const asOf = body?.businessDate ? new Date(body.businessDate) : new Date();
  if (calendarDate(reservation.checkIn) > calendarDate(asOf)) {
    throw new APIError(400, 'Bad Request', {
      message: 'Cannot mark no-show before the arrival date',
    });
  }

  reservation.status = 'NO_SHOW';
  if (body?.reason) {
    reservation.notes =
      `${reservation.notes || ''}\nNo-show: ${body.reason}`.trim();
  }
  postMockNoShowCharge(reservation, body);
  return reservation;
}

function applyRoomMove(reservationId: string, body: any) {
  const idx = mockDb.reservations.findIndex((r: any) => r.id === reservationId);
  if (idx === -1) {
    throw new APIError(404, 'Not Found', { message: 'Reservation not found' });
  }

  const reservation = mockDb.reservations[idx];
  if (reservation.status !== 'CHECKED_IN') {
    throw new APIError(400, 'Bad Request', {
      message: 'Only checked-in reservations can be moved to another room',
    });
  }

  const toRoomId = body?.toRoomId;
  if (!toRoomId || toRoomId === reservation.roomId) {
    throw new APIError(400, 'Bad Request', {
      message: 'Target room must be different from the current room',
    });
  }

  const toRoom = mockDb.rooms.find((room: any) => room.id === toRoomId);
  if (!toRoom) {
    throw new APIError(404, 'Not Found', { message: 'Room not found' });
  }
  if (BLOCKED_MOVE_STATUSES.has(toRoom.status)) {
    throw new APIError(400, 'Bad Request', {
      message: 'Target room is not vacant and cannot receive a mid-stay move',
    });
  }

  const fromRoomId = reservation.roomId;
  const fromRoom = mockDb.rooms.find((room: any) => room.id === fromRoomId);
  if (fromRoom) fromRoom.status = 'VACANT_DIRTY';
  toRoom.status =
    toRoom.status === 'VACANT_DIRTY' ? 'OCCUPIED_DIRTY' : 'OCCUPIED_CLEAN';

  reservation.roomId = toRoomId;
  reservation.room = {
    id: toRoom.id,
    number: toRoom.number,
    roomType: reservation.room?.roomType ?? { name: '' },
  };

  const stays = Array.isArray(reservation.stays) ? reservation.stays : [];
  const now = Date.now();
  const currentStay =
    stays.find((stay: any) => {
      const start = new Date(stay.startDate).getTime();
      const end = new Date(stay.endDate).getTime();
      return start <= now && now < end;
    }) ?? stays.find((stay: any) => stay.roomId === fromRoomId);
  if (currentStay) {
    currentStay.roomId = toRoomId;
    currentStay.room = { id: toRoom.id, number: toRoom.number };
  }

  const move = {
    id: `move_mock_${Date.now()}`,
    reservationId,
    fromRoomId,
    toRoomId,
    reason: body?.reason,
    movedAt: new Date().toISOString(),
    movedBy: body?.movedBy || 'usr_mock_1',
    keyCardReissued: true,
    folioTransferred: true,
    fromRoom: fromRoom
      ? { id: fromRoom.id, number: fromRoom.number }
      : { id: fromRoomId, number: fromRoomId },
    toRoom: { id: toRoom.id, number: toRoom.number },
  };
  mockDb.roomMoves.push(move);
  return reservation;
}

function applyWalk(reservationId: string, body: any) {
  const idx = mockDb.reservations.findIndex((r: any) => r.id === reservationId);
  if (idx === -1) {
    throw new APIError(404, 'Not Found', { message: 'Reservation not found' });
  }

  const reservation = mockDb.reservations[idx];
  if (reservation.status !== 'CONFIRMED') {
    throw new APIError(400, 'Bad Request', {
      message: 'Only confirmed reservations can be walked to another hotel',
    });
  }

  const cost = Number(body?.cost);
  const compensationAmount = Number(body?.compensationAmount ?? 0);
  if (cost < 0 || compensationAmount < 0) {
    throw new APIError(400, 'Bad Request', {
      message: 'Walk cost and compensation amount cannot be negative',
    });
  }

  const partnerHotel = mockDb.partnerHotels.find(
    (row: any) => row.id === body?.partnerHotelId,
  );
  if (!partnerHotel) {
    throw new APIError(404, 'Not Found', {
      message: 'Partner hotel not found',
    });
  }
  if (!partnerHotel.isActive) {
    throw new APIError(400, 'Bad Request', {
      message: 'Partner hotel is not active',
    });
  }

  reservation.status = 'WALKED';
  if (body?.reason) {
    reservation.notes =
      `${reservation.notes || ''}\nWalked: ${body.reason}`.trim();
  }

  const walk = {
    id: `walk_mock_${Date.now()}`,
    reservationId,
    partnerHotelId: partnerHotel.id,
    reason: body?.reason,
    cost,
    compensationAmount,
    compensationNotes: body?.compensationNotes,
    walkedAt: new Date().toISOString(),
    walkedBy: body?.walkedBy || 'usr_mock_1',
    partnerHotel: {
      id: partnerHotel.id,
      name: partnerHotel.name,
      phone: partnerHotel.phone,
    },
  };
  mockDb.walks.push(walk);
  return reservation;
}

function handleReservationsGet(path: string, params?: URLSearchParams) {
  if (path === '/reservations') {
    let results = mockDb.reservations;
    const stayPurpose = params?.get('stayPurpose');
    if (stayPurpose) {
      results = results.filter(
        (reservation: { stayPurpose?: string }) =>
          reservation.stayPurpose === stayPurpose,
      );
    }
    const taxExempt = params?.get('taxExempt');
    if (taxExempt === 'true' || taxExempt === 'false') {
      const flag = taxExempt === 'true';
      results = results.filter(
        (reservation: { taxExempt?: boolean }) =>
          reservation.taxExempt === flag,
      );
    }
    const isRoomLocked = params?.get('isRoomLocked');
    if (isRoomLocked === 'true' || isRoomLocked === 'false') {
      const flag = isRoomLocked === 'true';
      results = results.filter(
        (reservation: { isRoomLocked?: boolean }) =>
          reservation.isRoomLocked === flag,
      );
    }
    return results;
  }
  const movesMatch = /^\/reservations\/([a-zA-Z0-9_-]+)\/room-moves$/.exec(
    path,
  );
  if (movesMatch) {
    const reservation = mockDb.reservations.find(
      (r: any) => r.id === movesMatch[1],
    );
    if (!reservation) {
      throw new APIError(404, 'Not Found', {
        message: 'Reservation not found',
      });
    }
    return mockDb.roomMoves
      .filter((move: any) => move.reservationId === movesMatch[1])
      .sort(
        (a: any, b: any) =>
          new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime(),
      );
  }
  const walksMatch = /^\/reservations\/([a-zA-Z0-9_-]+)\/walks$/.exec(path);
  if (walksMatch) {
    const reservation = mockDb.reservations.find(
      (r: any) => r.id === walksMatch[1],
    );
    if (!reservation) {
      throw new APIError(404, 'Not Found', {
        message: 'Reservation not found',
      });
    }
    return mockDb.walks
      .filter((walk: any) => walk.reservationId === walksMatch[1])
      .sort(
        (a: any, b: any) =>
          new Date(b.walkedAt).getTime() - new Date(a.walkedAt).getTime(),
      );
  }
  const confirmMatch = /^\/reservations\/confirm\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (confirmMatch) {
    const reservation = mockDb.reservations.find(
      (r: any) => r.confirmNumber === confirmMatch[1],
    );
    if (!reservation) {
      throw new APIError(404, 'Not Found', {
        message: `Reservation with confirmation number ${confirmMatch[1]} not found`,
      });
    }
    return reservation;
  }
  const match = /^\/reservations\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) return mockDb.reservations.find((r: any) => r.id === match[1]);
}

function handleReservationsPost(path: string, body: any) {
  if (path === '/reservations') {
    const stayPurpose = body?.stayPurpose;
    const nonRevenue =
      stayPurpose === 'COMPLIMENTARY' || stayPurpose === 'HOUSE_USE';
    const randomSuffix = Math.floor(Math.random() * 10000); // NOSONAR
    const newRes = {
      ...body,
      id: `res_mock_${Date.now()}`,
      confirmNumber: `CN-DM-${randomSuffix}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      stays: Array.isArray(body?.stays) ? body.stays : [],
      billingCycle: body?.billingCycle || 'NIGHTLY',
      taxExempt: body?.taxExempt === true,
      taxExemptDocumentRef: body?.taxExempt
        ? body?.taxExemptDocumentRef
        : undefined,
      taxExemptApprovedBy: body?.taxExempt
        ? body?.taxExemptApprovedBy
        : undefined,
      taxExemptReason: body?.taxExempt ? body?.taxExemptReason : undefined,
      isRoomLocked: body?.isRoomLocked === true,
      roomLockNote: body?.isRoomLocked ? body?.roomLockNote : undefined,
      roomRate: nonRevenue ? 0 : body?.roomRate,
      totalAmount: nonRevenue ? 0 : body?.totalAmount,
      rateCode:
        body?.rateCode ||
        (stayPurpose === 'COMPLIMENTARY'
          ? 'COMP'
          : stayPurpose === 'HOUSE_USE'
            ? 'HOUSE'
            : body?.rateCode),
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
  match = /^\/reservations\/([a-zA-Z0-9_-]+)\/room-move$/.exec(path);
  if (match) {
    return applyRoomMove(match[1], body);
  }
  match = /^\/reservations\/([a-zA-Z0-9_-]+)\/no-show$/.exec(path);
  if (match) {
    return applyNoShow(match[1], body);
  }
  match = /^\/reservations\/([a-zA-Z0-9_-]+)\/walk$/.exec(path);
  if (match) {
    return applyWalk(match[1], body);
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

function handleKiosk(method: string, path: string, body: any) {
  if (!path.startsWith('/kiosk')) return;
  if (method === 'POST' && path === '/kiosk/check-in') {
    const confirmNumber = String(body?.confirmNumber ?? '').trim();
    if (!confirmNumber) {
      throw new APIError(400, 'Bad Request', {
        message: 'confirmNumber is required',
      });
    }
    const idx = mockDb.reservations.findIndex(
      (r: any) => r.confirmNumber === confirmNumber,
    );
    if (idx === -1) {
      throw new APIError(404, 'Not Found', {
        message: `Reservation with confirmation number ${confirmNumber} not found`,
      });
    }
    const reservation = mockDb.reservations[idx];
    if (body?.propertyId && reservation.propertyId !== body.propertyId) {
      throw new APIError(400, 'Bad Request', {
        message: 'Reservation does not belong to this property',
      });
    }
    if (reservation.status !== 'CONFIRMED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only confirmed reservations can be checked in',
      });
    }
    mockDb.reservations[idx].status = 'CHECKED_IN';
    updateReservationRoomStatus(mockDb.reservations[idx], 'OCCUPIED_CLEAN');
    return mockDb.reservations[idx];
  }
}

function toMobileCheckInView(reservation: any) {
  return {
    confirmNumber: reservation.confirmNumber,
    status: reservation.status,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    nights: reservation.nights ?? null,
    adults: reservation.adults,
    children: reservation.children,
    guestFirstName: reservation.guest?.firstName ?? '',
    guestLastName: reservation.guest?.lastName ?? '',
    room: reservation.room
      ? {
          id: reservation.room.id,
          number: reservation.room.number,
          floor: reservation.room.floor ?? null,
          roomType: {
            id: reservation.room.roomType?.id ?? reservation.room.roomTypeId,
            name: reservation.room.roomType?.name ?? '',
            code: reservation.room.roomType?.code ?? '',
          },
        }
      : null,
    propertyId: reservation.propertyId,
  };
}

function findMobileCheckInReservation(
  confirmNumber: string,
  lastName?: string,
) {
  const reservation = mockDb.reservations.find(
    (r: any) => r.confirmNumber === confirmNumber,
  );
  if (!reservation) {
    throw new APIError(404, 'Not Found', {
      message: `Reservation with confirmation number ${confirmNumber} not found`,
    });
  }
  if (
    lastName &&
    reservation.guest?.lastName?.trim().toLowerCase() !==
      lastName.trim().toLowerCase()
  ) {
    throw new APIError(400, 'Bad Request', {
      message: 'Last name does not match this reservation',
    });
  }
  return reservation;
}

function assertMobileRoomChangeEligible(reservation: any) {
  if (reservation.status !== 'CONFIRMED') {
    throw new APIError(400, 'Bad Request', {
      message: 'Rooms can only be changed before check-in',
    });
  }
}

function handleMobileCheckInGet(path: string, params?: URLSearchParams) {
  const lastName = params?.get('lastName') || undefined;

  const roomsMatch = /^\/mobile-check-in\/([a-zA-Z0-9_-]+)\/rooms$/.exec(path);
  if (roomsMatch) {
    const reservation = findMobileCheckInReservation(roomsMatch[1], lastName);
    assertMobileRoomChangeEligible(reservation);

    const vacantStatuses = ['VACANT_CLEAN', 'VACANT_DIRTY'];
    const candidateRooms = mockDb.rooms.filter(
      (room: any) =>
        room.propertyId === reservation.propertyId &&
        vacantStatuses.includes(room.status) &&
        room.id !== reservation.roomId,
    );

    const grouped: Record<string, any> = {};
    for (const room of candidateRooms) {
      const roomType = mockDb.roomTypes.find(
        (rt: any) => rt.id === room.roomTypeId,
      );
      if (!grouped[room.roomTypeId]) {
        grouped[room.roomTypeId] = {
          roomType: roomType ?? { id: room.roomTypeId },
          availableCount: 0,
          rooms: [],
        };
      }
      grouped[room.roomTypeId].availableCount += 1;
      grouped[room.roomTypeId].rooms.push({
        id: room.id,
        number: room.number,
        floor: room.floor ?? null,
        status: room.status,
      });
    }
    return Object.values(grouped);
  }

  const match = /^\/mobile-check-in\/([a-zA-Z0-9_-]+)$/.exec(path);
  if (match) {
    const reservation = findMobileCheckInReservation(match[1], lastName);
    return toMobileCheckInView(reservation);
  }
}

function handleMobileCheckInPost(path: string, body: any) {
  const roomMatch = /^\/mobile-check-in\/([a-zA-Z0-9_-]+)\/room$/.exec(path);
  if (roomMatch) {
    const reservation = findMobileCheckInReservation(
      roomMatch[1],
      body?.lastName,
    );
    assertMobileRoomChangeEligible(reservation);

    const room = mockDb.rooms.find((r: any) => r.id === body?.roomId);
    if (!room) {
      throw new APIError(404, 'Not Found', { message: 'Room not found' });
    }
    const roomType = mockDb.roomTypes.find(
      (rt: any) => rt.id === room.roomTypeId,
    );

    const idx = mockDb.reservations.findIndex(
      (r: any) => r.id === reservation.id,
    );
    mockDb.reservations[idx] = {
      ...mockDb.reservations[idx],
      roomId: room.id,
      room: {
        id: room.id,
        number: room.number,
        floor: room.floor ?? null,
        roomType: roomType ?? {},
      },
    };
    return toMobileCheckInView(mockDb.reservations[idx]);
  }

  const checkInMatch = /^\/mobile-check-in\/([a-zA-Z0-9_-]+)\/check-in$/.exec(
    path,
  );
  if (checkInMatch) {
    const reservation = findMobileCheckInReservation(
      checkInMatch[1],
      body?.lastName,
    );
    if (reservation.status !== 'CONFIRMED') {
      throw new APIError(400, 'Bad Request', {
        message: 'Only confirmed reservations can be checked in',
      });
    }

    const idx = mockDb.reservations.findIndex(
      (r: any) => r.id === reservation.id,
    );
    mockDb.reservations[idx].status = 'CHECKED_IN';
    updateReservationRoomStatus(mockDb.reservations[idx], 'OCCUPIED_CLEAN');

    return {
      reservation: toMobileCheckInView(mockDb.reservations[idx]),
      digitalKey: {
        status: 'UNAVAILABLE',
        message:
          'Digital key issuance is not available yet. Please collect a physical key at the front desk.',
      },
    };
  }
}

function handleMobileCheckIn(
  method: string,
  path: string,
  body: any,
  params?: URLSearchParams,
) {
  if (!path.startsWith('/mobile-check-in')) return;
  if (method === 'GET') return handleMobileCheckInGet(path, params);
  if (method === 'POST') return handleMobileCheckInPost(path, body);
}

function handleReservations(
  method: string,
  path: string,
  body: any,
  params?: URLSearchParams,
) {
  if (method === 'GET') return handleReservationsGet(path, params);
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
      () => handlePartnerHotels(method, path, body, params),
      () => handleRates(method, path, body, params),
      () => handleYield(method, path, body, params),
      () => handleBlocks(method, path, body, params),
      () => handleHousekeeping(method, path, body, params),
      () => handleHardwareBridge(method, path, body, params),
      () => handleRegistrationCards(method, path, body, params),
      () => handleWakeUpCalls(method, path, body, params),
      () => handleTm30Reports(method, path, body, params),
      () => handleLostFound(method, path, body, params),
      () => handleGuestMessages(method, path, body, params),
      () => handleGuestFeedback(method, path, body, params),
      () => handleGuestComplaints(method, path, body, params),
      () => handleKiosk(method, path, body),
      () => handleMobileCheckIn(method, path, body, params),
      () => handleFolios(method, path, body, params),
      () => handleProperties(method, path, body),
      () => handleRooms(method, path, body),
      () => handleReservations(method, path, body, params),
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
