# FranCheese Logo Setup Guide

## Quick Setup

### Step 1: Prepare Your Logo File
1. Get your logo image (JPG, PNG, or other image format)
2. The recommended size is at least **128x128 pixels** (square works best)
3. The logo should have some padding/margin so it doesn't look cramped
4. Save it with a simple name, e.g., `logo.jpg`

### Step 2: Upload Your Logo
1. Create a folder named `assets` in your website directory:
   ```
   C:\Users\ThinkPad\Documents\FranCheeseWebsite\assets\
   ```
2. Place your logo image file in that folder:
   ```
   C:\Users\ThinkPad\Documents\FranCheeseWebsite\assets\logo.jpg
   ```

### Step 3: Update the HTML
Open `francheese.html` and find all 4 places with the `logo-icon` (search for `.logo-icon` or `logo-icon`):

**Location 1 - Main Navigation** (around line 1323):
```html
<!-- BEFORE -->
<div class="logo-icon">F</div>

<!-- AFTER - Choose one option -->
<!-- Option A: Using JPG with rounded corners -->
<div class="logo-icon"><img src="assets/logo.jpg" alt="FranCheese"></div>

<!-- Option B: Using PNG (if transparent background) -->
<div class="logo-icon"><img src="assets/logo.png" alt="FranCheese"></div>
```

**Location 2 - Login Page** (around line 1424):
```html
<!-- Do the same replacement -->
<div class="logo-icon"><img src="assets/logo.jpg" alt="FranCheese"></div>
```

**Location 3 - Signup Page** (around line 1455):
```html
<!-- Do the same replacement -->
<div class="logo-icon"><img src="assets/logo.jpg" alt="FranCheese"></div>
```

**Location 4 - Admin Sidebar** (around line 2431):
```html
<!-- BEFORE -->
<div class="logo-icon" style="width: 28px; height: 28px; font-size: 0.8rem;">F</div>

<!-- AFTER -->
<div class="logo-icon"><img src="assets/logo.jpg" alt="FranCheese" style="width: 28px; height: 28px;"></div>
```

### Step 4: Style Customization (Optional)

The logo will automatically have **rounded corners** (matching your site theme).

If you want to adjust:

**Make corners more rounded:**
Edit the CSS around line 108:
```css
border-radius: 12px;  /* Increase from var(--radius-sm) */
```

**Remove background color (for transparent logos):**
Find `.logo-icon` CSS and change:
```css
background: transparent;  /* Instead of var(--accent) */
```

**Adjust logo size:**
In the HTML, you can add inline styles:
```html
<div class="logo-icon" style="width: 40px; height: 40px;">
  <img src="assets/logo.jpg" alt="FranCheese">
</div>
```

## File Path Reference

Your final structure should look like:
```
FranCheeseWebsite/
├── src/
│   └── francheese.html
└── assets/
    └── logo.jpg  ← Your logo goes here
```

## Image Format Recommendations

| Format | Best For | Notes |
|--------|----------|-------|
| **JPG** | Photos, colored logos | Good compression, no transparency |
| **PNG** | Logos with transparency | Best for modern designs |
| **SVG** | Vector logos | Scalable, very clean |

## Troubleshooting

**Logo not showing?**
- Check the file path is correct: `assets/logo.jpg`
- Make sure the file exists in the right folder
- Try right-clicking the page → Inspect → check Network tab for 404 errors

**Logo stretched or distorted?**
- The CSS uses `object-fit: cover` which maintains aspect ratio
- Make sure your original image is square (e.g., 128x128px)

**Want different sizes for different places?**
Use inline styles:
```html
<!-- Navigation (larger) -->
<div class="logo-icon" style="width: 40px; height: 40px;">
  <img src="assets/logo.jpg">
</div>

<!-- Admin sidebar (smaller) -->
<div class="logo-icon" style="width: 24px; height: 24px;">
  <img src="assets/logo.jpg">
</div>
```

## Advanced: Using a CDN URL

If you host your logo on a CDN or external URL:
```html
<div class="logo-icon">
  <img src="https://example.com/your-logo.jpg" alt="FranCheese">
</div>
```

That's it! Your custom logo will now appear with smooth rounded corners throughout your site! 🎉
