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
        id: 'Test 1',
        label: 'Dining Table 1',
        area: 'Dining Room',
        coordinates: {
          x: 380,
          y: 245,
          width: 140,
          height: 40
        }
      },
      diningTable: {
        id: 'Test 2',
        label: 'Dining Table 2',
        area: 'Dining Room', // Added area property
        coordinates: {
          x: 270,
          y: 335,
          width: 45,
          height: 95
        }
      }
    }
  },
  'investor-b': {
    id: 'investor-b',
    dimensions: { width: 800, height: 600 },
    furniture: {
      sofa: {
        id: 'sofa',
        label: 'Modern Sofa',
        area: 'Living Room', // Added area property
        coordinates: {
          x: 300,
          y: 200,
          width: 150,
          height: 80
        },
        product: {
          // Product details specific to this floor plan
        }
      }
    }
  },
'custom-c': {
    id: 'custom-c',
    dimensions: { width: 800, height: 600 },
    furniture: {
      // Original dining table
      diningTable1: {
        id: 'DIN-TB-11',
        label: 'DIN-TB-11',
        area: 'Dining Room',
        coordinates: {
          x: 285,
          y: 335,
          width: 45,
          height: 95
        },
        labelStyle: {
          offset: { x: -5, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      // Top row dining spots
      diningSpot1: {
        id: 'DIN-ST-01',
        label: 'DIN-ST-01',
        area: 'Dining Room',
        coordinates: {
          x: 274,
          y: 400,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      diningSpot2: {
        id: 'DIN-ST-02',
        label: 'DIN-ST-02',
        area: 'Dining Room',
        coordinates: {
          x: 274,
          y: 369,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      diningSpot3: {
        id: 'DIN-ST-03',
        label: 'DIN-ST-03',
        area: 'Dining Room',
        coordinates: {
          x: 274,
          y: 338,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      diningSpot4: {
        id: 'DIN-ST-04',
        label: 'DIN-ST-04',
        area: 'Dining Room',
        coordinates: {
          x: 320,
          y: 338,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      diningSpot5: {
        id: 'DIN-ST-05',
        label: 'DIN-ST-05',
        area: 'Dining Room',
        coordinates: {
          x: 320,
          y: 369,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      diningSpot6: {
        id: 'DIN-ST-06',
        label: 'DIN-ST-06',
        area: 'Dining Room',
        coordinates: {
          x: 320,
          y: 400,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        },
      },
      floatingShoe1: {
        id: 'ENT-CG-01',
        label: 'ENT-CG-01',
        area: 'Entry Room',
        coordinates: {
          x: 280,
          y: 235,
          width: 55,
          height: 15
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        },
      },
      
      // Living area spots
      livingSpot1: {
        id: 'LIV-TB-01',
        label: 'LIV-TB-01',
        area: 'Living Room',
        coordinates: {
          x: 470,
          y: 382,
          width: 33,
          height: 45
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '7px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      livingSpot2: {
        id: 'LIV-ST-01',
        label: 'LIV-ST-01',
        area: 'Living Room',
        coordinates: {
          x: 413,
          y: 360,
          width: 80,
          height: 115
        },
        labelStyle: {
          offset: { x: -10, y: -5 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      livingSpot3: {
        id: 'LIV-ST-02',
        label: 'LIV-ST-02',
        area: 'Living Room',
        coordinates: {
          x: 505,
          y: 348,
          width: 40,
          height: 39
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot4: {
        id: 'LIV-TB-02',
        label: 'LIV-TB-02',
        area: 'Living Room',
        coordinates: {
          x: 498,
          y: 345,
          width: 17,
          height: 15
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '5px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot5: {
        id: 'LIV-TB-03',
        label: 'LIV-TB-03',
        area: 'Living Room',
        coordinates: {
          x: 425,
          y: 342,
          width: 32,
          height: 17
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      
      // Kitchen spots
      kitchenSpot1: {
        id: 'KIT-ST-04',
        label: 'KIT-ST-04',
        area: 'Kitchen',
        coordinates: {
          x: 380,
          y: 180,
          width: 40,
          height: 40
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      
      // Bedroom spots
      bedroom1Spot1: {
        id: 'BD1-BD-01',
        label: 'BD1-BD-01',
        area: 'Primary Bedroom',
        coordinates: {
          x: 650,
          y: 345,
          width: 100,
          height: 90
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot1: {
        id: 'BD2-BD-01',
        label: 'BD2-BD-01',
        area: 'Bedroom 2',
        coordinates: {
          x: 82,
          y: 346,
          width: 100,
          height: 90
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      
      // Office spots
      officeSpot1: {
        id: 'OF-TB-01',
        label: 'OF-TB-01',
        area: 'Office/Den',
        coordinates: {
          x: 240,
          y: 110,
          width: 30,
          height: 57
        },
        labelStyle: {
          offset: { x: -10, y: 0 },
          fontSize: '7px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      officeSpot2: {
        id: 'OF-ST-01',
        label: 'OF-ST-01',
        area: 'Office/Den',
        coordinates: {
          x: 255,
          y: 125,
          width: 22,
          height: 20
        },
        labelStyle: {
          offset: { x: 10, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      officeSpot3: {
        id: 'OF-CG-01',
        label: 'OF-CG-01',
        area: 'Office/Den',
        coordinates: {
          x: 277,
          y: 93,
          width: 43,
          height: 20
        },
        labelStyle: {
          offset: { x: 0, y: 0 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },

      //Kitchen
      kitchenSpot1: {
        id: 'KIT-ST-01',
        label: 'KIT-ST-01',
        area: 'Kitchen',
        coordinates: {
          x: 421,
          y: 275,
          width: 22,
          height: 27
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      kitchenSpot2: {
        id: 'KIT-ST-02',
        label: 'KIT-ST-02',
        area: 'Kitchen',
        coordinates: {
          x: 452,
          y: 275,
          width: 22,
          height: 27
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      kitchenSpot3: {
        id: 'KIT-ST-03',
        label: 'KIT-ST-03',
        area: 'Kitchen',
        coordinates: {
          x: 483,
          y: 275,
          width: 22,
          height: 27
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },

      
    }
  }
};

export const generateFurnitureAreas = (planId) => {
  const planConfig = floorPlanConfig[planId];
  if (!planConfig) {
    console.warn(`No configuration found for plan: ${planId}`);
    return {};
  }

  return Object.entries(planConfig.furniture).reduce((acc, [key, furniture]) => {
    const { coordinates, labelStyle } = furniture;
    const center = calculateCenter(
      coordinates.x,
      coordinates.y,
      coordinates.width,
      coordinates.height
    );

    // Calculate label position based on offset and alignment
    const labelPosition = {
      x: center.x + (labelStyle?.offset?.x || 0),
      y: center.y + (labelStyle?.offset?.y || 0)
    };

    acc[key] = {
      id: furniture.id,
      label: furniture.label,
      area: furniture.area || 'Unspecified Area', // Added default value
      path: createRectPath(
        coordinates.x,
        coordinates.y,
        coordinates.width,
        coordinates.height
      ),
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
      dimensions: coordinates
    };
    return acc;
  }, {});
};

export const getPlanDimensions = (planId) => {
  return floorPlanConfig[planId]?.dimensions || { width: 800, height: 600 };
};