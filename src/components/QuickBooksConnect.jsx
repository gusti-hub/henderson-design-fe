// QuickBooksConnect.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { backendServer } from '../utils/info';

const QuickBooksConnect = () => {
  const [qbStatus, setQbStatus]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [qbItems, setQbItems]           = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsLoaded, setItemsLoaded]   = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('qb_connected') === 'true') {
      setSuccess('QuickBooks connected successfully!');
      setTimeout(() => checkStatus(), 1500);
    } else if (urlParams.get('qb_error')) {
      setError(`Connection failed: ${urlParams.get('qb_error')}`);
      checkStatus();
    } else {
      checkStatus();
    }
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/quickbooks/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQbStatus(data);
      }
    } catch (error) {
      console.error('Status check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/quickbooks/connect`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        setError('Failed to initiate QuickBooks connection');
      }
    } catch (error) {
      setError('Failed to connect to QuickBooks');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect QuickBooks?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/quickbooks/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccess('QuickBooks disconnected successfully');
        setQbItems([]);
        setItemsLoaded(false);
        checkStatus();
      } else {
        setError('Failed to disconnect QuickBooks');
      }
    } catch (error) {
      setError('Failed to disconnect');
    }
  };

  const handleTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/quickbooks/test`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuccess('Connection test successful! ' + (data.companyInfo?.CompanyName || ''));
      } else {
        setError('Connection test failed');
      }
    } catch (error) {
      setError('Connection test failed');
    }
  };

  const fetchQBItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/quickbooks/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQbItems(data.items || []);
        setItemsLoaded(true);
      } else {
        const err = await response.json().catch(() => ({}));
        setError('Failed to fetch QB items: ' + (err.message || ''));
      }
    } catch (error) {
      setError('Failed to fetch QB items');
    } finally {
      setLoadingItems(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* ── Main Card ── */}
      <div className="bg-white rounded-lg shadow-lg p-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">QuickBooks Integration</h2>
            <p className="text-gray-600">Connect to sync invoices automatically</p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-semibold">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-semibold">{error}</span>
          </div>
        )}

        {/* Status Card */}
        <div className={`p-6 rounded-lg border-2 mb-6 ${
          qbStatus?.connected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                qbStatus?.connected ? 'bg-green-100' : 'bg-gray-200'
              }`}>
                {qbStatus?.connected
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <AlertCircle className="w-6 h-6 text-gray-600" />
                }
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {qbStatus?.connected ? 'Connected' : 'Not Connected'}
                </h3>
                <p className="text-sm text-gray-600">{qbStatus?.message}</p>
              </div>
            </div>
            <button onClick={checkStatus} className="p-2 hover:bg-white rounded-lg transition-all" title="Refresh Status">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {qbStatus?.connected && (
            <div className="space-y-2 text-sm">
              {qbStatus.realmId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Realm ID:</span>
                  <span className="font-mono text-gray-900">{qbStatus.realmId}</span>
                </div>
              )}
              {qbStatus.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="text-gray-900">{new Date(qbStatus.expiresAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!qbStatus?.connected ? (
            <button
              onClick={handleConnect}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Connect to QuickBooks
            </button>
          ) : (
            <>
              <button
                onClick={handleTest}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Test Connection
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Disconnect QuickBooks
              </button>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">ℹ️ How it works:</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click "Connect to QuickBooks"</li>
            <li>Sign in to your QuickBooks account</li>
            <li>Authorize the connection</li>
            <li>Return here to start syncing invoices</li>
          </ol>
        </div>

        {/* Warning for needs reconnect */}
        {qbStatus?.needsReconnect && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-semibold">
              ⚠️ Your QuickBooks connection has expired. Please reconnect.
            </p>
          </div>
        )}
      </div>

      {/* ── QB Items Card ── */}
      {qbStatus?.connected && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">QB Items / Products</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Gunakan kolom <strong>ID</strong> untuk update <code className="bg-gray-100 px-1 rounded">ITEM_ID_MAP</code> di <code className="bg-gray-100 px-1 rounded">quickbooksClient.js</code>
              </p>
            </div>
            <button
              onClick={fetchQBItems}
              disabled={loadingItems}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
            >
              {loadingItems
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</>
                : <><RefreshCw className="w-4 h-4" /> {itemsLoaded ? 'Refresh Items' : 'Load Items'}</>
              }
            </button>
          </div>

          {!itemsLoaded && !loadingItems && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Klik "Load Items" untuk lihat semua items di QuickBooks
            </div>
          )}

          {loadingItems && (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Fetching items from QuickBooks...</p>
            </div>
          )}

          {itemsLoaded && !loadingItems && (
            <>
              {qbItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No items found in QuickBooks
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-16">ID</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Name</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-32">Type</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-20">Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {qbItems.map(item => (
                        <tr key={item.Id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold">
                              {item.Id}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-gray-800">{item.Name}</td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs">{item.Type}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              item.Active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {item.Active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{qbItems.length} items total</span>
                    <span className="text-xs text-gray-400">
                      Copy ID → paste ke <code className="bg-gray-200 px-1 rounded">ITEM_ID_MAP</code>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default QuickBooksConnect;