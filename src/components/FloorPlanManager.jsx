import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Upload, Trash2, RotateCcw, RotateCw, ZoomIn, ZoomOut,
  Download, Save, Loader2, Map, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { backendServer } from '../utils/info';

const ROOM_CODES = {
  'COURTYARD': 'COU', 'EXTERIOR ENTRY': 'EXT', 'INTERIOR ENTRY': 'INT',
  'FOYER': 'FOY', 'KITCHEN': 'KIT', 'PANTRY': 'PAN', 'BREAKFAST NOOK': 'BRK',
  'DINING ROOM': 'DIN', 'LIVING ROOM': 'LIV', 'GREAT ROOM': 'GRE',
  'FAMILY ROOM': 'FAM', 'DEN': 'DEN', 'WET BAR': 'WET', 'MEDIA ROOM': 'MED',
  'HALLWAY': 'HAL', 'HALLWAY 1': 'HA1', 'HALLWAY 2': 'HA2',
  'LANAI': 'LAN', 'LANAI 1': 'LA1', 'LANAI 2': 'LA2', 'LANAI 3': 'LA3',
  'MAIN LANAI': 'MAI', 'BBQ AREA': 'BBQ', 'POOL LANAI': 'POL',
  'POWDER ROOM': 'POW', 'PULL AREA': 'PUL', 'PULL BATH': 'PUB',
  'PAVILLION': 'PAV', 'GYM': 'GYM', 'OFFICE': 'OFF', 'OFFICE 1': 'OF1',
  'OFFICE 2': 'OF2', 'WINE ROOM': 'WIN', 'REC ROOM': 'REC', 'GARAGE': 'GAR',
  'PRIMARY BEDROOM': 'PRB', 'PRIMARY BATHROOM': 'PBA', 'PRIMARY CLOSET': 'PRC',
  'PRIMARY BEDROOM LANAI': 'PBL',
  'BEDROOM 2': 'BE2', 'BATHROOM 2': 'BA2', 'BEDROOM 2 CLOSET': 'BC2', 'BEDROOM 2 LANAI': 'BL2',
  'BEDROOM 3': 'BE3', 'BATHROOM 3': 'BA3', 'BEDROOM 3 CLOSET': 'BC3', 'BEDROOM 3 LANAI': 'BL3',
  'BEDROOM 4': 'BE4', 'BATHROOM 4': 'BA4', 'BEDROOM 4 CLOSET': 'BC4', 'BEDROOM 4 LANAI': 'BL4',
  'SITTING ROOM': 'SIT', 'FLEX SPACE': 'FLE', 'LAUNDRY ROOM': 'LAU',
  'MUD ROOM': 'MUD', 'TERRACE': 'TER', 'BALCONY': 'BAL',
  'OUTDOOR DINING': 'ODI', 'OUTDOOR LIVING': 'ODL', 'GUEST SUITE': 'GUE',
};
const getRoomCode = (room) => ROOM_CODES[(room || '').toUpperCase()] || '';
const buildSkuLabel = (product) => {
  const code = getRoomCode(product.room);
  const base = product.product_id || product.name || '';
  return code ? `${code}-${base}` : base;
};

// ── FloorPlanManager modal ────────────────────────────────────────────────────
// Entry: <FloorPlanManager clientUserId="..." clientName="..." onClose={() => {}} />
const FloorPlanManager = ({ clientUserId, clientName, onClose }) => {
  const [activeTab, setActiveTab]       = useState('full');
  const [plans, setPlans]               = useState([]);       // all saved plans
  const [products, setProducts]         = useState([]);       // all SKUs across orders
  const [rooms, setRooms]               = useState([]);       // room names
  const [pins, setPins]                 = useState([]);       // current pins on full plan
  const [uploading, setUploading]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [searchSku, setSearchSku]       = useState('');
  const [loading, setLoading]           = useState(true);
  const [dragOverFloorPlan, setDragOverFloorPlan] = useState(false);

  // For pin dragging on the floor plan
  const draggingPinRef  = useRef(null); // { pinId, startX, startY, origX, origY }
  const floorPlanRef    = useRef(null); // ref to the floor plan container div
  const fileInputRef    = useRef(null);
  const roomFileRefs    = useRef({});   // { roomName: inputRef }

  const token = () => localStorage.getItem('token');

  // ── Load plans + products ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [plansRes, prodsRes] = await Promise.all([
          fetch(`${backendServer}/api/floor-plans/${clientUserId}`, { headers: { Authorization: `Bearer ${token()}` } }),
          fetch(`${backendServer}/api/floor-plans/${clientUserId}/products`, { headers: { Authorization: `Bearer ${token()}` } }),
        ]);
        const plansData = await plansRes.json();
        const prodsData = await prodsRes.json();
        const loadedPlans = plansData.plans || [];
        setPlans(loadedPlans);
        setProducts(prodsData.products || []);
        setRooms(prodsData.rooms || []);
        // Load pins from full plan
        const full = loadedPlans.find(p => p.type === 'full');
        if (full) setPins(full.pins || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientUserId]);

  const fullPlan   = plans.find(p => p.type === 'full');
  const tabs       = ['full', ...rooms];

  // ── Upload image to DO Spaces ─────────────────────────────────────────────
  const uploadImage = async (file, type, room = '') => {
    setUploading(true);
    try {
      // 1. Get presigned URL
      const presignRes = await fetch(`${backendServer}/api/floor-plans/upload-url`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { uploadUrl, key, publicUrl } = await presignRes.json();

      // 2. Upload to DO Spaces
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' } });

      // 3. Save record in backend
      const createRes = await fetch(`${backendServer}/api/floor-plans/${clientUserId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, room, imageUrl: publicUrl, imageKey: key }),
      });
      const { plan } = await createRes.json();

      setPlans(prev => {
        const filtered = prev.filter(p => !(p.type === type && (type === 'full' || p.room === room)));
        return [...filtered, plan];
      });
      if (type === 'full') setPins([]);
      // Reset all file inputs so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
      Object.values(roomFileRefs.current).forEach(ref => { if (ref) ref.value = ''; });
    } finally {
      setUploading(false);
    }
  };

  // ── Save pins ─────────────────────────────────────────────────────────────
  const savePins = async () => {
    if (!fullPlan) return;
    setSaving(true);
    try {
      const res  = await fetch(`${backendServer}/api/floor-plans/${fullPlan._id}/pins`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pins }),
      });
      const data = await res.json();
      if (data.plan?.pins) {
        // Sync local pins with DB-assigned ObjectId _ids so future saves work correctly
        setPins(data.plan.pins.map(p => ({ ...p, _id: p._id?.toString() || p._id })));
        setPlans(prev => prev.map(p => p._id === fullPlan._id ? data.plan : p));
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    setDownloading(true);
    try {
      // First save current pins
      if (fullPlan) {
        await fetch(`${backendServer}/api/floor-plans/${fullPlan._id}/pins`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ pins }),
        });
      }
      const res = await fetch(`${backendServer}/api/floor-plans/${clientUserId}/pdf`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        alert(`PDF error: ${err.message || res.status}`);
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `FloorPlan_${(clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  // ── Delete floor plan ─────────────────────────────────────────────────────
  const deletePlan = async (planId) => {
    if (!window.confirm('Delete this floor plan?')) return;
    await fetch(`${backendServer}/api/floor-plans/${planId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
    });
    setPlans(prev => prev.filter(p => p._id !== planId));
    if (plans.find(p => p._id === planId)?.type === 'full') setPins([]);
  };

  // ── Drag from SKU panel → drop on floor plan ──────────────────────────────
  const handleSkuDragStart = (e, product) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      productId:  product._id?.toString() || product.product_id,
      skuLabel:   buildSkuLabel(product),
      roomLabel:  product.room || '',
      vendorName: product.vendorName || '',
    }));
  };

  const handleFloorPlanDragOver = (e) => {
    e.preventDefault();
    setDragOverFloorPlan(true);
  };

  const handleFloorPlanDrop = (e) => {
    e.preventDefault();
    setDragOverFloorPlan(false);
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const data = JSON.parse(raw);
    const rect = floorPlanRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    const newPin = { _id: `pin_${Date.now()}`, ...data, x, y, rotation: 0, scale: 1 };
    setPins(prev => [...prev, newPin]);
    setSelectedPinId(newPin._id);
  };

  // ── Pin dragging on floor plan ────────────────────────────────────────────
  const handlePinMouseDown = (e, pin) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedPinId(pin._id);
    const rect = floorPlanRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingPinRef.current = {
      pinId: pin._id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      origX: pin.x,
      origY: pin.y,
      rectW: rect.width,
      rectH: rect.height,
    };
    window.addEventListener('mousemove', handlePinMouseMove);
    window.addEventListener('mouseup',   handlePinMouseUp);
  };

  const handlePinMouseMove = useCallback((e) => {
    const d = draggingPinRef.current;
    if (!d) return;
    const dx = ((e.clientX - d.startMouseX) / d.rectW) * 100;
    const dy = ((e.clientY - d.startMouseY) / d.rectH) * 100;
    setPins(prev => prev.map(p =>
      p._id === d.pinId
        ? { ...p, x: Math.max(0, Math.min(100, d.origX + dx)), y: Math.max(0, Math.min(100, d.origY + dy)) }
        : p
    ));
  }, []);

  const handlePinMouseUp = useCallback(() => {
    draggingPinRef.current = null;
    window.removeEventListener('mousemove', handlePinMouseMove);
    window.removeEventListener('mouseup',   handlePinMouseUp);
  }, [handlePinMouseMove]);

  useEffect(() => () => {
    window.removeEventListener('mousemove', handlePinMouseMove);
    window.removeEventListener('mouseup',   handlePinMouseUp);
  }, [handlePinMouseMove, handlePinMouseUp]);

  // ── Pin controls ──────────────────────────────────────────────────────────
  const rotatePin   = (id, deg) => setPins(prev => prev.map(p => p._id === id ? { ...p, rotation: (p.rotation + deg + 360) % 360 } : p));
  const scalePin    = (id, d)   => setPins(prev => prev.map(p => p._id === id ? { ...p, scale: Math.max(0.5, Math.min(3, (p.scale || 1) + d)) } : p));
  const deletePin   = (id)      => { setPins(prev => prev.filter(p => p._id !== id)); setSelectedPinId(null); };

  // ── Filtered SKU list ─────────────────────────────────────────────────────
  const filteredProducts = products.filter(p =>
    !searchSku ||
    p.product_id?.toLowerCase().includes(searchSku.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchSku.toLowerCase()) ||
    p.room?.toLowerCase().includes(searchSku.toLowerCase())
  );

  const selectedPin = pins.find(p => p._id === selectedPinId);

  // Count how many times each product has been pinned
  const placedCountMap = {};
  pins.forEach(pin => {
    if (pin.productId) placedCountMap[pin.productId] = (placedCountMap[pin.productId] || 0) + 1;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5" />
          <div>
            <h2 className="font-bold text-lg leading-tight">Floor Plans</h2>
            <p className="text-xs text-white/70">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPDF}
            disabled={downloading || !plans.length}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#005670] text-[#005670] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'full' ? 'Full Floor Plan' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-[#005670]" />
        </div>
      ) : activeTab === 'full' ? (
        // ── FULL FLOOR PLAN TAB ─────────────────────────────────────────────
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Left: Floor plan canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-700">Floor Plan Canvas</span>
              <div className="flex items-center gap-2">
                {fullPlan && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Replace Image
                    </button>
                    <button
                      onClick={() => deletePlan(fullPlan._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </>
                )}
                {fullPlan && (
                  <button
                    onClick={savePins}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#005670] text-white rounded-lg hover:bg-[#004558] transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Layout
                  </button>
                )}
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'full')} />

            <div className="flex-1 p-2 overflow-hidden">
              {!fullPlan ? (
                // Upload prompt
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full min-h-[300px] border-2 border-dashed border-[#005670]/40 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#005670] hover:bg-[#005670]/5 transition-colors"
                >
                  {uploading ? (
                    <><Loader2 className="w-10 h-10 animate-spin text-[#005670]" /><p className="text-sm text-gray-500">Uploading…</p></>
                  ) : (
                    <><Upload className="w-10 h-10 text-[#005670]/40" /><p className="font-semibold text-gray-600">Upload Full Floor Plan</p><p className="text-xs text-gray-400">JPG, PNG, WEBP — click to browse</p></>
                  )}
                </div>
              ) : (
                // Interactive floor plan
                <div
                  ref={floorPlanRef}
                  className={`relative select-none overflow-hidden rounded-xl shadow-lg border-2 transition-colors ${dragOverFloorPlan ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
                  style={{ width: '100%', height: '100%' }}
                  onDragOver={handleFloorPlanDragOver}
                  onDragLeave={() => setDragOverFloorPlan(false)}
                  onDrop={handleFloorPlanDrop}
                  onClick={() => setSelectedPinId(null)}
                >
                  <img
                    src={`${fullPlan.imageUrl}?v=${fullPlan._id}`}
                    alt="Floor plan"
                    className="w-full h-full object-contain block"
                    draggable={false}
                  />

                  {/* Pins */}
                  {pins.map(pin => (
                    <div
                      key={pin._id}
                      className={`absolute cursor-grab active:cursor-grabbing group ${selectedPinId === pin._id ? 'z-20' : 'z-10'}`}
                      style={{
                        left: `${pin.x}%`,
                        top:  `${pin.y}%`,
                        transform: `translate(-50%, -100%) rotate(${pin.rotation || 0}deg) scale(${pin.scale || 1})`,
                        transformOrigin: '50% 100%',
                      }}
                      onMouseDown={e => handlePinMouseDown(e, pin)}
                      onClick={e => { e.stopPropagation(); setSelectedPinId(pin._id); }}
                    >
                      {/* Label — transparent so floor plan shows through */}
                      <div className={`px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
                        selectedPinId === pin._id
                          ? 'bg-[#005670]/70 text-white'
                          : 'bg-transparent text-[#005670]'
                      }`}
                        style={{ textShadow: selectedPinId === pin._id ? 'none' : '0 0 3px #fff, 0 0 3px #fff' }}
                      >
                        {pin.skuLabel}
                      </div>
                      {/* Controls — show on selected */}
                      {selectedPinId === pin._id && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1 bg-white rounded-lg shadow-xl border border-gray-200 px-2 py-1"
                          onClick={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          <button title="Rotate left"   onClick={() => rotatePin(pin._id, -15)} className="p-1 hover:bg-gray-100 rounded"><RotateCcw className="w-3.5 h-3.5 text-gray-600" /></button>
                          <button title="Rotate right"  onClick={() => rotatePin(pin._id,  15)} className="p-1 hover:bg-gray-100 rounded"><RotateCw  className="w-3.5 h-3.5 text-gray-600" /></button>
                          <button title="Scale down"    onClick={() => scalePin(pin._id, -0.1)} className="p-1 hover:bg-gray-100 rounded"><ZoomOut   className="w-3.5 h-3.5 text-gray-600" /></button>
                          <button title="Scale up"      onClick={() => scalePin(pin._id,  0.1)} className="p-1 hover:bg-gray-100 rounded"><ZoomIn    className="w-3.5 h-3.5 text-gray-600" /></button>
                          <div className="w-px h-4 bg-gray-200 mx-0.5" />
                          <button title="Delete pin"    onClick={() => deletePin(pin._id)}      className="p-1 hover:bg-red-50 rounded"><Trash2    className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      )}
                    </div>
                  ))}

                  {dragOverFloorPlan && (
                    <div className="absolute inset-0 bg-[#005670]/10 flex items-center justify-center pointer-events-none rounded-xl">
                      <p className="text-[#005670] font-semibold text-lg">Drop SKU here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: SKU Panel */}
          <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Drag SKU to Floor Plan</p>
              <input
                type="text"
                value={searchSku}
                onChange={e => setSearchSku(e.target.value)}
                placeholder="Search SKU or room…"
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No products found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredProducts.map((p, i) => {
                    const pid = p._id?.toString() || p.product_id;
                    const placed  = placedCountMap[pid] || 0;
                    const maxQty  = p.quantity || 1;
                    const isFull  = placed >= maxQty;
                    return (
                      <div
                        key={`${p._id}-${i}`}
                        draggable={!isFull}
                        onDragStart={isFull ? undefined : e => handleSkuDragStart(e, p)}
                        className={`px-3 py-2.5 select-none transition-colors ${isFull ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-grab active:cursor-grabbing hover:bg-[#005670]/5'}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 flex-shrink-0 mt-0.5 rounded flex items-center justify-center ${isFull ? 'bg-gray-200' : 'bg-[#005670]/10'}`}>
                            <span className={`text-[8px] font-bold ${isFull ? 'text-gray-400' : 'text-[#005670]'}`}>SKU</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800 truncate">{buildSkuLabel(p)}</p>
                            <p className="text-[11px] text-gray-500 truncate">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {p.room && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded">
                                  {p.room}
                                </span>
                              )}
                              <span className={`text-[10px] font-medium ${isFull ? 'text-gray-400' : 'text-gray-500'}`}>
                                {placed}/{maxQty} placed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedPin && (
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <p className="text-xs font-bold text-gray-600 mb-2">Selected: {selectedPin.skuLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => rotatePin(selectedPin._id, -15)} className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"><RotateCcw className="w-3 h-3" /> −15°</button>
                  <button onClick={() => rotatePin(selectedPin._id,  15)} className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"><RotateCw  className="w-3 h-3" /> +15°</button>
                  <button onClick={() => scalePin(selectedPin._id, -0.1)} className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"><ZoomOut   className="w-3 h-3" /> Smaller</button>
                  <button onClick={() => scalePin(selectedPin._id,  0.1)} className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"><ZoomIn    className="w-3 h-3" /> Bigger</button>
                  <button onClick={() => deletePin(selectedPin._id)}       className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100"><Trash2    className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ── ROOM TAB ────────────────────────────────────────────────────────
        <RoomTab
          room={activeTab}
          clientUserId={clientUserId}
          plans={plans}
          uploading={uploading}
          onUpload={(file) => uploadImage(file, 'room', activeTab)}
          onDelete={deletePlan}
          token={token}
        />
      )}
    </div>
  );
};

// ── Room tab sub-component ────────────────────────────────────────────────────
const RoomTab = ({ room, clientUserId, plans, uploading, onUpload, onDelete, token }) => {
  const roomPlan    = plans.find(p => p.type === 'room' && p.room === room);
  const fileInputRef = useRef(null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{room} — Floor Plan</h3>
          <div className="flex items-center gap-2">
            {roomPlan && (
              <button
                onClick={() => onDelete(roomPlan._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#005670] text-white rounded-lg hover:bg-[#004558] transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {roomPlan ? 'Replace Image' : 'Upload Image'}
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />

        {roomPlan ? (
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            <img src={roomPlan.imageUrl} alt={room} className="w-full object-contain max-h-[500px]" />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-72 border-2 border-dashed border-[#005670]/40 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#005670] hover:bg-[#005670]/5 transition-colors"
          >
            {uploading ? (
              <><Loader2 className="w-10 h-10 animate-spin text-[#005670]" /><p className="text-sm text-gray-500">Uploading…</p></>
            ) : (
              <><Upload className="w-10 h-10 text-[#005670]/40" /><p className="font-semibold text-gray-600">Upload {room} Floor Plan</p><p className="text-xs text-gray-400">JPG, PNG, WEBP — click to browse</p></>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanManager;
