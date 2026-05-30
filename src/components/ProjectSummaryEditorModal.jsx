import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Check, Printer, Save, TrendingUp, Globe } from 'lucide-react';
import { backendServer } from '../utils/info';
import { T } from './ProjectSummaryView';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d, lang = 'en') => {
  if (!d) return '—';
  const locale = lang === 'jp' ? 'ja-JP' : 'en-US';
  return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
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

// ─── Live Preview ─────────────────────────────────────────────────────────────
const SummaryPreview = ({ preview, lang = 'en' }) => {
  const { client, statementDate, section1: s1, section2: s2, section3: s3, section4: s4, outlook } = preview;
  const t = T[lang];

  const s3Rows = [
    { label: t.s3Accents,    value: s3.accentsAllowance },
    { label: t.s3Closet,     value: s3.closetSystemsAllowance },
    { label: t.s3Window,     value: s3.windowCoveringsAllowance },
    { label: t.s3Fdi,        value: s3.fdiAllowance },
    { label: t.s3Av,         value: s3.avCost },
    { label: t.s3Additional, value: s3.additionalServices },
  ];

  return (
    <div className="text-xs font-sans space-y-3" id="ps-print-content">
      {/* Header */}
      <div className="bg-[#005670] rounded-xl px-5 py-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-light text-white tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>Ālia</span>
          <div className="border-l border-white/20 pl-4">
            <p className="text-[9px] tracking-[0.3em] text-white/60 font-semibold uppercase">{t.brand}</p>
            <h1 className="text-lg font-light text-white tracking-wide">{t.title}</h1>
            <p className="text-[9px] tracking-widest text-white/50 uppercase">{t.tagline}</p>
          </div>
        </div>
      </div>

      {/* Client info bar */}
      <div className="bg-[#004558] rounded-lg px-5 py-3">
        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
          {[
            { label: t.clientName,    value: client.name },
            { label: t.unitNumber,    value: `Unit ${client.unitNumber}` },
            { label: t.collection,    value: client.collection || '—' },
            { label: t.statementDate, value: fmtDate(statementDate, lang) },
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
          <SectionTitle num="1" text={t.s1Title} />
          <LineRow label={t.s1Original} value={s1.originalCollectionInvestment} />
          <Div />
          <LineRow label={t.s1Deposit}  value={s1.depositReceived} negative />
          <Div />
          <LineRow label={t.s1Balance}  value={s1.remainingOriginalBalance} bold />
        </SectionCard>

        {/* Section 2 */}
        <SectionCard>
          <SectionTitle num="2" text={t.s2Title} />
          <LineRow label={t.s2Approved} value={s2.approvedTotalToDate} />
          <Div />
          <LineRow label={t.s2Payments} value={s2.paymentsReceived} negative />
          <Div />
          <LineRow label={t.s2Outstanding} value={s2.outstandingBalance} bold teal={s2.outstandingBalance > 0} />
        </SectionCard>

        {/* Section 3 */}
        <SectionCard>
          <SectionTitle num="3" text={t.s3Title} />
          <p className="text-[9px] text-gray-400 italic -mt-2 mb-2">{t.s3Sub}</p>
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
            <p className="text-sm font-bold text-gray-900">{t.s3Total}</p>
            <span className="text-sm font-bold text-[#005670]">{fmt(s3.totalEstimatedRemaining)}</span>
          </div>
        </SectionCard>
      </div>

      {/* Section 4 */}
      <SectionCard>
        <SectionTitle num="4" text={t.s4Title} />
        <div className="grid grid-cols-2 gap-6">
          <div>
            <LineRow label={t.s4Approved}  value={s4.approvedCostsToDate} />
            <Div />
            <LineRow label={t.s4Remaining} value={s4.estimatedRemainingCosts} />
            <Div />
            <div className="flex justify-between items-end pt-1">
              <p className="text-sm font-bold text-gray-900">{t.s4Final}</p>
              <span className="text-lg font-bold text-[#005670]">{fmt(s4.estimatedFinalProjectInvestment)}</span>
            </div>
          </div>
          <div className="border-l border-[#005670]/10 pl-6 flex flex-col justify-center">
            <p className="text-xs text-gray-500">{t.outlookOrig}</p>
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
              <p className="text-[9px] font-bold tracking-widest text-[#005670] uppercase">{t.outlookTitle}</p>
              <p className="text-[9px] text-gray-500 italic">{t.outlookSub}</p>
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              { label: t.outlookOrig,      value: outlook.originalPackageInvestment },
              { label: t.outlookApproved,  value: outlook.approvedCostsToDate },
              { label: t.outlookRemaining, value: outlook.estimatedRemainingCosts },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-1">
                <p className="text-xs text-gray-600">{label}</p>
                <span className="text-xs font-medium text-gray-800">{fmt(value)}</span>
              </div>
            ))}
            <div className="col-span-2 flex justify-between items-center pt-1">
              <p className="text-sm font-bold text-gray-900">{t.outlookFinal}</p>
              <span className="text-base font-bold text-[#005670]">{fmt(outlook.estimatedFinalProjectInvestment)}</span>
            </div>
          </div>
          <div className="bg-[#005670]/5 border border-[#005670]/15 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold tracking-widest text-[#005670]/70 uppercase">{t.depositHeld}</p>
            <p className="text-xl font-bold text-[#005670] mt-0.5">({fmt(outlook.depositHeldOnAccount)})</p>
            <p className="text-[9px] text-gray-400 mt-0.5 italic">{t.depositNote}</p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-[10px] font-bold tracking-widest text-[#005670] uppercase mb-3">{t.notesTitle}</p>
        <div className="space-y-2">
          {[t.note1, t.note2, t.note3, t.note4].map((note, i) => (
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
          <p className="text-[9px] text-gray-400">{t.footerSub}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-gray-400">HENDERSON.HOUSE • 808 591 1117</p>
        </div>
        <div className="text-right">
          <p className="text-base italic text-[#005670]/40 font-serif">{t.thankYou}</p>
          <p className="text-[9px] font-bold tracking-widest text-[#005670]/60 uppercase">{t.appreciate}</p>
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
  const [lang, setLang]             = useState('en');
  const [clientData, setClientData] = useState(null);
  const [computed, setComputed]     = useState(null);
  const [form, setForm] = useState({
    statementDate:            new Date().toISOString().split('T')[0],
    proposalLabel:            '',
    originalCollectionInvestment: 0,
    depositReceived:              0,
    approvedTotalToDate:          0,
    paymentsReceived:             0,
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
        const oc  = ps.originalCollection || {};
        const cst = ps.currentStatus || {};
        setForm({
          statementDate:            new Date().toISOString().split('T')[0],
          proposalLabel:            ps.proposalLabel || '',
          originalCollectionInvestment: oc.originalCollectionInvestment || 0,
          depositReceived:              oc.depositReceived              || 0,
          approvedTotalToDate:          cst.approvedTotalToDate         || 0,
          paymentsReceived:             cst.paymentsReceived            || 0,
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

  // Section 1 & 2 are manual inputs; balances are derived from them
  const s1Original  = Number(form.originalCollectionInvestment);
  const s1Deposit   = Number(form.depositReceived);
  const s1Remaining = Math.max(0, s1Original - s1Deposit);
  const s2Approved  = Number(form.approvedTotalToDate);
  const s2Payments  = Number(form.paymentsReceived);
  const s2Outstanding = Math.max(0, s2Approved - s2Payments);

  const preview = {
    statementDate: form.statementDate,
    client: {
      name:           clientData?.name                           || '—',
      unitNumber:     clientData?.unitNumber                     || '—',
      collection:     computed?.client?.collection || clientData?.collection || '—',
      projectAdvisor: computed?.client?.projectAdvisor          || 'Henderson Design Group',
    },
    section1: {
      originalCollectionInvestment: s1Original,
      depositReceived:              s1Deposit,
      remainingOriginalBalance:     s1Remaining,
    },
    section2: {
      proposalLabel:       form.proposalLabel,
      approvedTotalToDate: s2Approved,
      paymentsReceived:    s2Payments,
      outstandingBalance:  s2Outstanding,
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
      approvedCostsToDate:             s2Approved,
      estimatedRemainingCosts:         s3Total,
      estimatedFinalProjectInvestment: s2Approved + s3Total,
    },
    outlook: {
      originalPackageInvestment:       s1Original,
      approvedCostsToDate:             s2Approved,
      estimatedRemainingCosts:         s3Total,
      estimatedFinalProjectInvestment: s2Approved + s3Total,
      depositHeldOnAccount:            s1Deposit,
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
    const win = window.open('', '_blank', 'width=900,height=1200');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Project Summary – ${clientData?.name || ''}</title>
  <meta charset="UTF-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4 portrait; margin: 7mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0; padding: 0; background: #fff; }
    /* width fills the printable A4 area; auto-scaled to one page on load */
    #print-root { width: 196mm; margin: 0 auto; transform-origin: top center; }
    /* tighten vertical rhythm so everything fits one page */
    #print-root > * + * { margin-top: 0.5rem !important; }
  </style>
</head>
<body>
  <div id="print-root" class="text-xs font-sans space-y-3">${content.innerHTML}</div>
  <script>
    (function () {
      var done = false;
      function fitAndPrint() {
        if (done) return; done = true;
        var root = document.getElementById('print-root');
        // A4 usable height (297mm - 14mm margins) at 96dpi ≈ 1070px; keep a safety buffer
        var pageH = 1070 * 0.94;
        var scale = Math.min(1, pageH / root.scrollHeight);
        root.style.zoom = scale;             // Chromium: affects print pagination
        // re-measure once more after the zoom settles, then print
        requestAnimationFrame(function () {
          setTimeout(function () { window.focus(); window.print(); }, 200);
        });
      }
      // give the Tailwind CDN time to generate the utility styles
      window.addEventListener('load', function () { setTimeout(fitAndPrint, 900); });
    })();
  </script>
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
          value={form[key] === 0 ? '' : form[key]}
          onChange={e => setField(key, e.target.value === '' ? 0 : Number(e.target.value))}
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Section 1 – Original Collection</p>
                <div className="space-y-3">
                  {numField('Original Collection Estimate ($)', 'originalCollectionInvestment')}
                  {numField('Deposit Received ($)',             'depositReceived')}
                </div>
                <div className="mt-3 flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-gray-700">Remaining Balance</span>
                  <span className="text-sm font-bold text-gray-800">{fmt(s1Remaining)}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Section 2 – Current Status</p>
                <div className="space-y-3">
                  {numField('Proposal Total To Date ($)', 'approvedTotalToDate')}
                  {numField('Less Payments Received ($)', 'paymentsReceived')}
                </div>
                <div className="mt-3 flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-gray-700">Outstanding Balance</span>
                  <span className="text-sm font-bold text-gray-800">{fmt(s2Outstanding)}</span>
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
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Preview</span>
                  <span className="text-[10px] text-gray-400">— mirrors what the client sees</span>
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm gap-1">
                  <Globe className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lang === 'en' ? 'bg-[#005670] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('jp')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lang === 'jp' ? 'bg-[#005670] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    日本語
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <SummaryPreview preview={preview} lang={lang} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSummaryEditorModal;
