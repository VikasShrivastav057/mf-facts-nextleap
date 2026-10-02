# Demo recording — about 2 minutes 30 seconds

Record your screen using a phone or desktop screen recorder. No backend screenshots, account login or personal details are needed.

**0:00–0:20 — Introduce the scope.** “This is MF Facts, my NextLeap Milestone 4 prototype for the selected product Groww. It covers three HDFC Mutual Fund schemes and uses 22 official public AMC and AMFI sources. It is an independent learning prototype.” Show the welcome line, three example questions and facts-only disclaimer.

**0:20–0:45 — Factual question.** Click “Minimum SIP for Flexi Cap”. Point to the answer, the official source link and “Last updated from sources”. Open the source briefly if desired.

**0:45–1:05 — Lock-in and risk.** Click the ELSS lock-in example. Then type “Riskometer of HDFC Large Cap Fund?” Show the brief answer and citation.

**1:05–1:25 — Plan clarification.** Ask “Expense ratio of HDFC Flexi Cap Fund?” with no plan selected. Show the Direct/Regular clarification. Select Direct and ask again. Explain that the value is a dated snapshot, not a live quote.

**1:25–1:45 — Refusal.** Ask “Should I buy HDFC Flexi Cap?” Show the polite refusal and educational link. Ask “Compare 5-year returns” and show the official-factsheet direction.

**1:45–2:05 — Statement guide.** Click the capital-gains statement example. “The assistant sends users to the official AMC workflow. It never asks them to enter identity information here.”

**2:05–2:30 — Explain retrieval and files.** “The zero-install demo filters and ranks reviewed fact chunks with BM25, then renders the matched answer with its official source. The package also contains the full class-style pipeline: MiniLM embeddings, ChromaDB cosine retrieval, prompt augmentation and Ollama generation, all running locally without an API key. The submission has 22 official source URLs, ten sample answers and 66 passing browser checks.”

Do not enter real PII during a demonstration. Avoid claiming that the hosted app uses ChromaDB or an LLM; demonstrate `class_style_rag.py` separately if you installed its local dependencies.
