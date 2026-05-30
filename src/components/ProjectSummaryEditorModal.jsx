import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Check, Printer, Save, TrendingUp } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ─── Preview sub-components ───────────────────────────────────────────────────
const LineRow = ({ label, value, bold, teal, negative }) => (
  <div className={`flex justify-between items-start py-1.5 ${bold ? 'font-semibold' : ''}`}>
    <p className={`flex-1 pr-4 text-sm leading-snug ${bold ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
    <span className={`text-sm whitespace-nowrap ${teal ? 'text-[#005670] font-bold' : bold ? 'text-gray-900' : 'text-gray-700'}`}>
      {negative ? `(${fmt(value)})` : fmt(value)}
    </span>
  </div>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>{children}</div>
);

const SectionTitle = ({ num, text }) => (
  <div className="flex items-start gap-2 mb-3">
    <span className="text-[10px] font-bold text-[#005670] bg-[#005670]/10 px-2 py-0.5 rounded-full flex-shrink-0">{num}</span>
    <p className="text-[10px] tracking-widest font-bold text-gray-500 uppercase leading-none">{text}</p>
  </div>
);

const Div = () => <div className="border-t border-gray-200 my-1.5" />;

// ─── Dummy fallback for Sections 1 & 2 (used when no computed data yet) ─────────
const DUMMY_S1 = {
  originalCollectionInvestment: 180000,
  depositReceived:              54000,
  remainingOriginalBalance:     126000,
};
const DUMMY_S2 = {
  approvedTotalToDate: 100000,
  paymentsReceived:    100000,
  outstandingBalance:  0,
};

// ─── Live Preview ─────────────────────────────────────────────────────────────
const SummaryPreview = ({ preview }) => {
  const { client, statementDate, section1: s1, section2: s2, section3: s3, section4: s4, outlook } = preview;

  const s3Rows = [
    { label: 'Proposal 2 – Accents Estimated Costs',        value: s3.accentsAllowance },
    { label: 'Closet Systems Estimated Costs',              value: s3.closetSystemsAllowance },
    { label: 'Window Coverings Estimated Costs',            value: s3.windowCoveringsAllowance },
    { label: 'FDI Estimated Costs\n(Freight, Delivery & Installation)', value: s3.fdiAllowance },
    { label: 'AV Cost',                                     value: s3.avCost },
    { label: 'Additional Services, Specialty Coordination', value: s3.additionalServices },
  ];

  return (
    <div className="text-xs font-sans space-y-3" id="ps-print-content">
      {/* Header */}
      <div className="bg-[#005670] rounded-xl px-5 py-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-light text-white tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>Ālia</span>
          <div className="border-l border-white/20 pl-4">
            <p className="text-[9px] tracking-[0.3em] text-white/60 font-semibold uppercase">ĀLIA RESIDENCE</p>
            <h1 className="text-lg font-light text-white tracking-wide">Project Investment Summary</h1>
            <p className="text-[9px] tracking-widest text-white/50 uppercase">TRANSPARENT. CURATED. EXCEPTIONAL.</p>
          </div>
        </div>
      </div>

      {/* Client info bar */}
      <div className="bg-[#004558] rounded-lg px-5 py-3">
        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
          {[
            { label: 'Client Name',    value: client.name },
            { label: 'Unit Number',    value: `Unit ${client.unitNumber}` },
            { label: 'Collection',     value: client.collection || '—' },
            { label: 'Statement Date', value: fmtDate(statementDate) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] text-white/50 tracking-wide uppercase font-semibold">{label}</p>
              <p className="text-xs font-semibold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sections 1 + 2 + 3 */}
      <div className="grid grid-cols-3 gap-3">
        {/* Section 1 */}
        <SectionCard>
          <SectionTitle num="1" text="ORIGINAL COLLECTION CHOICE" />
          <LineRow label="Original Collection Estimate"        value={s1.originalCollectionInvestment} />
          <Div />
          <LineRow label="Deposit Received"                    value={s1.depositReceived} negative />
          <Div />
          <LineRow label="Remaining Original Estimate Balance" value={s1.remainingOriginalBalance} bold />
        </SectionCard>

        {/* Section 2 */}
        <SectionCard>
          <SectionTitle num="2" text="CURRENT PROJECT STATUS" />
          <LineRow label="Proposal Total To Date"    value={s2.approvedTotalToDate} />
          <Div />
          <LineRow label="Less Payments Received"   value={s2.paymentsReceived} negative />
          <Div />
          <LineRow label="Current Outstanding Balance" value={s2.outstandingBalance} bold teal={s2.outstandingBalance > 0} />
        </SectionCard>

        {/* Section 3 */}
        <SectionCard>
          <SectionTitle num="3" text="ESTIMATED REMAINING PROJECT COSTS" />
          <p className="text-[9px] text-gray-400 italic -mt-2 mb-2">(Subject to Final Selections)</p>
          {s3Rows.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between items-start py-1">
                <div className="flex-1 pr-2">
                  {label.split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-gray-700 leading-snug">{line}</p>
                  ))}
                </div>
                <span className="text-xs text-gray-700 whitespace-nowrap">{fmt(value)}</span>
              </div>
              <Div />
            </div>
          ))}
          <div className="flex justify-between items-center pt-0.5">
            <p className="text-sm font-bold text-gray-900">Estimated Remaining Costs</p>
            <span className="text-sm font-bold text-[#005670]">{fmt(s3.totalEstimatedRemaining)}</span>
          </div>
        </SectionCard>
      </div>

      {/* Section 4 */}
      <SectionCard>
        <SectionTitle num="4" text="ESTIMATED FINAL PROJECT" />
        <div className="grid grid-cols-2 gap-6">
          <div>
            <LineRow label="Proposal Costs To Date"   value={s4.approvedCostsToDate} />
            <Div />
            <LineRow label="Estimated Remaining Costs" value={s4.estimatedRemainingCosts} />
            <Div />
            <div className="flex justify-between items-end pt-1">
              <p className="text-sm font-bold text-gray-900">Estimated Final Project</p>
              <span className="text-lg font-bold text-[#005670]">{fmt(s4.estimatedFinalProjectInvestment)}</span>
            </div>
          </div>
          <div className="border-l border-[#005670]/10 pl-6 flex flex-col justify-center">
            <p className="text-xs text-gray-500">Original Choice Of Investment</p>
            <p className="text-xl font-bold text-[#005670] mt-1">{fmt(outlook.originalPackageInvestment)}</p>
          </div>
        </div>
      </SectionCard>

      {/* Outlook */}
      <div className="bg-white border border-[#005670]/15 rounded-xl p-4">
        <div className="grid grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#005670]" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-[#005670] uppercase">CURRENT INVESTMENT OUTLOOK</p>
              <p className="text-[9px] text-gray-500 italic">Summary of Your Project</p>
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              { label: 'Original Choice Of Investment', value: outlook.originalPackageInvestment },
              { label: 'Proposal Costs To Date',        value: outlook.approvedCostsToDate },
              { label: 'Estimated Remaining Costs',     value: outlook.estimatedRemainingCosts },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-1">
                <p className="text-xs text-gray-600">{label}</p>
                <span className="text-xs font-medium text-gray-800">{fmt(value)}</span>
              </div>
            ))}
            <div className="col-span-2 flex justify-between items-center pt-1">
              <p className="text-sm font-bold text-gray-900">Estimated Final Project Investment</p>
              <span className="text-base font-bold text-[#005670]">{fmt(outlook.estimatedFinalProjectInvestment)}</span>
            </div>
          </div>
          <div className="bg-[#005670]/5 border border-[#005670]/15 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold tracking-widest text-[#005670]/70 uppercase">DEPOSIT HELD ON ACCOUNT</p>
            <p className="text-xl font-bold text-[#005670] mt-0.5">({fmt(outlook.depositHeldOnAccount)})</p>
            <p className="text-[9px] text-gray-400 mt-0.5 italic">To be applied toward final reconciliation.</p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-[10px] font-bold tracking-widest text-[#005670] uppercase mb-3">IMPORTANT NOTES</p>
        <div className="space-y-2">
          {[
            'This summary reflects approved selections and current project estimates as of the statement date above.',
            'Estimated categories are planning allowances only and may adjust pending final selections, field conditions, vendor pricing, freight conditions, and project coordination requirements.',
            'FDI includes freight, delivery, warehousing, installation coordination, installation labor, staging, and project execution services.',
            'Final project pricing will be based on approved proposals and actual selected scope.',
          ].map((note, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[#005670]/40 text-sm mt-0.5 flex-shrink-0">•</span>
              <p className="text-xs text-gray-600 leading-relaxed">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-[#005670]/10">
        <div>
          <p className="text-xs font-bold text-[#005670] uppercase tracking-widest">HENDERSON DESIGN GROUP</p>
          <p className="text-[9px] text-gray-400">DESIGN | FURNISHINGS | LIFESTYLE</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-gray-400">HENDERSON.HOUSE • 808 591 1117</p>
        </div>
        <div className="text-right">
          <p className="text-base italic text-[#005670]/40 font-serif">Thank you.</p>
          <p className="text-[9px] font-bold tracking-widest text-[#005670]/60 uppercase">WE APPRECIATE YOUR TRUST.</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const ProjectSummaryEditorModal = ({ clientId, onClose, onSaved }) => {
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [clientData, setClientData] = useState(null);
  const [computed, setComputed]     = useState(null);
  const [form, setForm] = useState({
    statementDate:            new Date().toISOString().split('T')[0],
    proposalLabel:            '',
    accentsAllowance:         0,
    closetSystemsAllowance:   0,
    windowCoveringsAllowance: 0,
    fdiAllowance:             0,
    avCost:                   0,
    additionalServices:       0,
    notes:                    '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');

        const clientRes = await fetch(`${backendServer}/api/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!clientRes.ok) throw new Error('Client not found');
        const clientJson = await clientRes.json();
        const c = clientJson.data || clientJson;
        setClientData(c);

        const ps  = c.projectSummary || {};
        const est = ps.estimatedRemainingCosts || {};
        setForm({
          statementDate:            ps.statementDate ? new Date(ps.statementDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          proposalLabel:            ps.proposalLabel || '',
          accentsAllowance:         est.accentsAllowance         || 0,
          closetSystemsAllowance:   est.closetSystemsAllowance   || 0,
          windowCoveringsAllowance: est.windowCoveringsAllowance || 0,
          fdiAllowance:             est.fdiAllowance             || 0,
          avCost:                   est.avCost                   || 0,
          additionalServices:       est.additionalServices       || 0,
          notes:                    ps.notes                     || '',
        });

        if (c.email && c.unitNumber) {
          const summaryRes = await fetch(
            `${backendServer}/api/clients-portal/project-summary?email=${encodeURIComponent(c.email)}&unitNumber=${encodeURIComponent(c.unitNumber)}`
          );
          if (summaryRes.ok) {
            const summaryJson = await summaryRes.json();
            setComputed(summaryJson.summary || null);
          }
        }
      } catch (err) {
        console.error('ProjectSummaryEditorModal load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const setField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  // Compute live preview totals
  const s3Total =
    Number(form.accentsAllowance) +
    Number(form.closetSystemsAllowance) +
    Number(form.windowCoveringsAllowance) +
    Number(form.fdiAllowance) +
    Number(form.avCost) +
    Number(form.additionalServices);

  // Use computed data when available, otherwise fall back to dummy values
  const hasComputedS1 = (computed?.section1?.originalCollectionInvestment || 0) > 0;
  const hasComputedS2 = (computed?.section2?.approvedTotalToDate || 0) > 0;
  const cs1 = hasComputedS1 ? computed.section1 : DUMMY_S1;
  const cs2 = hasComputedS2 ? computed.section2 : DUMMY_S2;

  const preview = {
    statementDate: form.statementDate,
    client: {
      name:           clientData?.name                           || '—',
      unitNumber:     clientData?.unitNumber                     || '—',
      collection:     computed?.client?.collection || clientData?.collection || '—',
      projectAdvisor: computed?.client?.projectAdvisor          || 'Henderson Design Group',
    },
    section1: {
      originalCollectionInvestment: cs1.originalCollectionInvestment || 0,
      depositReceived:              cs1.depositReceived              || 0,
      remainingOriginalBalance:     cs1.remainingOriginalBalance     || 0,
    },
    section2: {
      proposalLabel:       form.proposalLabel,
      approvedTotalToDate: cs2.approvedTotalToDate || 0,
      paymentsReceived:    cs2.paymentsReceived    || 0,
      outstandingBalance:  cs2.outstandingBalance  || 0,
    },
    section3: {
      accentsAllowance:         Number(form.accentsAllowance),
      closetSystemsAllowance:   Number(form.closetSystemsAllowance),
      windowCoveringsAllowance: Number(form.windowCoveringsAllowance),
      fdiAllowance:             Number(form.fdiAllowance),
      avCost:                   Number(form.avCost),
      additionalServices:       Number(form.additionalServices),
      totalEstimatedRemaining:  s3Total,
    },
    section4: {
      approvedCostsToDate:             cs2.approvedTotalToDate || 0,
      estimatedRemainingCosts:         s3Total,
      estimatedFinalProjectInvestment: (cs2.approvedTotalToDate || 0) + s3Total,
    },
    outlook: {
      originalPackageInvestment:       cs1.originalCollectionInvestment || 0,
      approvedCostsToDate:             cs2.approvedTotalToDate          || 0,
      estimatedRemainingCosts:         s3Total,
      estimatedFinalProjectInvestment: (cs2.approvedTotalToDate || 0) + s3Total,
      depositHeldOnAccount:            cs1.depositReceived              || 0,
    },
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendServer}/api/clients/${clientId}/project-summary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const content = document.getElementById('ps-print-content');
    if (!content) return;
    const win = window.open('', '_blank', 'width=1000,height=800');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Project Summary – ${clientData?.name || ''}</title>
  <meta charset="UTF-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { font-family: sans-serif; padding: 24px; } @media print { body { padding: 0; } }</style>
</head>
<body>
  ${content.innerHTML}
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
    win.document.close();
  };

  const numField = (label, key) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
        <input
          type="number"
          min="0"
          step="1000"
          value={form[key]}
          onChange={e => setField(key, Number(e.target.value))}
          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] outline-none"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-[1400px] mx-auto m-3 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-[#005670] text-white px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Project Summary Editor
            </h2>
            {clientData && (
              <p className="text-sm text-white/70 mt-0.5">{clientData.name} · Unit {clientData.unitNumber}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Download
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#005670] rounded-lg text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#005670]" />
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">

            {/* ── Left: Edit Form ── */}
            <div className="w-80 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50 p-5 space-y-5">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">General</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Statement Date</label>
                    <input
                      type="date"
                      value={form.statementDate}
                      onChange={e => setField('statementDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Proposal Label (Section 2)</label>
                    <input
                      type="text"
                      value={form.proposalLabel}
                      onChange={e => setField('proposalLabel', e.target.value)}
                      placeholder="Proposal 1 – Furnishings + Design Fee…"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Section 1 – Original Collection</p>
                <p className="text-[10px] text-gray-400 italic mb-3">Computed from payment info</p>
                <div className="space-y-2 bg-gray-100 rounded-lg p-3 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">Original Estimate</span><span className="font-medium">{fmt(cs1.originalCollectionInvestment)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Deposit Received</span><span className="font-medium">{fmt(cs1.depositReceived)}</span></div>
                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-1"><span className="text-gray-700">Remaining Balance</span><span>{fmt(cs1.remainingOriginalBalance)}</span></div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Section 2 – Current Status</p>
                <p className="text-[10px] text-gray-400 italic mb-3">Computed from proposals & invoices</p>
                <div className="space-y-2 bg-gray-100 rounded-lg p-3 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">Proposal Total</span><span className="font-medium">{fmt(cs2.approvedTotalToDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Payments Received</span><span className="font-medium">{fmt(cs2.paymentsReceived)}</span></div>
                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-1"><span className="text-gray-700">Outstanding Balance</span><span>{fmt(cs2.outstandingBalance)}</span></div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Section 3 – Estimated Remaining</p>
                <div className="space-y-3">
                  {numField('Proposal 2 – Accents Estimated Costs ($)',      'accentsAllowance')}
                  {numField('Closet Systems Estimated Costs ($)',            'closetSystemsAllowance')}
                  {numField('Window Coverings Estimated Costs ($)',          'windowCoveringsAllowance')}
                  {numField('FDI Estimated Costs ($)',                       'fdiAllowance')}
                  {numField('AV Cost ($)',                                   'avCost')}
                  {numField('Additional Services, Specialty Coordination ($)', 'additionalServices')}
                </div>
                <div className="mt-3 flex justify-between items-center bg-[#005670]/5 border border-[#005670]/15 rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-gray-700">Section 3 Total</span>
                  <span className="text-sm font-bold text-[#005670]">{fmt(s3Total)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  rows={4}
                  placeholder="Any internal notes about this project summary…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#005670] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

            {/* ── Right: Live Preview ── */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Preview</span>
                <span className="text-[10px] text-gray-400">— mirrors what the client sees</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <SummaryPreview preview={preview} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSummaryEditorModal;
