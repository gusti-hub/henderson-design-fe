import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';

const ProductConfiguration = () => {
  // Predefined attribute options
  const attributeOptions = {
    finish: ['Light', 'Dark'],
    fabric: ['Cream', 'Tan', 'Beige', 'Blue']
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    basePrice: '',
    variants: [] // Will store combinations of attributes with their specific prices and images
  });
  const [errors, setErrors] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({
    finish: false,
    fabric: false
  });

  // Initialize a new variant
  const initializeVariant = () => ({
    finish: '',
    fabric: '',
    price: '',
    image: null,
    imagePreview: null
  });

  // Add new variant
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, initializeVariant()]
    });
  };

  const getImageUrl = (image) => {
    if (!image || !image.data) return null;
    
    try {
      // Handle image.data whether it's a Buffer or regular object
      const imageData = image.data.data ? image.data.data : image.data;
      const uint8Array = new Uint8Array(imageData);
      const binary = uint8Array.reduce((str, byte) => str + String.fromCharCode(byte), '');
      const base64 = btoa(binary);
      return `data:${image.contentType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting image:', error);
      return null;
    }
  };

  // Remove variant
  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Add useEffect to handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        setCurrentPage(1); // Reset to first page when searching
        fetchProducts();
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);

  useEffect(() => {
    // Update variants when attributes change
    if (formData.variants.length > 0) {
      const updatedVariants = formData.variants.map(variant => ({
        ...variant,
        finish: selectedAttributes.finish ? variant.finish : '',
        fabric: selectedAttributes.fabric ? variant.fabric : ''
      }));
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  }, [selectedAttributes]);

  // Handle variant change
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    // First check which attributes are used in variants
    const hasFinish = product.variants.some(v => v.finish);
    const hasFabric = product.variants.some(v => v.fabric);
  
    setSelectedAttributes({
      finish: hasFinish,
      fabric: hasFabric
    });
  
    setFormData({
      product_id: product.product_id,
      name: product.name,
      basePrice: product.basePrice,
      variants: product.variants.map(v => ({
        ...v,
        finish: v.finish || '',
        fabric: v.fabric || '',
        price: v.price,
        image: v.image,
        imagePreview: v.image ? getImageUrl(v.image) : null
      }))
    });
    
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle variant image change
  const handleVariantImageChange = (index, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, [`variant_${index}_image`]: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newVariants = [...formData.variants];
        newVariants[index] = {
          ...newVariants[index],
          image: file,
          imagePreview: reader.result
        };
        setFormData({
          ...formData,
          variants: newVariants
        });
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, [`variant_${index}_image`]: null });
    }
  };

  const handleDeleteVariantImage = (variantIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      image: null,
      imagePreview: null
    };
    setFormData({
      ...formData,
      variants: newVariants
    });
    
    // Clear any existing image error for this variant
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[`variant_${variantIndex}_image`];
      return newErrors;
    });
  };

  // Add this function near your other handler functions, before the return statement
const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({
      product_id: '',
      name: '',
      basePrice: '',
      variants: []
    });
    setSelectedAttributes({
      finish: false,
      fabric: false
    });
    setErrors({});
  };
  
  // Also add the delete handler that was referenced but not defined
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/products/${productId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to delete product');
        }
        
        await fetchProducts();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_id) newErrors.product_id = 'Product ID is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.basePrice || isNaN(formData.basePrice)) {
      newErrors.basePrice = 'Valid base price is required';
    }
    
    // Validate variants
    formData.variants.forEach((variant, index) => {
      if (selectedAttributes.finish && !variant.finish) {
        newErrors[`variant_${index}_finish`] = 'Finish is required';
      }
      if (selectedAttributes.fabric && !variant.fabric) {
        newErrors[`variant_${index}_fabric`] = 'Fabric is required';
      }
      if (!variant.price || isNaN(variant.price)) {
        newErrors[`variant_${index}_price`] = 'Valid price is required';
      }
      // Check for either image File object or existing image preview
      if (!variant.image && !variant.imagePreview) {
        newErrors[`variant_${index}_image`] = 'Image is required';
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/products?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
  
      console.log('Fetched products:', data); // Debug log
      
      setProducts(data.products || []);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrors(prev => ({ ...prev, fetch: error.message }));
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create'
        ? 'http://localhost:5000/api/products'
        : `http://localhost:5000/api/products/${selectedProduct._id}`;
  
      const formDataToSend = new FormData();
      
      // Append basic product data
      formDataToSend.append('product_id', formData.product_id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('basePrice', formData.basePrice.toString());
  
      // Format variants data
      const variantsData = formData.variants.map(variant => ({
        finish: variant.finish || '',
        fabric: variant.fabric || '',
        price: parseFloat(variant.price)
      }));
  
      // Append variants as JSON string
      formDataToSend.append('variants', JSON.stringify(variantsData));
  
      // Append images
      formData.variants.forEach((variant, index) => {
        if (variant.image instanceof File) {
          formDataToSend.append('images', variant.image);
        }
      });
  
      console.log('Sending data:', {
        product_id: formData.product_id,
        name: formData.name,
        basePrice: formData.basePrice,
        variants: variantsData
      });
  
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
  
      const responseData = await response.json();
      console.log('Server response:', responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save product');
      }
  
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      setErrors({ ...errors, form: error.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light" style={{ color: '#005670' }}>
          Product Configuration
        </h2>
        <button
          onClick={() => {
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#005670' }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchFilter
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Search by product ID or name..."
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variants</th>
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
          ) : products.map((product) => (
            <tr key={product._id}>
              <td className="px-6 py-4">{product.product_id}</td>
              <td className="px-6 py-4">{product.name}</td>
              <td className="px-6 py-4">${product.basePrice}</td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  {product.variants?.map((variant, index) => (
                    <div key={index} className="flex items-center">
                      <div className="text-sm text-gray-600">
                        {variant.finish && variant.fabric ? (
                          <>
                            <span className="font-medium">
                              Finish: {variant.finish} | Fabric: {variant.fabric}
                            </span>
                            <div className="text-sm font-medium text-gray-900">
                              ${Number(variant.price).toFixed(2)}
                            </div>
                          </>
                        ) : variant.finish ? (
                          <>
                            <span className="font-medium">Finish: {variant.finish}</span>
                            <div className="text-sm font-medium text-gray-900">
                              ${Number(variant.price).toFixed(2)}
                            </div>
                          </>
                        ) : variant.fabric ? (
                          <>
                            <span className="font-medium">Fabric: {variant.fabric}</span>
                            <div className="text-sm font-medium text-gray-900">
                              ${Number(variant.price).toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            ${Number(variant.price).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={handleCloseModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                  />
                  {errors.product_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                  />
                  {errors.basePrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>
                  )}
                </div>
              </div>

              {/* Attribute Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Available Attributes</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.finish}
                      onChange={(e) => setSelectedAttributes({
                        ...selectedAttributes,
                        finish: e.target.checked
                      })}
                      className="rounded text-[#005670]"
                    />
                    <span>Finish</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.fabric}
                      onChange={(e) => setSelectedAttributes({
                        ...selectedAttributes,
                        fabric: e.target.checked
                      })}
                      className="rounded text-[#005670]"
                    />
                    <span>Fabric</span>
                  </label>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">Product Variants</h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-sm text-[#005670] hover:text-[#003a4f] flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Variant
                  </button>
                </div>

                {formData.variants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-gray-700">Variant {index + 1}</h5>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Finish dropdown */}
                    {selectedAttributes.finish && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Finish
                        </label>
                        <select
                          value={variant.finish}
                          onChange={(e) => handleVariantChange(index, 'finish', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                        >
                          <option value="">Select Finish</option>
                          <option value="Light">Light</option>
                          <option value="Dark">Dark</option>
                        </select>
                        {errors[`variant_${index}_finish`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`variant_${index}_finish`]}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Fabric dropdown */}
                    {selectedAttributes.fabric && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fabric
                        </label>
                        <select
                          value={variant.fabric}
                          onChange={(e) => handleVariantChange(index, 'fabric', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                        >
                          <option value="">Select Fabric</option>
                          <option value="Cream">Cream</option>
                          <option value="Tan">Tan</option>
                          <option value="Beige">Beige</option>
                          <option value="Blue">Blue</option>
                        </select>
                        {errors[`variant_${index}_fabric`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`variant_${index}_fabric`]}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Price input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                      />
                      {errors[`variant_${index}_price`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`variant_${index}_price`]}
                        </p>
                      )}
                    </div>

                    {/* Variant Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variant Image
                      </label>
                      <div className="mt-1">
                        {variant.imagePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={variant.imagePreview}
                              alt={`Variant ${index + 1}`}
                              className="w-32 h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteVariantImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="mt-2 text-sm text-gray-500">Upload Image</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleVariantImageChange(index, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
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

export default ProductConfiguration;