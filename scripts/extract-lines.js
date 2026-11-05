const fs = require('fs');
const p = 'parents/IIH _ A short for parents_files/index(1).html';
const s = fs.readFileSync(p, 'utf8');
const i = s.indexOf('const D=');
let depth = 0, inStr = false, strCh = '', esc = false, j = i + 'const D='.length;
while (j < s.length && s[j] !== '{') j++;
for (; j < s.length; j++) {
  const c = s[j];
  if (inStr) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === strCh) inStr = false; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { j++; break; } }
}
if (s[j] === ';') j++;
const code = s.slice(i, j).replace('const D=', 'global.D=');
eval(code);
fs.mkdirSync('scripts', { recursive: true });
fs.writeFileSync('scripts/parent-lines.json', JSON.stringify({ en: global.D.en.s, hi: global.D.hi.s, mr: global.D.mr.s }, null, 2));
console.log('saved', global.D.en.s.length, 'lines');
