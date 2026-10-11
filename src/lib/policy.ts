import type { EvidenceRecord } from '../data/content.ts';
import { contentFingerprint } from './fingerprint.ts';

export function publicationIssues(record: EvidenceRecord): string[] {
  const issues: string[] = [];
  if (record.state === 'withdrawn') issues.push('文章已撤回');
  if (!['A', 'B', 'C', 'U'].includes(record.grade) || !record.gradeRationale.trim() || record.ratingMethod !== 'ai_auto') issues.push('缺少有效的 AI 自动评级及理由');
  if (!record.classification?.audience.length || !record.classification.stage.length || !record.classification.industry.length || !record.classification.riskCategories.length || !record.classification.startupCapital?.note.trim()) issues.push('自动分类字段不完整');
  if (!record.references.length) issues.push('没有登记可核对的来源');
  if (!record.guide || !record.guide.problem.trim() || !record.guide.oneSentence.trim() || !record.guide.claimIds.length || record.guide.why.length < 2 || record.guide.howTo.length < 3 || record.guide.howTo.length > 5 || !record.guide.notFor.length) issues.push('新版文章结构不完整');
  const claimIds = new Set((record.claims ?? []).map(claim => claim.id));
  if (record.guide?.claimIds.some(id => !claimIds.has(id))) issues.push('读者正文关联了不存在的主张');
  if ((record.claims ?? []).some(claim => claim.importance === 'core' && claim.type === 'source_fact' && !claim.referenceIds.length)) issues.push('核心事实主张缺少来源');
  if (record.guide && (!record.guide.example.hypothetical || !record.guide.example.paragraphs.join('').includes('假设'))) issues.push('虚构例子没有明确标记为假设');
  const guideText = record.guide ? [record.guide.problem,record.guide.oneSentence,...record.guide.why,...record.guide.example.paragraphs,...record.guide.howTo,...Object.values(record.guide.cost),...record.guide.notFor].join(' ') : '';
  const numberTokens = [...guideText.matchAll(/(?:(?<![\p{L}\p{N}-])\d+(?:\.\d+)?%?(?![\p{L}\p{N}-])|[零一二三四五六七八九十百千万两]+(?:元|万元))/gu)].map(match => match[0]);
  for (const token of new Set(numberTokens)) if (!(record.numericClaims ?? []).some(item => item.text.includes(token))) issues.push(`数字 ${token} 缺少单独来源或假设登记`);
  for (const numeric of record.numericClaims ?? []) {
    if (numeric.kind === 'hypothetical' && !numeric.text.includes('假设')) issues.push('假设数字没有明确标记');
    if (numeric.kind === 'sourced' && (!numeric.referenceIds.length || numeric.referenceIds.some(id => !record.references.some(ref => ref.id === id)))) issues.push('数字来源关联无效');
  }
  const legal = record as EvidenceRecord & { jurisdiction?: string; validAsOf?: string };
  if (record.tags.some(tag => /法律|法规|合规/.test(tag)) && (!legal.jurisdiction?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(legal.validAsOf ?? ''))) issues.push('法规内容缺少适用地区或有效日期');
  if (record.grade === 'U' && !record.evidenceWarning?.trim()) issues.push('U 级内容缺少证据不足警示');
  if (!record.reviewStatus?.selfCheck || record.reviewStatus.selfCheck.version !== record.version) issues.push('缺少当前版本作者自查');
  // 同一门槛适用于历史、当前和未来版本；版本号不是证据或豁免。
  if (!/^sha256:[a-f0-9]{64}$/.test(record.reviewStatus?.selfCheck.fingerprint ?? '')) issues.push('缺少有效的当前内容作者自查指纹');
  if (record.reviewStatus?.selfCheck.fingerprint && record.reviewStatus.selfCheck.fingerprint !== contentFingerprint(record)) issues.push('作者自查已因正文或依据变化过期');
  if (record.reviewStatus?.independentAi && (record.reviewStatus.independentAi.version !== record.version || record.reviewStatus.independentAi.fingerprint !== contentFingerprint(record))) issues.push('独立 AI 复核已因版本或内容变化过期');
  // 页面筛选和构建使用同一门槛，不能只在单独校验命令里拒绝失联引用。
  issues.push(...referenceIssues(record));
  return [...new Set(issues)];
}

export function isPublishable(record: EvidenceRecord): boolean {
  return record.state === 'published' && publicationIssues(record).length === 0;
}

export function referenceIssues(record: EvidenceRecord): string[] {
  const ids = record.references.map(ref => ref.id);
  const claimIds = (record.claims ?? []).map(claim => claim.id);
  const issues: string[] = [];
  if (new Set(ids).size !== ids.length) issues.push('重复引用编号');
  if (new Set(claimIds).size !== claimIds.length) issues.push('重复主张编号');
  for (const claim of record.claims ?? []) if (claim.referenceIds.some(id => !ids.includes(id))) issues.push(`主张 ${claim.id} 关联了不存在的引用`);
  for (const ref of record.references) {
    if (!/^https:\/\//.test(ref.url)) issues.push(`引用 ${ref.id} 地址无效`);
    if (/example\.(com|org|net)/i.test(ref.url)) issues.push(`引用 ${ref.id} 使用了示例域名`);
    if (!ref.locator.trim() || !ref.assessment.trim()) issues.push(`引用 ${ref.id} 缺少定位或语义说明`);
    if ((record.claims ?? []).some(claim => claim.referenceIds.includes(ref.id) && !ref.supports.includes(claim.id))) issues.push(`引用 ${ref.id} 未登记其支持的主张`);
    if (ref.supports.some(id => !claimIds.includes(id))) issues.push(`引用 ${ref.id} 关联了不存在的主张`);
  }
  return [...new Set(issues)];
}
