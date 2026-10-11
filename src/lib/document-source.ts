import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { EvidenceRecord, PlainGuide } from '../data/content.ts';

export const documentSections = ['问题', '建议', '步骤', '依据', '假设例子', '启动成本', '持续成本', '时间成本', '潜在损失', '适用边界'] as const;
const blocks = (text: string) => text.trim().split(/\n\n+/).filter(Boolean);
const list = (text: string) => blocks(text).map(item => {
  if (!item.startsWith('- ')) throw new Error('清单项目必须以 - 开头，项目间留空行');
  return item.slice(2);
});

export function parseGuide(markdown: string, title: string, claimIds: string[]): PlainGuide {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalized.startsWith('# ' + title + '\n\n')) throw new Error('正文标题与元数据不一致');
  if(normalized.split(/^## /m)[0]!.trim()!=='# '+title)throw new Error('标题与第一小节之间不能隐藏未解析正文');
  const parts = normalized.split(/^## /m).slice(1);
  if (parts.length !== documentSections.length) throw new Error('正文小节缺失、重复或包含未支持的小节');
  const sections = Object.fromEntries(parts.map((part,index) => {
    const newline=part.indexOf('\n');
    if (part.slice(0,newline)!==documentSections[index]) throw new Error('正文小节名称或顺序无效');
    const text=part.slice(newline+1).trim();
    if (!text) throw new Error('正文小节不能为空');
    return [documentSections[index],text];
  })) as Record<typeof documentSections[number],string>;
  return {problem:sections.问题,oneSentence:sections.建议,claimIds,
    howTo:list(sections.步骤),why:blocks(sections.依据),example:{hypothetical:true,paragraphs:blocks(sections.假设例子)},
    cost:{startup:sections.启动成本,ongoing:sections.持续成本,time:sections.时间成本,potentialLoss:sections.潜在损失},notFor:list(sections.适用边界)};
}

export function loadRecords(): EvidenceRecord[] {
  const result: EvidenceRecord[]=[];
  for (const [relative,isPublic] of [['content/articles',true],['.local/content',false]] as const) {
    // Astro 会将模块移到构建临时目录；不得按打包后的 import.meta.url 找内容。
    const root=resolve(process.cwd(),relative);
    if (!existsSync(root)) { if(isPublic)throw new Error('缺少公开内容目录'); continue; }
    const files=readdirSync(root);
    for(const file of files.filter(file=>file.endsWith('.json')).sort()){
      if(!/^E-\d{4}\.json$/.test(file))throw new Error('内容文件路径无效');
      const metadata=JSON.parse(readFileSync(resolve(root,file),'utf8'));
      if(metadata.id!==file.slice(0,-5))throw new Error('编号与文件名不一致');
      if ('guide' in metadata || 'body' in metadata || 'steps' in metadata)throw new Error('正文不能同时保存在元数据中');
      if(isPublic&&metadata.state!=='published')throw new Error('非公开内容必须移出content/articles');
      const guide=parseGuide(readFileSync(resolve(root,metadata.id+'.md'),'utf8'),metadata.title,metadata.guideClaimIds);
      const {guideClaimIds: _claimIds,...data}=metadata;
      result.push({...data,guide,claim:guide.oneSentence,steps:guide.howTo,applicability:guide.notFor,
        costs:Object.values(guide.cost).join('；'),risks:metadata.classification.riskCategories,
        evidence:guide.why,source:metadata.references.map((ref:{title:string})=>ref.title).join('；'),
        body:[{heading:'依据',paragraphs:guide.why,referenceIds:metadata.references.map((ref:{id:string})=>ref.id)}]} as EvidenceRecord);
    }
    for(const file of files.filter(file=>file.endsWith('.md'))){
      if(!files.includes(file.replace(/\.md$/,'.json')))throw new Error('正文缺少配套元数据');
    }
  }
  if(new Set(result.map(record=>record.id)).size!==result.length)throw new Error('内容ID重复');
  return result.sort((a,b)=>a.id.localeCompare(b.id));
}
