import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Store, Search, Globe, Phone, Mail, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendServer } from '../utils/info';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    fax: '',
    accountNumber: '',
    defaultMarkup: 0,
    defaultDiscount: 0,
    vendorDepositRequested: 0,
    website: '',
    tags: '',
    loginUsername: '',
    loginPassword: '',
    vendorRepName: '',
    orderMethod: '',
    paymentMethod: '',
    terms: '',
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

  const countries = ['USA', 'Canada', 'Mexico', 'UK', 'Australia', 'Other'];
  const orderMethods = ['Online', 'Email', 'Phone'];
  const paymentMethods = ['Credit Card', 'Check', 'ACH/Wire', 'Net 30 - CC', 'Net 30 - Check'];

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
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email';
    
    // Validasi untuk percentage fields - convert to number first
    const markup = parseFloat(formData.defaultMarkup);
    const discount = parseFloat(formData.defaultDiscount);
    const deposit = parseFloat(formData.vendorDepositRequested);
    
    if (formData.defaultMarkup !== '' && !isNaN(markup) && (markup < 0 || markup > 100)) {
      newErrors.defaultMarkup = 'Must be between 0-100';
    }
    if (formData.defaultDiscount !== '' && !isNaN(discount) && (discount < 0 || discount > 100)) {
      newErrors.defaultDiscount = 'Must be between 0-100';
    }
    if (formData.vendorDepositRequested !== '' && !isNaN(deposit) && (deposit < 0 || deposit > 100)) {
      newErrors.vendorDepositRequested = 'Must be between 0-100';
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
    setActiveTab('details');
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
      email: '',
      fax: '',
      accountNumber: '',
      defaultMarkup: 0,
      defaultDiscount: 0,
      vendorDepositRequested: 0,
      website: '',
      tags: '',
      loginUsername: '',
      loginPassword: '',
      vendorRepName: '',
      orderMethod: '',
      paymentMethod: '',
      terms: '',
      notes: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      street: vendor.address?.street || '',
      city: vendor.address?.city || '',
      state: vendor.address?.state || '',
      zip: vendor.address?.zip || '',
      country: vendor.address?.country || '',
      phone: vendor.contactInfo.phone,
      email: vendor.contactInfo.email,
      fax: vendor.contactInfo.fax || '',
      accountNumber: vendor.accountNumber || '',
      defaultMarkup: vendor.defaultMarkup || 0,
      defaultDiscount: vendor.defaultDiscount || 0,
      vendorDepositRequested: vendor.vendorDepositRequested || 0,
      website: vendor.website || '',
      tags: vendor.tags || '',
      loginUsername: vendor.loginCredentials?.username || '',
      loginPassword: vendor.loginCredentials?.password || '',
      vendorRepName: vendor.loginCredentials?.vendorRepName || '',
      orderMethod: vendor.termsAndPayment?.orderMethod || '',
      paymentMethod: vendor.termsAndPayment?.paymentMethod || '',
      terms: vendor.termsAndPayment?.terms || '',
      notes: vendor.notes || '',
      status: vendor.status
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    
    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)}
          className="w-10 h-10 rounded-lg font-medium text-sm transition-all bg-white text-gray-700 hover:bg-gray-100 border border-gray-200">
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="px-2 text-gray-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
            currentPage === i
              ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="px-2 text-gray-400">...</span>);
      }
      
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)}
          className="w-10 h-10 rounded-lg font-medium text-sm transition-all bg-white text-gray-700 hover:bg-gray-100 border border-gray-200">
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
          <span className="font-semibold">{Math.min(currentPage * itemsPerPage, total)}</span> of{' '}
          <span className="font-semibold">{total}</span> vendors
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          {pages}
          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vendor Management</h1>
        <button onClick={() => { setModalMode('create'); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Vendor</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, name, email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

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
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {vendor.website}
                            </a>
                          )}
                        </div>
                      </div>
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
                        vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {vendor.status === 'active' ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(vendor)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(vendor._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">{modalMode === 'create' ? 'Add New Vendor' : 'Edit Vendor'}</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50 px-6">
              <div className="flex gap-1">
                <button onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 font-semibold text-sm transition-all ${
                    activeTab === 'details'
                      ? 'text-[#005670] border-b-2 border-[#005670] bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  Vendor Details
                </button>
                <button onClick={() => setActiveTab('credentials')}
                  className={`px-6 py-3 font-semibold text-sm transition-all ${
                    activeTab === 'credentials'
                      ? 'text-[#005670] border-b-2 border-[#005670] bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  Login Credentials
                </button>
                <button onClick={() => setActiveTab('terms')}
                  className={`px-6 py-3 font-semibold text-sm transition-all ${
                    activeTab === 'terms'
                      ? 'text-[#005670] border-b-2 border-[#005670] bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  Terms & Notes
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {errors.form && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                    {errors.form}
                  </div>
                )}

                {/* Tab: Vendor Details */}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modalMode === 'edit' && selectedVendor && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vendor Code (Auto-generated)
                        </label>
                        <input
                          type="text"
                          value={selectedVendor.vendorCode}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Vendor code cannot be changed</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="007 Handyman" />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                      <input type="text" value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="1218 S. Westlake Blvd. Unit B" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input type="text" value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="Westlake Village" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input type="text" value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="CA" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                      <input type="text" value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="91361" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]">
                        <option value="">Select...</option>
                        {countries.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="(805) 405-1139" />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="andre@007handyman.com" />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                      <input type="tel" value={formData.fax}
                        onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="(805) 405-1140" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input type="text" value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="ACC-12345" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Markup (%)</label>
                      <input type="number" min="0" max="100" step="0.01" value={formData.defaultMarkup}
                        onChange={(e) => setFormData({ ...formData, defaultMarkup: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="15.00" />
                      {errors.defaultMarkup && <p className="text-red-500 text-sm mt-1">{errors.defaultMarkup}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Discount (%)</label>
                      <input type="number" min="0" max="100" step="0.01" value={formData.defaultDiscount}
                        onChange={(e) => setFormData({ ...formData, defaultDiscount: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="5.00" />
                      {errors.defaultDiscount && <p className="text-red-500 text-sm mt-1">{errors.defaultDiscount}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Deposit Requested (%)</label>
                      <input type="number" min="0" max="100" step="0.01" value={formData.vendorDepositRequested}
                        onChange={(e) => setFormData({ ...formData, vendorDepositRequested: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="50.00" />
                      {errors.vendorDepositRequested && <p className="text-red-500 text-sm mt-1">{errors.vendorDepositRequested}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Website</label>
                      <input type="url" value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="https://example.com" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="Furniture, Hardware, Lighting (comma separated)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                    </div>
                  </div>
                )}

                {/* Tab: Login Credentials */}
                {activeTab === 'credentials' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Login User Name</label>
                      <input type="text" value={formData.loginUsername}
                        onChange={(e) => setFormData({ ...formData, loginUsername: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="username" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Login Password</label>
                      <input type="password" value={formData.loginPassword}
                        onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="••••••••" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Rep Name</label>
                      <input type="text" value={formData.vendorRepName}
                        onChange={(e) => setFormData({ ...formData, vendorRepName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="John Doe" />
                    </div>
                  </div>
                )}

                {/* Tab: Terms & Notes */}
                {activeTab === 'terms' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order Method</label>
                      <select value={formData.orderMethod}
                        onChange={(e) => setFormData({ ...formData, orderMethod: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]">
                        <option value="">Select...</option>
                        {orderMethods.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <select value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]">
                        <option value="">Select Payment Type</option>
                        {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
                      <textarea value={formData.terms}
                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="Payment terms, conditions, etc..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                        placeholder="Additional notes..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} disabled={saveLoading}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saveLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] text-white rounded-xl hover:shadow-lg font-bold flex items-center gap-2 transition-all">
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Store className="w-5 h-5" />
                      {modalMode === 'create' ? 'Create Vendor' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;