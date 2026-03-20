# Design System Strategy: The Financial Architect

This document outlines the visual language and structural logic for a high-end personal finance experience. Moving beyond the "standard SaaS" look, this system prioritizes editorial clarity, tonal depth, and a sophisticated layering strategy that builds deep user trust through precision.

---

## 1. Overview & Creative North Star: "The Digital Curator"
The Creative North Star for this system is **The Digital Curator**. In an industry often cluttered with chaotic data, our interface acts as a calm, authoritative editor. We reject the "boxed-in" feel of traditional fintech. Instead, we use **intentional asymmetry**, wide-open breathing room, and a **High-Contrast Typography Scale** to guide the eye.

The system breaks the template look by treating the UI as a series of premium, physical layers—think of thick, matte-finished cardstock or frosted glass—rather than flat pixels on a screen.

---

## 2. Color & Surface Logic
The palette is rooted in `primary` (#003d9b) for institutional trust, but it is executed through a sophisticated tonal system that avoids harsh, vibrating contrasts.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. 
*   **Alternative:** Boundaries must be defined solely through background color shifts. Use `surface-container-low` for a section sitting on a `surface` background.
*   **The Goal:** A seamless, "infinite" feel where hierarchy is felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
*   **App Background:** `surface` (#f8f9fb).
*   **Main Content Area:** `surface-container-low` (#f3f4f6).
*   **Primary Cards/Modules:** `surface-container-lowest` (#ffffff) to provide a soft, natural lift.
*   **Interactive Overlays:** `surface-bright` with a 0.8 opacity and `backdrop-blur` (12px).

### The "Glass & Gradient" Rule
To inject "soul" into the professional aesthetic:
*   **CTAs & Heroes:** Use a subtle linear gradient transitioning from `primary` (#003d9b) to `primary_container` (#0052cc) at a 135-degree angle.
*   **Floating Navigation:** Use Glassmorphism (semi-transparent `surface` colors with backdrop-blur) for the Top Navbar to make it feel integrated into the scroll.

---

## 3. Typography
We use a dual-font strategy to balance character with readability.

*   **Display & Headlines (Manrope):** Our "Editorial Voice." `display-lg` (3.5rem) and `headline-md` (1.75rem) should be used with tight letter-spacing (-0.02em) to create an authoritative, "printed" look for financial summaries.
*   **Body & Labels (Inter):** Our "Functional Voice." `body-md` (0.875rem) is the workhorse. It provides maximum legibility for dense data tables and transaction histories.
*   **Hierarchy Tip:** Use `on-surface-variant` (#434654) for secondary metadata to create a clear visual step-down from primary titles in `on-surface` (#191c1e).

---

## 4. Elevation & Depth
We achieve hierarchy through **Tonal Layering** and **Ambient Light Simulation** rather than structural lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft "pop" without a single line of CSS border.
*   **Ambient Shadows:** For "Action Modals" or "Floating Action Buttons," use extra-diffused shadows.
    *   *Spec:* `0px 12px 32px rgba(25, 28, 30, 0.06)`. The shadow color is a tinted version of `on-surface` at 6% opacity to mimic natural light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use the `outline-variant` (#c3c6d6) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Signature Components

### Modern Sidebar
*   **Layout:** Fixed width, `surface-container-low`.
*   **Active State:** Avoid a solid background block. Use a `primary` "pill" indicator (4px wide, 24px high) on the far left, with the text color shifting to `primary`.

### Dashboard Summary Cards
*   **Style:** `surface-container-lowest` background, `xl` (1.5rem) corner radius.
*   **Data:** Headlines should use `headline-sm` in `primary`. Forbid dividers; use `spacing-6` (1.5rem) to separate the title from the trend chart.

### Financial Charts
*   **Color Palette:** Use `primary` for main data, `secondary` (#006c47) for growth, and `tertiary` (#851800) for outflows.
*   **Interaction:** Tooltips must use a glassmorphic background with `on-surface` typography.

### Data Tables
*   **Constraint:** Zero horizontal or vertical lines.
*   **Separation:** Use alternating row colors (Zebra striping) with `surface-container-lowest` and `surface-container-low`.
*   **Typography:** All monetary values must use `title-sm` (Inter, 1rem) for a bold, "numbers-first" focus.

### Action Modals
*   **Backdrop:** 20% opacity of `on-surface` with a 4px blur.
*   **Body:** `surface-container-lowest` with a `lg` (1rem) corner radius. Use `spacing-10` for internal padding to give the content "room to breathe."

---

## 6. Do’s and Don’ts

### Do
*   **DO** use whitespace as a functional tool. If two elements feel cluttered, increase the gap using the `12` (3rem) or `16` (4rem) spacing tokens.
*   **DO** use "Primary Blue" sparingly. It should be a beacon for action, not a background wash.
*   **DO** ensure all touch targets are at least 44px, even if the label is `label-sm`.

### Don’t
*   **DON'T** use 100% black (#000000). Always use `on-surface` (#191c1e) to keep the "Editorial" softness.
*   **DON'T** use default "8px" rounded corners for everything. Use the scale: `xl` (1.5rem) for large cards and `DEFAULT` (0.5rem) for small inputs.
*   **DON'T** use "Success Green" for anything other than positive financial growth or completion states.