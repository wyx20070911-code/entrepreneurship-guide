import { loadRecords } from '../lib/document-source.ts';
export type PublicationState = 'draft' | 'published' | 'withdrawn';
export type EvidenceGrade = 'A' | 'B' | 'C' | 'U';
export type ClaimType = 'source_fact' | 'editorial_inference' | 'recommendation' | 'hypothetical_calculation';
export interface EvidenceClaim {
  id: string; type: ClaimType; importance: 'core' | 'supporting'; evidenceRelation: 'direct' | 'inference_from' | 'informed_by' | 'none'; text: string; referenceIds: string[];
}
export interface Reference {
  id: string; title: string; url: string; primary: boolean; accessedAt: string;
  supports: string[]; locator: string; assessment: string; authors?: string[]; publisher?: string;
  doi?: string | null; publishedAt?: string | null; materialType?: string;
  accessResult?: 'success' | 'redirect' | 'intermittent' | 'login_wall' | 'captcha' | 'error' | 'pending';
  accessScope?: 'full' | 'abstract' | 'metadata' | 'selected_sections';
  excerpt?: { kind: 'quote' | 'paraphrase'; text: string }; limitations?: string[];
}
export interface Classification {
  audience: string[]; stage: string[]; industry: string[];
  startupCapital: { band: 'low' | 'medium' | 'high' | 'uncertain'; note: string };
  riskCategories: string[];
}
export interface PlainGuide {
  problem: string; oneSentence: string; claimIds: string[]; why: string[];
  example: { hypothetical: true; paragraphs: string[] };
  howTo: string[];
  cost: { startup: string; ongoing: string; time: string; potentialLoss: string };
  notFor: string[];
}
export interface NumericClaim { text: string; kind: 'sourced' | 'hypothetical'; referenceIds: string[]; }
export interface ContentReview {
  selfCheck: { checkedAt: string; version: string; note: string; fingerprint?: string };
  independentAi: null | { reviewerId: string; reviewedAt: string; version: string; fingerprint: string; decision: 'passed' | 'changes_requested'; recordPath: string; note: string };
  human: null | { reviewer: string; reviewedAt: string; note: string };
}
export interface EvidenceRecord {
  id: string; title: string; volume: number; chapter: number; type: '案例' | '框架' | '工具' | '访谈';
  tags: string[]; summary: string; claim: string; evidence: string[]; source: string;
  claims?: EvidenceClaim[];
  state: PublicationState; updatedAt: string; version: string; author: string;
  steps: string[]; applicability: string[]; costs: string | null; risks: string[];
  body: { heading: string; paragraphs: string[]; referenceIds: string[] }[];
  grade: EvidenceGrade; gradeRationale: string; references: Reference[];
  limitations: string[]; ratingMethod: 'ai_auto'; classification: Classification;
  guide?: PlainGuide; numericClaims?: NumericClaim[]; evidenceWarning?: string;
  reviewStatus?: ContentReview;
  jurisdiction?: string; validAsOf?: string;
  history?: { previousState?: string; previousVersion?: string; aiReviewPaths?: string[] };
  research?: {
    searchedAt: string; queries: string[];
    candidates: { title: string; url: string | null; decision: 'included' | 'excluded'; reason: string }[];
    counterEvidence: string[]; status: 'researching' | 'ready_for_ai_review' | 'revisions_required';
  };
}
export const volumes = ['创业判断', '问题与用户', '价值主张', '市场验证', '产品设计', '增长与分发', '商业模式', '销售与交付', '现金流与财务', '组织与招聘', '风险与合规', '长期迭代'];
const titles = [
  ['创业动机与机会成本', '资源盘点与能力边界', '关键假设与决策标准', '退出条件与阶段复盘'],
  ['用户细分与问题识别', '问题访谈与行为证据', '需求优先级与替代方案', '用户研究记录与复核'],
  ['价值主张与任务场景', '差异化与竞争比较', '服务承诺与价值验证', '定价假设与付费意愿'],
  ['市场范围与信息来源', '最小验证实验', '预售与真实承诺', '验证失败与停止标准'],
  ['产品范围与需求取舍', '原型与可用性测试', '人工交付与最小产品', '质量、技术债与迭代'],
  ['目标渠道与受众匹配', '获客实验与转化路径', '留存、复购与推荐', '分发机制与渠道复盘'],
  ['收入结构与价值捕获', '成本结构与单位经济', '定价实验与套餐设计', '商业模式可持续性'],
  ['客户线索与销售资格', '提案、谈判与成交', '交付流程与质量控制', '客户成功与续约'],
  ['现金流与生存周期', '预算、成本与回款', '财务记录与经营指标', '融资选择与资本约束'],
  ['创始团队与职责分工', '招聘标准与用人判断', '协作机制与激励设计', '组织阶段与管理复盘'],
  ['风险识别与应对清单', '合同、知识产权与责任', '数据保护与业务合规', '危机预案与专业求助'],
  ['实验记录与学习系统', '战略取舍与业务聚焦', '规模化前的条件核验', '长期经营与持续更新']
];
export const chapters = volumes.flatMap((name, vi) => titles[vi]!.map((title, ci) => ({
  id: `V${String(vi + 1).padStart(2, '0')}-C${ci + 1}`, volume: vi + 1, chapter: ci + 1, title,
  description: `围绕「${title}」收集原始资料、实践步骤与适用边界。`, volumeTitle: name
})));
export const records = loadRecords();
export const grades: Record<EvidenceGrade, { label: string; meaning: string }> = {
  A: { label: 'A · 较高确定性', meaning: '存在直接相关、可信且相对一致的高质量研究支持。' },
  B: { label: 'B · 中等确定性', meaning: '有可信研究或可靠数据支持，但仍有情境或方法局限。' },
  C: { label: 'C · 探索性建议', meaning: '主要依据有限研究、案例、实践经验或合理推断。' },
  U: { label: 'U · 证据不足', meaning: '当前资料不足以支持确定结论，请谨慎参考。' }
};
export const stats = { volumes: volumes.length, chapters: chapters.length, published: records.filter(r => r.state === 'published').length, draft: records.filter(r => r.state === 'draft').length, withdrawn: records.filter(r => r.state === 'withdrawn').length, total: records.length };
