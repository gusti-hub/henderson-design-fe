import React, { useState, useMemo, useEffect } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { generateFurnitureAreas, getPlanDimensions } from './floorPlanConfig';

const AreaCustomization = ({ selectedPlan, floorPlanImage, onComplete }) => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeSpot, setActiveSpot] = useState(null);
  const [occupiedSpots, setOccupiedSpots] = useState({});

  // Get dimensions and furniture spots for the selected plan
  const planDimensions = useMemo(() => 
    getPlanDimensions(selectedPlan.id), [selectedPlan]
  );
  
  const furnitureSpots = useMemo(() => 
    generateFurnitureAreas(selectedPlan.id), [selectedPlan]
  );

  // Update parent component when products change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const totalPrice = selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0);
      onComplete({
        selectedProducts,
        totalPrice,
        spotSelections: occupiedSpots,
        floorPlanId: selectedPlan.id
      });
    }
  }, [selectedProducts]);

  const handleSpotClick = (spotId) => {
    console.log(spotId);
    if (!occupiedSpots[spotId]) {
      setSelectedTab(spotId);
      setActiveSpot(spotId);
    }
  };

  const handleCustomize = (product) => {
    setCurrentProduct(product);
  };

  const handleAddProduct = (productWithOptions) => {
    if (selectedTab && !occupiedSpots[selectedTab]) {
      const newProduct = {
        ...productWithOptions,
        spotId: selectedTab,
        spotName: furnitureSpots[selectedTab]?.label || 'Unknown',
        coordinates: furnitureSpots[selectedTab]?.dimensions || {}
      };

      setOccupiedSpots(prev => ({
        ...prev,
        [selectedTab]: productWithOptions.id
      }));

      setSelectedProducts(prev => {
        const updatedProducts = [...prev, newProduct];
        return updatedProducts;
      });
      
      setCurrentProduct(null);
      setSelectedTab(null);
      setActiveSpot(null);
    }
  };

  const handleRemoveProduct = (index) => {
    const productToRemove = selectedProducts[index];
    setOccupiedSpots(prev => ({
      ...prev,
      [productToRemove.spotId]: null
    }));
    setSelectedProducts(prev => {
      const updatedProducts = prev.filter((_, i) => i !== index);
      return updatedProducts;
    });
  };

  const CustomizationModal = ({ product, onClose, onAdd }) => {
    const [selectedOptions, setSelectedOptions] = useState({
      color: '',
      material: ''
    });

    const calculateTotalPrice = () => {
      if (!selectedOptions.color || !selectedOptions.material) return product.basePrice;
      
      const colorPrice = product.prices.colors[selectedOptions.color].price;
      const materialPrice = product.prices.materials[selectedOptions.material].price;
      return product.basePrice + colorPrice + materialPrice;
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

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <div className="space-y-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Color</h4>
              <div className="flex gap-2">
                {product.options.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, color }))}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedOptions.color === color
                        ? 'border-[#005670] bg-[#005670]/10'
                        : 'border-gray-200 hover:border-[#005670]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Material</h4>
              <div className="flex gap-2">
                {product.options.materials.map(material => (
                  <button
                    key={material}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, material }))}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedOptions.material === material
                        ? 'border-[#005670] bg-[#005670]/10'
                        : 'border-gray-200 hover:border-[#005670]'
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xl font-bold">
              Total Price: ${calculateTotalPrice()}
            </div>
          </div>

          <button
            onClick={() => {
              onAdd({
                ...product,
                selectedOptions,
                finalPrice: calculateTotalPrice()
              });
            }}
            disabled={!selectedOptions.color || !selectedOptions.material}
            className={`w-full py-2 rounded-lg ${
              !selectedOptions.color || !selectedOptions.material
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
            {selectedTab && furnitureSpots[selectedTab]?.product && (
              <div className="grid grid-cols-2 gap-6">
                <div
                  className="bg-white rounded-lg shadow-sm overflow-hidden border"
                >
                  <img
                    src={furnitureSpots[selectedTab].product.image}
                    alt={furnitureSpots[selectedTab].product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">
                      {furnitureSpots[selectedTab].product.name}
                    </h3>
                    <p className="text-gray-600">
                      Starting at ${furnitureSpots[selectedTab].product.basePrice}
                    </p>
                    <button
                      onClick={() => handleCustomize(furnitureSpots[selectedTab].product)}
                      className="w-full mt-4 py-2 text-white rounded-lg bg-[#005670] hover:bg-opacity-90"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!selectedTab && (
              <div className="text-center py-12 text-gray-500">
                Click on a furniture spot in the floor plan to view available products
              </div>
            )}
          </div>

          {/* Selected Products */}
          <div className="col-span-1 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6">Selected Products</h3>
            {selectedProducts.length === 0 ? (
              <p className="text-gray-500">No products selected yet</p>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.spotName}</p>
                        <p className="text-sm text-gray-600">
                          {product.selectedOptions.color} - {product.selectedOptions.material}
                        </p>
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