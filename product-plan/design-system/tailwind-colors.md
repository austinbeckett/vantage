# Tailwind Color Configuration

## Design Philosophy

Inspired by Anthropic/Claude's refined aesthetic: warm, sophisticated colors that feel premium and professional. The palette uses a terracotta accent for energy, muted sage for success states, and warm ivory/charcoal neutrals for a cozy yet modern feel.

## Color Choices

- **Primary:** Terracotta Orange `#DE7356` — Used for buttons, links, active states, key accents
- **Secondary:** Muted Sage — Used for success states, positive indicators, secondary highlights
- **Neutral:** Warm Ivory/Charcoal — Used for backgrounds, text, borders, cards

## Tailwind Config

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef6f4',
          100: '#fdeae6',
          200: '#fbd5cc',
          300: '#f6b5a3',
          400: '#e8937a',
          500: '#de7356',  // Main accent
          600: '#c75a3d',
          700: '#a74830',
          800: '#8a3d2a',
          900: '#723627',
          950: '#3d1a11',
        },
        secondary: {
          50: '#f6f7f5',
          100: '#e8ebe5',
          200: '#d3daca',
          300: '#b3c0a4',
          400: '#8fa07a',
          500: '#6b8455',  // Main sage
          600: '#556b42',
          700: '#445536',
          800: '#38452d',
          900: '#2f3a27',
          950: '#171e12',
        },
        neutral: {
          50: '#fcfcf8',   // Light mode background
          100: '#f8f7f2',
          200: '#f0eee6',
          300: '#e2dfd4',
          400: '#b8b3a4',
          500: '#7a7567',
          600: '#5a554a',
          700: '#3d3a33',
          800: '#2a2722',
          900: '#1e1c18',  // Dark mode background
          950: '#121110',
        },
      }
    }
  }
}
```

## Usage Examples

### Primary (Terracotta)
```html
<!-- Primary button -->
<button class="bg-primary-500 hover:bg-primary-600 text-white">
  Click me
</button>

<!-- Primary link -->
<a class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
  Learn more
</a>

<!-- Active nav item -->
<div class="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
  Dashboard
</div>

<!-- Accent badge -->
<span class="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
  New
</span>
```

### Secondary (Sage)
```html
<!-- Success badge -->
<span class="bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400">
  Approved
</span>

<!-- Positive indicator -->
<div class="text-secondary-600 dark:text-secondary-400">
  +12% increase
</div>

<!-- Secondary button -->
<button class="bg-secondary-500 hover:bg-secondary-600 text-white">
  Confirm
</button>
```

### Neutral (Warm Ivory/Charcoal)
```html
<!-- Card background (clean, no glassmorphism) -->
<div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
  Content
</div>

<!-- Subtle card variant -->
<div class="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl">
  Content
</div>

<!-- Body text -->
<p class="text-neutral-600 dark:text-neutral-400">
  Description text
</p>

<!-- Muted text -->
<span class="text-neutral-500 dark:text-neutral-500">
  Secondary info
</span>

<!-- Page background -->
<div class="bg-neutral-50 dark:bg-neutral-900">
  Page content
</div>
```

## Card Patterns

We use clean, solid cards instead of glassmorphism for a more refined look:

```html
<!-- Standard card -->
<div class="card">
  <!-- Expands to: bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl -->
  Content
</div>

<!-- Subtle card -->
<div class="card-subtle">
  <!-- Expands to: bg-neutral-100 dark:bg-neutral-800/50 rounded-xl -->
  Content
</div>
```

## Dark Mode

All components use Tailwind's `dark:` variant for dark mode support. The app uses class-based dark mode toggling.

```html
<!-- Example with dark mode -->
<div class="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
  Adapts to light/dark mode
</div>
```

## Status Colors (Keep Standard)

For status indicators that need universal recognition, use standard Tailwind colors:

| Status | Color | Example |
|--------|-------|---------|
| Success | `secondary-*` (sage) | Approved, Active |
| Warning | `primary-*` | Pending, Review |
| Error | `red-*` | Failed, Rejected |
| Info | `blue-*` | Information, DPD |
| Purple | `purple-*` | GSUR, Special |
