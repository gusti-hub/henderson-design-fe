// DesignFeeAgreementHTML.jsx
import React, { useEffect } from "react";

const DesignFeeAgreementHTML = ({ agreementData }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  const data = agreementData || {
    effectiveDate: "11.30.25",
    clientName: "Client Name",
    unitNumber: "Unit Number",
    invoiceNumber: "ALIA-DF-0001",
    packageDescription:
      "Client has a 1 bedroom unit and would like to proceed with a Nalu package.",
    designFee: "5,000.00",
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
          Design Fee Agreement – Ālia Furniture Collections
        </p>

        <p style={p}><strong>Effective Date:</strong> {data.effectiveDate}</p>
        <p style={p}><strong>Client Name:</strong> {data.clientName}</p>
        <p style={p}><strong>Unit / Residence:</strong> {data.unitNumber}</p>
        <p style={p}><strong>Reference:</strong> Invoice #{data.invoiceNumber}</p>

        <p style={sectionHeader}>1. Purpose:</p>
        <p style={p}>
          This Design Fee Agreement authorizes Henderson Design Group (“HDG”) to
          commence the interior design phase for the Client’s residence and
          outlines the scope, process, and payment terms for design services
          provided under the Ālia Furnishing Program.
        </p>

        <p style={sectionHeader}>2. Design Fee and Payment Terms:</p>
        <p style={p}>
          The Client agrees to pay HDG a non-refundable design fee in the amount
          specified in Exhibit A. Payment is due in full upon execution of this
          Agreement and prior to the commencement of any design work.
        </p>
        <p style={p}>
          <strong>Description of Scope:</strong> {data.packageDescription}
        </p>
        <p style={p}>
          Design services will not begin until payment has been received and
          confirmed by HDG.
        </p>
      </div>

      {/* ---------- PAGE 2 ---------- */}
      <div style={{ pageBreakAfter: "always", paddingTop: "1.35in" }}>
        <p style={sectionHeader}>3. Scope of Design Services:</p>
        <p style={p}>The Design Fee includes the following services:</p>

        <ul
          style={{
            paddingLeft: "0.5in",
            fontFamily: "FreightSansProLight",
            fontSize: "12pt",
            lineHeight: "22.4pt"
          }}
        >
          <li>Design intake meeting and requirements review</li>
          <li>Review of floor plan and unit layout</li>
          <li>Furniture layout and collection selection (Lani, Nalu, or Foundation)</li>
          <li>Material, fabric, and finish selections</li>
          <li>One (1) round of revisions</li>
          <li>
            Final design presentation and furnishing proposal with a line-item
            budget
          </li>
        </ul>

        <p style={p}>
          Additional revisions, custom work, sourcing requests, or consultations
          outside the scope above may be billed separately at HDG’s standard
          rates.
        </p>

        <p style={sectionHeader}>4. Schedule:</p>
        <p style={p}>
          Upon receipt of the design fee, the Client secures placement within
          HDG’s design calendar. A confirmed design start date will be scheduled
          based on availability.
        </p>
        <p style={p}>
          A Project Manager will be assigned as the Client’s primary point of
          contact throughout the design phase.
        </p>
      </div>

      {/* ---------- PAGE 3 ---------- */}
      <div style={{ pageBreakAfter: "always", paddingTop: "1.35in" }}>
        <p style={sectionHeader}>5. Credit Toward Production:</p>
        <p style={p}>
          If the Client proceeds to production, the design fee paid under this
          Agreement will be credited in full toward the Client’s total furnishing
          package cost.
        </p>
        <p style={p}>
          This credit remains valid for six (6) months from the date of final
          design presentation approval.
        </p>

        <p style={sectionHeader}>6. Cancellation and Refund Policy:</p>
        <p style={p}>
          The design fee is non-refundable. If the Client elects not to proceed
          after design work has commenced, HDG may, at its discretion, apply the
          fee toward future design services for the same property.
        </p>

        <p style={sectionHeader}>7. Ownership of Materials:</p>
        <p style={p}>
          All drawings, layouts, specifications, and design materials remain the
          exclusive property of HDG until the furnishing package is paid in full.
        </p>

        <p style={sectionHeader}>8. Liability and Limitations:</p>
        <p style={p}>
          HDG will exercise reasonable care in performing all services but shall
          not be liable for delays caused by third parties, construction progress,
          building access restrictions, or material availability beyond its
          control.
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
        <p style={sectionHeader}>Exhibit A – Design Fee Summary:</p>
        <p style={p}><strong>Design Fee Amount:</strong> ${data.designFee}</p>
        <p style={p}><strong>Collection Type:</strong> {data.collectionType}</p>

        <p style={{ ...p, marginTop: "8pt" }}><strong>Payment Method:</strong></p>

        <div style={{ marginLeft: "0.5in", marginTop: "6pt" }}>
          <p style={p}>• Check or</p>
          <p style={p}>• Wire Payment</p>
        </div>

        <p style={{ ...sectionHeader, marginTop: "20pt" }}>
          Exhibit B – Deliverables:
        </p>
        <p style={p}>
          Design intake, layout development, material and finish selections,
          one revision, and final design presentation.
        </p>

        <p style={{ ...sectionHeader, marginTop: "20pt" }}>
          Exhibit C – Schedule:
        </p>
        <p style={p}>Confirmed Design Start: ________________________</p>
        <p style={p}>Estimated Completion: ________________________</p>
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

export default DesignFeeAgreementHTML;
