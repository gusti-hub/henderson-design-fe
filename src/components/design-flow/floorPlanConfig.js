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
'investor-a': {
    id: 'investor-a',
    dimensions: { width: 800, height: 600 },
    furniture: {
      kitchenSpot1: {
        id: 'KIT-ST-01-I',
        label: 'KIT-ST-01-I',
        area: 'Kitchen',
        coordinates: {
          x: 282,
          y: 276,
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
          fixed: 2,
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
        id: 'KIT-ST-01-I',
        label: 'KIT-ST-01-I',
        area: 'Kitchen',
        coordinates: {
          x: 317,
          y: 276,
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
          fixed: 2,
          min: 1,
          max: 5,
          additional: {
            enabled: true,
            min: 0,
            max: 2
          }
        }
      },
      diningSpot1: {
        id: 'DIN-ST-01-I',
        label: 'DIN-ST-01-I',
        area: 'Dining Room',
        coordinates: {
          x: 237,
          y: 401,
          width: 24,
          height: 22
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
          fixed: 2,
          min: 2,
          max: 2,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot2: {
        id: 'DIN-ST-01-I',
        label: 'DIN-ST-01-I',
        area: 'Dining Room',
        coordinates: {
          x: 237,
          y: 372,
          width: 24,
          height: 22
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
          fixed: 2,
          min: 2,
          max: 2,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningTable1: {
        id: 'DIN-TB-01-I',
        label: 'DIN-TB-01-I',
        area: 'Dining Room',
        coordinates: {
          x: 247,
          y: 361,
          width: 33,
          height: 70
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
      livingSpot1: {
        id: 'LIV-ST-01-I',
        label: 'LIV-ST-01-I',
        area: 'Living Room',
        coordinates: {
          x: 282,
          y: 353,
          width: 45,
          height: 88
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
      livingSpot2: {
        id: 'LIV-TB-02-I',
        label: 'LIV-TB-02-I',
        area: 'Living Room',
        coordinates: {
          x: 282,
          y: 341,
          width: 40,
          height: 10
        },
        labelStyle: {
          offset: { x: -5, y: 0 },
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
      livingSpot3: {
        id: 'LIV-TB-02-I',
        label: 'LIV-TB-02-I',
        area: 'Living Room',
        coordinates: {
          x: 282,
          y: 444,
          width: 40,
          height: 10
        },
        labelStyle: {
          offset: { x: -5, y: 0 },
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
      livingSpot4: {
        id: 'LIV-TB-01-I',
        label: 'LIV-TB-01-I',
        area: 'Living Room',
        coordinates: {
          x: 347,
          y: 376,
          width: 30,
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
      livingSpot5: {
        id: 'LIV-ST-02-I',
        label: 'LIV-ST-02-I',
        area: 'Living Room',
        coordinates: {
          x: 336,
          y: 446,
          width: 32,
          height: 35,
          rotation: 12
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
      livingSpot6: {
        id: 'LIV-CG-01-I',
        label: 'LIV-CG-01-I',
        area: 'Living Room',
        coordinates: {
          x: 391,
          y: 361,
          width: 20,
          height: 78
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
      bedroom1Spot1: {
        id: 'BD1-BD-01-I',
        label: 'BD1-BD-01-I',
        area: 'Primary Bedroom',
        coordinates: {
          x: 466,
          y: 331,
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
        id: 'BD1-CG-01-I',
        label: 'BD1-CG-01-I',
        area: 'Primary Bedroom',
        coordinates: {
          x: 544,
          y: 291,
          width: 25,
          height: 40
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 2,
          max: 2,
        }
      },
      bedroom1Spot3: {
        id: 'BD1-CG-01-I',
        label: 'BD1-CG-01-I',
        area: 'Primary Bedroom',
        coordinates: {
          x: 544,
          y: 424,
          width: 25,
          height: 40
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 2,
          max: 2,
        }
      },
      LanaiSpot1: {
        id: 'LAN-ST-01-I',
        label: 'LAN-ST-01-I',
        area: 'Lanai',
        coordinates: {
          x: 209,
          y: 499,
          width: 34,
          height: 30,
          rotation: 37
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
        id: 'LAN-ST-01-I',
        label: 'LAN-ST-01-I',
        area: 'Lanai',
        coordinates: {
          x: 268,
          y: 499,
          width: 30,
          height: 34,
          rotation: 52
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
        id: 'LAN-TB-01-I',
        label: 'LAN-TB-01-I',
        area: 'Lanai',
        coordinates: {
          x: 242,
          y: 523,
          width: 25,
          height: 23,
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
      },
    }
  },
'custom-a': {
    id: 'custom-a',
    dimensions: { width: 800, height: 600 },
    furniture: {
      kitchenSpot1: {
        id: 'KIT-ST-01-O',
        label: 'KIT-ST-01-O',
        area: 'Kitchen',
        coordinates: {
          x: 272,
          y: 277,
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
        },
        quantity: {
          enabled: true,
          fixed: 2,
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
        id: 'KIT-ST-01-O',
        label: 'KIT-ST-01-O',
        area: 'Kitchen',
        coordinates: {
          x: 304,
          y: 277,
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
        },
        quantity: {
          enabled: true,
          fixed: 2,
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
        id: 'KIT-ST-01-O',
        label: 'KIT-ST-01-O',
        area: 'Kitchen',
        coordinates: {
          x: 336,
          y: 277,
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
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 1,
          max: 5,
          additional: {
            enabled: true,
            min: 0,
            max: 2
          }
        }
      },
      diningSpot1: {
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 239,
          y: 410,
          width: 24,
          height: 20
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
          fixed: 4,
          min: 4,
          max: 4,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot2: {
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 239,
          y: 388,
          width: 24,
          height: 20
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
          fixed: 2,
          min: 2,
          max: 2,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot3: {
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 257,
          y: 364,
          width: 21,
          height: 22
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
          fixed: 2,
          min: 2,
          max: 2,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningSpot4: {
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 257,
          y: 433,
          width: 21,
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
          fixed: 2,
          min: 2,
          max: 2,
          additional: {
            enabled: true,
            min: 1,
            max: 2
          }
        }
      },
      diningTable1: {
        id: 'DIN-TB-01-O',
        label: 'DIN-TB-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 248,
          y: 375,
          width: 33,
          height: 70
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
      livingSpot1: {
        id: 'LIV-ST-01-O',
        label: 'LIV-ST-01-O',
        area: 'Living Room',
        coordinates: [
          { x: 283, y: 357 },
          { x: 328, y: 357 },
          { x: 328, y: 436 },
          { x: 362, y: 446 },
          { x: 359, y: 477 },
          { x: 283, y: 457 },
          { x: 283, y: 356 }
        ],
        labelStyle: {
          offset: { x: -5, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      livingSpot2: {
        id: 'LIV-TB-02-O',
        label: 'LIV-TB-02-O',
        area: 'Living Room',
        coordinates: {
          x: 294,
          y: 347,
          width: 30,
          height: 10
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
      livingSpot4: {
        id: 'LIV-TB-01-O',
        label: 'LIV-TB-01-O',
        area: 'Living Room',
        coordinates: {
          x: 342,
          y: 383,
          width: 30,
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
      livingSpot5: {
        id: 'LIV-ST-02-O',
        label: 'LIV-ST-02-O',
        area: 'Living Room',
        coordinates: {
          x: 349,
          y: 329,
          width: 32,
          height: 35,
          rotation: 7
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
      livingSpot6: {
        id: 'LIV-CG-01-O',
        label: 'LIV-CG-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 396,
          y: 354,
          width: 20,
          height: 112
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
      bedroom1Spot1: {
        id: 'BD1-BD-01-O',
        label: 'BD1-BD-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 471,
          y: 341,
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
        id: 'BD1-CG-01-O',
        label: 'BD1-CG-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 543,
          y: 299,
          width: 25,
          height: 40
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 2,
          max: 2,
        }
      },
      bedroom1Spot3: {
        id: 'BD1-CG-01-O',
        label: 'BD1-CG-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 543,
          y: 432,
          width: 25,
          height: 28
        },
        labelStyle: {
          offset: { x: 0, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        },
        quantity: {
          enabled: true,
          fixed: 2,
          min: 2,
          max: 2,
        }
      },
      bedroom1Spot4: {
        id: 'BD1-CG-03-O',
        label: 'BD1-CG-03-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 424,
          y: 344,
          width: 8,
          height: 82
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
        id: 'BD1-TB-01-O',
        label: 'BD1-TB-01-O',
        area: 'Primary Bedroom',
        coordinates: [
          { x: 421, y: 428 },
          { x: 425, y: 428 },
          { x: 449, y: 448 },
          { x: 449, y: 463 },
          { x: 421, y: 463 }
        ],
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
        id: 'BD1-ST-01-O',
        label: 'BD1-ST-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 432,
          y: 437,
          width: 20,
          height: 20,
          rotation: 30
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
      LanaiSpot1: {
        id: 'LAN-ST-01-O',
        label: 'LAN-ST-01-O',
        area: 'Lanai',
        coordinates: {
          x: 212,
          y: 503,
          width: 34,
          height: 30,
          rotation: 37
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
        id: 'LAN-ST-01-O',
        label: 'LAN-ST-01-O',
        area: 'Lanai',
        coordinates: {
          x: 268,
          y: 501,
          width: 30,
          height: 34,
          rotation: 52
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
        id: 'LAN-TB-01-O',
        label: 'LAN-TB-01-O',
        area: 'Lanai',
        coordinates: {
          x: 244,
          y: 526,
          width: 25,
          height: 23,
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
      },
      EnterenceSpot1: {
        id: 'ENT-CG-01-O',
        label: 'ENT-CG-01-O',
        area: 'Enterence',
        coordinates: {
          x: 206,
          y: 189,
          width: 15,
          height: 55,
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
      },
    }
  },
'custom-c': {
    id: 'custom-c',
    dimensions: { width: 800, height: 600 },
    furniture: {
      // Original dining table
      diningTable1: {
        id: 'DIN-TB-01-O',
        label: 'DIN-TB-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 276,
          y: 334,
          width: 45,
          height: 95
        },
        labelStyle: {
          offset: { x: -9, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      dininglv1: {
        id: 'DIN-LV-01-O',
        label: 'DIN-LV-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 288,
          y: 354,
          width: 17,
          height: 54
        },
        labelStyle: {
          offset: { x: -9, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      // Top row dining spots
      diningSpot1: {
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 260,
          y: 399,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
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
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 260,
          y: 370,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
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
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 260,
          y: 340,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
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
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 311,
          y: 340,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
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
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 311,
          y: 370,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
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
        id: 'DIN-ST-01-O',
        label: 'DIN-ST-01-O',
        area: 'Dining Room',
        coordinates: {
          x: 311,
          y: 399,
          width: 24,
          height: 24
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
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
        id: 'ENT-CG-01-O',
        label: 'ENT-CG-01-O',
        area: 'Entry Room',
        coordinates: {
          x: 271,
          y: 234,
          width: 55,
          height: 15
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot1: {
        id: 'LIV-TB-01-O',
        label: 'LIV-TB-01-O',
        area: 'Living Room',
        coordinates: {
          x: 463,
          y: 381,
          width: 30,
          height: 45
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
          fontSize: '7px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      livingSpot2: {
        id: 'LIV-ST-01-O',
        label: 'LIV-ST-01-O',
        area: 'Living Room',
        coordinates: [
          { x: 408, y: 359 },
          { x: 450, y: 359 },
          { x: 450, y: 430 },
          { x: 487, y: 442 },
          { x: 484, y: 480 },
          { x: 408, y: 460 },
          { x: 408, y: 359 }
        ],
        labelStyle: {
          offset: { x: -14, y: -5 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      livingSpot3: {
        id: 'LIV-ST-02-O',
        label: 'LIV-ST-02-O',
        area: 'Living Room',
        coordinates: {
          x: 503,
          y: 348,
          width: 31,
          height: 33,
          rotation: 45
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot4: {
        id: 'LIV-TB-02-O',
        label: 'LIV-TB-02-O',
        area: 'Living Room',
        coordinates: {
          x: 492,
          y: 345,
          width: 11,
          height: 14,
          rotation: 45
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '5px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot5: {
        id: 'LIV-TB-03-O',
        label: 'LIV-TB-03-O',
        area: 'Living Room',
        coordinates: {
          x: 416,
          y: 341,
          width: 32,
          height: 17
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot6: {
        id: 'LIV-TB-04-O',
        label: 'LIV-TB-04-O',
        area: 'Living Room',
        coordinates: {
          x: 388,
          y: 370,
          width: 18,
          height: 80
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      livingSpot7: {
        id: 'LIV-CG-01-O',
        label: 'LIV-CG-01-O',
        area: 'Living Room',
        coordinates: {
          x: 561,
          y: 346,
          width: 25,
          height: 110
        },
        labelStyle: {
          offset: { x: -4, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      kitchenSpot1: {
        id: 'KIT-ST-04-O',
        label: 'KIT-ST-04-O',
        area: 'Kitchen',
        coordinates: {
          x: 371,
          y: 179,
          width: 40,
          height: 40
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '8px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom1Spot1: {
        id: 'BD1-BD-01-O',
        label: 'BD1-BD-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 641,
          y: 335,
          width: 100,
          height: 90
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom1Spot2: {
        id: 'BD1-CG-01-O',
        label: 'BD1-CG-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 714,
          y: 295,
          width: 26,
          height: 40
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom1Spot3: {
        id: 'BD1-CG-02-O',
        label: 'BD1-CG-02-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 714,
          y: 426,
          width: 26,
          height: 40
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom1Spot4: {
        id: 'BD1-CG-03-O',
        label: 'BD1-CG-03-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 586,
          y: 348,
          width: 25,
          height: 85
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom1Spot5: {
        id: 'BD1-TB-01-O',
        label: 'BD1-TB-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 590,
          y: 435,
          width: 23,
          height: 35
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom1Spot6: {
        id: 'BD1-ST-01-O',
        label: 'BD1-ST-01-O',
        area: 'Primary Bedroom',
        coordinates: {
          x: 603,
          y: 442,
          width: 23,
          height: 22
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot1: {
        id: 'BD2-BD-01-O',
        label: 'BD2-BD-01-O',
        area: 'Bedroom 2',
        coordinates: {
          x: 73,
          y: 335,
          width: 100,
          height: 90
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot2: {
        id: 'BD2-CG-01-O',
        label: 'BD2-CG-01-O',
        area: 'Bedroom 2',
        coordinates: {
          x: 73,
          y: 295,
          width: 25,
          height: 39
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot3: {
        id: 'BD2-CG-02-O',
        label: 'BD2-CG-02-O',
        area: 'Bedroom 2',
        coordinates: {
          x: 73,
          y: 425,
          width: 25,
          height: 35
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot4: {
        id: 'BD2-TB-01-O',
        label: 'BD2-TB-01-O',
        area: 'Bedroom 2',
        coordinates: {
          x: 197,
          y: 440,
          width: 25,
          height: 30
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot5: {
        id: 'BD2-ST-01-O',
        label: 'BD2-ST-01-O',
        area: 'Bedroom 2',
        coordinates: {
          x: 185,
          y: 442,
          width: 20,
          height: 22,
          rotation: 110
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      bedroom2Spot6: {
        id: 'BD2-CG-03-O',
        label: 'BD2-CG-03-O',
        area: 'Bedroom 2',
        coordinates: {
          x: 201,
          y: 340,
          width: 22,
          height: 100
        },
        labelStyle: {
          offset: { x: -4, y: -5 },
          fontSize: '10px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      officeSpot1: {
        id: 'OF-TB-01-O',
        label: 'OF-TB-01-O',
        area: 'Office/Den',
        coordinates: [
          { x: 229, y: 90 },
          { x: 229, y: 180 }, 
          { x: 255, y: 180 },  
          { x: 255, y: 117 },
          { x: 306, y: 117 }, 
          { x: 306, y: 90 }      
        ],
        labelStyle: {
          offset: { x: -14, y: 0 },
          fontSize: '7px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'vertical'
        }
      },
      officeSpot2: {
        id: 'OF-ST-01-O',
        label: 'OF-ST-01-O',
        area: 'Office/Den',
        coordinates: {
          x: 270,
          y: 105,
          width: 21,
          height: 25,
          rotation: -10
        },
        labelStyle: {
          offset: { x: 6, y: 0 },
          fontSize: '6px',
          fontWeight: '400',
          fontFamily: 'Arial',
          alignment: 'center',
          orientation: 'horizontal'
        }
      },
      kitchenSpot1: {
        id: 'KIT-ST-01-O',
        label: 'KIT-ST-01-O',
        area: 'Kitchen',
        coordinates: {
          x: 401,
          y: 274,
          width: 27,
          height: 27
        },
        labelStyle: {
          offset: { x: -7, y: 0 },
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
        id: 'KIT-ST-01-O',
        label: 'KIT-ST-01-O',
        area: 'Kitchen',
        coordinates: {
          x: 440,
          y: 274,
          width: 27,
          height: 27
        },
        labelStyle: {
          offset: { x: -7, y: 0 },
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
        id: 'KIT-ST-01-O',
        label: 'KIT-ST-01-O',
        area: 'Kitchen',
        coordinates: {
          x: 478,
          y: 274,
          width: 27,
          height: 27
        },
        labelStyle: {
          offset: { x: -7, y: 0 },
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
        id: 'LAN-ST-01-O',
        label: 'LAN-ST-01-O',
        area: 'Lanai',
        coordinates: {
          x: 690,
          y: 483,
          width: 27,
          height: 35,
          rotation: 30
        },
        labelStyle: {
          offset: { x: -7, y: 0 },
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
        id: 'LAN-ST-01-O',
        label: 'LAN-ST-01-O',
        area: 'Lanai',
        coordinates: {
          x: 630,
          y: 483,
          width: 27,
          height: 35,
          rotation: -31
        },
        labelStyle: {
          offset: { x: -7, y: 0 },
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
        id: 'LAN-TB-01-O',
        label: 'LAN-TB-01-O',
        area: 'Lanai',
        coordinates: {
          x: 662,
          y: 485,
          width: 22,
          height: 22
        },
        labelStyle: {
          offset: { x: -7, y: 0 },
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
      },
      // Example of a curved path
      // curvedCounter: {
      //   id: 'KIT-CT-01-O',
      //   label: 'Kitchen Counter-O',
      //   area: 'Kitchen',
      //   coordinates: {
      //     curve: {
      //       start: { x: 396, y: 200 },
      //       control1: { x: 446, y: 200 },
      //       control2: { x: 496, y: 250 },
      //       end: { x: 496, y: 300 }
      //     }
      //   }
      // }
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