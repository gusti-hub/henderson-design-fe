// BulkUpdateProducts.jsx
// Bulk update products via Excel:
//   1. Download pre-filled template (current DB data)
//   2. Edit the rows you want to change
//   3. Upload back — preview diff, then confirm

import React, { useState, useRef } from 'react';
import {
  Download, Upload, X, Loader2, CheckCircle2,
  AlertTriangle, RefreshCw, FileSpreadsheet, ChevronDown, ChevronUp,
} from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── helpers ──────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('token');

const UPDATABLE_COLUMNS = [
  'product_id','name','description','vendorDescription',
  'category','collection','package','dimension','price',
  'colorFinish','itemUrl','itemClass','woodFinish','fabric','others',
  'imageUrl',
];

const FIELD_LABELS = {
  product_id:        'SKU / Product ID',
  name:              'Item Name',
  description:       'Client Description',
  vendorDescription: 'Vendor Description',
  category:          'Category',
  collection:        'Collection',
  package:           'Package',
  dimension:         'Dimensions',
  price:             'Price ($)',
  colorFinish:       'Color / Finish',
  itemUrl:           'Item URL',
  itemClass:         'Item Class',
  woodFinish:        'Wood Finish',
  fabric:            'Fabric Code',
  others:            'Others (comma-sep)',
  imageUrl:          'Image URL',
};

// ─── DiffBadge ─────────────────────────────────────────────────────────────
const DiffBadge = ({ field, oldVal, newVal }) => {
  if (String(oldVal ?? '') === String(newVal ?? '')) return null;
  return (
    <div className="text-xs mb-0.5">
      <span className="font-medium text-gray-500">{FIELD_LABELS[field] ?? field}:</span>{' '}
      <span className="line-through text-red-500 bg-red-50 px-1 rounded">
        {String(oldVal ?? '—')}
      </span>{' → '}
      <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
        {String(newVal ?? '—')}
      </span>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const BulkUpdateProducts = ({ onComplete, backendServer: bsProp }) => {
  const bs = bsProp || backendServer;

  // steps: idle → downloading → uploading → previewing → submitting → done | error
  const [step, setStep]           = useState('idle');
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState([]); // [{_id, sku, changes:{field:{old,new}}}]
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState({}); // row._id → bool
  const [dlProgress, setDlProgress] = useState('');
  const fileRef = useRef();

  // ─── Download template ──────────────────────────────────────────────────
  const handleDownload = async () => {
    setStep('downloading');
    setDlProgress('Fetching products…');
    setError('');
    try {
      // Fetch all products (max 5000)
        const res = await fetch(
        `${bs}/api/products/export/all`,
        { headers: { Authorization: `Bearer ${token()}` } }
        );
        const data = await res.json();
        const products = data.products || [];

      setDlProgress(`Building Excel for ${products.length} products…`);

      // Build CSV-ish XLSX via SheetJS (loaded from CDN already in app, or use vanilla CSV fallback)
      // We'll use CSV fallback to avoid extra deps — the user can open in Excel
      const headers = UPDATABLE_COLUMNS;
      const rows = products.map(p => headers.map(col => {
        if (col === 'others') return (p.others || []).join(',');
        if (col === 'imageUrl') return p.image?.url || '';
        return p[col] ?? '';
      }));

      const escCsv = val => {
        const s = String(val ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const csv = [
        headers.map(escCsv).join(','),
        ...rows.map(r => r.map(escCsv).join(',')),
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `products_bulk_update_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setStep('idle');
      setDlProgress('');
    } catch (err) {
      setError(err.message);
      setStep('idle');
      setDlProgress('');
    }
  };

  // ─── Parse uploaded CSV/Excel ───────────────────────────────────────────
  const parseFile = (f) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          // BOM strip
          const clean = text.replace(/^\uFEFF/, '');
          const lines = clean.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) throw new Error('File is empty or has only headers');

          const parseLine = (line) => {
            const vals = [];
            let cur = '', inQ = false;
            for (let i = 0; i < line.length; i++) {
              if (line[i] === '"' && !inQ) { inQ = true; continue; }
              if (line[i] === '"' && inQ) {
                if (line[i+1] === '"') { cur += '"'; i++; } else inQ = false;
                continue;
              }
              if (line[i] === ',' && !inQ) { vals.push(cur); cur = ''; continue; }
              cur += line[i];
            }
            vals.push(cur);
            return vals;
          };

          const headers = parseLine(lines[0]);
          const rows = lines.slice(1).map(l => {
            const vals = parseLine(l);
            const obj = {};
            headers.forEach((h, i) => { obj[h.trim()] = (vals[i] ?? '').trim(); });
            return obj;
          }).filter(r => r.product_id);

          resolve(rows);
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(f, 'UTF-8');
    });
  };

  // ─── Upload & preview ───────────────────────────────────────────────────
  const handleFileChange = async (f) => {
    if (!f) return;
    setFile(f);
    setStep('uploading');
    setError('');
    try {
      const rows = await parseFile(f);

      // Ask backend to preview diff
      const res = await fetch(`${bs}/api/products/bulk-update/preview`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Preview failed');

      setPreview(data.preview || []);
      setStep('previewing');
    } catch (err) {
      setError(err.message);
      setStep('idle');
    }
  };

  // ─── Confirm update ─────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setStep('submitting');
    setError('');
    try {
      const rows = await parseFile(file);
      const res = await fetch(`${bs}/api/products/bulk-update`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setResult(data);
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('previewing');
    }
  };

  const reset = () => {
    setStep('idle'); setFile(null); setPreview([]);
    setResult(null); setError(''); setExpanded({});
    if (fileRef.current) fileRef.current.value = '';
  };

  const changedCount = preview.filter(p => Object.keys(p.changes || {}).length > 0).length;
  const noChangeCount = preview.length - changedCount;

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 min-h-[400px]">

      {/* ── Step 1: Download template ── */}
      <div className={`rounded-xl border-2 p-5 transition-colors ${
        step === 'downloading' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#005670] font-bold text-sm">1</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Download Template (pre-filled)</h4>
            <p className="text-xs text-gray-500 mb-3">
              Downloads all existing products as a CSV. Edit the rows you want to update, then upload below.
              <br />
              <strong>product_id</strong> is used as the lookup key — do not change it.
            </p>
            <button
              onClick={handleDownload}
              disabled={step === 'downloading'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: '#005670' }}
            >
              {step === 'downloading'
                ? <><Loader2 className="w-4 h-4 animate-spin" />{dlProgress || 'Downloading…'}</>
                : <><Download className="w-4 h-4" />Download CSV Template</>}
            </button>
            {step === 'downloading' && dlProgress && (
              <p className="text-xs text-[#005670] mt-2 animate-pulse">{dlProgress}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Step 2: Upload filled file ── */}
      <div className={`rounded-xl border-2 p-5 transition-colors ${
        step === 'uploading' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#005670] font-bold text-sm">2</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Upload Updated CSV</h4>
            <p className="text-xs text-gray-500 mb-3">
              Upload the edited CSV. Only rows where values differ from the database will be updated.
            </p>

            {step === 'uploading' ? (
              <div className="flex items-center gap-2 text-sm text-[#005670]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing and comparing with database…
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90"
                style={{ backgroundColor: '#005670' }}>
                <Upload className="w-4 h-4" />
                {file ? 'Replace File' : 'Upload CSV'}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={e => handleFileChange(e.target.files[0])}
                />
              </label>
            )}

            {file && step !== 'uploading' && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#005670]" />
                {file.name}
                <button onClick={reset} className="text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Error</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError('')}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
        </div>
      )}

      {/* ── Step 3: Preview diff ── */}
      {(step === 'previewing' || step === 'submitting') && preview.length > 0 && (
        <div className="rounded-xl border-2 border-[#005670] bg-white overflow-hidden">
          <div className="px-5 py-4 bg-[#005670]/5 border-b border-[#005670]/20 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Preview Changes</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="text-emerald-700 font-semibold">{changedCount} rows</span> will be updated
                {noChangeCount > 0 && <span className="text-gray-400"> · {noChangeCount} rows unchanged (skipped)</span>}
                {preview.filter(p => p.notFound).length > 0 && (
                  <span className="text-amber-600"> · {preview.filter(p => p.notFound).length} SKUs not found</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} disabled={step === 'submitting'}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />Re-upload
              </button>
              <button
                onClick={handleConfirm}
                disabled={step === 'submitting' || changedCount === 0}
                className="px-4 py-1.5 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 transition-all"
                style={{ backgroundColor: '#005670' }}>
                {step === 'submitting'
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Updating…</>
                  : `✅ Confirm & Update ${changedCount} Products`}
              </button>
            </div>
          </div>

          {/* Preview list */}
          <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
            {preview.map((row, i) => {
              const hasChanges = Object.keys(row.changes || {}).length > 0;
              const isExpanded = expanded[row.product_id];
              return (
                <div key={row.product_id || i}
                  className={`px-5 py-3 ${
                    row.notFound   ? 'bg-amber-50'
                    : !hasChanges  ? 'bg-gray-50/60 opacity-60'
                    :                'hover:bg-gray-50'
                  }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {row.notFound ? (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded">NOT FOUND</span>
                      ) : hasChanges ? (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-300" />
                      )}
                      <span className="font-mono text-xs font-semibold text-gray-700 truncate">{row.product_id}</span>
                      <span className="text-xs text-gray-500 truncate">{row.name}</span>
                    </div>
                    {hasChanges && !row.notFound && (
                      <button
                        onClick={() => setExpanded(ex => ({ ...ex, [row.product_id]: !ex[row.product_id] }))}
                        className="flex-shrink-0 flex items-center gap-1 text-xs text-[#005670] hover:underline">
                        {Object.keys(row.changes).length} field{Object.keys(row.changes).length !== 1 ? 's' : ''}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {isExpanded && hasChanges && (
                    <div className="mt-2 ml-5 pl-3 border-l-2 border-[#005670]/20 space-y-0.5">
                      {Object.entries(row.changes).map(([field, { old: oldVal, new: newVal }]) => (
                        <DiffBadge key={field} field={field} oldVal={oldVal} newVal={newVal} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 'done' && result && (
        <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-6 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="text-base font-semibold text-emerald-800">Bulk Update Complete</h4>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-2xl font-bold text-emerald-700">{result.updatedCount}</p>
              <p className="text-xs text-emerald-600">Products updated</p>
            </div>
            {result.skippedCount > 0 && (
              <div>
                <p className="text-2xl font-bold text-gray-500">{result.skippedCount}</p>
                <p className="text-xs text-gray-500">Rows skipped (no change)</p>
              </div>
            )}
            {result.notFoundCount > 0 && (
              <div>
                <p className="text-2xl font-bold text-amber-600">{result.notFoundCount}</p>
                <p className="text-xs text-amber-600">SKUs not found</p>
              </div>
            )}
          </div>

          {result.errors?.length > 0 && (
            <details className="text-left mt-3">
              <summary className="text-xs text-red-600 cursor-pointer font-medium">
                {result.errors.length} error(s) — click to expand
              </summary>
              <ul className="mt-2 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                    <strong>{e.product_id}</strong>: {e.message}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button onClick={reset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white">
              Update More
            </button>
            <button onClick={() => { onComplete?.(); }}
              className="px-4 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#005670' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Column reference */}
      {step === 'idle' && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer font-medium text-gray-600 hover:text-[#005670]">
            📋 Updatable columns reference
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 pl-4">
            {Object.entries(FIELD_LABELS).map(([k, v]) => (
              <div key={k}>
                <span className="font-mono text-gray-700">{k}</span>
                <span className="text-gray-400"> — {v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 pl-4 text-amber-600 font-medium">
            ⚠️ <strong>product_id</strong> is the lookup key. Do not change it.
          </p>
        </details>
      )}
    </div>
  );
};

export default BulkUpdateProducts;