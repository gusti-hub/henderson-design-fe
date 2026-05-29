import React, { useState, useEffect } from 'react';
import { Loader2, Globe } from 'lucide-react';
import { backendServer } from '../utils/info';

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  en: {
    brand:        'ĀLIA RESIDENCE',
    title:        'Project Investment Summary',
    tagline:      'TRANSPARENT. CURATED. EXCEPTIONAL.',
    clientName:   'Client Name',
    unitNumber:   'Unit Number',
    collection:   'Collection Type',
    statementDate:'Statement Date',
    advisor:      'Project Advisor',

    s1Title:      'ORIGINAL COLLECTION CHOICE',
    s1Original:   'Original Collection Estimate',
    s1Deposit:    'Deposit Received',
    s1Balance:    'Remaining Original Balance',
    s1Note:       'Your original collection pricing is secured. Your deposit holds this pricing and is reserved toward final reconciliation.',

    s2Title:      'CURRENT PROJECT STATUS',
    s2Approved:   'Approved Total To Date',
    s2Payments:   'Less Payments Received',
    s2Outstanding:'Current Outstanding Balance',
    s2Current:    'Thank you. Your account is current.',

    s3Title:      'ESTIMATED REMAINING PROJECT COSTS',
    s3Sub:        '(Subject to Final Selections)',
    s3Accents:    'Proposal 2 – Accents Estimated Allowance',
    s3Closet:     'Closet Systems Estimated Allowance',
    s3Window:     'Window Coverings Estimated Allowance',
    s3Fdi:        'FDI Estimated Allowance\n(Freight, Delivery & Installation)',
    s3Other:      'Other Estimated Items\n(AV, Additional Services, Specialty Coordination)',
    s3Total:      'Estimated Remaining Costs',

    s4Title:      'ESTIMATED FINAL PROJECT',
    s4Approved:   'Approved Costs To Date',
    s4Remaining:  'Estimated Remaining Costs',
    s4Final:      'Estimated Final Project',

    outlookTitle:    'CURRENT INVESTMENT OUTLOOK',
    outlookSub:      'Summary of Your Project',
    outlookOrig:     'Original Choice Of Investment',
    outlookApproved: 'Approved Costs To Date',
    outlookRemaining:'Estimated Remaining Costs',
    outlookFinal:    'Estimated Final Project Investment',
    depositHeld:     'DEPOSIT HELD ON ACCOUNT',
    depositNote:     'To be applied toward final project reconciliation.',
    projManaged:     'Your project is thoughtfully managed with full transparency every step of the way.',

    notesTitle: 'IMPORTANT NOTES',
    note1: 'This summary reflects approved selections and current project estimates as of the statement date above.',
    note2: 'Estimated categories are planning allowances only and may adjust pending final selections, field conditions, vendor pricing, freight conditions, and project coordination requirements.',
    note3: 'FDI includes freight, delivery, warehousing, installation coordination, installation labor, staging, and project execution services.',
    note4: 'Final project pricing will be based on approved proposals and actual selected scope.',
    note5: 'Your original collection pricing remains protected under the terms of your Ālia Collection Agreement.',

    footerSub:    'DESIGN | FURNISHINGS | LIFESTYLE',
    thankYou:     'Thank you.',
    appreciate:   'WE APPRECIATE YOUR TRUST.',
    continueBtn:  'Continue to Questionnaire',
    loading:      'Loading your project summary…',
  },
  jp: {
    brand:        'アリア レジデンス',
    title:        'プロジェクト投資概要',
    tagline:      '透明性。洗練。卓越性。',
    clientName:   'お客様名',
    unitNumber:   'ユニット番号',
    collection:   'コレクション種別',
    statementDate:'作成日',
    advisor:      'プロジェクトアドバイザー',

    s1Title:      'オリジナルコレクション契約',
    s1Original:   'オリジナルコレクション投資額',
    s1Deposit:    'コレクションデポジット受領済',
    s1Balance:    'オリジナルパッケージ残高',
    s1Note:       'お客様のオリジナルコレクション価格は確保されています。のデポジットはこの価格を保証し、最終精算時に充当されます。',

    s2Title:      '現在のプロジェクト状況',
    s2Approved:   '承認済み合計額（現在まで）',
    s2Payments:   '受領済み支払い額（控除）',
    s2Outstanding:'現在の未払い残高',
    s2Current:    'ありがとうございます。お支払いは完了しています。',

    s3Title:      '今後予定される推定費用',
    s3Sub:        '（最終選定内容により変動する場合があります）',
    s3Accents:    'Proposal 2 – アクセント関連予算見込み',
    s3Closet:     'クローゼットシステム予算見込み',
    s3Window:     'ウィンドウカバー予算見込み',
    s3Fdi:        'FDI予算見込み\n（輸送・搬入・設置費用）',
    s3Other:      'その他予想費用\n（AV・追加サービス・スペシャルティコーディネーション等）',
    s3Total:      '推定残りの費用合計',

    s4Title:      '最終プロジェクト投資予測',
    s4Approved:   '承認済みコスト（現在まで）',
    s4Remaining:  '推定残りの費用',
    s4Final:      '推定最終プロジェクト投資額',

    outlookTitle:    '現在の投資状況の見通し',
    outlookSub:      'プロジェクトの概要',
    outlookOrig:     'オリジナルコレクション投資額',
    outlookApproved: '承認済みコスト（現在まで）',
    outlookRemaining:'推定残りの費用',
    outlookFinal:    '推定最終プロジェクト投資額',
    depositHeld:     'お預かりデポジット',
    depositNote:     '最終精算時に充当されます。',
    projManaged:     'プロジェクトはすべての段階で透明性を持ち、丁寧に管理されています。',

    notesTitle: '重要事項',
    note1: '本概要は、上記作成時点で承認済みの選定内容および現在の推定金額を反映しております。',
    note2: '推定項目は計画段階の参考金額であり、最終選定内容、現場状況、仕入価格、輸送状況、プロジェクト調整内容により変動する場合があります。',
    note3: 'FDIには、輸送、搬入、保管、設置調整、設置作業、ステージング、およびプロジェクト実行サービスが含まれます。',
    note4: '最終金額は、正式承認された提案内容および実際の選定内容に基づき確定されます。',
    note5: 'お客様のオリジナルコレクション価格は、Ālia Collection Agreementの条件に基づき保護されています。',

    footerSub:    'デザイン | 家具 | ライフスタイル',
    thankYou:     'ありがとうございました。',
    appreciate:   '信頼いただき、誠にありがとうございます。',
    continueBtn:  '質問票へ進む',
    loading:      'プロジェクト概要を読み込んでいます…',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d, lang) => {
  if (!d) return '—';
  const locale = lang === 'jp' ? 'ja-JP' : 'en-US';
  return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const LineRow = ({ label, value, bold, teal, indent, negative }) => (
  <div className={`flex justify-between items-start py-1.5 ${bold ? 'font-semibold' : ''} ${indent ? 'pl-2' : ''}`}>
    <p className={`flex-1 pr-4 text-sm leading-snug ${bold ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
    <span className={`text-sm whitespace-nowrap ${teal ? 'text-[#005670] font-bold' : bold ? 'text-gray-900' : 'text-gray-700'}`}>
      {negative ? `(${fmt(value)})` : fmt(value)}
    </span>
  </div>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-5 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ text }) => (
  <div className="mb-3">
    <p className="text-[10px] tracking-widest font-bold text-gray-500 uppercase leading-none">{text}</p>
  </div>
);

const Divider = () => <div className="border-t border-gray-200 my-2" />;

// ─── Demo / fallback data ─────────────────────────────────────────────────────
const DEMO_DATA = {
  statementDate: '2025-05-20T00:00:00.000Z',
  client: {
    name: 'The Smith Family',
    unitNumber: '1234',
    collection: 'Lani Collection – 2 Bedroom',
    projectAdvisor: 'Henderson Design Group',
  },
  section1: {
    originalCollectionInvestment: 180000,
    depositReceived: 54000,
    remainingOriginalBalance: 126000,
  },
  section2: {
    approvedTotalToDate: 100000,
    paymentsReceived: 100000,
    outstandingBalance: 0,
  },
  section3: {
    accentsAllowance: 40000,
    closetSystemsAllowance: 20000,
    windowCoveringsAllowance: 20000,
    fdiAllowance: 45000,
    otherEstimatedItems: 15000,
    totalEstimatedRemaining: 140000,
  },
  section4: {
    approvedCostsToDate: 100000,
    estimatedRemainingCosts: 140000,
    estimatedFinalProjectInvestment: 240000,
  },
  outlook: {
    originalPackageInvestment: 180000,
    approvedCostsToDate: 100000,
    estimatedRemainingCosts: 140000,
    estimatedFinalProjectInvestment: 240000,
    depositHeldOnAccount: 54000,
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectSummaryView = ({ email, unitNumber, onContinue }) => {
  const [lang, setLang]       = useState('en');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);
  const t = T[lang];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(
          `${backendServer}/api/clients-portal/project-summary?email=${encodeURIComponent(email)}&unitNumber=${encodeURIComponent(unitNumber)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load');
        setData(json.summary || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [email, unitNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-[#005670] animate-spin mb-4" />
        <p className="text-gray-500">{t.loading}</p>
      </div>
    );
  }

  const hasFinancialData = data && data.client && (
    (data.section1?.originalCollectionInvestment || 0) > 0 ||
    (data.section2?.approvedTotalToDate || 0) > 0 ||
    (data.section3?.totalEstimatedRemaining || 0) > 0
  );
  const displayData = hasFinancialData ? data : DEMO_DATA;
  const isDemoMode  = displayData === DEMO_DATA;

  const { client, section1: s1, section2: s2, section3: s3, section4: s4, outlook, statementDate } = displayData;

  return (
    <div className="max-w-5xl mx-auto font-sans">

      {/* ── Demo banner ── */}
      {/* {isDemoMode && (
        <div className="mb-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <span className="text-amber-600 text-xs font-semibold">Preview Mode</span>
          <span className="text-amber-500 text-xs">— Showing sample data. Real project data will appear once loaded.</span>
        </div>
      )} */}

      {/* ── Language toggle ── */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm gap-1">
          <Globe className="w-4 h-4 text-gray-400 ml-2" />
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

      {/* ══ Document card ══════════════════════════════════════════════════════ */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

        {/* ── Header — matches portal bg-[#005670] ────────────────────────── */}
        <div className="bg-[#005670] px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center leading-none">
                <span className="text-4xl font-light text-white tracking-widest" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}>Ālia</span>
              </div>
              <div className="border-l border-white/20 pl-6">
                <p className="text-[10px] tracking-[0.3em] text-white/60 font-semibold uppercase leading-none">{t.brand}</p>
                <h1 className="text-2xl md:text-3xl font-light text-white tracking-wide leading-tight mt-1">
                  {t.title}
                </h1>
                <p className="text-[10px] tracking-widest text-white/50 mt-1 uppercase">{t.tagline}</p>
              </div>
            </div>

            <div className="hidden md:block w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/20">
              <img
                src="/images/collections/1.jpg"
                alt="Collection preview"
                className="w-full h-full object-cover opacity-70"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* ── Client info bar ─────────────────────────────────────────────── */}
        <div className="bg-[#004558] border-b border-white/10 px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-3">
            {[
              { label: t.clientName,    value: client.name },
              { label: t.unitNumber,    value: `Unit ${client.unitNumber}` },
              { label: t.collection,    value: client.collection || '—' },
              { label: t.statementDate, value: fmtDate(statementDate, lang) },
              { label: t.advisor,       value: client.projectAdvisor },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-white/50 tracking-wide uppercase font-semibold leading-none">{label}</p>
                <p className="text-sm font-semibold text-white mt-0.5 leading-snug">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 px-6 py-6 space-y-5">

          {/* Row 1: Sections 1 + 2 + 3 */}
          <div className="grid md:grid-cols-3 gap-4">

            {/* Section 1 – Original Collection Agreement */}
            <SectionCard>
              <div className="flex items-start gap-2 mb-3">
                <span className="text-[10px] font-bold text-[#005670] bg-[#005670]/10 px-2 py-0.5 rounded-full">1</span>
                <SectionTitle text={t.s1Title} />
              </div>

              <LineRow label={t.s1Original} value={s1.originalCollectionInvestment} />
              <Divider />
              <LineRow label={t.s1Deposit}  value={s1.depositReceived} negative />
              <Divider />
              <LineRow label={t.s1Balance}  value={s1.remainingOriginalBalance} bold />

              {/* <div className="mt-4 bg-[#005670]/5 border border-[#005670]/10 rounded-lg p-3 flex gap-2">
                <span className="text-lg">🔒</span>
                <p className="text-xs text-gray-500 italic leading-snug">{t.s1Note}</p>
              </div> */}
            </SectionCard>

            {/* Section 2 – Current Project Status */}
            <SectionCard>
              <div className="flex items-start gap-2 mb-3">
                <span className="text-[10px] font-bold text-[#005670] bg-[#005670]/10 px-2 py-0.5 rounded-full">2</span>
                <div>
                  <SectionTitle text={t.s2Title} />
                  {/* {s2.proposalLabel && (
                    <p className="text-[10px] text-gray-400 italic -mt-2 mb-2">({s2.proposalLabel})</p>
                  )} */}
                </div>
              </div>

              <LineRow label={t.s2Approved}    value={s2.approvedTotalToDate} />
              <Divider />
              <LineRow label={t.s2Payments}    value={s2.paymentsReceived} negative />
              <Divider />
              <LineRow label={t.s2Outstanding} value={s2.outstandingBalance} bold teal={s2.outstandingBalance > 0} />

              {/* {s2.outstandingBalance === 0 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 items-center">
                  <span className="text-green-600">✓</span>
                  <p className="text-xs text-green-700 italic">{t.s2Current}</p>
                </div>
              )} */}
            </SectionCard>

            {/* Section 3 – Estimated Remaining Costs */}
            <SectionCard>
              <div className="flex items-start gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#005670] bg-[#005670]/10 px-2 py-0.5 rounded-full">3</span>
                <div>
                  <SectionTitle text={t.s3Title} />
                  <p className="text-[10px] text-gray-400 italic -mt-2 mb-2">{t.s3Sub}</p>
                </div>
              </div>

              {[
                { label: t.s3Accents, value: s3.accentsAllowance },
                { label: t.s3Closet,  value: s3.closetSystemsAllowance },
                { label: t.s3Window,  value: s3.windowCoveringsAllowance },
                { label: t.s3Fdi,     value: s3.fdiAllowance },
                { label: t.s3Other,   value: s3.otherEstimatedItems },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between items-start py-1.5">
                    <div className="flex-1 pr-2">
                      {label.split('\n').map((line, i) => (
                        <p key={i} className="text-xs text-gray-700 leading-snug">{line}</p>
                      ))}
                    </div>
                    <span className="text-xs text-gray-700 whitespace-nowrap">{fmt(value)}</span>
                  </div>
                  <Divider />
                </div>
              ))}

              <div className="flex justify-between items-center pt-1">
                <p className="text-sm font-bold text-gray-900">{t.s3Total}</p>
                <span className="text-sm font-bold text-[#005670]">{fmt(s3.totalEstimatedRemaining)}</span>
              </div>
            </SectionCard>
          </div>

          {/* Section 4 – Estimated Final Investment */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SectionCard>
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-[10px] font-bold text-[#005670] bg-[#005670]/10 px-2 py-0.5 rounded-full">4</span>
                  <SectionTitle text={t.s4Title} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <LineRow label={t.s4Approved}  value={s4.approvedCostsToDate} />
                    <Divider />
                    <LineRow label={t.s4Remaining} value={s4.estimatedRemainingCosts} />
                    <Divider />
                    <div className="flex justify-between items-end pt-1">
                      <p className="text-sm font-bold text-gray-900">{t.s4Final}</p>
                      <span className="text-lg font-bold text-[#005670]">{fmt(s4.estimatedFinalProjectInvestment)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-start border-l border-[#005670]/10 pl-6">
                    <p className="text-xs text-gray-500">{t.outlookOrig}</p>
                    <p className="text-xl font-bold text-[#005670] mt-1">{fmt(outlook.originalPackageInvestment)}</p>
                    {/* <div className="mt-3 flex gap-2 items-start">
                      <span className="text-lg">📊</span>
                      <p className="text-xs text-gray-500 italic leading-snug">{t.projManaged}</p>
                    </div> */}
                  </div>
                </div>
              </SectionCard>
            </div>
            <div className="hidden md:block" />
          </div>

          {/* ── Current Investment Outlook ── */}
          <div className="bg-white border border-[#005670]/15 rounded-xl p-6 shadow-sm">
            <div className="grid md:grid-cols-4 gap-6 items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#005670]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#005670]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#005670] uppercase">{t.outlookTitle}</p>
                  <p className="text-xs text-gray-500 italic mt-0.5">{t.outlookSub}</p>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-x-6 gap-y-2">
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

              <div className="bg-[#005670]/5 border border-[#005670]/15 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold tracking-widest text-[#005670]/70 uppercase">{t.depositHeld}</p>
                <p className="text-2xl font-bold text-[#005670] mt-1">({fmt(outlook.depositHeldOnAccount)})</p>
                <p className="text-[10px] text-gray-400 mt-1 italic">{t.depositNote}</p>
              </div>
            </div>
          </div>

          {/* ── Important Notes ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-[10px] font-bold tracking-widest text-[#005670] uppercase mb-3">{t.notesTitle}</p>
            <div className="space-y-2">
              {[t.note1, t.note2, t.note3, t.note4, t.note5].map((note, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[#005670]/40 text-sm mt-0.5 flex-shrink-0">•</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer bar ── */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2 border-t border-[#005670]/10">
            <div>
              <p className="text-xs font-bold text-[#005670] uppercase tracking-widest">HENDERSON DESIGN GROUP</p>
              <p className="text-[10px] text-gray-400">{t.footerSub}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400">HENDERSON.HOUSE</p>
              <p className="text-[10px] text-gray-400">808 591 1117</p>
            </div>
            <div className="text-right">
              <p className="text-lg italic text-[#005670]/40 font-serif">{t.thankYou}</p>
              <p className="text-[10px] font-bold tracking-widest text-[#005670]/60 uppercase">{t.appreciate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Continue button ── */}
      {onContinue && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onContinue}
            className="px-10 py-4 bg-[#005670] text-white rounded-xl hover:bg-[#004558] transition-all font-medium tracking-wide shadow-lg text-sm"
          >
            {t.continueBtn} →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectSummaryView;
