// InvoiceManagementInline.jsx - FIXED to match existing routes
import React, { useState, useEffect } from 'react';
import { Eye, FileText, Trash2, DollarSign, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const InvoiceManagementInline = ({ clientId, clientName, currentStep, onInvoiceGenerated }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qbConnected, setQbConnected] = useState(false);

  // Map step to invoice milestone
  const getInvoiceStepForCurrentStep = (step) => {
    if (step === 2) return [15, 43, 58, 67]; // All invoice steps
    if (step === 15) return [15];
    if (step === 43) return [43];
    if (step === 58) return [58];
    if (step === 67) return [67];
    return [];
  };

  const availableInvoiceSteps = getInvoiceStepForCurrentStep(currentStep);

  useEffect(() => {
    fetchInvoices();
    checkQBConnection();
    // eslint-disable-next-line
  }, [clientId]);

  const checkQBConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/quickbooks/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQbConnected(data.connected);
      }
    } catch (error) {
      console.error('QB status check error:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // FIXED: Use /client/:clientId route
      const response = await fetch(`${backendServer}/api/invoices/client/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Fetch invoices error:', error);
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
        setSuccess(`Invoice ${data.invoice.invoiceNumber} generated and saved to database!`);
        
        // Open invoice in new tab
        handleViewInvoice(data.invoice.invoiceNumber);
        
        fetchInvoices();
        if (onInvoiceGenerated) onInvoiceGenerated();
        
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

  const handleSyncToQuickBooks = async (invoiceNumber) => {
    try {
      setSyncing(prev => ({ ...prev, [invoiceNumber]: true }));
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/quickbooks/sync-invoice/${clientId}/${invoiceNumber}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Invoice ${invoiceNumber} synced to QuickBooks! ID: ${data.quickbooksId}`);
        fetchInvoices();
        if (onInvoiceGenerated) onInvoiceGenerated();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to sync to QuickBooks');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Sync to QuickBooks error:', error);
      setError('Failed to sync to QuickBooks');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSyncing(prev => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  const handleViewInvoice = (invoiceNumber) => {
    const url = `${window.location.origin}/invoice/${clientId}/${invoiceNumber}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteInvoice = async (invoiceNumber, syncStatus) => {
    if (syncStatus === 'synced') {
      setError('Cannot delete invoice that has been synced to QuickBooks');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!window.confirm(`Delete invoice ${invoiceNumber}?`)) return;

    try {
      const token = localStorage.getItem('token');
      // FIXED: Use /client/:clientId/:invoiceNumber route
      const response = await fetch(
        `${backendServer}/api/invoices/client/${clientId}/${invoiceNumber}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setSuccess(`Invoice ${invoiceNumber} deleted!`);
        fetchInvoices();
        if (onInvoiceGenerated) onInvoiceGenerated();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      setError('Failed to delete invoice');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStepLabel = (stepNumber) => {
    const labels = {
      15: '30% Deposit',
      43: '20% Progress (50% Total)',
      58: '25% Progress (75% Total)',
      67: '25% Final (100% Complete)'
    };
    return labels[stepNumber] || `Step ${stepNumber}`;
  };

  const isGenerated = (stepNumber) => {
    return invoices.some(inv => inv.stepNumber === stepNumber);
  };

  const getInvoiceByStep = (stepNumber) => {
    return invoices.find(inv => inv.stepNumber === stepNumber);
  };

  const getSyncStatusBadge = (syncStatus) => {
    switch (syncStatus) {
      case 'synced':
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            QB Synced
          </span>
        );
      case 'pending':
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
            QB Pending
          </span>
        );
      case 'error':
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            QB Error
          </span>
        );
      default:
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-bold">
            Not Synced
          </span>
        );
    }
  };

  if (availableInvoiceSteps.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-gray-900 text-lg">Invoice Management & QuickBooks</h4>
          <p className="text-sm text-gray-600">Generate invoices and sync to QuickBooks</p>
        </div>
        {qbConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full border border-green-300">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700">QB Connected</span>
          </div>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generate Buttons */}
      <div className="mb-4">
        <h5 className="text-sm font-bold text-gray-700 mb-3">Generate New Invoice</h5>
        <div className="grid grid-cols-2 gap-2">
          {availableInvoiceSteps.map(step => {
            const invoice = getInvoiceByStep(step);
            const alreadyGenerated = isGenerated(step);
            
            return (
              <button
                key={step}
                onClick={() => handleGenerateInvoice(step)}
                disabled={alreadyGenerated || loading}
                className={`px-3 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  alreadyGenerated
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : loading
                    ? 'bg-gray-300 text-gray-600 cursor-wait'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                <FileText className="w-4 h-4" />
                {getStepLabel(step)}
                {alreadyGenerated && (
                  <span className="ml-1">
                    {invoice?.quickbooksSyncStatus === 'synced' ? '✓ Synced' : '✓'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Invoice will open in new tab as HTML
        </p>
      </div>

      {/* Invoice List */}
      <div>
        <h5 className="text-sm font-bold text-gray-700 mb-3">
          Generated Invoices ({invoices.length})
        </h5>

        {invoices.length === 0 ? (
          <div className="text-center py-6 bg-white/50 rounded-lg border border-green-200">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 border-2 border-green-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Invoice Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-mono text-base font-bold text-green-700">
                        {invoice.invoiceNumber}
                      </div>
                      {getSyncStatusBadge(invoice.quickbooksSyncStatus)}
                    </div>
                    
                    <div className="text-sm text-gray-700 space-y-1 mb-2">
                      <div className="font-semibold">{getStepLabel(invoice.stepNumber)}</div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">${invoice.amount.toLocaleString()}</span>
                        <span className="text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {invoice.quickbooksId && (
                      <div className="text-xs text-green-600 font-semibold bg-green-50 inline-block px-2 py-1 rounded">
                        QB ID: {invoice.quickbooksId}
                      </div>
                    )}

                    {/* Payment Status Badge */}
                    <div className="mt-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        invoice.paid
                          ? 'bg-emerald-100 text-emerald-700'
                          : new Date(invoice.dueDate) < new Date()
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {invoice.paid ? '✓ Paid' : new Date(invoice.dueDate) < new Date() ? '⚠ Overdue' : '○ Unpaid'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => handleViewInvoice(invoice.invoiceNumber)}
                      className="p-2.5 hover:bg-green-100 rounded-lg text-green-600 transition-all border border-green-200"
                      title="View Invoice"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {/* Sync to QuickBooks Button */}
                    {qbConnected && invoice.quickbooksSyncStatus !== 'synced' && (
                      <button
                        onClick={() => handleSyncToQuickBooks(invoice.invoiceNumber)}
                        disabled={syncing[invoice.invoiceNumber]}
                        className="p-2.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-all border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sync to QuickBooks"
                      >
                        <RefreshCw className={`w-5 h-5 ${syncing[invoice.invoiceNumber] ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteInvoice(invoice.invoiceNumber, invoice.quickbooksSyncStatus)}
                      className="p-2.5 hover:bg-red-100 rounded-lg text-red-600 transition-all border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={invoice.quickbooksSyncStatus === 'synced' ? 'Cannot delete synced invoice' : 'Delete Invoice'}
                      disabled={invoice.quickbooksSyncStatus === 'synced'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 font-semibold mb-1.5 flex items-center gap-1.5">
          <span className="text-base">💡</span> How to use:
        </p>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Generate invoice → Opens in new tab</li>
          <li>Press Ctrl+P to save as PDF</li>
          <li>Click <RefreshCw className="w-3 h-3 inline" /> to sync to QuickBooks</li>
        </ol>
      </div>
    </div>
  );
};

export default InvoiceManagementInline;