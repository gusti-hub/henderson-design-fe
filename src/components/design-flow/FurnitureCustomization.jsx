import React, { useState } from 'react';
import { Check, Image, ArrowLeft, ArrowRight } from 'lucide-react';

const FurnitureCustomization = ({ selectedArea }) => {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [activePreview, setActivePreview] = useState(0);

  // Define furniture options based on area
  const furnitureOptions = {
    'cuisine': [
      {
        id: 'dining-table',
        type: 'Dining Table',
        options: {
          materials: ['Wood', 'Marble', 'Glass'],
          colors: ['Natural Oak', 'White', 'Black'],
          styles: ['Modern', 'Classic', 'Industrial']
        }
      },
      {
        id: 'dining-chairs',
        type: 'Dining Chairs',
        options: {
          materials: ['Wood', 'Metal', 'Upholstered'],
          colors: ['Natural', 'White', 'Gray', 'Black'],
          styles: ['Modern', 'Classic', 'Industrial']
        }
      }
    ],
    'meeting1': [
      {
        id: 'conference-table',
        type: 'Conference Table',
        options: {
          materials: ['Wood', 'Glass'],
          colors: ['Natural Oak', 'White', 'Black'],
          styles: ['Modern', 'Executive']
        }
      },
      {
        id: 'office-chairs',
        type: 'Office Chairs',
        options: {
          materials: ['Mesh', 'Leather', 'Fabric'],
          colors: ['Black', 'Gray', 'Navy'],
          styles: ['Ergonomic', 'Executive']
        }
      }
    ],
    'open-space': [
      {
        id: 'workstations',
        type: 'Workstations',
        options: {
          materials: ['Wood', 'Metal', 'Laminate'],
          colors: ['White', 'Gray', 'Natural'],
          styles: ['Modern', 'Minimalist']
        }
      },
      {
        id: 'task-chairs',
        type: 'Task Chairs',
        options: {
          materials: ['Mesh', 'Fabric'],
          colors: ['Black', 'Gray', 'Blue'],
          styles: ['Ergonomic', 'Basic']
        }
      }
    ]
  };

  // Get furniture options for selected area
  const furniture = furnitureOptions[selectedArea] || [];

  // Example previews for different combinations
  const previews = [
    '/api/placeholder/800/400',
    '/api/placeholder/800/400',
    '/api/placeholder/800/400'
  ];

  const handleCustomization = (furnitureId, type, value) => {
    setCustomizations(prev => ({
      ...prev,
      [furnitureId]: {
        ...prev[furnitureId],
        [type]: value
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-3 gap-8">
        {/* Left: Furniture List & Customization */}
        <div>
          <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
            Customize {selectedArea ? selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1) : ''} Furniture
          </h2>
          
          <div className="space-y-6">
            {furniture.map((item) => (
              <div 
                key={item.id}
                className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer
                  ${selectedFurniture?.id === item.id ? 'ring-2 ring-[#005670]' : ''}`}
                onClick={() => setSelectedFurniture(item)}
              >
                <h3 className="font-medium mb-4 flex items-center justify-between">
                  {item.type}
                  {selectedFurniture?.id === item.id && (
                    <Check className="w-5 h-5 text-[#005670]" />
                  )}
                </h3>

                {selectedFurniture?.id === item.id && (
                  <div className="space-y-4">
                    {/* Material Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Material</label>
                      <div className="flex flex-wrap gap-2">
                        {item.options.materials.map((material) => (
                          <button
                            key={material}
                            onClick={() => handleCustomization(item.id, 'material', material)}
                            className={`px-3 py-1 rounded-full text-sm border
                              ${customizations[item.id]?.material === material 
                                ? 'bg-[#005670] text-white' 
                                : 'hover:bg-gray-50'}`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {item.options.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleCustomization(item.id, 'color', color)}
                            className={`px-3 py-1 rounded-full text-sm border
                              ${customizations[item.id]?.color === color 
                                ? 'bg-[#005670] text-white' 
                                : 'hover:bg-gray-50'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Style Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Style</label>
                      <div className="flex flex-wrap gap-2">
                        {item.options.styles.map((style) => (
                          <button
                            key={style}
                            onClick={() => handleCustomization(item.id, 'style', style)}
                            className={`px-3 py-1 rounded-full text-sm border
                              ${customizations[item.id]?.style === style 
                                ? 'bg-[#005670] text-white' 
                                : 'hover:bg-gray-50'}`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="relative">
              <img 
                src={previews[activePreview]} 
                alt="Room Preview"
                className="w-full rounded-lg"
              />
              
              {/* Preview Navigation */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                {previews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePreview(index)}
                    className={`w-2 h-2 rounded-full transition-all
                      ${activePreview === index 
                        ? 'w-8 bg-[#005670]' 
                        : 'bg-white/80 hover:bg-white'}`}
                  />
                ))}
              </div>

              {/* Preview Navigation Arrows */}
              <button
                onClick={() => setActivePreview(prev => Math.max(prev - 1, 0))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setActivePreview(prev => Math.min(prev + 1, previews.length - 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            {/* Selected Combinations Summary */}
            {Object.keys(customizations).length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Selected Combinations</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(customizations).map(([furnitureId, options]) => {
                    const furnitureItem = furniture.find(f => f.id === furnitureId);
                    return furnitureItem && (
                      <div key={furnitureId} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{furnitureItem.type}</h4>
                        <p className="text-sm text-gray-600">
                          {options.material && `Material: ${options.material}`}<br />
                          {options.color && `Color: ${options.color}`}<br />
                          {options.style && `Style: ${options.style}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureCustomization;