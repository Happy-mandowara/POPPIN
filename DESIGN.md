# POPPIN Design System & Craft Specification (DESIGN.md)

> **Standard:** Anti-Slop, High-Density, Emil Kowalski Motion Physics & Impeccable UX  
> **Philosophy:** One layout idea per view. One dominant action per screen. Zero cognitive clutter. Respect the user's attention.

---

## 1. Core UX Axioms (The Emil Kowalski Rules)

1. **One Primary Action Per Screen:**  
   Every view must have a clear visual hierarchy. Exactly one action is styled with the primary accent color (`#5865F2`). Secondary actions use ghost, subtle surface borders, or subdued tones.
2. **It Must Feel Important:**  
   Key actions must possess tactile weight: deliberate padding, subtle `:active` compression (`scale(0.98)`), and instant feedback.
3. **Hide Unimportant Options (Hick’s Law & Progressive Disclosure):**  
   Never overwhelm users with secondary toggles on initial load. Hide advanced configurations behind expandable panels or overflow triggers.
4. **Don't Show Everything at Once:**  
   Partition complex multi-step workflows (like onboarding or community creation) into bite-sized, sequential steps.
5. **Back Navigation Everywhere:**  
   Every child view, modal, or drawer must feature a deterministic, predictable escape route (`Esc` key, swipe-down gesture, or explicit top-left back link).
6. **44×44px Minimum Touch Targets (Fitts’s Law & Hit Slop):**  
   Small visual icons (16–20px) must feature expanded touch/click bounds via transparent padding or pseudo-elements (`::after`).
7. **Actionable Empty States:**  
   Empty views must never display dead text. Every empty state features a descriptive explanation and a single-click primary CTA (e.g., *"No posts yet — create the first one"*).
8. **Inline Contextual Validation:**  
   Highlight form and validation errors immediately below the relevant input field—never in detached, distant alert boxes.
9. **Destructive Data Confirmation:**  
   Any irreversible action (deleting a hub, removing a member, revoking sessions) requires an explicit confirmation modal with destructive red styling (`#ED4245`).
10. **State Transparency:**  
    The interface must explicitly communicate current status at all times: loading skeletons, saving indicators, success checkmarks, or inline retry buttons.

---

## 2. Typography & Micro-Layout Rules

```
Display / Headings: Plus Jakarta Sans / Inter Display (Tight tracking: -0.02em to -0.03em)
Body / Controls:    Inter / System Stack (-0.011em tracking, 1.5 line-height)
Monospace / Counts: JetBrains Mono / Tabular Numbers (font-variant-numeric: tabular-nums)
```

| Principle | Rule & Implementation |
| :--- | :--- |
| **Kerning & Tracking** | Headings (`text-2xl`+) use `-0.025em` letter-spacing. Small labels (`text-xs`) use `+0.02em` tracking for legibility. |
| **x-Height & Readability** | Use modern human-readable typefaces with elevated x-heights so 13px–14px body text remains sharp on high-DPI displays. |
| **Tabular Numbers** | All counts, upvotes, timestamps, and pricing metrics use `font-variant-numeric: tabular-nums` to eliminate jitter. |
| **Widows & Orphans** | All headings enforce `text-wrap: balance` (or `text-wrap: pretty`) to prevent lone trailing words. |
| **Line Length (Measure)** | Body text containers are constrained to `max-w-[65ch]` (50–75 characters per line) for optimal reading rhythm. |
| **Leading (Line Height)** | Headlines use tight leading (`leading-tight` ~1.2); body text uses relaxed leading (`leading-relaxed` ~1.55). |
| **Optical Center Alignment**| Empty states and dialogs are offset 5–8% above mathematical geometric center to feel naturally centered to the human eye. |
| **Zero Layout Shift (CLS = 0)** | Reserve exact image/avatar dimensions before assets load; match skeleton loader geometry to finished DOM cards. |

---

## 3. Color, Surfaces & Spatial Hierarchy

### A. The Single Accent Principle
POPPIN adheres to **one primary accent color**:  
- **Primary Accent (`Brand Blurple`):** `#5865F2` (Interactive CTAs, active states, key focus rings)  
- **Accent Hover / Active:** `#4752C4` / `#3C45A5`  
- **Accent Soft Background:** `rgba(88, 101, 242, 0.12)`  
- **Destructive Accent (`Crimson`):** `#ED4245` (Reserved exclusively for critical deletions & bans)  
- **Success Accent (`Emerald`):** `#57F287` (Verified badges, status indicators)

### B. Elevation & Surface Tokens (Dark Canvas Hierarchy)
POPPIN avoids generic flat black or pure blinding white. It uses an engineered Discord/Linear surface depth system:

```
[Layer 0] Viewport Canvas:        #1E1F22  (Deep structural foundation)
[Layer 1] Sidebars & Chrome:      #2B2D31  (Persistent navigation surface)
[Layer 2] Cards & Chat Bubbles:   #313338  (Active interactive containers)
[Layer 3] Inputs & Hover States:  #383A40  (Tactile input elements)
[Layer 4] Overlays & Dialogs:     #2B2D31  (Floating modaled surfaces with 1px border)
```

### C. Border & Contrast Tokens
- **Borders:** `rgba(255, 255, 255, 0.08)` (Subtle separation, never harsh solid lines)
- **Primary Text:** `#F2F3F5` (High-contrast, crisp white-slate)
- **Muted Text:** `#B5BAC1` (Secondary info, timestamps, meta-tags)
- **Subtle / Placeholder:** `#949BA4` (Form hints, disabled controls)

---

## 4. Motion Physics & Animation Spec

All animations must feel grounded in real-world physics:

```css
/* POPPIN Standard Animation Curves */
--ease-out-spring: cubic-bezier(0.16, 1, 0.3, 1);     /* Snappy entrance */
--ease-in-spring:  cubic-bezier(0.7, 0, 0.84, 0);     /* Swift exit */
--ease-fluid:      cubic-bezier(0.32, 0.72, 0, 1);    /* Smooth drag & sheets */
```

- **Origin-Aware Animations:** Dialogs, menus, and popovers originate from the exact click bounding box, expanding outwards rather than spawning from screen center.
- **Interruptible Motion:** Animations never hijack user input. Tapping a backdrop or pressing `Esc` mid-transition immediately reverses motion smoothly.
- **Cascaded Staggering:** Feed lists and search items enter with sequential `35ms` delay increments:
  ```css
  animation-delay: calc(var(--index) * 35ms);
  ```
- **Squash & Stretch / Rubber Banding:** Dragged drawers and bottom sheets exhibit logarithmic boundary resistance when pulled beyond bounds.
- **Shared Element Transitions:** When a post card is clicked, the media thumbnail smoothly transitions into the full post detail view.

---

## 5. Anti-Slop (Anti-Vibecoding) Checklist

To ensure POPPIN maintains an elite, high-craft brand identity and avoids generic AI-generated frontend tells:

- [x] **No Harsh Rainbow Colors:** Zero mismatched pastel pills or random colorful badges.
- [x] **No Meaningless Radial Blobs:** No noisy blurred gradient balls floating behind headers.
- [x] **No Muddy Black Shadows:** Shadows are color-matched and ambient (`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28)`).
- [x] **No Emoji-Stuffed Copy:** Emojis are never used as formal bullet points or professional headers.
- [x] **No Fake Terminal / Bento Gimmicks:** UI components reflect real product value (real feeds, authentic chat windows, genuine hub management).
- [x] **Answer-First Voiceprint:** UI copy is direct, concise, and professional (e.g. *"Delete Hub"* instead of *"Are you really sure you want to let this magical journey end? ✨"*).
- [x] **Tabular Numeric Alignment:** Clean, un-jittered counters on comments, likes, and member rosters.
- [x] **Continuous Squircles:** Smooth corner curvature (`rounded-2xl` / `rounded-3xl`) over harsh circular clipping.

---

## 6. Component Architecture Checklist

When authoring or modifying any component in `components/`:

1. **Accessibility (`a11y`):**  
   - All interactive controls have clear `aria-label`s.
   - Modals trap focus and close on `Escape`.
   - Focus rings use `focus-visible:ring-2 focus-visible:ring-[#5865F2]`.
2. **Hit-Slop Protection:**  
   - Icon-only buttons have minimum hit areas of `44×44px`.
3. **Safe Area Insets:**  
   - Mobile drawers and bottom navigation bars respect `pb-[env(safe-area-inset-bottom)]`.
4. **Optimistic Mutation:**  
   - Likes, saves, follows, and message sends reflect immediately in local UI state, rolling back only upon verified network failure.
