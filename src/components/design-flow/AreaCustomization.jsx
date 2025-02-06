import React, { useState, useMemo, useEffect } from 'react';
import { X, Trash2, AlertCircle, Loader } from 'lucide-react';
import { generateFurnitureAreas, getPlanDimensions } from './floorPlanConfig';
import { backendServer } from '../../utils/info';

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
      'Blue - Lounge Chair': { type: 'Blue', previewUrl: '/images/fabrics/Blue Lounge Chair.png' }
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
            // Clear localStorage if no products in order
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
            // Clear all if any is missing
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
              console.log(parsedProducts);
              setSelectedProducts(parsedProducts);
              setOccupiedSpots(parsedSpots);
            } else {
              // Clear all if products array is empty
              localStorage.removeItem('selectedProducts');
              localStorage.removeItem('occupiedSpots');
              localStorage.removeItem('designSelections');
              setSelectedProducts([]);
              setOccupiedSpots({});
            }
          } catch (parseError) {
            console.error('Error parsing saved data:', parseError);
            // Clear invalid data
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
  const planDimensions = useMemo(() => {
    try {
      return getPlanDimensions(selectedPlan.id);
    } catch (error) {
      console.error('Error getting plan dimensions:', error);
      return { width: 1000, height: 800 }; // Fallback dimensions
    }
  }, [selectedPlan.id]);

  // const arrayBufferToBase64 = (buffer) => {
  //   let binary = '';
  //   const bytes = new Uint8Array(buffer);
  //   for (let i = 0; i < bytes.length; i++) {
  //     binary += String.fromCharCode(bytes[i]);
  //   }
  //   return window.btoa(binary);
  // };
  
  const furnitureSpots = useMemo(() => {
    try {
      return generateFurnitureAreas(selectedPlan.id);
    } catch (error) {
      console.error('Error generating furniture areas:', error);
      return {}; // Return empty object if there's an error
    }
  }, [selectedPlan.id]);

  const unselectedSpots = Object.values(furnitureSpots).filter(
    spot => !occupiedSpots[spot.id]
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

     // Check if order exists
     if (!existingOrder) {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Create initial order
      const orderData = {
        selectedPlan,
        clientInfo: clientInfo, // Use the passed clientInfo
        selectedProducts: [],
        occupiedSpots: {},
        step: 2,
        status: 'ongoing'
      };

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
    }

    // First check if spot exists in occupiedSpots and has a value
    if (Object.keys(occupiedSpots).includes(spotId) && occupiedSpots[spotId] !== null) {
      const occupyingProduct = selectedProducts.find(p => p.spotId === spotId);
      if (occupyingProduct) {
        alert(`This space is already occupied by: ${occupyingProduct.name}. Please remove it first if you want to place a different item.`);
      }
      return; // Exit early if spot is occupied
    }
  
    try {
      setSelectedTab(spotId);
      setActiveSpot(spotId);
      setIsLoading(true);
      setAvailableProducts([]); // Clear previous products while loading
      
      const token = localStorage.getItem('token');
      
      // Fetch products for this location from mapping
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
            
            return {
              ...product,
              variants: variantsData.variants
            };
          } catch (error) {
            console.error(`Error fetching variants for product ${product._id}:`, error);
            return null;
          }
        });
  
        // Check again if spot became occupied during API call
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
      console.log('Full product data with variants:', fullProductData); // Debug log
      
      // Ensure variants are properly included
      if (!fullProductData.variants || fullProductData.variants.length === 0) {
        console.warn('No variants found for product:', fullProductData);
        // Use original product variants if API response doesn't include them
        fullProductData.variants = product.variants;
      }
      
      setCurrentProduct(fullProductData);
    } catch (error) {
      console.error('Error fetching complete product data:', error);
      // Fallback to original product data if API fails
      setCurrentProduct(product);
    }
  };

  const handleAddProduct = async (productWithOptions) => {
    
    if (selectedTab && !occupiedSpots[selectedTab]) {
      const currentSpot = Object.values(furnitureSpots).find(spot => 
        spot.id === selectedTab || spot.label === selectedTab
      );
  
      // Find the selected variant based on options
      const selectedVariant = productWithOptions.variants.find(variant => 
        variant.fabric === productWithOptions.selectedOptions?.fabric && 
        variant.finish === productWithOptions.selectedOptions?.finish
      );

      const unitPrice = productWithOptions.finalPrice || productWithOptions.basePrice;
      const quantity = productWithOptions.selectedOptions?.quantity || 1;

      // Create streamlined product object
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
          image: selectedVariant?.image?.url || productWithOptions.variants[0]?.image?.url || ''
        }
      };
  
      const updatedOccupiedSpots = {
        ...occupiedSpots,
        [selectedTab]: productWithOptions._id
      };
  
      const updatedProducts = [...selectedProducts, newProduct];
  
      // Update all states
      setOccupiedSpots(updatedOccupiedSpots);
      setSelectedProducts(updatedProducts);
      setCurrentProduct(null);
      setSelectedTab(null);
      setActiveSpot(null);
      setAvailableProducts([]);
  
      // Update localStorage
      localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
      localStorage.setItem('occupiedSpots', JSON.stringify(updatedOccupiedSpots));
      
      // Save to server immediately
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found');
          return;
        }
  
        // First, try to get existing order if we don't have it yet
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
  
        // Always use PUT to update the existing order or create a new one
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
        setExistingOrder(savedOrder); // Update existingOrder reference
        checkExistingOrder();
  
      } catch (error) {
        console.error('Error saving product selection:', error);
        alert('There was an error saving your selection. Please try again.');
      }
    }
  };

  // In AreaCustomization.jsx, modify handleRemoveProduct:
  const handleRemoveProduct = async (index) => {
    try {
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
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      
      if (updatedProducts.length > 0) {
        localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
        localStorage.setItem('occupiedSpots', JSON.stringify(updatedOccupiedSpots));
      }
  
      // Update server
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
      
      // Call onComplete with updated data
      onComplete({
        selectedProducts: updatedProducts,
        totalPrice: updatedProducts.reduce((sum, p) => sum + p.finalPrice, 0),
        spotSelections: updatedOccupiedSpots,
        floorPlanId: selectedPlan.id
      });
  
      // Clear designSelections in localStorage if no products remain
      if (updatedProducts.length === 0) {
        localStorage.removeItem('designSelections');
      }

      checkExistingOrder();
  
    } catch (error) {
      console.error('Error removing product:', error);
      alert('There was an error removing the product. Please try again.');
    }
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

  const CustomizationModal = ({ product, onClose, onAdd, currentSpot  }) => {
    // Get unique finishes and fabrics
    const uniqueFinishes = [...new Set(product.variants.map(v => v.finish).filter(Boolean))];
    const uniqueFabrics = [...new Set(product.variants.map(v => v.fabric).filter(Boolean))];
  
    // Initialize state with fixed quantity if specified
    const [selectedOptions, setSelectedOptions] = useState({
      finish: uniqueFinishes.length === 1 ? uniqueFinishes[0] : '',
      fabric: uniqueFabrics.length === 1 ? uniqueFabrics[0] : '',
      quantity: currentSpot?.quantity?.fixed ?? (currentSpot?.quantity?.enabled ? currentSpot.quantity.min : 1),
      useAdditional: false,
      additionalQuantity: 0
    });
  
    const [modalImageLoading, setModalImageLoading] = useState(true);

    const getSelectedVariant = () => {
      return product.variants.find(variant => 
        variant.fabric === selectedOptions.fabric && 
        variant.finish === selectedOptions.finish
      );
    };

    const handleAdd = () => {
      const selectedVariant = getSelectedVariant();
  
      onAdd({
        ...product,
        selectedOptions: {
          ...selectedOptions,
          image: selectedVariant?.image?.url || product.variants[0]?.image?.url || '',
          quantity: selectedOptions.quantity + ((selectedOptions.useAdditional ? selectedOptions.additionalQuantity : 0 ))
        },
        finalPrice: getVariantPrice(),
      });
    };
  
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
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{product.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
    
          {/* Display image */}
          {modalImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader className="w-12 h-12 text-[#005670] animate-spin" />
            </div>
          )}
          {image ? (
            <div className="relative w-full h-[500px] mb-6 flex items-center justify-center bg-white">
              <img
                src={image}
                alt={product.name}
                className={`max-w-full max-h-full h-auto w-auto object-contain rounded-lg transition-opacity duration-300 ${
                  modalImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setModalImageLoading(false)}
                onError={(e) => {
                  setModalImageLoading(false);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-lg mb-6">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
    
          <div className="space-y-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <textarea
                readOnly
                value={product.description || 'No description available.'}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005670]/20 resize-none overflow-y-auto max-h-56 bg-gray-50 text-gray-600"
                rows={6} // Adjust the number of rows to show the desired default height
              />
            </div>
          </div>
    
          <div className="space-y-6 mb-6">
            {/* Finish options */}
            {uniqueFinishes.length > 1 && (
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
    
            {/* Fabric options */}
            {uniqueFabrics.length > 1 && (
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
    
          {/* Quantity field - only show if enabled */}
          {currentSpot?.quantity?.enabled && (
          <div>
            <div className="space-y-4">
              {/* Fixed Quantity Section */}
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
                  {/* Regular Quantity Section */}
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

          {/* Additional Quantity Section */}
          {currentSpot.quantity.additional?.enabled && (
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

          <div className="text-xl font-bold">
            {/* Total Price: ${(getVariantPrice() * ((selectedOptions.quantity || 1) + (selectedOptions.useAdditional ? selectedOptions.additionalQuantity : 0 ))).toFixed(2)} */}
          </div>
          </div>
    
          <button
            onClick={handleAdd}
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
                    transform={spot.transform}  // Added this line
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
                        y={spot.labelPosition.y - 10} // Offset y position for the checkmark
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
                        y={spot.labelPosition.y + 10} // Offset y position for "Occupied" text
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
                      {/* {spot.label} */}
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

        {/* Product Selection and Cart */}
        <div className="grid grid-cols-3 gap-6">
          {/* Available Products */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Available Products</h3>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-6">
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : selectedTab && availableProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {availableProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border"
                  >
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Loader className="w-8 h-8 text-[#005670] animate-spin" />
                      </div>
                    )}
                    {product.variants[0]?.image?.url ? (
                      <div className="relative w-full h-48">
                        <img
                          src={product.variants[0].image.url}
                          alt={product.name}
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                          onLoad={() => setImageLoading(false)}
                          onError={(e) => {
                            setImageLoading(false);
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
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
                        {/* Starting at ${product.basePrice} */}
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
                    Please select product to proceed
                  </p>
                </div>
              ) : (
              <div className="space-y-4">
                {selectedProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div className="flex gap-4">
                    <img
                        src={
                          product.selectedOptions?.image || '/placeholder-image.png'  // Just use the saved image URL
                        }
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                      <div>
                        <h4 className="font-semibold">
                          {product.name} 
                          {product.quantity > 1 && (
                            <span className="ml-2 text-sm text-gray-600">
                              (x{product.quantity})
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">{product.spotName}</p>
                        {(product.selectedOptions?.finish || product.selectedOptions?.fabric) && (
                          <p className="text-sm text-gray-600">
                            {product.selectedOptions.finish && `Finish: ${product.selectedOptions.finish}`}
                            {product.selectedOptions.finish && product.selectedOptions.fabric && ' - '}
                            {product.selectedOptions.fabric && `Fabric: ${product.selectedOptions.fabric}`}
                          </p>
                        )}
                      <p className="text-gray-600">
                        {/* ${product.unitPrice} each × {product.quantity} = ${product.finalPrice} */}
                      </p>
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
                {/* <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {/* ${selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0)} *
                    </span>
                  </div>
                </div> */}
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
    </div>
  );
};

export default AreaCustomization;