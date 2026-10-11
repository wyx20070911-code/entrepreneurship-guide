import { records } from '../src/data/content.ts';
import { isPublishable } from '../src/lib/policy.ts';
import { auditDirectory } from './build-audit-core.mjs';
const draftBuild = process.env.INCLUDE_DRAFTS === '1';
const directory = draftBuild ? 'outputs/review' : 'dist';
const draftIds = records.filter(r => r.state === 'draft').map(r => r.id);
const withdrawnIds = records.filter(r => r.state === 'withdrawn').map(r => r.id);
const result=await auditDirectory(directory,{draftIds,withdrawnIds,publishableIds:records.filter(record=>isPublishable(record)).map(record=>record.id),draftBuild});
console.log(`产物隔离检查通过：${draftBuild ? '本地草稿预览' : '正式构建'}；正式索引 ${result.indexCount} 条。`);
