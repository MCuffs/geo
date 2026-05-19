import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, CheckCircle2, GitBranch, Languages, Lightbulb, Network, Search, ShieldCheck } from 'lucide-react';
import { analyzeGeoRank, type GeoInput } from './lib/geo';
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

type Tab = 'overview' | 'evidence' | 'ontology';

function parseCompetitors(value: string): string[] {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
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

  function runAudit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted({
      brand,
      website,
      category,
      useCases,
      competitors: parseCompetitors(competitors),
      customQueries,
    });
  }

  const nodeColumns = useMemo(() => {
    const columns = new Map<string, typeof result.ontology.nodes>();
    result.ontology.nodes.forEach((node) => {
      const list = columns.get(node.type) ?? [];
      list.push(node);
      columns.set(node.type, list);
    });
    return [...columns.entries()];
  }, [result.ontology.nodes]);

  return (
    <main>
      <header className="topBar" aria-label={copy('language')}>
        <div className="languageSwitcher">
          <Languages size={16} />
          <span>{copy('language')}</span>
          {(['ko', 'en'] satisfies Language[]).map((item) => (
            <button
              type="button"
              key={item}
              className={language === item ? 'active' : ''}
              aria-pressed={language === item}
              onClick={() => setLanguage(item)}
            >
              {getLanguageLabel(item)}
            </button>
          ))}
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">{copy('eyebrow')}</p>
          <h1>{copy('heroTitle')}</h1>
          <p className="subtitle">{copy('heroSubtitle')}</p>
        </div>
        <div className="heroCard">
          <ShieldCheck size={28} />
          <strong>{copy('evidenceFirst')}</strong>
          <span>{copy('heroCardText')}</span>
        </div>
      </section>

      <section className="grid">
        <form className="panel form" onSubmit={runAudit}>
          <h2><Search size={20} /> {copy('input')}</h2>
          <label>{copy('brandName')}<input value={brand} onChange={(event) => setBrand(event.target.value)} required /></label>
          <label>{copy('websiteUrl')}<input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" /></label>
          <label>{copy('category')}<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="customer support software" required /></label>
          <label>{copy('targetUseCases')}<textarea value={useCases} onChange={(event) => setUseCases(event.target.value)} rows={3} /></label>
          <label>{copy('competitors')}<textarea value={competitors} onChange={(event) => setCompetitors(event.target.value)} rows={5} /></label>
          <label>{copy('targetGeoQueries')}<textarea value={customQueries} onChange={(event) => setCustomQueries(event.target.value)} rows={5} /></label>
          <button type="submit">{copy('runAudit')}</button>
        </form>

        <section className="panel results">
          <h2><BarChart3 size={20} /> {copy('result')}</h2>
          <div className="scoreCard">
            <span>{copy('yourGeoScore')}</span>
            <strong>{result.target.score}</strong>
            <small>{result.target.mentionProbability}% {copy('estimatedMentionProbability')} · {copy('averageRank')} #{result.target.averageEstimatedRank}</small>
          </div>
          <div className="tabs">
            <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>{copy('overview')}</button>
            <button type="button" className={tab === 'evidence' ? 'active' : ''} onClick={() => setTab('evidence')}>{copy('evidence')}</button>
            <button type="button" className={tab === 'ontology' ? 'active' : ''} onClick={() => setTab('ontology')}>{copy('ontologyMap')}</button>
          </div>

          {tab === 'overview' && (
            <div>
              <h3>{copy('competitorRanking')}</h3>
              <div className="rankList">
                {result.rankings.map((item, index) => (
                  <div className={item.brand === submitted.brand ? 'rank target' : 'rank'} key={item.brand}>
                    <span>#{index + 1}</span><strong>{item.brand}</strong><em>{item.score}/100</em>
                  </div>
                ))}
              </div>
              <h3>{copy('topProofFor')} {submitted.brand}</h3>
              <ul className="evidenceList">
                {result.target.evidence.map((item) => (
                  <li key={`${item.query}-${item.reason}`}>
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>{item.query}</strong>
                      <span>{item.reason} · {copy('weight')} {item.weight}</span>
                      <small>{item.proof.slice(0, 2).join(' ')}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'evidence' && (
            <div>
              <h3><GitBranch size={18} /> {copy('evidenceLedger')}</h3>
              <p className="helper">{copy('evidenceLedgerHelper')}</p>
              <div className="ledgerList">
                {result.evidenceLedger.slice(0, 18).map((item) => (
                  <article key={`${item.source}-${item.relationship}-${item.observed}`}>
                    <strong>{item.relationship}</strong>
                    <span>{item.observed}</span>
                    <small>{item.impact} {copy('confidence')} {item.confidence}</small>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'ontology' && (
            <div>
              <h3><Network size={18} /> {copy('keywordRelationshipMap')}</h3>
              <p className="helper">{copy('keywordRelationshipMapHelper')}</p>
              <div className="ontologyColumns">
                {nodeColumns.map(([type, nodes]) => (
                  <section key={type} className="nodeColumn">
                    <h4>{type}</h4>
                    {nodes.map((node) => <span className={`nodePill ${node.type}`} key={node.id}>{node.label}</span>)}
                  </section>
                ))}
              </div>
              <div className="edgeList">
                {result.ontology.edges.slice(0, 28).map((edge) => (
                  <article key={`${edge.from}-${edge.to}-${edge.relation}`}>
                    <strong>{edge.from} → {edge.to}</strong>
                    <span>{edge.relation} · {copy('strength')} {edge.strength.toFixed(2)}</span>
                    <small>{edge.evidence}</small>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>

      <section className="panel wide">
        <h2><Lightbulb size={20} /> {copy('recommendedActions')}</h2>
        <div className="actions">{result.recommendations.map((item) => <p key={item}>{item}</p>)}</div>
      </section>

      <section className="panel wide">
        <h2>{copy('queryLevelProof')}</h2>
        <div className="queryGrid">
          {result.queries.map((query) => (
            <article key={query.query}>
              <h3>{query.query}</h3>
              {query.evidence.slice(0, 5).map((item) => (
                <div className="miniRank" key={`${query.query}-${item.brand}`}>
                  <strong>#{item.estimatedRank} {item.brand}</strong>
                  <span>{copy('ontology')} {item.ontologyScore} · {copy('semantic')} {item.semanticScore}</span>
                  <small>{item.reasons.join(' · ')}</small>
                  <small className="proofLine">{copy('proof')}: {item.proof.slice(0, 2).join(' ')}</small>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="methodology">{result.methodology.map((item) => <p key={item}>{item}</p>)}</section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
