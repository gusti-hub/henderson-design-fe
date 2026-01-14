import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Clock, Printer, ChevronLeft } from 'lucide-react';
import { backendServer } from '../utils/info';

const ProposalEditor = ({ orderId, version, onClose, mode = 'edit' }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [products, setProducts] = useState([]);
  const [clientInfo, setClientInfo] = useState({});
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [showPrintInstructions, setShowPrintInstructions] = useState(false);

  // ✅ Store original document title
  const [originalTitle] = useState(document.title);

  useEffect(() => {
    loadProposalData();
  }, [orderId, version]);

  // ✅ UPDATE: Set document title for better print filename
  useEffect(() => {
    if (proposalData && clientInfo.name) {
      // Format: Proposal_ClientName_UnitNumber_v1_2025-01-16.pdf
      const clientName = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const unitNumber = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      const versionNum = proposalData.version || 1;
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const filename = `Proposal_${clientName}${unitNumber ? '_' + unitNumber : ''}_v${versionNum}_${date}`;
      document.title = filename;
    }

    // Cleanup: restore original title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [proposalData, clientInfo, originalTitle]);

  const loadProposalData = async () => {
    try {
      const token = localStorage.getItem('token');
      const versionParam = version || 'latest';
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}/${versionParam}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = await response.json();
      if (result.success) {
        setProposalData(result.data);
        setProducts(result.data.selectedProducts || []);
        setClientInfo(result.data.clientInfo || {});
      }
    } catch (error) {
      console.error('Error loading proposal:', error);
      alert('Failed to load proposal data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: proposalData.version,
            products,
            clientInfo,
            notes: versionNotes || 'Updated proposal'
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('✅ Proposal saved successfully');
        loadProposalData();
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNewVersion = async () => {
    if (!versionNotes.trim()) {
      alert('Please add notes for this new version');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}/new-version`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            products,
            clientInfo,
            notes: versionNotes
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        alert(`✅ Version ${result.data.version} created successfully`);
        setShowVersionModal(false);
        setVersionNotes('');
        loadProposalData();
      }
    } catch (error) {
      console.error('Error creating version:', error);
      alert('Failed to create new version');
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index][parent] = {
        ...updated[index][parent],
        [child]: value
      };
    } else {
      updated[index][field] = value;
    }

    // Recalculate prices
    if (['quantity', 'unitPrice'].includes(field)) {
      const qty = field === 'quantity' ? parseFloat(value) : updated[index].quantity;
      const price = field === 'unitPrice' ? parseFloat(value) : updated[index].unitPrice;
      const subtotal = qty * price;
      const tax = subtotal * 0.04712;
      updated[index].finalPrice = subtotal + tax;
    }

    setProducts(updated);
  };

  const calculateTotals = () => {
    const subtotal = products.reduce((sum, p) => sum + (p.finalPrice || 0), 0);
    const salesTax = subtotal * 0.04712;
    const total = subtotal + salesTax;
    const deposit = total * 0.5;

    return { subtotal, salesTax, total, deposit };
  };

  const handlePrint = () => {
    setShowPrintInstructions(true);
  };

  // ✅ UPDATE: Ensure document title is set before printing
  const doPrint = () => {
    setShowPrintInstructions(false);
    
    // Double-check document title is set
    if (proposalData && clientInfo.name) {
      const clientName = clientInfo.name?.replace(/\s+/g, '_') || 'Client';
      const unitNumber = clientInfo.unitNumber?.replace(/\s+/g, '_') || '';
      const versionNum = proposalData.version || 1;
      const date = new Date().toISOString().split('T')[0];
      
      document.title = `Proposal_${clientName}${unitNumber ? '_' + unitNumber : ''}_v${versionNum}_${date}`;
    }
    
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670]"></div>
      </div>
    );
  }

  const totals = calculateTotals();
  const isReadOnly = mode === 'view';

  return (
    <>
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden;
          }
          
          .print-container, .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-after: always;
            page-break-inside: avoid;
          }
          
          .page {
            page-break-inside: avoid;
            padding: 40px;
            min-height: 10.5in;
            max-height: 10.5in;
            position: relative;
            margin: 0;
            box-shadow: none;
          }
          
          input, textarea {
            border: none !important;
            background: transparent !important;
            outline: none !important;
          }
          
          .footer-text {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            margin: 0;
            padding: 0;
          }

          .page-content {
            padding-bottom: 100px !important;
          }

          p, li {
            orphans: 3;
            widows: 3;
          }
        }

        @page {
          size: letter;
          margin: 0.5in;
        }

        .page {
          background: white;
          width: 8.5in;
          min-height: 11in;
          padding: 40px;
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .page-content {
          flex: 1;
          padding-bottom: 100px;
        }

        .footer-text {
          position: absolute;
          bottom: 40px;
          left: 40px;
          right: 40px;
          text-align: center;
          font-size: 11px;
          color: rgb(0, 86, 112);
          background: white;
          margin: 0;
          padding: 0;
        }

        .proposal-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .proposal-header h1 {
          color: rgb(0, 86, 112);
          font-size: 28px;
          font-weight: normal;
          margin: 0;
        }

        .proposal-header p {
          color: rgb(0, 86, 112);
          font-size: 14px;
          margin: 5px 0;
        }

        .section-header {
          background: #f0f0f0;
          padding: 8px;
          text-align: center;
          border: 1px solid #000;
          border-bottom: none;
          font-weight: 600;
        }

        .section-content {
          border: 1px solid #000;
          padding: 20px;
          margin-bottom: 20px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: 120px 1fr 200px;
          gap: 20px;
        }

        .product-image img {
          width: 120px;
          height: 120px;
          object-fit: contain;
        }

        input[type="text"],
        input[type="number"],
        textarea {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
        }

        input:read-only,
        textarea:read-only {
          background: #f9f9f9;
          border-color: #eee;
        }
      `}</style>

      {/* Toolbar - No Print */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <span className="text-sm font-medium text-gray-700">
            Proposal #{proposalData?.orderId} - Version {proposalData?.version || 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            <Clock className="w-4 h-4" />
            Version History
          </button>

          {!isReadOnly && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={() => {
                  setVersionNotes('');
                  setShowVersionModal('new');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Save as New Version
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Proposal Content - Printable */}
      <div className="print-container bg-gray-100 min-h-screen py-8">
        {/* Page 1: Header + First 2 Products */}
        <div className="page">
          <div className="page-content">
            <div className="proposal-header">
              <h1>HENDERSON</h1>
              <p>DESIGN GROUP</p>
            </div>

            <div className="text-red-900 font-bold mb-4">Proposal</div>

            {/* Client Info - Editable */}
            <div className="mb-6 space-y-1">
              <input
                type="text"
                value={clientInfo.name || ''}
                onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                placeholder="Client Name"
                readOnly={isReadOnly}
                className="font-medium"
              />
              <input
                type="text"
                value={clientInfo.unitNumber || ''}
                onChange={(e) => setClientInfo({ ...clientInfo, unitNumber: e.target.value })}
                placeholder="Unit Number"
                readOnly={isReadOnly}
              />
              <input
                type="text"
                value={clientInfo.address || 'Kailua Kona, Hawaii 96740'}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                readOnly={isReadOnly}
              />
              <input
                type="text"
                value={clientInfo.email || proposalData?.user?.email || ''}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                placeholder="Email"
                readOnly={isReadOnly}
              />
            </div>

            {/* Project Info */}
            <div className="flex justify-between mb-6 text-sm">
              <div className="text-blue-900">
                <p>Project: Alia</p>
              </div>
              <div className="text-right">
                <p>Proposal #: {proposalData?.orderId}</p>
                <p>Proposal Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* First 2 Products */}
            {products.slice(0, 2).map((product, index) => (
              <ProductSection
                key={index}
                product={product}
                index={index}
                updateProduct={updateProduct}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>

          <div className="footer-text">
            <p>Henderson Design Group 74-5518 Kaiwi Street Suite B, Kailua Kona, HI, 96740-3145</p>
            <p>Phone: (808) 315-8782</p>
          </div>
        </div>

        {/* Remaining Products - 3 per page */}
        {products.slice(2).reduce((pages, product, index) => {
          const pageIndex = Math.floor(index / 3);
          if (!pages[pageIndex]) pages[pageIndex] = [];
          pages[pageIndex].push({ ...product, originalIndex: index + 2 });
          return pages;
        }, []).map((pageProducts, pageIdx) => (
          <div key={`page-${pageIdx}`} className="page page-break">
            <div className="page-content">
              {pageProducts.map((product) => (
                <ProductSection
                  key={product.originalIndex}
                  product={product}
                  index={product.originalIndex}
                  updateProduct={updateProduct}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
            
            <div className="footer-text">
              <p>Henderson Design Group 74-5518 Kaiwi Street Suite B, Kailua Kona, HI, 96740-3145</p>
              <p>Phone: (808) 315-8782</p>
            </div>
          </div>
        ))}

        {/* Warranty Page */}
        <div className="page page-break">
          <div className="page-content">
            <div className="text-right mb-6 text-sm space-y-1">
              <p>Sub Total: ${totals.subtotal.toFixed(2)}</p>
              <p>Sales Tax: ${totals.salesTax.toFixed(2)}</p>
              <p>Total: ${totals.total.toFixed(2)}</p>
              <p className="font-bold">Required Deposit: ${totals.deposit.toFixed(2)}</p>
            </div>

            <div className="text-red-900 font-bold mb-4">
              Proposal Terms: Henderson Design Group Warranty Terms and Conditions
            </div>

            <div className="text-xs space-y-3 leading-relaxed">
              <p><strong>Coverage Period:</strong> Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.</p>

              <p><strong>Scope of Warranty:</strong></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Workmanship, Materials, and Functionality: The warranty covers defects in workmanship, materials, and functionality under normal wear and tear conditions.</li>
                <li>Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will, at its discretion, either repair or replace the defective item.</li>
              </ul>

              <p><strong>Returns and Exchanges:</strong></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>No Returns: Items are not eligible for returns.</li>
                <li>No Exchanges: Exchanges are not permitted except in cases of defects.</li>
                <li>Custom Items: Custom items, including upholstery, are not eligible for returns or exchanges.</li>
              </ul>

              <p><strong>Exclusions:</strong></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Negligence, Misuse, or Accidents: The warranty does not cover defects resulting from negligence, misuse, or accidents after installation.</li>
                <li>Maintenance and Commercial Use: The warranty is void for any condition resulting from incorrect or inadequate maintenance.</li>
                <li>Non-Residential Use: The warranty is void for any condition resulting from other than ordinary residential wear.</li>
                <li>Natural Material Variations: The warranty does not cover the matching of color, grain, or texture of wood, leather, or fabrics.</li>
                <li>Environmental Responses: Wood may expand and contract in response to temperature and humidity variations.</li>
                <li>Fabric and Leather Wear: The warranty does not cover colorfastness, dye lot variations, wrinkling, or wear of fabrics or leather.</li>
                <li>Sun Exposure: Extensive exposure to the sun is not covered.</li>
                <li>Fabric Protectants: Applying a fabric protectant could void the Henderson warranty.</li>
              </ul>
            </div>
          </div>

          <div className="footer-text">
            <p>Henderson Design Group 74-5518 Kaiwi Street Suite B, Kailua Kona, HI, 96740-3145</p>
            <p>Phone: (808) 315-8782</p>
          </div>
        </div>

        {/* Signature Page */}
        <div className="page">
          <div className="page-content">
            <div className="proposal-header">
              <h1>HENDERSON</h1>
              <p>DESIGN GROUP</p>
            </div>

            <div className="text-red-900 font-bold mb-4">Proposal</div>

            <div className="mb-6 text-sm space-y-1">
              <p>{clientInfo.name}</p>
              <p>{clientInfo.unitNumber}</p>
              <p>{clientInfo.address || 'Kailua Kona, Hawaii 96740'}</p>
              <p>{clientInfo.email}</p>
            </div>

            <div className="flex justify-between mb-6 text-sm">
              <p>Project: Alia</p>
              <div className="text-right">
                <p>Proposal #: {proposalData?.orderId}</p>
                <p>Proposal Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="text-xs space-y-3 leading-relaxed">
              <ul className="list-disc ml-5 space-y-1">
                <li>Original Buyer: The warranty applies to the original buyer only.</li>
                <li>Original Installation Location: The warranty is valid only for furnishings in the space where they were originally installed.</li>
                <li>Repair, Touch-Up, or Replacement Only: No refunds.</li>
                <li>Non-Returnable Custom Upholstery: Custom upholstery is non-returnable.</li>
                <li>Non-Transferable Warranty: The warranty is non-transferable.</li>
              </ul>

              <p className="mt-8 font-bold">100% Deposit</p>

              <p className="mt-8">Accept and Approve:</p>
              <div className="border-t border-black mt-16 pt-2">
                Signature
              </div>
            </div>
          </div>

          <div className="footer-text">
            <p>Henderson Design Group 74-5518 Kaiwi Street Suite B, Kailua Kona, HI, 96740-3145</p>
            <p>Phone: (808) 315-8782</p>
          </div>
        </div>
      </div>

      {/* Version Modal - No Print */}
      {showVersionModal && (
        <VersionModal
          orderId={orderId}
          isOpen={showVersionModal}
          onClose={() => {
            setShowVersionModal(false);
            setVersionNotes('');
          }}
          onSelectVersion={(v) => {
            window.location.href = `/admin/proposal/${orderId}/${v}`;
          }}
          versionNotes={versionNotes}
          setVersionNotes={setVersionNotes}
          onSaveNewVersion={handleSaveAsNewVersion}
          saving={saving}
        />
      )}

      {/* ✅ ADD PRINT INSTRUCTIONS MODAL HERE - BEFORE CLOSING </> */}
      {showPrintInstructions && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Print Setup Instructions</h3>
              <button 
                onClick={() => setShowPrintInstructions(false)} 
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">
                For the best print quality, please configure your print settings:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Disable Headers and Footers</p>
                    <p className="text-sm text-gray-600">
                      Uncheck "Headers and footers" option in print dialog
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Set Margins</p>
                    <p className="text-sm text-gray-600">
                      Select "Custom" or "None" for margins
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Enable Background Graphics</p>
                    <p className="text-sm text-gray-600">
                      Check "Background graphics" to print all colors
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>💡 Tip:</strong> If you see gray boxes at page bottom, it means "Headers and footers" 
                  is still enabled. Make sure to disable it in the print dialog.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowPrintInstructions(false)}
                  className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={doPrint}
                  className="px-6 py-2.5 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Continue to Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ProductSection Component (sama seperti sebelumnya)
const ProductSection = ({ product, index, updateProduct, isReadOnly }) => {
  const getProductImage = (product) => {
    const imageSources = [
      product.selectedOptions?.image,
      product.selectedOptions?.images?.[0],
      product.image,
      product.imageUrl,
      product.thumbnail,
      product.selectedOptions?.uploadedImages?.[0]?.url
    ];

    for (const imgUrl of imageSources) {
      if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim()) {
        return imgUrl;
      }
    }

    return null;
  };

  const productImage = getProductImage(product);

  return (
    <div className="mb-6">
      <div className="section-header">
        <input
          type="text"
          value={product.name || ''}
          onChange={(e) => updateProduct(index, 'name', e.target.value)}
          placeholder="Product Name"
          readOnly={isReadOnly}
          className="text-center font-semibold bg-transparent border-none w-full"
        />
      </div>
      
      <div className="section-content">
        <div className="product-grid">
          <div className="product-image">
            {productImage ? (
              <img 
                src={productImage} 
                alt={product.name || 'Product'} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs"
              style={{ display: productImage ? 'none' : 'flex' }}
            >
              No Image
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <input
              type="text"
              value={product.product_id || ''}
              onChange={(e) => updateProduct(index, 'product_id', e.target.value)}
              placeholder="Product ID"
              readOnly={isReadOnly}
            />
            <p className="text-gray-600">Fabric Details</p>
            <input
              type="text"
              value={product.selectedOptions?.finish || ''}
              onChange={(e) => updateProduct(index, 'selectedOptions.finish', e.target.value)}
              placeholder="Finish"
              readOnly={isReadOnly}
            />
            <input
              type="text"
              value={product.selectedOptions?.fabric || ''}
              onChange={(e) => updateProduct(index, 'selectedOptions.fabric', e.target.value)}
              placeholder="Fabric"
              readOnly={isReadOnly}
            />
            {product.selectedOptions?.size && (
              <input
                type="text"
                value={product.selectedOptions.size}
                onChange={(e) => updateProduct(index, 'selectedOptions.size', e.target.value)}
                placeholder="Size"
                readOnly={isReadOnly}
              />
            )}
            {product.selectedOptions?.insetPanel && (
              <input
                type="text"
                value={product.selectedOptions.insetPanel}
                onChange={(e) => updateProduct(index, 'selectedOptions.insetPanel', e.target.value)}
                placeholder="Inset Panel"
                readOnly={isReadOnly}
              />
            )}
          </div>

          <div className="text-right text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span>Quantity:</span>
              <input
                type="number"
                value={product.quantity || 1}
                onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                readOnly={isReadOnly}
                className="w-16 text-right"
                min="1"
              />
            </div>
            <div className="flex justify-between items-center">
              <span>Unit Price:</span>
              <input
                type="number"
                value={product.unitPrice || 0}
                onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)}
                readOnly={isReadOnly}
                className="w-24 text-right"
                step="0.01"
              />
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${((product.quantity || 1) * (product.unitPrice || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax:</span>
              <span>${(((product.quantity || 1) * (product.unitPrice || 0)) * 0.04712).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${(product.finalPrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// VersionModal Component (sama seperti sebelumnya - tidak perlu diubah)
const VersionModal = ({ 
  orderId, 
  isOpen, 
  onClose, 
  onSelectVersion,
  versionNotes,
  setVersionNotes,
  onSaveNewVersion,
  saving
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen === true) {
      loadVersions();
    }
  }, [isOpen]);

  const loadVersions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/proposals/${orderId}/versions/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = await response.json();
      if (result.success) {
        setVersions(result.data);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isOpen === 'new') {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
          <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 rounded-t-xl flex justify-between items-center">
            <h3 className="text-xl font-bold">Save as New Version</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670]"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSaveNewVersion}
                disabled={saving || !versionNotes.trim()}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save as New Version'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Version History</h3>
            <p className="text-sm text-white/80 mt-1">
              View and manage all proposal versions
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto max-h-[calc(80vh-88px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005670] mx-auto"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No versions found
            </div>
          ) : (
            <div className="divide-y">
              {versions.map((version) => (
                <div
                  key={version._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                          Version {version.version}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          version.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          version.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          version.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{version.notes}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Created: {new Date(version.createdAt).toLocaleDateString()} by{' '}
                          {version.createdBy?.name || 'Unknown'}
                        </span>
                        {version.updatedAt && version.updatedAt !== version.createdAt && (
                          <span>
                            Updated: {new Date(version.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectVersion(version.version)}
                      className="ml-4 px-4 py-2 bg-[#005670] hover:bg-[#004558] text-white rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      View/Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;