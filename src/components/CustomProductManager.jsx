// components/CustomProductManager.jsx
// ✅ FIXED VERSION - Individual save buttons, no leading zero, auto expand

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Loader2, AlertCircle, Library, Lock, Edit2, Upload, File, X, Eye, ImageIcon, Check } from 'lucide-react';
import { backendServer } from '../utils/info';
import ProductSelectionModal from './ProductSelectionModal';
import ImageUploadField from './ImageUploadField';
import VendorSearchDropdown from './VendorSearchDropdown';

const CustomProductManager = ({ order, onSave, onBack }) => {
  const [customProducts, setCustomProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  
  // Floor plan state
  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanNotes, setFloorPlanNotes] = useState('');
  const [existingFloorPlan, setExistingFloorPlan] = useState(null);
  const [showFloorPlanPreview, setShowFloorPlanPreview] = useState(false);
  const [savingFloorPlan, setSavingFloorPlan] = useState(false);
  
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  useEffect(() => {
    if (order?.selectedProducts) {
      setCustomProducts(order.selectedProducts);
    }
    
    if (order?.customFloorPlan) {
      setExistingFloorPlan(order.customFloorPlan);
      setFloorPlanNotes(order.customFloorPlan.notes || '');
    }
  }, [order]);

  const handleAddFromLibrary = (selectedProducts) => {
    const newProducts = selectedProducts.map((product, idx) => {
      const defaultVariant = product.variants?.[0];
      const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
      const imageUrl = primaryImage?.url || defaultVariant?.image?.url;
      
      return {
        _id: product._id,
        product_id: product.product_id || `LIB-${Date.now()}`,
        name: product.name,
        category: product.category || 'Library Selection',
        spotName: 'Library Item',
        quantity: 1,
        unitPrice: defaultVariant?.price || 0,
        finalPrice: defaultVariant?.price || 0,
        vendor: null,
        sourceType: 'library',
        isEditable: false,
        selectedOptions: {
          image: imageUrl,
          finish: defaultVariant?.finish || '',
          fabric: defaultVariant?.fabric || '',
          size: defaultVariant?.size || '',
          images: product.images?.map(img => img.url).filter(Boolean) || [],
          links: [],
          specifications: product.description || '',
          notes: '',
          uploadedImages: [],
          customAttributes: {},
          poNumber: '',
          vendorOrderNumber: '',
          trackingInfo: '',
          deliveryStatus: ''
        }
      };
    });
    
    setCustomProducts(prev => {
      const updated = [...prev, ...newProducts];
      // ✅ Auto expand first new product
      if (newProducts.length > 0) {
        setExpandedProduct(prev.length);
      }
      return updated;
    });
  };

  const addManualProduct = () => {
    const newProduct = {
      _id: `temp_${Date.now()}`,
      product_id: `CUSTOM-${Date.now().toString().slice(-6)}`,
      name: '',
      category: '',
      spotName: 'Custom Item',
      quantity: 1,
      unitPrice: 0,
      finalPrice: 0,
      vendor: null,
      sourceType: 'manual',
      isEditable: true,
      selectedOptions: {
        images: [],
        links: [],
        specifications: '',
        notes: '',
        finish: '',
        fabric: '',
        size: '',
        uploadedImages: [],
        customAttributes: {},
        poNumber: '',
        vendorOrderNumber: '',
        trackingInfo: '',
        deliveryStatus: ''
      }
    };
    
    setCustomProducts(prev => {
      const updated = [...prev, newProduct];
      // ✅ Auto expand new product
      setExpandedProduct(updated.length - 1);
      return updated;
    });
  };

  const updateProduct = (index, field, value) => {
    setCustomProducts(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      const isLocked = !item.isEditable;
      const allowedWhenLocked = new Set(['quantity', 'vendor']);

      if (isLocked && !allowedWhenLocked.has(field)) {
        console.warn('Library products cannot be edited except quantity and vendor');
        return prev;
      }

      if (field.startsWith('selectedOptions.')) {
        const optionField = field.split('.')[1];
        item.selectedOptions = {
          ...item.selectedOptions,
          [optionField]: value
        };
      } else {
        item[field] = value;
      }

      if (field === 'unitPrice' || field === 'quantity') {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        item.finalPrice = qty * price;
      }

      updated[index] = { ...item };
      return updated;
    });
  };

  const removeProduct = (index) => {
    if (window.confirm('Remove this product?')) {
      setCustomProducts(prev => prev.filter((_, i) => i !== index));
      if (expandedProduct === index) {
        setExpandedProduct(null);
      }
    }
  };

  const handleFloorPlanSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFloorPlanFile(file);
      setExistingFloorPlan(null);
    }
  };

  const removeFloorPlan = () => {
    setFloorPlanFile(null);
    setExistingFloorPlan(null);
    setFloorPlanNotes('');
  };

  const getFloorPlanPreviewUrl = () => {
    if (floorPlanFile) {
      return URL.createObjectURL(floorPlanFile);
    }
    if (existingFloorPlan?.url) {
      return existingFloorPlan.url;
    }
    if (existingFloorPlan?.data) {
      return `data:${existingFloorPlan.contentType};base64,${existingFloorPlan.data}`;
    }
    return null;
  };

  // ✅ NEW: Save individual floor plan
  const handleSaveFloorPlan = async () => {
    setSavingFloorPlan(true);
    try {
      const token = localStorage.getItem('token');
      let floorPlanData = existingFloorPlan;
      
      if (floorPlanFile) {
        const formData = new FormData();
        formData.append('floorPlan', floorPlanFile);
        formData.append('notes', floorPlanNotes);

        const floorPlanResponse = await fetch(
          `${backendServer}/api/orders/${order._id}/floor-plan`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData
          }
        );

        if (!floorPlanResponse.ok) {
          const errorData = await floorPlanResponse.json();
          throw new Error(errorData.message || 'Floor plan upload failed');
        }

        const result = await floorPlanResponse.json();
        
        if (result.success && result.data) {
          floorPlanData = result.data;
          setExistingFloorPlan(floorPlanData);
          setFloorPlanFile(null);
          alert('✅ Floor plan saved successfully!');
        }
      } else if (existingFloorPlan && floorPlanNotes !== existingFloorPlan.notes) {
        // Update notes only
        const orderResponse = await fetch(
          `${backendServer}/api/orders/${order._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              customFloorPlan: {
                ...existingFloorPlan,
                notes: floorPlanNotes
              }
            }),
          }
        );

        if (orderResponse.ok) {
          alert('✅ Floor plan notes saved!');
        }
      }
    } catch (error) {
      console.error('❌ Error saving floor plan:', error);
      alert(`❌ Failed to save floor plan: ${error.message}`);
    } finally {
      setSavingFloorPlan(false);
    }
  };

  const previewUrl = getFloorPlanPreviewUrl();
  const isImageFile = (floorPlanFile?.type || existingFloorPlan?.contentType || '').startsWith('image/');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🎨 Custom Product Manager
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {order?.clientInfo?.name} • Unit {order?.clientInfo?.unitNumber}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Order List
            </button>
            
            <button
              onClick={() => setShowLibraryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
            >
              <Library className="w-5 h-5" />
              Browse Library
            </button>
            
            <button
              onClick={addManualProduct}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-lg shadow hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {customProducts.length === 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Two Ways to Add Products:
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Browse Library</strong>: Select from existing product catalog</li>
                  <li><strong>Add Product</strong>: Create new products with custom attributes</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floor Plan Upload */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              📐 Custom Floor Plan (Optional)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload custom floor plan image or document
            </p>
          </div>
          
          {/* ✅ FIX: Always show save button when floor plan section is visible */}
          {(floorPlanFile || existingFloorPlan) && (
            <button
              onClick={handleSaveFloorPlan}
              disabled={savingFloorPlan}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
            >
              {savingFloorPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Floor Plan
                </>
              )}
            </button>
          )}
        </div>

        {!floorPlanFile && !existingFloorPlan ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#005670] transition-colors">
            <input
              type="file"
              id="floorPlanUpload"
              className="hidden"
              onChange={handleFloorPlanSelect}
              accept="image/*,.pdf,.dwg,.dxf"
            />
            <label htmlFor="floorPlanUpload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload floor plan
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF, DWG, DXF up to 10MB
              </p>
            </label>
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {isImageFile && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Floor plan preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <File className="w-16 h-16 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {floorPlanFile?.name || existingFloorPlan?.filename || 'Floor Plan'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {floorPlanFile 
                        ? `${(floorPlanFile.size / 1024).toFixed(1)} KB • ${floorPlanFile.type}`
                        : existingFloorPlan 
                          ? `${(existingFloorPlan.size / 1024).toFixed(1)} KB • ${existingFloorPlan.contentType}`
                          : 'Custom floor plan'
                      }
                    </p>
                    {existingFloorPlan?.uploadedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded {new Date(existingFloorPlan.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {previewUrl && (
                      <button
                        onClick={() => setShowFloorPlanPreview(true)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={removeFloorPlan}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={floorPlanNotes}
                    onChange={(e) => setFloorPlanNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] resize-none"
                    rows={2}
                    placeholder="Add notes about this floor plan..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {customProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Products Added
            </h3>
            <p className="text-gray-600 mb-6">
              Select from library or create manual products
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLibraryModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
              >
                <Library className="w-5 h-5" />
                Browse Library
              </button>
              <button
                onClick={addManualProduct}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-lg shadow hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ Simple Product Count Header */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Products ({customProducts.length})
              </h3>
            </div>
            
            {customProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                order={order}
                expanded={expandedProduct === index}
                onToggleExpand={() => {
                  // Toggle this specific product
                  setExpandedProduct(expandedProduct === index ? null : index);
                }}
                onUpdate={updateProduct}
                onRemove={removeProduct}
                onSaved={() => {
                  if (onSave) onSave(customProducts);
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Products Summary */}
      {customProducts.length > 0 && (
        <div className="bg-gray-100 rounded-xl p-4 mt-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Total Products: </span>
              <strong className="text-gray-900">{customProducts.length}</strong>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-purple-600 font-medium">
                {customProducts.filter(p => p.sourceType === 'library').length} Library
              </span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-[#005670] font-medium">
                {customProducts.filter(p => p.sourceType === 'manual').length} Manual
              </span>
            </div>
            <div className="text-lg font-bold text-[#005670]">
              Total: ${customProducts.reduce((sum, p) => sum + p.finalPrice, 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Floor Plan Preview Modal */}
      {showFloorPlanPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFloorPlanPreview(false)}>
          <div className="max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {floorPlanFile?.name || existingFloorPlan?.filename}
              </h3>
              <button
                onClick={() => setShowFloorPlanPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {isImageFile ? (
                <img
                  src={previewUrl}
                  alt="Floor plan"
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-center py-20">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {floorPlanFile?.name || existingFloorPlan?.filename}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ProductSelectionModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelectProducts={handleAddFromLibrary}
        alreadySelected={customProducts.filter(p => p.sourceType === 'library').map(p => p._id)}
      />
    </div>
  );
};

// ==================== PRODUCT CARD COMPONENT ====================
const ProductCard = ({ product, index, order, expanded, onToggleExpand, onUpdate, onRemove, onSaved }) => {
  const [customAttrs, setCustomAttrs] = useState(
    product.selectedOptions?.customAttributes || {}
  );
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const getAllImages = () => {
    const images = [];
    
    if (product.selectedOptions?.image) {
      images.push({
        url: product.selectedOptions.image,
        type: 'url',
        source: 'primary'
      });
    }
    
    if (product.selectedOptions?.images?.length > 0) {
      product.selectedOptions.images.forEach(url => {
        if (url && !images.find(img => img.url === url)) {
          images.push({
            url,
            type: 'url',
            source: 'gallery'
          });
        }
      });
    }
    
    if (product.selectedOptions?.uploadedImages?.length > 0) {
      product.selectedOptions.uploadedImages.forEach((img) => {
        const url =
          img.url ||
          img.previewUrl ||
          (img.data ? `data:${img.contentType};base64,${img.data}` : null);

        if (!url) return;

        images.push({
          url,
          type: 'uploaded',
          source: 'uploaded',
          filename: img.filename,
        });
      });
    }
    
    return images;
  };

  const allImages = getAllImages();
  const primaryImage = allImages[0]?.url;

  const addCustomAttribute = () => {
    if (!newAttrKey.trim()) return;
    
    const updated = {
      ...customAttrs,
      [newAttrKey]: newAttrValue
    };
    
    setCustomAttrs(updated);
    onUpdate(index, 'selectedOptions.customAttributes', updated);
    setNewAttrKey('');
    setNewAttrValue('');
  };

  const removeCustomAttribute = (key) => {
    const updated = { ...customAttrs };
    delete updated[key];
    setCustomAttrs(updated);
    onUpdate(index, 'selectedOptions.customAttributes', updated);
  };

  // ✅ NEW: Individual product save
  const handleSaveProduct = async () => {
    if (!product.name || product.unitPrice <= 0) {
      alert('❌ Product must have a Name and Price!');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // ✅ FIX: Use parent component's customProducts state directly
      // Build the updated products array from current state
      const currentProducts = order.selectedProducts || [];
      
      // Find this product in the current products array
      let updatedProducts;
      
      // Check if this is a new product (temp ID)
      const isNewProduct = product._id && typeof product._id === 'string' && product._id.startsWith('temp_');
      
      if (isNewProduct) {
        // New product - add to array
        const cleanProduct = { ...product };
        delete cleanProduct._id; // Remove temp ID
        
        updatedProducts = [
          ...currentProducts,
          {
            product_id: cleanProduct.product_id,
            name: cleanProduct.name,
            category: cleanProduct.category || '',
            spotName: cleanProduct.spotName || 'Custom Item',
            quantity: cleanProduct.quantity || 1,
            unitPrice: cleanProduct.unitPrice || 0,
            finalPrice: cleanProduct.finalPrice || 0,
            vendor: cleanProduct.vendor || null,
            sourceType: cleanProduct.sourceType || 'manual',
            isEditable: cleanProduct.isEditable !== undefined ? cleanProduct.isEditable : true,
            selectedOptions: {
              finish: cleanProduct.selectedOptions?.finish || '',
              fabric: cleanProduct.selectedOptions?.fabric || '',
              size: cleanProduct.selectedOptions?.size || '',
              insetPanel: cleanProduct.selectedOptions?.insetPanel || '',
              image: cleanProduct.selectedOptions?.image || '',
              images: cleanProduct.selectedOptions?.images || [],
              links: cleanProduct.selectedOptions?.links || [],
              specifications: cleanProduct.selectedOptions?.specifications || '',
              notes: cleanProduct.selectedOptions?.notes || '',
              uploadedImages: cleanProduct.selectedOptions?.uploadedImages || [],
              customAttributes: cleanProduct.selectedOptions?.customAttributes || {},
              poNumber: cleanProduct.selectedOptions?.poNumber || '',
              vendorOrderNumber: cleanProduct.selectedOptions?.vendorOrderNumber || '',
              trackingInfo: cleanProduct.selectedOptions?.trackingInfo || '',
              deliveryStatus: cleanProduct.selectedOptions?.deliveryStatus || ''
            },
            placement: cleanProduct.placement || null
          }
        ];
      } else {
        // Existing product - update in array
        updatedProducts = currentProducts.map((p) => {
          // Match by _id or product_id
          if (p._id === product._id || p.product_id === product.product_id) {
            return {
              ...(product._id && { _id: product._id }),
              product_id: product.product_id,
              name: product.name,
              category: product.category || '',
              spotName: product.spotName || 'Custom Item',
              quantity: product.quantity || 1,
              unitPrice: product.unitPrice || 0,
              finalPrice: product.finalPrice || 0,
              vendor: product.vendor || null,
              sourceType: product.sourceType || 'manual',
              isEditable: product.isEditable !== undefined ? product.isEditable : true,
              selectedOptions: {
                finish: product.selectedOptions?.finish || '',
                fabric: product.selectedOptions?.fabric || '',
                size: product.selectedOptions?.size || '',
                insetPanel: product.selectedOptions?.insetPanel || '',
                image: product.selectedOptions?.image || '',
                images: product.selectedOptions?.images || [],
                links: product.selectedOptions?.links || [],
                specifications: product.selectedOptions?.specifications || '',
                notes: product.selectedOptions?.notes || '',
                uploadedImages: product.selectedOptions?.uploadedImages || [],
                customAttributes: product.selectedOptions?.customAttributes || {},
                poNumber: product.selectedOptions?.poNumber || '',
                vendorOrderNumber: product.selectedOptions?.vendorOrderNumber || '',
                trackingInfo: product.selectedOptions?.trackingInfo || '',
                deliveryStatus: product.selectedOptions?.deliveryStatus || ''
              },
              placement: product.placement || null
            };
          }
          return p;
        });
      }

      // Save to server
      const saveResponse = await fetch(
        `${backendServer}/api/orders/${order._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedProducts: updatedProducts,
            status: 'ongoing',
            step: 2
          }),
        }
      );

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      const result = await saveResponse.json();
      
      console.log('✅ Save successful:', result);
      alert('✅ Product saved successfully!');
      
      // Update local state with server response
      if (onSaved) onSaved();
      
    } catch (error) {
      console.error('❌ Error saving product:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">
      {/* Compact Header */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 cursor-pointer hover:border-[#005670] transition-colors relative"
            onClick={() => allImages.length > 0 && setShowImageGallery(true)}
            title="Click to view images"
          >
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                +{allImages.length - 1}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                product.sourceType === 'library'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {product.sourceType === 'library' ? (
                  <>
                    <Lock className="w-3 h-3" />
                    Library #{index + 1}
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" />
                    Manual #{index + 1}
                  </>
                )}
              </span>
            </div>
            <h4 className="font-bold text-gray-900 truncate">
              {product.name || 'Untitled Product'}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {product.product_id} • Qty: {product.quantity} • ${product.finalPrice.toFixed(2)}
            </p>
            
            {allImages.length > 0 && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {allImages.length} image{allImages.length !== 1 ? 's' : ''} • Click thumbnail to view
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {allImages.length > 0 && (
              <button
                onClick={() => setShowImageGallery(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Images"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onToggleExpand}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Details"
            >
              <Edit2 className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove Product"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal - UNCHANGED */}
      {showImageGallery && allImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowImageGallery(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm opacity-90">
                    Image {currentImageIndex + 1} of {allImages.length}
                  </p>
                </div>
                <button
                  onClick={() => setShowImageGallery(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-[60vh]">
              <img
                src={allImages[currentImageIndex].url}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Image load error');
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext x="200" y="200" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="16"%3EImage Load Error%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {allImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex gap-2 overflow-x-auto justify-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? 'border-white scale-110'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 border-t border-gray-200 space-y-6">
          {product.sourceType === 'library' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Read-Only Product
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    This product is from the library. Only quantity and vendor can be changed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Code *
              </label>
              <input
                type="text"
                value={product.product_id}
                onChange={(e) => onUpdate(index, 'product_id', e.target.value)}
                disabled={!product.isEditable}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                disabled={!product.isEditable}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category/Location
              </label>
              <input
                type="text"
                value={product.category}
                onChange={(e) => onUpdate(index, 'category', e.target.value)}
                disabled={!product.isEditable}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price ($) *
              </label>
              {/* ✅ FIX: Proper decimal handling without leading zero */}
              <input
                type="text"
                inputMode="decimal"
                value={product.unitPrice === 0 ? '' : product.unitPrice}
                onChange={(e) => {
                  let value = e.target.value;
                  
                  // Allow empty (will become 0)
                  if (value === '') {
                    onUpdate(index, 'unitPrice', 0);
                    return;
                  }
                  
                  // Remove leading zeros except for "0." pattern
                  value = value.replace(/^0+(?=\d)/, '');
                  
                  // Allow only numbers and ONE decimal point with max 2 decimals
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    // Store as string while typing
                    onUpdate(index, 'unitPrice', value);
                  }
                }}
                onBlur={(e) => {
                  // Convert to number on blur
                  let value = e.target.value;
                  if (value === '' || value === '.') {
                    onUpdate(index, 'unitPrice', 0);
                  } else {
                    const numValue = parseFloat(value) || 0;
                    onUpdate(index, 'unitPrice', numValue);
                  }
                }}
                disabled={!product.isEditable}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300">
                <p className="text-xs text-gray-500 mb-1">Total Price</p>
                <p className="text-xl font-bold text-gray-900">
                  ${product.finalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor (Optional)
            </label>
            <VendorSearchDropdown
              selectedVendor={product.vendor}
              onSelectVendor={(vendorId) => onUpdate(index, 'vendor', vendorId)}
              disabled={false}
            />
          </div>

          {/* INSTALL BINDER SECTION */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#005670]" />
              Install Binder Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Order (PO #)
                </label>
                <input
                  type="text"
                  value={product.selectedOptions?.poNumber || ''}
                  onChange={(e) => onUpdate(index, 'selectedOptions.poNumber', e.target.value)}
                  disabled={!product.isEditable}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
                  placeholder="Tim-2289995"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Order Number
                </label>
                <input
                  type="text"
                  value={product.selectedOptions?.vendorOrderNumber || ''}
                  onChange={(e) => onUpdate(index, 'selectedOptions.vendorOrderNumber', e.target.value)}
                  disabled={!product.isEditable}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
                  placeholder="353502018743"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Tracking Info
                </label>
                <input
                  type="text"
                  value={product.selectedOptions?.trackingInfo || ''}
                  onChange={(e) => onUpdate(index, 'selectedOptions.trackingInfo', e.target.value)}
                  disabled={!product.isEditable}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100"
                  placeholder="UPS (1Z61RE120340475585)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery/Order Status
                </label>
                <textarea
                  value={product.selectedOptions?.deliveryStatus || ''}
                  onChange={(e) => onUpdate(index, 'selectedOptions.deliveryStatus', e.target.value)}
                  disabled={!product.isEditable}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 resize-none"
                  rows={2}
                  placeholder="12/23/25 Delivered&#10;12/18/25 Shipped&#10;12/16/25 Placed order online; eta 1/6/26"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Install Binder Fields:</strong> These fields will appear in the Install Binder document for tracking vendor orders, shipments, and delivery status.
              </p>
            </div>
          </div>

          {product.isEditable && (
            <>
              {/* Custom Attributes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Custom Attributes</h4>
                
                {Object.keys(customAttrs).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(customAttrs).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Attribute</p>
                            <p className="text-sm font-semibold text-gray-900">{key}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Value</p>
                            <p className="text-sm text-gray-900">{value}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomAttribute(key)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Add Custom Attribute
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newAttrKey}
                      onChange={(e) => setNewAttrKey(e.target.value)}
                      placeholder="Attribute name (e.g., 'warranty')"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                    />
                    <input
                      type="text"
                      value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      placeholder="Value (e.g., '5 years')"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                    />
                    <button
                      onClick={addCustomAttribute}
                      disabled={!newAttrKey.trim()}
                      className="px-6 py-2 bg-[#005670] text-white rounded-lg hover:bg-[#007a9a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <ImageUploadField
                orderId={order._id}
                images={product.selectedOptions?.uploadedImages || []}
                onImagesChange={(images) => onUpdate(index, 'selectedOptions.uploadedImages', images)}
              />

              {/* Reference Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Links (one per line)
                </label>
                <textarea
                  value={product.selectedOptions?.links?.join('\n') || ''}
                  onChange={(e) => onUpdate(index, 'selectedOptions.links', e.target.value.split('\n').filter(Boolean))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] resize-none font-mono text-xs"
                  rows={2}
                  placeholder="https://vendor.com/product-page"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={product.selectedOptions?.notes || ''}
                  onChange={(e) => onUpdate(index, 'selectedOptions.notes', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] resize-none"
                  rows={3}
                  placeholder="Special instructions, vendor notes, delivery details, or any other additional information..."
                />
              </div>
            </>
          )}

          {/* ✅ Individual Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveProduct}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-semibold shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomProductManager;