/* Reads ephemeral input on stdin; prints only a safe response, never the query. */
const fs=require('node:fs'),engine=require('./dist/engine.js');
const data=JSON.parse(fs.readFileSync('./dist/corpus.json','utf8'));
let s='';process.stdin.on('data',b=>s+=b);process.stdin.on('end',()=>{const r=JSON.parse(s);process.stdout.write(JSON.stringify(engine.answer(r.question,r.context||{},data)));});
