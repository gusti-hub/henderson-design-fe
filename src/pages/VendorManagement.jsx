import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Store, Search, Globe, Phone, Mail, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendServer } from '../utils/info';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    vendorCode: '',
    name: '',
    website: '',
    representativeName: '',
    defaultMarkup: 0,
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const itemsPerPage = 10;

  useEffect(() => { fetchVendors(); }, [currentPage, statusFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setCurrentPage(1); fetchVendors(); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/vendors?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${statusFilter}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setVendors(data.vendors);
      setTotal(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.representativeName) newErrors.representativeName = 'Required';
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    if (formData.defaultMarkup < 0 || formData.defaultMarkup > 100) {
      newErrors.defaultMarkup = 'Must be between 0-100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create' 
        ? `${backendServer}/api/vendors`
        : `${backendServer}/api/vendors/${selectedVendor._id}`;
      
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error((await response.json()).message || 'Failed');
      await fetchVendors();
      handleCloseModal();
    } catch (error) {
      setErrors({ ...errors, form: error.message });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendServer}/api/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVendors();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
    setFormData({
      vendorCode: '',
      name: '',
      website: '',
      representativeName: '',
      defaultMarkup: 0,
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      notes: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      vendorCode: vendor.vendorCode,
      name: vendor.name,
      website: vendor.website || '',
      representativeName: vendor.representativeName,
      defaultMarkup: vendor.defaultMarkup,
      phone: vendor.contactInfo.phone,
      email: vendor.contactInfo.email,
      street: vendor.address?.street || '',
      city: vendor.address?.city || '',
      state: vendor.address?.state || '',
      zip: vendor.address?.zip || '',
      notes: vendor.notes || '',
      status: vendor.status
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // ✅ Improved Pagination Component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="w-10 h-10 rounded-lg font-medium text-sm transition-all bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
            currentPage === i
              ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="w-10 h-10 rounded-lg font-medium text-sm transition-all bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        {/* Info */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
          <span className="font-semibold">{Math.min(currentPage * itemsPerPage, total)}</span> of{' '}
          <span className="font-semibold">{total}</span> vendors
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page Numbers */}
          {pages}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vendor Management</h1>
        <button
          onClick={() => { setModalMode('create'); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Vendor</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, name, email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No vendors found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Representative</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Markup</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                        {vendor.vendorCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{vendor.name}</span>
                          {vendor.website && (
                            <a 
                              href={vendor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              {vendor.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {vendor.representativeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {vendor.contactInfo.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {vendor.contactInfo.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <DollarSign className="w-3 h-3" />
                        {vendor.defaultMarkup}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        vendor.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {vendor.status === 'active' ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ NEW PAGINATION */}
          {renderPagination()}
        </div>
      )}

      {/* Modal - Keep existing modal code */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          {/* ... existing modal code ... */}
        </div>
      )}
    </div>
  );
};

export default VendorManagement;