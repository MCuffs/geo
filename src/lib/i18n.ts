export type Language = 'en' | 'ko';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ko'];

export type TranslationKey =
  | 'language' | 'english' | 'korean'
  | 'eyebrow' | 'heroTitle' | 'heroSubtitle' | 'evidenceFirst' | 'heroCardText'
  | 'input' | 'brandName' | 'websiteUrl' | 'category' | 'targetUseCases' | 'competitors' | 'targetGeoQueries' | 'runAudit'
  | 'result' | 'yourGeoScore' | 'estimatedMentionProbability' | 'averageRank' | 'overview' | 'evidence' | 'ontologyMap'
  | 'competitorRanking' | 'topProofFor' | 'evidenceLedger' | 'evidenceLedgerHelper' | 'keywordRelationshipMap' | 'keywordRelationshipMapHelper'
  | 'recommendedActions' | 'queryLevelProof' | 'weight' | 'confidence' | 'strength' | 'proof' | 'ontology' | 'semantic'
  | 'plainTitle' | 'plainSubtitle' | 'stepOneTitle' | 'stepOneText' | 'stepTwoTitle' | 'stepTwoText' | 'stepThreeTitle' | 'stepThreeText'
  | 'simpleSummary' | 'whatItMeans' | 'visibility' | 'rankVsCompetitors' | 'bestQuery' | 'needAttention' | 'detailsTab' | 'ontologyTab'
  | 'simpleExplanation' | 'mapTitle' | 'mapSubtitle' | 'centerQuery' | 'influenceLegend' | 'winnerLegend' | 'contextLegend' | 'strongestSignals'
  | 'whoIsWinning' | 'whyItMatters' | 'detailsTitle' | 'showingTopProof';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    language: 'Language', english: 'English', korean: '한국어',
    eyebrow: 'GEO made simple',
    heroTitle: 'See whether AI answers will recommend your brand.',
    heroSubtitle: 'Enter your brand, competitors, and target questions. We estimate who AI is likely to mention, why they win, and which keyword relationships you need to strengthen.',
    evidenceFirst: 'Beginner-friendly',
    heroCardText: 'The main screen shows only the score, meaning, and next actions. Detailed proof and ontology live in separate tabs.',
    input: 'Input', brandName: 'Brand name', websiteUrl: 'Website URL', category: 'Category', targetUseCases: 'Target use cases / ICP', competitors: 'Competitors, one per line', targetGeoQueries: 'Target GEO queries, one per line', runAudit: 'Run GEO audit',
    result: 'Result', yourGeoScore: 'Your GEO score', estimatedMentionProbability: 'estimated mention probability', averageRank: 'average rank', overview: 'Overview', evidence: 'Evidence', ontologyMap: 'Ontology Map',
    competitorRanking: 'Competitor ranking', topProofFor: 'Top proof for', evidenceLedger: 'Evidence ledger', evidenceLedgerHelper: 'Source observations and relationship edges used by the ontology scorer.', keywordRelationshipMap: 'Keyword relationship map', keywordRelationshipMapHelper: 'A spider-map of how your query connects to brands, competitors, category, ICP, and signals.',
    recommendedActions: 'Recommended actions', queryLevelProof: 'Query-level proof', weight: 'weight', confidence: 'Confidence', strength: 'strength', proof: 'Proof', ontology: 'ontology', semantic: 'semantic',
    plainTitle: 'What is this checking?',
    plainSubtitle: 'GEO is like SEO for AI answers. Instead of asking “What rank am I on Google?”, this checks “Will ChatGPT, Gemini, Claude, or Perplexity mention my brand for this question?”',
    stepOneTitle: '1. Question', stepOneText: 'A buyer asks an AI a question such as “best support tool for small SaaS”.',
    stepTwoTitle: '2. Associations', stepTwoText: 'The AI looks for brands connected to that category, use case, and supporting proof.',
    stepThreeTitle: '3. Visibility', stepThreeText: 'Your score estimates whether your brand is likely to appear and who currently has stronger signals.',
    simpleSummary: 'Simple summary', whatItMeans: 'What it means', visibility: 'Visibility', rankVsCompetitors: 'Rank vs competitors', bestQuery: 'Strongest query', needAttention: 'Needs attention', detailsTab: 'Details', ontologyTab: 'Ontology map',
    simpleExplanation: 'Higher score means stronger AI-answer visibility. Lower score means your brand needs clearer pages, comparisons, or third-party evidence for the selected query intents.',
    mapTitle: 'Ontology spider map', mapSubtitle: 'Your target query sits in the center. Nearby nodes are brands, competitors, category, ICP, and keyword signals. Thicker glowing lines mean stronger influence.',
    centerQuery: 'Center query', influenceLegend: 'Line thickness = influence', winnerLegend: 'Glowing node = current winner', contextLegend: 'Outer nodes = category, ICP, keyword signals', strongestSignals: 'Strongest signals', whoIsWinning: 'Who is winning?', whyItMatters: 'Why it matters', detailsTitle: 'Detailed proof', showingTopProof: 'Showing top proof chains and evidence ledger.'
  },
  ko: {
    language: '언어', english: 'English', korean: '한국어',
    eyebrow: 'GEO를 쉽게 이해하기',
    heroTitle: 'AI 답변이 우리 브랜드를 추천할지 미리 확인하세요.',
    heroSubtitle: '브랜드, 경쟁사, 타겟 질문을 입력하면 AI가 누구를 언급할 가능성이 높은지, 왜 우세한지, 어떤 키워드 관계를 강화해야 하는지 보여줍니다.',
    evidenceFirst: '초보자 친화적',
    heroCardText: '메인 화면은 점수, 의미, 다음 액션만 간단히 보여주고 상세 근거와 온톨로지는 별도 탭에서 확인합니다.',
    input: '입력', brandName: '브랜드명', websiteUrl: '웹사이트 URL', category: '카테고리', targetUseCases: '타겟 사용 사례 / ICP', competitors: '경쟁사, 한 줄에 하나씩', targetGeoQueries: '타겟 GEO 쿼리, 한 줄에 하나씩', runAudit: 'GEO 감사 실행',
    result: '결과', yourGeoScore: '내 GEO 점수', estimatedMentionProbability: '예상 언급 확률', averageRank: '평균 순위', overview: '개요', evidence: '증거', ontologyMap: '온톨로지 맵',
    competitorRanking: '경쟁사 순위', topProofFor: '상위 근거:', evidenceLedger: '증거 원장', evidenceLedgerHelper: '온톨로지 점수 계산에 사용된 출처 관찰값과 관계 엣지입니다.', keywordRelationshipMap: '키워드 관계도', keywordRelationshipMapHelper: '쿼리가 브랜드, 경쟁사, 카테고리, ICP, 신호와 어떻게 연결되는지 보여주는 거미줄 지도입니다.',
    recommendedActions: '추천 액션', queryLevelProof: '쿼리별 근거', weight: '가중치', confidence: '신뢰도', strength: '강도', proof: '근거', ontology: '온톨로지', semantic: '의미 유사도',
    plainTitle: '무엇을 확인하는 도구인가요?',
    plainSubtitle: 'GEO는 AI 답변 시대의 SEO입니다. “구글에서 몇 위인가?” 대신 “이 질문에 대해 ChatGPT, Gemini, Claude, Perplexity가 우리 브랜드를 언급할까?”를 확인합니다.',
    stepOneTitle: '1. 질문', stepOneText: '구매자가 “작은 SaaS를 위한 최고의 고객지원 도구” 같은 질문을 AI에 합니다.',
    stepTwoTitle: '2. 연결 관계', stepTwoText: 'AI는 그 카테고리, 사용 사례, 근거 자료와 연결된 브랜드를 찾습니다.',
    stepThreeTitle: '3. 가시성', stepThreeText: '점수는 우리 브랜드가 등장할 가능성과 현재 누가 더 강한 신호를 갖고 있는지 추정합니다.',
    simpleSummary: '간단 요약', whatItMeans: '이 점수의 의미', visibility: '가시성', rankVsCompetitors: '경쟁사 대비 순위', bestQuery: '가장 강한 쿼리', needAttention: '보완 필요', detailsTab: '상세 근거', ontologyTab: '온톨로지 맵',
    simpleExplanation: '점수가 높을수록 AI 답변에 등장할 가능성이 큽니다. 점수가 낮다면 해당 질문 의도에 맞는 명확한 페이지, 비교 콘텐츠, 외부 근거가 더 필요합니다.',
    mapTitle: '온톨로지 거미줄 지도', mapSubtitle: '중앙에는 타겟 질문이 있고, 주변에는 브랜드, 경쟁사, 카테고리, ICP, 키워드 신호가 배치됩니다. 굵고 빛나는 선일수록 영향력이 강합니다.',
    centerQuery: '중앙 쿼리', influenceLegend: '선 두께 = 영향력', winnerLegend: '빛나는 노드 = 현재 우세', contextLegend: '외곽 노드 = 카테고리, ICP, 키워드 신호', strongestSignals: '가장 강한 신호', whoIsWinning: '누가 우세한가?', whyItMatters: '왜 중요한가?', detailsTitle: '상세 근거', showingTopProof: '상위 근거 체인과 증거 원장을 보여줍니다.'
  },
};

export function t(language: Language, key: TranslationKey): string {
  return translations[language][key];
}

export function getLanguageLabel(language: Language): string {
  return t(language, language === 'en' ? 'english' : 'korean');
}
