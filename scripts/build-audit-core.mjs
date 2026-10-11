import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function files(path) {
  const entries=await readdir(path,{withFileTypes:true});
  return (await Promise.all(entries.map(entry=>entry.isDirectory()?files(join(path,entry.name)):join(path,entry.name)))).flat();
}

export async function auditDirectory(directory,{draftIds,publishableIds,withdrawnIds=[],draftBuild=false}) {
  const list=await files(directory);
  for (const file of list) {
    if (/[/\\]tools[/\\]manual-delivery(?:[/\\]|$)/i.test(file) || /manual-delivery/i.test(file)) throw new Error(`构建仍包含已移除的创业工具产物：${file}`);
    if (!draftBuild && /draft/i.test(file)) throw new Error(`正式构建包含草稿命名路径：${file}`);
    if (/\.(html|js|mjs|cjs|json|xml|txt|map|rss|atom|css|svg)$/i.test(file)) {
      const content=await readFile(file,'utf8');
      if(!draftBuild&&[...content.matchAll(/\bE-\d{4}\b/g)].some(match=>!publishableIds.includes(match[0])))throw new Error(`正式产物出现非公开条目标识：${file}`);
      if (/href=["'][^"']*\/tools\/manual-delivery\//i.test(content)) throw new Error(`构建仍包含已移除的创业工具链接：${file}`);
      if (withdrawnIds.some(id=>content.includes(id))) throw new Error(`构建包含已撤回内容：${file}`);
      if (!draftBuild && draftIds.some(id=>content.includes(id))) throw new Error(`正式构建包含草稿数据：${file}`);
      if (!draftBuild && /\/drafts\/|draft-index\.json|ready_for_ai_review/.test(content)) throw new Error(`正式构建包含草稿标识或路由：${file}`);
    }
  }
  const index=JSON.parse(await readFile(join(directory,'search-index.json'),'utf8'));
  if (index.some(record=>withdrawnIds.includes(record.id))) throw new Error('搜索索引包含已撤回内容');
  if (!draftBuild && index.some(record=>!publishableIds.includes(record.id))) throw new Error('正式搜索索引包含未自动发布的内容');
  return {files:list.length,indexCount:index.length};
}
