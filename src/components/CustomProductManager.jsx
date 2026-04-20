// components/CustomProductManager.jsx
// ✅ PATCHED: Fix duplicate/hilang product
//    - Pisahkan draftProduct dari savedProducts
//    - draftProduct tidak masuk DB sampai save berhasil
//    - handleSaveProduct pakai allProducts (savedProducts) yang selalu bersih
//    - Group by room

import React, { useState, useEffect, useRef } from 'react';
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
import { uploadFileToS3 } from '../utils/uploadToS3';

const PRODUCT_TABS = [
  { id: 'general',       label: 'General Info',  icon: Package },
  { id: 'details',       label: 'Item Details',  icon: Tag },
  { id: 'shipping',      label: 'Shipping',       icon: Truck },
  { id: 'pricing',       label: 'Pricing',        icon: DollarSign },
  { id: 'installbinder', label: 'Install Binder', icon: ClipboardList },
  { id: 'status',        label: 'Status',         icon: Activity },
];

const ITEM_CLASS_OPTIONS = [
  'Accessories','Accessories & Art','Accessories-1','Appliances','Case Goods',
  'Custom - soft goods (decorative pillows)','Fabric','Flooring','Lighting',
  'Wall Covering','Window Covering','Construction Scope','Furniture','Labor',
  'Reupholstery','Rugs','Upholstery',
];

const ROOM_OPTIONS = [
  'COURTYARD','EXTERIOR ENTRY','INTERIOR ENTRY','FOYER','KITCHEN','PANTRY',
  'BREAKFAST NOOK','DINING ROOM','LIVING ROOM','GREAT ROOM','FAMILY ROOM',
  'DEN','WET BAR','MEDIA ROOM','HALLWAY 1','HALLWAY 2','MAIN LANAI','BBQ AREA',
  'POOL LANAI','POWDER ROOM','POOL AREA','POOL BATH','PAVILLION','GYM',
  'OFFICE 1','OFFICE 2','WINE ROOM','REC ROOM','GARAGE','PRIMARY BEDROOM',
  'PRIMARY BATHROOM','PRIMARY CLOSET','PRIMARY BEDROOM LANAI','BEDROOM 2',
  'BATHROOM 2','BEDROOM 2 CLOSET','BEDROOM 2 LANAI','BEDROOM 3','BATHROOM 3',
  'BEDROOM 3 CLOSET','BEDROOM 3 LANAI','BEDROOM 4','BATHROOM 4',
  'BEDROOM 4 CLOSET','BEDROOM 4 LANAI','SITTING ROOM',
];

const CFA_OPTIONS = ['Approved','Rejected','Waived','Pending'];

const defaultSelectedOptions = () => ({
  image: '', images: [], links: [], specifications: '', notes: '',
  finish: '', fabric: '', size: '', sidemark: '', group: '', tags: [],
  itemClass: '', cfaSampleApproval: '', vendorDescription: '', uploadedImages: '',
  customAttributes: {},
  shipToVendorId: null, shipToName: '', shippingStreet: '', shippingCity: '',
  shippingState: '', shippingPostalCode: '', shippingCountry: '', shipToPhone: '',
  poNumber: '', vendorOrderNumber: '', trackingInfo: '', deliveryStatus: '',
  room: '', statusCategory: '', proposalNumber: '', shipTo: '', orderDate: '',
  expectedShipDate: '', expectedArrivalDate: '', dateReceived: '', dateInspected: '',
  estimatedDeliveryDate: '', shippingCarrier: '', orderStatus: '', nextStep: '',
  nextStepDate: '', warehouseReceivingNumber: '',
  units: 'Each', msrp: 0, discountPercent: 0, netCostOverride: null,
  noNetPurchaseCost: false, discountTaken: '', shippingCost: 0, otherCost: 0,
  markupPercent: 50, shippingMarkupPercent: 50, otherMarkupPercent: 50,
  depositPercent: 90, vendorDepositPercent: 0, salesTaxRate: 8.75,
  taxableCost: true, taxableMarkup: true, taxableShippingCost: true,
  taxableShippingMarkup: true, taxableOtherCost: true, taxableOtherMarkup: true,
});

// ─── ALLOWED FIELDS WHEN LOCKED (shared constant) ───────────────────────────
const ALLOWED_WHEN_LOCKED = new Set([
  'quantity', 'vendor', 'unitPrice', 'finalPrice',
  'selectedOptions.shipToVendorId', 'selectedOptions.shipToName',
  'selectedOptions.shippingStreet', 'selectedOptions.shippingCity',
  'selectedOptions.shippingState', 'selectedOptions.shippingPostalCode',
  'selectedOptions.shippingCountry',
  'selectedOptions.room', 'selectedOptions.statusCategory',
  'selectedOptions.proposalNumber', 'selectedOptions.shipTo',
  'selectedOptions.orderDate', 'selectedOptions.expectedShipDate',
  'selectedOptions.expectedArrivalDate', 'selectedOptions.dateReceived',
  'selectedOptions.dateInspected', 'selectedOptions.estimatedDeliveryDate',
  'selectedOptions.shippingCarrier', 'selectedOptions.orderStatus',
  'selectedOptions.nextStep', 'selectedOptions.nextStepDate',
  'selectedOptions.warehouseReceivingNumber',
  'selectedOptions.poNumber', 'selectedOptions.vendorOrderNumber',
  'selectedOptions.trackingInfo', 'selectedOptions.deliveryStatus',
  'selectedOptions.notes',
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

// ─── Helper: apply field update to a product object ─────────────────────────
const applyFieldUpdate = (item, field, value) => {
  const updated = { ...item };
  if (field.startsWith('selectedOptions.')) {
    const optionField = field.split('.').slice(1).join('.');
    updated.selectedOptions = { ...updated.selectedOptions, [optionField]: value };
  } else {
    updated[field] = value;
  }
  if (field === 'unitPrice' || field === 'quantity') {
    updated.finalPrice = (Number(updated.quantity) || 1) * (Number(updated.unitPrice) || 0);
  }
  return updated;
};

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 pt-6 pb-4`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              confirmVariant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              {confirmVariant === 'danger' ? (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 leading-tight">{title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
 
        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium pointer-events-auto min-w-[280px] max-w-[360px] ${
            t.type === 'success' ? 'bg-green-600' :
            t.type === 'error'   ? 'bg-red-600'   :
                                   'bg-blue-600'
          }`}
        >
          {t.type === 'success' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {t.type === 'error' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {t.type === 'info' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-1 hover:opacity-70 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

const useToast = () => {
  const [toasts, setToasts] = React.useState([]);
 
  const addToast = React.useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);
 
  const dismiss = React.useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
 
  return { toasts, addToast, dismiss };
};

// ==================== MAIN COMPONENT ====================

const CustomProductManager = ({ order, onSave, onBack }) => {
  // ✅ KUNCI FIX: pisah savedProducts (sudah di DB) vs draftProduct (belum di-save)
  const [savedProducts, setSavedProducts] = useState([]);
  const [draftProduct, setDraftProduct] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanNotes, setFloorPlanNotes] = useState('');
  const [existingFloorPlan, setExistingFloorPlan] = useState(null);
  const [showFloorPlanPreview, setShowFloorPlanPreview] = useState(false);
  const [savingFloorPlan, setSavingFloorPlan] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const { toasts, addToast, dismiss: dismissToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: null,
  });
  
  
  const showConfirm = ({ title, message, confirmLabel, confirmVariant = 'danger', onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, confirmLabel, confirmVariant, onConfirm });
  };
  
  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

useEffect(() => {
  if (order?.selectedProducts) {
    console.log('=== useEffect jalan, products count:', order.selectedProducts.length);
    console.log('_ids:', order.selectedProducts.map(p => ({ id: p._id?.toString(), name: p.name })));
    // ✅ Dedup: filter products yang tidak punya _id kecuali unik by product_id
    const products = order.selectedProducts;
    const seen = new Set();
    const deduped = products.filter(p => {
      if (p._id) {
        const id = p._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }
      // Products tanpa _id (corrupt dari sebelumnya): keep hanya 1 per product_id
      const key = `no_id_${p.product_id}_${p.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    if (deduped.length !== products.length) {
      console.warn(`⚠️ Deduped ${products.length - deduped.length} duplicate products from DB`);
    }
    
    setSavedProducts(deduped);
  }
  if (order?.customFloorPlan) {
    setExistingFloorPlan(order.customFloorPlan);
    setFloorPlanNotes(order.customFloorPlan.notes || '');
  }
}, [order]);

  // ─── Library ─────────────────────────────────────────────────────────────
  const handleAddFromLibrary = async (selectedProducts) => {
    setShowLibraryModal(false);
  
    // Build new products dengan semua field yang diperlukan
    const newProducts = selectedProducts.map((product) => {
      const imageUrl =
        product.image?.url ||
        product.uploadedImages?.[0]?.url ||
        product.images?.find(i => i.isPrimary)?.url ||
        product.images?.[0]?.url ||
        null;
  
      const catalogPrice = product.price || 0;
  
      return {
        _id:        product._id,
        product_id: product.product_id || `LIB-${Date.now()}`,
        name:       product.name,
        category:   product.category || 'Library Selection',
        package:    product.package  || '',
        spotName:   'Library Item',
        quantity:   1,
        unitPrice:  catalogPrice,
        finalPrice: catalogPrice,
        vendor:     null,
        sourceType: 'library',
        isEditable: false,
        selectedOptions: {
          ...defaultSelectedOptions(),
          image:                 imageUrl || '',
          images:                product.images?.map(i => i.url).filter(Boolean) || [],
          finish:                product.woodFinish || '',
          woodFinish:            product.woodFinish || '',
          fabric:                product.fabric     || '',
          others:                product.others     || [],
          size:                  product.dimension  || '',
          specifications:        product.description || '',
          // Pricing pre-fill dari catalog
          msrp:                  catalogPrice,
          discountPercent:       0,
          netCostOverride:       null,
          noNetPurchaseCost:     false,
          units:                 'Each',
          markupPercent:         50,
          shippingMarkupPercent: 50,
          otherMarkupPercent:    50,
          shippingCost:          0,
          otherCost:             0,
          depositPercent:        90,
          vendorDepositPercent:  0,
          salesTaxRate:          8.75,
          taxableCost:            true,
          taxableMarkup:          true,
          taxableShippingCost:    true,
          taxableShippingMarkup:  true,
          taxableOtherCost:       true,
          taxableOtherMarkup:     true,
          discountTaken:         '',
        }
      };
    });
  
    // ✅ Optimistic UI update dulu
    const mergedProducts = [...savedProducts, ...newProducts];
    setSavedProducts(mergedProducts);
  
    // ✅ Langsung save ke DB — library products tidak punya tombol Save sendiri
    try {
      const token = localStorage.getItem('token');
  
      // Build payload: gabungkan existing savedProducts + newProducts
      const payload = mergedProducts.map(p => ({
        ...(p._id && !p._id.toString().startsWith('temp_') && { _id: p._id }),
        product_id:  p.product_id,
        name:        p.name,
        category:    p.category    || '',
        package:     p.package     || '',
        spotName:    p.spotName    || 'Custom Item',
        quantity:    p.quantity    || 1,
        unitPrice:   parseFloat(p.unitPrice)  || 0,
        finalPrice:  parseFloat(p.finalPrice) || 0,
        vendor:      p.vendor      || null,
        sourceType:  p.sourceType  || 'library',
        isEditable:  p.isEditable  !== undefined ? p.isEditable : false,
        selectedOptions: p.selectedOptions || {},
        placement:   p.placement   || null,
      }));
  
      const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedProducts: payload,
          status: 'ongoing',
          step: 2,
        }),
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save library products');
      }
  
      const savedOrder = await res.json();
      const finalProducts = savedOrder.selectedProducts || mergedProducts;
      setSavedProducts(finalProducts);
      if (onSave) onSave(finalProducts);
  
      addToast(
        `${newProducts.length} product${newProducts.length > 1 ? 's' : ''} added from library`,
        'success'
      );
  
    } catch (error) {
      addToast(`Failed to save library products: ${error.message}`, 'error');
  
      // Rollback optimistic update on error
      setSavedProducts(savedProducts);
  
      // Refresh dari DB untuk sync
      try {
        const token = localStorage.getItem('token');
        const freshRes = await fetch(`${backendServer}/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const freshOrder = await freshRes.json();
        setSavedProducts(freshOrder.selectedProducts || []);
      } catch (_) {}
    }
  };

  // ─── Add manual — HANYA buat draft, TIDAK masuk savedProducts ─────────────
  const addManualProduct = () => {
    const createDraft = () => {
      const newDraft = {
        _id:        `temp_${Date.now()}`,
        product_id: `CUSTOM-${Date.now().toString().slice(-6)}`,
        name:       '',
        category:   '',
        package:    '',                                 // ✅ NEW
        spotName:   'Custom Item',
        quantity:   1,
        unitPrice:  0,
        finalPrice: 0,
        vendor:     null,
        sourceType: 'manual',
        isEditable: true,
        selectedOptions: {
          ...defaultSelectedOptions(),
          msrp:                  0,
          discountPercent:       0,
          netCostOverride:       null,
          noNetPurchaseCost:     false,
          units:                 'Each',
          markupPercent:         50,
          shippingMarkupPercent: 50,
          otherMarkupPercent:    50,
          shippingCost:          0,
          otherCost:             0,
          depositPercent:        90,
          vendorDepositPercent:  0,
          salesTaxRate:          8.75,
          taxableCost:            true,
          taxableMarkup:          true,
          taxableShippingCost:    true,
          taxableShippingMarkup:  true,
          taxableOtherCost:       true,
          taxableOtherMarkup:     true,
          discountTaken:         '',
        },
      };
      setDraftProduct(newDraft);
      setExpandedProduct('draft');
    };
  
    if (draftProduct) {
      showConfirm({
        title: 'Unsaved Product',
        message: 'You have an unsaved product. Discard it and create a new one?',
        confirmLabel: 'Discard & Create New',
        confirmVariant: 'warning',
        onConfirm: () => { closeConfirm(); createDraft(); },
      });
      return;
    }
    createDraft();
  };

  // ─── Update — index 'draft' → draftProduct, number → savedProducts ────────
  const updateProduct = (index, field, value) => {
    if (index === 'draft') {
      setDraftProduct(prev => {
        if (!prev) return prev;
        if (!prev.isEditable && !ALLOWED_WHEN_LOCKED.has(field)) return prev;
        return applyFieldUpdate(prev, field, value);
      });
      return;
    }
    setSavedProducts(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;
      if (!item.isEditable && !ALLOWED_WHEN_LOCKED.has(field)) return prev;
      updated[index] = applyFieldUpdate(item, field, value);
      return updated;
    });
  };

  // ─── Remove ───────────────────────────────────────────────────────────────
  const removeProduct = async (index) => {
    if (index === 'draft') {
      showConfirm({
        title: 'Discard Product',
        message: 'Discard this new unsaved product?',
        confirmLabel: 'Discard',
        confirmVariant: 'warning',
        onConfirm: () => {
          closeConfirm();
          setDraftProduct(null);
          setExpandedProduct(null);
        },
      });
      return;
    }
  
    const productName = savedProducts[index]?.name || 'this product';
    showConfirm({
      title: 'Remove Product',
      message: `Remove "${productName}" from this order? This cannot be undone.`,
      confirmLabel: 'Remove',
      confirmVariant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          const token = localStorage.getItem('token');
          const updatedProducts = savedProducts.filter((_, i) => i !== index);
          setSavedProducts(updatedProducts);
          if (expandedProduct === index) setExpandedProduct(null);
  
          const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              selectedProducts: updatedProducts.map(p => ({
                ...(p._id && !p._id.toString().startsWith('temp_') && { _id: p._id }),
                product_id: p.product_id,
                name: p.name,
                category: p.category || '',
                spotName: p.spotName || 'Custom Item',
                quantity: p.quantity || 1,
                unitPrice: parseFloat(p.unitPrice) || 0,
                finalPrice: parseFloat(p.finalPrice) || 0,
                vendor: p.vendor || null,
                sourceType: p.sourceType || 'manual',
                isEditable: p.isEditable !== undefined ? p.isEditable : true,
                selectedOptions: p.selectedOptions || {},
                placement: p.placement || null,
              })),
              status: 'ongoing',
              step: 2,
            }),
          });
  
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to delete product');
          }
  
          const savedOrder = await res.json();
          setSavedProducts(savedOrder.selectedProducts || updatedProducts);
          if (onSave) onSave(savedOrder.selectedProducts || updatedProducts);
          addToast('Product removed successfully', 'success');
  
        } catch (error) {
          addToast(`Failed to delete: ${error.message}`, 'error');
          // Rollback
          try {
            const token = localStorage.getItem('token');
            const freshRes = await fetch(`${backendServer}/api/orders/${order._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const freshOrder = await freshRes.json();
            setSavedProducts(freshOrder.selectedProducts || []);
          } catch (_) {}
        }
      },
    });
  };

  // ─── Floor plan handlers (tidak berubah) ──────────────────────────────────
  const handleFloorPlanSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { addToast('File size must be less than 10MB'); return; }
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
        const uploaded = await uploadFileToS3(floorPlanFile, 'floor-plans');
        const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ customFloorPlan: { ...uploaded, notes: floorPlanNotes } }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message || `HTTP ${res.status}`); }
        setExistingFloorPlan({ ...uploaded, notes: floorPlanNotes });
        setFloorPlanFile(null);
        addToast('Floor plan saved successfully!', 'success');
      } else if (existingFloorPlan && floorPlanNotes !== existingFloorPlan.notes) {
        await fetch(`${backendServer}/api/orders/${order._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ customFloorPlan: { ...existingFloorPlan, notes: floorPlanNotes } }),
        });
        addToast('Floor plan notes saved!', 'success');
      }
    } catch (error) {
      addToast(`Failed to save floor plan: ${error.message}`, 'error');
    } finally {
      setSavingFloorPlan(false);
    }
  };

  // ─── Group by room helper ─────────────────────────────────────────────────
  const groupProductsByRoom = (products) => {
    const groups = {};
    products.forEach((p, idx) => {
      const room = p.selectedOptions?.room || '— No Room Assigned —';
      if (!groups[room]) groups[room] = [];
      groups[room].push({ product: p, originalIndex: idx });
    });
    return groups;
  };

  const previewUrl = getFloorPlanPreviewUrl();
  const isImageFile = (floorPlanFile?.type || existingFloorPlan?.contentType || '').startsWith('image/');
  const totalCount = savedProducts.length + (draftProduct ? 1 : 0);

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
            <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              ← Back to Order List
            </button>
            <button
              onClick={() => setShowLibraryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
            >
              <Library className="w-5 h-5" /> Browse Library
            </button>
            <button
              onClick={addManualProduct}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-lg shadow hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" /> Add Product
            </button>
          </div>
        </div>

        {totalCount === 0 && (
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
              {savingFloorPlan ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Floor Plan</>}
            </button>
          )}
        </div>

        {!floorPlanFile && !existingFloorPlan ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#005670] transition-colors">
            <input type="file" id="floorPlanUpload" className="hidden" onChange={handleFloorPlanSelect} accept="image/*,.pdf,.dwg,.dxf" />
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
                    <p className="font-medium text-gray-900">{floorPlanFile?.name || existingFloorPlan?.filename || 'Floor Plan'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {floorPlanFile ? `${(floorPlanFile.size / 1024).toFixed(1)} KB` : existingFloorPlan ? `${(existingFloorPlan.size / 1024).toFixed(1)} KB` : ''}
                    </p>
                    {existingFloorPlan?.uploadedAt && (
                      <p className="text-xs text-gray-400 mt-1">Uploaded {new Date(existingFloorPlan.uploadedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {previewUrl && (
                      <button onClick={() => setShowFloorPlanPreview(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={removeFloorPlan} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea value={floorPlanNotes} onChange={(e) => setFloorPlanNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] resize-none" rows={2} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Products List ── */}
      <div className="space-y-4">
        {totalCount === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Added</h3>
            <p className="text-gray-600 mb-6">Select from library or create manual products</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowLibraryModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:shadow-lg transition-all">
                <Library className="w-5 h-5" /> Browse Library
              </button>
              <button onClick={addManualProduct} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-lg shadow hover:shadow-lg transition-all">
                <Plus className="w-5 h-5" /> Add Product
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary header */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Products ({savedProducts.length})
                {draftProduct && <span className="ml-2 text-sm text-amber-600 font-normal">+1 unsaved</span>}
              </h3>
              <span className="text-xs text-gray-500">Grouped by room</span>
            </div>

            {/* ── Draft product (unsaved) — selalu di atas ── */}
            {draftProduct && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-1">
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-semibold text-amber-800">New Product</span>
                    <span className="text-xs text-amber-600">(unsaved — fill in and click Save)</span>
                  </div>
                  <div className="flex-1 h-px bg-amber-100" />
                </div>
                <ProductCard                  
                  product={draftProduct}
                  index="draft"
                  order={order}
                  allProducts={savedProducts}
                  expanded={expandedProduct === 'draft'}
                  onToggleExpand={() => setExpandedProduct(expandedProduct === 'draft' ? null : 'draft')}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onSaved={(newSavedProducts) => {
                    console.log('=== onSaved DRAFT ===', newSavedProducts?.map(p => ({ id: p._id, name: p.name })));
                    // ✅ draft berhasil disimpan: masuk ke savedProducts, draft dihapus
                    setSavedProducts(newSavedProducts);
                    setDraftProduct(null);
                    setExpandedProduct(null);
                    if (onSave) onSave(newSavedProducts);
                  }}
                  onToast={addToast}
                />
              </div>
            )}

            {/* ── Saved products, grouped by room ── */}
            {Object.entries(groupProductsByRoom(savedProducts)).map(([room, items]) => (
              <div key={room} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                    <svg className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm font-semibold text-teal-800">{room}</span>
                    <span className="text-xs text-teal-600 font-medium">({items.length})</span>
                  </div>
                  <div className="flex-1 h-px bg-teal-100" />
                </div>

                {items.map(({ product, originalIndex }) => (
                  <ProductCard
                    key={`product-${originalIndex}`}
                    product={product}
                    index={originalIndex}
                    order={order}
                    allProducts={savedProducts}
                    expanded={expandedProduct === originalIndex}
                    onToggleExpand={() => setExpandedProduct(expandedProduct === originalIndex ? null : originalIndex)}
                    onUpdate={updateProduct}
                    onRemove={removeProduct}
                    onSaved={(newSavedProducts) => {
                      console.log('=== onSaved DRAFT ===', newSavedProducts?.map(p => ({ id: p._id, name: p.name })));
                      setSavedProducts(newSavedProducts);
                      if (onSave) onSave(newSavedProducts);
                    }}
                    onToast={addToast}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Summary ── */}
      {totalCount > 0 && (
        <div className="bg-gray-100 rounded-xl p-4 mt-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Total Products: </span>
              <strong className="text-gray-900">{savedProducts.length}</strong>
              {draftProduct && <span className="text-amber-600 ml-1">(+1 unsaved)</span>}
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-purple-600 font-medium">{savedProducts.filter(p => p.sourceType === 'library').length} Library</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-[#005670] font-medium">{savedProducts.filter(p => p.sourceType === 'manual').length} Manual</span>
            </div>
            <div className="text-lg font-bold text-[#005670]">
              Total: ${savedProducts.reduce((sum, p) => sum + (p.finalPrice || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* ── Floor Plan Preview Modal ── */}
      {showFloorPlanPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFloorPlanPreview(false)}>
          <div className="max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{floorPlanFile?.name || existingFloorPlan?.filename}</h3>
              <button onClick={() => setShowFloorPlanPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {isImageFile ? <img src={previewUrl} alt="Floor plan" className="max-w-full h-auto" />
                : <div className="text-center py-20"><File className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">Preview not available</p></div>}
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      <ProductSelectionModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelectProducts={handleAddFromLibrary}
        alreadySelected={savedProducts.filter(p => p.sourceType === 'library').map(p => p._id)}
      />
    </div>
  );
};

// ==================== PRODUCT CARD COMPONENT ====================

const ProductCard = ({
  product, index, order, allProducts, expanded,
  onToggleExpand, onUpdate, onRemove, onSaved, onToast
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [customAttrs, setCustomAttrs] = useState(product.selectedOptions?.customAttributes || {});
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const productRef = useRef(product);
  
  useEffect(() => {
    console.log('=== productRef update ===', {
      id: product._id,
      name: product.name,
      index
    });
    productRef.current = product;
  }, [product]);

  useEffect(() => {
    setCustomAttrs(product.selectedOptions?.customAttributes || {});
  }, [product._id, product.selectedOptions?.customAttributes]);

  const opts = product.selectedOptions || {};
  const upd = (field, value) => onUpdate(index, `selectedOptions.${field}`, value);

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ' +
    'focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] ' +
    'disabled:bg-gray-100 disabled:cursor-not-allowed';

  const getAllImages = () => {
    const images = [];
    if (opts.image) images.push({ url: opts.image, source: 'primary' });
    (opts.images || []).forEach(url => { if (url && !images.find(i => i.url === url)) images.push({ url, source: 'gallery' }); });
    (opts.uploadedImages || []).forEach(img => {
      const url = img.url || img.previewUrl || (img.data ? `data:${img.contentType};base64,${img.data}` : null);
      if (url) images.push({ url, source: 'uploaded', filename: img.filename });
    });
    return images;
  };
  const allImages = getAllImages();
  const primaryImage = allImages[0]?.url;

  const buildProductPayload = (src) => ({
    ...(src._id && !src._id.toString().startsWith('temp_') && { _id: src._id }),
    product_id:  src.product_id,
    name:        src.name,
    category:    src.category   || '',
    package:     src.package    || '',                 // ✅ NEW
    spotName:    src.spotName   || 'Custom Item',
    quantity:    src.quantity   || 1,
    unitPrice:   parseFloat(src.unitPrice)  || 0,
    finalPrice:  parseFloat(src.finalPrice) || 0,
    vendor:      src.vendor     || null,
    sourceType:  src.sourceType || 'manual',
    isEditable:  src.isEditable !== undefined ? src.isEditable : true,
    selectedOptions: {
      finish:                src.selectedOptions?.finish                || '',
      woodFinish:            src.selectedOptions?.woodFinish            || '',
      fabric:                src.selectedOptions?.fabric                || '',
      others:                src.selectedOptions?.others                || [],
      fabricFinish:          src.selectedOptions?.fabricFinish          || '',
      size:                  src.selectedOptions?.size                  || '',
      sidemark:              src.selectedOptions?.sidemark              || '',
      group:                 src.selectedOptions?.group                 || '',
      tags:                  src.selectedOptions?.tags                  || [],
      itemClass:             src.selectedOptions?.itemClass             || '',
      cfaSampleApproval:     src.selectedOptions?.cfaSampleApproval     || '',
      vendorDescription:     src.selectedOptions?.vendorDescription     || '',
      insetPanel:            src.selectedOptions?.insetPanel            || '',
      image:                 src.selectedOptions?.image                 || '',
      images:                src.selectedOptions?.images                || [],
      links:                 src.selectedOptions?.links                 || [],
      specifications:        src.selectedOptions?.specifications        || '',
      notes:                 src.selectedOptions?.notes                 || '',
      uploadedImages:        src.selectedOptions?.uploadedImages        || [],
      customAttributes:      src.selectedOptions?.customAttributes      || {},
      shipToVendorId:        src.selectedOptions?.shipToVendorId        || null,
      shipToName:            src.selectedOptions?.shipToName            || '',
      shippingStreet:        src.selectedOptions?.shippingStreet        || '',
      shippingCity:          src.selectedOptions?.shippingCity          || '',
      shippingState:         src.selectedOptions?.shippingState         || '',
      shippingPostalCode:    src.selectedOptions?.shippingPostalCode    || '',
      shippingCountry:       src.selectedOptions?.shippingCountry       || '',
      shipToPhone:           src.selectedOptions?.shipToPhone           || '',
      poNumber:              src.selectedOptions?.poNumber              || '',
      vendorOrderNumber:     src.selectedOptions?.vendorOrderNumber     || '',
      trackingInfo:          src.selectedOptions?.trackingInfo          || '',
      deliveryStatus:        src.selectedOptions?.deliveryStatus        || '',
      room:                  src.selectedOptions?.room                  || '',
      statusCategory:        src.selectedOptions?.statusCategory        || '',
      proposalNumber:        src.selectedOptions?.proposalNumber        || '',
      shipTo:                src.selectedOptions?.shipTo                || '',
      orderDate:             src.selectedOptions?.orderDate             || '',
      expectedShipDate:      src.selectedOptions?.expectedShipDate      || '',
      expectedArrivalDate:   src.selectedOptions?.expectedArrivalDate   || '',
      dateReceived:          src.selectedOptions?.dateReceived          || '',
      dateInspected:         src.selectedOptions?.dateInspected         || '',
      estimatedDeliveryDate: src.selectedOptions?.estimatedDeliveryDate || '',
      shippingCarrier:       src.selectedOptions?.shippingCarrier       || '',
      orderStatus:           src.selectedOptions?.orderStatus           || '',
      nextStep:              src.selectedOptions?.nextStep              || '',
      nextStepDate:          src.selectedOptions?.nextStepDate          || '',
      warehouseReceivingNumber: src.selectedOptions?.warehouseReceivingNumber || '',
      units:                 src.selectedOptions?.units                 || 'Each',
      msrp:                  parseFloat(src.selectedOptions?.msrp)             || 0,
      discountPercent:       parseFloat(src.selectedOptions?.discountPercent)  || 0,
      netCostOverride:       src.selectedOptions?.netCostOverride       ?? null,
      noNetPurchaseCost:     src.selectedOptions?.noNetPurchaseCost     || false,
      discountTaken:         src.selectedOptions?.discountTaken         || '',
      shippingCost:          parseFloat(src.selectedOptions?.shippingCost)     || 0,
      otherCost:             parseFloat(src.selectedOptions?.otherCost)        || 0,
      markupPercent:         parseFloat(src.selectedOptions?.markupPercent)    || 0,
      shippingMarkupPercent: parseFloat(src.selectedOptions?.shippingMarkupPercent) || 0,
      otherMarkupPercent:    parseFloat(src.selectedOptions?.otherMarkupPercent)    || 0,
      depositPercent:        parseFloat(src.selectedOptions?.depositPercent)   || 0,
      vendorDepositPercent:  parseFloat(src.selectedOptions?.vendorDepositPercent)  || 0,
      salesTaxRate:          parseFloat(src.selectedOptions?.salesTaxRate)     || 0,
      taxableCost:            src.selectedOptions?.taxableCost           !== false,
      taxableMarkup:          src.selectedOptions?.taxableMarkup         !== false,
      taxableShippingCost:    src.selectedOptions?.taxableShippingCost   !== false,
      taxableShippingMarkup:  src.selectedOptions?.taxableShippingMarkup !== false,
      taxableOtherCost:       src.selectedOptions?.taxableOtherCost      !== false,
      taxableOtherMarkup:     src.selectedOptions?.taxableOtherMarkup    !== false,
    },
    placement: src.placement || null
  });

  const addCustomAttribute = () => {
    if (!newAttrKey.trim()) return;
    const updated = { ...customAttrs, [newAttrKey]: newAttrValue };
    setCustomAttrs(updated);
    upd('customAttributes', updated);
    setNewAttrKey(''); setNewAttrValue('');
  };

  const removeCustomAttribute = (key) => {
    const updated = { ...customAttrs };
    delete updated[key];
    setCustomAttrs(updated);
    upd('customAttributes', updated);
  };

  // ✅ KUNCI: handleSaveProduct sekarang BERSIH karena
  // allProducts = savedProducts (tidak pernah include draft)
  // Tidak ada risiko duplicate karena draft terpisah
  const handleSaveProduct = async () => {
    const currentProduct = productRef.current;

    if (!currentProduct.name?.trim()) {
      onToast('Product must have a Name!', 'error');
      return;
    }
    if (saving) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      // ── Tentukan apakah CREATE atau UPDATE ──────────────────────────
      // CREATE: index === 'draft' (product belum pernah ada di DB)
      // UPDATE: index adalah number (product sudah ada di savedProducts)
      const isCreate = index === 'draft';

      let updatedProducts;

      if (isCreate) {
        // ── CREATE: strip temp _id, append ke list ──────────────────
        const { _id, ...cleanProduct } = currentProduct;
        updatedProducts = [
          ...allProducts.map(buildProductPayload),
          buildProductPayload(cleanProduct),
        ];

      } else {
        // ── UPDATE: ambil data terbaru dari state (allProducts[index])
        // bukan dari productRef yang mungkin stale
        const productToSave = allProducts[index];

        if (!productToSave) {
          throw new Error('Product not found — please refresh the page.');
        }

        // Fetch fresh dari DB untuk hindari overwrite product lain
        const freshRes = await fetch(`${backendServer}/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!freshRes.ok) throw new Error('Failed to fetch current order state');
        const freshOrder = await freshRes.json();
        const freshProducts = freshOrder.selectedProducts || [];

        // Replace product yang matching by index posisi
        // (lebih reliable daripada match by _id yang mungkin undefined)
        updatedProducts = freshProducts.map((p, i) =>
          i === index
            ? buildProductPayload(productToSave)
            : buildProductPayload(p)
        );
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

      const savedOrder = await saveResponse.json();
      onToast('Product saved successfully!', 'success');
      if (onSaved) onSaved(savedOrder.selectedProducts || updatedProducts);

    } catch (error) {
      onToast(`Failed to save: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

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

  // Numbering display: draft = "New", saved = urutan di savedProducts (originalIndex + 1)
  const displayNumber = index === 'draft' ? 'New' : `#${index + 1}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">

      {/* ── Compact Header ── */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 cursor-pointer hover:border-[#005670] transition-colors relative"
            onClick={() => allImages.length > 0 && setShowImageGallery(true)}
          >
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-8 h-8" /></div>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">+{allImages.length - 1}</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                product.sourceType === 'library' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {product.sourceType === 'library'
                  ? <><Lock className="w-3 h-3" /> Library {displayNumber}</>
                  : <><Edit2 className="w-3 h-3" /> Manual {displayNumber}</>}
              </span>
              {index === 'draft' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Unsaved
                </span>
              )}
              {opts.statusCategory && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  {opts.statusCategory}
                </span>
              )}
            </div>
            <h4 className="font-bold text-gray-900 truncate">{product.name || 'Untitled Product'}</h4>
               {product.package && (
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    product.package === 'Lani'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-violet-100 text-violet-800'
                  }`}>
                    📦 {product.package}
                  </span>
                )}
            <p className="text-xs text-gray-500 mt-1">
              {product.product_id} • Qty: {product.quantity} • ${parseFloat(product.finalPrice || 0).toFixed(2)}
              {opts.room && <span className="text-teal-600"> • {opts.room}</span>}
              {opts.shipToName && <span className="text-blue-600"> • ✈ {opts.shipToName}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {allImages.length > 0 && (
              <button onClick={() => setShowImageGallery(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-5 h-5" /></button>
            )}
            <button onClick={onToggleExpand} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Edit2 className="w-5 h-5 text-gray-600" /></button>
            <button onClick={() => onRemove(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* ── Image Gallery Modal ── */}
      {showImageGallery && allImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowImageGallery(false)}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm opacity-90">Image {currentImageIndex + 1} of {allImages.length}</p>
                </div>
                <button onClick={() => setShowImageGallery(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="flex items-center justify-center min-h-[60vh]">
              <img src={allImages[currentImageIndex].url} alt={`Image ${currentImageIndex + 1}`} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            </div>
            {allImages.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex gap-2 overflow-x-auto justify-center">
                    {allImages.map((img, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                        className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-white scale-110' : 'border-white/30'}`}>
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
          {product.sourceType === 'library' && (
            <div className="mx-6 mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Read-Only Product</p>
                  <p className="text-xs text-purple-700 mt-1">Library product — quantity, vendor, pricing, shipping, and status/binder fields can be changed.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Bar */}
          <div className="flex border-b border-gray-200 px-6 pt-4 gap-1 overflow-x-auto">
            {PRODUCT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.id ? 'border-[#005670] text-[#005670] bg-[#005670]/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 space-y-5">

            {/* ════ TAB: GENERAL INFO ════ */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">General Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name *</label>
                  <input type="text" value={product.name} onChange={(e) => onUpdate(index, 'name', e.target.value)}
                    disabled={!product.isEditable} className={inputCls} placeholder="e.g. Living Room - Sofa Pillow" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Room</label>
                    <select value={opts.room || ''} onChange={(e) => upd('room', e.target.value)} className={`${inputCls} bg-white`}>
                      <option value="">Select...</option>
                      {ROOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                    <input type="text" value={Array.isArray(opts.tags) ? opts.tags.join(', ') : (opts.tags || '')}
                      onChange={(e) => upd('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      disabled={!product.isEditable} className={inputCls} placeholder="tag1, tag2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Group</label>
                    <input type="text" value={opts.group || ''} onChange={(e) => upd('group', e.target.value)}
                      disabled={!product.isEditable} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Class</label>
                    <select value={opts.itemClass || ''} onChange={(e) => upd('itemClass', e.target.value)}
                      disabled={!product.isEditable} className={`${inputCls} bg-white`}>
                      <option value="">Select...</option>
                      {ITEM_CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Sidemark</span>
                      <button type="button" onClick={() => {
                        const defaultSidemark = `Henderson Design Group / ${order?.clientInfo?.name || ''} / ${product.name || ''}`.replace(/\s*\/\s*\/\s*/g, ' / ').trim();
                        upd('sidemark', defaultSidemark);
                      }} className="text-xs text-blue-600 hover:underline font-normal">Set Default</button>
                    </label>
                    <input type="text" value={opts.sidemark || ''} onChange={(e) => upd('sidemark', e.target.value)}
                      disabled={!product.isEditable} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB: ITEM DETAILS ════ */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Item Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor</label>
                    <VendorSearchDropdown selectedVendor={product.vendor} onSelectVendor={(v) => onUpdate(index, 'vendor', v)} disabled={false} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU / Item #</label>
                    <input type="text" value={product.product_id} onChange={(e) => onUpdate(index, 'product_id', e.target.value)}
                      disabled={!product.isEditable} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Order Number</label>
                    <input type="text" value={opts.vendorOrderNumber || ''} onChange={(e) => upd('vendorOrderNumber', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Description</label>
                    <textarea value={opts.specifications || ''} onChange={(e) => upd('specifications', e.target.value)}
                      disabled={!product.isEditable} className={`${inputCls} resize-none`} rows={5} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Vendor Description</span>
                      <button type="button" onClick={() => upd('vendorDescription', opts.specifications || '')}
                        className="text-xs text-blue-600 hover:underline font-normal">Copy from Client</button>
                    </label>
                    <textarea value={opts.vendorDescription || ''} onChange={(e) => upd('vendorDescription', e.target.value)}
                      disabled={!product.isEditable} className={`${inputCls} resize-none`} rows={5} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Color / Finish</label>
                    <input type="text" value={opts.finish || ''} onChange={(e) => upd('finish', e.target.value)} disabled={!product.isEditable} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dimensions</label>
                    <input type="text" value={opts.size || ''} onChange={(e) => upd('size', e.target.value)} disabled={!product.isEditable} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Item URL</label>
                    <input type="text" value={opts.links?.[0] || ''} onChange={(e) => {
                      const rest = opts.links?.slice(1) || [];
                      upd('links', e.target.value ? [e.target.value, ...rest] : rest);
                    }} disabled={!product.isEditable} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CFA / Sample Approval</label>
                    <select value={opts.cfaSampleApproval || ''} onChange={(e) => upd('cfaSampleApproval', e.target.value)} className={`${inputCls} bg-white`}>
                      <option value="">Select...</option>
                      {CFA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fabric</label>
                    <input type="text" value={opts.fabric || ''} onChange={(e) => upd('fabric', e.target.value)} disabled={!product.isEditable} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category / Location</label>
                  <input type="text" value={product.category} onChange={(e) => onUpdate(index, 'category', e.target.value)} disabled={!product.isEditable} className={inputCls} />
                </div>

                {product.isEditable && (
                  <>
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-800 text-sm">Custom Attributes</h4>
                      {Object.keys(customAttrs).length > 0 && (
                        <div className="space-y-2">
                          {Object.entries(customAttrs).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div><p className="text-xs font-medium text-gray-500">Attribute</p><p className="text-sm font-semibold text-gray-900">{key}</p></div>
                                <div><p className="text-xs font-medium text-gray-500">Value</p><p className="text-sm text-gray-900">{value}</p></div>
                              </div>
                              <button onClick={() => removeCustomAttribute(key)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 mb-3">Add Custom Attribute</p>
                        <div className="flex gap-3">
                          <input type="text" value={newAttrKey} onChange={(e) => setNewAttrKey(e.target.value)} placeholder="Attribute name" className={inputCls} />
                          <input type="text" value={newAttrValue} onChange={(e) => setNewAttrValue(e.target.value)} placeholder="Value" className={inputCls} />
                          <button onClick={addCustomAttribute} disabled={!newAttrKey.trim()}
                            className="px-6 py-2 bg-[#005670] text-white rounded-lg hover:bg-[#007a9a] disabled:opacity-50 transition-colors whitespace-nowrap">Add</button>
                        </div>
                      </div>
                    </div>
                    <ImageUploadField orderId={order._id} images={opts.uploadedImages || []} onImagesChange={(images) => upd('uploadedImages', images)} />
                  </>
                )}
              </div>
            )}

            {/* ════ TAB: SHIPPING ════ */}
            {activeTab === 'shipping' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Shipping</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship To</label>
                    <ShipToVendorDropdown selectedVendorId={opts.shipToVendorId || null} onSelect={handleShipToSelect} onClear={handleShipToClear} disabled={false} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship To Name</label>
                    <input type="text" value={opts.shipToName || ''} disabled className={`${inputCls} bg-gray-50`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Street</label>
                    <input type="text" value={opts.shippingStreet || ''} disabled className={`${inputCls} bg-gray-50`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping City</label>
                    <input type="text" value={opts.shippingCity || ''} disabled className={`${inputCls} bg-gray-50`} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input type="text" value={opts.shippingState || ''} disabled className={`${inputCls} bg-gray-50`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                    <input type="text" value={opts.shippingPostalCode || ''} disabled className={`${inputCls} bg-gray-50`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="text" value={opts.shipToPhone || ''} disabled className={`${inputCls} bg-gray-50`} />
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB: PRICING ════ */}
            {activeTab === 'pricing' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">Item Pricing</h3>
                {product.sourceType === 'library' && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <p className="text-xs text-amber-800"><strong>Library Product</strong> — pricing inherited from catalog.</p>
                  </div>
                )}
                {/* <PricingFields product={product} index={index} onUpdate={onUpdate} disabled={product.sourceType === 'library'} /> */}
                <PricingFields product={product} index={index} onUpdate={onUpdate} disabled={false} />
              </div>
            )}

            {/* ════ TAB: INSTALL BINDER ════ */}
            {activeTab === 'installbinder' && (
              <div className="space-y-5">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Tracking info, proposal number, and delivery/order status are managed in the <strong>Status</strong> tab.
                    Vendor order number is in the <strong>Item Details</strong> tab. All data is shared — no need to enter twice.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Order (PO #)</label>
                    <input type="text" value={opts.poNumber || ''} onChange={(e) => upd('poNumber', e.target.value)} className={inputCls} placeholder="Tim-2289995" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                    <textarea value={opts.notes || ''} onChange={(e) => upd('notes', e.target.value)}
                      className={`${inputCls} resize-none`} rows={3} />
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB: STATUS ════ */}
            {activeTab === 'status' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">Status</h3>
                <StatusReportFields product={product} index={index} onUpdate={onUpdate} disabled={false} />
              </div>
            )}

            {/* ── Save Button ── */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button onClick={handleSaveProduct} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-semibold shadow-sm hover:shadow-md">
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Check className="w-5 h-5" /> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomProductManager;