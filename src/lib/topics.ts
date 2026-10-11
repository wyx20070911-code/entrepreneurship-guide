import rawTopics from '../data/topics.json' with { type: 'json' };
import type { EvidenceRecord } from '../data/content.ts';

export const topics = rawTopics;
export type Topic = typeof topics[number];
// 定位检查只发现内容漂移；语义相关性仍由作者逐项自查，不是自动证实。
export function supportedReading(record: EvidenceRecord, reading: Topic['readings'][number]): boolean {
  if (record.id !== reading.id || !record.guide) return false;
  const section = reading.section === 'actions' ? record.guide.howTo
    : reading.section === 'example' ? record.guide.example.paragraphs
    : reading.section === 'why' ? record.guide.why : [];
  return reading.needles.every(needle => section.some(text => text.includes(needle)));
}
// 仅在服务端组装当前条目的词；客户端不载入主题表或其他文章的数据。
export function topicTermsFor(record: EvidenceRecord): string[] {
  return [...new Set(topics.flatMap(topic => topic.readings
    .filter(reading => supportedReading(record, reading)).flatMap(reading => reading.terms)))];
}
export function topicNamesFor(record: EvidenceRecord): string[] {
  return topics.filter(topic => topic.readings.some(reading => supportedReading(record, reading))).map(topic => topic.name);
}
