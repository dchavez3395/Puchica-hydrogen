# Puchica WCAG 2.2 AA recovery matrix

Source tracker: `Copy of [TEMPLATE] Project Accessibility Sheets (2).xlsx`.
This matrix is an implementation and release aid; it is not a certification.

Use `Pass`, `Fail`, `Not applicable`, or `Not checked`. Never leave a blank cell
and interpret it as a pass. Every failure needs an owner, evidence, and retest.

| Area | WCAG 2.2 criteria | Required evidence | Status |
| --- | --- | --- | --- |
| Images and media | 1.1.1, 1.2.x | Meaningful alt for informative images; empty alt for decorative images; media alternatives where applicable | Not checked |
| Semantics and reading order | 1.3.1, 1.3.2, 1.3.5 | Landmarks, one visible H1, logical headings, native controls, programmatic input purpose, sensible linearized DOM order | Not checked |
| Sensory and orientation | 1.3.3, 1.3.4 | Instructions do not rely only on shape/position/colour; both orientations supported unless essential | Not checked |
| Colour and contrast | 1.4.1, 1.4.3, 1.4.11 | Contrast measurements for text, controls, focus indicators, and photo overlays; colour is not the only cue | Not checked |
| Resize, reflow, spacing | 1.4.4, 1.4.10, 1.4.12 | 200% text resize, 320 CSS px/400% reflow, text-spacing override, no lost content or horizontal page scroll | Not checked |
| Hover/focus content | 1.4.13 | Dismissible, hoverable, persistent content; keyboard parity for menus and disclosures | Not checked |
| Keyboard | 2.1.1, 2.1.2, 2.1.4 | Full keyboard path, no traps, character shortcuts disabled/remappable where applicable | Not checked |
| Timing and motion | 2.2.x, 2.3.x | Pause/stop controls for time-based content; no harmful flashing; reduced-motion respected | Not checked |
| Navigation and headings | 2.4.1–2.4.7 | Working skip link, descriptive titles/headings/links, logical focus order, visible focus | Not checked |
| Focus visibility | 2.4.11 | Focus is not fully obscured by sticky UI, drawers, or overlays | Not checked |
| Pointer and touch | 2.5.1–2.5.8 | No path-only gestures, down-event cancellation, label/name match, alternatives to motion/dragging, 24px minimum targets | Not checked |
| Language and consistency | 3.1.1, 3.1.2, 3.2.x | Correct document/part language, consistent navigation and control identity, no surprise context changes | Not checked |
| Forms and errors | 3.3.1–3.3.8 | Labels, instructions, explicit errors, suggestions, review/correction for financial actions, accessible authentication | Not checked |
| Name, role, value | 4.1.2 | Custom controls expose correct name, role, value, state, and relationships | Not checked |
| Status messages | 4.1.3 | Cart, validation, loading, and results updates are announced without forced focus | Not checked |

## Required viewports and modes

- Desktop at 1440 CSS px and a common laptop width.
- Mobile at 390 CSS px and narrow reflow at 320 CSS px.
- Mobile landscape.
- Browser text zoom at 200 percent.
- Increased text spacing using the WCAG 1.4.12 values.
- Keyboard-only navigation with visible focus.
- Reduced-motion preference.
- Screen-reader spot checks for the header, search, cart/status updates, product
  media, variant selection, accordions, errors, and checkout handoff.

## Changed-surface release record

For every pull request or production candidate, record:

1. Changed routes and components.
2. Applicable criteria from the table above.
3. Automated test command and result.
4. Manual test environment and result.
5. Screenshots or recordings for desktop and mobile.
6. Known exceptions, their customer impact, owner, and due date.
7. Retest result after remediation.
