import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Check, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { backendServer } from '../utils/info';

// ===== KOMPONEN ZOOM IMAGE =====
const ProductImageZoom = ({ imageUrl, altText }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const maxX = (containerRef.current.offsetWidth * (zoomLevel - 1)) / 2;
      const maxY = (containerRef.current.offsetHeight * (zoomLevel - 1)) / 2;
      setPosition({
        x: Math.min(Math.max(e.clientX - dragStart.x, -maxX), maxX),
        y: Math.min(Math.max(e.clientY - dragStart.y, -maxY), maxY)
      });
    }
  };

  useEffect(() => {
    if (zoomLevel === 1) setPosition({ x: 0, y: 0 });
  }, [zoomLevel]);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragStart, zoomLevel]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-move flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full h-auto w-auto object-contain transition-transform duration-200"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: 'center',
          }}
        />
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
        {zoomLevel > 1 && <div className="text-xs text-gray-600 mr-1">{Math.round(zoomLevel * 100)}%</div>}
        <button onClick={handleZoomOut} disabled={zoomLevel <= 1} className="p-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleZoomIn} disabled={zoomLevel >= 3} className="p-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50">
          <ZoomIn size={18} />
        </button>
      </div>
      
      {zoomLevel > 1 && (
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg text-xs text-gray-600 flex items-center gap-1">
          <Move size={14} />
          <span>Drag to pan</span>
        </div>
      )}
    </div>
  );
};

// ===== KOMPONEN CUSTOMIZATION MODAL =====
// ===== KOMPONEN CUSTOMIZATION MODAL =====
const CustomizationModal = ({ product, onClose, onAdd }) => {
  const attributeOptions = {
    finish: {
      'Light': { previewUrl: '/images/woods/Light Wood.jpg' },
      'Dark': { previewUrl: '/images/woods/Dark Wood.png' }
    },
    fabric: {
      'Cream - Lounge Chair': { type: 'Cream', previewUrl: '/images/fabrics/Cream Lounge Chair.png' },
      'Cream - Modular Sofa': { type: 'Cream', previewUrl: '/images/fabrics/Cream Modular Sofa.png' },
      'Tan - Lounge Chair': { type: 'Tan', previewUrl: '/images/fabrics/Tan Lounge Chair.png' },
      'Tan - Modular Sofa': { type: 'Tan', previewUrl: '/images/fabrics/Tan Modular sofa.png' },
      'Beige - Lounge Chair': { type: 'Beige', previewUrl: '/images/fabrics/Beige Lounge Chair.png' },
      'Beige - Modular Sofa': { type: 'Beige', previewUrl: '/images/fabrics/Beige Modular Sofa.png' },
      'Blue - Lounge Chair': { type: 'Blue', previewUrl: '/images/fabrics/Blue Lounge Chair.png' },
      'Shell': { type: 'Shell', previewUrl: '/images/fabrics/pearl.png' },
      'Leather': { type: 'Leather', previewUrl: '/images/fabrics/leather.png' },
      'Faux Linen': { type: 'Faux Linen', previewUrl: '/images/fabrics/faux linen.png' },
      'Light': { type: 'Light', previewUrl: '/images/fabrics/pearl.png' },
      'Medium': { type: 'Medium', previewUrl: '/images/fabrics/leather.png' },
      'Dark': { type: 'Dark', previewUrl: '/images/fabrics/faux linen.png' }
    },
    insetPanel: {
      'Wood': { previewUrl: '/images/insetpanels/Wood.jpg' },
      'Shell': { previewUrl: '/images/insetpanels/pearl.png' },
      'Faux Linen': { previewUrl: '/images/insetpanels/Faux Linen.png' },
      'Woven Material': { previewUrl: '/images/insetpanels/LIGHT WOOD.png' }
    }
  };

  const uniqueFinishes = [...new Set(product.variants?.map(v => v.finish).filter(Boolean) || [])];
  const uniqueFabrics = [...new Set(product.variants?.map(v => v.fabric).filter(Boolean) || [])];
  const uniqueSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])];
  const uniqueInsetPanels = [...new Set(product.variants?.map(v => v.insetPanel).filter(Boolean) || [])];

  const getDefaultOptions = () => {
    const firstVariant = product.variants?.[0];
    return {
      finish: firstVariant?.finish || uniqueFinishes[0] || '',
      fabric: firstVariant?.fabric || uniqueFabrics[0] || '',
      size: firstVariant?.size || uniqueSizes[0] || '',
      insetPanel: firstVariant?.insetPanel || uniqueInsetPanels[0] || ''
    };
  };

  const [selectedOptions, setSelectedOptions] = useState(getDefaultOptions());
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);

  const getSelectedVariant = () => {
    return product.variants?.find(variant => 
      (!selectedOptions.fabric || variant.fabric === selectedOptions.fabric) && 
      (!selectedOptions.finish || variant.finish === selectedOptions.finish) &&
      (!selectedOptions.size || variant.size === selectedOptions.size) &&
      (!selectedOptions.insetPanel || variant.insetPanel === selectedOptions.insetPanel)
    ) || product.variants?.[0];
  };

  // ✅ FIXED: Updated image priority dengan uploadedImages handling yang benar
  const getImageUrl = (variant) => {
    console.log('🔍 Getting image URL for variant:', variant);
    console.log('📦 Product uploadedImages:', product.uploadedImages);
    
    // Priority 1: Variant image
    if (variant?.image?.url) {
      console.log('✅ Using variant image:', variant.image.url);
      return variant.image.url;
    }
    
    // Priority 2: Product uploadedImages array
    if (product.uploadedImages && Array.isArray(product.uploadedImages) && product.uploadedImages.length > 0) {
      // Try to find primary image first
      const primaryImage = product.uploadedImages.find(img => img.isPrimary === true);
      if (primaryImage?.url) {
        console.log('✅ Using primary uploadedImage:', primaryImage.url);
        return primaryImage.url;
      }
      
      // If no primary, use first image
      if (product.uploadedImages[0]?.url) {
        console.log('✅ Using first uploadedImage:', product.uploadedImages[0].url);
        return product.uploadedImages[0].url;
      }
    }
    
    // Priority 3: Legacy images array (fallback)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const legacyPrimary = product.images.find(img => img.isPrimary === true);
      if (legacyPrimary?.url) {
        console.log('✅ Using legacy primary image:', legacyPrimary.url);
        return legacyPrimary.url;
      }
      
      if (product.images[0]?.url) {
        console.log('✅ Using first legacy image:', product.images[0].url);
        return product.images[0].url;
      }
    }
    
    console.log('❌ No image found');
    return null;
  };

  const selectedVariant = getSelectedVariant();
  const has3DModel = selectedVariant?.model?.url;
  const displayImageUrl = getImageUrl(selectedVariant);

  useEffect(() => {
    setModalImageLoading(true);
    console.log('🔄 Variant changed, new image URL:', displayImageUrl);
  }, [selectedOptions.finish, selectedOptions.fabric, selectedOptions.size, selectedOptions.insetPanel]);

  const getVariantPrice = () => {
    return selectedVariant?.price || product.basePrice || 0;
  };

  const isValid = () => {
    return (!uniqueFinishes.length || selectedOptions.finish) &&
           (!uniqueFabrics.length || selectedOptions.fabric) &&
           (!uniqueSizes.length || selectedOptions.size) &&
           (!uniqueInsetPanels.length || selectedOptions.insetPanel);
  };

  const handleAdd = () => {
    const unitPrice = getVariantPrice();
    const quantity = 1;

    onAdd({
      ...product,
      quantity: quantity,
      unitPrice: unitPrice,
      finalPrice: unitPrice * quantity,
      selectedOptions: {
        finish: selectedOptions.finish,
        fabric: selectedOptions.fabric,
        size: selectedOptions.size,
        insetPanel: selectedOptions.insetPanel,
        image: displayImageUrl || ''
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full m-4 overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{product.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {has3DModel && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShow3DModel(false)}
              className={`px-4 py-2 rounded-lg transition-all ${!show3DModel ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Image View
            </button>
            <button
              onClick={() => setShow3DModel(true)}
              className={`px-4 py-2 rounded-lg transition-all ${show3DModel ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              3D Model
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Image/3D Viewer */}
          <div className="space-y-4">
            <div className="relative w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-inner">
              {modalImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <Loader2 className="w-12 h-12 text-[#005670] animate-spin" />
                </div>
              )}
              
              {show3DModel && has3DModel ? (
                <iframe
                  key={selectedVariant?.model?.url}
                  src={selectedVariant.model.url}
                  className="w-full h-full rounded-lg border-0"
                  title="3D Model"
                  onLoad={() => setModalImageLoading(false)}
                />
              ) : displayImageUrl ? (
                <>
                  {displayImageUrl.toLowerCase().endsWith('.mp4') ? (
                    <video
                      key={displayImageUrl}
                      src={displayImageUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="max-w-full max-h-full h-auto w-auto object-contain rounded-lg"
                      onLoadedData={() => setModalImageLoading(false)}
                      onError={(e) => {
                        console.error('❌ Video load error:', displayImageUrl);
                        setModalImageLoading(false);
                      }}
                    />
                  ) : (
                    <img
                      key={displayImageUrl}
                      src={displayImageUrl}
                      alt={product.name}
                      className="max-w-full max-h-full h-auto w-auto object-contain transition-transform duration-200"
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', displayImageUrl);
                        setModalImageLoading(false);
                      }}
                      onError={(e) => {
                        console.error('❌ Image load error:', displayImageUrl);
                        setModalImageLoading(false);
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage Error%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center flex-col">
                  <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No product image available</span>
                  </div>
                </div>
              )}
            </div>
            
            {product.description && (
              <div>
                <h4 className="font-semibold mb-3 text-lg">Description</h4>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>
              </div>
            )}

            {product.dimension && (
              <div>
                <h4 className="font-semibold mb-3 text-lg">Dimension</h4>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-gray-600 text-sm leading-relaxed">{product.dimension}</p>
                </div>
              </div>
            )}
          </div>

          {/* Variant Options */}
          <div className="space-y-6 mb-6">
            {uniqueFinishes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Wood Finish</h4>
                <div className="flex gap-4">
                  {uniqueFinishes.map(finish => {
                    if (!finish || !attributeOptions.finish?.[finish]) return null;
                    return (
                      <button
                        key={finish}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, finish }))}
                        className={`relative w-32 h-32 rounded-lg overflow-hidden transition-all ${
                          selectedOptions.finish === finish
                            ? 'border-4 border-[#005670] ring-2 ring-[#005670] shadow-lg'
                            : 'border border-gray-200 hover:border-[#005670]/50'
                        }`}
                      >
                        {attributeOptions.finish[finish].previewUrl ? (
                          <img src={attributeOptions.finish[finish].previewUrl} alt={finish} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No preview</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-700 text-white p-2 text-sm text-center">{finish}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {uniqueFabrics.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Fabric</h4>
                <div className="flex gap-4 flex-wrap">
                  {uniqueFabrics.map(fabric => {
                    if (!fabric || !attributeOptions.fabric?.[fabric]) return null;
                    return (
                      <button
                        key={fabric}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, fabric }))}
                        className={`relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                          selectedOptions.fabric === fabric
                            ? 'border-4 border-[#005670] ring-2 ring-[#005670] shadow-lg'
                            : 'border border-gray-200 hover:border-[#005670]/50'
                        }`}
                      >
                        {attributeOptions.fabric[fabric].previewUrl ? (
                          <img src={attributeOptions.fabric[fabric].previewUrl} alt={fabric} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No preview</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-700 text-white p-2 text-sm text-center">
                          {attributeOptions.fabric[fabric].type || fabric}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Size</h4>
                <div className="flex flex-wrap gap-3">
                  {uniqueSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, size }))}
                      className={`py-2 px-4 border rounded-md text-center transition-all ${
                        selectedOptions.size === size
                          ? 'border-2 border-[#005670] bg-[#005670]/5 text-[#005670] font-medium'
                          : 'border-gray-200 hover:border-[#005670]/50 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueInsetPanels.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Inset Panel</h4>
                <div className="flex gap-4 flex-wrap">
                  {uniqueInsetPanels.map(insetPanel => (
                    <button
                      key={insetPanel}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, insetPanel }))}
                      className={`relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                        selectedOptions.insetPanel === insetPanel
                          ? 'border-4 border-[#005670] ring-2 ring-[#005670] shadow-lg'
                          : 'border border-gray-200 hover:border-[#005670]/50'
                      }`}
                    >
                      {attributeOptions.insetPanel?.[insetPanel]?.previewUrl ? (
                        <img src={attributeOptions.insetPanel[insetPanel].previewUrl} alt={insetPanel} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">{insetPanel}</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-700 text-white p-2 text-sm text-center">{insetPanel}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price display */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Price:</span>
                <span className="text-2xl font-bold text-[#005670]">
                  ${getVariantPrice().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={handleAdd}
            disabled={!isValid()}
            className={`w-full py-3 rounded-lg font-medium ${
              !isValid()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#005670] text-white hover:bg-opacity-90'
            }`}
          >
            Add to Selection
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const ProductSelectionModal = ({ isOpen, onClose, onSelectProducts, alreadySelected = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(12);
  const [customizingProduct, setCustomizingProduct] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, currentPage, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        search: searchTerm
      });

      const response = await fetch(`${backendServer}/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Fetch failed (${response.status})`);

      const data = await response.json();

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      } else if (Array.isArray(data)) {
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

  const filteredProducts = products.filter(product => !alreadySelected.includes(product._id));

  const handleCustomize = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/${product._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fullProductData = await response.json();
      
      if (!fullProductData.variants || fullProductData.variants.length === 0) {
        fullProductData.variants = product.variants || [];
      }
      
      setCustomizingProduct(fullProductData);
    } catch (error) {
      console.error('Error fetching complete product data:', error);
      setCustomizingProduct(product);
    }
  };

  const handleAddProduct = (productWithOptions) => {
    console.log('✅ Product added to selection:', productWithOptions);
    setSelectedProducts(prev => [...prev, productWithOptions]);
    setCustomizingProduct(null);
  };

  const handleRemoveSelected = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const handleConfirm = () => {
    console.log('✅ Confirming products:', selectedProducts);
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

  // ✅ Prioritas: variant image > uploadedImages (primary) > uploadedImages (first)
  const getProductImage = (product) => {
    // Priority 1: Variant image
    if (product.variants?.[0]?.image?.url) {
      return product.variants[0].image.url;
    }
    
    // Priority 2: uploadedImages array
    if (product.uploadedImages && Array.isArray(product.uploadedImages) && product.uploadedImages.length > 0) {
      // Try primary first
      const primaryImage = product.uploadedImages.find(img => img.isPrimary === true);
      if (primaryImage?.url) {
        return primaryImage.url;
      }
      
      // Use first image
      if (product.uploadedImages[0]?.url) {
        return product.uploadedImages[0].url;
      }
    }
    
    // Priority 3: Legacy images array (fallback)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const legacyPrimary = product.images.find(img => img.isPrimary === true);
      if (legacyPrimary?.url) {
        return legacyPrimary.url;
      }
      
      if (product.images[0]?.url) {
        return product.images[0].url;
      }
    }
    
    return null;
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
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Info Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
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
          
          {selectedProducts.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product(s) selected
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
            <span>Showing {filteredProducts.length} products</span>
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
                <p className="text-sm text-gray-400">Try a different search term or browse other pages</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const imageUrl = getProductImage(product);
                const isSelected = selectedProducts.find(p => p._id === product._id);
                
                return (
                  <div
                    key={product._id}
                    className="relative border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg border-gray-200 hover:border-[#005670]/50"
                  >
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
                      <p className="font-semibold text-sm text-gray-900 truncate mb-1">{product.name}</p>
                      <p className="text-xs text-gray-500 mb-2 truncate">{product.product_id}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-[#005670] bg-[#005670]/10 px-2 py-1 rounded">
                          {product.collection || 'General'}
                        </span>
                        {product.variants?.[0]?.price && (
                          <span className="text-xs font-bold text-gray-900">
                            ${product.variants[0].price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {isSelected ? (
                          <button
                            onClick={() => handleRemoveSelected(product._id)}
                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCustomize(product)}
                            className="flex-1 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90 font-medium text-sm transition-colors"
                          >
                            Select
                          </button>
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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

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

      {/* Customization Modal */}
      {customizingProduct && (
        <CustomizationModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
};

export default ProductSelectionModal;