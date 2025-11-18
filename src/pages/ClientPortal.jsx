import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  Loader2,
  Send,
  ClipboardList
} from 'lucide-react';
import { backendServer } from '../utils/info';
import DesignQuestionnaire from '../pages/DesignQuestionnaire';

const ClientPortal = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState('verify'); // verify, questionnaire, schedule, confirmation
  const [clientData, setClientData] = useState(null);
  const navigate = useNavigate();
  

  // Verification form
  const [verificationForm, setVerificationForm] = useState({
    email: '',
    unitNumber: ''
  });
  const [verificationErrors, setVerificationErrors] = useState({});

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    preferredDate: '',
    preferredTime: '',
    alternateDate: '',
    alternateTime: '',
    meetingType: 'in-person',
    notes: ''
  });
  const [scheduleErrors, setScheduleErrors] = useState({});

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
  ];

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationForm({ ...verificationForm, [name]: value });
    setVerificationErrors({ ...verificationErrors, [name]: '' });
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
    setScheduleErrors({ ...scheduleErrors, [name]: '' });
  };

  const validateVerification = () => {
    const errors = {};
    let isValid = true;

    if (!verificationForm.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(verificationForm.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!verificationForm.unitNumber) {
      errors.unitNumber = 'Unit number is required';
      isValid = false;
    }

    setVerificationErrors(errors);
    return isValid;
  };

  const validateSchedule = () => {
    const errors = {};
    let isValid = true;

    if (!scheduleForm.preferredDate) {
      errors.preferredDate = 'Preferred date is required';
      isValid = false;
    }

    if (!scheduleForm.preferredTime) {
      errors.preferredTime = 'Preferred time is required';
      isValid = false;
    }

    if (!scheduleForm.alternateDate) {
      errors.alternateDate = 'Alternate date is required';
      isValid = false;
    }

    if (!scheduleForm.alternateTime) {
      errors.alternateTime = 'Alternate time is required';
      isValid = false;
    }

    setScheduleErrors(errors);
    return isValid;
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!validateVerification()) return;

    setVerifying(true);
    setVerificationErrors({});

    try {
      const response = await fetch(`${backendServer}/api/clients-portal/verify-down-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setClientData(data.client);
      setVerified(true);
      setStep('questionnaire'); // Changed from 'schedule' to 'questionnaire'
      
    } catch (error) {
      setVerificationErrors({
        form: error.message || 'Unable to verify. Please check your information and try again.'
      });
    } finally {
      setVerifying(false);
    }
  };

  // Handler when questionnaire is completed
  const handleQuestionnaireComplete = (questionnaire) => {
    console.log('Questionnaire completed:', questionnaire);
    setStep('schedule'); // Move to schedule step after questionnaire
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSchedule()) return;

    setLoading(true);
    setScheduleErrors({});

    try {
      const response = await fetch(`${backendServer}/api/clients-portal/schedule-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationForm.email,
          unitNumber: verificationForm.unitNumber,
          ...scheduleForm
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule meeting');
      }

      setStep('confirmation');
      
    } catch (error) {
      setScheduleErrors({
        form: error.message || 'Unable to schedule meeting. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#005670] flex justify-between items-center p-8">
        <img 
          src="/images/HDG-Logo.png" 
          alt="Henderson Design Group" 
          className="h-12"
        />
        <button
          onClick={() => navigate('/')}
          className="text-white/90 hover:text-white text-sm tracking-wide transition-colors"
        >
          Back to Home →
        </button>
      </header>
      

      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Progress Indicator - Updated with 4 steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            {/* Step 1: Verify */}
            <div className={`flex items-center gap-2 ${step === 'verify' ? 'text-[#005670]' : verified ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'verify' ? 'bg-[#005670] text-white' : verified ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {verified ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="font-medium hidden sm:inline text-sm">Verify</span>
            </div>
            <div className={`h-1 w-12 ${verified ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            {/* Step 2: Questionnaire */}
            <div className={`flex items-center gap-2 ${step === 'questionnaire' ? 'text-[#005670]' : (step === 'schedule' || step === 'confirmation') ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'questionnaire' ? 'bg-[#005670] text-white' : (step === 'schedule' || step === 'confirmation') ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {(step === 'schedule' || step === 'confirmation') ? <CheckCircle className="w-6 h-6" /> : <ClipboardList className="w-5 h-5" />}
              </div>
              <span className="font-medium hidden sm:inline text-sm">Questionnaire</span>
            </div>
            <div className={`h-1 w-12 ${(step === 'schedule' || step === 'confirmation') ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            {/* Step 3: Schedule */}
            <div className={`flex items-center gap-2 ${step === 'schedule' ? 'text-[#005670]' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'schedule' ? 'bg-[#005670] text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step === 'confirmation' ? <CheckCircle className="w-6 h-6" /> : <Calendar className="w-5 h-5" />}
              </div>
              <span className="font-medium hidden sm:inline text-sm">Schedule</span>
            </div>
            <div className={`h-1 w-12 ${step === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            {/* Step 4: Confirm */}
            <div className={`flex items-center gap-2 ${step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {step === 'confirmation' ? <CheckCircle className="w-6 h-6" /> : '4'}
              </div>
              <span className="font-medium hidden sm:inline text-sm">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Verification */}
        {step === 'verify' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-[#005670] mx-auto mb-4" />
              <h1 className="text-3xl font-light text-[#005670] mb-3 tracking-wide">
                Welcome to Your Client Portal
              </h1>
              <p className="text-gray-600 text-lg">
                Please verify your information to get started
              </p>
            </div>

            {verificationErrors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{verificationErrors.form}</p>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={verificationForm.email}
                  onChange={handleVerificationChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
                  placeholder="your.email@example.com"
                />
                {verificationErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{verificationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Unit Number
                </label>
                <input
                  type="text"
                  name="unitNumber"
                  value={verificationForm.unitNumber}
                  onChange={handleVerificationChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 101"
                />
                {verificationErrors.unitNumber && (
                  <p className="mt-2 text-sm text-red-600">{verificationErrors.unitNumber}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-4 rounded-lg text-white bg-[#005670] hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After verification, you'll complete a design questionnaire before scheduling your consultation.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Design Questionnaire */}
        {step === 'questionnaire' && (
          <div>
            <DesignQuestionnaire 
              unitNumber={verificationForm.unitNumber}
              email={verificationForm.email}
              onComplete={handleQuestionnaireComplete}
            />
          </div>
        )}

        {/* Step 3: Schedule Meeting */}
        {step === 'schedule' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 text-[#005670] mx-auto mb-4" />
              <h1 className="text-3xl font-light text-[#005670] mb-3 tracking-wide">
                Schedule Your Design Consultation
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Hello {clientData?.name}! Let's find the perfect time for your meeting.
              </p>
              <div className="inline-block bg-green-50 px-6 py-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Unit {clientData?.unitNumber} • Questionnaire Completed
                </p>
              </div>
            </div>

            {scheduleErrors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{scheduleErrors.form}</p>
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meeting Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setScheduleForm({ ...scheduleForm, meetingType: 'in-person' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      scheduleForm.meetingType === 'in-person'
                        ? 'border-[#005670] bg-[#005670]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2 text-[#005670]" />
                    <span className="block text-sm font-medium">In-Person</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleForm({ ...scheduleForm, meetingType: 'virtual' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      scheduleForm.meetingType === 'virtual'
                        ? 'border-[#005670] bg-[#005670]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Phone className="w-6 h-6 mx-auto mb-2 text-[#005670]" />
                    <span className="block text-sm font-medium">Virtual</span>
                  </button>
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    min={getMinDate()}
                    value={scheduleForm.preferredDate}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
                  />
                  {scheduleErrors.preferredDate && (
                    <p className="mt-2 text-sm text-red-600">{scheduleErrors.preferredDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    name="preferredTime"
                    value={scheduleForm.preferredTime}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {scheduleErrors.preferredTime && (
                    <p className="mt-2 text-sm text-red-600">{scheduleErrors.preferredTime}</p>
                  )}
                </div>
              </div>

              {/* Alternate Date & Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Date
                  </label>
                  <input
                    type="date"
                    name="alternateDate"
                    min={getMinDate()}
                    value={scheduleForm.alternateDate}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
                  />
                  {scheduleErrors.alternateDate && (
                    <p className="mt-2 text-sm text-red-600">{scheduleErrors.alternateDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Time
                  </label>
                  <select
                    name="alternateTime"
                    value={scheduleForm.alternateTime}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {scheduleErrors.alternateTime && (
                    <p className="mt-2 text-sm text-red-600">{scheduleErrors.alternateTime}</p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={scheduleForm.notes}
                  onChange={handleScheduleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Any specific topics you'd like to discuss or questions you have..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg text-white bg-[#005670] hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Schedule Meeting</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm text-blue-800">
                <strong>Please note:</strong> Our team will review your request and confirm your 
                meeting time via email within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-light text-[#005670] mb-4 tracking-wide">
              Meeting Request Submitted!
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Thank you, {clientData?.name}. We've received your meeting request.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-medium text-[#005670] mb-4">Your Request Details:</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Meeting Type:</strong> {scheduleForm.meetingType === 'in-person' ? 'In-Person' : 'Virtual'}</p>
                <p><strong>Preferred Date:</strong> {new Date(scheduleForm.preferredDate).toLocaleDateString()}</p>
                <p><strong>Preferred Time:</strong> {scheduleForm.preferredTime}</p>
                <p><strong>Alternate Date:</strong> {new Date(scheduleForm.alternateDate).toLocaleDateString()}</p>
                <p><strong>Alternate Time:</strong> {scheduleForm.alternateTime}</p>
                {scheduleForm.notes && (
                  <p><strong>Notes:</strong> {scheduleForm.notes}</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-8">
              <h3 className="text-lg font-medium text-green-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Our design team will review your preferred time slots</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>You'll receive an email confirmation within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>We'll send calendar invitations and meeting details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Prepare any questions or ideas you'd like to discuss</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-[#005670] text-white rounded-lg hover:opacity-90 transition-all font-medium"
            >
              Return to Home
            </button>

            <p className="mt-6 text-sm text-gray-500">
              Check your email ({verificationForm.email}) for confirmation and further instructions.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#005670] border-t border-[#005670] mt-16 py-8 font-freight">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm text-white/80">
          <p className="mb-2">Questions? Contact us at (808) 315-8782 or aloha@henderson.house</p>
          <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;