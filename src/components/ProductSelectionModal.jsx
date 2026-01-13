import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendServer } from '../utils/info';

const ProductSelectionModal = ({ isOpen, onClose, onSelectProducts, alreadySelected = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(12); // Products per page

  // ✅ Fetch products when modal opens, page changes, or search changes
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, currentPage, searchTerm]);

  // ✅ Reset to page 1 when search changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // ✅ Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        search: searchTerm
      });

      const response = await fetch(
        `${backendServer}/api/products?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Fetch failed (${response.status})`);
      }

      const data = await response.json();
      console.log('📦 API response:', data);

      // ✅ Handle paginated response
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      } else if (Array.isArray(data)) {
        // Fallback for non-paginated response
        setProducts(data);
        setTotalPages(1);
        setTotalProducts(data.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter out already selected products
  const filteredProducts = products.filter(product => 
    !alreadySelected.includes(product._id)
  );

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.filter(p => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Select from Product Library</h3>
            <p className="text-white/90 text-sm mt-1">
              Browse all available furniture products • {totalProducts} total products
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Info Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or product code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
            />
          </div>
          
          {/* Selected Products Info */}
          {selectedProducts.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product(s) selected
              </p>
            </div>
          )}

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <span>
              Showing {filteredProducts.length} products
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#005670] mx-auto mb-3" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400">
                  Try a different search term or browse other pages
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.find(p => p._id === product._id);
                const defaultVariant = product.variants?.[0];
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                const imageUrl = primaryImage?.url || defaultVariant?.image?.url;
                
                return (
                  <div
                    key={product._id}
                    onClick={() => toggleProduct(product)}
                    className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      isSelected
                        ? 'border-[#005670] ring-2 ring-[#005670]/20 shadow-lg'
                        : 'border-gray-200 hover:border-[#005670]/50'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-7 h-7 bg-[#005670] text-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    
                    {/* Image */}
                    <div className="aspect-square bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-3 bg-white">
                      <p className="font-semibold text-sm text-gray-900 truncate mb-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        {product.product_id}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#005670] bg-[#005670]/10 px-2 py-1 rounded">
                          {product.collection || 'General'}
                        </span>
                        {defaultVariant?.price && (
                          <span className="text-xs font-bold text-gray-900">
                            ${defaultVariant.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => goToPage(pageNum)}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#005670] text-white shadow-lg'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 7 && currentPage < totalPages - 3 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedProducts.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Add {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;