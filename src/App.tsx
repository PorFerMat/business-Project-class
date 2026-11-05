/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AuditDashboard } from './components/AuditDashboard';
import { RoomMatrix } from './components/RoomMatrix';
import { ReceiptOcrViewer } from './components/ReceiptOcrViewer';
import { TenantManagement } from './components/TenantManagement';
import { RefundManagement } from './components/RefundManagement';
import { UploadReceiptModal } from './components/UploadReceiptModal';
import { RoomDetailDrawer } from './components/RoomDetailDrawer';
import { INITIAL_TENANTS, INITIAL_RECEIPTS, INITIAL_REFUNDS } from './data/mockData';
import { Tenant, Receipt, RefundRequest, RefundMethod } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'matrix' | 'ocr' | 'tenants' | 'refunds'>('audit');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  
  // Data state
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [refunds, setRefunds] = useState<RefundRequest[]>(INITIAL_REFUNDS);

  // Active interaction states
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(INITIAL_RECEIPTS[0]?.id || '');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Show quick temporary toast notification
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Verify Payment (Exact Match)
  const handleVerifyPayment = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((rc) => {
        if (rc.id === receiptId) {
          return {
            ...rc,
            verificationStatus: 'verified',
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Staff: James Ward (Audit Desk)',
          };
        }
        return rc;
      })
    );
    showToast('Payment verified successfully. Room rent marked as fully cleared.');
  };

  // 2. Verify Payment with Overpayment Refund Generation
  const handleVerifyWithRefund = (receiptId: string) => {
    const rc = receipts.find((r) => r.id === receiptId);
    if (!rc) return;

    const tenant = tenants.find((t) => t.id === rc.tenantId);
    const surplus = rc.ocrData.detectedAmount - rc.rentDueAmount;
    const newRefundId = `REF-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Mark receipt verified
    setReceipts((prev) =>
      prev.map((item) => {
        if (item.id === receiptId) {
          return {
            ...item,
            verificationStatus: 'verified',
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Staff: James Ward (Audit Desk)',
            refundRequestId: newRefundId,
          };
        }
        return item;
      })
    );

    // Create automatic refund request
    const newRefund: RefundRequest = {
      id: newRefundId,
      receiptId: rc.id,
      tenantId: rc.tenantId,
      tenantName: tenant?.name || 'Unknown',
      roomNumber: rc.roomNumber,
      billingMonth: rc.billingMonth,
      overpaymentAmount: surplus,
      rentDueAmount: rc.rentDueAmount,
      totalPaidAmount: rc.ocrData.detectedAmount,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      staffNotes: `Automated refund request generated upon verification. Rent of $${rc.rentDueAmount.toFixed(2)} settled, surplus of $${surplus.toFixed(2)} queued for external reimbursement.`,
    };

    setRefunds((prev) => [newRefund, ...prev]);
    showToast(`Payment verified! Overpayment refund request (${newRefundId}) created for +$${surplus.toFixed(2)}.`);
  };

  // 3. Record External Refund Settlement
  const handleRecordRefund = (
    refundId: string,
    method: RefundMethod,
    externalRef: string,
    notes: string
  ) => {
    setRefunds((prev) =>
      prev.map((rf) => {
        if (rf.id === refundId) {
          return {
            ...rf,
            status: 'refunded',
            refundMethod: method,
            externalRefId: externalRef,
            staffNotes: notes,
            resolvedAt: new Date().toISOString(),
            processedBy: 'James Ward (Accounting)',
          };
        }
        return rf;
      })
    );
    showToast(`External refund ${refundId} recorded as settled via ${method}.`);
  };

  // 4. Tenant CRUD
  const handleAddTenant = (tenantData: Omit<Tenant, 'id' | 'isArchived'>) => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `t-${Date.now().toString().slice(-4)}`,
      isArchived: false,
    };
    setTenants((prev) => [newTenant, ...prev]);
    showToast(`Tenant ${newTenant.name} registered for Room ${newTenant.roomNumber}.`);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t))
    );
    showToast(`Updated rent and due date parameters for ${updatedTenant.name}.`);
  };

  const handleArchiveTenant = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, isArchived: true } : t))
    );
    showToast('Tenant archived successfully.');
  };

  const handleRestoreTenant = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, isArchived: false } : t))
    );
    showToast('Tenant restored to active roster.');
  };

  // 5. Ingest New Receipt
  const handleAddReceipt = (newReceipt: Receipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    setSelectedReceiptId(newReceipt.id);
    setActiveTab('ocr');
    showToast(`Receipt ${newReceipt.fileName} processed via ${newReceipt.ocrData.engine}.`);
  };

  // Navigation helpers
  const handleNavigateToOcr = (receiptId: string) => {
    if (receiptId) {
      setSelectedReceiptId(receiptId);
    }
    setActiveTab('ocr');
  };

  const handleNavigateToRefunds = () => {
    setActiveTab('refunds');
  };

  // Pending counts for badges in nav
  const pendingRefundCount = refunds.filter(
    (r) => r.status === 'pending_review' || r.status === 'processing'
  ).length;

  const blockedReceiptCount = receipts.filter(
    (r) =>
      r.billingMonth === selectedMonth &&
      (r.verificationStatus === 'insufficient_blocked' || r.verificationStatus === 'discrepancy')
  ).length;

  const selectedRoomTenant = tenants.find(
    (t) => !t.isArchived && t.roomNumber === selectedRoomNumber
  );
  const selectedRoomReceipt = receipts.find(
    (rc) => rc.billingMonth === selectedMonth && rc.roomNumber === selectedRoomNumber
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Strict Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        pendingRefundCount={pendingRefundCount}
        blockedReceiptCount={blockedReceiptCount}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'audit' && (
          <AuditDashboard
            tenants={tenants}
            receipts={receipts}
            refunds={refunds}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            onNavigateToOcr={handleNavigateToOcr}
            onNavigateToRefunds={handleNavigateToRefunds}
          />
        )}

        {activeTab === 'matrix' && (
          <RoomMatrix
            tenants={tenants}
            receipts={receipts}
            selectedMonth={selectedMonth}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            onSelectRoom={(roomNumber) => setSelectedRoomNumber(roomNumber)}
          />
        )}

        {activeTab === 'ocr' && (
          <ReceiptOcrViewer
            receipts={receipts}
            tenants={tenants}
            selectedReceiptId={selectedReceiptId}
            onSelectReceipt={(id) => setSelectedReceiptId(id)}
            onVerifyPayment={handleVerifyPayment}
            onVerifyWithRefund={handleVerifyWithRefund}
            onNavigateToRefunds={handleNavigateToRefunds}
          />
        )}

        {activeTab === 'tenants' && (
          <TenantManagement
            tenants={tenants}
            onAddTenant={handleAddTenant}
            onUpdateTenant={handleUpdateTenant}
            onArchiveTenant={handleArchiveTenant}
            onRestoreTenant={handleRestoreTenant}
          />
        )}

        {activeTab === 'refunds' && (
          <RefundManagement
            refunds={refunds}
            onRecordRefund={handleRecordRefund}
            onNavigateToOcr={handleNavigateToOcr}
          />
        )}
      </main>

      {/* Room Detail Drawer (when a room is selected in Room Matrix) */}
      {selectedRoomNumber && (
        <RoomDetailDrawer
          roomNumber={selectedRoomNumber}
          tenant={selectedRoomTenant}
          receipt={selectedRoomReceipt}
          selectedMonth={selectedMonth}
          onClose={() => setSelectedRoomNumber(null)}
          onNavigateToOcr={handleNavigateToOcr}
          onOpenUploadForRoom={(roomNum) => {
            setSelectedRoomNumber(null);
            setIsUploadModalOpen(true);
          }}
        />
      )}

      {/* Upload Receipt Modal */}
      {isUploadModalOpen && (
        <UploadReceiptModal
          tenants={tenants}
          onClose={() => setIsUploadModalOpen(false)}
          onAddReceipt={handleAddReceipt}
        />
      )}

      {/* Quiet, Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Sila Document Automation</span>
            <span aria-hidden="true">·</span>
            <span>Tesseract OCR & Python Parser Clearing Engine</span>
          </div>
          <div>
            <span>Audit & Verification Rules Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
