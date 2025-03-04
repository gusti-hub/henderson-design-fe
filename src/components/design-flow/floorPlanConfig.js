import { customAConfig } from '../../config/custom-a';
import { customBConfig } from '../../config/custom-b';
import { customCConfig } from '../../config/custom-c';
import { investorAConfig } from '../../config/investor-a';
import { investorBConfig } from '../../config/investor-b';

// floorPlanConfig.js
const createRectPath = (x, y, width, height) => {
  return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
};

const calculateCenter = (coordinates) => {
  if (Array.isArray(coordinates)) {
    // For polygons, calculate centroid
    const points = coordinates;
    let xSum = 0, ySum = 0;
    points.forEach(point => {
      xSum += point.x;
      ySum += point.y;
    });
    return {
      x: xSum / points.length,
      y: ySum / points.length
    };
  } else if (coordinates.curve) {
    // For curves, use midpoint of control points
    const { start, end } = coordinates.curve;
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
  } else {
    // For rectangles, use center
    return {
      x: coordinates.x + coordinates.width / 2,
      y: coordinates.y + coordinates.height / 2
    };
  }
};

const createPath = (coordinates) => {
  if (Array.isArray(coordinates)) {
    // For polygon paths
    return {
      path: `M ${coordinates.map(point => `${point.x},${point.y}`).join(' L ')} Z`,
      transform: ''
    };
  } else if (coordinates.curve) {
    // For curved paths
    const { start, end, control1, control2 } = coordinates.curve;
    return {
      path: `M ${start.x},${start.y} C ${control1.x},${control1.y} ${control2.x},${control2.y} ${end.x},${end.y}`,
      transform: ''
    };
  } else if (coordinates.arc) {
    // For curved corners
    const { start, radius, sweep, end } = coordinates.arc;
    return {
      path: `M ${start.x},${start.y} A ${radius},${radius} 0 0,${sweep} ${end.x},${end.y}`,
      transform: ''
    };
  } else {
    // Handle rectangle with potential rotation
    const centerX = coordinates.x + coordinates.width / 2;
    const centerY = coordinates.y + coordinates.height / 2;
    
    const path = `M${coordinates.x},${coordinates.y} 
                  L${coordinates.x + coordinates.width},${coordinates.y} 
                  L${coordinates.x + coordinates.width},${coordinates.y + coordinates.height} 
                  L${coordinates.x},${coordinates.y + coordinates.height} Z`;
    
    const transform = coordinates.rotation 
      ? `rotate(${coordinates.rotation}, ${centerX}, ${centerY})`
      : '';
    
    return { path, transform };
  }
};


export const floorPlanConfig = {
  'investor-a': investorAConfig,
  'investor-b': investorBConfig,
  'custom-a': customAConfig,
  'custom-b': customBConfig,
  'custom-c': customCConfig,
};

export const generateFurnitureAreas = (planId) => {
  const planConfig = floorPlanConfig[planId];
  if (!planConfig) {
    console.warn(`No configuration found for plan: ${planId}`);
    return {};
  }

  return Object.entries(planConfig.furniture).reduce((acc, [key, furniture]) => {
    const { coordinates, labelStyle, quantity = { enabled: false, min: 1, max: 1 } } = furniture;
    const center = calculateCenter(coordinates);
    const pathData = createPath(coordinates);

    const labelPosition = {
      x: center.x + (labelStyle?.offset?.x || 0),
      y: center.y + (labelStyle?.offset?.y || 0)
    };

    acc[key] = {
      id: furniture.id,
      label: furniture.label,
      area: furniture.area || 'Unspecified Area',
      path: pathData.path,
      transform: pathData.transform,
      center,
      labelPosition,
      labelStyle: {
        fontSize: '12px',
        fontWeight: '400',
        fontFamily: 'Arial',
        alignment: 'center',
        orientation: 'horizontal',
        ...labelStyle
      },
      dimensions: coordinates,
      quantity
    };
    return acc;
  }, {});
};


export const getPlanDimensions = (planId) => {
  return floorPlanConfig[planId]?.dimensions || { width: 800, height: 600 };
};