# GEO Rank MVP

A small local MVP for a GEO / AI visibility rank tracker.

What it does:
- Accepts brand name, website, category, ICP/use cases, competitors, and target buyer-intent queries.
- Estimates GEO visibility with deterministic semantic matching and competitor share-of-voice simulation.
- Returns score, estimated mention probability, average estimated rank, query-level evidence, and recommendations.

Important limitation:
This MVP does not yet call live ChatGPT/Claude/Gemini/Perplexity results. It is an explainable local scoring prototype. The next production step is to add live LLM sampling and citation/source retrieval.

Run:

```bash
npm install
npm test
npm run dev
```

Open the printed local Vite URL, usually:

```text
http://127.0.0.1:5173
```
