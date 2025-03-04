export const customCConfig = {
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
};