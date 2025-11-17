// AdminJourneyManager.jsx
// Component untuk manage journey di Admin Panel
// Add this to your AdminPanel components

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Save, 
  X,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { backendServer } from '../utils/info';

const AdminJourneyManager = ({ clientId, clientName }) => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  useEffect(() => {
    fetchJourney();
  }, [clientId]);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJourney(data);
      } else if (response.status === 404) {
        // Journey not found - show create button
        setJourney(null);
      } else {
        throw new Error('Failed to fetch journey');
      }
    } catch (error) {
      console.error('Error fetching journey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJourney = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Journey created successfully!');
        await fetchJourney();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create journey');
      }
    } catch (error) {
      console.error('Error creating journey:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStep = async (stepNumber, updates) => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      if (response.ok) {
        setSuccess('Step updated successfully!');
        await fetchJourney();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update step');
      }
    } catch (error) {
      console.error('Error updating step:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteStep = async (stepNumber, notes = '') => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );

      if (response.ok) {
        setSuccess('Step marked as complete!');
        await fetchJourney();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete step');
      }
    } catch (error) {
      console.error('Error completing step:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStepExpanded = (stepNumber) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670]"></div>
      </div>
    );
  }

  // No journey yet - show create button
  if (!journey) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Journey Created
          </h3>
          <p className="text-gray-600 mb-6">
            Initialize journey tracking for {clientName} to enable progress monitoring.
          </p>
          <button
            onClick={handleCreateJourney}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#005670] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Initialize Journey Tracking</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const completedSteps = journey.steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / journey.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Journey Management</h2>
        <p className="text-white/80">Client: {clientName}</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-bold">{completedSteps} / {journey.steps.length} steps</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Journey Steps</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click on any step to expand and update its status
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {journey.steps.map((step) => (
            <StepItem
              key={step.stepNumber}
              step={step}
              expanded={expandedSteps.has(step.stepNumber)}
              onToggle={() => toggleStepExpanded(step.stepNumber)}
              onUpdate={handleUpdateStep}
              onComplete={handleCompleteStep}
              saving={saving}
              getStepIcon={getStepIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Step Item Component
const StepItem = ({ 
  step, 
  expanded, 
  onToggle, 
  onUpdate, 
  onComplete, 
  saving,
  getStepIcon,
  getStatusColor 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: step.status,
    estimatedDate: step.estimatedDate ? step.estimatedDate.split('T')[0] : '',
    notes: step.notes || ''
  });

  const handleSave = () => {
    onUpdate(step.stepNumber, formData);
    setEditMode(false);
  };

  const handleComplete = () => {
    onComplete(step.stepNumber, formData.notes);
    setEditMode(false);
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      {/* Step Header - Always Visible */}
      <div 
        className="flex items-center gap-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-shrink-0">
          {getStepIcon(step.status)}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-gray-900">
              Step {step.stepNumber}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(step.status)}`}>
              {step.status.replace('-', ' ')}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 truncate">{step.title}</h4>
          <p className="text-sm text-gray-600 truncate">{step.description}</p>
        </div>

        <div className="flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pl-9 space-y-4">
          {!editMode ? (
            // View Mode
            <div className="space-y-3">
              {step.estimatedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Estimated:</span>
                  <span className="font-medium">{new Date(step.estimatedDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {step.actualDate && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{new Date(step.actualDate).toLocaleDateString()}</span>
                </div>
              )}

              {step.notes && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">{step.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:opacity-90 text-sm font-medium"
                >
                  Edit Step
                </button>
                
                {step.status !== 'completed' && (
                  <button
                    onClick={handleComplete}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent"
                >
                  <option value="not-started">Not Started</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Date
                </label>
                <input
                  type="date"
                  value={formData.estimatedDate}
                  onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (visible to client)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent"
                  placeholder="Add notes that the client will see..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#005670] text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminJourneyManager;