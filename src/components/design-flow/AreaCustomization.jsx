import React, { useState } from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import FloorPlan from './FloorPlan';

const AreaCustomization = ({ selectedPlan, onComplete }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaCustomizations, setAreaCustomizations] = useState({});
  const [activePreview, setActivePreview] = useState(0);

  const areas = {
    'cuisine': {
      name: 'Cuisine',
      furniture: [
        {
          type: 'Dining Table',
          options: {
            materials: ['Wood', 'Marble', 'Glass'],
            colors: ['Natural Oak', 'White', 'Black'],
            styles: ['Modern', 'Classic', 'Industrial']
          }
        },
        {
          type: 'Dining Chairs',
          options: {
            materials: ['Wood', 'Metal', 'Upholstered'],
            colors: ['Natural', 'White', 'Gray', 'Black'],
            styles: ['Modern', 'Classic', 'Industrial']
          }
        }
      ]
    },
    'meeting1': {
      name: 'Meeting Room 1',
      furniture: [
        {
          type: 'Conference Table',
          options: {
            materials: ['Wood', 'Glass'],
            colors: ['Natural Oak', 'White', 'Black'],
            styles: ['Modern', 'Executive']
          }
        },
        {
          type: 'Office Chairs',
          options: {
            materials: ['Mesh', 'Leather', 'Fabric'],
            colors: ['Black', 'Gray', 'Navy'],
            styles: ['Ergonomic', 'Executive']
          }
        }
      ]
    },
    'open-space': {
      name: 'Open Space',
      furniture: [
        {
          type: 'Workstations',
          options: {
            materials: ['Wood', 'Metal', 'Laminate'],
            colors: ['White', 'Gray', 'Natural'],
            styles: ['Modern', 'Minimalist']
          }
        },
        {
          type: 'Task Chairs',
          options: {
            materials: ['Mesh', 'Fabric'],
            colors: ['Black', 'Gray', 'Blue'],
            styles: ['Ergonomic', 'Basic']
          }
        }
      ]
    }
  };

  const handleAreaSelect = (areaId) => {
    setSelectedArea(areaId);
  };

  const handleCustomization = (furnitureType, optionType, value) => {
    if (!selectedArea) return;

    setAreaCustomizations(prev => ({
      ...prev,
      [selectedArea]: {
        ...prev[selectedArea],
        [furnitureType]: {
          ...prev[selectedArea]?.[furnitureType],
          [optionType]: value
        }
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Floor Plan */}
        <div className="col-span-5">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium mb-4" style={{ color: '#005670' }}>
              Select Area to Customize
            </h2>
            <FloorPlan 
              onAreaSelect={handleAreaSelect}
              selectedArea={selectedArea}
              customizedAreas={Object.keys(areaCustomizations)}
            />
          </div>
          
          {/* Customization Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-medium mb-4" style={{ color: '#005670' }}>
              Customized Areas
            </h2>
            <div className="space-y-4">
              {Object.entries(areaCustomizations).map(([areaId, furnitureSelections]) => (
                <div 
                  key={areaId} 
                  className="p-4 border rounded-lg cursor-pointer hover:border-[#005670]"
                  onClick={() => setSelectedArea(areaId)}
                >
                  <h3 className="font-medium mb-2">{areas[areaId]?.name}</h3>
                  {Object.entries(furnitureSelections).map(([furnitureType, options]) => (
                    <div key={furnitureType} className="ml-4 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{furnitureType}</p>
                      <p>Material: {options.material}</p>
                      <p>Color: {options.color}</p>
                      <p>Style: {options.style}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Customization Options & Preview */}
        <div className="col-span-7">
          {selectedArea ? (
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-4" style={{ color: '#005670' }}>Preview</h2>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="/api/placeholder/800/400" 
                    alt="Room Preview" 
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                    <button
                      onClick={() => setActivePreview(prev => Math.max(prev - 1, 0))}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setActivePreview(prev => prev + 1)}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Customization Options */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-4" style={{ color: '#005670' }}>
                  Customize {areas[selectedArea]?.name}
                </h2>
                
                <div className="space-y-6">
                  {areas[selectedArea]?.furniture.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-4">{item.type}</h3>
                      
                      {/* Material Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Material</label>
                        <div className="flex flex-wrap gap-2">
                          {item.options.materials.map(material => (
                            <button
                              key={material}
                              onClick={() => handleCustomization(item.type, 'material', material)}
                              className={`px-3 py-1 rounded-full text-sm border transition-colors
                                ${areaCustomizations[selectedArea]?.[item.type]?.material === material 
                                  ? 'bg-[#005670] text-white' 
                                  : 'hover:bg-gray-50'}`}
                            >
                              {material}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {item.options.colors.map(color => (
                            <button
                              key={color}
                              onClick={() => handleCustomization(item.type, 'color', color)}
                              className={`px-3 py-1 rounded-full text-sm border transition-colors
                                ${areaCustomizations[selectedArea]?.[item.type]?.color === color 
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
                          {item.options.styles.map(style => (
                            <button
                              key={style}
                              onClick={() => handleCustomization(item.type, 'style', style)}
                              className={`px-3 py-1 rounded-full text-sm border transition-colors
                                ${areaCustomizations[selectedArea]?.[item.type]?.style === style 
                                  ? 'bg-[#005670] text-white' 
                                  : 'hover:bg-gray-50'}`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-center text-gray-500">
                Select an area from the floor plan to customize
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => onComplete(areaCustomizations)}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#005670' }}
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
};

export default AreaCustomization;