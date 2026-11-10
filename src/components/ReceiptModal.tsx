import React from 'react';
import { FeeReceipt, FeeLedgerEntry } from '../types';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import crestImage from '../assets/images/university_crest_1791475297419.jpg';

interface ReceiptModalProps {
  receipt: FeeReceipt;
  ledger?: FeeLedgerEntry;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  ledger,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-[#CBD5E1] rounded-md shadow-2xl overflow-hidden my-6">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-[#1E293B] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Official University Bursar Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Voucher */}
        <div className="p-8 text-slate-900 bg-white">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <img
                src={crestImage}
                alt="Institute Seal"
                className="w-12 h-12 rounded-full border border-slate-300 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 leading-tight">
                  Metropolitan University
                </h2>
                <p className="text-[11px] text-slate-600 font-serif italic">
                  Office of the Bursar & Student Accounts
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-slate-900 block">
                {receipt.receiptId}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {receipt.issuedAt}
              </span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-4 bg-[#FAF8F5] border border-slate-300 rounded-md mb-5 text-center">
            <span className="text-[11px] text-slate-500 font-mono uppercase block">Total Amount Received</span>
            <span className="text-3xl font-extrabold font-mono text-slate-900 mt-1 block">
              ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
              Payment Status: Confirmed & Reconciled
            </span>
          </div>

          {/* Student & Transaction Metadata */}
          <div className="space-y-2.5 text-xs mb-6 font-mono border-t border-b border-slate-200 py-3.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Student Account:</span>
              <span className="font-bold text-slate-900 font-sans">{receipt.studentName} ({receipt.studentId})</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-bold text-slate-800">{receipt.paymentMethod}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Reference:</span>
              <span className="font-bold text-slate-800">{receipt.transactionRef}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Received By:</span>
              <span className="text-slate-800">{receipt.receivedBy}</span>
            </div>

            {ledger && (
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Remaining Term Balance:</span>
                <span className={`font-bold ${ledger.balanceAmount > 0 ? 'text-[#9F1239]' : 'text-emerald-700'}`}>
                  ${ledger.balanceAmount.toFixed(2)}
                </span>
              </div>
            )}

            {receipt.notes && (
              <div className="pt-1 text-[11px] text-slate-600 font-sans italic">
                Note: {receipt.notes}
              </div>
            )}
          </div>

          {/* Verification Stamp & Sign-off */}
          <div className="flex items-end justify-between pt-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
              <div>
                <span className="font-bold text-slate-800 block">OFFICIALLY RECORDED</span>
                <span>Audit Ref: SEC-{receipt.receiptId.replace('RCPT-', '')}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1 ml-auto"></div>
              <span className="text-slate-800 font-serif font-bold block">Authorized Bursar Cashier</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
