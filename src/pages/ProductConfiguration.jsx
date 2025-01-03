import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';
import { backendServer } from '../utils/info';
import BulkProductImport from '../pages/BulkProductImport'
import BulkDeleteProducts from './BulkDeleteProduct';

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
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    description: '',
    basePrice: '',
    variants: [] // Will store combinations of attributes with their specific prices and images
  });
  const [errors, setErrors] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({
    finish: false,
    fabric: false
  });
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

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
    if (!image) return null;
    return image.url || null;
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
    if (field === 'image') {
      // Handle file upload
      const file = value;
      if (file && file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          [`variant_${index}_image`]: 'Image size should be less than 5MB' 
        }));
        return;
      }
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newVariants[index] = {
        ...newVariants[index],
        image: file,
        imagePreview: previewUrl
      };
    } else {
      // Handle other fields
      newVariants[index] = {
        ...newVariants[index],
        [field]: value
      };
    }
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
      description: product.description || '',
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
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, [`variant_${index}_image`]: 'Image size should be less than 5MB' });
        return;
      }
  
      console.log('Handling new image for variant', index, file); // Debug log
  
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      
      const newVariants = [...formData.variants];
      newVariants[index] = {
        ...newVariants[index],
        image: file, // Store the File object for upload
        imagePreview: objectUrl // Store preview URL
      };
  
      console.log('Updated variant:', newVariants[index]); // Debug log
  
      setFormData({
        ...formData,
        variants: newVariants
      });
  
      // Clear any existing image error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`variant_${index}_image`];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts or modal closes
      formData.variants.forEach(variant => {
        if (variant.imagePreview && !variant.imagePreview.startsWith('http')) {
          URL.revokeObjectURL(variant.imagePreview);
        }
      });
    };
  }, [])

  const handleDeleteVariantImage = (variantIndex) => {
    console.log('Deleting image for variant', variantIndex); // Debug log
  
    const newVariants = [...formData.variants];
    const variant = newVariants[variantIndex];
  
    // Clean up object URL if it exists
    if (variant.imagePreview && !variant.imagePreview.startsWith('http')) {
      URL.revokeObjectURL(variant.imagePreview);
    }
  
    // Reset image data
    newVariants[variantIndex] = {
      ...variant,
      image: null,
      imagePreview: null
    };
  
    console.log('Updated variant after delete:', newVariants[variantIndex]); // Debug log
  
    setFormData({
      ...formData,
      variants: newVariants
    });
  
    // Clear any existing image errors
    setErrors(prev => {
      const newErrors = { ...prev };
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
      description: '',
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
          `${backendServer}/api/products/${productId}`,
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
    if (!formData.description) newErrors.description = 'Description is required';
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
        `${backendServer}/api/products?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
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
      const formDataToSend = new FormData();
      
      // Append basic product data
      formDataToSend.append('product_id', formData.product_id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('basePrice', formData.basePrice.toString());

      // Track which variants have files to upload
      let fileCount = 0;
      
      // Process variants and track their image status
      const variantsForSubmission = formData.variants.map((variant, index) => {
        // If there's a new file to upload
        if (variant.image instanceof File) {
          formDataToSend.append('images', variant.image);
          fileCount++;
          return {
            finish: variant.finish || '',
            fabric: variant.fabric || '',
            price: parseFloat(variant.price),
            imageIndex: fileCount - 1 // Track which uploaded file corresponds to this variant
          };
        } 
        // If it's an existing image (has URL and key)
        else if (variant.image?.url && variant.image?.key) {
          return {
            finish: variant.finish || '',
            fabric: variant.fabric || '',
            price: parseFloat(variant.price),
            image: variant.image // Keep existing image data
          };
        }
        // If no image
        else {
          return {
            finish: variant.finish || '',
            fabric: variant.fabric || '',
            price: parseFloat(variant.price),
            image: null
          };
        }
      });

      formDataToSend.append('variants', JSON.stringify(variantsForSubmission));

      console.log('Submitting variants:', variantsForSubmission); // Debug log
      
      const token = localStorage.getItem('token');
      const url = modalMode === 'create'
        ? `${backendServer}/api/products`
        : `${backendServer}/api/products/${selectedProduct._id}`;

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({ ...prev, submit: error.message }));
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkDelete(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#dc2626' }}  // Red color for delete
          >
            <Trash2 className="w-4 h-4" />
            Bulk Delete
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#005670' }}
          >
            <Upload className="w-4 h-4" />
            Bulk Import
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
            Add Product
          </button>
        </div>
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
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th> */}
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
              {/* <td className="px-6 py-4">
                  <div className="max-w-xs overflow-hidden text-ellipsis">
                    {product.description}
                  </div>
              </td> */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    placeholder="Enter product details including dimensions, materials, and other specifications..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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
                      {variant.imagePreview || (variant.image?.url) ? (
                        <div className="relative inline-block">
                          <img
                            src={variant.imagePreview || variant.image?.url}
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
                      {errors[`variant_${index}_image`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`variant_${index}_image`]}
                        </p>
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

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                Bulk Import Products
              </h3>
              <button onClick={() => setShowBulkImport(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <BulkProductImport 
              onComplete={() => {
                setShowBulkImport(false);
                fetchProducts();
              }} 
            />
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-light text-red-600">
                Bulk Delete Products
              </h3>
              <button onClick={() => setShowBulkDelete(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <BulkDeleteProducts 
              onComplete={() => {
                setShowBulkDelete(false);
                fetchProducts();
              }}
              backendServer={backendServer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductConfiguration;