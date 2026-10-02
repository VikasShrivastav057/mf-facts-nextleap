"""Build reviewed atomic facts from the verified public-source snapshot."""
import json,re
from pathlib import Path
ROOT=Path(__file__).parent
sources=json.loads((ROOT/'dist/sources.json').read_text()); by={s['id']:s for s in sources}
cards=[]
names={'flexi':'HDFC Flexi Cap Fund','large':'HDFC Large Cap Fund','elss':'HDFC ELSS - Tax Saver Fund'}
def add(id,source,topic,scheme,plan,question,answer,evidence_note):
 s=by[source];cards.append(dict(id=id,source_id=source,topic=topic,scheme=scheme,plan=plan,question=question,answer=answer,evidence_note=evidence_note,url=s['url'],source_title=s['title'],updated=s['retrieved_at'][:10]))
for k,name in names.items():
 for plan in ['direct','regular']:
  sid=k+'-'+plan;t=(ROOT/'research'/f'{sid}.txt').read_text()
  ter=re.search(r'to view the Total Expense Ratio\s+(\d+\.\d+)',t).group(1)
  sip=re.search(r'Min SIP\s+₹\s*(\d+)',t).group(1)
  assert 'Very High' in t
  benchmark='NIFTY 100 (Total Return Index)' if k=='large' else 'NIFTY 500 Total Returns Index'
  assert benchmark in t
  add(sid+'-ter',sid,'ter',k,plan,'Expense ratio TER annual fee management cost charges',f'The AMC page showed a total expense ratio of {ter}% for {name} — {plan.title()} Plan when checked on 30 September 2026. This is a source snapshot; the page does not state a TER effective date, and the rate may change.','Displayed TER field; observation date is distinct from effective date.')
  if plan=='regular':continue
  add(k+'-sip',sid,'sip',k,'any','Minimum SIP amount smallest monthly instalment investment',f'The AMC page lists a minimum SIP of ₹{sip} for {name}. SIP frequency and registration conditions should be checked in the scheme documents.','Min SIP field; this is the AMC minimum, not a Groww platform guarantee.')
  lock='a statutory three-year lock-in' if k=='elss' else 'no statutory lock-in listed on the AMC page'
  add(k+'-lock',sid,'lock',k,'any','Lock in lock-in duration redeem withdraw years',f'{name} has {lock}.'+(' A nil exit load does not allow redemption during the lock-in.' if k=='elss' else ' Exit-load rules still apply.'),'Lock in field and scheme description.')
  exit=f'{name} lists a nil exit load; the three-year lock-in still applies.' if k=='elss' else f'{name} lists a 1% exit load for redemption or switch-out within one year of allotment, and no exit load after one year.'
  add(k+'-exit',sid,'exit',k,'any','Exit load redemption fee withdrawal charge switch out',exit,'Exit Load section; historical lots and exceptional transactions require applicable documents.')
  add(k+'-risk',sid,'risk',k,'any','Scheme riskometer risk label rating level',f'The AMC page labels {name} as Very High risk in the source snapshot. Risk labels can change.','Scheme Riskometer field; not the benchmark riskometer.')
  add(k+'-benchmark',sid,'benchmark',k,'any','Benchmark index tracked compared TRI',f'The AMC page lists {benchmark} as the benchmark for {name}.','Benchmark field.')
  category={'flexi':'an open-ended equity scheme investing across large-, mid- and small-cap stocks','large':'an open-ended equity scheme predominantly investing in large-cap stocks','elss':'an open-ended Equity Linked Savings Scheme with a statutory three-year lock-in'}[k]
  add(k+'-category',sid,'category',k,'any','What is scheme fund category type description',f'{name} is {category}.','About the fund section.')
 for kind in ['sid','kim','facts']:
  s=k+'-'+kind
  topic=kind
  label={'sid':'Scheme Information Document (SID)','kim':'Key Information Memorandum (KIM)','facts':'Fund Facts document'}[kind]
  title=by[s]['title']
  add(s,s,topic,k,'any',label+' download document official',f'The official {label} for {name} is available at the source link. Use the AMC’s current disclosures and addenda for subsequent changes.',f'Official document verified; {title}.')
add('ter-definition','ter','ter-definition','general','any','What is TER expense ratio definition fee meaning where current disclosure','HDFC Mutual Fund publishes scheme expense-ratio disclosures on its official TER reports page. Select the relevant scheme, plan and disclosure date there.','Official disclosure reports page; no undated current-rate claim.')
add('statement-download','statement','statement','general','any','How download account consolidated statement CAS SOA','Open HDFC Mutual Fund’s official Download Statement page and complete verification there. Do not enter identity details or OTPs in this assistant.','Official page provides PAN/folio verification and statement-duration selection.')
add('statement-fee','statement','statement-fee','general','any','Account statement downloading receiving cost charge fee','HDFC Mutual Fund’s statement FAQ says receiving or downloading an account statement is free.','FAQ question on charges for receiving the Account Statement.')
add('capital-download','capital-gains','capital','general','any','How download capital gains tax profit loss statement report','Open HDFC Mutual Fund’s Request Statement page and follow the Capital Gains Statement link to its official investor portal. Complete authentication on that portal only.','Public Request Statement page includes a Capital Gains Statement link.')
add('factsheets-download','factsheets','factsheet','general','any','Official monthly factsheet download latest performance returns','Use HDFC Mutual Fund’s official factsheet page to find published scheme information. This assistant does not calculate, compare or predict returns.','Official factsheet archive.')
add('risk-education','risk-guide','risk-definition','general','any','Are mutual funds guaranteed principal safe can lose money risk meaning','AMFI explains that mutual fund investments involve risks, including possible loss of principal. Past results do not guarantee future results.','AMFI risk education page: general risk factors.')
add('riskometer-education','riskometer-guide','riskometer-definition','general','any','Where find riskometer disclosure risk o meter','AMFI provides a Risk-o-Meter disclosure information page. Select the disclosure type there to find the relevant information.','AMFI disclosure page; no scheme label inferred from an image.')
add('privacy-education','cyber','privacy','general','any','Privacy security PAN Aadhaar OTP account email phone personal information','Please keep identity details, account numbers and OTPs out of this assistant. Use the official AMC service for account-specific requests.','HDFC public cyber security awareness guidance.')
assert {x['source_id'] for x in cards}==set(by)
(ROOT/'dist/corpus.json').write_text(json.dumps({'reviewed_on':'2026-09-30','sources':sources,'cards':cards},ensure_ascii=False,indent=2))
print(f'{len(cards)} reviewed fact chunks from {len(sources)} sources')
