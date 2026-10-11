import type { EvidenceGrade, EvidenceRecord, PublicationState } from '../data/content.ts';
export interface SearchRecord {
  id: string; title: string; summary: string; text: string; tags: string[];
  volume: number; chapter: number; type: string; grade: EvidenceGrade; state: PublicationState; href: string;
  topicTerms?: string[];
  topicNames?: string[];
}
export interface Filters { query: string; volume: string; type: string; grade: string; state: string; showDrafts: boolean; }
export function indexRecord(record: EvidenceRecord, href: string, topicTerms: string[] = [], topicNames: string[] = []): SearchRecord {
  const visibleText = record.guide
    ? [record.guide.problem, record.guide.oneSentence, ...record.guide.why, ...record.guide.example.paragraphs, ...record.guide.howTo, ...Object.values(record.guide.cost), ...record.guide.notFor]
    : [record.claim, ...record.steps, ...record.applicability, ...record.risks, ...record.limitations, ...record.body.flatMap(section => [section.heading, ...section.paragraphs])];
  return { id: record.id, title: record.title, summary: record.summary, tags: record.tags, volume: record.volume,
    chapter: record.chapter, type: record.type, grade: record.grade, state: record.state, href, topicTerms, topicNames,
    text: [record.id, record.title, record.summary, ...record.tags, ...visibleText].join(' ') };
}
export function filterRecords(records: SearchRecord[], filters: Filters): SearchRecord[] {
  const words = filters.query.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const topicNames = new Set(records.flatMap(record => record.topicNames ?? []).map(name => name.normalize('NFKC').toLocaleLowerCase()));
  return records.filter(record => record.state !== 'withdrawn' && (record.state === 'published' || filters.showDrafts)
    && (filters.volume === 'all' || String(record.volume) === filters.volume)
    && (filters.type === 'all' || record.type === filters.type)
    && (filters.grade === 'all' || record.grade === filters.grade)
    && (filters.state === 'all' || record.state === filters.state)
    && words.every(word => (!topicNames.has(word) && record.text.normalize('NFKC').toLocaleLowerCase().includes(word))
      || record.topicTerms?.some(term => term.normalize('NFKC').toLocaleLowerCase() === word)));
}
