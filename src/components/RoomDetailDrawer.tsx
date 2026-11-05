import React from 'react';
import { 
  X, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ExternalLink,
  Phone,
  Mail,
  Upload
} from 'lucide-react';
import { Tenant, Receipt } from '../types';

interface RoomDetailDrawerProps {
  roomNumber: string;
  tenant?: Tenant;
  receipt?: Receipt;
  selectedMonth: string;
  onClose: () => void;
  onNavigateToOcr: (receiptId: string) => void;
  onOpenUploadForRoom: (roomNumber: string) => void;
}

export const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({
  roomNumber,
  tenant,
  receipt,
  selectedMonth,
  onClose,
  onNavigateToOcr,
  onOpenUploadForRoom,
}) => {
  const isOccupied = !!tenant;
  const expectedRent = tenant?.monthlyRent || 0;
  const paidAmount = receipt ? receipt.ocrData.detectedAmount : 0;
  const isVerified = receipt?.verificationStatus === 'verified';
  const balanceDue = isOccupied ? Math.max(0, expectedRent - (isVerified ? paidAmount : 0)) : 0;
  const surplus = receipt ? Math.max(0, paidAmount - expectedRent) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-slate-900">
                Room {roomNumber}
              </span>
              <span className="text-xs text-slate-500">
                · {roomNumber.startsWith('A') ? 'Sky Tower A' : 'Park View B'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Billing Month: {selectedMonth}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Tenant Information */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 tracking-wider">
              TENANT PROFILE
            </div>

            {isOccupied ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{tenant.name}</h4>
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Active Lease
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Due Date: {tenant.rentDueDate}th of each month</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <span>Lease: {tenant.leaseStart} to {tenant.leaseEnd}</span>
                  </div>
                </div>

                {tenant.notes && (
                  <div className="p-2.5 rounded bg-slate-50 text-slate-600 text-[11px] border border-slate-100">
                    {tenant.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 bg-slate-50">
                <p className="font-medium text-slate-700">Room is currently Vacant</p>
                <p className="text-[11px] text-slate-400 mt-1">No active tenant or contracted rent assigned.</p>
              </div>
            )}
          </div>

          {/* Section 2: Month Billing Reconciliation */}
          {isOccupied && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 tracking-wider">
                RENT & PAYMENT RECONCILIATION
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs font-mono">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Contract Monthly Rent</span>
                  <span className="font-semibold text-slate-900">${expectedRent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Extracted Receipt Payment</span>
                  <span className="font-semibold text-slate-900">${paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold">
                  <span>Outstanding Balance Due</span>
                  <span className={balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    ${balanceDue.toFixed(2)}
                  </span>
                </div>
                {surplus > 0 && (
                  <div className="flex justify-between items-center text-indigo-700 font-bold">
                    <span>Overpayment Surplus</span>
                    <span>+${surplus.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Attached Payment Receipt & OCR Details */}
          {isOccupied && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 tracking-wider">
                MONTHLY PAYMENT RECEIPT
              </div>

              {receipt ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {receipt.fileName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {receipt.fileFormat} · {receipt.fileSizeKb} KB
                      </div>
                    </div>

                    <span className="text-[11px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {receipt.ocrData.engine}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Extracted Amount</span>
                      <span className="font-bold text-slate-900">${receipt.ocrData.detectedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction Ref</span>
                      <span className="text-slate-800">{receipt.ocrData.transactionRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">OCR Confidence</span>
                      <span className="text-emerald-700 font-bold">{receipt.ocrData.confidenceScore}%</span>
                    </div>
                  </div>

                  {receipt.verificationStatus === 'insufficient_blocked' && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px]">
                      Verification blocked: payment is less than rent balance.
                    </div>
                  )}

                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToOcr(receipt.id);
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Inspect Slip in OCR Engine
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50 space-y-3">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                  <div>
                    <p className="font-medium text-slate-700">No Receipt Attached</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload bank wire slip, check scan, or XLSX statement.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUploadForRoom(roomNumber);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Receipt for Room {roomNumber}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
