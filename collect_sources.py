"""Refresh the official-source snapshot. Requires Python 3.10+ and pypdf."""
import csv, hashlib, io, json, re, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).parent
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.skip=0; self.out=[]
    def handle_starttag(self,t,a):
        if t in ('script','style','noscript'): self.skip+=1
    def handle_endtag(self,t):
        if t in ('script','style','noscript') and self.skip: self.skip-=1
    def handle_data(self,d):
        if not self.skip and d.strip(): self.out.append(d.strip())
def fetch(s):
    from urllib.parse import urlparse
    allowed={'www.hdfcfund.com','files.hdfcfund.com','www.amfiindia.com'}
    assert urlparse(s['url']).hostname in allowed
    req=urllib.request.Request(s['url'],headers={'User-Agent':'NextLeap-Milestone4-Research/1.0'})
    with urllib.request.urlopen(req,timeout=50) as r:
        assert urlparse(r.url).hostname in allowed
        b=r.read(); final=r.url; content_type=r.headers.get('Content-Type','')
    if b[:4]==b'%PDF':
        from pypdf import PdfReader
        text='\n'.join(p.extract_text() or '' for p in PdfReader(io.BytesIO(b)).pages)
    else:
        h=Text();h.feed(b.decode('utf-8',errors='replace'));text='\n'.join(h.out)
    assert len(text)>150,(s['id'],'empty response')
    # Raw public source text is a local research intermediate, not redistributed.
    dest=ROOT/'research';dest.mkdir(exist_ok=True)
    (dest/(s['id']+'.txt')).write_text(text,encoding='utf-8')
    return dict(s,resolved_url=final,retrieved_at=datetime.now(timezone.utc).isoformat(),sha256=hashlib.sha256(b).hexdigest(),text_chars=len(text),status='verified',content_type=content_type)
def main():
    sources=json.loads((ROOT/'sources_seed.json').read_text())
    with ThreadPoolExecutor(max_workers=6) as pool: records=list(pool.map(fetch,sources))
    (ROOT/'dist'/'sources.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
    with (ROOT/'dist'/'sources.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
    print(json.dumps({'verified_sources':len(records),'ids':[s['id'] for s in records]}))
if __name__=='__main__':main()
