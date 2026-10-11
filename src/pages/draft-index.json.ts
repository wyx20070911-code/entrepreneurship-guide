import type { APIRoute } from 'astro';
import { draftRecords, draftEnabled, articleHref } from '../lib/site';
import { indexRecord } from '../lib/search';
import { topicTermsFor, topicNamesFor } from '../lib/topics';
export const GET: APIRoute = () => draftEnabled ? new Response(JSON.stringify(draftRecords.map(record => indexRecord(record, articleHref(record.id, true), topicTermsFor(record), topicNamesFor(record)))), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' } }) : new Response(null, { status: 404 });
