import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, 
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
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
  Palette,
  Package,
  Truck,
  Home as HomeIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import QuestionnaireModal from './QuestionnaireModal';

// ============================================================================
// SCROLLBAR STYLES
// ============================================================================
const scrollbarStyles = `
  /* Custom Scrollbar */
  .scrollbar-thin::-webkit-scrollbar {
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Firefox */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  /* Smooth scroll behavior */
  .scroll-smooth {
    scroll-behavior: smooth;
  }
`;

// ============================================================================
// PHASE CONFIGURATION - CLIENT FACING (8 PHASES)
// ============================================================================
const CLIENT_PHASES = [
  {
    id: 1,
    name: "Inquiry, Intake, and Qualification",
    label: "Getting Started",
    description: "We're getting to know you and confirming the basics.",
    color: "teal",
    icon: Sparkles,
    stages: ["Inquiry and Intake"],
    stepRange: [1, 7]
  },
  {
    id: 2,
    name: "Welcome, Portal, and Funding",
    label: "Portal & Deposit",
    description: "Access your portal, share preferences, and secure your project.",
    color: "teal",
    icon: Lock,
    stages: ["Welcome Portal Access", "Deposit and Agreements"],
    stepRange: [8, 21]
  },
  {
    id: 3,
    name: "Design Kickoff & Design Round 1",
    label: "Initial Design",
    description: "We're creating your first design presentation.",
    color: "purple",
    icon: Palette,
    stages: [
      "Design Kickoff - Internal Prep",
      "Design Round 1 - Presentation"
    ],
    stepRange: [22, 30]
  },
  {
    id: 4,
    name: "Design Revisions & Final Design Lock",
    label: "Design Refinement",
    description: "Refining and finalizing your design direction.",
    color: "purple",
    icon: Layers,
    stages: [
      "Design Round 2 - Revisions",
      "Final Design Approval"
    ],
    stepRange: [31, 41]
  },
  {
    id: 5,
    name: "Procurement Preparation & Order Placement",
    label: "Ordering Phase",
    description: "We're preparing vendors and placing orders.",
    color: "blue",
    icon: Package,
    stages: [
      "Progress Payment for Procurement to 50%",
      "Procurement Prep & Vendor Quotes",
      "Order Placement & Vendor Deposits"
    ],
    stepRange: [42, 52]
  },
  {
    id: 6,
    name: "Production, QC, and Freight",
    label: "Building & Shipping",
    description: "Your furniture is being built and shipped.",
    color: "blue",
    icon: Truck,
    stages: [
      "Production - In Progress",
      "Progress Payment to 75%",
      "Logistics & Export"
    ],
    stepRange: [53, 63]
  },
  {
    id: 7,
    name: "Arrival, Installation, and Punch",
    label: "Installation",
    description: "Final delivery and installation in your home.",
    color: "amber",
    icon: HomeIcon,
    stages: [
      "Arrival QC & Delivery Scheduling",
      "Final Payment Balance Due for Release of Product",
      "Installation & Punch List"
    ],
    stepRange: [64, 73]
  },
  {
    id: 8,
    name: "Closeout, Feedback, and Archive",
    label: "Project Complete",
    description: "Final walkthrough, handover, and project close.",
    color: "amber",
    icon: CheckCircle,
    stages: ["Reveal & Closeout"],
    stepRange: [74, 80]
  }
];

const ClientPortal = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  
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
      allStepsInPhase: [],
      status: 'not-started',
      progress: 0
    }));

    // Map ALL steps to phases based on STEP NUMBER
    allSteps.forEach(step => {
      const phaseIndex = phases.findIndex(phase => 
        step.step >= phase.stepRange[0] && step.step <= phase.stepRange[1]
      );

      if (phaseIndex !== -1) {
        phases[phaseIndex].allStepsInPhase.push(step);
      }
    });

    // Map VISIBLE steps to phases based on STEP NUMBER
    visibleSteps.forEach(step => {
      const phaseIndex = phases.findIndex(phase => 
        step.step >= phase.stepRange[0] && step.step <= phase.stepRange[1]
      );

      if (phaseIndex !== -1) {
        phases[phaseIndex].steps.push(step);
      }
    });

    // Calculate status and progress
    phases.forEach((phase, index) => {
      const allPhaseSteps = phase.allStepsInPhase;
      const visiblePhaseSteps = phase.steps;
      
      if (allPhaseSteps.length === 0) {
        phase.status = 'locked';
        phase.progress = 0;
        return;
      }

      const completedVisible = visiblePhaseSteps.filter(s => s.status === 'completed').length;
      const totalVisible = visiblePhaseSteps.length;
      phase.progress = totalVisible > 0 ? Math.round((completedVisible / totalVisible) * 100) : 0;

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

  // Auto-scroll to selected phase
  useEffect(() => {
    if (selectedPhase !== null && scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-phase-index="${selectedPhase}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedPhase]);

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

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
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
  
  // Helper functions for currentPhase colors
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
      <style>{scrollbarStyles}</style>
      
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

            {/* Team Assignment Section - NEW */}
            {clientData.teamAssignment && (clientData.teamAssignment.designer || clientData.teamAssignment.projectManager) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-5 h-5 text-[#005670]" />
                  <h3 className="text-sm font-bold text-gray-900">Your Project Team</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientData.teamAssignment.designer && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-700 font-semibold mb-0.5">Lead Designer</p>
                          <p className="text-base font-bold text-gray-900">{clientData.teamAssignment.designer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {clientData.teamAssignment.projectManager && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-700 font-semibold mb-0.5">Project Manager</p>
                          <p className="text-base font-bold text-gray-900">{clientData.teamAssignment.projectManager}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* {clientData.teamAssignment.designerAssistant && clientData.teamAssignment.designerAssistant !== 'TBD' && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-700 font-semibold mb-0.5">Design Assistant</p>
                          <p className="text-base font-bold text-gray-900">{clientData.teamAssignment.designerAssistant}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {clientData.teamAssignment.projectManagerAssistant && clientData.teamAssignment.projectManagerAssistant !== 'TBD' && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-700 font-semibold mb-0.5">PM Assistant</p>
                          <p className="text-base font-bold text-gray-900">{clientData.teamAssignment.projectManagerAssistant}</p>
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            )}
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

        {/* MAIN CONTENT */}
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
              {/* HORIZONTAL SCROLLABLE PHASE SELECTOR */}
              <div className="mb-8">
                {/* Navigation Hint */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-700">Your Project Phases</h3>
                  <span className="text-xs text-gray-500 hidden md:block">
                    ← Scroll to see all phases →
                  </span>
                </div>

                {/* Scrollable Container with Arrows */}
                <div className="relative">
                  {/* Left Arrow */}
                  <button
                    onClick={handleScrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 border border-gray-200 transition-all"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={handleScrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 border border-gray-200 transition-all"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Gradient Fades */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

                  {/* Scrollable Phase Cards - LEBIH COMPACT */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-3 overflow-x-auto pb-2 pt-4 px-10 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                  >
                    {phases.map((phase, index) => {
                      const PhaseIcon = phase.icon;
                      const isSelected = selectedPhase === index;
                      const isLocked = phase.status === 'locked';
                      const isCompleted = phase.status === 'completed';

                      // Get color classes
                      const getBg = () => {
                        switch(phase.color) {
                          case 'teal': return 'bg-[#005670]';
                          case 'purple': return 'bg-purple-600';
                          case 'blue': return 'bg-blue-600';
                          case 'amber': return 'bg-amber-600';
                          default: return 'bg-blue-600';
                        }
                      };
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
                      const getBgLight500 = () => {
                        switch(phase.color) {
                          case 'teal': return 'bg-[#007a9a]';
                          case 'purple': return 'bg-purple-500';
                          case 'blue': return 'bg-blue-500';
                          case 'amber': return 'bg-amber-500';
                          default: return 'bg-blue-500';
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

                      return (
                        <button
                          key={phase.id}
                          data-phase-index={index}
                          onClick={() => !isLocked && setSelectedPhase(index)}
                          disabled={isLocked}
                          className={`relative flex-shrink-0 w-52 p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? `${getBgLight()} ${getBorder()} shadow-lg scale-105` 
                              : isLocked
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                              : isCompleted
                              ? `bg-white ${getBorder()} hover:shadow-md`
                              : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                          }`}
                        >
                          {/* Phase Number Badge */}
                          <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-md text-white ${
                            isSelected ? getBg() : isCompleted ? getBg() : isLocked ? 'bg-gray-500' : getBg()
                          }`}>
                            {phase.id}
                          </div>

                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-sm ${
                            isSelected ? getBg() : isLocked ? 'bg-gray-500' : getBg()
                          }`}>
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-white" />
                            ) : (
                              <PhaseIcon className="w-5 h-5 text-white" />
                            )}
                          </div>

                          {/* Title */}
                          <h3 className={`font-bold text-sm mb-2 leading-tight ${
                            isSelected ? 'text-gray-900' : isLocked ? 'text-gray-400' : 'text-gray-800'
                          }`}>
                            {phase.label}
                          </h3>
                          
                          {/* Description - Only show when selected */}
                          {isSelected && (
                            <p className="text-xs text-gray-600 mb-2 leading-snug line-clamp-2">
                              {phase.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          {!isLocked && (
                            <div className="mb-2">
                              <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                                <div 
                                  className={`h-full transition-all duration-500 ${getBgLight500()}`}
                                  style={{ width: `${phase.progress}%` }}
                                />
                              </div>
                              <p className={`text-xs mt-1 font-semibold ${isSelected ? getText() : 'text-gray-600'}`}>
                                {phase.progress}% Complete
                              </p>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="flex items-center gap-1">
                            {isCompleted && (
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${getBg()} text-white`}>
                                <CheckCircle className="w-3 h-3" />
                                Done
                              </span>
                            )}
                            {phase.status === 'in-progress' && !isCompleted && (
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${getBg()} text-white`}>
                                <Clock className="w-3 h-3" />
                                Active
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-500 text-white">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            )}
                            {phase.status === 'available' && !isCompleted && phase.status !== 'in-progress' && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getBg()} text-white`}>
                                Ready
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
                      {currentPhase.steps.map((step) => {
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

                                  {/* Action Needed Badge */}
                                  {step.clientActionNeeded && !isStepCompleted && (
                                    <div className="flex-shrink-0">
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

        {/* FOOTER */}
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