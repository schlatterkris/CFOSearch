# Mode: deep — Deep Research Prompt

Generates a structured prompt for Perplexity/Claude/ChatGPT with 6 axes:

```
## Deep Research: [Company] — [Role]

Context: I'm evaluating a candidate for [role] at [company]. I need actionable information for the interview.

### 1. AI Strategy
- What products/features do they use for AI/ML?
- What's their AI stack? (models, infra, tools)
- Do they have an engineering blog? What do they publish?
- What papers or talks have they given on AI?

### 2. Recent Movements (last 6 months)
- Any relevant AI/ML/product hires?
- Any acquisitions or partnerships?
- Any product launches or pivots?
- Any funding rounds or leadership changes?

### 3. Engineering Culture
- How do they ship? (deploy cadence, CI/CD)
- Mono-repo or multi-repo?
- What languages/frameworks do they use?
- Remote-first or office-first?
- Any Glassdoor/Blind reviews about eng culture?

### 4. Likely Challenges
- What scaling problems do they have?
- Reliability, cost, latency challenges?
- Are they migrating anything? (infra, models, platforms)
- What pain points do people mention in reviews?

### 5. Competitors and Differentiation
- Who are their main competitors?
- What's their moat/differentiator?
- How do they position against competition?

### 6. Candidate Angle
Given my profile (read from cv.md and profile.yml for specific experience):
- What unique value do I bring to this team?
- Which of my projects are most relevant?
- What story should I tell in the interview?
```

Customize each section with the specific context of the evaluated offer.