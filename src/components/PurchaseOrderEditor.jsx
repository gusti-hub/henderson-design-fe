import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Clock, Printer, ChevronLeft, Plus, Loader2, PlusCircle, Eye, EyeOff } from 'lucide-react';
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
        reader.onloadend = () => { if (!cancelled) setDataUrl(reader.result); };
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
          } catch { setFailed(true); }
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

// ─── Excluded Products Panel ──────────────────────────────────────────────────
// Shows products from previous PO that are NOT in current version.
// User can add them back individually.
const ExcludedProductsPanel = ({ excludedProducts, onAdd, onClose }) => {
  if (!excludedProducts || excludedProducts.length === 0) return null;

  const withPO    = excludedProducts.filter(p => p._prevPoNumber);
  const withoutPO = excludedProducts.filter(p => !p._prevPoNumber);

  const renderItem = (product, idx) => {
    const imgSrc = product.selectedOptions?.uploadedImages?.[0]?.url ||
                   product.selectedOptions?.image ||
                   product.selectedOptions?.images?.[0] ||
                   product.imageUrl || null;
    const netCost = (product.selectedOptions?.netCostOverride != null && product.selectedOptions?.netCostOverride !== '')
      ? parseFloat(product.selectedOptions.netCostOverride)
      : parseFloat(product.selectedOptions?.msrp || product.unitPrice || 0);

    return (
      <div key={idx} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
        <div className="w-10 h-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
          {imgSrc
            ? <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">—</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{product.name || 'Untitled'}</p>
          <p className="text-xs text-gray-400">
            Qty {product.quantity || 1} · ${netCost.toFixed(2)}
          </p>
          {product._prevPoNumber && (
            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-mono font-semibold leading-none">
              PO# {product._prevPoNumber}
            </span>
          )}
        </div>
        <button
          onClick={() => onAdd(product)}
          className="flex-shrink-0 p-1.5 bg-[#005670]/10 text-[#005670] rounded-lg hover:bg-[#005670] hover:text-white transition-colors"
          title="Add to this PO"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[60] flex flex-col border-l border-gray-200 no-print">
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-bold text-base">Products Not in This PO</h3>
          <p className="text-xs text-white/70 mt-0.5">
            {excludedProducts.length} item{excludedProducts.length !== 1 ? 's' : ''} — add back if needed
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Previously ordered — show PO# badge */}
        {withPO.length > 0 && (
          <>
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Previously Ordered</span>
              <span className="text-[10px] text-amber-500">({withPO.length})</span>
            </div>
            {withPO.map((p, i) => renderItem(p, 'po-' + i))}
          </>
        )}

        {/* New products — never been in a PO */}
        {withoutPO.length > 0 && (
          <>
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">New Products</span>
              <span className="text-[10px] text-blue-500">({withoutPO.length})</span>
            </div>
            {withoutPO.map((p, i) => renderItem(p, 'new-' + i))}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">
          Items with <span className="text-amber-600 font-semibold">PO#</span> badge were in a previous order.
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PurchaseOrderEditor = ({ orderId, vendorId, version, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poData, setPOData] = useState(null);
  const [products, setProducts] = useState([]);
  const [excludedProducts, setExcludedProducts] = useState([]);
  const [showExcludedPanel, setShowExcludedPanel] = useState(false);
  const [vendorInfo, setVendorInfo] = useState({
    name: '', vendorCode: '', representativeName: '', website: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    contactInfo: { phone: '', email: '', fax: '' },
    accountNumber: ''
  });
  const [shipTo, setShipTo] = useState({
    name: '', address: '', city: '', attention: '', phone: ''
  });
  const [clientInfo, setClientInfo] = useState({});
  const [headerFields, setHeaderFields] = useState({
    poNumber: '', orderDate: '', accountNumber: '', repName: '',
    repPhone: '', repEmail: '', terms: '', estimateNumber: '',
    comments: '', notes: '', shipping: 0, others: 0
  });
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [originalTitle] = useState(document.title);
  const [poStatus, setPoStatus] = useState('draft');
  const [savingStatus, setSavingStatus] = useState(false);
  const [additionalLines, setAdditionalLines] = useState([]);

  useEffect(() => { loadPOData(); }, [orderId, vendorId, version]);

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
        setPoStatus(data.status || 'draft');

        // ── Excluded products from backend (products in order but not in this PO) ──
        const excluded = data.availableToAdd || data.excludedProducts || [];
        setExcludedProducts(excluded);
        // Auto-open the panel if there are excluded items and this looks like a new version
        if (excluded.length > 0 && (data.version || 1) > 1) {
          setShowExcludedPanel(true);
        }

        // ── Enrich existing PO products from order ──
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

        // ── Trust backend completely — only show what's in data.products ──
        // New products from order that aren't in this PO version are in `availableToAdd`
        // (shown in the excluded panel). Frontend must NOT self-append from orderData.
        setProducts(enrichedProducts);

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

        if (data.shipTo && (data.shipTo.name || data.shipTo.address)) {
          setShipTo(data.shipTo);
        } else {
          const vendorIdStr = vendorId?.toString();
          const orderProductWithShipping = (orderData.selectedProducts || []).find(p => {
            const pVendorId = p.vendor?._id?.toString() || p.vendor?.toString();
            return pVendorId === vendorIdStr && (p.selectedOptions?.shippingStreet || p.selectedOptions?.shipToName);
          });
          if (orderProductWithShipping) {
            const opts = orderProductWithShipping.selectedOptions;
            setShipTo({
              name: opts.shipToName || '',
              address: opts.shippingStreet || '',
              city: [opts.shippingCity, opts.shippingState, opts.shippingPostalCode].filter(Boolean).join(', '),
              attention: '',
              phone: opts.shipToPhone || ''
            });
          }
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
        setAdditionalLines(data.additionalLines || []);
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

  // ── Add a product from the excluded panel back into this PO ──────────────
  const handleAddExcludedProduct = (product) => {
    setProducts(prev => [...prev, product]);
    setExcludedProducts(prev => prev.filter(p => p.product_id !== product.product_id));
    if (excludedProducts.length <= 1) setShowExcludedPanel(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (poStatus === 'confirmed') { alert('Confirmed PO cannot be changed'); return; }
    setSavingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/status`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: poData.version, status: newStatus })
        }
      );
      const result = await response.json();
      if (result.success) {
        setPoStatus(newStatus);
        setPOData(prev => ({ ...prev, status: newStatus }));
      } else {
        alert('Failed to update status: ' + (result.message || ''));
      }
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setSavingStatus(false);
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
          body: JSON.stringify({
            version: poData.version, products, vendorInfo, shipTo,
            clientInfo, ...headerFields, additionalLines
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

  const handleSaveAsNewVersion = async (notesText) => {
    const notes = notesText || versionNotes;
    if (!notes?.trim()) { alert('Please add notes for this new version'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/po/${vendorId}/new-version`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            versionNotes: notes,
            products: null,
            vendorInfo,
            shipTo,
            clientInfo,
            // Spread headerFields but explicitly exclude poNumber —
            // backend always generates a fresh PO number for each new version
            ...{ ...headerFields, poNumber: undefined },
          })
        }
      );
      const result = await response.json();
      if (result.success) {
        const newVer = result.data.version;
        setShowNewVersionModal(false);
        setShowVersionModal(false);
        setVersionNotes('');
        window.location.href = `/admin/purchase-order/${orderId}/${vendorId}/${newVer}`;
      } else {
        alert('Failed to create version: ' + (result.message || ''));
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
      const removed = products[index];
      setProducts(products.filter((_, i) => i !== index));
      // Move back to excluded panel
      if (removed.product_id) {
        setExcludedProducts(prev => [...prev, removed]);
        setShowExcludedPanel(true);
      }
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
    const subTotal   = products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const addTotal   = additionalLines.reduce((sum, al) => sum + (parseFloat(al.amount) || 0), 0);
    const shipping   = parseFloat(headerFields.shipping) || 0;
    const others     = parseFloat(headerFields.others) || 0;
    return {
      subTotal: subTotal + addTotal,
      shipping,
      others,
      total: subTotal + addTotal + shipping + others,
    };
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
            border: none !important; background: transparent !important;
            outline: none !important; box-shadow: none !important; padding: 0 !important;
          }
          textarea {
            border: none !important; background: transparent !important;
            outline: none !important; box-shadow: none !important;
            padding: 0 !important; resize: none !important;
            overflow: visible !important; height: auto !important;
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
        }
        @page { size: letter; margin: 0.5in; }

        .po-page {
          background: white; width: 8.5in; min-height: 11in;
          padding: 0.5in; margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative;
        }
        .po-field-label { font-weight: bold; font-size: 11px; color: #333; white-space: nowrap; }
        .po-input {
          border: none; border-bottom: 1px solid transparent; border-radius: 0;
          padding: 0 2px; margin: 0; font-size: 11px; line-height: 1.4;
          height: auto; width: 100%; background: transparent; outline: none;
          display: block; transition: border-color 0.15s;
        }
        .po-input:focus { border-bottom-color: #005670; }
        .po-table {
          width: 100%; border-collapse: collapse; font-size: 11px;
          border: 1px solid #999; table-layout: fixed;
        }
        .po-table th {
          background: #666; color: white; padding: 6px 10px;
          text-align: left; font-weight: 600; font-size: 10px; border: none;
        }
        .po-table th.th-cost { text-align: right; }
        .po-table td {
          border: none; padding: 10px 10px; vertical-align: top;
          word-wrap: break-word; overflow-wrap: break-word; max-width: 0;
        }
        .po-table tbody tr + tr td { border-top: 1px solid #f0f0f0; }
        .po-table .img-cell {
          width: 120px; min-width: 120px; text-align: center;
          vertical-align: middle; padding: 8px;
        }
        .po-table .img-cell img {
          max-width: 110px; max-height: 110px;
          object-fit: contain; display: block; margin: 0 auto;
        }
        .img-placeholder {
          width: 110px; height: 110px; background: #f5f5f5;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: #999; border: 1px solid #eee; margin: 0 auto;
        }
        .po-table .price-cell {
          text-align: right; white-space: normal; vertical-align: top;
          width: 90px; font-size: 11px;
        }
        .po-totals-row td {
          border: none !important; padding: 2px 10px;
          text-align: right; font-size: 11px;
        }
        .po-totals-row.total-final td {
          border-top: 2px solid #333 !important;
          font-weight: bold; font-size: 12px;
        }
        .desc-row {
          display: block; padding: 3px 0; font-size: 11px;
          border-bottom: 1px dotted #eee; text-align: left;
        }
        .desc-row:last-child { border-bottom: none; }
        .desc-row-label {
          font-weight: 700; color: #444; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.3px; margin-right: 4px;
        }
        .desc-row-label::after { content: ':'; }
        .desc-row-value { text-align: left; color: #222; font-size: 11px; word-break: break-word; }
        .sidemark-strip {
          display: block; margin-top: 5px; padding-top: 5px;
          border-top: 1px dashed #ccc; font-size: 10px; text-align: left;
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
            PO — {vendorInfo.name || 'Vendor'} — <span className="text-[#005670] font-semibold">v{poData?.version || 1}</span>
          </span>

            <div className="flex items-center gap-1.5">
              <select
                value={poStatus}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={savingStatus}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer appearance-none ${
                  poStatus === 'draft'     ? 'bg-yellow-100 text-yellow-700' :
                  poStatus === 'sent'      ? 'bg-blue-100 text-blue-700' :
                  poStatus === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                } ${savingStatus ? 'opacity-50' : ''}`}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent to Vendor</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="paid">Paid</option>
              </select>
              {savingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
            </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Excluded products toggle */}
          {excludedProducts.length > 0 && (
            <button
              onClick={() => setShowExcludedPanel(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showExcludedPanel
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              {excludedProducts.length} Not Included
            </button>
          )}
          <button
            onClick={() => setShowVersionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            <Clock className="w-4 h-4" />
            Versions
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setShowNewVersionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            New Version
          </button>
          <button
            onClick={() => setShowPrintInstructions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ====== EXCLUDED PRODUCTS PANEL ====== */}
      {showExcludedPanel && excludedProducts.length > 0 && (
        <ExcludedProductsPanel
          excludedProducts={excludedProducts}
          onAdd={handleAddExcludedProduct}
          onClose={() => setShowExcludedPanel(false)}
        />
      )}

      {/* ====== PRINTABLE PO CONTENT ====== */}
      <div className={`print-container bg-gray-100 min-h-screen py-8 transition-all ${showExcludedPanel ? 'mr-80' : ''}`}>
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
                  height: '40px', width: 'auto',
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

            {/* LEFT: Vendor + Ship To + Comments */}
            <div style={{ paddingRight: '20px', borderRight: '1px solid #ccc', fontSize: '11px', lineHeight: '1.6' }}>
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

              <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Ship To:</div>
              {shipTo.name && <div>{shipTo.name}</div>}
              {shipTo.address && <div>{shipTo.address}</div>}
              {shipTo.city && <div>{shipTo.city}</div>}
              {shipTo.attention && <div><span className="po-field-label">Attention: </span>{shipTo.attention}</div>}
              {shipTo.phone && <div><span className="po-field-label">Phone: </span>{shipTo.phone}</div>}

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
                { label: 'Order #:',        value: headerFields.poNumber },
                { label: 'Order Date:',     value: headerFields.orderDate },
                { label: 'Printed Date:',   value: printedDate },
                { label: 'Account Number:', value: headerFields.accountNumber },
                { label: 'Rep Name:',       value: headerFields.repName },
                { label: 'Rep Phone:',      value: headerFields.repPhone },
                { label: 'Rep Email:',      value: headerFields.repEmail },
                { label: 'Terms:',          value: headerFields.terms },
                { label: 'Client:',         value: clientInfo.name || '' },
                { label: 'Estimate #:',     value: headerFields.estimateNumber },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1px 0', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#333', fontSize: '11px' }}>{row.label}</span>
                  <span style={{ textAlign: 'right', fontSize: '11px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{row.value || ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- PRODUCT TABLE ---- */}
          <table className="po-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}></th>
                <th>Description</th>
                <th className="th-cost" style={{ width: '110px' }}>Unit Cost</th>
                <th className="th-cost" style={{ width: '110px' }}>Total Cost</th>
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
                const sidemark = product.selectedOptions?.sidemark || '';
                const specs = product.selectedOptions?.vendorDescription || product.selectedOptions?.specifications || '';

                return (
                  <tr key={index}>
                    {/* Image */}
                    <td className="img-cell">
                      {imgSrc ? (
                        <PrintSafeImage
                          src={imgSrc}
                          alt={product.name || ''}
                          style={{ maxWidth: '110px', maxHeight: '110px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                          fallback={<div className="img-placeholder">No Image</div>}
                        />
                      ) : (
                        <div className="img-placeholder">No Image</div>
                      )}
                      {/* Remove button — screen only */}
                      <button
                        className="remove-btn no-print mt-1 text-xs text-red-400 hover:text-red-600 w-full text-center"
                        onClick={() => removeProduct(index)}
                      >
                        Remove
                      </button>
                    </td>

                    {/* Description cell */}
                    <td className="desc-cell">
                      <div className="desc-row">
                        <span className="desc-row-label">Quantity</span>
                        <span className="desc-row-value">
                          {product.quantity || 1} {product.selectedOptions?.units || 'Each'}
                        </span>
                      </div>
                      {specs ? (
                        <div className="desc-row">
                          <span className="desc-row-label">Specs</span>
                          <span className="desc-row-value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', textAlign: 'left' }}>{specs}</span>
                        </div>
                      ) : null}
                      {product.name ? (
                        <div className="desc-row">
                          <span className="desc-row-label">Name</span>
                          <span className="desc-row-value">{product.name}</span>
                        </div>
                      ) : null}
                      {product.product_id ? (
                        <div className="desc-row">
                          <span className="desc-row-label">SKU</span>
                          <span className="desc-row-value">{product.product_id}</span>
                        </div>
                      ) : null}
                      {(product.selectedOptions?.dimension || product.selectedOptions?.size) ? (
                        <div className="desc-row">
                          <span className="desc-row-label">Dimensions</span>
                          <span className="desc-row-value">{product.selectedOptions?.dimension || product.selectedOptions?.size}</span>
                        </div>
                      ) : null}
                      {product.selectedOptions?.fabric ? (
                        <div className="desc-row">
                          <span className="desc-row-label">Material</span>
                          <span className="desc-row-value">{product.selectedOptions.fabric}</span>
                        </div>
                      ) : null}
                      {product.selectedOptions?.finish ? (
                        <div className="desc-row">
                          <span className="desc-row-label">Color</span>
                          <span className="desc-row-value">{product.selectedOptions.finish}</span>
                        </div>
                      ) : null}
                      {product.selectedOptions?.leadTime ? (
                        <div className="desc-row">
                          <span className="desc-row-label">Lead Time</span>
                          <span className="desc-row-value">{product.selectedOptions.leadTime}</span>
                        </div>
                      ) : null}
                      {sidemark ? (
                        <div className="sidemark-strip">
                          <span className="desc-row-label">Sidemark</span>
                          <span style={{ color: '#333', wordBreak: 'break-word' }}>{sidemark}</span>
                        </div>
                      ) : null}
                    </td>

                    {/* Unit Cost */}
                    <td className="price-cell">
                      <span style={{ display: 'block', textAlign: 'right', fontSize: '11px' }}>
                        ${netCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Total Cost */}
                    <td className="price-cell" style={{ fontWeight: '500', fontSize: '11px' }}>
                      ${netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}

              {/* ── Additional Lines ── */}
              {additionalLines.map((al, idx) => (
                <tr key={`al-${idx}`}>
                  <td className="img-cell" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>Additional</span>
                  </td>
                  <td className="desc-cell">
                    <div className="no-print" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <select
                        value={al.lineType}
                        onChange={e => {
                          const updated = [...additionalLines];
                          updated[idx] = { ...updated[idx], lineType: e.target.value };
                          setAdditionalLines(updated);
                        }}
                        style={{ fontSize: '11px', padding: '2px 4px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
                      >
                        {['Product','FDI','FDI-Vendor','Other','Design Fees',
                          'Expediting','Hours','Labor','Reimbursable',
                          'Project Management Fees','Sales'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setAdditionalLines(prev => prev.filter((_, i) => i !== idx))}
                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}
                        title="Remove"
                      >×</button>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px', textAlign: 'left' }}>{al.lineType}</div>
                    <input
                      type="text"
                      value={al.description}
                      onChange={e => {
                        const updated = [...additionalLines];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setAdditionalLines(updated);
                      }}
                      placeholder="e.g. Freight and Handling - PO #..."
                      style={{ fontSize: '11px', width: '100%', border: '1px solid #eee', borderRadius: '4px', padding: '2px 4px', textAlign: 'left' }}
                      className="po-input"
                    />
                  </td>
                  <td className="price-cell">
                    <input
                      type="number"
                      value={al.amount}
                      onChange={e => {
                        const updated = [...additionalLines];
                        updated[idx] = { ...updated[idx], amount: parseFloat(e.target.value) || 0 };
                        setAdditionalLines(updated);
                      }}
                      step="0.01"
                      style={{ textAlign: 'right', width: '90px', fontSize: '11px', border: '1px solid #eee', borderRadius: '4px', padding: '2px 4px' }}
                      className="po-input"
                    />
                  </td>
                  <td className="price-cell" style={{ fontWeight: '500' }}>
                    ${(parseFloat(al.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Add Additional Line button */}
              <tr className="no-print add-product-btn">
                <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'left' }}>
                  <button
                    onClick={() => setAdditionalLines(prev => [...prev, { description: '', lineType: 'FDI', amount: 0 }])}
                    style={{
                      fontSize: '11px', color: '#005670', border: '1px dashed #005670',
                      borderRadius: '4px', padding: '4px 10px', cursor: 'pointer',
                      background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    + Add Line (FDI / Freight / Tax)
                  </button>
                </td>
              </tr>

              {/* Totals */}
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ borderTop: '1px solid #ccc' }}>Sub Total:</td>
                <td className="price-cell" style={{ borderTop: '1px solid #ccc' }}>
                  ${totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Shipping:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.shipping || 0}
                    onChange={(e) => setHeaderFields({ ...headerFields, shipping: parseFloat(e.target.value) || 0 })}
                    style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
              </tr>
              <tr className="po-totals-row">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label">Others:</td>
                <td className="price-cell">
                  <input className="po-input" type="number" value={headerFields.others || 0}
                    onChange={(e) => setHeaderFields({ ...headerFields, others: parseFloat(e.target.value) || 0 })}
                    style={{ textAlign: 'right', width: '90px' }} step="0.01" />
                </td>
              </tr>
              <tr className="po-totals-row total-final">
                <td colSpan={2}></td>
                <td className="price-cell po-field-label" style={{ fontWeight: 'bold', fontSize: '11px' }}>Total:</td>
                <td className="price-cell" style={{ fontWeight: 'bold', fontSize: '11px' }}>
                  ${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== NEW VERSION MODAL ====== */}
      {showNewVersionModal && (
        <NewPOVersionModal
          onClose={() => setShowNewVersionModal(false)}
          onSave={handleSaveAsNewVersion}
          saving={saving}
          currentVersion={poData?.version || 1}
        />
      )}

      {/* ====== VERSION HISTORY MODAL ====== */}
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
                  { num: 2, title: 'Headers and Footers', desc: 'Uncheck "Headers and footers"' },
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

// ====== NEW PO VERSION MODAL ======
const NewPOVersionModal = ({ onClose, onSave, saving, currentVersion }) => {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold">Save as New PO Version</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>Note:</strong> The new version (v{currentVersion + 1}) will only include products
            that have <em>never been in any PO</em> for this vendor. Previously ordered products
            appear in the <strong>"Not Included"</strong> panel with their PO number — add them back if needed.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe what changed in this version..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
              rows={4}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button
              onClick={() => onSave(notes)}
              disabled={saving || !notes.trim()}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : <><PlusCircle className="w-4 h-4" /> Save New Version</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
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

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">PO Version History</h3>
            <p className="text-sm text-white/80 mt-1">All versions for this vendor</p>
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
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Version {v.version}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          v.status === 'draft'     ? 'bg-yellow-100 text-yellow-700' :
                          v.status === 'sent'      ? 'bg-blue-100 text-blue-700' :
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