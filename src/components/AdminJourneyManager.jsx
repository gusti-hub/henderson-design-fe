// AdminJourneyManager.jsx - Senior Friendly Design
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Save, 
  X,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Paperclip,
  Mail,
  Check,
  Download
} from 'lucide-react';
import { backendServer } from '../utils/info';

const AdminJourneyManager = ({ clientId, clientName }) => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});

  useEffect(() => {
    fetchJourney();
  }, [clientId]);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJourney(data);
      } else if (response.status === 404) {
        setJourney(null);
      } else {
        throw new Error('Failed to fetch journey');
      }
    } catch (error) {
      console.error('Error fetching journey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJourney = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/journeys/client/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Journey created successfully!');
        await fetchJourney();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create journey');
      }
    } catch (error) {
      console.error('Error creating journey:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStep = async (stepNumber, updates, sendEmail = false) => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            ...updates, 
            sendEmailNotification: sendEmail 
          })
        }
      );

      if (response.ok) {
        setSuccess(sendEmail ? 'Step updated and email sent!' : 'Step updated successfully!');
        await fetchJourney();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update step');
      }
    } catch (error) {
      console.error('Error updating step:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteStep = async (stepNumber, notes = '') => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );

      if (response.ok) {
        setSuccess('Step marked as complete!');
        await fetchJourney();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete step');
      }
    } catch (error) {
      console.error('Error completing step:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSubStep = async (stepNumber, subStepIndex, currentCompleted) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journeys/client/${clientId}/step/${stepNumber}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            subStepIndex, 
            subStepCompleted: !currentCompleted 
          })
        }
      );

      if (response.ok) {
        await fetchJourney();
      }
    } catch (error) {
      console.error('Error toggling substep:', error);
    }
  };

  const toggleStepExpanded = (stepNumber) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
      setActiveChat(null);
    } else {
      newExpanded.add(stepNumber);
      loadChat(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const loadChat = async (stepNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.messages || [] }));
        setActiveChat(stepNumber);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendChatMessage = async (stepNumber, message, attachments = []) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/journey-chat/client/${clientId}/step/${stepNumber}/message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, attachments })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => ({ ...prev, [stepNumber]: data.chat.messages }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-7 h-7 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-7 h-7 text-blue-600" />;
      case 'pending':
        return <Circle className="w-7 h-7 text-yellow-600" />;
      default:
        return <Circle className="w-7 h-7 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'Introduction': 'from-blue-500 to-cyan-600',
      'Contract': 'from-purple-500 to-pink-600',
      'Design': 'from-amber-500 to-orange-600',
      'Proposal': 'from-green-500 to-emerald-600',
      'Production Prep': 'from-indigo-500 to-blue-600',
      'Manufacturing': 'from-red-500 to-rose-600',
      'Shipping': 'from-teal-500 to-cyan-600',
      'Delivery': 'from-violet-500 to-purple-600'
    };
    return colors[phase] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#005670]"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-xl border-2 border-gray-200">
        <div className="text-center">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            No Journey Created
          </h3>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Initialize journey tracking for {clientName} to enable progress monitoring.
          </p>
          <button
            onClick={handleCreateJourney}
            disabled={saving}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#005670] text-white text-xl rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                <span>Initialize Journey Tracking</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const completedSteps = journey.steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / journey.steps.length) * 100;

  // Group steps by phase
  const stepsByPhase = journey.steps.reduce((acc, step) => {
    if (!acc[step.phase]) acc[step.phase] = [];
    acc[step.phase].push(step);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* SENIOR-FRIENDLY HEADER */}
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-4xl font-bold">Journey Management</h2>
          {journey && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-lg font-medium transition-all"
            >
              🔄 Refresh
            </button>
          )}
        </div>
        <p className="text-xl text-white/90 mb-6">Client: {clientName}</p>
        {journey && (
          <div className="mt-6">
            <div className="flex justify-between text-lg mb-3">
              <span className="font-medium">Progress</span>
              <span className="font-bold text-2xl">{completedSteps} / {journey.steps.length} steps</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-6">
              <div 
                className="bg-white h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${progressPercentage}%` }}
              >
                <span className="text-[#005670] font-bold text-sm">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS - LARGE & CLEAR */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
            <p className="text-lg text-red-800 leading-relaxed flex-grow">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-7 h-7 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl shadow-lg">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0 mt-1" />
            <p className="text-lg text-green-800 leading-relaxed flex-grow">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-7 h-7 text-green-600" />
            </button>
          </div>
        </div>
      )}

      {/* STEPS BY PHASE */}
      <div className="space-y-8">
        {Object.entries(stepsByPhase).map(([phase, steps]) => (
          <div key={phase} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200">
            {/* PHASE HEADER - LARGE */}
            <div className={`p-6 bg-gradient-to-r ${getPhaseColor(phase)} rounded-t-2xl`}>
              <h3 className="text-2xl font-bold text-white mb-2">{phase}</h3>
              <p className="text-lg text-white/90">
                {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
              </p>
            </div>

            {/* PHASE STEPS */}
            <div className="divide-y-2 divide-gray-200">
              {steps.map((step) => (
                <StepItem
                  key={step.step}
                  step={step}
                  expanded={expandedSteps.has(step.step)}
                  onToggle={() => toggleStepExpanded(step.step)}
                  onUpdate={handleUpdateStep}
                  onComplete={handleCompleteStep}
                  onToggleSubStep={handleToggleSubStep}
                  saving={saving}
                  getStepIcon={getStepIcon}
                  getStatusColor={getStatusColor}
                  chatMessages={chatMessages[step.step] || []}
                  onSendMessage={(msg, att) => sendChatMessage(step.step, msg, att)}
                  isActiveChat={activeChat === step.step}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SENIOR-FRIENDLY STEP ITEM COMPONENT
const StepItem = ({ 
  step, 
  expanded, 
  onToggle, 
  onUpdate, 
  onComplete, 
  onToggleSubStep,
  saving,
  getStepIcon,
  getStatusColor,
  chatMessages,
  onSendMessage,
  isActiveChat
}) => {
  const [editMode, setEditMode] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [formData, setFormData] = useState({
    status: step.status,
    estimatedDate: step.estimatedDate ? step.estimatedDate.split('T')[0] : '',
    notes: step.notes || ''
  });

  const handleSave = (sendEmail) => {
    onUpdate(step.step, formData, sendEmail);
    setEditMode(false);
  };

  const handleComplete = () => {
    onComplete(step.step, formData.notes);
    setEditMode(false);
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      onSendMessage(chatMessage, []);
      setChatMessage('');
    }
  };

  const hasSubSteps = step.subSteps && step.subSteps.length > 0;
  const completedSubSteps = hasSubSteps ? step.subSteps.filter(s => s.completed).length : 0;
  const unreadCount = chatMessages.filter(m => !m.read && m.sender === 'client').length;

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      {/* STEP HEADER - EXTRA LARGE */}
      <div 
        className="flex items-center gap-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-shrink-0">
          {getStepIcon(step.status)}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-2xl font-bold text-gray-900">
              Step {step.step}
            </span>
            <span className={`px-4 py-2 rounded-xl text-base font-bold border-2 ${getStatusColor(step.status)}`}>
              {step.status.replace('-', ' ').toUpperCase()}
            </span>
            {step.email && (
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-800 border-2 border-blue-300">
                📧 Email
              </span>
            )}
            {step.clientAction && (
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-800 border-2 border-purple-300">
                👤 Client Action
              </span>
            )}
            {hasSubSteps && (
              <span className="text-base text-gray-600 font-medium">
                ({completedSubSteps}/{step.subSteps.length} tasks)
              </span>
            )}
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h4>
          <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
        </div>

        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-8 h-8 text-gray-600" />
          ) : (
            <ChevronDown className="w-8 h-8 text-gray-600" />
          )}
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div className="mt-6 pl-16 space-y-6">
          {/* TAB NAVIGATION */}
          <div className="flex gap-4 border-b-2 border-gray-200 pb-2">
            <button
              onClick={() => { setEditMode(true); setChatMode(false); }}
              className={`px-6 py-3 text-lg font-bold rounded-t-xl transition-all ${
                editMode && !chatMode
                  ? 'bg-[#005670] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Edit Step
            </button>
            <button
              onClick={() => { setChatMode(true); setEditMode(false); }}
              className={`px-6 py-3 text-lg font-bold rounded-t-xl transition-all ${
                chatMode
                  ? 'bg-[#005670] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Chat {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => { setEditMode(false); setChatMode(false); }}
              className={`px-6 py-3 text-lg font-bold rounded-t-xl transition-all ${
                !editMode && !chatMode
                  ? 'bg-[#005670] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👁️ View
            </button>
          </div>

          {/* CHAT MODE */}
          {chatMode && (
            <ChatPanel 
              messages={chatMessages}
              onSendMessage={handleSendChat}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
            />
          )}

          {/* EDIT MODE */}
          {editMode && !chatMode && (
            <EditPanel
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onComplete={handleComplete}
              onCancel={() => setEditMode(false)}
              saving={saving}
              step={step}
            />
          )}

          {/* VIEW MODE */}
          {!editMode && !chatMode && (
            <ViewPanel
              step={step}
              hasSubSteps={hasSubSteps}
              onToggleSubStep={onToggleSubStep}
            />
          )}
        </div>
      )}
    </div>
  );
};

// CHAT PANEL COMPONENT
const ChatPanel = ({ messages, onSendMessage, chatMessage, setChatMessage }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
      <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <MessageSquare className="w-7 h-7" />
        Communication Thread
      </h4>

      {/* MESSAGES */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-lg text-gray-500 text-center py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl ${
                msg.sender === 'admin'
                  ? 'bg-blue-100 border-2 border-blue-300 ml-8'
                  : 'bg-white border-2 border-gray-300 mr-8'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">
                  {msg.sender === 'admin' ? '👤 Admin' : '👨‍💼 Client'}: {msg.senderName}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(msg.sentAt).toLocaleString()}
                </span>
              </div>
              <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.attachments.map((att, attIdx) => (
                    <button
                      key={attIdx}
                      className="px-3 py-2 bg-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-100"
                    >
                      <Paperclip className="w-4 h-4" />
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
      <div className="flex gap-3">
        <textarea
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Type your message to the client..."
          rows="3"
          className="flex-grow px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670] focus:border-transparent"
        />
        <button
          onClick={onSendMessage}
          disabled={!chatMessage.trim()}
          className="px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Send className="w-6 h-6" />
          <span className="text-lg font-bold">Send</span>
        </button>
      </div>
    </div>
  );
};

// EDIT PANEL COMPONENT
const EditPanel = ({ formData, setFormData, onSave, onComplete, onCancel, saving, step }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 space-y-6">
      <div>
        <label className="block text-xl font-bold text-gray-900 mb-3">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670] focus:border-transparent"
        >
          <option value="not-started">Not Started</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="block text-xl font-bold text-gray-900 mb-3">
          Estimated Date
        </label>
        <input
          type="date"
          value={formData.estimatedDate}
          onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xl font-bold text-gray-900 mb-3">
          Notes for Client
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="4"
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005670] focus:border-transparent"
          placeholder="Add notes that the client will see..."
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => onSave(false)}
          disabled={saving}
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#005670] text-white text-lg rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
        >
          <Save className="w-6 h-6" />
          Save Changes
        </button>

        <button
          onClick={() => onSave(true)}
          disabled={saving}
          className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
        >
          <Mail className="w-6 h-6" />
          Save & Email Client
        </button>
        
        {step.status !== 'completed' && (
          <button
            onClick={onComplete}
            disabled={saving}
            className="inline-flex items-center gap-3 px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
          >
            <Check className="w-6 h-6" />
            Mark Complete
          </button>
        )}

        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 text-lg rounded-xl hover:bg-gray-300 font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// VIEW PANEL COMPONENT
const ViewPanel = ({ step, hasSubSteps, onToggleSubStep }) => {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* SUB-STEPS */}
      {hasSubSteps && (
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
          <h5 className="text-xl font-bold text-gray-900 mb-4">Sub-tasks:</h5>
          <div className="space-y-3">
            {step.subSteps.map((subStep, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow border-2 border-gray-200"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubStep(step.step, index, subStep.completed);
                  }}
                  className="flex-shrink-0 mt-1"
                >
                  {subStep.completed ? (
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-400" />
                  )}
                </button>
                <div className="flex-grow">
                  <p className={`text-lg font-medium ${subStep.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {subStep.sub}. {subStep.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {subStep.email && (
                      <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium border border-blue-300">
                        📧 Email
                      </span>
                    )}
                    {subStep.clientAction && (
                      <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium border border-purple-300">
                        👤 Client Action
                      </span>
                    )}
                    {subStep.completed && subStep.completedAt && (
                      <span className="text-sm text-gray-600">
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

      {/* DATES */}
      {(step.estimatedDate || step.actualDate) && (
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <h5 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Timeline
          </h5>
          <div className="space-y-3">
            {step.estimatedDate && (
              <div>
                <p className="text-base text-gray-600 font-medium">Estimated Date:</p>
                <p className="text-xl font-bold text-gray-900">{formatDate(step.estimatedDate)}</p>
              </div>
            )}
            {step.actualDate && (
              <div>
                <p className="text-base text-gray-600 font-medium">Completed On:</p>
                <p className="text-xl font-bold text-green-700">{formatDate(step.actualDate)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTES */}
      {step.notes && (
        <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
          <h5 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notes for Client
          </h5>
          <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap">
            {step.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminJourneyManager;