import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Truck, 
  CreditCard, 
  Check, 
  Upload, 
  Wrench, 
  Phone, 
  Mail, 
  Shield,
  Clock,
  FileText,
  ChevronRight,
  X,
  Loader,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';
import { backendServer } from '../../utils/info';
import { FLOOR_PLAN_TYPES } from '../../config/floorPlans';
import { generateFurnitureAreas, getPlanDimensions } from './floorPlanConfig';
import Furniture360Viewer from './Furniture360Viewer';

// ProductImageZoom component
const ProductImageZoom = ({ imageUrl, altText, onLoad, onError }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const maxX = (containerRef.current.offsetWidth * (zoomLevel - 1)) / 2;
      const maxY = (containerRef.current.offsetHeight * (zoomLevel - 1)) / 2;
      
      setPosition({
        x: Math.min(Math.max(e.clientX - dragStart.x, -maxX), maxX),
        y: Math.min(Math.max(e.clientY - dragStart.y, -maxY), maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragStart, zoomLevel]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-move flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full h-auto w-auto object-contain transition-transform duration-200"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: 'center',
          }}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
        {zoomLevel > 1 && (
          <div className="text-xs text-gray-600 mr-1">{Math.round(zoomLevel * 100)}%</div>
        )}
        <button 
          onClick={handleZoomOut} 
          disabled={zoomLevel <= 1}
          className="p-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleZoomIn} 
          disabled={zoomLevel >= 3}
          className="p-1.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
      </div>
      
      {zoomLevel > 1 && (
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg text-xs text-gray-600 flex items-center gap-1">
          <Move size={14} />
          <span>Drag to pan</span>
        </div>
      )}
    </div>
  );
};

// ProductDetailModal component
const ProductDetailModal = ({ product, onClose }) => {
  const [detailImageLoading, setDetailImageLoading] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);

  const getMediaType = (url) => {
    if (!url) return 'none';
    const lower = url.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) return 'video';
    if (lower.endsWith('.obj')) return '3d';
    return 'image';
  };

  const getSelectedVariant = () => {
    if (!product.variants?.length) return null;
    return (
      product.variants.find(
        (v) =>
          (!product.selectedOptions?.fabric || v.fabric === product.selectedOptions.fabric) &&
          (!product.selectedOptions?.finish || v.finish === product.selectedOptions.finish) &&
          (!product.selectedOptions?.size || v.size === product.selectedOptions.size) &&
          (!product.selectedOptions?.insetPanel || v.insetPanel === product.selectedOptions.insetPanel)
      ) || product.variants[0]
    );
  };

  const selectedVariant = getSelectedVariant();
  const mediaType = getMediaType(product.selectedOptions?.image);
  const has3DModel = selectedVariant?.model?.url;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full m-4 overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{product.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {has3DModel && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShow3DModel(false)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !show3DModel ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Image View
            </button>
            <button
              onClick={() => setShow3DModel(true)}
              className={`px-4 py-2 rounded-lg transition-all ${
                show3DModel ? 'bg-[#005670] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              3D Model
            </button>
          </div>
        )}

        <div className="space-y-8">
          <div className="relative w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-inner">
            {detailImageLoading && !show3DModel && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader className="w-12 h-12 text-[#005670] animate-spin" />
              </div>
            )}

            {show3DModel && has3DModel ? (
              <iframe
                src={selectedVariant.model.url}
                className="w-full h-full rounded-lg border-0"
                title="3D Model"
                onLoad={() => setDetailImageLoading(false)}
              />
            ) : mediaType === '3d' && product.selectedOptions?.image ? (
              <Furniture360Viewer
                objUrl={product.selectedOptions.image}
                mtlUrl={product.selectedOptions.image.replace(/\.obj$/i, '.mtl')}
                initialRotation={{ x: 0, y: 30, z: 0 }}
                autoRotate={true}
                onLoad={() => setDetailImageLoading(false)}
              />
            ) : mediaType === 'video' && product.selectedOptions?.image ? (
              <video
                src={product.selectedOptions.image}
                controls
                autoPlay
                loop
                muted
                className="max-w-full max-h-full h-auto w-auto object-contain rounded-lg"
                onLoadedData={() => setDetailImageLoading(false)}
                onError={() => setDetailImageLoading(false)}
              />
            ) : product.selectedOptions?.image ? (
              <ProductImageZoom
                imageUrl={product.selectedOptions.image}
                altText={product.name}
                onLoad={() => setDetailImageLoading(false)}
                onError={() => setDetailImageLoading(false)}
              />
            ) : (
              <div className="flex items-center justify-center flex-col">
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No product image available</span>
                </div>
              </div>
            )}
          </div>

          {product.description && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">Description</h4>
              <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}

          {product.dimension && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">Dimension</h4>
              <div className="p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                <p className="text-gray-600 text-sm leading-relaxed">{product.dimension}</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 text-lg">Product Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{product.spotName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{product.quantity}</span>
              </div>
              {product.selectedOptions?.finish && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Finish:</span>
                  <span className="font-medium">{product.selectedOptions.finish}</span>
                </div>
              )}
              {product.selectedOptions?.fabric && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fabric:</span>
                  <span className="font-medium">{product.selectedOptions.fabric}</span>
                </div>
              )}
              {product.selectedOptions?.size && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{product.selectedOptions.size}</span>
                </div>
              )}
              {product.selectedOptions?.insetPanel && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Inset Panel:</span>
                  <span className="font-medium">{product.selectedOptions.insetPanel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#005670] text-white rounded-lg hover:bg-opacity-90 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = ({ 
  totalAmount, 
  paymentDetails, 
  onPaymentSetup, 
  designSelections, 
  selectedPlan, 
  clientInfo,  
  orderId,
  floorPlanImage
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const packageType = selectedPlan?.id?.split('-')[0];
  const baseBudget = FLOOR_PLAN_TYPES[packageType]?.budgets[selectedPlan?.id] || 
                    FLOOR_PLAN_TYPES[packageType]?.budgets.default;
  const packageSelected = FLOOR_PLAN_TYPES[packageType]?.title || '';

  // Generate floor plan data for interactive view
  const planDimensions = useMemo(() => {
    try {
      return getPlanDimensions(selectedPlan.id);
    } catch (error) {
      console.error('Error getting plan dimensions:', error);
      return { width: 1000, height: 800 };
    }
  }, [selectedPlan.id]);

  const furnitureSpots = useMemo(() => {
    try {
      return generateFurnitureAreas(selectedPlan.id);
    } catch (error) {
      console.error('Error generating furniture areas:', error);
      return {};
    }
  }, [selectedPlan.id]);

  // Create mapping of occupied spots based on selected products
  const occupiedSpots = useMemo(() => {
    const spots = {};
    if (designSelections?.selectedProducts) {
      designSelections.selectedProducts.forEach(product => {
        if (product.spotId) {
          spots[product.spotId] = product._id;
        }
      });
    }
    return spots;
  }, [designSelections?.selectedProducts]);

  // Function to view selected product details
  const handleViewSelectedProduct = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/${product._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const fullProductData = await response.json();
      
      const productWithSelections = {
        ...fullProductData,
        selectedOptions: product.selectedOptions,
        quantity: product.quantity,
        finalPrice: product.finalPrice,
        spotId: product.spotId,
        spotName: product.spotName
      };
      
      setViewingProduct(productWithSelections);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setViewingProduct(product);
    }
  };

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const PaymentStatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'uploaded':
          return 'bg-blue-100 text-blue-800';
        case 'verified':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleFileUpload = async (file, installmentIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to upload this payment proof? Once uploaded, you cannot change the file."
    );
  
    if (!confirmed) return;

    try {
      setUploadingIndex(installmentIndex);
  
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('installmentIndex', installmentIndex);
  
      const updatedPaymentDetails = { ...paymentDetails };
      updatedPaymentDetails.installments[installmentIndex].status = 'uploaded';
      updatedPaymentDetails.installments[installmentIndex].proofOfPayment = {
        filename: file.name,
        uploadDate: new Date()
      };
      onPaymentSetup(updatedPaymentDetails);
  
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload payment proof');
      }
  
      alert('Payment proof uploaded successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      alert('Failed to upload payment proof. Please try again.');
      
      const revertedPaymentDetails = { ...paymentDetails };
      revertedPaymentDetails.installments[installmentIndex].status = 'pending';
      revertedPaymentDetails.installments[installmentIndex].proofOfPayment = null;
      onPaymentSetup(revertedPaymentDetails);
    } finally {
      setUploadingIndex(null);
    }
  };

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <div className="bg-white p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3 text-[#005670]">Bank Transfer Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium">Bank Central Asia (BCA)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium">1234567890</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">Henderson Design</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium">HDG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>
        );
      
      case 'wire_transfer':
        return (
          <div className="bg-white p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3 text-[#005670]">Wire Transfer Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium">Bank Central Asia (BCA)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">SWIFT Code</p>
                <p className="font-medium">CENAIDJA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium">1234567890</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">Henderson Design</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Address</p>
                <p className="font-medium">BCA KCU Mangga Dua, Jakarta</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium">HDG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>
        );

      case 'cheque':
        return (
          <div className="bg-white p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3 text-[#005670]">Cheque Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Pay to the Order of</p>
                <p className="font-medium">Henderson Design</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium">Henderson Design Office</p>
                <p className="text-gray-600">Jl. MH Thamrin No. 1</p>
                <p className="text-gray-600">Jakarta 10310</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium">HDG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <p className="text-sm text-yellow-700">
                  Please write the reference number on the back of your cheque.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#005670] p-3">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Henderson Design Group Concierge
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="mb-2">
                <h4 className="font-medium text-[#005670]">Mark Henderson</h4>
                <p className="text-sm text-gray-600">Director of Business Development</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#005670]/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-[#005670]" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Contact Number</p>
                  <p className="text-sm font-medium">(808) 747-7127</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#005670]/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-[#005670]" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium">mark@henderson.house</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-600">
                  Available Monday through Friday
                  <br />8:00 AM - 6:00 PM HST
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#005670] p-3">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Project Information
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Client Name</p>
                <p className="text-sm font-medium">{clientInfo?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Unit Number</p>
                <p className="text-sm font-medium">{clientInfo?.unitNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Floor Plan</p>
                <p className="text-sm font-medium">{selectedPlan?.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Package</p>
                <p className="text-sm font-medium">{packageSelected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-3">
          <h3 className="text-base font-medium text-white flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Order Summary
          </h3>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-base font-semibold">
            <span>Total Investment</span>
            <span className="text-[#005670]">${baseBudget.toLocaleString()} (Not Including Tax)</span>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => setActiveTab('products')}
              className="text-[#005670] hover:underline text-sm flex items-center justify-center mx-auto"
            >
              View all selected products
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-3">
          <h3 className="text-base font-medium text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Schedule
          </h3>
        </div>
        <div className="p-4">
          {paymentDetails?.installments?.slice(0, 1).map((installment, index) => (
            <div key={index} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">
                    First Payment (50%) - ${(baseBudget * 0.5).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(installment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <PaymentStatusBadge status={installment.status} />
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => setActiveTab('payments')}
              className="text-[#005670] hover:underline text-sm flex items-center justify-center mx-auto"
            >
              View full payment schedule and options
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFloorPlanTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4 text-[#005670]">
        Your Selected Layout
      </h3>
      <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${planDimensions.width} ${planDimensions.height}`} 
          className="w-full h-full"
        >
          {floorPlanImage && (
            <image
              href={floorPlanImage}
              width={planDimensions.width}
              height={planDimensions.height}
              preserveAspectRatio="xMidYMid meet"
            />
          )}
          
          {Object.values(furnitureSpots).map((spot) => {
            const isOccupied = occupiedSpots[spot.id];
            const product = designSelections?.selectedProducts?.find(p => p.spotId === spot.id);
            
            return (
              <g key={spot.id}>
                <path
                  d={spot.path}
                  transform={spot.transform}
                  data-spot-id={spot.id}
                  fill={isOccupied ? "rgba(203, 213, 225, 0.3)" : "transparent"}
                  stroke={isOccupied ? "#94a3b8" : "rgba(203, 213, 225, 0.5)"}
                  strokeWidth="2"
                  cursor={isOccupied ? "pointer" : "default"}
                  onClick={() => {
                    if (isOccupied && product) {
                      handleViewSelectedProduct(product);
                    }
                  }}
                />
                {isOccupied && product ? (
                  <>
                    <text
                      x={spot.labelPosition.x}
                      y={spot.labelPosition.y - 10}
                      textAnchor="middle"
                      fill="#005670"
                      style={{
                        fontSize: spot.labelStyle.fontSize,
                        fontWeight: 'bold',
                        fontFamily: spot.labelStyle.fontFamily
                      }}
                    >
                      ✓
                    </text>
                    <text
                      x={spot.labelPosition.x}
                      y={spot.labelPosition.y + 10}
                      textAnchor="middle"
                      fill="#64748b"
                      style={{
                        fontSize: '10px',
                        fontFamily: spot.labelStyle.fontFamily
                      }}
                    >
                      {product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                    </text>
                  </>
                ) : (
                  <text
                    x={spot.labelPosition.x}
                    y={spot.labelPosition.y}
                    textAnchor={spot.labelStyle.alignment === 'left' ? 'start' : 
                              spot.labelStyle.alignment === 'right' ? 'end' : 'middle'}
                    fill="#666"
                    style={{
                      fontSize: spot.labelStyle.fontSize,
                      fontWeight: spot.labelStyle.fontWeight,
                      fontFamily: spot.labelStyle.fontFamily
                    }}
                    transform={spot.labelStyle.orientation === 'vertical' 
                      ? `rotate(-90, ${spot.labelPosition.x}, ${spot.labelPosition.y})`
                      : undefined}
                    dominantBaseline={spot.labelStyle.orientation === 'vertical' ? 'text-before-edge' : 'central'}
                  >
                    {spot.area}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <h4 className="text-lg font-semibold text-gray-700">Floor Plan Guide</h4>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-[#94a3b8] bg-[rgba(203,213,225,0.3)]"></div>
              <span className="text-sm text-gray-600">Selected Products</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-[rgba(203,213,225,0.5)] bg-transparent"></div>
              <span className="text-sm text-gray-600">Available Areas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 bg-[#005670] text-white rounded-full text-xs">✓</div>
              <span className="text-sm text-gray-600">Click selected areas to view product details</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-center">
        <div className="relative max-w-md">
          <div className="absolute left-[19px] top-[32px] bottom-8 w-0.5 bg-gray-200" />
          
          <div className="space-y-8">
            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Engage with Henderson</h4>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Client Registration</h4>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Design Selection</h4>
                <p className="text-xs text-gray-600">2/20/2025</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Purchasing Agreement</h4>
                <p className="text-xs text-[#005670]">In Progress</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Production Phase</h4>
                <p className="text-xs text-gray-600">Expected start: Q2 2026</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Progress Payment</h4>
                <p className="text-xs text-gray-600">To be scheduled</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Delivery & Installation</h4>
                <p className="text-xs text-gray-600">Q3 2026</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Final Reveal</h4>
                <p className="text-xs text-gray-600">To be scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="text-base font-medium mb-3">Select Payment Method</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleMethodSelect('bank_transfer')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:border-[#005670] hover:bg-[#005670]/5
              ${paymentMethod === 'bank_transfer' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <Building2 
              className={`w-6 h-6 ${paymentMethod === 'bank_transfer' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center text-sm ${paymentMethod === 'bank_transfer' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Bank Transfer
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('wire_transfer')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:border-[#005670] hover:bg-[#005670]/5
              ${paymentMethod === 'wire_transfer' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <CreditCard 
              className={`w-6 h-6 ${paymentMethod === 'wire_transfer' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center text-sm ${paymentMethod === 'wire_transfer' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Wire Transfer
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('cheque')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:border-[#005670] hover:bg-[#005670]/5
              ${paymentMethod === 'cheque' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <Check 
              className={`w-6 h-6 ${paymentMethod === 'cheque' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center text-sm ${paymentMethod === 'cheque' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Cheque
            </span>
          </button>
        </div>

        {renderPaymentDetails()}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="text-base font-medium mb-3">Payment Schedule</h4>
        <div className="space-y-3">
          {paymentDetails?.installments?.map((installment, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm">
                    {index === 0 ? `First Payment (50%) - ${(baseBudget * 0.5).toLocaleString()}` :
                     index === 1 ? `Second Payment (25%) - ${(baseBudget * 0.25).toLocaleString()}` :
                     `Final Payment (25%) - ${(baseBudget * 0.25).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(installment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <PaymentStatusBadge status={installment.status} />
              </div>

              {installment.proofOfPayment && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Upload Date: {new Date(installment.proofOfPayment.uploadDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium">
                      File: {installment.proofOfPayment.filename}
                    </p>
                    {installment.proofOfPayment.url && (
                      <a 
                        href={installment.proofOfPayment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#005670] hover:underline text-xs"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              )}

              {(installment.status === 'pending' || installment.status === 'rejected') && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id={`payment-proof-${index}`}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], index);
                      }
                    }}
                  />
                  <label
                    htmlFor={`payment-proof-${index}`}
                    className="cursor-pointer inline-flex items-center px-3 py-1 text-sm bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {uploadingIndex === index ? 'Uploading...' : 
                     installment.status === 'rejected' ? 'Upload New Proof' : 
                     'Upload Payment Proof'}
                  </label>
                </div>
              )}

              {installment.status === 'uploaded' && (
                <p className="text-xs text-blue-600 mt-1">
                  Payment proof is under review.
                </p>
              )}
              {installment.status === 'verified' && (
                <p className="text-xs text-green-600 mt-1">
                  Payment has been verified.
                </p>
              )}
              {installment.status === 'rejected' && (
                <p className="text-xs text-red-600 mt-1">
                  Payment proof was rejected.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-3">
        {designSelections?.selectedProducts?.map((product, index) => (
          <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
            <div className="relative w-16 h-16 flex-shrink-0">
              {product.selectedOptions?.image?.toLowerCase().endsWith('.mp4') ? (
                <video
                  src={product.selectedOptions.image}
                  className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  autoPlay
                  loop
                  muted
                  onClick={() => handleViewSelectedProduct(product)}
                  onError={(e) => {
                    console.error(`Error loading video for ${product.name}:`, e);
                    e.target.style.display = 'none';
                    const img = document.createElement('img');
                    img.src = '/images/placeholder.png';
                    img.className = 'w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity';
                    img.alt = product.name;
                    img.onclick = () => handleViewSelectedProduct(product);
                    e.target.parentNode.insertBefore(img, e.target);
                  }}
                />
              ) : (
                <img
                  src={product.selectedOptions?.image || '/images/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleViewSelectedProduct(product)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.png';
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <button
                onClick={() => handleViewSelectedProduct(product)}
                className="text-left w-full"
              >
                <h4 className="font-medium text-sm text-[#005670] hover:text-[#005670]/80 underline hover:no-underline cursor-pointer transition-all">
                  {product.name}
                </h4>
              </button>
              <p className="text-xs text-gray-600">Location: {product.spotName}</p>
              {product.selectedOptions && (
                <div>
                  <p className="text-xs text-gray-600">
                    {product.selectedOptions.finish && `Finish: ${product.selectedOptions.finish}`}
                    {product.selectedOptions.fabric && `, Fabric: ${product.selectedOptions.fabric}`}
                  </p>
                  {(product.selectedOptions.size || product.selectedOptions.insetPanel) && (
                    <p className="text-xs text-gray-600">
                      {product.selectedOptions.size && `Size: ${product.selectedOptions.size}`}
                      {product.selectedOptions.size && product.selectedOptions.insetPanel && ', '}
                      {product.selectedOptions.insetPanel && `Panel: ${product.selectedOptions.insetPanel}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    Quantity: {product.quantity}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
  
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between font-semibold">
          <span>Total Investment</span>
          <span className="text-[#005670]">${baseBudget.toLocaleString()} (Not Including Tax)</span>
        </div>
      </div>
    </div>
  );

  const renderWarrantyTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h4 className="font-medium text-base mb-1">Coverage Period</h4>
        <p className="text-sm text-gray-600">
          Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-base mb-1">Scope of Warranty</h4>
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 mt-1 rounded-full bg-[#005670] shrink-0"></div>
            <p className="text-xs text-gray-600">Workmanship, Materials, and Functionality: The warranty covers defects under normal wear and tear conditions.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 mt-1 rounded-full bg-[#005670] shrink-0"></div>
            <p className="text-xs text-gray-600">Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will repair or replace the item.</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-base mb-1">Returns and Exchanges</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-xs mb-1">No Returns</h5>
            <p className="text-xs text-gray-600">Items are not eligible for returns.</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-xs mb-1">No Exchanges</h5>
            <p className="text-xs text-gray-600">Exchanges are not permitted except for defects.</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-xs mb-1">Custom Items</h5>
            <p className="text-xs text-gray-600">Custom items are not eligible for returns.</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-base mb-2">Warranty Exclusions</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="space-y-1">
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Negligence or accidents after installation</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Incorrect maintenance</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Non-residential or commercial use</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Natural color/grain variations</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Fabric wear or colorfastness</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Filling materials softening</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Damage from sun exposure</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Use of fabric protectants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'floorplan':
        return renderFloorPlanTab();
      case 'timeline':
        return renderTimelineTab();
      case 'payments':
        return renderPaymentsTab();
      case 'products':
        return renderProductsTab();
      case 'warranty':
        return renderWarrantyTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-medium text-[#005670]">Project Details & Payment</h2>
        <p className="text-sm text-gray-600">Review your project details and manage payments</p>
      </div>

      <div className="hidden md:flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'overview' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('floorplan')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'floorplan' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Floor Plan
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'timeline' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'payments' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'products' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'warranty' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Warranty
        </button>
      </div>

      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
        >
          <span className="font-medium text-[#005670]">
            {activeTab === 'floorplan' ? 'Floor Plan' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
          <ChevronRight className={`h-5 w-5 transition-transform ${showMobileMenu ? 'rotate-90' : ''}`} />
        </button>

        {showMobileMenu && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                setActiveTab('overview');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('floorplan');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Floor Plan
            </button>
            <button
              onClick={() => {
                setActiveTab('timeline');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Timeline
            </button>
            <button
              onClick={() => {
                setActiveTab('payments');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Payments
            </button>
            <button
              onClick={() => {
                setActiveTab('products');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab('warranty');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Warranty
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="px-1">
        {renderTabContent()}
      </div>

      {/* Product Detail Modal */}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
};

export default PaymentPage;