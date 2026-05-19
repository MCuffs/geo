export type Language = 'en' | 'ko';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ko'];

export type TranslationKey =
  | 'language'
  | 'english'
  | 'korean'
  | 'eyebrow'
  | 'heroTitle'
  | 'heroSubtitle'
  | 'evidenceFirst'
  | 'heroCardText'
  | 'input'
  | 'brandName'
  | 'websiteUrl'
  | 'category'
  | 'targetUseCases'
  | 'competitors'
  | 'targetGeoQueries'
  | 'runAudit'
  | 'result'
  | 'yourGeoScore'
  | 'estimatedMentionProbability'
  | 'averageRank'
  | 'overview'
  | 'evidence'
  | 'ontologyMap'
  | 'competitorRanking'
  | 'topProofFor'
  | 'evidenceLedger'
  | 'evidenceLedgerHelper'
  | 'keywordRelationshipMap'
  | 'keywordRelationshipMapHelper'
  | 'recommendedActions'
  | 'queryLevelProof'
  | 'weight'
  | 'confidence'
  | 'strength'
  | 'proof'
  | 'ontology'
  | 'semantic';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    language: 'Language',
    english: 'English',
    korean: '한국어',
    eyebrow: 'GEO / AI Visibility Rank Tracker MVP',
    heroTitle: 'Estimate how likely AI answers are to mention your brand.',
    heroSubtitle:
      'Now using an ontology graph: brand → category → ICP/use case → query intent → competitor relationships. Scores include proof chains so the result is not just a black-box similarity number.',
    evidenceFirst: 'Evidence-first',
    heroCardText: 'Each score links back to relationship edges, source observations, and query-level proof.',
    input: 'Input',
    brandName: 'Brand name',
    websiteUrl: 'Website URL',
    category: 'Category',
    targetUseCases: 'Target use cases / ICP',
    competitors: 'Competitors, one per line',
    targetGeoQueries: 'Target GEO queries, one per line',
    runAudit: 'Run GEO audit',
    result: 'Result',
    yourGeoScore: 'Your GEO score',
    estimatedMentionProbability: 'estimated mention probability',
    averageRank: 'average rank',
    overview: 'Overview',
    evidence: 'Evidence',
    ontologyMap: 'Ontology Map',
    competitorRanking: 'Competitor ranking',
    topProofFor: 'Top proof for',
    evidenceLedger: 'Evidence ledger',
    evidenceLedgerHelper: 'These are the source observations and relationship edges used by the ontology scorer.',
    keywordRelationshipMap: 'Keyword relationship map',
    keywordRelationshipMapHelper:
      'Nodes are grouped by ontology type. Edges below show why a query is related to a category, ICP, brand, competitor, or missing gap.',
    recommendedActions: 'Recommended actions',
    queryLevelProof: 'Query-level proof',
    weight: 'weight',
    confidence: 'Confidence',
    strength: 'strength',
    proof: 'Proof',
    ontology: 'ontology',
    semantic: 'semantic',
  },
  ko: {
    language: '언어',
    english: 'English',
    korean: '한국어',
    eyebrow: 'GEO / AI 가시성 순위 추적 MVP',
    heroTitle: 'AI 답변이 우리 브랜드를 언급할 가능성을 추정하세요.',
    heroSubtitle:
      '브랜드 → 카테고리 → ICP/사용 사례 → 쿼리 의도 → 경쟁사 관계로 이어지는 온톨로지 그래프를 사용합니다. 점수에는 근거 체인이 포함되어 단순 유사도 숫자가 아닌 설명 가능한 결과를 제공합니다.',
    evidenceFirst: '근거 우선',
    heroCardText: '각 점수는 관계 엣지, 출처 관찰값, 쿼리별 증빙과 연결됩니다.',
    input: '입력',
    brandName: '브랜드명',
    websiteUrl: '웹사이트 URL',
    category: '카테고리',
    targetUseCases: '타겟 사용 사례 / ICP',
    competitors: '경쟁사, 한 줄에 하나씩',
    targetGeoQueries: '타겟 GEO 쿼리, 한 줄에 하나씩',
    runAudit: 'GEO 감사 실행',
    result: '결과',
    yourGeoScore: '내 GEO 점수',
    estimatedMentionProbability: '예상 언급 확률',
    averageRank: '평균 순위',
    overview: '개요',
    evidence: '증거',
    ontologyMap: '온톨로지 맵',
    competitorRanking: '경쟁사 순위',
    topProofFor: '상위 근거:',
    evidenceLedger: '증거 원장',
    evidenceLedgerHelper: '온톨로지 점수 계산에 사용된 출처 관찰값과 관계 엣지입니다.',
    keywordRelationshipMap: '키워드 관계도',
    keywordRelationshipMapHelper:
      '노드는 온톨로지 유형별로 그룹화됩니다. 아래 엣지는 쿼리가 카테고리, ICP, 브랜드, 경쟁사, 누락된 관계와 왜 연결되는지 보여줍니다.',
    recommendedActions: '추천 액션',
    queryLevelProof: '쿼리별 근거',
    weight: '가중치',
    confidence: '신뢰도',
    strength: '강도',
    proof: '근거',
    ontology: '온톨로지',
    semantic: '의미 유사도',
  },
};

export function t(language: Language, key: TranslationKey): string {
  return translations[language][key];
}

export function getLanguageLabel(language: Language): string {
  return t(language, language === 'en' ? 'english' : 'korean');
}
