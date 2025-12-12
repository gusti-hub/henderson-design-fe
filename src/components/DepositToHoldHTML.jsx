// DepositToHoldHTML.jsx
import React, { useEffect } from 'react';

const DepositToHoldHTML = ({ depositData }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  const data = depositData || {
    effectiveDate: "11.30.25",
    clientName: "Angie and Yuji Okumoto",
    unitNumber: "2005",
    invoiceNumber: "ALIA0006",
    packageDescription:
      "Client has a 1 bedroom unit and would like to proceed with a Nalu package. (Lani, Nalu, Foundation).",
    depositAmount: "26,334.06 (inclusive of $5,000 Design Fee)",
    collectionType: "Nalu"
  };

  const p = {
    margin: 0,
    marginBottom: "6pt",
    fontSize: "12pt",
    lineHeight: "22.4pt", // EXACT spacing like Word (12pt font with exactly 14.4pt spacing)
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
            fontFamily: "FreightSansProLight",
        }}
        >

      {/* ---------- PAGE 1 ---------- */}
      <div style={{ pageBreakAfter: "always" }}>

        <p style={title}>Henderson Design Group</p>
        <p style={subtitle}>
          Deposit to hold 2025 pricing agreement – Ālia Furniture Collections
        </p>

        <p style={p}><strong>Effective Date:</strong> {data.effectiveDate}</p>
        <p style={p}><strong>Client Name:</strong> {data.clientName}</p>
        <p style={p}><strong>Unit / Residence:</strong> {data.unitNumber}</p>
        <p style={p}><strong>Reference:</strong> Invoice #{data.invoiceNumber}</p>

        <p style={sectionHeader}>1. Purpose:</p>
        <p style={p}>
          This Agreement outlines the terms under which Henderson Design Group (“HDG”) will
          hold or lock in the 2025 pricing for the Client’s selected Ālia furnishing package.
        </p>
        <p style={p}>
          The Deposit secures current pricing for the selected HDG collection and sets
          preliminary scheduling and resource allocation for future design and production.
        </p>
        <p style={p}>
          The Deposit secures priority installation of the furniture package.
        </p>

        <p style={sectionHeader}>2. Deposit and Payment Terms:</p>
        <p style={p}>
          The Client agrees to pay HDG a deposit equal to thirty percent (30%) of the total
          selected furnishing package based on the chosen Collection.
        </p>
        <p style={p}>
          <strong>Description of Scope:</strong> {data.packageDescription}
        </p>
        <p style={p}>
          The deposit must be received by December 15, 2025, to guarantee 2025 pricing.
        </p>
        <p style={p}>
          Upon final design approval, the Client will make an additional payment that brings
          the total amount paid to fifty percent (50%) of the final design price…
        </p>
        <p style={p}>
          The remaining fifty percent (50%) balance will be made with two 25% balance progress
          payments as outlined on the client portal payment schedule provided by HDG.
        </p>
      </div>

      {/* ---------- PAGE 2 ---------- */}
      <div style={{
        pageBreakAfter: "always",
        paddingTop: "1.35in"   // ➜ Fix margin top Word
        }}>

        <p style={sectionHeader}>3. Scope of Agreement:</p>
        <p style={p}>The Deposit to Hold Pricing includes:</p>

        <ul
          style={{
            paddingLeft: "0.5in",
            fontFamily: "FreightSansProLight",
            fontSize: "12pt",
            lineHeight: "22.4pt",
          }}
        >
          <li style={{ marginBottom: "4pt" }}>
            Locking in current 2025 pricing for the selected HDG collection. Description of Scope:{" "}
            {data.packageDescription}
          </li>
          <li style={{ marginBottom: "4pt" }}>
            Reserving materials and production allocation in the manufacturing schedule shall have
            no rise in pricing in 2026 or 2027.
          </li>
          <li>
            Part of this 30% shall be applied to the applicable design fee agreement…
          </li>
        </ul>

        <p style={sectionHeader}>4. Schedule:</p>
        <p style={p}>
          Upon receipt of the deposit, HDG will reserve pricing and assign a tentative project
          window within the 2026 design phase…
        </p>

        <p style={sectionHeader}>5. Refund and Cancellation Policy:</p>
        <p style={p}>
          If the Client cancels prior to design approval, the deposit will be refundable less
          a ten percent (10%) administrative fee…
        </p>
        <p style={p}>Design fees are non-refundable.</p>

        <p style={sectionHeader}>6. Credit Toward Final Payment:</p>
        <p style={p}>
          All deposit payments made under this Agreement will be fully credited toward the
          Client’s total furnishing package cost…
        </p>
      </div>

      {/* ---------- PAGE 3 ---------- */}
        <div style={{
        pageBreakAfter: "always",
        paddingTop: "1.35in"   // ➜ Fix margin top Word
        }}>

        <p style={sectionHeader}>7. Ownership of Materials:</p>
        <p style={p}>
          All drawings, layouts, and specifications provided by HDG remain the property of HDG…
        </p>

        <p style={sectionHeader}>8. Liability and Limitations:</p>
        <p style={p}>
          HDG will exercise reasonable care in performing all services…
        </p>

        <p style={sectionHeader}>9. Governing Law:</p>
        <p style={p}>This Agreement is governed by the laws of the State of Hawaii.</p>

        <p style={sectionHeader}>10. Acceptance:</p>
        <p style={p}>By signing below, both parties agree to the terms of this Agreement:</p>

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
      <div style={{
        pageBreakAfter: "always",
        paddingTop: "1.35in"   // ➜ Fix margin top Word
        }}>

        <p style={sectionHeader}>Exhibit A – Deposit Summary:</p>
        <p style={p}><strong>Deposit Amount:</strong> ${data.depositAmount}</p>
        <p style={p}><strong>Collection Type:</strong> {data.collectionType}</p>

        <p style={{ ...p, marginTop: "8pt" }}><strong>Payment Method:</strong></p>

<div style={{ marginLeft: "0.5in", marginTop: "6pt" }}>
  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "4pt" }}>
    <span style={{ fontSize: "12pt", lineHeight: "22.4pt", marginRight: "8pt" }}>•</span>
    <span style={{ fontSize: "12pt", lineHeight: "22.4pt" }}>Check or</span>
  </div>

  <div style={{ display: "flex", alignItems: "flex-start" }}>
    <span style={{ fontSize: "12pt", lineHeight: "22.4pt", marginRight: "8pt" }}>•</span>
    <span style={{ fontSize: "12pt", lineHeight: "22.4pt" }}>Wire Payment</span>
  </div>
</div>


        <p style={p}>Date Received: __________________________</p>

        <p style={{ ...sectionHeader, marginTop: "20pt" }}>Exhibit B – Deliverables:</p>
        <p style={p}>
          Pricing lock, materials allocation, and production scheduling for the selected HDG
          furnishing collection.
        </p>

        <p style={{ ...sectionHeader, marginTop: "20pt" }}>Exhibit C – Schedule:</p>

        <p style={p}>Deposit Received: ________________________</p>
        <p style={p}>Design Start Window: _____________________</p>
        <p style={p}>Estimated Production Window: _____________</p>

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
                margin: 0; /* Use container padding as margins */
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

export default DepositToHoldHTML;
