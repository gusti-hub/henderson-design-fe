import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ShieldCheck } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import SearchFilter from '../components/common/SearchFilter';
import { backendServer } from '../utils/info';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'  // Default to admin since this is for admin users only
  });
  const [errors, setErrors] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);

    // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

    // Add useEffect to handle search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when searching
            fetchUsers();
        }, 500); // Debounce search for 500ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
            `${backendServer}/api/users/admins?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
            {
                headers: {
                'Authorization': `Bearer ${token}`
                }
            }
            );
            const data = await response.json();
            setUsers(data.users);
            setTotalPages(Math.ceil(data.total / itemsPerPage));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (modalMode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (showPasswordField && modalMode === 'edit' && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'New password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true); // Start loading
  
    try {
      const token = localStorage.getItem('token');
      const url = modalMode === 'create' 
        ? `${backendServer}/api/users/admins`
        : `${backendServer}/api/users/admins/${selectedUser._id}`;
  
      // Only include password if it's provided in edit mode or if creating new user
      const submitData = { ...formData };
      if (modalMode === 'edit' && !showPasswordField) {
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
        throw new Error(data.message || 'Failed to save user');
      }
  
      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      setErrors({ ...errors, form: error.message });
    } finally {
        setSaveLoading(false); // Stop loading
      }
  };

    
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin'
    });
    setErrors({});
    setShowPasswordField(false);
    setSaveLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-light" style={{ color: '#005670' }}>
          Admin User Management
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
          Add Admin User
        </button>
      </div>

      {/* Add search filter */}
      <div className="mb-6">
        <SearchFilter
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Search by name or email..."
        />
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
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
            ) : users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData({
                          name: user.name,
                          email: user.email,
                          role: 'admin'
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
                        if (window.confirm('Are you sure you want to delete this admin user?')) {
                          const token = localStorage.getItem('token');
                          await fetch(`${backendServer}/api/users/admins/${user._id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          fetchUsers();
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-light" style={{ color: '#005670' }}>
                {modalMode === 'create' ? 'Add New Admin User' : 'Edit Admin User'}
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
                type="submit"
                disabled={saveLoading}
                className="px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#005670' }}
                >
                {saveLoading ? (
                    <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                    </>
                ) : (
                    <>{modalMode === 'create' ? 'Create' : 'Save Changes'}</>
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

export default UserManagement;