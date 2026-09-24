import { useEffect, useMemo, useState } from "react";

/* Business Atelier reminder: formal original-style quotation document, Navy authority,
   restrained red emphasis, bilingual customer copy, and clear rate/cost comparison. */

type Language = "zh" | "en";
type Category = "SME" | "Dine-in" | "Fast Food";

type Result = {
  category: Category;
  proposedRate: number;
  localRate: number;
  overseaRate: number;
  localRatio: number;
  overseaRatio: number;
  blendedRate: number;
  rateGap: number;
  dailyFee: number;
  annualFee: number;
  competitorDailyFee: number;
  competitorAnnualFee: number;
  annualSavings: number;
};

const categoryLabels: Record<Language, Record<Category, string>> = {
  zh: { SME: "中小企方案", "Dine-in": "堂食方案", "Fast Food": "快餐方案" },
  en: { SME: "SME Plan", "Dine-in": "Dine-in Plan", "Fast Food": "Fast Food Plan" },
};

const categoryDescriptions: Record<Language, Partial<Record<Category, string>>> = {
  zh: { SME: "Visa / Master / Union Pay 首 150 萬營業額特惠費率" },
  en: { SME: "Preferential rate for the first HKD 1.5M Visa / Mastercard / UnionPay GMV" },
};

function money(value: number, digits = 2) {
  return value.toLocaleString("en-HK", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "zh");
  const [merchant, setMerchant] = useState("");
  const [salesName, setSalesName] = useState("");
  const [salesContact, setSalesContact] = useState("");
  const [gmv, setGmv] = useState(10000);
  const [localRatio, setLocalRatio] = useState(70);
  const [overseaRate, setOverseaRate] = useState(3);
  const [selected, setSelected] = useState<Record<Category, boolean>>({
    SME: true,
    "Dine-in": true,
    "Fast Food": true,
  });
  const [rates, setRates] = useState({
    SME: { proposed: 1.6, local: 1.3 },
    "Dine-in": { proposed: 2.1, local: 2.2 },
    "Fast Food": { proposed: 1.8, local: 1.3 },
  });

  const copy = language === "zh"
    ? {
        edition: "OPENRICE PAY · SALES TOOL",
        studio: "Payment Proposal Studio",
        fixed: "BUSINESS QUOTATION EDITION",
        quotation: "專業支付方案報價",
        subtitle: "Professional Payment Solution Quotation",
        date: "日期",
        reference: "參考編號",
        reviewEyebrow: "商業支付方案比較",
        heroTitle: "方案費率比較",
        heroAccent: "",
        heroDescription: "根據商家每日信用卡營業額、卡種比例及現有支付供應商費率，比較 OpenRice 建議費率與現有供應商實際費率。",
        openriceRate: "OpenRice 費率",
        currentRate: "現有實際費率",
        annualSaving: "年度節省",
        estimatedAnnualSaving: "預計年度節省",
        basedOn: "以 365 日估算",
        inputEyebrow: "01 · 輸入資料",
        inputTitle: "商家資料及費率設定",
        autoUpdate: "修改數值後結果會即時更新",
        merchantName: "商家名稱",
        merchantPlaceholder: "例如：ABC 餐廳",
        salesName: "Sales 姓名",
        salesNamePlaceholder: "例如：陳先生",
        salesContact: "Sales 聯絡資料",
        salesContactPlaceholder: "電話／電郵",
        dailyGmv: "每日信用卡營業額 ($)",
        localRatio: "本地卡比例 (%)",
        overseasRatio: "海外卡比例 (%)",
        rateMatrix: "費率比較表",
        choosePlans: "選擇要展示的方案",
        category: "方案類別",
        openriceRateCol: "OpenRice 費率 (%)",
        localRateCol: "現有供應商本地卡費率 (%)",
        overseasRate: "現有供應商海外卡費率 (%)",
        formulaTitle: "實際費率計算方式",
        formula: "本地卡費率 × 本地卡比例 + 海外卡費率 × 海外卡比例。",
        resultEyebrow: "02 · 客戶報價比較",
        resultTitle: "成本節省分析",
        export: "匯出 PDF 報價單",
        executiveEyebrow: "報價重點摘要",
        executiveTitle: "核心商業結果",
        estimated: "估算基準",
        rateAdvantage: "費率優勢",
        rateAdvantageNote: "OpenRice 較低的百分點",
        summaryOpenrice: "OpenRice 建議費率",
        summaryCurrent: "現有供應商實際費率",
        summarySaving: "預計年度節省",
        summaryRateNote: "按卡種比例計算",
        summarySavingNote: "以 365 日估算 · HKD",
        takeawayLabel: "銷售重點：",
        takeaway: "OpenRice 以統一費率處理本地及海外卡；現有供應商則按卡種及比例計算實際成本。",
        comparisonItem: "比較項目",
        metric: "Metric",
        recommended: "✓ 推薦方案",
        recommendedEn: "Recommended Plan",
        actualCalculation: "實際計算",
        effectiveRate: "有效費率",
        dailyFee: "每日手續費",
        annualFee: "年度手續費",
        annualCostSaving: "年度節省總額",
        unifiedRate: "本地及海外卡統一費率",
        localCard: "本地卡",
        overseasCard: "海外卡",
        lowerBy: "OpenRice 低",
        points: "個百分點",
        savingNote: "OpenRice 方案預計每年節省",
        baseline: "比較基準",
        note: "備註：以上報價及節省金額乃根據輸入資料作估算，最終費率及條款以正式合約為準。",
        prepared: "供 Sales 商業討論使用 · OpenRice Pay",
        selectPlan: "請至少選擇一個方案以展示報價結果。",
        languageButton: "ENG",
      }
    : {
        edition: "OPENRICE PAY · SALES TOOL",
        studio: "Payment Proposal Studio",
        fixed: "BUSINESS QUOTATION EDITION",
        quotation: "Payment Solution Quotation",
        subtitle: "Professional Payment Solution Proposal",
        date: "DATE",
        reference: "REFERENCE",
        reviewEyebrow: "COMMERCIAL PAYMENT REVIEW",
        heroTitle: "Payment rate comparison",
        heroAccent: "",
        heroDescription: "This quotation compares OpenRice's proposed rate with the current payment provider's actual rate, based on daily card GMV and card mix.",
        openriceRate: "OpenRice Rate",
        currentRate: "Current Actual Rate",
        annualSaving: "Annual Saving",
        estimatedAnnualSaving: "Estimated Annual Cost Saving",
        basedOn: "Based on 365 days",
        inputEyebrow: "01 · INPUT WORKSPACE",
        inputTitle: "Merchant Details & Rate Settings",
        autoUpdate: "Results update automatically as values change",
        merchantName: "Merchant Name",
        merchantPlaceholder: "e.g. ABC Restaurant",
        salesName: "Sales Name",
        salesNamePlaceholder: "e.g. Alex Chan",
        salesContact: "Sales Contact",
        salesContactPlaceholder: "Phone / Email",
        dailyGmv: "Daily Credit Card GMV ($)",
        localRatio: "Local Card Ratio (%)",
        overseasRatio: "Overseas Card Ratio (%)",
        rateMatrix: "Rate Comparison Matrix",
        choosePlans: "Select plans to include in the quotation",
        category: "Category",
        openriceRateCol: "OpenRice Rate (%)",
        localRateCol: "Current Provider Local Card Rate (%)",
        overseasRate: "Current Provider Overseas Card Rate (%)",
        formulaTitle: "Actual blended rate formula",
        formula: "Local card rate × local card ratio + overseas card rate × overseas card ratio.",
        resultEyebrow: "02 · CLIENT-READY COMPARISON",
        resultTitle: "Cost Saving Analysis",
        export: "Export PDF Quotation",
        executiveEyebrow: "EXECUTIVE SUMMARY",
        executiveTitle: "Key Commercial Outcome",
        estimated: "Estimate basis",
        rateAdvantage: "Rate Advantage",
        rateAdvantageNote: "OpenRice lower by percentage points",
        summaryOpenrice: "OpenRice Proposed Rate",
        summaryCurrent: "Current Provider Actual Rate",
        summarySaving: "Estimated Annual Cost Saving",
        summaryRateNote: "Calculated from the stated card mix",
        summarySavingNote: "Based on 365 days · HKD",
        takeawayLabel: "Commercial takeaway: ",
        takeaway: "OpenRice applies one consistent rate across local and overseas cards, while the current provider's actual cost varies by card type and mix.",
        comparisonItem: "Comparison Item",
        metric: "Metric",
        recommended: "✓ Recommended Plan",
        recommendedEn: "",
        actualCalculation: "Actual Calculation",
        effectiveRate: "Effective Rate",
        dailyFee: "Daily Processing Fee",
        annualFee: "Annual Processing Fee",
        annualCostSaving: "Annual Cost Saving",
        unifiedRate: "One consistent rate for local and overseas cards",
        localCard: "Local card",
        overseasCard: "Overseas card",
        lowerBy: "OpenRice lower by",
        points: "percentage points",
        savingNote: "OpenRice estimated annual saving",
        baseline: "Comparison baseline",
        note: "Note: This quotation is an estimate based on the information provided. Final rates and terms are subject to the formal agreement.",
        prepared: "Prepared for commercial discussion · OpenRice Pay",
        selectPlan: "Select at least one plan to display the quotation result.",
        languageButton: "中文",
      };

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-HK" : "en-HK";
  }, [language]);

  const overseaRatio = Math.max(0, Math.min(100, 100 - Number(localRatio || 0)));
  const activeResults = useMemo<Result[]>(() => {
    return (Object.keys(rates) as Category[])
      .filter((category) => selected[category])
      .map((category) => {
        const rate = rates[category];
        const proposed = Number(rate.proposed) || 0;
        const local = Number(rate.local) || 0;
        const overseas = Number(overseaRate) || 0;
        const localShare = Math.max(0, Math.min(100, Number(localRatio) || 0)) / 100;
        const overseasShare = overseaRatio / 100;
        const dailyFee = Number(gmv || 0) * (proposed / 100);
        const competitorDailyFee =
          Number(gmv || 0) * localShare * (local / 100) +
          Number(gmv || 0) * overseasShare * (overseas / 100);
        const blendedRate = local * localShare + overseas * overseasShare;
        return {
          category,
          proposedRate: proposed,
          localRate: local,
          overseaRate: overseas,
          localRatio: Number(localRatio) || 0,
          overseaRatio,
          blendedRate,
          rateGap: blendedRate - proposed,
          dailyFee,
          annualFee: dailyFee * 365,
          competitorDailyFee,
          competitorAnnualFee: competitorDailyFee * 365,
          annualSavings: (competitorDailyFee - dailyFee) * 365,
        };
      });
  }, [gmv, localRatio, overseaRatio, overseaRate, rates, selected]);

  const heroResult = activeResults[0];
  const heroSaving = activeResults.reduce((best, item) => item.annualSavings > best ? item.annualSavings : best, activeResults[0]?.annualSavings ?? 0);
  const rateGap = heroResult?.rateGap ?? 0;
  const savingIsPositive = heroSaving >= 0;
  const date = new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  function updateRate(category: Category, field: "proposed" | "local", value: number) {
    setRates((current) => ({
      ...current,
      [category]: { ...current[category], [field]: value },
    }));
  }

  function exportPdf() {
    const node = document.getElementById("quotation-sheet");
    const html2pdf = (window as Window & { html2pdf?: () => any }).html2pdf;
    if (!node || !html2pdf) {
      window.print();
      return;
    }
    html2pdf()
      .set({
        margin: [0.35, 0.35],
        filename: `${language === "zh" ? "OpenRice_報價單" : "OpenRice_Quotation"}_${merchant || "Merchant"}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(node)
      .save();
  }

  return (
    <main className="app-shell skin-ledger">
      <div className="texture-layer" aria-hidden="true" />
      <div className="page-wrap">
        <header className="topbar no-print">
          <div className="brand-lockup">
            <img src="./assets/openrice-pay-logo.png" alt="OpenRice Pay logo" className="brand-mark" />
            <div>
              <p className="eyebrow">{copy.edition}</p>
              <strong>{copy.studio}</strong>
            </div>
          </div>
          <button className="language-toggle" type="button" onClick={() => setLanguage(language === "zh" ? "en" : "zh")} aria-label={language === "zh" ? "Switch to English" : "切換至中文"}>
            {copy.languageButton}
          </button>
        </header>

        <section id="quotation-sheet" className="quotation-sheet">
          <div className="proposal-header">
            <div className="proposal-brand">
              <div className="brand-symbol"><img src="./assets/openrice-pay-logo.png" alt="OpenRice Pay logo" /></div>
              <div>
                <p className="micro-label">OPENRICE PAY</p>
                <h1>{copy.quotation}</h1>
                <p className="subhead">{copy.subtitle}</p>
              </div>
            </div>
            <div className="quote-meta">
              <p className="quote-word">QUOTATION</p>
              <p>{copy.date} <span>{date}</span></p>
              <p>{copy.reference} <span>OR-PAY-{new Date().getFullYear()}</span></p>
              <p className="sales-meta">{copy.salesName} <span>{salesName || "—"}</span></p>
              <p className="sales-meta">{copy.salesContact} <span>{salesContact || "—"}</span></p>
            </div>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{copy.reviewEyebrow}</p>
              <h2>{copy.heroTitle}<em>{copy.heroAccent}</em></h2>
              <p className="hero-description">{copy.heroDescription}</p>
              <div className="proof-path" aria-label="Rate comparison summary">
                <span><small>{copy.openriceRate}</small>{heroResult ? `${heroResult.proposedRate.toFixed(2)}%` : "—"}</span>
                <b>→</b>
                <span><small>{copy.currentRate}</small>{heroResult ? `${heroResult.blendedRate.toFixed(2)}%` : "—"}</span>
                <b>→</b>
                <span className={savingIsPositive ? "positive" : "negative"}><small>{copy.annualSaving}</small>${money(heroSaving, 0)}</span>
              </div>
            </div>
            <div className={`saving-callout ${savingIsPositive ? "positive" : "negative"}`}>
              <span>{copy.estimatedAnnualSaving}</span>
              <strong>${money(heroSaving, 0)}</strong>
              <small>HKD · {copy.basedOn}</small>
            </div>
          </div>

          <section className="input-section no-print">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.inputEyebrow}</p>
                <h3>{copy.inputTitle}</h3>
              </div>
              <span className="section-note">{copy.autoUpdate}</span>
            </div>
            <div className="input-grid input-grid-primary">
              <label className="field">
                <span>{copy.merchantName}</span>
                <input value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder={copy.merchantPlaceholder} />
              </label>
              <label className="field">
                <span>{copy.dailyGmv}</span>
                <input type="number" value={gmv} onChange={(event) => setGmv(Number(event.target.value))} />
              </label>
              <label className="field">
                <span>{copy.localRatio}</span>
                <input type="number" min="0" max="100" value={localRatio} onChange={(event) => setLocalRatio(Number(event.target.value))} />
              </label>
              <label className="field field-readonly">
                <span>{copy.overseasRatio}</span>
                <input value={`${overseaRatio.toFixed(2)}%`} readOnly />
              </label>
            </div>
            <div className="input-grid input-grid-contact">
              <label className="field">
                <span>{copy.salesName}</span>
                <input value={salesName} onChange={(event) => setSalesName(event.target.value)} placeholder={copy.salesNamePlaceholder} />
              </label>
              <label className="field">
                <span>{copy.salesContact}</span>
                <input value={salesContact} onChange={(event) => setSalesContact(event.target.value)} placeholder={copy.salesContactPlaceholder} />
              </label>
            </div>

            <div className="rate-table-wrap">
              <div className="rate-table-caption">
                <span>{copy.rateMatrix}</span>
                <span className="caption-hint">{copy.choosePlans}</span>
              </div>
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>{copy.category}</th>
                    <th>{copy.openriceRateCol}</th>
                    <th>{copy.localRateCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(rates) as Category[]).map((category) => (
                    <tr key={category}>
                      <td><label className="check-label"><input type="checkbox" checked={selected[category]} onChange={() => setSelected((current) => ({ ...current, [category]: !current[category] }))} /><span className="plan-label-copy"><strong>{categoryLabels[language][category]}</strong>{categoryDescriptions[language][category] && <small>{categoryDescriptions[language][category]}</small>}</span></label></td>
                      <td><input type="number" step="0.01" value={rates[category].proposed} onChange={(event) => updateRate(category, "proposed", Number(event.target.value))} /></td>
                      <td><input type="number" step="0.01" value={rates[category].local} onChange={(event) => updateRate(category, "local", Number(event.target.value))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="input-grid input-grid-secondary">
                <label className="field">
                  <span>{copy.overseasRate}</span>
                  <input type="number" step="0.01" value={overseaRate} onChange={(event) => setOverseaRate(Number(event.target.value))} />
                </label>
                <div className="field field-explainer">
                  <span>{copy.formulaTitle}</span>
                  <p>{copy.formula}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="results-section">
            <div className="section-heading results-heading">
              <div>
                <p className="eyebrow">{copy.resultEyebrow}</p>
                <h3>{merchant || (language === "zh" ? "客戶" : "Merchant")} {copy.resultTitle}</h3>
              </div>
              <button className="export-button no-print" onClick={exportPdf} type="button">{copy.export} <span>↗</span></button>
            </div>

            {heroResult && (
              <section className="conclusion-summary" aria-label={copy.executiveTitle}>
                <div className="conclusion-heading">
                  <div>
                    <p className="eyebrow">{copy.executiveEyebrow}</p>
                    <h4>{copy.executiveTitle}</h4>
                  </div>
                  <span>{copy.estimated} · {categoryLabels[language][heroResult.category]} · GMV ${money(Number(gmv || 0), 0)}</span>
                </div>
                <div className="summary-metrics">
                  <div className="summary-metric">
                    <span className="summary-label">{copy.summaryOpenrice}</span>
                    <strong>{heroResult.proposedRate.toFixed(2)}%</strong>
                    <small>{copy.unifiedRate}</small>
                  </div>
                  <div className="summary-metric">
                    <span className="summary-label">{copy.summaryCurrent}</span>
                    <strong>{heroResult.blendedRate.toFixed(2)}%</strong>
                    <small>{copy.summaryRateNote}</small>
                  </div>
                  <div className="summary-metric summary-rate-gap">
                    <span className="summary-label">{copy.rateAdvantage}</span>
                    <strong>{Math.abs(rateGap).toFixed(2)} pts</strong>
                    <small>{rateGap >= 0 ? copy.rateAdvantageNote : (language === "zh" ? "OpenRice 較高的百分點" : "OpenRice higher by percentage points")}</small>
                  </div>
                  <div className="summary-metric summary-saving">
                    <span className="summary-label">{copy.summarySaving}</span>
                    <strong>${money(heroResult.annualSavings, 0)}</strong>
                    <small>{copy.summarySavingNote}</small>
                  </div>
                </div>
              </section>
            )}

            <div className="insight-strip">
              <span className="insight-index">01</span>
              <p><strong>{copy.takeawayLabel}</strong>{copy.takeaway}</p>
            </div>

            <div className="result-list">
              {activeResults.length === 0 ? (
                <div className="empty-result">{copy.selectPlan}</div>
              ) : activeResults.map((result, index) => (
                <article className={`result-card ${result.category === "SME" || result.category === "Dine-in" ? "result-card-emphasis" : ""}`} key={result.category}>
                  <div className="result-card-head">
                    <div><span className="result-index">0{index + 1}</span><span className="plan-label-copy"><strong>{categoryLabels[language][result.category]}</strong>{categoryDescriptions[language][result.category] && <small>{categoryDescriptions[language][result.category]}</small>}</span></div>
                    <span>{language === "zh" ? "每日 GMV" : "Daily GMV"} ${money(Number(gmv || 0), 0)}</span>
                  </div>
                  <div className="comparison-table-wrap">
                    <table className="comparison-table">
                      <colgroup><col className="metric-col" /><col className="plan-col" /><col className="plan-col" /></colgroup>
                      <thead>
                        <tr>
                          <th>{copy.comparisonItem}<br /><small>{copy.metric}</small></th>
                          <th className="preferred-head"><span>OpenRice</span></th>
                          <th><span>{language === "zh" ? "現有支付供應商" : "Current Payment Provider"}</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>{copy.effectiveRate}<br /><small>{copy.metric}</small></th>
                          <td className="preferred-cell"><strong className="rate-number">{result.proposedRate.toFixed(2)}%</strong><small>{copy.unifiedRate}</small></td>
                          <td><strong className="rate-number">{result.blendedRate.toFixed(2)}%</strong><small>{copy.localCard} {result.localRate.toFixed(2)}% × {result.localRatio.toFixed(2)}%<br />{copy.overseasCard} {result.overseaRate.toFixed(2)}% × {result.overseaRatio.toFixed(2)}%</small></td>
                        </tr>
                        <tr className="rate-advantage-row">
                          <th>{copy.rateAdvantage}<br /><small>{copy.metric}</small></th>
                          <td className="preferred-cell"><strong className="advantage-number">{rateGap >= 0 ? `${Math.abs(result.rateGap).toFixed(2)} pts` : `+${Math.abs(result.rateGap).toFixed(2)} pts`}</strong><small>{rateGap >= 0 ? `${copy.lowerBy} ${Math.abs(result.rateGap).toFixed(2)} ${copy.points}` : (language === "zh" ? "OpenRice 費率較高" : "OpenRice rate is higher")}</small></td>
                          <td><span className="comparison-reference">{rateGap >= 0 ? (language === "zh" ? "現有供應商作比較基準" : "Current provider as reference") : (language === "zh" ? "現有供應商費率較低" : "Current provider rate is lower")}</span></td>
                        </tr>
                        <tr>
                          <th>{copy.dailyFee}<br /><small>{copy.metric}</small></th>
                          <td className="preferred-cell">${money(result.dailyFee)}</td>
                          <td>${money(result.competitorDailyFee)}</td>
                        </tr>
                        <tr>
                          <th>{copy.annualFee}<br /><small>{copy.metric}</small></th>
                          <td className="preferred-cell">${money(result.annualFee)}</td>
                          <td>${money(result.competitorAnnualFee)}</td>
                        </tr>
                        <tr className="savings-row">
                          <th>{copy.annualCostSaving}<br /><small>{copy.metric}</small></th>
                          <td className="preferred-cell"><strong className="saving-number">${money(result.annualSavings)}</strong><small className="saving-note">{copy.savingNote}</small></td>
                          <td className="muted-saving">{copy.baseline}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="proposal-footer">
            <p>{copy.note}</p>
            <p>{copy.prepared}</p>
          </footer>
        </section>
      </div>
    </main>
  );
}
