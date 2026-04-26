// src/pages/BulkProductImport.jsx
// ✅ PATCHED: Added new catalog fields to column map, template, and preview
//   - Client Description  (existing 'Description' column)
//   - Vendor Description  (new 'Vendor Description' column)
//   - Item URL            (existing 'Link Image' → separate 'Item URL' column)
//   - Color / Finish      (new 'Color/Finish' column)
//   - Item Class          (new 'Item Class' column)

import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { backendServer } from '../utils/info';

// ─── Finish code constants ─────────────────────────────────────────────────
const WOOD_CODES   = ['MD', 'DK'];
const FABRIC_CODES = ['19','20','08','09','02','03','11','12','05','06','14','15','17','18','0B','0C','0E','0F','0I','0H','0L','0K','0O','0N','0U','0T'];
const OTHER_CODES  = ['WV','SD','MD','DK','LT','FX','LR','SH'];

// ─── SKU parser ────────────────────────────────────────────────────────────
const parseSku = (sku) => {
  if (!sku) return { woodFinish: '', fabric: '', others: [] };
  const parts = sku.toUpperCase().split('-');
  return {
    woodFinish: WOOD_CODES.includes(parts[5])   ? parts[5] : '',
    fabric:     FABRIC_CODES.includes(parts[6]) ? parts[6] : '',
    others:     [parts[7], parts[8], parts[9]]
                  .filter(Boolean)
                  .filter(p => p !== '00' && OTHER_CODES.includes(p)),
  };
};

// ─── Header normalizer ─────────────────────────────────────────────────────
const norm = (k) =>
  k.toString()
    .toLowerCase()
    .replace(/[\s\-\/]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

// ─── Column map ────────────────────────────────────────────────────────────
const COLUMN_MAP = {
  // Identity
  category: 'category',
  item: 'name', item_name: 'name', name: 'name', product_name: 'name',
  sku: 'product_id', product_id: 'product_id', sku_id: 'product_id',
  // Price
  price: 'price', base_price: 'price', variant_price: 'price',
  final_pricing: 'price', final_price: 'price',
  // Dimensions
  dimensions: 'dimension', dimension: 'dimension', size: 'dimension',
  // Finish
  wood_finish: 'woodFinish', woodfinish: 'woodFinish', wood: 'woodFinish',
  other_finish: 'otherFinish_raw', otherfinish: 'otherFinish_raw', other: 'otherFinish_raw',
  fabric_finish: 'fabric', fabricfinish: 'fabric', fabric: 'fabric',
  // Package
  package: 'package',
  // ✅ Descriptions
  description: 'description', desc: 'description',
  client_description: 'description', clientdescription: 'description',
  vendor_description: 'vendorDescription', vendordescription: 'vendorDescription', // ✅ NEW
  // ✅ Item URL
  item_url: 'itemUrl', itemurl: 'itemUrl', product_url: 'itemUrl',   // ✅ NEW
  // ✅ Color/Finish (display finish, not SKU-based)
  color_finish: 'colorFinish', colorfinish: 'colorFinish',            // ✅ NEW
  color: 'colorFinish', finish: 'colorFinish',
  // ✅ Item Class
  item_class: 'itemClass', itemclass: 'itemClass', class: 'itemClass', // ✅ NEW
  // Image
  link_image: 'imageUrl', linkimage: 'imageUrl',
  link_img: 'imageUrl', image: 'imageUrl', image_url: 'imageUrl',
};

const PRICE_PREFIXES = ['final_pricing', 'finalprice', 'pricing'];

const resolveColumn = (rawKey) => {
  const n = norm(rawKey);
  if (COLUMN_MAP[n]) return COLUMN_MAP[n];
  if (PRICE_PREFIXES.some(prefix => n.startsWith(prefix))) return 'price';
  return null;
};

const parseRow = (rawRow) => {
  const out = {};
  Object.entries(rawRow).forEach(([rawKey, value]) => {
    const canonical = resolveColumn(rawKey);
    if (canonical) out[canonical] = value != null ? value.toString().trim() : '';
  });
  return out;
};

// ─── Validation ────────────────────────────────────────────────────────────
const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };

const validateRow = (row, rowNum) => {
  const errors = [];
  if (!row.product_id) errors.push(`Row ${rowNum}: SKU is required`);
  if (!row.name)       errors.push(`Row ${rowNum}: Item name is required`);
  if (!row.price || isNaN(parseFloat(row.price)))
    errors.push(`Row ${rowNum}: Valid price required`);
  if (row.imageUrl && !isValidUrl(row.imageUrl))
    errors.push(`Row ${rowNum}: Invalid image URL`);
  if (row.itemUrl && !isValidUrl(row.itemUrl))
    errors.push(`Row ${rowNum}: Invalid item URL`);
  return errors;
};

// ─── Download template ─────────────────────────────────────────────────────
const downloadTemplate = () => {
  const headers = [
    'Category', 'ITEM', 'SKU', 'FINAL PRICING 20_', 'DIMENSIONS',
    'WOOD FINISH', 'OTHER FINISH', 'Fabric FINISH',
    'Description',          // client description
    'Vendor Description',   // ✅ NEW
    'Color/Finish',         // ✅ NEW
    'Item Class',           // ✅ NEW
    'Item URL',             // ✅ NEW
    'Link Image',
    'Package',
  ];
  const rows = [
    [
      'Bench', 'Bench Style A', 'ST-11-N-0A-00-MD-19-00-00-00', 852,
      '48"W x 16"D x 17"H', 'MD', '', '19',
      'Solid teak bench, medium finish.',
      'Order ref: style A, medium',
      'Medium Walnut',
      'Furniture',
      'https://vendor.com/bench-a',
      'https://example.com/img.jpg',
      'Lani',
    ],
    [
      'Bench', 'Bench Style A', 'ST-11-N-0A-00-DK-20-00-00-00', 852,
      '48"W x 16"D x 17"H', 'DK', '', '20',
      'Solid teak bench, dark finish.',
      '',
      'Dark Ebony',
      'Furniture',
      '',
      '',
      'Lani',
    ],
    [
      'Counter Stools', 'Counter Stool Style A', 'ST-05-N-0A-00-MD-08-00-00-00', 572,
      '18"W x 20"D x 35"H', 'MD', '', '08',
      '',
      '',
      '',
      'Case Goods',
      '',
      '',
      'Nalu',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    {wch:16},{wch:22},{wch:32},{wch:18},{wch:22},
    {wch:12},{wch:12},{wch:12},{wch:36},{wch:30},
    {wch:16},{wch:20},{wch:36},{wch:40},{wch:10},
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, 'product_import_template.xlsx');
};

// ==================== COMPONENT ====================

const BulkProductImport = ({ onComplete }) => {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);
  const [preview, setPreview]           = useState(null);
  const [detectedCols, setDetectedCols] = useState(null);

  const processExcel = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setPreview(null);
      setDetectedCols(null);

      const data = await file.arrayBuffer();
      const wb   = XLSX.read(data, { cellDates: true, cellNF: true, cellText: true });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rawRows.length) { setError('File is empty'); return; }

      setDetectedCols(Object.keys(rawRows[0]));

      const parsedRows = rawRows.map(parseRow);
      setPreview(parsedRows.slice(0, 5));

      const valErrors = [];
      parsedRows.forEach((row, i) => valErrors.push(...validateRow(row, i + 2)));
      if (valErrors.length) { setError(valErrors.join('\n')); return; }

      const products = parsedRows.map(row => {
        const skuParsed = parseSku(row.product_id);

        const woodFinish = row.woodFinish?.toUpperCase() || skuParsed.woodFinish || '';
        const fabric     = row.fabric?.toUpperCase()     || skuParsed.fabric     || '';

        let others = skuParsed.others;
        if (row.otherFinish_raw) {
          const codes = row.otherFinish_raw.toUpperCase().split(/[\s,]+/).filter(Boolean);
          const valid = codes.filter(c => OTHER_CODES.includes(c));
          if (valid.length) others = valid;
        }

        return {
          product_id:        row.product_id,
          name:              row.name,
          description:       row.description       || '',
          vendorDescription: row.vendorDescription || '',  // ✅ NEW
          colorFinish:       row.colorFinish       || '',  // ✅ NEW
          itemClass:         row.itemClass         || '',  // ✅ NEW
          itemUrl:           row.itemUrl           || '',  // ✅ NEW
          category:          row.category          || 'General',
          dimension:         row.dimension         || '',
          package:           (['Lani','Nalu','Mainland'].includes(row.package) ? row.package : ''),
          price:             parseFloat(row.price) || 0,
          woodFinish,
          fabric,
          others,
          imageUrl:          row.imageUrl          || '',
        };
      });

      // Upload to API
      const token = localStorage.getItem('token');
      let successCount = 0;
      const importErrors = [];

      await Promise.allSettled(
        products.map(async (p) => {
          const body = new FormData();
          Object.entries(p).forEach(([k, v]) => {
            body.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
          });

          const res = await fetch(`${backendServer}/api/products`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${token}` },
            body,
          });

          if (res.ok) {
            successCount++;
          } else {
            const err = await res.json().catch(() => ({}));
            importErrors.push(`${p.product_id}: ${err.message || 'Failed'}`);
          }
        })
      );

      if (importErrors.length)
        setError(`Some rows failed:\n${importErrors.join('\n')}`);
      if (successCount > 0) {
        setSuccess(`Successfully imported ${successCount} of ${products.length} products.`);
        onComplete?.();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Columns to show in preview (hide internal keys)
  const HIDDEN_PREVIEW = new Set(['otherFinish_raw']);
  const previewCols = preview?.[0]
    ? Object.keys(preview[0]).filter(k => !HIDDEN_PREVIEW.has(k))
    : [];

  return (
    <div className="p-6 space-y-5">

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-900">Expected columns (order doesn't matter, case-insensitive):</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Category','ITEM','SKU','FINAL PRICING 20_','DIMENSIONS',
            'WOOD FINISH','OTHER FINISH','Fabric FINISH',
            'Description','Vendor Description','Color/Finish','Item Class','Item URL',
            'Link Image','Package',
          ].map(c => (
            <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">{c}</span>
          ))}
        </div>
        <p className="text-xs text-blue-700">
          <strong>Wood Finish</strong> and <strong>Fabric</strong> are auto-parsed from SKU if columns are empty.
          1 row = 1 product.
        </p>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-3.5 h-3.5" /> Download Template
        </button>
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input type="file" id="excel-upload" className="hidden" accept=".xlsx,.xls"
          onChange={e => { const f = e.target.files?.[0]; if (f) processExcel(f); e.target.value = ''; }} />
        <label htmlFor="excel-upload" className="flex flex-col items-center gap-3 cursor-pointer">
          <Upload className="w-10 h-10 text-gray-400" />
          <span className="text-base font-medium text-gray-700">Drop Excel file or click to upload</span>
          <span className="text-xs text-gray-500">.xlsx / .xls — column headers matched automatically</span>
        </label>
      </div>

      {/* Detected headers */}
      {detectedCols && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Detected columns in your file:</p>
          <div className="flex flex-wrap gap-1.5">
            {detectedCols.map(h => (
              <span key={h} className={`px-2 py-0.5 rounded text-xs font-mono border ${
                resolveColumn(h) ? 'bg-green-50 text-green-800 border-green-200' : 'bg-white text-gray-500 border-gray-300'
              }`}>{h}</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Green = recognised, gray = ignored</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Importing products...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Preview */}
      {preview?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Preview — first 5 rows (after column mapping)</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {previewCols.map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {previewCols.map((k, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700 max-w-[160px] truncate">{row[k]?.toString()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkProductImport;