// AdminJourneyManager.jsx - FIXED Z-INDEX + PDF GENERATION
// ✅ Fixed z-index overlay issue
// ✅ Added PDF generation feature
// ✅ All previous fixes preserved

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Circle, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MessageSquare, Send, Paperclip, Download, X, RefreshCw, AlertCircle,
  FileText, Save, Lock, Edit2, File
} from 'lucide-react';
import { backendServer } from '../utils/info';

const AdminJourneyManager = ({ clientId, clientName, onClose }) => {
  const fileInputRef = useRef(null);
  const stageScrollRef = useRef(null);
  
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  const [editingStep, setEditingStep] = useState(null);
  const [editData, setEditData] = useState({
    status: '',
    deadline: '',
    completeDate: '',
    notes: ''
  });
  
  const [selectedStage, setSelectedStage] = useState(null);
  const [allStages, setAllStages] = useState([]);

  useEffect(() => {
    fetchJourney();
  }, [clientId]);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJourney(data);
        const stages = [...new Set(data.steps.map(s => s.stage))];
        setAllStages(stages);
        const currentStepInProgress = data.steps.find(s => s.status === 'in-progress');
        setSelectedStage(currentStepInProgress ? currentStepInProgress.stage : stages[0]);
      } else if (response.status === 404) {
        setJourney(null);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJourney = async () => {
    try {
      setSaving(true);
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
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (step) => {
    if (step.step > 1) {
      const prev = journey.steps.find(s => s.step === step.step - 1);
      if (prev && prev.status !== 'completed' && prev.status !== 'cancelled') {
        setError(`Complete or cancel Step ${step.step - 1} first!`);
        setTimeout(() => setError(''), 5000);
        return;
      }
    }
    if (step.status === 'completed' || step.status === 'cancelled') {
      setError('This step is locked!');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setEditingStep(step.step);
    setEditData({
      status: step.status,
      deadline: step.deadlineDate ? step.deadlineDate.split('T')[0] : '',
      completeDate: step.completedDate ? step.completedDate.split('T')[0] : '',
      notes: step.notes || ''
    });
  };

  const cancelEditing = () => {
    setEditingStep(null);
    setEditData({ status: '', deadline: '', completeDate: '', notes: '' });
  };

  const handleSaveStep = async (stepNumber) => {
    if (editData.status === 'in-progress' && !editData.deadline) {
      setError('Set deadline for In Progress!');
      setTimeout(() => setError(''), 5000);
      return;
    }

    const scrollContainer = document.querySelector('.journey-scroll-container');
    const currentScrollY = scrollContainer ? scrollContainer.scrollTop : 0;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      let completeDate = editData.completeDate;
      if (editData.status === 'completed' && !completeDate) {
        completeDate = new Date().toISOString().split('T')[0];
      }
      if (editData.status !== 'completed' && editData.status !== 'cancelled') {
        completeDate = '';
      }

      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: editData.status,
            deadlineDate: editData.deadline || null,
            completedDate: completeDate || null,
            notes: editData.notes || '',
            sendEmailNotification: false
          })
        }
      );

      if (response.ok) {
        setJourney(prev => ({
          ...prev,
          steps: prev.steps.map(s =>
            s.step === stepNumber
              ? {
                  ...s,
                  status: editData.status,
                  deadlineDate: editData.deadline || s.deadlineDate,
                  completedDate: completeDate || s.completedDate,
                  notes: editData.notes || s.notes
                }
              : s
          )
        }));

        setSuccess(`Step ${stepNumber} updated!`);
        setEditingStep(null);
        setEditData({ status: '', deadline: '', completeDate: '', notes: '' });

        setTimeout(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop = currentScrollY;
          }
        }, 0);

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // ✅ PDF GENERATION FUNCTION
  const handleGeneratePdf = async (stepNumber) => {
    try {
      setGeneratingPdf(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}/generate-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Step_${stepNumber}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess(`PDF generated for Step ${stepNumber}!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      setError('Failed to generate PDF: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const toggleStepExpanded = async (stepNumber) => {
    const scrollContainer = document.querySelector('.journey-scroll-container');
    const currentScrollY = scrollContainer ? scrollContainer.scrollTop : 0;
    
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
      await loadChat(stepNumber);
    }
    setExpandedSteps(newExpanded);
    
    setTimeout(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = currentScrollY;
      }
    }, 0);
  };

  const loadChat = async (stepNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.messages || [] }));
        setActiveChat(stepNumber);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024;
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (file.size > MAX_SIZE) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      alert(`Files exceed 5MB limit:\n${invalidFiles.join('\n')}`);
    }
    
    if (validFiles.length + selectedFiles.length > 5) {
      alert('Maximum 5 attachments per message');
      return;
    }
    
    const filePromises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            data: e.target.result.split(',')[1]
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(filePromises).then(files => {
      setSelectedFiles(prev => [...prev, ...files]);
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendChatMessage = async (stepNumber) => {
    if (!chatInput.trim() && selectedFiles.length === 0) return;

    try {
      setUploadingFiles(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}/message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            message: chatInput || '(Attachment)',
            attachments: selectedFiles
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.chat.messages }));
        setChatInput('');
        setSelectedFiles([]);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to send message'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setUploadingFiles(false);
    }
  };

  const downloadAttachment = async (stepNumber, messageId, attachmentId, filename) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}/message/${messageId}/attachment/${attachmentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Failed to download attachment');
    }
  };

  const downloadDocument = async (stepNumber, documentIndex, filename) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}/document/${documentIndex}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `document_step_${stepNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const scrollStage = (direction) => {
    if (stageScrollRef.current) {
      const scrollAmount = 200;
      stageScrollRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const canEditStep = (step) => {
    if (step.status === 'completed' || step.status === 'cancelled') return false;
    if (step.step === 1) return true;
    const prev = journey.steps.find(s => s.step === step.step - 1);
    return prev && (prev.status === 'completed' || prev.status === 'cancelled');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-red-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStageProgress = (stage) => {
    const stageSteps = journey.steps.filter(s => s.stage === stage);
    const completed = stageSteps.filter(s => s.status === 'completed').length;
    return {
      completed,
      total: stageSteps.length,
      percentage: stageSteps.length > 0 ? Math.round((completed / stageSteps.length) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#005670]"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center">
        <FileText className="w-24 h-24 text-gray-400 mx-auto mb-8" />
        <h3 className="text-3xl font-bold text-gray-900 mb-6">No Journey Created</h3>
        <p className="text-xl text-gray-600 mb-10">
          Initialize journey tracking for {clientName}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-gray-300 text-gray-800 text-xl rounded-xl hover:bg-gray-400 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateJourney}
            disabled={saving}
            className="px-8 py-4 bg-[#005670] text-white text-xl rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
          >
            {saving ? 'Creating...' : 'Initialize Journey'}
          </button>
        </div>
      </div>
    );
  }

  const completedSteps = journey.steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / journey.steps.length) * 100;
  const selectedStageSteps = journey.steps.filter(s => s.stage === selectedStage);

  return (
    // ✅ FIXED: Lower z-index to prevent covering parent modal
    <div className="flex flex-col h-full relative">
      {/* Header - Sticky but with lower z-index */}
      <div className="bg-white border-b flex-shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Journey Manager</h2>
            <p className="text-gray-600">{clientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchJourney}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-gray-900">Overall Progress</span>
            <span className="font-bold text-[#005670]">
              {completedSteps} / {journey.steps.length} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-[#005670] to-[#007a9a] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-center text-2xl font-bold text-[#005670] mt-2">
            {Math.round(progressPercentage)}%
          </p>
        </div>

        {/* Stage Navigation */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollStage('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div
              ref={stageScrollRef}
              className="flex gap-3 overflow-x-auto hide-scrollbar flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allStages.map((stage, idx) => {
                const progress = getStageProgress(stage);
                const isSelected = selectedStage === stage;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedStage(stage)}
                    className={`
                      flex-shrink-0 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold mb-1">{stage}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs opacity-90">
                          {progress.completed}/{progress.total}
                        </div>
                        <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#005670]'}`}>
                          {progress.percentage}%
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollStage('next')}
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mx-6 my-2 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')}>
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mx-6 my-2 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div
          className="flex-1 overflow-y-auto journey-scroll-container p-6 space-y-4"
          style={{ 
            maxHeight: 'calc(100vh - 230px)'  // ⬅ batas scroll
          }}
        >
        {selectedStageSteps.map(step => {
          const isEditing = editingStep === step.step;
          const isLocked = step.status === 'completed' || step.status === 'cancelled';
          const canEdit = canEditStep(step);
          const isExpanded = expandedSteps.has(step.step);

          return (
            <div
              key={step.step}
              className="bg-white rounded-xl shadow-sm p-4 border relative"
            >
              {/* ✅ FIXED: Overlay with proper z-index (z-20, lower than modal z-50) */}
              {!canEdit && !isLocked && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
                  <div className="bg-white p-6 rounded-xl shadow-2xl border-2 border-orange-400">
                    <p className="text-xl font-bold text-orange-800 flex items-center gap-3">
                      <Lock className="w-6 h-6" />
                      Complete Step {step.step - 1} First
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-lg font-bold">Step {step.step}</span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(
                        step.status
                      )}`}
                    >
                      {step.status.toUpperCase()}
                    </span>
                    {isLocked && (
                      <span className="px-2 py-1 rounded-lg bg-gray-200 text-gray-700 flex items-center gap-1 text-xs">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    )}
                    {/* ✅ Show if step has auto PDF generation */}
                    {step.docAutoGenerated && (
                      <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 flex items-center gap-1 text-xs font-bold">
                        <FileText className="w-3 h-3" />
                        AUTO PDF
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold mb-2">{step.adminDescription}</h3>

                  {/* ✅ SHOW GENERATED DOCUMENTS */}
                  {step.generatedDocuments && step.generatedDocuments.length > 0 && (
                    <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-purple-900 mb-2">Generated Documents:</p>
                      <div className="space-y-1">
                        {step.generatedDocuments.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => downloadDocument(step.step, idx, doc.filename)}
                            className="flex items-center gap-2 text-xs text-purple-700 hover:text-purple-900 hover:underline"
                          >
                            <File className="w-3 h-3" />
                            {doc.filename}
                            <Download className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mt-3">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block font-bold mb-1 text-xs">Status</label>
                          <select
                            value={editData.status}
                            onChange={e =>
                              setEditData({ ...editData, status: e.target.value })
                            }
                            className="w-full px-2 py-1.5 border rounded text-sm"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold mb-1 text-xs">Deadline</label>
                          <input
                            type="date"
                            value={editData.deadline}
                            onChange={e =>
                              setEditData({ ...editData, deadline: e.target.value })
                            }
                            className="w-full px-2 py-1.5 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1 text-xs">Complete Date</label>
                          <input
                            type="date"
                            value={editData.completeDate}
                            onChange={e =>
                              setEditData({ ...editData, completeDate: e.target.value })
                            }
                            disabled={editData.status !== 'completed'}
                            className="w-full px-2 py-1.5 border rounded disabled:bg-gray-100 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block font-bold mb-1 text-xs">Notes</label>
                        <textarea
                          value={editData.notes}
                          onChange={e =>
                            setEditData({ ...editData, notes: e.target.value })
                          }
                          rows="2"
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          type="button"
                          className="px-4 py-1.5 bg-gray-300 rounded-lg font-bold text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveStep(step.step)}
                          disabled={saving}
                          type="button"
                          className="px-4 py-1.5 bg-[#005670] text-white rounded-lg font-bold text-sm flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save All'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {!isLocked && canEdit && (
                        <button
                          onClick={() => startEditing(step)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                      
                      {/* ✅ GENERATE PDF BUTTON */}
                      {step.docAutoGenerated && (
                        <button
                          onClick={() => handleGeneratePdf(step.step)}
                          disabled={generatingPdf}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <FileText className="w-3 h-3" />
                          {generatingPdf ? 'Generating...' : 'Generate PDF'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => toggleStepExpanded(step.step)}
                        className="px-3 py-1.5 bg-gray-200 rounded-lg font-bold text-sm flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Show
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Chat Section - same as before */}
                  {isExpanded && activeChat === step.step && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <h4 className="font-bold mb-2 text-sm">Chat</h4>
                      <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                        {(!chatMessages[step.step] ||
                          chatMessages[step.step].length === 0) ? (
                          <p className="text-center py-3 text-gray-500 text-xs">
                            No messages
                          </p>
                        ) : (
                          chatMessages[step.step].map((msg, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded text-xs ${
                                msg.sender === 'admin'
                                  ? 'bg-blue-100 ml-4'
                                  : 'bg-white mr-4'
                              }`}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-bold text-xs">
                                  {msg.sender === 'admin' ? 'Admin' : 'Client'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.sentAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mb-1">{msg.message}</p>
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {msg.attachments.map((att, attIdx) => (
                                    <button
                                      key={attIdx}
                                      onClick={() =>
                                        downloadAttachment(
                                          step.step,
                                          msg._id,
                                          att._id,
                                          att.filename
                                        )
                                      }
                                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      <Paperclip className="w-3 h-3" />
                                      {att.filename}
                                      <Download className="w-3 h-3" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-blue-50 p-2 rounded text-xs"
                            >
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                {file.filename} ({formatFileSize(file.size)})
                              </span>
                              <button
                                onClick={() => removeSelectedFile(idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          className="flex-grow px-2 py-1.5 border rounded text-sm"
                          placeholder="Type message..."
                          onKeyPress={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendChatMessage(step.step);
                            }
                          }}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          multiple
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 rounded"
                          title="Attach files"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => sendChatMessage(step.step)}
                          disabled={(!chatInput.trim() && selectedFiles.length === 0) || uploadingFiles}
                          className="px-3 py-1.5 bg-[#005670] text-white rounded disabled:opacity-50"
                        >
                          {uploadingFiles ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AdminJourneyManager;