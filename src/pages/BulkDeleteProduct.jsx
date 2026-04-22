// BulkDeleteProducts.jsx
// Support delete by: SKU (product_id), ITEM (name), Category
// Excel columns matched case-insensitively.
// Shows preview table + confirmation step before deleting.

import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, Loader2, Download, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Column normalizer ─────────────────────────────────────────────────────
const norm = (k) =>
  k.toString()
    .toLowerCase()
    .replace(/[\s\-\/]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

const COLUMN_MAP = {
  // SKU
  sku:        'product_id',
  product_id: 'product_id',
  sku_id:     'product_id',
  // Item name
  item:       'name',
  item_name:  'name',
  name:       'name',
  // Category
  category:   'category',
};

const parseRow = (rawRow) => {
  const out = {};
  Object.entries(rawRow).forEach(([rawKey, value]) => {
    const canonical = COLUMN_MAP[norm(rawKey)];
    if (canonical && value != null && value.toString().trim() !== '') {
      out[canonical] = value.toString().trim();
    }
  });
  return out;
};

// ─── Download template ─────────────────────────────────────────────────────
const downloadTemplate = () => {
  const headers = ['SKU', 'ITEM', 'Category'];
  const rows = [
    ['ST-11-N-0A-00-MD-19-00-00-00', 'Bench Style A',       'Bench'],
    ['ST-11-N-0A-00-DK-20-00-00-00', 'Bench Style A',       'Bench'],
    ['ST-05-N-0A-00-MD-08-00-00-00', 'Counter Stool Style A','Counter Stools'],
    ['',                              'Lounge Chair Style B', ''],   // by name only
    ['',                              '',                     'Lighting'], // by category only
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 34 }, { wch: 26 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Delete');
  XLSX.writeFile(wb, 'bulk_delete_template.xlsx');
};

// ==================== COMPONENT ====================

const BulkDeleteProducts = ({ onComplete, backendServer }) => {
  const [loading, setLoading]         = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [parsedRows, setParsedRows]   = useState([]);   // parsed from Excel
  const [detectedCols, setDetectedCols] = useState(null);
  const [step, setStep]               = useState('idle'); // idle | preview | confirm | done

  // ─── Parse Excel ──────────────────────────────────────────────────────
  const processExcel = async (file) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setParsedRows([]);
    setStep('idle');

    try {
      const data = await file.arrayBuffer();
      const wb   = XLSX.read(data, { cellDates: true, cellText: true });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rawRows.length) { setError('File is empty'); return; }

      setDetectedCols(Object.keys(rawRows[0]));

      const rows = rawRows
        .map(parseRow)
        .filter(r => r.product_id || r.name || r.category); // skip fully empty rows

      if (!rows.length) {
        setError('No valid rows found. File must have at least one of: SKU, ITEM, or Category column.');
        return;
      }

      // Validate: each row must have at least one identifier
      const invalid = rows.filter(r => !r.product_id && !r.name && !r.category);
      if (invalid.length) {
        setError(`${invalid.length} row(s) have no identifiers — each row needs at least SKU, ITEM, or Category.`);
        return;
      }

      setParsedRows(rows);
      setStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Execute delete ────────────────────────────────────────────────────
  const executeDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${backendServer}/api/products/bulk-delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: parsedRows }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete products');
      }

      const result = await res.json();
      setSuccess(`Successfully deleted ${result.deletedCount} product(s).`);
      setStep('done');
      setParsedRows([]);
      onComplete?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const reset = () => {
    setStep('idle');
    setParsedRows([]);
    setDetectedCols(null);
    setError(null);
    setSuccess(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">

      {/* Info banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-red-900">
          ⚠️ Delete products by any combination of: <strong>SKU</strong>, <strong>ITEM name</strong>, <strong>Category</strong>
        </p>
        <p className="text-xs text-red-700">
          Each row is matched as: <code className="bg-red-100 px-1 rounded">SKU AND/OR name AND/OR category</code>.
          A product must match <strong>all provided fields</strong> in that row to be deleted.
          Leave a field blank to match any value for that field.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { col: 'SKU', ex: 'ST-11-N-0A-00-MD-19-00-00-00' },
            { col: 'ITEM', ex: 'Bench Style A' },
            { col: 'Category', ex: 'Bench' },
          ].map(({ col, ex }) => (
            <span key={col} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-mono">
              {col} <span className="text-red-500 font-normal">e.g. {ex}</span>
            </span>
          ))}
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors mt-1">
          <Download className="w-3.5 h-3.5" /> Download Template
        </button>
      </div>

      {/* Upload zone — only show when idle or after reset */}
      {step === 'idle' && (
        <div className="border-2 border-dashed border-red-200 rounded-xl p-8 text-center hover:border-red-400 transition-colors">
          <input type="file" id="delete-upload" className="hidden" accept=".xlsx,.xls"
            onChange={e => { const f = e.target.files?.[0]; if (f) processExcel(f); e.target.value = ''; }} />
          <label htmlFor="delete-upload" className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-base font-medium text-gray-700">Drop Excel file or click to upload</span>
            <span className="text-xs text-gray-400">.xlsx / .xls — columns: SKU, ITEM, Category</span>
          </label>
        </div>
      )}

      {/* Detected columns */}
      {detectedCols && step !== 'done' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Detected columns:</p>
          <div className="flex flex-wrap gap-1.5">
            {detectedCols.map(h => {
              const mapped = COLUMN_MAP[norm(h)];
              return (
                <span key={h} className={`px-2 py-0.5 rounded text-xs font-mono border ${
                  mapped ? 'bg-green-50 text-green-800 border-green-200' : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {h}{mapped ? ` → ${mapped}` : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          <span className="text-sm text-gray-600">Parsing file...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* ── STEP: Preview ── */}
      {step === 'preview' && parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Preview — {parsedRows.length} row{parsedRows.length !== 1 ? 's' : ''} to process
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Products matching these criteria will be permanently deleted.
              </p>
            </div>
            <button onClick={reset} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wide">#</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wide">SKU</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wide">Item Name</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wide">Category</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wide">Match by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.map((row, i) => {
                  const matchBy = [
                    row.product_id && 'SKU',
                    row.name       && 'Name',
                    row.category   && 'Category',
                  ].filter(Boolean);
                  return (
                    <tr key={i} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-gray-800">{row.product_id || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2 text-gray-700">{row.name || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2 text-gray-700">{row.category || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {matchBy.map(m => (
                            <span key={m} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">{m}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={reset}
              className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Proceed to Delete ({parsedRows.length} row{parsedRows.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: Confirm ── */}
      {step === 'confirm' && (
        <div className="border-2 border-red-300 rounded-xl p-5 bg-red-50 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Confirm Permanent Delete</h3>
              <p className="text-sm text-red-700 mt-1">
                You are about to delete products matching <strong>{parsedRows.length} row criteria</strong>.
                This action <strong>cannot be undone</strong>.
              </p>
              <ul className="mt-2 text-xs text-red-600 space-y-0.5 list-disc list-inside">
                <li>All matching products will be removed from the database</li>
                <li>Product images stored in S3 will also be deleted</li>
                <li>Orders referencing these products will retain their data</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('preview')} disabled={deleting}
              className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 transition-colors">
              ← Back
            </button>
            <button onClick={executeDelete} disabled={deleting}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {deleting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                : <><Trash2 className="w-4 h-4" /> Yes, Delete Permanently</>}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: Done — option to do another ── */}
      {step === 'done' && (
        <div className="text-center py-4">
          <button onClick={reset}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Delete More Products
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkDeleteProducts;