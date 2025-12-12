// AgreementViewer.jsx - Route component to display agreements
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { backendServer } from '../utils/info';
import DesignFeeAgreementHTML from './DesignFeeAgreementHTML';
import DepositToHoldHTML from './DepositToHoldHTML';

const AgreementViewer = () => {
  const { clientId, agreementNumber } = useParams();
  const [agreementData, setAgreementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgreementData();
  }, [clientId, agreementNumber]);

  const fetchAgreementData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/agreements/data/${clientId}/${agreementNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAgreementData({
          ...data.agreement,
          clientName: data.client.name,
          unitNumber: data.client.unitNumber
        });
      } else {
        setError('Agreement not found');
      }
    } catch (error) {
      console.error('Error fetching agreement:', error);
      setError('Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading agreement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <p style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>{error}</p>
        <button
          onClick={() => window.close()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Close Window
        </button>
      </div>
    );
  }

  // Prepare data for components
  const data = {
    effectiveDate: new Date(agreementData.effectiveDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    clientName: agreementData.clientName,
    unitNumber: agreementData.unitNumber,
    invoiceNumber: agreementData.invoiceNumber,
    packageDescription: agreementData.packageDescription,
    collection: agreementData.collection,
    bedroomCount: agreementData.bedroomCount
  };

  // Render appropriate agreement based on type
  if (agreementData.agreementType === 'design-fee') {
    return <DesignFeeAgreementHTML agreementData={{
      ...data,
      designFee: agreementData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      collectionType: agreementData.collection
    }} />;
  } else {
    return <DepositToHoldHTML depositData={{
      ...data,
      depositAmount: `${agreementData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (inclusive of $5,000 Design Fee)`,
      collectionType: agreementData.collection
    }} />;
  }
};

export default AgreementViewer;