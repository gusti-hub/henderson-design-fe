// BulkProposalPrint.jsx — Combined multi-unit proposal print view
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer, Loader2, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const LOGO_FILTER = 'brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)';
const FINISH_LABELS = { LT:'Light Oak', MD:'Medium Teak', DK:'Dark Teak', WH:'White', BK:'Black', GY:'Grey', NL:'Natural', WN:'Walnut' };
const resolveFinish = c => { if (!c) return ''; const u = c.trim().toUpperCase(); return FINISH_LABELS[u] || c; };
const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseBold = (text) => {
  if (!text || !text.includes('**')) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
};

const PageFooter = () => (
  <div style={{
    position: 'absolute', bottom: '0.28in', left: '0.5in', right: '0.5in',
    borderTop: '1px solid #d1d5db', paddingTop: '5px',
    textAlign: 'center', fontSize: '10px', color: 'rgb(0,86,112)',
    lineHeight: '1.5', background: 'white',
  }}>
    <p style={{ margin: 0 }}>Henderson Design Group 4343 Royal Place, Honolulu, HI, 96816</p>
    <p style={{ margin: 0 }}>Phone: (808) 315-8782</p>
  </div>
);

const ProposalUnit = ({ proposalData, clientInfo, proposalNumber }) => {
  const today = new Date().toLocaleDateString();
  const products = proposalData.selectedProducts || [];

  // Group by room
  const roomGroups = {};
  products.forEach(p => {
    const room = p.selectedOptions?.room?.trim() || '—';
    if (!roomGroups[room]) roomGroups[room] = [];
    roomGroups[room].push(p);
  });

  let subtotal = 0, taxTotal = 0;
  products.forEach(p => {
    const o = p.selectedOptions || {};
    const qty = p.quantity || 1;
    const msrp = parseFloat(o.msrp) || 0;
    const markup = parseFloat(o.markupPercent) || 0;
    const sell = msrp * (1 + markup / 100) * qty;
    const taxRate = parseFloat(o.salesTaxRate) || 0;
    subtotal += sell;
    taxTotal += taxRate > 0 ? sell * (taxRate / 100) : 0;
  });
  const total = subtotal + taxTotal;

  return (
    <div style={{ pageBreakAfter: 'always', position: 'relative', background: 'white', width: '8.5in', minHeight: '11in', boxSizing: 'border-box', padding: '0.5in 0.5in 0.85in 0.5in', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <img src="/images/HDG-Logo.png" alt="Henderson Design Group" style={{ height: '44px', width: 'auto', display: 'inline-block', filter: LOGO_FILTER }} />
      </div>
      <div style={{ color: '#000000', fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>Proposal</div>

      {/* Client + Proposal Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>{clientInfo.name || '—'}</p>
          {clientInfo.street && <p style={{ margin: 0 }}>{clientInfo.street}{clientInfo.unitNumber?.trim() ? ', #' + clientInfo.unitNumber : ''}</p>}
          {clientInfo.cityLine && <p style={{ margin: 0 }}>{clientInfo.cityLine}</p>}
          {clientInfo.email && <p style={{ margin: 0 }}>{clientInfo.email}</p>}
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.7' }}>
          <p style={{ margin: 0 }}><strong>Proposal #:</strong> {proposalNumber || '—'}</p>
          <p style={{ margin: 0 }}>Proposal Date: {today}</p>
        </div>
      </div>
      <div style={{ marginBottom: '12px', fontSize: '12px' }}>
        <span style={{ color: '#000000', fontWeight: '500' }}>Project: Ālia</span>
      </div>

      {/* Product tables */}
      {Object.entries(roomGroups).map(([room, rps]) => (
        <div key={room} style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
            <colgroup>
              <col style={{ width: '88px' }} /><col /><col style={{ width: '148px' }} />
            </colgroup>
            <thead>
              <tr>
                <th colSpan={3} style={{ background: '#f0f0f0', padding: '6px 8px', textAlign: 'center', fontWeight: '600', fontSize: '13px', borderBottom: '1px solid #ccc' }}>
                  {room}
                </th>
              </tr>
            </thead>
            <tbody>
              {rps.map((p, i) => {
                const o = p.selectedOptions || {};
                const qty = p.quantity || 1;
                const msrp = parseFloat(o.msrp) || 0;
                const markup = parseFloat(o.markupPercent) || 0;
                const sell = msrp * (1 + markup / 100);
                const sub = sell * qty;
                const taxRate = parseFloat(o.salesTaxRate) || 0;
                const tax = taxRate > 0 ? sub * (taxRate / 100) : 0;
                const lineTotal = sub + tax;
                const bt = i === 0 ? 'none' : '1px solid #e5e7eb';
                const tdBase = { borderTop: bt, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' };
                const imgSrc = [o?.uploadedImages?.[0]?.url, o?.image, o?.images?.[0], p.image, p.imageUrl].find(s => s && typeof s === 'string' && s.trim()) || null;
                return (
                  <tr key={i}>
                    <td style={{ ...tdBase, width: '88px', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {imgSrc
                        ? <img src={imgSrc} alt={p.name} style={{ width: '76px', height: '76px', objectFit: 'contain', display: 'block', margin: '0 auto' }} onError={e => { e.target.style.display = 'none'; }} />
                        : <div style={{ width: '76px', height: '76px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', margin: '0 auto' }}>No Image</div>
                      }
                    </td>
                    <td style={{ ...tdBase, padding: '7px 9px', fontSize: '12px', lineHeight: '1.55', textAlign: 'left', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', marginBottom: '3px', fontSize: '13px' }}>{p.name || 'Untitled'}</div>
                      {o.specifications && <div style={{ whiteSpace: 'pre-wrap', color: '#374151', marginBottom: '1px' }}>{parseBold(o.specifications)}</div>}
                      {o.finish && <div><strong>Color / Finish:</strong> {resolveFinish(o.finish)}</div>}
                      {o.leadTime && <div><strong>Lead Time:</strong> {o.leadTime}</div>}
                      {o.fabric && <div><strong>Fabric:</strong> {o.fabric}</div>}
                      {o.size && <div><strong>Dimensions:</strong> {o.size}</div>}
                    </td>
                    <td style={{ ...tdBase, width: '145px', padding: '7px 5px', fontSize: '12px', textAlign: 'right', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Qty:</span><span>{qty} {o.units || 'Each'}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Unit:</span><span>${fmt(sell)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Subtotal:</span><span>${fmt(sub)}</span></div>
                      {taxRate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Tax ({taxRate}%):</span><span>${fmt(tax)}</span></div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #d1d5db', paddingTop: '2px', marginTop: '2px' }}>
                        <span>Total:</span><span>${fmt(lineTotal)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Totals */}
      <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '4px', fontSize: '12px', lineHeight: '1.8' }}>
        <p style={{ margin: 0 }}>Sub Total: ${fmt(subtotal)}</p>
        <p style={{ margin: 0 }}>Sales Tax: ${fmt(taxTotal)}</p>
        <p style={{ margin: 0, fontWeight: '700' }}>Total: ${fmt(total)}</p>
      </div>

      <PageFooter />
    </div>
  );
};

const BulkProposalPrint = () => {
  const [searchParams] = useSearchParams();
  const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const results = await Promise.all(
          ids.map(id =>
            fetch(`${backendServer}/api/proposals/${id}/latest`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json())
          )
        );
        const loaded = results
          .filter(r => r.success)
          .map(r => {
            const d = r.data;
            const u = d.user || {};
            const addr = u.address || {};
            const street = addr.street?.trim() || '';
            const cityParts = [addr.city, addr.state, addr.zipcode].filter(p => p && p.trim());
            return {
              proposalData: d,
              proposalNumber: d.proposalNumber || '—',
              clientInfo: {
                ...(d.clientInfo || {}),
                email: d.clientInfo?.email || u.email || '',
                unitNumber: d.clientInfo?.unitNumber || u.unitNumber || '',
                street,
                cityLine: cityParts.join(', '),
              },
            };
          });
        setProposals(loaded);
      } catch (e) {
        setError('Failed to load proposals. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    if (ids.length > 0) load(); else setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: '#005670' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <AlertCircle style={{ color: '#dc2626' }} />
        <p style={{ color: '#dc2626', fontFamily: 'Arial, sans-serif' }}>{error}</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#6b7280' }}>
        No proposals found.
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @page { size: 8.5in 11in; margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        body { margin: 0; background: #b8b8b8; }
      `}</style>

      {/* Print toolbar */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#005670', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif' }}>
        <div>
          <strong style={{ fontSize: 15 }}>Bulk PDF Print</strong>
          <span style={{ marginLeft: 12, fontSize: 13, opacity: 0.8 }}>{proposals.length} unit{proposals.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Set margins to None · Scale 100% · Background Graphics On</span>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'white', color: '#005670', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            <Printer style={{ width: 16, height: 16 }} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Proposals */}
      <div style={{ padding: '20px 0' }}>
        {proposals.map(({ proposalData, clientInfo, proposalNumber }, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <ProposalUnit
              proposalData={proposalData}
              clientInfo={clientInfo}
              proposalNumber={proposalNumber}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default BulkProposalPrint;
