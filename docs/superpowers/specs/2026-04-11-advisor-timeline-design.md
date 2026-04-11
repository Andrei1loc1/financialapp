# Advisor Timeline Design

## Summary

Add a new `Reactive Advisor Timeline` element to the Home screen that shows whether the user's current spending rhythm can carry them comfortably to day 30 of the month.

The feature should feel premium and simple:

- no traditional card chrome
- no opaque background
- one elegant advisor character
- one short message in plain language
- one thin 30-day line

The goal is instant comprehension in 1-2 seconds: "I am doing well", "I am close to the limit", or "I need to slow down".

## Product Goals

- Turn the dashboard from a passive report into an active financial signal
- Add personality without making the app feel childish
- Make the monthly budget projection understandable at a glance
- Reuse the existing budget model for a fast first version

## Placement

Insert the new element on Home in `Dashboard.tsx` above the existing `Ultimele 7 zile` section and below the stats row.

Final order in Home:

1. hero balance circle
2. AI insight card
3. stats row
4. advisor timeline
5. last 7 days chart
6. investment suggestion (existing behavior can stay below if still used)

## UX and Visual Design

The component should not appear inside a visible card.

Visual structure:

- advisor character on the left of the header row
- short advisor message on the right
- one thin horizontal line below
- character positioned on the line according to the user's projected day coverage
- subtle accent and glow only; no heavy panel background

Visual rules:

- transparent background
- premium fintech look
- simple, recognisable human-like advisor character
- no cartoon bounce or exaggerated expressions
- no timeline ticks or dense labels
- optional end labels only for day 1 and day 30

## Behavioral States

The component has three states:

- `green`: user is comfortably on track
- `yellow`: user is near the limit
- `red`: user is spending too quickly

State thresholds for v1:

- `green` when `estimatedDaysLeft >= 30`
- `yellow` when `estimatedDaysLeft >= 22 && estimatedDaysLeft <= 29`
- `red` when `estimatedDaysLeft < 22`

These thresholds are intentionally simple for the first release and should be easy to tweak later.

## Timeline Logic

The component should use the existing budget data:

- `estimatedDaysLeft`
- `currentBalance`
- `dailyBurnRate`

Primary visual driver:

- `estimatedDaysLeft`

Rules:

- clamp the display position to the `1..30` range
- compute position percentage from projected day coverage
- place the advisor character on that position across the line
- color the remaining segment toward day 30 based on state

Interpretation:

- if the user projects to day 30 or beyond, the advisor should appear near the good end of the line
- if the user projects to fewer days, the advisor should appear earlier on the path

## Messaging

Tone:

- premium
- calm
- simple words
- not preachy
- not funny or ironic

Message rules:

- only one short sentence visible at a time
- no formulas, no jargon
- message reflects conclusion, not calculation
- rotate between a small pool of messages per state to avoid repetition

Example messages:

### Green

- `Esti bine. Tine ritmul.`
- `Ritmul de acum te duce bine.`
- `Arata bine. Continua asa.`

### Yellow

- `E ok, dar esti cam la limita.`
- `Inca esti bine, dar mergi strans.`
- `Mai usor putin si ramai confortabil.`

### Red

- `Cheltui cam repede. Las-o mai usor.`
- `Ritmul de acum te duce prea repede.`
- `Daca mergi asa, ramai fara buffer.`

### Empty or Low Data

- `Adauga cateva cheltuieli si iti arat ritmul.`

## Animation

The component should feel alive but restrained:

- soft fade-in on mount
- smooth character reposition when budget data changes
- subtle expression or pose changes by state
- no infinite walking animation
- no playful bounce loops

## Technical Design

Create a dedicated UI component:

- `src/components/AdvisorTimeline.tsx`

Create a supporting utility:

- `src/utils/advisorTimeline.ts`

Utility responsibilities:

- derive advisor state from `estimatedDaysLeft`
- clamp the projected day
- convert projected day into line position percent
- return message text from the state

Dashboard responsibilities:

- fetch budget data as it already does
- render the advisor timeline above the `Ultimele 7 zile` section
- pass only the minimal data needed to the component

## Out of Scope for v1

- future salary events
- recurring income modeling
- detailed calendar markers
- category-level warnings on the timeline
- conversational assistant behavior
- backend or AI model changes

## Risks and Constraints

- `estimatedDaysLeft` is based on a simple burn-rate model, so the copy should imply guidance, not certainty
- the component must degrade gracefully when budget data is missing
- the component should not crowd the existing Home layout
- the advisor should feel premium, not childish

## Acceptance Criteria

- Home shows a new advisor timeline above `Ultimele 7 zile`
- the element has no visible card background
- a recognisable advisor character appears on the line
- the line reflects projected day coverage within a 30-day range
- the remaining segment is colored by budget state
- the message is short, simple, and state-aware
- the component works with missing data without breaking layout
