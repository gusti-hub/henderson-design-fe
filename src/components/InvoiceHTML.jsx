// InvoiceHTML.jsx - Final Version (Matches Screenshot 100%)
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { backendServer } from "../utils/info";

const InvoiceHTML = () => {
  const { clientId, invoiceNumber } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoiceData();
  }, [clientId, invoiceNumber]);

  const fetchInvoiceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${backendServer}/api/invoices/data/${clientId}/${invoiceNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setInvoiceData(result.data);
      } else {
        setError("Failed to load invoice data");
      }
    } catch (error) {
      setError("Failed to load invoice data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) => {
    if (!num && num !== 0) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (loading) return <div>Loading invoice...</div>;
  if (error || !invoiceData) return <div>{error}</div>;

  const invoiceAmount = invoiceData.invoiceAmount || 0;
  const taxAmount = invoiceData.taxAmount || 0;
  const pennyAdjustment = 0.06;
  const totalAmount = invoiceAmount + taxAmount + pennyAdjustment;

  return (
    <>
      <style>{`
        body { 
          font-family: Calibri, Arial, sans-serif !important;
          background: #f5f5f5;
          margin: 0;
          padding: 0;
        }

        /* Tint blue filter for logo */
        .filter-hdg-blue {
          filter: brightness(0) saturate(100%) invert(68%) sepia(16%)
                  saturate(984%) hue-rotate(176deg) brightness(89%)
                  contrast(89%);
        }

        /* =====================================================
           PRINT FIX — LANDSCAPE / COLOR / NO SHRINK / NO MARGIN
           ===================================================== */
        @media print {

          @page { 
            size: letter portrait; 
            margin: 0; 
            print-scaling: none;
          }

          /* HILANGKAN SHADOW & BACKGROUND */
          .invoice-container { 
            box-shadow: none !important; 
            background: white !important;
          }

          /* FIX WARNA */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* FIX SHRINK & OFFSET */
          .invoice-container {
            width: 1100px !important;

            /* kompensasi margin Chrome */
            margin-left: -18px !important;
            margin-top: -18px !important;

            /* fix scaling */
            transform: scale(1.04) !important;
            transform-origin: top left !important;
          }
        }
      `}</style>

      <div
        className="invoice-container"
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          background: "white",
          padding: "40px 50px",
          boxShadow: "0px 0px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "40px",
            paddingTop: "10px",
          }}
        >
          {/* LEFT */}
          <div style={{ width: "260px" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "4px",
                color: "#000",
              }}
            >
              Henderson Design Group
            </div>

            <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
              4343 Royal Place <br />
              Honolulu HI 96816 <br />
              <span
                style={{
                  color: "#9b0000",
                  textDecoration: "underline",
                  marginTop: "3px",
                  display: "inline-block",
                }}
              >
                henderson.house
              </span>
            </div>
          </div>

          {/* CENTER TITLE */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              marginTop: "5px",
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#5B9BD5",
                letterSpacing: "0.5px",
              }}
            >
              {invoiceData.currentPercentage}% Deposit Invoice
            </div>
          </div>

          {/* RIGHT LOGO */}
          <div style={{ width: "260px", textAlign: "right" }}>
            <img
              src="/images/HDG-Logo.png"
              alt="Henderson Design Group"
              className="filter-hdg-blue"
              style={{
                height: "70px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* BILL TO + DATE BOXES */}
        <div
          style={{
            borderTop: "2px solid #5B9BD5",
            paddingTop: "25px",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          {/* BILL TO */}
          <div>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>BILL TO</div>
            <div style={{ lineHeight: "1.6", fontSize: "15px" }}>
              {invoiceData.clientName} - Unit {invoiceData.unitNumber} <br />
              Invoice # {invoiceData.invoiceNumber}
            </div>
          </div>

          {/* DATE BOX GROUP */}
          <div style={{ display: "flex", border: "1px solid #B8B8B8" }}>
            {/* DATE */}
            <div
              style={{
                width: "160px",
                background: "#D9E9F7",
                padding: "12px",
                textAlign: "center",
                borderRight: "1px solid #B8B8B8",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>DATE</div>
              <div>{formatDate(invoiceData.invoiceDate)}</div>
            </div>

            {/* PLEASE PAY */}
            <div
              style={{
                width: "160px",
                background: "#5B9BD5",
                padding: "12px",
                textAlign: "center",
                borderRight: "1px solid #3A7EAA",
                color: "white",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                PLEASE PAY
              </div>
              <div style={{ fontWeight: "bold" }}>
                ${formatCurrency(totalAmount)}
              </div>
            </div>

            {/* DUE DATE */}
            <div
              style={{
                width: "160px",
                background: "#D9E9F7",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                DUE DATE
              </div>
              <div>{formatDate(invoiceData.dueDate)}</div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontSize: "15px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid black" }}>
              <th style={{ padding: "8px", textAlign: "left", width: "18%" }}>
                ACTIVITY
              </th>
              <th style={{ padding: "8px", textAlign: "left" }}>DESCRIPTION</th>
              <th style={{ padding: "8px", textAlign: "center", width: "8%" }}>
                QTY
              </th>
              <th style={{ padding: "8px", textAlign: "right", width: "12%" }}>
                RATE
              </th>
              <th style={{ padding: "8px", textAlign: "right", width: "15%" }}>
                AMOUNT
              </th>
            </tr>
          </thead>

          <tbody>
            {/* RETAINER ROW */}
            <tr>
              <td style={{ padding: "10px 8px", fontWeight: "bold" }}>Retainer</td>
              <td style={{ padding: "10px 8px" }}>
                Design Fee Invoice ({invoiceData.currentPercentage}%) -{" "}
                {invoiceData.collection} Package - {invoiceData.bedroomCount} Bedroom
              </td>
              <td style={{ textAlign: "center" }}>1</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(invoiceAmount)}</td>
              <td style={{ textAlign: "right", fontWeight: "600" }}>
                {formatCurrency(invoiceAmount)}
              </td>
            </tr>

            {/* SUB LINE 1 */}
            <tr>
              <td></td>
              <td style={{ padding: "10px 8px" }}>
                Design Fee{" "}
                <span style={{ background: "yellow" }}>Nalu</span> Package{" "}
                {invoiceData.bedroomCount} Bedroom (Non-Refundable)
              </td>
              <td style={{ textAlign: "center" }}>1</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(invoiceAmount)}</td>
              <td style={{ textAlign: "right", fontWeight: "600" }}>
                {formatCurrency(invoiceAmount)}
              </td>
            </tr>

            {/* SUB LINE 2 */}
            <tr>
              <td></td>
              <td style={{ padding: "10px 8px" }}>Taxes (Non-Refundable)</td>
              <td style={{ textAlign: "center" }}>1</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(taxAmount)}</td>
              <td style={{ textAlign: "right", fontWeight: "600" }}>
                {formatCurrency(taxAmount)}
              </td>
            </tr>

            {/* SUB LINE 3 */}
            <tr>
              <td></td>
              <td style={{ padding: "10px 8px" }}>
                <span style={{ background: "yellow" }}>
                  Verification Penny Adjustment
                </span>
              </td>
              <td style={{ textAlign: "center" }}>1</td>
              <td style={{ textAlign: "right" }}>0.06</td>
              <td style={{ textAlign: "right", fontWeight: "600" }}>0.06</td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "35px",
          }}
        >
          <div
            style={{
              width: "300px",
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "5px",
            }}
          >
            <span style={{ fontSize: "16px" }}>TOTAL</span>
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* TOTAL DUE */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid black",
            paddingTop: "12px",
            marginTop: "12px",
            marginBottom: "50px",
          }}
        >
          <div
            style={{
              width: "300px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              TOTAL DUE
            </span>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              ${formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* THANK YOU */}
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#5B9BD5",
              letterSpacing: "1px",
            }}
          >
            THANK YOU.
          </span>
        </div>
      </div>
    </>
  );
};

export default InvoiceHTML;
