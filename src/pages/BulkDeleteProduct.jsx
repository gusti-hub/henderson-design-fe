import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkDeleteProducts = ({ onComplete, backendServer }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);

  const validateRow = (row) => {
    const errors = [];
    if (!row.product_id) errors.push('Product ID is required');
    return errors;
  };

  const processExcel = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        cellDates: true,
        cellNF: true,
        cellText: true,
        raw: false
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { 
        raw: false,
        defval: null
      });

      // Validate all rows first
      const validationErrors = [];
      rows.forEach((row, index) => {
        const rowErrors = validateRow(row);
        if (rowErrors.length > 0) {
          validationErrors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        setError(`Validation errors found:\n${validationErrors.join('\n')}`);
        setPreview(rows.slice(0, 5));
        return;
      }

      // Collect all product IDs
      const productIds = rows.map(row => row.product_id);

      // Delete products in bulk
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_ids: productIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete products');
      }

      const result = await response.json();
      setSuccess(`Successfully deleted ${result.deletedCount} products`);
      onComplete?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* File Upload Section */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <input
          type="file"
          id="excel-upload"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processExcel(file);
          }}
        />
        <label
          htmlFor="excel-upload"
          className="flex flex-col items-center gap-4 cursor-pointer"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-lg font-medium">Drop Excel file or click to upload</div>
          <div className="text-sm text-gray-500">
            Excel file must include a product_id column with the IDs to delete
          </div>
        </label>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Processing deletion...</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                {success}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {preview && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Data Preview (First 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-4 py-2 text-sm">
                        {value?.toString()}
                      </td>
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

export default BulkDeleteProducts;