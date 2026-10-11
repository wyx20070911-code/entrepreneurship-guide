import type { APIRoute } from 'astro';
import { publishedRecords, articleHref } from '../lib/site';
import { indexRecord } from '../lib/search';
import { topicTermsFor, topicNamesFor } from '../lib/topics';
export const GET: APIRoute = () => new Response(JSON.stringify(publishedRecords.map(record => indexRecord(record, articleHref(record.id), topicTermsFor(record), topicNamesFor(record)))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
