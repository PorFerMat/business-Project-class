export type PaymentStatus = 'fully_paid' | 'unpaid' | 'insufficient' | 'overpaid' | 'vacant';

export type ReceiptFileFormat = 'JPG' | 'PNG' | 'PDF_SCANNED' | 'PDF_TEXT' | 'TXT' | 'XLSX' | 'XLS';

export interface RoomDefinition {
  roomNumber: string;
  building: string;
  floor: number;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  building: string;
  floor: number;
  monthlyRent: number;
  rentDueDate: number; // day of month (e.g. 5 = 5th)
  leaseStart: string;
  leaseEnd: string;
  isArchived: boolean;
  notes?: string;
}

export interface OcrExtractedData {
  detectedAmount: number;
  currency: string;
  detectedDate: string;
  transactionRef: string;
  payerName: string;
  bankName: string;
  confidenceScore: number; // e.g. 98.5%
  engine: 'Tesseract OCR 5.3' | 'Python pypdf / openpyxl' | 'Python text parser';
  rawSnippet: string;
  boundingHighlights: {
    label: string;
    value: string;
    box: { top: number; left: number; width: number; height: number }; // percentages
  }[];
}

export type ReceiptVerificationStatus = 'verified' | 'insufficient_blocked' | 'overpayment_pending' | 'pending_review' | 'discrepancy';

export interface Receipt {
  id: string;
  tenantId: string;
  roomNumber: string;
  billingMonth: string; // e.g. "2026-11"
  fileName: string;
  fileFormat: ReceiptFileFormat;
  fileSizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
  ocrData: OcrExtractedData;
  rentDueAmount: number;
  paidAmount: number;
  verificationStatus: ReceiptVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  blockedReason?: string;
  refundRequestId?: string;
  previewUrl?: string;
}

export type RefundStatus = 'pending_review' | 'processing' | 'refunded' | 'voided';
export type RefundMethod = 'Bank ACH Wire' | 'Direct Card Reversal' | 'Company Check' | 'Cash Receipt';

export interface RefundRequest {
  id: string;
  receiptId: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  billingMonth: string;
  overpaymentAmount: number;
  rentDueAmount: number;
  totalPaidAmount: number;
  status: RefundStatus;
  createdAt: string;
  resolvedAt?: string;
  refundMethod?: RefundMethod;
  externalRefId?: string;
  staffNotes?: string;
  processedBy?: string;
}

export interface RoomBillingState {
  roomNumber: string;
  building: string;
  floor: number;
  tenant?: Tenant;
  status: PaymentStatus;
  expectedRent: number;
  verifiedPayment: number;
  balanceDue: number;
  surplusAmount: number;
  receipt?: Receipt;
}

export interface AuditSummary {
  billingMonth: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  fullyPaidRooms: number;
  unpaidRooms: number;
  insufficientRooms: number;
  overpaidRooms: number;
  expectedRentTotal: number;
  verifiedPaymentsTotal: number;
  outstandingBalanceTotal: number;
  pendingRefundsTotal: number;
  pendingRefundCount: number;
  discrepanciesCount: number;
}
