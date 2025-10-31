import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Trash2, AlertCircle, Loader, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { generateFurnitureAreas, getPlanDimensions } from './floorPlanConfig';
import { backendServer } from '../../utils/info';
import Furniture360Viewer from './Furniture360Viewer';
import ProductCard from './ProductCard';

const ProductImageZoom = ({ imageUrl, altText, onLoad, onError }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

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

  useEffect(() => {
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  useEffect(() => {
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

const AreaCustomization = ({ selectedPlan, floorPlanImage, onComplete, existingOrder: initialOrder, currentStep, clientInfo, checkExistingOrder }) => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeSpot, setActiveSpot] = useState(null);
  const [occupiedSpots, setOccupiedSpots] = useState({});
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [existingOrder, setExistingOrder] = useState(initialOrder);
  const [viewingProduct, setViewingProduct] = useState(null);

  if (!selectedPlan || !selectedPlan.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl text-gray-600">Please select a floor plan first</h2>
          <p className="text-gray-500 mt-2">Return to the floor plan selection step to continue.</p>
        </div>
      </div>
    );
  }

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

  useEffect(() => {
    const restoreState = async () => {
      try {
        if (initialOrder) {
          setExistingOrder(initialOrder);
          if (initialOrder.selectedProducts?.length > 0) {
            setSelectedProducts(initialOrder.selectedProducts);
            setOccupiedSpots(initialOrder.occupiedSpots || {});
          } else {
            localStorage.removeItem('selectedProducts');
            localStorage.removeItem('occupiedSpots');
            localStorage.removeItem('designSelections');
            setSelectedProducts([]);
            setOccupiedSpots({});
          }
        } else {
          const savedProducts = localStorage.getItem('selectedProducts');
          const savedSpots = localStorage.getItem('occupiedSpots');
          
          if (!savedProducts || !savedSpots) {
            localStorage.removeItem('selectedProducts');
            localStorage.removeItem('occupiedSpots');
            localStorage.removeItem('designSelections');
            setSelectedProducts([]);
            setOccupiedSpots({});
            return;
          }
          
          try {
            const parsedProducts = JSON.parse(savedProducts);
            const parsedSpots = JSON.parse(savedSpots);
            
            if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
              setSelectedProducts(parsedProducts);
              setOccupiedSpots(parsedSpots);
            } else {
              localStorage.removeItem('selectedProducts');
              localStorage.removeItem('occupiedSpots');
              localStorage.removeItem('designSelections');
              setSelectedProducts([]);
              setOccupiedSpots({});
            }
          } catch (parseError) {
            console.error('Error parsing saved data:', parseError);
            localStorage.removeItem('selectedProducts');
            localStorage.removeItem('occupiedSpots');
            localStorage.removeItem('designSelections');
            setSelectedProducts([]);
            setOccupiedSpots({});
          }
        }
      } catch (error) {
        console.error('Error restoring state:', error);
      }
    };
  
    restoreState();
  }, [initialOrder]);

  useEffect(() => {
    const previousPlanId = localStorage.getItem('currentPlanId');
    
    if (previousPlanId && previousPlanId !== selectedPlan.id) {
      setSelectedProducts([]);
      setOccupiedSpots({});
      setCurrentProduct(null);
      setSelectedTab(null);
      setActiveSpot(null);
      
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      localStorage.removeItem('designSelections');
    }
    
    localStorage.setItem('currentPlanId', selectedPlan.id);
  }, [selectedPlan.id]);

  const planDimensions = useMemo(() => {
    try {
      return getPlanDimensions(selectedPlan.id);
    } catch (error) {
      console.error('Error getting plan dimensions:', error);
      return { width: 1000, height: 800 };
    }
  }, [selectedPlan.id]);

  const furnitureSpots = useMemo(() => {
    try {
      return generateFurnitureAreas(selectedPlan.id);
    } catch (error) {
      console.error('Error generating furniture areas:', error);
      return {};
    }
  }, [selectedPlan.id]);

  const unselectedSpots = Object.values(furnitureSpots).filter(
    spot => !occupiedSpots[spot.id]
  );

  useEffect(() => {
    if (selectedProducts.length > 0) {
      const totalPrice = selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0);
      
      localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
      localStorage.setItem('occupiedSpots', JSON.stringify(occupiedSpots));
      
      onComplete({
        selectedProducts,
        totalPrice,
        spotSelections: occupiedSpots,
        floorPlanId: selectedPlan.id
      });
    }
  }, [selectedProducts, occupiedSpots]);

  const handleSpotClick = async (spotId) => {
    if (!existingOrder) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const orderData = {
        selectedPlan,
        clientInfo: clientInfo,
        selectedProducts: [],
        occupiedSpots: {},
        step: 2,
        status: 'ongoing'
      };

      try {
        const response = await fetch(`${backendServer}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Failed to create order');
        
        const newOrder = await response.json();
        setExistingOrder(newOrder);
      } catch (error) {
        console.error('Error creating order:', error);
        return;
      }
    }

    if (Object.keys(occupiedSpots).includes(spotId) && occupiedSpots[spotId] !== null) {
      const occupyingProduct = selectedProducts.find(p => p.spotId === spotId);
      if (occupyingProduct) {
        alert(`This space is already occupied by: ${occupyingProduct.name}. Please remove it first if you want to place a different item.`);
      }
      return;
    }
  
    try {
      setSelectedTab(spotId);
      setActiveSpot(spotId);
      setIsLoading(true);
      setAvailableProducts([]);
      
      const token = localStorage.getItem('token');
      
      const mappingResponse = await fetch(
        `${backendServer}/api/location-mappings/products?locationId=${spotId}&floorPlanId=${selectedPlan.title}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const mappingData = await mappingResponse.json();
      
      if (mappingData.products && mappingData.products.length > 0) {
        const productDetailsPromises = mappingData.products.map(async (product) => {
          try {
            const variantsResponse = await fetch(
              `${backendServer}/api/products/${product._id}/variants`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            const variantsData = await variantsResponse.json();
            
            return {
              ...product,
              variants: variantsData.variants
            };
          } catch (error) {
            console.error(`Error fetching variants for product ${product._id}:`, error);
            return null;
          }
        });
  
        if (Object.keys(occupiedSpots).includes(spotId) && occupiedSpots[spotId] !== null) {
          setSelectedTab(null);
          setActiveSpot(null);
          setAvailableProducts([]);
          return;
        }
  
        const productDetails = await Promise.all(productDetailsPromises);
        const validProducts = productDetails.filter(p => p !== null);
        setAvailableProducts(validProducts);
      } else {
        setAvailableProducts([]);
      }
    } catch (error) {
      console.error('Error fetching available products:', error);
      setAvailableProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border animate-pulse">
      <div className="relative w-full h-48 bg-gray-200"/>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"/>
        <div className="h-4 bg-gray-200 rounded w-1/2"/>
        <div className="h-4 bg-gray-200 rounded w-1/3"/>
        <div className="mt-4 h-10 bg-gray-200 rounded"/>
      </div>
    </div>
  );

  const handleCustomize = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/${product._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const fullProductData = await response.json();
      
      if (!fullProductData.variants || fullProductData.variants.length === 0) {
        console.warn('No variants found for product:', fullProductData);
        fullProductData.variants = product.variants;
      }
      
      setCurrentProduct(fullProductData);
    } catch (error) {
      console.error('Error fetching complete product data:', error);
      setCurrentProduct(product);
    }
  };

  const handleAddProduct = async (productWithOptions) => {
    if (selectedTab && !occupiedSpots[selectedTab]) {
      const currentSpot = Object.values(furnitureSpots).find(spot => 
        spot.id === selectedTab || spot.label === selectedTab
      );
  
      const selectedVariant = productWithOptions.variants.find(variant => 
        (!productWithOptions.selectedOptions.fabric || variant.fabric === productWithOptions.selectedOptions?.fabric) && 
        (!productWithOptions.selectedOptions.finish || variant.finish === productWithOptions.selectedOptions?.finish) &&
        (!productWithOptions.selectedOptions.size || variant.size === productWithOptions.selectedOptions?.size) &&
        (!productWithOptions.selectedOptions.insetPanel || variant.insetPanel === productWithOptions.selectedOptions?.insetPanel)
      );
  
      const unitPrice = productWithOptions.finalPrice || productWithOptions.basePrice;
      const quantity = productWithOptions.selectedOptions?.quantity || 1;
  
      const newProduct = {
        _id: productWithOptions._id,
        name: productWithOptions.name,
        product_id: productWithOptions.product_id,
        spotId: selectedTab,
        spotName: currentSpot?.area || 'Unknown Area',
        finalPrice: unitPrice * quantity,
        quantity: quantity,
        unitPrice: unitPrice, 
        selectedOptions: {
          finish: productWithOptions.selectedOptions?.finish || '',
          fabric: productWithOptions.selectedOptions?.fabric || '',
          size: productWithOptions.selectedOptions?.size || '',
          insetPanel: productWithOptions.selectedOptions?.insetPanel || '',
          image: selectedVariant?.image?.url || productWithOptions.variants[0]?.image?.url || ''
        }
      };
  
      const updatedOccupiedSpots = {
        ...occupiedSpots,
        [selectedTab]: productWithOptions._id
      };
  
      const updatedProducts = [...selectedProducts, newProduct];
  
      setOccupiedSpots(updatedOccupiedSpots);
      setSelectedProducts(updatedProducts);
      setCurrentProduct(null);
      setSelectedTab(null);
      setActiveSpot(null);
      setAvailableProducts([]);
  
      localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
      localStorage.setItem('occupiedSpots', JSON.stringify(updatedOccupiedSpots));
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found');
          return;
        }
  
        if (!existingOrder) {
          const orderResponse = await fetch(`${backendServer}/api/orders/user-order`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (orderResponse.ok) {
            const order = await orderResponse.json();
            if (order) {
              setExistingOrder(order);
            }
          }
        }
  
        const endpoint = `${backendServer}/api/orders${existingOrder ? `/${existingOrder._id}` : ''}`;
        
        const orderData = {
          selectedPlan,
          selectedProducts: updatedProducts,
          occupiedSpots: updatedOccupiedSpots,
          status: 'ongoing',
          step: 2
        };
  
        const response = await fetch(endpoint, {
          method: existingOrder ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
  
        if (!response.ok) {
          throw new Error('Failed to save product selection');
        }
  
        const savedOrder = await response.json();
        setExistingOrder(savedOrder);
        checkExistingOrder();
  
      } catch (error) {
        console.error('Error saving product selection:', error);
        alert('There was an error saving your selection. Please try again.');
      }
    }
  };

  const handleRemoveProduct = async (index) => {
    try {
      const productToRemove = selectedProducts[index];
      const updatedOccupiedSpots = { ...occupiedSpots };
      delete updatedOccupiedSpots[productToRemove.spotId];
      
      const updatedProducts = selectedProducts.filter((_, i) => i !== index);
      
      setOccupiedSpots(updatedOccupiedSpots);
      setSelectedProducts(updatedProducts);
      
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      
      if (updatedProducts.length > 0) {
        localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
        localStorage.setItem('occupiedSpots', JSON.stringify(updatedOccupiedSpots));
      }
  
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return;
      }
  
      if (!existingOrder) {
        console.warn('No existing order found');
        return;
      }
  
      const endpoint = `${backendServer}/api/orders/${existingOrder._id}`;
  
      const orderData = {
        selectedPlan,
        clientInfo,
        selectedProducts: updatedProducts,
        occupiedSpots: updatedOccupiedSpots,
        status: 'ongoing',
        step: 2
      };
  
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
  
      const updatedOrder = await response.json();
      setExistingOrder(updatedOrder);
      
      onComplete({
        selectedProducts: updatedProducts,
        totalPrice: updatedProducts.reduce((sum, p) => sum + p.finalPrice, 0),
        spotSelections: updatedOccupiedSpots,
        floorPlanId: selectedPlan.id
      });
  
      if (updatedProducts.length === 0) {
        localStorage.removeItem('designSelections');
      }

      checkExistingOrder();
  
    } catch (error) {
      console.error('Error removing product:', error);
      alert('There was an error removing the product. Please try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (selectedProducts.length > 0) {
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        localStorage.setItem('occupiedSpots', JSON.stringify(occupiedSpots));
      }
    };
  }, [selectedProducts, occupiedSpots]);

  // Product Detail Modal for Selected Products
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


  const CustomizationModal = ({ product, onClose, onAdd, currentSpot }) => {
    const uniqueFinishes = [...new Set(product.variants.map(v => v.finish).filter(Boolean))];
    const uniqueFabrics = [...new Set(product.variants.map(v => v.fabric).filter(Boolean))];
    const uniqueSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
    const uniqueInsetPanels = [...new Set(product.variants.map(v => v.insetPanel).filter(Boolean))];
    const [show3DModel, setShow3DModel] = useState(false);
  
    const [selectedOptions, setSelectedOptions] = useState({
      finish: uniqueFinishes.length === 1 ? uniqueFinishes[0] : '',
      fabric: uniqueFabrics.length === 1 ? uniqueFabrics[0] : '',
      size: uniqueSizes.length === 1 ? uniqueSizes[0] : '',
      insetPanel: uniqueInsetPanels.length === 1 ? uniqueInsetPanels[0] : '',
      quantity: currentSpot?.quantity?.fixed ?? (currentSpot?.quantity?.enabled ? currentSpot.quantity.min : 1),
      useAdditional: false,
      additionalQuantity: 0
    });
  
    const [modalImageLoading, setModalImageLoading] = useState(true);
  
    const getSelectedVariant = () => {
      const variant = product.variants.find(variant => 
        (!selectedOptions.fabric || variant.fabric === selectedOptions.fabric) && 
        (!selectedOptions.finish || variant.finish === selectedOptions.finish) &&
        (!selectedOptions.size || variant.size === selectedOptions.size) &&
        (!selectedOptions.insetPanel || variant.insetPanel === selectedOptions.insetPanel)
      );
      
      if (variant && variant.image?.url) {
        if (variant.image.url.toLowerCase().endsWith('.obj')) {
          variant.model3dUrl = variant.image.url;
          variant.materialUrl = variant.image.url.replace(/\.obj$/i, '.mtl');
        }
      }
      
      return variant;
    };

    const selectedVariant = getSelectedVariant();
    const has3DModel = selectedVariant?.model?.url;
  
    const handleAdd = () => {
      const selectedVariant = getSelectedVariant();
  
      onAdd({
        ...product,
        selectedOptions: {
          ...selectedOptions,
          image: selectedVariant?.image?.url || product.variants[0]?.image?.url || '',
          video: selectedVariant?.video?.url || product.variants[0]?.video?.url || '',
          quantity: selectedOptions.quantity + ((selectedOptions.useAdditional ? selectedOptions.additionalQuantity : 0 ))
        },
        finalPrice: getVariantPrice(),
      });
    };
  
    const getVariantPrice = () => {
      const selectedVariant = getSelectedVariant();
      return selectedVariant ? selectedVariant.price : product.basePrice;
    };
  
    const hasFinishOptions = uniqueFinishes.length > 0;
    const hasFabricOptions = uniqueFabrics.length > 0;
    const hasSizeOptions = uniqueSizes.length > 0;
    const hasInsetPanelOptions = uniqueInsetPanels.length > 0;
  
    const isValid = () => {
      const finishValid = !hasFinishOptions || selectedOptions.finish;
      const fabricValid = !hasFabricOptions || selectedOptions.fabric;
      const sizeValid = !hasSizeOptions || selectedOptions.size;
      const insetPanelValid = !hasInsetPanelOptions || selectedOptions.insetPanel;
      
      return finishValid && fabricValid && sizeValid && insetPanelValid;
    };
  
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
                  !show3DModel 
                    ? 'bg-[#005670] text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Image View
              </button>
              <button
                onClick={() => setShow3DModel(true)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  show3DModel 
                    ? 'bg-[#005670] text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                3D Model
              </button>
            </div>
          )}

          <div className="space-y-8">
            {/* Image/3D Viewer - Full Width */}
            <div className="space-y-4">
              <div className="relative w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-inner">
                {modalImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <Loader className="w-12 h-12 text-[#005670] animate-spin" />
                  </div>
                )}
                
                {show3DModel && has3DModel ? (
                  <iframe
                    src={selectedVariant.model.url}
                    className="w-full h-full rounded-lg border-0"
                    title="3D Model"
                    onLoad={() => setModalImageLoading(false)}
                  />
                ) : getSelectedVariant()?.model3dUrl ? (
                  <Furniture360Viewer 
                    objUrl={getSelectedVariant().model3dUrl}
                    mtlUrl={getSelectedVariant().materialUrl}
                    initialRotation={{ x: 0, y: 30, z: 0 }}
                    autoRotate={true}
                    onLoad={() => setModalImageLoading(false)}
                  />
                ) : getSelectedVariant()?.image?.url ? (
                  <>
                    {getSelectedVariant().image.url.toLowerCase().endsWith('.mp4') ? (
                      <video
                        src={getSelectedVariant().image.url}
                        controls
                        autoPlay
                        loop
                        muted
                        className="max-w-full max-h-full h-auto w-auto object-contain rounded-lg"
                        onLoadedData={() => setModalImageLoading(false)}
                        onError={(e) => {
                          setModalImageLoading(false);
                        }}
                      />
                    ) : (
                      <ProductImageZoom 
                        imageUrl={getSelectedVariant().image.url}
                        altText={product.name}
                        onLoad={() => setModalImageLoading(false)}
                        onError={(e) => {
                          setModalImageLoading(false);
                          e.target.src = "/images/placeholder.png";
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
              
              <div>
                <h4 className="font-semibold mb-3 text-lg">Description</h4>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description || 'No description available.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg">Dimension</h4>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.dimension || 'No dimension available.'}
                  </p>
                </div>
              </div>
            </div>

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
                          <img
                            src={attributeOptions.finish[finish].previewUrl}
                            alt={finish}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            No preview
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-700 text-white p-2 text-sm text-center">
                          {finish}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
    
            {uniqueFabrics.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Fabric</h4>
                <div className="flex gap-4 flex-nowrap overflow-x-auto pb-2">
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
                          <img
                            src={attributeOptions.fabric[fabric].previewUrl}
                            alt={fabric}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            No preview
                          </div>
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
              <div className="mt-6">
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
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Inset Panel</h4>
                <div className="flex gap-4 flex-nowrap overflow-x-auto pb-2">
                  {uniqueInsetPanels.map(insetPanel => {
                    return (
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
                          <img
                            src={attributeOptions.insetPanel[insetPanel].previewUrl}
                            alt={insetPanel}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            {insetPanel}
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-700 text-white p-2 text-sm text-center">
                          {insetPanel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
  
            {currentSpot?.quantity?.enabled && (
              <div>
                <div className="space-y-4">
                  {currentSpot.quantity.fixed ? (
                    <div className="flex items-center gap-4">
                      <h4 className="font-semibold">Quantity</h4>
                      <div className="w-24 text-center bg-gray-50 rounded-lg py-2 border text-gray-600">
                        {currentSpot.quantity.fixed}
                      </div>
                      <span className="text-sm text-gray-500">Fixed quantity</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Quantity</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg bg-white">
                            <button
                              onClick={() => setSelectedOptions(prev => ({
                                ...prev,
                                quantity: Math.max(currentSpot.quantity.min, prev.quantity - 1)
                              }))}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                              disabled={selectedOptions.quantity <= currentSpot.quantity.min}
                            >
                              -
                            </button>
                            <span className="w-24 text-center border-x py-2">{selectedOptions.quantity}</span>
                            <button
                              onClick={() => setSelectedOptions(prev => ({
                                ...prev,
                                quantity: Math.min(currentSpot.quantity.max, prev.quantity + 1)
                              }))}
                              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                              disabled={selectedOptions.quantity >= currentSpot.quantity.max}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">
                            Min: {currentSpot.quantity.min}, Max: {currentSpot.quantity.max}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
  
            {currentSpot?.quantity?.additional?.enabled && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Additional Quantity</h4>
                  <button
                    onClick={() => {
                      setSelectedOptions(prev => ({
                        ...prev,
                        useAdditional: !prev.useAdditional,
                        additionalQuantity: !prev.useAdditional ? currentSpot.quantity.additional.min : 0
                      }))
                    }}
                    className={`px-3 py-1 rounded-lg border transition-colors ${
                      selectedOptions.useAdditional ? 
                        'border-[#005670] bg-[#005670]/10 text-[#005670]' : 
                        'border-gray-200 text-gray-400 hover:border-[#005670]'
                    }`}
                  >
                    ✓
                  </button>
                </div>
  
                {selectedOptions.useAdditional && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg bg-white">
                      <button
                        onClick={() => setSelectedOptions(prev => ({
                          ...prev,
                          additionalQuantity: Math.max(
                            currentSpot.quantity.additional.min,
                            prev.additionalQuantity - 1
                          )
                        }))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                        disabled={selectedOptions.additionalQuantity <= currentSpot.quantity.additional.min}
                      >
                        -
                      </button>
                      <span className="w-24 text-center border-x py-2">
                        {selectedOptions.additionalQuantity}
                      </span>
                      <button
                        onClick={() => setSelectedOptions(prev => ({
                          ...prev,
                          additionalQuantity: Math.min(
                            currentSpot.quantity.additional.max,
                            prev.additionalQuantity + 1
                          )
                        }))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                        disabled={selectedOptions.additionalQuantity >= currentSpot.quantity.additional.max}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Min: {currentSpot.quantity.additional.min}, 
                      Max: {currentSpot.quantity.additional.max}
                    </span>
                  </div>
                )}
              </div>
            )}
  
            <div className="mt-8 text-xl font-bold">
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
              Add to Space
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-light mb-4 text-[#005670]">
            Design Your Space - {selectedPlan.title}
          </h2>

          {unselectedSpots.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-700">
                {unselectedSpots.length} items left to select
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Please select all furniture spots to proceed
              </p>
            </div>
          )}

          <div className="relative w-full h-[900px] border border-gray-200 rounded-lg">
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${planDimensions.width} ${planDimensions.height}`} 
              className="w-full h-full"
            >
              <image
                href={floorPlanImage}
                width={planDimensions.width}
                height={planDimensions.height}
                preserveAspectRatio="xMidYMid meet"
              />
              
              {Object.values(furnitureSpots).map((spot) => (
                <g key={spot.id}>
                  <path
                    d={spot.path}
                    transform={spot.transform}
                    data-spot-id={spot.id}
                    fill={
                      occupiedSpots[spot.id] 
                        ? "rgba(203, 213, 225, 0.3)" 
                        : activeSpot === spot.id 
                          ? "rgba(0,86,112,0.2)" 
                          : "transparent"
                    }
                    stroke={
                      occupiedSpots[spot.id]
                        ? "#94a3b8" 
                        : activeSpot === spot.id 
                          ? "#005670" 
                          : "transparent"
                    }
                    strokeWidth="2"
                    cursor={occupiedSpots[spot.id] ? "not-allowed" : "pointer"}
                    onClick={() => {
                      if (occupiedSpots[spot.id]) {
                        const productName = selectedProducts.find(p => p.spotId === spot.id)?.name;
                        alert(`This spot is occupied by: ${productName}. Remove the current item to select a new one.`);
                        return;
                      }
                      handleSpotClick(spot.id);
                    }}
                  />
                  {occupiedSpots[spot.id] ? (
                    <>
                      <text
                        x={spot.labelPosition.x}
                        y={spot.labelPosition.y - 10}
                        textAnchor="middle"
                        fill="#005670"
                        style={{
                          fontSize: spot.labelStyle.fontSize,
                          fontWeight: 'bold',
                          fontFamily: spot.labelStyle.fontFamily
                        }}
                      >
                        ✓
                      </text>
                      <text
                        x={spot.labelPosition.x}
                        y={spot.labelPosition.y + 10}
                        textAnchor="middle"
                        fill="#64748b"
                        style={{
                          fontSize: '12px',
                          fontFamily: spot.labelStyle.fontFamily
                        }}
                      >
                      </text>
                    </>
                  ) : (
                    <text
                      x={spot.labelPosition.x}
                      y={spot.labelPosition.y}
                      textAnchor={spot.labelStyle.alignment === 'left' ? 'start' : 
                                spot.labelStyle.alignment === 'right' ? 'end' : 'middle'}
                      fill="#666"
                      style={{
                        fontSize: spot.labelStyle.fontSize,
                        fontWeight: spot.labelStyle.fontWeight,
                        fontFamily: spot.labelStyle.fontFamily
                      }}
                      transform={spot.labelStyle.orientation === 'vertical' 
                        ? `rotate(-90, ${spot.labelPosition.x}, ${spot.labelPosition.y})`
                        : undefined}
                      dominantBaseline={spot.labelStyle.orientation === 'vertical' ? 'text-before-edge' : 'central'}
                    >
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          
          <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <h4 className="text-lg font-semibold text-gray-700">Floor Plan Guide</h4>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-[#005670] bg-[rgba(0,86,112,0.1)]"></div>
                  <span className="text-sm text-gray-600">Selected Item</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-red-500 bg-[rgba(239,68,68,0.2)]"></div>
                  <span className="text-sm text-gray-600">Requires Selection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-[#94a3b8] bg-transparent"></div>
                  <span className="text-sm text-gray-600">Available for Selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 bg-[#005670] text-white rounded-full text-xs">✓</div>
                  <span className="text-sm text-gray-600">Click any highlighted area to view available products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Available Options</h3>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-6">
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : selectedTab && availableProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {availableProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onCustomize={handleCustomize}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {selectedTab ? 'No products available for this location' : 'Click on a furniture spot in the floor plan to view available products'}
              </div>
            )}
          </div>

          <div className="col-span-1 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Selected Products</h3>
            {selectedProducts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-2">No products selected yet</p>
                  <p className="text-sm text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Please select product to proceed
                  </p>
                </div>
              ) : (
               <div className="space-y-4">
               {selectedProducts.map((product, index) => (
                 <div key={index} className="border-b pb-4">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex gap-3 flex-1">
                       <div className="relative w-20 h-20 flex-shrink-0">
                         {product.selectedOptions?.image?.toLowerCase().endsWith('.mp4') ? (
                           <video
                             src={product.selectedOptions.image}
                             className="w-full h-full object-cover rounded cursor-pointer"
                             muted
                             autoPlay
                             loop
                             onClick={() => handleViewSelectedProduct(product)}
                             onError={(e) => {
                               console.error(`Error loading video for ${product.name}:`, e);
                               e.target.style.display = 'none';
                               const img = document.createElement('img');
                               img.src = '/images/placeholder.png';
                               img.className = 'w-full h-full object-cover rounded cursor-pointer';
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
                       
                       <div className="flex-1 min-w-0">
                       <button
                         onClick={() => handleViewSelectedProduct(product)}
                         className="text-left w-full"
                       >
                         <h4 className="font-semibold text-sm leading-tight text-[#005670] hover:text-[#005670]/80 underline hover:no-underline cursor-pointer transition-all">
                           {product.name} 
                           {product.quantity > 1 && (
                             <span className="ml-2 text-sm text-gray-600">
                               (x{product.quantity})
                             </span>
                           )}
                         </h4>
                       </button>
                         <p className="text-xs text-gray-500 mt-1">{product.spotName}</p>
                         <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                           {product.selectedOptions?.finish && (
                             <div>Finish: {product.selectedOptions.finish}</div>
                           )}
                           {product.selectedOptions?.fabric && (
                             <div>Fabric: {product.selectedOptions.fabric}</div>
                           )}
                           {product.selectedOptions?.size && (
                             <div>Size: {product.selectedOptions.size}</div>
                           )}
                           {product.selectedOptions?.insetPanel && (
                             <div>Panel: {product.selectedOptions.insetPanel}</div>
                           )}
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2 ml-2">                      
                       <button
                         onClick={() => handleRemoveProduct(index)}
                         className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                         title="Remove Product"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
               </div>
             )}
           </div>
         </div>
       </div>
 
       {currentProduct && (
         <CustomizationModal
           product={currentProduct}
           currentSpot={Object.values(furnitureSpots).find(spot => 
             spot.id === selectedTab || spot.label === selectedTab
           )}
           onClose={() => {
             setCurrentProduct(null);
             setSelectedTab(null);
             setActiveSpot(null);
           }}
           onAdd={handleAddProduct}
         />
       )}
 
       {viewingProduct && (
         <ProductDetailModal
           product={viewingProduct}
           onClose={() => setViewingProduct(null)}
         />
       )}
     </div>
   );
 };
 
 export default AreaCustomization;