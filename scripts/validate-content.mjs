import { records } from '../src/data/content.ts';
import { validateContent } from './content-validator.mjs';
import { validateTopics } from './validate-topics.mjs';

const errors = [...validateContent(records), ...validateTopics(records)];
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const count = state => records.filter(record => record.state === state).length;
console.log(`内容校验通过：${records.length} 篇；已发布 ${count('published')}；草稿 ${count('draft')}；已撤回 ${count('withdrawn')}。AI 自动初评不代表专家审查。`);
