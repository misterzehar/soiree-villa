---
target: app/onboarding
total_score: 15
p0_count: 2
p1_count: 2
timestamp: 2026-07-09T23-46-46Z
slug: app-onboarding
---
Method: dual-agent (A: a373100b0eea65447 · B: a7b3ee8bb06c7c362)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Progress bar exists; formula overestimates 1 step; submit is static text with no duration signal |
| 2 | Match System / Real World | 3 | French copy natural; no explanation of why questions are asked |
| 3 | User Control and Freedom | 0 | Zero back navigation; cards disabled 0ms after tap; only escape is Refaire le quiz 15 questions later |
| 4 | Consistency and Standards | 1 | 3 distinct button patterns: ghost unselected, solid selected, solid result CTA |
| 5 | Error Prevention | 2 | Double-tap guarded; no autosave; no debounce |
| 6 | Recognition Rather Than Recall | 3 | Both options visible; axis poles labeled at both ends |
| 7 | Flexibility and Efficiency | 1 | 4.2s mandatory dead time; no keyboard nav; no mid-quiz resume |
| 8 | Aesthetic and Minimalist Design | 2 | Quiz clean; result has 8 simultaneous content sections, 3 identical cards |
| 9 | Error Recovery | 0 | No try/catch on submitOnboarding; network failure = permanent lock, 15 answers lost |
| 10 | Help and Documentation | 1 | No purpose explanation; no axis definitions; no privacy disclosure |
| **Total** | | **15/40** | **Poor** |

## Anti-Patterns Verdict

The quiz screen is defensible. The result screen matches the modal AI personality-quiz-result template (gradient blob + emoji circle + name + trait pills + glassmorphic cards + solid CTA). A category-aware observer identifies it in under 200ms. The brand signature color #D4AF37 is used zero times across both screens.

**11 absolute ban violations confirmed:**
- Glassmorphism decorative: 2 cards with backdrop-blur-sm
- Uppercase tracked eyebrow x3: TU PREFERES, TON PROFIL SOCIAL, TES 6 AXES
- Ghost-Only Rule: result primary CTA is solid fill
- No-Card-Border at rest: ChoiceCard unselected has border-2
- Flat-by-Default: ChoiceCard has shadow-sm at rest
- Rounded CTAs: rounded-2xl on ChoiceCard and all result CTAs
- Featherweight Rule: profile name font-bold
- Canvas-or-White Rule: result gradient overlay is neither canvas nor bg-bg
- Decorative gradient fills: emoji badge and axis bars
- One Voice Rule: gold absent from both screens
- Identical card structure: 3 cards all rounded-2xl border border-border p-5 mb-5

**Detector scan**: Exit 0, no findings. Coverage gap confirmed by Assessment B: the .tsx regex engine covers only ~9 CSS-syntax rules; ~30+ DOM-computed rules were not reached. Manual inspection confirms what the DOM rules would have caught.

## Overall Impression

The quiz interaction is well-structured. The result screen breaks nearly every rule in the design system and looks like a different product. The submit action has a fatal error path.

## What's Working

1. Binary choice architecture — 2 options, no middle ground, forward momentum. Correct for axis-based profiling.
2. Card exit animation — rotated fly-off (exitA: rotate -6, exitB: rotate 6) is the only element with theatrical register.
3. "ou" separator — horizontal line with "ou" gives the binary structure rhythm without cognitive load.

## Priority Issues

**[P0] Fatal error trap on submit**
No try/catch around submitOnboarding. Network failure = permanent lock, 15 answers destroyed.
Fix: wrap in try/catch, show inline retry error.
Command: /impeccable harden

**[P0] Zero user control across 15 questions**
No back navigation. Cards disabled 0ms after tap. 15 irreversible questions.
Fix: store answers as ordered array, add back chevron below cards.
Command: /impeccable harden

**[P1] Ghost-Only Rule violated on primary CTA**
bg-primary text-white rounded-2xl shadow-md — 3 rule violations. Reads as generic consumer app.
Fix: Ghost Light pattern, flat, no radius, no shadow.
Command: /impeccable polish

**[P1] 11 ban violations on result screen**
Top 5: remove backdrop-blur-sm; remove TON PROFIL SOCIAL eyebrow; remove TES 6 AXES eyebrow; replace gradient axis bars with flat bg-primary; reduce border-2 to border on ChoiceCard.
Command: /impeccable quieter

**[P2] Profile reveal emotionally flat**
Profile name at font-bold text-2xl. Should be Display scale at font-light.
Fix: font-display font-light clamp(2.5rem,8vw,4.5rem) tracking-[-0.03em], stagger content 600ms after.
Command: /impeccable animate

**[P3] Or Nicois (#D4AF37) absent from both screens**
Fix: progress bar bg-gold; result CTA arrow text-gold. Max 2 elements per screen.
Command: /impeccable colorize

## Persona Red Flags

**Jordan**: No intro screen explaining quiz purpose. Submit loading has no duration signal. Axis bars at 20% are opaque. No copy explaining what "Trouve ma soiree" commits to.

**Casey**: No mid-quiz persistence. 4.2s mandatory wait. Primary CTA below 8 content sections. hover states are dead code on touch.

**Camille (project-specific, 28, Nice professional, guarded)**: No GDPR disclosure before cookie write. "Partager mon profil" — no explanation of what is shared. "Tu matches avec" implies consent-free matching. Glassmorphic gradient aesthetic reads as dating app to a user evaluating brand trust.

## Minor Observations

1. Progress bar shows 6.67% at Q1 before any answer.
2. "ou" separator exits with card animation — should be outside AnimatePresence.
3. PROFILE_GRADIENTS has 20 entries but MVP specs 6 profiles.
4. Axis bar at max negative shows 20%, not 0%.
5. Progress bar missing role=progressbar ARIA.
6. Submit loading text not in aria-live region.
7. Profile emoji has no aria-label.
8. chosen scale + exit animation compound stutter risk on low-end devices.
9. font-display on choice labels — reserves display font for body-copy-length text.

## Questions to Consider

1. Does the quiz need to be 15 uninterrupted questions? The brand grammar is Comprendre/Vivre/Oser — three acts with breaks at Q5 and Q10 would reduce midpoint abandonment.

2. What if the result were a moment rather than a page? Profile name fills viewport at Display scale for 1200ms, then supporting content appears in staggered sections.

3. Where is Soirée Villa's voice in the structural copy? "Ce que tu es, revele" instead of "Ton profil social" costs 4 words. The difference between a form and "La Loge Privee" lives here.
