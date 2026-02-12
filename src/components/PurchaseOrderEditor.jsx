import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Clock, Printer, ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { backendServer } from '../utils/info';

const PurchaseOrderEditor = ({ orderId, vendorId, version, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poData, setPOData] = useState(null);
  const [products, setProducts] = useState([]);
  const [vendorInfo, setVendorInfo] = useState({
    name: '',
    vendorCode: '',
    representativeName: '',
    website: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    contactInfo: { phone: '', email: '', fax: '' },
    accountNumber: ''
  });
  const [shipTo, setShipTo] = useState({
    name: '', address: '', city: '', attention: '', phone: ''
  });
  const [clientInfo, setClientInfo] = useState({});
  const [headerFields, setHeaderFields] = useState({
    poNumber: '',
    orderDate: '',
    accountNumber: '',
    repName: '',
    repPhone: '',
    repEmail: '',
    terms: '',
    estimateNumber: '',
    comments: '',
    notes: '',
    shipping: 0,
    others: 0
  });
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);

  const [originalTitle] = useState(document.title);

  useEffect(() => {
    loadPOData();
  }, [orderId, vendorId, version]);

  useEffect(() => {
    if (poData && vendorInfo.name) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const versionNum = poData.version || 1;
      const date = new Date().toISOString().split('T')[0];
      document.title = `PO_${client}_${vendor}_v${versionNum}_${date}`;
    }
    return () => { document.title = originalTitle; };
  }, [poData, vendorInfo, clientInfo, originalTitle]);

  const loadPOData = async () => {
    try {
      const token = localStorage.getItem('token');
      const versionParam = version || 'latest';
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/${versionParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setPOData(data);
        setProducts(data.products || []);
        setVendorInfo({
          name: data.vendorInfo?.name || '',
          vendorCode: data.vendorInfo?.vendorCode || '',
          representativeName: data.vendorInfo?.representativeName || '',
          website: data.vendorInfo?.website || '',
          address: {
            street: data.vendorInfo?.address?.street || '',
            city: data.vendorInfo?.address?.city || '',
            state: data.vendorInfo?.address?.state || '',
            zip: data.vendorInfo?.address?.zip || '',
            country: data.vendorInfo?.address?.country || ''
          },
          contactInfo: {
            phone: data.vendorInfo?.contactInfo?.phone || '',
            email: data.vendorInfo?.contactInfo?.email || '',
            fax: data.vendorInfo?.contactInfo?.fax || ''
          },
          accountNumber: data.vendorInfo?.accountNumber || ''
        });
        setShipTo(data.shipTo || {});
        setClientInfo(data.clientInfo || {});
        setHeaderFields({
          poNumber: data.poNumber || '',
          orderDate: data.orderDate 
            ? new Date(data.orderDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) 
            : '',
          accountNumber: data.accountNumber || '',
          repName: data.repName || '',
          repPhone: data.repPhone || '',
          repEmail: data.repEmail || '',
          terms: data.terms || '',
          estimateNumber: data.estimateNumber || '',
          comments: data.comments || '',
          notes: data.notes || '',
          shipping: data.shipping || 0,
          others: data.others || 0
        });
      } else {
        alert('Failed to load PO: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading PO:', error);
      alert('Failed to load Purchase Order data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: poData.version,
            products,
            vendorInfo,
            shipTo,
            clientInfo,
            ...headerFields
          })
        }
      );
      const result = await response.json();
      if (result.success) {
        alert('✅ Purchase Order saved successfully');
        loadPOData();
      } else {
        alert('Failed to save: ' + (result.message || ''));
      }
    } catch (error) {
      console.error('Error saving PO:', error);
      alert('Failed to save Purchase Order');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNewVersion = async () => {
    if (!versionNotes.trim()) {
      alert('Please add notes for this new version');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/new-version`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            products,
            vendorInfo,
            shipTo,
            clientInfo,
            versionNotes,
            ...headerFields
          })
        }
      );
      const result = await response.json();
      if (result.success) {
        alert(`✅ PO Version ${result.data.version} created successfully`);
        setShowVersionModal(false);
        setVersionNotes('');
        window.location.href = `/admin/purchase-order/${orderId}/${vendorId}/${result.data.version}`;
      }
    } catch (error) {
      console.error('Error creating PO version:', error);
      alert('Failed to create new version');
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index][parent] = { ...updated[index][parent], [child]: value };
    } else {
      updated[index][field] = value;
    }
    if (['quantity', 'unitPrice'].includes(field)) {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : (updated[index].quantity || 1);
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : (updated[index].unitPrice || 0);
      updated[index].totalPrice = qty * price;
    }
    setProducts(updated);
  };

  const removeProduct = (index) => {
    if (window.confirm('Remove this product from the PO?')) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const addEmptyProduct = () => {
    setProducts([...products, {
      product_id: '',
      name: '',
      category: '',
      spotName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: '',
      selectedOptions: { finish: '', fabric: '', size: '', image: '', notes: '' }
    }]);
  };

  const calculateTotals = () => {
    const subTotal = products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const shipping = parseFloat(headerFields.shipping) || 0;
    const others = parseFloat(headerFields.others) || 0;
    const total = subTotal + shipping + others;
    return { subTotal, shipping, others, total };
  };

  const handlePrint = () => { setShowPrintInstructions(true); };

  const doPrint = () => {
    setShowPrintInstructions(false);
    if (poData && vendorInfo.name) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const versionNum = poData.version || 1;
      const date = new Date().toISOString().split('T')[0];
      document.title = `PO_${client}_${vendor}_v${versionNum}_${date}`;
    }
    setTimeout(() => { window.print(); }, 100);
  };

  // ✅ Helper: Format vendor address for display
  const formatVendorAddress = () => {
    const parts = [
      vendorInfo.address?.street,
      [vendorInfo.address?.city, vendorInfo.address?.state, vendorInfo.address?.zip].filter(Boolean).join(', ')
    ].filter(Boolean);
    return parts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
          <span className="text-gray-600 font-medium">Loading Purchase Order...</span>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const printedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  return (
    <>
      {/* ====== PRINT STYLES ====== */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .po-page {
            page-break-after: always;
            page-break-inside: avoid;
            padding: 0.5in;
            min-height: 10in;
            max-height: 10.5in;
            position: relative;
            margin: 0;
            box-shadow: none;
            background: white;
          }
          input, textarea, select {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .remove-btn { display: none !important; }
          .add-product-btn { display: none !important; }
        }
        @page { size: letter; margin: 0.4in; }

        .po-page {
          background: white;
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
        }
        .po-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .po-field-label {
          font-weight: bold;
          font-size: 11px;
          color: #333;
          white-space: nowrap;
        }
        .po-input {
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          padding: 2px 6px;
          font-size: 11px;
          width: 100%;
          background: white;
          outline: none;
          transition: border-color 0.15s;
        }
        .po-input:focus { border-color: #005670; }
        .po-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .po-table th {
          background: #666;
          color: white;
          padding: 6px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
        }
        .po-table td {
          border-bottom: 1px solid #e5e7eb;
          padding: 8px;
          vertical-align: top;
        }
        .po-table .desc-cell textarea {
          width: 100%;
          font-size: 11px;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          padding: 4px 6px;
          resize: vertical;
          min-height: 60px;
          line-height: 1.4;
          font-family: Arial, sans-serif;
        }
        .po-table .desc-cell textarea:focus { border-color: #005670; outline: none; }
        .po-table .img-cell { width: 70px; }
        .po-table .img-cell img { max-width: 60px; max-height: 60px; object-fit: contain; }
        .po-table .price-cell { text-align: right; white-space: nowrap; }
        .po-totals-row td { border-bottom: none; padding: 3px 8px; }
      `}</style>

      {/* ====== TOOLBAR (no-print) ====== */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm font-medium text-gray-700">
            Purchase Order — {vendorInfo.name || 'Vendor'} — Version {poData?.version || 1}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            poData?.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
            poData?.status === 'sent' ? 'bg-blue-100 text-blue-700' :
            poData?.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {poData?.status?.charAt(0).toUpperCase() + poData?.status?.slice(1) || 'Draft'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowVersionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" />
            Versions
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => { setVersionNotes(''); setShowVersionModal('new'); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
            <FileText className="w-4 h-4" />
            Save as New Version
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium">
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ====== PRINTABLE PO CONTENT ====== */}
      <div className="print-container bg-gray-100 min-h-screen py-8">
        <div className="po-page">
          {/* ---- TOP SECTION: Company Info + Logo ---- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#333' }}>
              <p>74-5518 Kaiwi Street Suite B</p>
              <p>Kailua Kona, HI 96740-3145</p>
              <p>(808) 315-8782</p>
              <p>Fax:</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '6px', color: '#4a4a4a', fontFamily: 'Georgia, serif' }}>
                HENDERSON
              </div>
              <div style={{ fontSize: '14px', letterSpacing: '8px', color: '#6a6a6a', fontFamily: 'Georgia, serif' }}>
                DESIGN GROUP
              </div>
            </div>
          </div>

          {/* ---- PURCHASE ORDER TITLE ---- */}
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '15px 0 12px', color: '#333' }}>
            Purchase Order
          </h2>

          {/* ---- HEADER INFO GRID ---- */}
          <div className="po-header-grid" style={{ borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '12px' }}>
            {/* LEFT COLUMN: Vendor / Ship To */}
            <div style={{ paddingRight: '20px' }}>
              <p className="po-field-label" style={{ marginBottom: '4px' }}>To:</p>
              <input
                className="po-input"
                value={vendorInfo.name || ''}
                onChange={(e) => setVendorInfo({ ...vendorInfo, name: e.target.value })}
                placeholder="Vendor Name"
                style={{ fontWeight: '500', marginBottom: '2px' }}
              />
              <input
                className="po-input"
                value={vendorInfo.address?.street || ''}
                onChange={(e) => setVendorInfo({ 
                  ...vendorInfo, 
                  address: { ...vendorInfo.address, street: e.target.value } 
                })}
                placeholder="Street Address"
                style={{ marginBottom: '2px' }}
              />
              <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                <input
                  className="po-input"
                  value={vendorInfo.address?.city || ''}
                  onChange={(e) => setVendorInfo({ 
                    ...vendorInfo, 
                    address: { ...vendorInfo.address, city: e.target.value } 
                  })}
                  placeholder="City"
                  style={{ flex: 2 }}
                />
                <input
                  className="po-input"
                  value={vendorInfo.address?.state || ''}
                  onChange={(e) => setVendorInfo({ 
                    ...vendorInfo, 
                    address: { ...vendorInfo.address, state: e.target.value } 
                  })}
                  placeholder="State"
                  style={{ flex: 1 }}
                />
                <input
                  className="po-input"
                  value={vendorInfo.address?.zip || ''}
                  onChange={(e) => setVendorInfo({ 
                    ...vendorInfo, 
                    address: { ...vendorInfo.address, zip: e.target.value } 
                  })}
                  placeholder="ZIP"
                  style={{ flex: 1 }}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <span className="po-field-label">Attention: </span>
                <input
                  className="po-input"
                  value={vendorInfo.representativeName || ''}
                  onChange={(e) => setVendorInfo({ ...vendorInfo, representativeName: e.target.value })}
                  placeholder="Contact Name"
                  style={{ width: '60%', display: 'inline-block' }}
                />
              </div>
              <div>
                <span className="po-field-label">Phone: </span>
                <input
                  className="po-input"
                  value={vendorInfo.contactInfo?.phone || ''}
                  onChange={(e) => setVendorInfo({ 
                    ...vendorInfo, 
                    contactInfo: { ...vendorInfo.contactInfo, phone: e.target.value } 
                  })}
                  placeholder="Phone"
                  style={{ width: '35%', display: 'inline-block' }}
                />
                <span className="po-field-label" style={{ marginLeft: '12px' }}>Fax: </span>
                <input
                  className="po-input"
                  value={vendorInfo.contactInfo?.fax || ''}
                  onChange={(e) => setVendorInfo({ 
                    ...vendorInfo, 
                    contactInfo: { ...vendorInfo.contactInfo, fax: e.target.value } 
                  })}
                  placeholder="Fax"
                  style={{ width: '25%', display: 'inline-block' }}
                />
              </div>

              {/* Ship To */}
              <div style={{ marginTop: '10px' }}>
                <p className="po-field-label">Ship To:</p>
                <input
                  className="po-input"
                  value={shipTo.name || ''}
                  onChange={(e) => setShipTo({ ...shipTo, name: e.target.value })}
                  placeholder="Ship To Name"
                  style={{ marginBottom: '2px' }}
                />
                <input
                  className="po-input"
                  value={shipTo.address || ''}
                  onChange={(e) => setShipTo({ ...shipTo, address: e.target.value })}
                  placeholder="Address"
                  style={{ marginBottom: '2px' }}
                />
                <input
                  className="po-input"
                  value={shipTo.city || ''}
                  onChange={(e) => setShipTo({ ...shipTo, city: e.target.value })}
                  placeholder="City, State ZIP"
                />
                <div style={{ marginTop: '4px' }}>
                  <span className="po-field-label">Attention: </span>
                  <input
                    className="po-input"
                    value={shipTo.attention || ''}
                    onChange={(e) => setShipTo({ ...shipTo, attention: e.target.value })}
                    placeholder="Attention"
                    style={{ width: '60%', display: 'inline-block' }}
                  />
                </div>
                <div>
                  <span className="po-field-label">Phone: </span>
                  <input
                    className="po-input"
                    value={shipTo.phone || ''}
                    onChange={(e) => setShipTo({ ...shipTo, phone: e.target.value })}
                    placeholder="Phone"
                    style={{ width: '50%', display: 'inline-block' }}
                  />
                </div>
              </div>

              {/* Comments / Notes */}
              <div style={{ marginTop: '10px' }}>
                <span className="po-field-label">Comments: </span>
                <input
                  className="po-input"
                  value={headerFields.comments}
                  onChange={(e) => setHeaderFields({ ...headerFields, comments: e.target.value })}
                  placeholder=""
                  style={{ width: '70%', display: 'inline-block' }}
                />
              </div>
              <div>
                <span className="po-field-label">Notes: </span>
                <input
                  className="po-input"
                  value={headerFields.notes}
                  onChange={(e) => setHeaderFields({ ...headerFields, notes: e.target.value })}
                  placeholder=""
                  style={{ width: '75%', display: 'inline-block' }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Order details */}
            <div>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Order #:', field: 'poNumber', value: headerFields.poNumber },
                    { label: 'Order Date:', field: 'orderDate', value: headerFields.orderDate },
                    { label: 'Printed Date:', value: printedDate, readOnly: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '3px 8px 3px 0', fontWeight: 'bold', textAlign: 'right', width: '45%' }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '3px 0', textAlign: 'right' }}>
                        {row.readOnly ? (
                          <span>{row.value}</span>
                        ) : (
                          <input
                            className="po-input"
                            value={row.value || ''}
                            onChange={(e) => setHeaderFields({ ...headerFields, [row.field]: e.target.value })}
                            style={{ textAlign: 'right' }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr><td colSpan={2} style={{ padding: '4px' }}></td></tr>
                  {[
                    { label: 'Account Number:', field: 'accountNumber', value: headerFields.accountNumber },
                    { label: 'Rep Name:', field: 'repName', value: headerFields.repName },
                    { label: 'Rep Phone:', field: 'repPhone', value: headerFields.repPhone },
                    { label: 'Rep Email:', field: 'repEmail', value: headerFields.repEmail },
                  ].map((row, i) => (
                    <tr key={`extra-${i}`}>
                      <td style={{ padding: '3px 8px 3px 0', fontWeight: 'bold', textAlign: 'right' }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '3px 0', textAlign: 'right' }}>
                        <input
                          className="po-input"
                          value={row.value || ''}
                          onChange={(e) => setHeaderFields({ ...headerFields, [row.field]: e.target.value })}
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr><td colSpan={2} style={{ padding: '4px' }}></td></tr>
                  {[
                    { label: 'Terms:', field: 'terms', value: headerFields.terms },
                    { label: 'Client:', value: clientInfo.name || '', field: '_clientName' },
                    { label: 'Estimate #:', field: 'estimateNumber', value: headerFields.estimateNumber },
                  ].map((row, i) => (
                    <tr key={`terms-${i}`}>
                      <td style={{ padding: '3px 8px 3px 0', fontWeight: 'bold', textAlign: 'right' }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '3px 0', textAlign: 'right' }}>
                        <input
                          className="po-input"
                          value={row.value || ''}
                          onChange={(e) => {
                            if (row.field === '_clientName') {
                              setClientInfo({ ...clientInfo, name: e.target.value });
                            } else {
                              setHeaderFields({ ...headerFields, [row.field]: e.target.value });
                            }
                          }}
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---- PRODUCT TABLE ---- */}
          <table className="po-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}></th>
                <th>Description</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Unit Cost</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Total Cost</th>
                <th className="no-print" style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const imgSrc = product.selectedOptions?.image || 
                               product.selectedOptions?.images?.[0] || null;

                return (
                  <tr key={index}>
                    <td className="img-cell">
                      {imgSrc ? (
                        <img src={imgSrc} alt={product.name || ''} />
                      ) : (
                        <div style={{ width: '60px', height: '60px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#999' }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="desc-cell">
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#666' }}>Quantity : </span>
                        <input
                          className="po-input"
                          type="number"
                          value={product.quantity || 1}
                          onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                          style={{ width: '60px', display: 'inline-block' }}
                          min="1"
                        />
                      </div>
                      <textarea
                        value={product.description || ''}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        placeholder={`Specs: ${product.name || 'Product name'}\nPattern:\nColor:\nSize:\nConstruction:\nComposition:`}
                        rows={6}
                      />
                      <div style={{ marginTop: '4px', fontSize: '10px' }}>
                        <span style={{ color: '#666' }}>Sidemark: </span>
                        <input
                          className="po-input"
                          value={product.selectedOptions?.notes || ''}
                          onChange={(e) => updateProduct(index, 'selectedOptions.notes', e.target.value)}
                          placeholder="Sidemark / Notes"
                          style={{ width: '60%', display: 'inline-block' }}
                        />
                      </div>
                    </td>
                    <td className="price-cell">
                      <input
                        className="po-input"
                        type="number"
                        value={product.unitPrice || 0}
                        onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)}
                        style={{ textAlign: 'right', width: '90px' }}
                        step="0.01"
                      />
                    </td>
                    <td className="price-cell" style={{ fontWeight: '500' }}>
                      $ {(product.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="no-print remove-btn" style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => removeProduct(index)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Add Product Button Row */}
              <tr className="no-print add-product-btn">
                <td colSpan={5} style={{ padding: '8px', textAlign: 'center' }}>
                  <button
                    onClick={addEmptyProduct}
                    className="inline-flex items-center gap-1.5 text-xs text-[#005670] hover:text-[#004558] font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Product
                  </button>
                </td>
              </tr>

              {/* Totals */}
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Sub Total:</td>
                <td className="price-cell">
                  $ {totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Shipping:</td>
                <td className="price-cell">
                  <input
                    className="po-input"
                    type="number"
                    value={headerFields.shipping || 0}
                    onChange={(e) => setHeaderFields({ ...headerFields, shipping: parseFloat(e.target.value) || 0 })}
                    style={{ textAlign: 'right', width: '90px' }}
                    step="0.01"
                  />
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Others:</td>
                <td className="price-cell">
                  <input
                    className="po-input"
                    type="number"
                    value={headerFields.others || 0}
                    onChange={(e) => setHeaderFields({ ...headerFields, others: parseFloat(e.target.value) || 0 })}
                    style={{ textAlign: 'right', width: '90px' }}
                    step="0.01"
                  />
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="po-totals-row" style={{ borderTop: '2px solid #333' }}>
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ fontWeight: 'bold' }}>Total:</td>
                <td className="price-cell" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  $ {totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== VERSION MODAL ====== */}
      {showVersionModal && (
        <POVersionModal
          orderId={orderId}
          vendorId={vendorId}
          isOpen={showVersionModal}
          onClose={() => { setShowVersionModal(false); setVersionNotes(''); }}
          onSelectVersion={(v) => {
            window.location.href = `/admin/purchase-order/${orderId}/${vendorId}/${v}`;
          }}
          versionNotes={versionNotes}
          setVersionNotes={setVersionNotes}
          onSaveNewVersion={handleSaveAsNewVersion}
          saving={saving}
        />
      )}

      {/* ====== PRINT INSTRUCTIONS MODAL ====== */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print / Save as PDF</h3>
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">For the best print quality, please configure:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { num: 1, title: 'Destination', desc: 'Select "Save as PDF" or your printer' },
                  { num: 2, title: 'Disable Headers and Footers', desc: 'Uncheck "Headers and footers"' },
                  { num: 3, title: 'Margins', desc: 'Select "None" or "Custom"' },
                  { num: 4, title: 'Background Graphics', desc: 'Check "Background graphics" to print all colors' },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{step.num}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPrintInstructions(false)} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button onClick={doPrint} className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Continue to Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ====== PO VERSION MODAL ======
const POVersionModal = ({
  orderId, vendorId, isOpen, onClose, onSelectVersion,
  versionNotes, setVersionNotes, onSaveNewVersion, saving
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen === true) loadVersions();
  }, [isOpen]);

  const loadVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/versions/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success) setVersions(result.data);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // NEW VERSION FORM
  if (isOpen === 'new') {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
          <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
            <h3 className="text-xl font-bold">Save as New PO Version</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={onSaveNewVersion}
                disabled={saving || !versionNotes.trim()}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save as New Version'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VERSION HISTORY LIST
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">PO Version History</h3>
            <p className="text-sm text-white/80 mt-1">View and manage all PO versions for this vendor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-auto max-h-[calc(80vh-88px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670] mx-auto"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No versions found</div>
          ) : (
            <div className="divide-y">
              {versions.map((v) => (
                <div key={v._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                          Version {v.version}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          v.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          v.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          v.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}
                        </span>
                        {v.poNumber && (
                          <span className="text-xs text-gray-500">PO#: {v.poNumber}</span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{v.versionNotes || v.notes || 'No notes'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {new Date(v.createdAt).toLocaleDateString()} by {v.createdBy?.name || 'Admin'}</span>
                        <span>Total: ${(v.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectVersion(v.version)}
                      className="ml-4 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      View/Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderEditor;