// components/CustomProductManager.jsx
// ✅ PATCHED v6:
//    1–9. All previous patches retained
//   10. [NEW] Lead Time field — added to localFields, buildProductPayload, Order model, backend save
//   11. [NEW] Drag-to-reorder products within/across room groups (HTML5 drag-and-drop, no extra deps)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Trash2, Save, FileText, Loader2, AlertCircle,
  Library, Lock, Edit2, Upload, File, X, Eye, ImageIcon, Check,
  Package, Truck, DollarSign, ClipboardList, Activity, Tag, GripVertical
} from 'lucide-react';
import { backendServer } from '../utils/info';
import ProductSelectionModal from './ProductSelectionModal';
import ImageUploadField from './ImageUploadField';
import VendorSearchDropdown from './VendorSearchDropdown';
import ShipToVendorDropdown from './ShipToVendorDropdown';
import StatusReportFields from './StatusReportFields';
import PricingFields from './PricingFields';
import { uploadFileToS3 } from '../utils/uploadToS3';
import AuditLogDrawer from './AuditLogDrawer';

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
  '__custom__',
];

const ITEM_CLASS_DISPLAY_OPTIONS = [
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


const SERVICE_OPTIONS = [
  'DESIGN SERVICES',
  'PROJECT MANAGEMENT SERVICES',
  'PROCUREMENT SERVICES',
  'FDI SERVICES (FREIGHT, DELIVERY & INSTALLATION)',
  'WALLPAPER INSTALLATION SERVICES',
  'ELECTRICAL INSTALLATION SERVICES',
  'ART INSTALLATION SERVICES',
  'WALLPAPER TRADE COORDINATION',
  'ELECTRICAL TRADE COORDINATION',
  'CLOSET SOLUTIONS',
  'KITCHEN & HOUSEHOLD ESSENTIALS PACKAGE',
  'WINDOW COVERING SERVICES',
  'AUDIO VISUAL SERVICES',
  'GREENERY & PLANT STYLING',
  'CONSTRUCTION DESIGN & PM SERVICES',
  'CUSTOM MILLWORK SERVICES',
  'CUSTOM FURNITURE SERVICES',
  'LIGHTING PROCUREMENT & COORDINATION',
  'APPLIANCE COORDINATION',
  'PLUMBING FIXTURE COORDINATION',
  'DECORATIVE PLUMBING COORDINATION',
  'STONE & SLAB COORDINATION',
  'TILE & SURFACE COORDINATION',
  'HARDWARE & DECORATIVE HARDWARE COORDINATION',
  'OUTDOOR FURNISHINGS',
  'LANAI / TERRACE FURNISHINGS',
  'STYLING & ACCESSORIES',
  'BEDDING PACKAGE',
  'TURNKEY MOVE-IN PACKAGE',
  'OWNER STORAGE & INVENTORY COORDINATION',
  'CLIENT SUPPLIED ITEMS COORDINATION',
  'WHITE GLOVE RECEIVING & WAREHOUSING',
  'PUNCH LIST & COMPLETION COORDINATION',
  'SITE VISIT COORDINATION',
  'EXPEDITING SERVICES',
  'BUILDING COORDINATION SERVICES',
  'CONTRACTOR COORDINATION SERVICES',
  'INSTALLATION OVERSIGHT',
  'FINAL STYLING & STAGING',
  'REVEAL PREPARATION',
];

const SERVICE_DESCRIPTIONS = {
  'DESIGN SERVICES': 'Professional interior design services including concept development, space planning, finish selections, furniture specifications, presentations, and coordination of approved design intent.',
  'PROJECT MANAGEMENT SERVICES': 'Oversight and coordination of project schedules, vendors, approvals, communication, timelines, and overall project execution.',
  'PROCUREMENT SERVICES': 'Sourcing, purchasing, tracking, and coordination of approved furnishings, materials, and related project items.',
  'FDI SERVICES (FREIGHT, DELIVERY & INSTALLATION)': 'Coordination of freight, warehousing, receiving, quality control, delivery, installation, staging, and final placement of approved project items.',
  'WALLPAPER INSTALLATION SERVICES': 'Labor and coordination associated with installation of approved wallcoverings and related site preparation.',
  'ELECTRICAL INSTALLATION SERVICES': 'Coordination and labor related to installation of decorative lighting, controls, and approved electrical scope items.',
  'ART INSTALLATION SERVICES': 'Placement, mounting, alignment, and installation coordination for artwork and decorative wall items.',
  'WALLPAPER TRADE COORDINATION': 'Coordination and management of wallpaper trades, scheduling, field verification, and installation oversight.',
  'ELECTRICAL TRADE COORDINATION': 'Coordination and management of electrical contractors and approved electrical installation scope.',
  'CLOSET SOLUTIONS': 'Design, sourcing, coordination, and installation oversight for custom or modular closet systems and storage solutions.',
  'KITCHEN & HOUSEHOLD ESSENTIALS PACKAGE': 'Procurement and coordination of kitchenware, tabletop items, linens, accessories, and household essentials for move-in readiness.',
  'WINDOW COVERING SERVICES': 'Design, sourcing, coordination, and installation oversight for drapery, shades, blinds, and related window treatments.',
  'AUDIO VISUAL SERVICES': 'Coordination of audio visual systems, televisions, sound systems, smart home integrations, and related AV scope items.',
  'GREENERY & PLANT STYLING': 'Selection, procurement, placement, and styling coordination for live plants, greenery, and decorative landscape elements.',
  'CONSTRUCTION DESIGN & PM SERVICES': 'Design coordination and project management services related to construction modifications, contractor coordination, and field implementation.',
  'CUSTOM MILLWORK SERVICES': 'Design, detailing, coordination, and oversight of custom cabinetry, built-ins, paneling, and architectural millwork items.',
  'CUSTOM FURNITURE SERVICES': 'Design, development, sourcing, production coordination, and oversight for custom furniture items.',
  'LIGHTING PROCUREMENT & COORDINATION': 'Sourcing, specification, procurement, and coordination of decorative lighting and related components.',
  'APPLIANCE COORDINATION': 'Coordination of appliance selections, specifications, ordering, delivery, and installation readiness.',
  'PLUMBING FIXTURE COORDINATION': 'Coordination of plumbing fixture selections, procurement, specifications, and installation requirements.',
  'DECORATIVE PLUMBING COORDINATION': 'Coordination of decorative plumbing items including faucets, fittings, tubs, and specialty fixtures.',
  'STONE & SLAB COORDINATION': 'Selection, procurement, slab review, layout coordination, and oversight of stone and slab materials.',
  'TILE & SURFACE COORDINATION': 'Selection, procurement, and coordination of tile, surface materials, and related finish applications.',
  'HARDWARE & DECORATIVE HARDWARE COORDINATION': 'Selection and coordination of door hardware, cabinet hardware, and decorative metal finish items.',
  'OUTDOOR FURNISHINGS': 'Procurement, coordination, and installation oversight for exterior furniture and outdoor living items.',
  'LANAI / TERRACE FURNISHINGS': 'Design and furnishing coordination specific to lanais, terraces, balconies, and exterior transitional spaces.',
  'STYLING & ACCESSORIES': 'Selection, procurement, placement, and styling of decorative accessories and finishing elements.',
  'BEDDING PACKAGE': 'Procurement and coordination of bedding, linens, pillows, and related soft goods.',
  'TURNKEY MOVE-IN PACKAGE': 'Comprehensive move-in readiness coordination including furnishings, accessories, essentials, styling, and final setup.',
  'OWNER STORAGE & INVENTORY COORDINATION': 'Management and coordination of owner inventory, stored items, deliveries, and project-related storage logistics.',
  'CLIENT SUPPLIED ITEMS COORDINATION': 'Coordination, receiving, inspection, and installation management of items supplied directly by the client.',
  'WHITE GLOVE RECEIVING & WAREHOUSING': 'Receiving, inspection, inventory management, storage, staging, and handling of approved project items.',
  'PUNCH LIST & COMPLETION COORDINATION': 'Management and coordination of final project corrections, deficiencies, and completion items.',
  'SITE VISIT COORDINATION': 'Scheduling, coordination, reporting, and management associated with project-related site visits.',
  'EXPEDITING SERVICES': 'Follow-up and tracking services to monitor production schedules, shipping timelines, and vendor performance.',
  'BUILDING COORDINATION SERVICES': 'Coordination with building management regarding access, scheduling, rules, deliveries, insurance, and installation logistics.',
  'CONTRACTOR COORDINATION SERVICES': 'Communication and coordination with contractors and trades to align project implementation and scheduling.',
  'INSTALLATION OVERSIGHT': 'On-site supervision and coordination of installation activities to ensure alignment with approved project standards.',
  'FINAL STYLING & STAGING': 'Final placement, styling, detailing, and visual refinement of furnishings and accessories prior to completion or reveal.',
  'REVEAL PREPARATION': 'Preparation and coordination of final presentation, client walkthrough, photography readiness, and project reveal activities.',
};

const CFA_OPTIONS = ['Approved','Rejected','Waived','Pending'];

const ITEM_TYPE_OPTIONS = [
  'Fabric','Wallpaper','Rugs','Furniture','Lighting','Accessories','Art',
  'Window Coverings','Bedding','Pillows','Reupholstery','Installation / Logistics',
  'Electronics','Other',
];

const AVAILABILITY_STATUS_OPTIONS = [
  'Active','Discontinued','Limited Stock','COM','Custom','Pending Approval','Archived',
];

// category key → array of { k: camelCase key, l: label, bool?, num?, sel?: [] }
const CATEGORY_SPECIFIC_FIELDS = {
  'Fabric':                  [{ k:'width', l:'Width' }, { k:'repeat', l:'Repeat' }, { k:'railroaded', l:'Railroaded', bool:true }, { k:'doubleRubs', l:'Double Rubs', num:true }],
  'Wallpaper':               [{ k:'width', l:'Width' }, { k:'repeat', l:'Repeat' }, { k:'matchType', l:'Match Type' }, { k:'washability', l:'Washability' }],
  'Rugs':                    [{ k:'rugSize', l:'Size' }, { k:'constructionMethod', l:'Construction Method' }, { k:'indoorOutdoor', l:'Indoor / Outdoor', sel:['Indoor','Outdoor','Both'] }],
  'Furniture':               [{ k:'comColRequirement', l:'COM/COL Requirement' }, { k:'upholsteryOptions', l:'Upholstery Options' }, { k:'indoorOutdoor', l:'Indoor / Outdoor', sel:['Indoor','Outdoor','Both'] }],
  'Lighting':                [{ k:'bulbType', l:'Bulb Type' }, { k:'voltage', l:'Voltage' }, { k:'dimmable', l:'Dimmable', bool:true }, { k:'ulRating', l:'UL Rating' }],
  'Accessories':             [{ k:'material', l:'Material' }, { k:'indoorOutdoor', l:'Indoor / Outdoor', sel:['Indoor','Outdoor','Both'] }],
  'Art':                     [{ k:'medium', l:'Medium' }, { k:'orientation', l:'Orientation', sel:['Portrait','Landscape','Square'] }, { k:'framedDimensions', l:'Framed Dimensions' }, { k:'frameFinish', l:'Frame Finish' }],
  'Window Coverings':        [{ k:'treatmentType', l:'Treatment Type' }, { k:'opacityLevel', l:'Opacity Level' }, { k:'material', l:'Material' }, { k:'hardwareType', l:'Hardware Type' }],
  'Bedding':                 [{ k:'beddingSize', l:'Size' }, { k:'material', l:'Material' }, { k:'threadCount', l:'Thread Count', num:true }, { k:'fillMaterial', l:'Fill Material' }],
  'Pillows':                 [{ k:'pillowSize', l:'Size' }, { k:'fillMaterial', l:'Fill Material' }, { k:'insertIncluded', l:'Insert Included', bool:true }, { k:'indoorOutdoor', l:'Indoor / Outdoor', sel:['Indoor','Outdoor','Both'] }],
  'Reupholstery':            [{ k:'furnitureType', l:'Furniture Type' }, { k:'comRequired', l:'COM Required', bool:true }, { k:'comYardage', l:'COM Yardage', num:true }, { k:'trimType', l:'Trim Type' }],
  'Installation / Logistics':[{ k:'elevatorRequired', l:'Elevator Required', bool:true }, { k:'stairsPresent', l:'Stairs Present', bool:true }, { k:'assemblyRequired', l:'Assembly Required', bool:true }, { k:'whiteGloveRequired', l:'White Glove Required', bool:true }],
  'Electronics':             [{ k:'modelNumber', l:'Model Number' }, { k:'voltage', l:'Voltage' }, { k:'connectivityType', l:'Connectivity Type' }, { k:'smartCompatible', l:'Smart Compatible', bool:true }],
  'Other':                   [{ k:'productType', l:'Product Type' }, { k:'material', l:'Material' }, { k:'otherFinish', l:'Finish' }],
};

// ✅ PATCH 1: salesTaxRate default 4.712
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
  nextStepDate: '', warehouseReceivingNumber: '', installerNotes: '',
  leadTime: '',   // ✅ PATCH 10
  units: 'Each', msrp: 0, discountPercent: 0, netCostOverride: null,
  noNetPurchaseCost: false, discountTaken: '', shippingCost: 0, otherCost: 0,
  markupPercent: 50, shippingMarkupPercent: 50, otherMarkupPercent: 50,
  depositPercent: 90, vendorDepositPercent: 0,
  salesTaxRate: 4.712,
  taxableCost: true, taxableMarkup: true, taxableShippingCost: true,
  taxableShippingMarkup: true, taxableOtherCost: true, taxableOtherMarkup: true,
});

// ─── ALLOWED FIELDS WHEN LOCKED ─────────────────────────────────────────────
const ALLOWED_WHEN_LOCKED = new Set([
  'quantity', 'vendor', 'unitPrice', 'finalPrice',
  'selectedOptions.shipToVendorId', 'selectedOptions.shipToName',
  'selectedOptions.shippingStreet', 'selectedOptions.shippingCity',
  'selectedOptions.shippingState', 'selectedOptions.shippingPostalCode',
  'selectedOptions.shippingCountry', 'selectedOptions.shipToPhone',
  'selectedOptions.room', 'selectedOptions.statusCategory',
  'selectedOptions.shipTo',
  'selectedOptions.orderDate', 'selectedOptions.expectedShipDate',
  'selectedOptions.expectedArrivalDate', 'selectedOptions.dateReceived',
  'selectedOptions.dateInspected', 'selectedOptions.estimatedDeliveryDate',
  'selectedOptions.shippingCarrier', 'selectedOptions.orderStatus',
  'selectedOptions.nextStep', 'selectedOptions.nextStepDate',
  'selectedOptions.warehouseReceivingNumber',
  'selectedOptions.poNumber', 'selectedOptions.vendorOrderNumber',
  'selectedOptions.trackingInfo', 'selectedOptions.deliveryStatus',
  'selectedOptions.notes',
  'selectedOptions.leadTime',   // ✅ PATCH 10
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
  const [savedProducts, setSavedProducts] = useState([]);
  const [draftProduct, setDraftProduct] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [liveOrder, setLiveOrder] = useState(order);

  // ── Stable per-row id ───────────────────────────────────────────────────────
  // Drag-reorder bug fix: produk bisa punya _id duplikat, sehingga key/identitas
  // React berbasis _id (atau _id+index) bisa ketukar saat reorder → field (gambar,
  // desc, dll) ikut ketukar. _uid ini unik & stabil per baris, dipakai sebagai key
  // dan dasar sinkronisasi state. Tidak disimpan ke DB (Mongoose strict mengabaikan).
  const uidCounter = useRef(0);
  useEffect(() => {
    if (savedProducts.length && savedProducts.some(p => !p._uid)) {
      setSavedProducts(prev =>
        prev.map(p =>
          p._uid ? p : { ...p, _uid: `uid_${Date.now().toString(36)}_${(uidCounter.current++).toString(36)}` }
        )
      );
    }
  }, [savedProducts]);

  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanNotes, setFloorPlanNotes] = useState('');
  const [existingFloorPlan, setExistingFloorPlan] = useState(null);
  const [showFloorPlanPreview, setShowFloorPlanPreview] = useState(false);
  const [savingFloorPlan, setSavingFloorPlan] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const { toasts, addToast, dismiss: dismissToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '',
    confirmLabel: 'Confirm', confirmVariant: 'danger', onConfirm: null,
  });

  // ✅ PATCH 11: drag state
  const dragIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditFocusProduct, setAuditFocusProduct] = useState(null);

  const showConfirm = ({ title, message, confirmLabel, confirmVariant = 'danger', onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, confirmLabel, confirmVariant, onConfirm });
  };
  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  useEffect(() => {
    const fetchLiveOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const fresh = await res.json();

        if (!fresh.proposalNumber) {
          try {
            const genRes = await fetch(
              `${backendServer}/api/proposals/${order._id}/ensure-number`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
              }
            );
            if (genRes.ok) {
              const genData = await genRes.json();
              fresh.proposalNumber = genData.proposalNumber;
            }
          } catch (_) {}
        }

        setLiveOrder(fresh);
      } catch (err) {
        console.error('Failed to fetch live order:', err);
      }
    };
    if (order?._id) fetchLiveOrder();
  }, [order?._id]);

  useEffect(() => {
    if (order?.selectedProducts) {
      setSavedProducts(order.selectedProducts);
    }
    if (order?.customFloorPlan) {
      setExistingFloorPlan(order.customFloorPlan);
      setFloorPlanNotes(order.customFloorPlan.notes || '');
    }
  }, [order]);

  // ─── Library ─────────────────────────────────────────────────────────────
  const handleAddFromLibrary = async (selectedProducts) => {
    setShowLibraryModal(false);

    const newProducts = selectedProducts.map((product) => {
      const imageUrl =
        product.image?.url ||
        product.uploadedImages?.[0]?.url ||
        product.images?.find(i => i.isPrimary)?.url ||
        product.images?.[0]?.url ||
        null;

      const buyPrice  = parseFloat(product.buyPrice)  || 0;
      const sellPrice = parseFloat(product.sellPrice ?? product.price) || 0;

      return {
        _id:        `temp_lib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        product_id: product.product_id || `LIB-${Date.now()}`,
        name:       product.name,
        category:   product.category || 'Library Selection',
        package:    product.package  || '',
        spotName:   'Library Item',
        quantity:   1,
        unitPrice:  sellPrice,
        finalPrice: sellPrice,
        vendor:     null,
        sourceType: 'library',
        isEditable: true,
        libraryProductId: product._id,
        selectedOptions: {
          ...defaultSelectedOptions(),
          image:                 imageUrl || '',
          images:                product.images?.map(i => i.url).filter(Boolean) || [],
          finish:                product.colorFinish || product.woodFinish || '',
          woodFinish:            product.woodFinish   || '',
          fabric:                product.fabric       || '',
          others:                product.others       || [],
          size:                  product.dimension    || '',
          specifications:        product.description  || '',
          vendorDescription:     product.vendorDescription || '',
          links:                 product.itemUrl ? [product.itemUrl] : [],
          itemClass:             product.itemClass    || '',
          leadTime:              product.leadTime     || '',  // ✅ PATCH 10
          msrp:          sellPrice,
          markupPercent: 0,
          netCostOverride:   buyPrice > 0 ? buyPrice : null,
          discountPercent:   0,
          noNetPurchaseCost: buyPrice === 0,
          units:                 'Each',
          shippingMarkupPercent: 50,
          otherMarkupPercent:    50,
          shippingCost:          0,
          otherCost:             0,
          depositPercent:        90,
          vendorDepositPercent:  0,
          salesTaxRate:          4.712,
          taxableCost:            true,
          taxableMarkup:          true,
          taxableShippingCost:    true,
          taxableShippingMarkup:  true,
          taxableOtherCost:       true,
          taxableOtherMarkup:     true,
          discountTaken:         '',
          installerNotes:        '',
        }
      };
    });
    const mergedProducts = [...savedProducts, ...newProducts];
    setSavedProducts(mergedProducts);

    try {
      const token = localStorage.getItem('token');
      const payload = mergedProducts.map(p => ({
        ...(p._id && !p._id.toString().startsWith('temp_') && { _id: p._id }),
        product_id:      p.product_id,
        name:            p.name,
        category:        p.category    || '',
        package:         p.package     || '',
        spotName:        p.spotName    || 'Custom Item',
        quantity:        p.quantity    || 1,
        unitPrice:       parseFloat(p.unitPrice)  || 0,
        finalPrice:      parseFloat(p.finalPrice) || 0,
        vendor:          p.vendor      || null,
        sourceType:      p.sourceType  || 'library',
        isEditable:      true,
        libraryProductId: p.libraryProductId || null,
        selectedOptions: p.selectedOptions || {},
        placement:       p.placement   || null,
      }));

      const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ selectedProducts: payload, status: 'ongoing', step: 2 }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save library products');
      }

      const savedOrder = await res.json();
      const finalProducts = (savedOrder.selectedProducts || mergedProducts).map(p => ({
        ...p,
        isEditable: p.isEditable !== false,
      }));
      setSavedProducts(finalProducts);
      if (onSave) onSave(finalProducts);
      addToast(
        `${newProducts.length} product${newProducts.length > 1 ? 's' : ''} added from library`,
        'success'
      );
    } catch (error) {
      addToast(`Failed to save library products: ${error.message}`, 'error');
      setSavedProducts(savedProducts);
      try {
        const token = localStorage.getItem('token');
        const freshRes = await fetch(`${backendServer}/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const freshOrder = await freshRes.json();
        setSavedProducts((freshOrder.selectedProducts || []).map(p => ({
          ...p,
          isEditable: p.isEditable !== false,
        })));
      } catch (_) {}
    }
  };

  // ─── Add manual ──────────────────────────────────────────────────────────
  const addManualProduct = () => {
    const createDraft = () => {
      const newDraft = {
        _id:        `temp_${Date.now()}`,
        product_id: `CUSTOM-${Date.now().toString().slice(-6)}`,
        name:       '',
        category:   '',
        package:    '',
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
          salesTaxRate:          4.712,
          leadTime:              '',   // ✅ PATCH 10
          taxableCost:            true,
          taxableMarkup:          true,
          taxableShippingCost:    true,
          taxableShippingMarkup:  true,
          taxableOtherCost:       true,
          taxableOtherMarkup:     true,
          discountTaken:         '',
          installerNotes:        '',
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

  // ─── Update ───────────────────────────────────────────────────────────────
  const updateProduct = (index, field, value) => {
    if (index === 'draft') {
      setDraftProduct(prev => {
        if (!prev) return prev;
        if (prev.isEditable === false && !ALLOWED_WHEN_LOCKED.has(field)) return prev;
        return applyFieldUpdate(prev, field, value);
      });
      return;
    }
    setSavedProducts(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;
      if (item.isEditable === false && !ALLOWED_WHEN_LOCKED.has(field)) return prev;
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
                isEditable: p.isEditable !== false,
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
          setSavedProducts((savedOrder.selectedProducts || updatedProducts).map(p => ({
            ...p,
            isEditable: p.isEditable !== false,
          })));
          if (onSave) onSave(savedOrder.selectedProducts || updatedProducts);
          addToast('Product removed successfully', 'success');
        } catch (error) {
          addToast(`Failed to delete: ${error.message}`, 'error');
          try {
            const token = localStorage.getItem('token');
            const freshRes = await fetch(`${backendServer}/api/orders/${order._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const freshOrder = await freshRes.json();
            setSavedProducts((freshOrder.selectedProducts || []).map(p => ({
              ...p,
              isEditable: p.isEditable !== false,
            })));
          } catch (_) {}
        }
      },
    });
  };

  // ─── Floor plan handlers ──────────────────────────────────────────────────
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

  // ─── Room sort order (matches ProposalEditor) ─────────────────────────────
  const ROOM_ORDER = [
    'COURTYARD','EXTERIOR ENTRY','INTERIOR ENTRY','FOYER','LIVING ROOM','DINING ROOM',
    'KITCHEN','PANTRY','PRIMARY BEDROOM','PRIMARY BEDROOM LANAI','PRIMARY BATHROOM',
    'PRIMARY CLOSET','BEDROOM 2','BATHROOM 2','BEDROOM 2 CLOSET','BEDROOM 2 LANAI',
    'BEDROOM 3','BATHROOM 3','BEDROOM 3 CLOSET','BEDROOM 3 LANAI','BEDROOM 4','BATHROOM 4',
    'BEDROOM 4 CLOSET','BEDROOM 4 LANAI','POWDER ROOM','OFFICE','MEDIA ROOM','DEN','HALLWAY',
    'LANAI','MAIN LANAI','POOL LANAI','POOL AREA','BREAKFAST NOOK','GREAT ROOM','FAMILY ROOM','WET BAR','BBQ AREA',
    'POOL BATH','PAVILLION','GYM','WINE ROOM','REC ROOM','GARAGE','SITTING ROOM',
    'FLEX SPACE','LAUNDRY ROOM','MUD ROOM','TERRACE','BALCONY','OUTDOOR DINING',
    'OUTDOOR LIVING','GUEST SUITE','DESIGN SERVICES','PROJECT MANAGEMENT SERVICES',
    'PROCUREMENT SERVICES','FDI SERVICES (FREIGHT, DELIVERY & INSTALLATION)',
    'WALLPAPER INSTALLATION SERVICES','ELECTRICAL INSTALLATION SERVICES',
    'ART INSTALLATION SERVICES','WALLPAPER TRADE COORDINATION',
    'ELECTRICAL TRADE COORDINATION','CLOSET SOLUTIONS',
    'KITCHEN & HOUSEHOLD ESSENTIALS PACKAGE','WINDOW COVERING SERVICES',
    'AUDIO VISUAL SERVICES','GREENERY & PLANT STYLING',
    'CONSTRUCTION DESIGN & PM SERVICES','CUSTOM MILLWORK SERVICES',
    'CUSTOM FURNITURE SERVICES','LIGHTING PROCUREMENT & COORDINATION',
    'APPLIANCE COORDINATION','PLUMBING FIXTURE COORDINATION',
    'DECORATIVE PLUMBING COORDINATION','STONE & SLAB COORDINATION',
    'TILE & SURFACE COORDINATION','HARDWARE & DECORATIVE HARDWARE COORDINATION',
    'OUTDOOR FURNISHINGS','LANAI / TERRACE FURNISHINGS','STYLING & ACCESSORIES',
    'BEDDING PACKAGE','TURNKEY MOVE-IN PACKAGE','OWNER STORAGE & INVENTORY COORDINATION',
    'CLIENT SUPPLIED ITEMS COORDINATION','WHITE GLOVE RECEIVING & WAREHOUSING',
    'PUNCH LIST & COMPLETION COORDINATION','SITE VISIT COORDINATION',
    'EXPEDITING SERVICES','BUILDING COORDINATION SERVICES',
    'CONTRACTOR COORDINATION SERVICES','INSTALLATION OVERSIGHT',
    'FINAL STYLING & STAGING','REVEAL PREPARATION',
  ];

  // ─── Group by room (sorted to match ProposalEditor order) ─────────────────
  const groupProductsByRoom = (products) => {
    const groups = {};
    products.forEach((p, idx) => {
      const room = p.selectedOptions?.room || '— No Room Assigned —';
      if (!groups[room]) groups[room] = [];
      groups[room].push({ product: p, originalIndex: idx });
    });
    return Object.entries(groups).sort(([a], [b]) => {
      const noRoom = '— No Room Assigned —';
      if (a === noRoom) return 1;
      if (b === noRoom) return -1;
      const ia = ROOM_ORDER.indexOf(a.toUpperCase());
      const ib = ROOM_ORDER.indexOf(b.toUpperCase());
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  // ✅ PATCH 11: drag-and-drop reorder handlers
  const handleDragStart = useCallback((e, originalIndex) => {
    dragIndexRef.current = originalIndex;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(originalIndex));
  }, []);

  const handleDragOver = useCallback((e, originalIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(originalIndex);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = dragIndexRef.current;
    if (sourceIndex === null || sourceIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const previous  = savedProducts;
    const reordered = [...savedProducts];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setSavedProducts(reordered);      // optimistic — instant UI feedback
    setExpandedProduct(null);         // ✅ FIX 1: tutup semua panel saat reorder
    handleDragEnd();

    // ── Persist new order to backend ──────────────────────────────────────────
    // Kirim produk apa adanya (tanpa _uid client-only). Backend mempertahankan
    // _id tiap produk & menormalisasi field, jadi tidak ada yang hilang/ketukar.
    // status/step sengaja TIDAK dikirim agar status order tidak ikut berubah.
    try {
      const token = localStorage.getItem('token');
      const payload = reordered.map(({ _uid, ...p }) => p);
      const res = await fetch(`${backendServer}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ selectedProducts: payload }),
      });
      if (!res.ok) throw new Error('Failed to save new order');
      const savedOrder = await res.json();
      if (onSave) onSave(savedOrder.selectedProducts || payload);
      addToast('Order saved', 'success');
    } catch (err) {
      setSavedProducts(previous);     // revert kalau gagal — tidak ada perubahan tergantung
      addToast('Gagal menyimpan urutan: ' + err.message, 'error');
    }
  }, [savedProducts, order._id, onSave, handleDragEnd, addToast]);

  const previewUrl = getFloorPlanPreviewUrl();
  const isImageFile = (floorPlanFile?.type || existingFloorPlan?.contentType || '').startsWith('image/');
  const totalCount = savedProducts.length + (draftProduct ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button onClick={onBack} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#005670] bg-[#005670]/8 hover:bg-[#005670]/15 border border-[#005670]/20 rounded-lg mb-3 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Order List
            </button>
            <h2 className="text-2xl font-bold text-gray-900">🎨 Custom Product Manager</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-600">
                {order?.clientInfo?.name} • Unit {order?.clientInfo?.unitNumber}
              </p>
              {liveOrder?.proposalNumber && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#005670]/10 text-[#005670] rounded-lg text-xs font-semibold font-mono">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {liveOrder.proposalNumber}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* ── History button ── */}
            <button
              onClick={() => {
                setAuditFocusProduct(null);
                setAuditDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
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
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Products ({savedProducts.length})
                  {draftProduct && <span className="ml-2 text-sm text-amber-600 font-normal">+1 unsaved</span>}
                </h3>
              </div>
              {/* ✅ PATCH 11: drag hint */}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <GripVertical className="w-3.5 h-3.5" />
                Drag cards to reorder • Grouped by room
              </span>
            </div>

            {/* ── Draft product ── */}
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
                  order={liveOrder}
                  allProducts={savedProducts}
                  expanded={expandedProduct === 'draft'}
                  onToggleExpand={() => setExpandedProduct(expandedProduct === 'draft' ? null : 'draft')}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onSaved={async (newSavedProducts) => {
                    setSavedProducts(newSavedProducts.map(p => ({ ...p, isEditable: p.isEditable !== false })));
                    setDraftProduct(null);
                    setExpandedProduct(null);
                    if (onSave) onSave(newSavedProducts);
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${backendServer}/api/orders/${liveOrder._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (res.ok) setLiveOrder(await res.json());
                    } catch (_) {}
                  }}
                  onToast={addToast}
                  draggable={false}
                  onOpenHistory={(focus) => {
                    setAuditFocusProduct(focus);
                    setAuditDrawerOpen(true);
                  }}
                />
              </div>
            )}

            {/* ── Saved products grouped by room ── */}
            {groupProductsByRoom(savedProducts).map(([room, items]) => (
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
                    key={product._uid || `${product._id}-${originalIndex}`}
                    product={product}
                    index={originalIndex}
                    order={liveOrder}
                    allProducts={savedProducts}
                    expanded={expandedProduct === originalIndex}
                    onToggleExpand={() => setExpandedProduct(expandedProduct === originalIndex ? null : originalIndex)}
                    onUpdate={updateProduct}
                    onRemove={removeProduct}
                    onSaved={(newSavedProducts) => {
                      setSavedProducts(newSavedProducts.map(p => ({ ...p, isEditable: p.isEditable !== false })));
                      if (onSave) onSave(newSavedProducts);
                    }}
                    onToast={addToast}
                    // ✅ PATCH 11: drag props
                    draggable={true}
                    isDragOver={dragOverIndex === originalIndex}
                    onDragStart={(e) => handleDragStart(e, originalIndex)}
                    onDragOver={(e) => handleDragOver(e, originalIndex)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, originalIndex)}
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
              <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Total Purchase Cost</p>
                <p className="text-base font-bold text-emerald-700">
                  ${savedProducts.reduce((sum, p) => {
                    const opts = p.selectedOptions || {};
                    const qty = parseFloat(p.quantity) || 1;
                    const msrp = parseFloat(opts.msrp) || 0;
                    const disc = parseFloat(opts.discountPercent) || 0;
                    const netUnit = (opts.netCostOverride != null && opts.netCostOverride !== '')
                      ? parseFloat(opts.netCostOverride)
                      : (opts.noNetPurchaseCost ? 0 : msrp * (1 - disc / 100));
                    return sum + netUnit * qty + (parseFloat(opts.shippingCost) || 0) + (parseFloat(opts.otherCost) || 0);
                  }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-px h-8 bg-gray-300" />
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Total Sell Price</p>
                <p className="text-base font-bold text-[#005670]">
                  ${savedProducts.reduce((sum, p) => sum + (parseFloat(p.finalPrice) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
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
        alreadySelected={[]}
      />
 
      {/* ── Audit Log Drawer ── */}
      <AuditLogDrawer
        isOpen={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
        orderId={order._id}
        focusProduct={auditFocusProduct}
        onRollbackDone={async () => {
          // Refresh savedProducts from server after rollback
          try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${backendServer}/api/orders/${order._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const fresh = await res.json();
              setSavedProducts(
                (fresh.selectedProducts || []).map(p => ({ ...p, isEditable: p.isEditable !== false }))
              );
              if (onSave) onSave(fresh.selectedProducts || []);
            }
          } catch (_) {}
        }}
      />
    </div>
  );
};


// ==================== ROOM / SERVICE FIELD ====================
// Single field that stores in opts.room.
// If the value is a ROOM_OPTIONS entry (or custom room text entered while in room mode),
// it behaves as Room. If it's a SERVICE_OPTIONS entry (or custom service text), it's Service.
// Toggle between Room mode and Service mode via a pill toggle.
// Both modes support free-text custom input in the same field.

const isServiceValue = (val) => {
  if (!val) return false;
  return SERVICE_OPTIONS.includes(val) ||
    (!ROOM_OPTIONS.includes(val) && val.length > 0 &&
      SERVICE_OPTIONS.some(s => s.toLowerCase().includes(val.toLowerCase().slice(0, 4))));
};

// Ubah signature komponen:
const RoomServiceField = ({ value, onChange, disabled, inputCls, onServiceSelect }) => {
  const detectMode = (v) => {
    if (!v) return 'room';
    if (ROOM_OPTIONS.includes(v)) return 'room';
    if (SERVICE_OPTIONS.includes(v)) return 'service';
    return 'room';
  };

  const [mode, setMode] = React.useState(() => detectMode(value));
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);
  // localQuery: only used for display + filtering. Never triggers parent re-render while typing.
  // onChange (parent) is only called on blur, select, or clear — NOT on every keystroke.
  // This prevents the room-grouping re-render that was remounting the component mid-type.
  const [localQuery, setLocalQuery] = React.useState(value || '');

  // Sync from parent only when switching to a different product (value changes externally)
  const mountedRef = React.useRef(false);
  const isTypingRef = React.useRef(false);
  React.useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (!isTypingRef.current) {
      setLocalQuery(value || '');
      setMode(detectMode(value));
    }
  }, [value]);

  React.useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        // Commit typed value to parent on outside click
        if (isTypingRef.current) {
          isTypingRef.current = false;
          onChange(localQuery);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [localQuery, onChange]);

  const options = mode === 'room' ? ROOM_OPTIONS : SERVICE_OPTIONS;
  const filtered = localQuery.trim()
    ? options.filter(o => o.toLowerCase().includes(localQuery.toLowerCase()))
    : options;
  const isCustom = localQuery && !options.includes(localQuery);

  const handleInputChange = (e) => {
    const v = e.target.value;
    isTypingRef.current = true;
    setLocalQuery(v); // local only — does NOT call onChange, no parent re-render
  };

  const handleBlur = () => {
    // Commit to parent when input loses focus naturally (tab away, etc.)
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onChange(localQuery);
    }
    // Small delay so click on dropdown item registers before blur closes dropdown
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 150);
  };

  const handleSelect = (opt) => {
    isTypingRef.current = false;
    setLocalQuery(opt);
    onChange(opt);
    setOpen(false);
    inputRef.current?.focus();
    // ✅ AUTO-FILL: jika mode service dan ada deskripsi, panggil callback
    if (mode === 'service' && onServiceSelect) {
      onServiceSelect(opt);
    }
  };

  const handleClear = () => {
    isTypingRef.current = false;
    setLocalQuery('');
    onChange('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const switchMode = (newMode) => {
    isTypingRef.current = false;
    setMode(newMode);
    setLocalQuery('');
    onChange('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Mode toggle */}
      {!disabled && (
        <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg w-fit">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => switchMode('room')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'room' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Room
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => switchMode('service')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'service' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Service
          </button>
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={mode === 'room' ? 'Select or type room…' : 'Select or type service…'}
          className={`${inputCls} pr-8`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {localQuery && !disabled && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => !disabled && setOpen(o => !o)}
            disabled={disabled}
            className="p-0.5 text-gray-400 hover:text-gray-600"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown — onMouseDown preventDefault on every item so input never loses focus */}
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        {isCustom && (
          <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-xs text-blue-700 font-medium">
              Custom: <span className="font-semibold">"{localQuery}"</span>
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(localQuery); setOpen(false); }} // ✅ FIX 2: hapus prevValueRef
              className="text-xs text-blue-600 font-semibold hover:text-blue-800 px-2 py-0.5 bg-blue-100 rounded-md"
            >
              Use this ↵
            </button>
          </div>
        )}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No matches — your custom value will be saved
              </div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#005670]/5 transition-colors flex items-center justify-between ${
                    opt === value ? 'bg-[#005670]/8 text-[#005670] font-medium' : 'text-gray-700'
                  }`}
                >
                  <span>{opt}</span>
                  {opt === value && <Check className="w-3.5 h-3.5 text-[#005670] flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ITEM CLASS FIELD ====================

const ItemClassField = ({ value, onChange, disabled, inputCls }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? ITEM_CLASS_DISPLAY_OPTIONS.filter(o =>
        o.toLowerCase().includes(query.toLowerCase())
      )
    : ITEM_CLASS_DISPLAY_OPTIONS;

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setOpen(false);
  };

  const isCustom = query && !ITEM_CLASS_DISPLAY_OPTIONS.includes(query);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="Select or type custom..."
          className={`${inputCls} pr-8`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setOpen(o => !o)}
            disabled={disabled}
            className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {isCustom && (
            <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <span className="text-xs text-blue-700 font-medium">
                Custom: <span className="font-semibold">"{query}"</span>
              </span>
              <button
                type="button"
                onClick={() => { onChange(query); setOpen(false); }}
                className="text-xs text-blue-600 font-semibold hover:text-blue-800 px-2 py-0.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Use this ↵
              </button>
            </div>
          )}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No matches — your custom value will be saved
              </div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#005670]/5 transition-colors flex items-center justify-between group ${
                    opt === value ? 'bg-[#005670]/8 text-[#005670] font-medium' : 'text-gray-700'
                  }`}
                >
                  <span>{opt}</span>
                  {opt === value && (
                    <Check className="w-3.5 h-3.5 text-[#005670] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== AUTOCOMPLETE FIELD ====================

const AutocompleteField = ({ value, onChange, options, placeholder = '', inputCls }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        className={inputCls}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setQuery(opt); onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#005670]/5 transition-colors ${query === opt ? 'bg-[#005670]/10 font-medium text-[#005670]' : 'text-gray-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== PRODUCT CARD COMPONENT ====================

const ProductCard = ({
  product, index, order, allProducts, expanded,
  onToggleExpand, onUpdate, onRemove, onSaved, onToast,
  // ✅ PATCH 11: drag props
  draggable = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onOpenHistory
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [customAttrs, setCustomAttrs] = useState(product.selectedOptions?.customAttributes || {});
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const productRef = useRef(product);
  const specsRef = useRef(null);

  const applyBoldToSpecs = () => {
    const ta = specsRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;
    const val = localFields.specifications;
    const selected = val.substring(start, end);

    // Unbold: selection includes the ** markers (e.g. user selected "**text**")
    if (selected.startsWith('**') && selected.endsWith('**') && selected.length > 4) {
      const inner = selected.slice(2, -2);
      const newVal = val.substring(0, start) + inner + val.substring(end);
      setLocal('specifications', newVal);
      upd('specifications', newVal);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start, start + inner.length); }, 0);
      return;
    }

    // Unbold: selection is surrounded by ** outside (e.g. val chars before/after are **)
    if (start >= 2 && val.substring(start - 2, start) === '**' &&
        end <= val.length - 2 && val.substring(end, end + 2) === '**') {
      const newVal = val.substring(0, start - 2) + selected + val.substring(end + 2);
      setLocal('specifications', newVal);
      upd('specifications', newVal);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start - 2, start - 2 + selected.length); }, 0);
      return;
    }

    // Bold: wrap with **
    const newVal = val.substring(0, start) + '**' + selected + '**' + val.substring(end);
    setLocal('specifications', newVal);
    upd('specifications', newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 2, end + 2); }, 0);
  };

  const opts = product.selectedOptions || {};

  // ✅ PATCH 7+9+10: localFields includes leadTime
  const [localFields, setLocalFields] = useState({
    name:              product.name              || '',
    product_id:        product.product_id        || '',
    category:          product.category          || '',
    specifications:    opts.specifications       || '',
    vendorDescription: opts.vendorDescription    || '',
    notes:             opts.notes                || '',       // ← Status tab notes (keep existing data)
    itemNotes:         opts.itemNotes            || '',       // ← Item Details notes (separate field)
    finish:            opts.finish               || '',
    fabric:            opts.fabric               || '',
    size:              opts.size                 || '',
    sidemark:          opts.sidemark             || '',
    group:             opts.group                || '',
    links0:            opts.links?.[0]           || '',
    vendorOrderNumber: opts.vendorOrderNumber    || '',
    poNumber:          opts.poNumber             || '',
    tags:              Array.isArray(opts.tags) ? opts.tags.join(', ') : (opts.tags || ''),
    itemClass:         opts.itemClass            || '',
    installerNotes:    opts.installerNotes       || '',
    leadTime:          opts.leadTime             || '',  // ✅ PATCH 10
  });

  useEffect(() => {
    const o = product.selectedOptions || {};
    setLocalFields({
      name:              product.name              || '',
      product_id:        product.product_id        || '',
      category:          product.category          || '',
      specifications:    o.specifications          || '',
      vendorDescription: o.vendorDescription       || '',
      notes:             o.notes                   || '',       // ← Status tab notes
      itemNotes:         o.itemNotes               || '',       // ← Item Details notes (separate)
      finish:            o.finish                  || '',
      fabric:            o.fabric                  || '',
      size:              o.size                    || '',
      sidemark:          o.sidemark                || '',
      group:             o.group                   || '',
      links0:            o.links?.[0]              || '',
      vendorOrderNumber: o.vendorOrderNumber        || '',
      poNumber:          o.poNumber                || '',
      tags:              Array.isArray(o.tags) ? o.tags.join(', ') : (o.tags || ''),
      itemClass:         o.itemClass               || '',
      installerNotes:    o.installerNotes          || '',
      leadTime:          o.leadTime                || '',
    });
    setCustomAttrs(o.customAttributes || {});
    // Depend on the product object identity (not _id/index): reorder keeps the same
    // object reference so local edits are preserved, while a real content change
    // (e.g. after save) swaps in a new object and re-syncs correctly.
  }, [product]);

  const setLocal = (field, value) => {
    setLocalFields(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    productRef.current = product;
  }, [product]);

  const upd = (field, value) => onUpdate(index, `selectedOptions.${field}`, value);

  // Update a single key inside customAttributes
  const updCA = (key, value) => {
    const updated = { ...customAttrs, [key]: value };
    setCustomAttrs(updated);
    upd('customAttributes', updated);
  };

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
    product_id:      src.product_id,
    name:            src.name,
    category:        src.category   || '',
    package:         src.package    || '',
    spotName:        src.spotName   || 'Custom Item',
    quantity:        src.quantity   || 1,
    unitPrice:       parseFloat(src.unitPrice)  || 0,
    finalPrice:      parseFloat(src.finalPrice) || 0,
    vendor: src.vendor
      ? (typeof src.vendor === 'object' ? src.vendor._id : src.vendor)
      : null,
    sourceType:      src.sourceType || 'manual',
    isEditable:      src.isEditable !== false,
    libraryProductId: src.libraryProductId || null,
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
      itemNotes:             src.selectedOptions?.itemNotes             || '',
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
      installerNotes:        src.selectedOptions?.installerNotes        || '',
      leadTime:              src.selectedOptions?.leadTime              || '',  // ✅ PATCH 10
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

  const handleSaveProduct = async () => {
    // ✅ PATCH 8+10: merge localFields (including leadTime) before save
    const mergedProduct = {
      ...productRef.current,
      name:       localFields.name,
      product_id: localFields.product_id,
      category:   localFields.category,
      selectedOptions: {
        ...productRef.current.selectedOptions,
        specifications:    localFields.specifications,
        vendorDescription: localFields.vendorDescription,
        notes:             localFields.notes,        // Status tab
        itemNotes:         localFields.itemNotes,    // Item Details tab (separate)
        finish:            localFields.finish,
        fabric:            localFields.fabric,
        size:              localFields.size,
        sidemark:          localFields.sidemark,
        group:             localFields.group,
        vendorOrderNumber: localFields.vendorOrderNumber,
        poNumber:          localFields.poNumber,
        tags:              localFields.tags.split(',').map(t => t.trim()).filter(Boolean),
        itemClass:         localFields.itemClass,
        installerNotes:    localFields.installerNotes,
        leadTime:          localFields.leadTime,  // ✅ PATCH 10
        customAttributes:  customAttrs,           // always use current state — ensures cleaned attrs on type change
        links: localFields.links0
          ? [localFields.links0, ...(productRef.current.selectedOptions?.links?.slice(1) || [])]
          : (productRef.current.selectedOptions?.links?.slice(1) || []),
      },
    };

    if (!mergedProduct.name?.trim()) {
      onToast('Product must have a Name!', 'error');
      return;
    }
    if (saving) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const isCreate = index === 'draft';
      let updatedProducts;

      if (isCreate) {
        const { _id, ...cleanProduct } = mergedProduct;
        updatedProducts = [
          ...allProducts.map(buildProductPayload),
          buildProductPayload(cleanProduct),
        ];
      } else {
        const productToSave = mergedProduct;
        if (!productToSave) throw new Error('Product not found — please refresh the page.');

        // Bangun array save dari sumber kebenaran FE (allProducts = savedProducts), BUKAN
        // re-fetch order lalu map by index. `index` adalah posisi produk ini di savedProducts,
        // sehingga SELALU cocok — tidak bergantung pada urutan backend. Pendekatan lama
        // (fetch fresh + map by index) menimpa slot tetangga saat urutan FE ≠ backend,
        // sehingga membuat duplikat. Mengirim array FE apa adanya menjaga jumlah & posisi.
        updatedProducts = allProducts.map((p, i) =>
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

  // ✅ PATCH 2: auto-fill markupPercent from vendor
  const handleVendorSelect = (vendor) => {
    onUpdate(index, 'vendor', vendor);
    if (!vendor) return;
    const markup =
      vendor.defaultMarkup     ??
      vendor.markupPercent     ??
      vendor.markup            ??
      vendor.default_markup    ??
      vendor.defaultMarkupPercent ??
      null;
    if (markup != null && markup !== '') {
      const markupNum = parseFloat(markup);
      if (!isNaN(markupNum)) upd('markupPercent', markupNum);
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

  const displayNumber = index === 'draft' ? 'New' : `#${index + 1}`;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-150 ${
        isDragOver
          ? 'border-[#005670] shadow-lg scale-[1.01]'
          : 'border-gray-200'
      }`}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >

      {/* ── Compact Header ── */}
      <div className="p-4">
        <div className="flex items-center gap-4">

          {/* drag handle — draggable only on the handle, not the whole card */}
          {draggable && (
            <div
              draggable={true}
              onDragStart={onDragStart}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="w-5 h-5" />
            </div>
          )}

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
                  ? <><Library className="w-3 h-3" /> Library {displayNumber}</>
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
              {/* ✅ PATCH 10: show lead time badge in header if set */}
              {opts.leadTime && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  ⏱ {opts.leadTime}
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
              {product.vendor?.name && (
                <span className="text-amber-700 font-medium"> • 🏢 {product.vendor.name}</span>
              )}
              {opts.room && <span className="text-teal-600"> • {opts.room}</span>}
              {opts.shipToName && <span className="text-blue-600"> • ✈ {opts.shipToName}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {allImages.length > 0 && (
              <button onClick={() => setShowImageGallery(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Eye className="w-5 h-5" />
              </button>
            )}
            {/* ── Per-product history button (only for saved products) ── */}
            {index !== 'draft' && product._id && !String(product._id).startsWith('temp_') && onOpenHistory && (
              <button
                onClick={() => onOpenHistory({
                  productId:   String(product._id),
                  productName: product.name || 'Unnamed Product',
                })}
                title="View change history for this product"
                className="p-2 text-gray-400 hover:text-[#005670] hover:bg-[#005670]/8 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            <button onClick={onToggleExpand} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => onRemove(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
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

                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name *</label>
                  <input
                    type="text"
                    value={localFields.name}
                    onChange={(e) => { setLocal('name', e.target.value); onUpdate(index, 'name', e.target.value); }}
                    className={inputCls}
                    placeholder="e.g. Living Room - Sofa Pillow"
                  />
                </div>

                {/* Item Type + Availability Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Type</label>
                    <AutocompleteField
                      value={localFields.itemClass}
                      onChange={(v) => {
                        // Clear category-specific keys from the OLD item type before switching
                        const oldKeys = (CATEGORY_SPECIFIC_FIELDS[localFields.itemClass] || []).map(f => f.k);
                        const cleaned = { ...customAttrs };
                        oldKeys.forEach(k => delete cleaned[k]);
                        setCustomAttrs(cleaned);
                        upd('customAttributes', cleaned);
                        setLocal('itemClass', v);
                        upd('itemClass', v);
                      }}
                      options={ITEM_TYPE_OPTIONS}
                      placeholder="Search or type item type…"
                      inputCls={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability Status</label>
                    <AutocompleteField
                      value={customAttrs.availabilityStatus || ''}
                      onChange={(v) => updCA('availabilityStatus', v)}
                      options={AVAILABILITY_STATUS_OPTIONS}
                      placeholder="Search or type status…"
                      inputCls={inputCls}
                    />
                  </div>
                </div>

                {/* Collection + Lead Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Collection</label>
                    <input
                      type="text"
                      value={customAttrs.collection || ''}
                      onChange={(e) => updCA('collection', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Lani Collection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Lead Time
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">e.g. 8–10 weeks</span>
                    </label>
                    <input
                      type="text"
                      value={localFields.leadTime}
                      onChange={(e) => { setLocal('leadTime', e.target.value); upd('leadTime', e.target.value); }}
                      className={inputCls}
                      placeholder="e.g. 8–10 weeks, 3 months…"
                    />
                  </div>
                </div>

                {/* Room / Service + Tags */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Room / Service</label>
                    <RoomServiceField
                      value={opts.room || ''}
                      onChange={(v) => upd('room', v)}
                      disabled={false}
                      inputCls={inputCls}
                      onServiceSelect={(serviceName) => {
                        const desc = SERVICE_DESCRIPTIONS[serviceName];
                        if (desc) { setLocal('specifications', desc); upd('specifications', desc); }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Group</label>
                    <input
                      type="text"
                      value={localFields.group}
                      onChange={(e) => { setLocal('group', e.target.value); upd('group', e.target.value); }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                    <input
                      type="text"
                      value={localFields.tags}
                      onChange={(e) => {
                        setLocal('tags', e.target.value);
                        upd('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean));
                      }}
                      className={inputCls}
                      placeholder="tag1, tag2"
                    />
                  </div>
                </div>

                {/* Sidemark */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Sidemark</span>
                      <button type="button" onClick={() => {
                        const defaultSidemark = `Henderson Design Group / ${order?.clientInfo?.name || ''} / ${product.name || ''}`.replace(/\s*\/\s*\/\s*/g, ' / ').trim();
                        setLocal('sidemark', defaultSidemark);
                        upd('sidemark', defaultSidemark);
                      }} className="text-xs text-blue-600 hover:underline font-normal">Set Default</button>
                    </label>
                    <input
                      type="text"
                      value={localFields.sidemark}
                      onChange={(e) => { setLocal('sidemark', e.target.value); upd('sidemark', e.target.value); }}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* ── Category-Specific Fields ── */}
                {localFields.itemClass && CATEGORY_SPECIFIC_FIELDS[localFields.itemClass] && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#005670]" />
                      {localFields.itemClass} Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {CATEGORY_SPECIFIC_FIELDS[localFields.itemClass].map(({ k, l, bool, num, sel }) => (
                        <div key={k}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                          {bool ? (
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => updCA(k, !customAttrs[k])}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${customAttrs[k] ? 'bg-[#005670]' : 'bg-gray-200'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${customAttrs[k] ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                              <span className="text-sm text-gray-600">{customAttrs[k] ? 'Yes' : 'No'}</span>
                            </div>
                          ) : sel ? (
                            <AutocompleteField
                              value={customAttrs[k] || ''}
                              onChange={(v) => updCA(k, v)}
                              options={sel}
                              placeholder="Select or type…"
                              inputCls={inputCls}
                            />
                          ) : (
                            <input
                              type={num ? 'number' : 'text'}
                              value={customAttrs[k] ?? ''}
                              onChange={(e) => updCA(k, num ? Number(e.target.value) : e.target.value)}
                              className={inputCls}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ TAB: ITEM DETAILS ════ */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Item Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor</label>
                    <VendorSearchDropdown
                      selectedVendor={product.vendor}
                      onSelectVendor={handleVendorSelect}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU / Item #</label>
                    <input
                      type="text"
                      value={localFields.product_id}
                      onChange={(e) => { setLocal('product_id', e.target.value); onUpdate(index, 'product_id', e.target.value); }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Order Number</label>
                    <input
                      type="text"
                      value={localFields.vendorOrderNumber}
                      onChange={(e) => { setLocal('vendorOrderNumber', e.target.value); upd('vendorOrderNumber', e.target.value); }}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">Client Description</label>
                      <button
                        type="button"
                        onClick={applyBoldToSpecs}
                        title="Bold selected text (**bold**)"
                        className="px-2 py-0.5 text-xs font-bold border border-gray-300 rounded bg-white hover:bg-gray-100 text-gray-700 leading-none"
                      >
                        B
                      </button>
                    </div>
                    <textarea
                      ref={specsRef}
                      value={localFields.specifications}
                      onChange={(e) => { setLocal('specifications', e.target.value); upd('specifications', e.target.value); }}
                      className={`${inputCls} resize-none`}
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Vendor Description</span>
                      <button type="button" onClick={() => {
                        setLocal('vendorDescription', localFields.specifications);
                        upd('vendorDescription', localFields.specifications);
                      }} className="text-xs text-blue-600 hover:underline font-normal">Copy from Client</button>
                    </label>
                    <textarea
                      value={localFields.vendorDescription}
                      onChange={(e) => { setLocal('vendorDescription', e.target.value); upd('vendorDescription', e.target.value); }}
                      className={`${inputCls} resize-none`}
                      rows={5}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Color / Finish</label>
                    <input
                      type="text"
                      value={localFields.finish}
                      onChange={(e) => { setLocal('finish', e.target.value); upd('finish', e.target.value); }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dimensions <span className="text-xs text-gray-400 font-normal">W × D × H</span></label>
                    <input
                      type="text"
                      value={localFields.size}
                      onChange={(e) => { setLocal('size', e.target.value); upd('size', e.target.value); }}
                      className={inputCls}
                      placeholder="e.g. 48&quot; × 24&quot; × 36&quot;"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Item URL</label>
                    <input
                      type="text"
                      value={localFields.links0}
                      onChange={(e) => {
                        setLocal('links0', e.target.value);
                        const rest = opts.links?.slice(1) || [];
                        upd('links', e.target.value ? [e.target.value, ...rest] : rest);
                      }}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Materials + Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Materials</label>
                    <input
                      type="text"
                      value={customAttrs.materials || ''}
                      onChange={(e) => updCA('materials', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Solid oak, velvet upholstery"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">cleaning, freight, care, specs…</span>
                    </label>
                    <textarea
                      value={localFields.itemNotes}
                      onChange={(e) => { setLocal('itemNotes', e.target.value); upd('itemNotes', e.target.value); }}
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="Cleaning instructions, freight notes, fire ratings, vendor comments…"
                    />
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
                    <input
                      type="text"
                      value={localFields.fabric}
                      onChange={(e) => { setLocal('fabric', e.target.value); upd('fabric', e.target.value); }}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category / Location</label>
                  <input
                    type="text"
                    value={localFields.category}
                    onChange={(e) => { setLocal('category', e.target.value); onUpdate(index, 'category', e.target.value); }}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-800 text-sm">Custom Attributes</h4>
                  {Object.keys(customAttrs).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(customAttrs).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div><p className="text-xs font-medium text-gray-500">Attribute</p><p className="text-sm font-semibold text-gray-900">{key}</p></div>
                            <div><p className="text-xs font-medium text-gray-500">Value</p><p className="text-sm text-gray-900">{String(value)}</p></div>
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
              </div>
            )}

            {/* ════ TAB: SHIPPING ════ */}
            {activeTab === 'shipping' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Shipping</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship To</label>
                    <ShipToVendorDropdown
                      selectedVendorId={opts.shipToVendorId || null}
                      onSelect={handleShipToSelect}
                      onClear={handleShipToClear}
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship To Name</label>
                    <input type="text" value={opts.shipToName || ''} onChange={(e) => upd('shipToName', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Street</label>
                    <input type="text" value={opts.shippingStreet || ''} onChange={(e) => upd('shippingStreet', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping City</label>
                    <input type="text" value={opts.shippingCity || ''} onChange={(e) => upd('shippingCity', e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input type="text" value={opts.shippingState || ''} onChange={(e) => upd('shippingState', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                    <input type="text" value={opts.shippingPostalCode || ''} onChange={(e) => upd('shippingPostalCode', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="text" value={opts.shipToPhone || ''} onChange={(e) => upd('shipToPhone', e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB: PRICING ════ */}
            {activeTab === 'pricing' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">Item Pricing</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      HDG PO#
                      {localFields.poNumber === '' && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">(auto-filled on save if blank)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={localFields.poNumber}
                      onChange={(e) => { setLocal('poNumber', e.target.value); upd('poNumber', e.target.value); }}
                      className={inputCls}
                      placeholder="e.g. HDG-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      On-site Installation Notes
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">for installers at the job site</span>
                    </label>
                    <textarea
                      value={localFields.installerNotes}
                      onChange={(e) => { setLocal('installerNotes', e.target.value); upd('installerNotes', e.target.value); }}
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="e.g. Place against east wall, requires 2 people to lift..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB: STATUS ════ */}
            {activeTab === 'status' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-5">Status</h3>
                <StatusReportFields
                  product={product}
                  index={index}
                  onUpdate={(idx, field, value) => {
                    if (field === 'selectedOptions.proposalNumber') return;
                    if (field === 'selectedOptions.notes') {
                      setLocal('notes', value);
                    }
                    onUpdate(idx, field, value);
                  }}
                  disabled={false}
                  readOnlyFields={['proposalNumber']}
                  orderProposalNumber={order?.proposalNumber || null}
                />
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