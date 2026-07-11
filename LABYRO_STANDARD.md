# The Labyro Standard

What "done right" means for this product. Every change is held to this — by
machine checks where possible (`frontend/e2e/verify.cjs`, run in CI on every
PR), by review judgment where not. When a check and this document disagree,
fix whichever one is wrong; don't game the check.

## Trust & honesty
1. **Never fake social proof.** No invented testimonials, fabricated numbers,
   or placeholder quotes presented as real. Pain-point framing is fine; fake
   people are not.
2. **Badges mean something.** "Verified" appears only when the underlying fact
   (confirmed university email) is true in the database.
3. **Copy tells the truth about behavior.** Dialogs, emails, and helper text
   must describe what the system actually does (e.g., deleting a project keeps
   its applications; links that never expire are not described as expiring).

## Reliability
4. **No dead ends.** Every clickable element leads somewhere real. Every route
   renders; a crashed React tree (blank page) is a release blocker.
5. **Errors are specific and human.** API failures surface the server's
   message, not a generic toast, wherever the server provides one.
6. **One bad subsystem never takes down the site.** Notification/email/AI
   failures degrade quietly; they must not fail the request that triggered
   them, and no error may crash the Node process.
7. **Normal usage is never rate-limited.** Strict limits only on abuse-prone
   auth endpoints. Assume whole campuses share one IP.

## Accessibility
8. Interactive icon-only controls have accessible names; dropdowns close on
   Escape and outside click; keyboard paths work for core flows.
9. No content hidden from sighted users but exposed to screen readers (or the
   reverse) to satisfy a requirement cosmetically.
10. Zero **critical** axe violations on any checked route (machine-enforced);
    serious ones are logged and burned down.

## Product voice & brand
11. Palette: slate surfaces, `#2563EB` primary, emerald accents; Fraunces for
    display, Inter for body. New UI reuses the shared classes (`btn-*`,
    `card`, `badge-*`, `input`) rather than inventing one-off styles.
12. Tone: direct, specific, academic-adjacent; no startup hype-speak, no
    exclamation-mark enthusiasm in product copy.

## Process
13. **Every claim of "it works" is backed by an executed check** — a browser
    run, a test, or a reproduced fix — never by reading the code and assuming.
14. Schema changes ship with both the Prisma migration file **and** the
    idempotent SQL for Neon (until `migrate deploy` runs in the Render build),
    and the PR description says which must run first.
