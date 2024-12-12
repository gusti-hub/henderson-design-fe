import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    unitNumber: '',
    floorPlan: '',
    role: 'user'  // Always 'user' for clients
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [floorPlans, setFloorPlans] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchFloorPlans();
  }, []);

  useEffect(() => {
    fetchClients();
  }, [currentPage]); // Refetch when page changes

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchClients();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchFloorPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/clients/floor-plans', {
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
  
  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/clients?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      setClients(data.clients);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create' 
        ? 'http://localhost:5000/api/clients'
        : `http://localhost:5000/api/clients/${selectedClient._id}`;
  
      // Only include password in the request if it's being changed
      const submitData = { ...formData };
      if (!showPasswordField && modalMode === 'edit') {
        delete submitData.password;
      }
  
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save client');
      }
  
      await fetchClients();
      handleCloseModal();
    } catch (error) {
      setErrors({ ...errors, form: error.message });
    } finally {
        setSubmitLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
    if (!formData.floorPlan) newErrors.floorPlan = 'Floor plan is required';
    if (modalMode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    }
    if (showPasswordField && modalMode === 'edit' && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'New password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      unitNumber: '',
      role: 'user'
    });
    setErrors({});
    setShowPasswordField(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light" style={{ color: '#005670' }}>
          Client Management
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
          Add Client
        </button>
      </div>

      <div className="mb-6">
        <SearchFilter
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Search by name or email..."
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : clients.map((client) => (
              <tr key={client._id}>
                <td className="px-6 py-4">{client.name}</td>
                <td className="px-6 py-4">{client.email}</td>
                <td className="px-6 py-4">{client.unitNumber}</td>
                <td className="px-6 py-4">{client.floorPlan}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setFormData({
                          name: client.name,
                          email: client.email,
                          unitNumber: client.unitNumber,
                          role: 'user'
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
                        if (window.confirm('Are you sure you want to delete this client?')) {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`http://localhost:5000/api/clients/${client._id}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            if (!response.ok) {
                              throw new Error('Failed to delete client');
                            }
                            
                            await fetchClients();
                          } catch (error) {
                            console.error('Error:', error);
                          }
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
      </div>

     {/* Add pagination below the table */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                {modalMode === 'create' ? 'Add New Client' : 'Edit Client'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                <input
                  type="text"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                />
                {errors.unitNumber && <p className="text-red-500 text-sm mt-1">{errors.unitNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Plan</label>
                <select
                  value={formData.floorPlan}
                  onChange={(e) => setFormData({ ...formData, floorPlan: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                >
                  <option value="">Select a floor plan</option>
                  {floorPlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
                {errors.floorPlan && <p className="text-red-500 text-sm mt-1">{errors.floorPlan}</p>}
              </div>

              {modalMode === 'create' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                ) : (
                <div>
                    <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button
                        type="button"
                        onClick={() => setShowPasswordField(!showPasswordField)}
                        className="text-sm text-[#005670]"
                    >
                        {showPasswordField ? 'Cancel Password Change' : 'Change Password'}
                    </button>
                    </div>
                    {showPasswordField && (
                    <>
                        <input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#005670]/20"
                        placeholder="Enter new password"
                        />
                        {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </>
                    )}
                </div>
                )}

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

export default ClientManagement;