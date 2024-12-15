import React, { useState, useMemo, useEffect } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { generateFurnitureAreas, getPlanDimensions } from './floorPlanConfig';
import { backendServer } from '../../utils/info';

const AreaCustomization = ({ selectedPlan, floorPlanImage, onComplete }) => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeSpot, setActiveSpot] = useState(null);
  const [occupiedSpots, setOccupiedSpots] = useState({});
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    const restoreState = async () => {
      try {
        // First try to get data from localStorage for immediate display
        const savedProducts = localStorage.getItem('selectedProducts');
        const savedSpots = localStorage.getItem('occupiedSpots');
        
        if (savedProducts && savedSpots) {
          setSelectedProducts(JSON.parse(savedProducts));
          setOccupiedSpots(JSON.parse(savedSpots));
        }
        
        // Then try to get data from the server
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendServer}/api/orders/user-order`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const order = await response.json();
          if (order?.selectedProducts?.length > 0) {
            setSelectedProducts(order.selectedProducts);
            setOccupiedSpots(order.occupiedSpots || {});
            
            // Update localStorage with server data
            localStorage.setItem('selectedProducts', JSON.stringify(order.selectedProducts));
            localStorage.setItem('occupiedSpots', JSON.stringify(order.occupiedSpots || {}));
          }
        }
      } catch (error) {
        console.error('Error restoring state:', error);
      }
    };
  
    restoreState();
  }, []);

  useEffect(() => {
    const previousPlanId = localStorage.getItem('currentPlanId');
    
    if (previousPlanId && previousPlanId !== selectedPlan.id) {
      // Clear all selections if floor plan changed
      setSelectedProducts([]);
      setOccupiedSpots({});
      setCurrentProduct(null);
      setSelectedTab(null);
      setActiveSpot(null);
      
      // Clear localStorage
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      localStorage.removeItem('designSelections');
    }
    
    // Save current plan ID
    localStorage.setItem('currentPlanId', selectedPlan.id);
  }, [selectedPlan.id]);

  // Get dimensions and furniture spots for the selected plan
  const planDimensions = useMemo(() => 
    getPlanDimensions(selectedPlan.id), [selectedPlan]
  );

  // const arrayBufferToBase64 = (buffer) => {
  //   let binary = '';
  //   const bytes = new Uint8Array(buffer);
  //   for (let i = 0; i < bytes.length; i++) {
  //     binary += String.fromCharCode(bytes[i]);
  //   }
  //   return window.btoa(binary);
  // };
  
  const furnitureSpots = useMemo(() => 
    generateFurnitureAreas(selectedPlan.id), [selectedPlan]
  );

  // Update parent component when products change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const totalPrice = selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0);
      
      // Save to localStorage
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
    if (!occupiedSpots[spotId]) {
      setSelectedTab(spotId);
      setActiveSpot(spotId);
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch products for this location from mapping
        const mappingResponse = await fetch(
          `${backendServer}/api/location-mappings/products?locationId=${spotId}&floorPlanId=${selectedPlan.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const mappingData = await mappingResponse.json();
        
        if (mappingData.products && mappingData.products.length > 0) {
          // Get detailed product info including variants for each product
          const productDetailsPromises = mappingData.products.map(async (product) => {
            try {
              // Fetch variants for each product
              const variantsResponse = await fetch(
                `${backendServer}/api/products/${product._id}/variants`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              const variantsData = await variantsResponse.json();
              
              // Combine basic product info with its variants
              return {
                ...product,
                variants: variantsData.variants
              };
            } catch (error) {
              console.error(`Error fetching variants for product ${product._id}:`, error);
              return null;
            }
          });
  
          const productDetails = await Promise.all(productDetailsPromises);
          const validProducts = productDetails.filter(p => p !== null);
          setAvailableProducts(validProducts);
        } else {
          setAvailableProducts([]);
        }
      } catch (error) {
        console.error('Error fetching available products:', error);
        setAvailableProducts([]);
      }
    }
  };

  const handleCustomize = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/${product._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const fullProductData = await response.json();
      console.log('Full product data:', fullProductData); // Debug log
      setCurrentProduct(fullProductData);
    } catch (error) {
      console.error('Error fetching complete product data:', error);
      setCurrentProduct(product);
    }
  };

  const handleAddProduct = (productWithOptions) => {
    if (selectedTab && !occupiedSpots[selectedTab]) {
      const newProduct = {
        ...productWithOptions,
        spotId: selectedTab,
        spotName: furnitureSpots[selectedTab]?.label || 'Unknown',
        coordinates: furnitureSpots[selectedTab]?.dimensions || {}
      };

      const updatedOccupiedSpots = {
        ...occupiedSpots,
        [selectedTab]: productWithOptions.id
      };

      const updatedProducts = [...selectedProducts, newProduct];

      setOccupiedSpots(updatedOccupiedSpots);
      setSelectedProducts(updatedProducts);
      
      // Save immediately to localStorage
      localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
      localStorage.setItem('occupiedSpots', JSON.stringify(updatedOccupiedSpots));
      
      setCurrentProduct(null);
      setSelectedTab(null);
      setActiveSpot(null);
    }
  };

  // In AreaCustomization.jsx, modify handleRemoveProduct:
  const handleRemoveProduct = async (index) => {
    const productToRemove = selectedProducts[index];
    const updatedOccupiedSpots = {
      ...occupiedSpots,
      [productToRemove.spotId]: null
    };
    
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    
    // Update local state
    setOccupiedSpots(updatedOccupiedSpots);
    setSelectedProducts(updatedProducts);
    
    // Update localStorage
    localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
    localStorage.setItem('occupiedSpots', JSON.stringify(updatedOccupiedSpots));
    
    // Call onComplete with updated data
    onComplete({
      selectedProducts: updatedProducts,
      totalPrice: updatedProducts.reduce((sum, p) => sum + p.finalPrice, 0),
      spotSelections: updatedOccupiedSpots,
      floorPlanId: selectedPlan.id
    });
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Save state before component unmounts
      if (selectedProducts.length > 0) {
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        localStorage.setItem('occupiedSpots', JSON.stringify(occupiedSpots));
      }
    };
  }, [selectedProducts, occupiedSpots]);

  const CustomizationModal = ({ product, onClose, onAdd }) => {
    const [selectedOptions, setSelectedOptions] = useState({
      finish: '',
      fabric: ''
    });
  
    // Helper function to get variant image
    const getVariantImage = () => {
      // Get the selected variant based on options
      const selectedVariant = product.variants.find(variant => 
        variant.fabric === selectedOptions.fabric && 
        variant.finish === selectedOptions.finish
      );
    
      // Return image URL from selected variant if it exists
      if (selectedVariant?.image?.url) {
        return selectedVariant.image.url;
      }
    
      // If no selected variant image, try first variant
      if (product.variants[0]?.image?.url) {
        return product.variants[0].image.url;
      }
    
      return null;
    };
  
    const getVariantPrice = () => {
      const selectedVariant = product.variants.find(variant => 
        variant.fabric === selectedOptions.fabric && 
        variant.finish === selectedOptions.finish
      );
      return selectedVariant ? selectedVariant.price : product.basePrice;
    };
  
    const image = getVariantImage();

    const hasFinishOptions = product.variants.some(v => v.finish);
    const hasFabricOptions = product.variants.some(v => v.fabric);
  
    // Modified validation check
    const isValid = () => {
      if (hasFinishOptions && hasFabricOptions) {
        // Both attributes are available, require both
        return selectedOptions.finish && selectedOptions.fabric;
      } else if (hasFinishOptions) {
        // Only finish is available
        return selectedOptions.finish;
      } else if (hasFabricOptions) {
        // Only fabric is available
        return selectedOptions.fabric;
      }
      // No attributes required
      return true;
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{product.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
  
          {/* Display image */}
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.png'; // Add fallback image
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-6">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
  
          <div className="space-y-6 mb-6">
            {/* Finish options */}
            {hasFinishOptions && (
              <div>
                <h4 className="font-semibold mb-2">Finish</h4>
                <div className="flex gap-2">
                  {[...new Set(product.variants.map(v => v.finish).filter(Boolean))].map(finish => (
                    <button
                      key={finish}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, finish }))}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedOptions.finish === finish
                          ? 'border-[#005670] bg-[#005670]/10'
                          : 'border-gray-200 hover:border-[#005670]'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            )}
  
            {/* Fabric options */}
            {hasFabricOptions && (
              <div>
                <h4 className="font-semibold mb-2">Fabric</h4>
                <div className="flex gap-2">
                  {[...new Set(product.variants.map(v => v.fabric).filter(Boolean))].map(fabric => (
                    <button
                      key={fabric}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, fabric }))}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedOptions.fabric === fabric
                          ? 'border-[#005670] bg-[#005670]/10'
                          : 'border-gray-200 hover:border-[#005670]'
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>
            )}
  
            <div className="text-xl font-bold">
              Total Price: ${getVariantPrice()}
            </div>
          </div>
  
          <button
            onClick={() => {
              onAdd({
                ...product,
                selectedOptions,
                finalPrice: getVariantPrice()
              });
            }}
            disabled={!isValid()}
            className={`w-full py-2 rounded-lg ${
              !isValid()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#005670] text-white hover:bg-opacity-90'
            }`}
          >
            Add to Space
          </button>
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
          <div className="relative w-full h-[600px] border border-gray-200 rounded-lg">
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
                    fill={activeSpot === spot.id ? "rgba(0,86,112,0.2)" : "transparent"}
                    stroke={activeSpot === spot.id ? "#005670" : "#ccc"}
                    strokeWidth="2"
                    cursor={occupiedSpots[spot.id] ? "not-allowed" : "pointer"}
                    onClick={() => handleSpotClick(spot.id)}
                  />
                  {occupiedSpots[spot.id] ? (
                    <text
                      x={spot.center.x}
                      y={spot.center.y}
                      textAnchor="middle"
                      fill="#005670"
                      className="text-sm"
                    >
                      ✓
                    </text>
                  ) : (
                    <text
                      x={spot.center.x}
                      y={spot.center.y}
                      textAnchor="middle"
                      fill="#666"
                      className="text-xs"
                    >
                      {spot.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Product Selection and Cart */}
        <div className="grid grid-cols-3 gap-6">
          {/* Available Products */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Available Products</h3>
            {selectedTab && availableProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {availableProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border"
                  >
                    {product.variants[0]?.image?.url ? (
                      <img
                        src={product.variants[0].image.url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png'; // Add a fallback image
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.product_id}
                      </p>
                      <p className="text-gray-600">
                        Starting at ${product.basePrice}
                      </p>
                      <button
                        onClick={() => handleCustomize(product)}
                        className="w-full mt-4 py-2 text-white rounded-lg bg-[#005670] hover:bg-opacity-90"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="text-center py-12 text-gray-500">
              {selectedTab ? 'No products available for this location' : 'Click on a furniture spot in the floor plan to view available products'}
            </div>
          )}
          </div>

          {/* Selected Products */}
          <div className="col-span-1 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Selected Products</h3>
            {selectedProducts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-2">No products selected yet</p>
                  <p className="text-sm text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Please select at least one product to proceed
                  </p>
                </div>
              ) : (
              <div className="space-y-4">
                {selectedProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div className="flex gap-4">
                      <img
                        src={
                          product.variants.find(v => 
                            v.fabric === product.selectedOptions.fabric && 
                            v.finish === product.selectedOptions.finish
                          )?.image?.url || 
                          product.variants[0]?.image?.url ||
                          '/placeholder-image.png'
                        }
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.spotName}</p>
                        {(product.selectedOptions?.finish || product.selectedOptions?.fabric) && (
                          <p className="text-sm text-gray-600">
                            {product.selectedOptions.finish && `Finish: ${product.selectedOptions.finish}`}
                            {product.selectedOptions.finish && product.selectedOptions.fabric && ' - '}
                            {product.selectedOptions.fabric && `Fabric: ${product.selectedOptions.fabric}`}
                          </p>
                        )}
                        <p className="text-gray-600">${product.finalPrice}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      ${selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentProduct && (
        <CustomizationModal
          product={currentProduct}
          onClose={() => {
            setCurrentProduct(null);
            setSelectedTab(null);
            setActiveSpot(null);
          }}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
};

export default AreaCustomization;