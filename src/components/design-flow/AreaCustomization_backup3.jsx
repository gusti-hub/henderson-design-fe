import React, { useState } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { backendServer } from '../../utils/info';

const AreaCustomization = ({ selectedPlan, floorPlanImage, onComplete }) => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [occupiedAreas, setOccupiedAreas] = useState({
    livingRoom: null,
    primaryBedroom: null,
    bedroom2: null,
    kitchen: null,
    pantry: null,
    primaryCloset: null,
    walkInCloset: null,
    primaryBath: null,
    bath2: null,
    den: null
  });

  const tabs = [
    { id: 'livingRoom', label: 'Living/Dining' },
    { id: 'primaryBedroom', label: 'Primary Bedroom' },
    { id: 'bedroom2', label: 'Bedroom 2' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'pantry', label: 'Pantry/Laundry' },
    { id: 'primaryCloset', label: 'Primary Walk-in Closet' },
    { id: 'walkInCloset', label: 'Walk-in Closet' },
    { id: 'primaryBath', label: 'Primary Bath' },
    { id: 'bath2', label: 'Bath 2' },
    { id: 'den', label: 'Den' }
  ];

  // Product catalog
  const catalog = {
    livingRoom: {
      areaName: 'Living/Dining',
      products: [
        {
          id: 'sofa',
          name: 'Modern Sofa',
          basePrice: 1200,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Gray', 'Beige'],
            materials: ['Fabric', 'Leather']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Gray: { price: 50 },
              Beige: { price: 100 }
            },
            materials: {
              Fabric: { price: 0 },
              Leather: { price: 300 }
            }
          }
        },
        {
          id: 'diningTable',
          name: 'Dining Table Set',
          basePrice: 1500,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Gray', 'Beige'],
            materials: ['Fabric', 'Leather']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Gray: { price: 50 },
              Beige: { price: 100 }
            },
            materials: {
              Fabric: { price: 0 },
              Leather: { price: 300 }
            }
          }
        }
      ]
    },
    primaryBedroom: {
      areaName: 'Primary Bedroom',
      products: [
        {
          id: 'kingBed',
          name: 'King Bed Frame',
          basePrice: 1000,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Gray', 'Beige'],
            materials: ['Fabric', 'Leather']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Gray: { price: 50 },
              Beige: { price: 100 }
            },
            materials: {
              Fabric: { price: 0 },
              Leather: { price: 300 }
            }
          }
        }
      ]
    },
    bedroom2: {
      areaName: 'Bedroom 2',
      products: [
        {
          id: 'queenBed',
          name: 'Queen Bed Frame',
          basePrice: 800,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Gray', 'Beige'],
            materials: ['Fabric', 'Leather']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Gray: { price: 50 },
              Beige: { price: 100 }
            },
            materials: {
              Fabric: { price: 0 },
              Leather: { price: 300 }
            }
          }
        }
      ]
    },
    // Add similar structure for other areas
  };

  const isAreaOccupied = (areaKey) => {
    return Boolean(occupiedAreas[areaKey]);
  };

  const handleCustomize = (product) => {
    setCurrentProduct(product);
  };

  const handleAddProduct = (productWithOptions) => {
    if (selectedTab && !isAreaOccupied(selectedTab)) {
      const newProduct = {
        ...productWithOptions,
        areaKey: selectedTab
      };

      // setOccupiedAreas(prev => ({
      //   ...prev,
      //   [selectedTab]: productWithOptions.id
      // }));

      setSelectedProducts(prev => [...prev, newProduct]);
      setCurrentProduct(null);
    }
  };

  const handleRemoveProduct = (index) => {
    const productToRemove = selectedProducts[index];
    setOccupiedAreas(prev => ({
      ...prev,
      [productToRemove.areaKey]: null
    }));
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
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
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {/* Floor Plan View with Background Image */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-light mb-4" style={{ color: '#005670' }}>
              Floor Plan View
            </h2>
            <div className="relative w-full h-[400px] border border-gray-200 rounded-lg">
            <svg width="100%" height="100%" viewBox={`0 0 ${planDimensions.width} ${planDimensions.height}`}>
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
                      className={`
                        transition-colors duration-200
                        ${occupiedSpots[spot.id] ? "fill-green-100 stroke-green-600" : 
                          activeSpot === spot.id ? "fill-blue-100 stroke-blue-600" :
                          "fill-yellow-50 stroke-yellow-400 hover:fill-yellow-100"}
                      `}
                      cursor="pointer"
                      onClick={() => handleSpotClick(spot.id)}
                    />
                    <text
                      x={spot.labelPosition.x}
                      y={spot.labelPosition.y - 15}
                      textAnchor="middle"
                      className="text-sm fill-gray-600"
                    >
                      {occupiedSpots[spot.id] ? "✓" : spot.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap">
                {tabs.map((tab) => {
                  const isOccupied = isAreaOccupied(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`
                        px-6 py-3 text-sm font-medium
                        ${selectedTab === tab.id ? 'border-b-2 border-[#005670] text-[#005670]' : 'text-gray-500'}
                        ${isOccupied ? 'bg-green-50 cursor-not-allowed' : 'hover:text-[#005670]'}
                      `}
                    >
                      {tab.label}
                      {isOccupied && (
                        <span className="ml-2 text-xs text-green-600">(Selected)</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Product Grid */}
            <div className="p-6">
              {selectedTab ? (
                !isAreaOccupied(selectedTab) ? (
                  <div className="grid grid-cols-2 gap-6">
                    {catalog[selectedTab].products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden border"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <p className="text-gray-600">Starting at ${product.basePrice}</p>
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
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-yellow-500" />
                      <p className="text-yellow-700">
                        You have already selected furniture for this area. Remove the existing item to select a new one.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select an area above to view available furniture options
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Products Panel */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
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
          onClose={() => setCurrentProduct(null)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
};

export default AreaCustomization;