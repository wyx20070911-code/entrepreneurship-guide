import { createHash } from 'node:crypto';
import type { EvidenceRecord } from '../data/content.ts';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([key,item]) => [key,sortValue(item)]));
  }
  return value;
}

export function fingerprintPayload(record: EvidenceRecord) {
  return {
    id:record.id,title:record.title,volume:record.volume,chapter:record.chapter,type:record.type,
    tags:record.tags,summary:record.summary,claims:record.claims ?? [],grade:record.grade,
    gradeRationale:record.gradeRationale,references:record.references,limitations:record.limitations,
    guide:record.guide ?? null,numericClaims:record.numericClaims ?? [],classification:record.classification,
    jurisdiction:record.jurisdiction ?? null,validAsOf:record.validAsOf ?? null
  };
}

export function contentFingerprint(record: EvidenceRecord): string {
  const canonical=JSON.stringify(sortValue(fingerprintPayload(record)));
  return `sha256:${createHash('sha256').update(canonical,'utf8').digest('hex')}`;
}
