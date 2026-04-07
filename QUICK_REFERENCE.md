# 🎨 CSS Variables Quick Reference Card

## 📌 How to Use

1. **Import at the top of your CSS file:**
```css
@import '../../styles/variables.css';
```

2. **Replace hardcoded colors with variables:**
```css
/* Before */
background: #ffffff;
color: #0f172a;

/* After */
background: var(--bg-primary);
color: var(--text-dark-primary);
```

---

## 🔥 Most Common Variables (90% of use cases)

### **Backgrounds**
```css
var(--bg-primary)           /* #ffffff - White backgrounds */
var(--bg-secondary)         /* #f8fafc - Light gray backgrounds */
var(--bg-light-blue)        /* #f5f7ff - Light blue backgrounds */
var(--navy-deep)            /* #0a0233 - Dark sidebar/navbar */
var(--bg-dark-primary)      /* #0a1628 - Dark theme background */
```

### **Text Colors**
```css
var(--text-dark-primary)    /* #0f172a - Headings on light backgrounds */
var(--text-dark-secondary)  /* #334155 - Regular text */
var(--text-dark-muted)      /* #64748b - Subtitles, secondary info */
var(--text-light-primary)   /* #ffffff - Text on dark backgrounds */
```

### **Borders**
```css
var(--border-light)         /* #e2e8f0 - Card borders */
var(--white-opacity-8)      /* rgba(255,255,255,0.08) - Dark theme borders */
var(--blue-opacity-15)      /* rgba(59,130,246,0.15) - Blue borders */
```

### **Shadows**
```css
var(--shadow-dark-medium)   /* rgba(0,0,0,0.06) - Card shadows */
var(--shadow-dark-strong)   /* rgba(0,0,0,0.1) - Hover shadows */
var(--shadow-darker-heavy)  /* rgba(0,0,0,0.35) - Heavy shadows */
var(--shadow-blue-strong)   /* rgba(59,130,246,0.4) - Blue glow */
```

### **Semantic Colors**
```css
var(--success-bright)       /* #10b981 - Success indicators */
var(--danger-primary)       /* #ef4444 - Error/danger indicators */
var(--warning-primary)      /* #f59e0b - Warning indicators */
var(--info-primary)         /* #06b6d4 - Info indicators */
```

### **Primary Blues**
```css
var(--blue-primary)         /* #2563eb - Main blue */
var(--blue-medium)          /* #3b82f6 - Secondary blue */
var(--blue-lighter)         /* #60a5fa - Light blue */
```

---

## 🎯 Quick Find & Replace Guide

### **For Light Theme Pages:**
```
Find: #ffffff or #fff
→ Replace: var(--bg-primary) or var(--text-light-primary)

Find: #f8fafc or #f5f7ff
→ Replace: var(--bg-secondary) or var(--bg-light-blue)

Find: #0f172a
→ Replace: var(--text-dark-primary)

Find: #64748b
→ Replace: var(--text-dark-muted)

Find: #e2e8f0
→ Replace: var(--border-light)

Find: rgba(0, 0, 0, 0.06)
→ Replace: var(--shadow-dark-medium)
```

### **For Dark Theme Components:**
```
Find: #0a0233
→ Replace: var(--navy-deep)

Find: #ffffff or #fff
→ Replace: var(--text-light-primary)

Find: rgba(255, 255, 255, 0.08)
→ Replace: var(--white-opacity-8)

Find: rgba(255, 255, 255, 0.12)
→ Replace: var(--white-opacity-12)

Find: rgba(0, 0, 0, 0.35)
→ Replace: var(--shadow-darker-heavy)

Find: #2563eb or #3b82f6
→ Replace: var(--blue-primary) or var(--blue-medium)
```

---

## 📊 Opacity Variants

### **White Opacity** (for dark themes)
```css
var(--white-opacity-5)     /* Very subtle */
var(--white-opacity-8)     /* Hover states */
var(--white-opacity-10)    /* Subtle backgrounds */
var(--white-opacity-12)    /* Active states */
var(--white-opacity-15)    /* Hover backgrounds */
var(--white-opacity-20)    /* Borders */
var(--white-opacity-50)    /* Overlays */
```

### **Black Opacity** (for shadows/overlays)
```css
var(--black-opacity-5)     /* Light borders */
var(--black-opacity-10)    /* Subtle shadows */
var(--black-opacity-20)    /* Card shadows */
var(--black-opacity-35)    /* Heavy shadows */
var(--black-opacity-50)    /* Overlays */
```

### **Blue Opacity** (for accents)
```css
var(--blue-opacity-10)     /* Subtle backgrounds */
var(--blue-opacity-15)     /* Card borders */
var(--blue-opacity-20)     /* Spinner borders */
var(--blue-opacity-30)     /* Selection */
var(--blue-opacity-50)     /* Scrollbars */
```

---

## 🌈 Gradients

```css
var(--gradient-navy-dark)         /* Navy background gradient */
var(--gradient-navy-medium)       /* Lighter navy gradient */
var(--gradient-blue-primary)      /* Blue button gradient */
var(--gradient-blue-dark)         /* Dark blue gradient */
var(--gradient-page-header)       /* Page header gradient */
```

---

## 📈 Chart Colors (13 colors)

```css
var(--chart-color-1)   /* Blue    #2563eb */
var(--chart-color-2)   /* Purple  #7c3aed */
var(--chart-color-3)   /* Green   #059669 */
var(--chart-color-4)   /* Amber   #d97706 */
var(--chart-color-5)   /* Red     #dc2626 */
var(--chart-color-6)   /* Cyan    #0891b2 */
var(--chart-color-7)   /* Pink    #db2777 */
var(--chart-color-8)   /* Teal    #0d9488 */
var(--chart-color-9)   /* Indigo  #4f46e5 */
var(--chart-color-10)  /* Orange  #ea580c */
var(--chart-color-11)  /* Lime    #65a30d */
var(--chart-color-12)  /* Purple  #9333ea */
var(--chart-color-13)  /* Sky     #0284c7 */
```

---

## ✅ Migration Checklist

For each CSS file:

- [ ] Add `@import '../../styles/variables.css';` at top
- [ ] Replace background colors
- [ ] Replace text colors
- [ ] Replace border colors
- [ ] Replace shadow values
- [ ] Replace semantic colors (success, danger, etc.)
- [ ] Test in browser
- [ ] Commit changes

---

## 📁 File Locations

```
Variables file:     src/styles/variables.css
Documentation:      CSS_VARIABLES_GUIDE.md
Analysis:           COMPLETE_ANALYSIS.md
This quick ref:     QUICK_REFERENCE.md
```

---

## 💡 Pro Tip

**Keep this file open while migrating!** Print it or keep it in a split view for quick reference.

**Common workflow:**
1. Open CSS file in VS Code
2. Open this file in split view
3. Use Find & Replace (Ctrl+H)
4. Replace colors using the patterns above
5. Test in browser
6. Commit

---

**Need more details?** See `CSS_VARIABLES_GUIDE.md` for complete variable reference with all 200+ variables.
