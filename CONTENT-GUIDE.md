# 单一内容源与发布规范

每篇正文是 Markdown（段落与清单），同编号 JSON 是结构化元数据，不保存重复 guide/body/steps。网站和搜索在构建时解析同一 Markdown，保持 `/articles/E-XXXX/` 的文章 ID 及小节锚点。

Markdown 的一级标题必须与元数据一致。依次保留十个二级小节：问题、建议、步骤、依据、假设例子、启动成本、持续成本、时间成本、潜在损失、适用边界。步骤和边界用 `- ` 清单，项目之间空一行；依据和例子按空行分段。不要增加 MDX 代码、脚本或原始 HTML，当前正文格式只支持段落和清单。

JSON 必须记录 ID、卷章、summary、guideClaimIds、claims、references、numericClaims、grade/gradeRationale、分类、版本、适用范围及真实 reviewStatus。主张区分来源事实、编辑推断、操作建议和假设演算；重要数字逐项登记。来源有真实标题、作者/机构、原始 URL、访问日期、实际范围、定位、支持与局限，不转载完整来源。

48章和24主题入口不等于所有结论经过验证。发布状态、AI证据初评、作者自查、独立 AI/人工/专业复核分别表述。当前没有实际独立或专业审核，不得由贡献者捏造补齐。

所有版本必须通过同一门槛。正文、主张、来源、评级或适用范围变化会使旧 selfCheck 指纹失效，版本不变也不能豁免。需要实际复查、更新版本，再记录新检查和指纹。`node --input-type=module -e "import {records} from './src/data/content.ts';import {contentFingerprint} from './src/lib/fingerprint.ts'; console.log(contentFingerprint(records.find(r=>r.id==='E-0001')));"` 只计算指纹，不执行研究或批准。

公开目录只允许已发布且通过门槛的文章。未经确认的草稿放在本地 `.local/content`，不进入公开文件清单、Git历史和网站。来源受限、法律适用性不明或关键事实未核实时，缩小主张或留在非公开工作区。
