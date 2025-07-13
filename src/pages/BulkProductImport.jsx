// src/pages/BulkProductImport.jsx
import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { backendServer } from '../utils/info';

const BulkProductImport = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);

  // Helper function to validate URLs
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateRow = (row) => {
    console.log(row)
    const errors = [];
    if (!row.product_id) errors.push('Product ID is required');
    if (!row.name) errors.push('Name is required');
    if (!row.description) errors.push('Description is required');
    if (!row.base_price || isNaN(row.base_price)) errors.push('Valid base price is required');
    //if (!row.finish) errors.push('Finish is required');
    //if (!row.fabric) errors.push('Fabric is required');
    if (!row.variant_price || isNaN(row.variant_price)) errors.push('Valid variant price is required');
    if (row.image && !isValidUrl(row.image)) errors.push('Invalid image URL format');
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
        cellText: true
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 2 });

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

      // Group variants by product
      const products = rows.reduce((acc, row) => {
        const productKey = row.product_id;
        if (!acc[productKey]) {
          acc[productKey] = {
            product_id: row.product_id,
            name: row.name,
            description: row.description,
            dimension: row.dimension,
            basePrice: parseFloat(row.base_price),
            variants: []
          };
        }

        acc[productKey].variants.push({
          finish: row.finish,
          fabric: row.fabric,
          size: row.size,         // Add size attribute
          insetPanel: row.insetPanel, // Add insetPanel attribute
          price: parseFloat(row.variant_price),
          image: row.image ? { url: row.image } : null,
          model: row.model ? { url: row.model } : null
        });

        return acc;
      }, {});

      // Create products
      const token = localStorage.getItem('token');
      const results = await Promise.all(
        Object.values(products).map(async (product) => {
          const formData = new FormData();
          formData.append('product_id', product.product_id);
          formData.append('name', product.name);
          formData.append('description', product.description);
          formData.append('dimension', product.dimension);
          formData.append('basePrice', product.basePrice.toString());
          formData.append('variants', JSON.stringify(product.variants));

          const response = await fetch(`${backendServer}/api/products`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Failed to create product ${product.product_id}`);
          }

          return response.json();
        })
      );

      setSuccess(`Successfully imported ${results.length} products`);
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
            Excel files must include: product_id, name, description, base_price, finish, fabric, size, insetPanel, variant_price, image
          </div>
        </label>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Processing file...</span>
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

export default BulkProductImport;