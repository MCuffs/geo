import { describe, expect, it } from 'vitest';
import { getLanguageLabel, t, type Language } from '../lib/i18n';

describe('i18n', () => {
  it('supports only Korean and English labels for the language switcher', () => {
    expect(getLanguageLabel('en')).toBe('English');
    expect(getLanguageLabel('ko')).toBe('한국어');
    expect(['en', 'ko'] satisfies Language[]).toHaveLength(2);
  });

  it('translates primary UI copy in both supported languages', () => {
    expect(t('en', 'runAudit')).toBe('Run GEO audit');
    expect(t('ko', 'runAudit')).toBe('GEO 감사 실행');
    expect(t('en', 'language')).toBe('Language');
    expect(t('ko', 'language')).toBe('언어');
    expect(t('ko', 'heroTitle')).toContain('AI 답변');
  });
});
