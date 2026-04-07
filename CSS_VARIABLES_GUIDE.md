# CSS Variables Migration Guide - UrasaWeb Admin

## Overview
This document explains how to use the centralized CSS variable system implemented in the UrasaWeb Admin panel.

## Quick Start

### 1. Import Variables
At the top of your CSS file, add:
```css
@import '../styles/variables.css';
```

Or if already using App.css, variables are automatically available since App.css imports them.

### 2. Replace Hardcoded Colors

**Before:**
```css
.card {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

**After:**
```css
.card {
  background: var(--bg-primary);
  color: var(--text-dark-primary);
  border: 1px solid var(--border-light);
  box-shadow: 0 2px 8px var(--shadow-dark-medium);
}
```

## Color Variable Categories

### Background Colors (Light Theme)
```css
var(--bg-primary)         /* #ffffff - Main white background */
var(--bg-secondary)       /* #f8fafc - Light gray backgrounds */
var(--bg-tertiary)        /* #f1f5f9 - Slightly darker gray */
var(--bg-light-blue)      /* #f5f7ff - Light blue tint */
var(--bg-lighter-blue)    /* #f0f3ff - Lighter blue tint */
var(--bg-lightest-blue)   /* #f8f9ff - Very light blue */
var(--bg-pale-blue)       /* #e8ebff - Pale blue */
var(--bg-pale-blue-tint)  /* #dce4ff - Blue tint */
var(--bg-pale-blue-soft)  /* #eceffe - Soft blue */
```

### Background Colors (Dark Theme)
```css
var(--bg-dark-primary)      /* #0a1628 - Main dark background */
var(--bg-dark-secondary)    /* #0d1f38 - Secondary dark */
var(--bg-dark-tertiary)     /* #0f2442 - Tertiary dark */
var(--bg-dark-card)         /* rgba(13, 31, 56, 0.8) - Card backgrounds */
var(--bg-dark-overlay)      /* rgba(0, 0, 0, 0.5) - Overlays */
var(--bg-dark-glass)        /* rgba(0, 0, 0, 0.15) - Glass effects */
```

### Navy/Dark Blue Colors
```css
var(--navy-darkest)   /* #050d1a */
var(--navy-darker)    /* #0a1628 */
var(--navy-dark)      /* #0d1f38 */
var(--navy-medium)    /* #0f2442 */
var(--navy-deep)      /* #0a0233 - Sidebar/Navbar background */
```

### Primary Blue Colors
```css
var(--blue-darkest)    /* #0f1580 */
var(--blue-darker)     /* #1313a0 */
var(--blue-dark)       /* #1e40af */
var(--blue-primary)    /* #2563eb - Main blue */
var(--blue-medium)     /* #3b82f6 */
var(--blue-light)      /* #4a6af5 */
var(--blue-lighter)    /* #60a5fa */
var(--blue-accent)     /* #3d5afe */
var(--blue-vivid)      /* #304ffe */
var(--blue-deep-ocean) /* #0c2876 */
var(--blue-ocean)      /* #053b7e */
var(--blue-navy-bright)/* #1a22b0 */
var(--blue-bright)     /* #1e2ecc */
```

### Text Colors (Dark Text for Light Backgrounds)
```css
var(--text-dark-primary)    /* #0f172a - Main headings */
var(--text-dark-secondary)  /* #334155 - Secondary text */
var(--text-dark-tertiary)   /* #475569 - Tertiary text */
var(--text-dark-muted)      /* #64748b - Muted/subtitle text */
var(--text-dark-faint)      /* #94a3b8 - Faint text */
```

### Text Colors (Light Text for Dark Backgrounds)
```css
var(--text-light-primary)   /* #ffffff */
var(--text-light-secondary) /* rgba(255, 255, 255, 0.87) */
var(--text-light-tertiary)  /* rgba(255, 255, 255, 0.8) */
var(--text-light-muted)     /* rgba(255, 255, 255, 0.7) */
var(--text-light-faint)     /* rgba(255, 255, 255, 0.6) */
```

### Border Colors
```css
var(--border-light)          /* #e2e8f0 - Light borders */
var(--border-medium)         /* #cbd5e1 - Medium borders */
var(--border-dark)           /* #334155 - Dark borders */
var(--border-blue-light)     /* rgba(59, 130, 246, 0.15) */
var(--border-blue-medium)    /* rgba(59, 130, 246, 0.3) */
var(--border-blue-strong)    /* rgba(59, 130, 246, 0.5) */
var(--border-white-light)    /* rgba(255, 255, 255, 0.08) - Dark theme borders */
var(--border-white-medium)   /* rgba(255, 255, 255, 0.12) */
var(--border-white-strong)   /* rgba(255, 255, 255, 0.2) */
```

### Semantic Colors

#### Success (Green)
```css
var(--success-dark)     /* #047857 */
var(--success-primary)  /* #059669 */
var(--success-medium)   /* #089364 */
var(--success-light)    /* #0da270 */
var(--success-lighter)  /* #0d9266 */
var(--success-bright)   /* #10b981 */
```

#### Danger/Error (Red)
```css
var(--danger-darkest)   /* #d32f2f */
var(--danger-darker)    /* #dc2626 */
var(--danger-dark)      /* #d41919 */
var(--danger-primary)   /* #ef4444 */
var(--danger-light)     /* #ff5252 */
var(--danger-lighter)   /* #f44336 */
var(--danger-bright)    /* #e53935 */
var(--danger-accent)    /* #ff6b6b */
var(--danger-red-pink)  /* #e94560 */
```

#### Warning (Amber/Yellow)
```css
var(--warning-dark)     /* #d97706 */
var(--warning-primary)  /* #f59e0b */
var(--warning-light)    /* #fbbf24 */
```

#### Info (Cyan)
```css
var(--info-dark)    /* #0284c7 */
var(--info-primary) /* #06b6d4 */
var(--info-medium)  /* #0891b2 */
var(--info-light)   /* #0ea5e9 */
```

### Accent Colors

#### Purple/Violet
```css
var(--purple-dark)     /* #9333ea */
var(--purple-primary)  /* #7c3aed */
var(--purple-medium)   /* #6d28d9 */
var(--purple-light)    /* #8b5cf6 */
var(--purple-indigo)   /* #4f46e5 */
```

#### Pink
```css
var(--pink-primary)  /* #db2777 */
var(--pink-light)    /* #ec4899 */
```

#### Orange
```css
var(--orange-dark)     /* #c2410c */
var(--orange-primary)  /* #ea580c */
var(--orange-light)    /* #f97316 */
```

### Opacity Variants

#### White Opacity
```css
var(--white-opacity-5)   /* rgba(255, 255, 255, 0.05) */
var(--white-opacity-8)   /* rgba(255, 255, 255, 0.08) */
var(--white-opacity-10)  /* rgba(255, 255, 255, 0.1) */
var(--white-opacity-12)  /* rgba(255, 255, 255, 0.12) */
var(--white-opacity-15)  /* rgba(255, 255, 255, 0.15) */
var(--white-opacity-20)  /* rgba(255, 255, 255, 0.2) */
var(--white-opacity-25)  /* rgba(255, 255, 255, 0.25) */
var(--white-opacity-30)  /* rgba(255, 255, 255, 0.3) */
var(--white-opacity-50)  /* rgba(255, 255, 255, 0.5) */
var(--white-opacity-70)  /* rgba(255, 255, 255, 0.7) */
var(--white-opacity-80)  /* rgba(255, 255, 255, 0.8) */
var(--white-opacity-90)  /* rgba(255, 255, 255, 0.9) */
```

#### Blue Opacity
```css
var(--blue-opacity-10)   /* rgba(59, 130, 246, 0.1) */
var(--blue-opacity-15)   /* rgba(59, 130, 246, 0.15) */
var(--blue-opacity-20)   /* rgba(59, 130, 246, 0.2) */
var(--blue-opacity-25)   /* rgba(59, 130, 246, 0.25) */
var(--blue-opacity-30)   /* rgba(59, 130, 246, 0.3) */
var(--blue-opacity-40)   /* rgba(59, 130, 246, 0.4) */
var(--blue-opacity-50)   /* rgba(59, 130, 246, 0.5) */
var(--blue-opacity-70)   /* rgba(59, 130, 246, 0.7) */
```

#### Black Opacity
```css
var(--black-opacity-5)   /* rgba(0, 0, 0, 0.05) */
var(--black-opacity-10)  /* rgba(0, 0, 0, 0.1) */
var(--black-opacity-15)  /* rgba(0, 0, 0, 0.15) */
var(--black-opacity-20)  /* rgba(0, 0, 0, 0.2) */
var(--black-opacity-25)  /* rgba(0, 0, 0, 0.25) */
var(--black-opacity-30)  /* rgba(0, 0, 0, 0.3) */
var(--black-opacity-35)  /* rgba(0, 0, 0, 0.35) */
var(--black-opacity-40)  /* rgba(0, 0, 0, 0.4) */
var(--black-opacity-50)  /* rgba(0, 0, 0, 0.5) */
var(--black-opacity-60)  /* rgba(0, 0, 0, 0.6) */
var(--black-opacity-70)  /* rgba(0, 0, 0, 0.7) */
var(--black-opacity-80)  /* rgba(0, 0, 0, 0.8) */
```

### Shadow Colors
```css
var(--shadow-dark-light)      /* rgba(0, 0, 0, 0.04) */
var(--shadow-dark-medium)     /* rgba(0, 0, 0, 0.06) */
var(--shadow-dark-strong)     /* rgba(0, 0, 0, 0.1) */
var(--shadow-darker-heavy)    /* rgba(0, 0, 0, 0.35) */
var(--shadow-darker-extreme)  /* rgba(0, 0, 0, 0.4) */
var(--shadow-blue-light)      /* rgba(59, 130, 246, 0.1) */
var(--shadow-blue-medium)     /* rgba(59, 130, 246, 0.2) */
var(--shadow-blue-strong)     /* rgba(59, 130, 246, 0.4) */
var(--shadow-blue-glow)       /* rgba(37, 99, 235, 0.4) */
var(--shadow-red-light)       /* rgba(233, 69, 96, 0.1) */
var(--shadow-red-medium)      /* rgba(233, 69, 96, 0.3) */
var(--shadow-red-strong)      /* rgba(233, 69, 96, 0.5) */
var(--shadow-white-light)     /* rgba(255, 255, 255, 0.1) */
var(--shadow-white-medium)    /* rgba(255, 255, 255, 0.2) */
var(--shadow-white-strong)    /* rgba(255, 255, 255, 0.3) */
```

### Gradient Presets
```css
var(--gradient-navy-dark)         /* Navy gradient for backgrounds */
var(--gradient-navy-medium)       /* Lighter navy gradient */
var(--gradient-blue-primary)      /* Primary blue gradient */
var(--gradient-blue-dark)         /* Dark blue gradient for buttons */
var(--gradient-page-header)       /* Page header gradient */
var(--gradient-danger-accent)     /* Red accent gradient */
var(--gradient-text-blue)         /* Blue text gradient */
var(--gradient-text-white)        /* White text gradient */
```

### Chart Colors
```css
var(--chart-color-1)   /* #2563eb - Blue */
var(--chart-color-2)   /* #7c3aed - Purple */
var(--chart-color-3)   /* #059669 - Green */
var(--chart-color-4)   /* #d97706 - Amber */
var(--chart-color-5)   /* #dc2626 - Red */
var(--chart-color-6)   /* #0891b2 - Cyan */
var(--chart-color-7)   /* #db2777 - Pink */
var(--chart-color-8)   /* #0d9488 - Teal */
var(--chart-color-9)   /* #4f46e5 - Indigo */
var(--chart-color-10)  /* #ea580c - Orange */
var(--chart-color-11)  /* #65a30d - Lime */
var(--chart-color-12)  /* #9333ea - Purple */
var(--chart-color-13)  /* #0284c7 - Sky Blue */
```

## Common Replacement Patterns

### Pattern 1: White Background Cards
**Find:** `background: #ffffff;` or `background: #fff;`
**Replace:** `background: var(--bg-primary);`

### Pattern 2: Light Page Backgrounds
**Find:** `background: #f8fafc;` or `background: #f5f7ff;`
**Replace:** `background: var(--bg-secondary);` or `background: var(--bg-light-blue);`

### Pattern 3: Dark Text
**Find:** `color: #0f172a;` or `color: #334155;`
**Replace:** `color: var(--text-dark-primary);` or `color: var(--text-dark-secondary);`

### Pattern 4: Light Borders
**Find:** `border: 1px solid #e2e8f0;`
**Replace:** `border: 1px solid var(--border-light);`

### Pattern 5: Dark Theme Backgrounds
**Find:** `background: #0a0233;`
**Replace:** `background: var(--navy-deep);`

### Pattern 6: White Text on Dark Backgrounds
**Find:** `color: #ffffff;` or `color: #fff;`
**Replace:** `color: var(--text-light-primary);`

### Pattern 7: Hover States with White Opacity
**Find:** `background: rgba(255, 255, 255, 0.08);`
**Replace:** `background: var(--white-opacity-8);`

### Pattern 8: Blue Opacity Borders
**Find:** `border: 1px solid rgba(59, 130, 246, 0.15);`
**Replace:** `border: 1px solid var(--blue-opacity-15);`

### Pattern 9: Box Shadows
**Find:** `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);`
**Replace:** `box-shadow: 0 2px 8px var(--shadow-dark-medium);`

### Pattern 10: Gradients
**Find:** `background: linear-gradient(135deg, #0a1628 0%, #0d1f38 100%);`
**Replace:** `background: var(--gradient-navy-medium);`

## Benefits of Using CSS Variables

1. **Centralized Control**: Change a color once, update everywhere
2. **Theme Switching**: Easy to implement dark/light mode
3. **Consistency**: Ensures same colors are used throughout the app
4. **Maintainability**: Easy to understand and modify
5. **Developer Experience**: Self-documenting code with meaningful variable names
6. **Performance**: CSS variables are faster than preprocessor variables

## Migration Strategy

### Phase 1: Critical Files (DONE)
- ✅ `variables.css` - Created
- ✅ `App.css` - Updated with variable imports
- ⏳ Layout files (Sidebar, Navbar, Layout)
- ⏳ Dashboard files

### Phase 2: Auth Pages
- ⏳ Login.css
- ⏳ Register.css

### Phase 3: Product Pages
- ⏳ All product page CSS files (Booklet, Artbook, Brochure, etc.)

### Phase 4: JSX Files
- ⏳ Update inline styles in JSX files to use CSS classes with variables

## Testing After Migration

After replacing colors with variables:
1. Check all pages render correctly
2. Verify hover states work
3. Check dark/light theme consistency
4. Test responsive layouts
5. Verify chart colors
6. Check modal/dialog appearances

## Need Help?

Refer to `variables.css` for the complete list of available variables. All variables are well-commented with their hex values and use cases.
