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
  CalendarClock,
  AlertCircle,
  CheckCircle2
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
  const [error, setError] = useState('');
  
  // ✅ NEW: Questionnaire state
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
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!clientResponse.ok) throw new Error('Unable to fetch client data');

      const clientData = await clientResponse.json();
      setClientData(clientData);

      // ✅ Check if questionnaire is completed
      await checkQuestionnaireStatus(clientData);

      // Fetch journey data
      try {
        const journeyResponse = await fetch(`${backendServer}/api/journeys/client/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (journeyResponse.ok) {
          const journeyData = await journeyResponse.json();
          setJourneySteps(journeyData.steps || []);
          
          // Auto-expand first in-progress or pending phase
          const currentPhase = journeyData.steps?.find(s => 
            s.status === 'in-progress' || s.status === 'pending'
          );
          if (currentPhase) {
            setExpandedPhase(currentPhase.stepNumber);
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
    }
  };

  // ✅ NEW: Check questionnaire completion status
  const checkQuestionnaireStatus = async (clientData) => {
    try {
      setCheckingQuestionnaire(true);
      
      const response = await fetch(
        `${backendServer}/api/questionnaires/my-questionnaires?email=${clientData.email}&unitNumber=${clientData.unitNumber}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if there's a submitted questionnaire
        const hasCompleted = data.questionnaires?.some(
          q => q.status === 'submitted' || q.status === 'under-review' || q.status === 'approved'
        );
        
        if (!hasCompleted) {
          setShowQuestionnaire(true);
        }
      } else {
        // No questionnaire found - show modal
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.error('Error checking questionnaire:', error);
      // On error, show questionnaire to be safe
      setShowQuestionnaire(true);
    } finally {
      setCheckingQuestionnaire(false);
    }
  };

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    // Optionally refresh data
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    fetchClientData(userId, token);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const togglePhase = (phaseNumber) => {
    setExpandedPhase(expandedPhase === phaseNumber ? null : phaseNumber);
  };

  const getDisplayMilestones = () => {
    if (journeySteps.length > 0) {
      return journeySteps.map(step => ({
        phase: step.stepNumber,
        title: step.title,
        description: step.description,
        status: step.status,
        estimatedDate: step.estimatedDate,
        actualDate: step.actualDate,
        notes: step.notes,
        updatedBy: step.updatedBy,
        updatedAt: step.updatedAt
      }));
    }
    
    return [
      { phase: 1, title: "Initial Introduction & Welcome", status: 'not-started', description: "Client introduction, welcome portal, and initial meeting" },
      { phase: 2, title: "Contract & Initial Payment", status: 'not-started', description: "Contract preparation, signing, and payment confirmation" },
      { phase: 3, title: "Design Meetings", status: 'not-started', description: "Design meetings and initial presentations" },
      { phase: 4, title: "Design Development & Approval", status: 'not-started', description: "Multiple presentations, revisions, and final design approval" },
      { phase: 5, title: "Final Proposal & Payment", status: 'not-started', description: "Final proposal, payment processing, and confirmation" },
      { phase: 6, title: "Production Preparation", status: 'not-started', description: "Bill of Materials preparation and vendor orders" },
      { phase: 7, title: "Manufacturing", status: 'not-started', description: "Vendor production and progress payments" },
      { phase: 8, title: "Shipping", status: 'not-started', description: "Final payments and product shipping" },
      { phase: 9, title: "Delivery Coordination", status: 'not-started', description: "Final invoicing, payment, and delivery scheduling" },
      { phase: 10, title: "Installation & Completion", status: 'not-started', description: "Installation and final cleanup" }
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
          bgGradient: 'from-emerald-500 to-teal-600',
          bgLight: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-600',
          label: 'Completed'
        };
      case 'in-progress':
        return {
          icon: Clock,
          color: 'blue',
          bgGradient: 'from-blue-500 to-cyan-600',
          bgLight: 'from-blue-50 to-cyan-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          badge: 'bg-blue-600',
          label: 'In Progress',
          pulse: true
        };
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'amber',
          bgGradient: 'from-amber-500 to-orange-600',
          bgLight: 'from-amber-50 to-orange-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          badge: 'bg-amber-600',
          label: 'Pending'
        };
      default:
        return {
          icon: Circle,
          color: 'gray',
          bgGradient: 'from-gray-400 to-gray-500',
          bgLight: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-600',
          badge: 'bg-gray-400',
          label: 'Not Started'
        };
    }
  };

  // ✅ Show loading while checking questionnaire
  if (loading || checkingQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {checkingQuestionnaire ? 'Checking your profile...' : 'Loading your project...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#005670] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Portal</h2>
          <p className="text-gray-600 mb-6">{error || 'Please try again later'}</p>
          <button
            onClick={() => navigate('/portal-login')}
            className="px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 transition-all font-semibold"
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
      {/* ✅ Show Questionnaire Modal if not completed */}
      {showQuestionnaire && (
        <QuestionnaireModal 
          onComplete={handleQuestionnaireComplete}
          userData={clientData}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#005670] to-[#007a9a] shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/images/HDG-Logo.png" 
                  alt="Henderson Design Group" 
                  className="h-10 w-auto brightness-0 invert"
                />
                <div className="hidden sm:block border-l-2 border-white/30 pl-4">
                  <p className="text-xs text-white/80 tracking-widest uppercase">Ālia Collections</p>
                  <p className="text-sm text-white font-semibold">Client Portal</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] rounded-3xl p-8 sm:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {clientData.name}!</h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Unit {clientData.unitNumber}</span>
                </div>
                <div className="w-1 h-1 bg-white/50 rounded-full hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>{clientData.floorPlan}</span>
                </div>
                {clientData.clientCode && (
                  <>
                    <div className="w-1 h-1 bg-white/50 rounded-full hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Client Code: <span className="font-bold">{clientData.clientCode}</span></span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Journey Section */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
            {/* Header with Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Project Journey</h2>
                <div className="text-right">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#005670] to-[#007a9a] bg-clip-text text-transparent">
                    {progressPercentage}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Complete</p>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#005670] via-[#007a9a] to-[#00a8cc] transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-600 font-medium">
                    <span className="text-[#005670] font-bold">{completedMilestones}</span> of {totalMilestones} phases
                  </span>
                  <span className="text-sm text-gray-500">
                    {totalMilestones - completedMilestones} remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Journey Not Initialized Banner */}
            {!isJourneyInitialized && (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Journey Starting Soon</h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg">
                  Your design journey will begin shortly. Our team is preparing your personalized project timeline.
                </p>
              </div>
            )}

            {/* Enhanced Phase Cards */}
            <div className="space-y-4">
              {displayMilestones.map((milestone, index) => {
                const config = getStatusConfig(milestone.status);
                const Icon = config.icon;
                const isExpanded = expandedPhase === milestone.phase;
                const hasDetails = milestone.notes || milestone.estimatedDate || milestone.actualDate;
                const isLast = index === displayMilestones.length - 1;

                return (
                  <div key={milestone.phase} className="relative">
                    {/* Connecting Line */}
                    {!isLast && (
                      <div className="absolute left-[27px] top-[60px] w-0.5 h-8 bg-gradient-to-b from-gray-200 to-transparent"></div>
                    )}

                    {/* Phase Card */}
                    <div 
                      className={`
                        relative rounded-2xl transition-all duration-300
                        ${isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'}
                        ${milestone.status !== 'not-started' ? `bg-gradient-to-r ${config.bgLight} border-2 ${config.border}` : 'bg-white border-2 border-gray-200'}
                      `}
                    >
                      {/* Main Phase Content */}
                      <div 
                        onClick={() => hasDetails && togglePhase(milestone.phase)}
                        className={`p-5 ${hasDetails ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <div className={`
                            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md
                            bg-gradient-to-br ${config.bgGradient}
                            ${config.pulse ? 'animate-pulse' : ''}
                          `}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-grow min-w-0">
                            {/* Phase Number & Status Badge */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`text-xs font-bold ${config.text} tracking-wide`}>
                                PHASE {milestone.phase}
                              </span>
                              <span className={`px-3 py-1 ${config.badge} text-white text-xs font-bold rounded-full shadow-sm`}>
                                {config.label}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {milestone.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {milestone.description}
                            </p>

                            {/* Quick Info Row */}
                            {milestone.status !== 'not-started' && (
                              <div className="flex items-center gap-4 mt-3 flex-wrap">
                                {milestone.actualDate && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>Completed {formatDate(milestone.actualDate)}</span>
                                  </div>
                                )}
                                {!milestone.actualDate && milestone.estimatedDate && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <CalendarClock className="w-4 h-4 text-blue-600" />
                                    <span>Expected by {formatDate(milestone.estimatedDate)}</span>
                                  </div>
                                )}
                                {milestone.notes && (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Note from team</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Expand Button */}
                          {hasDetails && (
                            <button className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/50 hover:bg-white flex items-center justify-center transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && hasDetails && (
                        <div className="px-5 pb-5 pt-2 border-t border-gray-200/50">
                          <div className="bg-white rounded-xl p-4 space-y-4">
                            {/* Timeline Details */}
                            {(milestone.estimatedDate || milestone.actualDate) && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Timeline
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {milestone.estimatedDate && (
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                      <p className="text-xs text-blue-600 font-semibold mb-1">Estimated Date</p>
                                      <p className="text-sm font-bold text-gray-900">{formatDate(milestone.estimatedDate)}</p>
                                    </div>
                                  )}
                                  {milestone.actualDate && (
                                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                      <p className="text-xs text-emerald-600 font-semibold mb-1">Completed On</p>
                                      <p className="text-sm font-bold text-gray-900">{formatDate(milestone.actualDate)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Notes from Admin */}
                            {milestone.notes && (
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-4 h-4" />
                                  Note from Our Team
                                </h4>
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {milestone.notes}
                                  </p>
                                  {milestone.updatedBy && (
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-gray-900">{milestone.updatedBy.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {milestone.updatedAt && `Updated ${formatDate(milestone.updatedAt)}`}
                                        </p>
                                      </div>
                                    </div>
                                  )}
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

          {/* Bottom Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Payment Info */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Down Payment</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${clientData.paymentInfo?.paidDownPayment?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${clientData.paymentInfo?.totalAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    clientData.paymentInfo?.downPaymentStatus === 'paid' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {clientData.paymentInfo?.downPaymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Need Assistance?</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Our team is here to help you every step of the way.
              </p>
              
              <div className="space-y-4">
                <a 
                  href="mailto:info@hendersondesign.com"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all group border border-gray-100"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-[#005670]" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900 group-hover:text-[#005670] transition-colors">Email Us</p>
                    <p className="text-sm text-gray-600">info@hendersondesign.com</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#005670] transition-colors" />
                </a>
                
                <a 
                  href="tel:+18083158782"
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-teal-50 rounded-xl hover:shadow-md transition-all group border border-gray-100"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-[#005670]" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900 group-hover:text-[#005670] transition-colors">Call Us</p>
                    <p className="text-sm text-gray-600">(808) 315-8782</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#005670] transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#005670] to-[#007a9a] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-white/80 text-sm">
            <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
          </div>
        </footer>

        {/* Custom Animations */}
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