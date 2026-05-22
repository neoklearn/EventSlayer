# Event Slayer Design System

## Theme & Color Palette

**Pure Monochrome Only**

| Token | Value | Usage |
|-------|-------|-------|
| `--black` | `#000000` | Primary backgrounds, text, buttons |
| `--white` | `#FFFFFF` | Primary backgrounds, text, buttons |
| `--zinc-900` | `#18181b` | Dark backgrounds |
| `--zinc-800` | `#27272a` | Borders (dark mode) |
| `--zinc-700` | `#3f3f46` | Muted text (dark mode) |
| `--zinc-200` | `#e4e4e7` | Borders (light mode) |
| `--zinc-100` | `#f4f4f5` | Muted backgrounds |
| `--zinc-50` | `#fafafa` | Light backgrounds |
| `--destructive` | `#71717a` | Muted gray for destructive text |

**Strict Rules:**
- No colors outside the monochrome spectrum
- No gradients
- High contrast only (black on white, white on black)

---

## Border Radius

**ZERO RADIUS - ALL CORNERS SHARP**

```css
border-radius: 0px; /* Always */
```

All elements must have perfectly sharp rectangular corners:
- Buttons: `rounded-none`
- Cards: `rounded-none`
- Inputs: `rounded-none`
- Modals: `rounded-none`
- Images: `rounded-none`

---

## Borders

**Sharp 1px Borders**

| Context | Class |
|---------|-------|
| Light mode separators | `border border-zinc-200` |
| Dark mode separators | `border border-zinc-800` |
| Input fields | `border border-zinc-300` |
| Focused state | `border-black` / `border-white` |

Borders mimic clean manga panel layouts.

---

## Typography

### Font Families

| Type | Font | Usage |
|------|------|-------|
| Sans | `Inter` or `Space Grotesk` | Headers, titles, body |
| Mono | `Geist Mono` | Technical data, dates, labels, codes |

### Scale

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Hero Title | `text-6xl` to `text-9xl` | `font-black` | Sans |
| Section Title | `text-3xl` to `text-4xl` | `font-bold` | Sans |
| Card Title | `text-xl` | `font-semibold` | Sans |
| Body | `text-base` | `font-normal` | Sans |
| Labels/Dates | `text-sm` / `text-xs` | `font-medium` | Mono |
| Technical | `text-xs` | `font-mono` | Mono |

---

## Buttons

### Primary Button (CTA)

```
Default: bg-black text-white border border-black
Hover: bg-white text-black border border-black
```

Transition: Instant color inversion on hover (`transition-colors duration-0`)

### Secondary Button

```
Default: bg-white text-black border border-black
Hover: bg-black text-white border border-black
```

### Text Link Button

```
Default: text-black underline underline-offset-4
Hover: text-zinc-600
```

---

## Interactive States

### Grayscale to Color Transition

Used for event posters:
- Default: `grayscale` filter
- Hover/Active: `grayscale-0` (full color)

```css
.poster {
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}
.poster:hover {
  filter: grayscale(0%);
}
```

---

## Layout Patterns

### Grid Pattern Background

Subtle transparent gray grid lines for hero sections:
```css
background-image: 
  linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
background-size: 40px 40px;
```

### Calendar Grid

- 7 columns (Mon-Sun)
- Sharp 1px borders between cells
- Full-bleed poster images as cell backgrounds

---

## Modal & Overlay

```
Backdrop: bg-black/50 backdrop-blur-sm
Modal: bg-white border border-zinc-200
```

---

## Spacing Scale

Use Tailwind default spacing scale:
- `p-4`, `p-6`, `p-8` for padding
- `gap-4`, `gap-6`, `gap-8` for grid/flex gaps
- `space-y-4`, `space-y-6` for vertical stacking

---

## Responsive Breakpoints

| Breakpoint | Width | Navigation |
|------------|-------|------------|
| Mobile | `< 768px` | Sidebar drawer |
| Tablet | `768px - 1024px` | Header nav |
| Desktop | `> 1024px` | Header nav |

---

## Animation

- Transitions: `transition-all duration-200`
- Color changes: Instant (`duration-0`)
- Sidebar: `translate-x` with `duration-300`
- Modal: Fade in with `animate-in fade-in`
