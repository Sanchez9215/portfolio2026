# Case Study Pressure Test

Second-pass review that argues against an existing audit to sharpen it. Requires a completed `case-study-audit` doc. Trigger with the audit doc path (or the case study name — find its audit in `ReviewDoc/`). Produces a companion document in `ReviewDoc/`.

---

## Stance

Same hiring-manager persona and target impression as the audit (read them from the audit doc's header). But the job flips: **you are now the audit's adversary.** Every recommendation must survive a genuine attempt to kill it. The output is shorter and sharper than the audit — it prunes, reorders, and upgrades; it does not restate.

## Never do this

- **Never restate the audit.** Reference its findings by name/number; add only what scrutiny changed.
- **Never write strawman counters.** Each counter-argument must be the *strongest* case for leaving things as-is — strong enough that a smart author might already believe it. If you can't think of a real counter, say so in one line and move on.
- **Never protect your own prior verdicts.** Verdicts are allowed to change shape: hold / hold-reframed / hold-narrowed / downgraded-in-kind / dropped. A pressure test where all five survive unchanged is a failed pressure test — at minimum, counters should sharpen prescriptions.
- **Never introduce new hedging.** If a finding was blunt in the audit, it stays blunt or gets blunter.
- **Never touch code or rewrite the author's copy.**

## Required reading

1. The audit doc, in full.
2. The original case study, in full (re-read; do not work from memory of the audit). The pressure test's job includes catching what the audit missed — the strongest missing-evidence findings come from the second read.

---

## Deliverable structure

One doc: `ReviewDoc/review-<next-N>-<slug>-pressure-test.md`, opening line naming it a companion to the audit doc. Five parts:

### 1. The Top 5, after defending the other side

For each of the audit's five highest-leverage changes:
- *Strongest counter:* the best argument for leaving it as-is (author's intent, genre convention, honest-labeling defenses, "the content is load-bearing", export-artifact explanations).
- *Verdict:* one of hold / hold-reframed / hold-narrowed / downgraded / **dropped**. One sentence on why — and when the counter is partially right, absorb it into a sharper prescription (e.g. "don't cut the content — collapse the headers"; "the defect isn't the caption, it's the contradiction").
- If any drop, promote the next real issue into the five and say which. Close the section with a one-line tally of what changed shape.

### 2. Cuts ranked by regret

Reorder every cut/merge the audit recommended into three zones, so the author can cut deep where it's safe:
- **Zone A — a HM would never know these existed.** Duplicates, transitions, boilerplate. Cut without ceremony.
- **Zone B — a careful reader might notice.** Keep the substance, kill the container (name which sentence/idea must survive).
- **Zone C — a HM would actually miss these.** Headers only, never content — and name the untouchables (the sections that carry the portfolio's core evidence).

### 3. The one-impression test

Walk the study start to finish against the target impression. Bucket every section: **ADDS / NEUTRAL / DILUTES.** ADDS and NEUTRAL as compact inline lists; DILUTES as an ordered list by what each costs, with the cost mechanism named ("a broken promise costs more than a weak section", "taxes every ADD above it"). Every NEUTRAL or DILUTES entry is implicitly a cut/rewrite candidate.

### 4. Missing evidence that's already in hand

Exactly 3 places where a stronger claim sits unmade in the study's own material — a number implied but not stated, an ownership moment undersold, a systems insight left as screen description. For each: what to go find or add (the mechanism sentence, the specific artifact, the person to name), not just "this is weak". A runner-up is allowed as one line. Classic patterns: the study's own thesis proving itself in the ending unclaimed; an engineering conversation summarized in one clause; a public number one click away behind a link.

### 5. The 15-second verdict

Fifteen seconds = the intro screen only (title, summary, meta, impact blurbs, hero image). State what a HM sees, the yes/no verdict *today* with the real reason (often hygiene, not story), and **the single change most likely to flip a no to a yes** — one change, with the second-most-likely named parenthetically. If a portfolio-level issue surfaced (e.g. two case studies claiming the same win), append it as one closing note.

After writing, tell the user the doc path and lead with what changed: which verdicts moved, the safest deep-cut zone, and the single 15-second flip.
