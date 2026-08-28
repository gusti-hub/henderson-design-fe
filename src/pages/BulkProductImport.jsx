// src/pages/BulkProductImport.jsx

import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { backendServer } from '../utils/info';
import { isHtml, plainToHtml } from '../utils/richTextUtils';

// Fields where Excel rich text (bold/italic/etc.) should be preserved as HTML
const RICH_TEXT_CANONICALS = new Set(['description', 'vendorDescription']);

// ─── SKU finish parser ─────────────────────────────────────────────────────
const WOOD_CODES   = ['MD', 'DK'];
const FABRIC_CODES = ['19','20','08','09','02','03','11','12','05','06','14','15','17','18','0B','0C','0E','0F','0I','0H','0L','0K','0O','0N','0U','0T'];
const OTHER_CODES  = ['WV','SD','MD','DK','LT','FX','LR','SH'];

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
  String(k)
    .toLowerCase()
    .replace(/[\s\-\/]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

// ─── Sub-header labels that indicate CLIENT / VENDOR / CUSTOM ATTRIBUTE ────
const SUB_LABELS = new Set(['client', 'vendor', 'custom_attribute', 'custom']);

// ─── Column → canonical product field map ─────────────────────────────────
// Keys are normalized composite: norm(headerName) or norm(headerName)_norm(subLabel)
// Values starting with "ca." go into customAttributes map
const COLUMN_MAP = {
  // Identity
  sku:            'product_id',
  product_id:     'product_id',
  sku_id:         'product_id',

  item_name:      'name',
  item:           'name',
  name:           'name',
  product_name:   'name',

  vendor:         'vendor',

  category:       'category',
  collection:     'collection',
  package:        'package',

  // Prices
  manufacture_cost:    'buyPrice',
  furniture_cost:      'buyPrice',
  buy_price:           'buyPrice',
  buyprice:            'buyPrice',
  cost:                'buyPrice',

  pricing_2025:        'sellPrice2025',
  pricing2025:         'sellPrice2025',
  selling_price_2025:  'sellPrice2025',
  sellingprice2025:    'sellPrice2025',
  price_2025:          'sellPrice2025',

  pricing_2026:        'sellPrice2026',
  pricing2026:         'sellPrice2026',
  selling_price_2026:  'sellPrice2026',
  sellingprice2026:    'sellPrice2026',
  price_2026:          'sellPrice2026',

  sell_price:          'sellPrice',
  sellprice:           'sellPrice',
  price:               'sellPrice',
  final_pricing:       'sellPrice',
  final_price:         'sellPrice',

  // Dimensions
  dimensions:          'dimension',
  dimension:           'dimension',

  // Descriptions — plain (no sub-header)
  description:         'description',
  desc:                'description',
  vendor_description:  'vendorDescription',
  vendordescription:   'vendorDescription',
  deskripsi:           'vendorDescription',

  // Descriptions — with sub-header
  description_client:        'description',
  description_vendor:        'vendorDescription',
  deskripsi_vendor:          'vendorDescription',
  deskripsi_client:          'description',
  client_description_client: 'description',      // Nalu: "Client Description" + CLIENT sub-header
  vendor_description_vendor: 'vendorDescription', // Nalu: "Vendor Description" + VENDOR sub-header

  // Fabric — with sub-header (CLIENT/VENDOR → separate fields)
  fabric_client:       'fabricClient',
  fabric_vendor:       'fabricVendor',
  fabric:              'fabric',
  fabric_finish:       'fabric',

  // Wood Finish — with sub-header (CLIENT/VENDOR → separate fields, base → woodFinish)
  woodfinish:          'woodFinish',
  wood_finish:         'woodFinish',
  wood:                'woodFinish',
  woodfinish_vendor:   'woodFinishVendor',
  woodfinish_client:   'woodFinishClient',
  wood_finish_vendor:  'woodFinishVendor',
  wood_finish_client:  'woodFinishClient',

  // Wood Finish Info — Lani specific (CLIENT/VENDOR → separate fields)
  wood_finish_info_client:  'woodFinishClient',
  wood_finish_info_vendor:  'woodFinishVendor',
  wood_finish_info:         'woodFinish',

  // Metal Finish — with custom attribute sub-header
  metal_finish_custom_attribute: 'ca.metalFinish',

  // Fabric Info — Lani FABRIC column (after all the specific columns)
  // Only used if no fabric_client found
  fabric_vendor_2:     'colorFinish',

  // Color/Finish
  color_finish:        'colorFinish',
  colorfinish:         'colorFinish',
  color:               'colorFinish',
  finish:              'colorFinish',

  // Ship To
  ship_to:             'shipTo',
  shipto:              'shipTo',
  ship_to_address:     'shipTo',

  // Other
  item_url:            'itemUrl',
  itemurl:             'itemUrl',
  product_url:         'itemUrl',
  item_class:          'itemClass',
  itemclass:           'itemClass',
  class:               'itemClass',
  link_image:          'imageUrl',
  linkimage:           'imageUrl',
  image:               'imageUrl',
  image_url:           'imageUrl',
  link_img:            'imageUrl',
  other_finish:        'otherFinish_raw',
  otherfinish:         'otherFinish_raw',

  // Custom Attributes — Lani (CUSTOM AT sub-header only → ca.*)
  arm_style:                    'ca.armStyle',
  arm_style_custom_attribute:   'ca.armStyle',
  // VENDOR/CLIENT Drawer Fronts → separate fields
  drawer_fronts_vendor:         'drawerFrontsVendor',
  drawer_fronts_client:         'drawerFrontsClient',
  // VENDOR/CLIENT Wing Panels → separate fields
  wing_panels_vendor:           'wingPanelsVendor',
  wing_panels_client:           'wingPanelsClient',
  wing_panels_custom_attribute: 'ca.wingPanels',
  metal_finish_info_1:          'ca.metalFinish',
  metal_finish_info:            'ca.metalFinish',
  frame:                        'ca.frame',
  dimensions_software:          'dimension',

  // Custom Attributes — Nalu
  metal_finish:                 'ca.metalFinish',
  metal_finish_custom_attribute:'ca.metalFinish',
  seat:                         'ca.seat',
  seat_custom_attribute:        'ca.seat',
  size_custom_attribute:        'ca.size',
  headboard:                    'ca.headboard',
  headboard_custom_attribute:   'ca.headboard',
  legsbase:                     'ca.legsBase',
  legsbase_custom_attribute:    'ca.legsBase',
  legs_base:                    'ca.legsBase',
  legs_base_custom_attribute:   'ca.legsBase',
  drawer_fronts:                'ca.drawerFronts',
  drawer_fronts_custom_attribute:'ca.drawerFronts',
  door_fronts:                  'ca.doorFronts',
  door_fronts_custom_attribute: 'ca.doorFronts',
};

// ─── Smart sheet parser: reads sub-header row + header row ────────────────
const parseSheet = (ws) => {
  // Get as raw 2D array
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!raw.length) return [];

  // Find header row: contains "SKU" (case-insensitive)
  const headerRowIdx = raw.findIndex(row =>
    row.some(cell => String(cell).trim().toUpperCase() === 'SKU')
  );
  if (headerRowIdx === -1) throw new Error('Header row with "SKU" not found');

  const headerRow = raw[headerRowIdx];

  // Sub-header row = row immediately above header, only if it contains CLIENT/VENDOR labels
  const potentialSub = headerRowIdx > 0 ? raw[headerRowIdx - 1] : [];
  const isSubHeader = potentialSub.some(cell => {
    const n = norm(String(cell));
    return SUB_LABELS.has(n);
  });
  const subHeaderRow = isSubHeader ? potentialSub : [];

  // Build column definitions with composite keys
  const colDefs = headerRow.map((colName, colIdx) => {
    const mainLabel = String(colName || '').trim();
    const subLabel  = String(subHeaderRow[colIdx] || '').trim();
    const subNorm   = norm(subLabel);

    if (!mainLabel) return null;

    // Build composite key: "description_client", "fabric_vendor", etc.
    let compositeKey;
    if (subLabel && SUB_LABELS.has(subNorm)) {
      compositeKey = norm(mainLabel) + '_' + subNorm;
    } else {
      compositeKey = norm(mainLabel);
    }

    const canonical = COLUMN_MAP[compositeKey];

    return { colIdx, mainLabel, subLabel, compositeKey, canonical };
  }).filter(Boolean);

  // Parse data rows (everything after the header row, skip empty rows)
  const dataRows = raw
    .slice(headerRowIdx + 1)
    .filter(row => row.some(cell => cell !== '' && cell != null))
    .map((row, localIdx) => {
      const absRowIdx = headerRowIdx + 1 + localIdx;
      const obj = {};
      colDefs.forEach(({ colIdx, compositeKey, canonical }) => {
        if (!canonical) return;

        let val;
        if (RICH_TEXT_CANONICALS.has(canonical)) {
          // Use the cell's HTML value when available (preserves bold/italic/etc.)
          const cellAddr = XLSX.utils.encode_cell({ r: absRowIdx, c: colIdx });
          const cell = ws[cellAddr];
          const htmlVal = (cell?.h || '').trim();
          const plainVal = row[colIdx] != null ? String(row[colIdx]).trim() : '';
          // Use HTML only when it actually contains markup (not just escaped text)
          // Use HTML if cell has markup; otherwise convert plain text (preserving \n as <p>)
          val = (htmlVal && isHtml(htmlVal)) ? htmlVal : plainToHtml(plainVal);
        } else {
          val = row[colIdx] != null ? String(row[colIdx]).trim() : '';
        }

        if (!val) return;

        if (canonical.startsWith('ca.')) {
          if (!obj.__ca) obj.__ca = {};
          const key = canonical.slice(3);
          if (!obj.__ca[key]) obj.__ca[key] = val;
        } else {
          if (!obj[canonical]) obj[canonical] = val;
        }
      });
      return obj;
    });

  return { colDefs, dataRows };
};

// ─── Validation ────────────────────────────────────────────────────────────
const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };

const validateRow = (row, rowNum) => {
  const errors = [];
  if (!row.product_id) errors.push(`Row ${rowNum}: SKU is required`);
  if (!row.name)       errors.push(`Row ${rowNum}: Item name is required`);
  const hasSellPrice = !isNaN(parseFloat(row.sellPrice)) ||
    !isNaN(parseFloat(row.sellPrice2025)) ||
    !isNaN(parseFloat(row.sellPrice2026));
  if (!hasSellPrice)
    errors.push(`Row ${rowNum}: Sell price is required (Pricing 2025 or Pricing 2026)`);
  if (row.imageUrl && !isValidUrl(row.imageUrl))
    errors.push(`Row ${rowNum}: Invalid image URL`);
  return errors;
};

// ─── Download template ─────────────────────────────────────────────────────
const downloadTemplate = () => {
  const subHeaders  = ['','','','','','','','CLIENT','VENDOR','CLIENT','VENDOR','','VENDOR','CLIENT'];
  const headers     = ['SKU','ITEM NAME','VENDOR','Buy Price','Pricing 2025','Pricing 2026','DIMENSIONS','Description','Deskripsi','FABRIC','FABRIC','','Wood/Finish','Wood/Finish'];
  const rows = [
    ['ST-11-N-0A-00-MD-04-00-00-00','Bench Style A','Modulo',335,971.5,1072,'48"W x 16"D x 17"H','Seat: Upholstered\nBase: Teak','Seat: Upholstered\nAdditional: HDG Glides','Light','HDG "Light", Peppin Linen','','Medium Teak','Medium'],
    ['ST-01-L-1A-00-LT-0A-00-LA-00','Modular Sofa Piece 1A','Modulo',612,3178.6,3452.8,'34"W x 36"D x 30"H','Frame: Upholstered\nArm: Rounded','Seat: Upholstered Waterfall\nArm: Rounded','Light','HDG "Light", Gusto Angora','','Light Oak','Light'],
  ];
  const ws = XLSX.utils.aoa_to_sheet([subHeaders, headers, ...rows]);
  ws['!cols'] = Array(headers.length).fill({ wch: 22 });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, 'product_import_template.xlsx');
};

// ─── Batch helper ──────────────────────────────────────────────────────────
const batchArray = (arr, size) => {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) batches.push(arr.slice(i, i + size));
  return batches;
};

// ==================== COMPONENT ====================

const BulkProductImport = ({ onComplete }) => {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);
  const [preview, setPreview]           = useState(null);
  const [colDefs, setColDefs]           = useState(null);
  const [progress, setProgress]         = useState(null);

  const processExcel = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setPreview(null);
      setColDefs(null);
      setProgress(null);

      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { cellDates: true, cellHTML: true });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const { colDefs: detectedCols, dataRows } = parseSheet(ws);
      if (!dataRows.length) { setError('No data rows found'); return; }

      setColDefs(detectedCols);

      // Build product objects from parsed rows
      const products = dataRows.map(row => {
        const skuParsed  = parseSku(row.product_id || '');
        const woodFinish = (row.woodFinish || '').toUpperCase() || skuParsed.woodFinish || '';
        const fabric     = (row.fabric     || '').toUpperCase() || skuParsed.fabric     || '';

        let others = skuParsed.others;
        if (row.otherFinish_raw) {
          const codes = row.otherFinish_raw.toUpperCase().split(/[\s,]+/).filter(Boolean);
          if (codes.length) others = codes;
        }

        const sellPrice2025 = parseFloat(row.sellPrice2025) || 0;
        const sellPrice2026 = parseFloat(row.sellPrice2026) || 0;
        const sellPrice     = parseFloat(row.sellPrice) || sellPrice2026 || sellPrice2025 || 0;
        const buyPrice      = parseFloat(row.buyPrice)  || 0;

        return {
          product_id:        row.product_id        || '',
          name:              row.name              || '',
          vendor:            row.vendor            || '',
          description:       row.description       || '',
          vendorDescription: row.vendorDescription || '',
          colorFinish:       row.colorFinish       || '',
          itemClass:         row.itemClass         || '',
          itemUrl:           row.itemUrl           || '',
          category:          row.category          || 'General',
          collection:        row.collection        || '',
          package:           (['Lani','Nalu','Mainland'].includes(row.package) ? row.package : ''),
          dimension:         row.dimension         || '',
          shipTo:            row.shipTo            || '',
          sellPrice,
          sellPrice2025,
          sellPrice2026,
          buyPrice,
          price: sellPrice,
          woodFinish,
          fabric,
          others,
          imageUrl:          row.imageUrl          || '',
          customAttributes:  row.__ca              || {},
          // VENDOR / CLIENT direct fields
          woodFinishVendor:   row.woodFinishVendor   || '',
          woodFinishClient:   row.woodFinishClient   || '',
          drawerFrontsVendor: row.drawerFrontsVendor || '',
          drawerFrontsClient: row.drawerFrontsClient || '',
          wingPanelsVendor:   row.wingPanelsVendor   || '',
          wingPanelsClient:   row.wingPanelsClient   || '',
          fabricVendor:       row.fabricVendor       || '',
          fabricClient:       row.fabricClient       || '',
        };
      });

      // Show preview (first 5)
      setPreview(products.slice(0, 5));

      // Validate
      const valErrors = [];
      products.forEach((p, i) => valErrors.push(...validateRow(p, i + 2)));
      if (valErrors.length) { setError(valErrors.join('\n')); return; }

      // Delete existing products by SKU before re-importing
      const token = localStorage.getItem('token');
      const skus = products.map(p => p.product_id).filter(Boolean);
      if (skus.length) {
        setProgress('Removing existing products by SKU…');
        const clearRes = await fetch(`${backendServer}/api/products/bulk-delete`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_ids: skus }),
        });
        if (!clearRes.ok) throw new Error('Failed to remove existing products');
      }

      // Upload in batches of 20
      let successCount = 0;
      const importErrors = [];
      const batches = batchArray(products, 20);

      for (let bi = 0; bi < batches.length; bi++) {
        setProgress(`Importing batch ${bi + 1} / ${batches.length} (${successCount} done)…`);
        await Promise.allSettled(
          batches[bi].map(async (p) => {
            const body = new FormData();
            Object.entries(p).forEach(([k, v]) => {
              if (k === 'customAttributes') {
                body.append(k, JSON.stringify(v));
              } else {
                body.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
              }
            });
            const res = await fetch(`${backendServer}/api/products?upsert=true`, {
              method: 'POST',
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
      }

      setProgress(null);
      if (importErrors.length) setError(`Some rows failed:\n${importErrors.join('\n')}`);
      if (successCount > 0) {
        setSuccess(`Successfully imported ${successCount} of ${products.length} products.`);
        onComplete?.();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  // Column color by canonical field
  const colColor = (canonical) => {
    if (!canonical) return 'bg-white text-gray-400 border-gray-200';
    if (canonical === 'sellPrice2026') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (canonical === 'sellPrice2025') return 'bg-sky-50 text-sky-800 border-sky-200';
    if (canonical === 'buyPrice')      return 'bg-amber-50 text-amber-800 border-amber-200';
    if (canonical.startsWith('ca.'))   return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-green-50 text-green-800 border-green-200';
  };

  const previewFields = preview?.[0]
    ? Object.keys(preview[0]).filter(k => k !== 'others' && k !== 'price' && k !== '__ca')
    : [];

  return (
    <div className="p-6 space-y-5">

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-900">How it works:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Replaces by SKU</strong> — existing products matching the imported SKUs are deleted first, then re-imported from the file</li>
          <li>Auto-detects the header row by finding "SKU"</li>
          <li>Reads the <strong>sub-header row</strong> above headers (CLIENT / VENDOR labels) to disambiguate duplicate columns</li>
          <li>Custom attribute columns (Arm Style, Drawer Fronts, Metal Finish, Seat, etc.) are stored automatically</li>
          <li>Imports in batches of 20 — safe for large catalogs (10k+ rows)</li>
        </ul>
        <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
          {[
            ['SKU','product_id'],['ITEM NAME','name'],['VENDOR','vendor'],
            ['Buy Price','buyPrice'],['Pricing 2025','sellPrice2025'],['Pricing 2026 *','sellPrice2026'],
            ['DIMENSIONS','dimension'],['Collection','collection'],['Package','package'],
            ['Description (CLIENT)','description'],['Deskripsi (VENDOR)','vendorDescription'],
            ['FABRIC (CLIENT)','fabric'],['FABRIC (VENDOR)','colorFinish'],
            ['Wood/Finish (VENDOR)','woodFinish'],
            ['Arm Style / Drawer Fronts / Metal Finish / Seat / etc.','ca.*'],
          ].map(([label, field]) => (
            <span key={label} className={`px-2 py-0.5 rounded font-mono border ${colColor(field)}`}>{label}</span>
          ))}
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-3.5 h-3.5" /> Download Template
        </button>
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input type="file" id="excel-upload" className="hidden" accept=".xlsx,.xls,.csv"
          onChange={e => { const f = e.target.files?.[0]; if (f) processExcel(f); e.target.value = ''; }} />
        <label htmlFor="excel-upload" className="flex flex-col items-center gap-3 cursor-pointer">
          <Upload className="w-10 h-10 text-gray-400" />
          <span className="text-base font-medium text-gray-700">Drop Excel / CSV file or click to upload</span>
          <span className="text-xs text-gray-500">.xlsx / .xls / .csv — sub-header rows (CLIENT/VENDOR) are auto-detected</span>
        </label>
      </div>

      {/* Detected column mapping */}
      {colDefs && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Detected column mapping:</p>
          <div className="flex flex-wrap gap-1.5">
            {colDefs.map((col, i) => (
              <div key={i} className={`flex flex-col px-2 py-1 rounded border text-xs font-mono ${colColor(col.canonical)}`}>
                <span className="font-semibold">{col.mainLabel}{col.subLabel ? ` (${col.subLabel})` : ''}</span>
                <span className="opacity-70">→ {col.canonical || '—'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span><span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"/>standard field</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"/>custom attribute</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"/>ignored</span>
          </div>
        </div>
      )}

      {(loading || progress) && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">{progress || 'Processing…'}</span>
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
          <p className="text-xs font-semibold text-gray-600 mb-2">Preview — first 5 rows</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {previewFields.map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-3 py-2 text-left font-medium text-purple-600 uppercase whitespace-nowrap">customAttributes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {previewFields.map((k, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700 max-w-[160px] truncate">{String(row[k] ?? '')}</td>
                    ))}
                    <td className="px-3 py-2 text-purple-700 max-w-[200px] truncate text-xs">
                      {row.customAttributes && Object.keys(row.customAttributes).length
                        ? Object.entries(row.customAttributes).map(([k,v]) => `${k}: ${v}`).join(', ')
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
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
