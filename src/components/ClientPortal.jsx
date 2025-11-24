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
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import QuestionnaireModal from './QuestionnaireModal';

const ClientPortal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [journeySteps, setJourneySteps] = useState([]);
  const [allJourneySteps, setAllJourneySteps] = useState([]); // All steps including internal
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

  // Group visible steps by stage
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

  // Calculate stage progress
  const getStageProgress = (stageSteps) => {
    if (!stageSteps || stageSteps.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = stageSteps.filter(s => s.status === 'completed').length;
    const total = stageSteps.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  // Get stage status - CHECK BACKEND ACTIVITY!
  const getStageStatus = (stageName) => {
    const stageSteps = stageGroups[stageName] || [];
    
    // If no visible steps, check backend activity
    if (stageSteps.length === 0) {
      // Check if this stage has steps running in backend (all steps, not just visible)
      const backendSteps = allJourneySteps.filter(s => s.stage === stageName);
      if (backendSteps.length > 0) {
        // Check if any backend step is in-progress or completed
        const hasActivity = backendSteps.some(s => s.status === 'in-progress' || s.status === 'completed');
        if (hasActivity) return 'in-progress';
      }
      return 'not-started';
    }
    
    // For visible steps
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
        // Fetch journey data
        const journeyResponse = await fetch(`${backendServer}/api/journeys/client/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (journeyResponse.ok) {
          const journeyData = await journeyResponse.json();
          
          // Store ALL steps (including internal ones) for stage status checking
          setAllJourneySteps(journeyData.steps);
          
          // Get all unique stages
          const stages = [...new Set(journeyData.steps.map(s => s.stage))];
          setAllStages(stages);
          
          // Filter only client-visible steps
          const visibleSteps = journeyData.steps.filter(s => s.clientVisible).map(step => ({
            ...step,
            title: step.clientDescription || step.adminDescription
          }));
          
          setJourneySteps(visibleSteps);
          
          // Fetch pending actions
          const actionsResponse = await fetch(
            `${backendServer}/api/journeys/client/${userId}/pending-actions`,
            { headers: { 'Authorization': `Bearer ${token}` }}
          );
          
          if (actionsResponse.ok) {
            const actionsData = await actionsResponse.json();
            setPendingActions(actionsData.actions || []);
          }
          
          // Auto-select current stage (first with in-progress or last with completed steps)
          const currentStep = visibleSteps.find(s => s.status === 'in-progress');
          if (currentStep) {
            setSelectedStage(currentStep.stage);
          } else {
            // Find last stage with activity
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
          label: 'Completed'
        };
      case 'in-progress':
        return {
          icon: Clock,
          color: 'blue',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          lightBg: 'bg-blue-50',
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
          label: 'Not Started'
        };
    }
  };

  if (loading || checkingQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Portal</h2>
          <p className="text-gray-600 mb-6">{error || 'Please try again later'}</p>
          <button
            onClick={() => navigate('/portal-login')}
            className="px-6 py-3 bg-[#005670] text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
          >
            Back to Login
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
        {/* HEADER */}
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

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* IMPROVED WELCOME BANNER */}
        <div className="bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="relative">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
              
              <div className="relative">
                {/* Welcome heading */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">Welcome back,</p>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">{clientData.name}</h1>
                  </div>
                </div>

                {/* Client info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Unit Number */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">Unit</p>
                        <p className="text-xl font-bold text-white">{clientData.unitNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Floor Plan */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">Floor Plan</p>
                        <p className="text-xl font-bold text-white">{clientData.floorPlan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Code */}
                  {clientData.clientCode && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/70 font-medium uppercase tracking-wider mb-1">Code</p>
                          <p className="text-xl font-bold text-white">{clientData.clientCode}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING PENDING ACTIONS BUTTON */}
        {pendingActions.length > 0 && (
          <button
            onClick={() => setShowPendingPanel(!showPendingPanel)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
          >
            <div className="relative">
              <Zap className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                {pendingActions.length}
              </span>
            </div>
          </button>
        )}

        {/* PENDING ACTIONS PANEL */}
        {showPendingPanel && pendingActions.length > 0 && (
          <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl p-4 border-2 border-amber-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Action Required
              </h3>
              <button onClick={() => setShowPendingPanel(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingActions.map((action, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSelectedStage(action.stage);
                    setExpandedStep(action.step);
                    setShowPendingPanel(false);
                  }}
                  className="p-3 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <p className="text-xs font-bold text-amber-900">STEP {action.step}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{action.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{action.stage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OVERALL PROGRESS */}
        <div className="bg-white border-b border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Your Project Journey</h2>
              <div className="text-right">
                <div className="text-4xl font-bold text-[#005670]">{progressPercentage}%</div>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">Complete</p>
              </div>
            </div>
            <div className="relative">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#005670] to-[#00a8cc] transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-700 font-medium">
                  <span className="font-bold text-[#005670]">{completedMilestones}</span> of {totalMilestones} steps completed
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {totalMilestones - completedMilestones} remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {!isJourneyInitialized ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Package className="w-16 h-16 text-[#005670] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Journey Starting Soon</h3>
              <p className="text-gray-600">Your design journey will begin shortly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STAGE NAVIGATION - Show ALL stages with STATUS! */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => scrollToStage('prev')}
                    disabled={allStages.indexOf(selectedStage) === 0}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  
                  <div className="flex-grow overflow-x-auto hide-scrollbar">
                    <div className="flex gap-3" ref={scrollContainerRef}>
                      {allStages.map((stage, index) => {
                        const steps = stageGroups[stage] || [];
                        const progress = getStageProgress(steps);
                        const status = getStageStatus(stage); // FIXED: Pass stage name!
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
                              flex-shrink-0 w-56 p-4 rounded-xl border-2 transition-all
                              ${isSelected 
                                ? 'border-[#005670] bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-xl scale-105' 
                                : 'border-gray-200 bg-white hover:border-[#005670] hover:shadow-lg'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-xs font-bold tracking-wider ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                STAGE {stageNumber}
                              </span>
                              {/* ALWAYS show status icon! */}
                              <div className={`
                                w-9 h-9 rounded-full flex items-center justify-center shadow-sm
                                ${isSelected ? 'bg-white/20' : config.lightBg}
                                ${config.pulse && !isSelected ? 'animate-pulse' : ''}
                              `}>
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : config.textColor}`} />
                              </div>
                            </div>
                            
                            <h3 className={`text-sm font-bold text-left mb-3 line-clamp-2 leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {stage}
                            </h3>
                            
                            {hasVisibleSteps ? (
                              <div className="space-y-2">
                                <div className={`h-2 rounded-full overflow-hidden ${isSelected ? 'bg-white/30' : 'bg-gray-200'}`}>
                                  <div 
                                    className={`h-full transition-all duration-500 ${isSelected ? 'bg-white' : config.bgColor}`}
                                    style={{ width: `${progress.percentage}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                    {progress.completed}/{progress.total} Steps
                                  </span>
                                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : config.textColor}`}>
                                    {progress.percentage}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className={`text-xs italic ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                                  Internal process
                                </p>
                                {/* Show status even for internal stages! */}
                                {status === 'in-progress' && (
                                  <p className={`text-xs font-semibold mt-2 ${isSelected ? 'text-white' : config.textColor}`}>
                                    • Running in background
                                  </p>
                                )}
                                {status === 'completed' && (
                                  <p className={`text-xs font-semibold mt-2 ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
                                    • Completed
                                  </p>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => scrollToStage('next')}
                    disabled={allStages.indexOf(selectedStage) === allStages.length - 1}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* STAGE INFO */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedStage}</h2>
                    {selectedStageSteps.length > 0 ? (
                      <p className="text-sm text-gray-700 font-medium">
                        {stageProgress.completed} of {stageProgress.total} steps completed
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 italic">
                        Internal stage - {stageStatus === 'in-progress' ? 'in progress' : stageStatus === 'completed' ? 'completed' : 'not started yet'}
                      </p>
                    )}
                  </div>
                  {selectedStageSteps.length > 0 && (
                    <div className="text-right">
                      <div className="text-5xl font-bold text-[#005670]">{stageProgress.percentage}%</div>
                      <p className="text-xs text-gray-600 mt-1 font-medium">Complete</p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEPS IN SELECTED STAGE */}
              {selectedStageSteps.length > 0 ? (
                <div className="space-y-3">
                  {selectedStageSteps.map((step) => {
                    const config = getStatusConfig(step.status);
                    const Icon = config.icon;
                    const isExpanded = expandedStep === step.step;
                    const hasDetails = step.notes || step.deadlineDate || step.completedDate || step.generatedDocuments?.length > 0;
                    const hasChatMessages = chatMessages[step.step]?.length > 0;
                    const unreadCount = chatMessages[step.step]?.filter(m => !m.read && m.sender === 'admin').length || 0;

                    return (
                      <div key={step.step} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        {/* STEP HEADER */}
                        <div 
                          onClick={() => (hasDetails || hasChatMessages) && toggleStep(step.step)}
                          className={`p-4 ${(hasDetails || hasChatMessages) ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                        >
                          <div className="flex items-start gap-4">
                            {/* STATUS ICON */}
                            <div className={`
                              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                              ${config.bgColor} ${config.pulse ? 'animate-pulse' : ''}
                            `}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>

                            {/* CONTENT */}
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-xs font-bold text-gray-500">STEP {step.step}</span>
                                <span className={`px-2 py-1 ${config.lightBg} ${config.textColor} text-xs font-bold rounded`}>
                                  {config.label.toUpperCase()}
                                </span>
                                {step.clientActionNeeded && (step.status !== 'completed') && (
                                  <span className="text-xs px-2 py-1 bg-amber-500 text-white font-bold rounded animate-pulse">
                                    👤 ACTION REQUIRED
                                  </span>
                                )}
                                {unreadCount > 0 && (
                                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                    {unreadCount} New
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                              {step.description && (
                                <p className="text-sm text-gray-600">{step.description}</p>
                              )}

                              {step.status !== 'not-started' && (
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  {step.completedDate && (
                                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      {formatDate(step.completedDate)}
                                    </span>
                                  )}
                                  {!step.completedDate && step.deadlineDate && (
                                    <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      By {formatDate(step.deadlineDate)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* EXPAND BUTTON */}
                            {(hasDetails || hasChatMessages) && (
                              <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* EXPANDED DETAILS */}
                        {isExpanded && (hasDetails || hasChatMessages) && (
                          <div className="px-4 pb-4 border-t border-gray-200">
                            <div className="pt-4 space-y-4">
                              
                              {/* DOCUMENTS */}
                              {step.generatedDocuments && step.generatedDocuments.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 mb-2">Documents</h4>
                                  <div className="space-y-2">
                                    {step.generatedDocuments.map((doc, docIdx) => (
                                      <button
                                        key={docIdx}
                                        onClick={() => downloadDocument(step.step, docIdx, doc.filename)}
                                        className="w-full flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-left"
                                      >
                                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span className="flex-grow text-sm font-semibold text-gray-900">{doc.filename}</span>
                                        <Download className="w-4 h-4 text-blue-600" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* TEAM NOTES */}
                              {step.notes && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 mb-2">Team Message</h4>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{step.notes}</p>
                                  </div>
                                </div>
                              )}

                              {/* CHAT */}
                              {activeChatStep === step.step && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 mb-2">Conversation</h4>
                                  
                                  <div className="space-y-2 mb-3 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                                    {(!chatMessages[step.step] || chatMessages[step.step].length === 0) ? (
                                      <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                                    ) : (
                                      chatMessages[step.step].map((msg, idx) => (
                                        <div
                                          key={idx}
                                          className={`p-2 rounded-lg text-sm ${
                                            msg.sender === 'client'
                                              ? 'bg-blue-100 ml-6'
                                              : 'bg-white border border-gray-200 mr-6'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs">
                                              {msg.sender === 'client' ? '👤 You' : '🏢 HDG'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(msg.sentAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-gray-900 whitespace-pre-wrap">{msg.message}</p>
                                          
                                          {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                              {msg.attachments.map((att, attIdx) => (
                                                <button
                                                  key={attIdx}
                                                  onClick={() => downloadAttachment(step.step, msg._id, att._id, att.filename)}
                                                  className="w-full flex items-center gap-2 px-2 py-1 bg-white rounded text-xs hover:bg-gray-50"
                                                >
                                                  <Paperclip className="w-3 h-3" />
                                                  <span className="flex-grow text-left truncate">{att.filename}</span>
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
                                    <div className="mb-2 space-y-1 p-2 bg-blue-50 rounded-lg">
                                      {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-1 bg-white rounded text-xs">
                                          <Paperclip className="w-3 h-3 text-blue-600" />
                                          <span className="flex-grow truncate">{file.filename}</span>
                                          <button onClick={() => removeSelectedFile(idx)}>
                                            <X className="w-3 h-3 text-red-600" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex gap-2">
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
                                      className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg transition-all"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                    </button>
                                    
                                    <textarea
                                      value={chatInput}
                                      onChange={(e) => setChatInput(e.target.value)}
                                      placeholder="Type your message..."
                                      rows="2"
                                      disabled={uploadingFiles}
                                      className="flex-grow px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] resize-none"
                                    />
                                    
                                    <button
                                      onClick={() => sendChatMessage(step.step)}
                                      disabled={(!chatInput.trim() && selectedFiles.length === 0) || uploadingFiles}
                                      className="px-3 py-2 bg-[#005670] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                                    >
                                      {uploadingFiles ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                      ) : (
                                        <Send className="w-4 h-4" />
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
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Internal Stage</h3>
                  <p className="text-gray-600">
                    This stage is being handled internally by our team. You'll be notified when action is needed!
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#005670] mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-center text-white/70 text-sm">
            <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
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