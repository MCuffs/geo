import { analyzeGeoRank, generateQueries, normalizeBrand, type GeoInput } from './geo';

export type IntentCluster = 'best_tool' | 'alternative' | 'comparison' | 'pricing' | 'use_case' | 'problem_solution' | 'integration';
export type SamplingEngine = 'ChatGPT' | 'Claude' | 'Gemini' | 'Perplexity';

export type QueryMutation = {
  query: string;
  seedQuery: string;
  cluster: IntentCluster;
  persona: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedEvidence: string[];
};

export type SimulatedEvidence = {
  source: string;
  observed: string;
  relationship: string;
  confidence: number;
};

export type BrandMention = {
  brand: string;
  rank: number;
  recommendationStrength: number;
  sentiment: 'positive' | 'neutral' | 'negative';
};

export type ModelSample = {
  engine: SamplingEngine;
  query: string;
  cluster: IntentCluster;
  mentions: BrandMention[];
  answerVolatility: number;
  evidence: SimulatedEvidence[];
};

export type ClusterSummary = {
  cluster: IntentCluster;
  queryCount: number;
  mentionRate: number;
  averageRank: number;
  leadingBrand: string;
  risk: 'low' | 'medium' | 'high';
  recommendedAction: string;
};

export type EvidenceGraph = {
  nodes: Array<{ id: string; label: string; type: 'brand' | 'query' | 'cluster' | 'engine' | 'source' }>;
  edges: Array<{ from: string; to: string; relation: string; confidence: number; proof: string[] }>;
};

export type AdvancedGeoIntelligence = {
  mutations: QueryMutation[];
  modelSamples: ModelSample[];
  clusterSummaries: ClusterSummary[];
  evidenceGraph: EvidenceGraph;
  moatSummary: string[];
};

const CLUSTER_TEMPLATES: Record<IntentCluster, string[]> = {
  best_tool: ['best {category} for {useCase}', 'top rated {category} for {useCase}', 'which {category} should {useCase} choose'],
  alternative: ['{competitor} alternatives for {useCase}', 'alternatives to {competitor} for {category}', 'replace {competitor} with a better {category}'],
  comparison: ['{brand} vs {competitor}', 'compare {brand} and {competitor} for {useCase}', '{brand} or {competitor} for {category}'],
  pricing: ['affordable {category} for {useCase}', 'cheap {category} alternatives to {competitor}', 'best value {category} for startups'],
  use_case: ['{category} for {useCase}', 'how should {useCase} choose {category}', '{useCase} workflow using {category}'],
  problem_solution: ['how to solve {pain} with {category}', '{pain} tools for {useCase}', 'reduce {pain} for {useCase}'],
  integration: ['{category} with {integration} integration', '{brand} integrations for {useCase}', '{competitor} alternatives with {integration}'],
};

const PERSONAS = ['SaaS founder', 'growth marketer', 'agency strategist', 'support lead'];
const PAINS = ['support backlog', 'high support cost', 'slow response time'];
const INTEGRATIONS = ['Slack', 'Zendesk', 'HubSpot'];
const ENGINES: SamplingEngine[] = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];

function splitUseCases(useCases: string): string[] {
  const parsed = useCases.split(/[\n,]/g).map((item) => item.trim()).filter(Boolean);
  return parsed.length ? parsed : ['buyers'];
}

function parseSeeds(input: GeoInput): string[] {
  const manual = input.customQueries.split('\n').map((query) => query.trim()).filter(Boolean);
  return (manual.length ? manual : generateQueries(input)).slice(0, 8);
}

function uniqueByQuery(items: QueryMutation[]): QueryMutation[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeBrand(item.query);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function riskForCluster(cluster: IntentCluster): 'low' | 'medium' | 'high' {
  if (cluster === 'alternative' || cluster === 'comparison') return 'high';
  if (cluster === 'pricing' || cluster === 'problem_solution') return 'medium';
  return 'low';
}

function expectedEvidenceForCluster(cluster: IntentCluster): string[] {
  if (cluster === 'comparison') return ['comparison page', 'third-party review', 'feature table'];
  if (cluster === 'alternative') return ['alternative page', 'G2/Capterra mention', 'migration proof'];
  if (cluster === 'pricing') return ['pricing page', 'value proposition', 'startup plan'];
  if (cluster === 'integration') return ['integration docs', 'marketplace listing', 'schema markup'];
  return ['category page', 'use-case page', 'external citation'];
}

export function generateQueryMutations(input: GeoInput): QueryMutation[] {
  const seeds = parseSeeds(input);
  const useCases = splitUseCases(input.useCases);
  const competitors = input.competitors.length ? input.competitors : ['leading competitor'];
  const mutations = seeds.flatMap((seedQuery, seedIndex) =>
    (Object.keys(CLUSTER_TEMPLATES) as IntentCluster[]).flatMap((cluster) =>
      CLUSTER_TEMPLATES[cluster].slice(0, 2).map((template, templateIndex) => {
        const competitor = competitors[(seedIndex + templateIndex) % competitors.length];
        const useCase = useCases[(seedIndex + templateIndex) % useCases.length];
        const query = template
          .replaceAll('{brand}', input.brand)
          .replaceAll('{competitor}', competitor)
          .replaceAll('{category}', input.category || 'software')
          .replaceAll('{useCase}', useCase)
          .replaceAll('{pain}', PAINS[(seedIndex + templateIndex) % PAINS.length])
          .replaceAll('{integration}', INTEGRATIONS[(seedIndex + templateIndex) % INTEGRATIONS.length]);
        return {
          query,
          seedQuery,
          cluster,
          persona: PERSONAS[(seedIndex + templateIndex) % PERSONAS.length],
          riskLevel: riskForCluster(cluster),
          expectedEvidence: expectedEvidenceForCluster(cluster),
        };
      }),
    ),
  );
  return uniqueByQuery(mutations).slice(0, 48);
}

function hashScore(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  return hash / 9973;
}

function simulatedMentions(input: GeoInput, query: QueryMutation, engine: SamplingEngine): BrandMention[] {
  const result = analyzeGeoRank({ ...input, customQueries: query.query });
  const engineBias = { ChatGPT: 0.04, Claude: 0.02, Gemini: -0.01, Perplexity: 0.07 }[engine];
  return result.rankings
    .map((ranking) => {
      const queryBias = hashScore(`${engine}:${query.query}:${ranking.brand}`) * 0.12;
      const competitorBoost = query.query.toLowerCase().includes(ranking.brand.toLowerCase()) ? 0.18 : 0;
      const strength = Math.max(0.05, Math.min(0.98, ranking.score / 100 + engineBias + queryBias + competitorBoost));
      return {
        brand: ranking.brand,
        rank: ranking.averageEstimatedRank,
        recommendationStrength: Number(strength.toFixed(2)),
        sentiment: strength > 0.62 ? 'positive' : strength < 0.28 ? 'negative' : 'neutral',
      } satisfies BrandMention;
    })
    .sort((a, b) => b.recommendationStrength - a.recommendationStrength)
    .map((mention, index) => ({ ...mention, rank: index + 1 }));
}

function evidenceFor(input: GeoInput, mutation: QueryMutation, engine: SamplingEngine, mentions: BrandMention[]): SimulatedEvidence[] {
  const winner = mentions[0];
  return [
    {
      source: `${engine} simulated answer sample`,
      observed: `${winner.brand} appears as #${winner.rank} for “${mutation.query}” in the ${mutation.cluster} cluster.`,
      relationship: `query_cluster:${mutation.cluster} -> brand:${winner.brand}`,
      confidence: Number(Math.max(0.4, winner.recommendationStrength).toFixed(2)),
    },
    {
      source: `Required evidence: ${mutation.expectedEvidence[0]}`,
      observed: `${mutation.expectedEvidence.join(', ')} are expected proof assets for this intent.`,
      relationship: `evidence_requirement -> query:${mutation.query}`,
      confidence: 0.72,
    },
    {
      source: `${input.category} ontology context`,
      observed: `Category and ICP context connect ${input.brand} and competitors to buyer-intent variants.`,
      relationship: `category:${input.category} -> cluster:${mutation.cluster}`,
      confidence: 0.68,
    },
  ];
}

export function simulateAnswerSampling(input: GeoInput, mutations = generateQueryMutations(input)): ModelSample[] {
  return mutations.slice(0, 24).flatMap((mutation) =>
    ENGINES.map((engine) => {
      const mentions = simulatedMentions(input, mutation, engine);
      return {
        engine,
        query: mutation.query,
        cluster: mutation.cluster,
        mentions,
        answerVolatility: Number((0.12 + hashScore(`${mutation.query}:${engine}`) * 0.38).toFixed(2)),
        evidence: evidenceFor(input, mutation, engine, mentions),
      } satisfies ModelSample;
    }),
  );
}

function summarizeClusters(input: GeoInput, mutations: QueryMutation[], samples: ModelSample[]): ClusterSummary[] {
  return (Object.keys(CLUSTER_TEMPLATES) as IntentCluster[])
    .map((cluster) => {
      const clusterSamples = samples.filter((sample) => sample.cluster === cluster);
      const targetMentions = clusterSamples.map((sample) => sample.mentions.find((mention) => mention.brand === input.brand)).filter((mention): mention is BrandMention => Boolean(mention));
      const winners = clusterSamples.map((sample) => sample.mentions[0]?.brand).filter(Boolean);
      const leadingBrand = winners.sort((a, b) => winners.filter((item) => item === b).length - winners.filter((item) => item === a).length)[0] ?? input.brand;
      const mentionRate = targetMentions.filter((mention) => mention.rank <= 3).length / Math.max(1, clusterSamples.length);
      const averageRank = targetMentions.reduce((sum, mention) => sum + mention.rank, 0) / Math.max(1, targetMentions.length);
      return {
        cluster,
        queryCount: mutations.filter((mutation) => mutation.cluster === cluster).length,
        mentionRate: Number(mentionRate.toFixed(2)),
        averageRank: Number(averageRank.toFixed(1)),
        leadingBrand,
        risk: riskForCluster(cluster),
        recommendedAction: `Build ${expectedEvidenceForCluster(cluster).join(' + ')} for ${cluster.replace('_', ' ')} queries where ${leadingBrand} currently leads.`,
      } satisfies ClusterSummary;
    })
    .filter((summary) => summary.queryCount > 0);
}

function buildEvidenceGraph(input: GeoInput, mutations: QueryMutation[], samples: ModelSample[]): EvidenceGraph {
  const nodes = new Map<string, EvidenceGraph['nodes'][number]>();
  const edges: EvidenceGraph['edges'] = [];
  const addNode = (node: EvidenceGraph['nodes'][number]) => nodes.set(node.id, node);
  [input.brand, ...input.competitors].forEach((brand) => addNode({ id: `brand:${brand}`, label: brand, type: 'brand' }));
  ENGINES.forEach((engine) => addNode({ id: `engine:${engine}`, label: engine, type: 'engine' }));
  mutations.slice(0, 16).forEach((mutation) => {
    addNode({ id: `query:${mutation.query}`, label: mutation.query, type: 'query' });
    addNode({ id: `cluster:${mutation.cluster}`, label: mutation.cluster, type: 'cluster' });
  });
  samples.slice(0, 48).forEach((sample) => {
    const winner = sample.mentions[0];
    sample.evidence.forEach((evidence, index) => addNode({ id: `source:${sample.engine}:${sample.query}:${index}`, label: evidence.source, type: 'source' }));
    edges.push({ from: `engine:${sample.engine}`, to: `query:${sample.query}`, relation: 'sampled_answer', confidence: 0.8, proof: [`${sample.engine} sampled the mutated query “${sample.query}”.`] });
    edges.push({ from: `query:${sample.query}`, to: `brand:${winner.brand}`, relation: 'recommends', confidence: winner.recommendationStrength, proof: sample.evidence.map((evidence) => evidence.observed) });
    edges.push({ from: `query:${sample.query}`, to: `cluster:${sample.cluster}`, relation: 'belongs_to_intent_cluster', confidence: 0.9, proof: [`Mutation engine classified this query as ${sample.cluster}.`] });
  });
  return { nodes: [...nodes.values()], edges };
}

export function buildAdvancedGeoIntelligence(input: GeoInput): AdvancedGeoIntelligence {
  const mutations = generateQueryMutations(input);
  const modelSamples = simulateAnswerSampling(input, mutations);
  return {
    mutations,
    modelSamples,
    clusterSummaries: summarizeClusters(input, mutations, modelSamples),
    evidenceGraph: buildEvidenceGraph(input, mutations, modelSamples),
    moatSummary: [
      'Sampling architecture: query variants are evaluated across ChatGPT, Claude, Gemini, and Perplexity-style engines instead of a single keyword score.',
      'Intent-cluster dataset: every seed query expands into best-tool, alternative, comparison, pricing, use-case, problem-solution, and integration clusters.',
      'Evidence graph: each simulated answer connects engine, query, cluster, brand, required proof asset, and confidence so rankings are auditable.',
      'Production-ready path: replace deterministic samples with live API calls while keeping the same evidence contract and UI.',
    ],
  };
}
