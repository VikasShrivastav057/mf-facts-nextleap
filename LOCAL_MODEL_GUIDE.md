# Optional local LLM mode — no API key

The hosted and offline demos work immediately without any model or API key. This optional route adds a genuine local LLM evidence-selection step using Ollama. The model runs on your computer; no question or source excerpt is sent to an external AI provider.

## What the local model can do

The main engine first blocks personal information, advice, performance requests and unsupported questions. It retrieves eligible reviewed evidence. The local model can select only one returned evidence ID or `ABSTAIN`; it cannot create the financial answer or its URL. The program renders the final answer from the selected reviewed record.

This design limits hallucination and prompt-injection risk while demonstrating LLM use. The hosted demo intentionally does not claim to use this local model because a website cannot assume that a reviewer has Ollama installed.

## Windows setup

1. Install Ollama from [ollama.com/download](https://ollama.com/download).
2. Open PowerShell in the unzipped project folder.
3. Download a small model once:

   ```powershell
   ollama pull qwen3:4b
   ```

4. Ask a question:

   ```powershell
   python ollama_rag.py "What is the exit load for HDFC Flexi Cap Fund?" --model qwen3:4b
   ```

No API key or paid API plan is required. The model download uses disk space and local CPU/RAM. Exact speed depends on the computer. If Ollama is unavailable or returns malformed output, the program uses the already validated deterministic answer and labels it as a fallback.

## What to say in the project demo

“The public prototype is a no-key closed-domain retrieval assistant. I also implemented an optional local LLM evidence selector with Ollama. Safety checks and retrieval run before the model, the model may select only an eligible evidence ID, and the final answer and citation come from a reviewed official-source record.”

Do not say the hosted website itself uses Ollama. Use this local command during the demo if you want to demonstrate the LLM path.
