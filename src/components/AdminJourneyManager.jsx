// AdminJourneyManager.jsx - REDESIGNED UI

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  Paperclip,
  Download,
  X,
  RefreshCw,
  AlertCircle,
  FileText,
  Save,
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
  Sparkles,
} from 'lucide-react';
import { backendServer } from '../utils/info';
import InvoiceManagement from './InvoiceManagement';
import InvoiceManagementInline from './InvoiceManagementInline';
import AgreementManagementInline from './AgreementManagementInline';

const AdminJourneyManager = ({ clientId, clientName, onClose, hideHeader = true }) => {
  const fileInputRef = useRef(null);
  const stageScrollRef = useRef(null);
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

  const [editingStep, setEditingStep] = useState(null);
  const [editData, setEditData] = useState({
    status: '',
    deadline: '',
    completeDate: '',
    notes: '',
  });

  const [selectedStage, setSelectedStage] = useState(null);
  const [allStages, setAllStages] = useState([]);

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
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJourney(data);
        const stages = [...new Set(data.steps.map((s) => s.stage))];
        setAllStages(stages);
        const currentStepInProgress = data.steps.find(
          (s) => s.status === 'in-progress'
        );
        setSelectedStage(
          currentStepInProgress ? currentStepInProgress.stage : stages[0]
        );
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

  const startEditing = (step) => {
    if (step.step > 1) {
      const prev = journey.steps.find((s) => s.step === step.step - 1);
      if (
        prev &&
        prev.status !== 'completed' &&
        prev.status !== 'cancelled'
      ) {
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
      notes: step.notes || '',
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
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: editData.status,
            deadlineDate: editData.deadline || null,
            completedDate: completeDate || null,
            notes: editData.notes || '',
            sendEmailNotification: false,
          }),
        }
      );

      if (response.ok) {
        setJourney((prev) => ({
          ...prev,
          steps: prev.steps.map((s) =>
            s.step === stepNumber
              ? {
                  ...s,
                  status: editData.status,
                  deadlineDate: editData.deadline || s.deadlineDate,
                  completedDate: completeDate || s.completedDate,
                  notes: editData.notes || s.notes,
                }
              : s
          ),
        }));

        setSuccess(`Step ${stepNumber} updated!`);
        setEditingStep(null);
        setEditData({ status: '', deadline: '', completeDate: '', notes: '' });

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

// AdminJourneyManager.jsx - UPDATE handleGeneratePdf function

// REPLACE your existing handleGeneratePdf with this:

const handleGeneratePdf = async (stepNumber) => {
  try {
    setGeneratingPdf(true);
    setError('');
    const token = localStorage.getItem('token');

    // For invoice steps (15, 43, 58, 67), generate invoice and open in new tab
    if ([15, 43, 58, 67].includes(stepNumber)) {
      // Generate invoice (saves to DB)
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
        
        setSuccess(`Invoice ${invoiceNumber} generated! Opening in new tab...`);
        
        // Open invoice HTML in new tab
        const invoiceUrl = `${window.location.origin}/invoice/${clientId}/${invoiceNumber}`;
        window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
        
        fetchJourney(); // Refresh to show generated document
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate invoice');
      }
    } else {
      // For other steps, download DOCX as before
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

        setSuccess(`Document generated for Step ${stepNumber}!`);
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

  const downloadAttachment = async (
    stepNumber,
    messageId,
    attachmentId,
    filename
  ) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}/message/${messageId}/attachment/${attachmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
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
        behavior: 'smooth',
      });
    }
  };

  const canEditStep = (step) => {
    if (step.status === 'completed' || step.status === 'cancelled') return false;
    if (step.step === 1) return true;
    const prev = journey.steps.find((s) => s.step === step.step - 1);
    return prev && (prev.status === 'completed' || prev.status === 'cancelled');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'in-progress':
        return <Play className="w-6 h-6 text-blue-500" />;
      case 'pending':
        return <Pause className="w-6 h-6 text-amber-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-amber-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStageProgress = (stage) => {
    const stageSteps = journey.steps.filter((s) => s.stage === stage);
    const completed = stageSteps.filter((s) => s.status === 'completed').length;
    return {
      completed,
      total: stageSteps.length,
      percentage:
        stageSteps.length > 0
          ? Math.round((completed / stageSteps.length) * 100)
          : 0,
    };
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
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          No Journey Created
        </h3>
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

  const completedSteps = journey.steps.filter(
    (s) => s.status === 'completed'
  ).length;
  const progressPercentage =
    (completedSteps / journey.steps.length) * 100 || 0;
  const selectedStageSteps = journey.steps.filter(
    (s) => s.stage === selectedStage
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* COMPACT HEADER */}
      {!hideHeader && (
        <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10 shadow-sm">
          {/* Overall Progress Bar */}
          <div className="px-6 py-3 bg-gradient-to-r from-[#005670] via-blue-600 to-cyan-500">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-white/90">
                    Overall Progress
                  </span>
                  <span className="text-xs font-black text-white">
                    {completedSteps} of {journey.steps.length} Steps
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-3 items-center">

                
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-black text-white drop-shadow-lg">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-[10px] text-white/80 font-medium">Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Navigation */}
          <div className="px-6 py-2.5 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollStage('prev')}
                className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={stageScrollRef}
                className="flex gap-2 overflow-x-auto hide-scrollbar flex-1"
              >
                {allStages.map((stage, idx) => {
                  const progress = getStageProgress(stage);
                  const isSelected = selectedStage === stage;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedStage(stage)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                        }`}
                    >
                      <div className="text-left">
                        <div className="font-black mb-0.5">{stage}</div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span>
                            {progress.completed}/{progress.total}
                          </span>
                          <span className="font-black">
                            {progress.percentage}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollStage('next')}
                className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="mx-6 my-2 bg-red-50 border-l-4 border-red-500 p-2.5 rounded-r-lg">
              <div className="flex gap-2 items-center">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-xs font-medium flex-1">{error}</p>
                <button onClick={() => setError('')}>
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mx-6 my-2 bg-green-50 border-l-4 border-green-500 p-2.5 rounded-r-lg">
              <div className="flex gap-2 items-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-800 text-xs font-medium">{success}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* When header is hidden, show compact progress + stages */}
      {hideHeader && (
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          {/* Compact Progress */}
          <div className="px-4 py-2 bg-gradient-to-r from-[#005670] via-blue-600 to-cyan-500">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-white h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-xl font-black text-white">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>

          {/* Compact Stage Navigation */}
          <div className="px-4 py-2 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollStage('prev')}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={stageScrollRef}
                className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1"
              >
                {allStages.map((stage, idx) => {
                  const progress = getStageProgress(stage);
                  const isSelected = selectedStage === stage;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedStage(stage)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {stage} • {progress.percentage}%
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollStage('next')}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Compact Notifications */}
          {error && (
            <div className="mx-4 mb-2 bg-red-50 border-l-4 border-red-500 p-2 rounded-r-lg">
              <div className="flex gap-2 items-center">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-xs flex-1">{error}</p>
                <button onClick={() => setError('')}>
                  <X className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mx-4 mb-2 bg-green-50 border-l-4 border-green-500 p-2 rounded-r-lg">
              <div className="flex gap-2 items-center">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <p className="text-green-800 text-xs">{success}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-3 pb-10">
          {selectedStageSteps.map((step) => {
            const isEditing = editingStep === step.step;
            const isLocked =
              step.status === 'completed' || step.status === 'cancelled';
            const canEdit = canEditStep(step);
            const isExpanded = expandedSteps.has(step.step);

            return (
              <div
                key={step.step}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all relative overflow-hidden
                  ${isEditing ? 'ring-4 ring-blue-300' : ''}
                  ${!canEdit && !isLocked ? 'opacity-60' : ''}`}
              >
                {/* Overlay for locked steps */}
                {!canEdit && !isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-amber-400 animate-pulse">
                      <p className="text-lg font-black text-amber-800 flex items-center gap-3 mb-3">
                        <Lock className="w-6 h-6" />
                        Complete Step {step.step - 1} First
                      </p>
                      
                      {/* Special: Invoice generation bypass for steps 15, 43, 58, 67 */}
                      {[15, 43, 58, 67].includes(step.step) && step.docAutoGenerated && (
                        <div className="mt-4 pt-4 border-t border-amber-300">
                          <p className="text-sm text-amber-700 mb-2 font-semibold">Generate invoice without completing steps:</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGeneratePdf(step.step);
                            }}
                            disabled={generatingPdf}
                            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                          >
                            <FileText className="w-4 h-4" />
                            {generatingPdf ? 'Generating...' : `Generate Invoice (Step ${step.step})`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Color Bar */}
                <div className={`h-2 ${getStatusColor(step.status)}`} />

                <div className="p-6">
                  <div className="flex gap-5">
                    {/* Left: Icon & Step Number */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        {getStatusIcon(step.status)}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-0.5 shadow-md">
                          <span className="text-xs font-black text-gray-700">
                            #{step.step}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-grow min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-gray-900 mb-2">
                            {step.adminDescription}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {/* Status Badge */}
                            <StatusBadge status={step.status} />

                            {isLocked && (
                              <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 flex items-center gap-1.5 text-sm font-bold">
                                <Lock className="w-4 h-4" />
                                LOCKED
                              </span>
                            )}

                            {step.docAutoGenerated && (
                              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1.5 text-sm font-bold">
                                <FileText className="w-4 h-4" />
                                AUTO PDF
                              </span>
                            )}

                            {/* Deadline */}
                            {step.deadlineDate && (
                              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1.5 text-sm font-semibold">
                                <Calendar className="w-4 h-4" />
                                {new Date(step.deadlineDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes Display */}
                      {step.notes && !isEditing && (
                        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                          <div className="flex items-start gap-2">
                            <StickyNote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-amber-900 mb-1">Notes:</p>
                              <p className="text-sm text-amber-800">{step.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generated Documents */}
                      {step.generatedDocuments?.length > 0 && (
                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <p className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Generated Documents:
                          </p>
                          <div className="space-y-2">
                            {step.generatedDocuments.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  downloadDocument(step.step, idx, doc.filename)
                                }
                                className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 hover:underline font-medium"
                              >
                                <File className="w-4 h-4" />
                                {doc.filename}
                                <Download className="w-4 h-4 ml-auto" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* EDIT MODE */}
                      {isEditing ? (
                        <EditStepForm
                          editData={editData}
                          setEditData={setEditData}
                          saving={saving}
                          onSave={() => handleSaveStep(step.step)}
                          onCancel={cancelEditing}
                        />
                      ) : (
                        // VIEW MODE - Action Buttons
                        <div className="flex gap-2 flex-wrap">
                          {!isLocked && canEdit && (
                            <ActionButton
                              icon={Edit2}
                              label="Edit Status"
                              color="blue"
                              onClick={() => startEditing(step)}
                            />
                          )}

                          {step.docAutoGenerated && (
                            <ActionButton
                              icon={FileText}
                              label={generatingPdf ? 'Generating...' : 'Generate PDF'}
                              color="purple"
                              onClick={() => handleGeneratePdf(step.step)}
                              disabled={generatingPdf}
                            />
                          )}

                          <ActionButton
                            icon={isExpanded ? ChevronUp : ChevronDown}
                            label={isExpanded ? 'Hide Details' : 'Show Details'}
                            color="gray"
                            onClick={() => toggleStepExpanded(step.step)}
                          />
                        </div>
                      )}

                      {/* EXPANDED CONTENT */}
                      {isExpanded && (
                        <div className="mt-6 space-y-4">
                          {/* Questionnaire for Step 11 */}
                          {step.step === 11 && (
                            <>
                              {loadingQuestionnaire ? (
                                <div className="bg-gray-50 rounded-xl p-8 text-center">
                                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                                  <p className="text-gray-600 font-medium">
                                    Loading questionnaire...
                                  </p>
                                </div>
                              ) : viewingQuestionnaire ? (
                                <QuestionnaireView
                                  questionnaire={viewingQuestionnaire}
                                />
                              ) : (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                                  <div className="flex items-center gap-3 text-amber-800">
                                    <AlertCircle className="w-6 h-6" />
                                    <p className="font-semibold">
                                      No questionnaire submitted yet
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Invoice Management for Step 2 */}
                          {step.step === 15 && (
                            <InvoiceManagementInline
                              clientId={clientId}
                              clientName={clientName}
                              currentStep={step.step}
                              onInvoiceGenerated={() => fetchJourney()}
                            />
                          )}

                          {step.step === 16 && (
                            <AgreementManagementInline
                              clientId={clientId}
                              clientName={clientName}
                              currentStep={step.step}
                              onAgreementGenerated={() => fetchJourney()}
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
                              onFileSelect={handleFileSelect}
                              onRemoveFile={removeSelectedFile}
                              onSendMessage={sendChatMessage}
                              onDownloadAttachment={downloadAttachment}
                              formatFileSize={formatFileSize}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

// ==================== CHILD COMPONENTS ====================

const StatusBadge = ({ status }) => {
  const configs = {
    completed: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: CheckCheck,
      label: 'Completed',
    },
    'in-progress': {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: Play,
      label: 'In Progress',
    },
    pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: Pause,
      label: 'Pending',
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: XCircle,
      label: 'Cancelled',
    },
    'not-started': {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: Circle,
      label: 'Not Started',
    },
  };

  const config = configs[status] || configs['not-started'];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${config.bg} ${config.text}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};

const ActionButton = ({ icon: Icon, label, color, onClick, disabled }) => {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    gray: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

const EditStepForm = ({ editData, setEditData, saving, onSave, onCancel }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6 mt-4">
      <h4 className="font-black text-gray-900 mb-4 text-lg flex items-center gap-2">
        <Edit2 className="w-5 h-5 text-blue-600" />
        Edit Step Status
      </h4>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-bold mb-2 text-sm text-gray-700">
            Status *
          </label>
          <select
            value={editData.status}
            onChange={(e) =>
              setEditData({ ...editData, status: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="not-started">Not Started</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block font-bold mb-2 text-sm text-gray-700">
            Deadline
          </label>
          <input
            type="date"
            value={editData.deadline}
            onChange={(e) =>
              setEditData({ ...editData, deadline: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-bold mb-2 text-sm text-gray-700">
            Completion Date
          </label>
          <input
            type="date"
            value={editData.completeDate}
            onChange={(e) =>
              setEditData({ ...editData, completeDate: e.target.value })
            }
            disabled={editData.status !== 'completed'}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-medium disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-bold mb-2 text-sm text-gray-700">
          Notes
        </label>
        <textarea
          value={editData.notes}
          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
          rows="3"
          placeholder="Add notes about this step..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          type="button"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-800 transition-all"
        >
          Cancel
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          type="button"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

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
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 border-2 border-gray-200">
      <h4 className="font-black mb-4 text-lg flex items-center gap-2 text-gray-900">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Conversation
      </h4>

      {/* Messages */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {!chatMessages[stepNumber] || chatMessages[stepNumber].length === 0 ? (
          <p className="text-center py-8 text-gray-500 font-medium">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <>
            {chatMessages[stepNumber].map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  msg.sender === 'admin'
                    ? 'bg-blue-100 ml-8 border-2 border-blue-200'
                    : 'bg-white mr-8 border-2 border-gray-200'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-sm flex items-center gap-2">
                    {msg.sender === 'admin' ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                          A
                        </div>
                        Admin
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-black">
                          C
                        </div>
                        Client
                      </>
                    )}
                  </span>

                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(msg.sentAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="mb-2 whitespace-pre-wrap text-gray-800">
                  {msg.message}
                </p>

                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((att, attIdx) => (
                      <button
                        key={attIdx}
                        onClick={() =>
                          onDownloadAttachment(
                            stepNumber,
                            msg._id,
                            att._id,
                            att.filename
                          )
                        }
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        {att.filename}
                        <Download className="w-4 h-4 ml-auto" />
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

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Paperclip className="w-4 h-4 text-blue-600" />
                {file.filename} ({formatFileSize(file.size)})
              </span>

              <button
                onClick={() => onRemoveFile(idx)}
                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type your message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage(stepNumber);
            }
          }}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSendMessage(stepNumber)}
          disabled={
            (!chatInput.trim() && selectedFiles.length === 0) || uploadingFiles
          }
          className="px-5 py-3 bg-gradient-to-r from-[#005670] to-[#007a9a] hover:from-[#004560] hover:to-[#006080] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-md hover:shadow-lg"
        >
          {uploadingFiles ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

// ==================== QuestionnaireView (unchanged) ====================

const QuestionnaireView = ({ questionnaire }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const inspirationImages = [
    { id: 1, src: '/images/collections/1.jpg' },
    { id: 2, src: '/images/collections/2.jpg' },
    { id: 3, src: '/images/collections/3.jpg' },
    { id: 4, src: '/images/collections/4.jpg' },
    { id: 7, src: '/images/collections/7.jpg' },
    { id: 8, src: '/images/collections/8.jpg' },
    { id: 10, src: '/images/collections/10.jpg' },
    { id: 11, src: '/images/collections/11.jpg' },
    { id: 12, src: '/images/collections/12.jpg' },
    { id: 13, src: '/images/collections/13.jpg' },
    { id: 15, src: '/images/collections/15.jpg' },
    { id: 16, src: '/images/collections/16.jpg' },
  ];

  const likedImagesList = inspirationImages.filter((img) =>
    questionnaire.likedDesigns?.includes(img.id)
  );

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-black text-white flex items-center gap-3 text-xl">
              <ClipboardList className="w-6 h-6" />
              Client Questionnaire Results
            </h4>
            <p className="text-white/90 text-sm mt-2 font-medium">
              Submitted: {new Date(questionnaire.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <span className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-black">
            {questionnaire.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-gray-200 bg-gray-50">
        <div className="flex gap-2 p-3">
          <TabButton
            icon={Home}
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            icon={Palette}
            label="Design"
            active={activeTab === 'design'}
            onClick={() => setActiveTab('design')}
          />
          <TabButton
            icon={Activity}
            label="Functional"
            active={activeTab === 'functional'}
            onClick={() => setActiveTab('functional')}
          />
          <TabButton
            icon={Heart}
            label={`Liked (${likedImagesList.length})`}
            active={activeTab === 'images'}
            onClick={() => setActiveTab('images')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <Section icon={Home} title="Home Use & Lifestyle">
              <Field label="Primary Use" value={questionnaire.primary_use} />
              <Field label="Occupancy" value={questionnaire.occupancy} isArray />
              <Field label="Lifestyle" value={questionnaire.lifestyle} isArray />
            </Section>

            <Section icon={Users} title="Entertaining">
              <Field label="Frequency" value={questionnaire.entertaining} />
              <Field
                label="Style"
                value={questionnaire.entertaining_style}
                isArray
              />
            </Section>

            <Section icon={Activity} title="Activities in Hawaii">
              <Field
                label="Important Activities"
                value={questionnaire.activities}
                isArray
              />
            </Section>

            <Section icon={DollarSign} title="Budget & Timeline">
              <Field
                label="Collection Interest"
                value={questionnaire.collection_interest}
              />
              <Field label="Move-in Timeline" value={questionnaire.move_in} />
              <Field
                label="Must Haves"
                value={questionnaire.must_haves}
                isLongText
              />
              <Field
                label="Special Requests"
                value={questionnaire.special_requests}
                isLongText
              />
            </Section>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-5">
            <Section icon={Palette} title="Design Style">
              <Field
                label="Preferred Styles"
                value={questionnaire.design_style}
                isArray
              />
              <Field
                label="Color Palette"
                value={questionnaire.color_preference}
                isArray
              />
              <Field
                label="Atmosphere"
                value={questionnaire.atmosphere}
                isArray
              />
            </Section>

            <Section icon={Image} title="Additional Preferences">
              <Field label="Artwork" value={questionnaire.artwork} />
              <Field
                label="Window Treatment"
                value={questionnaire.window_treatment}
                isArray
              />
            </Section>
          </div>
        )}

        {activeTab === 'functional' && (
          <div className="space-y-5">
            <Section icon={BedDouble} title="Bedroom Preferences">
              <Field
                label="Bedroom Use"
                value={questionnaire.bedroom_use}
                isLongText
              />
              <Field label="Master Bed Size" value={questionnaire.bed_size} />
              <Field
                label="Guest Bed Configuration"
                value={questionnaire.guest_bed}
                isArray
              />
            </Section>

            <Section icon={Tv} title="Entertainment & Workspace">
              <Field
                label="TV Placement"
                value={questionnaire.tv_preference}
                isArray
              />
              <Field
                label="Work from Home"
                value={questionnaire.work_from_home}
              />
            </Section>

            <Section icon={Activity} title="Dining & Lifestyle">
              <Field label="Dining Preferences" value={questionnaire.dining} isArray />
              <Field label="Pets" value={questionnaire.pets} />
              {questionnaire.pets === 'Yes' && (
                <Field
                  label="Pet Details"
                  value={questionnaire.pet_details}
                  isLongText
                />
              )}
            </Section>
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            {likedImagesList.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {likedImagesList.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-indigo-200 shadow-md hover:shadow-xl transition-all"
                  >
                    <img
                      src={image.src}
                      alt={`Design ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-5 h-5 fill-white text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No designs selected</p>
              </div>
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
    className={`px-5 py-3 rounded-xl font-bold transition-all ${
      active
        ? 'bg-white text-indigo-600 shadow-md scale-105'
        : 'text-gray-600 hover:bg-white/50'
    }`}
  >
    <Icon className="w-5 h-5 inline mr-2" />
    {label}
  </button>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200">
    <h5 className="font-black text-gray-900 mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5 text-indigo-600" />
      {title}
    </h5>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value, isArray = false, isLongText = false }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <div className="text-sm">
      <span className="font-bold text-gray-700">{label}:</span>
      {isArray ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold"
            >
              {item}
            </span>
          ))}
        </div>
      ) : isLongText ? (
        <p className="mt-2 text-gray-600 whitespace-pre-wrap font-medium">
          {value}
        </p>
      ) : (
        <span className="ml-2 text-gray-600 font-medium">{value}</span>
      )}
    </div>
  );
};

export default AdminJourneyManager;