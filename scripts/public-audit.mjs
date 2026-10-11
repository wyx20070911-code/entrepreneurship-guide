import {readdir,readFile,lstat} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {spawnSync} from 'node:child_process';

export function auditText(path,text,ids){
  const issues=[];
  if(/(?:^|\/)(?:\.local|outputs|work|node_modules|\.astro|deliveries)(?:\/|$)|\.(?:zip|bak|pdf|docx|mp4|png|jpg)$/i.test(path))issues.push('非公开目录或未审计附件');
  if(/(?:[A-Za-z]:[\\/](?:Users|Documents|Windows)|file:\/\/|\/Users\/|\/home\/[^/]+\/)/i.test(text))issues.push('本机路径');
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9]{30,})\b/.test(text))issues.push('疑似密钥');
  if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text))issues.push('个人邮件地址需人工确认');
  for(const id of new Set(text.match(/\bE-\d{4}\b/g)??[]))if(!ids.includes(id))issues.push('非公开条目标识');
  if(path.startsWith('content/articles/')&&path.endsWith('.json')){
    try{const record=JSON.parse(text);if(record.state!=='published'||record.research||record.history||record.guide||record.body)issues.push('非公开状态、内部记录或重复正文');}
    catch{issues.push('无效元数据');}
  }
  return [...new Set(issues)].map(issue=>path+': '+issue);
}
export async function auditPublic(root){
  root=resolve(root);const manifest=JSON.parse(await readFile(resolve(root,'publication-manifest.json'),'utf8'));
  const issues=[],files=[];
  async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
    if(entry.name==='.git'||entry.name==='node_modules'||entry.name==='.astro'||entry.name==='dist')continue;
    const path=resolve(dir,entry.name),name=relative(root,path).split(sep).join('/');
    if((await lstat(path)).isSymbolicLink()){issues.push(name+': 不允许符号链接');continue;}
    if(entry.isDirectory())await walk(path);else{files.push(name);if(!manifest.files.includes(name))issues.push(name+': 不在公开白名单');issues.push(...auditText(name,await readFile(path,'utf8'),manifest.articleIds));}
  }}
  await walk(root);for(const name of manifest.files)if(!files.includes(name))issues.push(name+': 白名单文件缺失');
  const git=spawnSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'});
  const history=[];
  if(git.status===0&&resolve(git.stdout.trim())===root){
    const revs=spawnSync('git',['rev-list','--all'],{cwd:root,encoding:'utf8'});
    if(revs.status!==0)throw new Error('无法检查待推送历史');
    for(const sha of revs.stdout.trim().split('\n').filter(Boolean)){
      history.push(sha);const tree=spawnSync('git',['ls-tree','-r','--name-only',sha],{cwd:root,encoding:'utf8'});
      for(const name of tree.stdout.trim().split('\n').filter(Boolean)){
        if(!manifest.files.includes(name))issues.push('历史 '+sha+': 非白名单文件 '+name);
        const blob=spawnSync('git',['show',sha+':'+name],{cwd:root,encoding:'utf8',maxBuffer:5*1024*1024});
        if(blob.status!==0)issues.push('历史文件无法检查');else issues.push(...auditText(name,blob.stdout,manifest.articleIds).map(x=>'历史 '+sha+': '+x));
      }
    }
  }
  return {checkedAt:new Date().toISOString(),files:files.length,articles:manifest.articleIds.length,historyCommits:history.length,history,issues:[...new Set(issues)],scope:'白名单、工作树及本仓库全部可达提交；无Git时不伪称已审计远程历史。模式扫描不代替权利/隐私人工判断。'};
}
if(process.argv[1]?.endsWith('public-audit.mjs')){const report=await auditPublic(process.argv[2]??'.');console.log(JSON.stringify(report,null,2));if(report.issues.length)process.exitCode=1;}
