import { outstandingOf } from './aging';

export interface StatementInvoiceLine {
  invoiceNumber: string;
  invoiceDate: Date | string;
  dueDate: Date | string;
  amount: unknown;
  paidAmount: unknown;
  status: string;
}

export interface ArStatement {
  accountNumber: string;
  companyName: string;
  asOf: string;
  currentBalance: unknown;
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
  };
  invoices: StatementInvoiceLine[];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function ymd(value: Date | string): string {
  return typeof value === 'string'
    ? value.slice(0, 10)
    : value.toISOString().slice(0, 10);
}

function money(value: unknown): string {
  return Number(value).toFixed(2);
}

export function renderStatementHtml(statement: ArStatement): string {
  const rows = statement.invoices
    .map((invoice) => {
      const open = outstandingOf(invoice.amount, invoice.paidAmount);
      return `<tr><td>${escapeHtml(invoice.invoiceNumber)}</td><td>${ymd(
        invoice.invoiceDate,
      )}</td><td>${ymd(invoice.dueDate)}</td><td>${money(
        invoice.amount,
      )}</td><td>${money(invoice.paidAmount)}</td><td>${money(
        open,
      )}</td><td>${escapeHtml(invoice.status)}</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(
    statement.accountNumber,
  )}</title></head><body><h1>${escapeHtml(
    statement.companyName,
  )}</h1><p>${escapeHtml(statement.accountNumber)} · ${escapeHtml(
    statement.asOf,
  )}</p><p>Balance ${money(statement.currentBalance)}</p><p>Current ${
    statement.aging.current
  } · 30 ${statement.aging.days30} · 60 ${statement.aging.days60} · 90 ${
    statement.aging.days90
  }</p><table><thead><tr><th>Invoice</th><th>Date</th><th>Due</th><th>Amount</th><th>Paid</th><th>Open</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}
