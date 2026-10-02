/* Local retrieval and constrained answer generation. No query storage or requests. */
(function(root){
'use strict';
const STOP=new Set('a an the is are of for to in on what how please me tell about hdfc fund mutual plan does can it its do and'.split(' '));
const norm=s=>String(s??'').toLowerCase().normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/[’']/g,'').replace(/[-–—]/g,' ').replace(/\s+/g,' ').trim();
const tokens=s=>norm(s).match(/[a-z0-9]+/g)?.filter(t=>!STOP.has(t))||[];
function hasPII(q){
 const x=norm(q).replace(/[०-९]/g,c=>String(c.charCodeAt(0)-0x0966)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x0660));
 return /[A-Z]{5}\s*\d{4}\s*[A-Z]/i.test(x)||/[\w.+-]+\s*@\s*[\w.-]+\.[a-z]{2,}/i.test(x)||/(?:\d[\s().+\-/]*){6,}/.test(x)||/\b(?:pan|aadhaar|aadhar|otp|folio|account\s*(?:number|no)|phone|mobile|email)\s*(?:is|:|=)\s*\S+/i.test(x)||/\b(?:otp|pin|folio|account number|account no)\b.{0,20}\d{3,}/.test(x)||/\b(?:my|mera|meri)\s+(?:otp|pan|aadhaar|aadhar|account|phone|email|mobile)\b/.test(x)||/\b\w+\s*(?:\[at\]|\(at\))\s*\w+\s*(?:\[dot\]|\(dot\))\s*[a-z]+/.test(x);
}
function topicOf(q,hasScheme=false){
 const x=norm(q);
 const financialTopics=[/expense|\bter\b/,/\bsip\b|instal+ment/,/exit load/,/lock/,/riskometer/,/benchmark|\btri\b/].filter(r=>r.test(x)).length;
 if((/statement|\bcas\b|\bsoa\b|factsheet|\bkim\b|\bsid\b/.test(x)&&financialTopics>0)||financialTopics>1)return ['multiple','facts'];
 if(/capital\s*gains?|tax\s*(statement|report)/.test(x))return ['capital'];
 if(/statement|\bcas\b|\bsoa\b/.test(x))return [/fee|charge|cost|free/.test(x)?'statement-fee':'statement'];
 if(/\bkim\b|key information/.test(x))return ['kim'];
 if(/\bsid\b|scheme information document/.test(x))return ['sid'];
 if(/fund facts/.test(x))return ['facts'];
 if(/factsheet|fact sheet/.test(x))return ['factsheet'];
 if(/(?:ter|expense ratio).*(?:mean|definition)|\bdefine\b.*(?:ter|expense ratio)/.test(x)||(!hasScheme&&/^(what is|explain) (?:the )?(ter|expense ratio)\??$/.test(x)))return ['ter-definition'];
 if(/(?:where|find|disclosure).*(?:riskometer|risk o meter)/.test(x))return ['riskometer-definition'];
 if(/guarantee|lose money|principal|risk.*meaning/.test(x))return ['risk-definition'];
 const ts=[];
 if(/expense|\bter\b|management (?:fee|cost)/.test(x))ts.push('ter');
 if(/\bsip\b|instal+ment|minimum.*invest|smallest.*invest/.test(x))ts.push('sip');
 const early=/elss|tax saver/.test(x)&&/redeem|withdraw/.test(x)&&/before|early|years?|lock/.test(x);
 if(/lock|locked/.test(x)||early)ts.push('lock');
 if(!early&&/exit|redeem|redemption|withdrawal (?:fee|charge)/.test(x))ts.push('exit');
 if(/riskometer|risk o meter|\brisk\b|risk label/.test(x))ts.push('risk');
 if(/benchmark|\btri\b|index/.test(x))ts.push('benchmark');
 if(/category|type|description|(?:what (?:is|s)|explain|describe|tell me about) (?:hdfc|this fund|a flexi|a large|an elss)/.test(x)&&!ts.length)ts.push('category');
 return [...new Set(ts)];
}
function bm25(query, docs){
 const qs=[...new Set(tokens(query))], ds=docs.map(d=>tokens(d.question+' '+d.answer+' '+d.evidence_note));
 const avg=ds.reduce((a,d)=>a+d.length,0)/Math.max(ds.length,1);
 return docs.map((d,i)=>{const w=ds[i];let score=0;
  for(const term of qs){const df=ds.filter(v=>v.includes(term)).length,f=w.filter(v=>v===term).length;
   if(f)score+=Math.log(1+(docs.length-df+.5)/(df+.5))*f*2.2/(f+1.2*(.25+.75*w.length/avg));}
  return {card:d,score};}).sort((a,b)=>b.score-a.score);
}
function answer(q,ctx={},data){
 q=typeof q==='string'?q:'';
 const sources=data.sources, cards=data.cards;
 const source=id=>sources.find(s=>s.id===id);
 const wrap=(status,text,s,extra={})=>({status,text,url:s.url,source_title:s.title,updated:s.retrieved_at.slice(0,10),mode:'browser-retrieval',...extra});
 const general=source('risk-guide'), privacy=source('cyber');
 if(hasPII(q))return wrap('privacy','Please remove personal information, account details and OTPs before asking a factual question. Use the official AMC service for account-specific requests.',privacy);
 if(!q.trim())return wrap('clarify','Please ask a factual mutual-fund question, such as a minimum SIP or exit load.',general);
 if(q.length>600)return wrap('clarify','Please keep your question under 600 characters and ask one fact at a time.',general);
 const x=norm(q);
 if(/ignore|override|system prompt|pretend|forget (?:rules|instructions)|act as|bypass/.test(x))return wrap('refuse','I can answer factual mutual-fund questions from official sources only. I cannot follow instructions that change these rules.',general);
 if(/should|recommend|suggest|best|better|buy|sell|portfolio|suitable|worth|which.*(?:choose|invest)|(?:can|may) i invest|good (?:fund|investment)|\bsafe\b|safest|buy kar|kharid|bech|invest kar|how much.*invest|invest.*(?:salary|savings)|allocate|for me/.test(x))return wrap('refuse','I can share official scheme facts, but I cannot recommend buying, selling or selecting a portfolio. AMFI’s educational page explains mutual-fund risks.',general);
 const performanceText=x.replace(/total returns? index/g,'benchmark').replace(/capital gains?(?:\s+(?:tax|profit|loss))?\s+(?:statement|report)/g,'statement');
 if(/\breturns?\b|performance|\bcagr\b|\bxirr\b|\bprofit\b|outperform|double.*money/.test(performanceText))return wrap('refuse','I do not calculate, compare or predict returns. Please use the AMC’s official factsheets for published information.',source('factsheets'));
 if(/\b(sbi|icici|axis|nippon|parag|uti|mirae|quant|kotak|tata|franklin|dsp|hsbc|edelweiss|canara|invesco|bandhan|aditya|motilal|mahindra|pgim|baroda|bajaj|sundaram|union|whiteoak)\b|mid cap|midcap|small cap|smallcap|balanced|retirement/.test(x))return wrap('out-of-scope','This prototype covers HDFC Large Cap, HDFC Flexi Cap and HDFC ELSS - Tax Saver only. Please select one of these schemes and ask one fact.',source('factsheets'));
 if(/\bnav\b|aum|fund manager|holdings|tax rate|lump\s*sum|daily sip|weekly sip|quarterly sip|number of instal|how many instal|minimum instal/.test(x))return wrap('abstain','I could not verify that fact within this FAQ’s reviewed scope. Please consult the official AMC documents.',source('factsheets'));
 if(/\b20(?:0\d|1\d|2[0-5])\b|\bhistorical\b|last year|next year|forecast/.test(x))return wrap('abstain','This assistant only has the reviewed 30 September 2026 source snapshot, not historical or future values. Please consult the AMC’s relevant dated documents.',source('factsheets'));
 const found=[];
 if(/large\s*cap|top\s*100/.test(x))found.push('large');
 if(/flexi\s*cap|flexicap|equity fund/.test(x))found.push('flexi');
 if(/elss|tax\s*saver|tax\s*saving/.test(x))found.push('elss');
 if(found.length>1)return wrap('clarify','Please ask about one scheme at a time so I can give one precise source link.',source('factsheets'));
 const scheme=found[0]||(['large','flexi','elss'].includes(ctx.scheme)?ctx.scheme:'');
 const ts=topicOf(q,!!scheme);
 if(ts.length!==1)return wrap('clarify',ts.length?'Please ask one fact at a time, for example an exit load or a minimum SIP.':'I could not verify that question within this FAQ’s scope; ask about TER, SIP minimum, lock-in, exit load, riskometer, benchmark or statements.',source('factsheets'));
 let topic=ts[0];
 if(/\bgroww\b/.test(x)&&['ter','sip','statement','statement-fee','capital'].includes(topic))return wrap('abstain','This corpus verifies AMC facts, not Groww-specific fees, limits or app screens. Ask for the HDFC AMC fact or use its official statement guide.',source('factsheets'));
 if(topic==='sip'&&!/minimum|min\b|smallest|least|amount|how much|\bsip\s*(?:of|for)\b|\bsip\??$/.test(x))return wrap('clarify','Do you mean the minimum SIP amount? This prototype does not verify every SIP registration rule.',source('factsheets'));
 if(topic==='statement'&&/pan|aadhaar|folio|otp|password|\bemail\b/.test(x))return wrap('abstain','Please check verification requirements directly on the official AMC statement page. Do not share identifiers or OTPs here.',source('statement'));
 let plan=/\bregular\b/.test(x)?'regular':/\bdirect\b/.test(x)?'direct':ctx.plan;
 if(/\bregular\b/.test(x)&&/\bdirect\b/.test(x))return wrap('clarify','Please specify either the Direct Plan or the Regular Plan for an expense-ratio question.',source('ter'));
 if(topic==='ter'&&!plan)return wrap('clarify','Which plan do you mean: Direct or Regular? Expense ratios are plan-specific.',source('ter'));
 if(!scheme&&!['statement','statement-fee','capital','factsheet','ter-definition','risk-definition','riskometer-definition'].includes(topic))return wrap('clarify','Please select HDFC Large Cap, HDFC Flexi Cap or HDFC ELSS - Tax Saver.',source('factsheets'));
 const candidates=cards.filter(c=>(c.scheme==='general'||c.scheme===scheme)&&(c.plan==='any'||c.plan===plan));
 const hits=bm25(q,candidates).filter(h=>h.card.topic===topic);
 if(!hits.length||hits[0].score<=0)return wrap('abstain','I could not verify that fact from the reviewed source snapshot. Please consult the official AMC documents.',source('factsheets'));
 const best=hits[0].card;
 if(new Set(hits.map(h=>h.card.answer)).size>1)return wrap('abstain','The reviewed evidence conflicts for this fact, so I cannot provide a verified value. Please check the official AMC disclosures.',source('factsheets'));
 const verifiedSource=source(best.source_id);
 if(!verifiedSource||best.url!==verifiedSource.url||!/^https:\/\/(?:www\.hdfcfund\.com|files\.hdfcfund\.com|www\.amfiindia\.com)\//.test(best.url)||best.updated>verifiedSource.retrieved_at.slice(0,10))return wrap('abstain','The evidence failed its source checks, so I cannot provide a verified answer. Please consult the official AMC documents.',source('factsheets'));
 return {status:'answer',text:best.answer,url:best.url,source_title:best.source_title,updated:best.updated,mode:'browser-retrieval',scheme,plan:topic==='ter'?plan:'any',topic,evidence_id:best.id,locator:best.locator||best.evidence_note,evidence_note:best.evidence_note,source_role:best.source_role||'Factual evidence',candidates_considered:candidates.length,retrieved:hits.slice(0,3).map(h=>({id:h.card.id,score:+h.score.toFixed(3)}))};
}
root.MFFacts={answer,hasPII,bm25,topicOf};
if(typeof module!=='undefined')module.exports=root.MFFacts;
})(typeof globalThis!=='undefined'?globalThis:this);
