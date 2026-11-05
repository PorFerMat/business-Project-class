import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Scan, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { Tenant, ReceiptFileFormat, Receipt } from '../types';

interface UploadReceiptModalProps {
  tenants: Tenant[];
  onClose: () => void;
  onAddReceipt: (newReceipt: Receipt) => void;
}

export const UploadReceiptModal: React.FC<UploadReceiptModalProps> = ({
  tenants,
  onClose,
  onAddReceipt,
}) => {
  const activeTenants = tenants.filter((t) => !t.isArchived);

  const [selectedTenantId, setSelectedTenantId] = useState<string>(activeTenants[0]?.id || '');
  const [billingMonth, setBillingMonth] = useState<string>('2026-11');
  const [selectedFormat, setSelectedFormat] = useState<ReceiptFileFormat>('JPG');
  const [fileName, setFileName] = useState<string>('scanned_receipt_nov2026.jpg');
  const [fileSizeKb, setFileSizeKb] = useState<number>(450);
  const [manualAmount, setManualAmount] = useState<number>(1400);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrStep, setOcrStep] = useState<string>('');

  const selectedTenant = activeTenants.find((t) => t.id === selectedTenantId) || activeTenants[0];

  // Update default manual amount when tenant changes
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const t = activeTenants.find((x) => x.id === tenantId);
    if (t) {
      setManualAmount(t.monthlyRent);
    }
  };

  // Pre-configured Test Presets
  const applyPreset = (type: 'match' | 'insufficient' | 'overpayment' | 'xlsx') => {
    if (type === 'match') {
      const t = activeTenants.find((x) => x.roomNumber === 'A-302') || activeTenants[0];
      setSelectedTenantId(t.id);
      setSelectedFormat('JPG');
      setFileName(`chase_wire_slip_${t.roomNumber.toLowerCase()}.jpg`);
      setManualAmount(t.monthlyRent); // Exact match
    } else if (type === 'insufficient') {
      const t = activeTenants.find((x) => x.roomNumber === 'A-304') || activeTenants[0];
      setSelectedTenantId(t.id);
      setSelectedFormat('PDF_SCANNED');
      setFileName(`partial_deposit_slip_${t.roomNumber.toLowerCase()}.pdf`);
      setManualAmount(t.monthlyRent - 300); // $300 shortfall
    } else if (type === 'overpayment') {
      const t = activeTenants.find((x) => x.roomNumber === 'A-303') || activeTenants[0];
      setSelectedTenantId(t.id);
      setSelectedFormat('PNG');
      setFileName(`wells_fargo_overpay_${t.roomNumber.toLowerCase()}.png`);
      setManualAmount(t.monthlyRent + 200); // $200 overpayment
    } else if (type === 'xlsx') {
      const t = activeTenants.find((x) => x.roomNumber === 'B-102') || activeTenants[0];
      setSelectedTenantId(t.id);
      setSelectedFormat('XLSX');
      setFileName(`merchant_batch_export_b102.xlsx`);
      setManualAmount(t.monthlyRent);
    }
  };

  const handleStartUpload = () => {
    if (!selectedTenant) return;

    setIsProcessing(true);
    setOcrStep('1/3: Reading binary file buffer...');

    setTimeout(() => {
      setOcrStep(
        selectedFormat === 'XLSX' || selectedFormat === 'XLS' || selectedFormat === 'TXT'
          ? '2/3: Invoking Python openpyxl & pypdf parser...'
          : '2/3: Executing Tesseract OCR 5.3 binarization & text segmentation...'
      );
    }, 700);

    setTimeout(() => {
      setOcrStep('3/3: Reconciling extracted figure against contract rent balance...');
    }, 1400);

    setTimeout(() => {
      const expectedRent = selectedTenant.monthlyRent;
      const detectedAmount = manualAmount;
      const diff = detectedAmount - expectedRent;

      let verificationStatus: Receipt['verificationStatus'] = 'pending_review';
      let blockedReason: string | undefined = undefined;

      if (Math.abs(diff) < 0.01) {
        verificationStatus = 'pending_review'; // ready for 1-click verify
      } else if (diff < -0.01) {
        verificationStatus = 'insufficient_blocked';
        blockedReason = `Extracted payment of $${detectedAmount.toFixed(2)} is $${Math.abs(diff).toFixed(2)} less than outstanding balance ($${expectedRent.toFixed(2)}). Verification blocked by system rule.`;
      } else {
        verificationStatus = 'overpayment_pending';
      }

      const engineName =
        selectedFormat === 'XLSX' || selectedFormat === 'XLS'
          ? 'Python pypdf / openpyxl'
          : selectedFormat === 'TXT'
          ? 'Python text parser'
          : 'Tesseract OCR 5.3';

      const newReceipt: Receipt = {
        id: `rcpt-${Date.now().toString().slice(-4)}`,
        tenantId: selectedTenant.id,
        roomNumber: selectedTenant.roomNumber,
        billingMonth,
        fileName,
        fileFormat: selectedFormat,
        fileSizeKb,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Staff: Upload Portal',
        rentDueAmount: expectedRent,
        paidAmount: detectedAmount,
        verificationStatus,
        blockedReason,
        ocrData: {
          detectedAmount,
          currency: 'USD',
          detectedDate: new Date().toISOString().slice(0, 10),
          transactionRef: `SLIP-${selectedFormat}-${Math.floor(100000 + Math.random() * 900000)}`,
          payerName: selectedTenant.name,
          bankName: selectedFormat === 'XLSX' ? 'Batch ACH Clearing' : 'Commercial Escrow Wire',
          confidenceScore: 98.7,
          engine: engineName,
          rawSnippet: `AUTO EXTRACTED TEXT FROM ${fileName}\nSOURCE ENGINE: ${engineName}\nPAYER: ${selectedTenant.name}\nUNIT: ${selectedTenant.roomNumber}\nSETTLED AMOUNT: $${detectedAmount.toFixed(2)} USD\nTRANSACTION STATUS: CLEARED`,
          boundingHighlights: [
            { label: 'Amount', value: `$${detectedAmount.toFixed(2)}`, box: { top: 45, left: 20, width: 35, height: 8 } },
            { label: 'Payer', value: selectedTenant.name, box: { top: 30, left: 20, width: 35, height: 6 } }
          ]
        }
      };

      setIsProcessing(false);
      onAddReceipt(newReceipt);
      onClose();
    }, 2100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Rental Payment Receipt</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tesseract OCR & Python Multi-Format Ingestion</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Quick Scenario Presets */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-800">Quick Test Presets (Instant Simulation):</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('match')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 text-left rounded-md transition-colors"
              >
                <div className="font-semibold text-emerald-800">1. Exact Match ($1,400)</div>
                <div className="text-[10px] text-slate-500">Ready to verify</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('insufficient')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-rose-500 text-left rounded-md transition-colors"
              >
                <div className="font-semibold text-rose-800">2. Insufficient (Shortfall)</div>
                <div className="text-[10px] text-slate-500">Blocked verification</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('overpayment')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-left rounded-md transition-colors"
              >
                <div className="font-semibold text-indigo-800">3. Overpayment (Surplus)</div>
                <div className="text-[10px] text-slate-500">Auto-triggers refund</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('xlsx')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-left rounded-md transition-colors"
              >
                <div className="font-semibold text-slate-800">4. Excel XLSX Batch</div>
                <div className="text-[10px] text-slate-500">Python parser engine</div>
              </button>
            </div>
          </div>

          {/* Tenant & Room Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Tenant & Unit</label>
              <select
                value={selectedTenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                {activeTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.roomNumber} - {t.name} (${t.monthlyRent})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Month</label>
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-09">September 2026</option>
              </select>
            </div>
          </div>

          {/* File Format Selection */}
          <div className="space-y-1.5">
            <label className="block font-medium text-slate-700">Supported File Format</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['JPG', 'PNG', 'PDF_SCANNED', 'PDF_TEXT', 'TXT', 'XLSX', 'XLS'] as ReceiptFileFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    setSelectedFormat(fmt);
                    setFileName(`payment_document_${fmt.toLowerCase()}.${fmt === 'PDF_SCANNED' ? 'pdf' : fmt.toLowerCase()}`);
                  }}
                  className={`px-2 py-1.5 text-xs font-mono font-medium rounded-md border text-center transition-colors ${
                    selectedFormat === fmt
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {selectedFormat === 'JPG' || selectedFormat === 'PNG' || selectedFormat === 'PDF_SCANNED'
                ? 'Processed with Tesseract OCR (optical bounding box extraction).'
                : 'Processed with Python openpyxl / pypdf tabular text extraction.'}
            </p>
          </div>

          {/* Amount on receipt for simulation */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contract Rent Balance</label>
              <div className="font-mono font-bold text-sm text-slate-900 py-1.5">
                ${selectedTenant ? selectedTenant.monthlyRent.toFixed(2) : '0.00'}
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Receipt Extracted Amount ($)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  step="10"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-3.5 bg-slate-900 text-emerald-400 rounded-lg space-y-2 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span>OCR EXTRACTION IN PROGRESS</span>
                <span className="animate-pulse">● PROCESSING</span>
              </div>
              <div className="text-xs text-white">{ocrStep}</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              Run OCR & Ingest Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
