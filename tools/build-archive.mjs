import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=new URL('../',import.meta.url), box={window:{}};
vm.runInNewContext(readFileSync(new URL('data.js',root),'utf8'),box);
writeFileSync(fileURLToPath(new URL('evidence-archive.json',root)),JSON.stringify({format:'rpb-evidence-archive',schema:1,version:box.window.RPB.meta.version,data:box.window.RPB},null,2)+'\n');
