import { records } from '../data/content.ts';
import { isPublishable } from './policy.ts';
import { siteUrl } from './urls.ts';
export const draftEnabled = import.meta.env.DEV || import.meta.env.INCLUDE_DRAFTS === '1';
export const publishedRecords = records.filter(record=>isPublishable(record));
export const draftRecords = records.filter(record => record.state === 'draft');
export const withdrawnRecords = records.filter(record => record.state === 'withdrawn');
export function articleHref(id: string, draft = false): string { return siteUrl(`${draft ? '/drafts' : '/articles'}/${id}/`); }
export function publishedFor(volume: number, chapter?: number) {
  return publishedRecords.filter(record => record.volume === volume && (chapter === undefined || record.chapter === chapter));
}
