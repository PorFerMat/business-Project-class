import React from 'react';
import { FileSpreadsheet, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'audit' | 'matrix' | 'ocr' | 'tenants' | 'refunds';
  setActiveTab: (tab: 'audit' | 'matrix' | 'ocr' | 'tenants' | 'refunds') => void;
  onOpenUpload: () => void;
  pendingRefundCount: number;
  blockedReceiptCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  pendingRefundCount,
  blockedReceiptCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              S
            </div>
            <a
              href="#audit"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('audit');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
            >
              Sila Document Automation
            </a>
          </div>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab('audit')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'audit'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Audit Report
              {activeTab === 'audit' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'matrix'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Room Matrix
              {activeTab === 'matrix' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ocr')}
              className={`transition-colors whitespace-nowrap py-1 relative flex items-center gap-1.5 ${
                activeTab === 'ocr'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Receipt OCR & Verify
              {blockedReceiptCount > 0 && (
                <span className="text-[11px] font-mono font-medium text-rose-600 bg-rose-50 px-1.5 rounded">
                  {blockedReceiptCount} flagged
                </span>
              )}
              {activeTab === 'ocr' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('tenants')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'tenants'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tenants
              {activeTab === 'tenants' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('refunds')}
              className={`transition-colors whitespace-nowrap py-1 relative flex items-center gap-1.5 ${
                activeTab === 'refunds'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Refunds
              {pendingRefundCount > 0 && (
                <span className="text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-1.5 rounded">
                  {pendingRefundCount} pending
                </span>
              )}
              {activeTab === 'refunds' && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs active:translate-y-px"
            >
              <Plus className="w-4 h-4" />
              Upload Receipt
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
