import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone,
  Mail,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  Zap,
  Home,
  Info,
  Heart,
  X
} from 'lucide-react';
import { backendServer } from '../../utils/info';
import { FLOOR_PLAN_TYPES } from '../../config/floorPlans';

const FloorPlanSelection = ({ onNext, showNavigationButtons }) => {
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    unitNumber: '',
    floorPlan: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingPackageType, setPendingPackageType] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [occupiedSpots, setOccupiedSpots] = useState({});
  const [designSelections, setDesignSelections] = useState(null);
  const [activeTab, setActiveTab] = useState('packages');
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGalleryPackage, setActiveGalleryPackage] = useState(null);
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  // Add this to your state declarations at the top of the component
  const [currentSlideIndices, setCurrentSlideIndices] = useState({});

  // Add this useEffect to handle slideshow rotation
  useEffect(() => {
    // Initialize slide indices for each package
    const indices = {};
    Object.keys(floorPlanTypes).forEach(typeId => {
      indices[typeId] = 0;
    });
    setCurrentSlideIndices(indices);

    // Set up slideshow timers for each package
    const timers = {};
    Object.keys(floorPlanTypes).forEach(typeId => {
      timers[typeId] = setInterval(() => {
        setCurrentSlideIndices(prev => ({
          ...prev,
          [typeId]: (prev[typeId] + 1) % galleryImages[typeId].length
        }));
      }, 5000);
    });

    return () => {
      // Clean up all timers
      Object.values(timers).forEach(timer => clearInterval(timer));
    };
  }, []);

  // Add these navigation functions
  const nextSlide = (packageType, e) => {
    e.stopPropagation();
    setCurrentSlideIndices(prev => ({
      ...prev,
      [packageType]: (prev[packageType] + 1) % galleryImages[packageType].length
    }));
  };

  const prevSlide = (packageType, e) => {
    e.stopPropagation();
    setCurrentSlideIndices(prev => ({
      ...prev,
      [packageType]: (prev[packageType] - 1 + galleryImages[packageType].length) % galleryImages[packageType].length
    }));
  };
  

  const handlePackageSelect = (packageType) => {
    const currentPackage = localStorage.getItem('selectedPackage');
    const existingProducts = localStorage.getItem('selectedProducts');
    const hasProducts = existingProducts && JSON.parse(existingProducts).length > 0;

    if (packageType === currentPackage) {
      setSelectedPlanType(packageType);
      localStorage.setItem('selectedPackage', packageType);
      return;
    }

    if ((currentPackage != null && currentPackage !== packageType)) {
      setPendingPackageType(packageType);
      setShowWarningModal(true);
    } else {
      setSelectedPlanType(packageType);
      localStorage.setItem('selectedPackage', packageType);
      setSelectedPlan(null);
    }
  };
  
  const confirmPackageChange = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const newFloorPlan = floorPlanTypes[pendingPackageType].plans.find(plan =>
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      );
  
      const response = await fetch(`${backendServer}/api/orders/user-order`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const existingOrder = await response.json();
        if (existingOrder) {
          await fetch(`${backendServer}/api/orders/${existingOrder._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...existingOrder,
              selectedPlan: newFloorPlan,
              selectedProducts: [],
              occupiedSpots: {},
              status: 'ongoing',
              step: 2
            })
          });
        }
      }
  
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      localStorage.removeItem('designSelections');
      
      setSelectedPlanType(pendingPackageType);
      localStorage.setItem('selectedPackage', pendingPackageType);
      setSelectedPlan(newFloorPlan);
      setDesignSelections(null);
      setSelectedProducts([]);
      setOccupiedSpots({});
      
      setShowWarningModal(false);
      setPendingPackageType(null);
  
    } catch (error) {
      console.error('Error handling package change:', error);
      alert('There was an error changing packages. Please try again.');
    }
  };

  const openGallery = (packageType) => {
    setActiveGalleryPackage(packageType);
    setCurrentGalleryImage(0);
    setShowGalleryModal(true);
  };

  const galleryImages = {
    investor: [  // For Mauka
      '/images/investor_a.png',
      '/images/investor_b.png',
      '/images/investor_c.png',
      '/images/investor_d.png',
      '/images/investor_e.png'
    ],
    custom: [  // For Makai
      '/images/owner_a.png',
      '/images/owner_b.png',
      '/images/owner_c.png',
      '/images/owner_d.png',
      '/images/owner_e.png'
    ]
  };
  
  const floorPlanTypes = FLOOR_PLAN_TYPES;
  
  // Then only add default images for types that don't have defined images
  Object.keys(floorPlanTypes).forEach(typeId => {
    console.log(typeId);
    if (!galleryImages[typeId]) {
      galleryImages[typeId] = [
        '/images/SAS00201.jpg',
        '/images/SAS00274.jpg',
        '/images/SAS00286.jpg',
        '/images/SAS00319.jpg'
      ];
    }
  });

  // Add this object with the updated descriptions
  const packageDescriptions = {
    investor: {
      title: "Nalu",
      features: [
        "Designed for cost-conscious investors or homeowners looking for a stylish yet budget-friendly solution",
        "Streamlined selection of furniture styles and finishes for efficiency and value",
        "Durable, high-performance fabrics to withstand high turnover and guest use",
        "Thoughtfully curated pieces to maximize functionality and appeal for rental properties",
        "Quick and efficient procurement process"
      ]
    },
    custom: {
      title: "Lani",
      features: [
        "Expanded selection of furniture styles and finishes for a more personalized look",
        "Premium materials, including quality woods and high-end finishes",
        "High-performance fabrics that combine durability with a luxurious feel",
        "Semi-customization options to better match the owner's aesthetic and lifestyle",
        "Elevated design details and craftsmanship for a refined, long-lasting interior",
        "Quick and efficient procurement process"
      ]
    }
  };

  // Mock testimonials for each package
  const testimonials = {
    premium: [
      {
        text: "The Premium package transformed our space beyond our expectations. The furniture quality is exceptional, and our guests always compliment the design.",
        author: "James & Emma W.",
        location: "Tower 2, Unit 1503"
      },
      {
        text: "Working with Henderson Design Group was seamless. The premium furnishings make our vacation home feel luxurious yet comfortable.",
        author: "Sarah T.",
        location: "Tower 1, Unit 2210"
      }
    ],
    deluxe: [
      {
        text: "The Deluxe package perfectly balances sophistication and comfort. The designer understood exactly what we wanted for our island home.",
        author: "Michael & Lisa K.",
        location: "Tower 3, Unit 1820"
      },
      {
        text: "We couldn't be happier with our Henderson-designed space. The deluxe furnishings are both beautiful and practical for our rental property.",
        author: "Robert J.",
        location: "Tower 2, Unit 1105"
      }
    ]
  };

  const renderPackages = () => {
    return (
      <div className="space-y-10">
      {Object.values(floorPlanTypes).map(type => {
        const clientPlan = type.plans.find(plan =>
          plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
        );

        const image_link = clientPlan.image;
        
        const budget = clientPlan ? 
          type.budgets[clientPlan.id] || type.budgets.default : 
          type.budgets.default;
        
        // Add this line to define packageInfo
        const packageInfo = packageDescriptions[type.id] || { 
          title: type.title, 
          features: [] 
        };
  
          
          // Benefits list customized for each package type
          const benefits = type.id === 'premium' ? [
            { icon: <Star className="w-5 h-5 text-amber-400" />, text: "Luxury furnishings from renowned brands" },
            { icon: <Clock className="w-5 h-5 text-[#005670]" />, text: "Priority delivery and installation" },
            { icon: <Shield className="w-5 h-5 text-emerald-600" />, text: "Extended warranty protection" }
          ] : [
            { icon: <Heart className="w-5 h-5 text-rose-500" />, text: "Carefully curated designer selections" },
            { icon: <Zap className="w-5 h-5 text-amber-500" />, text: "Energy-efficient lighting packages" },
            { icon: <DollarSign className="w-5 h-5 text-emerald-500" />, text: "Excellent value for investment" }
          ];
  
          return (
            <div key={type.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
              <div className="grid md:grid-cols-12 gap-0">
              {/* Left column - Image Slideshow */}
              <div className="md:col-span-5 relative">
                <div className="relative w-full h-full min-h-[400px]">
                  {/* Images */}
                  {galleryImages[type.id].map((img, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        currentSlideIndices[type.id] === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    </div>
                  ))}
                  
                  {/* Navigation arrows */}
                  <button 
                    onClick={(e) => prevSlide(type.id, e)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={(e) => nextSlide(type.id, e)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Slide indicators */}
                  <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-10">
                    {galleryImages[type.id].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlideIndices({
                          ...currentSlideIndices,
                          [type.id]: index
                        })}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          currentSlideIndices[type.id] === index ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* <div className="absolute bottom-4 left-4 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openGallery(type.id);
                      }}
                      className="px-4 py-2 bg-white/90 hover:bg-white rounded-md text-sm font-medium text-[#005670] flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Home className="h-4 w-4" />
                      View Gallery
                    </button>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-[#005670] text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                    Most Popular
                  </div> */}
                  
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
              </div>
                
                {/* Right column - Content */}
                <div className="md:col-span-7 p-7 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold text-[#005670]">
                    {packageInfo.title}
                  </h3>
                  <div className="flex items-center">
                    {/* 5 stars for visual appeal */}
                    {/* {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))} */}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-5">Customizable with curated selection</p>
                
                <div className="space-y-3 my-4">
                  {packageInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 text-[#005670]">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>      

                  {/* Testimonial preview */}
                  {testimonials[type.id] && testimonials[type.id][0] && (
                    <div className="mt-auto">
                      <div className="bg-gray-50 p-4 rounded-lg italic text-gray-600 text-sm border-l-4 border-[#005670] mb-4">
                        "{testimonials[type.id][0].text.length > 120 ? 
                          testimonials[type.id][0].text.substring(0, 120) + '...' : 
                          testimonials[type.id][0].text}"
                        <div className="mt-2 font-medium not-italic text-gray-800">
                          {testimonials[type.id][0].author}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end items-center mt-auto">
                    <p className="text-[#005670] font-medium text-xl mr-6">
                      ${budget.toLocaleString()} <span className="text-sm font-normal text-gray-500">(Not Including Tax)</span>
                    </p>
                    
                    <button
                      onClick={() => handlePackageSelect(type.id)}
                      className="px-5 py-2.5 bg-[#005670] text-white rounded-md hover:bg-opacity-90 transition-all font-medium shadow-sm"
                    >
                      Select Package
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFloorPlans = () => {
    return (
      <>
        <button
          onClick={() => setSelectedPlanType(null)}
          className="text-[#005670] hover:underline mb-6 flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Package Types
        </button>
        
        <div className="space-y-8">
          {floorPlanTypes[selectedPlanType].plans.filter(plan => 
            plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
          ).map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-white rounded-lg shadow-sm cursor-pointer transition-all
                ${selectedPlan === plan.id ? 'ring-2 ring-[#005670]' : 'hover:shadow-md'}`}
            >
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-8 relative">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  />
                  {selectedPlan === plan.id && (
                    <div className="absolute top-4 right-4 bg-[#005670] text-white rounded-full p-2">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="col-span-12 md:col-span-4 p-6">
                  <h3 className="text-xl font-medium mb-3 text-[#005670]">
                    {plan.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Key Features:</h4>
                  <ul className="space-y-2 mb-6">
                    {plan.details.map((detail, index) => (
                      <li key={index} className="text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#005670] rounded-full mr-2"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-2 rounded-md transition-all ${
                      selectedPlan === plan.id 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-[#005670] text-white hover:bg-opacity-90'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select This Floor Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const WarningModal = () => showWarningModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#005670]">Change Package?</h3>
          <button 
            onClick={() => setShowWarningModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mb-6 text-gray-600">
          Changing packages will remove all your current furniture selections. Would you like to proceed?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowWarningModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={confirmPackageChange}
            className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );

  const GalleryModal = () => showGalleryModal && activeGalleryPackage && (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl mx-auto">
        <button 
          onClick={() => setShowGalleryModal(false)}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="relative h-[70vh]">
          <img 
            src={galleryImages[activeGalleryPackage][currentGalleryImage]} 
            alt={`${floorPlanTypes[activeGalleryPackage].title} gallery image`}
            className="w-full h-full object-contain"
          />
          
          {/* Navigation arrows */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentGalleryImage((prev) => 
                (prev - 1 + galleryImages[activeGalleryPackage].length) % galleryImages[activeGalleryPackage].length
              );
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentGalleryImage((prev) => 
                (prev + 1) % galleryImages[activeGalleryPackage].length
              );
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-center mt-6 gap-3">
          {galleryImages[activeGalleryPackage].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentGalleryImage(index)}
              className={`w-3 h-3 rounded-full transition-transform duration-300 ${
                currentGalleryImage === index 
                ? 'bg-white scale-125' 
                : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <div className="absolute bottom-6 left-6 bg-black/60 text-white px-3 py-1.5 rounded-md text-sm font-medium">
          {currentGalleryImage + 1} / {galleryImages[activeGalleryPackage].length}
        </div>
      </div>
    </div>
  );

  const fetchClientInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch(`${backendServer}/api/clients/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClientInfo({
          name: data.name,
          unitNumber: data.unitNumber,
          floorPlan: data.floorPlan
        });
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

  useEffect(() => {
    if (selectedPlanType && clientInfo.floorPlan) {
      const availablePlans = floorPlanTypes[selectedPlanType].plans.filter(plan => 
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      );
      
      if (availablePlans.length === 1) {
        setSelectedPlan(availablePlans[0].id);
      }
    }
  }, [selectedPlanType, clientInfo.floorPlan]);

  const validateForm = () => {
    const newErrors = {};
    const availablePlans = selectedPlanType ? 
      floorPlanTypes[selectedPlanType].plans.filter(plan => 
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      ) : [];
      
    if (availablePlans.length === 1) {
      setSelectedPlan(availablePlans[0].id);
    } else if (!selectedPlan) {
      newErrors.plan = 'Please select a floor plan';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const selectedPlanData = floorPlanTypes[selectedPlanType].plans.find(
        plan => plan.id === selectedPlan
      );
      onNext({ 
        selectedPlan: selectedPlanData,
        clientInfo,
        package: selectedPlanType
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-[#005670] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#005670]">Loading your personalized experience...</p>
      </div>
    );
  }

  const renderTabContent = () => {
    if (selectedPlanType) {
      return renderFloorPlans();
    }
    
    switch (activeTab) {
      case 'packages':
        return renderPackages();
      case 'info':
        return renderInfoTab();
      case 'warranty':
        return renderWarrantyTab();
      default:
        return renderPackages();
    }
  };

  const renderInfoTab = () => (
    <div className="space-y-6">
      {/* Client Information Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600">Name</label>
              <p className="font-medium text-lg">{clientInfo.name}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Unit Number</label>
              <p className="font-medium text-lg">{clientInfo.unitNumber}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Floor Plan</label>
              <p className="font-medium text-lg">{clientInfo.floorPlan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* HDG Concierge Contact Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Henderson Design Group Concierge
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="mb-4">
              <h4 className="font-medium text-lg text-[#005670]">Mark Henderson</h4>
              <p className="text-gray-600">Director of Business Development</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#005670]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-medium">(808) 747-7127</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-[#005670]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">mark@henderson.house</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Available Monday through Friday
                <br />8:00 AM - 6:00 PM HST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWarrantyTab = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-[#005670] p-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Henderson Design Group Warranty Terms and Conditions
        </h3>
      </div>
      <div className="p-6">
        {/* Coverage Period */}
        <div className="mb-8">
          <h4 className="font-medium text-lg mb-2">Coverage Period</h4>
          <p className="text-gray-600">
            Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.
          </p>
        </div>

        {/* Scope of Warranty */}
        <div className="mb-8">
          <h4 className="font-medium text-lg mb-2">Scope of Warranty</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 mt-2 rounded-full bg-[#005670]"></div>
              <p className="text-gray-600">Workmanship, Materials, and Functionality: The warranty covers defects in workmanship, materials, and functionality under normal wear and tear conditions.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 mt-2 rounded-full bg-[#005670]"></div>
              <p className="text-gray-600">Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will, at its discretion, either repair or replace the defective item.</p>
            </div>
          </div>
        </div>

        {/* Returns and Exchanges */}
        <div className="mb-8">
          <h4 className="font-medium text-lg mb-2">Returns and Exchanges</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">No Returns</h5>
              <p className="text-sm text-gray-600">Items are not eligible for returns.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">No Exchanges</h5>
              <p className="text-sm text-gray-600">Exchanges are not permitted except in cases of defects.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Custom Items</h5>
              <p className="text-sm text-gray-600">Custom items, including upholstery, are not eligible for returns or exchanges.</p>
            </div>
          </div>
        </div>

        {/* Exclusions */}
        <div>
          <h4 className="font-medium text-lg mb-3">Warranty Exclusions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                <p className="text-gray-600">Negligence, misuse, or accidents after installation</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                <p className="text-gray-600">Incorrect or inadequate maintenance</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                <p className="text-gray-600">Non-residential use or commercial conditions</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                <p className="text-gray-600">Natural variations in color, grain, or texture of materials</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                <p className="text-gray-600">Damage from extensive sun exposure</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                <p className="text-gray-600">Use of fabric protectants may void warranty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            This warranty applies to normal household use only. Please refer to your Care and Maintenance guide for proper furniture care instructions.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#003b4d] to-[#005670] rounded-lg p-8 mb-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-light mb-4">Welcome, <span className="font-medium">{clientInfo.name}</span></h1>
          <p className="text-lg opacity-90 mb-4 leading-relaxed">Your dream home awaits. Select a design package that resonates with your lifestyle and transforms your space into something truly extraordinary.</p>
          <p className="text-sm opacity-80">Unit {clientInfo.unitNumber} • {clientInfo.floorPlan} Floor Plan</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex border-b">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'packages' ? 'border-[#005670] text-[#005670]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Design Packages
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'info' ? 'border-[#005670] text-[#005670]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Your Information
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'warranty' ? 'border-[#005670] text-[#005670]' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Warranty Information
        </button>
      </div>

      {/* Design Process Steps - Visual guide */}
      {/* {activeTab === 'packages' && !selectedPlanType && (
        <div className="mb-10">
          <h2 className="text-xl font-medium mb-6 text-[#005670]">Your Design Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-[#005670] text-white flex items-center justify-center font-medium mb-3">1</div>
              <h3 className="font-medium mb-2">Select Package</h3>
              <p className="text-sm text-gray-600">Choose the design style and budget that matches your vision</p>
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">You are here</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium mb-3">2</div>
              <h3 className="font-medium mb-2">Customize Design</h3>
              <p className="text-sm text-gray-600">Personalize your selections with our virtual designer</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium mb-3">3</div>
              <h3 className="font-medium mb-2">Review & Finalize</h3>
              <p className="text-sm text-gray-600">Confirm your choices and submit your design preferences</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium mb-3">4</div>
              <h3 className="font-medium mb-2">Production & Delivery</h3>
              <p className="text-sm text-gray-600">We handle everything from ordering to white-glove installation</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Contact Float Button - Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowContactInfo(!showContactInfo)}
          className="w-14 h-14 rounded-full bg-[#005670] text-white shadow-lg flex items-center justify-center"
        >
          {showContactInfo ? <X className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
        </button>
        
        {showContactInfo && (
          <div className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-xl p-4 animate-fade-in">
            <h4 className="font-medium mb-2 text-[#005670]">Need assistance?</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#005670]" />
                <a href="tel:8087477127" className="text-sm">(808) 747-7127</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#005670]" />
                <a href="mailto:mark@henderson.house" className="text-sm">mark@henderson.house</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      {selectedPlanType && selectedPlan && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-[#005670] text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2"
          >
            Continue to Customize
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}

      {/* Modals */}
      <WarningModal />
      <GalleryModal />
    </div>
  );
};

export default FloorPlanSelection;