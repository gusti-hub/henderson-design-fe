import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Upload } from 'lucide-react';
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
  const [itemsPerPage] = useState(10);
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

  useEffect(() => {
    fetchMappings();
    fetchProducts();
    fetchFloorPlans();
  }, [currentPage]);

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setBulkErrors(['Please select a file']);
      return;
    }

    setBulkSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/location-mappings/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to process bulk upload');
      }

      await fetchMappings();
      handleCloseBulkModal();
    } catch (error) {
      setBulkErrors([error.message]);
    } finally {
      setBulkSubmitLoading(false);
    }
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkFile(null);
    setBulkErrors([]);
  };

  const validateCSV = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const requiredHeaders = ['locationId', 'locationName', 'floorPlanId', 'allowedProductIds'];
        const headers = results.meta.fields;
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setBulkErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
          return;
        }
        
        setBulkErrors([]);
      },
      error: (error) => {
        setBulkErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  };


  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.product_id.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [products, productSearchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchMappings();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/location-mappings?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setMappings(data.mappings);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloorPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/clients/floor-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFloorPlans(data);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/products/basic-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.locationId) newErrors.locationId = 'Location ID is required';
    if (!formData.locationName) newErrors.locationName = 'Location name is required';
    if (!formData.floorPlanId) newErrors.floorPlanId = 'Floor plan ID is required';
    if (!formData.allowedProductIds.length) newErrors.allowedProductIds = 'Select at least one product';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create' 
        ? `${backendServer}/api/location-mappings`
        : `${backendServer}/api/location-mappings/${selectedMapping._id}`;

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save mapping');
      }

      await fetchMappings();
      handleCloseModal();
    } catch (error) {
      setErrors({ ...errors, form: error.message });
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light" style={{ color: '#005670' }}>
          Location Product Mapping
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#005670' }}
          >
            <Upload className="w-4 h-4" />
            Bulk Create
          </button>
          <button
            onClick={() => {
              setModalMode('create');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#005670' }}
          >
            <Plus className="w-4 h-4" />
            Add Mapping
          </button>
        </div>
        </div>

      <div className="mb-6">
        <SearchFilter
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Search by location or floor plan..."
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : mappings.map((mapping) => (
              <tr key={mapping._id}>
                <td className="px-6 py-4">{mapping.locationId}</td>
                <td className="px-6 py-4">{mapping.locationName}</td>
                <td className="px-6 py-4">{mapping.floorPlanId}</td>
                <td className="px-6 py-4">{mapping.allowedProductIds.length} products</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMapping(mapping);
                        setFormData({
                          locationId: mapping.locationId,
                          locationName: mapping.locationName,
                          floorPlanId: mapping.floorPlanId,
                          allowedProductIds: mapping.allowedProductIds.map(product => product._id) // Convert to array of IDs
                        });
                        setModalMode('edit');
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this mapping?')) {
                          const token = localStorage.getItem('token');
                          await fetch(`${backendServer}/api/location-mappings/${mapping._id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          fetchMappings();
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                Bulk Create Mappings
              </h3>
              <button onClick={handleCloseBulkModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {bulkErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {bulkErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setBulkFile(file);
                    if (file) validateCSV(file);
                  }}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                />
                <p className="text-sm text-gray-500 mt-1">
                  CSV should contain: locationId, locationName, floorPlanId, allowedProductIds (comma-separated)
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="submit"
                  disabled={bulkSubmitLoading || bulkErrors.length > 0}
                  className="px-4 py-2 text-white rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: '#005670' }}
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
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                {modalMode === 'create' ? 'Add New Mapping' : 'Edit Mapping'}
              </h3>
              <button onClick={handleCloseModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location ID</label>
                <input
                  type="text"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                />
                {errors.locationId && <p className="text-red-500 text-sm mt-1">{errors.locationId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                />
                {errors.locationName && <p className="text-red-500 text-sm mt-1">{errors.locationName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Plan ID</label>
                <select
                    value={formData.floorPlanId}
                    onChange={(e) => setFormData({ ...formData, floorPlanId: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                >
                    <option value="">Select Floor Plan</option>
                    {floorPlans.map((plan) => (
                    <option key={plan} value={plan}>
                        {plan}
                    </option>
                    ))}
                </select>
                {errors.floorPlanId && <p className="text-red-500 text-sm mt-1">{errors.floorPlanId}</p>}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Products</label>
                
                {/* Add search input */}
                <div className="mb-2">
                    <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    />
                </div>
                
                <div className="border rounded max-h-60 overflow-y-auto p-2">
                    {filteredProducts.map(product => (
                    <div key={product._id} className="flex items-center py-2 hover:bg-gray-50">
                        <input
                        type="checkbox"
                        id={`product-${product._id}`}
                        value={product._id}
                        checked={formData.allowedProductIds.includes(product._id)}
                        onChange={(e) => {
                            const productId = e.target.value;
                            setFormData(prev => ({
                            ...prev,
                            allowedProductIds: e.target.checked
                                ? [...prev.allowedProductIds, productId]
                                : prev.allowedProductIds.filter(id => id !== productId)
                            }));
                        }}
                        className="h-4 w-4 text-[#005670] border-gray-300 rounded focus:ring-[#005670]"
                        />
                        <label 
                        htmlFor={`product-${product._id}`}
                        className="ml-2 block text-sm text-gray-900 cursor-pointer"
                        >
                        {product.name} ({product.product_id})
                        </label>
                    </div>
                    ))}
                    {filteredProducts.length === 0 && (
                    <div className="text-gray-500 text-sm py-2 text-center">
                        No products found
                    </div>
                    )}
                </div>
                {errors.allowedProductIds && (
                    <p className="text-red-500 text-sm mt-1">{errors.allowedProductIds}</p>
                )}
                </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 text-white rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: '#005670' }}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    modalMode === 'create' ? 'Create' : 'Save Changes'
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

export default ProductMapping;