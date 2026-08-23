// src/pages/RoleManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ShieldCheck, Shield, Lock } from 'lucide-react';
import { backendServer } from '../utils/info';
import { ACTION_LABELS } from '../utils/actions';

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] bg-white';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete'
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('token');

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendServer}/api/roles`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch { setRoles([]); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setErrors({});
    setSelectedRole(null);
    setModalMode('create');
  };

  const openEdit = (role) => {
    setFormData({ name: role.name, description: role.description || '', permissions: [...(role.permissions || [])] });
    setErrors({});
    setSelectedRole(role);
    setModalMode('edit');
  };

  const openDelete = (role) => {
    setSelectedRole(role);
    setModalMode('delete');
  };

  const closeModal = () => { setModalMode(null); setSelectedRole(null); };

  const togglePermission = (action) => {
    setFormData(f => ({
      ...f,
      permissions: f.permissions.includes(action)
        ? f.permissions.filter(p => p !== action)
        : [...f.permissions, action],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const url = modalMode === 'create'
        ? `${backendServer}/api/roles`
        : `${backendServer}/api/roles/${selectedRole._id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchRoles();
      closeModal();
    } catch (err) {
      setErrors({ form: err.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${backendServer}/api/roles/${selectedRole._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchRoles();
      closeModal();
    } catch (err) {
      setErrors({ form: err.message });
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Define roles and map which menus each role can access.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg text-sm font-medium hover:bg-[#004558] transition-colors">
          <Plus className="w-4 h-4" /> New Role
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#005670]" /></div>
      ) : (
        <div className="space-y-3">
          {roles.map(role => (
            <div key={role._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {role.isSystem
                    ? <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    : <Shield className="w-4 h-4 text-[#005670] shrink-0" />}
                  <span className="font-semibold text-gray-900">{role.name}</span>
                  {role.isSystem && (
                    <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">system</span>
                  )}
                </div>
                {role.description && <p className="text-sm text-gray-500 mb-2">{role.description}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(role.permissions || []).length === 0
                    ? <span className="text-xs text-gray-400 italic">No permissions</span>
                    : (role.permissions || []).map(p => (
                        <span key={p} className="text-xs px-2 py-0.5 bg-[#005670]/8 text-[#005670] border border-[#005670]/20 rounded-full">
                          {ACTION_LABELS[p] || p}
                        </span>
                      ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(role)}
                  className="p-2 text-gray-500 hover:text-[#005670] hover:bg-[#005670]/8 rounded-lg transition-colors" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => openDelete(role)} disabled={role.isSystem}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#005670]" />
                <h3 className="text-lg font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create Role' : 'Edit Role'}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5">
              {errors.form && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{errors.form}</div>}
              <div>
                <label className={labelCls}>Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className={`${inputCls} ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="e.g. Designer, Tim PM"
                  disabled={selectedRole?.isSystem}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                {selectedRole?.isSystem && (
                  <p className="text-xs text-amber-600 mt-1">System role name cannot be changed.</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className={inputCls} placeholder="Brief description of this role" />
              </div>
              <div>
                <label className={labelCls}>Menu Access (Permissions)</label>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                  {ALL_ACTIONS.map(action => (
                    <label key={action} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(action)}
                        onChange={() => togglePermission(action)}
                        className="w-4 h-4 text-[#005670] rounded border-gray-300 focus:ring-[#005670]/20"
                      />
                      <span className="text-sm text-gray-700">{ACTION_LABELS[action]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#005670] text-white rounded-lg hover:bg-[#004558] disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === 'create' ? 'Create Role' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {modalMode === 'delete' && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Role</h3>
            <p className="text-sm text-gray-600 mb-1">Are you sure you want to delete <strong>{selectedRole.name}</strong>?</p>
            <p className="text-xs text-amber-600 mb-6">Users assigned to this role will lose their access permissions.</p>
            {errors.form && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-4">{errors.form}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
