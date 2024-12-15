import React, { useState } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { backendServer } from '../../utils/info';

const AreaCustomization = ({ selectedPlan, floorPlanImage, onComplete }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [occupiedAreas, setOccupiedAreas] = useState({
    bedArea: null,
    wardrobeArea: null,
    bedsideTable: null
  });

  // Product catalog
  const catalog = {
    bedArea: {
      areaName: 'Bed Area',
      products: [
        {
          id: 'queen-bed',
          name: 'Queen Bed Frame',
          basePrice: 800,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Brown', 'Black'],
            materials: ['Wood', 'Metal', 'Upholstered']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Brown: { price: 50 },
              Black: { price: 100 }
            },
            materials: {
              Wood: { price: 0 },
              Metal: { price: 200 },
              Upholstered: { price: 300 }
            }
          }
        },
        {
          id: 'king-bed',
          name: 'King Bed Frame',
          basePrice: 1000,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Brown', 'Black'],
            materials: ['Wood', 'Metal', 'Upholstered']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Brown: { price: 75 },
              Black: { price: 150 }
            },
            materials: {
              Wood: { price: 0 },
              Metal: { price: 250 },
              Upholstered: { price: 400 }
            }
          }
        }
      ]
    },
    wardrobeArea: {
      areaName: 'Wardrobe Area',
      products: [
        {
          id: 'wardrobe',
          name: 'Wardrobe',
          basePrice: 1500,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Brown', 'Black'],
            materials: ['Wood', 'Metal']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Brown: { price: 100 },
              Black: { price: 100 }
            },
            materials: {
              Wood: { price: 0 },
              Metal: { price: 200 }
            }
          }
        }
      ]
    },
    bedsideTable: {
      areaName: 'Bedside Table Area',
      products: [
        {
          id: 'bedside-table',
          name: 'Bedside Table',
          basePrice: 250,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Brown', 'Black'],
            materials: ['Wood', 'Metal']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Brown: { price: 25 },
              Black: { price: 25 }
            },
            materials: {
              Wood: { price: 0 },
              Metal: { price: 50 }
            }
          }
        }
      ]
    }
  };

  const positions = {
    bedArea: { x: 100, y: 100, width: 200, height: 150, label: "Bed Area" },
    wardrobeArea: { x: 400, y: 100, width: 150, height: 200, label: "Wardrobe Area" },
    bedsideTable: { x: 100, y: 300, width: 100, height: 100, label: "Bedside Table" }
  };

  const isAreaOccupied = (areaKey) => {
    return occupiedAreas[areaKey] !== null;
  };

  const handleAreaClick = (areaKey) => {
    if (!isAreaOccupied(areaKey)) {
      setSelectedArea(areaKey);
    }
  };

  const handleCustomize = (product) => {
    setCurrentProduct(product);
  };

  const handleAddProduct = (productWithOptions) => {
    if (selectedArea && !isAreaOccupied(selectedArea)) {
      const newProduct = {
        ...productWithOptions,
        areaKey: selectedArea
      };

      setOccupiedAreas(prev => ({
        ...prev,
        [selectedArea]: productWithOptions.id
      }));

      setSelectedProducts(prev => [...prev, newProduct]);
      setCurrentProduct(null);
      setSelectedArea(null);
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

  const handleComplete = () => {
    onComplete && onComplete({
      products: selectedProducts,
      totalPrice: selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0)
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
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {/* Floor Plan */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-light mb-4" style={{ color: '#005670' }}>
              Floor Plan View
            </h2>
            <div className="relative w-full h-[400px] border border-gray-200 rounded-lg">
              <svg width="100%" height="100%" viewBox="0 0 800 600">
                {/* Background Floor Plan Image */}
                {selectedPlan?.image && (
                  <image
                    href={selectedPlan.image}
                    width="800"
                    height="600"
                    opacity="1"
                    preserveAspectRatio="xMidYMid meet"
                  />
                )}
                
                {/* Room outline */}
                <rect 
                  x="50" 
                  y="50" 
                  width="700" 
                  height="500" 
                  fill="none" 
                  stroke="#005670" 
                  strokeWidth="2" 
                />

                {/* Interactive Areas */}
                {Object.entries(positions).map(([area, pos]) => {
                  const isOccupied = isAreaOccupied(area);
                  const product = selectedProducts.find(p => p.areaKey === area);
                  
                  return (
                    <g key={area} onClick={() => handleAreaClick(area)}>
                      <rect
                        x={pos.x}
                        y={pos.y}
                        width={pos.width}
                        height={pos.height}
                        className={`
                          ${isOccupied 
                            ? 'fill-green-100/70 stroke-green-500'
                            : selectedArea === area
                              ? 'fill-blue-100/70 stroke-blue-500'
                              : 'fill-gray-100/70 stroke-gray-300 hover:fill-blue-50/70'
                          } 
                          cursor-pointer transition-colors
                        `}
                        strokeWidth="2"
                      />
                      <text
                        x={pos.x + pos.width/2}
                        y={pos.y + pos.height/2}
                        textAnchor="middle"
                        className="text-sm fill-gray-600 pointer-events-none"
                      >
                        {isOccupied ? product?.name : pos.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Product Grid */}
          {selectedArea && (
            <div className="grid grid-cols-2 gap-6">
              {!isAreaOccupied(selectedArea) ? (
                catalog[selectedArea].products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
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
                ))
              ) : (
                <div className="col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-yellow-500" />
                    <p className="text-yellow-700">
                      This area already has furniture placed. Remove the existing furniture to place a new one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
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