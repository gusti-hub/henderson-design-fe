// ClientPortal.jsx - Elegant & Interactive Design
import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  CheckCircle,
  Circle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  User,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Send,
  Paperclip,
  Download,
  CalendarClock,
  Home,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import QuestionnaireModal from './QuestionnaireModal';

const ClientPortal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [journeySteps, setJourneySteps] = useState([]);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [activeChatStep, setActiveChatStep] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);

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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!clientResponse.ok) throw new Error('Unable to fetch client data');

    const result = await clientResponse.json();
    
    // ✅ PERBAIKI: Extract data dari nested response
    const clientData = result.data || result;
    
    console.log('📊 Client data:', clientData); // Debug log
    
    setClientData(clientData);

    // ✅ PERBAIKI: Validasi data sebelum check questionnaire
    if (clientData?.email && clientData?.unitNumber) {
      await checkQuestionnaireStatus(clientData);
    } else {
      console.warn('⚠️ Missing email or unitNumber:', clientData);
      setCheckingQuestionnaire(false);
    }

    try {
      const journeyResponse = await fetch(`${backendServer}/api/journeys/client/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (journeyResponse.ok) {
        const journeyData = await journeyResponse.json();
        setJourneySteps(journeyData.steps || []);
        
        const currentPhase = journeyData.steps?.find(s => 
          s.status === 'in-progress' || s.status === 'pending'
        );
        if (currentPhase) {
          setExpandedPhase(currentPhase.step);
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
    setCheckingQuestionnaire(false); // ✅ Tambahkan
  }
};

  const checkQuestionnaireStatus = async (clientData) => {
    try {
      setCheckingQuestionnaire(true);
      
      // ✅ PERBAIKI: Langsung akses clientData.email (bukan clientData.data.email)
      console.log('🔍 Checking questionnaire for:', clientData.email, clientData.unitNumber);
      
      const response = await fetch(
        `${backendServer}/api/questionnaires/my-questionnaires?email=${clientData.email}&unitNumber=${clientData.unitNumber}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
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
        console.log('⚠️ Questionnaire check failed:', response.status);
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

  const togglePhase = async (stepNumber) => {
    if (expandedPhase === stepNumber) {
      setExpandedPhase(null);
      setActiveChatStep(null);
    } else {
      setExpandedPhase(stepNumber);
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

  const sendChatMessage = async (stepNumber) => {
    if (!chatInput.trim()) return;

    try {
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
            message: chatInput,
            attachments: []
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.chat.messages }));
        setChatInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getDisplayMilestones = () => {
    if (journeySteps.length > 0) {
      return journeySteps.map(step => ({
        phase: step.step,
        title: step.title,
        description: step.description,
        status: step.status,
        estimatedDate: step.estimatedDate,
        actualDate: step.actualDate,
        notes: step.notes,
        updatedBy: step.updatedBy,
        updatedAt: step.updatedAt,
        subSteps: step.subSteps || [],
        email: step.email,
        clientAction: step.clientAction,
        phaseGroup: step.phase
      }));
    }
    
    return [
      { phase: 1, title: "Initial Client Contact & Portal Setup", status: 'not-started', description: "Introduction, portal setup, and client information gathering", phaseGroup: "Introduction" },
      { phase: 2, title: "First Meeting Scheduling", status: 'not-started', description: "Client schedules initial consultation meeting", phaseGroup: "Introduction" },
      { phase: 3, title: "Initial Consultation & Pricing Review", status: 'not-started', description: "HDG meets client to review pricing", phaseGroup: "Introduction" },
      { phase: 4, title: "Contract Preparation & Delivery", status: 'not-started', description: "Contract and funding instructions preparation", phaseGroup: "Contract" },
      { phase: 5, title: "Client Contract Execution & Payment", status: 'not-started', description: "Client signs contract and submits payment", phaseGroup: "Contract" },
      { phase: 6, title: "Contract Confirmation & Design Meeting Setup", status: 'not-started', description: "Confirm receipt and schedule design meeting", phaseGroup: "Contract" },
      { phase: 7, title: "Design Meeting 1 & Presentation Prep", status: 'not-started', description: "First design meeting and preparation", phaseGroup: "Design" },
      { phase: 8, title: "Presentation 1 & Revisions", status: 'not-started', description: "First design presentation and revisions", phaseGroup: "Design" },
      { phase: 9, title: "Presentation 2 & Revisions", status: 'not-started', description: "Second design presentation (as needed)", phaseGroup: "Design" },
      { phase: 10, title: "Presentation 3 & Revisions", status: 'not-started', description: "Third design presentation (as needed)", phaseGroup: "Design" },
      { phase: 11, title: "Final Design Approval", status: 'not-started', description: "Client approves final design", phaseGroup: "Design" },
      { phase: 12, title: "Final Proposal Preparation & Delivery", status: 'not-started', description: "Final proposal preparation", phaseGroup: "Proposal" },
      { phase: 13, title: "Client Proposal Execution & Payment", status: 'not-started', description: "Client signs and pays proposal", phaseGroup: "Proposal" },
      { phase: 14, title: "Proposal Payment Confirmation", status: 'not-started', description: "Confirmation of proposal receipt", phaseGroup: "Proposal" },
      { phase: 15, title: "Vendor Orders & Production Start", status: 'not-started', description: "Vendor order processing", phaseGroup: "Production Prep" },
      { phase: 16, title: "Production Start Notification", status: 'not-started', description: "Notify client of production start", phaseGroup: "Production Prep" },
      { phase: 17, title: "Production Management & First Progress Payment", status: 'not-started', description: "Production oversight and payment", phaseGroup: "Manufacturing" },
      { phase: 18, title: "First Progress Payment Confirmation", status: 'not-started', description: "Confirm 25% payment receipt", phaseGroup: "Manufacturing" },
      { phase: 19, title: "Vendor Final Payment & Shipping", status: 'not-started', description: "Final vendor payment and shipping", phaseGroup: "Manufacturing" },
      { phase: 20, title: "Final Balance Invoice & Payment", status: 'not-started', description: "Final payment processing", phaseGroup: "Shipping" },
      { phase: 21, title: "Final Payment Confirmation", status: 'not-started', description: "Confirm final payment receipt", phaseGroup: "Shipping" },
      { phase: 22, title: "Delivery Coordination & Installation", status: 'not-started', description: "Delivery and installation", phaseGroup: "Delivery" },
      { phase: 23, title: "Final Walkthrough Scheduling", status: 'not-started', description: "Schedule final walkthrough", phaseGroup: "Delivery" }
    ];
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'emerald',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-800',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          iconColor: 'text-emerald-600',
          label: 'Completed'
        };
      case 'in-progress':
        return {
          icon: Clock,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800',
          iconColor: 'text-blue-600',
          label: 'In Progress',
          pulse: true
        };
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'amber',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-800',
          badgeColor: 'bg-amber-100 text-amber-800',
          iconColor: 'text-amber-600',
          label: 'Pending'
        };
      default:
        return {
          icon: Circle,
          color: 'gray',
          bgColor: 'bg-white',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-700',
          iconColor: 'text-gray-400',
          label: 'Not Started'
        };
    }
  };

  if (loading || checkingQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">
            {checkingQuestionnaire ? 'Loading your information...' : 'Loading your project...'}
          </p>
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

  const displayMilestones = getDisplayMilestones();
  const isJourneyInitialized = journeySteps.length > 0;
  const completedMilestones = displayMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = displayMilestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <>
      {showQuestionnaire && (
        <QuestionnaireModal 
          onComplete={handleQuestionnaireComplete}
          userData={clientData}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        {/* ELEGANT HEADER */}
        <header className="bg-[#005670] shadow-lg sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/images/HDG-Logo.png" 
                  alt="Henderson Design Group" 
                  className="h-10 w-auto brightness-0 invert"
                />
                <div className="hidden sm:block border-l border-white/30 pl-4">
                  <p className="text-xs text-white/70 tracking-widest uppercase">Ālia Collections</p>
                  <p className="text-sm text-white font-medium">Client Portal</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* WELCOME SECTION - Elegant & Compact */}
          <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-7 h-7" />
                <h1 className="text-3xl lg:text-4xl font-bold">Welcome, {clientData.name}!</h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-base text-white">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span className="font-semibold">Unit {clientData.unitNumber}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>{clientData.floorPlan}</span>
                </div>
                {clientData.clientCode && (
                  <>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                      <span>Code: <span className="font-semibold">{clientData.clientCode}</span></span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* JOURNEY SECTION - Clean & Interactive */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            {/* HEADER WITH PROGRESS */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Your Project Journey</h2>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#005670]">
                    {progressPercentage}%
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 font-medium">Complete</p>
                </div>
              </div>

              {/* ELEGANT PROGRESS BAR */}
              <div className="relative">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#005670] to-[#00a8cc] transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-700 font-medium">
                    <span className="font-bold text-[#005670]">{completedMilestones}</span> of {totalMilestones} steps
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {totalMilestones - completedMilestones} remaining
                  </span>
                </div>
              </div>
            </div>

            {/* JOURNEY NOT INITIALIZED */}
            {!isJourneyInitialized && (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Journey Starting Soon</h3>
                <p className="text-sm text-gray-700 max-w-md mx-auto font-medium">
                  Your design journey will begin shortly. Our team is preparing your personalized project timeline.
                </p>
              </div>
            )}

            {/* STEP CARDS - Compact & Clear */}
            <div className="space-y-3">
              {displayMilestones.map((milestone, index) => {
                const config = getStatusConfig(milestone.status);
                const Icon = config.icon;
                const isExpanded = expandedPhase === milestone.phase;
                const hasDetails = milestone.notes || milestone.estimatedDate || milestone.actualDate;
                const hasSubSteps = milestone.subSteps && milestone.subSteps.length > 0;
                const hasChatMessages = chatMessages[milestone.phase]?.length > 0;
                const unreadCount = chatMessages[milestone.phase]?.filter(m => !m.read && m.sender === 'admin').length || 0;
                const isLast = index === displayMilestones.length - 1;

                return (
                  <div key={milestone.phase} className="relative">
                    {/* CONNECTING LINE */}
                    {!isLast && (
                      <div className="absolute left-[21px] top-[60px] w-0.5 h-6 bg-gray-200"></div>
                    )}

                    {/* STEP CARD */}
                    <div 
                      className={`
                        relative rounded-xl transition-all duration-300 border
                        ${isExpanded ? 'shadow-lg' : 'shadow hover:shadow-md'}
                        ${milestone.status !== 'not-started' ? `${config.bgColor} ${config.borderColor}` : 'bg-white border-gray-200'}
                      `}
                    >
                      {/* MAIN CARD CONTENT */}
                      <div 
                        onClick={() => (hasDetails || hasSubSteps || hasChatMessages) && togglePhase(milestone.phase)}
                        className={`p-4 ${(hasDetails || hasSubSteps || hasChatMessages) ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* STATUS ICON */}
                          <div className={`
                            flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center shadow-sm border border-white
                            bg-gradient-to-br from-white to-gray-50
                            ${config.pulse ? 'animate-pulse' : ''}
                          `}>
                            <Icon className={`w-5 h-5 ${config.iconColor}`} />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-grow min-w-0">
                            {/* BADGES */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`text-xs font-bold ${config.textColor} tracking-wide`}>
                                STEP {milestone.phase}
                              </span>
                              <span className={`px-3 py-1 ${config.badgeColor} text-xs font-bold rounded-full`}>
                                {config.label.toUpperCase()}
                              </span>
                              {milestone.phaseGroup && (
                                <span className="text-xs text-gray-700 font-semibold px-2.5 py-1 bg-gray-100 rounded-full border border-gray-300">
                                  {milestone.phaseGroup}
                                </span>
                              )}
                              {unreadCount > 0 && (
                                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                  {unreadCount} New
                                </span>
                              )}
                            </div>

                            {/* TITLE */}
                            <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug">
                              {milestone.title}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                              {milestone.description}
                            </p>

                            {/* QUICK INFO */}
                            {milestone.status !== 'not-started' && (
                              <div className="flex items-center gap-4 flex-wrap">
                                {milestone.actualDate && (
                                  <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>Done {formatDate(milestone.actualDate)}</span>
                                  </div>
                                )}
                                {!milestone.actualDate && milestone.estimatedDate && (
                                  <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                    <CalendarClock className="w-4 h-4 text-blue-600" />
                                    <span>By {formatDate(milestone.estimatedDate)}</span>
                                  </div>
                                )}
                                {milestone.notes && (
                                  <div className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Team message</span>
                                  </div>
                                )}
                                {hasSubSteps && (
                                  <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                    <FileText className="w-4 h-4" />
                                    <span>{milestone.subSteps.filter(s => s.completed).length}/{milestone.subSteps.length} tasks</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* EXPAND BUTTON */}
                          {(hasDetails || hasSubSteps || hasChatMessages) && (
                            <button className="flex-shrink-0 w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm border border-gray-200">
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
                      {isExpanded && (hasDetails || hasSubSteps || hasChatMessages) && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                          <div className="bg-white/50 rounded-lg p-4 space-y-4">
                            {/* SUB-STEPS */}
                            {hasSubSteps && (
                              <div>
                                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                                  <FileText className="w-5 h-5" />
                                  Tasks in this Step
                                </h4>
                                <div className="space-y-2">
                                  {milestone.subSteps.map((subStep, idx) => (
                                    <div 
                                      key={idx}
                                      className={`
                                        flex items-start gap-3 p-3 rounded-lg border
                                        ${subStep.completed 
                                          ? 'bg-green-50 border-green-300' 
                                          : 'bg-white border-gray-300'}
                                      `}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {subStep.completed ? (
                                          <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="flex-grow">
                                        <p className={`text-sm font-semibold ${subStep.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                                          {subStep.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                          {subStep.email && (
                                            <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-bold border border-blue-300">
                                              📧 Email
                                            </span>
                                          )}
                                          {subStep.clientAction && (
                                            <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-bold border border-purple-300">
                                              👤 Your Action
                                            </span>
                                          )}
                                          {subStep.completed && subStep.completedAt && (
                                            <span className="text-xs text-gray-600 font-medium">
                                              ✓ {formatDate(subStep.completedAt)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* TIMELINE */}
                            {(milestone.estimatedDate || milestone.actualDate) && (
                              <div>
                                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                                  <Calendar className="w-5 h-5" />
                                  Timeline
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {milestone.estimatedDate && (
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-300">
                                      <p className="text-xs text-blue-800 font-bold mb-1">Estimated Date</p>
                                      <p className="text-base font-bold text-gray-900">{formatDate(milestone.estimatedDate)}</p>
                                    </div>
                                  )}
                                  {milestone.actualDate && (
                                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-300">
                                      <p className="text-xs text-emerald-800 font-bold mb-1">Completed On</p>
                                      <p className="text-base font-bold text-gray-900">{formatDate(milestone.actualDate)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* TEAM NOTES */}
                            {milestone.notes && (
                              <div>
                                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                                  <MessageSquare className="w-5 h-5" />
                                  Message from Our Team
                                </h4>
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
                                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap font-medium">
                                    {milestone.notes}
                                  </p>
                                  {milestone.updatedBy && (
                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-blue-200">
                                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-gray-900">{milestone.updatedBy.name}</p>
                                        <p className="text-xs text-gray-600 font-medium">
                                          {milestone.updatedAt && `Updated ${formatDate(milestone.updatedAt)}`}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* CHAT SECTION */}
                            {activeChatStep === milestone.phase && (
                              <div>
                                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                                  <MessageSquare className="w-5 h-5" />
                                  Conversation
                                </h4>

                                {/* MESSAGES */}
                                <div className="space-y-2.5 mb-3 max-h-80 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-300">
                                  {(!chatMessages[milestone.phase] || chatMessages[milestone.phase].length === 0) ? (
                                    <p className="text-sm text-gray-600 text-center py-8 font-medium">
                                      No messages yet. Start a conversation!
                                    </p>
                                  ) : (
                                    chatMessages[milestone.phase].map((msg, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-3 rounded-lg shadow-sm border ${
                                          msg.sender === 'client'
                                            ? 'bg-blue-50 border-blue-300 ml-8'
                                            : 'bg-white border-gray-300 mr-8'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-bold text-sm text-gray-900">
                                            {msg.sender === 'client' ? '👤 You' : '🏢 HDG'}
                                          </span>
                                          <span className="text-xs text-gray-600 font-medium">
                                            {new Date(msg.sentAt).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: 'numeric',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                          {msg.message}
                                        </p>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {msg.attachments.map((att, attIdx) => (
                                              <button
                                                key={attIdx}
                                                className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 shadow-sm border border-gray-300"
                                              >
                                                <Paperclip className="w-3.5 h-3.5" />
                                                {att.filename}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* SEND MESSAGE */}
                                <div className="flex gap-2">
                                  <textarea
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type your message..."
                                    rows="2"
                                    className="flex-grow px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent resize-none"
                                  />
                                  <button
                                    onClick={() => sendChatMessage(milestone.phase)}
                                    disabled={!chatInput.trim()}
                                    className="px-5 py-2.5 bg-[#005670] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                                  >
                                    <Send className="w-4 h-4" />
                                    <span className="hidden sm:inline">Send</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM CARDS - Compact & Clean */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* PAYMENT INFO */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-sm text-gray-700 font-semibold">Down Payment</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${clientData.paymentInfo?.paidDownPayment?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-sm text-gray-700 font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${clientData.paymentInfo?.totalAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-semibold">Status</span>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                    clientData.paymentInfo?.downPaymentStatus === 'paid' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {clientData.paymentInfo?.downPaymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* CONTACT SUPPORT */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Need Help?</h2>
              </div>
              
              <p className="text-sm text-gray-700 mb-5 leading-relaxed font-medium">
                Our team is here to assist you every step of the way.
              </p>
              
              <div className="space-y-3">
                <a 
                  href="mailto:info@henderson.house"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all group border border-gray-300"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                    <Mail className="w-5 h-5 text-[#005670]" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-sm text-gray-900 group-hover:text-[#005670] transition-colors">Email Us</p>
                    <p className="text-xs text-gray-700 font-medium">aloha@henderson.house</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#005670] transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-[#005670] mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-center text-white/70 text-sm">
            <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
          </div>
        </footer>

        {/* ANIMATIONS */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default ClientPortal;