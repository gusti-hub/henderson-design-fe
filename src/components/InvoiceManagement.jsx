// InvoiceManagement.jsx
import React, { useState, useEffect } from 'react';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { backendServer } from '../utils/info'; // Use your existing backendServer

const InvoiceManagement = ({ clientId, clientName, onClose }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line
  }, [clientId]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/invoices/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Fetch invoices error:', error);
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (stepNumber) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/invoices/generate/${clientId}/${stepNumber}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bypassSequentialCheck: true })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Invoice ${data.invoice.invoiceNumber} generated successfully!`);
        fetchInvoices();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate invoice');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Generate invoice error:', error);
      setError('Failed to generate invoice');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoiceNumber) => {
    // Open invoice in new tab - frontend route
    const url = `${window.location.origin}/invoice/${clientId}/${invoiceNumber}`;
    window.open(url, '_blank');
  };

  const handleDeleteInvoice = async (invoiceNumber) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/invoices/${clientId}/${invoiceNumber}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setSuccess(`Invoice ${invoiceNumber} deleted successfully!`);
        fetchInvoices();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete invoice');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Delete invoice error:', error);
      setError('Failed to delete invoice');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStepLabel = (stepNumber) => {
    const labels = {
      15: 'Step 15 - Design Fee (30%)',
      43: 'Step 43 - Progress to 50% (20%)',
      58: 'Step 58 - Progress to 75% (25%)',
      67: 'Step 67 - Final Payment (25%)'
    };
    return labels[stepNumber] || `Step ${stepNumber}`;
  };

  const isInvoiceGenerated = (stepNumber) => {
    return invoices.some(inv => inv.stepNumber === stepNumber);
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Generate Invoice Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Generate New Invoice</h3>
        <div className="grid grid-cols-2 gap-3">
          {[15, 43, 58, 67].map(step => (
            <button
              key={step}
              onClick={() => handleGenerateInvoice(step)}
              disabled={isInvoiceGenerated(step) || loading}
              className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                isInvoiceGenerated(step)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : loading
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              }`}
            >
              <FileText className="w-4 h-4" />
              {getStepLabel(step)}
              {isInvoiceGenerated(step) && ' ✓'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          Generated Invoices
          <span className="text-sm font-normal text-gray-600">({invoices.length})</span>
        </h3>

        {invoices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No invoices generated yet</p>
            <p className="text-sm text-gray-500 mt-2">Generate an invoice using the buttons above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {getStepLabel(invoice.stepNumber)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        invoice.paid
                          ? 'bg-emerald-100 text-emerald-700'
                          : new Date(invoice.dueDate) < new Date()
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {invoice.paid ? 'Paid' : new Date(invoice.dueDate) < new Date() ? 'Overdue' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.invoiceNumber)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                          title="View/Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.invoiceNumber)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                          title="Delete Invoice"
                          disabled={invoice.quickbooksSyncStatus === 'synced'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          How to Save as PDF
        </h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click the <Eye className="w-3 h-3 inline" /> eye icon to view invoice in new tab</li>
          <li>In browser, press <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">Ctrl+P</kbd> (Windows) or <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">⌘+P</kbd> (Mac)</li>
          <li>Select "Save as PDF" as destination</li>
          <li>Click "Save" to download PDF</li>
        </ol>
      </div>
    </div>
  );
};

export default InvoiceManagement;