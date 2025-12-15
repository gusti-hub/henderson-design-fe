// DesignHoldFeeAgreementHTML.jsx
import React, { useEffect } from 'react';

const DesignHoldFeeAgreementHTML = ({ agreementData }) => {
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
    designFee: '2,500',
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
          Design Hold Fee Agreement – Ālia Furniture Collections
        </h2>
        <p style={{ fontSize: '11pt', fontStyle: 'italic', color: '#666' }}>
          (For Clients WITHOUT 2025 Price Lock)
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
          This Design Hold Fee Agreement authorizes Henderson Design Group ("HDG") to reserve a place in HDG's 2026 design calendar and begin preliminary design work for the Client's residence. It outlines the scope, timeline, and payment terms for securing a design slot and transitioning to full design services.
        </p>
      </div>

      {/* Design Hold Fee and Payment Terms */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Design Hold Fee and Payment Terms:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          The Client agrees to pay HDG a non-refundable Design Hold Fee, due in full at signing. This fee reserves the Client's place in HDG's 2026 design calendar and initiates preliminary design preparation.
        </p>
        
        <p style={{
          backgroundColor: '#FFFF00',
          padding: '10px',
          marginBottom: '10px'
        }}>
          <strong>Description of Scope:</strong> {data.packageDescription}
        </p>

        <p style={{
          backgroundColor: '#FFFF00',
          padding: '10px',
          marginBottom: '10px'
        }}>
          <strong>Design Hold Fee:</strong> ${data.designFee}
        </p>

        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Payment is required before HDG reserves design resources or sets confirmed meeting dates.
        </p>

        <p style={{ textAlign: 'justify' }}>
          This Design Hold Fee secures the Client's position in the 2026 calendar. To proceed with full design services, the Client must execute a separate Design Fee Agreement and pay the applicable design fee (typically $5,000-$15,000 depending on package complexity). The Design Hold Fee will be credited toward that full design fee upon execution of the Design Fee Agreement.
        </p>
      </div>

      {/* Scope of Services */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Scope of Services Covered by Design Hold Fee:
        </h3>
        <p style={{ marginBottom: '10px' }}>The Design Hold Fee includes:</p>
        <ul style={{ marginLeft: '30px', marginBottom: '10px' }}>
          <li>Reserved position in HDG's 2026 design calendar</li>
          <li>Initial design intake meeting</li>
          <li>Preliminary review of floor plan and unit layout</li>
          <li>Basic package direction discussion (Lani, Nalu, or Foundation)</li>
          <li>Assignment of Project Manager as primary contact</li>
        </ul>
        <p style={{ textAlign: 'justify' }}>
          This Design Hold Fee does NOT include full design services such as detailed layouts, material selections, renderings, or comprehensive presentations. Those services require execution of a separate Design Fee Agreement.
        </p>
      </div>

      {/* Calendar Hold Period */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Calendar Hold Period:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Upon payment of the Design Hold Fee, HDG will reserve the Client's place in the 2026 design calendar for a period of six (6) months from the effective date of this Agreement.
        </p>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Within this six-month period, the Client must execute a Design Fee Agreement and pay the full design fee to proceed with comprehensive design services. If the Client does not execute the Design Fee Agreement within six months, HDG reserves the right to release the calendar hold, though the Design Hold Fee remains non-refundable.
        </p>
        <p style={{ textAlign: 'justify' }}>
          If the Client executes the Design Fee Agreement within the six-month hold period, the Design Hold Fee will be credited in full toward the design fee amount.
        </p>
      </div>

      {/* Schedule */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Schedule:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          Upon payment of the Design Hold Fee, HDG will assign a tentative design start window within the 2026 calendar year. The exact design start date will be confirmed upon execution of the Design Fee Agreement.
        </p>
        <p style={{ textAlign: 'justify' }}>
          A Project Manager will be assigned as the Client's primary point of contact for preliminary discussions. Full design meetings and presentations will be scheduled after the Design Fee Agreement is executed.
        </p>
      </div>

      {/* Transition to Full Design Services */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Transition to Full Design Services:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          To proceed with full design services, the Client must:
        </p>
        <ol style={{ marginLeft: '30px', marginBottom: '10px' }}>
          <li>Execute a Design Fee Agreement within six (6) months of this Agreement's effective date</li>
          <li>Pay the full design fee as specified in the Design Fee Agreement</li>
          <li>The Design Hold Fee will be credited toward the design fee payment</li>
        </ol>
        <p style={{ textAlign: 'justify' }}>
          If the Client proceeds to production after design completion, the combined Design Hold Fee plus Design Fee will be credited toward the total furnishing package price, subject to the terms of the Purchase Agreement.
        </p>
      </div>

      {/* Cancellation and Refunds */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Cancellation and Refunds:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          The Design Hold Fee is non-refundable under all circumstances, including:
        </p>
        <ul style={{ marginLeft: '30px', marginBottom: '10px' }}>
          <li>If the Client chooses not to proceed with the Design Fee Agreement</li>
          <li>If the six-month hold period expires without executing the Design Fee Agreement</li>
          <li>If the Client cancels or postpones their project</li>
        </ul>
        <p style={{ textAlign: 'justify' }}>
          HDG may, at its sole discretion, apply the Design Hold Fee toward future design services for the same property if circumstances warrant, but this is not guaranteed.
        </p>
      </div>

      {/* Ownership of Materials */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Ownership of Materials:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          All preliminary drawings, notes, and materials created under this Design Hold Fee Agreement remain the exclusive property of HDG.
        </p>
        <p style={{ textAlign: 'justify' }}>
          The Client may not reuse, reproduce, or implement any preliminary design concepts without HDG's written approval and execution of appropriate design and production agreements.
        </p>
      </div>

      {/* Pricing Considerations */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Pricing Considerations:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          <strong>IMPORTANT:</strong> This Agreement does not guarantee 2025 pricing for furniture packages or design services. Clients who execute this Design Hold Fee Agreement are subject to current pricing at the time they execute their Design Fee Agreement and subsequent Purchase Agreement.
        </p>
        <p style={{ textAlign: 'justify' }}>
          Pricing for furniture packages, materials, and services may change over time due to market conditions, vendor pricing updates, material availability, and other factors beyond HDG's control. The Client acknowledges that final pricing will be provided in the Design Fee Agreement and Purchase Agreement based on pricing current at that time.
        </p>
      </div>

      {/* Liability and Limitations */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Liability and Limitations:
        </h3>
        <p style={{ textAlign: 'justify', marginBottom: '10px' }}>
          HDG will exercise reasonable care in performing all services under this Agreement.
        </p>
        <p style={{ textAlign: 'justify' }}>
          HDG is not responsible for delays caused by the Client's decision-making timeline, third parties, construction progress, HOA/building access limitations, material availability, or other circumstances outside its control.
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

      {/* Page Break */}
      <div style={{ pageBreakBefore: 'always' }} />

      {/* Acceptance */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px' }}>
          Acceptance:
        </h3>
        <p style={{ marginBottom: '20px' }}>
          By signing below, both parties agree to the terms of this Design Hold Fee Agreement:
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

      {/* Exhibit A */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13pt',
          fontWeight: 'bold',
          marginBottom: '15px',
          textDecoration: 'underline'
        }}>
          Exhibit A – Design Hold Fee Summary:
        </h3>
        
        <div style={{
          backgroundColor: '#FFFF00',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Design Hold Fee Amount:</strong> ${data.designFee}
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Preliminary Collection Direction:</strong> {data.collectionType}
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Hold Period:</strong> 6 months from effective date
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
          Exhibit B – Services Included:
        </h3>
        <p style={{ marginBottom: '10px' }}>
          <strong>Included with Design Hold Fee:</strong>
        </p>
        <ul style={{ marginLeft: '30px', marginBottom: '15px' }}>
          <li>Reserved calendar position for 2026</li>
          <li>Initial design intake meeting</li>
          <li>Preliminary floor plan review</li>
          <li>Package direction discussion</li>
          <li>Project Manager assignment</li>
        </ul>
        <p style={{ marginBottom: '10px' }}>
          <strong>NOT Included (Requires Design Fee Agreement):</strong>
        </p>
        <ul style={{ marginLeft: '30px' }}>
          <li>Detailed furniture layouts and elevations</li>
          <li>Material and finish selections</li>
          <li>Design revisions</li>
          <li>Comprehensive design presentations</li>
          <li>Line-item budget development</li>
        </ul>
      </div>

      {/* Exhibit C */}
      <div>
        <h3 style={{
          fontSize: '13pt',
          fontWeight: 'bold',
          marginBottom: '15px',
          textDecoration: 'underline'
        }}>
          Exhibit C – Important Deadlines:
        </h3>
        <p style={{ marginBottom: '10px' }}>
          <strong>Design Hold Fee Payment Due:</strong> Upon execution of this Agreement
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>Calendar Hold Expires:</strong> _________________________ (6 months from effective date)
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>Design Fee Agreement Must Be Executed By:</strong> _________________________
        </p>
        <p style={{ marginBottom: '20px' }}>
          <strong>Tentative Design Start Window:</strong> _________________________ (To be confirmed upon Design Fee Agreement execution)
        </p>
        <p style={{
          padding: '10px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          fontStyle: 'italic'
        }}>
          <strong>Note:</strong> If Design Fee Agreement is not executed within 6 months, HDG may release the calendar hold. Design Hold Fee remains non-refundable.
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

export default DesignHoldFeeAgreementHTML;