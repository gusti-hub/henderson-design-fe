// AdminJourneyManager.jsx - FIXED SCROLL ISSUE

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
} from 'lucide-react';
import { backendServer } from '../utils/info';

const AdminJourneyManager = ({ clientId, clientName, onClose }) => {
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

  // questionnaire state (digunakan di step 11)
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

  const handleGeneratePdf = async (stepNumber) => {
    try {
      setGeneratingPdf(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}/generate-pdf`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

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
    if (stepNumber !== 11) return; // Only for step 11
    
    setLoadingQuestionnaire(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/questionnaires/client/${clientId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
                console.log(data.questionnaire);
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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* COMPACT HEADER */}
      <div className="bg-white border-b flex-shrink-0 sticky top-0 z-10 shadow-sm">
        {/* Title Bar */}
        <div className="px-6 py-3 flex justify-between items-center border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Journey Manager</h2>
            <p className="text-sm text-gray-600">{clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchJourney}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compact Progress */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-gray-900">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-[#005670]">
                  {completedSteps} / {journey.steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#005670] to-[#007a9a] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#005670]">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Stage Navigation */}
        <div className="px-6 py-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollStage('prev')}
              className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
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
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#005670] to-[#007a9a] text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div className="text-left">
                      <div className="font-bold mb-0.5">{stage}</div>
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <span>
                          {progress.completed}/{progress.total}
                        </span>
                        <span className="font-bold">
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
              className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mx-6 my-2 bg-red-50 border-l-4 border-red-500 p-2 rounded-r-lg">
            <div className="flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')}>
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mx-6 my-2 bg-green-50 border-l-4 border-green-500 p-2 rounded-r-lg">
            <div className="flex gap-2 items-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )}
      </div>

      {/* SCROLLABLE CONTENT - FIXED: Added proper overflow handling */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3 pb-20">
          {selectedStageSteps.map((step) => {
            const isEditing = editingStep === step.step;
            const isLocked =
              step.status === 'completed' || step.status === 'cancelled';
            const canEdit = canEditStep(step);
            const isExpanded = expandedSteps.has(step.step);

            return (
              <div
                key={step.step}
                className="bg-white rounded-xl shadow-sm p-4 border-2 border-gray-100 hover:shadow-md transition-all relative"
              >
                {/* Overlay for locked steps */}
                {!canEdit && !isLocked && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
                    <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-orange-400">
                      <p className="text-base font-bold text-orange-800 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Complete Step {step.step - 1} First
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-base font-bold">
                        Step {step.step}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getStatusColor(
                          step.status
                        )}`}
                      >
                        {step.status.toUpperCase()}
                      </span>

                      {isLocked && (
                        <span className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 flex items-center gap-1 text-xs">
                          <Lock className="w-3 h-3" />
                          LOCKED
                        </span>
                      )}

                      {step.docAutoGenerated && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 flex items-center gap-1 text-xs font-bold">
                          <FileText className="w-3 h-3" />
                          AUTO PDF
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold mb-2">
                      {step.adminDescription}
                    </h3>

                    {/* Generated Documents */}
                    {step.generatedDocuments?.length > 0 && (
                      <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg p-2">
                        <p className="text-xs font-bold text-purple-900 mb-1">
                          Generated Documents:
                        </p>

                        <div className="space-y-1">
                          {step.generatedDocuments.map((doc, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                downloadDocument(
                                  step.step,
                                  idx,
                                  doc.filename
                                )
                              }
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

                    {/* EDIT MODE */}
                    {isEditing ? (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mt-2">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block font-bold mb-1 text-xs">
                              Status
                            </label>
                            <select
                              value={editData.status}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  status: e.target.value,
                                })
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
                            <label className="block font-bold mb-1 text-xs">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={editData.deadline}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  deadline: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            />
                          </div>

                          <div>
                            <label className="block font-bold mb-1 text-xs">
                              Complete Date
                            </label>
                            <input
                              type="date"
                              value={editData.completeDate}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  completeDate: e.target.value,
                                })
                              }
                              disabled={editData.status !== 'completed'}
                              className="w-full px-2 py-1.5 border rounded disabled:bg-gray-100 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="block font-bold mb-1 text-xs">
                            Notes
                          </label>
                          <textarea
                            value={editData.notes}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                notes: e.target.value,
                              })
                            }
                            rows="2"
                            className="w-full px-2 py-1.5 border rounded text-sm"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={cancelEditing}
                            type="button"
                            className="px-3 py-1.5 bg-gray-300 rounded-lg font-bold text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => handleSaveStep(step.step)}
                            disabled={saving}
                            type="button"
                            className="px-3 py-1.5 bg-[#005670] text-white rounded-lg font-bold text-sm flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // VIEW MODE
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {!isLocked && canEdit && (
                          <button
                            onClick={() => startEditing(step)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        )}

                        {step.docAutoGenerated && (
                          <button
                            onClick={() => handleGeneratePdf(step.step)}
                            disabled={generatingPdf}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                          >
                            <FileText className="w-3 h-3" />
                            {generatingPdf ? 'Generating...' : 'Generate PDF'}
                          </button>
                        )}

                        <button
                          onClick={() => toggleStepExpanded(step.step)}
                          className="px-3 py-1.5 bg-gray-200 rounded-lg font-bold text-xs flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Chat
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* QUESTIONNAIRE + CHAT (Step 11) */}
                    {isExpanded && step.step === 11 && (
                      <div className="mt-3 space-y-3">
                        {/* Questionnaire */}
                        {loadingQuestionnaire ? (
                          <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Loading questionnaire...
                            </p>
                          </div>
                        ) : viewingQuestionnaire ? (
                          <QuestionnaireView
                            questionnaire={viewingQuestionnaire}
                          />
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-amber-800">
                              <AlertCircle className="w-5 h-5" />
                              <p className="font-medium">
                                No questionnaire submitted yet
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Chat Section */}
                        {activeChat === step.step && (
                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <h4 className="font-bold mb-2 text-sm flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              Conversation
                            </h4>

                            <div className="space-y-2 mb-2 max-h-60 overflow-y-auto">
                              {!chatMessages[step.step] ||
                              chatMessages[step.step].length === 0 ? (
                                <p className="text-center py-4 text-gray-500 text-xs">
                                  No messages yet
                                </p>
                              ) : (
                                <>
                                  {chatMessages[step.step].map((msg, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-2 rounded-lg text-xs ${
                                        msg.sender === 'admin'
                                          ? 'bg-blue-100 ml-4'
                                          : 'bg-white border border-gray-200 mr-4'
                                      }`}
                                    >
                                      <div className="flex justify-between mb-1">
                                        <span className="font-bold text-xs">
                                          {msg.sender === 'admin'
                                            ? '👨‍💼 Admin'
                                            : '👤 Client'}
                                        </span>

                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            msg.sentAt
                                          ).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                          })}
                                        </span>
                                      </div>

                                      <p className="mb-1 whitespace-pre-wrap">
                                        {msg.message}
                                      </p>

                                      {msg.attachments?.length > 0 && (
                                        <div className="mt-1 space-y-1">
                                          {msg.attachments.map(
                                            (att, attIdx) => (
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
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                              >
                                                <Paperclip className="w-3 h-3" />
                                                {att.filename}
                                                <Download className="w-3 h-3" />
                                              </button>
                                            )
                                          )}
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
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-blue-50 p-2 rounded text-xs"
                                  >
                                    <span className="flex items-center gap-1">
                                      <Paperclip className="w-3 h-3" />
                                      {file.filename} ({formatFileSize(file.size)}
                                      )
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

                            {/* Chat Input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="flex-grow px-2 py-1.5 border rounded text-sm"
                                placeholder="Type message..."
                                onKeyPress={(e) => {
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
                                onClick={() =>
                                  fileInputRef.current?.click()
                                }
                                className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 rounded"
                                title="Attach files"
                              >
                                <Paperclip className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => sendChatMessage(step.step)}
                                disabled={
                                  (!chatInput.trim() &&
                                    selectedFiles.length === 0) ||
                                  uploadingFiles
                                }
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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS helper untuk hide-scrollbar */}
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

// ====================== QuestionnaireView ======================

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Client Questionnaire Results
            </h4>
            <p className="text-white/80 text-xs mt-1">
              Submitted:{' '}
              {new Date(
                questionnaire.submittedAt
              ).toLocaleDateString()}
            </p>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">
            {questionnaire.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2 p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Home className="w-4 h-4 inline mr-1" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'design'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-1" />
            Design
          </button>
          <button
            onClick={() => setActiveTab('functional')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'functional'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1" />
            Functional
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'images'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-1" />
            Liked ({likedImagesList.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <Section icon={Home} title="Home Use & Lifestyle">
              <Field label="Primary Use" value={questionnaire.primary_use} />
              <Field
                label="Occupancy"
                value={questionnaire.occupancy}
                isArray
              />
              <Field
                label="Lifestyle"
                value={questionnaire.lifestyle}
                isArray
              />
            </Section>

            <Section icon={Users} title="Entertaining">
              <Field
                label="Frequency"
                value={questionnaire.entertaining}
              />
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
              <Field
                label="Move-in Timeline"
                value={questionnaire.move_in}
              />
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

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="space-y-4">
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

        {/* Functional Tab */}
        {activeTab === 'functional' && (
          <div className="space-y-4">
            <Section icon={BedDouble} title="Bedroom Preferences">
              <Field
                label="Bedroom Use"
                value={questionnaire.bedroom_use}
                isLongText
              />
              <Field
                label="Master Bed Size"
                value={questionnaire.bed_size}
              />
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
              <Field
                label="Dining Preferences"
                value={questionnaire.dining}
                isArray
              />
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

        {/* Liked Images Tab */}
        {activeTab === 'images' && (
          <div>
            {likedImagesList.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {likedImagesList.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-indigo-200"
                  >
                    <img
                      src={image.src}
                      alt={`Design ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No designs selected</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-indigo-600" />
      {title}
    </h5>
    <div className="space-y-2">{children}</div>
  </div>
);

const Field = ({ label, value, isArray = false, isLongText = false }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <div className="text-sm">
      <span className="font-semibold text-gray-700">{label}:</span>
      {isArray ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      ) : isLongText ? (
        <p className="mt-1 text-gray-600 whitespace-pre-wrap">{value}</p>
      ) : (
        <span className="ml-2 text-gray-600">{value}</span>
      )}
    </div>
  );
};

export default AdminJourneyManager;
