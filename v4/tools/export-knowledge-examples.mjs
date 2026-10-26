import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),box={window:{}};
for(const file of ['data.js','impact.js','knowledge.js','knowledge-examples.js'])vm.runInNewContext(readFileSync(join(root,file),'utf8'),box);
const D=box.window.RPB,K=box.window.RPB_KNOWLEDGE,E=box.window.RPB_KNOWLEDGE_EXAMPLES;
const lines=['# Community knowledge examples — illustrative prompts only','', 'These '+E.length+' invented scenarios are discussion prompts, not evidence about actual communities. Do not enter them as observed facts. Capture your own supported local account with context, source, limitations, review and permission.',''];
for(const b of D.bridges){lines.push('## '+b.short,'');for(const e of E.filter(x=>x.bridgeId===b.id))lines.push('**'+K.kinds[e.kind]+'**','','> '+e.statement,'','Discussion prompt: '+e.prompt,'');}
writeFileSync(join(root,'COMMUNITY_KNOWLEDGE_EXAMPLES.md'),lines.join('\n'));
console.log('Wrote '+E.length+' illustrative prompts to COMMUNITY_KNOWLEDGE_EXAMPLES.md.');
