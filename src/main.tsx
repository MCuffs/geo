import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, CheckCircle2, GitBranch, Lightbulb, Network, Search, ShieldCheck } from 'lucide-react';
import { analyzeGeoRank, type GeoInput } from './lib/geo';
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
  const [brand, setBrand] = useState(SAMPLE_INPUT.brand);
  const [website, setWebsite] = useState(SAMPLE_INPUT.website);
  const [category, setCategory] = useState(SAMPLE_INPUT.category);
  const [useCases, setUseCases] = useState(SAMPLE_INPUT.useCases);
  const [competitors, setCompetitors] = useState(SAMPLE_INPUT.competitors.join('\n'));
  const [customQueries, setCustomQueries] = useState(SAMPLE_INPUT.customQueries);
  const [submitted, setSubmitted] = useState<GeoInput>(SAMPLE_INPUT);
  const [tab, setTab] = useState<Tab>('overview');

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
      <section className="hero">
        <div>
          <p className="eyebrow">GEO / AI Visibility Rank Tracker MVP</p>
          <h1>Estimate how likely AI answers are to mention your brand.</h1>
          <p className="subtitle">
            Now using an ontology graph: brand → category → ICP/use case → query intent → competitor relationships.
            Scores include proof chains so the result is not just a black-box similarity number.
          </p>
        </div>
        <div className="heroCard">
          <ShieldCheck size={28} />
          <strong>Evidence-first</strong>
          <span>Each score links back to relationship edges, source observations, and query-level proof.</span>
        </div>
      </section>

      <section className="grid">
        <form className="panel form" onSubmit={runAudit}>
          <h2><Search size={20} /> Input</h2>
          <label>Brand name<input value={brand} onChange={(event) => setBrand(event.target.value)} required /></label>
          <label>Website URL<input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" /></label>
          <label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="customer support software" required /></label>
          <label>Target use cases / ICP<textarea value={useCases} onChange={(event) => setUseCases(event.target.value)} rows={3} /></label>
          <label>Competitors, one per line<textarea value={competitors} onChange={(event) => setCompetitors(event.target.value)} rows={5} /></label>
          <label>Target GEO queries, one per line<textarea value={customQueries} onChange={(event) => setCustomQueries(event.target.value)} rows={5} /></label>
          <button type="submit">Run GEO audit</button>
        </form>

        <section className="panel results">
          <h2><BarChart3 size={20} /> Result</h2>
          <div className="scoreCard">
            <span>Your GEO score</span>
            <strong>{result.target.score}</strong>
            <small>{result.target.mentionProbability}% estimated mention probability · average rank #{result.target.averageEstimatedRank}</small>
          </div>
          <div className="tabs">
            <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
            <button type="button" className={tab === 'evidence' ? 'active' : ''} onClick={() => setTab('evidence')}>Evidence</button>
            <button type="button" className={tab === 'ontology' ? 'active' : ''} onClick={() => setTab('ontology')}>Ontology Map</button>
          </div>

          {tab === 'overview' && (
            <div>
              <h3>Competitor ranking</h3>
              <div className="rankList">
                {result.rankings.map((item, index) => (
                  <div className={item.brand === submitted.brand ? 'rank target' : 'rank'} key={item.brand}>
                    <span>#{index + 1}</span><strong>{item.brand}</strong><em>{item.score}/100</em>
                  </div>
                ))}
              </div>
              <h3>Top proof for {submitted.brand}</h3>
              <ul className="evidenceList">
                {result.target.evidence.map((item) => (
                  <li key={`${item.query}-${item.reason}`}>
                    <CheckCircle2 size={16} />
                    <div>
                      <strong>{item.query}</strong>
                      <span>{item.reason} · weight {item.weight}</span>
                      <small>{item.proof.slice(0, 2).join(' ')}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'evidence' && (
            <div>
              <h3><GitBranch size={18} /> Evidence ledger</h3>
              <p className="helper">These are the source observations and relationship edges used by the ontology scorer.</p>
              <div className="ledgerList">
                {result.evidenceLedger.slice(0, 18).map((item) => (
                  <article key={`${item.source}-${item.relationship}-${item.observed}`}>
                    <strong>{item.relationship}</strong>
                    <span>{item.observed}</span>
                    <small>{item.impact} Confidence {item.confidence}</small>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'ontology' && (
            <div>
              <h3><Network size={18} /> Keyword relationship map</h3>
              <p className="helper">Nodes are grouped by ontology type. Edges below show why a query is related to a category, ICP, brand, competitor, or missing gap.</p>
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
                    <span>{edge.relation} · strength {edge.strength.toFixed(2)}</span>
                    <small>{edge.evidence}</small>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>

      <section className="panel wide">
        <h2><Lightbulb size={20} /> Recommended actions</h2>
        <div className="actions">{result.recommendations.map((item) => <p key={item}>{item}</p>)}</div>
      </section>

      <section className="panel wide">
        <h2>Query-level proof</h2>
        <div className="queryGrid">
          {result.queries.map((query) => (
            <article key={query.query}>
              <h3>{query.query}</h3>
              {query.evidence.slice(0, 5).map((item) => (
                <div className="miniRank" key={`${query.query}-${item.brand}`}>
                  <strong>#{item.estimatedRank} {item.brand}</strong>
                  <span>ontology {item.ontologyScore} · semantic {item.semanticScore}</span>
                  <small>{item.reasons.join(' · ')}</small>
                  <small className="proofLine">Proof: {item.proof.slice(0, 2).join(' ')}</small>
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
