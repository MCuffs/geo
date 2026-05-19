import { describe, expect, it } from 'vitest';
import type { GeoInput } from '../lib/geo';
import { buildAdvancedGeoIntelligence } from '../lib/advanced';

const input: GeoInput = {
  brand: 'AcmeSupport',
  website: 'https://acmesupport.example',
  category: 'customer support software',
  useCases: 'small SaaS, founder-led support, indie hackers',
  competitors: ['Intercom', 'Zendesk', 'Help Scout', 'Crisp'],
  customQueries: 'best customer support software for small SaaS\naffordable support tools for founders\nIntercom alternatives for startups',
};

describe('buildAdvancedGeoIntelligence', () => {
  it('expands seed queries into intent clusters with model sampling evidence', () => {
    const intelligence = buildAdvancedGeoIntelligence(input);

    expect(intelligence.mutations.length).toBeGreaterThan(12);
    expect(new Set(intelligence.mutations.map((query) => query.cluster)).size).toBeGreaterThanOrEqual(5);
    expect(intelligence.mutations.every((query) => query.seedQuery && query.riskLevel)).toBe(true);

    expect(intelligence.modelSamples.length).toBeGreaterThan(20);
    expect(new Set(intelligence.modelSamples.map((sample) => sample.engine)).size).toBeGreaterThanOrEqual(4);
    expect(intelligence.modelSamples.every((sample) => sample.query && sample.mentions.length > 0)).toBe(true);
    expect(intelligence.modelSamples.every((sample) => sample.evidence.some((evidence) => evidence.source && evidence.observed && evidence.confidence > 0))).toBe(true);

    expect(intelligence.clusterSummaries.length).toBeGreaterThanOrEqual(5);
    expect(intelligence.clusterSummaries.every((cluster) => cluster.mentionRate >= 0 && cluster.mentionRate <= 1)).toBe(true);
    expect(intelligence.clusterSummaries.every((cluster) => cluster.leadingBrand.length > 0 && cluster.recommendedAction.length > 0)).toBe(true);

    expect(intelligence.evidenceGraph.nodes.some((node) => node.type === 'engine')).toBe(true);
    expect(intelligence.evidenceGraph.nodes.some((node) => node.type === 'source')).toBe(true);
    expect(intelligence.evidenceGraph.edges.every((edge) => edge.proof.length > 0 && edge.confidence > 0)).toBe(true);
    expect(intelligence.moatSummary.some((item) => item.toLowerCase().includes('sampling'))).toBe(true);
  });
});
