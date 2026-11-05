import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Maximize2, 
  Scan, 
  FileSpreadsheet, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  Info,
  Check,
  Ban,
  FileCode,
  Search,
  ExternalLink
} from 'lucide-react';
import { Receipt, Tenant, RefundRequest } from '../types';

interface ReceiptOcrViewerProps {
  receipts: Receipt[];
  tenants: Tenant[];
  selectedReceiptId?: string;
  onSelectReceipt: (id: string) => void;
  onVerifyPayment: (receiptId: string) => void;
  onVerifyWithRefund: (receiptId: string) => void;
  onNavigateToRefunds: () => void;
}

export const ReceiptOcrViewer: React.FC<ReceiptOcrViewerProps> = ({
  receipts,
  tenants,
  selectedReceiptId,
  onSelectReceipt,
  onVerifyPayment,
  onVerifyWithRefund,
  onNavigateToRefunds,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTabLeft, setActiveTabLeft] = useState<'visual' | 'raw_ocr'>('visual');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Active receipt
  const currentReceipt = receipts.find((r) => r.id === selectedReceiptId) || receipts[0];
  const currentTenant = tenants.find((t) => t.id === currentReceipt?.tenantId);

  // Filter list
  const filteredReceipts = receipts.filter((rc) => {
    if (filterStatus !== 'all' && rc.verificationStatus !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tenant = tenants.find((t) => t.id === rc.tenantId);
      const matchesName = tenant?.name.toLowerCase().includes(q);
      const matchesRoom = rc.roomNumber.toLowerCase().includes(q);
      const matchesRef = rc.ocrData.transactionRef.toLowerCase().includes(q);
      const matchesFile = rc.fileName.toLowerCase().includes(q);
      if (!matchesName && !matchesRoom && !matchesRef && !matchesFile) return false;
    }
    return true;
  });

  if (!currentReceipt) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900">No Receipts Available</h3>
        <p className="text-xs text-slate-500 mt-1">Upload a receipt or import billing slips to run OCR verification.</p>
      </div>
    );
  }

  // Calculate comparison
  const expectedRent = currentReceipt.rentDueAmount;
  const detectedAmount = currentReceipt.ocrData.detectedAmount;
  const difference = detectedAmount - expectedRent;
  const isMatch = Math.abs(difference) < 0.01;
  const isInsufficient = difference < -0.01;
  const isOverpaid = difference > 0.01;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Receipt OCR & Automatic Verification
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Tesseract OCR Engine 5.3</span>
            <span aria-hidden="true">·</span>
            <span>Multi-format: JPG, PNG, PDF, XLSX, TXT</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Rent Ledger Reconciliation</span>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Slips ({receipts.length})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'verified'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilterStatus('insufficient_blocked')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'insufficient_blocked'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Insufficient (Blocked)
          </button>
          <button
            onClick={() => setFilterStatus('overpayment_pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'overpayment_pending'
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            Overpaid (Surplus)
          </button>
          <button
            onClick={() => setFilterStatus('pending_review')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'pending_review'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending Review
          </button>
        </div>
      </div>

      {/* Main split grid: Receipt Queue on Left, Split Preview & Verification on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Receipt Selection Queue (3 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search tenant, room, ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="text-[11px] font-semibold text-slate-400 tracking-wider mb-2 px-1">
              RECEIPT DOCUMENTS ({filteredReceipts.length})
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredReceipts.map((rc) => {
                const tenant = tenants.find((t) => t.id === rc.tenantId);
                const isSelected = rc.id === currentReceipt.id;

                return (
                  <div
                    key={rc.id}
                    onClick={() => onSelectReceipt(rc.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            Room {rc.roomNumber}
                          </span>
                          <span className="text-[10px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {rc.fileFormat}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 mt-0.5 truncate max-w-[150px]">
                          {tenant?.name || 'Unknown'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold tabular-nums text-slate-900">
                          ${rc.ocrData.detectedAmount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Due: ${rc.rentDueAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {rc.verificationStatus === 'verified' && (
                        <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {rc.verificationStatus === 'insufficient_blocked' && (
                        <span className="text-rose-700 font-medium inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Blocked (${rc.rentDueAmount - rc.paidAmount} short)
                        </span>
                      )}
                      {rc.verificationStatus === 'overpayment_pending' && (
                        <span className="text-indigo-700 font-medium inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          Overpayment (+${rc.paidAmount - rc.rentDueAmount})
                        </span>
                      )}
                      {rc.verificationStatus === 'discrepancy' && (
                        <span className="text-purple-700 font-medium inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Discrepancy
                        </span>
                      )}
                      {rc.verificationStatus === 'pending_review' && (
                        <span className="text-amber-700 font-medium">
                          Pending Review
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-slate-400">
                        {rc.ocrData.confidenceScore}% conf
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Document Preview & OCR Highlighting (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[700px]">
            {/* Document Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-slate-900 truncate">
                  {currentReceipt.fileName}
                </span>
                <span className="text-xs text-slate-400">({currentReceipt.fileSizeKb} KB)</span>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTabLeft('visual')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeTabLeft === 'visual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Document View
                </button>
                <button
                  onClick={() => setActiveTabLeft('raw_ocr')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeTabLeft === 'raw_ocr'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw OCR Text
                </button>
              </div>
            </div>

            {/* Document Sub-bar */}
            <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Engine: <strong className="text-slate-800">{currentReceipt.ocrData.engine}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Score: <strong className="text-slate-800">{currentReceipt.ocrData.confidenceScore}%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-slate-400"
                  />
                  <span className="text-[11px] text-slate-600">Bounding Boxes</span>
                </label>
              </div>
            </div>

            {/* Document Body Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-100/60 flex items-center justify-center">
              {activeTabLeft === 'visual' ? (
                /* Simulated Document Slip Container */
                <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-sm p-6 relative font-mono text-xs text-slate-800 space-y-4">
                  {/* Bank Header of Slip */}
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 tracking-tight">
                        {currentReceipt.ocrData.bankName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        OFFICIAL TRANSACTION RECORD / CLEARING ADVICE
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        {currentReceipt.fileFormat}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Details with Simulated OCR Highlights */}
                  <div className="space-y-3 relative">
                    <div
                      className={`p-1.5 rounded transition-colors ${
                        activeHighlight === 'Date' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">PAYMENT TIMESTAMP</div>
                      <div className="font-semibold text-slate-900">
                        {currentReceipt.ocrData.detectedDate} · 11:42:00 UTC
                      </div>
                    </div>

                    <div
                      className={`p-1.5 rounded transition-colors ${
                        activeHighlight === 'Reference' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">TRANSACTION / TRACE ID</div>
                      <div className="font-semibold text-slate-900 break-all">
                        {currentReceipt.ocrData.transactionRef}
                      </div>
                    </div>

                    <div
                      className={`p-1.5 rounded transition-colors ${
                        activeHighlight === 'Payer' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">ORIGINATOR / PAYER</div>
                      <div className="font-semibold text-slate-900">
                        {currentReceipt.ocrData.payerName}
                      </div>
                    </div>

                    <div className="p-1.5 rounded">
                      <div className="text-[10px] text-slate-400">BENEFICIARY ACCOUNT</div>
                      <div className="font-semibold text-slate-800">
                        Sila Property Escrow LLC (Room {currentReceipt.roomNumber})
                      </div>
                    </div>

                    {/* Amount Highlight Box */}
                    <div
                      className={`p-3 rounded-lg border-2 ${
                        showBoundingBoxes
                          ? 'border-emerald-600 bg-emerald-50/60'
                          : 'border-slate-200 bg-slate-50'
                      } relative transition-all`}
                    >
                      {showBoundingBoxes && (
                        <span className="absolute -top-2.5 left-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 rounded">
                          TESSERACT DETECTED AMOUNT: 99.2%
                        </span>
                      )}
                      <div className="text-[10px] text-emerald-800 font-bold uppercase">
                        SETTLED AMOUNT (USD)
                      </div>
                      <div className="text-2xl font-bold text-slate-900 tabular-nums">
                        ${currentReceipt.ocrData.detectedAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Billing Month: {currentReceipt.billingMonth}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100">
                      ELECTRONIC DATA CAPTURED VIA {currentReceipt.ocrData.engine.toUpperCase()}. 
                      TRANSACTION VERIFICATION AUDITED AGAINST CONTRACT LEASE LEDGER.
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw OCR Text output from Tesseract/Python */
                <div className="w-full h-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-lg overflow-auto shadow-inner">
                  <div className="text-slate-400 pb-2 mb-2 border-b border-slate-800 flex items-center justify-between text-[11px]">
                    <span>// RAW ENGINE STREAM (STDOUT)</span>
                    <span>Tesseract OCR 5.3</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {currentReceipt.ocrData.rawSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* OCR Bounding Boxes Quick Highlights Selector */}
            <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Field Detections:</span>
              {currentReceipt.ocrData.boundingHighlights.map((hl) => (
                <button
                  key={hl.label}
                  onMouseEnter={() => setActiveHighlight(hl.label)}
                  onMouseLeave={() => setActiveHighlight(null)}
                  className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 rounded transition-colors"
                >
                  {hl.label}: {hl.value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Automatic Verification Engine (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* Section 1: Tenant & Unit Info */}
            <div>
              <div className="text-xs font-semibold text-slate-400 tracking-wider">
                LEASE & AUDIT RECORD
              </div>
              <div className="mt-2 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentTenant?.name || 'Unassigned Tenant'}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Room {currentReceipt.roomNumber} · {currentTenant?.building === 'Building-A' ? 'Sky Tower A' : 'Park View B'}
                  </div>
                </div>
                <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700">
                  Cycle: {currentReceipt.billingMonth}
                </span>
              </div>
            </div>

            {/* Section 2: Financial Reconciliation Comparison */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-semibold text-slate-400 tracking-wider">
                AUTOMATIC RECONCILIATION
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-600">Contract Monthly Rent</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ${expectedRent.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-600">OCR Extracted Amount</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ${detectedAmount.toFixed(2)}
                  </span>
                </div>

                {/* Variance result */}
                <div
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    isMatch
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : isInsufficient
                      ? 'border-rose-200 bg-rose-50 text-rose-900'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-900'
                  }`}
                >
                  <span className="font-medium">
                    {isMatch && 'Balance Difference'}
                    {isInsufficient && 'Payment Shortfall'}
                    {isOverpaid && 'Overpayment Surplus'}
                  </span>
                  <span className="font-bold tabular-nums">
                    {isMatch && '$0.00 (Exact Match)'}
                    {isInsufficient && `-$${Math.abs(difference).toFixed(2)}`}
                    {isOverpaid && `+$${difference.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Verification Policy & Dynamic Logic Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-semibold text-slate-400 tracking-wider">
                VERIFICATION ACTION
              </div>

              {/* State A: Already Verified */}
              {currentReceipt.verificationStatus === 'verified' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Payment Verified & Cleared
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Verified on {currentReceipt.verifiedAt ? new Date(currentReceipt.verifiedAt).toLocaleDateString() : 'recent audit'} by {currentReceipt.verifiedBy || 'Staff'}. Outstanding balance updated to $0.00.
                  </p>
                </div>
              )}

              {/* State B: Insufficient Payment - STRICT SYSTEM BLOCK */}
              {isInsufficient && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <ShieldAlert className="w-4 h-4 text-rose-700" />
                      Verification Blocked: Insufficient Amount
                    </div>
                    <p className="text-rose-800 leading-relaxed">
                      The extracted payment amount (${detectedAmount.toFixed(2)}) is less than the outstanding rent balance (${expectedRent.toFixed(2)}).
                    </p>
                    <div className="pt-1 font-semibold text-rose-900">
                      Shortfall: ${Math.abs(difference).toFixed(2)}
                    </div>
                  </div>

                  {/* Blocked button with tooltip */}
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4 text-slate-400" />
                      Verification Prohibited (Partial Amount)
                    </button>
                    <p className="text-[11px] text-slate-500 text-center">
                      Full payment receipt of ${expectedRent.toFixed(2)} required before verification can proceed.
                    </p>
                  </div>
                </div>
              )}

              {/* State C: Overpayment - CREATES REFUND REQUEST */}
              {isOverpaid && currentReceipt.verificationStatus !== 'verified' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <ArrowUpRight className="w-4 h-4 text-indigo-700" />
                      Overpayment Surplus Detected
                    </div>
                    <p className="text-indigo-800 leading-relaxed">
                      The payment of ${detectedAmount.toFixed(2)} exceeds the monthly rent of ${expectedRent.toFixed(2)}. A surplus of <strong className="font-bold">${difference.toFixed(2)}</strong> will be credited or refunded.
                    </p>
                    <div className="text-[11px] text-indigo-700">
                      Rule: Verifying will mark room as Fully Paid and automatically create an Overpayment Refund Request in Refund Management.
                    </div>
                  </div>

                  <button
                    onClick={() => onVerifyWithRefund(currentReceipt.id)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs active:translate-y-px"
                  >
                    <Check className="w-4 h-4" />
                    Verify & Create Refund Request (+${difference.toFixed(2)})
                  </button>
                </div>
              )}

              {/* State D: Exact Match - READY TO VERIFY */}
              {isMatch && currentReceipt.verificationStatus !== 'verified' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Amount Matches Outstanding Balance
                    </div>
                    <p className="text-emerald-800">
                      Extracted amount (${detectedAmount.toFixed(2)}) matches the contract rent due (${expectedRent.toFixed(2)}) with 0 variance.
                    </p>
                  </div>

                  <button
                    onClick={() => onVerifyPayment(currentReceipt.id)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs active:translate-y-px"
                  >
                    <Check className="w-4 h-4" />
                    Verify Payment
                  </button>
                </div>
              )}

              {/* View Refund Link if related */}
              {currentReceipt.refundRequestId && (
                <div className="pt-2">
                  <button
                    onClick={onNavigateToRefunds}
                    className="w-full py-2 px-3 text-xs font-medium text-indigo-800 bg-indigo-50/60 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-between"
                  >
                    <span>View Generated Refund Request</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Audit Trail Details */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Uploaded By</span>
                <span className="text-slate-800">{currentReceipt.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span>Upload Timestamp</span>
                <span className="font-mono text-slate-800">
                  {new Date(currentReceipt.uploadedAt).toLocaleDateString()} {new Date(currentReceipt.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slip Ref No</span>
                <span className="font-mono text-slate-800">{currentReceipt.ocrData.transactionRef}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
