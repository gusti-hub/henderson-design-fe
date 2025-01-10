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
          x: 280,
          y: 334,
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
          x: 269,
          y: 399,
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
        quantity: {
          enabled: true,
          fixed: 6,
          min: 6,
          max: 6,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot2: {
        id: 'DIN-ST-01',
        label: 'DIN-ST-01',
        area: 'Dining Room',
        coordinates: {
          x: 269,
          y: 368,
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
        quantity: {
          enabled: true,
          fixed: 6,
          min: 6,
          max: 6,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot3: {
        id: 'DIN-ST-01',
        label: 'DIN-ST-01',
        area: 'Dining Room',
        coordinates: {
          x: 269,
          y: 337,
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
        quantity: {
          enabled: true,
          fixed: 6,
          min: 6,
          max: 6,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot4: {
        id: 'DIN-ST-01',
        label: 'DIN-ST-01',
        area: 'Dining Room',
        coordinates: {
          x: 315,
          y: 337,
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
        quantity: {
          enabled: true,
          fixed: 6,
          min: 6,
          max: 6,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot5: {
        id: 'DIN-ST-01',
        label: 'DIN-ST-01',
        area: 'Dining Room',
        coordinates: {
          x: 315,
          y: 368,
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
        quantity: {
          enabled: true,
          fixed: 6,
          min: 6,
          max: 6,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot6: {
        id: 'DIN-ST-01',
        label: 'DIN-ST-01',
        area: 'Dining Room',
        coordinates: {
          x: 315,
          y: 399,
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
        quantity: {
          enabled: true,
          fixed: 6,
          min: 6,
          max: 6,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      floatingShoe1: {
        id: 'ENT-CG-01',
        label: 'ENT-CG-01',
        area: 'Entry Room',
        coordinates: {
          x: 275,
          y: 234,
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
        }
      },
      livingSpot1: {
        id: 'LIV-TB-01',
        label: 'LIV-TB-01',
        area: 'Living Room',
        coordinates: {
          x: 467,
          y: 381,
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
          x: 408,
          y: 359,
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
          y: 347,
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
          x: 496,
          y: 344,
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
          x: 420,
          y: 341,
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
      livingSpot6: {
        id: 'LIV-TB-04',
        label: 'LIV-TB-04',
        area: 'Living Room',
        coordinates: {
          x: 392,
          y: 370,
          width: 20,
          height: 75
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
      livingSpot7: {
        id: 'LIV-CG-01',
        label: 'LIV-CG-01',
        area: 'Living Room',
        coordinates: {
          x: 565,
          y: 346,
          width: 25,
          height: 110
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
      kitchenSpot1: {
        id: 'KIT-ST-04',
        label: 'KIT-ST-04',
        area: 'Kitchen',
        coordinates: {
          x: 375,
          y: 179,
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
      bedroom1Spot1: {
        id: 'BD1-BD-01',
        label: 'BD1-BD-01',
        area: 'Primary Bedroom',
        coordinates: {
          x: 645,
          y: 344,
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
      bedroom1Spot2: {
        id: 'BD1-CG-01',
        label: 'BD1-CG-01',
        area: 'Primary Bedroom',
        coordinates: {
          x: 718,
          y: 303,
          width: 30,
          height: 42
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
      bedroom1Spot3: {
        id: 'BD1-CG-02',
        label: 'BD1-CG-02',
        area: 'Primary Bedroom',
        coordinates: {
          x: 718,
          y: 435,
          width: 30,
          height: 25
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
      bedroom1Spot4: {
        id: 'BD1-CG-03',
        label: 'BD1-CG-03',
        area: 'Primary Bedroom',
        coordinates: {
          x: 590,
          y: 348,
          width: 25,
          height: 85
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
      bedroom1Spot5: {
        id: 'BD1-TB-01',
        label: 'BD1-TB-01',
        area: 'Primary Bedroom',
        coordinates: {
          x: 596,
          y: 430,
          width: 23,
          height: 35
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
      bedroom1Spot6: {
        id: 'BD1-ST-01',
        label: 'BD1-ST-01',
        area: 'Primary Bedroom',
        coordinates: {
          x: 603,
          y: 435,
          width: 28,
          height: 27
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
          x: 77,
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
      bedroom2Spot2: {
        id: 'BD2-CG-01',
        label: 'BD2-CG-01',
        area: 'Bedroom 2',
        coordinates: {
          x: 77,
          y: 302,
          width: 30,
          height: 42
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
      bedroom2Spot3: {
        id: 'BD2-CG-02',
        label: 'BD2-CG-02',
        area: 'Bedroom 2',
        coordinates: {
          x: 77,
          y: 433,
          width: 30,
          height: 30
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
      bedroom2Spot4: {
        id: 'BD2-TB-01',
        label: 'BD2-TB-01',
        area: 'Bedroom 2',
        coordinates: {
          x: 201,
          y: 440,
          width: 25,
          height: 30
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
      bedroom2Spot5: {
        id: 'BD2-ST-01',
        label: 'BD2-ST-01',
        area: 'Bedroom 2',
        coordinates: {
          x: 190,
          y: 436,
          width: 27,
          height: 27
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
      bedroom2Spot6: {
        id: 'BD2-CG-03',
        label: 'BD2-CG-03',
        area: 'Bedroom 2',
        coordinates: {
          x: 205,
          y: 340,
          width: 22,
          height: 100
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
      officeSpot1: {
        id: 'OF-TB-01',
        label: 'OF-TB-01',
        area: 'Office/Den',
        coordinates: {
          x: 235,
          y: 109,
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
          x: 250,
          y: 124,
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
          x: 272,
          y: 92,
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
      kitchenSpot1: {
        id: 'KIT-ST-01',
        label: 'KIT-ST-01',
        area: 'Kitchen',
        coordinates: {
          x: 417,
          y: 274,
          width: 23,
          height: 27
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        },
        quantity: {
          enabled: true,
          fixed: 3,
          min: 1,
          max: 5,
          additional: {
            enabled: true,
            min: 0,
            max: 2
          }
        }
      },
      kitchenSpot2: {
        id: 'KIT-ST-01',
        label: 'KIT-ST-01',
        area: 'Kitchen',
        coordinates: {
          x: 448,
          y: 274,
          width: 23,
          height: 27
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        },
        quantity: {
          enabled: true,
          fixed: 3,
          min: 1,
          max: 5,
          additional: {
            enabled: true,
            min: 0,
            max: 2
          }
        }
      },
      kitchenSpot3: {
        id: 'KIT-ST-01',
        label: 'KIT-ST-01',
        area: 'Kitchen',
        coordinates: {
          x: 479,
          y: 274,
          width: 23,
          height: 27
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        },
        quantity: {
          enabled: true,
          fixed: 3,
          min: 1,
          max: 5,
          additional: {
            enabled: true,
            min: 0,
            max: 2
          }
        }
      },
      LanaiSpot1: {
        id: 'LAN-ST-01',
        label: 'LAN-ST-01',
        area: 'Lanai',
        coordinates: {
          x: 683,
          y: 483,
          width: 38,
          height: 36
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 2,
          max: 2,
        }
      },
      LanaiSpot2: {
        id: 'LAN-ST-01',
        label: 'LAN-ST-01',
        area: 'Lanai',
        coordinates: {
          x: 630,
          y: 483,
          width: 38,
          height: 36
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 2,
          max: 2,
        }
      },
      LanaiSpot3: {
        id: 'LAN-TB-01',
        label: 'LAN-TB-01',
        area: 'Lanai',
        coordinates: {
          x: 662,
          y: 505,
          width: 26,
          height: 26
        },
        labelStyle: {
          offset: { x: -3, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        },
        quantity: {
          enabled: false,
          fixed: 1,
          min: 1,
          max: 1,
        }
      }
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
    const { coordinates, labelStyle, quantity = { enabled: false, min: 1, max: 1 } } = furniture;
    const center = calculateCenter(
      coordinates.x,
      coordinates.y,
      coordinates.width,
      coordinates.height
    );

    const labelPosition = {
      x: center.x + (labelStyle?.offset?.x || 0),
      y: center.y + (labelStyle?.offset?.y || 0)
    };

    acc[key] = {
      id: furniture.id,
      label: furniture.label,
      area: furniture.area || 'Unspecified Area',
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
      dimensions: coordinates,
      quantity: {
        enabled: quantity?.enabled || false,
        min: quantity?.min || 1,
        max: quantity?.max || 1,
        fixed: quantity?.fixed || null,
        additional: quantity?.additional ? {
          enabled: quantity.additional.enabled,
          min: quantity.additional.min || quantity.min,
          max: quantity.additional.max || quantity.max
        } : null
      }
    };
    return acc;
  }, {});
};

export const getPlanDimensions = (planId) => {
  return floorPlanConfig[planId]?.dimensions || { width: 800, height: 600 };
};