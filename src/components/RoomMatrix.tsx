import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  FileText, 
  User, 
  Filter, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Tenant, Receipt, RefundRequest, PaymentStatus } from '../types';
import { ALL_ROOM_NUMBERS } from '../data/mockData';

interface RoomMatrixProps {
  tenants: Tenant[];
  receipts: Receipt[];
  selectedMonth: string;
  selectedBuilding: string;
  setSelectedBuilding: (b: string) => void;
  onSelectRoom: (roomNumber: string) => void;
}

export const RoomMatrix: React.FC<RoomMatrixProps> = ({
  tenants,
  receipts,
  selectedMonth,
  selectedBuilding,
  setSelectedBuilding,
  onSelectRoom,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  const activeTenants = tenants.filter((t) => !t.isArchived);
  const monthReceipts = receipts.filter((rc) => rc.billingMonth === selectedMonth);

  // Compute room state
  const roomsWithState = ALL_ROOM_NUMBERS.map((room) => {
    const tenant = activeTenants.find((t) => t.roomNumber === room.roomNumber);
    const receipt = monthReceipts.find((rc) => rc.roomNumber === room.roomNumber);

    let status: PaymentStatus = 'vacant';
    let expectedRent = 0;
    let verifiedPayment = 0;
    let balanceDue = 0;
    let surplusAmount = 0;

    if (tenant) {
      expectedRent = tenant.monthlyRent;
      if (receipt) {
        const detected = receipt.ocrData.detectedAmount;
        if (receipt.verificationStatus === 'verified') {
          status = 'fully_paid';
          verifiedPayment = detected;
        } else if (receipt.verificationStatus === 'insufficient_blocked') {
          status = 'insufficient';
          verifiedPayment = detected;
          balanceDue = Math.max(0, expectedRent - detected);
        } else if (receipt.verificationStatus === 'overpayment_pending') {
          status = 'overpaid';
          verifiedPayment = expectedRent;
          surplusAmount = detected - expectedRent;
        } else if (receipt.verificationStatus === 'discrepancy') {
          status = 'insufficient';
          balanceDue = expectedRent;
        } else {
          // pending review
          if (detected >= expectedRent) {
            status = 'fully_paid';
            verifiedPayment = detected;
          } else {
            status = 'insufficient';
            balanceDue = expectedRent - detected;
          }
        }
      } else {
        status = 'unpaid';
        balanceDue = expectedRent;
      }
    }

    return {
      roomNumber: room.roomNumber,
      building: room.building,
      floor: room.floor,
      tenant,
      receipt,
      status,
      expectedRent,
      verifiedPayment,
      balanceDue,
      surplusAmount,
    };
  });

  // Filter rooms
  const filteredRooms = roomsWithState.filter((r) => {
    if (selectedBuilding !== 'all' && r.building !== selectedBuilding) return false;
    if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  // Group by floor
  const floors: number[] = Array.from(new Set(filteredRooms.map((r) => r.floor))).sort((a: number, b: number) => b - a);

  // Summary counts
  const totalCount = filteredRooms.length;
  const fullyPaidCount = filteredRooms.filter((r) => r.status === 'fully_paid').length;
  const insufficientCount = filteredRooms.filter((r) => r.status === 'insufficient').length;
  const overpaidCount = filteredRooms.filter((r) => r.status === 'overpaid').length;
  const unpaidCount = filteredRooms.filter((r) => r.status === 'unpaid').length;
  const vacantCount = filteredRooms.filter((r) => r.status === 'vacant').length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Payment Status by Room
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Billing Cycle: {selectedMonth}</span>
              <span aria-hidden="true">·</span>
              <span>Visual Property Matrix</span>
              <span aria-hidden="true">·</span>
              <span>Click any unit for full payment audit and slip details</span>
            </div>
          </div>

          {/* Building switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Property:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedBuilding('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedBuilding === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Buildings
              </button>
              <button
                onClick={() => setSelectedBuilding('Building-A')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedBuilding === 'Building-A'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Building A (Sky Tower)
              </button>
              <button
                onClick={() => setSelectedBuilding('Building-B')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedBuilding === 'Building-B'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Building B (Park View)
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar: Floor & Payment Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('fully_paid')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'fully_paid'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Fully Paid ({fullyPaidCount})
            </button>
            <button
              onClick={() => setStatusFilter('insufficient')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'insufficient'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Insufficient ({insufficientCount})
            </button>
            <button
              onClick={() => setStatusFilter('overpaid')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'overpaid'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              Overpaid ({overpaidCount})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'unpaid'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Unpaid ({unpaidCount})
            </button>
            <button
              onClick={() => setStatusFilter('vacant')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'vacant'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Vacant ({vacantCount})
            </button>
          </div>

          {/* Floor selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Floor:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedFloor === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              {[4, 3, 2, 1].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    selectedFloor === fl ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fl {fl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Floor Grid Layout */}
      {floors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <p className="text-sm font-medium text-slate-700">No rooms match the selected filter criteria.</p>
          <button
            onClick={() => {
              setSelectedFloor('all');
              setStatusFilter('all');
              setSelectedBuilding('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {floors.map((floorNum) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === floorNum);

            return (
              <div key={floorNum} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 tracking-wider">
                      FLOOR 0{floorNum}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">
                      {floorRooms.length} units listed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {floorRooms.map((room) => {
                    const isPaid = room.status === 'fully_paid';
                    const isInsufficient = room.status === 'insufficient';
                    const isOverpaid = room.status === 'overpaid';
                    const isUnpaid = room.status === 'unpaid';
                    const isVacant = room.status === 'vacant';

                    // Card border and background styling
                    let statusClasses = 'border-slate-200 bg-white hover:border-slate-300';
                    if (isPaid) {
                      statusClasses = 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300';
                    } else if (isInsufficient) {
                      statusClasses = 'border-rose-200 bg-rose-50/40 hover:border-rose-300';
                    } else if (isOverpaid) {
                      statusClasses = 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-300';
                    } else if (isUnpaid) {
                      statusClasses = 'border-amber-200 bg-amber-50/30 hover:border-amber-300';
                    } else if (isVacant) {
                      statusClasses = 'border-slate-200 bg-slate-50/60 opacity-80';
                    }

                    return (
                      <div
                        key={room.roomNumber}
                        onClick={() => onSelectRoom(room.roomNumber)}
                        className={`rounded-xl border p-4 text-left transition-all cursor-pointer shadow-xs ${statusClasses} group relative`}
                      >
                        {/* Top row: Unit Number & Status text */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-base font-bold text-slate-900 group-hover:text-slate-700">
                              {room.roomNumber}
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {room.building === 'Building-A' ? 'Tower A' : 'Park View B'}
                            </div>
                          </div>

                          {/* Status Indicator */}
                          <div className="text-right">
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Paid
                              </span>
                            )}
                            {isInsufficient && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Blocked
                              </span>
                            )}
                            {isOverpaid && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-800">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                Surplus
                              </span>
                            )}
                            {isUnpaid && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Unpaid
                              </span>
                            )}
                            {isVacant && (
                              <span className="text-xs font-medium text-slate-400">
                                Vacant
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle info: Tenant info */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1">
                          <div className="text-xs font-medium text-slate-900 truncate">
                            {room.tenant ? room.tenant.name : 'No Active Lease'}
                          </div>
                          
                          {/* Financial numbers */}
                          {room.tenant ? (
                            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                              <span className="text-slate-500">Rent: ${room.expectedRent}</span>
                              {isPaid && (
                                <span className="text-emerald-800 font-semibold">${room.verifiedPayment}</span>
                              )}
                              {isInsufficient && (
                                <span className="text-rose-700 font-semibold">Short -${room.balanceDue}</span>
                              )}
                              {isOverpaid && (
                                <span className="text-indigo-700 font-semibold">+${room.surplusAmount}</span>
                              )}
                              {isUnpaid && (
                                <span className="text-amber-800 font-semibold">Due ${room.balanceDue}</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic">Ready to lease</div>
                          )}
                        </div>

                        {/* Bottom action hint */}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                          {room.receipt ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-mono">
                              <FileText className="w-3 h-3 text-slate-400" />
                              {room.receipt.fileFormat}
                            </span>
                          ) : (
                            <span className="text-slate-400">No slip</span>
                          )}
                          <span className="inline-flex items-center gap-0.5 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all">
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
