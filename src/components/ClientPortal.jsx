import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, 
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Send,
  Paperclip,
  Download,
  Home,
  Package,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  MapPin,
  Hash,
  Layers,
  Menu,
  Bell,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import QuestionnaireModal from './QuestionnaireModal';

const ClientPortal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [journeySteps, setJourneySteps] = useState([]);
  const [allJourneySteps, setAllJourneySteps] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [activeChatStep, setActiveChatStep] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [showPendingPanel, setShowPendingPanel] = useState(false);

  const groupStepsByStage = (steps) => {
    const stages = {};
    steps.forEach(step => {
      if (!stages[step.stage]) {
        stages[step.stage] = [];
      }
      stages[step.stage].push(step);
    });
    return stages;
  };

  const stageGroups = groupStepsByStage(journeySteps);

  const getStageProgress = (stageSteps) => {
    if (!stageSteps || stageSteps.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = stageSteps.filter(s => s.status === 'completed').length;
    const total = stageSteps.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const getStageStatus = (stageName) => {
    const stageSteps = stageGroups[stageName] || [];
    
    if (stageSteps.length === 0) {
      const backendSteps = allJourneySteps.filter(s => s.stage === stageName);
      if (backendSteps.length > 0) {
        const hasActivity = backendSteps.some(s => s.status === 'in-progress' || s.status === 'completed');
        if (hasActivity) return 'in-progress';
      }
      return 'not-started';
    }
    
    const hasInProgress = stageSteps.some(s => s.status === 'in-progress');
    const allCompleted = stageSteps.every(s => s.status === 'completed');
    
    if (allCompleted) return 'completed';
    if (hasInProgress) return 'in-progress';
    if (stageSteps.some(s => s.status === 'completed')) return 'in-progress';
    return 'not-started';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (!token || role !== 'user') {
      navigate('/portal-login');
      return;
    }

    fetchClientData(userId, token);
  }, [navigate]);

  useEffect(() => {
    if (activeChatStep && chatMessages[activeChatStep]) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatStep]);

  const fetchClientData = async (userId, token) => {
    try {
      setLoading(true);
      
      const clientResponse = await fetch(`${backendServer}/api/clients/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!clientResponse.ok) throw new Error('Unable to fetch client data');

      const result = await clientResponse.json();
      const clientData = result.data || result;
      
      setClientData(clientData);

      if (clientData?.email && clientData?.unitNumber) {
        await checkQuestionnaireStatus(clientData);
      } else {
        setCheckingQuestionnaire(false);
      }

      try {
        const journeyResponse = await fetch(`${backendServer}/api/journeys/client/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (journeyResponse.ok) {
          const journeyData = await journeyResponse.json();
          
          setAllJourneySteps(journeyData.steps);
          
          const stages = [...new Set(journeyData.steps.map(s => s.stage))];
          setAllStages(stages);
          
          const visibleSteps = journeyData.steps.filter(s => s.clientVisible).map(step => ({
            ...step,
            title: step.clientDescription || step.adminDescription
          }));
          
          setJourneySteps(visibleSteps);
          
          const actionsResponse = await fetch(
            `${backendServer}/api/journeys/client/${userId}/pending-actions`,
            { headers: { 'Authorization': `Bearer ${token}` }}
          );
          
          if (actionsResponse.ok) {
            const actionsData = await actionsResponse.json();
            setPendingActions(actionsData.actions || []);
          }
          
          const currentStep = visibleSteps.find(s => s.status === 'in-progress');
          if (currentStep) {
            setSelectedStage(currentStep.stage);
          } else {
            let lastActiveStage = stages[0];
            for (const stage of stages) {
              const stageSteps = visibleSteps.filter(s => s.stage === stage);
              if (stageSteps.some(s => s.status === 'completed')) {
                lastActiveStage = stage;
              }
            }
            setSelectedStage(lastActiveStage);
          }
        }
      } catch (journeyError) {
        console.log('Journey data not available yet');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
      setCheckingQuestionnaire(false);
    }
  };

  const checkQuestionnaireStatus = async (clientData) => {
    try {
      setCheckingQuestionnaire(true);
      
      const response = await fetch(
        `${backendServer}/api/questionnaires/my-questionnaires?email=${clientData.email}&unitNumber=${clientData.unitNumber}`,
        {
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const hasCompleted = data.questionnaires?.some(
          q => q.status === 'submitted' || q.status === 'under-review' || q.status === 'approved'
        );
        
        if (!hasCompleted) {
          setShowQuestionnaire(true);
        }
      } else {
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.error('Error checking questionnaire:', error);
      setShowQuestionnaire(true);
    } finally {
      setCheckingQuestionnaire(false);
    }
  };

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    fetchClientData(userId, token);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const scrollToStage = (direction) => {
    const currentIndex = allStages.indexOf(selectedStage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < allStages.length) {
      setSelectedStage(allStages[newIndex]);
      setExpandedStep(null);
    }
  };

  const toggleStep = async (stepNumber) => {
    if (expandedStep === stepNumber) {
      setExpandedStep(null);
      setActiveChatStep(null);
    } else {
      setExpandedStep(stepNumber);
      await loadChat(stepNumber);
    }
  };

  const loadChat = async (stepNumber) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${userId}/step/${stepNumber}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.messages || [] }));
        setActiveChatStep(stepNumber);
        
        await fetch(
          `${backendServer}/api/journey-chat/client/${userId}/step/${stepNumber}/read`,
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
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${userId}/step/${stepNumber}/message`,
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
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${userId}/step/${stepNumber}/message/${messageId}/attachment/${attachmentId}`,
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
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(
        `${backendServer}/api/journeys/client/${userId}/step/${stepNumber}/document/${documentIndex}`,
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'emerald',
          bgColor: 'bg-emerald-500',
          textColor: 'text-emerald-600',
          lightBg: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Completed'
        };
      case 'in-progress':
        return {
          icon: Clock,
          color: 'blue',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          lightBg: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'In Progress',
          pulse: true
        };
      default:
        return {
          icon: Circle,
          color: 'gray',
          bgColor: 'bg-gray-400',
          textColor: 'text-gray-500',
          lightBg: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Not Started'
        };
    }
  };

  if (loading || checkingQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin"></div>
          </div>
          <p className="text-white text-xl font-semibold">Loading your workspace...</p>
          <p className="text-white/60 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Connection Error</h2>
          <p className="text-gray-600 mb-8">{error || 'Unable to load your portal. Please try again.'}</p>
          <button
            onClick={() => navigate('/portal-login')}
            className="px-8 py-4 bg-[#005670] text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const isJourneyInitialized = journeySteps.length > 0;
  const completedMilestones = journeySteps.filter(m => m.status === 'completed').length;
  const totalMilestones = journeySteps.length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const selectedStageSteps = selectedStage ? (stageGroups[selectedStage] || []) : [];
  const stageProgress = getStageProgress(selectedStageSteps);
  const stageStatus = getStageStatus(selectedStage);

  return (
    <>
      {showQuestionnaire && (
        <QuestionnaireModal 
          onComplete={handleQuestionnaireComplete}
          userData={clientData}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        {/* HEADER - Keep original colors */}
        <header className="bg-[#005670] shadow-lg sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/images/HDG-Logo.png" 
                  alt="Henderson Design Group" 
                  className="h-12 w-auto brightness-0 invert"
                />
                <div className="hidden sm:block border-l border-white/30 pl-4">
                  <p className="text-xs text-white/70 tracking-widest uppercase font-semibold">Ālia Collections</p>
                  <p className="text-sm text-white font-semibold">Client Portal</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {pendingActions.length > 0 && (
                  <button
                    onClick={() => setShowPendingPanel(!showPendingPanel)}
                    className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                      {pendingActions.length}
                    </span>
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20 text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

                {/* COMPACT HERO SECTION */}
        <div className="bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              {/* LEFT: Welcome & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white/70 font-medium">Welcome back,</p>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white truncate">{clientData.name}</h1>
                  </div>
                </div>

                {/* Inline Progress */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">Project Progress</p>
                      <p className="text-xs text-white/80">{completedMilestones} of {totalMilestones} steps completed</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white">{progressPercentage}%</div>
                    </div>
                  </div>
                  
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: Client Info - Horizontal Layout */}
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-white/70" />
                    <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">Unit</p>
                  </div>
                  <p className="text-xl font-bold text-white">{clientData.unitNumber}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-white/70" />
                    <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">Floor Plan</p>
                  </div>
                  <p className="text-xl font-bold text-white">{clientData.floorPlan}</p>
                </div>

                {clientData.clientCode && (
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-white/70" />
                      <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">Code</p>
                    </div>
                    <p className="text-xl font-bold text-white">{clientData.clientCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* PENDING ACTIONS PANEL */}
        {showPendingPanel && pendingActions.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPendingPanel(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  Action Required
                </h3>
                <button 
                  onClick={() => setShowPendingPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedStage(action.stage);
                      setExpandedStep(action.step);
                      setShowPendingPanel(false);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-1 rounded">
                            STEP {action.step}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">{action.stage}</span>
                        </div>
                        <p className="font-bold text-gray-900 mb-1 group-hover:text-amber-900 transition-colors">
                          {action.title}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {!isJourneyInitialized ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <div className="w-20 h-20 bg-[#005670]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-[#005670]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Journey Starting Soon</h3>
              <p className="text-gray-600 text-lg">Your personalized design journey will begin shortly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STAGE NAVIGATION */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Project Stages</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollToStage('prev')}
                      disabled={allStages.indexOf(selectedStage) === 0}
                      className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    <button
                      onClick={() => scrollToStage('next')}
                      disabled={allStages.indexOf(selectedStage) === allStages.length - 1}
                      className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
                  <div className="flex gap-4 pb-2" ref={scrollContainerRef}>
                    {allStages.map((stage, index) => {
                      const steps = stageGroups[stage] || [];
                      const progress = getStageProgress(steps);
                      const status = getStageStatus(stage);
                      const config = getStatusConfig(status);
                      const Icon = config.icon;
                      const isSelected = selectedStage === stage;
                      const stageNumber = index + 1;
                      const hasVisibleSteps = steps.length > 0;

                      return (
                        <button
                          key={stage}
                          onClick={() => {
                            setSelectedStage(stage);
                            setExpandedStep(null);
                          }}
                          className={`
                            flex-shrink-0 w-72 p-5 rounded-2xl border-2 transition-all duration-300
                            ${isSelected 
                              ? 'border-[#005670] bg-gradient-to-br from-[#005670]/5 to-[#007a9a]/5 shadow-xl scale-105' 
                              : 'border-gray-200 bg-white hover:border-[#005670]/50 hover:shadow-lg'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${isSelected ? 'bg-[#005670] text-white' : 'bg-gray-100 text-gray-600'}`}>
                              STAGE {stageNumber}
                            </span>
                            <div className={`
                              w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all
                              ${isSelected ? 'bg-[#005670]' : config.lightBg}
                              ${config.pulse && !isSelected ? 'animate-pulse' : ''}
                            `}>
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : config.textColor}`} />
                            </div>
                          </div>
                          
                          <h3 className={`text-base font-bold text-left mb-4 line-clamp-2 leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                            {stage}
                          </h3>
                          
                          {hasVisibleSteps ? (
                            <div className="space-y-3">
                              <div className={`h-2.5 rounded-full overflow-hidden ${isSelected ? 'bg-[#005670]/20' : 'bg-gray-200'}`}>
                                <div 
                                  className={`h-full transition-all duration-500 ${isSelected ? 'bg-[#005670]' : config.bgColor}`}
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                  {progress.completed}/{progress.total} Steps
                                </span>
                                <span className={`text-lg font-bold ${isSelected ? 'text-[#005670]' : config.textColor}`}>
                                  {progress.percentage}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-left">
                              <p className={`text-sm italic ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                                Internal process
                              </p>
                              {status === 'in-progress' && (
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <p className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : config.textColor}`}>
                                    Running in background
                                  </p>
                                </div>
                              )}
                              {status === 'completed' && (
                                <div className="flex items-center gap-2 mt-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  <p className="text-xs font-semibold text-emerald-600">
                                    Completed
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SELECTED STAGE HEADER */}
              {selectedStage && (
                <div className="bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] rounded-3xl shadow-lg p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                          STAGE {allStages.indexOf(selectedStage) + 1}
                        </span>
                        {selectedStageSteps.length > 0 && (
                          <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                            {stageProgress.completed}/{stageProgress.total} COMPLETED
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold mb-2">{selectedStage}</h2>
                      {selectedStageSteps.length > 0 ? (
                        <p className="text-white/90 text-lg">
                          Track your progress through each milestone
                        </p>
                      ) : (
                        <p className="text-white/90 text-lg">
                          Our team is working on this stage behind the scenes
                        </p>
                      )}
                    </div>
                    {selectedStageSteps.length > 0 && (
                      <div className="text-right">
                        <div className="text-6xl font-bold mb-1">{stageProgress.percentage}%</div>
                        <p className="text-white/90 text-sm font-medium">Progress</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEPS */}
              {selectedStageSteps.length > 0 ? (
                <div className="space-y-4">
                  {selectedStageSteps.map((step) => {
                    const config = getStatusConfig(step.status);
                    const Icon = config.icon;
                    const isExpanded = expandedStep === step.step;
                    const hasDetails = step.notes || step.deadlineDate || step.completedDate || step.generatedDocuments?.length > 0;
                    const hasChatMessages = chatMessages[step.step]?.length > 0;
                    const unreadCount = chatMessages[step.step]?.filter(m => !m.read && m.sender === 'admin').length || 0;

                    return (
                      <div key={step.step} className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                        {/* STEP HEADER */}
                        <div 
                          onClick={() => (hasDetails || hasChatMessages) && toggleStep(step.step)}
                          className={`p-6 ${(hasDetails || hasChatMessages) ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                        >
                          <div className="flex items-start gap-5">
                            {/* STATUS ICON */}
                            <div className={`
                              flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                              ${config.bgColor} ${config.pulse ? 'animate-pulse' : ''}
                            `}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>

                            {/* CONTENT */}
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  STEP {step.step}
                                </span>
                                <span className={`px-3 py-1 ${config.lightBg} ${config.textColor} text-xs font-bold rounded-full border ${config.borderColor}`}>
                                  {config.label.toUpperCase()}
                                </span>
                                {step.clientActionNeeded && (step.status !== 'completed') && (
                                  <span className="text-xs px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full animate-pulse shadow-lg">
                                    👤 YOUR ACTION NEEDED
                                  </span>
                                )}
                                {unreadCount > 0 && (
                                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
                                    {unreadCount} NEW MESSAGE{unreadCount > 1 ? 'S' : ''}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-gray-900 mb-2 text-xl">{step.title}</h3>
                              {step.description && (
                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                              )}

                              {step.status !== 'not-started' && (
                                <div className="flex items-center gap-4 mt-3 flex-wrap">
                                  {step.completedDate && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg">
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      <span className="text-sm text-emerald-700 font-semibold">
                                        Completed {formatDate(step.completedDate)}
                                      </span>
                                    </div>
                                  )}
                                  {!step.completedDate && step.deadlineDate && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                                      <Clock className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm text-blue-700 font-semibold">
                                        Due {formatDate(step.deadlineDate)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* EXPAND BUTTON */}
                            {(hasDetails || hasChatMessages) && (
                              <button className="flex-shrink-0 p-3 hover:bg-gray-100 rounded-xl transition-colors">
                                {isExpanded ? (
                                  <ChevronUp className="w-6 h-6 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-6 h-6 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* EXPANDED DETAILS */}
                        {isExpanded && (hasDetails || hasChatMessages) && (
                          <div className="px-6 pb-6 border-t-2 border-gray-100 bg-gray-50">
                            <div className="pt-6 space-y-6">
                              
                              {/* DOCUMENTS */}
                              {step.generatedDocuments && step.generatedDocuments.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#005670]" />
                                    Documents
                                  </h4>
                                  <div className="grid gap-3">
                                    {step.generatedDocuments.map((doc, docIdx) => (
                                      <button
                                        key={docIdx}
                                        onClick={() => downloadDocument(step.step, docIdx, doc.filename)}
                                        className="flex items-center gap-3 p-4 bg-white hover:bg-[#005670]/5 rounded-xl border-2 border-[#005670]/20 hover:border-[#005670] transition-all text-left group"
                                      >
                                        <div className="w-12 h-12 rounded-xl bg-[#005670]/10 flex items-center justify-center flex-shrink-0">
                                          <FileText className="w-6 h-6 text-[#005670]" />
                                        </div>
                                        <span className="flex-grow font-semibold text-gray-900 group-hover:text-[#005670] transition-colors">
                                          {doc.filename}
                                        </span>
                                        <Download className="w-5 h-5 text-[#005670] group-hover:scale-110 transition-transform" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* TEAM NOTES */}
                              {step.notes && (
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-[#005670]" />
                                    Message from Team
                                  </h4>
                                  <div className="p-4 bg-white rounded-xl border-2 border-[#005670]/20 shadow-sm">
                                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{step.notes}</p>
                                  </div>
                                </div>
                              )}

                              {/* CHAT */}
                              {activeChatStep === step.step && (
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-[#005670]" />
                                    Conversation
                                  </h4>
                                  
                                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto p-4 bg-white rounded-xl border-2 border-gray-200">
                                    {(!chatMessages[step.step] || chatMessages[step.step].length === 0) ? (
                                      <div className="text-center py-8">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No messages yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Start a conversation with your team</p>
                                      </div>
                                    ) : (
                                      <>
                                        {chatMessages[step.step].map((msg, idx) => (
                                          <div
                                            key={idx}
                                            className={`${
                                              msg.sender === 'client'
                                                ? 'flex justify-end'
                                                : 'flex justify-start'
                                            }`}
                                          >
                                            <div
                                              className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                                                msg.sender === 'client'
                                                  ? 'bg-[#005670] text-white'
                                                  : 'bg-white border-2 border-gray-200'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold ${msg.sender === 'client' ? 'text-white/80' : 'text-gray-600'}`}>
                                                  {msg.sender === 'client' ? '👤 You' : '🏢 HDG Team'}
                                                </span>
                                                <span className={`text-xs ${msg.sender === 'client' ? 'text-white/70' : 'text-gray-500'}`}>
                                                  {new Date(msg.sentAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                  })}
                                                </span>
                                              </div>
                                              <p className={`${msg.sender === 'client' ? 'text-white' : 'text-gray-900'} whitespace-pre-wrap leading-relaxed`}>
                                                {msg.message}
                                              </p>
                                              
                                              {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                  {msg.attachments.map((att, attIdx) => (
                                                    <button
                                                      key={attIdx}
                                                      onClick={() => downloadAttachment(step.step, msg._id, att._id, att.filename)}
                                                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        msg.sender === 'client'
                                                          ? 'bg-[#007a9a] hover:bg-[#006080] text-white'
                                                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                      }`}
                                                    >
                                                      <Paperclip className="w-4 h-4" />
                                                      <span className="flex-grow text-left truncate">{att.filename}</span>
                                                      <Download className="w-4 h-4" />
                                                    </button>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                      </>
                                    )}
                                  </div>

                                  {selectedFiles.length > 0 && (
                                    <div className="mb-3 p-3 bg-white rounded-xl border-2 border-[#005670]/20">
                                      <p className="text-xs font-bold text-gray-600 mb-2">ATTACHMENTS ({selectedFiles.length}/5)</p>
                                      <div className="space-y-2">
                                        {selectedFiles.map((file, idx) => (
                                          <div key={idx} className="flex items-center gap-3 p-2 bg-[#005670]/5 rounded-lg">
                                            <Paperclip className="w-4 h-4 text-[#005670] flex-shrink-0" />
                                            <div className="flex-grow min-w-0">
                                              <p className="text-sm font-semibold text-gray-900 truncate">{file.filename}</p>
                                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                            <button 
                                              onClick={() => removeSelectedFile(idx)}
                                              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                              <X className="w-4 h-4 text-red-600" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

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
                                      className="p-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-xl transition-all"
                                      title="Attach files"
                                    >
                                      <Paperclip className="w-5 h-5 text-gray-700" />
                                    </button>
                                    
                                    <textarea
                                      value={chatInput}
                                      onChange={(e) => setChatInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          sendChatMessage(step.step);
                                        }
                                      }}
                                      placeholder="Type your message... (Shift+Enter for new line)"
                                      rows="3"
                                      disabled={uploadingFiles}
                                      className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670] focus:border-[#005670] resize-none"
                                    />
                                    
                                    <button
                                      onClick={() => sendChatMessage(step.step)}
                                      disabled={(!chatInput.trim() && selectedFiles.length === 0) || uploadingFiles}
                                      className="px-6 py-3 bg-[#005670] text-white rounded-xl hover:bg-[#007a9a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold"
                                    >
                                      {uploadingFiles ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                      ) : (
                                        <Send className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-md p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Internal Stage</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Our team is working on this stage behind the scenes. You'll be notified when your input is needed!
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* FOOTER - Keep original colors */}
        <footer className="bg-[#005670] mt-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="text-center">
              <img 
                src="/images/HDG-Logo.png" 
                alt="Henderson Design Group" 
                className="h-12 w-auto brightness-0 invert mx-auto mb-4"
              />
              <p className="text-white/70 text-sm">
                &copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ClientPortal;