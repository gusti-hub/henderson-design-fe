import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCw, Trash2, Save, ZoomIn, ZoomOut, Move, Layers } from 'lucide-react';
import { backendServer } from '../utils/info';

// Import all floor plan configs
import { customAConfig } from '../config/custom-a';
import { customBConfig } from '../config/custom-b';
import { customCConfig } from '../config/custom-c';
import { investorAConfig } from '../config/investor-a';
import { investorBConfig } from '../config/investor-b';

// ✅ HELPER FUNCTIONS FROM floorPlanConfig.js
const calculateCenter = (coordinates) => {
  if (Array.isArray(coordinates)) {
    // For polygons, calculate centroid
    const points = coordinates;
    let xSum = 0, ySum = 0;
    points.forEach(point => {
      xSum += point.x;
      ySum += point.y;
    });
    return {
      x: xSum / points.length,
      y: ySum / points.length
    };
  } else if (coordinates.curve) {
    // For curves, use midpoint of control points
    const { start, end } = coordinates.curve;
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
  } else if (coordinates.arc) {
    // For arcs, use midpoint
    const { start, end } = coordinates.arc;
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
  } else {
    // For rectangles, use center
    return {
      x: coordinates.x + coordinates.width / 2,
      y: coordinates.y + coordinates.height / 2
    };
  }
};

const createPath = (coordinates) => {
  if (Array.isArray(coordinates)) {
    // For polygon paths
    return {
      path: `M ${coordinates.map(point => `${point.x},${point.y}`).join(' L ')} Z`,
      transform: ''
    };
  } else if (coordinates.curve) {
    // For curved paths
    const { start, end, control1, control2 } = coordinates.curve;
    return {
      path: `M ${start.x},${start.y} C ${control1.x},${control1.y} ${control2.x},${control2.y} ${end.x},${end.y}`,
      transform: ''
    };
  } else if (coordinates.arc) {
    // For curved corners
    const { start, radius, sweep, end } = coordinates.arc;
    return {
      path: `M ${start.x},${start.y} A ${radius},${radius} 0 0,${sweep} ${end.x},${end.y}`,
      transform: ''
    };
  } else {
    // Handle rectangle with potential rotation
    const centerX = coordinates.x + coordinates.width / 2;
    const centerY = coordinates.y + coordinates.height / 2;
    
    const path = `M${coordinates.x},${coordinates.y} 
                  L${coordinates.x + coordinates.width},${coordinates.y} 
                  L${coordinates.x + coordinates.width},${coordinates.y + coordinates.height} 
                  L${coordinates.x},${coordinates.y + coordinates.height} Z`;
    
    const transform = coordinates.rotation 
      ? `rotate(${coordinates.rotation}, ${centerX}, ${centerY})`
      : '';
    
    return { path, transform };
  }
};

// ✅ Calculate bounding box for any shape
const getBoundingBox = (coordinates) => {
  if (Array.isArray(coordinates)) {
    // Polygon
    const xs = coordinates.map(p => p.x);
    const ys = coordinates.map(p => p.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  } else if (coordinates.curve) {
    // Curve - use control points
    const { start, end, control1, control2 } = coordinates.curve;
    const xs = [start.x, end.x, control1.x, control2.x];
    const ys = [start.y, end.y, control1.y, control2.y];
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  } else if (coordinates.arc) {
    // Arc - use start/end points
    const { start, end, radius } = coordinates.arc;
    return {
      x: Math.min(start.x, end.x) - radius,
      y: Math.min(start.y, end.y) - radius,
      width: Math.abs(end.x - start.x) + radius * 2,
      height: Math.abs(end.y - start.y) + radius * 2
    };
  } else {
    // Rectangle
    return {
      x: coordinates.x,
      y: coordinates.y,
      width: coordinates.width,
      height: coordinates.height
    };
  }
};

const LibraryFloorPlanEditor = ({ order, onSave, onBack }) => {
  const [placedFurniture, setPlacedFurniture] = useState({});
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [saving, setSaving] = useState(false);
  const [collisionEnabled, setCollisionEnabled] = useState(true); // ✅ Toggle collision detection
  
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  // Combine all configs for library
  const allConfigs = {
    'custom-a': customAConfig,
    'custom-b': customBConfig,
    'custom-c': customCConfig,
    'investor-a': investorAConfig,
    'investor-b': investorBConfig,
  };

  // Get floor plan dimensions
  const floorPlanDimensions = useMemo(() => {
    const configId = order?.selectedPlan?.id || 'investor-a';
    return allConfigs[configId]?.dimensions || { width: 800, height: 600 };
  }, [order, allConfigs]);

  // Load existing furniture placements
  useEffect(() => {
    if (order?.occupiedSpots) {
      const spots = order.occupiedSpots instanceof Map 
        ? Object.fromEntries(order.occupiedSpots) 
        : order.occupiedSpots;
      setPlacedFurniture(spots || {});
    }
  }, [order]);

  // Get all unique furniture IDs from all configs
  const getAllFurnitureItems = useMemo(() => {
    const items = [];
    const seenIds = new Set();

    Object.entries(allConfigs).forEach(([configId, config]) => {
      if (config.furniture) {
        Object.entries(config.furniture).forEach(([spotKey, item]) => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            
            items.push({
              id: item.id,
              label: item.label,
              area: item.area,
              coordinates: item.coordinates, // ✅ STORE ORIGINAL COORDINATES
              sourceConfig: configId,
              sourceSpot: spotKey
            });
          }
        });
      }
    });

    return items.sort((a, b) => a.id.localeCompare(b.id));
  }, [allConfigs]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['ALL']);
    getAllFurnitureItems.forEach(item => {
      if (item.area) cats.add(item.area);
    });
    return Array.from(cats).sort();
  }, [getAllFurnitureItems]);

  // Filter furniture by category
  const filteredFurniture = useMemo(() => {
    if (selectedCategory === 'ALL') return getAllFurnitureItems;
    return getAllFurnitureItems.filter(item => item.area === selectedCategory);
  }, [getAllFurnitureItems, selectedCategory]);

  // Handle drag start from palette
  const handlePaletteDragStart = (e, furnitureItem) => {
    e.dataTransfer.setData('furnitureItem', JSON.stringify(furnitureItem));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const furnitureItemJson = e.dataTransfer.getData('furnitureItem');
    
    if (!furnitureItemJson) return;

    const furnitureItem = JSON.parse(furnitureItemJson);
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const dropX = (e.clientX - svgRect.left) / scale;
    const dropY = (e.clientY - svgRect.top) / scale;

    // ✅ Get bounding box for collision detection
    const bbox = getBoundingBox(furnitureItem.coordinates);
    
    // ✅ Calculate offset to center the furniture at drop point
    const offsetX = dropX - bbox.width / 2;
    const offsetY = dropY - bbox.height / 2;

    // Check collision only if enabled
    if (collisionEnabled && checkCollision(offsetX, offsetY, bbox)) {
      alert('Cannot place furniture here - overlaps with existing furniture');
      return;
    }

    // ✅ Create positioned coordinates
    let positionedCoordinates;
    
    if (Array.isArray(furnitureItem.coordinates)) {
      // Polygon - translate all points
      positionedCoordinates = furnitureItem.coordinates.map(point => ({
        x: point.x + offsetX - bbox.x,
        y: point.y + offsetY - bbox.y
      }));
    } else if (furnitureItem.coordinates.curve) {
      // Curve - translate curve points
      const curve = furnitureItem.coordinates.curve;
      const dx = offsetX - bbox.x;
      const dy = offsetY - bbox.y;
      positionedCoordinates = {
        curve: {
          start: { x: curve.start.x + dx, y: curve.start.y + dy },
          end: { x: curve.end.x + dx, y: curve.end.y + dy },
          control1: { x: curve.control1.x + dx, y: curve.control1.y + dy },
          control2: { x: curve.control2.x + dx, y: curve.control2.y + dy }
        }
      };
    } else if (furnitureItem.coordinates.arc) {
      // Arc - translate arc points
      const arc = furnitureItem.coordinates.arc;
      const dx = offsetX - bbox.x;
      const dy = offsetY - bbox.y;
      positionedCoordinates = {
        arc: {
          start: { x: arc.start.x + dx, y: arc.start.y + dy },
          end: { x: arc.end.x + dx, y: arc.end.y + dy },
          radius: arc.radius,
          sweep: arc.sweep
        }
      };
    } else {
      // Rectangle
      positionedCoordinates = {
        x: offsetX,
        y: offsetY,
        width: furnitureItem.coordinates.width,
        height: furnitureItem.coordinates.height,
        rotation: 0
      };
    }

    // Place furniture
    const newKey = `placed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setPlacedFurniture(prev => ({
      ...prev,
      [newKey]: {
        furnitureId: furnitureItem.id,
        label: furnitureItem.label,
        area: furnitureItem.area,
        coordinates: positionedCoordinates,
        originalCoordinates: furnitureItem.coordinates, // ✅ Store original shape
        rotation: 0, // ✅ Initialize rotation
        isPlaced: true,
        sourceConfig: furnitureItem.sourceConfig,
        sourceSpot: furnitureItem.sourceSpot
      }
    }));

    console.log('✅ Furniture placed:', newKey, furnitureItem.id);
  };

  // Check collision with other furniture (AABB with tolerance)
  const checkCollision = (x, y, dimensions, excludeKey = null) => {
    const tolerance = 5; // ✅ 5px tolerance for comfortable placement
    
    for (const [key, furniture] of Object.entries(placedFurniture)) {
      if (key === excludeKey) continue;
      
      const furnitureBBox = getBoundingBox(furniture.coordinates);

      // ✅ AABB collision with tolerance - allow small gaps
      const hasCollision = (
        x + tolerance < furnitureBBox.x + furnitureBBox.width - tolerance &&
        x + dimensions.width - tolerance > furnitureBBox.x + tolerance &&
        y + tolerance < furnitureBBox.y + furnitureBBox.height - tolerance &&
        y + dimensions.height - tolerance > furnitureBBox.y + tolerance
      );

      if (hasCollision) {
        return true;
      }
    }
    return false;
  };

  // Handle furniture selection
  const handleFurnitureClick = (key, e) => {
    e.stopPropagation();
    setSelectedFurniture(key);
  };

  // Handle furniture drag on canvas
  const handleFurnitureMouseDown = (e, key) => {
    e.stopPropagation();
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const furniture = placedFurniture[key];
    const center = calculateCenter(furniture.coordinates);
    
    setSelectedFurniture(key);
    setIsDragging(true);
    setDragOffset({
      x: (e.clientX - svgRect.left) / scale - center.x,
      y: (e.clientY - svgRect.top) / scale - center.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedFurniture) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const newCenterX = (e.clientX - svgRect.left) / scale - dragOffset.x;
    const newCenterY = (e.clientY - svgRect.top) / scale - dragOffset.y;

    const furniture = placedFurniture[selectedFurniture];
    const currentCenter = calculateCenter(furniture.coordinates);
    const bbox = getBoundingBox(furniture.coordinates);
    
    const dx = newCenterX - currentCenter.x;
    const dy = newCenterY - currentCenter.y;

    // ✅ Translate coordinates based on shape type
    let newCoordinates;
    
    if (Array.isArray(furniture.coordinates)) {
      // Polygon - translate all points
      newCoordinates = furniture.coordinates.map(point => ({
        x: point.x + dx,
        y: point.y + dy
      }));
    } else if (furniture.coordinates.curve) {
      // Curve - translate curve points
      const curve = furniture.coordinates.curve;
      newCoordinates = {
        curve: {
          start: { x: curve.start.x + dx, y: curve.start.y + dy },
          end: { x: curve.end.x + dx, y: curve.end.y + dy },
          control1: { x: curve.control1.x + dx, y: curve.control1.y + dy },
          control2: { x: curve.control2.x + dx, y: curve.control2.y + dy }
        }
      };
    } else if (furniture.coordinates.arc) {
      // Arc - translate arc points
      const arc = furniture.coordinates.arc;
      newCoordinates = {
        arc: {
          start: { x: arc.start.x + dx, y: arc.start.y + dy },
          end: { x: arc.end.x + dx, y: arc.end.y + dy },
          radius: arc.radius,
          sweep: arc.sweep
        }
      };
    } else {
      // Rectangle
      newCoordinates = {
        ...furniture.coordinates,
        x: furniture.coordinates.x + dx,
        y: furniture.coordinates.y + dy
      };
    }

    // Get new bounding box
    const newBBox = getBoundingBox(newCoordinates);

    // Constrain to canvas bounds
    const constrainedDx = Math.max(
      -bbox.x,
      Math.min(dx, floorPlanDimensions.width - bbox.x - bbox.width)
    );
    const constrainedDy = Math.max(
      -bbox.y,
      Math.min(dy, floorPlanDimensions.height - bbox.y - bbox.height)
    );

    // Apply constrained movement
    if (Math.abs(constrainedDx - dx) < 0.1 && Math.abs(constrainedDy - dy) < 0.1) {
      // Check collision with new position only if enabled
      if (!collisionEnabled || !checkCollision(newBBox.x, newBBox.y, newBBox, selectedFurniture)) {
        setPlacedFurniture(prev => ({
          ...prev,
          [selectedFurniture]: {
            ...prev[selectedFurniture],
            coordinates: newCoordinates
          }
        }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Deselect when clicking on canvas
  const handleCanvasClick = () => {
    setSelectedFurniture(null);
  };

  // Rotate selected furniture by 90 degrees - ✅ ALL SHAPES SUPPORTED
  const handleRotate = () => {
    if (!selectedFurniture) return;

    const furniture = placedFurniture[selectedFurniture];
    const currentRotation = furniture.rotation || 0;
    const newRotation = (currentRotation + 90) % 360;

    setPlacedFurniture(prev => ({
      ...prev,
      [selectedFurniture]: {
        ...prev[selectedFurniture],
        rotation: newRotation
      }
    }));
  };

  // Delete selected furniture
  const handleDelete = () => {
    if (!selectedFurniture) return;

    if (window.confirm('Delete this furniture item?')) {
      const newPlaced = { ...placedFurniture };
      delete newPlaced[selectedFurniture];
      setPlacedFurniture(newPlaced);
      setSelectedFurniture(null);
    }
  };

  // Clear all furniture
  const handleClearAll = () => {
    if (window.confirm('Remove all furniture from the floor plan?')) {
      setPlacedFurniture({});
      setSelectedFurniture(null);
    }
  };

  // Save layout to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${order._id}/furniture-placements`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            placements: placedFurniture
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Furniture layout saved successfully!');
        if (onSave) onSave(placedFurniture);
      } else {
        alert(data.message || 'Failed to save layout');
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  // ✅ Render furniture shape on canvas (supports all shapes with rotation)
  const renderFurnitureShape = (furniture, key) => {
    const { coordinates, label, rotation = 0 } = furniture;
    const isSelected = selectedFurniture === key;

    const pathData = createPath(coordinates);
    const center = calculateCenter(coordinates);

    // ✅ Apply rotation transform around center for ALL shapes
    const rotationTransform = rotation !== 0 
      ? `rotate(${rotation}, ${center.x}, ${center.y})` 
      : '';
    
    const combinedTransform = [pathData.transform, rotationTransform]
      .filter(Boolean)
      .join(' ');

    return (
      <g key={key}>
        {/* ✅ Selection border - FOLLOWS ACTUAL SHAPE with rotation */}
        {isSelected && (
          <path
            d={pathData.path}
            fill="none"
            stroke="#005670"
            strokeWidth={3}
            strokeDasharray="8 4"
            transform={combinedTransform}
            style={{ pointerEvents: 'none' }}
            opacity={0.8}
          />
        )}

        {/* ✅ Furniture path with rotation */}
        <path
          d={pathData.path}
          fill={isSelected ? 'rgba(0, 86, 112, 0.6)' : 'rgba(0, 86, 112, 0.4)'}
          stroke={isSelected ? '#005670' : '#00445a'}
          strokeWidth={isSelected ? 2 : 1}
          transform={combinedTransform}
          style={{ cursor: 'move' }}
          onClick={(e) => handleFurnitureClick(key, e)}
          onMouseDown={(e) => handleFurnitureMouseDown(e, key)}
        />
        
        {/* Label with rotation */}
        <text
          x={center.x}
          y={center.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="8px"
          fontWeight="bold"
          transform={rotationTransform}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      </g>
    );
  };

  // ✅ Render furniture preview in palette
  const renderPalettePreview = (item) => {
    const pathData = createPath(item.coordinates);
    const bbox = getBoundingBox(item.coordinates);
    
    // Scale to fit 40x40 preview box
    const scale = Math.min(35 / bbox.width, 35 / bbox.height);
    const offsetX = (40 - bbox.width * scale) / 2 - bbox.x * scale;
    const offsetY = (40 - bbox.height * scale) / 2 - bbox.y * scale;

    return (
      <svg width="40" height="40" className="flex-shrink-0">
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          <path
            d={pathData.path}
            fill="rgba(0, 86, 112, 0.3)"
            stroke="#005670"
            strokeWidth={1 / scale}
            transform={pathData.transform}
          />
        </g>
      </svg>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Furniture Palette Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Palette Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-[#005670]" />
            <h3 className="font-bold text-gray-900">Furniture Library</h3>
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <p className="text-xs text-gray-500 mt-2">
            {filteredFurniture.length} items available
          </p>
        </div>

        {/* Furniture List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredFurniture.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, item)}
              className="p-3 bg-gray-50 rounded-lg shadow-sm cursor-move hover:bg-gray-100 border-2 border-gray-200 hover:border-[#005670] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-bold text-gray-900 truncate">
                    {item.id}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.area}
                  </p>
                </div>
                
                {/* ✅ Shape Preview */}
                {renderPalettePreview(item)}
                
                <Move className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Palette Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600">
            💡 Drag items to the floor plan to place them
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Order List
            </button>
            
            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {order?.clientInfo?.name || 'Client'}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {order?.selectedPlan?.title || 'Floor Plan'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white rounded-md transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white rounded-md transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-white rounded-md transition-colors text-xs font-medium text-gray-600"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Collision Toggle */}
            <button
              onClick={() => setCollisionEnabled(!collisionEnabled)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                collisionEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={collisionEnabled ? 'Collision detection ON' : 'Collision detection OFF'}
            >
              {collisionEnabled ? '🛡️ Collision ON' : '⚠️ Collision OFF'}
            </button>

            <div className="h-6 w-px bg-gray-300" />

            {/* Edit Controls */}
            <button
              onClick={handleRotate}
              disabled={!selectedFurniture}
              className="p-2 bg-white border border-[#005670] rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
              title={!selectedFurniture ? 'Select furniture to rotate' : 'Rotate 90° (all shapes supported)'}
            >
              <RotateCw className={`w-5 h-5 ${selectedFurniture ? 'text-[#005670]' : 'text-gray-400'}`} />
            </button>
            
            <button
              onClick={handleDelete}
              disabled={!selectedFurniture}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-300 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>

            <button
              onClick={handleClearAll}
              disabled={Object.keys(placedFurniture).length === 0}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear All
            </button>

            <div className="h-6 w-px bg-gray-300" />

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-lg shadow hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Layout
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto bg-gray-100 p-8"
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="inline-block bg-white shadow-lg" style={{ 
            minWidth: floorPlanDimensions.width * scale,
            minHeight: floorPlanDimensions.height * scale 
          }}>
            <svg
              ref={svgRef}
              width={floorPlanDimensions.width * scale}
              height={floorPlanDimensions.height * scale}
              onClick={handleCanvasClick}
              style={{ cursor: isDragging ? 'grabbing' : 'default' }}
            >
              {/* Floor Plan Image */}
              <image
                href={order?.selectedPlan?.image}
                width={floorPlanDimensions.width}
                height={floorPlanDimensions.height}
                transform={`scale(${scale})`}
                style={{ pointerEvents: 'none' }}
              />

              {/* Placed Furniture */}
              <g transform={`scale(${scale})`}>
                {Object.entries(placedFurniture).map(([key, furniture]) =>
                  renderFurnitureShape(furniture, key)
                )}
              </g>
            </svg>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <span>
              Placed: <strong className="text-gray-900">{Object.keys(placedFurniture).length}</strong> items
            </span>
            {selectedFurniture && (
              <>
                <span>•</span>
                <span>
                  Selected: <strong className="text-[#005670]">{placedFurniture[selectedFurniture]?.label}</strong>
                </span>
                <span>•</span>
                <span className="text-xs">
                  Shape: <strong className="text-gray-700">
                    {Array.isArray(placedFurniture[selectedFurniture]?.coordinates) ? 'Polygon' :
                     placedFurniture[selectedFurniture]?.coordinates?.curve ? 'Curved' :
                     placedFurniture[selectedFurniture]?.coordinates?.arc ? 'Arc' :
                     'Rectangle'}
                  </strong>
                </span>
                {placedFurniture[selectedFurniture]?.rotation && (
                  <>
                    <span>•</span>
                    <span className="text-xs">
                      Rotation: <strong className="text-[#005670]">{placedFurniture[selectedFurniture].rotation}°</strong>
                    </span>
                  </>
                )}
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Click to select • Drag to move • Rotate (90°) • Delete
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryFloorPlanEditor;