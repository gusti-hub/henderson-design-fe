// ProductConfiguration.jsx
// ✅ PATCHED: price split into buyPrice (cost) and sellPrice (client-facing price)

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, Upload } from 'lucide-react';
import SearchFilter from '../components/common/SearchFilter';
import { backendServer } from '../utils/info';
import { toJsDelivrUrl } from '../utils/imageUrl';
import BulkProductImport from '../pages/BulkProductImport';
import BulkDeleteProducts from './BulkDeleteProduct';
import BulkUpdateProducts from './BulkUpdateProducts';

// ─── SKU finish parser (display only) ─────────────────────────────────────
const WOOD_CODES   = ['MD', 'DK'];
const FABRIC_CODES = ['19','20','08','09','02','03','11','12','05','06','14','15','17','18','0B','0C','0E','0F','0I','0H','0L','0K','0O','0N','0U','0T'];
const OTHER_CODES  = ['WV','SD','MD','DK','LT','FX','LR','SH'];

const ITEM_CLASS_OPTIONS = [
  'Accessories','Accessories & Art','Accessories-1','Appliances','Case Goods',
  'Custom - soft goods (decorative pillows)','Fabric','Flooring','Lighting',
  'Wall Covering','Window Covering','Construction Scope','Furniture','Labor',
  'Reupholstery','Rugs','Upholstery',
];

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

// ─── Empty form ────────────────────────────────────────────────────────────
const emptyForm = () => ({
  product_id:          '',
  name:                '',
  description:         '',
  vendorDescription:   '',
  itemUrl:             '',
  colorFinish:         '',
  itemClass:           '',
  category:            '',
  collection:          '',
  package:             '',
  dimension:           '',
  buyPrice:            '',   // ✅ cost / vendor price
  sellPrice:           '',   // ✅ client-facing price
  woodFinish:          '',
  fabric:              '',
  others:              '',   // free text
  imageUrl:            '',
  imageFile:           null,
  imagePreview:        '',
});

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] bg-white';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// ─── ImageCell ─────────────────────────────────────────────────────────────
const ImageCell = ({ url, name }) => {
  const [failed, setFailed] = React.useState(false);
  if (!url || failed) {
    return (
      <div title={url || 'No image'} className="w-12 h-12 rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-gray-200 cursor-default">
        <ImageIcon className="w-5 h-5 text-gray-400" />
        {url && <span className="text-[9px] text-gray-400 mt-0.5">Error</span>}
      </div>
    );
  }
  return (
    <div className="relative group w-12 h-12">
      <img src={toJsDelivrUrl(url)} alt={name}
        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 max-w-[260px] break-all whitespace-normal shadow-lg">{url}</div>
      </div>
    </div>
  );
};

// ==================== COMPONENT ====================

const ProductConfiguration = () => {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [modalMode, setModalMode]         = useState('create');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [itemsPerPage]                    = useState(10);
  const [searchTerm, setSearchTerm]       = useState('');
  const [formData, setFormData]           = useState(emptyForm());
  const [errors, setErrors]               = useState({});
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  // ─── Fetch ───────────────────────────────────────────────────────────────
  useEffect(() => { fetchProducts(); }, [currentPage]);
  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); fetchProducts(); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/products?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts(data.products || []);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── SKU auto-parse ───────────────────────────────────────────────────
  const handleSkuChange = (value) => {
    const parsed = parseSku(value);
    setFormData(prev => ({
      ...prev,
      product_id: value,
      woodFinish: prev.woodFinish || parsed.woodFinish,
      fabric:     prev.fabric     || parsed.fabric,
      others:     prev.others.length ? prev.others : (Array.isArray(parsed.others) ? parsed.others.filter(Boolean).join(', ') : (parsed.others || '')),
    }));
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(e => ({ ...e, image: 'Max 5 MB' })); return; }
    const preview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageFile: file, imagePreview: preview, imageUrl: '' }));
    setErrors(e => { const n = { ...e }; delete n.image; return n; });
  };

  const clearImage = () => {
    if (formData.imagePreview && !formData.imagePreview.startsWith('http'))
      URL.revokeObjectURL(formData.imagePreview);
    setFormData(prev => ({ ...prev, imageFile: null, imagePreview: '', imageUrl: '' }));
  };

  // ─── Edit ─────────────────────────────────────────────────────────────
  const handleEdit = (product) => {
    setSelectedProductId(product._id);
    setFormData({
      product_id:        product.product_id        || '',
      name:              product.name              || '',
      description:       product.description       || '',
      vendorDescription: product.vendorDescription || '',
      itemUrl:           product.itemUrl           || '',
      colorFinish:       product.colorFinish       || '',
      itemClass:         product.itemClass         || '',
      category:          product.category          || '',
      collection:        product.collection        || '',
      package:           product.package           || '',
      dimension:         product.dimension         || '',
      // ✅ support both new fields and legacy `price`
      buyPrice:          product.buyPrice  ?? '',
      sellPrice:         product.sellPrice ?? product.price ?? '',
      woodFinish:        product.woodFinish        || '',
      fabric:            product.fabric            || '',
      others:            Array.isArray(product.others) ? product.others.join(', ') : (product.others || ''),
      imageUrl:          product.image?.url        || '',
      imageFile:         null,
      imagePreview:      product.image?.url        || '',
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
    setFormData(emptyForm());
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendServer}/api/products/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Validate ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.product_id.trim()) e.product_id = 'SKU is required';
    if (!formData.name.trim())       e.name       = 'Name is required';
    if (!formData.sellPrice || isNaN(parseFloat(formData.sellPrice)))
      e.sellPrice = 'Sell price is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ─── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('product_id',        formData.product_id);
      fd.append('name',              formData.name);
      fd.append('description',       formData.description);
      fd.append('vendorDescription', formData.vendorDescription || '');
      fd.append('itemUrl',           formData.itemUrl           || '');
      fd.append('colorFinish',       formData.colorFinish       || '');
      fd.append('itemClass',         formData.itemClass         || '');
      fd.append('category',          formData.category    || 'General');
      fd.append('collection',        formData.collection  || 'General');
      fd.append('package',           formData.package     || '');
      fd.append('dimension',         formData.dimension);
      fd.append('buyPrice',          formData.buyPrice  || 0);
      fd.append('sellPrice',         formData.sellPrice);
      fd.append('price',             formData.sellPrice);   // legacy compat
      fd.append('woodFinish',        formData.woodFinish);
      fd.append('fabric',            formData.fabric);
      // others: split comma-separated string back to array for the API
      const othersArr = Array.isArray(formData.others)
        ? formData.others.map(s => String(s).trim().toUpperCase()).filter(Boolean)
        : formData.others
          ? formData.others.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
          : [];
      fd.append('others', JSON.stringify(othersArr));
      if (formData.imageFile) {
        fd.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        fd.append('imageUrl', formData.imageUrl);
      }

      const url    = modalMode === 'create'
        ? `${backendServer}/api/products`
        : `${backendServer}/api/products/${selectedProductId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }

      await fetchProducts();
      handleCloseModal();
    } catch (err) {
      setErrors(e => ({ ...e, submit: err.message }));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ─── Margin helper ────────────────────────────────────────────────────
  const calcMargin = () => {
    const buy  = parseFloat(formData.buyPrice);
    const sell = parseFloat(formData.sellPrice);
    if (!buy || !sell || sell === 0) return null;
    const pct = ((sell - buy) / sell * 100).toFixed(1);
    return { amount: (sell - buy).toFixed(2), pct };
  };

  // ─── Pagination ───────────────────────────────────────────────────────
  const Pagination = () => {
    let s = Math.max(1, currentPage - 2);
    let e = Math.min(totalPages, s + 4);
    if (e === totalPages) s = Math.max(1, e - 4);
    const pages = [];
    for (let i = s; i <= e; i++) pages.push(i);
    const btn = (label, pg, disabled) => (
      <button key={label} onClick={() => setCurrentPage(pg)} disabled={disabled}
        className="px-2 py-1 rounded border text-sm hover:bg-gray-100 disabled:opacity-40">{label}</button>
    );
    return (
      <div className="flex justify-center items-center p-4 gap-1">
        {btn('«', 1, currentPage === 1)}
        {btn('‹', currentPage - 1, currentPage === 1)}
        {s > 1 && <>{btn(1, 1, false)}{s > 2 && <span className="px-1 text-sm">…</span>}</>}
        {pages.map(p => (
          <button key={p} onClick={() => setCurrentPage(p)}
            className={`px-2 py-1 rounded border text-sm ${p === currentPage ? 'bg-[#005670] text-white' : 'hover:bg-gray-100'}`}>{p}</button>
        ))}
        {e < totalPages - 1 && <span className="px-1 text-sm">…</span>}
        {e < totalPages && btn(totalPages, totalPages, false)}
        {btn('›', currentPage + 1, currentPage === totalPages)}
        {btn('»', totalPages, currentPage === totalPages)}
      </div>
    );
  };

  const FinishBadges = ({ product }) => {
    const othersArr = Array.isArray(product.others)
      ? product.others
      : (product.others || '').split(',').map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1">
        {product.woodFinish && (
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded font-mono">
            🪵 {product.woodFinish}
          </span>
        )}
        {product.fabric && (
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded font-mono">
            🧵 {product.fabric}
          </span>
        )}
        {othersArr.map(o => (
          <span key={o} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-mono">{o}</span>
        ))}
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light" style={{ color: '#005670' }}>Product Configuration</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkDelete(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            <Trash2 className="w-4 h-4" /> Bulk Delete
          </button>
          <button onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#005670' }}>
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button onClick={() => { setModalMode('create'); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#005670' }}>
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button onClick={() => setShowBulkUpdate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">
            <Pencil className="w-4 h-4" /> Bulk Update
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchFilter value={searchTerm} onSearch={setSearchTerm} placeholder="Search by SKU, name, category..." />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Image','Category','Package','SKU','Name','Dimensions','Buy Price','Sell Price','Finish','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="10" className="py-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="10" className="py-10 text-center text-sm text-gray-400">No products found</td></tr>
            ) : products.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <ImageCell url={p.image?.url} name={p.name} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.category || '—'}</td>
                <td className="px-4 py-3">
                  {p.package
                    ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.package === 'Lani' ? 'bg-emerald-100 text-emerald-800'
                        : p.package === 'Nalu' ? 'bg-violet-100 text-violet-800'
                        : 'bg-sky-100 text-sky-800'
                      }`}>{p.package}</span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-700">{p.product_id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{p.dimension || '—'}</td>
                {/* Buy Price */}
                <td className="px-4 py-3 text-sm text-gray-500">
                  {p.buyPrice ? `$${Number(p.buyPrice).toFixed(2)}` : <span className="text-gray-300">—</span>}
                </td>
                {/* Sell Price */}
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ${Number(p.sellPrice ?? p.price ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3"><FinishBadges product={p} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[92vh] flex flex-col">

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold" style={{ color: '#005670' }}>
                {modalMode === 'create' ? '➕ Add Product' : '✏️ Edit Product'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

              {/* ── Identity ── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>SKU / Product ID *</label>
                  <input type="text" value={formData.product_id}
                    onChange={e => handleSkuChange(e.target.value)}
                    className={inputCls} placeholder="e.g. ST-11-N-0A-00-MD-19-00-00-00" />
                  {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                  {formData.product_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      Parsed → Wood: <strong>{parseSku(formData.product_id).woodFinish || '—'}</strong>
                      {' | '}Fabric: <strong>{parseSku(formData.product_id).fabric || '—'}</strong>
                      {parseSku(formData.product_id).others?.length
                        ? <> | Others: <strong>{parseSku(formData.product_id).others.join(', ')}</strong></>
                        : null}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input type="text" value={formData.category}
                    onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className={inputCls} placeholder="e.g. Bench, Counter Stools" />
                </div>
                <div>
                  <label className={labelCls}>Item Name *</label>
                  <input type="text" value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className={inputCls} placeholder="e.g. Bench Style A" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* ✅ PRICE SECTION — split into buy & sell */}
                <div className="col-span-2">
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800">💰 Pricing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Buy Price */}
                      <div>
                        <label className={labelCls}>Buy Price / Cost ($)</label>
                        <input type="number" step="0.01" min="0" value={formData.buyPrice}
                          onChange={e => setFormData(f => ({ ...f, buyPrice: e.target.value }))}
                          className={inputCls} placeholder="0.00" />
                        <p className="text-xs text-gray-400 mt-0.5">Vendor / cost price</p>
                      </div>
                      {/* Sell Price */}
                      <div>
                        <label className={labelCls}>Sell Price ($) *</label>
                        <input type="number" step="0.01" min="0" value={formData.sellPrice}
                          onChange={e => setFormData(f => ({ ...f, sellPrice: e.target.value }))}
                          className={`${inputCls} ${errors.sellPrice ? 'border-red-400' : ''}`}
                          placeholder="852.00" />
                        {errors.sellPrice && <p className="text-red-500 text-xs mt-1">{errors.sellPrice}</p>}
                      </div>
                    </div>
                    {/* Live margin indicator */}
                    {(() => {
                      const m = calcMargin();
                      if (!m) return null;
                      const isPositive = parseFloat(m.amount) >= 0;
                      return (
                        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg w-fit ${
                          isPositive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span>{isPositive ? '📈' : '📉'}</span>
                          <span>Margin: <strong>${m.amount}</strong> ({m.pct}%)</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Dimensions</label>
                  <input type="text" value={formData.dimension}
                    onChange={e => setFormData(f => ({ ...f, dimension: e.target.value }))}
                    className={inputCls} placeholder='48"W x 16"D x 17"H' />
                </div>
                <div>
                  <label className={labelCls}>Collection</label>
                  <input type="text" value={formData.collection}
                    onChange={e => setFormData(f => ({ ...f, collection: e.target.value }))}
                    className={inputCls} placeholder="e.g. Ālia" />
                </div>
                <div>
                  <label className={labelCls}>📦 Package</label>
                  <div className="flex gap-2 mt-1">
                    {[
                      { value: '',         label: 'None',     active: 'bg-gray-600 text-white border-gray-600',     inactive: 'border-gray-300 text-gray-600 hover:border-gray-400' },
                      { value: 'Lani',     label: 'Lani',     active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'border-gray-300 text-gray-700 hover:border-emerald-400' },
                      { value: 'Nalu',     label: 'Nalu',     active: 'bg-violet-600 text-white border-violet-600',   inactive: 'border-gray-300 text-gray-700 hover:border-violet-400' },
                      { value: 'Mainland', label: 'Mainland', active: 'bg-sky-600 text-white border-sky-600',         inactive: 'border-gray-300 text-gray-700 hover:border-sky-400' },
                    ].map(({ value, label, active, inactive }) => (
                      <button key={value} type="button"
                        onClick={() => setFormData(f => ({ ...f, package: value }))}
                        className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          formData.package === value ? active : `bg-white ${inactive}`
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Item Class</label>
                  <input
                    type="text"
                    list="prod-item-class-options"
                    value={formData.itemClass}
                    onChange={e => setFormData(f => ({ ...f, itemClass: e.target.value }))}
                    className={inputCls}
                    placeholder="Select or type custom..."
                  />
                  <datalist id="prod-item-class-options">
                    {ITEM_CLASS_OPTIONS.map(opt => <option key={opt} value={opt} />)}
                  </datalist>
                </div>
                <div>
                  <label className={labelCls}>Color / Finish</label>
                  <input type="text" value={formData.colorFinish}
                    onChange={e => setFormData(f => ({ ...f, colorFinish: e.target.value }))}
                    className={inputCls} placeholder="e.g. Brushed Nickel, Ivory White" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Item URL</label>
                  <input type="url" value={formData.itemUrl}
                    onChange={e => setFormData(f => ({ ...f, itemUrl: e.target.value }))}
                    className={inputCls} placeholder="https://vendor.com/product/..." />
                </div>
              </div>

              {/* ── Descriptions ── */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
                <h4 className="text-sm font-semibold text-gray-800">📝 Descriptions</h4>
                <div>
                  <label className={labelCls}>Client Description</label>
                  <textarea value={formData.description} rows={3}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    className={`${inputCls} resize-none`} placeholder="Visible to client — material, style, specs..." />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`${labelCls} mb-0`}>Vendor Description</label>
                    {formData.description && (
                      <button type="button"
                        onClick={() => setFormData(f => ({ ...f, vendorDescription: f.description }))}
                        className="text-xs text-blue-600 hover:underline">
                        Copy from Client
                      </button>
                    )}
                  </div>
                  <textarea value={formData.vendorDescription} rows={3}
                    onChange={e => setFormData(f => ({ ...f, vendorDescription: e.target.value }))}
                    className={`${inputCls} resize-none`} placeholder="Internal / vendor-facing notes..." />
                </div>
              </div>

              {/* ── Finish ── */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">🎨 Finish Attributes</h4>
                  <p className="text-xs text-gray-400">Auto-parsed from SKU · override if needed</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>🪵 Wood Finish</label>
                    <input
                      type="text"
                      value={formData.woodFinish}
                      onChange={e => setFormData(f => ({ ...f, woodFinish: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g. MD, DK"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>🧵 Fabric Code</label>
                    <input
                      type="text"
                      value={formData.fabric}
                      onChange={e => setFormData(f => ({ ...f, fabric: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g. 19, 0B"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>⚙️ Other Finish</label>
                    <input
                      type="text"
                      value={formData.others}
                      onChange={e => setFormData(f => ({ ...f, others: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g. WV, LR (comma-sep)"
                    />
                  </div>
                </div>
              </div>

              {/* ── Image ── */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <h4 className="text-sm font-semibold text-gray-800">🖼 Image</h4>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {(formData.imagePreview || formData.imageUrl) ? (
                      <div className="relative">
                        <img src={formData.imagePreview || formData.imageUrl} alt="preview"
                          className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
                        <button type="button" onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#005670] hover:bg-blue-50 transition-colors">
                        <ImageIcon className="w-7 h-7 text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1">Upload</span>
                        <input type="file" className="hidden" accept="image/*"
                          onChange={e => handleImageFile(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or paste image URL</label>
                    <input type="url" value={formData.imageFile ? '' : (formData.imageUrl || '')}
                      disabled={!!formData.imageFile}
                      onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value, imagePreview: e.target.value }))}
                      className={`${inputCls} text-xs ${formData.imageFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="https://..." />
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.imageFile ? 'File upload active — clear to use URL instead' : 'From Excel "Link Image" column'}
                    </p>
                    {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}
            </form>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal} disabled={submitLoading}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitLoading}
                className="px-5 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
                style={{ backgroundColor: '#005670' }}>
                {submitLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{modalMode === 'create' ? 'Creating...' : 'Saving...'}</>
                  : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-semibold" style={{ color: '#005670' }}>Bulk Import Products</h3>
              <button onClick={() => setShowBulkImport(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <BulkProductImport onComplete={() => { setShowBulkImport(false); fetchProducts(); }} />
          </div>
        </div>
      )}

      {/* Bulk Delete */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-semibold text-red-600">Bulk Delete Products</h3>
              <button onClick={() => setShowBulkDelete(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <BulkDeleteProducts
              onComplete={() => { setShowBulkDelete(false); fetchProducts(); }}
              backendServer={backendServer}
            />
          </div>
        </div>
      )}

      {/* Bulk Update */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-semibold text-amber-700">Bulk Update Products</h3>
              <button onClick={() => setShowBulkUpdate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <BulkUpdateProducts
              onComplete={() => { setShowBulkUpdate(false); fetchProducts(); }}
              backendServer={backendServer}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductConfiguration;