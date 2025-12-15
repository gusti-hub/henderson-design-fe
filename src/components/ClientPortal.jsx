import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  MapPin,
  Hash,
  Layers,
  Bell,
  FileText,
  Calendar,
  Info,
  User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import QuestionnaireModal from './QuestionnaireModal';

const ClientPortal = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [journeySteps, setJourneySteps] = useState([]);
  const [allJourneySteps, setAllJourneySteps] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const [expandedStep, setExpandedStep] = useState(null);
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
        console.log('📋 Questionnaire check response:', data);
        
        // ✅ FIX 1: Check hasCompletedQuestionnaire dari API response
        if (data.hasCompletedQuestionnaire) {
          console.log('✅ Questionnaire already completed');
          setShowQuestionnaire(false);
          return;
        }
        
        // ✅ FIX 2: Fallback check - cek apakah ada questionnaire dengan submittedAt
        if (data.questionnaires && data.questionnaires.length > 0) {
          const questionnaire = data.questionnaires[0];
          
          // Check jika submittedAt ada (berarti sudah submit)
          if (questionnaire.submittedAt) {
            console.log('✅ Questionnaire has submittedAt:', questionnaire.submittedAt);
            setShowQuestionnaire(false);
            return;
          }
          
          // Check jika isFirstTimeComplete true
          if (questionnaire.isFirstTimeComplete) {
            console.log('✅ Questionnaire isFirstTimeComplete');
            setShowQuestionnaire(false);
            return;
          }
        }
        
        // Jika semua check gagal, berarti belum diisi
        console.log('⚠️ Questionnaire not completed, showing form');
        setShowQuestionnaire(true);
        
      } else {
        // API error, assume perlu isi questionnaire
        console.log('⚠️ API error, showing questionnaire');
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.error('❌ Error checking questionnaire:', error);
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

  const toggleStep = (stepNumber) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
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

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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

        {/* HERO SECTION */}
        <div className="bg-gradient-to-br from-[#005670] to-[#007a9a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              {/* Welcome Section */}
              <div className="flex-1 min-w-[280px]">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {clientData.name}</h1>
                <p className="text-white/80 mb-4">Track your design journey</p>
                
                {/* Progress Bar */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Overall Progress</span>
                    <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-2">{completedMilestones} of {totalMilestones} steps completed</p>
                </div>
              </div>

              {/* Client Info Cards */}
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-[100px]">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-white/70" />
                    <p className="text-xs text-white/70 font-medium">Unit</p>
                  </div>
                  <p className="text-lg font-bold text-white">{clientData.unitNumber}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-white/70" />
                    <p className="text-xs text-white/70 font-medium">Floor Plan</p>
                  </div>
                  <p className="text-lg font-bold text-white">{clientData.floorPlan}</p>
                </div>

                {clientData.clientCode && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-[100px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-white/70" />
                      <p className="text-xs text-white/70 font-medium">Code</p>
                    </div>
                    <p className="text-lg font-bold text-white">{clientData.clientCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PENDING ACTIONS PANEL */}
        {showPendingPanel && pendingActions.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPendingPanel(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500" />
                  Action Required
                </h3>
                <button 
                  onClick={() => setShowPendingPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setExpandedStep(action.step);
                      setShowPendingPanel(false);
                    }}
                    className="w-full p-3 bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-400 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                            STEP {action.step}
                          </span>
                          <span className="text-xs text-gray-600">{action.stage}</span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT - VERTICAL TIMELINE */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isJourneyInitialized ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#005670]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#005670]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Journey Starting Soon</h3>
              <p className="text-gray-600">Your personalized design journey will begin shortly.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Journey Timeline */}
              <div className="relative">
                {journeySteps.map((step, index) => {
                  const config = getStatusConfig(step.status);
                  const Icon = config.icon;
                  const isExpanded = expandedStep === step.step;
                  const isLast = index === journeySteps.length - 1;
                  const hasDetails = step.notes || step.deadlineDate || step.completedDate || step.generatedDocuments?.length > 0 || step.description;

                  return (
                    <div key={step.step} className="relative">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div className={`absolute left-5 top-12 w-0.5 h-full ${
                          step.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} style={{ height: 'calc(100% + 16px)' }} />
                      )}

                      {/* Step Content */}
                      <div className="flex gap-4 pb-6">
                        {/* Status Icon */}
                        <div className={`
                          relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                          ${config.bgColor} ${config.pulse ? 'animate-pulse' : ''}
                        `}>
                          <Icon
                            className={`w-5 h-5 ${
                              step.status === 'completed'
                                ? 'text-emerald-600'
                                : 'text-white'
                            }`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          {/* Step Header */}
                          <div 
                            onClick={() => hasDetails && toggleStep(step.step)}
                            className={`${hasDetails ? 'cursor-pointer' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={`px-2 py-0.5 ${config.lightBg} ${config.textColor} text-xs font-bold rounded`}>
                                    {config.label.toUpperCase()}
                                  </span>
                                  {step.clientActionNeeded && step.status !== 'completed' && (
                                    <span className="text-xs px-2 py-0.5 bg-amber-500 text-white font-bold rounded">
                                      ACTION NEEDED
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                                
                                {/* Phase/Stage Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    📍 {step.stage}
                                  </span>
                                  {step.owner && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <UserIcon className="w-3 h-3" />
                                      {step.owner}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {hasDetails && (
                                <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Timestamp */}
                            <div className="space-y-1 mb-2">
                              {step.completedDate && (
                                <div className="flex items-center gap-2 text-xs text-emerald-700">
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="font-medium">Completed: {formatDateOnly(step.completedDate)}</span>
                                </div>
                              )}
                              {!step.completedDate && step.deadlineDate && step.status === 'in-progress' && (
                                <div className="flex items-center gap-2 text-xs text-blue-700">
                                  <Calendar className="w-3 h-3" />
                                  <span className="font-medium">Due: {formatDateOnly(step.deadlineDate)}</span>
                                </div>
                              )}
                              {step.updatedAt && step.status === 'in-progress' && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>Last updated: {formatDateTime(step.updatedAt)}</span>
                                </div>
                              )}
                            </div>

                            {/* Short description preview when collapsed */}
                            {!isExpanded && step.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                                {step.description}
                              </p>
                            )}
                            {!isExpanded && step.notes && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1 italic bg-blue-50 px-2 py-1 rounded">
                                💬 {step.notes}
                              </p>
                            )}
                          </div>

                          {/* EXPANDED DETAILS */}
                          {isExpanded && hasDetails && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                              
                              {/* Full Description */}
                              {step.description && (
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#005670]" />
                                    Description
                                  </h5>
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{step.description}</p>
                                  </div>
                                </div>
                              )}

                              {/* Step Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Completion Date */}
                                {step.completedDate && (
                                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      <span className="text-xs font-bold text-emerald-900">COMPLETED</span>
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-900">{formatDateOnly(step.completedDate)}</p>
                                  </div>
                                )}

                                {/* Deadline Date */}
                                {step.deadlineDate && !step.completedDate && (
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="w-4 h-4 text-blue-600" />
                                      <span className="text-xs font-bold text-blue-900">DUE DATE</span>
                                    </div>
                                    <p className="text-sm font-semibold text-blue-900">{formatDateOnly(step.deadlineDate)}</p>
                                  </div>
                                )}

                                {/* Auto Email Notification */}
                                {step.autoEmail && (
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Bell className="w-4 h-4 text-purple-600" />
                                      <span className="text-xs font-bold text-purple-900">AUTO NOTIFICATION</span>
                                    </div>
                                    <p className="text-xs text-purple-700">You'll receive an email update</p>
                                  </div>
                                )}

                                {/* Auto Generated Documents */}
                                {step.docAutoGenerated && (
                                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileText className="w-4 h-4 text-indigo-600" />
                                      <span className="text-xs font-bold text-indigo-900">DOCUMENT AUTO-GENERATED</span>
                                    </div>
                                    <p className="text-xs text-indigo-700">System will create required documents</p>
                                  </div>
                                )}
                              </div>

                              {/* DOCUMENTS */}
                              {step.generatedDocuments && step.generatedDocuments.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#005670]" />
                                    Available Documents
                                  </h5>
                                  <div className="space-y-2">
                                    {step.generatedDocuments.map((doc, docIdx) => (
                                      <button
                                        key={docIdx}
                                        onClick={() => downloadDocument(step.step, docIdx, doc.filename)}
                                        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-[#005670]/5 rounded-lg border border-gray-200 hover:border-[#005670] transition-all text-left group"
                                      >
                                        <FileText className="w-5 h-5 text-[#005670] flex-shrink-0" />
                                        <span className="flex-1 font-medium text-gray-900 text-sm truncate">
                                          {doc.filename}
                                        </span>
                                        <Download className="w-4 h-4 text-[#005670] group-hover:scale-110 transition-transform" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* TEAM NOTES */}
                              {step.notes && (
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#005670]" />
                                    Additional Information
                                  </h5>
                                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{step.notes}</p>
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
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <img 
                src="/images/HDG-Logo.png" 
                alt="Henderson Design Group" 
                className="h-8 w-auto mx-auto mb-3 opacity-60"
              />
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ClientPortal;