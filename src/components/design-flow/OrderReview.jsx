import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, Loader, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { FLOOR_PLAN_TYPES } from '../../config/floorPlans';
import { backendServer } from '../../utils/info';
import Furniture360Viewer from './Furniture360Viewer';

// ProductImageZoom component (sama seperti di AreaCustomization)
const ProductImageZoom = ({ imageUrl, altText, onLoad, onError }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

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
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
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
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full h-auto w-auto object-contain transition-transform duration-200"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: 'center',
          }}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
        {zoomLevel > 1 && (
          <div className="text-xs text-gray-600 mr-1">{Math.round(zoomLevel * 100)}%</div>
        )}
        <button 
          onClick={handleZoomOut} 
          disabled={zoomLevel <= 1}
          className="p-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleZoomIn} 
          disabled={zoomLevel >= 3}
          className="p-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
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

// ProductDetailModal component (sama seperti di AreaCustomization)
const ProductDetailModal = ({ product, onClose }) => {
  const [detailImageLoading, setDetailImageLoading] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);

  const getMediaType = (url) => {
    if (!url) return 'none';
    const lower = url.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) return 'video';
    if (lower.endsWith('.obj')) return '3d';
    return 'image';
  };

  const getSelectedVariant = () => {
    if (!product.variants?.length) return null;
    return (
      product.variants.find(
        (v) =>
          (!product.selectedOptions?.fabric || v.fabric === product.selectedOptions.fabric) &&
          (!product.selectedOptions?.finish || v.finish === product.selectedOptions.finish) &&
          (!product.selectedOptions?.size || v.size === product.selectedOptions.size) &&
          (!product.selectedOptions?.insetPanel || v.insetPanel === product.selectedOptions.insetPanel)
      ) || product.variants[0]
    );
  };

  const selectedVariant = getSelectedVariant();
  const mediaType = getMediaType(product.selectedOptions?.image);
  const has3DModel = selectedVariant?.model?.url;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
              className={`px-4 py-2 rounded-lg transition-all ${
                !show3DModel ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Image View
            </button>
            <button
              onClick={() => setShow3DModel(true)}
              className={`px-4 py-2 rounded-lg transition-all ${
                show3DModel ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              3D Model
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Viewer Section */}
          <div className="relative w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-inner">
            {detailImageLoading && !show3DModel && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader className="w-12 h-12 text-[#005670] animate-spin" />
              </div>
            )}

            {show3DModel && has3DModel ? (
              <iframe
                src={selectedVariant.model.url}
                className="w-full h-full rounded-lg border-0"
                title="3D Model"
                onLoad={() => setDetailImageLoading(false)}
              />
            ) : mediaType === '3d' && product.selectedOptions?.image ? (
              <Furniture360Viewer
                objUrl={product.selectedOptions.image}
                mtlUrl={product.selectedOptions.image.replace(/\.obj$/i, '.mtl')}
                initialRotation={{ x: 0, y: 30, z: 0 }}
                autoRotate={true}
                onLoad={() => setDetailImageLoading(false)}
              />
            ) : mediaType === 'video' && product.selectedOptions?.image ? (
              <video
                src={product.selectedOptions.image}
                controls
                autoPlay
                loop
                muted
                className="max-w-full max-h-full h-auto w-auto object-contain rounded-lg"
                onLoadedData={() => setDetailImageLoading(false)}
                onError={() => setDetailImageLoading(false)}
              />
            ) : product.selectedOptions?.image ? (
              <ProductImageZoom
                imageUrl={product.selectedOptions.image}
                altText={product.name}
                onLoad={() => setDetailImageLoading(false)}
                onError={() => setDetailImageLoading(false)}
              />
            ) : (
              <div className="flex items-center justify-center flex-col">
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No product image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          {product.description && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">Description</h4>
              <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}

          {/* Dimensions Section */}
          {product.dimension && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">Dimension</h4>
              <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                <p className="text-gray-600 text-sm leading-relaxed">{product.dimension}</p>
              </div>
            </div>
          )}

          {/* Product Info Section */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">Product Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{product.spotName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{product.quantity}</span>
              </div>
              {product.selectedOptions?.finish && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Finish:</span>
                  <span className="font-medium">{product.selectedOptions.finish}</span>
                </div>
              )}
              {product.selectedOptions?.fabric && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fabric:</span>
                  <span className="font-medium">{product.selectedOptions.fabric}</span>
                </div>
              )}
              {product.selectedOptions?.size && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{product.selectedOptions.size}</span>
                </div>
              )}
              {product.selectedOptions?.insetPanel && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Inset Panel:</span>
                  <span className="font-medium">{product.selectedOptions.insetPanel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#005670] text-white rounded-lg hover:bg-opacity-90 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderReview = ({ selectedPlan, designSelections, clientInfo, onConfirmOrder }) => {
  const [viewingProduct, setViewingProduct] = useState(null);

  if (!designSelections?.selectedProducts || !selectedPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-light mb-6 text-[#005670]">
          Order Review
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">No selections have been made yet.</p>
        </div>
      </div>
    );
  }

  const packageType = selectedPlan?.id?.split('-')[0]; // 'investor' or 'custom'
  const totalInvestment = FLOOR_PLAN_TYPES[packageType]?.budgets[selectedPlan?.id] || 
                         FLOOR_PLAN_TYPES[packageType]?.budgets.default;

  // Function to view selected product details
  const handleViewSelectedProduct = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/${product._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const fullProductData = await response.json();
      
      const productWithSelections = {
        ...fullProductData,
        selectedOptions: product.selectedOptions,
        quantity: product.quantity,
        finalPrice: product.finalPrice,
        spotId: product.spotId,
        spotName: product.spotName
      };
      
      setViewingProduct(productWithSelections);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setViewingProduct(product);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light mb-6 text-[#005670]">
        Order Review
      </h2>

      {/* Design Team Review Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Design Team Review Process</h4>
            <p className="mt-2 text-sm text-amber-700">
              Before finalizing your order:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Your dedicated Henderson Design Group Concierge will arrange a personalized review at your convenience</li>
                <li>We'll walk through your selections together</li>
                <li>Our team will confirm all details align with your vision and lifestyle needs</li>
                <li>Once you've given your final approval, we'll prepare your order for production</li>
                <li>Your payment will be processed after you're completely satisfied</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Client Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <p className="font-medium">{clientInfo?.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Unit Number</label>
            <p className="font-medium">{clientInfo?.unitNumber}</p>
          </div>
        </div>
      </div>

      {/* Floor Plan Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Floor Plan Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Plan Type</label>
            <p className="font-medium">{selectedPlan.title}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Description</label>
            <p className="font-medium">{selectedPlan.description}</p>
          </div>
        </div>
      </div>

      {/* Selected Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Selected Products
        </h3>
        <div className="space-y-6">
          {designSelections.selectedProducts.map((product, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  {product.selectedOptions?.image?.toLowerCase().endsWith('.mp4') ? (
                    <video
                      src={product.selectedOptions.image}
                      className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      autoPlay
                      loop
                      muted
                      onClick={() => handleViewSelectedProduct(product)}
                      onError={(e) => {
                        console.error(`Error loading video for ${product.name}:`, e);
                        e.target.style.display = 'none';
                        const img = document.createElement('img');
                        img.src = '/images/placeholder.png';
                        img.className = 'w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity';
                        img.alt = product.name;
                        img.onclick = () => handleViewSelectedProduct(product);
                        e.target.parentNode.insertBefore(img, e.target);
                      }}
                    />
                  ) : (
                    <img
                      src={product.selectedOptions?.image || '/images/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleViewSelectedProduct(product)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.png';
                      }}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <button
                    onClick={() => handleViewSelectedProduct(product)}
                    className="text-left w-full"
                  >
                    <h4 className="font-medium text-lg text-[#005670] hover:text-[#005670]/80 underline hover:no-underline cursor-pointer transition-all">
                      {product.name}
                    </h4>
                  </button>
                  <p className="text-sm text-gray-500 mb-2">Location: {product.spotName}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Finish</label>
                      <p>{product.selectedOptions.finish || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Fabric</label>
                      <p>{product.selectedOptions.fabric || 'N/A'}</p>
                    </div>
                    {product.selectedOptions.size && (
                      <div>
                        <label className="block text-sm text-gray-600">Size</label>
                        <p>{product.selectedOptions.size}</p>
                      </div>
                    )}
                    {product.selectedOptions.insetPanel && (
                      <div>
                        <label className="block text-sm text-gray-600">Inset Panel</label>
                        <p>{product.selectedOptions.insetPanel}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-600">Quantity</label>
                      <p className="font-medium">{product.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total Price</span>
          <span className="text-[#005670]">${totalInvestment.toLocaleString()} (Not Including Tax)</span>
        </div>
      </div>

      {/* Final Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-medium">Please Note</p>
        </div>
        <p className="mt-2 text-sm text-red-700">
          By continuing, you're scheduling a personalized design review with our team. Once you give your final approval, we'll lock in your selections to start creating your perfect space.
        </p>
      </div>

      {/* Product Detail Modal */}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
};

export default OrderReview;