export type GeoInput = {
  brand: string;
  website: string;
  category: string;
  useCases: string;
  competitors: string[];
  customQueries: string;
};

export type Evidence = {
  query: string;
  reason: string;
  weight: number;
  proof: string[];
};

export type BrandScore = {
  brand: string;
  score: number;
  mentionProbability: number;
  averageEstimatedRank: number;
  evidence: Evidence[];
};

export type OntologyNodeType = 'brand' | 'competitor' | 'category' | 'intent' | 'query' | 'attribute' | 'gap';

export type OntologyNode = {
  id: string;
  label: string;
  type: OntologyNodeType;
  weight: number;
};

export type OntologyEdge = {
  from: string;
  to: string;
  relation: 'positions_as' | 'serves' | 'competes_with' | 'query_mentions' | 'query_implies' | 'has_attribute' | 'missing_relation';
  strength: number;
  evidence: string;
};

export type Ontology = {
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  gaps: string[];
};

export type EvidenceLedgerItem = {
  source: string;
  observed: string;
  relationship: string;
  impact: string;
  confidence: number;
};

export type QueryEvidence = {
  query: string;
  evidence: Array<{
    brand: string;
    semanticScore: number;
    ontologyScore: number;
    estimatedRank: number;
    reasons: string[];
    proof: string[];
  }>;
};

export type OntologyMapNode = {
  id: string;
  label: string;
  type: OntologyNodeType | 'queryCenter';
  x: number;
  y: number;
  radius: number;
  influence: number;
  score?: number;
  winner?: boolean;
  ring: 'center' | 'entity' | 'context' | 'signal';
};

export type OntologyMapLink = {
  from: string;
  to: string;
  influence: number;
  relation: string;
  winner?: boolean;
};

export type OntologyMap = {
  center: OntologyMapNode;
  nodes: OntologyMapNode[];
  links: OntologyMapLink[];
  strongest: OntologyMapNode[];
};

export type GeoResult = {
  target: BrandScore;
  rankings: BrandScore[];
  queries: QueryEvidence[];
  ontology: Ontology;
  evidenceLedger: EvidenceLedgerItem[];
  recommendations: string[];
  methodology: string[];
};

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'best', 'for', 'from', 'in', 'is', 'of', 'on', 'or',
  'the', 'to', 'tool', 'tools', 'top', 'vs', 'with', 'software', 'platform', 'app',
]);

const BUYER_INTENT_PATTERNS = [
  'best {category} for {useCase}',
  'top {category} for {useCase}',
  'affordable {category} for {useCase}',
  '{category} alternatives for {useCase}',
  'which {category} should {useCase} use',
  'compare {category} tools for {useCase}',
];

const ATTRIBUTE_PATTERNS = ['affordable', 'enterprise', 'omnichannel', 'live chat', 'automation', 'founder', 'startup', 'small saas', 'support'];

export function normalizeBrand(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/https?:\/\//g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function id(type: OntologyNodeType, label: string): string {
  return `${type}:${label}`;
}

function tokenize(value: string): string[] {
  return normalizeBrand(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function splitUseCases(useCases: string): string[] {
  const parsed = useCases
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ['buyers'];
}

function parseCustomQueries(customQueries: string): string[] {
  return customQueries
    .split('\n')
    .map((query) => query.trim())
    .filter(Boolean);
}

export function generateQueries(input: GeoInput): string[] {
  const category = input.category.trim() || 'software';
  const useCases = splitUseCases(input.useCases);
  const generated = useCases.flatMap((useCase) =>
    BUYER_INTENT_PATTERNS.map((pattern) =>
      pattern.replace('{category}', category).replace('{useCase}', useCase),
    ),
  );

  const competitorQueries = input.competitors
    .map((competitor) => competitor.trim())
    .filter(Boolean)
    .flatMap((competitor) => [
      `${competitor} alternatives for ${category}`,
      `${input.brand} vs ${competitor}`,
    ]);

  return unique([...parseCustomQueries(input.customQueries), ...generated, ...competitorQueries]).slice(0, 40);
}

function addNode(nodes: Map<string, OntologyNode>, node: OntologyNode) {
  const existing = nodes.get(node.id);
  nodes.set(node.id, existing ? { ...existing, weight: Math.max(existing.weight, node.weight) } : node);
}

function addEdge(edges: OntologyEdge[], edge: OntologyEdge) {
  const existing = edges.find((item) => item.from === edge.from && item.to === edge.to && item.relation === edge.relation);
  if (existing) existing.strength = Math.max(existing.strength, edge.strength);
  else edges.push(edge);
}

function containsTokenPhrase(haystack: string, phrase: string): boolean {
  return normalizeBrand(haystack).includes(normalizeBrand(phrase));
}

export function generateOntology(input: GeoInput): Ontology {
  const nodes = new Map<string, OntologyNode>();
  const edges: OntologyEdge[] = [];
  const brand = input.brand.trim();
  const category = input.category.trim() || 'software';
  const useCases = splitUseCases(input.useCases);
  const queries = parseCustomQueries(input.customQueries).length > 0 ? parseCustomQueries(input.customQueries) : generateQueries(input);
  const competitors = input.competitors.map((item) => item.trim()).filter(Boolean);

  addNode(nodes, { id: id('brand', brand), label: brand, type: 'brand', weight: 1 });
  addNode(nodes, { id: id('category', category), label: category, type: 'category', weight: 0.9 });
  addEdge(edges, { from: id('brand', brand), to: id('category', category), relation: 'positions_as', strength: 0.9, evidence: `User submitted category “${category}” for ${brand}.` });

  useCases.forEach((useCase) => {
    addNode(nodes, { id: id('intent', useCase), label: useCase, type: 'intent', weight: 0.75 });
    addEdge(edges, { from: id('brand', brand), to: id('intent', useCase), relation: 'serves', strength: 0.75, evidence: `User submitted target use case/ICP “${useCase}”.` });
  });

  competitors.forEach((competitor) => {
    addNode(nodes, { id: id('competitor', competitor), label: competitor, type: 'competitor', weight: 0.8 });
    addEdge(edges, { from: id('brand', brand), to: id('competitor', competitor), relation: 'competes_with', strength: 0.7, evidence: `${competitor} was submitted as a competitor.` });
    addEdge(edges, { from: id('competitor', competitor), to: id('category', category), relation: 'positions_as', strength: 0.65, evidence: `${competitor} inherits the same category context for share-of-voice comparison.` });
  });

  queries.forEach((query) => {
    addNode(nodes, { id: id('query', query), label: query, type: 'query', weight: 0.7 });
    const queryTokens = tokenize(query);
    const categoryOverlap = tokenize(category).filter((token) => queryTokens.includes(token));
    if (categoryOverlap.length > 0) {
      addEdge(edges, { from: id('query', query), to: id('category', category), relation: 'query_mentions', strength: categoryOverlap.length / Math.max(1, tokenize(category).length), evidence: `Query “${query}” contains category tokens: ${categoryOverlap.join(', ')}.` });
    }
    useCases.forEach((useCase) => {
      const overlap = tokenize(useCase).filter((token) => queryTokens.includes(token));
      if (overlap.length > 0) {
        addEdge(edges, { from: id('query', query), to: id('intent', useCase), relation: 'query_implies', strength: overlap.length / Math.max(1, tokenize(useCase).length), evidence: `Query overlaps ICP/use-case tokens: ${overlap.join(', ')}.` });
      }
    });
    [brand, ...competitors].forEach((entity) => {
      if (containsTokenPhrase(query, entity)) {
        const entityType = entity === brand ? 'brand' : 'competitor';
        addEdge(edges, { from: id('query', query), to: id(entityType, entity), relation: 'query_mentions', strength: 1, evidence: `Query explicitly mentions “${entity}”.` });
      }
    });
    ATTRIBUTE_PATTERNS.forEach((attribute) => {
      if (containsTokenPhrase(query, attribute) || containsTokenPhrase(input.useCases, attribute) || containsTokenPhrase(category, attribute)) {
        addNode(nodes, { id: id('attribute', attribute), label: attribute, type: 'attribute', weight: 0.55 });
        addEdge(edges, { from: id('query', query), to: id('attribute', attribute), relation: 'has_attribute', strength: containsTokenPhrase(query, attribute) ? 0.8 : 0.45, evidence: `Attribute “${attribute}” appears in query, ICP, or category context.` });
      }
    });
  });

  const gaps = queries
    .filter((query) => !containsTokenPhrase(query, brand))
    .slice(0, 6)
    .map((query) => `No direct ${brand} entity mention in query “${query}”; needs supporting content/citations to bridge this intent.`);

  gaps.forEach((gap, index) => {
    const gapId = id('gap', `Gap ${index + 1}`);
    addNode(nodes, { id: gapId, label: `Gap ${index + 1}`, type: 'gap', weight: 0.4 });
    addEdge(edges, { from: id('brand', brand), to: gapId, relation: 'missing_relation', strength: 0.5, evidence: gap });
  });

  return { nodes: [...nodes.values()], edges, gaps };
}

function brandContext(input: GeoInput, brand: string): string {
  const isTarget = brand === input.brand;
  const domainTokens = input.website.replace(/^https?:\/\//, '').replace(/\..*$/, ' ');
  if (isTarget) return [brand, domainTokens, input.category, input.useCases].join(' ');
  return [brand, input.category].join(' ');
}

function jaccardScore(a: string[], b: string[]): number {
  const aSet = new Set(a);
  const bSet = new Set(b);
  const intersection = [...aSet].filter((token) => bSet.has(token)).length;
  const union = new Set([...a, ...b]).size || 1;
  return intersection / union;
}

function lexicalIntentBoost(query: string, brand: string): number {
  const queryTokens = tokenize(query);
  const brandTokens = tokenize(brand);
  const exactBrandMention = normalizeBrand(query).includes(normalizeBrand(brand));
  const tokenOverlap = brandTokens.filter((token) => queryTokens.includes(token)).length;
  return (exactBrandMention ? 0.35 : 0) + tokenOverlap * 0.12;
}

function ontologyScoreForBrand(ontology: Ontology, input: GeoInput, brand: string, query: string): { score: number; proof: string[] } {
  const entityType = brand === input.brand ? 'brand' : 'competitor';
  const entityId = id(entityType, brand);
  const queryId = id('query', query);
  const categoryId = id('category', input.category.trim() || 'software');
  const directEdges = ontology.edges.filter((edge) => edge.from === queryId && edge.to === entityId);
  const categoryEdges = ontology.edges.filter((edge) => edge.from === queryId && edge.to === categoryId);
  const entityCategoryEdges = ontology.edges.filter((edge) => edge.from === entityId && edge.to === categoryId);
  const intentEdges = ontology.edges.filter((edge) => edge.from === queryId && edge.to.startsWith('intent:'));
  const entityIntentEdges = ontology.edges.filter((edge) => edge.from === entityId && edge.to.startsWith('intent:'));

  const score = Math.min(1,
    directEdges.reduce((sum, edge) => sum + edge.strength * 0.45, 0) +
    Math.min(categoryEdges.length, entityCategoryEdges.length) * 0.2 +
    Math.min(intentEdges.length, entityIntentEdges.length) * 0.22,
  );

  const proof = [
    ...directEdges.map((edge) => edge.evidence),
    ...categoryEdges.slice(0, 1).map((edge) => `${edge.evidence} ${brand} is connected to the same category.`),
    ...intentEdges.slice(0, 2).map((edge) => `${edge.evidence} ${brand === input.brand ? 'Target brand' : 'Competitor'} has matching ICP/use-case edges when available.`),
  ];
  if (proof.length === 0) proof.push(`No strong ontology path found from query “${query}” to ${brand}; score relies on lexical fallback only.`);
  return { score, proof };
}

function scoreBrandForQuery(input: GeoInput, graph: Ontology, brand: string, query: string): { score: number; semanticScore: number; ontologyScore: number; reasons: string[]; proof: string[] } {
  const contextTokens = tokenize(brandContext(input, brand));
  const queryTokens = tokenize(query);
  const semanticFit = jaccardScore(contextTokens, queryTokens);
  const intentBoost = lexicalIntentBoost(query, brand);
  const categoryBoost = jaccardScore(tokenize(input.category), queryTokens) * 0.25;
  const ontologyPath = ontologyScoreForBrand(graph, input, brand, query);
  const score = Math.min(1, semanticFit * 0.65 + ontologyPath.score * 0.75 + intentBoost + categoryBoost);

  const reasons = [
    `Ontology path: ${(ontologyPath.score * 100).toFixed(0)}% relationship strength from query to entity/category/intent graph`,
    `Semantic fallback: ${(semanticFit * 100).toFixed(0)}% token overlap with query intent`,
    `Category fit: ${(categoryBoost * 100).toFixed(0)} weighted category alignment`,
  ];
  if (intentBoost > 0) reasons.push(`Direct/alias signal: ${(intentBoost * 100).toFixed(0)} boost from query wording`);
  if (brand === input.brand) reasons.push('Target brand evidence uses submitted website, category, ICP/use-case, and ontology edges');
  return { score, semanticScore: semanticFit, ontologyScore: ontologyPath.score, reasons, proof: ontologyPath.proof };
}

function toProbability(score: number): number {
  return Math.round(Math.max(2, Math.min(98, 8 + score * 90)));
}

function average(numbers: number[]): number {
  return numbers.reduce((sum, value) => sum + value, 0) / (numbers.length || 1);
}

function buildEvidenceLedger(ontology: Ontology): EvidenceLedgerItem[] {
  return ontology.edges.map((edge) => ({
    source: edge.from,
    observed: edge.evidence,
    relationship: `${edge.relation}: ${edge.from} → ${edge.to}`,
    impact: `Strength ${(edge.strength * 100).toFixed(0)} contributes to ontology path scoring and rank confidence.`,
    confidence: Number(edge.strength.toFixed(2)),
  }));
}

export function analyzeGeoRank(input: GeoInput): GeoResult {
  const brands = unique([input.brand.trim(), ...input.competitors.map((item) => item.trim()).filter(Boolean)]).filter(Boolean);
  const userQueries = parseCustomQueries(input.customQueries);
  const queries = userQueries.length > 0 ? userQueries : generateQueries(input);
  const ontology = generateOntology(input);
  const perBrand = new Map<string, { scores: number[]; ranks: number[]; evidence: Evidence[] }>();
  brands.forEach((brand) => perBrand.set(brand, { scores: [], ranks: [], evidence: [] }));

  const queryEvidence: QueryEvidence[] = queries.map((query) => {
    const scored = brands
      .map((brand) => ({ brand, ...scoreBrandForQuery(input, ontology, brand, query) }))
      .sort((a, b) => b.score - a.score);

    scored.forEach((item, index) => {
      const bucket = perBrand.get(item.brand)!;
      bucket.scores.push(item.score);
      bucket.ranks.push(index + 1);
      bucket.evidence.push({ query, reason: item.reasons[0], weight: Number(item.score.toFixed(3)), proof: item.proof });
    });

    return {
      query,
      evidence: scored.map((item, index) => ({
        brand: item.brand,
        semanticScore: Number(item.semanticScore.toFixed(3)),
        ontologyScore: Number(item.ontologyScore.toFixed(3)),
        estimatedRank: index + 1,
        reasons: item.reasons,
        proof: item.proof,
      })),
    };
  });

  const rankings = brands
    .map((brand) => {
      const bucket = perBrand.get(brand)!;
      const rawScore = average(bucket.scores);
      return {
        brand,
        score: Math.round(rawScore * 100),
        mentionProbability: toProbability(rawScore),
        averageEstimatedRank: Number(average(bucket.ranks).toFixed(1)),
        evidence: bucket.evidence.sort((a, b) => b.weight - a.weight).slice(0, 6),
      } satisfies BrandScore;
    })
    .sort((a, b) => b.score - a.score || a.averageEstimatedRank - b.averageEstimatedRank);

  const target = rankings.find((item) => item.brand === input.brand.trim()) ?? rankings[0];
  const topCompetitor = rankings.find((item) => item.brand !== target.brand);
  const recommendations = [
    `Create pages that explicitly connect “${input.brand}” to weak query intents around “${input.category}”.`,
    'Add comparison pages against competitors that have stronger ontology paths for buyer-intent queries.',
    'Add structured homepage sections for category, ICP, use cases, pricing, alternatives, and integrations so retrieval systems can build stronger entity relationships.',
  ];
  if (ontology.gaps.length > 0) recommendations.unshift(ontology.gaps[0]);
  if (topCompetitor && topCompetitor.score > target.score) recommendations.unshift(`${topCompetitor.brand} currently has stronger estimated GEO visibility; close the gap by creating evidence sources for the query relations where it wins.`);

  return {
    target,
    rankings,
    queries: queryEvidence,
    ontology,
    evidenceLedger: buildEvidenceLedger(ontology),
    recommendations,
    methodology: [
      'This MVP now builds an ontology graph from brand, category, ICP/use cases, competitors, query intents, and attributes before scoring.',
      'Rank scores combine ontology path strength, direct entity mention signals, semantic fallback, and category alignment. Each query includes proof strings showing which relationship edges contributed.',
      'A production version should replace submitted-context evidence with live LLM sampling, web retrieval, citation extraction, and third-party source authority scoring.',
    ],
  };
}

function polarPoint(angle: number, radius: number): { x: number; y: number } {
  return {
    x: Number((50 + Math.cos(angle) * radius).toFixed(2)),
    y: Number((50 + Math.sin(angle) * radius).toFixed(2)),
  };
}

function ringForNode(type: OntologyNodeType): 'entity' | 'context' | 'signal' {
  if (type === 'brand' || type === 'competitor') return 'entity';
  if (type === 'category' || type === 'intent') return 'context';
  return 'signal';
}

function radiusForRing(ring: 'entity' | 'context' | 'signal'): number {
  if (ring === 'entity') return 26;
  if (ring === 'context') return 35;
  return 43;
}

export function buildOntologyMap(result: GeoResult, centerQuery?: string): OntologyMap {
  const query = centerQuery || result.queries[0]?.query || 'Target query';
  const center: OntologyMapNode = {
    id: `queryCenter:${query}`,
    label: query,
    type: 'queryCenter',
    x: 50,
    y: 50,
    radius: 11,
    influence: 1,
    ring: 'center',
  };

  const selectedQuery = result.queries.find((item) => item.query === query) ?? result.queries[0];
  const entityNodes: OntologyMapNode[] = (selectedQuery?.evidence ?? result.rankings.map((rank) => ({ brand: rank.brand, ontologyScore: rank.score / 100, semanticScore: rank.score / 100, estimatedRank: rank.averageEstimatedRank, reasons: [], proof: [] })))
    .slice(0, 6)
    .map((item, index, list) => {
      const rank = result.rankings.find((ranking) => ranking.brand === item.brand);
      const isWinner = index === 0;
      const point = polarPoint(-Math.PI / 2 + (Math.PI * 2 * index) / Math.max(1, list.length), radiusForRing('entity'));
      const type: OntologyNodeType = item.brand === result.target.brand ? 'brand' : 'competitor';
      const influence = Number(Math.max(item.ontologyScore, (rank?.score ?? 0) / 100).toFixed(2));
      return { id: `${type}:${item.brand}`, label: item.brand, type, ...point, radius: isWinner ? 8 : 6, influence, score: rank?.score, winner: isWinner, ring: 'entity' };
    });

  const relatedEdges = result.ontology.edges.filter((edge) => edge.from === `query:${query}` || edge.to === `query:${query}`);
  const contextSource = relatedEdges.length > 0 ? relatedEdges : result.ontology.edges.filter((edge) => edge.relation !== 'competes_with');
  const contextNodes: OntologyMapNode[] = contextSource
    .map((edge) => [edge.from, edge.to]).flat()
    .filter((nodeId) => !nodeId.startsWith('query:'))
    .map((nodeId) => result.ontology.nodes.find((node) => node.id === nodeId))
    .filter((node): node is OntologyNode => Boolean(node))
    .filter((node, index, list) => list.findIndex((item) => item.id === node.id) === index)
    .slice(0, 10)
    .map((node, index, list) => {
      const ring = ringForNode(node.type);
      const baseAngle = Math.PI / 7;
      const point = polarPoint(baseAngle + (Math.PI * 2 * index) / Math.max(1, list.length), radiusForRing(ring));
      const edge = contextSource.find((item) => item.from === node.id || item.to === node.id);
      return { id: node.id, label: node.label, type: node.type, ...point, radius: 4 + node.weight * 4, influence: Number((edge?.strength ?? node.weight).toFixed(2)), ring };
    });

  const nodeMap = new Map<string, OntologyMapNode>();
  [...entityNodes, ...contextNodes].forEach((node) => nodeMap.set(node.id, node));
  const nodes = [...nodeMap.values()].map((node, index, list) => {
    if (list.findIndex((other) => Math.abs(other.x - node.x) < 2 && Math.abs(other.y - node.y) < 2) !== index) {
      return { ...node, x: Math.min(96, node.x + 4), y: Math.min(96, node.y + 4) };
    }
    return node;
  });

  const links: OntologyMapLink[] = [
    ...nodes.map((node) => ({ from: center.id, to: node.id, influence: node.influence, relation: node.ring === 'entity' ? 'AI answer competition' : 'intent influence', winner: node.winner })),
    ...result.ontology.edges
      .filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to))
      .slice(0, 18)
      .map((edge) => ({ from: edge.from, to: edge.to, influence: Number(edge.strength.toFixed(2)), relation: edge.relation })),
  ];

  return {
    center,
    nodes,
    links,
    strongest: [...nodes].sort((a, b) => b.influence - a.influence).slice(0, 5),
  };
}
