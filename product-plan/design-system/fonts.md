# Typography Configuration

## Design Philosophy

Inspired by Anthropic/Claude's typography: a refined serif for headings that conveys authority and sophistication, paired with a clean sans-serif for body text that ensures excellent readability.

## Font Families

- **Headings:** Source Serif 4 (serif, editorial feel)
- **Body text:** Inter (clean, modern sans-serif)
- **Code/technical:** JetBrains Mono

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap" rel="stylesheet">
```

Or in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap');
```

## Tailwind Config

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    }
  }
}
```

## Font Weights Used

- **400 (Regular)** — Body text, descriptions
- **500 (Medium)** — Labels, nav items, buttons
- **600 (Semibold)** — Section headings, card titles
- **700 (Bold)** — Page titles, metrics

## Usage Examples

```html
<!-- Page title (serif) -->
<h1 class="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-100">
  Dashboard
</h1>

<!-- Section heading (serif) -->
<h2 class="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100">
  Recent Activity
</h2>

<!-- Body text (sans-serif, default) -->
<p class="text-neutral-600 dark:text-neutral-400">
  Description goes here
</p>

<!-- Label -->
<label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
  Email address
</label>

<!-- Code/DIN -->
<code class="font-mono text-sm">
  DIN 02345678
</code>
```

## When to Use Serif vs Sans

| Element | Font | Class |
|---------|------|-------|
| Page titles (h1) | Source Serif 4 | `font-serif` |
| Section headings (h2) | Source Serif 4 | `font-serif` |
| Card titles | Inter | (default) |
| Body text | Inter | (default) |
| Labels | Inter | (default) |
| Buttons | Inter | (default) |
| Navigation | Inter | (default) |
| Code/DINs | JetBrains Mono | `font-mono` |
