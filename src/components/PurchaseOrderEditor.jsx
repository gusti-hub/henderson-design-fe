import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Clock, Printer, ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Image with print-safe base64 conversion ──────────────────────────────────
const PrintSafeImage = ({ src, alt, style, fallback }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) { setFailed(true); return; }
    let cancelled = false;

    const toBase64 = async () => {
      try {
        const res = await fetch(src, { mode: 'cors' });
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) setDataUrl(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (cancelled) return;
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            setDataUrl(canvas.toDataURL());
          } catch {
            setFailed(true);
          }
        };
        img.onerror = () => { if (!cancelled) setFailed(true); };
        img.src = src;
      }
    };

    toBase64();
    return () => { cancelled = true; };
  }, [src]);

  if (failed || (!dataUrl && !src)) return fallback || null;

  return (
    <img
      src={dataUrl || src}
      alt={alt || ''}
      style={style}
      onError={() => setFailed(true)}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [isPrinting, setIsPrinting] = useState(false);
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

      const [poResponse, orderResponse] = await Promise.all([
        fetch(`${backendServer}/api/orders/${orderId}/po/${vendorId}/${versionParam}`,
          { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendServer}/api/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const result = await poResponse.json();
      const orderData = await orderResponse.json();

      const orderProductMap = {};
      (orderData.selectedProducts || []).forEach(p => {
        if (p.product_id) orderProductMap[p.product_id] = p;
        if (p._id) orderProductMap[p._id.toString()] = p;
      });

      if (result.success) {
        const data = result.data;
        setPOData(data);

        // ── Step 1: Enrich existing PO products from order ──
        const enrichedProducts = (data.products || []).map(poProduct => {
          const orderProduct = orderProductMap[poProduct.product_id] ||
                               orderProductMap[poProduct._id?.toString()];
          if (!orderProduct) return poProduct;

          const hasImages = poProduct.selectedOptions?.uploadedImages?.length > 0;
          const orderImages = orderProduct.selectedOptions?.uploadedImages || [];
          const orderMsrp = orderProduct.selectedOptions?.msrp || 0;
          const orderNetOverride = orderProduct.selectedOptions?.netCostOverride;
          const netCost = (orderNetOverride != null && orderNetOverride !== '')
            ? parseFloat(orderNetOverride)
            : parseFloat(orderMsrp || 0);

          return {
            ...poProduct,
            unitPrice: netCost > 0 ? netCost : poProduct.unitPrice,
            totalPrice: netCost > 0 ? netCost * (poProduct.quantity || 1) : poProduct.totalPrice,
            selectedOptions: {
              ...poProduct.selectedOptions,
              uploadedImages: hasImages ? poProduct.selectedOptions.uploadedImages : orderImages,
              msrp: orderMsrp || poProduct.selectedOptions?.msrp || 0,
              sidemark: poProduct.selectedOptions?.sidemark || orderProduct.selectedOptions?.sidemark || '',
              shipToName: poProduct.selectedOptions?.shipToName || orderProduct.selectedOptions?.shipToName || '',
              shippingStreet: poProduct.selectedOptions?.shippingStreet || orderProduct.selectedOptions?.shippingStreet || '',
              shippingCity: poProduct.selectedOptions?.shippingCity || orderProduct.selectedOptions?.shippingCity || '',
              shippingState: poProduct.selectedOptions?.shippingState || orderProduct.selectedOptions?.shippingState || '',
              shippingPostalCode: poProduct.selectedOptions?.shippingPostalCode || orderProduct.selectedOptions?.shippingPostalCode || '',
            }
          };
        });

        // ── Step 2: Add new order products for this vendor not yet in PO ──
        const poProductIds = new Set((data.products || []).map(p => p.product_id));
        const vendorIdNorm = vendorId?.toString();

        const newProducts = (orderData.selectedProducts || [])
          .filter(p => {
            const pVendorId = p.vendor?._id?.toString() || p.vendor?.toString();
            return pVendorId === vendorIdNorm && !poProductIds.has(p.product_id);
          })
          .map(p => {
            const opts = p.selectedOptions || {};
            const netCost = (opts.netCostOverride != null && opts.netCostOverride !== '')
              ? parseFloat(opts.netCostOverride) : parseFloat(opts.msrp || 0);
            const qty = p.quantity || 1;
            const specs = [];
            if (opts.vendorDescription) specs.push(opts.vendorDescription);
            else if (opts.specifications) specs.push(opts.specifications);
            if (opts.finish) specs.push(`Finish: ${opts.finish}`);
            if (opts.fabric) specs.push(`Fabric: ${opts.fabric}`);
            if (opts.size) specs.push(`Size: ${opts.size}`);
            return {
              product_id: p.product_id || '',
              name: p.name || '',
              category: p.category || '',
              spotName: p.spotName || '',
              quantity: qty,
              unitPrice: netCost,
              totalPrice: netCost * qty,
              description: specs.join('\n') || '',
              selectedOptions: {
                finish: opts.finish || '', fabric: opts.fabric || '', size: opts.size || '',
                specifications: opts.specifications || '', vendorDescription: opts.vendorDescription || '',
                image: opts.image || '', images: opts.images || [],
                uploadedImages: (opts.uploadedImages || []).map(img => ({
                  filename: img.filename || '', contentType: img.contentType || '',
                  url: img.url || '', key: img.key || '',
                  size: img.size || 0, uploadedAt: img.uploadedAt || new Date(),
                })),
                notes: opts.notes || '', poNumber: opts.poNumber || '',
                sidemark: opts.sidemark || '', units: opts.units || 'Each',
                msrp: parseFloat(opts.msrp) || 0, netCostOverride: opts.netCostOverride ?? null,
                shipToName: opts.shipToName || '', shippingStreet: opts.shippingStreet || '',
                shippingCity: opts.shippingCity || '', shippingState: opts.shippingState || '',
                shippingPostalCode: opts.shippingPostalCode || '', shipToPhone: opts.shipToPhone || '',
              }
            };
          });

        setProducts([...enrichedProducts, ...newProducts]);

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

        const firstProductWithShipping = (data.products || []).find(p => p.selectedOptions?.shippingStreet);
        const enrichedShipTo = data.shipTo && (data.shipTo.name || data.shipTo.address) ? data.shipTo : {};
        if (firstProductWithShipping && !enrichedShipTo.name) {
          const opts = firstProductWithShipping.selectedOptions;
          setShipTo({
            name: opts.shipToName || '',
            address: opts.shippingStreet || '',
            city: [opts.shippingCity, opts.shippingState, opts.shippingPostalCode].filter(Boolean).join(', '),
            attention: '',
            phone: opts.shipToPhone || ''
          });
        } else {
          setShipTo(enrichedShipTo);
        }

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
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: poData.version, products, vendorInfo, shipTo, clientInfo, ...headerFields })
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
    if (!versionNotes.trim()) { alert('Please add notes for this new version'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/new-version`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ products, vendorInfo, shipTo, clientInfo, versionNotes, ...headerFields })
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
      product_id: '', name: '', category: '', spotName: '',
      quantity: 1, unitPrice: 0, totalPrice: 0, description: '',
      selectedOptions: { finish: '', fabric: '', size: '', image: '', notes: '' }
    }]);
  };

  const calculateTotals = () => {
    const subTotal = products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const shipping = parseFloat(headerFields.shipping) || 0;
    const others = parseFloat(headerFields.others) || 0;
    return { subTotal, shipping, others, total: subTotal + shipping + others };
  };

  const doPrint = async () => {
    setShowPrintInstructions(false);
    if (poData && vendorInfo.name) {
      const vendor = vendorInfo.name?.replace(/\s+/g, '_') || 'Vendor';
      const client = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const versionNum = poData.version || 1;
      const date = new Date().toISOString().split('T')[0];
      document.title = `PO_${client}_${vendor}_v${versionNum}_${date}`;
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 1000);
    }, 150);
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

  const COMPANY_ADDRESS = {
    street: '4343 Royal Place',
    city: 'Honolulu, HI 96816',
    phone: '(808) 315-8782',
  };

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .po-page {
            page-break-after: avoid !important;
            page-break-inside: auto !important;
            padding: 0.5in !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            width: auto !important;
            min-height: unset !important;
          }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          input, select {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          textarea {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            resize: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          .po-table { border: 1px solid #999 !important; }
          .po-table th { background: #666 !important; color: white !important; border: none !important; }
          .po-table td { border: none !important; }
          .po-table tbody tr + tr td { border-top: 1px solid #f0f0f0 !important; }
          .po-totals-row td { border: none !important; }
          .po-totals-row.total-final td { border-top: 1px solid #333 !important; }
          .remove-btn { display: none !important; }
          .add-product-btn { display: none !important; }
          input::placeholder { color: transparent !important; }
          textarea::placeholder { color: transparent !important; }
          body { background: white !important; }
          .bg-gray-100 { background: white !important; }
          .unit-cost-raw { display: none !important; }
          .unit-cost-display { display: block !important; text-align: right; font-size: 11px; }
          .sidemark-row { margin-top: 4px; font-size: 10px; }
          .po-table .desc-cell textarea, .qty-input {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            resize: none !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
        @page { size: letter; margin: 0.5in; }

        .po-page {
          background: white;
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
        }
        .po-field-label {
          font-weight: bold;
          font-size: 11px;
          color: #333;
          white-space: nowrap;
        }
        .po-input {
          border: none;
          border-bottom: 1px solid transparent;
          border-radius: 0;
          padding: 0 2px;
          margin: 0;
          font-size: 11px;
          line-height: 1.4;
          height: auto;
          width: 100%;
          background: transparent;
          outline: none;
          display: block;
          transition: border-color 0.15s;
        }
        .po-input:focus { border-bottom-color: #005670; }
        .qty-input {
          border: none;
          border-radius: 0;
          background: transparent;
        }
        .po-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          border: 1px solid #999;
          table-layout: fixed;
        }
        .po-table th {
          background: #666;
          color: white;
          padding: 6px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
          border: none;
        }
        .po-table th.th-cost { text-align: right; }
        .po-table td {
          border: none;
          padding: 10px 10px;
          vertical-align: top;
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 0;
        }
        .po-table tbody tr + tr td { border-top: 1px solid #f0f0f0; }
        .po-table .desc-cell textarea {
          width: 100%;
          font-size: 11px;
          border: none;
          border-radius: 0;
          background: transparent;
          padding: 0;
          resize: vertical;
          min-height: 60px;
          line-height: 1.5;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }
        .po-table .img-cell {
          width: 90px;
          min-width: 90px;
          text-align: center;
          vertical-align: middle;
          padding: 8px;
        }
        .po-table .img-cell img {
          max-width: 80px;
          max-height: 80px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .img-placeholder {
          width: 80px;
          height: 80px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #999;
          border: 1px solid #eee;
          margin: 0 auto;
        }
        .po-table .price-cell {
          text-align: right;
          white-space: normal;
          vertical-align: top;
          width: 90px;
          font-size: 11px;
        }
        .po-totals-row td {
          border: none !important;
          padding: 2px 10px;
          text-align: right;
          font-size: 11px;
        }
        .po-totals-row.total-final td {
          border-top: 2px solid #333 !important;
          font-weight: bold;
          font-size: 12px;
        }
        .qty-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .qty-row label { font-weight: normal; color: #333; }
        .qty-input {
          border: none;
          padding: 0;
          font-size: 11px;
          width: 40px;
          background: transparent;
          outline: none;
          text-align: left;
        }
        .sidemark-row {
          margin-top: 4px;
          font-size: 10px;
          display: flex;
          align-items: flex-start;
          gap: 4px;
          flex-wrap: wrap;
        }
        .sidemark-row span { font-weight: 600; color: #444; white-space: nowrap; }
        /* Vendor address compact — no extra spacing between lines */
        .vendor-addr-line {
          font-size: 11px;
          line-height: 1.4;
          padding: 0;
          margin: 0;
          display: block;
        }
        .vendor-city-row {
          display: flex;
          gap: 0;
          font-size: 11px;
          line-height: 1.4;
        }
      `}</style>

      {/* ====== TOOLBAR ====== */}
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
          <button onClick={() => setShowPrintInstructions(true)} className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium">
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ====== PRINTABLE PO CONTENT ====== */}
      <div className="print-container bg-gray-100 min-h-screen py-8">
        <div className="po-page">

          {/* ---- TOP: Company Address + Logo ---- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#333' }}>
              <div>{COMPANY_ADDRESS.street}</div>
              <div>{COMPANY_ADDRESS.city}</div>
              <div>{COMPANY_ADDRESS.phone}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <img
                src="/images/HDG-Logo.png"
                alt="Henderson Design Group"
                style={{
                  height: '40px',
                  width: 'auto',
                  filter: 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)'
                }}
              />
            </div>
          </div>

          {/* ---- PURCHASE ORDER TITLE ---- */}
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '10px 0 8px', color: '#222', borderBottom: '2px solid #333', paddingBottom: '5px' }}>
            Purchase Order
          </h2>

          {/* ---- HEADER INFO GRID ---- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>

            {/* LEFT: Vendor + Ship To + Comments — read-only */}
            <div style={{ paddingRight: '20px', borderRight: '1px solid #ccc', fontSize: '11px', lineHeight: '1.6' }}>
              {/* To: */}
              <div style={{ fontWeight: 'bold' }}>To:</div>
              {vendorInfo.name && <div style={{ fontWeight: '500' }}>{vendorInfo.name}</div>}
              {vendorInfo.address?.street && <div>{vendorInfo.address.street}</div>}
              {(vendorInfo.address?.city || vendorInfo.address?.state || vendorInfo.address?.zip) && (
                <div>{[vendorInfo.address?.city, vendorInfo.address?.state, vendorInfo.address?.zip].filter(Boolean).join(', ')}</div>
              )}
              {vendorInfo.representativeName && (
                <div><span className="po-field-label">Attention: </span>{vendorInfo.representativeName}</div>
              )}
              {(vendorInfo.contactInfo?.phone || vendorInfo.contactInfo?.fax) && (
                <div>
                  {vendorInfo.contactInfo?.phone && <><span className="po-field-label">Phone: </span>{vendorInfo.contactInfo.phone}</>}
                  {vendorInfo.contactInfo?.fax && <><span className="po-field-label" style={{ marginLeft: '10px' }}>Fax: </span>{vendorInfo.contactInfo.fax}</>}
                </div>
              )}

              {/* Ship To */}
              <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Ship To:</div>
              {shipTo.name && <div>{shipTo.name}</div>}
              {shipTo.address && <div>{shipTo.address}</div>}
              {shipTo.city && <div>{shipTo.city}</div>}
              {shipTo.attention && <div><span className="po-field-label">Attention: </span>{shipTo.attention}</div>}
              {shipTo.phone && <div><span className="po-field-label">Phone: </span>{shipTo.phone}</div>}

              {/* Comments / Notes — still editable */}
              <div style={{ marginTop: '6px' }}>
                <span className="po-field-label">Comments: </span>
                <input className="po-input" value={headerFields.comments} onChange={(e) => setHeaderFields({ ...headerFields, comments: e.target.value })} style={{ width: '68%', display: 'inline-block' }} />
              </div>
              <div>
                <span className="po-field-label">Notes: </span>
                <input className="po-input" value={headerFields.notes} onChange={(e) => setHeaderFields({ ...headerFields, notes: e.target.value })} style={{ width: '74%', display: 'inline-block' }} />
              </div>
            </div>

            {/* RIGHT: Order Details */}
            <div style={{ paddingLeft: '20px', fontSize: '11px' }}>
              {[
                { label: 'Order #:',        field: 'poNumber',       value: headerFields.poNumber },
                { label: 'Order Date:',     field: 'orderDate',      value: headerFields.orderDate },
                { label: 'Printed Date:',   readOnly: true,          value: printedDate },
                { label: 'Account Number:', field: 'accountNumber',  value: headerFields.accountNumber },
                { label: 'Rep Name:',       field: 'repName',        value: headerFields.repName },
                { label: 'Rep Phone:',      field: 'repPhone',       value: headerFields.repPhone },
                { label: 'Rep Email:',      field: 'repEmail',       value: headerFields.repEmail },
                { label: 'Terms:',          field: 'terms',          value: headerFields.terms },
                { label: 'Client:',         field: '_clientName',    value: clientInfo.name || '' },
                { label: 'Estimate #:',     field: 'estimateNumber', value: headerFields.estimateNumber, required: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1px 0', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#333', fontSize: '11px' }}>
                    {row.label}
                    {row.required && !headerFields.estimateNumber && (
                      <span style={{ color: '#e53e3e', marginLeft: '2px' }}>*</span>
                    )}
                  </span>
                  {row.readOnly ? (
                    <span style={{ textAlign: 'right', fontSize: '11px' }}>{row.value}</span>
                  ) : (
                    <input
                      className="po-input"
                      value={row.value || ''}
                      style={{
                        textAlign: 'right', border: 'none', background: 'transparent',
                        flex: 1, minWidth: 0,
                        borderBottom: row.required && !headerFields.estimateNumber ? '1px solid #e53e3e' : '1px solid transparent',
                      }}
                      onChange={(e) => {
                        if (row.field === '_clientName') {
                          setClientInfo({ ...clientInfo, name: e.target.value });
                        } else {
                          setHeaderFields({ ...headerFields, [row.field]: e.target.value });
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---- PRODUCT TABLE ---- */}
          <table className="po-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}></th>
                <th>Description</th>
                <th className="th-cost" style={{ width: '110px' }}>Unit Cost</th>
                <th className="th-cost" style={{ width: '110px' }}>Total Cost</th>
                <th className="no-print" style={{ width: '36px' }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const imgSrc = product.selectedOptions?.uploadedImages?.[0]?.url ||
                               product.selectedOptions?.image ||
                               product.selectedOptions?.images?.[0] ||
                               product.imageUrl || null;
                const netCost = (product.selectedOptions?.netCostOverride != null && product.selectedOptions?.netCostOverride !== '')
                  ? parseFloat(product.selectedOptions.netCostOverride)
                  : parseFloat(product.selectedOptions?.msrp || product.msrp || product.unitPrice || 0);
                const netTotal = netCost * (product.quantity || 1);
                const sidemark = product.selectedOptions?.sidemark || product.selectedOptions?.notes || '';

                return (
                  <tr key={index}>
                    <td className="img-cell">
                      {imgSrc ? (
                        <PrintSafeImage
                          src={imgSrc}
                          alt={product.name || ''}
                          style={{ maxWidth: '72px', maxHeight: '72px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                          fallback={<div className="img-placeholder">No Image</div>}
                        />
                      ) : (
                        <div className="img-placeholder">No Image</div>
                      )}
                    </td>

                    <td className="desc-cell">
                      <div className="qty-row">
                        <label>Quantity :</label>
                        <input
                          className="qty-input"
                          type="number"
                          value={product.quantity || 1}
                          onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                          min="1"
                        />
                        <span style={{ fontSize: '10px', color: '#888' }}>{product.selectedOptions?.units || 'Each'}</span>
                      </div>
                      <textarea
                        value={product.description || ''}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        placeholder={`Specs: ${product.name || 'Product name'}\nPattern:\nColor:\nSize:\nConstruction:\nComposition:`}
                        rows={Math.max(6, (product.description || '').split('\n').length + 1)}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                      {sidemark && (
                        <div className="sidemark-row">
                          <span style={{ whiteSpace: 'nowrap' }}>Sidemark:</span>
                          <span style={{ fontSize: '10px', color: '#444', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{sidemark}</span>
                        </div>
                      )}
                    </td>

                    <td className="price-cell">
                      <input
                        className="po-input unit-cost-raw"
                        type="number"
                        value={netCost}
                        onChange={(e) => updateProduct(index, 'selectedOptions.msrp', e.target.value)}
                        style={{ textAlign: 'right', width: '95px' }}
                        step="0.01"
                      />
                      <span className="unit-cost-display" style={{ display: 'none', textAlign: 'right', fontSize: '11px' }}>
                        ${netCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="no-print" style={{ fontSize: '10px', color: '#888', textAlign: 'right', marginTop: '2px' }}>
                        ${netCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>

                    <td className="price-cell" style={{ fontWeight: '500', fontSize: '11px' }}>
                      ${netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="no-print remove-btn" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <button onClick={() => removeProduct(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove product">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              <tr className="no-print add-product-btn">
                <td colSpan={5} style={{ padding: '8px', textAlign: 'center', border: '1px dashed #ddd' }}>
                  <button onClick={addEmptyProduct} className="inline-flex items-center gap-1.5 text-xs text-[#005670] hover:text-[#004558] font-medium">
                    <Plus className="w-3.5 h-3.5" />
                    Add Product
                  </button>
                </td>
              </tr>

              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ borderTop: '1px solid #ccc' }}>Sub Total:</td>
                <td className="price-cell" style={{ borderTop: '1px solid #ccc' }}>
                  ${totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Shipping:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.shipping || 0} onChange={(e) => setHeaderFields({ ...headerFields, shipping: parseFloat(e.target.value) || 0 })} style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Others:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.others || 0} onChange={(e) => setHeaderFields({ ...headerFields, others: parseFloat(e.target.value) || 0 })} style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
                <td className="no-print"></td>
              </tr>
              <tr className="po-totals-row total-final">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ fontWeight: 'bold', fontSize: '11px' }}>Total:</td>
                <td className="price-cell" style={{ fontWeight: 'bold', fontSize: '11px' }}>
                  ${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
          onSelectVersion={(v) => { window.location.href = `/admin/purchase-order/${orderId}/${vendorId}/${v}`; }}
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
              <button onClick={() => setShowPrintInstructions(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">For the best print quality, please configure:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {[
                  { num: 1, title: 'Destination', desc: 'Select "Save as PDF" or your printer' },
                  { num: 2, title: 'Headers and Footers', desc: 'Uncheck "Headers and footers" — this removes the gray bars at top and bottom' },
                  { num: 3, title: 'Margins', desc: 'Select "None" or "Minimum"' },
                  { num: 4, title: 'Background Graphics', desc: 'Check "Background graphics" to print all colors and logo' },
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Version Notes <span className="text-red-500">*</span></label>
              <textarea value={versionNotes} onChange={(e) => setVersionNotes(e.target.value)} placeholder="Describe the changes in this version..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]" rows={4} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={onSaveNewVersion} disabled={saving || !versionNotes.trim()} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                {saving ? 'Saving...' : 'Save as New Version'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670] mx-auto"></div></div>
          ) : versions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No versions found</div>
          ) : (
            <div className="divide-y">
              {versions.map((v) => (
                <div key={v._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Version {v.version}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          v.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          v.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          v.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>{v.status?.charAt(0).toUpperCase() + v.status?.slice(1)}</span>
                        {v.poNumber && <span className="text-xs text-gray-500">PO#: {v.poNumber}</span>}
                      </div>
                      <p className="text-gray-700 mb-2">{v.versionNotes || v.notes || 'No notes'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {new Date(v.createdAt).toLocaleDateString()} by {v.createdBy?.name || 'Admin'}</span>
                        <span>Total: ${(v.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <button onClick={() => onSelectVersion(v.version)} className="ml-4 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium whitespace-nowrap">View/Edit</button>
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