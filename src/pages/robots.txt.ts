import type { APIRoute } from 'astro';
import { draftEnabled } from '../lib/site';
export const GET: APIRoute = () => new Response(draftEnabled ? 'User-agent: *\nDisallow: /drafts/\nDisallow: /draft-index.json\n' : 'User-agent: *\nAllow: /\n', { headers: { 'Content-Type': 'text/plain' } });
