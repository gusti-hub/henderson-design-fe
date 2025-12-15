// AgreementManagementInline.jsx - For Step 16
import React, { useState, useEffect } from 'react';
import { FileText, Eye, Trash2, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const AgreementManagementInline = ({ clientId, clientName, currentStep, onAgreementGenerated, propertyType }) => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAgreements();
  }, [clientId]);

  // Determine agreement type based on propertyType
  const isLock2025Pricing = propertyType === 'Lock 2025 Pricing';
  const designFeeLabel = isLock2025Pricing ? 'Design Fee Agreement' : 'Design Hold Fee Agreement';

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/agreements/client/${clientId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAgreements(data.agreements || []);
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgreement = async (agreementType) => {
    try {
      setGenerating(agreementType);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/agreements/generate/${clientId}/${agreementType}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const agreementNumber = data.agreement.agreementNumber;
        
        const successMessage = agreementType === 'design-fee' 
          ? `${designFeeLabel} generated!`
          : 'Deposit to Hold generated!';
        setSuccess(successMessage);
        
        // Open agreement HTML in new tab
        const agreementUrl = `${window.location.origin}/agreement/${clientId}/${agreementNumber}`;
        window.open(agreementUrl, '_blank', 'noopener,noreferrer');
        
        await fetchAgreements();
        
        if (onAgreementGenerated) {
          onAgreementGenerated();
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate agreement');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setGenerating(null);
    }
  };

  const handleViewAgreement = (agreementNumber) => {
    const agreementUrl = `${window.location.origin}/agreement/${clientId}/${agreementNumber}`;
    window.open(agreementUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteAgreement = async (agreementNumber) => {
    if (!window.confirm(`Delete agreement ${agreementNumber}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/agreements/client/${clientId}/${agreementNumber}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setSuccess('Agreement deleted!');
        await fetchAgreements();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete agreement');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getAgreementTypeName = (type) => {
    if (type === 'design-fee') {
      return designFeeLabel; // Returns either "Design Fee Agreement" or "Design Hold Fee Agreement"
    }
    return 'Deposit to Hold';
  };

  const getAgreementTypeColor = (type) => {
    return type === 'design-fee' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600';
  };

  const designFeeAgreements = agreements.filter(a => a.agreementType === 'design-fee');
  const depositAgreements = agreements.filter(a => a.agreementType === 'deposit-hold');

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 font-medium">Loading agreements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Agreement Management
          </h4>
          <p className="text-sm text-gray-600 font-medium mt-1">
            {isLock2025Pricing 
              ? `Generate ${designFeeLabel} and Deposit to Hold documents`
              : `Generate ${designFeeLabel} document`
            }
          </p>
          {!isLock2025Pricing && (
            <p className="text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Design Hold Fee (No 2025 Price Lock)
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Generate Buttons */}
      <div className={`grid gap-4 mb-6 ${isLock2025Pricing ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        {/* Design Fee Agreement Button (label changes based on propertyType) */}
        <button
          onClick={() => handleGenerateAgreement('design-fee')}
          disabled={generating === 'design-fee'}
          className={`p-4 rounded-xl border-2 transition-all ${
            designFeeAgreements.length > 0
              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-blue-500 text-white hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {generating === 'design-fee' ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : designFeeAgreements.length > 0 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <span className="font-bold">
              {generating === 'design-fee' 
                ? 'Generating...' 
                : designFeeAgreements.length > 0
                ? `${designFeeLabel} ✓`
                : designFeeLabel}
            </span>
          </div>
        </button>

        {/* Deposit to Hold Button - ONLY for Lock 2025 Pricing */}
        {isLock2025Pricing && (
          <button
            onClick={() => handleGenerateAgreement('deposit-hold')}
            disabled={generating === 'deposit-hold'}
            className={`p-4 rounded-xl border-2 transition-all ${
              depositAgreements.length > 0
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-purple-500 text-white hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {generating === 'deposit-hold' ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : depositAgreements.length > 0 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              <span className="font-bold">
                {generating === 'deposit-hold' 
                  ? 'Generating...' 
                  : depositAgreements.length > 0
                  ? 'Deposit to Hold ✓'
                  : 'Deposit to Hold'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Generated Agreements List */}
      {agreements.length > 0 && (
        <div>
          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Generated Agreements ({agreements.length})
          </h5>

          <div className="space-y-3">
            {agreements.map((agreement) => (
              <div
                key={agreement.agreementNumber}
                className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-gray-900">
                        {agreement.agreementNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getAgreementTypeColor(agreement.agreementType)} text-white text-xs font-bold`}>
                        {getAgreementTypeName(agreement.agreementType)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Generated: {new Date(agreement.generatedAt).toLocaleDateString()} • 
                      Collection: {agreement.collection} • 
                      Bedrooms: {agreement.bedroomCount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewAgreement(agreement.agreementNumber)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-all group"
                      title="View Agreement"
                    >
                      <Eye className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                      onClick={() => handleDeleteAgreement(agreement.agreementNumber)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all group"
                      title="Delete Agreement"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Agreements Message */}
      {agreements.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No agreements generated yet</p>
          <p className="text-gray-500 text-sm mt-1">Click buttons above to generate agreements</p>
        </div>
      )}
    </div>
  );
};

export default AgreementManagementInline;