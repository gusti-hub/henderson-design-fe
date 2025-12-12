// DesignFeeAgreementHTML.jsx
import React, { useEffect } from 'react';

const DesignFeeAgreementHTML = ({ agreementData }) => {
  useEffect(() => {
    // Auto-trigger print dialog
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Default data if not provided
  const data = agreementData || {
    effectiveDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    clientName: '[Client Name]',
    unitNumber: '[Unit Number]',
    invoiceNumber: '[Invoice Number]',
    packageDescription: 'Client has a 1 bedroom unit and would like to proceed with a Nalu package.',
    designFee: '5,000',
    collectionType: 'Nalu'
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: '0.5in',
      backgroundColor: 'white',
      fontSize: '11pt',
      lineHeight: '1.6',
      color: '#000'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '18pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '10px',
          letterSpacing: '1px'
        }}>
          Henderson Design Group
        </h1>
        <h2 style={{
          fontSize: '14pt',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          Design Agreement – Ālia Furniture Collections
        </h2>
        <p style={{ fontSize: '11pt', fontStyle: 'italic', color: '#666' }}>
          (For Clients with 2025 Price Lock)
        </p>
      </div>

      {/* Client Information - HIGHLIGHTED */}
      <div style={{
        backgroundColor: '#FFFF00',
        padding: '15px',
        marginBottom: '20px',
        border: '1px solid #000'
      }}>
        <p style={{ margin: '5px 0' }}><strong>Effective Date:</strong> {data.effectiveDate}</p>
        <p style={{ margin: '5px 0' }}><strong>Client Name:</strong> {data.clientName}</p>
        <p style={{ margin: '5px 0' }}><strong>Unit / Residence:</strong> {data.unitNumber}</p>
        <p style={{ margin: '5px 0' }}><strong>Reference:</strong> Invoice #{data.invoiceNumber}</p>
      </div>

      {/* Purpose */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Purpose:
        </h3>
        <p style={{ textAlign: 'justify' }}>
          This Design Agreement authorizes Henderson Design Group ("HDG") to begin the design phase for the Client's residence and outlines the scope, process, and payment terms for the design work.
        </p>
      </div>

      {/* Design Fee and Payment Terms */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Design Fee and Payment Terms:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          The Client agrees to pay HDG a non-refundable design fee, due in full at signing. This fee covers all design services outlined in Section 3.
        </p>
        
        <p style={{
          backgroundColor: '#FFFF00',
          padding: '10px',
          marginBottom: '10px'
        }}>
          <strong>Description of Scope:</strong> {data.packageDescription}
        </p>

        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Agreement will specify only one of the following:
        </p>

        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Payment is required before HDG begins design preparation, assigns design resources, or sets confirmed meeting dates.
        </p>

        <p style={{ textAlign: 'justify' }}>
          If the Client proceeds to production, 100% of the design fee will be credited toward the total furnishing package price. This credit remains valid for six (6) months from the final design presentation date.
        </p>
      </div>

      {/* Scope of Services */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Scope of Services:
        </h3>
        <p style={{ marginBottom: '10px' }}>The Design Fee includes:</p>
        <ul style={{ marginLeft: '30px', marginBottom: '10px' }}>
          <li>A design intake meeting</li>
          <li>Review of floor plan and unit layout</li>
          <li>Furniture layout and package selection (Lani, Nalu, or Foundation)</li>
          <li>Material, fabric, and finish selections</li>
          <li>One round of revisions</li>
          <li>Preparation of a final design presentation and furnishing proposal with a line item budget</li>
        </ul>
        <p style={{ textAlign: 'justify' }}>
          Additional revisions, custom designs, add-on sourcing, or in-person consultations may be billed separately at HDG's standard hourly rates.
        </p>
      </div>

      {/* Schedule */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Schedule:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Upon payment outlined in this agreement, Client secures a place in HDG's 2026 design calendar, HDG will now assign a confirmed design start date upon execution of this Agreement and receipt of payment.
        </p>
        <p style={{ textAlign: 'justify' }}>
          A Project Manager will be assigned as the Client's primary point of contact. Intake meeting and presentation dates will be scheduled according to HDG's 2026 design calendar.
        </p>
      </div>

      {/* Credit Toward Production */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Credit Toward Production:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          If the Client moves forward to production, the full design fee will be applied as a credit toward the total furnishing package cost.
        </p>
        <p style={{ textAlign: 'justify' }}>
          If the Client does not proceed to production within six (6) months of design presentation approval, the credit expires.
        </p>
      </div>

      {/* Cancellation and Refunds */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Cancellation and Refunds:
        </h3>
        <p style={{ textAlign: 'justify' }}>
          The design fee is non-refundable. If the Client chooses not to proceed after design begins, HDG may, at its discretion, apply the fee toward future design services for the same property.
        </p>
      </div>

      {/* Ownership of Materials */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Ownership of Materials:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          All drawings, layouts, specifications, and renderings remain the exclusive property of HDG until the furnishing package is paid in full.
        </p>
        <p style={{ textAlign: 'justify' }}>
          The Client may not reuse, reproduce, or implement the design without HDG's written approval.
        </p>
      </div>

      {/* Liability and Limitations */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Liability and Limitations:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          HDG will exercise reasonable care in performing all services.
        </p>
        <p style={{ textAlign: 'justify' }}>
          HDG is not responsible for delays caused by third parties, construction progress, HOA/building access limitations, material availability, or shipping logistics outside its control.
        </p>
      </div>

      {/* Governing Law */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Governing Law:
        </h3>
        <p style={{ textAlign: 'justify' }}>
          This Agreement is governed by the laws of the State of Hawaii.
        </p>
      </div>

      {/* Acceptance */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Acceptance:
        </h3>
        <p style={{ marginBottom: '20px' }}>
          By signing below, both parties agree to the terms of this Agreement:
        </p>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ marginBottom: '30px' }}>
            Client Signature: ______________________________________________
          </p>
          <p style={{ marginBottom: '30px' }}>
            Date: ____________
          </p>
          <p>
            Printed Name: ________________________________________________
          </p>
        </div>

        <div>
          <p style={{ marginBottom: '30px' }}>
            HDG Representative: _____________________________________________
          </p>
          <p style={{ marginBottom: '30px' }}>
            Date: ____________
          </p>
          <p>
            Printed Name: ____________________________________________________
          </p>
        </div>
      </div>

      {/* Page Break */}
      <div style={{ pageBreakBefore: 'always' }} />

      {/* Exhibit A */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13pt',
          fontWeight: 'bold',
          marginBottom: '15px',
          textDecoration: 'underline'
        }}>
          Exhibit A – Design Fee Summary:
        </h3>
        
        <div style={{
          backgroundColor: '#FFFF00',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Design Fee Amount:</strong> ${data.designFee}
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Collection Type:</strong> {data.collectionType}
          </p>
        </div>

        <p style={{ marginBottom: '5px' }}><strong>Payment Method:</strong></p>
        <p style={{ marginLeft: '20px', marginBottom: '5px' }}>Check or</p>
        <p style={{ marginLeft: '20px', marginBottom: '15px' }}>Wire Payment</p>

        <p>Date Received: __________________________</p>
      </div>

      {/* Exhibit B */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13pt',
          fontWeight: 'bold',
          marginBottom: '15px',
          textDecoration: 'underline'
        }}>
          Exhibit B – Deliverables:
        </h3>
        <p>
          Design intake, layout development, material/finish selections, one revision, and final design presentation.
        </p>
      </div>

      {/* Exhibit C */}
      <div>
        <h3 style={{
          fontSize: '13pt',
          fontWeight: 'bold',
          marginBottom: '15px',
          textDecoration: 'underline'
        }}>
          Exhibit C – Schedule:
        </h3>
        <p style={{ marginBottom: '15px' }}>
          Confirmed Design Start: ________________________
        </p>
        <p>
          Estimated Completion: ______________________
        </p>
      </div>

      {/* Print CSS */}
      <style>
        {`
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            @page {
              size: letter;
              margin: 0.5in;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DesignFeeAgreementHTML;