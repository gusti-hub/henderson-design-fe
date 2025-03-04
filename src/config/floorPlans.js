// config/floorPlans.js

export const FLOOR_PLAN_TYPES = {
    investor: {
      id: 'investor',
      title: 'Mauka Package',
      description: 'Customizable with curated selection', 
      availablePlans: '6 floor plans available',
      image: '/images/investor_plan/investor_1.png',
      budgets: {
        'investor-a': 80835,  // 2 Bedroom
        'investor-b': 124467, // 2 Bedroom + 2.5 Bath
        'investor-c': 115000, // 2 Bedroom + Den
        'investor-d': 65000,  // 1 Bedroom
        'investor-e': 70000,  // 2 Bedroom
        'investor-f': 120000, // 3 Bedroom + Den
        default: 80000       // Default if not specified
      },
      plans: [
        {
          id: 'investor-a',
          title: 'Residence 05A',
          description: '1 Bedroom / 1.5 Bath, Level: 7-37 (Odd)',
          image: '/images/investor_plan/Alia_05A.png',
          details: [
            'Total: 819 Sq. Ft.',
            'Interior: 761 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'investor-b',
          title: 'Residence 03A',
          description: '2 Bedroom / 2.5 Bath + Den, Level: 8-38 (Even), 39',
          image: '/images/investor_plan/Alia_03A.png',
          details: [
            'Total: 1,525 Sq. Ft.',
            'Interior: 1,435 Sq. Ft.',
            'Lanai: 90 Sq. Ft.'
          ]
        },
        {
          id: 'investor-c',  
          title: 'Residence 03B',
          description: '2 Bedroom / 2.5 Bath + Den, Level: 7-37 (Odd)',
          image: '/images/investor_plan/Alia_03B.png',
          details: [
            'Total: 1,493 Sq. Ft.',
            'Interior: 1,435 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        }
      ]
    },
    custom: {
      id: 'custom',
      title: 'Makai Package',
      description: 'Customizable with curated selection',
      availablePlans: '10 floor plans available',
      image: '/images/custom_plan/custom_1.png',
      budgets: {
        'custom-a': 133414,  // 2 Bedroom
        'custom-b': 189542,  // 2 Bedroom + 2.5 Bath
        'custom-c': 147000,  // 2 Bedroom + Den
        'custom-d': 85000,   // 1 Bedroom
        'custom-e': 90000,   // 2 Bedroom
        'custom-f': 140000,  // 3 Bedroom + Den
        default: 100000     // Default if not specified
      },
      plans: [
        {
          id: 'custom-a',
          title: 'Residence 05A', 
          description: '1 Bedroom / 1.5 Bath, Level: 7-37 (Odd)',
          image: '/images/custom_plan/Alia_05A.png',
          details: [
            'Total: 819 Sq. Ft.',
            'Interior: 761 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'custom-b',
          title: 'Residence 03A',
          description: '2 Bedroom / 2.5 Bath + Den, Level: 8-38 (Even), 39',
          image: '/images/custom_plan/Alia_03A.png',
          details: [
            'Total: 1,525 Sq. Ft.',
            'Interior: 1,435 Sq. Ft.',
            'Lanai: 90 Sq. Ft.'
          ]
        },
        {
          id: 'custom-c',
          title: 'Residence 03B',
          description: '2 Bedroom / 2.5 Bath + Den, Level: 7-37 (Odd)',
          image: '/images/custom_plan/Alia_03B.png',
          details: [
            'Total: 1,493 Sq. Ft.',
            'Interior: 1,435 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        }
      ]
    }
   };