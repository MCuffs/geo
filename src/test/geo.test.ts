import { describe, expect, it } from 'vitest';
import { analyzeGeoRank, generateOntology, generateQueries, normalizeBrand } from '../lib/geo';

describe('normalizeBrand', () => {
  it('normalizes casing and punctuation for matching aliases', () => {
    expect(normalizeBrand(' Acme-Support.ai! ')).toBe('acme support ai');
  });
});

describe('generateQueries', () => {
  it('creates buyer-intent GEO prompts from category and use cases', () => {
    const queries = generateQueries({
      brand: 'AcmeSupport',
      website: 'https://acme.test',
      category: 'customer support software',
      useCases: 'small SaaS, founder-led support',
      competitors: ['Intercom', 'Zendesk'],
      customQueries: '',
    });

    expect(queries).toContain('best customer support software for small SaaS');
    expect(queries).toContain('Intercom alternatives for customer support software');
    expect(queries.length).toBeGreaterThanOrEqual(8);
  });
});

describe('analyzeGeoRank', () => {
  it('ranks the target brand against competitors with evidence per query', () => {
    const result = analyzeGeoRank({
      brand: 'AcmeSupport',
      website: 'https://acme.test',
      category: 'customer support software',
      useCases: 'small SaaS, founder-led support',
      competitors: ['Intercom', 'Zendesk', 'Help Scout'],
      customQueries: 'best customer support software for small SaaS\naffordable support tools for founders',
    });

    expect(result.target.brand).toBe('AcmeSupport');
    expect(result.rankings[0].score).toBeGreaterThanOrEqual(result.rankings[1].score);
    expect(result.queries.length).toBeGreaterThanOrEqual(2);
    expect(result.queries[0].evidence.length).toBeGreaterThan(0);
    expect(result.target.evidence.some((item) => item.reason.includes('Ontology'))).toBe(true);
    expect(result.evidenceLedger[0]).toMatchObject({ source: expect.any(String), observed: expect.any(String), relationship: expect.any(String) });
    expect(result.queries[0].evidence[0].proof.length).toBeGreaterThan(0);
  });

  it('penalizes the target when competitors are semantically closer to the query', () => {
    const result = analyzeGeoRank({
      brand: 'TinyDesk',
      website: 'https://tinydesk.test',
      category: 'minimal help desk',
      useCases: 'solo founders',
      competitors: ['EnterpriseDesk', 'Omnichannel Suite'],
      customQueries: 'enterprise omnichannel customer support platform',
    });

    const target = result.rankings.find((item) => item.brand === 'TinyDesk');
    const enterprise = result.rankings.find((item) => item.brand === 'EnterpriseDesk');

    expect(target).toBeDefined();
    expect(enterprise).toBeDefined();
    expect(enterprise!.score).toBeGreaterThan(target!.score);
  });
});

describe('generateOntology', () => {
  it('builds brand, category, use-case, query, and competitor relationships', () => {
    const ontology = generateOntology({
      brand: 'AcmeSupport',
      website: 'https://acme.test',
      category: 'customer support software',
      useCases: 'small SaaS, founder-led support',
      competitors: ['Intercom'],
      customQueries: 'best customer support software for small SaaS',
    });

    expect(ontology.nodes.some((node) => node.type === 'brand' && node.label === 'AcmeSupport')).toBe(true);
    expect(ontology.nodes.some((node) => node.type === 'intent' && node.label === 'small SaaS')).toBe(true);
    expect(ontology.edges).toContainEqual(expect.objectContaining({ from: 'brand:AcmeSupport', to: 'category:customer support software', relation: 'positions_as' }));
    expect(ontology.edges.some((edge) => edge.relation === 'query_mentions' && edge.evidence.includes('best customer support software'))).toBe(true);
    expect(ontology.gaps.length).toBeGreaterThan(0);
  });
});
