// AdminJourneyManager.jsx - Complete Admin Journey Management for 67 Steps
import React, { useState, useEffect, useRef } from 'react';
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
  ChevronUp,
  MessageSquare,
  Send,
  Paperclip,
  Mail,
  Check,
  Download,
  Upload,
  Zap,
  DollarSign,
  Package,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { backendServer } from '../utils/info';

const AdminJourneyManager = ({ clientId, clientName }) => {
  const fileInputRef = useRef(null);
  
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [contractData, setContractData] = useState({});
  const [emailStep, setEmailStep] = useState(null);

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
      } else if (response.status === 404) {
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
        setSuccess('Journey created successfully with 67 steps!');
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

  const handleUpdateStep = async (stepNumber, updates, sendEmail = false) => {
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
          body: JSON.stringify({ 
            ...updates, 
            sendEmailNotification: sendEmail 
          })
        }
      );

      if (response.ok) {
        setSuccess(sendEmail ? 'Step updated and email sent!' : 'Step updated successfully!');
        await fetchJourney();
        setEditingStep(null);
        setShowContractModal(false);
        setShowEmailModal(false);
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
      setActiveChat(null);
    } else {
      newExpanded.add(stepNumber);
      loadChat(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const loadChat = async (stepNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.messages || [] }));
        setActiveChat(stepNumber);
        
        // Mark as read
        await fetch(
          `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}/read`,
          {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  // ✅ FILE UPLOAD HANDLER
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

  // ✅ SEND MESSAGE WITH ATTACHMENTS
  const sendChatMessage = async (stepNumber, message) => {
    if (!message.trim() && selectedFiles.length === 0) return;

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
            message: message || '(Attachment)',
            attachments: selectedFiles
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.chat.messages }));
        setSelectedFiles([]);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to send message'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setUploadingFiles(false);
    }
  };

  // ✅ DOWNLOAD ATTACHMENT
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

  // ✅ DOWNLOAD DOCUMENT
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

  // ✅ TRIGGER CONTRACT GENERATION
  const handleGenerateContract = async (stepNumber, isProposal = false) => {
    const step = journey.steps.find(s => s.step === stepNumber);
    if (!step) return;

    // Show modal for contract data input
    setContractData({
      stepNumber,
      isProposal,
      amount: '',
      downPayment: '',
      proposalAmount: ''
    });
    setShowContractModal(true);
  };

  const submitContractGeneration = async () => {
    const { stepNumber, isProposal, amount, downPayment, proposalAmount } = contractData;
    
    const updates = {
      status: 'in-progress'
    };
    
    if (isProposal) {
      updates.proposalAmount = parseFloat(proposalAmount);
    } else {
      updates.contractAmount = parseFloat(amount);
      updates.downPaymentAmount = parseFloat(downPayment);
    }
    
    await handleUpdateStep(stepNumber, updates, false);
  };

  // ✅ TRIGGER EMAIL SEND
  const handleSendEmail = (step) => {
    setEmailStep(step);
    setShowEmailModal(true);
  };

  const confirmSendEmail = async () => {
    if (!emailStep) return;
    
    await handleUpdateStep(emailStep.step, { status: emailStep.status }, true);
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'pending':
        return <Circle className="w-6 h-6 text-yellow-600" />;
      case 'blocked':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'Portal Activation & Design Setup': 'from-blue-500 to-cyan-600',
      'Design Meetings & Presentations': 'from-purple-500 to-pink-600',
      'Proposal Contract & 50% Funding': 'from-amber-500 to-orange-600',
      'Vendor Order & Production': 'from-green-500 to-emerald-600',
      '25% Progress Payment': 'from-indigo-500 to-blue-600',
      'Final 25% Balance': 'from-red-500 to-rose-600',
      'Delivery Installation & Reveal': 'from-violet-500 to-purple-600'
    };
    return colors[phase] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#005670]"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-xl border-2 border-gray-200">
        <div className="text-center">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            No Journey Created
          </h3>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Initialize journey tracking for {clientName} to enable progress monitoring with 67 steps.
          </p>
          <button
            onClick={handleCreateJourney}
            disabled={saving}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#005670] text-white text-xl rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                <span>Initialize Journey (67 Steps)</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const completedSteps = journey.steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / journey.steps.length) * 100;
  const pendingClientActions = journey.steps.filter(s => 
    s.clientAction && (s.status === 'pending' || s.status === 'in-progress')
  ).length;

  // Group steps by phase
  const stepsByPhase = journey.steps.reduce((acc, step) => {
    if (!acc[step.phase]) acc[step.phase] = [];
    acc[step.phase].push(step);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold mb-2">Journey Management</h2>
            <p className="text-xl text-white/90">Client: {clientName}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-lg font-medium transition-all"
          >
            🔄 Refresh
          </button>
        </div>
        
        {/* PROGRESS */}
        <div className="mt-6">
          <div className="flex justify-between text-lg mb-3">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-2xl">{completedSteps} / {journey.steps.length} steps</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-6">
            <div 
              className="bg-white h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="text-[#005670] font-bold text-sm">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* CLIENT ACTIONS ALERT */}
        {pendingClientActions > 0 && (
          <div className="mt-6 bg-amber-500 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <span className="font-bold">
              ⚠️ {pendingClientActions} step(s) require client action
            </span>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
            <p className="text-lg text-red-800 leading-relaxed flex-grow">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-7 h-7 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl shadow-lg">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0 mt-1" />
            <p className="text-lg text-green-800 leading-relaxed flex-grow">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-7 h-7 text-green-600" />
            </button>
          </div>
        </div>
      )}

      {/* STEPS BY PHASE */}
      <div className="space-y-8">
        {Object.entries(stepsByPhase).map(([phase, steps]) => (
          <div key={phase} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200">
            {/* PHASE HEADER */}
            <div className={`p-6 bg-gradient-to-r ${getPhaseColor(phase)} rounded-t-2xl`}>
              <h3 className="text-2xl font-bold text-white mb-2">{phase}</h3>
              <div className="flex items-center justify-between">
                <p className="text-lg text-white/90">
                  {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
                </p>
                {steps.some(s => s.clientAction && (s.status === 'pending' || s.status === 'in-progress')) && (
                  <span className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm">
                    👤 Client Actions Required
                  </span>
                )}
              </div>
            </div>

            {/* PHASE STEPS */}
            <div className="divide-y-2 divide-gray-200">
              {steps.map((step) => (
                <StepItem
                  key={step.step}
                  step={step}
                  expanded={expandedSteps.has(step.step)}
                  onToggle={() => toggleStepExpanded(step.step)}
                  onUpdate={handleUpdateStep}
                  onComplete={handleCompleteStep}
                  onGenerateContract={handleGenerateContract}
                  onSendEmail={handleSendEmail}
                  saving={saving}
                  getStepIcon={getStepIcon}
                  getStatusColor={getStatusColor}
                  chatMessages={chatMessages[step.step] || []}
                  onSendMessage={sendChatMessage}
                  isActiveChat={activeChat === step.step}
                  editingStep={editingStep}
                  setEditingStep={setEditingStep}
                  formatDate={formatDate}
                  formatFileSize={formatFileSize}
                  downloadAttachment={downloadAttachment}
                  downloadDocument={downloadDocument}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  handleFileSelect={handleFileSelect}
                  removeSelectedFile={removeSelectedFile}
                  uploadingFiles={uploadingFiles}
                  fileInputRef={fileInputRef}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ CONTRACT GENERATION MODAL */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Generate {contractData.isProposal ? 'Production Proposal' : 'Design Contract'}
            </h3>
            
            {contractData.isProposal ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Total Proposal Amount ($)
                  </label>
                  <input
                    type="number"
                    value={contractData.proposalAmount}
                    onChange={(e) => setContractData({...contractData, proposalAmount: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]"
                    placeholder="e.g., 100000"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Payment: 50% now, 25% progress, 25% final
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Total Contract Amount ($)
                  </label>
                  <input
                    type="number"
                    value={contractData.amount}
                    onChange={(e) => setContractData({...contractData, amount: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]"
                    placeholder="e.g., 50000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Down Payment ($)
                  </label>
                  <input
                    type="number"
                    value={contractData.downPayment}
                    onChange={(e) => setContractData({...contractData, downPayment: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]"
                    placeholder="e.g., 15000"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={submitContractGeneration}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-[#005670] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-bold"
              >
                {saving ? 'Generating...' : '🤖 Generate PDF'}
              </button>
              <button
                onClick={() => setShowContractModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ EMAIL CONFIRMATION MODAL */}
      {showEmailModal && emailStep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              📧 Send Email Notification
            </h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-300">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Step {emailStep.step}:</strong> {emailStep.title}
              </p>
              <p className="text-sm text-gray-600">
                Template: <span className="font-bold text-blue-700">{emailStep.emailTemplate || 'Default'}</span>
              </p>
            </div>
            
            <p className="text-sm text-gray-700 mb-6">
              This will send an email notification to <strong>{clientName}</strong> about this step update.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={confirmSendEmail}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-bold"
              >
                {saving ? 'Sending...' : '✉️ Send Email'}
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// STEP ITEM COMPONENT
// ==========================================
const StepItem = ({ 
  step, 
  expanded, 
  onToggle, 
  onUpdate, 
  onComplete,
  onGenerateContract,
  onSendEmail,
  saving,
  getStepIcon,
  getStatusColor,
  chatMessages,
  onSendMessage,
  isActiveChat,
  editingStep,
  setEditingStep,
  formatDate,
  formatFileSize,
  downloadAttachment,
  downloadDocument,
  selectedFiles,
  handleFileSelect,
  removeSelectedFile,
  uploadingFiles,
  fileInputRef
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [formData, setFormData] = useState({
    status: step.status,
    estimatedDate: step.estimatedDate ? step.estimatedDate.split('T')[0] : '',
    notes: step.notes || ''
  });

  const isEditing = editingStep === step.step;
  const unreadCount = chatMessages.filter(m => !m.read && m.sender === 'client').length;
  const hasDocuments = step.generatedDocuments && step.generatedDocuments.length > 0;

  const handleSave = (sendEmail) => {
    onUpdate(step.step, formData, sendEmail);
  };

  const handleSendChat = () => {
    if (chatMessage.trim() || selectedFiles.length > 0) {
      onSendMessage(step.step, chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      {/* STEP HEADER */}
      <div 
        className="flex items-center gap-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-shrink-0">
          {getStepIcon(step.status)}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xl font-bold text-gray-900">
              Step {step.step}
            </span>
            <span className={`px-4 py-1 rounded-xl text-sm font-bold border-2 ${getStatusColor(step.status)}`}>
              {step.status.replace('-', ' ').toUpperCase()}
            </span>
            
            {/* AUTOMATION BADGES */}
            {step.autoGenerate && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                🤖 Auto-Generate
              </span>
            )}
            {step.email && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                📧 Email
              </span>
            )}
            {step.clientAction && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                👤 Client Action
              </span>
            )}
            {step.autoTrigger && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                ⚡ Auto-Trigger
              </span>
            )}
            
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
                {unreadCount} new
              </span>
            )}
            
            {hasDocuments && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                📄 {step.generatedDocuments.length} doc(s)
              </span>
            )}
          </div>
          
          <h4 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h4>
          <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
          
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-semibold">Action by:</span> {step.actionBy}
          </div>
        </div>

        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-7 h-7 text-gray-600" />
          ) : (
            <ChevronDown className="w-7 h-7 text-gray-600" />
          )}
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div className="mt-6 pl-16 space-y-6">
          
          {/* ✅ QUICK ACTION BUTTONS */}
          <div className="flex gap-3 flex-wrap pb-6 border-b-2 border-gray-200">
            {/* Edit Button */}
            <button
              onClick={() => setEditingStep(isEditing ? null : step.step)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 font-bold text-sm"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Cancel Edit' : 'Edit Step'}
            </button>
            
            {/* Generate Contract Button (Steps 9 & 36) */}
            {(step.step === 9 || step.step === 36) && (
              <button
                onClick={() => onGenerateContract(step.step, step.step === 36)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 font-bold text-sm"
              >
                <Zap className="w-4 h-4" />
                Generate {step.step === 9 ? 'Contract' : 'Proposal'}
              </button>
            )}
            
            {/* Send Email Button */}
            {step.email && (
              <button
                onClick={() => onSendEmail(step)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-bold text-sm"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            )}
            
            {/* Complete Button */}
            {step.status !== 'completed' && (
              <button
                onClick={() => onComplete(step.step, formData.notes)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-bold text-sm"
              >
                <Check className="w-4 h-4" />
                Mark Complete
              </button>
            )}
          </div>

          {/* ✅ EDIT MODE */}
          {isEditing && (
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-300 space-y-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Step Details
              </h4>
              
              <div>
                <label className="block text-base font-bold text-gray-900 mb-3">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]"
                >
                  <option value="not-started">Not Started</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-3">Estimated Date</label>
                <input
                  type="date"
                  value={formData.estimatedDate}
                  onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-3">Notes for Client</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670]"
                  placeholder="Add notes that the client will see..."
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#005670] text-white text-base rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>

                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !step.email}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white text-base rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
                >
                  <Mail className="w-5 h-5" />
                  Save & Email
                </button>
              </div>
            </div>
          )}

          {/* ✅ GENERATED DOCUMENTS */}
          {hasDocuments && (
            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-300">
              <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Documents
              </h5>
              <div className="space-y-3">
                {step.generatedDocuments.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => downloadDocument(step.step, idx, doc.filename)}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border-2 border-green-200"
                  >
                    <FileText className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="flex-grow text-left">
                      <p className="font-bold text-gray-900">{doc.filename}</p>
                      <p className="text-sm text-gray-600">
                        {doc.type === 'contract' ? 'Contract' : doc.type === 'proposal' ? 'Proposal' : 'Document'} • 
                        Generated {formatDate(doc.generatedAt)}
                      </p>
                    </div>
                    <Download className="w-6 h-6 text-green-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE */}
          {(step.estimatedDate || step.actualDate) && (
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </h5>
              <div className="space-y-3">
                {step.estimatedDate && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Estimated Date:</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(step.estimatedDate)}</p>
                  </div>
                )}
                {step.actualDate && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Completed On:</p>
                    <p className="text-lg font-bold text-green-700">{formatDate(step.actualDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTES */}
          {step.notes && !isEditing && (
            <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
              <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes for Client
              </h5>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                {step.notes}
              </p>
            </div>
          )}

          {/* ✅ CHAT WITH ATTACHMENTS */}
          {isActiveChat && (
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                Communication Thread
              </h4>

              {/* MESSAGES */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <p className="text-base text-gray-500 text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl ${
                        msg.sender === 'admin'
                          ? 'bg-blue-100 border-2 border-blue-300 ml-8'
                          : 'bg-white border-2 border-gray-300 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base">
                          {msg.sender === 'admin' ? '👤 Admin' : '👨‍💼 Client'}: {msg.senderName}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(msg.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      
                      {/* ATTACHMENTS */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((att, attIdx) => (
                            <button
                              key={attIdx}
                              onClick={() => downloadAttachment(step.step, msg._id, att._id, att.filename)}
                              className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100 border border-gray-300"
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="flex-grow text-left truncate">{att.filename}</span>
                              <span className="text-gray-500">{formatFileSize(att.size)}</span>
                              <Download className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* SELECTED FILES PREVIEW */}
              {selectedFiles.length > 0 && (
                <div className="mb-4 space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-300">
                  <p className="text-sm font-bold text-blue-900 mb-2">
                    Selected Files ({selectedFiles.length}/5)
                  </p>
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="flex-grow text-sm truncate">{file.filename}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => removeSelectedFile(idx)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* SEND MESSAGE */}
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles || selectedFiles.length >= 5}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-xl transition-all flex items-center gap-2 font-bold"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message to the client..."
                  rows="3"
                  disabled={uploadingFiles}
                  className="flex-grow px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670] disabled:opacity-50"
                />
                
                <button
                  onClick={handleSendChat}
                  disabled={(!chatMessage.trim() && selectedFiles.length === 0) || uploadingFiles}
                  className="px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {uploadingFiles ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span className="text-base font-bold">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="text-base font-bold">Send</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Max 5 files, 5MB each • All file types supported
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminJourneyManager;