# NextLeap Milestone 4 — Submission

**Project:** MF Facts — Facts-Only Mutual Fund FAQ Assistant  
**Product selected:** Groww  
**AMC selected:** HDFC Mutual Fund  
**Schemes:** HDFC Large Cap Fund, HDFC Flexi Cap Fund, HDFC ELSS - Tax Saver Fund

## Problem and outcome

Retail users and support teams need short, traceable answers to routine scheme questions. MF Facts retrieves reviewed official evidence and returns a concise fact with one citation and a source-check date. It refuses investment recommendations and performance requests and does not collect account information.

## Deliverables

| Brief requirement | Included evidence |
|---|---|
| Working app/notebook | Hosted prototype; offline HTML; optional local-LLM runner |
| 15–25 official sources | `sources.csv`: 22 verified HDFC AMC/AMFI URLs |
| Setup, scope, limits | `README.md` |
| 5–10 sample queries | `sample_qa.md`: 10 actual answers and links |
| UI disclaimer | `disclaimer.txt`, visibly included in app |
| Welcome + 3 examples | Working app's first screen |
| W1 exact fact / refuse | Guards, topic and scheme/plan routing; evaluation cases |
| W2 prompt style | `system_prompt.md`; local Ollama generation with strict structured output |
| W3 source-grounded retrieval | 41 reviewed chunks, MiniLM embeddings, ChromaDB, cosine retrieval and BM25 browser fallback |

## Technical disclosure

The hosted and offline browser demos use local BM25 retrieval with constrained answer generation, without a remote LLM. `class_style_rag.py` is the complete course-aligned path using local MiniLM embeddings, ChromaDB cosine retrieval, prompt augmentation and local Ollama generation. `ollama_rag.py` is a more conservative evidence-selector alternative. No API key or paid API is needed. The 66-case report covers the fully working browser safety and citation boundary; local vector components require the documented model downloads.

The corpus was checked on 30 September 2026. It is a fixed snapshot and does not guarantee current values after that date. Platform-specific Groww flows were not sourced because this brief restricts factual sources to official AMC/SEBI/AMFI pages.

## Before submitting

1. Open the prototype and try the three examples plus an advice question.
2. Submit the source list, README, sample Q&A and disclaimer along with the prototype link or offline package.
3. The hosted link is initially private; verify reviewer access before relying on it. If access cannot be arranged, record a demo using `demo_script.md` (about 2 minutes 30 seconds), as permitted by the brief.
4. If an evaluator specifically requires the class-style vector RAG, follow `CLASS_STYLE_RAG_GUIDE.md` and demonstrate `class_style_rag.py`. Do not claim the hosted browser version uses ChromaDB or an LLM.
5. Retain the selected product for subsequent milestones. Milestone 5 is a separate workflow and is not included here.
