import React, { useState } from 'react';
import { FeeLedgerEntry, FeeReceipt, Student, AppUser, FeeStatus } from '../types';
import { DollarSign, Download, Receipt, Plus, AlertCircle, CheckCircle2, Clock, X, Eye } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

interface FeeLedgerModuleProps {
  feeLedgers: FeeLedgerEntry[];
  receipts: FeeReceipt[];
  students: Student[];
  currentUser: AppUser;
  onRecordPayment: (params: {
    studentId: string;
    amount: number;
    paymentMethod: FeeReceipt['paymentMethod'];
    transactionRef: string;
    notes?: string;
  }) => { success: boolean; receipt?: FeeReceipt; error?: string };
  onViewReceipt: (receipt: FeeReceipt) => void;
}

export const FeeLedgerModule: React.FC<FeeLedgerModuleProps> = ({
  feeLedgers,
  receipts,
  students,
  currentUser,
  onRecordPayment,
  onViewReceipt
}) => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'RECEIPTS' | 'OVERDUE'>('LEDGER');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<string>(students[0]?.studentId || '');
  const [payAmount, setPayAmount] = useState<number>(1000);
  const [payMethod, setPayMethod] = useState<FeeReceipt['paymentMethod']>('Bank Transfer');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const canEdit = currentUser.role === 'ADMIN';

  // Overdue count and amount
  const overdueEntries = feeLedgers.filter(f => f.status === 'Overdue');
  const totalOverdueAmount = overdueEntries.reduce((acc, f) => acc + f.balanceAmount, 0);
  const totalCollected = feeLedgers.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalReceivables = feeLedgers.reduce((acc, f) => acc + f.totalFees, 0);

  // Filtered view based on tab
  const displayedLedgers = activeTab === 'OVERDUE'
    ? overdueEntries
    : feeLedgers;

  const handleOpenPayment = (studentId?: string) => {
    if (studentId) {
      setSelectedStudentForPay(studentId);
      const ledger = feeLedgers.find(f => f.studentId === studentId);
      if (ledger) {
        setPayAmount(ledger.balanceAmount > 0 ? ledger.balanceAmount : 500);
      }
    } else {
      setSelectedStudentForPay(students[0]?.studentId || '');
      setPayAmount(1000);
    }
    setPayRef(`TX-${Date.now().toString().slice(-6)}`);
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (payAmount <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }

    const res = onRecordPayment({
      studentId: selectedStudentForPay,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      transactionRef: payRef.trim() || `TX-${Date.now().toString().slice(-6)}`,
      notes: payNotes
    });

    if (!res.success) {
      setPaymentError(res.error || 'Payment processing failed.');
    } else {
      setIsPaymentModalOpen(false);
      if (res.receipt) {
        onViewReceipt(res.receipt);
      }
    }
  };

  const handleExportCsv = () => {
    if (activeTab === 'RECEIPTS') {
      const exportData = receipts.map(r => ({
        ReceiptID: r.receiptId,
        StudentID: r.studentId,
        StudentName: r.studentName,
        AmountPaid: `$${r.amount.toFixed(2)}`,
        PaymentMethod: r.paymentMethod,
        TransactionRef: r.transactionRef,
        IssuedAt: r.issuedAt,
        ReceivedBy: r.receivedBy,
        Notes: r.notes || ''
      }));
      exportToCsv('fee_receipts_register', exportData);
    } else {
      const exportData = displayedLedgers.map(f => {
        const student = students.find(s => s.studentId === f.studentId);
        return {
          LedgerID: f.ledgerId,
          StudentID: f.studentId,
          StudentName: student?.fullName || '',
          Department: student?.department || '',
          Semester: f.semester,
          TotalFees: `$${f.totalFees.toFixed(2)}`,
          PaidAmount: `$${f.paidAmount.toFixed(2)}`,
          BalanceRemaining: `$${f.balanceAmount.toFixed(2)}`,
          DueDate: f.dueDate,
          Status: f.status,
          LastPaymentDate: f.lastPaymentDate || 'None'
        };
      });
      exportToCsv('student_fee_ledger', exportData);
    }
  };

  const renderFeeStatusBadge = (status: FeeStatus) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">Settled</span>;
      case 'Partial':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">Partial</span>;
      case 'Overdue':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]">Overdue</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1E293B]">Bursar Fee Ledger & Payment Receipts</h2>
          <p className="text-xs text-slate-500">
            Tuition reconciliation, accounts receivable, and instant transaction vouchers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={() => handleOpenPayment()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Fee Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Total Tuition Assessed</span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            ${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Academic Year 2024-2025</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Total Collections Recorded</span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            {((totalCollected / totalReceivables) * 100).toFixed(1)}% collection recovery
          </span>
        </div>

        <div className={`p-3.5 rounded-md border ${overdueEntries.length > 0 ? 'bg-[#FFF5F5] border-[#FECDD3]' : 'bg-white border-[#E2E8F0]'}`}>
          <span className="text-[11px] font-medium text-slate-500 block">Outstanding Overdue Balance</span>
          <span className="text-xl font-bold font-mono text-[#9F1239] mt-1 block">
            ${totalOverdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#9F1239] mt-0.5 block font-medium">
            {overdueEntries.length} delinquent account(s)
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F1EFEA] rounded-md w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-3 py-1.5 rounded-sm transition-colors ${
            activeTab === 'LEDGER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Accounts ({feeLedgers.length})
        </button>
        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
            activeTab === 'OVERDUE' ? 'bg-white text-[#9F1239] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Overdue Isolation</span>
          {overdueEntries.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#FFE4E6] text-[#9F1239] text-[10px] rounded-xs font-mono font-bold">
              {overdueEntries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`px-3 py-1.5 rounded-sm transition-colors ${
            activeTab === 'RECEIPTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Issued Receipts Log ({receipts.length})
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
        {activeTab !== 'RECEIPTS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold">
                  <th className="py-2.5 px-3 font-mono">Ledger ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3 text-right">Total Fees</th>
                  <th className="py-2.5 px-3 text-right">Paid to Date</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Due Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {displayedLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No fee records found in this view.
                    </td>
                  </tr>
                ) : (
                  displayedLedgers.map((f, idx) => {
                    const student = students.find(s => s.studentId === f.studentId);
                    const isEven = idx % 2 === 1;

                    return (
                      <tr key={f.ledgerId} className={`hover:bg-[#F4F1EC] ${isEven ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{f.ledgerId}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 block">{student?.fullName || f.studentId}</span>
                          <span className="text-[11px] font-mono text-slate-500">{f.studentId} · {student?.department}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          ${f.totalFees.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                          ${f.paidAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                          <span className={f.balanceAmount > 0 ? 'text-[#9F1239]' : 'text-slate-500'}>
                            ${f.balanceAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600 text-[11px]">
                          {f.dueDate}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {renderFeeStatusBadge(f.status)}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {canEdit && f.balanceAmount > 0 ? (
                            <button
                              onClick={() => handleOpenPayment(f.studentId)}
                              className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
                            >
                              Collect Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold">
                  <th className="py-2.5 px-3 font-mono">Receipt No.</th>
                  <th className="py-2.5 px-3">Student Name & ID</th>
                  <th className="py-2.5 px-3 text-right">Amount Paid</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 font-mono">Transaction Ref</th>
                  <th className="py-2.5 px-3">Issued Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Receipt Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No payment receipts generated yet.
                    </td>
                  </tr>
                ) : (
                  receipts.map((r, idx) => {
                    const isEven = idx % 2 === 1;

                    return (
                      <tr key={r.receiptId} className={`hover:bg-[#F4F1EC] ${isEven ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
                        <td className="py-2.5 px-3 font-mono text-slate-900 font-semibold">{r.receiptId}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 block">{r.studentName}</span>
                          <span className="text-[11px] font-mono text-slate-500">{r.studentId}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                          ${r.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {r.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {r.transactionRef}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {r.issuedAt}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onViewReceipt(r)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Voucher</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Tuition Payment</h3>
                <p className="text-xs text-slate-500">Issues university bursar voucher and updates ledger</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentError && (
              <div className="mb-3 p-2.5 bg-[#FFE4E6] border border-[#FECDD3] text-xs text-[#9F1239] rounded-md">
                {paymentError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Account</label>
                <select
                  value={selectedStudentForPay}
                  onChange={(e) => {
                    setSelectedStudentForPay(e.target.value);
                    const ledger = feeLedgers.find(f => f.studentId === e.target.value);
                    if (ledger && ledger.balanceAmount > 0) {
                      setPayAmount(ledger.balanceAmount);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                >
                  {students.map(s => {
                    const l = feeLedgers.find(f => f.studentId === s.studentId);
                    return (
                      <option key={s.studentId} value={s.studentId}>
                        {s.studentId} - {s.fullName} (Balance: ${l?.balanceAmount.toFixed(2) || '0.00'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid ($)</label>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as FeeReceipt['paymentMethod'])}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cashier Cash</option>
                    <option value="Cheque">Banker's Cheque</option>
                    <option value="Scholarship Voucher">Scholarship Voucher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-88912-CHASE"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bursar Notes / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Term installment paid in full"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
