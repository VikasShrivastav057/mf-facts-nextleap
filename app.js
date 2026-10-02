'use strict';
const corpus=JSON.parse(document.getElementById('corpus-data').textContent);
const input=document.getElementById('question'),result=document.getElementById('result');
const labels={answer:'Source-grounded answer',privacy:'Personal information blocked',clarify:'A little more detail',refuse:'Facts-only boundary','out-of-scope':'Outside this prototype',abstain:'Not verified'};
function show(r){result.replaceChildren();
 const status=document.createElement('span');status.className='status';status.textContent=labels[r.status]||'Facts only';
 const p=document.createElement('p');p.className='answer';p.textContent=r.text;
 const a=document.createElement('a');a.className='citation';a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Source: '+r.source_title;
 const dt=document.createElement('p');dt.className='date';dt.textContent='Last updated from sources: '+new Date(r.updated+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 result.append(status,p);
 if(r.status==='answer'&&r.evidence_id){
  const box=document.createElement('div');box.className='evidence';
  const title=document.createElement('h3');title.textContent='Evidence used';
  const note=document.createElement('p');note.textContent=r.evidence_note||r.locator||'Reviewed fact from the cited official source.';
  const scope=document.createElement('p');scope.textContent='Matched record: '+r.evidence_id+' · '+(r.source_role||'Factual evidence');
  box.append(title,note,scope);result.append(box);
 }
 result.append(a,dt);
}
function ask(){const q=input.value;const r=MFFacts.answer(q,{scheme:document.getElementById('scheme').value,plan:document.getElementById('plan').value},corpus);if(r.status==='privacy')input.value='';show(r);}
document.getElementById('form').addEventListener('submit',e=>{e.preventDefault();ask();});
document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.q;ask();}));
document.getElementById('clear').addEventListener('click',()=>{input.value='';show({status:'clarify',text:'Ask one scheme fact, or use an example question to begin.',url:corpus.sources.find(s=>s.id==='factsheets').url,source_title:'HDFC Factsheets',updated:corpus.reviewed_on});input.focus();});
for(const s of corpus.sources){const li=document.createElement('li'),a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=s.title;li.append(a);document.getElementById('source-list').append(li);}
