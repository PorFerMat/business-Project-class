import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Search, 
  DollarSign, 
  FileCheck, 
  AlertCircle,
  ExternalLink,
  CreditCard,
  Building2,
  Calendar,
  Check
} from 'lucide-react';
import { RefundRequest, RefundMethod } from '../types';

interface RefundManagementProps {
  refunds: RefundRequest[];
  onRecordRefund: (
    refundId: string, 
    method: RefundMethod, 
    externalRef: string, 
    notes: string
  ) => void;
  onNavigateToOcr: (receiptId: string) => void;
}

export const RefundManagement: React.FC<RefundManagementProps> = ({
  refunds,
  onRecordRefund,
  onNavigateToOcr,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRefundForModal, setActiveRefundForModal] = useState<RefundRequest | null>(null);

  // Filter list
  const filteredRefunds = refunds.filter((rf) => {
    if (filterStatus !== 'all' && rf.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rf.tenantName.toLowerCase().includes(q) ||
        rf.roomNumber.toLowerCase().includes(q) ||
        rf.id.toLowerCase().includes(q) ||
        (rf.externalRefId && rf.externalRefId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate totals
  const pendingRefunds = refunds.filter((r) => r.status === 'pending_review' || r.status === 'processing');
  const pendingAmount = pendingRefunds.reduce((sum, r) => sum + r.overpaymentAmount, 0);

  const completedRefunds = refunds.filter((r) => r.status === 'refunded');
  const completedAmount = completedRefunds.reduce((sum, r) => sum + r.overpaymentAmount, 0);

  const totalOverpayment = refunds.reduce((sum, r) => sum + r.overpaymentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Refund Management & Overpayments
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Automated Overpayment Queue</span>
            <span aria-hidden="true">·</span>
            <span>External Banking Settlement Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Escrow Ledger Audited</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status Filter:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({refunds.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending_review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'pending_review'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              Pending Action ({pendingRefunds.length})
            </button>
            <button
              onClick={() => setFilterStatus('refunded')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === 'refunded'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-900'
              }`}
            >
              Settled ({completedRefunds.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Overpayments Tracked</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              ${totalOverpayment.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">({refunds.length} total)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Triggered automatically when receipt payment &gt; rent due
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-700 font-semibold">Pending External Refund</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-800 font-mono tabular-nums">
              ${pendingAmount.toFixed(2)}
            </span>
            <span className="text-xs text-amber-700">({pendingRefunds.length} pending)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting external wire/check disbursement by accounting
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-emerald-700 font-semibold">Completed External Refunds</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-800 font-mono tabular-nums">
              ${completedAmount.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-700">({completedRefunds.length} settled)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Reconciled with external transaction confirmation IDs
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Overpayment Settlement Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record external wire, check, or reversal references to close open liabilities
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tenant, unit, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Refund ID</th>
                <th className="py-2.5 px-4 font-medium">Tenant & Unit</th>
                <th className="py-2.5 px-4 font-medium">Cycle</th>
                <th className="py-2.5 px-4 font-medium text-right">Rent Due</th>
                <th className="py-2.5 px-4 font-medium text-right">Amount Paid</th>
                <th className="py-2.5 px-4 font-medium text-right">Refund Surplus</th>
                <th className="py-2.5 px-4 font-medium">Status & Settlement Details</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No refund requests found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => {
                  const isPending = refund.status === 'pending_review' || refund.status === 'processing';
                  const isRefunded = refund.status === 'refunded';

                  return (
                    <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {refund.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{refund.tenantName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Room {refund.roomNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {refund.billingMonth}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-right tabular-nums text-slate-600">
                        ${refund.rentDueAmount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-right tabular-nums font-semibold text-slate-900">
                        ${refund.totalPaidAmount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-right tabular-nums font-bold text-indigo-700 text-sm">
                        +${refund.overpaymentAmount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPending && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                              <Clock className="w-3.5 h-3.5" />
                              Pending External Payout
                            </span>
                            <div className="text-[11px] text-slate-500">
                              Logged on {new Date(refund.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {isRefunded && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Refunded via {refund.refundMethod}
                            </span>
                            <div className="text-[11px] font-mono text-slate-500">
                              Ref: {refund.externalRefId} · {refund.resolvedAt ? new Date(refund.resolvedAt).toLocaleDateString() : ''}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => setActiveRefundForModal(refund)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Record External Refund
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">
                            Settled by {refund.processedBy || 'Staff'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Refund Modal */}
      {activeRefundForModal && (
        <RecordRefundModal
          refund={activeRefundForModal}
          onClose={() => setActiveRefundForModal(null)}
          onConfirm={(method, externalRef, notes) => {
            onRecordRefund(activeRefundForModal.id, method, externalRef, notes);
            setActiveRefundForModal(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Record External Refund Modal
interface RecordRefundModalProps {
  refund: RefundRequest;
  onClose: () => void;
  onConfirm: (method: RefundMethod, externalRef: string, notes: string) => void;
}

const RecordRefundModal: React.FC<RecordRefundModalProps> = ({ refund, onClose, onConfirm }) => {
  const [method, setMethod] = useState<RefundMethod>('Bank ACH Wire');
  const [externalRef, setExternalRef] = useState(`ACH-REF-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState(`Disbursed surplus of $${refund.overpaymentAmount} to tenant primary account.`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(method, externalRef, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Record External Refund</h3>
            <p className="text-xs text-slate-500 mt-0.5">Disbursement ledger record for {refund.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Overpayment Summary Box */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-indigo-950">Tenant & Unit:</span>
              <span className="font-bold text-slate-900">{refund.tenantName} (Room {refund.roomNumber})</span>
            </div>
            <div className="flex justify-between items-baseline font-mono tabular-nums">
              <span className="text-indigo-900">Overpayment Surplus to Refund:</span>
              <span className="text-base font-bold text-indigo-900">+${refund.overpaymentAmount.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-indigo-700 pt-1">
              (Total paid: ${refund.totalPaidAmount.toFixed(2)} vs Contract Rent: ${refund.rentDueAmount.toFixed(2)})
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">External Payment Method Used</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as RefundMethod)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="Bank ACH Wire">Bank ACH Wire Transfer</option>
              <option value="Direct Card Reversal">Direct Card Payment Reversal</option>
              <option value="Company Check">Corporate Escrow Check</option>
              <option value="Cash Receipt">Cash Payout with Signed Voucher</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">External Transaction Reference / Check No</label>
            <input
              type="text"
              required
              placeholder="e.g. WIRE-891024 or CHECK-4401"
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Accounting Audit Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Confirm & Settle Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
