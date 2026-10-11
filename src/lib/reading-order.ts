import type { EvidenceRecord } from '../data/content.ts';
import { isPublishable } from './policy.ts';

// Within a chapter, the numeric stable entry ID is the explicit tie-break order.
// IDs never determine order between chapters or volumes.
export function adjacentArticles(record: EvidenceRecord, candidates: EvidenceRecord[]) {
  const ordered = candidates.filter(item => item.volume === record.volume && isPublishable(item))
    .slice().sort((a,b) => a.chapter - b.chapter || Number(a.id.slice(2)) - Number(b.id.slice(2)));
  const index = ordered.findIndex(item => item.id === record.id);
  return index < 0 ? { previous: undefined, next: undefined }
    : { previous: ordered[index - 1], next: ordered[index + 1] };
}
