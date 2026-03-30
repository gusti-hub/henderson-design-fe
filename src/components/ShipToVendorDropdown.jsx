// components/ShipToVendorDropdown.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, Loader2, MapPin, Check, Plus } from 'lucide-react';
import { backendServer } from '../utils/info';

/**
 * ShipToVendorDropdown
 *
 * Props:
 *  - selectedVendorId: string | null
 *  - onSelect: ({ vendorId, shipToName, street, city, state, postalCode, country }) => void
 *  - onClear: () => void
 *  - disabled: boolean
 */
const ShipToVendorDropdown = ({
  selectedVendorId = null,
  onSelect,
  onClear,
  disabled = false,
}) => {
  const [isOpen, setIsOpen]                   = useState(false);
  const [searchTerm, setSearchTerm]           = useState('');
  const [vendors, setVendors]                 = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [selectedVendorData, setSelectedVendorData] = useState(null);
  // Track which ID we last fetched so we re-fetch if the ID changes
  const [fetchedId, setFetchedId]             = useState(null);
  const dropdownRef = useRef(null);

  // ── Re-fetch whenever selectedVendorId changes ──
  useEffect(() => {
    if (!selectedVendorId) {
      setSelectedVendorData(null);
      setFetchedId(null);
      return;
    }
    // Only fetch if the ID actually changed
    if (selectedVendorId !== fetchedId) {
      fetchVendorById(selectedVendorId);
    }
  }, [selectedVendorId]);

  // ── Fetch vendors for the dropdown list ──
  useEffect(() => {
    if (isOpen) fetchVendors();
  }, [searchTerm, isOpen]);

  // ── Close on outside click ──
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const fetchVendorById = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedVendorData(data);
        setFetchedId(vendorId);
      }
    } catch (err) {
      console.error('Error fetching vendor:', err);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${backendServer}/api/vendors?limit=50&search=${encodeURIComponent(searchTerm)}&status=active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const buildAddress = (vendor) => {
    const addr = vendor.address || {};
    return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
  };

  const handleSelect = (vendor) => {
    setSelectedVendorData(vendor);
    setFetchedId(vendor._id);
    setIsOpen(false);
    setSearchTerm('');
    onSelect({
      vendorId:   vendor._id,
      shipToName: vendor.name || '',
      street:     vendor.address?.street || '',
      city:       vendor.address?.city || '',
      state:      vendor.address?.state || '',
      postalCode: vendor.address?.zip || '',
      country:    vendor.address?.country || '',
    });
  };

  const handleClear = () => {
    setSelectedVendorData(null);
    setFetchedId(null);
    setSearchTerm('');
    if (onClear) onClear();
  };

  const isSelected = !!selectedVendorData;
  const addressLine = selectedVendorData ? buildAddress(selectedVendorData) : '';

  return (
    <div ref={dropdownRef} className="relative">

      {/* ── Selected State: show vendor pill ── */}
      {isSelected && !isOpen ? (
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between min-h-[38px]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {selectedVendorData.vendorCode?.slice(0, 3) || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {selectedVendorData.name}
              </p>
              {addressLine && (
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {addressLine}
                </p>
              )}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              title="Clear selection"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Search Input — matches screenshot style ── */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => !disabled && setIsOpen(true)}
              disabled={disabled}
              placeholder="Search vendor to ship to..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* ── Dropdown List ── */}
          {isOpen && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#005670] mx-auto" />
                  <p className="text-xs text-gray-500 mt-1">Loading vendors...</p>
                </div>
              ) : vendors.length === 0 ? (
                <div className="p-4 text-center">
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'No vendors found' : 'No active vendors'}
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {vendors.map((vendor) => {
                    const addr = buildAddress(vendor);
                    const isCurrent = vendor._id === selectedVendorId;
                    return (
                      <button
                        key={vendor._id}
                        type="button"
                        onClick={() => handleSelect(vendor)}
                        className="w-full px-4 py-3 hover:bg-[#005670]/5 transition-colors text-left
                          border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-[#005670] to-[#007a9a]
                          rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {vendor.vendorCode?.slice(0, 3) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{vendor.name}</p>
                            <span className="px-1.5 py-0.5 bg-[#005670]/10 text-[#005670] text-xs font-semibold rounded flex-shrink-0">
                              {vendor.vendorCode}
                            </span>
                          </div>
                          {addr ? (
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {addr}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No address on file</p>
                          )}
                        </div>
                        {isCurrent && (
                          <Check className="w-4 h-4 text-[#005670] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShipToVendorDropdown;