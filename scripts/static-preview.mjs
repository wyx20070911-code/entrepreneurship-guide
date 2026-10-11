import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root=resolve(process.argv[2] ?? 'dist');
const port=Number(process.argv[3] ?? 4324);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url ?? '/','http://127.0.0.1:'+port).pathname);
    let file=resolve(root,'.'+pathname);
    if (file!==root && !file.startsWith(root+sep)) throw new Error('unsafe path');
    try { if ((await stat(file)).isDirectory()) file=resolve(file,'index.html'); } catch { if (!extname(file)) file=resolve(file,'index.html'); }
    const body=await readFile(file);
    res.writeHead(200,{'content-type':types[extname(file)] ?? 'application/octet-stream'}); res.end(body);
  } catch {
    try { const body=await readFile(resolve(root,'404.html')); res.writeHead(404,{'content-type':'text/html; charset=utf-8'}); res.end(body); }
    catch { res.writeHead(404); res.end('Not found'); }
  }
});
server.listen(port,'127.0.0.1',()=>console.log('Static preview: http://127.0.0.1:'+port+'/ from '+root));
