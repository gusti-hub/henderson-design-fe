import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload
} from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';
import { backendServer } from '../utils/info';

const ProductMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [floorPlans, setFloorPlans] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSubmitLoading, setBulkSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    locationId: '',
    locationName: '',
    floorPlanId: '',
    allowedProductIds: []
  });

  const [errors, setErrors] = useState({});

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.product_id.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [products, productSearchTerm]);

  useEffect(() => {
    fetchMappings();
    fetchProducts();
    fetchFloorPlans();
  }, [currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchMappings();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/location-mappings?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setMappings(data.mappings);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err) {
      console.error('Error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloorPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/floor-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFloorPlans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/products/basic-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const newErr = {};
    if (!formData.locationId) newErr.locationId = 'Required';
    if (!formData.locationName) newErr.locationName = 'Required';
    if (!formData.floorPlanId) newErr.floorPlanId = 'Required';
    if (!formData.allowedProductIds.length)
      newErr.allowedProductIds = 'Select at least one product';
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url =
        modalMode === 'create'
          ? `${backendServer}/api/location-mappings`
          : `${backendServer}/api/location-mappings/${selectedMapping._id}`;

      const res = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save');
      }

      await fetchMappings();
      handleCloseModal();
    } catch (err) {
      setErrors({ ...errors, form: err.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMapping(null);
    setFormData({
      locationId: '',
      locationName: '',
      floorPlanId: '',
      allowedProductIds: []
    });
    setErrors({});
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setBulkErrors(['Please select a CSV file']);
      return;
    }

    setBulkSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', bulkFile);

      const res = await fetch(`${backendServer}/api/location-mappings/bulk`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Bulk processing failed');
      }

      await fetchMappings();
      handleCloseBulk();
    } catch (err) {
      setBulkErrors([err.message]);
    } finally {
      setBulkSubmitLoading(false);
    }
  };

  const handleCloseBulk = () => {
    setIsBulkModalOpen(false);
    setBulkFile(null);
    setBulkErrors([]);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Location Product Mapping
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 
                       bg-gradient-to-r from-[#005670] to-[#007a9a] 
                       text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>

          <button
            onClick={() => {
              setModalMode('create');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 
                       bg-gradient-to-r from-[#005670] to-[#007a9a] 
                       text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Mapping
          </button>
        </div>
      </div>

      {/* SEARCH BOX */}
      <SearchFilter
        value={searchTerm}
        onSearch={setSearchTerm}
        placeholder="Search by location or floor plan..."
      />

      {/* TABLE */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
        </div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">No mappings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Location ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Location Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Floor Plan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Products</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {mappings.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{m.locationId}</td>
                  <td className="px-4 py-3">{m.locationName}</td>
                  <td className="px-4 py-3">{m.floorPlanId}</td>
                  <td className="px-4 py-3">{m.allowedProductIds.length} products</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">

                      {/* EDIT */}
                      <button
                        onClick={() => {
                          setSelectedMapping(m);
                          setFormData({
                            locationId: m.locationId,
                            locationName: m.locationName,
                            floorPlanId: m.floorPlanId,
                            allowedProductIds: m.allowedProductIds.map(p => p._id)
                          });
                          setModalMode('edit');
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this mapping?')) {
                            const token = localStorage.getItem('token');
                            await fetch(`${backendServer}/api/location-mappings/${m._id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchMappings();
                          }
                        }}
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

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===========================
          BULK UPLOAD MODAL
      ============================ */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Bulk Create Mappings</h3>
              <button
                onClick={handleCloseBulk}
                className="p-2 hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4">

              {bulkErrors.length > 0 && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {bulkErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}

              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBulkFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />

              <p className="text-xs text-gray-500">
                CSV must include: locationId, locationName, floorPlanId, allowedProductIds
              </p>

            </div>

            {/* FOOTER */}
            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={handleBulkUpload}
                disabled={bulkSubmitLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] 
                           text-white rounded-xl hover:shadow-lg text-sm font-semibold flex items-center gap-2"
              >
                {bulkSubmitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===========================
          ADD / EDIT MODAL
      ============================ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {modalMode === 'create' ? 'Add New Mapping' : 'Edit Mapping'}
              </h3>

              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4">

              {errors.form && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {errors.form}
                </div>
              )}

              {/* Location ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.locationId}
                  onChange={(e) =>
                    setFormData({ ...formData, locationId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                />
                {errors.locationId && (
                  <p className="text-red-500 text-sm mt-1">{errors.locationId}</p>
                )}
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) =>
                    setFormData({ ...formData, locationName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                />
                {errors.locationName && (
                  <p className="text-red-500 text-sm mt-1">{errors.locationName}</p>
                )}
              </div>

              {/* Floor Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Plan ID <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.floorPlanId}
                  onChange={(e) =>
                    setFormData({ ...formData, floorPlanId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                >
                  <option value="">Select Floor Plan</option>
                  {floorPlans.map((plan, idx) => (
                    <option key={idx} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>

                {errors.floorPlanId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.floorPlanId}
                  </p>
                )}
              </div>

              {/* Allowed Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Products <span className="text-red-500">*</span>
                </label>

                {/* Search product input */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                  />
                </div>

                <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto p-2">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-3 text-sm">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <label
                        key={product._id}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.allowedProductIds.includes(product._id)}
                          onChange={() => {
                            const id = product._id;
                            setFormData((prev) => ({
                              ...prev,
                              allowedProductIds: prev.allowedProductIds.includes(id)
                                ? prev.allowedProductIds.filter((x) => x !== id)
                                : [...prev.allowedProductIds, id]
                            }));
                          }}
                          className="h-4 w-4 text-[#005670] rounded border-gray-300 focus:ring-[#005670]"
                        />
                        <span className="text-sm text-gray-700">
                          {product.name} ({product.product_id})
                        </span>
                      </label>
                    ))
                  )}
                </div>

                {errors.allowedProductIds && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allowedProductIds}
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#005670] to-[#007a9a] 
                           text-white rounded-xl hover:shadow-lg text-sm font-semibold flex items-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                  </>
                ) : modalMode === 'create' ? (
                  'Create Mapping'
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductMapping;
