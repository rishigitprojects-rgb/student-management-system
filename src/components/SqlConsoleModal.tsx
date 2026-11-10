import React, { useState } from 'react';
import { X, Play, Download, Terminal, Database, Check } from 'lucide-react';
import { DatabaseService } from '../db/storage';

interface SqlConsoleModalProps {
  dbService: DatabaseService;
  onClose: () => void;
}

export const SqlConsoleModal: React.FC<SqlConsoleModalProps> = ({ dbService, onClose }) => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM STUDENTS;');
  const [queryResult, setQueryResult] = useState<{
    success: boolean;
    columns: string[];
    rows: any[][];
    message?: string;
  }>({
    success: true,
    columns: ['QUERY_STATUS'],
    rows: [['Ready to execute H2 / SQLite statements. Press Run Query or choose a preset.']],
    message: 'Virtual H2 Relational Engine initialized.'
  });

  const presetQueries = [
    { label: 'All Students', sql: 'SELECT * FROM STUDENTS;' },
    { label: 'Course Catalog', sql: 'SELECT * FROM COURSES;' },
    { label: 'Fee Overdue Ledger', sql: 'SELECT * FROM FEE_LEDGER;' },
    { label: 'Grades & GPA Data', sql: 'SELECT * FROM GRADES;' },
    { label: 'Attendance Records', sql: 'SELECT * FROM ATTENDANCE;' },
    { label: 'Active Enrollments', sql: 'SELECT * FROM ENROLLMENTS;' },
  ];

  const handleExecute = () => {
    const res = dbService.executeSqlQuery(sqlQuery);
    setQueryResult(res);
  };

  const handleDownloadDump = () => {
    const dump = dbService.exportH2SqlDump();
    const blob = new Blob([dump], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `h2_university_sms_database_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-md shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#1E293B] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                H2 Embedded Relational Database Console
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Dialect: org.hibernate.dialect.H2Dialect · Schema: sms_core
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDump}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SQL Dump</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Console Workspace */}
        <div className="p-4 space-y-3 bg-[#FAF8F5]">
          
          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Sample Queries:</span>
            {presetQueries.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setSqlQuery(p.sql);
                  const res = dbService.executeSqlQuery(p.sql);
                  setQueryResult(res);
                }}
                className="px-2 py-1 text-[11px] font-mono bg-white border border-[#CBD5E1] hover:bg-slate-100 rounded-sm text-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* SQL Editor Area */}
          <div className="relative">
            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full font-mono text-xs p-3 bg-slate-950 text-emerald-400 rounded-md border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter SQL SELECT or DDL query..."
            />
            <button
              onClick={handleExecute}
              className="absolute right-3 bottom-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Query</span>
            </button>
          </div>

          {/* Execution Message */}
          {queryResult.message && (
            <div className="text-[11px] font-mono text-slate-600 flex items-center justify-between px-1">
              <span>{queryResult.message}</span>
              <span>Rows returned: {queryResult.rows.length}</span>
            </div>
          )}

          {/* Results Table */}
          <div className="bg-white border border-[#CBD5E1] rounded-md overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-mono font-semibold text-slate-700">
                  {queryResult.columns.map((col, i) => (
                    <th key={i} className="py-2 px-3 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {queryResult.rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#FAF8F5]' : 'bg-white'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 text-slate-800 whitespace-nowrap">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
          <span>In-memory relational storage layer compliant with ANSI SQL-92 / H2 Relational Database.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-semibold bg-[#1E293B] text-white hover:bg-slate-800 rounded-md"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
