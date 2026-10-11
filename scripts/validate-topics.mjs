import { topics, supportedReading } from '../src/lib/topics.ts';
import { isPublishable } from '../src/lib/policy.ts';

export function validateTopics(records, entries = topics) {
  const errors = []; const names = new Set(); const terms = new Map();
  if (entries.length !== 24) errors.push('主题应为24项');
  for (const topic of entries) {
    if (names.has(topic.name)) errors.push('重复主题：' + topic.name);
    names.add(topic.name);
    if (!['道','法','术','器'].includes(topic.axis) || !['充分覆盖','通用方法覆盖','仅提及','待补充'].includes(topic.coverage)
      || !topic.decision || !topic.boundary || !topic.aliases.length) errors.push('主题字段缺失：' + topic.name);
    for (const term of [topic.name, ...topic.aliases]) {
      if (terms.has(term) && terms.get(term) !== topic.name) errors.push('别名冲突：' + term);
      terms.set(term, topic.name);
    }
    if (topic.coverage !== '待补充' && !topic.readings.length) errors.push('缺少阅读入口：' + topic.name);
    for (const reading of topic.readings) {
      const record = records.find(record => record.id === reading.id);
      if (!['actions','example','why'].includes(reading.section) || reading.needles.length < 2
        || !reading.terms.includes(topic.name) || reading.terms.some(term => ![topic.name,...topic.aliases].includes(term))) errors.push('无效定位：' + topic.name);
      if (!record || !isPublishable(record) || !supportedReading(record,reading)) errors.push('正文定位失效：' + topic.name + '/' + reading.id);
    }
  }
  return errors;
}
