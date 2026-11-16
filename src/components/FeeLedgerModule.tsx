import React, { useState } from 'react';
import { FeeLedgerEntry, FeeReceipt, Student, AppUser, FeeStatus } from '../types';
import { 
  Download, Receipt, Plus, AlertCircle, CheckCircle2, 
  Clock, X, Eye, FileText, ChevronRight, ShieldCheck, CreditCard, 
  ArrowUpRight, Building2, Calendar
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import { formatINR } from '../utils/currency';

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

  // Slide-Over Split-Pane Drawer State
  const [drawerLedger, setDrawerLedger] = useState<FeeLedgerEntry | null>(null);

  const canEdit = currentUser.role === 'ADMIN';

  // Overdue count and amount calculations
  const overdueEntries = feeLedgers.filter(f => f.status === 'Overdue');
  const totalOverdueAmount = overdueEntries.reduce((acc, f) => acc + f.balanceAmount, 0);
  const totalCollected = feeLedgers.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalReceivables = feeLedgers.reduce((acc, f) => acc + f.totalFees, 0);

  // Filtered view based on active tab
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
      // If drawer is open, keep it updated
      if (drawerLedger && drawerLedger.studentId === selectedStudentForPay) {
        const updated = feeLedgers.find(f => f.studentId === selectedStudentForPay);
        if (updated) setDrawerLedger(updated);
      }
    }
  };

  const handleExportCsv = () => {
    if (activeTab === 'RECEIPTS') {
      const exportData = receipts.map(r => ({
        ReceiptID: r.receiptId,
        StudentID: r.studentId,
        StudentName: r.studentName,
        AmountPaid: formatINR(r.amount),
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
          TotalFees: formatINR(f.totalFees),
          PaidAmount: formatINR(f.paidAmount),
          BalanceRemaining: formatINR(f.balanceAmount),
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
        return <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">Settled</span>;
      case 'Partial':
        return <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-amber-50 text-amber-800 border border-amber-200">Partial</span>;
      case 'Overdue':
        return <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-rose-50 text-rose-800 border border-rose-200">Overdue</span>;
    }
  };

  // Selected student for drawer
  const drawerStudent = drawerLedger ? students.find(s => s.studentId === drawerLedger.studentId) : null;
  const drawerReceipts = drawerLedger ? receipts.filter(r => r.studentId === drawerLedger.studentId) : [];

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bento-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-[#0F172A] font-heading">
              Bursar Office · Student Fee Ledger & Payment Register
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Tuition reconciliation, accounts receivable ledgers, and official bursar receipt vouchers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={() => handleOpenPayment()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] rounded-md hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Fee Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bento-card p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Total Tuition Assessed
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {formatINR(totalReceivables)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Academic Year 2024-2025 · All Cohorts
          </span>
        </div>

        <div className="bento-card p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Collections Recorded
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
            {formatINR(totalCollected)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {totalReceivables > 0 ? ((totalCollected / totalReceivables) * 100).toFixed(1) : 0}% collection rate
          </span>
        </div>

        <div className={`p-4 rounded-md border ${
          overdueEntries.length > 0 ? 'bg-rose-50/70 border-rose-200' : 'bento-card'
        }`}>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Outstanding Overdue Balance
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-rose-800 mt-1 block">
            {formatINR(totalOverdueAmount)}
          </span>
          <span className="text-[11px] text-rose-700 mt-1 block font-medium">
            {overdueEntries.length} delinquent student account(s)
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'LEDGER' ? 'bg-white text-slate-900 shadow-2xs border border-[#CBD5E1]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Accounts ({feeLedgers.length})
        </button>
        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'OVERDUE' ? 'bg-white text-rose-800 shadow-2xs border border-[#CBD5E1]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Overdue Isolation</span>
          {overdueEntries.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] rounded font-mono font-bold">
              {overdueEntries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'RECEIPTS' ? 'bg-white text-slate-900 shadow-2xs border border-[#CBD5E1]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Issued Receipts Log ({receipts.length})
        </button>
      </div>

      {/* Main Table with Perfect Tabular-Numeric Alignment */}
      <div className="bento-card overflow-hidden">
        {activeTab !== 'RECEIPTS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3 font-mono text-left w-24">Ledger ID</th>
                  <th className="py-3 px-3 text-left">Student Information</th>
                  <th className="py-3 px-3 text-right font-mono w-28">Total Billed</th>
                  <th className="py-3 px-3 text-right font-mono w-28">Paid to Date</th>
                  <th className="py-3 px-3 text-right font-mono w-28">Balance Due</th>
                  <th className="py-3 px-3 text-center font-mono w-28">Due Date</th>
                  <th className="py-3 px-3 text-center w-24">Status</th>
                  <th className="py-3 px-3 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {displayedLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No fee records found in this view.
                    </td>
                  </tr>
                ) : (
                  displayedLedgers.map((f, idx) => {
                    const student = students.find(s => s.studentId === f.studentId);
                    const isEven = idx % 2 === 1;

                    return (
                      <tr 
                        key={f.ledgerId} 
                        className={`hover:bg-blue-50/40 transition-colors ${isEven ? 'bg-[#FCFBF9]' : 'bg-white'}`}
                      >
                        {/* Ledger ID: left-aligned font-mono */}
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px] font-medium">
                          {f.ledgerId}
                        </td>

                        {/* Student Details: left-aligned */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setDrawerLedger(f)}
                            className="text-left font-semibold text-slate-900 hover:text-blue-600 block transition-colors cursor-pointer"
                          >
                            {student?.fullName || f.studentId}
                          </button>
                          <span className="text-[11px] font-mono text-slate-500">
                            {f.studentId} · {student?.department || 'Department of Engineering'}
                          </span>
                        </td>

                        {/* Total Fees: right-aligned font-mono tabular-nums */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 font-medium">
                          {formatINR(f.totalFees)}
                        </td>

                        {/* Paid Amount: right-aligned font-mono tabular-nums */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                          {formatINR(f.paidAmount)}
                        </td>

                        {/* Balance Remaining: right-aligned font-mono tabular-nums */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                          <span className={f.balanceAmount > 0 ? 'text-rose-700' : 'text-slate-500'}>
                            {formatINR(f.balanceAmount)}
                          </span>
                        </td>

                        {/* Due Date: center-aligned font-mono tabular-nums */}
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600 text-[11px]">
                          {f.dueDate}
                        </td>

                        {/* Status Badge: center-aligned */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {renderFeeStatusBadge(f.status)}
                        </td>

                        {/* Actions: right-aligned with Drawer Split Pane trigger */}
                        <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setDrawerLedger(f)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold cursor-pointer transition-colors"
                            title="Inspect itemized fee breakdown & receipt history in slide-over drawer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Breakdown</span>
                          </button>

                          {canEdit && f.balanceAmount > 0 ? (
                            <button
                              onClick={() => handleOpenPayment(f.studentId)}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors"
                            >
                              <span>Collect</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Settled</span>
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
          /* Receipts Table with Tabular Numerals */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3 font-mono text-left w-28">Receipt No.</th>
                  <th className="py-3 px-3 text-left">Student Account</th>
                  <th className="py-3 px-3 text-right font-mono w-28">Amount Paid</th>
                  <th className="py-3 px-3 text-left">Payment Method</th>
                  <th className="py-3 px-3 font-mono text-left">Transaction Ref</th>
                  <th className="py-3 px-3 font-mono text-center">Issued At</th>
                  <th className="py-3 px-3 text-right w-32">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No payment receipts generated yet.
                    </td>
                  </tr>
                ) : (
                  receipts.map((r, idx) => {
                    const isEven = idx % 2 === 1;

                    return (
                      <tr key={r.receiptId} className={`hover:bg-blue-50/40 transition-colors ${isEven ? 'bg-[#FCFBF9]' : 'bg-white'}`}>
                        <td className="py-3 px-3 font-mono text-slate-900 font-semibold">{r.receiptId}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">{r.studentName}</span>
                          <span className="text-[11px] font-mono text-slate-500">{r.studentId}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                          {formatINR(r.amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {r.paymentMethod}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {r.transactionRef}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                          {r.issuedAt}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onViewReceipt(r)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline"
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

      {/* =========================================================================
          SLIDE-OVER SPLIT-PANE DRAWER: Comprehensive Fee Statement & Breakdown
         ========================================================================= */}
      {drawerLedger && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setDrawerLedger(null)} />

          <aside 
            className="w-full max-w-xl bg-white border-l border-[#E2E8F0] shadow-2xl h-full flex flex-col justify-between overflow-y-auto animate-slide-in-right z-10"
            aria-label="Student Fee Account Breakdown"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {drawerLedger.studentId}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Ledger: {drawerLedger.ledgerId}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  {drawerStudent?.fullName || drawerLedger.studentId}
                </h3>
                <span className="text-xs text-slate-500 block">
                  {drawerStudent?.department} · Academic Term: {drawerLedger.semester}
                </span>
              </div>

              <button
                onClick={() => setDrawerLedger(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Account Standing Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Total Assessed</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900 block mt-0.5">
                    {formatINR(drawerLedger.totalFees)}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md">
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase block">Total Paid</span>
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-800 block mt-0.5">
                    {formatINR(drawerLedger.paidAmount)}
                  </span>
                </div>
                <div className={`p-3 rounded-md border ${
                  drawerLedger.balanceAmount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-semibold text-rose-700 uppercase block">Balance Due</span>
                  <span className="text-base font-bold font-mono tabular-nums text-rose-800 block mt-0.5">
                    {formatINR(drawerLedger.balanceAmount)}
                  </span>
                </div>
              </div>

              {/* Itemized Bursar Fee Schedule Breakdown */}
              <div className="bento-card p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>Itemized Fee Schedule Breakdown</span>
                  <span className="text-[10px] text-slate-500 font-mono">Bursar Audit</span>
                </h4>

                <div className="space-y-2 text-xs divide-y divide-[#F1EFEA]">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Base Instructional Tuition (16 Credits)</span>
                    <span className="font-mono tabular-nums text-slate-900 font-semibold">
                      {formatINR(drawerLedger.totalFees * 0.75)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Engineering Laboratory & Compute Facilities</span>
                    <span className="font-mono tabular-nums text-slate-900 font-semibold">
                      {formatINR(drawerLedger.totalFees * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Digital Library & IEEE Access Subscriptions</span>
                    <span className="font-mono tabular-nums text-slate-900 font-semibold">
                      {formatINR(drawerLedger.totalFees * 0.05)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Student Healthcare & Campus Infrastructure</span>
                    <span className="font-mono tabular-nums text-slate-900 font-semibold">
                      {formatINR(drawerLedger.totalFees * 0.05)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 text-emerald-700 font-medium">
                    <span>Merit Scholarship Credit Deduction</span>
                    <span className="font-mono tabular-nums">-{formatINR(0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-sm">
                    <span className="text-slate-900">Total Billed Liability</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {formatINR(drawerLedger.totalFees)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History & Associated Vouchers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Payment Receipts & Audit Trail ({drawerReceipts.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Last: {drawerLedger.lastPaymentDate || 'None'}
                  </span>
                </div>

                {drawerReceipts.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center text-xs text-slate-500">
                    No payment receipts issued for this account yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {drawerReceipts.map(r => (
                      <div 
                        key={r.receiptId} 
                        className="p-3 bg-white border border-[#E2E8F0] rounded-md flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{r.receiptId}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {r.paymentMethod}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                            Ref: {r.transactionRef} · {r.issuedAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono tabular-nums font-bold text-emerald-700 text-sm">
                            {formatINR(r.amount)}
                          </span>
                          <button
                            onClick={() => onViewReceipt(r)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                            title="Inspect Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Warning & Due Date */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-3 text-xs">
                <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Due Date: {drawerLedger.dueDate}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Unsettled student account balances after this date may restrict course registration and transcript issuance in accordance with Academic Affairs policy.
                  </p>
                </div>
              </div>

            </div>

            {/* Drawer Action Footer */}
            <div className="p-5 border-t border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerLedger(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Close Drawer
              </button>

              {canEdit && drawerLedger.balanceAmount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPayment(drawerLedger.studentId);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Remaining Balance ({formatINR(drawerLedger.balanceAmount)})</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Record Tuition Payment</h3>
                <p className="text-xs text-slate-500">Issues university bursar voucher and updates ledger</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-md">
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
                  className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md bg-white font-medium"
                >
                  {students.map(s => {
                    const l = feeLedgers.find(f => f.studentId === s.studentId);
                    return (
                      <option key={s.studentId} value={s.studentId}>
                        {s.studentId} - {s.fullName} (Balance: {formatINR(l?.balanceAmount || 0)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 font-mono tabular-nums border border-[#CBD5E1] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as FeeReceipt['paymentMethod'])}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md bg-white font-medium"
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
                  className="w-full px-2.5 py-1.5 font-mono border border-[#CBD5E1] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bursar Notes / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Term installment paid in full"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-md cursor-pointer shadow-xs"
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
