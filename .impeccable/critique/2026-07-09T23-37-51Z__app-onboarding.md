---
target: app/onboarding
total_score: 15
p0_count: 2
p1_count: 2
timestamp: 2026-07-09T23-37-51Z
slug: app-onboarding
---
# Assessment A — Design Review: Soirée Villa Onboarding Flow

## Design Health Score

| # | Heuristic | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Visibility of System Status | 2 | Progress bar exists but formula runs one question ahead; submission state is a static text line |
| 2 | Match System / Real World | 3 | French copy natural; no context for WHY questions are asked |
| 3 | User Control and Freedom | 0 | Zero back navigation; both cards disabled 0ms after tap; no undo across 15 questions |
| 4 | Consistency and Standards | 1 | Selected ChoiceCard = solid fill; unselected = surface; result CTA = solid fill; three patterns where one should exist |
| 5 | Error Prevention | 2 | Double-tap guarded; no autosave; no mis-tap recovery |
| 6 | Recognition Rather Than Recall | 3 | Both options visible simultaneously; axis poles labeled; no memory burden |
| 7 | Flexibility and Efficiency | 1 | 280ms forced wait × 15 = 4.2s dead time; no keyboard nav; no resume |
| 8 | Aesthetic and Minimalist Design | 2 | Quiz: clean. Result: 8 sections simultaneously, 3 identical cards, 2 gradient layers |
| 9 | Error Recovery | 0 | submitOnboarding no try/catch; failure = infinite loading, UI permanently locked |
| 10 | Help and Documentation | 1 | No axis explanations; no privacy statement; no contextual help |
| **Total** | | **15/40** | **Poor** |

## Anti-Patterns Verdict

### Ban Violations Confirmed (11)

| Ban | Where |
|-----|-------|
| Glassmorphism decorative | result-animated.tsx: 2 cards with backdrop-blur-sm |
| Uppercase tracked eyebrow | "TU PRÉFÈRES ?" (quiz) · "TON PROFIL SOCIAL" · "TES 6 AXES" (result) |
| Ghost-Only Rule | Result CTA: bg-primary solid fill |
| No card border at rest | ChoiceCard: border-2 border-border unselected |
| Flat-by-Default | ChoiceCard: shadow-sm at rest |
| Rounded CTAs | ChoiceCard + result CTAs: rounded-2xl |
| Featherweight Rule | Profile name: font-bold (should be weight 300) |
| Canvas-or-White Rule | Result gradient overlay produces tinted surface |
| Decorative gradient fills | Emoji badge + axis bars use from-primary to-secondary gradient |
| One Voice Rule (Gold absent) | #D4AF37 absent from both screens |
| Identical card structure | Description card, axes card, matches card all identical |

## Priority Issues

### [P0] Fatal error trap on submit
submitOnboarding has no try/catch. Failure = permanent "Calcul de ton profil…" with locked UI.
Fix: wrap in try/catch, reset submitting on error, show recovery action.
Command: /impeccable harden

### [P0] Zero user control across 15 questions
No back navigation. Cards disabled 0ms after tap. Mis-tap is irreversible.
Fix: Store answers as array, add back chevron, decrement currentIndex on tap.
Command: /impeccable harden

### [P1] Ghost-Only Rule violated on primary CTA
bg-primary solid fill button with rounded-2xl and shadow-md. Banned three times over.
Fix: Ghost Light pattern from design system. No fill, no radius, no shadow.
Command: /impeccable polish

### [P1] Five ban violations combine for generic SaaS aesthetic on result screen
Glassmorphism, eyebrow scaffolding, gradient fills, card borders, identical cards.
Fix: Systematic pass against DESIGN.md.
Command: /impeccable quieter

### [P2] Profile reveal moment is undersized
Profile name at font-bold text-2xl. Should be Display scale (clamp 2.5-4.5rem) at weight 300.
The emotional peak is flat.
Fix: Display scale name, delay supporting content by 600ms minimum.
Command: /impeccable animate

### [P3] Gold (#D4AF37) absent from both screens
Brand signature color invisible. Flow looks like a generic blue/purple consumer app.
Fix: Progress bar fill = bg-gold; CTA arrows = text-gold.
Command: /impeccable colorize

## Persona Red Flags

### Jordan (Confused First-Timer)
- No intro screen; purpose of quiz unexplained
- No context for how profile is used for matching
- Axis bar percentages (20% for max negative) are opaque
- No indication of what happens after "Trouve ma soirée →"

### Casey (Distracted Mobile User)
- No mid-quiz persistence; abandonment at Q10 = restart from Q1
- 4.2s forced dead time across quiz
- Primary CTA below 8 content sections; secondary action nearer fold
- Potential long-label card stacking on small screens

### Camille (28, Nice, stylish, guarded)
- No privacy statement; GDPR consent absent for sv_profile + sv_axes cookies
- "Partager mon profil" with no explanation of what is shared and to whom
- "Tu matches avec" passive voice — doesn't clarify if organizers are already notified
- No trust-building copy before "Trouve ma soirée →" commitment step

## Minor Observations

1. Progress bar overestimates (6.67% before first answer)
2. "ou" separator exits with card animation — structural element behaving as content
3. PROFILE_GRADIENTS comment implies 20 profiles vs 6 MVP profiles in docs
4. Axis bar at -1 = 20% fill, not 0% — misleading
5. font-display on ChoiceCard body text (should be system-ui)
6. Progress bar missing ARIA role/valuenow/valuemin/valuemax
7. "Calcul de ton profil…" not in aria-live region
8. Profile emoji has no aria-label
9. chosen scale (1.03) + exit animation can stutter on slow devices
10. handleShare referenced but not defined in provided code excerpt

## Questions to Consider

1. Does the quiz need to be a single uninterrupted form, or could 3 acts of 5 questions (mirroring Comprendre/Vivre/Oser) reduce abandonment at Q7-Q8 while echoing the brand's own grammar?
2. What if the result were a moment — profile name fills the screen at Display scale, pauses 1200ms, then reveals the full profile — rather than a page load?
3. Where is Soirée Villa's voice in the wrapper copy? "Ton profil social" is indistinguishable from BuzzFeed. One line per screen that is unmistakably the brand would cost nothing and change everything.
