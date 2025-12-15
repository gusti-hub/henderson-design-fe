// DesignHoldFeeAgreementHTML.jsx
import React, { useEffect } from "react";

const DesignHoldFeeAgreementHTML = ({ agreementData }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  const data = agreementData || {
    effectiveDate: "11.30.25",
    clientName: "Client Name",
    unitNumber: "Unit Number",
    invoiceNumber: "ALIA-DH-0001",
    packageDescription:
      "Client has a 1 bedroom unit and would like to proceed with a Nalu package.",
    designHoldFee: "2,500.00",
    collectionType: "Nalu"
  };

  const p = {
    margin: 0,
    marginBottom: "6pt",
    fontSize: "12pt",
    lineHeight: "22.4pt",
    fontFamily: "FreightSansProLight"
  };

  const title = {
    ...p,
    fontSize: "16pt",
    textAlign: "center",
    marginBottom: "8pt"
  };

  const subtitle = {
    ...p,
    fontSize: "14pt",
    textAlign: "center",
    marginBottom: "16pt"
  };

  const sectionHeader = {
    ...p,
    fontWeight: "bold",
    marginTop: "6pt"
  };

  return (
    <div
      style={{
        paddingTop: "1in",
        paddingLeft: "1in",
        paddingRight: "1in",
        paddingBottom: "1in",
        background: "#fff",
        fontFamily: "FreightSansProLight"
      }}
    >
      {/* ---------- PAGE 1 ---------- */}
      <div style={{ pageBreakAfter: "always" }}>
        <p style={title}>Henderson Design Group</p>
        <p style={subtitle}>
          Design Hold Fee Agreement – Ālia Furniture Collections
        </p>

        <p style={p}><strong>Effective Date:</strong> {data.effectiveDate}</p>
        <p style={p}><strong>Client Name:</strong> {data.clientName}</p>
        <p style={p}><strong>Unit / Residence:</strong> {data.unitNumber}</p>
        <p style={p}><strong>Reference:</strong> Invoice #{data.invoiceNumber}</p>

        <p style={sectionHeader}>1. Purpose:</p>
        <p style={p}>
          This Design Hold Fee Agreement authorizes Henderson Design Group (“HDG”)
          to reserve a position for the Client within HDG’s design calendar and
          outlines the terms under which preliminary design coordination and
          scheduling are secured.
        </p>

        <p style={sectionHeader}>2. Design Hold Fee and Payment Terms:</p>
        <p style={p}>
          The Client agrees to pay HDG a non-refundable design hold fee in the
          amount specified in Exhibit A. Payment is due in full upon execution
          of this Agreement.
        </p>
        <p style={p}>
          <strong>Description of Scope:</strong> {data.packageDescription}
        </p>
        <p style={p}>
          Payment is required before HDG reserves design resources or confirms
          any design-related scheduling.
        </p>
      </div>

      {/* ---------- PAGE 2 ---------- */}
      <div style={{ pageBreakAfter: "always", paddingTop: "1.35in" }}>
        <p style={sectionHeader}>3. Scope of Services Covered by Design Hold Fee:</p>
        <p style={p}>The Design Hold Fee includes:</p>

        <ul
          style={{
            paddingLeft: "0.5in",
            fontFamily: "FreightSansProLight",
            fontSize: "12pt",
            lineHeight: "22.4pt"
          }}
        >
          <li>Reservation of a design calendar position</li>
          <li>Initial design intake and requirements discussion</li>
          <li>Preliminary review of floor plan and unit layout</li>
          <li>General package direction discussion (Lani, Nalu, or Foundation)</li>
          <li>Assignment of a Project Manager as primary contact</li>
        </ul>

        <p style={p}>
          The Design Hold Fee does not include full design services such as
          detailed layouts, material selections, renderings, or comprehensive
          design presentations.
        </p>

        <p style={sectionHeader}>4. Calendar Hold Period:</p>
        <p style={p}>
          Upon receipt of the Design Hold Fee, HDG will reserve the Client’s
          position in the design calendar for a period of six (6) months from
          the effective date of this Agreement.
        </p>
        <p style={p}>
          If a Design Fee Agreement is not executed within this six-month period,
          HDG may release the calendar hold at its discretion. The Design Hold
          Fee remains non-refundable.
        </p>
      </div>

      {/* ---------- PAGE 3 ---------- */}
      <div style={{ pageBreakAfter: "always", paddingTop: "1.35in" }}>
        <p style={sectionHeader}>5. Transition to Full Design Services:</p>
        <p style={p}>
          To proceed with full design services, the Client must execute a
          separate Design Fee Agreement and pay the applicable design fee.
        </p>
        <p style={p}>
          The Design Hold Fee will be credited in full toward the design fee if
          the Design Fee Agreement is executed within the six (6) month hold
          period.
        </p>

        <p style={sectionHeader}>6. Cancellation and Refund Policy:</p>
        <p style={p}>
          The Design Hold Fee is non-refundable under all circumstances,
          including cancellation, postponement, or expiration of the hold
          period without execution of a Design Fee Agreement.
        </p>

        <p style={sectionHeader}>7. Ownership of Materials:</p>
        <p style={p}>
          All preliminary materials, notes, and documentation prepared by HDG
          remain the exclusive property of HDG and may not be used or
          implemented without written authorization.
        </p>

        <p style={sectionHeader}>8. Pricing Considerations:</p>
        <p style={p}>
          This Agreement does not guarantee any pricing for furniture packages
          or design services. All pricing will be based on rates in effect at
          the time the Design Fee Agreement and subsequent Purchase Agreement
          are executed.
        </p>

        <p style={sectionHeader}>9. Governing Law:</p>
        <p style={p}>
          This Agreement shall be governed by the laws of the State of Hawaii.
        </p>

        <p style={sectionHeader}>10. Acceptance:</p>
        <p style={p}>
          By signing below, both parties agree to the terms of this Agreement:
        </p>

        <br /><br />

        <p style={p}>Client Signature: ______________________________________________</p>
        <p style={p}>Date: ____________</p>
        <p style={p}>Printed Name: ________________________________________________</p>

        <br /><br />

        <p style={p}>HDG Representative: ______________________________________________</p>
        <p style={p}>Date: ____________</p>
        <p style={p}>Printed Name: ____________________________________________________</p>
      </div>

      {/* ---------- PAGE 4 ---------- */}
      <div style={{ paddingTop: "1.35in" }}>
        <p style={sectionHeader}>Exhibit A – Design Hold Fee Summary:</p>
        <p style={p}><strong>Design Hold Fee Amount:</strong> ${data.designHoldFee}</p>
        <p style={p}><strong>Preliminary Collection Direction:</strong> {data.collectionType}</p>
        <p style={p}><strong>Hold Period:</strong> Six (6) months from effective date</p>

        <p style={{ ...p, marginTop: "8pt" }}><strong>Payment Method:</strong></p>

        <div style={{ marginLeft: "0.5in", marginTop: "6pt" }}>
          <p style={p}>• Check or</p>
          <p style={p}>• Wire Payment</p>
        </div>

        <p style={{ ...sectionHeader, marginTop: "20pt" }}>
          Exhibit B – Services Included:
        </p>
        <p style={p}>
          Calendar reservation, preliminary intake, basic review, and project
          coordination as outlined in Section 3.
        </p>

        <p style={{ ...sectionHeader, marginTop: "20pt" }}>
          Exhibit C – Important Dates:
        </p>
        <p style={p}>Design Hold Fee Paid: ________________________</p>
        <p style={p}>Calendar Hold Expires: ________________________</p>
        <p style={p}>Design Fee Agreement Due By: ________________________</p>
      </div>

      {/* PRINT + FONT CSS */}
      <style>
        {`
          @font-face {
            font-family: 'FreightSansProLight';
            src: url('/fonts/freight-sans-pro-light-regular.ttf') format('truetype');
          }

          @media print {
            @page {
              size: letter;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DesignHoldFeeAgreementHTML;
