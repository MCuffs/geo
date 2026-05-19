import { describe, expect, it } from 'vitest';
import { analyzeGeoRank, buildOntologyMap } from '../lib/geo';

const input = {
  brand: 'AcmeSupport',
  website: 'https://acmesupport.example',
  category: 'customer support software',
  useCases: 'small SaaS, founder-led support, indie hackers',
  competitors: ['Intercom', 'Zendesk', 'Crisp'],
  customQueries: 'best customer support software for small SaaS\naffordable support tools for founders\nIntercom alternatives for startups',
};

describe('buildOntologyMap', () => {
  it('creates a radial spider-map centered on the submitted query keyword', () => {
    const result = analyzeGeoRank(input);
    const map = buildOntologyMap(result, input.customQueries.split('\n')[0]);

    expect(map.center.label).toBe('best customer support software for small SaaS');
    expect(map.nodes.length).toBeGreaterThan(5);
    expect(map.links.length).toBeGreaterThan(4);
    expect(map.nodes.some((node) => node.type === 'brand' && node.winner === true)).toBe(true);
    expect(map.nodes.some((node) => node.type === 'competitor')).toBe(true);
    expect(map.links.every((link) => link.influence >= 0 && link.influence <= 1)).toBe(true);
    expect(map.nodes.every((node) => node.x >= 0 && node.x <= 100 && node.y >= 0 && node.y <= 100)).toBe(true);
    expect(new Set(map.nodes.map((node) => node.ring))).toEqual(new Set(['entity', 'context', 'signal']));
  });
});
