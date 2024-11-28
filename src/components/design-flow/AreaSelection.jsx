import React, { useState } from 'react';
import FloorPlan from './FloorPlan';

const AreaSelection = ({ selectedPlan, onAreaSelect }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  // Example furniture suggestions for each area
  const areaFurniture = {
    'cuisine': {
      name: 'Cuisine',
      suggestedFurniture: [
        { type: 'Dining Table', preview: '/api/placeholder/300/200' },
        { type: 'Dining Chairs', preview: '/api/placeholder/300/200' }
      ]
    },
    'meeting1': {
      name: 'Meeting Room 1',
      suggestedFurniture: [
        { type: 'Conference Table' },
        { type: 'Office Chairs' }
      ]
    },
    'open-space': {
      name: 'Open Space',
      suggestedFurniture: [
        { type: 'Workstations' },
        { type: 'Task Chairs' }
      ]
    }
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const handleContinue = () => {
    if (selectedArea) {
      onAreaSelect(selectedArea); // Call the parent's handler with selected area
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-3 gap-8">
        {/* Left: Floor Plan */}
        <div className="col-span-2">
          <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
            Select Area
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <FloorPlan 
              onAreaSelect={handleAreaClick}
              onAreaHover={setHoveredArea}
              selectedArea={selectedArea}
            />
          </div>
        </div>

        {/* Right: Area Details & Preview */}
        <div>
          {selectedArea && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-medium mb-4">
                {areaFurniture[selectedArea]?.name || selectedArea}
              </h3>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Available Furniture</h4>
                {areaFurniture[selectedArea]?.suggestedFurniture.map((furniture, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:border-[#005670] transition-colors"
                  >
                    <p className="font-medium">{furniture.type}</p>
                  </div>
                ))}

                <button
                  onClick={handleContinue}
                  className="w-full py-2 text-white rounded-lg mt-4"
                  style={{ backgroundColor: '#005670' }}
                >
                  Continue with this Area
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaSelection;