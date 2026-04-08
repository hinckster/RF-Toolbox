# RF Toolbox — Design System, Safeguards & Iteration Log

**Author:** Noah Hinckster · EE Graduate Student  
**Repo:** https://github.com/hinckster/RF-Toolbox  
**Live site:** https://hinckster.github.io/RF-Toolbox/

---

## ⚠️ Safeguards — Read Before Making Any Changes

These rules are **non-negotiable**. They apply to every file, every commit, every time.

### Hard Constraints — Never Violate These

| # | Rule |
|---|------|
| 1 | Every file must be **fully self-contained** — no imports from other local files |
| 2 | Every file must **load and run with no internet connection** except `cdnjs.cloudflare.com` |
| 3 | Every file must **work as a standalone iframe** embeddable in Google Sites |
| 4 | Chart.js is **pinned to 4.4.1** — do not change this version |
| 5 | All sliders must **update in real time** — no page reload, no button press required |
| 6 | All equations must **stay visible** at all times and update when parameters change |
| 7 | The annotation box must **always show a non-empty explanation with live numbers** |
| 8 | No file should **exceed 80 KB** — lean and fast-loading |
| 9 | No `<form>` tags — use event listeners only |
| 10 | No external fonts (Google Fonts, etc.) — use system font stack only |
| 11 | No analytics, tracking scripts, or third-party telemetry of any kind |
| 12 | No `localStorage`, cookies, or any persistent user data storage |
| 13 | Never break the mobile responsive layout when editing desktop styles |

### Pre-Edit Checklist
Before touching any file, confirm each of these:
- [ ] Read this entire DESIGN.md
- [ ] `git status` — confirm you are on the correct branch with a clean working tree
- [ ] `git pull` — you are working from the latest commit
- [ ] If editing shared design system (colors, fonts, layout), all affected files must be updated in the **same commit** — no partial updates

### Pre-Commit Checklist
Before every commit, verify every item:
- [ ] Open the changed file in a **browser** (not just a text editor preview) and confirm it renders
- [ ] Test all sliders — every slider must update the chart in real time
- [ ] Confirm the equation box is visible and highlights the correct variable
- [ ] Confirm the annotation box is non-empty and shows specific current numbers
- [ ] Resize window below 768px — controls must stack above chart, nothing overlapping or clipped
- [ ] Open DevTools Network tab — confirm zero 4xx/5xx errors, no blocked external requests
- [ ] `git diff` — read the full diff before staging anything
- [ ] Commit message follows format: `"Verb noun — detail"` e.g. `"Add radar tool — batch 2"`

### Recovery Commands
```bash
# See what changed since last commit
git diff

# Undo all uncommitted changes (nuclear — discards all local edits)
git checkout .

# Roll back the last commit (keeps files, undoes the commit itself)
git reset --soft HEAD~1

# Roll back to a specific commit hash
git log --oneline          # find the target hash
git reset --hard <hash>
git push --force           # use with caution — rewrites remote history
```

---

## Design System

> **Single source of truth.** If a color, font size, or layout value is not listed here, it should not appear in any tool file. Deviations require a DESIGN.md update first, then a full-repo update second.

### Color Palette — White Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#ffffff` | Page background |
| `--bg-card` | `#f4f5f7` | Cards, panels, equation box |
| `--bg-deep` | `#eaecef` | Inputs, metric boxes, slider tracks |
| `--border` | `#d0d4da` | All borders |
| `--text-primary` | `#1a1d23` | Headings, labels |
| `--text-secondary` | `#4a5568` | Body text, annotation copy |
| `--text-muted` | `#718096` | Captions, axis ticks, legend |
| `--accent-copper` | `#b5895a` | UI chrome: breadcrumbs, eq-labels, annotation border, hover states |
| `--accent-blue` | `#2563eb` | Primary data trace, interactive accent |
| `--accent-green` | `#16a34a` | Pass / good state metric values |
| `--accent-orange` | `#d97706` | Warning / marginal state metric values |
| `--accent-red` | `#dc2626` | Fail / out-of-spec state metric values |
| `--accent-yellow` | `#e6c547` | Highlighted input variables in equation box |
| `--accent-purple` | `#7c3aed` | Secondary data trace |

**Data-vs-Chrome Rule:** `--accent-copper` applies only to non-data UI chrome (labels, borders, nav, hover states). It must **never** appear on:
- Slider `accent-color` — use `--accent-blue` (`#2563eb`) for interactive controls
- Chart line colors — use the data palette above
- Metric card value colors — use green/orange/red semantic only

### Typography

| Role | Font | Size | Weight | Color |
|---|---|---|---|---|
| Page heading | `'Segoe UI', system-ui, sans-serif` | 1.35rem | 600 | `--text-primary` |
| Subtitle / tag | same | 0.8rem | 400 | `--text-muted` |
| Body / annotation | same | 0.875rem | 400 | `--text-secondary` |
| Equations / values | `'Courier New', monospace` | 0.92rem | 400 | `--text-primary` |
| Axis ticks / legend | same as body | 11px | 400 | `--text-muted` |

Never use `px` for font sizes in headings — use `rem` so the layout scales with browser zoom.

### Layout

```
Desktop (≥ 768px):  sidebar 260px | chart 1fr
Mobile  (< 768px):  single column, controls above chart
```

- **Card border-radius:** `8px`
- **Panel padding:** `14px`
- **Gap between panels:** `16px`
- **Max content width:** `1200px`, centered
- **Page padding (mobile):** `12px` horizontal

### CSS Custom Properties Template
Every tool file must declare these at `:root`:

```css
:root {
  --bg-base:        #ffffff;
  --bg-card:        #f4f5f7;
  --bg-deep:        #eaecef;
  --border:         #d0d4da;
  --text-primary:   #1a1d23;
  --text-secondary: #4a5568;
  --text-muted:     #718096;
  --accent-copper:  #b5895a;
  --accent-blue:    #2563eb;
  --accent-green:   #16a34a;
  --accent-orange:  #d97706;
  --accent-red:     #dc2626;
  --accent-yellow:  #e6c547;
  --accent-purple:  #7c3aed;
  --radius:         8px;
  --panel-padding:  14px;
  --gap:            16px;
}
```

---

## Component Specifications

### Toolbar
Fixed top-right. Present on every tool page.

```html
<div class="toolbar" role="toolbar" aria-label="Page controls">
  <button class="tbtn" onclick="takeScreenshot('Tool Name')" aria-label="Download chart as PNG">
    📷 Screenshot
  </button>
  <button class="tbtn" onclick="toggleFullscreen()" aria-label="Toggle fullscreen">
    ⛶ Fullscreen
  </button>
  <button class="tbtn" id="copyBtn" onclick="copyLink()" aria-label="Copy page URL">
    ⎘ Copy Link
  </button>
</div>
```

```css
.toolbar {
  position: fixed;
  top: 14px;
  right: 16px;
  display: flex;
  gap: 6px;
  z-index: 100;
}
.tbtn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 5px;
  padding: 5px 10px;
  font-size: .75rem;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.tbtn:hover {
  border-color: var(--accent-copper);
  color: var(--accent-copper);
}
/* Focus ring for keyboard nav */
.tbtn:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}
```

### Equation Box

```css
.eq-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--panel-padding);
  font-family: 'Courier New', monospace;
  font-size: 0.92rem;
  line-height: 2;
}
.eq-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-copper);
  font-family: 'Segoe UI', system-ui, sans-serif;
  margin-bottom: 4px;
}
/* Input variable highlight */
.var.hi {
  background: var(--accent-yellow);
  color: var(--text-primary);
  border-radius: 3px;
  padding: 1px 4px;
}
/* Result variable highlight */
.var.res {
  background: var(--accent-green);
  color: #fff;
  border-radius: 3px;
  padding: 1px 4px;
}
```

### Sliders

```css
input[type="range"] {
  accent-color: var(--accent-blue);   /* interactive — NOT copper */
  width: 100%;
  height: 4px;
  cursor: pointer;
}
.slider-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.slider-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  min-width: 120px;
}
.slider-value {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--accent-copper);
  min-width: 60px;
  text-align: right;
  transition: all 200ms ease;
}
```

**Required ARIA on every slider:**
```html
<input type="range" 
  id="ptSlider" 
  min="-10" max="40" step="1" value="20"
  aria-label="Transmit power (dBm)"
  aria-valuemin="-10"
  aria-valuemax="40"
  aria-valuenow="20"
  oninput="update(this.value)">
```
Update `aria-valuenow` in JavaScript whenever the value changes.

### Annotation Box

```css
.annotation {
  border-left: 3px solid var(--accent-copper);
  background: var(--bg-card);
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 11px 14px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
```

**Content requirements (all three must be present):**
1. **What you're seeing** — describe the current chart state with the actual live numbers
2. **Why it matters** — one engineering insight tied to the current values
3. **What to change** — a concrete suggestion using the slider names on this page

**Bad annotation (generic — never do this):**
> "Adjust the sliders to see how the values change."

**Good annotation (specific — always do this):**
> "At Pt = 20 dBm and 2.4 GHz, received power is −67.3 dBm — 4.3 dB above the −72 dBm sensitivity threshold, giving a 4.3 dB link margin. Increase distance or reduce Pt to find the coverage edge."

### Metric Cards

```css
.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.metric-card {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
}
.metric-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.metric-value {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  margin-top: 3px;
}
/* Semantic value colors */
.metric-value.pass  { color: var(--accent-green);  }
.metric-value.warn  { color: var(--accent-orange); }
.metric-value.fail  { color: var(--accent-red);    }
```

### Chart.js Configuration
Apply to every chart. Do not deviate from these defaults:

```javascript
const CHART_DEFAULTS = {
  animation:  { duration: 0 },      // sliders require instant redraw
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid:  { color: '#e2e5ea' },
      ticks: { color: '#718096', font: { size: 11 } },
      title: { display: true, color: '#718096', font: { size: 11 } }
    },
    y: {
      grid:  { color: '#e2e5ea' },
      ticks: { color: '#718096', font: { size: 11 } },
      title: { display: true, color: '#718096', font: { size: 11 } }
    }
  },
  plugins: {
    legend: {
      labels: { color: '#718096', font: { size: 11 }, boxWidth: 14 }
    },
    tooltip: {
      backgroundColor: '#f4f5f7',
      titleColor: '#1a1d23',
      bodyColor: '#4a5568',
      borderColor: '#d0d4da',
      borderWidth: 1
    }
  }
};
```

Always include axis `title.text` with units, e.g. `"Distance (km)"`, `"Frequency (GHz)"`.

### Breadcrumb Navigation
Every tool page must include this at the top of the page body:

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="https://www.noahhinckley.com/home">noahhinckley.com</a>
  <span aria-hidden="true"> › </span>
  <a href="index.html">RF Toolbox</a>
  <span aria-hidden="true"> › </span>
  <span aria-current="page">Tool Name Here</span>
</nav>
```

```css
.breadcrumb {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.breadcrumb a {
  color: var(--accent-copper);
  text-decoration: none;
}
.breadcrumb a:hover {
  text-decoration: underline;
}
```

---

## Toolbar JavaScript
Include verbatim in every tool page `<script>` block.

### Screenshot
```javascript
function takeScreenshot(toolName) {
  const canvases = [...document.querySelectorAll('canvas')];
  const padding   = 16;
  const titleH    = 40;

  const totalW = canvases.reduce((sum, c) => sum + c.width + padding, padding);
  const maxH   = Math.max(...canvases.map(c => c.height));

  const out = document.createElement('canvas');
  out.width  = totalW;
  out.height = maxH + titleH + padding * 2;

  const ctx = out.getContext('2d');

  // Background — matches page bg-base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);

  // Top bar
  ctx.fillStyle = '#f4f5f7';
  ctx.fillRect(0, 0, out.width, titleH);

  // Title text
  ctx.fillStyle = '#1a1d23';
  ctx.font = 'bold 13px Segoe UI, system-ui, sans-serif';
  ctx.fillText(toolName + '  ·  RF Toolbox', padding, 17);

  // Subtitle / URL
  ctx.fillStyle = '#b5895a';
  ctx.font = '11px Segoe UI, system-ui, sans-serif';
  ctx.fillText('hinckster.github.io/RF-Toolbox', padding, 32);

  // Timestamp (right-aligned)
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  ctx.fillStyle = '#718096';
  ctx.font = '10px Courier New, monospace';
  const tsW = ctx.measureText(ts).width;
  ctx.fillText(ts, out.width - tsW - padding, 24);

  // Draw each canvas
  let x = padding;
  canvases.forEach(c => {
    ctx.drawImage(c, x, titleH + padding);
    x += c.width + padding;
  });

  // Download
  const a    = document.createElement('a');
  const slug = toolName.toLowerCase().replace(/\s+/g, '_');
  const fn   = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.download = `${slug}_${fn}.png`;
  a.href     = out.toDataURL('image/png');
  a.click();
}
```

### Fullscreen + Copy Link
```javascript
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen request failed:', err.message);
    });
  } else {
    document.exitFullscreen();
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copyBtn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.color       = '#16a34a';
    btn.style.borderColor = '#16a34a';
    setTimeout(() => {
      btn.textContent   = orig;
      btn.style.color       = '';
      btn.style.borderColor = '';
    }, 2000);
  }).catch(() => {
    // Fallback for browsers that block clipboard in iframes
    prompt('Copy this URL:', window.location.href);
  });
}
```

---

## Accessibility Standards

All tool pages must meet **WCAG 2.1 AA**. These are the minimum requirements:

### Contrast Ratios
| Pair | Ratio | Requirement |
|---|---|---|
| `--text-primary` on `--bg-base` | 14.5:1 | ✅ passes AAA |
| `--text-secondary` on `--bg-card` | 6.1:1 | ✅ passes AA |
| `--text-muted` on `--bg-base` | 4.7:1 | ✅ passes AA |
| `--accent-copper` on `--bg-card` | 3.2:1 | ⚠️ decorative only — never use for body text |
| `--accent-blue` on `--bg-base` | 5.9:1 | ✅ passes AA |

> **Rule:** `--accent-copper` must never carry meaningful text content. It is for borders, hover indicators, and decorative labels only.

### Required ARIA
- Every `<input type="range">` needs `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- The toolbar needs `role="toolbar"` and `aria-label`
- The breadcrumb `<nav>` needs `aria-label="Breadcrumb"` and `aria-current="page"` on the current item
- Charts must have a fallback `<p>` inside `<canvas>` describing what the chart shows:
  ```html
  <canvas id="chart" width="600" height="350">
    <p>Line chart showing received power vs. distance. Adjust sliders to update.</p>
  </canvas>
  ```

### Keyboard Navigation
- All interactive controls (sliders, toolbar buttons) must be reachable by Tab
- Focus rings must be visible — use `focus-visible` pseudo-class
- Sliders must respond to arrow keys (this is browser-native for `<input type="range">`)

---

## Performance Budget

| Metric | Target | Hard Limit |
|---|---|---|
| File size (per HTML file) | < 60 KB | 80 KB |
| Page load time (no cache) | < 1.5 s | 2 s |
| Chart initial render | < 100 ms | 200 ms |
| Slider-to-chart update | < 16 ms | 33 ms (60 fps) |
| External requests | 1 (Chart.js CDN) | 2 |

Check file size before every commit: `ls -lh *.html`

---

## Visual Self-Improvement Loop

Claude Code can screenshot every tool page and self-correct — catching layout bugs, broken charts, and mobile issues that are invisible from code alone.

### One-Time Setup
```bash
npm install
```
Installs Puppeteer (headless Chrome) as a dev dependency. The `screenshots/` folder and `node_modules/` are gitignored — never committed.

### Pass / Fail Criteria
These are the exact checks Claude Code must run on every screenshot. A file may not be committed if any item is FAIL.

| Check | PASS | FAIL |
|---|---|---|
| Page background | White (`#ffffff`) | Any other color, especially dark |
| Toolbar visible | Top-right, 3 buttons readable | Missing, clipped, or overlapping content |
| Equation box | Visible, not clipped | Hidden, partially off-screen, or empty |
| Annotation box | Non-empty, shows numbers | Empty or shows placeholder text |
| Chart axes | Labeled with units | Unlabeled, or label cut off |
| Chart lines | Visible, colored correctly | Invisible or default blue-only |
| Slider labels | All readable, values not overflowing | Any label cut off or value missing |
| Metric cards | 2-column grid, values colored | Cards missing, stacked wrong, or values uncolored |
| Mobile (375px) | Controls above chart, single column | Any horizontal overflow, overlapping elements |
| Desktop (1280px) | No horizontal scrollbar | Horizontal scrollbar present |
| Breadcrumb | Visible, copper link color | Missing or wrong color |

### Screenshot Commands

**All pages:**
```
Run `node screenshot.js` to capture all pages at 1280px and 375px.
Then look at every image in screenshots/. For each page, evaluate 
it against the Pass/Fail table in DESIGN.md. List every FAIL item 
found with the file name and the specific check that failed. Fix 
issues one file at a time. Re-screenshot after each fix to confirm 
PASS before moving on. Do not commit until all checks pass.
Commit as "Visual fixes — [list of files]" and push.
```

**Single page:**
```
Run `node screenshot.js 03` to screenshot 03_iip3_intermod.html 
at desktop (1280px) and mobile (375px). Evaluate both images 
against every row of the Pass/Fail table in DESIGN.md. List 
every FAIL. Fix all FAILs, re-screenshot to confirm all PASS, 
then commit as "Fix visual issues in 03_iip3" and push.
```

**After adding a new tool:**
```
Run `node screenshot.js 06` to screenshot the new tool at 
desktop and mobile. Compare it visually against 01_friis_transmission.html 
(the reference page). Evaluate against the Pass/Fail table in DESIGN.md. 
List every FAIL. Fix, re-screenshot, confirm PASS for all checks, 
then commit and push.
```

**Full design consistency pass:**
```
Run `node screenshot.js` to capture all pages at desktop and mobile. 
Evaluate every page against the Pass/Fail table in DESIGN.md. 
For any page with a FAIL, list the specific failing checks.
Fix all FAILs. Re-screenshot all changed pages. Confirm PASS.
Commit as "Design consistency pass — [date]" and push.
```

---

## Host Site Integration

The toolbox is embedded in **noahhinckley.com** (Google Sites portfolio).

### Copper Accent — `#b5895a`
Applied to all structural chrome that bridges the toolbox to the portfolio identity:
- Toolbar button hover state
- Breadcrumb link color
- Equation box section labels (`.eq-label`)
- Annotation box left border
- `index.html`: card hover border/glow, card number, back-link, footer links

### Dark Teal Hero — `#0d2d3a`
Used only on `index.html` hero background to match the portfolio hero section. Not used on any tool page.

### Back-Link Pattern
`index.html` has a "← Back to Portfolio" link top-left pointing to `https://www.noahhinckley.com/home`.

### Google Sites iframe Constraints
- No external CDN except `cdnjs.cloudflare.com` — Google Sites sandboxes iframes and will block other origins
- Target iframe height: **700–800 px** — design all tool pages to look correct at this height
- Do not use `window.top`, `parent`, or `postMessage` — assume the iframe is sandboxed

---

## File Index

| # | File | Topic | Governing Equation | Status |
|---|---|---|---|---|
| — | `index.html` | Landing page / portfolio grid | — | ✅ Live |
| 01 | `01_link_budget.html` | System link budget (cascaded) | Margin = Pt + Gt − FSPL + Gr − NF − SNR_min | ✅ Live |
| 02 | `02_receiver_chain.html` | Receiver dynamic range | F_sys = F₁ + (F₂−1)/G₁ + ··· · SFDR = ⅔(OIP3 − N_floor) | ✅ Live |
| 03 | `03_iip3_intermod.html` | IIP3 / two-tone intermodulation | IIP3 = √(4\|a₁\|/3\|a₃\|) · y = a₁x + a₂x² + a₃x³ | ✅ Live |
| 04 | `04_antenna_array.html` | ULA array factor / beam patterns | E_total(θ) = E_elem(θ) · Σ aₙe^(jnψ) | ✅ Live |
| 05 | `05_matching.html` | Smith chart + TL matching | Γ = (Z_L − Z₀)/(Z_L + Z₀) · Zin = Z₀·(ZL + jZ₀tanβl)/(Z₀ + jZL tanβl) | ✅ Live |
| 06 | `06_radar_range.html` | Radar range equation | R⁴ = Pt·Gt·Gr·λ²·σ / [(4π)³·L·S_min] | ✅ Live |
| 07 | `07_superheterodyne.html` | Superheterodyne receiver | f_image = f_RF + 2·f_IF · IRR = 20log(2f_IF/BW_RF) | ✅ Live |
| 08 | `08_fspl.html` | Free-space path loss / multi-band sweep | FSPL = 20log(d_km) + 20log(f_MHz) + 32.44 dB | ✅ Live |
| 09 | `09_transmission_line.html` | Transmission line reflection / VSWR | Γ(l) = Γ_L·e^(−j4πl/λ) · Zin = Z₀·(ZL + jZ₀tanβl)/(Z₀ + jZL tanβl) | ✅ Live |
| 10 | `10_phase_noise.html` | Phase noise / Leeson's equation | L(Δf) = 10·log[(2FkT/Ps)·(1+(f₀/2QL·Δf)²)·(1+fc/\|Δf\|)] | ✅ Live |
| 11 | `11_pa_efficiency.html` | Power amplifier efficiency / P1dB | η_A = Pout/(2·Psat) · η_B = (π/4)·√(Pout/Psat) | ✅ Live |
| 12 | `12_modulation_ber.html` | Modulation & BER curves | BER_BPSK = Q(√(2Eb/N0)) · C = B·log₂(1+SNR) | ✅ Live |
| 13 | `13_microstrip.html` | Microstrip / stripline impedance | Z₀ = 60/√ε_eff · ln(8H/W + W/4H) [W/H ≤ 1] | ✅ Live |
| 14 | `14_attenuator.html` | Attenuator pad calculator (π, T, L) | K = 10^(A/20) · R_sh = Z₀(K+1)/(K−1) | ✅ Live |
| 15 | `15_mixer.html` | Mixer / frequency planning / spur analysis | f_IF = \|m·f_RF − n·f_LO\| · f_image = 2·f_LO − f_RF | ✅ Live |
| 16 | `16_sparam.html` | S-parameter cascade / converter | S→ABCD: A = [(1+S11)(1−S22)+S12·S21]/2S21 · K = (1−\|S11\|²−\|S22\|²+\|Δ\|²)/(2\|S12\|\|S21\|) | ✅ Live |
| 17 | `17_filter.html` | Filter design & resonance (RLC + LC ladder) | f₀ = 1/(2π√LC) · Q = ω₀L/R · g_k = 2sin[(2k−1)π/2n] | ✅ Live |

---

## Prompt Templates for Claude Code

### Golden Rule — Always Start With
```
Read DESIGN.md fully before making any changes.
Confirm you understand the safeguards at the top.
Do not make any changes not explicitly listed below.
Then:
```

---

### Add a New Tool

```
Read DESIGN.md fully before making any changes.
Confirm you understand the safeguards. Then:

Create [FILENAME].html as a new RF Toolbox page teaching [TOPIC].

Requirements:
- Governing equation: [EQUATION]
- Sliders/inputs: [LIST PARAMS WITH RANGES AND UNITS]
- Chart: [WHAT TO PLOT — axes, units, line colors from design system]
- Metric cards: [WHICH OUTPUT QUANTITIES TO DISPLAY]
- Annotation logic: annotation text must update with live numbers and 
  cover all three points: what you're seeing, why it matters, 
  what to change. No generic placeholder text.

Follow the design system in DESIGN.md exactly:
- CSS custom properties from the `:root` template
- Equation box, slider, annotation, metric card CSS from the 
  Component Specifications section
- Toolbar (Screenshot / Fullscreen / Copy Link) from the 
  Toolbar section — update the tool name string in takeScreenshot()
- Breadcrumb navigation from the Breadcrumb section
- Chart.js CHART_DEFAULTS object applied to the chart options
- ARIA attributes on all sliders and the toolbar

After creating the file:
1. Run `node screenshot.js [NUMBER]` and evaluate both 
   screenshots against the Pass/Fail table in DESIGN.md
2. Fix any FAILs and re-screenshot to confirm PASS
3. Update index.html to mark [FILENAME] as live (change 🔲 to ✅)
4. Run through the full pre-commit checklist in DESIGN.md
5. Commit as "Add [TOPIC] tool — batch [N]" and push
```

---

### Improve a Specific Tool

```
Read DESIGN.md fully before making any changes.
Confirm you understand the safeguards. Then:

Improve [FILENAME].html with exactly these changes:
- [change 1 — specific, scoped]
- [change 2 — specific, scoped]

Do not change anything not listed above.
Do not refactor, rename, or reorganize code unless explicitly stated.

After editing:
1. Run `node screenshot.js [NUMBER]` and evaluate against 
   the Pass/Fail table in DESIGN.md
2. Fix any regressions introduced by your changes
3. Run through the full pre-commit checklist
4. Commit as "[Verb] [noun] in [FILENAME] — [detail]" and push
```

---

### Apply a Change Across All Tools

```
Read DESIGN.md fully before making any changes.
Confirm you understand the safeguards. Then:

Apply these changes to ALL tool html files (01 through 05 currently live):
- [change 1 — be very specific]
- [change 2 — be very specific]

Process files one at a time:
1. Edit the file
2. Screenshot it: `node screenshot.js [NUMBER]`
3. Evaluate against the Pass/Fail table in DESIGN.md
4. Fix any FAILs
5. Commit that single file before moving to the next

Do not batch-commit multiple files at once.
After all files are done, run `node screenshot.js` for a final 
full-suite review and confirm all checks PASS.
Final commit message: "[Description] — all tools" and push.
```

---

### Add Screenshot Toolbar to Existing Tools

```
Read DESIGN.md fully, specifically the Toolbar section under 
Component Specifications and the Toolbar JavaScript section.

Add the screenshot/fullscreen/copy-link toolbar to [FILENAME].html 
exactly as specified in DESIGN.md:
- Add the .toolbar CSS and .tbtn CSS including :focus-visible ring
- Add the toolbar HTML with correct aria attributes and the correct 
  tool name string in takeScreenshot()
- Add the takeScreenshot(), toggleFullscreen(), and copyLink() 
  JavaScript functions verbatim from DESIGN.md

Do not change any other functionality, layout, or chart code.

After editing:
1. Screenshot: `node screenshot.js [NUMBER]`
2. Evaluate toolbar row in the Pass/Fail table
3. Confirm screenshot downloads a valid PNG with white background 
   and the correct tool name in the title bar
4. Commit as "Add toolbar to [FILENAME]" and push
```

---

### Full Pre-Release QA Pass

```
Read DESIGN.md fully. Then run a full QA pass on the entire repo:

1. Run `node screenshot.js` to capture all pages at 1280px and 375px
2. Evaluate every page against every row of the Pass/Fail table 
   in DESIGN.md
3. Run `ls -lh *.html` and flag any file exceeding 80 KB
4. For every FAIL found, record: file name, check name, description
5. Fix all FAILs one file at a time, re-screenshotting after each fix
6. After all FAILs are resolved, re-run `node screenshot.js` and 
   confirm all pages PASS all checks
7. Commit as "QA pass — [date]" and push
```

---

## Iteration Log

### v1.0 — Batch 1 Launch
- Built 5 core RF tools + landing page
- White design system established
- Chart.js 4.4.1 for all plots, pure vanilla JS

### v1.1 — UX + Safeguards (Planned)
- [ ] Mobile responsive layouts (768px breakpoint) on all 5 live tools
- [ ] Toolbar: Screenshot, Fullscreen, Copy Link on all 5 live tools
- [ ] Screenshot exports use white background matching page design
- [ ] Smoother slider value transitions (200ms)
- [ ] Richer annotation text with live numbers on all tools
- [ ] Smith chart snap-to-common-values (50Ω, 75Ω, 100Ω, open, short)
- [ ] ARIA attributes on all sliders and toolbars
- [ ] Tooltip styling matches design system (not Chart.js defaults)
- [ ] Index page: bio header, last-updated timestamp, copper glow hover

### v2.0 — Batch 2 (Complete)
- [x] `06_radar_range.html` — Radar range equation
- [x] `07_superheterodyne.html` — Superheterodyne receiver
- [x] `08_fspl.html` — Free-space path loss sweep
- [x] `09_transmission_line.html` — Transmission line reflection / VSWR
- [x] `10_phase_noise.html` — Phase noise / Leeson's equation
- [x] `11_pa_efficiency.html` — PA efficiency / P1dB
- [x] `12_modulation_ber.html` — Modulation & BER curves
- [x] `13_microstrip.html` — Microstrip / stripline impedance
- [x] `14_attenuator.html` — Attenuator pad calculator
- [x] `15_mixer.html` — Mixer / frequency planning / spur analysis
- [x] `16_sparam.html` — S-parameter cascade / converter
- [x] `17_filter.html` — Filter design & resonance

### v3.0 — Batch 3 (Planned)
High-value tools still missing (sourced from external usability audit, April 2026):
- [ ] Impedance matching network designer (L, Pi, T topologies with Q selection)
- [ ] Antenna aperture / gain / Fresnel zone calculator
- [ ] PLL loop filter / phase margin / bandwidth calculator
- [ ] Unit converter hub (wavelength, noise power kTB, Kelvin↔dBm/Hz)

Consolidation candidates (lower priority):
- Friis transmission + Path loss → could fold into Link Budget as a "Basics" tab
- Radar range → could become a radar mode within Link Budget
- Phase noise: Leeson model is instructive but limited; consider expanding with varactor noise, loop filter interaction

---

## File Naming Convention

- Files are numbered `01` through `17` (current maximum)
- Numbers are **permanent** once assigned — never reused after deletion
- New tools get the next available number
- `index.html` is the only unnumbered file
- `_OLD.html` suffix marks retired versions pending deletion decision

## Tool Status Definitions

| Status | Meaning |
|--------|---------|
| **COMPLETE** | Has toolbar, equation box, live chart, annotation, presets, white theme |
| **BETA** | Functional but missing 1–2 features (e.g., no Export CSV, no presets) |
| **BROKEN** | Has bugs blocking normal use — do not link from index |
| **PLANNED** | In DESIGN.md but not yet built |

---

## Notes for Future Iterations

- Keep all files self-contained — no shared CSS/JS between pages
- Each tool must be independently embeddable as a Google Sites iframe
- Target iframe height for Google Sites: 700–800px
- Chart.js version locked to 4.4.1 — test all live files before upgrading
- Never add login, auth, or any server-side dependency
- The repo must always be in a deployable state on `main` — every commit must pass the pre-commit checklist
- When adding a new tool, clone the structure of `02_receiver_chain.html` as the reference page (updated from 01_friis — it uses the newer CSS variable naming)
- Screenshot PNG exports use the white design system colors — the background is `#ffffff`, not dark
