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
  Zap,
  MapPin,
  Hash,
  Layers,
  Bell,
  FileText,
  Calendar,
  Info,
  User as UserIcon,
  Lock,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import QuestionnaireModal from './QuestionnaireModal';

// ============================================================================
// PHASE CONFIGURATION - CLIENT FACING (4 PHASES ONLY)
// ============================================================================
const CLIENT_PHASES = [
  {
    id: 1,
    name: "Introduction & Onboarding",
    label: "Getting Started",
    description: "I've met HDG, reviewed options, and decided to move forward.",
    color: "teal",  // Changed from green to teal (brand color)
    icon: Sparkles,
    stages: ["Inquiry and Intake", "Welcome Portal Access", "Deposit and Agreements"],
  },
  {
    id: 2,
    name: "Design & Approval",
    label: "Design Development",
    description: "We are shaping and confirming the design.",
    color: "purple",
    icon: Layers,
    stages: [
      "Design Kickoff - Internal Prep",
      "Design Round 1 - Presentation", 
      "Design Round 2 - Revisions",
      "Final Design Approval"
    ],
  },
  {
    id: 3,
    name: "Production & Planning",
    label: "Production & Scheduling",
    description: "Design is locked. Your project is being built and scheduled.",
    color: "blue",
    icon: Clock,
    stages: [
      "Progress Payment for Procurement to 50%",
      "Procurement Prep & Vendor Quotes",
      "Order Placement & Vendor Deposits",
      "Production - In Progress",
      "Progress Payment to 75%",
      "Logistics & Export",
      "Arrival QC & Delivery Scheduling"
    ],
  },
  {
    id: 4,
    name: "Delivery & Completion",
    label: "Delivery & Handover",
    description: "Execution, completion, and closeout.",
    color: "amber",
    icon: CheckCircle,
    stages: [
      "Final Payment Balance Due for Release of Product",
      "Installation & Punch List",
      "Reveal & Closeout"
    ],
  }
];

const ClientPortal = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [journeySteps, setJourneySteps] = useState([]);
  const [allJourneySteps, setAllJourneySteps] = useState([]);
  const [error, setError] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [showPendingPanel, setShowPendingPanel] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);

  // ============================================================================
  // PHASE MAPPING LOGIC
  // ============================================================================
  
  const mapStepsToPhases = (visibleSteps, allSteps) => {
    const phases = CLIENT_PHASES.map(phase => ({
      ...phase,
      steps: [],
      allStepsInPhase: [],  // Track ALL steps for status calculation
      status: 'not-started',
      progress: 0
    }));

    // First, map ALL steps (including non-visible) to determine phase status
    allSteps.forEach(step => {
      const phaseIndex = phases.findIndex(phase => 
        phase.stages.some(stage => 
          step.stage?.toLowerCase().includes(stage.toLowerCase()) ||
          stage.toLowerCase().includes(step.stage?.toLowerCase())
        )
      );

      if (phaseIndex !== -1) {
        phases[phaseIndex].allStepsInPhase.push(step);
      }
    });

    // Then, map VISIBLE steps for display
    visibleSteps.forEach(step => {
      const phaseIndex = phases.findIndex(phase => 
        phase.stages.some(stage => 
          step.stage?.toLowerCase().includes(stage.toLowerCase()) ||
          stage.toLowerCase().includes(step.stage?.toLowerCase())
        )
      );

      if (phaseIndex !== -1) {
        phases[phaseIndex].steps.push(step);
      }
    });

    // Calculate status and progress
    phases.forEach((phase, index) => {
      const allPhaseSteps = phase.allStepsInPhase;
      const visiblePhaseSteps = phase.steps;
      
      // If phase has NO steps at all (even non-visible), mark as locked
      if (allPhaseSteps.length === 0) {
        phase.status = 'locked';
        phase.progress = 0;
        return;
      }

      // Calculate progress from VISIBLE steps only (what user can see)
      const completedVisible = visiblePhaseSteps.filter(s => s.status === 'completed').length;
      const totalVisible = visiblePhaseSteps.length;
      phase.progress = totalVisible > 0 ? Math.round((completedVisible / totalVisible) * 100) : 0;

      // Determine phase status based on ALL steps (including hidden for accuracy)
      const completedAll = allPhaseSteps.filter(s => s.status === 'completed').length;
      const totalAll = allPhaseSteps.length;
      
      if (completedAll === totalAll && totalAll > 0) {
        phase.status = 'completed';
      } else if (completedAll > 0 || allPhaseSteps.some(s => s.status === 'in-progress')) {
        phase.status = 'in-progress';
      } else if (index === 0 || phases[index - 1].status === 'completed') {
        phase.status = 'available';
      } else {
        phase.status = 'locked';
      }
    });

    // Auto-select first active phase
    const firstActivePhase = phases.findIndex(p => p.status !== 'completed' && p.status !== 'locked');
    if (firstActivePhase !== -1 && selectedPhase === null) {
      setSelectedPhase(firstActivePhase);
    }

    return phases;
  };

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

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
        
        if (data.hasCompletedQuestionnaire) {
          setShowQuestionnaire(false);
          return;
        }
        
        if (data.questionnaires && data.questionnaires.length > 0) {
          const questionnaire = data.questionnaires[0];
          
          if (questionnaire.submittedAt || questionnaire.isFirstTimeComplete) {
            setShowQuestionnaire(false);
            return;
          }
        }
        
        setShowQuestionnaire(true);
        
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getColorClasses = (color) => {
    const colors = {
      teal: {
        bg: 'bg-[#005670]',
        bgLight: 'bg-[#007a9a]',
        text: 'text-[#005670]',
        textWhite: 'text-white',
        light: 'bg-[#e6f4f7]',
        border: 'border-[#007a9a]',
        ring: 'ring-[#005670]',
        darkBg: 'bg-[#004558]',
        textOnLight: 'text-[#004558]'
      },
      purple: {
        bg: 'bg-purple-600',
        bgLight: 'bg-purple-500',
        text: 'text-purple-600',
        textWhite: 'text-white',
        light: 'bg-purple-50',
        border: 'border-purple-200',
        ring: 'ring-purple-500',
        darkBg: 'bg-purple-700',
        textOnLight: 'text-purple-700'
      },
      blue: {
        bg: 'bg-blue-600',
        bgLight: 'bg-blue-500',
        text: 'text-blue-600',
        textWhite: 'text-white',
        light: 'bg-blue-50',
        border: 'border-blue-200',
        ring: 'ring-blue-500',
        darkBg: 'bg-blue-700',
        textOnLight: 'text-blue-700'
      },
      amber: {
        bg: 'bg-amber-600',
        bgLight: 'bg-amber-500',
        text: 'text-amber-600',
        textWhite: 'text-white',
        light: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'ring-amber-500',
        darkBg: 'bg-amber-700',
        textOnLight: 'text-amber-700'
      }
    };
    return colors[color] || colors.blue;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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

  const phases = mapStepsToPhases(journeySteps, allJourneySteps);
  const overallProgress = phases.reduce((acc, p) => acc + p.progress, 0) / phases.length || 0;
  const isJourneyInitialized = journeySteps.length > 0;
  const currentPhase = selectedPhase !== null ? phases[selectedPhase] : null;
  
  // Helper functions for currentPhase colors (explicit for Tailwind)
  const getCurrentPhaseBg = () => {
    if (!currentPhase) return 'bg-blue-600';
    switch(currentPhase.color) {
      case 'teal': return 'bg-[#005670]';
      case 'purple': return 'bg-purple-600';
      case 'blue': return 'bg-blue-600';
      case 'amber': return 'bg-amber-600';
      default: return 'bg-blue-600';
    }
  };
  const getCurrentPhaseBgLight = () => {
    if (!currentPhase) return 'bg-blue-500';
    switch(currentPhase.color) {
      case 'teal': return 'bg-[#007a9a]';
      case 'purple': return 'bg-purple-500';
      case 'blue': return 'bg-blue-500';
      case 'amber': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

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

        {/* HERO SECTION - REDESIGNED */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[280px]">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {clientData.name}</h1>
                  <p className="text-gray-600 text-base">Track your design journey with Henderson Design Group</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <div className="bg-gray-50 rounded-xl p-4 min-w-[110px] border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-[#005670]" />
                      <p className="text-xs text-gray-600 font-semibold">Unit</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{clientData.unitNumber}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 min-w-[130px] border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-[#005670]" />
                      <p className="text-xs text-gray-600 font-semibold">Floor Plan</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{clientData.floorPlan}</p>
                  </div>

                  {clientData.clientCode && (
                    <div className="bg-gray-50 rounded-xl p-4 min-w-[110px] border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4 text-[#005670]" />
                        <p className="text-xs text-gray-600 font-semibold">Code</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{clientData.clientCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-white">Overall Project Progress</span>
                <span className="text-4xl font-bold text-white">{Math.round(overallProgress)}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-white/80 text-sm mt-3">
                {overallProgress < 25 ? "Just getting started! 🚀" :
                 overallProgress < 50 ? "Making great progress! 💪" :
                 overallProgress < 75 ? "More than halfway there! 🎯" :
                 overallProgress < 100 ? "Almost done! 🎉" :
                 "Project complete! ✨"}
              </p>
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
                      const phaseIndex = phases.findIndex(p => p.steps.some(s => s.step === action.step));
                      setSelectedPhase(phaseIndex);
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

        {/* MAIN CONTENT - HORIZONTAL PHASES */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isJourneyInitialized ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#005670]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#005670]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Journey Starting Soon</h3>
              <p className="text-gray-600">Your personalized design journey will begin shortly.</p>
            </div>
          ) : (
            <div>
              {/* HORIZONTAL PHASE SELECTOR */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {phases.map((phase, index) => {
                    const PhaseIcon = phase.icon;
                    const colors = getColorClasses(phase.color);
                    const isSelected = selectedPhase === index;
                    const isLocked = phase.status === 'locked';
                    const isCompleted = phase.status === 'completed';

                    // Get explicit class names based on phase color
                    const getBgLight = () => {
                      switch(phase.color) {
                        case 'teal': return 'bg-[#e6f4f7]';
                        case 'purple': return 'bg-purple-50';
                        case 'blue': return 'bg-blue-50';
                        case 'amber': return 'bg-amber-50';
                        default: return 'bg-blue-50';
                      }
                    };
                    const getBorder = () => {
                      switch(phase.color) {
                        case 'teal': return 'border-[#007a9a]';
                        case 'purple': return 'border-purple-200';
                        case 'blue': return 'border-blue-200';
                        case 'amber': return 'border-amber-200';
                        default: return 'border-blue-200';
                      }
                    };
                    const getRing = () => {
                      switch(phase.color) {
                        case 'teal': return 'ring-[#005670]';
                        case 'purple': return 'ring-purple-500';
                        case 'blue': return 'ring-blue-500';
                        case 'amber': return 'ring-amber-500';
                        default: return 'ring-blue-500';
                      }
                    };
                    const getBg = () => {
                      switch(phase.color) {
                        case 'teal': return 'bg-[#005670]';
                        case 'purple': return 'bg-purple-600';
                        case 'blue': return 'bg-blue-600';
                        case 'amber': return 'bg-amber-600';
                        default: return 'bg-blue-600';
                      }
                    };
                    const getText = () => {
                      switch(phase.color) {
                        case 'teal': return 'text-[#005670]';
                        case 'purple': return 'text-purple-600';
                        case 'blue': return 'text-blue-600';
                        case 'amber': return 'text-amber-600';
                        default: return 'text-blue-600';
                      }
                    };
                    const getBgLight500 = () => {
                      switch(phase.color) {
                        case 'teal': return 'bg-[#007a9a]';
                        case 'purple': return 'bg-purple-500';
                        case 'blue': return 'bg-blue-500';
                        case 'amber': return 'bg-amber-500';
                        default: return 'bg-blue-500';
                      }
                    };

                    return (
                      <button
                        key={phase.id}
                        onClick={() => !isLocked && setSelectedPhase(index)}
                        disabled={isLocked}
                        className={`
                          relative p-5 rounded-xl text-left transition-all cursor-pointer
                          ${isSelected 
                            ? `${getBgLight()} border-3 ${getBorder()} shadow-xl scale-[1.02] ring-2 ${getRing()} ring-opacity-30` 
                            : isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                            : isCompleted
                            ? `bg-white ${getText()} hover:shadow-md border-2 ${getBorder()}`
                            : `bg-white border-2 border-gray-200 hover:shadow-md hover:${getBorder()}`
                          }
                        `}
                      >
                        {/* Phase Number Badge */}
                        <div className={`
                          absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shadow-md text-white
                          ${isSelected ? getBg() : isCompleted ? getBg() : isLocked ? 'bg-gray-500' : getBg()}
                        `}>
                          {phase.id}
                        </div>

                        {/* Icon */}
                        <div className={`
                          w-12 h-12 rounded-lg flex items-center justify-center mb-3 shadow-sm
                          ${isSelected ? getBg() : isLocked ? 'bg-gray-500' : getBg()}
                        `}>
                          {isLocked ? (
                            <Lock className="w-6 h-6 text-white" />
                          ) : (
                            <PhaseIcon className="w-6 h-6 text-white" />
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`font-bold text-base mb-2 leading-tight ${isSelected ? 'text-gray-900' : isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                          {phase.label}
                        </h3>
                        
                        {/* Description - Only show on selected */}
                        {isSelected && (
                          <p className="text-xs text-gray-600 mb-2 italic leading-relaxed">
                            {phase.description}
                          </p>
                        )}

                        {/* Progress */}
                        {!isLocked && (
                          <div className="mb-2">
                            <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                              <div 
                                className={`h-full transition-all duration-500 ${getBgLight500()}`}
                                style={{ width: `${phase.progress}%` }}
                              />
                            </div>
                            <p className={`text-xs mt-1.5 font-semibold ${isSelected ? getText() : 'text-gray-600'}`}>
                              {phase.progress}% Complete
                            </p>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${getBg()} text-white`}>
                              <CheckCircle className="w-3 h-3" />
                              Done
                            </span>
                          )}
                          {phase.status === 'in-progress' && !isCompleted && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${getBg()} text-white`}>
                              <Clock className="w-3 h-3" />
                              Active
                            </span>
                          )}
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-gray-500 text-white">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                          {phase.status === 'available' && !isCompleted && phase.status !== 'in-progress' && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getBg()} text-white`}>
                              Ready
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PHASE DETAILS - VERTICAL STEPS */}
              {currentPhase && currentPhase.status !== 'locked' && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
                    <div className={`w-14 h-14 ${getCurrentPhaseBg()} rounded-xl flex items-center justify-center shadow-md`}>
                      {React.createElement(currentPhase.icon, { className: "w-7 h-7 text-white" })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">{currentPhase.label}</h2>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${getCurrentPhaseBg()} text-white`}>
                          PHASE {currentPhase.id}
                        </span>
                      </div>
                      <p className="text-gray-600 italic text-sm">{currentPhase.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{currentPhase.progress}%</div>
                      <div className="text-xs text-gray-500 font-medium mb-2">Complete</div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getCurrentPhaseBgLight()}`}
                          style={{ width: `${currentPhase.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* VERTICAL STEPS LIST */}
                  {currentPhase.steps.length > 0 ? (
                    <div className="space-y-3">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                          <span className={`w-1 h-5 ${getCurrentPhaseBg()} rounded-full`}></span>
                          What's Happening Now
                        </h3>
                        <p className="text-sm text-gray-600 ml-3">
                          Here are your current milestones. We'll guide you through each one.
                        </p>
                      </div>
                      {currentPhase.steps.map((step, stepIdx) => {
                        const isStepCompleted = step.status === 'completed';
                        const isStepInProgress = step.status === 'in-progress';
                        
                        return (
                          <div 
                            key={step.step}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isStepCompleted ? 'bg-[#e6f4f7] border-[#007a9a]' :
                              isStepInProgress ? 'bg-blue-50 border-blue-300' :
                              'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Step Status Icon */}
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                isStepCompleted ? 'bg-[#005670]' :
                                isStepInProgress ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}>
                                {isStepCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : isStepInProgress ? (
                                  <Clock className="w-5 h-5 text-white" />
                                ) : (
                                  <Circle className="w-5 h-5 text-white" />
                                )}
                              </div>

                              {/* Step Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-base mb-1">{step.title}</h4>
                                    
                                    {step.description && (
                                      <p className="text-sm text-gray-700 mb-2 leading-relaxed">{step.description}</p>
                                    )}

                                    {/* Dates */}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                      {step.completedDate && (
                                        <span className="flex items-center gap-1.5 text-[#004558] font-semibold bg-[#e6f4f7] px-2.5 py-1 rounded-md">
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          Completed {formatDateOnly(step.completedDate)}
                                        </span>
                                      )}
                                      {!step.completedDate && step.deadlineDate && (
                                        <span className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-100 px-2.5 py-1 rounded-md">
                                          <Calendar className="w-3.5 h-3.5" />
                                          Due {formatDateOnly(step.deadlineDate)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Needed Badge with Info */}
                                  {step.clientActionNeeded && !isStepCompleted && (
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg mb-2">
                                        <Zap className="w-3.5 h-3.5" />
                                        Action Required
                                      </span>
                                      <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        Our team will contact you via email
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Documents */}
                                {step.generatedDocuments && step.generatedDocuments.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-[#005670]" />
                                      Your Documents (Click to Download):
                                    </p>
                                    {step.generatedDocuments.map((doc, docIdx) => (
                                      <button
                                        key={docIdx}
                                        onClick={() => downloadDocument(step.step, docIdx, doc.filename)}
                                        className="flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-[#005670] rounded-lg border-2 border-[#005670] transition-all text-xs group w-full"
                                      >
                                        <FileText className="w-4 h-4 text-[#005670] group-hover:text-white flex-shrink-0 transition-colors" />
                                        <span className="flex-1 text-left text-gray-900 group-hover:text-white font-semibold truncate transition-colors">
                                          {doc.filename}
                                        </span>
                                        <Download className="w-4 h-4 text-[#005670] group-hover:text-white transition-colors" />
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Notes */}
                                {step.notes && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start gap-2">
                                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-blue-900 mb-0.5">Additional Info</p>
                                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{step.notes}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Steps Yet</h3>
                      <p className="text-gray-600">Your milestones will appear here as your project progresses.</p>
                      <p className="text-gray-500 text-sm mt-2">We'll notify you when there are updates!</p>
                    </div>
                  )}
                </div>
              )}

              {/* LOCKED PHASE MESSAGE */}
              {currentPhase && currentPhase.status === 'locked' && (
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-gray-100">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Lock className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Coming Soon!</h3>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    This phase will unlock after you complete the current milestones.
                  </p>
                  <button
                    onClick={() => {
                      const prevPhase = phases.findIndex(p => p.status !== 'completed' && p.status !== 'locked');
                      if (prevPhase !== -1) setSelectedPhase(prevPhase);
                    }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#005670] text-white rounded-xl hover:bg-[#004558] transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                    Back to Active Phase
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* FOOTER - MINIMAL */}
        <footer className="bg-[#005670] border-t border-[#004558] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <img 
                src="/images/HDG-Logo.png" 
                alt="Henderson Design Group" 
                className="h-8 w-auto brightness-0 invert"
              />
              <p className="text-white/80 text-sm">
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