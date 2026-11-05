import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Download, 
  Filter, 
  Eye, 
  FileText,
  DollarSign,
  Receipt as ReceiptIcon,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { Tenant, Receipt, RefundRequest, RoomDefinition } from '../types';
import { ALL_ROOM_NUMBERS } from '../data/mockData';

interface AuditDashboardProps {
  tenants: Tenant[];
  receipts: Receipt[];
  refunds: RefundRequest[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedBuilding: string;
  setSelectedBuilding: (b: string) => void;
  onNavigateToOcr: (receiptId: string) => void;
  onNavigateToRefunds: () => void;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  tenants,
  receipts,
  refunds,
  selectedMonth,
  setSelectedMonth,
  selectedBuilding,
  setSelectedBuilding,
  onNavigateToOcr,
  onNavigateToRefunds,
}) => {
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');

  // Filter rooms based on building selection
  const relevantRooms = ALL_ROOM_NUMBERS.filter(
    (r) => selectedBuilding === 'all' || r.building === selectedBuilding
  ).filter((r) => filterFloor === 'all' || r.floor === filterFloor);

  // Compute stats
  const activeTenants = tenants.filter((t) => !t.isArchived);
  
  // Occupied rooms in relevant set
  const occupiedRooms = relevantRooms.filter((r) =>
    activeTenants.some((t) => t.roomNumber === r.roomNumber)
  );

  const vacantRoomsCount = relevantRooms.length - occupiedRooms.length;

  // Receipts in selected month
  const monthReceipts = receipts.filter((rc) => rc.billingMonth === selectedMonth);

  // Calculate rent calculations
  let expectedRentTotal = 0;
  let verifiedPaymentsTotal = 0;
  let outstandingBalanceTotal = 0;
  let fullyPaidRoomsCount = 0;
  let unpaidRoomsCount = 0;
  let insufficientRoomsCount = 0;
  let overpaidRoomsCount = 0;
  let discrepanciesCount = 0;

  const roomRowAudit = relevantRooms.map((room) => {
    const tenant = activeTenants.find((t) => t.roomNumber === room.roomNumber);
    const receipt = monthReceipts.find((rc) => rc.roomNumber === room.roomNumber);

    if (!tenant) {
      return {
        roomNumber: room.roomNumber,
        building: room.building,
        floor: room.floor,
        tenantName: 'Vacant Room',
        isOccupied: false,
        expectedRent: 0,
        paidAmount: 0,
        balanceDue: 0,
        status: 'vacant' as const,
        receipt: undefined,
      };
    }

    const expectedRent = tenant.monthlyRent;
    expectedRentTotal += expectedRent;

    let paidAmount = 0;
    let status: 'fully_paid' | 'insufficient' | 'unpaid' | 'overpaid' | 'discrepancy' = 'unpaid';

    if (receipt) {
      paidAmount = receipt.ocrData.detectedAmount;
      if (receipt.verificationStatus === 'verified') {
        verifiedPaymentsTotal += paidAmount;
        if (paidAmount >= expectedRent) {
          fullyPaidRoomsCount++;
          status = 'fully_paid';
        }
      } else if (receipt.verificationStatus === 'overpayment_pending') {
        overpaidRoomsCount++;
        status = 'overpaid';
        verifiedPaymentsTotal += expectedRent; // base rent counted
      } else if (receipt.verificationStatus === 'insufficient_blocked') {
        insufficientRoomsCount++;
        status = 'insufficient';
      } else if (receipt.verificationStatus === 'discrepancy') {
        discrepanciesCount++;
        status = 'discrepancy';
      } else {
        // pending review
        if (paidAmount < expectedRent) {
          insufficientRoomsCount++;
          status = 'insufficient';
        } else {
          status = 'fully_paid';
        }
      }
    } else {
      unpaidRoomsCount++;
    }

    const balanceDue = Math.max(0, expectedRent - (receipt?.verificationStatus === 'verified' ? paidAmount : 0));
    outstandingBalanceTotal += balanceDue;

    return {
      roomNumber: room.roomNumber,
      building: room.building,
      floor: room.floor,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      isOccupied: true,
      expectedRent,
      paidAmount,
      balanceDue,
      status,
      receipt,
    };
  });

  // Pending refunds calculation
  const pendingRefunds = refunds.filter((rf) => rf.status === 'pending_review' || rf.status === 'processing');
  const pendingRefundsTotal = pendingRefunds.reduce((acc, curr) => acc + curr.overpaymentAmount, 0);

  // Collection percentage
  const collectionRate = expectedRentTotal > 0 ? (verifiedPaymentsTotal / expectedRentTotal) * 100 : 0;

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Room Number', 'Building', 'Floor', 'Tenant', 'Status', 'Expected Rent ($)', 'Paid Amount ($)', 'Balance Due ($)', 'Receipt ID', 'OCR Reference'];
    const rows = roomRowAudit.map((r) => [
      r.roomNumber,
      r.building,
      r.floor,
      r.tenantName,
      r.status,
      r.expectedRent.toFixed(2),
      r.paidAmount.toFixed(2),
      r.balanceDue.toFixed(2),
      r.receipt?.id || 'N/A',
      r.receipt?.ocrData.transactionRef || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sila_Audit_Report_${selectedMonth}_${selectedBuilding}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Cadence Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Monthly Audit Report
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Billing Period: {selectedMonth}</span>
            <span aria-hidden="true">·</span>
            <span>Audited Portfolio: {selectedBuilding === 'all' ? 'All Buildings' : selectedBuilding}</span>
            <span aria-hidden="true">·</span>
            <span>Reconciliation Engine Active</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="2026-11">November 2026 (Current)</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>

          {/* Building selector */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">All Properties (A & B)</option>
            <option value="Building-A">Building A (Sky Tower)</option>
            <option value="Building-B">Building B (Park View)</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Grid - 8 Key Metrics Requested */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: Occupied Rooms */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Occupied Rooms</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {occupiedRooms.length}
            </span>
            <span className="text-xs text-slate-500">/ {relevantRooms.length} total</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {vacantRoomsCount} vacant · {((occupiedRooms.length / (relevantRooms.length || 1)) * 100).toFixed(0)}% occupancy
          </div>
        </div>

        {/* Metric 2: Fully Paid Rooms */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Fully Paid Rooms</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
              {fullyPaidRoomsCount}
            </span>
            <span className="text-xs text-slate-500">verified</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {occupiedRooms.length > 0 ? ((fullyPaidRoomsCount / occupiedRooms.length) * 100).toFixed(0) : 0}% of occupied
          </div>
        </div>

        {/* Metric 3: Unpaid / Insufficient */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Unpaid / Incomplete</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600 font-mono tabular-nums">
              {unpaidRoomsCount + insufficientRoomsCount}
            </span>
            <span className="text-xs text-slate-500">rooms</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {unpaidRoomsCount} no slip · {insufficientRoomsCount} insufficient
          </div>
        </div>

        {/* Metric 4: Expected Rent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Expected Rent</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              ${expectedRentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Active lease contracted sum
          </div>
        </div>

        {/* Metric 5: Verified Payments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Verified Payments</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
              ${verifiedPaymentsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Reconciled through verified OCR slips
          </div>
        </div>

        {/* Metric 6: Outstanding Balances */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Outstanding Balance</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-700 font-mono tabular-nums">
              ${outstandingBalanceTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Due & uncollected for {selectedMonth}
          </div>
        </div>

        {/* Metric 7: Pending Refunds */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Pending Refunds</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
              ${pendingRefundsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500">({pendingRefunds.length})</span>
          </div>
          <div className="mt-2">
            <button
              onClick={onNavigateToRefunds}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 underline inline-flex items-center gap-1"
            >
              Review Queue
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 8: Discrepancies */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Payment Discrepancies</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-purple-700 font-mono tabular-nums">
              {discrepanciesCount + insufficientRoomsCount + overpaidRoomsCount}
            </span>
            <span className="text-xs text-slate-500">action items</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Mismatches, shortfalls & surpluses
          </div>
        </div>
      </div>

      {/* Progress & Collection Efficiency Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-sm font-semibold text-slate-900">Collection Rate & Target Status</span>
            <div className="text-xs text-slate-500 mt-0.5">
              ${verifiedPaymentsTotal.toLocaleString()} of ${expectedRentTotal.toLocaleString()} collected
            </div>
          </div>
          <div className="text-sm font-mono font-bold text-slate-900">
            {collectionRate.toFixed(1)}% Collected
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${Math.min(100, collectionRate)}%` }}
          />
          {pendingRefundsTotal > 0 && (
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(10, (pendingRefundsTotal / (expectedRentTotal || 1)) * 100)}%` }}
              title="Pending refunds surplus"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            Verified Collections (${verifiedPaymentsTotal.toLocaleString()})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            Outstanding Balances (${outstandingBalanceTotal.toLocaleString()})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Pending Overpayment Refunds (${pendingRefundsTotal.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Priority Discrepancies & Audit Exceptions Callout */}
      {(insufficientRoomsCount > 0 || discrepanciesCount > 0 || overpaidRoomsCount > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900">
                Actionable Audit Discrepancies & Blocked Receipts ({insufficientRoomsCount + discrepanciesCount + overpaidRoomsCount})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Requires Staff Review</span>
          </div>

          <div className="divide-y divide-slate-100">
            {monthReceipts
              .filter(
                (r) =>
                  r.verificationStatus === 'insufficient_blocked' ||
                  r.verificationStatus === 'discrepancy' ||
                  r.verificationStatus === 'overpayment_pending'
              )
              .map((receipt) => {
                const tenant = tenants.find((t) => t.id === receipt.tenantId);
                const isInsufficient = receipt.verificationStatus === 'insufficient_blocked';
                const isOverpaid = receipt.verificationStatus === 'overpayment_pending';
                const isDiscrepancy = receipt.verificationStatus === 'discrepancy';

                return (
                  <div key={receipt.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          Room {receipt.roomNumber}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {tenant?.name || 'Unknown Tenant'}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs font-mono text-slate-500">
                          Ref: {receipt.ocrData.transactionRef}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600">
                        {isInsufficient && (
                          <span className="text-rose-700 font-medium">
                            Blocked: Payment ${receipt.paidAmount} is ${receipt.rentDueAmount - receipt.paidAmount} below balance (${receipt.rentDueAmount}).
                          </span>
                        )}
                        {isOverpaid && (
                          <span className="text-amber-800 font-medium">
                            Overpayment: Payment ${receipt.paidAmount} exceeds rent ${receipt.rentDueAmount} by ${receipt.paidAmount - receipt.rentDueAmount}. Refund requested.
                          </span>
                        )}
                        {isDiscrepancy && (
                          <span className="text-purple-700 font-medium">
                            {receipt.blockedReason || 'Payer entity name does not match lease record.'}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigateToOcr(receipt.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        Inspect OCR & Verify
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Comprehensive Room Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Comprehensive Room Billing Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status across all {relevantRooms.length} rooms for {selectedMonth}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Floor:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setFilterFloor('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  filterFloor === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFilterFloor(fl)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    filterFloor === fl
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fl {fl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Room</th>
                <th className="py-2.5 px-4 font-medium">Tenant</th>
                <th className="py-2.5 px-4 font-medium text-right">Rent Due</th>
                <th className="py-2.5 px-4 font-medium text-right">Extracted Paid</th>
                <th className="py-2.5 px-4 font-medium text-right">Balance Due</th>
                <th className="py-2.5 px-4 font-medium">Receipt File / OCR</th>
                <th className="py-2.5 px-4 font-medium">Audit Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roomRowAudit.map((row) => (
                <tr key={row.roomNumber} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {row.roomNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{row.tenantName}</div>
                    {row.tenantEmail && (
                      <div className="text-[11px] text-slate-400">{row.tenantEmail}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700">
                    {row.isOccupied ? `$${row.expectedRent.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right font-medium">
                    {row.paidAmount > 0 ? (
                      <span className={row.status === 'fully_paid' ? 'text-emerald-700' : 'text-slate-800'}>
                        ${row.paidAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400">$0.00</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold">
                    {row.isOccupied ? (
                      row.balanceDue > 0 ? (
                        <span className="text-rose-600">${row.balanceDue.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-700">$0.00</span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {row.receipt ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px]">
                          {row.receipt.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {row.receipt.ocrData.engine} · {row.receipt.ocrData.confidenceScore}% conf
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No receipt attached</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {row.status === 'fully_paid' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Fully Paid
                      </span>
                    )}
                    {row.status === 'insufficient' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Insufficient (Blocked)
                      </span>
                    )}
                    {row.status === 'overpaid' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Overpaid (Refund)
                      </span>
                    )}
                    {row.status === 'discrepancy' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Discrepancy Flag
                      </span>
                    )}
                    {row.status === 'unpaid' && (
                      <span className="text-xs text-slate-500">
                        Unpaid (Pending Slip)
                      </span>
                    )}
                    {row.status === 'vacant' && (
                      <span className="text-xs text-slate-400 italic">
                        Vacant Unit
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.receipt ? (
                      <button
                        onClick={() => onNavigateToOcr(row.receipt!.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors shadow-xs"
                      >
                        Inspect
                      </button>
                    ) : row.isOccupied ? (
                      <button
                        onClick={() => onNavigateToOcr('')}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        Upload Slip
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
