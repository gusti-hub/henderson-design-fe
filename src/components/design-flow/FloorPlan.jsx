import React, { useState } from 'react';

const FloorPlan = ({ onAreaSelect, onAreaHover, selectedArea }) => {
  const areas = [
    {
      id: 'cuisine',
      name: 'Cuisine',
      color: '#FFE4E1',
      path: 'M20,20 L150,20 L150,150 L20,150 Z'
    },
    {
      id: 'meeting1',
      name: 'Meeting Room 1',
      color: '#FFE4E1',
      path: 'M20,170 L150,170 L150,250 L20,250 Z'
    },
    {
      id: 'meeting2',
      name: 'Meeting Room 2',
      color: '#FFE4E1',
      path: 'M20,270 L150,270 L150,350 L20,350 Z'
    },
    {
      id: 'open-space',
      name: 'Open Space',
      color: '#E6E6FA',
      path: 'M170,20 L400,20 L400,350 L170,350 Z'
    }
  ];

  return (
    <div className="relative">
      <svg
        viewBox="0 0 500 370"
        className="w-full"
      >
        {/* Draw walls */}
        <path
          d="M10,10 L490,10 L490,360 L10,360 Z"
          fill="none"
          stroke="#000"
          strokeWidth="2"
        />
        
        {/* Draw internal walls */}
        <line x1="160" y1="10" x2="160" y2="360" stroke="#000" strokeWidth="2" />

        {/* Clickable areas */}
        {areas.map((area) => (
          <g key={area.id}>
            <path
              d={area.path}
              fill={selectedArea === area.id ? '#005670' : area.color}
              stroke="#666"
              strokeWidth="1"
              onMouseEnter={() => onAreaHover?.(area.id)}
              onMouseLeave={() => onAreaHover?.(null)}
              onClick={() => onAreaSelect(area.id)}
              className="cursor-pointer transition-colors duration-200"
            />
            <text
              x={area.id === 'open-space' ? "285" : "85"}
              y={area.id === 'meeting1' ? "210" : area.id === 'meeting2' ? "310" : "85"}
              textAnchor="middle"
              className="text-xs"
              fill={selectedArea === area.id ? 'white' : 'black'}
            >
              {area.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default FloorPlan;