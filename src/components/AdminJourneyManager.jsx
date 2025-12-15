// AdminJourneyManager.jsx - ULTRA COMPACT WITH HORIZONTAL STAGES

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Paperclip,
  Download,
  X,
  RefreshCw,
  AlertCircle,
  FileText,
  Lock,
  Edit2,
  File,
  ClipboardList,
  Home,
  Palette,
  Activity,
  Heart,
  Users,
  DollarSign,
  Image,
  BedDouble,
  Tv,
  Play,
  Pause,
  CheckCheck,
  XCircle,
  Calendar,
  StickyNote,
} from 'lucide-react';
import { backendServer } from '../utils/info';
import InvoiceManagementInline from './InvoiceManagementInline';
import AgreementManagementInline from './AgreementManagementInline';

const AdminJourneyManager = ({ clientId, clientName, onClose, hideHeader = true }) => {
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

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

  const [allStages, setAllStages] = useState([]);
  const [updatingStep, setUpdatingStep] = useState(null);

  // questionnaire state
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [viewingQuestionnaire, setViewingQuestionnaire] = useState(null);

  useEffect(() => {
    fetchJourney();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (activeChat && chatMessages[activeChat]) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChat]);

const fetchJourney = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Fetch journey data
    const response = await fetch(
      `${backendServer}/api/journeys/client/${clientId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setJourney(data); // This sets journey state with clientId.propertyType
      const stages = [...new Set(data.steps.map((s) => s.stage))];
      setAllStages(stages);
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
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

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

  // QUICK STATUS CHANGE - Inline dropdown
  const handleQuickStatusChange = async (step, newStatus) => {
    // Validation
    if (step.step > 1) {
      const prev = journey.steps.find((s) => s.step === step.step - 1);
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

    try {
      setUpdatingStep(step.step);
      const token = localStorage.getItem('token');

      let completeDate = '';
      if (newStatus === 'completed') {
        completeDate = new Date().toISOString().split('T')[0];
      }

      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${step.step}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            completedDate: completeDate || null,
            sendEmailNotification: false,
          }),
        }
      );

      if (response.ok) {
        setJourney((prev) => ({
          ...prev,
          steps: prev.steps.map((s) =>
            s.step === step.step
              ? {
                  ...s,
                  status: newStatus,
                  completedDate: completeDate || s.completedDate,
                }
              : s
          ),
        }));

        setSuccess(`Step ${step.step} updated!`);
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleGeneratePdf = async (stepNumber) => {
    try {
      setGeneratingPdf(true);
      setError('');
      const token = localStorage.getItem('token');

      if ([15, 43, 58, 67].includes(stepNumber)) {
        const response = await fetch(
          `${backendServer}/api/invoices/generate/${clientId}/${stepNumber}?bypassSequentialCheck=true`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bypassSequentialCheck: true })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const invoiceNumber = data.invoice.invoiceNumber;
          
          setSuccess(`Invoice ${invoiceNumber} generated!`);
          
          const invoiceUrl = `${window.location.origin}/invoice/${clientId}/${invoiceNumber}`;
          window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
          
          fetchJourney();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to generate invoice');
        }
      } else {
        const url = `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}/generate-pdf`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Step_${stepNumber}_${Date.now()}.docx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          setSuccess(`Document generated!`);
          fetchJourney();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to generate document');
        }
      }
    } catch (error) {
      setError('Failed to generate: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const toggleStepExpanded = async (stepNumber) => {
    const newExpanded = new Set(expandedSteps);

    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
      setActiveChat(null);
    } else {
      newExpanded.add(stepNumber);
      await loadChat(stepNumber);

      if (stepNumber === 11) {
        await loadQuestionnaire(stepNumber);
      }
    }

    setExpandedSteps(newExpanded);
  };

  const loadChat = async (stepNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => ({
          ...prev,
          [stepNumber]: data.messages || [],
        }));
        setActiveChat(stepNumber);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const loadQuestionnaire = async (stepNumber) => {
    if (stepNumber !== 11) return;

    setLoadingQuestionnaire(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/questionnaires/client/${clientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.questionnaire) {
          setViewingQuestionnaire(data.questionnaire);
        }
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    } finally {
      setLoadingQuestionnaire(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024;

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
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

    const filePromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            data: event.target.result.split(',')[1],
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((files) => {
      setSelectedFiles((prev) => [...prev, ...files]);
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: chatInput || '(Attachment)',
            attachments: selectedFiles,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => ({
          ...prev,
          [stepNumber]: data.chat.messages,
        }));
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const canEditStep = (step) => {
    if (step.status === 'completed' || step.status === 'cancelled') return false;
    if (step.step === 1) return true;
    const prev = journey.steps.find((s) => s.step === step.step - 1);
    return prev && (prev.status === 'completed' || prev.status === 'cancelled');
  };

  const getStageProgress = (stage) => {
    const stageSteps = journey.steps.filter((s) => s.stage === stage);
    const completed = stageSteps.filter((s) => s.status === 'completed').length;
    return {
      completed,
      total: stageSteps.length,
      percentage: stageSteps.length > 0 ? Math.round((completed / stageSteps.length) * 100) : 0,
    };
  };

  const getCurrentStage = () => {
    const inProgress = journey.steps.find((s) => s.status === 'in-progress');
    if (inProgress) return inProgress.stage;
    
    const lastCompleted = [...journey.steps]
      .reverse()
      .find((s) => s.status === 'completed');
    if (lastCompleted) {
      const nextStep = journey.steps.find((s) => s.step === lastCompleted.step + 1);
      return nextStep ? nextStep.stage : lastCompleted.stage;
    }
    
    return journey.steps[0]?.stage;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#005670]" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center">
        <FileText className="w-24 h-24 text-gray-400 mx-auto mb-8" />
        <h3 className="text-3xl font-bold text-gray-900 mb-6">No Journey Created</h3>
        <p className="text-xl text-gray-600 mb-10">Initialize journey tracking for {clientName}</p>
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

  const completedSteps = journey.steps.filter((s) => s.status === 'completed').length;
  const progressPercentage = (completedSteps / journey.steps.length) * 100 || 0;
  const currentStage = getCurrentStage();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Notifications - Floating */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg shadow-lg">
          <div className="flex gap-2 items-center">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium flex-1">{error}</p>
            <button onClick={() => setError('')}>
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg shadow-lg">
          <div className="flex gap-2 items-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Overall Progress Bar - Thin sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700">Journey Progress</span>
                <span className="text-xs font-black text-gray-900">
                  {completedSteps} of {journey.steps.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#005670] to-blue-600 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-black text-[#005670]">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT STEP LIST - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-3">
          {journey.steps.map((step) => {
            const isLocked = step.status === 'completed' || step.status === 'cancelled';
            const canEdit = canEditStep(step);
            const isExpanded = expandedSteps.has(step.step);

            return (
              <CompactStepCard
                key={step.step}
                step={step}
                isLocked={isLocked}
                canEdit={canEdit}
                isExpanded={isExpanded}
                updatingStep={updatingStep}
                onStatusChange={handleQuickStatusChange}
                onGeneratePdf={handleGeneratePdf}
                onToggleExpand={toggleStepExpanded}
                generatingPdf={generatingPdf}
                // Chat
                activeChat={activeChat}
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                selectedFiles={selectedFiles}
                uploadingFiles={uploadingFiles}
                fileInputRef={fileInputRef}
                chatEndRef={chatEndRef}
                onFileSelect={handleFileSelect}
                onRemoveFile={removeSelectedFile}
                onSendMessage={sendChatMessage}
                onDownloadAttachment={downloadAttachment}
                formatFileSize={formatFileSize}
                // Questionnaire
                loadingQuestionnaire={loadingQuestionnaire}
                viewingQuestionnaire={viewingQuestionnaire}
                // Documents
                onDownloadDocument={downloadDocument}
                // Other
                clientId={clientId}
                clientName={clientName}
                fetchJourney={fetchJourney}
                propertyType={journey?.clientId?.propertyType}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== COMPACT STEP CARD ====================

const CompactStepCard = ({
  step,
  isLocked,
  canEdit,
  isExpanded,
  updatingStep,
  onStatusChange,
  onGeneratePdf,
  onToggleExpand,
  generatingPdf,
  activeChat,
  chatMessages,
  chatInput,
  setChatInput,
  selectedFiles,
  uploadingFiles,
  fileInputRef,
  chatEndRef,
  onFileSelect,
  onRemoveFile,
  onSendMessage,
  onDownloadAttachment,
  formatFileSize,
  loadingQuestionnaire,
  viewingQuestionnaire,
  onDownloadDocument,
  clientId,
  clientName,
  fetchJourney,
  propertyType,
}) => {
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState(
    step.deadlineDate ? step.deadlineDate.split('T')[0] : ''
  );
  const [savingDeadline, setSavingDeadline] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'in-progress': return <Play className="w-5 h-5" />;
      case 'pending': return <Pause className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleSaveDeadline = async () => {
    try {
      setSavingDeadline(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${step.step}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deadlineDate: deadlineValue || null,
            sendEmailNotification: false,
          }),
        }
      );

      if (response.ok) {
        await fetchJourney();
        setEditingDeadline(false);
      }
    } catch (error) {
      console.error('Failed to update deadline:', error);
    } finally {
      setSavingDeadline(false);
    }
  };

  // Check if step is disabled
  const isDisabled = !canEdit && !isLocked;

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden ${
      isDisabled ? 'opacity-40 pointer-events-none' : ''
    }`}>
      {/* Mini Header - Always visible */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center ${getStatusColor(step.status)}`}>
            {getStatusIcon(step.status)}
          </div>

          {/* Step Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                STEP {step.step}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-bold text-gray-600">{step.stage}</span>
            </div>
            <h4 className="text-base font-bold text-gray-900 leading-tight">
              {step.adminDescription}
            </h4>
          </div>

          {/* Quick Status Dropdown - INLINE */}
          <div className="flex items-center gap-2">
            {!isLocked && canEdit && (
              <select
                value={step.status}
                onChange={(e) => onStatusChange(step, e.target.value)}
                disabled={updatingStep === step.step}
                className={`px-4 py-2 text-sm font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                  updatingStep === step.step ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:shadow-md'
                } ${getStatusColor(step.status)}`}
              >
                <option value="not-started">Not Started</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Complete</option>
                <option value="cancelled">Cancel</option>
              </select>
            )}

            {/* Locked badge */}
            {isLocked && (
              <div className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-600">LOCKED</span>
              </div>
            )}

            {/* Actions */}
            {step.docAutoGenerated && (
              <button
                onClick={() => onGeneratePdf(step.step)}
                disabled={generatingPdf}
                className="p-2 hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-200"
                title="Generate PDF"
              >
                <FileText className="w-5 h-5 text-purple-600" />
              </button>
            )}

            <button
              onClick={() => onToggleExpand(step.step)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mini metadata row with editable deadline */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 flex-wrap">
          {/* Deadline - editable */}
          <div className="flex items-center gap-2">
            {editingDeadline ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <input
                  type="date"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                  className="px-2 py-1 text-sm border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveDeadline}
                  disabled={savingDeadline}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
                >
                  {savingDeadline ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingDeadline(false);
                    setDeadlineValue(step.deadlineDate ? step.deadlineDate.split('T')[0] : '');
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 font-bold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {step.deadlineDate ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Deadline: {new Date(step.deadlineDate).toLocaleDateString()}</span>
                    {!isLocked && canEdit && (
                      <button
                        onClick={() => setEditingDeadline(true)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                        title="Edit deadline"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  !isLocked && canEdit && (
                    <button
                      onClick={() => setEditingDeadline(true)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Set Deadline
                    </button>
                  )
                )}
              </>
            )}
          </div>

          {step.completedDate && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Done: {new Date(step.completedDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {step.notes && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 flex-1 min-w-0">
              <StickyNote className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate">{step.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="border-t-2 border-gray-100 p-5 bg-gray-50 space-y-4">
          {/* Generated Documents */}
          {step.generatedDocuments?.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Documents:
              </p>
              <div className="space-y-2">
                {step.generatedDocuments.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => onDownloadDocument(step.step, idx, doc.filename)}
                    className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 hover:underline font-medium w-full text-left p-2 hover:bg-purple-50 rounded"
                  >
                    <File className="w-4 h-4" />
                    {doc.filename}
                    <Download className="w-4 h-4 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questionnaire for Step 11 */}
          {step.step === 11 && (
            <>
              {loadingQuestionnaire ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Loading questionnaire...</p>
                </div>
              ) : viewingQuestionnaire ? (
                <QuestionnaireView questionnaire={viewingQuestionnaire} />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-semibold">No questionnaire submitted yet</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Invoice Management for Step 15 */}
          {step.step === 16 && (
            <InvoiceManagementInline
              clientId={clientId}
              clientName={clientName}
              currentStep={step.step}
              onInvoiceGenerated={() => fetchJourney()}
            />
          )}

          {/* Agreement Management for Step 16 */}
          {step.step === 15 && (
            <AgreementManagementInline
              clientId={clientId}
              clientName={clientName}
              currentStep={step.step}
              onAgreementGenerated={() => fetchJourney()}
              propertyType={propertyType} // ADD THIS LINE
            />
          )}

          {/* Chat Section */}
          {activeChat === step.step && (
            <ChatSection
              stepNumber={step.step}
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              selectedFiles={selectedFiles}
              uploadingFiles={uploadingFiles}
              fileInputRef={fileInputRef}
              chatEndRef={chatEndRef}
              onFileSelect={onFileSelect}
              onRemoveFile={onRemoveFile}
              onSendMessage={onSendMessage}
              onDownloadAttachment={onDownloadAttachment}
              formatFileSize={formatFileSize}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ==================== CHAT SECTION (Compact) ====================

const ChatSection = ({
  stepNumber,
  chatMessages,
  chatInput,
  setChatInput,
  selectedFiles,
  uploadingFiles,
  fileInputRef,
  chatEndRef,
  onFileSelect,
  onRemoveFile,
  onSendMessage,
  onDownloadAttachment,
  formatFileSize,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
      <h5 className="font-bold mb-3 text-sm flex items-center gap-2 text-gray-900">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        Conversation
      </h5>

      {/* Messages */}
      <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
        {!chatMessages[stepNumber] || chatMessages[stepNumber].length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-xs">No messages yet</p>
        ) : (
          <>
            {chatMessages[stepNumber].map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-xs ${
                  msg.sender === 'admin'
                    ? 'bg-blue-100 ml-6 border border-blue-200'
                    : 'bg-gray-100 mr-6 border border-gray-200'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-xs">
                    {msg.sender === 'admin' ? '👤 Admin' : '👥 Client'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.sentAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-800">{msg.message}</p>

                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att, attIdx) => (
                      <button
                        key={attIdx}
                        onClick={() =>
                          onDownloadAttachment(stepNumber, msg._id, att._id, att.filename)
                        }
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Paperclip className="w-3 h-3" />
                        {att.filename}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 space-y-1">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
              <span className="text-xs flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {file.filename} ({formatFileSize(file.size)})
              </span>
              <button onClick={() => onRemoveFile(idx)} className="text-red-600 hover:text-red-800">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Type message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage(stepNumber);
            }
          }}
        />

        <input type="file" ref={fileInputRef} onChange={onFileSelect} multiple className="hidden" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSendMessage(stepNumber)}
          disabled={(!chatInput.trim() && selectedFiles.length === 0) || uploadingFiles}
          className="px-4 py-2 bg-[#005670] hover:bg-[#004560] text-white rounded-lg disabled:opacity-50 font-bold text-xs"
        >
          {uploadingFiles ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// ==================== QuestionnaireView (Compact) ====================

const QuestionnaireView = ({ questionnaire }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const inspirationImages = [
    { id: 1, src: '/images/collections/1.jpg' },
    { id: 2, src: '/images/collections/2.jpg' },
    { id: 3, src: '/images/collections/3.jpg' },
    { id: 4, src: '/images/collections/4.jpg' },
    { id: 5, src: '/images/collections/5.jpg' },
    { id: 7, src: '/images/collections/7.jpg' },
    { id: 8, src: '/images/collections/8.jpg' },
    { id: 10, src: '/images/collections/10.jpg' },
    { id: 11, src: '/images/collections/11.jpg' },
    { id: 12, src: '/images/collections/12.jpg' },
    { id: 13, src: '/images/collections/13.jpg' },
    { id: 15, src: '/images/collections/15.jpg' },
    { id: 16, src: '/images/collections/16.jpg' },
    { id: 17, src: '/images/collections/17.jpg' },
    { id: 18, src: '/images/collections/18.jpg' },
    { id: 19, src: '/images/collections/19.jpg' },
    { id: 21, src: '/images/collections/21.jpg' },
    { id: 26, src: '/images/collections/26.jpg' },
    { id: 27, src: '/images/collections/27.jpg' },
    { id: 28, src: '/images/collections/28.jpg' },
  ];

  const likedImagesList = inspirationImages.filter((img) =>
    questionnaire.likedDesigns?.includes(img.id)
  );

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-600 p-3">
        <h5 className="font-bold text-white text-sm flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Questionnaire Results
        </h5>
      </div>

      <div className="border-b border-gray-200 bg-gray-50 p-2">
        <div className="flex gap-1">
          <TabButton icon={Home} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton icon={Palette} label="Design" active={activeTab === 'design'} onClick={() => setActiveTab('design')} />
          <TabButton icon={Activity} label="Functional" active={activeTab === 'functional'} onClick={() => setActiveTab('functional')} />
          <TabButton icon={Heart} label={`Liked (${likedImagesList.length})`} active={activeTab === 'images'} onClick={() => setActiveTab('images')} />
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto text-xs">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <Section icon={Home} title="Home Use">
              <Field label="Primary Use" value={questionnaire.primary_use} />
              <Field label="Occupancy" value={questionnaire.occupancy} isArray />
            </Section>
            <Section icon={Activity} title="Activities">
              <Field label="Activities" value={questionnaire.activities} isArray />
            </Section>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-3">
            <Section icon={Palette} title="Design">
              <Field label="Style" value={questionnaire.design_style} isArray />
              <Field label="Colors" value={questionnaire.color_preference} isArray />
            </Section>
          </div>
        )}

        {activeTab === 'functional' && (
          <div className="space-y-3">
            <Section icon={BedDouble} title="Bedroom">
              <Field label="Bed Size" value={questionnaire.bed_size} />
              <Field label="Guest Bed" value={questionnaire.guest_bed} isArray />
            </Section>
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            {likedImagesList.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {likedImagesList.map((image) => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded border border-indigo-200">
                    <img src={image.src} alt={`Design ${image.id}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400">No designs selected</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
      active ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-white/50'
    }`}
  >
    <Icon className="w-3.5 h-3.5 inline mr-1" />
    {label}
  </button>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-50 rounded p-3 border border-gray-200">
    <h6 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5 text-xs">
      <Icon className="w-3.5 h-3.5 text-indigo-600" />
      {title}
    </h6>
    <div className="space-y-2">{children}</div>
  </div>
);

const Field = ({ label, value, isArray = false }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div className="text-xs">
      <span className="font-bold text-gray-700">{label}:</span>
      {isArray ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((item, idx) => (
            <span key={idx} className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="ml-1 text-gray-600">{value}</span>
      )}
    </div>
  );
};

export default AdminJourneyManager;