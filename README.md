# MF Facts — NextLeap Milestone 4

**Selected product: Groww. AMC: HDFC Mutual Fund. Snapshot checked: 30 September 2026.**

Independent fellowship prototype, not an official Groww product or an integration with a Groww account. Keep Groww as the selected product for later milestones unless the fellowship approves a change.

## Scope

| Scheme | Category | Supported plans |
|---|---|---|
| HDFC Large Cap Fund | Large-cap equity | Direct and Regular for TER |
| HDFC Flexi Cap Fund | Flexi-cap equity | Direct and Regular for TER |
| HDFC ELSS - Tax Saver Fund | ELSS | Direct and Regular for TER |

Supported facts: observed expense ratio, minimum SIP, lock-in, exit load, scheme riskometer, benchmark, scheme category, SID/KIM/Fund Facts links, account statement and capital-gains statement directions. All responses, including refusals and clarification requests, contain one official citation link and “Last updated from sources”. Answer bodies are limited to two sentences, leaving the date as metadata.

## Run the working prototype

**Easiest:** unzip the submission package and open `MF_Facts_Offline.html` in Chrome, Edge or Firefox. Everything needed for the assistant is embedded; no installation or API key is required. The source links require internet access. The hosted version also provides downloads of the required submission documents.

**Serve the modular app:** from the project directory, run:

```bash
python -m http.server 8000 --directory dist
```

Then visit `http://localhost:8000`. This uses only Python's standard library. Questions are processed in the browser; the static server never receives them. The standalone file's document-download links refer to `dist/` in the unzipped package.

## Retrieval and answer generation

1. Collect 22 public official documents: 6 scheme plan pages, 6 SID/KIM PDFs, 3 Fund Facts PDFs and 7 disclosure, statement, factsheet, risk or security pages. `sources.csv` lists every URL, retrieval time, resolved URL, content hash and verification status.
2. Extract source text and review relevant facts. Remove performance, suitability and promotional content from the answer corpus. Produce 41 atomic, paraphrased fact chunks with source IDs, URLs, scheme, plan, topic and observation date in `dist/corpus.json`. These are curated facts, not a whole-document embedding index.
3. Reject common PII, investment advice, performance and instruction-override requests before retrieval. Identify the requested fact; clarify missing scheme/plan or multiple facts.
4. Filter chunks by scheme, topic and plan; rank eligible evidence using BM25 lexical retrieval. The exact chunk ID and score are returned by the engine for inspection. A lack of eligible evidence produces abstention.
5. Generate a concise answer from the reviewed matched chunk and attach its source and date programmatically. The browser uses **constrained generation, not a remote generative LLM**. This keeps the working demo free of API dependencies.
6. `class_style_rag.py` adds the complete **class-aligned vector RAG**: local MiniLM embeddings, a persistent ChromaDB vector store, cosine top-k retrieval, prompt augmentation and local Ollama generation. The model must select one retrieved evidence ID, and Python attaches that record's verified URL and date. No API key is required.
7. `ollama_rag.py` provides an even more conservative optional mode in which Ollama only selects evidence and the final wording comes from the reviewed chunk.

The browser is a retrieval-grounded FAQ prototype. `class_style_rag.py` is the full vector-RAG variant matching the course pipeline. Do not describe the hosted browser demo as using ChromaDB or an LLM. The supplied system prompt documents instruction style, safe refusals and citation behavior.

## Optional local LLM setup — no API key

Install Python 3.10+, Node.js 18+ and Ollama. Then run `python -m pip install -r requirements-local-rag.txt`, `ollama pull qwen3:4b`, `python class_style_rag.py --index`, and `python class_style_rag.py "What is the benchmark for HDFC Large Cap Fund?"`. No API key or per-request fee is required. See `CLASS_STYLE_RAG_GUIDE.md` for the course-concept mapping and `LOCAL_MODEL_GUIDE.md` for the constrained-selector alternative.

## Refresh the sources

```bash
python -m pip install pypdf
python collect_sources.py
```

This downloads and hashes only allowlisted public HDFC/AMFI sources; it creates local research intermediates. Inspect changed documents and update `build_corpus.py`'s reviewed facts, date wording and expectations before running `python build_corpus.py`. Refreshing the source list alone does **not** refresh the deployed answers. Re-embed the revised corpus in the HTML, regenerate the standalone file, validate and republish. Do not claim today's rates from an older snapshot. The shipped snapshot has been reviewed and verified; the refresh script is a maintenance aid, not automatic production ingestion.

## Verification

```bash
node evaluate.js
```

66 meaningful cases passed in `validation.json`: facts, plan-specific TERs, Total Return Index wording, clarification, source coverage, date metadata, response length, short OTP/PIN and other PII formats, prompt override, advice, performance, out-of-scope AMCs, platform-specific questions and unsupported time periods. `dist/sample_qa.md` contains ten actual engine responses. All 22 public sources were successfully downloaded and are represented in retrieval. The optional Ollama failure path was tested; a local model was not downloaded in this environment.

## Privacy

No account login, transaction tools, analytics, conversation history, localStorage, cookies or query logging are implemented in the assistant. Common PII formats are blocked locally and the input is cleared without echoing the value. Identifiers are never sent to the optional model after a detected PII rejection. Format detection cannot guarantee recognition of all deliberately obfuscated or written-out identifiers; users must follow the no-PII instruction. The hosting service may retain ordinary access metadata; the assistant does not submit questions to it.

## Known limits

- English, one fact and one scheme per question. No conversational memory; dropdowns provide explicit context.
- BM25 and conservative intent rules can miss unusual wording; clarify or abstain instead of inventing facts.
- Source snapshot, not live data. TER and risk labels can change. TER values reflect what the AMC plan pages displayed when checked; their effective dates were not stated.
- The generic minimum SIP field does not prove every SIP frequency, minimum instalment count or Groww-specific registration condition.
- Older SID/KIM documents may require subsequent addenda. Current scheme pages supply snapshot facts; document links are references, not a claim that their original terms are unchanged.
- No investment recommendations, suitability judgments, return calculation/comparison, tax advice, account actions or personal statement retrieval.
- Statement guides link to the AMC's official workflow; they do not describe unverified Groww app screens.
- The Site starts private. A reviewer may not have access to the hosted link; submit the offline HTML/package or record the supplied under-three-minute demo if sharing is unavailable.
- The class-aligned vector path requires Python dependencies, a downloaded MiniLM model, ChromaDB and Ollama. The immediate browser demo does not. Milestone 5's review analysis/MCP/email workflow is outside this Milestone 4 submission.

## Submission contents

`MF_Facts_Offline.html`, working modular app in `dist/`, `sources.csv`, `README.md`, `sample_qa.md`, `disclaimer.txt`, `system_prompt.md`, `CLASS_STYLE_RAG_GUIDE.md`, `class_style_rag.py`, `requirements-local-rag.txt`, `LOCAL_MODEL_GUIDE.md`, `ollama_rag.py`, `validation.json`, `submission_notes.md`, `demo_script.md`, and source/maintenance scripts.
