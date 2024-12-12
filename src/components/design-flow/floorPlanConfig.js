// floorPlanConfig.js
const createRectPath = (x, y, width, height) => {
  return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
};

const calculateCenter = (x, y, width, height) => {
  return {
    x: x + width / 2,
    y: y + height / 2
  };
};

export const floorPlanConfig = {
  'investor-a': {
    id: 'investor-a',
    dimensions: { width: 800, height: 600 },
    furniture: {
      sofa: {
        id: 'sofa',
        label: 'Modern Sofa',
        coordinates: {
          x: 200,
          y: 250,
          width: 150,
          height: 80
        },
        product: {
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
        }
      },
      diningTable: {
        id: 'diningTable',
        label: 'Dining Table',
        coordinates: {
          x: 400,
          y: 250,
          width: 120,
          height: 120
        },
        product: {
          id: 'diningTable',
          name: 'Dining Table Set',
          basePrice: 1500,
          image: '/api/placeholder/400/300',
          options: {
            colors: ['White', 'Gray', 'Beige'],
            materials: ['Wood', 'Glass']
          },
          prices: {
            colors: {
              White: { price: 0 },
              Gray: { price: 50 },
              Beige: { price: 100 }
            },
            materials: {
              Wood: { price: 0 },
              Glass: { price: 200 }
            }
          }
        }
      },
      bed: {
        id: 'bed',
        label: 'King Bed',
        coordinates: {
          x: 100,
          y: 100,
          width: 200,
          height: 160
        },
        product: {
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
      }
    }
  },
  'investor-b': {
    id: 'investor-b',
    dimensions: { width: 800, height: 600 },
    furniture: {
      // Different furniture positions and products for investor-b
      sofa: {
        id: 'sofa',
        label: 'Modern Sofa',
        coordinates: {
          x: 300,
          y: 200,
          width: 150,
          height: 80
        },
        product: {
          // Product details specific to this floor plan
        }
      },
      // Add more furniture items specific to this floor plan
    }
  }
  // Add more floor plans as needed
};

export const generateFurnitureAreas = (planId) => {
  const planConfig = floorPlanConfig[planId];
  if (!planConfig) {
    console.warn(`No configuration found for plan: ${planId}`);
    return {};
  }

  return Object.entries(planConfig.furniture).reduce((acc, [key, furniture]) => {
    const { coordinates } = furniture;
    acc[key] = {
      id: furniture.id,
      label: furniture.label,
      path: createRectPath(
        coordinates.x,
        coordinates.y,
        coordinates.width,
        coordinates.height
      ),
      center: calculateCenter(
        coordinates.x,
        coordinates.y,
        coordinates.width,
        coordinates.height
      ),
      dimensions: coordinates,
      product: furniture.product
    };
    return acc;
  }, {});
};

export const getPlanDimensions = (planId) => {
  return floorPlanConfig[planId]?.dimensions || { width: 800, height: 600 };
};