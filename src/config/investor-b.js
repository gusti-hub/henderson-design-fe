export const investorBConfig = {
  id: 'investor-b',
  dimensions: { width: 800, height: 600 },
  furniture: {
    // Original dining table
    diningTable1: {
      id: 'DIN-TB-01-O',
      label: 'DIN-TB-01-O',
      area: 'Dining Room',
      coordinates: {
        x: 277,
        y: 315,
        width: 45,
        height: 95
      },
      labelStyle: {
        offset: { x: -9, y: -15 },
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
        x: 290,
        y: 332,
        width: 17,
        height: 55
      },
      labelStyle: {
        offset: { x: -9, y: -15 },
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
        x: 265,
        y: 384,
        width: 24,
        height: 21
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        x: 265,
        y: 352,
        width: 24,
        height: 21
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        x: 265,
        y: 320,
        width: 24,
        height: 21
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        y: 320,
        width: 24,
        height: 21
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        y: 352,
        width: 24,
        height: 21
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        y: 384,
        width: 24,
        height: 21
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        x: 266,
        y: 219,
        width: 67,
        height: 18
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        x: 475,
        y: 372,
        width: 30,
        height: 44
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        { x: 415, y: 315 },
        { x: 499, y: 315 },
        { x: 499, y: 328 },
        { x: 490, y: 328 },
        { x: 490, y: 350 },
        { x: 499, y: 350 },
        { x: 499, y: 360 },
        { x: 460, y: 360 },
        { x: 460, y: 442 },
        { x: 415, y: 442 },
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
        x: 525,
        y: 413,
        width: 31,
        height: 35,
        rotation: -45
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
        x: 512,
        y: 437,
        width: 17,
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
        x: 489,
        y: 326,
        width: 22,
        height: 25
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        x: 398,
        y: 315,
        width: 18,
        height: 127
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
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
        y: 337,
        width: 22,
        height: 80
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
        fontSize: '6px',
        fontWeight: '400',
        fontFamily: 'Arial',
        alignment: 'center',
        orientation: 'horizontal'
      }
    },
    livingSpot8: {
      id: 'LIV-TB-05-O',
      label: 'LIV-TB-05-O',
      area: 'Living Room',
      coordinates: {
        x: 423,
        y: 443,
        width: 37,
        height: 13
      },
      labelStyle: {
        offset: { x: -4, y: -15 },
        fontSize: '6px',
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
        x: 648,
        y: 325,
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
        x: 725,
        y: 287,
        width: 23,
        height: 37
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
        x: 725,
        y: 415,
        width: 23,
        height: 37
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
        y: 333,
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
        x: 592,
        y: 420,
        width: 21,
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
        x: 601,
        y: 427,
        width: 26,
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
        x: 70,
        y: 330,
        width: 97,
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
        x: 66,
        y: 307,
        width: 20,
        height: 20
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
        x: 66,
        y: 420,
        width: 22,
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
    bedroom2Spot6: {
      id: 'BD2-CG-03-O',
      label: 'BD2-CG-03-O',
      area: 'Bedroom 2',
      coordinates: {
        x: 198,
        y: 325,
        width: 24,
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
      coordinates: {
        x: 228,
        y: 80,
        width: 21,
        height: 70      
      },
      labelStyle: {
        offset: { x: -14, y: -15 },
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
        x: 241,
        y: 88,
        width: 21,
        height: 21,
      },
      labelStyle: {
        offset: { x: 6, y: -15 },
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
        x: 417,
        y: 259,
        width: 20,
        height: 18
      },
      labelStyle: {
        offset: { x: -7, y: -15 },
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
        x: 445,
        y: 259,
        width: 20,
        height: 18
      },
      labelStyle: {
        offset: { x: -7, y: -15 },
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
        x: 472,
        y: 259,
        width: 20,
        height: 18
      },
      labelStyle: {
        offset: { x: -7, y: -15 },
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
        x: 385,
        y: 481,
        width: 31,
        height: 35,
        rotation: 50
      },
      labelStyle: {
        offset: { x: -7, y: -15 },
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
        x: 325,
        y: 481,
        width: 31,
        height: 35,
        rotation: -50
      },
      labelStyle: {
        offset: { x: -7, y: -15 },
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
        x: 359,
        y: 506,
        width: 23,
        height: 24
      },
      labelStyle: {
        offset: { x: -7, y: -15 },
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
    //       start: { x: 396, y: 170 },
    //       control1: { x: 446, y: 170 },
    //       control2: { x: 496, y: 220 },
    //       end: { x: 496, y: 270 }
    //     }
    //   }
    // }
  }
};