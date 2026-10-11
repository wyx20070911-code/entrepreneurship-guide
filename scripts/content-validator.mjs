import Ajv from 'ajv';
import formats from 'ajv-formats';
import schema from '../docs/evidence-schema.json' with { type: 'json' };
import { publicationIssues, referenceIssues } from '../src/lib/policy.ts';
import { chapters } from '../src/data/content.ts';
const ajv = new Ajv({ allErrors: true, strict: true });
formats(ajv);
const validate = ajv.compile(schema);
export function validateContent(records, options = {}) {
  const errors = [];
  const ids = new Set();
  for (const record of records) {
    if (!validate(record)) { errors.push(`${record.id ?? '未知编号'}: ${ajv.errorsText(validate.errors)}`); continue; }
    if (ids.has(record.id)) errors.push(`${record.id}: 重复条目编号`);
    ids.add(record.id);
    if (!chapters.some(chapter => chapter.volume === record.volume && chapter.chapter === record.chapter)) errors.push(`${record.id}: 卷章分类无效`);
    if (!options.allowFixtures) {
      const serialized=JSON.stringify(record);
      if (/example\.(com|org|net)|测试用模拟|假审核|fixture/i.test(serialized)) errors.push(`${record.id}: 测试夹具或示例域名进入真实内容`);
    }
    for (const error of referenceIssues(record)) errors.push(`${record.id}: ${error}`);
    if (record.state === 'published') for (const error of publicationIssues(record)) errors.push(`${record.id}: ${error}`);
    if (record.state === 'withdrawn' && record.guide?.oneSentence.includes('自动发布')) errors.push(`${record.id}: 撤回内容包含重新发布标记`);
  }
  return errors;
}
