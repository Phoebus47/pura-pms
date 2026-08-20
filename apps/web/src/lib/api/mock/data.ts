/* eslint-disable @typescript-eslint/no-explicit-any */
const MOCK_NOW = new Date().toISOString();

export interface MockData {
  users: any[];
  properties: any[];
  roomTypes: any[];
  rooms: any[];
  guests: any[];
  reservations: any[];
  folios: any[];
  folioWindows: any[];
  transactionCodes: any[];
  folioTransactions: any[];
  shifts: any[];
  taxInvoices: any[];
  journalEntries: any[];
  arAccounts: any[];
  invoices: any[];
  invoicePayments: any[];
  cardPreauths: any[];
  roomMoves: any[];
  partnerHotels: any[];
  rates: any[];
  competitorRates: any[];
  yieldRecommendations: any[];
  roomBlocks: any[];
  housekeepingInspections: any[];
  hardwareAgents: any[];
  hardwareDevices: any[];
  hardwareJobs: any[];
  registrationCards: any[];
  wakeUpCalls: any[];
  tm30Reports: any[];
  lostFoundItems: any[];
  guestMessages: any[];
  walks: any[];
}

export const mockDb: any = {
  users: [
    {
      id: 'usr_mock_1',
      email: 'admin@pura.com',
      password: 'admin123', // NOSONAR: Intentional mock data password for demo
      firstName: 'Mock',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
    {
      id: 'usr_mock_2',
      email: 'cashier@pura.com',
      password: 'cashier123', // NOSONAR: Intentional mock data password for demo
      firstName: 'Mock',
      lastName: 'Cashier',
      role: 'CASHIER',
      isActive: true,
    },
  ],
  properties: [
    {
      id: 'prop_mock_1',
      name: 'Pura Resort & Spa (Demo)',
      address: '123 Beachfront Dr, Mock City',
      phone: '+66 2 123 4567',
      email: 'hello@pura-demo.com',
      taxId: '1234567890123',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
      businessDate: MOCK_NOW,
      createdAt: MOCK_NOW,
      _count: { rooms: 15, roomTypes: 3 },
      defaultCreditLimit: 50000,
    },
  ],
  roomTypes: [
    {
      id: 'rt_mock_1',
      propertyId: 'prop_mock_1',
      name: 'Deluxe Ocean View',
      description: 'Beautiful ocean view',
      basePrice: 4500,
      maxOccupancy: 2,
    },
    {
      id: 'rt_mock_2',
      propertyId: 'prop_mock_1',
      name: 'Pool Villa',
      description: 'Private pool villa',
      basePrice: 8500,
      maxOccupancy: 3,
    },
    {
      id: 'rt_mock_3',
      propertyId: 'prop_mock_1',
      name: 'Standard Garden',
      description: 'Cozy garden view',
      basePrice: 2500,
      maxOccupancy: 2,
    },
  ],
  rooms: [
    {
      id: 'rm_mock_1',
      propertyId: 'prop_mock_1',
      roomTypeId: 'rt_mock_1',
      number: '101',
      status: 'VACANT_CLEAN',
      hkStage: 'READY',
      guestRequest: 'NONE',
      condition: 'CLEAN',
    },
    {
      id: 'rm_mock_2',
      propertyId: 'prop_mock_1',
      roomTypeId: 'rt_mock_1',
      number: '102',
      status: 'OCCUPIED_CLEAN',
      hkStage: 'CLEAN',
      guestRequest: 'NONE',
      condition: 'DIRTY',
    },
    {
      id: 'rm_mock_3',
      propertyId: 'prop_mock_1',
      roomTypeId: 'rt_mock_2',
      number: '201',
      status: 'VACANT_DIRTY',
      hkStage: 'DIRTY',
      guestRequest: 'NONE',
      condition: 'DIRTY',
    },
  ],
  guests: [
    {
      id: 'gst_mock_1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+123456789',
      nationality: 'US',
      idNumber: 'P123456',
      isBlacklisted: false,
    },
    {
      id: 'gst_mock_2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+987654321',
      nationality: 'UK',
      isBlacklisted: false,
    },
  ],
  reservations: [
    {
      id: 'res_mock_1',
      confirmNumber: 'CN-DEMO-001',
      propertyId: 'prop_mock_1',
      guestId: 'gst_mock_1',
      roomId: 'rm_mock_2', // Occupied room
      checkIn: new Date(Date.now() - 86400000).toISOString(),
      checkOut: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'CHECKED_IN',
      adults: 2,
      children: 0,
      roomRate: 4500,
      totalAmount: 13500,
      createdAt: new Date().toISOString(),
      guest: {
        id: 'gst_mock_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      room: {
        id: 'rm_mock_2',
        number: '102',
        roomType: { name: 'Deluxe Ocean View' },
      },
      stays: [],
    },
    {
      id: 'res_mock_2',
      confirmNumber: 'CN-DEMO-002',
      propertyId: 'prop_mock_1',
      guestId: 'gst_mock_2',
      roomId: null,
      checkIn: new Date(Date.now() + 86400000 * 5).toISOString(),
      checkOut: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'CONFIRMED',
      adults: 2,
      children: 1,
      roomRate: 8500,
      totalAmount: 17000,
      createdAt: new Date().toISOString(),
      guest: {
        id: 'gst_mock_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
      room: null,
    },
    {
      id: 'res_mock_comp',
      confirmNumber: 'CN-DEMO-COMP',
      propertyId: 'prop_mock_1',
      guestId: 'gst_mock_1',
      roomId: 'rm_mock_1',
      checkIn: new Date().toISOString(),
      checkOut: new Date(Date.now() + 86400000).toISOString(),
      status: 'CHECKED_IN',
      adults: 1,
      children: 0,
      nights: 1,
      roomRate: 0,
      totalAmount: 0,
      stayPurpose: 'COMPLIMENTARY',
      approvedBy: 'GM',
      stayPurposeNote: 'Press',
      rateCode: 'COMP',
      createdAt: new Date().toISOString(),
      guest: {
        id: 'gst_mock_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      room: {
        id: 'rm_mock_1',
        number: '101',
        roomType: { name: 'Deluxe Ocean View', baseRate: 4500 },
      },
      stays: [],
    },
  ],
  transactionCodes: [
    {
      id: 'tc_room',
      code: '1000',
      description: 'Room Charge',
      type: 'CHARGE',
      group: 'ROOM',
      hasTax: true,
      hasService: true,
      taxRate: 7,
      serviceRate: 10,
    },
    {
      id: 'tc_no_show',
      code: '1006',
      description: 'No-Show Charge',
      type: 'CHARGE',
      group: 'ROOM',
      hasTax: true,
      hasService: true,
      taxRate: 7,
      serviceRate: 10,
    },
    {
      id: 'tc_fnb',
      code: '2000',
      description: 'Restaurant Food',
      type: 'CHARGE',
      group: 'FNB',
      hasTax: true,
      hasService: true,
      taxRate: 7,
      serviceRate: 10,
    },
    {
      id: 'tc_spa',
      code: '3000',
      description: 'Spa Service',
      type: 'CHARGE',
      group: 'SPA',
      hasTax: true,
      hasService: true,
      taxRate: 7,
      serviceRate: 10,
    },
    {
      id: 'tc_cash',
      code: '8000',
      description: 'Cash Payment',
      type: 'PAYMENT',
      group: 'PAYMENT',
      hasTax: false,
      hasService: false,
    },
    {
      id: 'tc_visa',
      code: '8001',
      description: 'Visa Payment',
      type: 'PAYMENT',
      group: 'PAYMENT',
      hasTax: false,
      hasService: false,
    },
    {
      id: 'tc_cash_9000',
      code: '9000',
      description: 'Cash Payment',
      type: 'PAYMENT',
      group: 'PAYMENT',
      hasTax: false,
      hasService: false,
    },
    {
      id: 'tc_city_9005',
      code: '9005',
      description: 'Direct Bill',
      type: 'PAYMENT',
      group: 'PAYMENT',
      hasTax: false,
      hasService: false,
    },
    {
      id: 'tc_card_9001',
      code: '9001',
      description: 'Credit Card Payment',
      type: 'PAYMENT',
      group: 'PAYMENT',
      hasTax: false,
      hasService: false,
    },
  ],
  folios: [
    {
      id: 'fol_mock_1',
      reservationId: 'res_mock_1',
      folioNumber: 'F000001',
      type: 'GUEST',
      status: 'OPEN',
      balance: 1572.5, // Total + VAT
      creditLimit: null,
      createdAt: new Date().toISOString(),
      businessDate: new Date().toISOString(),
      reservation: {
        guest: { firstName: 'John', lastName: 'Doe' },
        room: { number: '102' },
      },
    },
  ],
  folioWindows: [
    {
      id: 'fw_mock_1',
      folioId: 'fol_mock_1',
      windowNumber: 1,
      balance: 1572.5,
      routingCriteria: {},
    },
    {
      id: 'fw_mock_2',
      folioId: 'fol_mock_1',
      windowNumber: 2,
      balance: 0,
      routingCriteria: {},
    },
    {
      id: 'fw_mock_3',
      folioId: 'fol_mock_1',
      windowNumber: 3,
      balance: 0,
      routingCriteria: {},
    },
    {
      id: 'fw_mock_4',
      folioId: 'fol_mock_1',
      windowNumber: 4,
      balance: 0,
      routingCriteria: {},
    },
  ],
  folioTransactions: [
    {
      id: 'ft_mock_1',
      windowId: 'fw_mock_1',
      trxCodeId: 'tc_fnb',
      amountNet: 1000,
      amountService: 100,
      amountTax: 77, // 7% of 1100
      amountTotal: 1177,
      sign: 1,
      reference: 'Dinner at Beach Club',
      userId: 'usr_mock_1',
      createdAt: new Date().toISOString(),
      isVoid: false,
    },
    {
      id: 'ft_mock_2',
      windowId: 'fw_mock_1',
      trxCodeId: 'tc_spa',
      amountNet: 1500,
      amountService: 150,
      amountTax: 115.5,
      amountTotal: 1765.5,
      sign: 1,
      reference: 'Massage 60m',
      userId: 'usr_mock_1',
      createdAt: new Date().toISOString(),
      isVoid: false,
    },
    {
      id: 'ft_mock_3',
      windowId: 'fw_mock_1',
      trxCodeId: 'tc_visa',
      amountNet: 1370,
      amountService: 0,
      amountTax: 0,
      amountTotal: 1370,
      sign: -1,
      reference: 'Visa 1234',
      userId: 'usr_mock_1',
      createdAt: new Date().toISOString(),
      isVoid: false,
    },
  ],
  reasonCodes: [
    {
      id: 'reason-1',
      code: 'VOID',
      description: 'Void transaction',
      category: 'VOID',
      isActive: true,
    },
    {
      id: 'reason-2',
      code: 'ADJ',
      description: 'Adjustment',
      category: 'ADJUSTMENT',
      isActive: true,
    },
  ],
  nightAudits: [],
  reportArchives: [],
  auditErrors: [],
  shifts: [
    {
      id: 'sh_mock_1',
      shiftNumber: `SH-${MOCK_NOW.slice(0, 10).replaceAll('-', '')}-mock-1`,
      userId: 'usr_mock_1',
      propertyId: 'prop_mock_1',
      businessDate: MOCK_NOW,
      startTime: MOCK_NOW,
      endTime: null,
      openingCash: 0,
      closingCash: null,
      expectedCash: 0,
      cashVariance: null,
      status: 'OPEN',
      closedBy: null,
      managerApprovedBy: null,
      managerApprovedAt: null,
      varianceReason: null,
      handoverToUserId: null,
      handoverFromShiftId: null,
      notes: null,
    },
  ],
  exchangeRates: [
    {
      id: 'fx_mock_1',
      baseCurrency: 'THB',
      targetCurrency: 'USD',
      rate: 35,
      effectiveDate: '2020-01-01',
      isActive: true,
      createdAt: MOCK_NOW,
    },
  ],
  taxInvoices: [],
  journalEntries: [],
  arAccounts: [],
  invoices: [],
  invoicePayments: [],
  cardPreauths: [],
  roomMoves: [],
  partnerHotels: [],
  rates: [],
  competitorRates: [],
  yieldRecommendations: [],
  roomBlocks: [],
  housekeepingInspections: [],
  hardwareAgents: [],
  hardwareDevices: [],
  hardwareJobs: [],
  registrationCards: [],
  wakeUpCalls: [],
  tm30Reports: [],
  lostFoundItems: [],
  guestMessages: [],
  walks: [],
};
