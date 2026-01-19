// components/VendorSearchDropdown.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, Loader2 } from 'lucide-react';
import { backendServer } from '../utils/info';

const VendorSearchDropdown = ({ 
  selectedVendor, 
  onSelectVendor, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendorData, setSelectedVendorData] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch vendor data jika ada selectedVendor
  useEffect(() => {
    if (selectedVendor && !selectedVendorData) {
      fetchVendorById(selectedVendor);
    }
  }, [selectedVendor]);

  // Fetch vendors saat search atau dropdown dibuka
  useEffect(() => {
    if (isOpen) {
      fetchVendors();
    }
  }, [searchTerm, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVendorById = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/vendors/${vendorId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedVendorData(data);
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/vendors?limit=50&search=${searchTerm}&status=active`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (vendor) => {
    setSelectedVendorData(vendor);
    onSelectVendor(vendor._id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedVendorData(null);
    onSelectVendor(null);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Vendor <span className="text-red-500">*</span>
      </label>

      {/* Selected Vendor Display */}
      {selectedVendorData && !isOpen ? (
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {selectedVendorData.vendorCode}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {selectedVendorData.name}
              </p>
              <p className="text-xs text-gray-500">
                {selectedVendorData.vendorCode} • Markup: {selectedVendorData.defaultMarkup}%
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              placeholder="Search vendor by code, name, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Dropdown */}
          {isOpen && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#005670] mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading vendors...</p>
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
                  {vendors.map((vendor) => (
                    <button
                      key={vendor._id}
                      onClick={() => handleSelect(vendor)}
                      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {vendor.vendorCode}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {vendor.name}
                            </p>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                              {vendor.vendorCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{vendor.representativeName}</span>
                            <span>•</span>
                            <span>Markup: {vendor.defaultMarkup}%</span>
                            {vendor.contactInfo?.email && (
                              <>
                                <span>•</span>
                                <span className="truncate">{vendor.contactInfo.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorSearchDropdown;