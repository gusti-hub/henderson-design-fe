import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Upload, Download, ChevronDown, ChevronRight,
  FileSpreadsheet, Lock
} from 'lucide-react';
import { backendServer } from '../utils/info';

const RESTRICTED_EMAIL = 'agustianggaraputra@gmail.com';

// Groups the 33 raw sheet names into the 10 numbered reports from the source
// workbook, so the UI reads as "Report 1 ... Report 10" instead of a flat
// list of 33 tables.
const REPORT_GROUPS = [
  { title: 'Report 1 – Business Development Pipeline', sheets: ['#1 Pipeline Summary', 'High Prob', 'Medium Prob', 'Low Prob'] },
  { title: 'Report 2 – Revenue Projection', sheets: ['#2 Summary', 'Developer Revenue', 'Retail Revenue'] },
  { title: 'Report 3 – Active Client Revenue', sheets: ['#3 Summary', 'Active Client Revenue'] },
  { title: 'Report 4 – Bank Balances', sheets: ['#4 Summary', 'Bank Balances'] },
  { title: 'Report 5 – Debt & Credit Cards', sheets: ['#5 Summary', 'Debt & Credit Cards'] },
  { title: 'Report 6 – Monthly Expenses', sheets: ['#6 Monthly Expense Summary', 'HDG Expense Detail', 'Exporio Expense Detail', 'Nohie Expense Detail'] },
  { title: 'Report 7 – Headcount & Reviews', sheets: ['Reviews & PTO', 'Based On Started Date '] },
  { title: 'Report 8 – Accounts Receivable', sheets: ['#8 AR Summary', 'AR Customer Detail', '8.1 Alia Revenue Estimate', '8.2 Kuilei Revenue Estimate', '8.3 Retail Revenue Estimate'] },
  { title: 'Report 9 – Accounts Payable', sheets: ['#9 AP Summary', 'Payable Detail', '9.1 Alia Costimate', '9.2 Kuilei Costimate', '9.3 Retail Costimate'] },
  { title: 'Report 10 – Taxes', sheets: ['#10 Tax Summary', 'Tax Detail'] },
];

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatCellValue = (v) => {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') {
    return Math.abs(v) >= 1000 || (!Number.isInteger(v) && Math.abs(v) < 1)
      ? v.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : String(v);
  }
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    const d = new Date(v);
    if (!isNaN(d)) return d.toLocaleDateString();
  }
  return String(v);
};

// A row on "Executive Dashboard" is a KPI if it has a text label and a
// numeric value somewhere among its non-empty cells (section-header rows
// only have text; stray note rows only have one value).
const extractKpis = (sheet) => {
  if (!sheet) return [];
  const kpis = [];
  for (const row of sheet.rows) {
    const values = Object.values(row).filter((v) => v !== null && v !== undefined && v !== '');
    const label = values.find((v) => typeof v === 'string');
    const value = values.find((v) => typeof v === 'number');
    if (label && value !== undefined) kpis.push({ label, value });
  }
  return kpis;
};

const FinancialReviewSection = () => {
  const userEmail = localStorage.getItem('email');
  const [snapshots, setSnapshots] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const loadList = useCallback(async () => {
    const res = await fetch(`${backendServer}/api/financial-review`, { headers: authHeaders() });
    if (res.ok) setSnapshots(await res.json());
  }, []);

  const loadSnapshot = useCallback(async (id) => {
    setLoading(true);
    try {
      const url = id
        ? `${backendServer}/api/financial-review/${id}`
        : `${backendServer}/api/financial-review/latest`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok) {
        setCurrent(await res.json());
      } else if (res.status !== 404) {
        setError('Failed to load financial review data');
      }
    } catch (e) {
      console.error('Error loading financial review:', e);
      setError('Failed to load financial review data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userEmail !== RESTRICTED_EMAIL) return;
    loadList();
    loadSnapshot();
  }, [userEmail, loadList, loadSnapshot]);

  if (userEmail !== RESTRICTED_EMAIL) return null;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${backendServer}/api/financial-review/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Upload failed');
      }
      const snapshot = await res.json();
      setCurrent(snapshot);
      await loadList();
    } catch (err) {
      console.error('Error uploading financial review:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleGroup = (title) => setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  const execSheet = current?.sheets?.find((s) => s.name === 'Executive Dashboard');
  const kpis = extractKpis(execSheet);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-xl flex items-center justify-center shadow-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Review</h1>
            <p className="text-sm text-gray-600 mt-1">Visible only to you · report date {formatDate(current?.reportDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {snapshots.length > 0 && (
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={current?._id || ''}
              onChange={(e) => loadSnapshot(e.target.value)}
            >
              {snapshots.map((s) => (
                <option key={s._id} value={s._id}>{formatDate(s.reportDate)}</option>
              ))}
            </select>
          )}

          {current?.file?.url && (
            <a
              href={`${backendServer}/api/financial-review/${current._id}/download`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 bg-white"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          )}

          <label className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            uploading ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white hover:shadow-lg'
          }`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload weekly report
            <input type="file" accept=".xlsx" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
        </div>
      ) : !current ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No weekly report uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload the HDG Weekly Financial Review Package to get started.</p>
        </div>
      ) : (
        <>
          {kpis.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCellValue(kpi.value)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {REPORT_GROUPS.map((group) => {
              const groupSheets = group.sheets
                .map((name) => current.sheets.find((s) => s.name === name))
                .filter(Boolean);
              if (groupSheets.length === 0) return null;
              const isOpen = !!expanded[group.title];

              return (
                <div key={group.title} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="font-semibold text-gray-800 text-sm">{group.title}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 space-y-6">
                      {groupSheets.map((sheet) => (
                        <SheetTable key={sheet.name} sheet={sheet} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const SheetTable = ({ sheet }) => (
  <div>
    <h4 className="text-sm font-bold text-gray-700 mb-2">{sheet.name.trim()}</h4>
    {sheet.rows.length === 0 ? (
      <p className="text-xs text-gray-400">No data</p>
    ) : (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {sheet.headers.map((h) => (
                <th key={h} className="px-3 py-2 text-left font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sheet.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {sheet.headers.map((h) => (
                  <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {formatCellValue(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default FinancialReviewSection;
