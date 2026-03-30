// components/CustomProductManager.jsx
// ✅ FULL UPDATE: Tab layout, ShipToVendorDropdown, Net Cost bidirectional,
//    Sidemark, Group, Tags, ItemClass, VendorDescription, new Status fields

import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, FileText, Loader2, AlertCircle,
  Library, Lock, Edit2, Upload, File, X, Eye, ImageIcon, Check,
  Package, Truck, DollarSign, ClipboardList, Activity, Tag
} from 'lucide-react';
import { backendServer } from '../utils/info';
import ProductSelectionModal from './ProductSelectionModal';
import ImageUploadField from './ImageUploadField';
import VendorSearchDropdown from './VendorSearchDropdown';
import ShipToVendorDropdown from './ShipToVendorDropdown';
import StatusReportFields from './StatusReportFields';
import PricingFields from './PricingFields';

// ==================== TAB DEFINITIONS ====================

const PRODUCT_TABS = [
  { id: 'general',       label: 'General Info',  icon: Package },
  { id: 'details',       label: 'Item Details',  icon: Tag },
  { id: 'shipping',      label: 'Shipping',       icon: Truck },
  { id: 'pricing',       label: 'Pricing',        icon: DollarSign },
  { id: 'installbinder', label: 'Install Binder', icon: ClipboardList },
  { id: 'status',        label: 'Status',         icon: Activity },
];

// ==================== DROPDOWN OPTIONS ====================

const ITEM_CLASS_OPTIONS = [
  'Accessories',
  'Accessories & Art',
  'Accessories-1',
  'Appliances',
  'Case Goods',
  'Custom - soft goods (decorative pillows)',
  'Fabric',
  'Flooring',
  'Lighting',
  'Wall Covering',
  'Window Covering',
  'Construction Scope',
  'Furniture',
  'Labor',
  'Reupholstery',
  'Rugs',
  'Upholstery',
];

const ROOM_OPTIONS = [
  'COURTYARD',
  'EXTERIOR ENTRY',
  'INTERIOR ENTRY',
  'FOYER',
  'KITCHEN',
  'PANTRY',
  'BREAKFAST NOOK',
  'DINING ROOM',
  'LIVING ROOM',
  'GREAT ROOM',
  'FAMILY ROOM',
  'DEN',
  'WET BAR',
  'MEDIA ROOM',
  'HALLWAY 1',
  'HALLWAY 2',
  'MAIN LANAI',
  'BBQ AREA',
  'POOL LANAI',
  'POWDER ROOM',
  'POOL AREA',
  'POOL BATH',
  'PAVILLION',
  'GYM',
  'OFFICE 1',
  'OFFICE 2',
  'WINE ROOM',
  'REC ROOM',
  'GARAGE',
  'PRIMARY BEDROOM',
  'PRIMARY BATHROOM',
  'PRIMARY CLOSET',
  'PRIMARY BEDROOM LANAI',
  'BEDROOM 2',
  'BATHROOM 2',
  'BEDROOM 2 CLOSET',
  'BEDROOM 2 LANAI',
  'BEDROOM 3',
  'BATHROOM 3',
  'BEDROOM 3 CLOSET',
  'BEDROOM 3 LANAI',
  'BEDROOM 4',
  'BATHROOM 4',
  'BEDROOM 4 CLOSET',
  'BEDROOM 4 LANAI',
  'SITTING ROOM',
];

const CFA_OPTIONS = [
  'Approved',
  'Rejected',
  'Waived',
  'Pending',
];

// ==================== DEFAULT SELECTED OPTIONS ====================

const defaultSelectedOptions = () => ({
  // General Info
  image: '',
  images: [],
  links: [],
  specifications: '',
  notes: '',
  finish: '',
  fabric: '',
  size: '',
  sidemark: '',
  group: '',
  tags: [],
  itemClass: '',
  cfaSampleApproval: '',
  vendorDescription: '',
  uploadedImages: [],
  customAttributes: {},
  // Shipping — vendor dropdown + auto-filled address fields
  shipToVendorId: null,
  shipToName: '',
  shippingStreet: '',
  shippingCity: '',
  shippingState: '',
  shippingPostalCode: '',
  shippingCountry: '',
  shipToPhone: '',
  // Install Binder
  poNumber: '',
  vendorOrderNumber: '',
  trackingInfo: '',
  deliveryStatus: '',
  // Status Report
  room: '',
  statusCategory: '',
  proposalNumber: '',
  shipTo: '',
  orderDate: '',
  expectedShipDate: '',
  expectedArrivalDate: '',
  dateReceived: '',
  dateInspected: '',
  estimatedDeliveryDate: '',
  shippingCarrier: '',
  orderStatus: '',
  nextStep: '',
  nextStepDate: '',
  warehouseReceivingNumber: '',
  // Pricing
  units: 'Each',
  msrp: 0,
  discountPercent: 0,
  netCostOverride: null,
  noNetPurchaseCost: false,
  discountTaken: '',
  shippingCost: 0,
  otherCost: 0,
  markupPercent: 50,
  shippingMarkupPercent: 50,
  otherMarkupPercent: 50,
  depositPercent: 90,
  vendorDepositPercent: 0,
  salesTaxRate: 8.75,
  taxableCost: true,
  taxableMarkup: true,
  taxableShippingCost: true,
  taxableShippingMarkup: true,
  taxableOtherCost: true,
  taxableOtherMarkup: true,
});

// ==================== MAIN COMPONENT ====================

const CustomProductManager = ({ order, onSave, onBack }) => {
  const [customProducts, setCustomProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);

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
    const newProducts = selectedProducts.map((product) => {
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
          ...defaultSelectedOptions(),
          image: imageUrl,
          finish: defaultVariant?.finish || '',
          fabric: defaultVariant?.fabric || '',
          size: defaultVariant?.size || '',
          images: product.images?.map(img => img.url).filter(Boolean) || [],
          specifications: product.description || '',
        }
      };
    });

    setCustomProducts(prev => {
      const updated = [...prev, ...newProducts];
      if (newProducts.length > 0) setExpandedProduct(prev.length);
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
      selectedOptions: defaultSelectedOptions(),
    };

    setCustomProducts(prev => {
      const updated = [...prev, newProduct];
      setExpandedProduct(updated.length - 1);
      return updated;
    });
  };

  const updateProduct = (index, field, value) => {
    setCustomProducts(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (!item) return prev;

      const isLocked = !item.isEditable;
      const allowedWhenLocked = new Set([
        'quantity', 'vendor', 'unitPrice', 'finalPrice',
        // Shipping
        'selectedOptions.shipToVendorId', 'selectedOptions.shipToName',
        'selectedOptions.shippingStreet', 'selectedOptions.shippingCity',
        'selectedOptions.shippingState', 'selectedOptions.shippingPostalCode',
        'selectedOptions.shippingCountry',
        // Status Report
        'selectedOptions.room', 'selectedOptions.statusCategory',
        'selectedOptions.proposalNumber', 'selectedOptions.shipTo',
        'selectedOptions.orderDate', 'selectedOptions.expectedShipDate',
        'selectedOptions.expectedArrivalDate',
        'selectedOptions.dateReceived', 'selectedOptions.dateInspected',
        'selectedOptions.estimatedDeliveryDate',
        'selectedOptions.shippingCarrier', 'selectedOptions.orderStatus',
        'selectedOptions.nextStep', 'selectedOptions.nextStepDate',
        'selectedOptions.warehouseReceivingNumber',
        // Install Binder
        'selectedOptions.poNumber', 'selectedOptions.vendorOrderNumber',
        'selectedOptions.trackingInfo', 'selectedOptions.deliveryStatus',
        'selectedOptions.notes',
        // Pricing
        'selectedOptions.units', 'selectedOptions.msrp', 'selectedOptions.discountPercent',
        'selectedOptions.netCostOverride', 'selectedOptions.noNetPurchaseCost',
        'selectedOptions.discountTaken', 'selectedOptions.shippingCost',
        'selectedOptions.otherCost', 'selectedOptions.markupPercent',
        'selectedOptions.shippingMarkupPercent', 'selectedOptions.otherMarkupPercent',
        'selectedOptions.depositPercent', 'selectedOptions.vendorDepositPercent',
        'selectedOptions.salesTaxRate', 'selectedOptions.taxableCost',
        'selectedOptions.taxableMarkup', 'selectedOptions.taxableShippingCost',
        'selectedOptions.taxableShippingMarkup', 'selectedOptions.taxableOtherCost',
        'selectedOptions.taxableOtherMarkup',
      ]);

      if (isLocked && !allowedWhenLocked.has(field)) return prev;

      if (field.startsWith('selectedOptions.')) {
        const optionField = field.split('.').slice(1).join('.');
        item.selectedOptions = { ...item.selectedOptions, [optionField]: value };
      } else {
        item[field] = value;
      }

      if (field === 'unitPrice' || field === 'quantity') {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        item.finalPrice = qty * price;
      }

      updated[index] = item;
      return updated;
    });
  };

  const removeProduct = (index) => {
    if (window.confirm('Remove this product?')) {
      setCustomProducts(prev => prev.filter((_, i) => i !== index));
      if (expandedProduct === index) setExpandedProduct(null);
    }
  };

  const handleFloorPlanSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
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
    if (floorPlanFile) return URL.createObjectURL(floorPlanFile);
    if (existingFloorPlan?.url) return existingFloorPlan.url;
    if (existingFloorPlan?.data)
      return `data:${existingFloorPlan.contentType};base64,${existingFloorPlan.data}`;
    return null;
  };

  const handleSaveFloorPlan = async () => {
    setSavingFloorPlan(true);
    try {
      const token = localStorage.getItem('token');
      if (floorPlanFile) {
        const formData = new FormData();
        formData.append('floorPlan', floorPlanFile);
        formData.append('notes', floorPlanNotes);
        const res = await fetch(`${backendServer}/api/orders/${order._id}/floor-plan`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Upload failed'); }
        const result = await res.json();
        if (result.success && result.data) {
          setExistingFloorPlan(result.data);
          setFloorPlanFile(null);
          alert('✅ Floor plan saved successfully!');
        }
      } else if (existingFloorPlan && floorPlanNotes !== existingFloorPlan.notes) {
        await fetch(`${backendServer}/api/orders/${order._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ customFloorPlan: { ...existingFloorPlan, notes: floorPlanNotes } })
        });
        alert('✅ Floor plan notes saved!');
      }
    } catch (error) {
      alert(`❌ Failed to save floor plan: ${error.message}`);
    } finally {
      setSavingFloorPlan(false);
    }
  };

  const previewUrl = getFloorPlanPreviewUrl();
  const isImageFile = (floorPlanFile?.type || existingFloorPlan?.contentType || '').startsWith('image/');

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎨 Custom Product Manager</h2>
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
                <p className="text-sm font-medium text-blue-900">Two Ways to Add Products:</p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Browse Library</strong>: Select from existing product catalog</li>
                  <li><strong>Add Product</strong>: Create new products with custom attributes</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Floor Plan Upload ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📐 Custom Floor Plan (Optional)</h3>
            <p className="text-sm text-gray-600 mt-1">Upload custom floor plan image or document</p>
          </div>
          {(floorPlanFile || existingFloorPlan) && (
            <button
              onClick={handleSaveFloorPlan}
              disabled={savingFloorPlan}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
            >
              {savingFloorPlan
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> Save Floor Plan</>}
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
              <p className="text-sm font-medium text-gray-700 mb-1">Click to upload floor plan</p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF, DWG, DXF up to 10MB</p>
            </label>
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {isImageFile && previewUrl
                  ? <img src={previewUrl} alt="Floor plan preview" className="w-full h-full object-contain" />
                  : <File className="w-16 h-16 text-gray-600" />}
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
                          : 'Custom floor plan'}
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
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={removeFloorPlan}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
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

      {/* ── Products List ── */}
      <div className="space-y-4">
        {customProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Added</h3>
            <p className="text-gray-600 mb-6">Select from library or create manual products</p>
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900">Products ({customProducts.length})</h3>
            </div>
            {customProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                order={order}
                allProducts={customProducts}
                expanded={expandedProduct === index}
                onToggleExpand={() =>
                  setExpandedProduct(expandedProduct === index ? null : index)
                }
                onUpdate={updateProduct}
                onRemove={removeProduct}
                onSaved={(updatedProducts) => { if (onSave) onSave(updatedProducts); }}
              />
            ))}
          </>
        )}
      </div>

      {/* ── Summary ── */}
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
              Total: ${customProducts.reduce((sum, p) => sum + (p.finalPrice || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* ── Floor Plan Preview Modal ── */}
      {showFloorPlanPreview && previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFloorPlanPreview(false)}
        >
          <div
            className="max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
              {isImageFile
                ? <img src={previewUrl} alt="Floor plan" className="max-w-full h-auto" />
                : <div className="text-center py-20">
                    <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                  </div>}
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

const ProductCard = ({
  product,
  index,
  order,
  allProducts,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [customAttrs, setCustomAttrs] = useState(
    product.selectedOptions?.customAttributes || {}
  );
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCustomAttrs(product.selectedOptions?.customAttributes || {});
  }, [product._id, product.selectedOptions?.customAttributes]);

  const opts = product.selectedOptions || {};
  const upd = (field, value) => onUpdate(index, `selectedOptions.${field}`, value);

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ' +
    'focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] ' +
    'disabled:bg-gray-100 disabled:cursor-not-allowed';

  // ── Images ──
  const getAllImages = () => {
    const images = [];
    if (opts.image) images.push({ url: opts.image, source: 'primary' });
    (opts.images || []).forEach(url => {
      if (url && !images.find(i => i.url === url))
        images.push({ url, source: 'gallery' });
    });
    (opts.uploadedImages || []).forEach(img => {
      const url =
        img.url ||
        img.previewUrl ||
        (img.data ? `data:${img.contentType};base64,${img.data}` : null);
      if (url) images.push({ url, source: 'uploaded', filename: img.filename });
    });
    return images;
  };
  const allImages = getAllImages();
  const primaryImage = allImages[0]?.url;

  // ── Build payload for save ──
  const buildProductPayload = (src) => ({
    ...(src._id && !src._id.toString().startsWith('temp_') && { _id: src._id }),
    product_id: src.product_id,
    name: src.name,
    category: src.category || '',
    spotName: src.spotName || 'Custom Item',
    quantity: src.quantity || 1,
    unitPrice: parseFloat(src.unitPrice) || 0,
    finalPrice: parseFloat(src.finalPrice) || 0,
    vendor: src.vendor || null,
    sourceType: src.sourceType || 'manual',
    isEditable: src.isEditable !== undefined ? src.isEditable : true,
    selectedOptions: {
      // General
      finish: src.selectedOptions?.finish || '',
      fabric: src.selectedOptions?.fabric || '',
      size: src.selectedOptions?.size || '',
      sidemark: src.selectedOptions?.sidemark || '',
      group: src.selectedOptions?.group || '',
      tags: src.selectedOptions?.tags || [],
      itemClass: src.selectedOptions?.itemClass || '',
      cfaSampleApproval: src.selectedOptions?.cfaSampleApproval || '',
      vendorDescription: src.selectedOptions?.vendorDescription || '',
      insetPanel: src.selectedOptions?.insetPanel || '',
      image: src.selectedOptions?.image || '',
      images: src.selectedOptions?.images || [],
      links: src.selectedOptions?.links || [],
      specifications: src.selectedOptions?.specifications || '',
      notes: src.selectedOptions?.notes || '',
      uploadedImages: src.selectedOptions?.uploadedImages || [],
      customAttributes: src.selectedOptions?.customAttributes || {},
      // Shipping
      shipToVendorId: src.selectedOptions?.shipToVendorId || null,
      shipToName: src.selectedOptions?.shipToName || '',
      shippingStreet: src.selectedOptions?.shippingStreet || '',
      shippingCity: src.selectedOptions?.shippingCity || '',
      shippingState: src.selectedOptions?.shippingState || '',
      shippingPostalCode: src.selectedOptions?.shippingPostalCode || '',
      shippingCountry: src.selectedOptions?.shippingCountry || '',
      shipToPhone: src.selectedOptions?.shipToPhone || '',
      // Install Binder
      poNumber: src.selectedOptions?.poNumber || '',
      vendorOrderNumber: src.selectedOptions?.vendorOrderNumber || '',
      trackingInfo: src.selectedOptions?.trackingInfo || '',
      deliveryStatus: src.selectedOptions?.deliveryStatus || '',
      // Status Report
      room: src.selectedOptions?.room || '',
      statusCategory: src.selectedOptions?.statusCategory || '',
      proposalNumber: src.selectedOptions?.proposalNumber || '',
      shipTo: src.selectedOptions?.shipTo || '',
      orderDate: src.selectedOptions?.orderDate || '',
      expectedShipDate: src.selectedOptions?.expectedShipDate || '',
      expectedArrivalDate: src.selectedOptions?.expectedArrivalDate || '',
      dateReceived: src.selectedOptions?.dateReceived || '',
      dateInspected: src.selectedOptions?.dateInspected || '',
      estimatedDeliveryDate: src.selectedOptions?.estimatedDeliveryDate || '',
      shippingCarrier: src.selectedOptions?.shippingCarrier || '',
      orderStatus: src.selectedOptions?.orderStatus || '',
      nextStep: src.selectedOptions?.nextStep || '',
      nextStepDate: src.selectedOptions?.nextStepDate || '',
      warehouseReceivingNumber: src.selectedOptions?.warehouseReceivingNumber || '',
      // Pricing
      units: src.selectedOptions?.units || 'Each',
      msrp: parseFloat(src.selectedOptions?.msrp) || 0,
      discountPercent: parseFloat(src.selectedOptions?.discountPercent) || 0,
      netCostOverride: src.selectedOptions?.netCostOverride ?? null,
      noNetPurchaseCost: src.selectedOptions?.noNetPurchaseCost || false,
      discountTaken: src.selectedOptions?.discountTaken || '',
      shippingCost: parseFloat(src.selectedOptions?.shippingCost) || 0,
      otherCost: parseFloat(src.selectedOptions?.otherCost) || 0,
      markupPercent: parseFloat(src.selectedOptions?.markupPercent) || 0,
      shippingMarkupPercent: parseFloat(src.selectedOptions?.shippingMarkupPercent) || 0,
      otherMarkupPercent: parseFloat(src.selectedOptions?.otherMarkupPercent) || 0,
      depositPercent: parseFloat(src.selectedOptions?.depositPercent) || 0,
      vendorDepositPercent: parseFloat(src.selectedOptions?.vendorDepositPercent) || 0,
      salesTaxRate: parseFloat(src.selectedOptions?.salesTaxRate) || 0,
      taxableCost: src.selectedOptions?.taxableCost !== false,
      taxableMarkup: src.selectedOptions?.taxableMarkup !== false,
      taxableShippingCost: src.selectedOptions?.taxableShippingCost !== false,
      taxableShippingMarkup: src.selectedOptions?.taxableShippingMarkup !== false,
      taxableOtherCost: src.selectedOptions?.taxableOtherCost !== false,
      taxableOtherMarkup: src.selectedOptions?.taxableOtherMarkup !== false,
    },
    placement: src.placement || null
  });

  // ── Custom attributes ──
  const addCustomAttribute = () => {
    if (!newAttrKey.trim()) return;
    const updated = { ...customAttrs, [newAttrKey]: newAttrValue };
    setCustomAttrs(updated);
    upd('customAttributes', updated);
    setNewAttrKey('');
    setNewAttrValue('');
  };

  const removeCustomAttribute = (key) => {
    const updated = { ...customAttrs };
    delete updated[key];
    setCustomAttrs(updated);
    upd('customAttributes', updated);
  };

  // ── Save product ──
  const handleSaveProduct = async () => {
    if (!product.name?.trim()) { alert('❌ Product must have a Name!'); return; }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNewProduct =
        product._id && typeof product._id === 'string' && product._id.startsWith('temp_');

      let updatedProducts;

      if (isNewProduct) {
        // New product: strip temp _id, append to existing saved products
        const existingSaved = allProducts
          .filter(p => !p._id?.toString().startsWith('temp_'))
          .map(buildProductPayload);
        const { _id, ...cleanProduct } = product;
        updatedProducts = [...existingSaved, buildProductPayload(cleanProduct)];
      } else {
        // Existing product: replace only the one with matching _id
        // ✅ FIX: use ONLY _id for matching — product_id is not unique
        //         (multiple library items can share the same product_id)
        const currentId = product._id?.toString();
        updatedProducts = allProducts
          .filter(p => !p._id?.toString().startsWith('temp_'))
          .map(p => {
            const pId = p._id?.toString();
            return pId === currentId
              ? buildProductPayload(product)
              : buildProductPayload(p);
          });
      }

      const saveResponse = await fetch(`${backendServer}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ selectedProducts: updatedProducts, status: 'ongoing', step: 2 })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      alert('✅ Product saved successfully!');
      if (onSaved) onSaved(updatedProducts);

    } catch (error) {
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Ship To vendor auto-fill ──
  const handleShipToSelect = ({ vendorId, shipToName, street, city, state, postalCode, country }) => {
    upd('shipToVendorId', vendorId);
    upd('shipToName', shipToName);
    upd('shippingStreet', street);
    upd('shippingCity', city);
    upd('shippingState', state);
    upd('shippingPostalCode', postalCode);
    upd('shippingCountry', country || '');
  };

  const handleShipToClear = () => {
    upd('shipToVendorId', null);
    upd('shipToName', '');
    upd('shippingStreet', '');
    upd('shippingCity', '');
    upd('shippingState', '');
    upd('shippingPostalCode', '');
    upd('shippingCountry', '');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">

      {/* ── Compact Header ── */}
      <div className="p-4">
        <div className="flex items-center gap-4">

          {/* Thumbnail */}
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
                  e.target.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
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

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                product.sourceType === 'library'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {product.sourceType === 'library'
                  ? <><Lock className="w-3 h-3" /> Library #{index + 1}</>
                  : <><Edit2 className="w-3 h-3" /> Manual #{index + 1}</>}
              </span>
              {opts.statusCategory && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  {opts.statusCategory}
                </span>
              )}
            </div>
            <h4 className="font-bold text-gray-900 truncate">
              {product.name || 'Untitled Product'}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {product.product_id} • Qty: {product.quantity} • ${parseFloat(product.finalPrice || 0).toFixed(2)}
              {opts.room && <span className="text-teal-600"> • {opts.room}</span>}
              {opts.shipToName && <span className="text-blue-600"> • ✈ {opts.shipToName}</span>}
            </p>
          </div>

          {/* Actions */}
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

      {/* ── Image Gallery Modal ── */}
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
              />
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
                        <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Expanded Content with Tabs ── */}
      {expanded && (
        <div className="border-t border-gray-200">

          {/* Library notice */}
          {product.sourceType === 'library' && (
            <div className="mx-6 mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Read-Only Product</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Library product — quantity, vendor, pricing, shipping, and status/binder fields can be changed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab Bar ── */}
          <div className="flex border-b border-gray-200 px-6 pt-4 gap-1 overflow-x-auto">
            {PRODUCT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#005670] text-[#005670] bg-[#005670]/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ── */}
          <div className="p-6 space-y-5">

            {/* ════════ TAB: GENERAL INFO ════════ */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">General Information</h3>

                {/* Item Name — full width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name *</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => onUpdate(index, 'name', e.target.value)}
                    disabled={!product.isEditable}
                    className={inputCls}
                    placeholder="e.g. Living Room - Sofa Pillow"
                  />
                </div>

                {/* Row: Room, Tags */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      Room
                      <span className="text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </label>
                    <select
                      value={opts.room || ''}
                      onChange={(e) => upd('room', e.target.value)}
                      className={`${inputCls} bg-white`}
                    >
                      <option value="">Select...</option>
                      {ROOM_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                    <input
                      type="text"
                      value={Array.isArray(opts.tags) ? opts.tags.join(', ') : (opts.tags || '')}
                      onChange={(e) =>
                        upd('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))
                      }
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder="Select..."
                    />
                  </div>
                </div>

                {/* Row: Group, Item Class, Sidemark */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      Group
                      <span className="text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={opts.group || ''}
                      onChange={(e) => upd('group', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      Item Class
                      <span className="text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </label>
                    <select
                      value={opts.itemClass || ''}
                      onChange={(e) => upd('itemClass', e.target.value)}
                      disabled={!product.isEditable}
                      className={`${inputCls} bg-white`}
                    >
                      <option value="">Select item class...</option>
                      {ITEM_CLASS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Sidemark</span>
                      <button type="button" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-normal">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Set Default Sidemark
                      </button>
                    </label>
                    <input
                      type="text"
                      value={opts.sidemark || ''}
                      onChange={(e) => upd('sidemark', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder="Henderson Design Group / Timbers - Laola Nani"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════════ TAB: ITEM DETAILS ════════ */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Item Details</h3>

                {/* Row: Vendor, SKU / Item #, Vendor Order Number */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      Vendor
                      <span className="text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </label>
                    <VendorSearchDropdown
                      selectedVendor={product.vendor}
                      onSelectVendor={(vendorId) => onUpdate(index, 'vendor', vendorId)}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU / Item #</label>
                    <input
                      type="text"
                      value={product.product_id}
                      onChange={(e) => onUpdate(index, 'product_id', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder="SKU / Item #"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Order Number</label>
                    <input
                      type="text"
                      value={opts.vendorOrderNumber || ''}
                      onChange={(e) => upd('vendorOrderNumber', e.target.value)}
                      className={inputCls}
                      placeholder="Enter Vendor Order Number"
                    />
                  </div>
                </div>

                {/* Row: Client Description, Vendor Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Description</label>
                    <textarea
                      value={opts.specifications || ''}
                      onChange={(e) => upd('specifications', e.target.value)}
                      disabled={!product.isEditable}
                      className={`${inputCls} resize-none`}
                      rows={5}
                      placeholder="e.g. Living Room - Sofa Pillow&#10;Jervis&#10;Color: Ocean&#10;Qty. 2&#10;Size: 22&quot; x 22&quot;"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Vendor Description</span>
                      <button
                        type="button"
                        onClick={() => upd('vendorDescription', opts.specifications || '')}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-normal"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy from Client Description
                      </button>
                    </label>
                    <textarea
                      value={opts.vendorDescription || ''}
                      onChange={(e) => upd('vendorDescription', e.target.value)}
                      disabled={!product.isEditable}
                      className={`${inputCls} resize-none`}
                      rows={5}
                      placeholder="Vendor-specific description..."
                    />
                  </div>
                </div>

                {/* Row: Color/Finish, Dimensions, Item URL */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Color / Finish</label>
                    <input
                      type="text"
                      value={opts.finish || ''}
                      onChange={(e) => upd('finish', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder="e.g. Ocean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dimensions</label>
                    <input
                      type="text"
                      value={opts.size || ''}
                      onChange={(e) => upd('size', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder='e.g. 22" x 22"'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Item URL</label>
                    <input
                      type="text"
                      value={opts.links?.[0] || ''}
                      onChange={(e) => {
                        const rest = opts.links?.slice(1) || [];
                        upd('links', e.target.value ? [e.target.value, ...rest] : rest);
                      }}
                      disabled={!product.isEditable}
                      className={inputCls}
                      placeholder="https://vendor.com/product-page"
                    />
                  </div>
                </div>

                {/* CFA / Sample Approval */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CFA / Sample Approval</label>
                    <select
                      value={opts.cfaSampleApproval || ''}
                      onChange={(e) => upd('cfaSampleApproval', e.target.value)}
                      className={`${inputCls} bg-white`}
                    >
                      <option value="">Select...</option>
                      {CFA_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row: Fabric, Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fabric</label>
                    <input
                      type="text"
                      value={opts.fabric || ''}
                      onChange={(e) => upd('fabric', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category / Location</label>
                    <input
                      type="text"
                      value={product.category}
                      onChange={(e) => onUpdate(index, 'category', e.target.value)}
                      disabled={!product.isEditable}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Manual-only: Custom Attributes + Image Upload */}
                {product.isEditable && (
                  <>
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-800 text-sm">Custom Attributes</h4>

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
                        <p className="text-sm font-medium text-gray-700 mb-3">Add Custom Attribute</p>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newAttrKey}
                            onChange={(e) => setNewAttrKey(e.target.value)}
                            placeholder="Attribute name"
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={newAttrValue}
                            onChange={(e) => setNewAttrValue(e.target.value)}
                            placeholder="Value"
                            className={inputCls}
                          />
                          <button
                            onClick={addCustomAttribute}
                            disabled={!newAttrKey.trim()}
                            className="px-6 py-2 bg-[#005670] text-white rounded-lg hover:bg-[#007a9a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <ImageUploadField
                      orderId={order._id}
                      images={opts.uploadedImages || []}
                      onImagesChange={(images) => upd('uploadedImages', images)}
                    />
                  </>
                )}
              </div>
            )}

            {/* ════════ TAB: SHIPPING ════════ */}
            {activeTab === 'shipping' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Shipping</h3>

                {/* Row: Ship To (editable dropdown), Ship To Name (disabled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      Ship To
                      <span className="text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </label>
                    <ShipToVendorDropdown
                      selectedVendorId={opts.shipToVendorId || null}
                      onSelect={handleShipToSelect}
                      onClear={handleShipToClear}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship To Name</label>
                    <input
                      type="text"
                      value={opts.shipToName || ''}
                      disabled
                      className={`${inputCls} bg-gray-50`}
                      placeholder="Auto-filled from vendor"
                    />
                  </div>
                </div>

                {/* Row: Shipping Street (disabled), Shipping City (disabled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Street</label>
                    <input
                      type="text"
                      value={opts.shippingStreet || ''}
                      disabled
                      className={`${inputCls} bg-gray-50`}
                      placeholder="Auto-filled from vendor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping City</label>
                    <input
                      type="text"
                      value={opts.shippingCity || ''}
                      disabled
                      className={`${inputCls} bg-gray-50`}
                      placeholder="Auto-filled from vendor"
                    />
                  </div>
                </div>

                {/* Row: State (disabled), Postal Code (disabled), Phone (disabled) */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping State</label>
                    <input
                      type="text"
                      value={opts.shippingState || ''}
                      disabled
                      className={`${inputCls} bg-gray-50`}
                      placeholder="Auto-filled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      value={opts.shippingPostalCode || ''}
                      disabled
                      className={`${inputCls} bg-gray-50`}
                      placeholder="Auto-filled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship To Phone Number</label>
                    <input
                      type="text"
                      value={opts.shipToPhone || ''}
                      disabled
                      className={`${inputCls} bg-gray-50`}
                      placeholder="Enter Ship To Phone Number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════════ TAB: PRICING ════════ */}
            {activeTab === 'pricing' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">Item Pricing</h3>
                {product.sourceType === 'library' && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs text-amber-800">
                      <strong>Library Product</strong> — pricing fields are read-only. Price is inherited from the product catalog.
                    </p>
                  </div>
                )}
                <PricingFields
                  product={product}
                  index={index}
                  onUpdate={onUpdate}
                  disabled={product.sourceType === 'library'}
                />
              </div>
            )}

            {/* ════════ TAB: INSTALL BINDER ════════ */}
            {activeTab === 'installbinder' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Order (PO #)</label>
                    <input
                      type="text"
                      value={opts.poNumber || ''}
                      onChange={(e) => upd('poNumber', e.target.value)}
                      className={inputCls}
                      placeholder="Tim-2289995"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Order Number</label>
                    <input
                      type="text"
                      value={opts.vendorOrderNumber || ''}
                      onChange={(e) => upd('vendorOrderNumber', e.target.value)}
                      className={inputCls}
                      placeholder="353502018743"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipment Tracking Info</label>
                    <input
                      type="text"
                      value={opts.trackingInfo || ''}
                      onChange={(e) => upd('trackingInfo', e.target.value)}
                      className={inputCls}
                      placeholder="UPS (1Z61RE120340475585)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Proposal Number</label>
                    <input
                      type="text"
                      value={opts.proposalNumber || ''}
                      onChange={(e) => upd('proposalNumber', e.target.value)}
                      className={inputCls}
                      placeholder="Proposal reference #"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery / Order Status</label>
                  <textarea
                    value={opts.deliveryStatus || ''}
                    onChange={(e) => upd('deliveryStatus', e.target.value)}
                    className={`${inputCls} resize-none`}
                    rows={3}
                    placeholder={'12/23/25 Delivered\n12/18/25 Shipped'}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Install Binder Fields:</strong> These fields appear in the Install Binder
                    document for tracking vendor orders, shipments, and delivery status.
                  </p>
                </div>
              </div>
            )}

            {/* ════════ TAB: STATUS ════════ */}
            {activeTab === 'status' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">Status</h3>
                <StatusReportFields
                  product={product}
                  index={index}
                  onUpdate={onUpdate}
                  disabled={false}
                />
              </div>
            )}

            {/* ── Save Button ── */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveProduct}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                {saving
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  : <><Check className="w-5 h-5" /> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomProductManager;