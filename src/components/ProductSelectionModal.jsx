import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Finish code labels ────────────────────────────────────────────────────
const WOOD_LABELS  = { MD: 'Medium Teak', DK: 'Dark Teak' };

// ─── Get image URL from flat product schema ────────────────────────────────
// Schema: product.image.url (primary), product.uploadedImages[] (additional)
const getProductImage = (product) => {
  if (!product) return null;

  // Priority 1: flat image field (new schema)
  if (product.image?.url) return product.image.url;

  // Priority 2: uploadedImages array
  if (Array.isArray(product.uploadedImages) && product.uploadedImages.length > 0) {
    const primary = product.uploadedImages.find(img => img.isPrimary);
    return primary?.url || product.uploadedImages[0]?.url || null;
  }

  // Priority 3: legacy images array (backward compat)
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find(img => img.isPrimary);
    return primary?.url || product.images[0]?.url || null;
  }

  return null;
};

// ─── Finish badges ─────────────────────────────────────────────────────────
const FinishBadges = ({ product, size = 'sm' }) => {
  const px = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
  return (
    <div className="flex flex-wrap gap-1">
      {product.woodFinish && (
        <span className={`${px} bg-amber-100 text-amber-800 rounded font-mono font-medium`}>
          🪵 {product.woodFinish}
        </span>
      )}
      {product.fabric && (
        <span className={`${px} bg-purple-100 text-purple-800 rounded font-mono font-medium`}>
          🧵 {product.fabric}
        </span>
      )}
      {(product.others || []).map(o => (
        <span key={o} className={`${px} bg-blue-100 text-blue-800 rounded font-mono font-medium`}>{o}</span>
      ))}
    </div>
  );
};

// ─── Product image with error fallback ────────────────────────────────────
const ProductImg = ({ url, name, className }) => {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className={`${className} bg-gray-100 flex flex-col items-center justify-center text-gray-400`}>
        <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs">No Image</span>
      </div>
    );
  }
  return (
    <img src={url} alt={name} className={className}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer" />
  );
};

// ==================== DETAIL MODAL (replaces CustomizationModal) ====================
// Flat product — no variant selection needed.
// Shows product details + finish badges, then "Add to Selection".

const ProductDetailModal = ({ product, onClose, onAdd }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imgFailed, setImgFailed]       = useState(false);
  const imageUrl = getProductImage(product);

  const handleAdd = () => {
    // Pre-seed PricingFields: product.price → msrp, 50% markup default
    const seedPrice = product.price || 0;
    onAdd({
      ...product,
      quantity:   1,
      unitPrice:  seedPrice,
      finalPrice: seedPrice,
      package:    product.package || '',          // ✅ explicit - sudah ada via ...product tapi lebih safe
      selectedOptions: {
        image:      imageUrl || '',
        woodFinish: product.woodFinish || '',
        fabric:     product.fabric     || '',
        others:     product.others     || [],
        size:       product.dimension  || '',
        finish:     product.woodFinish || '',   // backward compat
        // ── Pricing pre-fill from catalog price ──
        msrp:              seedPrice,
        discountPercent:   0,
        netCostOverride:   null,
        noNetPurchaseCost: false,
        units:             'Each',
        markupPercent:     50,
        shippingMarkupPercent: 50,
        otherMarkupPercent:    50,
        shippingCost:      0,
        otherCost:         0,
        depositPercent:    90,
        vendorDepositPercent: 0,
        salesTaxRate:      8.75,
        taxableCost:           true,
        taxableMarkup:         true,
        taxableShippingCost:   true,
        taxableShippingMarkup: true,
        taxableOtherCost:      true,
        taxableOtherMarkup:    true,
        discountTaken:     '',
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-400 font-mono mt-0.5">{product.product_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Image */}
          <div className="relative w-full h-72 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
            {imageLoading && !imgFailed && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <Loader2 className="w-8 h-8 text-[#005670] animate-spin" />
              </div>
            )}
            {imageUrl && !imgFailed ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setImageLoading(false)}
                onError={() => { setImageLoading(false); setImgFailed(true); }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            {product.category && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-0.5">Category</p>
                <p className="text-sm font-semibold text-gray-900">{product.category}</p>
              </div>
            )}
            {product.dimension && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-0.5">Dimensions</p>
                <p className="text-sm font-semibold text-gray-900">{product.dimension}</p>
              </div>
            )}
            {product.collection && product.collection !== 'General' && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-0.5">Collection</p>
                <p className="text-sm font-semibold text-gray-900">{product.collection}</p>
              </div>
            )}
          </div>

          {/* Finish codes */}
          {(product.woodFinish || product.fabric || product.others?.length > 0) && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Finish</p>
              <div className="flex flex-wrap gap-2">
                {product.woodFinish && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-xs text-amber-700 font-medium">🪵 Wood</span>
                    <span className="text-xs font-bold text-amber-900 font-mono">
                      {product.woodFinish} — {WOOD_LABELS[product.woodFinish] || product.woodFinish}
                    </span>
                  </div>
                )}
                {product.fabric && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-xs text-purple-700 font-medium">🧵 Fabric</span>
                    <span className="text-xs font-bold text-purple-900 font-mono">{product.fabric}</span>
                  </div>
                )}
                {(product.others || []).map(o => (
                  <div key={o} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-xs font-bold text-blue-900 font-mono">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
              <div className="p-4 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="p-4 bg-gradient-to-r from-[#005670]/5 to-[#007a9a]/5 border border-[#005670]/20 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Price</span>
              <span className="text-2xl font-bold text-[#005670]">
                ${(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleAdd}
            className="flex-1 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Add to Selection
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ProductSelectionModal = ({ isOpen, onClose, onSelectProducts, alreadySelected = [] }) => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit]                         = useState(12);
  const [detailProduct, setDetailProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPackage, setFilterPackage]   = useState('');
  const [allCategories, setAllCategories]   = useState([]);  // fetched from API

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchCategories();
    }
  }, [isOpen, currentPage, searchTerm, filterCategory, filterPackage]);

  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [searchTerm, filterCategory, filterPackage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: currentPage, limit, search: searchTerm });
      if (filterCategory) params.set('category', filterCategory);
      if (filterPackage)  params.set('package',  filterPackage);
      const res = await fetch(`${backendServer}/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch all unique categories from DB ────────────────────────────────
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/products/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setAllCategories(data.categories || []);
    } catch (err) {
      console.error('fetchCategories error:', err);
    }
  };

  // Open detail modal — fetch full product for complete data
  const handleOpenDetail = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/products/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const full = await res.json();
      setDetailProduct(full);
    } catch {
      setDetailProduct(product); // fallback to list data
    }
  };

  const handleAddProduct = (productWithOptions) => {
    setSelectedProducts(prev => [...prev, productWithOptions]);
    setDetailProduct(null);
  };

  const handleRemoveSelected = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const handleConfirm = () => {
    onSelectProducts(selectedProducts);
    setSelectedProducts([]);
    setCurrentPage(1);
    setSearchTerm('');
    onClose();
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setCurrentPage(1);
    setSearchTerm('');
    onClose();
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // allCategories is now fetched from API (see fetchCategories)

  // Filter out already-selected
  const filteredProducts = products.filter(p => !alreadySelected.includes(p._id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Select from Product Library</h3>
            <p className="text-white/90 text-sm mt-1">
              {totalProducts} products available
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search + Filter bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, SKU..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm" />
            </div>
            {/* Category filter */}
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] min-w-[140px]">
              <option value="">All Categories</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {/* Package filter */}
            <div className="flex gap-1 items-center">
              {[
                { value: '',         label: 'All',      on: 'bg-gray-700 text-white border-gray-700' },
                { value: 'Lani',     label: 'Lani',     on: 'bg-emerald-600 text-white border-emerald-600' },
                { value: 'Nalu',     label: 'Nalu',     on: 'bg-violet-600 text-white border-violet-600' },
                { value: 'Mainland', label: 'Mainland', on: 'bg-sky-600 text-white border-sky-600' },
              ].map(({ value, label, on }) => (
                <button key={value} type="button" onClick={() => setFilterPackage(value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
                    filterPackage === value ? on : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product(s) selected
              </p>
              <div className="flex gap-1">
                {selectedProducts.map(p => (
                  <span key={p._id} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 rounded-full text-xs text-blue-800">
                    {p.name}
                    <button onClick={() => handleRemoveSelected(p._id)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Page {currentPage} of {totalPages}</span>
            <span>{filteredProducts.length} shown</span>
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#005670] mx-auto" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-1">No products found</p>
              {searchTerm && <p className="text-sm">Try a different search term</p>}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const imageUrl  = getProductImage(product);
                const isSelected = !!selectedProducts.find(p => p._id === product._id);

                return (
                  <div key={product._id}
                    className={`relative border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg ${
                      isSelected ? 'border-[#005670] shadow-md' : 'border-gray-200 hover:border-[#005670]/50'
                    }`}>

                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-7 h-7 bg-[#005670] text-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square">
                      <ProductImg url={imageUrl} name={product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white">
                      <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 font-mono truncate mb-1.5">{product.product_id}</p>

                      {/* Category + price row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 flex-wrap">
                        {product.category && (
                          <span className="text-xs text-[#005670] bg-[#005670]/10 px-2 py-0.5 rounded font-medium truncate max-w-[60%]">
                            {product.category}
                          </span>
                        )}
                        {product.package && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            product.package === 'Lani' ? 'bg-emerald-100 text-emerald-800'
                            : product.package === 'Nalu' ? 'bg-violet-100 text-violet-800'
                            : 'bg-sky-100 text-sky-800'
                          }`}>
                            {product.package}
                          </span>
                        )}
                      </div>
                        {product.price > 0 && (
                          <span className="text-sm font-bold text-gray-900">
                            ${Number(product.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Finish badges */}
                      <div className="mb-2 min-h-[20px]">
                        <FinishBadges product={product} />
                      </div>

                      {/* Dimension */}
                      {product.dimension && (
                        <p className="text-[10px] text-gray-400 mb-2 truncate">{product.dimension}</p>
                      )}

                      {/* Action button */}
                      {isSelected ? (
                        <button onClick={() => handleRemoveSelected(product._id)}
                          className="w-full py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors">
                          Remove
                        </button>
                      ) : (
                        <button onClick={() => handleOpenDetail(product)}
                          className="w-full py-1.5 bg-[#005670] text-white rounded-lg hover:bg-opacity-90 font-medium text-sm transition-colors">
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: pagination + confirm */}
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          {/* Pagination */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium text-sm disabled:opacity-40 transition-all">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-1.5">
              {(() => {
                let start = Math.max(1, currentPage - 3);
                let end   = Math.min(totalPages, start + 6);
                if (end === totalPages) start = Math.max(1, end - 6);
                const pages = [];
                for (let i = start; i <= end; i++) pages.push(i);
                return pages.map(p => (
                  <button key={p} onClick={() => goToPage(p)} disabled={loading}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                      p === currentPage ? 'bg-[#005670] text-white shadow' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}>{p}</button>
                ));
              })()}
            </div>

            <button onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium text-sm disabled:opacity-40 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Confirm / Cancel */}
          <div className="flex justify-end gap-3">
            <button onClick={handleClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={selectedProducts.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all">
              Add {selectedProducts.length > 0 ? `${selectedProducts.length} ` : ''}Product{selectedProducts.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
};

export default ProductSelectionModal;