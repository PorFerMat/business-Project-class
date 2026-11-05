import { Tenant, Receipt, RefundRequest, RoomDefinition } from '../types';

export const INITIAL_BUILDINGS = [
  { id: 'Building-A', name: 'Building A (Sky Tower)', floors: [1, 2, 3, 4] },
  { id: 'Building-B', name: 'Building B (Park View)', floors: [1, 2, 3] },
];

export const INITIAL_TENANTS: Tenant[] = [
  // Building A - Floor 1
  {
    id: 't-101',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 234-5678',
    roomNumber: 'A-101',
    building: 'Building-A',
    floor: 1,
    monthlyRent: 1400,
    rentDueDate: 5,
    leaseStart: '2025-08-01',
    leaseEnd: '2027-07-31',
    isArchived: false,
    notes: 'Long-term corporate tenant. Pays via Chase Bank ACH.'
  },
  {
    id: 't-102',
    name: 'Marcus Vance',
    email: 'm.vance@example.com',
    phone: '+1 (555) 345-6789',
    roomNumber: 'A-102',
    building: 'Building-A',
    floor: 1,
    monthlyRent: 1200,
    rentDueDate: 5,
    leaseStart: '2026-01-15',
    leaseEnd: '2027-01-14',
    isArchived: false,
    notes: 'Graphic designer. Uploaded partial payment slip.'
  },
  {
    id: 't-103',
    name: 'Aisha Al-Mansoor',
    email: 'aisha.m@example.com',
    phone: '+1 (555) 456-7890',
    roomNumber: 'A-103',
    building: 'Building-A',
    floor: 1,
    monthlyRent: 1350,
    rentDueDate: 5,
    leaseStart: '2025-11-01',
    leaseEnd: '2026-10-31',
    isArchived: false,
  },
  {
    id: 't-104',
    name: 'Liam O’Connor',
    email: 'liam.oc@example.com',
    phone: '+1 (555) 567-8901',
    roomNumber: 'A-104',
    building: 'Building-A',
    floor: 1,
    monthlyRent: 1250,
    rentDueDate: 5,
    leaseStart: '2026-03-01',
    leaseEnd: '2027-02-28',
    isArchived: false,
  },

  // Building A - Floor 2
  {
    id: 't-201',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 678-9012',
    roomNumber: 'A-201',
    building: 'Building-A',
    floor: 2,
    monthlyRent: 1500,
    rentDueDate: 5,
    leaseStart: '2025-06-01',
    leaseEnd: '2027-05-31',
    isArchived: false,
    notes: 'Accidentally paid $1,750 on wire transfer ($250 overpayment).'
  },
  {
    id: 't-202',
    name: 'Tariq Sterling',
    email: 'tariq.s@example.com',
    phone: '+1 (555) 789-0123',
    roomNumber: 'A-202',
    building: 'Building-A',
    floor: 2,
    monthlyRent: 1450,
    rentDueDate: 5,
    leaseStart: '2026-02-01',
    leaseEnd: '2027-01-31',
    isArchived: false,
  },
  {
    id: 't-203',
    name: 'Chloe Dubois',
    email: 'chloe.dubois@example.com',
    phone: '+1 (555) 890-1234',
    roomNumber: 'A-203',
    building: 'Building-A',
    floor: 2,
    monthlyRent: 1550,
    rentDueDate: 5,
    leaseStart: '2025-09-01',
    leaseEnd: '2026-08-31',
    isArchived: false,
  },
  {
    id: 't-204',
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 (555) 901-2345',
    roomNumber: 'A-204',
    building: 'Building-A',
    floor: 2,
    monthlyRent: 1600,
    rentDueDate: 5,
    leaseStart: '2026-04-01',
    leaseEnd: '2027-03-31',
    isArchived: false,
    notes: 'Slip uploaded has blurred transaction reference code.'
  },

  // Building A - Floor 3
  {
    id: 't-301',
    name: 'Maya Patel',
    email: 'maya.patel@example.com',
    phone: '+1 (555) 012-3456',
    roomNumber: 'A-301',
    building: 'Building-A',
    floor: 3,
    monthlyRent: 1450,
    rentDueDate: 5,
    leaseStart: '2025-10-01',
    leaseEnd: '2026-09-30',
    isArchived: false,
  },
  {
    id: 't-302',
    name: 'Julien Moreau',
    email: 'j.moreau@example.com',
    phone: '+1 (555) 123-4567',
    roomNumber: 'A-302',
    building: 'Building-A',
    floor: 3,
    monthlyRent: 1400,
    rentDueDate: 5,
    leaseStart: '2026-05-01',
    leaseEnd: '2027-04-30',
    isArchived: false,
  },
  {
    id: 't-303',
    name: 'Sofia Ramirez',
    email: 'sofia.r@example.com',
    phone: '+1 (555) 234-9876',
    roomNumber: 'A-303',
    building: 'Building-A',
    floor: 3,
    monthlyRent: 1500,
    rentDueDate: 5,
    leaseStart: '2025-07-01',
    leaseEnd: '2027-06-30',
    isArchived: false,
  },
  {
    id: 't-304',
    name: 'Kenji Takahashi',
    email: 'kenji.t@example.com',
    phone: '+1 (555) 345-0987',
    roomNumber: 'A-304',
    building: 'Building-A',
    floor: 3,
    monthlyRent: 1650,
    rentDueDate: 5,
    leaseStart: '2026-01-01',
    leaseEnd: '2026-12-31',
    isArchived: false,
  },

  // Building B - Floor 1
  {
    id: 't-b101',
    name: 'Amara Okafor',
    email: 'amara.okafor@example.com',
    phone: '+1 (555) 456-1122',
    roomNumber: 'B-101',
    building: 'Building-B',
    floor: 1,
    monthlyRent: 1300,
    rentDueDate: 5,
    leaseStart: '2025-05-01',
    leaseEnd: '2026-04-30',
    isArchived: false,
  },
  {
    id: 't-b102',
    name: 'Lucas Lindqvist',
    email: 'lucas.l@example.com',
    phone: '+1 (555) 567-2233',
    roomNumber: 'B-102',
    building: 'Building-B',
    floor: 1,
    monthlyRent: 1300,
    rentDueDate: 5,
    leaseStart: '2026-02-15',
    leaseEnd: '2027-02-14',
    isArchived: false,
  },

  // Archived Tenants
  {
    id: 't-arch-01',
    name: 'Bradley Cooper-Smith',
    email: 'bradley.cs@example.com',
    phone: '+1 (555) 999-1234',
    roomNumber: 'A-104',
    building: 'Building-A',
    floor: 1,
    monthlyRent: 1200,
    rentDueDate: 5,
    leaseStart: '2024-01-01',
    leaseEnd: '2025-12-31',
    isArchived: true,
    notes: 'Lease completed. Deposit returned.'
  },
  {
    id: 't-arch-02',
    name: 'Naomi Campbell-Perez',
    email: 'naomi.cp@example.com',
    phone: '+1 (555) 888-5678',
    roomNumber: 'B-103',
    building: 'Building-B',
    floor: 1,
    monthlyRent: 1350,
    rentDueDate: 5,
    leaseStart: '2024-06-01',
    leaseEnd: '2025-05-31',
    isArchived: true,
    notes: 'Relocated out of state.'
  }
];

export const ALL_ROOM_NUMBERS: RoomDefinition[] = [
  // Building A
  { roomNumber: 'A-101', building: 'Building-A', floor: 1 },
  { roomNumber: 'A-102', building: 'Building-A', floor: 1 },
  { roomNumber: 'A-103', building: 'Building-A', floor: 1 },
  { roomNumber: 'A-104', building: 'Building-A', floor: 1 },
  { roomNumber: 'A-201', building: 'Building-A', floor: 2 },
  { roomNumber: 'A-202', building: 'Building-A', floor: 2 },
  { roomNumber: 'A-203', building: 'Building-A', floor: 2 },
  { roomNumber: 'A-204', building: 'Building-A', floor: 2 },
  { roomNumber: 'A-301', building: 'Building-A', floor: 3 },
  { roomNumber: 'A-302', building: 'Building-A', floor: 3 },
  { roomNumber: 'A-303', building: 'Building-A', floor: 3 },
  { roomNumber: 'A-304', building: 'Building-A', floor: 3 },
  { roomNumber: 'A-401', building: 'Building-A', floor: 4 }, // Vacant
  { roomNumber: 'A-402', building: 'Building-A', floor: 4 }, // Vacant

  // Building B
  { roomNumber: 'B-101', building: 'Building-B', floor: 1 },
  { roomNumber: 'B-102', building: 'Building-B', floor: 1 },
  { roomNumber: 'B-103', building: 'Building-B', floor: 1 }, // Vacant
  { roomNumber: 'B-201', building: 'Building-B', floor: 2 }, // Vacant
  { roomNumber: 'B-202', building: 'Building-B', floor: 2 }, // Vacant
];

export const INITIAL_RECEIPTS: Receipt[] = [
  // 1. Elena Rostova - Perfect Match (JPG Scanned Receipt)
  {
    id: 'rcpt-001',
    tenantId: 't-101',
    roomNumber: 'A-101',
    billingMonth: '2026-11',
    fileName: 'bank_transfer_slip_nov26_elena.jpg',
    fileFormat: 'JPG',
    fileSizeKb: 482,
    uploadedAt: '2026-11-03T10:14:00Z',
    uploadedBy: 'Elena Rostova (Tenant Portal)',
    rentDueAmount: 1400,
    paidAmount: 1400,
    verificationStatus: 'verified',
    verifiedAt: '2026-11-03T11:20:00Z',
    verifiedBy: 'Staff: James Ward',
    ocrData: {
      detectedAmount: 1400,
      currency: 'USD',
      detectedDate: '2026-11-03',
      transactionRef: 'TXN-9842104-CHASE',
      payerName: 'Elena Rostova',
      bankName: 'JPMorgan Chase Bank, N.A.',
      confidenceScore: 99.2,
      engine: 'Tesseract OCR 5.3',
      rawSnippet: 'ELECTRONIC FUNDS TRANSFER CONFIRMATION\nDATE: 03-NOV-2026 09:42:15 EST\nFROM ACCOUNT: ****-7182 (ELENA ROSTOVA)\nBENEFICIARY: SILA PROPERTY ASSET MGMT LLC\nAMOUNT: $1,400.00 USD\nREFERENCE: TXN-9842104-CHASE\nMEMO: RENT NOV 2026 UNIT A-101\nSTATUS: CLEARED / POSTED',
      boundingHighlights: [
        { label: 'Amount', value: '$1,400.00', box: { top: 48, left: 24, width: 38, height: 8 } },
        { label: 'Reference', value: 'TXN-9842104-CHASE', box: { top: 58, left: 24, width: 44, height: 6 } },
        { label: 'Payer', value: 'Elena Rostova', box: { top: 32, left: 24, width: 36, height: 6 } },
        { label: 'Date', value: '03-NOV-2026', box: { top: 22, left: 24, width: 28, height: 5 } },
      ]
    }
  },

  // 2. Marcus Vance - Insufficient Payment (Blocked) (Scanned PDF)
  {
    id: 'rcpt-002',
    tenantId: 't-102',
    roomNumber: 'A-102',
    billingMonth: '2026-11',
    fileName: 'citi_wire_slip_nov_mvance.pdf',
    fileFormat: 'PDF_SCANNED',
    fileSizeKb: 1240,
    uploadedAt: '2026-11-04T08:30:00Z',
    uploadedBy: 'Staff: Marcus Vance (front desk upload)',
    rentDueAmount: 1200,
    paidAmount: 950,
    verificationStatus: 'insufficient_blocked',
    blockedReason: 'Extracted amount $950.00 is $250.00 less than outstanding rent balance ($1,200.00). System policy blocks verification of insufficient payments.',
    ocrData: {
      detectedAmount: 950,
      currency: 'USD',
      detectedDate: '2026-11-04',
      transactionRef: 'CITI-WIRE-881903',
      payerName: 'Marcus Vance',
      bankName: 'Citibank Commercial NA',
      confidenceScore: 97.8,
      engine: 'Tesseract OCR 5.3',
      rawSnippet: 'CITIBANK WIRE RECEIPT\nWIRE ID: CITI-WIRE-881903\nDATE: 04/11/2026\nREMITTER: MARCUS VANCE\nCREDIT TO: SILA APARTMENTS ESCROW\nTRANSFERRED AMOUNT: $950.00 USD\nCOMMISSION: $0.00\nMEMO: PARTIAL RENT - A102 NOV BALANCE\nVERIFICATION INCOMPLETE: REMAINING SHORTFALL $250.00',
      boundingHighlights: [
        { label: 'Amount', value: '$950.00', box: { top: 46, left: 20, width: 34, height: 8 } },
        { label: 'Reference', value: 'CITI-WIRE-881903', box: { top: 20, left: 20, width: 42, height: 6 } },
        { label: 'Remitter', value: 'Marcus Vance', box: { top: 32, left: 20, width: 32, height: 6 } },
      ]
    }
  },

  // 3. Sarah Jenkins - Overpayment (Surplus $250) (PNG Receipt)
  {
    id: 'rcpt-003',
    tenantId: 't-201',
    roomNumber: 'A-201',
    billingMonth: '2026-11',
    fileName: 'wells_fargo_mobile_receipt.png',
    fileFormat: 'PNG',
    fileSizeKb: 630,
    uploadedAt: '2026-11-02T14:15:00Z',
    uploadedBy: 'Sarah Jenkins',
    rentDueAmount: 1500,
    paidAmount: 1750,
    verificationStatus: 'overpayment_pending',
    refundRequestId: 'REF-2026-001',
    ocrData: {
      detectedAmount: 1750,
      currency: 'USD',
      detectedDate: '2026-11-02',
      transactionRef: 'WF-CONF-3419082',
      payerName: 'Sarah Jenkins',
      bankName: 'Wells Fargo Mobile Transfer',
      confidenceScore: 98.9,
      engine: 'Tesseract OCR 5.3',
      rawSnippet: 'WELLS FARGO BILL PAY CONFIRMATION\nCONFIRMATION NUMBER: WF-CONF-3419082\nDELIVERED: NOV 02, 2026\nFROM: PLATINUM CHECKING (...4091)\nTO: SILA PROPERTIES INC\nAMOUNT: $1,750.00 USD\nMONTHLY RENT: $1,500.00\nOVERPAYMENT SURPLUS DETECTED: +$250.00\nAUTOMATIC REFUND REQUEST TRIGGERED',
      boundingHighlights: [
        { label: 'Amount', value: '$1,750.00', box: { top: 50, left: 22, width: 38, height: 8 } },
        { label: 'Reference', value: 'WF-CONF-3419082', box: { top: 24, left: 22, width: 45, height: 6 } },
        { label: 'Payer', value: 'Sarah Jenkins', box: { top: 38, left: 22, width: 30, height: 5 } },
      ]
    }
  },

  // 4. Aisha Al-Mansoor - Exact Match Verified (PDF Text)
  {
    id: 'rcpt-004',
    tenantId: 't-103',
    roomNumber: 'A-103',
    billingMonth: '2026-11',
    fileName: 'ach_direct_debit_aisha.pdf',
    fileFormat: 'PDF_TEXT',
    fileSizeKb: 195,
    uploadedAt: '2026-11-01T09:00:00Z',
    uploadedBy: 'Automated ACH Importer',
    rentDueAmount: 1350,
    paidAmount: 1350,
    verificationStatus: 'verified',
    verifiedAt: '2026-11-01T09:05:00Z',
    verifiedBy: 'Auto-Verification Engine',
    ocrData: {
      detectedAmount: 1350,
      currency: 'USD',
      detectedDate: '2026-11-01',
      transactionRef: 'NACHA-ACH-20261101-77',
      payerName: 'Aisha Al-Mansoor',
      bankName: 'Bank of America',
      confidenceScore: 100.0,
      engine: 'Python pypdf / openpyxl',
      rawSnippet: 'FEDERAL RESERVE ACH SETTLEMENT STATEMENT\nTRACE: 0710002882910\nEFFECTIVE ENTRY DATE: 2026-11-01\nORIGINATOR: SILA PROPERTY MANAGEMENT\nRECEIVER: AISHA AL-MANSOOR\nSETTLED AMOUNT: $1,350.00\nSEC CODE: PPD\nSTATUS: 00 SUCCESSFUL SETTLEMENT',
      boundingHighlights: [
        { label: 'Amount', value: '$1,350.00', box: { top: 44, left: 18, width: 32, height: 7 } },
        { label: 'Trace No', value: '0710002882910', box: { top: 22, left: 18, width: 36, height: 5 } }
      ]
    }
  },

  // 5. David Chen - Discrepancy (Uploaded XLSX Bank Export with unclear matching)
  {
    id: 'rcpt-005',
    tenantId: 't-204',
    roomNumber: 'A-204',
    billingMonth: '2026-11',
    fileName: 'tenant_batch_ledger_nov.xlsx',
    fileFormat: 'XLSX',
    fileSizeKb: 88,
    uploadedAt: '2026-11-04T16:20:00Z',
    uploadedBy: 'Staff: Accounting Desk',
    rentDueAmount: 1600,
    paidAmount: 1600,
    verificationStatus: 'discrepancy',
    blockedReason: 'Payer name on transaction sheet ("Chen Holdings Trust") does not match tenant record ("David Chen"). Staff manual override required.',
    ocrData: {
      detectedAmount: 1600,
      currency: 'USD',
      detectedDate: '2026-11-04',
      transactionRef: 'XLS-ROW-142-BOA',
      payerName: 'Chen Holdings Trust',
      bankName: 'Bank of America Merchant File',
      confidenceScore: 92.4,
      engine: 'Python pypdf / openpyxl',
      rawSnippet: 'SPREADSHEET ROW #142 (Parsed via openpyxl 3.1.2):\nCol A (Date): 2026-11-04\nCol B (Entity): Chen Holdings Trust\nCol C (Ref): BOA-CH-994102\nCol D (Unit Ref): A204-RENT-NOV\nCol E (Amount): 1600.00\nCol F (Status): Cleared\nFlag: Third-party entity name mismatch.',
      boundingHighlights: [
        { label: 'Amount', value: '$1,600.00', box: { top: 52, left: 15, width: 30, height: 7 } },
        { label: 'Entity', value: 'Chen Holdings Trust', box: { top: 30, left: 15, width: 45, height: 6 } }
      ]
    }
  },

  // 6. Tariq Sterling - Exact Match Pending Verification (Text TXT File Bank Dump)
  {
    id: 'rcpt-006',
    tenantId: 't-202',
    roomNumber: 'A-202',
    billingMonth: '2026-11',
    fileName: 'wire_statement_tariq.txt',
    fileFormat: 'TXT',
    fileSizeKb: 14,
    uploadedAt: '2026-11-05T02:10:00Z',
    uploadedBy: 'Tariq Sterling',
    rentDueAmount: 1450,
    paidAmount: 1450,
    verificationStatus: 'pending_review',
    ocrData: {
      detectedAmount: 1450,
      currency: 'USD',
      detectedDate: '2026-11-04',
      transactionRef: 'SWIFT-WIRE-0921820',
      payerName: 'Tariq Sterling',
      bankName: 'Barclays US Branch',
      confidenceScore: 99.8,
      engine: 'Python text parser',
      rawSnippet: '-----------------------------------------\nWIRE ADVICE NOTIFICATION\n-----------------------------------------\nORIGINATOR: TARIQ STERLING\nBENEFICIARY: SILA APARTMENTS ESCROW ACCOUNT\nVALUE DATE: 04-NOV-2026\nTRANSFER SUM: USD 1,450.00\nREFERENCE: SWIFT-WIRE-0921820\nDETAILS: NOVEMBER 2026 RENT APT A-202\n-----------------------------------------',
      boundingHighlights: [
        { label: 'Transfer Sum', value: '$1,450.00', box: { top: 52, left: 25, width: 40, height: 7 } },
        { label: 'Reference', value: 'SWIFT-WIRE-0921820', box: { top: 62, left: 25, width: 42, height: 6 } }
      ]
    }
  },

  // 7. Amara Okafor - Fully Paid
  {
    id: 'rcpt-007',
    tenantId: 't-b101',
    roomNumber: 'B-101',
    billingMonth: '2026-11',
    fileName: 'zelle_confirmation_amara.png',
    fileFormat: 'PNG',
    fileSizeKb: 340,
    uploadedAt: '2026-11-02T18:00:00Z',
    uploadedBy: 'Amara Okafor',
    rentDueAmount: 1300,
    paidAmount: 1300,
    verificationStatus: 'verified',
    verifiedAt: '2026-11-02T19:30:00Z',
    verifiedBy: 'Staff: James Ward',
    ocrData: {
      detectedAmount: 1300,
      currency: 'USD',
      detectedDate: '2026-11-02',
      transactionRef: 'ZELLE-CONF-88201',
      payerName: 'Amara Okafor',
      bankName: 'Capital One Zelle',
      confidenceScore: 99.1,
      engine: 'Tesseract OCR 5.3',
      rawSnippet: 'ZELLE TRANSFER COMPLETE\nTO: SILA RESIDENTIAL\nFROM: AMARA OKAFOR\nAMOUNT: $1,300.00\nCONFIRMATION: ZELLE-CONF-88201\nDATE: NOV 2, 2026',
      boundingHighlights: [
        { label: 'Amount', value: '$1,300.00', box: { top: 40, left: 20, width: 36, height: 8 } }
      ]
    }
  }
];

export const INITIAL_REFUNDS: RefundRequest[] = [
  {
    id: 'REF-2026-001',
    receiptId: 'rcpt-003',
    tenantId: 't-201',
    tenantName: 'Sarah Jenkins',
    roomNumber: 'A-201',
    billingMonth: '2026-11',
    overpaymentAmount: 250,
    rentDueAmount: 1500,
    totalPaidAmount: 1750,
    status: 'pending_review',
    createdAt: '2026-11-02T14:16:00Z',
    staffNotes: 'Tenant mistakenly input $1,750 on auto-bill. Overpayment surplus of $250 needs reimbursement to primary checking or credit to next billing cycle.',
  },
  {
    id: 'REF-2026-002',
    receiptId: 'rcpt-prev-99',
    tenantId: 't-101',
    tenantName: 'Elena Rostova',
    roomNumber: 'A-101',
    billingMonth: '2026-10',
    overpaymentAmount: 200,
    rentDueAmount: 1400,
    totalPaidAmount: 1600,
    status: 'refunded',
    createdAt: '2026-10-04T12:00:00Z',
    resolvedAt: '2026-10-06T15:30:00Z',
    refundMethod: 'Bank ACH Wire',
    externalRefId: 'ACH-REV-902188',
    staffNotes: 'Refund dispatched through Chase Commercial Treasury Portal.',
    processedBy: 'James Ward'
  }
];
