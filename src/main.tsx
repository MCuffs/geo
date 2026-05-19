import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, BrainCircuit, GitBranch, Languages, Lightbulb, Network, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { buildAdvancedGeoIntelligence } from './lib/advanced';
import { analyzeGeoRank, buildOntologyMap, type GeoInput } from './lib/geo';
import { getLanguageLabel, t, type Language } from './lib/i18n';
import './styles.css';

const SAMPLE_INPUT: GeoInput = {
  brand: 'AcmeSupport',
  website: 'https://acmesupport.example',
  category: 'customer support software',
  useCases: 'small SaaS, founder-led support, indie hackers',
  competitors: ['Intercom', 'Zendesk', 'Help Scout', 'Crisp'],
  customQueries: 'best customer support software for small SaaS\naffordable support tools for founders\nIntercom alternatives for startups\nbest live chat tools for indie hackers',
};

type Tab = 'overview' | 'intelligence' | 'details' | 'ontology';

function parseCompetitors(value: string): string[] {
  return value.split(/[\n,]/g).map((item) => item.trim()).filter(Boolean);
}

function statusText(score: number, language: Language): string {
  if (language === 'ko') return score >= 70 ? '강함' : score >= 45 ? '보통' : '약함';
  return score >= 70 ? 'Strong' : score >= 45 ? 'Moderate' : 'Weak';
}

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [brand, setBrand] = useState(SAMPLE_INPUT.brand);
  const [website, setWebsite] = useState(SAMPLE_INPUT.website);
  const [category, setCategory] = useState(SAMPLE_INPUT.category);
  const [useCases, setUseCases] = useState(SAMPLE_INPUT.useCases);
  const [competitors, setCompetitors] = useState(SAMPLE_INPUT.competitors.join('\n'));
  const [customQueries, setCustomQueries] = useState(SAMPLE_INPUT.customQueries);
  const [submitted, setSubmitted] = useState<GeoInput>(SAMPLE_INPUT);
  const [tab, setTab] = useState<Tab>('overview');

  const copy = (key: Parameters<typeof t>[1]) => t(language, key);
  const result = useMemo(() => analyzeGeoRank(submitted), [submitted]);
  const intelligence = useMemo(() => buildAdvancedGeoIntelligence(submitted), [submitted]);
  const centerQuery = result.queries[0]?.query ?? submitted.customQueries.split('\n')[0] ?? submitted.category;
  const map = useMemo(() => buildOntologyMap(result, centerQuery), [result, centerQuery]);
  const mapNodes = useMemo(() => new Map([map.center, ...map.nodes].map((node) => [node.id, node])), [map]);
  const topCompetitor = result.rankings.find((item) => item.brand !== result.target.brand);
  const strongestQuery = result.target.evidence[0]?.query ?? centerQuery;
  const ui = {
    advanced: language === 'ko' ? 'AI 시뮬레이션' : 'AI Simulation',
    advancedTitle: language === 'ko' ? '고도화된 AI Answer Simulation Engine' : 'Advanced AI Answer Simulation Engine',
    advancedSubtitle: language === 'ko'
      ? '단일 키워드 점수가 아니라 쿼리를 여러 구매 의도 클러스터로 확장하고, ChatGPT/Claude/Gemini/Perplexity 스타일 샘플링을 통해 누가 왜 언급될지 추정합니다.'
      : 'Instead of one keyword score, this expands queries into buyer-intent clusters and simulates ChatGPT/Claude/Gemini/Perplexity-style answer sampling to estimate who gets mentioned and why.',
    queryVariants: language === 'ko' ? '확장 쿼리' : 'Query variants',
    simulatedSamples: language === 'ko' ? '모델 샘플' : 'Model samples',
    evidenceEdges: language === 'ko' ? '증거 엣지' : 'Evidence edges',
    intentClusters: language === 'ko' ? '의도 클러스터' : 'Intent clusters',
    cluster: language === 'ko' ? '클러스터' : 'Cluster',
    mentionRate: language === 'ko' ? '언급률' : 'Mention rate',
    leader: language === 'ko' ? '우세 브랜드' : 'Leader',
    action: language === 'ko' ? '추천 액션' : 'Recommended action',
    moat: language === 'ko' ? '따라 만들기 어려운 지점' : 'Why this is harder to clone',
    liveReady: language === 'ko' ? '실제 API 샘플링으로 교체 가능한 구조' : 'Ready to replace simulations with live API sampling',
  };

  function runAudit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted({ brand, website, category, useCases, competitors: parseCompetitors(competitors), customQueries });
    setTab('overview');
  }

  return (
    <main>
      <header className="topBar" aria-label={copy('language')}>
        <div className="languageSwitcher">
          <Languages size={16} />
          <span>{copy('language')}</span>
          {(['ko', 'en'] satisfies Language[]).map((item) => (
            <button type="button" key={item} className={language === item ? 'active' : ''} aria-pressed={language === item} onClick={() => setLanguage(item)}>
              {getLanguageLabel(item)}
            </button>
          ))}
        </div>
      </header>

      <section className="hero simpleHero">
        <div><p className="eyebrow">{copy('eyebrow')}</p><h1>{copy('heroTitle')}</h1><p className="subtitle">{copy('heroSubtitle')}</p></div>
        <div className="heroCard"><ShieldCheck size={28} /><strong>{copy('evidenceFirst')}</strong><span>{copy('heroCardText')}</span></div>
      </section>

      <section className="explainPanel">
        <div><Sparkles size={20} /><h2>{copy('plainTitle')}</h2><p>{copy('plainSubtitle')}</p></div>
        <div className="explainSteps">
          <article><span>01</span><strong>{copy('stepOneTitle')}</strong><p>{copy('stepOneText')}</p></article>
          <article><span>02</span><strong>{copy('stepTwoTitle')}</strong><p>{copy('stepTwoText')}</p></article>
          <article><span>03</span><strong>{copy('stepThreeTitle')}</strong><p>{copy('stepThreeText')}</p></article>
        </div>
      </section>

      <section className="workspace">
        <form className="panel form" onSubmit={runAudit}>
          <h2><Search size={20} /> {copy('input')}</h2>
          <label>{copy('brandName')}<input value={brand} onChange={(event) => setBrand(event.target.value)} required /></label>
          <label>{copy('websiteUrl')}<input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" /></label>
          <label>{copy('category')}<input value={category} onChange={(event) => setCategory(event.target.value)} required /></label>
          <label>{copy('targetUseCases')}<textarea value={useCases} onChange={(event) => setUseCases(event.target.value)} rows={3} /></label>
          <label>{copy('competitors')}<textarea value={competitors} onChange={(event) => setCompetitors(event.target.value)} rows={4} /></label>
          <label>{copy('targetGeoQueries')}<textarea value={customQueries} onChange={(event) => setCustomQueries(event.target.value)} rows={4} /></label>
          <button type="submit">{copy('runAudit')}</button>
        </form>

        <section className="panel results simplifiedResults">
          <div className="tabs topTabs">
            <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>{copy('overview')}</button>
            <button type="button" className={tab === 'intelligence' ? 'active' : ''} onClick={() => setTab('intelligence')}>{ui.advanced}</button>
            <button type="button" className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>{copy('detailsTab')}</button>
            <button type="button" className={tab === 'ontology' ? 'active' : ''} onClick={() => setTab('ontology')}>{copy('ontologyTab')}</button>
          </div>

          {tab === 'overview' && (
            <div className="overviewScreen">
              <div className="scoreHero"><div><p>{copy('simpleSummary')}</p><strong>{result.target.score}</strong><span>{copy('visibility')}: {statusText(result.target.score, language)}</span></div><small>{copy('simpleExplanation')}</small></div>
              <div className="metricGrid">
                <article><span>{copy('estimatedMentionProbability')}</span><strong>{result.target.mentionProbability}%</strong></article>
                <article><span>{copy('rankVsCompetitors')}</span><strong>#{result.rankings.findIndex((item) => item.brand === result.target.brand) + 1}</strong></article>
                <article><span>{copy('bestQuery')}</span><strong>{strongestQuery}</strong></article>
                <article><span>{copy('needAttention')}</span><strong>{result.ontology.gaps.length}</strong></article>
              </div>
              <div className="plainColumns">
                <section><h3><BarChart3 size={18} /> {copy('whoIsWinning')}</h3><div className="rankList compact">{result.rankings.slice(0, 5).map((item, index) => <div className={item.brand === submitted.brand ? 'rank target' : 'rank'} key={item.brand}><span>#{index + 1}</span><strong>{item.brand}</strong><em>{item.score}/100</em></div>)}</div></section>
                <section><h3><Lightbulb size={18} /> {copy('recommendedActions')}</h3><div className="actions simpleActions">{result.recommendations.slice(0, 3).map((item) => <p key={item}>{item}</p>)}</div></section>
              </div>
            </div>
          )}

          {tab === 'intelligence' && (
            <div className="intelligenceScreen">
              <div className="intelligenceHero"><BrainCircuit size={28} /><div><h2>{ui.advancedTitle}</h2><p>{ui.advancedSubtitle}</p><small>{ui.liveReady}</small></div></div>
              <div className="intelMetrics">
                <article><span>{ui.queryVariants}</span><strong>{intelligence.mutations.length}</strong></article>
                <article><span>{ui.simulatedSamples}</span><strong>{intelligence.modelSamples.length}</strong></article>
                <article><span>{ui.evidenceEdges}</span><strong>{intelligence.evidenceGraph.edges.length}</strong></article>
                <article><span>{ui.intentClusters}</span><strong>{intelligence.clusterSummaries.length}</strong></article>
              </div>
              <div className="clusterGrid">
                {intelligence.clusterSummaries.map((cluster) => (
                  <article key={cluster.cluster} className={`risk-${cluster.risk}`}>
                    <div><span>{ui.cluster}</span><strong>{cluster.cluster.replaceAll('_', ' ')}</strong></div>
                    <p>{ui.mentionRate}: {Math.round(cluster.mentionRate * 100)}% · Avg rank #{cluster.averageRank}</p>
                    <p>{ui.leader}: <b>{cluster.leadingBrand}</b></p>
                    <small>{ui.action}: {cluster.recommendedAction}</small>
                  </article>
                ))}
              </div>
              <div className="sampleGrid">
                {intelligence.modelSamples.slice(0, 8).map((sample) => (
                  <article key={`${sample.engine}-${sample.query}`}>
                    <strong>{sample.engine}</strong><span>{sample.cluster.replaceAll('_', ' ')}</span>
                    <p>{sample.query}</p>
                    <small>Winner: {sample.mentions[0].brand} · Strength {Math.round(sample.mentions[0].recommendationStrength * 100)}% · Volatility {Math.round(sample.answerVolatility * 100)}%</small>
                    <em>{sample.evidence[0].observed}</em>
                  </article>
                ))}
              </div>
              <div className="moatBox"><h3>{ui.moat}</h3>{intelligence.moatSummary.map((item) => <p key={item}>{item}</p>)}</div>
            </div>
          )}

          {tab === 'details' && (
            <div className="detailsScreen"><h2><GitBranch size={20} /> {copy('detailsTitle')}</h2><p className="helper">{copy('showingTopProof')}</p><div className="queryGrid">{result.queries.slice(0, 6).map((query) => <article key={query.query}><h3>{query.query}</h3>{query.evidence.slice(0, 3).map((item) => <div className="miniRank" key={`${query.query}-${item.brand}`}><strong>#{item.estimatedRank} {item.brand}</strong><span>{copy('ontology')} {item.ontologyScore} · {copy('semantic')} {item.semanticScore}</span><small>{item.reasons.join(' · ')}</small><small className="proofLine">{copy('proof')}: {item.proof.slice(0, 2).join(' ')}</small></div>)}</article>)}</div></div>
          )}

          {tab === 'ontology' && (
            <div className="ontologyScreen">
              <div className="mapHeader"><div><h2><Network size={20} /> {copy('mapTitle')}</h2><p>{copy('mapSubtitle')}</p></div><div className="mapLegend"><span>{copy('influenceLegend')}</span><span>{copy('winnerLegend')}</span><span>{copy('contextLegend')}</span></div></div>
              <div className="spiderMap"><svg viewBox="0 0 100 100" role="img" aria-label={copy('keywordRelationshipMap')}><defs><radialGradient id="centerGlow"><stop offset="0%" stopColor="#828fff" stopOpacity="0.9" /><stop offset="100%" stopColor="#5e6ad2" stopOpacity="0" /></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="1.3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><circle cx="50" cy="50" r="45" className="mapRing" /><circle cx="50" cy="50" r="35" className="mapRing" /><circle cx="50" cy="50" r="25" className="mapRing" /><circle cx="50" cy="50" r="18" fill="url(#centerGlow)" />{map.links.map((link, index) => { const from = mapNodes.get(link.from); const to = mapNodes.get(link.to); if (!from || !to) return null; return <line key={`${link.from}-${link.to}-${index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={link.winner ? 'mapLink winner' : 'mapLink'} strokeWidth={0.25 + link.influence * 1.3} opacity={0.18 + link.influence * 0.62} />; })}{[map.center, ...map.nodes].map((node) => <g key={node.id} filter={node.winner || node.ring === 'center' ? 'url(#glow)' : undefined}><circle cx={node.x} cy={node.y} r={node.radius} className={`mapNode ${node.type} ${node.winner ? 'winner' : ''}`} /><text x={node.x} y={node.y + node.radius + 3.3} textAnchor="middle" className="mapLabel">{node.label.length > 24 ? `${node.label.slice(0, 24)}…` : node.label}</text></g>)}</svg></div>
              <div className="mapInsights"><article><span>{copy('centerQuery')}</span><strong>{map.center.label}</strong></article><article><span>{copy('strongestSignals')}</span>{map.strongest.map((node) => <p key={node.id}>{node.label} · {Math.round(node.influence * 100)}%</p>)}</article><article><span>{copy('whyItMatters')}</span><p>{topCompetitor ? `${topCompetitor.brand}: ${topCompetitor.score}/100` : result.recommendations[0]}</p></article></div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
