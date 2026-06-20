# Mode: apply — Live Application Assistant

Interactive mode for when the candidate is filling out an application form in Chrome. Reads what's on screen, loads the prior offer context, and generates personalized answers for each form question.

## Requirements

- **Best with Playwright visible**: In visible mode, the candidate sees the browser and Claude can interact with the page.
- **Without Playwright**: the candidate shares a screenshot or manually pastes the questions.

## Workflow

```
1. DETECT    → Read active Chrome tab (screenshot/URL/title)
2. IDENTIFY  → Extract company + role from page
3. MATCH    → Against existing reports in reports/
4. LOAD     → Read full report + Section G (if exists)
5. COMPARE  → Does the role on screen match the evaluated? If changed → warn
6. ANALYZE  → Identify ALL visible form questions
7. GENERATE → For each question, generate personalized answer
8. PRESENT  → Show formatted answers for copy-paste
```

## Step 1 — Detect the Offer

**With Playwright:** Take snapshot of the active page. Read title, URL, and visible content.

**Without Playwright:** Ask the candidate to:
- Share a screenshot of the form (Read tool reads images)
- Or paste the form questions as text
- Or say company + role so we can search for it

## Step 2 — Identify and Load Context

1. Extract company name and role title from the page
2. Search in `reports/` by company name (case-insensitive Grep)
3. If there's a match → load the full report
4. If there's Section G → load the previous draft answers as base
5. If NO match → warn and offer to run quick auto-pipeline

## Step 3 — Detect Role Changes

If the role on screen differs from the evaluated one:
- **Warn the candidate**: "The role has changed from [X] to [Y]. Do you want me to re-evaluate or adapt the answers to the new title?"
- **If adapting**: Adjust answers to the new role without re-evaluating
- **If re-evaluating**: Run full A-F evaluation, update report, regenerate Section G
- **Update tracker**: Change role title in applications.md if applicable

## Step 4 — Analyze Form Questions

Identify ALL visible questions:
- Free text fields (cover letter, why this role, etc.)
- Dropdowns (how did you hear, work authorization, etc.)
- Yes/No (relocation, visa, etc.)
- Salary fields (range, expectation)
- Upload fields (resume, cover letter PDF)

Classify each question:
- **Already answered in Section G** → adapt existing answer
- **New question** → generate answer from report + cv.md

## Step 5 — Generate Answers

For each question, generate the answer following:

1. **Report context**: Use proof points from block B, STAR stories from block F
2. **Prior Section G**: If there's a draft answer, use it as base and refine
3. **"I'm choosing you" tone**: Same framework as auto-pipeline
4. **Specificity**: Reference something concrete from the JD visible on screen
5. **career-ops proof point**: Include in "Additional info" if there's a field for it

**Output format:**

```
## Answers for [Company] — [Role]

Based on: Report #NNN | Score: X.X/5 | Archetype: [type]

---

### 1. [Exact question from form]
> [Answer ready for copy-paste]

### 2. [Next question]
> [Answer]

...

---

Notes:
- [Any observation about the role, changes, etc.]
- [Personalization suggestions the candidate should review]
```

## Step 6 — Post-apply (optional)

If the candidate confirms they submitted the application:
1. Update status in `applications.md` from "Evaluated" to "Applied"
2. Update Section G of the report with the final answers
3. Suggest next step: `/career-ops contact` for LinkedIn outreach

## Scroll Handling

If the form has more questions than are visible:
- Ask the candidate to scroll and share another screenshot
- Or paste the remaining questions
- Process in iterations until the entire form is covered