# Puchica UI baseline

The project-wide source hierarchy and release requirements are defined in
`docs/puchica-operating-quality-gates.md`. This file remains the compact design
system implementation baseline.

This is the local implementation baseline for the storefront. It is aligned to
the linked **Project Accessibility Sheets** WCAG 2.2 template; it is not a
claim that the site has completed a formal accessibility audit.

## Typography

- One family (`Outfit`) with semantic defaults for H1, H2, H3, body, label and
  small text.
- One H1 per page. Headings communicate hierarchy, never visual styling alone.
- Body copy is at least 16px by default and retains browser text zoom.
- Content uses wrapping and responsive type scales so it remains usable at
  narrow widths and with increased text spacing.

## Buttons and controls

- `.pk-btn` is the shared CTA primitive: 48px minimum height, consistent type,
  radius, padding, states and focus treatment.
- Filled ink is the default primary action; outline is the secondary action.
  A page should normally have one primary action per decision area.
- Controls retain an obvious hover, disabled and keyboard-focus state. Focus is
  never communicated only by colour.

## WCAG checks kept in implementation review

- 1.3.1 / 1.3.2: semantic order and heading relationships.
- 1.4.3 / 1.4.11: text and non-text contrast, including button boundaries.
- 1.4.10 / 1.4.12: reflow and resilient text spacing.
- 1.4.13 / 2.1.1: hover content and menus also work with keyboard.
- 2.4.7 / 2.4.11: visible, unobscured focus treatment.
- 2.5.8: 48px minimum button target where the shared button primitive is used.
- Respect `prefers-reduced-motion`.

## Still requires human / assistive-tech QA

- Contrast verification of new photography overlays and one-off coloured tiles.
- Keyboard pass through the menu, cart, search and checkout handoff.
- Screen-reader pass for product media alt text, labels and error messages.
- A real-device test at 200% zoom and mobile landscape.
